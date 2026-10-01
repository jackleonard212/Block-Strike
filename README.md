# BLOCKSTRIKE

A Krunker-style 3D arena FPS that runs in the browser.

Two files:

- `index.html` is the whole game, one file you can paste into any editor. It loads three.js from a CDN, so it needs internet.
- `server.js` is the optional multiplayer server. It has no dependencies, only Node 14 or newer.

## Solo (bots)

Open `index.html` in a desktop browser, pick "Solo (bots)" and click Play.

## Multiplayer

```
node server.js            # or: PORT=4000 node server.js
```

Everyone opens `http://<server-ip>:3000` (the server prints its LAN address on start), picks "Multiplayer", enters a name and clicks Play.
The server field fills in automatically. Up to 16 players. Over the internet you need to forward the port or use a tunnel.
Hold Tab for the scoreboard. Esc leaves the match.

## Cheats

G toggles a wallhack and H toggles an aimbot (hold fire or aim to lock on to the nearest visible enemy). They always work in solo.
In multiplayer they're off unless the server runs with `ALLOW_CHEATS=1 node server.js`. Every player is told when they join a server that allows them.

## Controls

WASD move, Shift sprint, Space jump (hold to bunny-hop), C/Ctrl crouch (sprint + crouch = slide),
Mouse1 shoot, Mouse2 aim, R reload, 1/2/3 or wheel switch weapon.
