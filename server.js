// BLOCKSTRIKE multiplayer server. No dependencies, just Node 14+.
//   node server.js            (listens on port 3000, or set PORT=1234)
// It also serves index.html from the same folder, so players can open
// http://<host>:3000 directly. The server owns health, kills and respawns.
"use strict";
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PLAYERS = 16;
const ALLOW_CHEATS = process.env.ALLOW_CHEATS === "1"; // lets clients use wallhack/aimbot; everyone is told on join
const RESPAWN_MS = 3000;
const REGEN_DELAY_MS = 5000;
const COLORS = [0xef4444, 0xf97316, 0xa855f7, 0x3b82f6, 0x14b8a6, 0xeab308, 0xec4899, 0x22c55e];
const SPAWNS = [[-50, -50], [50, 50], [-50, 50], [50, -50], [0, -45], [0, 45], [-40, 0], [40, 0],
  [-22, -45], [22, 45], [-22, 45], [22, -45], [-8, 10], [8, -10], [-35, 25], [35, -25]];

const players = new Map();
let nextId = 1;

// ------------------------------------------------------------ http + websocket plumbing
const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url.startsWith("/index.html")) {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) { res.writeHead(404); return res.end("index.html must sit next to server.js"); }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else { res.writeHead(404); res.end(); }
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) return socket.destroy();
  const accept = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
  const conn = { sock: socket, buf: Buffer.alloc(0), player: null };
  socket.on("data", chunk => { conn.buf = Buffer.concat([conn.buf, chunk]); readFrames(conn); });
  socket.on("close", () => drop(conn));
  socket.on("error", () => drop(conn));
});

function wsSend(sock, str) {
  if (sock.destroyed) return;
  const p = Buffer.from(str);
  let h;
  if (p.length < 126) h = Buffer.from([0x81, p.length]);
  else if (p.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(p.length, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(p.length), 2); }
  sock.write(Buffer.concat([h, p]));
}

function readFrames(conn) {
  let buf = conn.buf;
  while (buf.length >= 2) {
    const op = buf[0] & 15, masked = (buf[1] & 128) !== 0;
    let len = buf[1] & 127, off = 2;
    if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
    if (len > 65536) return conn.sock.destroy();
    const mlen = masked ? 4 : 0;
    if (buf.length < off + mlen + len) break;
    let payload = Buffer.from(buf.slice(off + mlen, off + mlen + len));
    if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= buf[off + (i & 3)];
    buf = buf.slice(off + mlen + len);
    if (op === 8) { conn.sock.end(); break; }
    if (op === 9) { conn.sock.write(Buffer.concat([Buffer.from([0x8a, payload.length]), payload])); continue; }
    if (op === 1) { try { onMessage(conn, JSON.parse(payload.toString())); } catch (e) { /* ignore bad json */ } }
  }
  conn.buf = buf;
}

// ------------------------------------------------------------ game logic
const send = (p, obj) => wsSend(p.conn.sock, JSON.stringify(obj));
const broadcast = (obj, except) => {
  const s = JSON.stringify(obj);
  for (const p of players.values()) if (p !== except) wsSend(p.conn.sock, s);
};
const r2 = v => Math.round(v * 100) / 100;

function pickSpawn(self) {
  const pool = SPAWNS.slice().sort(() => Math.random() - 0.5).slice(0, 6);
  let best = pool[0], bestD = -1;
  for (const s of pool) {
    let d = 1e9;
    for (const p of players.values()) if (p !== self && p.alive) d = Math.min(d, Math.hypot(p.x - s[0], p.z - s[1]));
    if (d > bestD) { bestD = d; best = s; }
  }
  return best;
}

function sendBoard() {
  const rows = [...players.values()].map(p => ({ id: p.id, name: p.name, k: p.k, d: p.d }));
  broadcast({ t: "board", rows });
}

