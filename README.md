# BLOCKSTRIKE

A Krunker-style 3D arena FPS that runs in the browser.

Two files:

- `index.html` is the whole game, one file you can paste into any editor. It loads three.js from a CDN, so it needs internet.
- `server.js` is the optional multiplayer server. It has no dependencies, only Node 14 or newer.

## Frontlines (world conquest)

`frontlines.html` is a second, separate game: a real-time strategy game in the style of OpenFront.io. Open it in any desktop or mobile browser. It needs no internet and no install. With the server running, it is at `http://<server-ip>:3000/frontlines.html`.

- Pick a starting spot, then expand into the wilderness and fight up to 60 AI nations on a randomly generated world (continents, islands or Pangaea).
- **Left click** land to attack it with your *Attack size* share of troops. If you can't reach it by land, a boat sails there.
- **Right click** (long-press on touch) opens the action menu: build, send boats, request or break alliances, launch nukes.
- **Buildings** (keys 1–8): City, Port (trade ships earn gold), Defense Post, Missile Silo, SAM Launcher, Warship, Atom Bomb, Hydrogen Bomb.
- The troops/workers slider trades fighting strength for gold income. Hold 80% of the land to win.

## Play with friends (nothing to install)

1. Open the game, set **Mode** to **Multiplayer** and click **HOST A ROOM**. You get a 5-letter code.
2. Send the code (or **COPY LINK**) to your friends. They open the game, type the code and press **PLAY ONLINE**.
3. Press **PLAY ONLINE** yourself to jump in. Keep your tab open, because your browser is the server.

Everything runs in the browsers, peer to peer, through the free public PeerJS service, so it needs an internet connection. Up to 16 players. If a friend can't connect, a strict network or VPN is the usual cause.

## Dedicated server (optional)

For a server that stays up without a host player, run `server.js` on any machine with [Node.js](https://nodejs.org):

- **Windows:** double-click `start.bat`
- **Mac:** `start.command` (first time: right-click, Open)
- **Linux:** `start.sh`

It starts the server and opens the game in your browser. `npm start` does the same without opening the browser. Add the address under **ADVANCED · DEDICATED SERVERS** in the menu.

## Solo (bots)

Open `index.html` in a desktop browser, pick "Solo (bots)" and click Play.

## Multiplayer with Node

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

## Gunplay (CS2 style)

- **Stand still to hit.** Your bullets land inside a cone shown by the crosshair. It is tightest when standing, tighter still crouched, wider when you walk (Shift) or run, and widest in the air. Stopping dead before you shoot is the whole game. Each bullet in a spray also adds a little inaccuracy.
- **Spray patterns.** Every automatic weapon kicks along a fixed pattern. The assault rifle climbs straight up for about ten bullets, then swings left, right, left and right. Pull your mouse down against it to keep bullets on target. The pattern resets about two seconds after you stop shooting.
- **No aiming down sights.** Right click only scopes the sniper and marksman (two zoom levels, then off). Scoped is accurate when still, unscoped or moving is wildly inaccurate. Sights from the armory are cosmetic.
- **Damage.** Headshots do 4x, legs 0.75x, and damage drops with distance. The rifle kills with one headshot or four body shots. Shift walks quietly, there is no sprint, slide or dash, and heavier guns slow you down. Reloads take CS-length time.

## Bomb defusal (5v5)

Pick **Bomb defusal · 5v5** under Solo, choose your side, and play. You and 4 bots face 5 bots, with two bomb sites on the map, **A** (east) and **B** (west).

- **Terrorists (T)** carry the bomb. Walk into the yellow ring at A or B and hold **E** to plant it. The bomb blows up 35 seconds later.
- **Counter-terrorists (CT)** stop them. Eliminate the T team, or hold **E** next to the planted bomb to defuse it.
- A round ends when a team is wiped out, the bomb explodes or is defused, or time runs out with no bomb planted (CT wins). First team to 5 rounds wins the match.
- Dead players wait for the next round and watch a teammate. No friendly fire. The minimap shows the sites, the bomb and your teammates.
- Coins: round win +25, match win +100, on top of kill coins.

This mode is solo against bots. Online rooms are still free for all.

## Armory and coins

Every kill earns coins (+10, +5 more for a headshot or backstab, +10 for a kill streak, +50 for winning a solo match). Spend them in the **Armory** tab on new weapons and sights:

- **Primary:** assault rifle, SMG, LMG
- **Secondary:** shotgun, pistol, revolver, auto shotgun
- **Sniper slot:** bolt-action sniper, semi-auto marksman
- **Sights:** iron, a reflex red dot, a holographic sight (ring and ticks) and a 4x scope for rifles, SMGs, LMGs and pistols

Your coins and loadout are saved in your browser. Other players see the weapon you have out. Coins are stored on your own computer, so they only count for you.

## Features

- A big Dust-style map: T spawn in the south, CT spawn in the north, long A, short A, mid doors, B tunnels and two bomb sites in the middle, with a ring street around it. Out there are real buildings you can walk into: a two-floor palace and apartments, a market and garage, big CT and T bases, corner shacks and ruins. They have doors, windows, stairs and roofs. Bots path through the doors.
- Smooth aiming: raw mouse input, recoil that recovers, fixed 120 Hz movement, FOV slider and an FPS counter.
- Minimap (top left) that rotates with you. Enemies show up on it while they can see you or just fired.
- Live leaderboard under the minimap, Tab for the full scoreboard. Solo is first to 25 kills, then the match resets.
- Kill streaks, multi-kill banners, floating damage numbers, screen shake.
- Knife (key 4, or V to quick-switch): left click to slash, hit someone from behind for a backstab.
- Cyan jump pads, and health and ammo pickups (solo).

## Controls

WASD move, Shift walk, Space jump, C/Ctrl crouch,
Mouse1 shoot, Mouse2 scope (sniper and marksman), R reload, 1/2/3 or wheel switch weapon, 4 or V knife, Tab scoreboard, E plant or defuse.

## Fullscreen and browser shortcuts

Click **FULLSCREEN** in the menu (or leave "Go fullscreen when I press Play" on in Settings). In fullscreen, Chrome/Edge lock W/A/S/D, Shift, Ctrl etc. so browser shortcuts can't close the tab. Firefox/Safari don't support Keyboard Lock; they show a confirmation before closing while you're playing. Esc always releases the mouse.
