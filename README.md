# BLOCKSTRIKE

A Krunker-style 3D arena FPS that runs in the browser.

Two files:

- `index.html` is the whole game, one file you can paste into any editor. It loads three.js from a CDN, so it needs internet.
- `server.js` is the optional multiplayer server. It has no dependencies, only Node 14 or newer.

## Quick start

Install [Node.js](https://nodejs.org) once, then double-click:

- **Windows:** `start.bat`
- **Mac:** `start.command` (first time: right-click, Open)
- **Linux:** `start.sh`

It starts the server and opens the game in your browser. Close the window to stop the server. `npm start` does the same without opening the browser.

A website can't start programs on your computer, so the server has to be started this way, or kept running on a machine that's always on (any host that can run `node server.js` and gives you a `wss://` address).

## Solo (bots)

Open `index.html` in a desktop browser, pick "Solo (bots)" and click Play.

## Multiplayer

```
node server.js            # or: PORT=4000 node server.js
```

Everyone opens `http://<server-ip>:3000` (the server prints its LAN address on start), picks "Multiplayer", enters a name and clicks Play.
The server field fills in automatically. Up to 16 players. Over the internet you need to forward the port or use a tunnel.
Hold Tab for the scoreboard. Esc leaves the match.

## Servers

The menu has a server list. Pick one, or add your own with a name and a `ws://` / `wss://` address. Each row shows whether the server is online, how many players are in it and your ping. Your saved servers stay in your browser.

Run as many servers as you like, each on its own port and with its own name:

```
SERVER_NAME="Alpha" PORT=3000 node server.js
SERVER_NAME="Bravo" PORT=3001 MAX_PLAYERS=8 node server.js
```

To show some servers to everyone who opens the page, list them in `servers.json` next to `index.html`:

```
[{ "name": "Alpha", "addr": "wss://alpha.example.com" }]
```

## Features

- Dust II-style map: T spawn in the south, CT spawn in the north, long A, short A, mid doors, B tunnels and two bomb-site style areas. Bots path around walls.
- Smooth aiming: raw mouse input, recoil that recovers, fixed 120 Hz movement, FOV slider and an FPS counter.
- Minimap (top left) that rotates with you. Enemies show up on it while they can see you or just fired.
- Live leaderboard under the minimap, Tab for the full scoreboard. Solo is first to 25 kills, then the match resets.
- Kill streaks, multi-kill banners, floating damage numbers, screen shake.
- Knife (key 4, or V to quick-switch): left click to slash, hit someone from behind for a backstab.
- Dash (Q), cyan jump pads, and health and ammo pickups (solo).

## Controls

WASD move, Shift sprint, Space jump (hold to bunny-hop), C/Ctrl crouch (sprint + crouch = slide),
Mouse1 shoot, Mouse2 aim, R reload, 1/2/3 or wheel switch weapon, Q dash, 4 or V knife, Tab scoreboard.