function onMessage(conn, m) {
  let p = conn.player;
  if (m.t === "join" && !p) {
    if (players.size >= MAX_PLAYERS) { wsSend(conn.sock, JSON.stringify({ t: "full" })); return conn.sock.end(); }
    const name = String(m.name || "Player").replace(/[^\w \-.]/g, "").slice(0, 12) || "Player";
    const id = nextId++;
    const sp = pickSpawn(null);
    p = conn.player = {
      id, name, conn, color: COLORS[id % COLORS.length], x: sp[0], y: 0, z: sp[1],
      yaw: 0, pitch: 0, w: 0, cr: 0, hp: 100, alive: true, k: 0, d: 0, lastHurt: 0, respawnAt: 0, hits: 0,
    };
    send(p, {
      t: "welcome", id, name, spawn: sp, cheats: ALLOW_CHEATS,
      players: [...players.values()].map(o => ({ id: o.id, name: o.name, color: o.color, x: o.x, y: o.y, z: o.z, alive: o.alive })),
    });
    players.set(id, p);
    broadcast({ t: "join", id, name, color: p.color, x: p.x, y: 0, z: p.z, alive: true }, p);
    sendBoard();
    console.log(`+ ${name} (#${id}) joined, ${players.size} online`);
    return;
  }
  if (!p) return;

  if (m.t === "st" && p.alive) {
    if ([m.x, m.y, m.z, m.yaw, m.pitch].every(Number.isFinite)) {
      p.x = m.x; p.y = m.y; p.z = m.z; p.yaw = m.yaw; p.pitch = m.pitch;
      p.w = m.w | 0; p.cr = m.c ? 1 : 0;
    }
  } else if (m.t === "shot" && p.alive) {
    broadcast({ t: "shot", id: p.id, f: m.f, e: m.e, w: m.w }, p);
  } else if (m.t === "hit" && p.alive) {
    const target = players.get(m.id);
    const dmg = Number(m.dmg);
    if (!target || target === p || !target.alive || !(dmg > 0) || dmg > 250) return;
    if (++p.hits > 60) return; // cheap flood guard, reset every second below
    target.hp -= dmg; target.lastHurt = Date.now();
    if (target.hp > 0) return broadcast({ t: "dmg", id: target.id, hp: Math.round(target.hp), by: p.id });
    target.hp = 0; target.alive = false; target.d++; p.k++;
    target.respawnAt = Date.now() + RESPAWN_MS;
    broadcast({ t: "dmg", id: target.id, hp: 0, by: p.id });
    broadcast({ t: "kill", killer: p.id, victim: target.id, kn: p.name, vn: target.name, head: !!m.head });
    sendBoard();
  }
}

function drop(conn) {
  const p = conn.player;
  if (!p || !players.has(p.id)) return;
  players.delete(p.id);
  conn.player = null;
  broadcast({ t: "leave", id: p.id, name: p.name });
  sendBoard();
  console.log(`- ${p.name} (#${p.id}) left, ${players.size} online`);
}

// 20 Hz snapshots, respawns, health regen
let tick = 0;
setInterval(() => {
  tick++;
  const now = Date.now();
  for (const p of players.values()) {
    if (!p.alive && now >= p.respawnAt) {
      const sp = pickSpawn(p);
      p.alive = true; p.hp = 100; p.x = sp[0]; p.y = 0; p.z = sp[1]; p.lastHurt = 0;
      broadcast({ t: "spawn", id: p.id, pos: sp });
    }
    if (tick % 5 === 0 && p.alive && p.hp < 100 && now - p.lastHurt > REGEN_DELAY_MS) {
      p.hp = Math.min(100, p.hp + 3);
      send(p, { t: "dmg", id: p.id, hp: Math.round(p.hp), regen: 1 });
    }
    if (tick % 20 === 0) p.hits = 0;
  }
  if (players.size) {
    broadcast({
      t: "s",
      p: [...players.values()].map(p => [p.id, r2(p.x), r2(p.y), r2(p.z), r2(p.yaw), r2(p.pitch), p.w, p.cr, p.alive ? 1 : 0]),
    });
  }
}, 50);

server.listen(PORT, () => {
  console.log(`BLOCKSTRIKE server on port ${PORT}${ALLOW_CHEATS ? " (cheats ENABLED)" : ""}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list) if (i.family === "IPv4" && !i.internal) console.log(`  LAN:   http://${i.address}:${PORT}`);
  console.log(`  local: http://localhost:${PORT}`);
});
