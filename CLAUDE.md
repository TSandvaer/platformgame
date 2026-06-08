# Platform RPG Game

A browser-based 2D platformer **RPG with a built-in level/game editor**. Users sign in, create games (scenes, platforms, props, enemies, NPCs, loot), publish them, and play them. Built on a hand-written HTML5 Canvas engine (no Phaser/Unity) with an Express + MongoDB + Firebase backend.

## Architecture (one paragraph)

The frontend is a custom 2D canvas engine: `game.js` holds the `PlatformRPG` class (init → `gameLoop()` → input/physics/camera/render), and `js/` holds per-domain subsystems (player, enemy, props, platforms, scenes, camera, inventory, ui). The game runs entirely from **global `<script>` tags** in `index.html` — it is NOT ES-module bundled (see [build-and-deployment.md](.claude/docs/build-and-deployment.md) for why webpack does not actually bundle the game). The backend (`server.js` + `routes/` + `models/`) is an Express REST API over MongoDB Atlas; Firebase provides auth (client SDK issues tokens, server's Firebase Admin verifies them). Games, users, player-progress, and **global** prop/sprite definitions are the five MongoDB collections.

## Tech stack

- **Engine:** custom HTML5 Canvas 2D — no game framework. Hand-coded physics, collision, depth-sort rendering.
- **Frontend:** vanilla JS (all game logic, in `js/` + `game.js`), loaded via `<script>` tags. TypeScript is scaffolded but **not yet used for game logic** — `src/main.ts` only imports CSS.
- **Build:** Webpack 5 + ts-loader. Entry `src/main.ts` (CSS + placeholder); game files are **copied** into `dist/`, not bundled.
- **Backend:** Node + Express, Mongoose/MongoDB Atlas, Socket.IO (collaborative-edit notifications, lightly used).
- **Auth:** Firebase (client) + Firebase Admin SDK (server token verification).
- **Deploy:** DigitalOcean App Platform (auto-deploy on push) and/or PM2 (`ecosystem.config.js`).

## Hard rules

1. **Production data is protected.** Do NOT run scripts/commands that mutate the live MongoDB Atlas production database or trigger a production DigitalOcean deploy. Migrations (`scripts/`, `migrations/`, `fixIndexes.js`) run against the prod cluster — never execute them against prod from this session. If a prod mutation is genuinely needed, the user performs it themselves outside this session.
2. **The game is not module-bundled.** New game code goes in `js/<domain>/` as plain JS and must be added as a `<script>` tag in `index.html` (order matters — dependencies load first). Do not assume `import`/`export` works in game files until the TS migration actually lands.
3. **Props/sprites are global; instances are scene-local.** A `PropDefinition`/`SpriteSheet` is shared across ALL games (MongoDB). A placed prop is a scene-local instance referencing the definition by key. Don't conflate them.
4. **Saves are explicit.** Autosave was removed — scene data persists only on explicit save (a save/discard modal guards unsaved edits).

## Detailed Documentation

Reference docs live in `.claude/docs/` and are auto-preloaded into context at session start (via the SessionStart hook). They are also auto-maintained: the `maintain-docs` skill runs after each substantive turn and updates them.

- [architecture-overview.md](.claude/docs/architecture-overview.md) — canvas engine, game loop, render order, coordinate systems, dev/prod mode, subsystem map.
- [persistence-and-api.md](.claude/docs/persistence-and-api.md) — MongoDB schemas (Game/User/PlayerProgress/PropDefinition/SpriteSheet), REST API surface, Firebase auth flow, dual storage.
- [prop-editor-system.md](.claude/docs/prop-editor-system.md) — the global sprite-sheet + prop-definition system, PropService, SpriteEditorHandler, recent prop work.
- [build-and-deployment.md](.claude/docs/build-and-deployment.md) — why webpack copies (not bundles) the game, dev-server proxy, env vars, DigitalOcean + PM2 deploy paths.

## Key references outside `.claude/docs/`

These root-level markdown files predate `.claude/docs/` and hold the original long-form setup writeups (the docs above consolidate the non-obvious parts):

- `DEPLOYMENT.md`, `PRODUCTION_DEPLOYMENT.md`, `DEPLOYMENT_SETUP_SUMMARY.md` — full DigitalOcean / PM2 / webpack deploy guides.
- `MONGODB_SETUP.md` — Atlas setup + connection string.
- `WEBPACK_TYPESCRIPT_GUIDE.md`, `WEBPACK_QUICK_START.md` — TS/webpack migration notes.
- `USER_FLOW_GUIDE.md`, `QUICK_TEST_GUIDE.md`, `SETUP_GUIDE.md` — auth flow, manual QA steps, local setup.
- `readme.md` — project overview.
