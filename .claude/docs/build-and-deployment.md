# Build & Deployment

## The big gotcha: webpack does NOT bundle the game

The webpack entry is `src/main.ts`, but **`main.ts` only imports CSS and logs a startup message** — it imports zero game code. All game logic still runs from ~90 global `<script>` tags in `index.html`. The webpack build (`webpack.config.js`) therefore:

- Bundles the **CSS** (via `style-loader`/`css-loader`) into `bundle.[contenthash].js`.
- **Copies** `js/`, `game.js`, the editor HTML files, `sprites/`, `backgrounds/`, `GUI/`, and textures into `dist/` verbatim (`CopyWebpackPlugin`).
- Injects the bundle into `index.html` (`HtmlWebpackPlugin`).

So `dist/` runs the same global-script architecture as the source tree, just with hashed CSS. **Do not assume `import`/`export` works in game files.** TypeScript/ES-module conversion is scaffolded (`tsconfig.json` includes `js/` + `game.js` with `allowJs`, `checkJs: false`, `strict: false`; aliases `@`→`src`, `@js`→`js`) but not yet done. Converting a file to a real module means also adding its import to `main.ts` and removing its `<script>` tag.

`ts-loader` is wired to process `.js` too, but with type-checking effectively off — it's a migration on-ramp, not active type safety.

## Dev workflow

Two processes:

- **Express API** on `:3000` — `npm start` (or `npm run dev` for nodemon).
- **webpack-dev-server** on `:8080` — `npm run serve:webpack`. It serves `dist/` + `js/`, has hot reload, and **proxies `/api` and `/socket.io` to `localhost:3000`** (`devServer.proxy` in `webpack.config.js`). So run the Express server alongside it.

`npm run serve` does `build:dev` then `npm start` (single-server flow, no dev-server/proxy).

| Command | Effect |
|---------|--------|
| `npm start` / `npm run dev` | Express server (`server.js`) on `:3000`. |
| `npm run build` / `build:dev` / `build:watch` | Webpack production / development / watch build into `dist/`. |
| `npm run serve:webpack` | webpack-dev-server `:8080` with `/api` proxy to `:3000`. |
| `npm run type-check` | `tsc --noEmit`. |
| `npm run migrate` / `cleanup` | MongoDB migration scripts — **act on the configured (prod) Atlas DB; do not run against prod from a Claude session.** |

## Deployment targets

- **DigitalOcean App Platform** (`.do/app.yaml`) — primary. Auto-deploys on push to the configured branch; build `npm install`, run `npm start`, health check `GET /api/health`. Env vars (Mongo + Firebase secrets) set in the DO dashboard.
- **PM2** (`ecosystem.config.js`) — alternative droplet deploy: `pm2 start ecosystem.config.js --env production` (fork mode, auto-restart, 1GB max memory). Production env serves from `dist/`, so `npm run build` first.

Long-form guides live at the repo root: `DEPLOYMENT.md`, `PRODUCTION_DEPLOYMENT.md`, `DEPLOYMENT_SETUP_SUMMARY.md`, `MONGODB_SETUP.md`.

> **Production protection:** pushing to the auto-deploy branch ships to prod, and the migration scripts mutate the live Atlas DB. Treat both as production mutations — do not perform them from a Claude session; surface them for the user to run.
