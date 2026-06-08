# Persistence & API (Backend)

Express REST API (`server.js`) over **MongoDB Atlas** (Mongoose), with **Firebase** for auth. `server.js` serves from the repo root in development and from `dist/` in production (decided by `NODE_ENV`). Health check: `GET /api/health`.

## MongoDB collections (`models/`)

Five collections. **Games own their content; props/sprites are global; progress is per-player.**

- **`Game` (`models/Game.js`)** — the central document. Metadata (name, gameInfo, owner) + flexible `Mixed`-typed game data (`scenes[]`, `characters[]`, `classes[]`, `weapons[]`, `items[]`, `inventoryItems[]`, `gameSettings`, `playerSettings`, `propDefinitions`, `spriteSheets`) + publishing fields (`isPublished`, `slug`, `visibility`, `shareToken`, `thumbnail`, `tags`) + `ownerId` (ref User). Game data is **schema-less** (`Mixed`) — the frontend owns its structure, Mongo does not validate it. Helper methods: `toGameData()`, `getPublicGameData()`, `publish(username)`, `incrementPlayCount()`; statics `findByUsernameAndSlug()`, `findPublished()`.
- **`User` (`models/User.js`)** — `firebaseUid` (unique, links to Firebase) + `email` + `username` (unique, 3–30 chars) + profile + `role` (`user`/`admin`/`moderator`) + `stats`. Statics: `findByFirebaseUid()`, `findByUsername()`, `isUsernameAvailable()`.
- **`PlayerProgress` (`models/PlayerProgress.js`)** — per-player save slots. Keyed by compound unique `{ gameId, playerId, sessionName }`, **max 10 slots per player per game**. Stores scene id, position, health/stamina, inventory, belt items, completed scenes, playtime, deaths. Saved **server-side only** (anti-cheat).
- **`PropDefinition` (`models/PropDefinition.js`)** — **GLOBAL** reusable prop template: `propKey` (unique), `name`, sprite ref (`spriteSheet` key + `tileX/tileY/width/height`), `category`, behavior flags (`isObstacle`, `destroyable`, `isChest`, `hasGlow`/`hasFlame`, `damagePerSecond`, `maxDurability`). Shared across all games.
- **`SpriteSheet` (`models/SpriteSheet.js`)** — **GLOBAL** sprite-sheet registry: `sheetKey` (unique), `name`, `filePath`, optional dimensions, `category`. Shared across all games.

See [prop-editor-system.md](prop-editor-system.md) for how the two global models are used.

## API surface (`routes/`)

| Router | Mount | Key endpoints |
|--------|-------|---------------|
| `games.js` | `/api/games` | CRUD; `PATCH /:id` (save game data, ownership-checked); `/:id/duplicate`; `/:id/publish` + `/unpublish`; `/public/gallery`; `/play/:username/:slug` (+ `/played` play-count). |
| `users.js` | `/api/users` | `POST /register` (Firebase signup → DB), `GET/PATCH /me`, `GET /:username`, `GET /check-username/:name`. |
| `playerProgress.js` | `/api/progress` | `GET/POST/DELETE /:gameId`, `GET /:gameId/stats`. |
| `gameSessions.js` | `/api/sessions` | save-slot CRUD: `GET/POST /:gameId`, `GET/PUT/DELETE /:gameId/:sessionId`. |
| `props.js` | `/api/props` | `spritesheets` CRUD, `props` (prop-definition) CRUD, `categories`. |

## Auth flow (Firebase + MongoDB)

1. Client authenticates via Firebase client SDK (`js/auth/`), receives an ID token.
2. Client sends `Authorization: Bearer <idToken>` on API calls.
3. Server (`middleware/auth.js` + `config/firebase.js`) verifies the token with **Firebase Admin SDK** and attaches the matching MongoDB `User` to `req.user`.

Middleware: `authenticate()` (401 if missing), `optionalAuth()` (sets `req.user = null` if absent, doesn't block — used so anonymous users can still create/edit local games), `requireRole(...)`, `requireOwnership()` (403 if `ownerId` ≠ `req.user._id`).

> Firebase is used for **auth/token-verification only** — not storage. Persistence is entirely MongoDB.

## Dual storage

- **Games & player progress:** MongoDB is authoritative.
- **localStorage fallback:** `js/gameData/` caches/falls back to localStorage when the API is unavailable, then syncs back.

## Env vars (`.env`, example in `.env.example`)

`MONGODB_URI` (Atlas connection string), `NODE_ENV`, `PORT`, and the Firebase Admin trio `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`. `server.js` loads these via `require('dotenv').config()` at startup. See `MONGODB_SETUP.md` for Atlas setup.

> **`DB_NAME` is dead — the database name must live in the URI path.** `server.js` calls `mongoose.connect(MONGODB_URI)` with no options object, so `dbName` is never passed; `DB_NAME` appears only in `.do/app.yaml` and `.env.example` and is read by no app code. The database is determined **solely** by the path segment of `MONGODB_URI`. Atlas's "Connect → Drivers" dialog generates a URI with **no path segment** (`...mongodb.net/?appName=...`), which makes mongoose silently connect to the default `test` database. The correct URI embeds the name explicitly: `...mongodb.net/platformGameDB?retryWrites=true&w=majority&appName=...`. Verify after connecting: `mongoose.connection.name` should equal `platformGameDB`.

> **Production safety:** the Atlas cluster behind `MONGODB_URI` is the live prod DB. Migration scripts (`scripts/`, `migrations/`, `fixIndexes.js`) act on it directly — do not run them against prod from a Claude session.
