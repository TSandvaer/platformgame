# Architecture Overview (Frontend / Game Engine)

The game is a **hand-written HTML5 Canvas 2D engine** — no Phaser, Unity, or other framework. All game logic is plain JavaScript in `game.js` (the `PlatformRPG` class) and the `js/` directory, loaded via global `<script>` tags in `index.html`. There is no module system at runtime (see [build-and-deployment.md](build-and-deployment.md)).

## Entry point & game loop

- **`game.js`** — the `PlatformRPG` class. Constructor wires up the canvas 2D context and initializes every subsystem in order: player → platforms → props (async sprite load) → lootables → inventory → enemies → NPCs → scenes (loads from MongoDB) → input → editor → game data → ui → camera → viewport.
- **`gameLoop()`** runs on `requestAnimationFrame`: `handleInput()` → `updatePhysics()` (player, enemies/projectiles, platform movement zones, prop durability/animation, item drops, lootable pickup, HUD stats) → `updateCamera()` → `render()`.

## Render order (depth matters)

Rendering is ordered deliberately for pseudo-3D depth:

1. Clear canvas
2. Background (fills window, **not** viewport-scaled)
3. Apply viewport scale + camera transform
4. Platforms (z-ordered)
5. Background props (`isObstacle: false`)
6. NPCs
7. **Depth-sorted entities** — enemies + player sorted by Y position
8. Enemy projectiles
9. Remove camera transform → obstacle props (drawn after camera)
10. Torch/destruction particles
11. Lootables + pickup effects
12. Dropped items
13. Dev overlays (only in development mode)
14. Feedback messages
15. HUD (top-most)

> Depth is by **render order + Y-sort**, not a z-buffer. Props carry an integer `zOrder` but final draw order is hand-managed in `render()`.

## Subsystem map (`js/`)

Most subsystems follow a `Data` / `Renderer` / `Manager` / `Collisions` / `MouseHandler` / `System` split (e.g. platforms, enemies, props):

| Dir | Responsibility |
|-----|----------------|
| `js/player/` | Player entity: data, physics, animator, controller, renderer, projectiles, inventory, per-class character stats (`playerCharacters.js`). |
| `js/enemy/` | Enemy data, AI (distance/attraction-zone based — no A*), animator, collisions, renderer, projectiles, dev-mode mouse editing. |
| `js/props/` | Scene-local prop instances + rendering/collision/management. See [prop-editor-system.md](prop-editor-system.md). |
| `js/platforms/` | Platform collision layer — the physics foundation. Tileset-sprite rendering, movement zones, dev-mode drag editing. |
| `js/scenes/` | Scene lifecycle: `sceneData`, `sceneManager`, `sceneSystem`. Scenes hold platforms/enemies/props/npcs/lootables arrays + transition zones + player start. |
| `js/camera/` | Character-follow camera + `freeCameraSystem` (dev inspection, lightly used). |
| `js/viewport/` | Viewport scaling + coordinate transforms. |
| `js/input/` | Keyboard + mouse; separate dev-mode vs production-mode dispatch. |
| `js/inventory/`, `js/items/`, `js/lootables/` | Inventory/chest UI vs world-space item drops (physics) vs collectibles (coins/hearts) — three separate concerns. |
| `js/hud/` | Player status HUD (health, stamina, coins). |
| `js/ui/` | `uiEventHandler.js` orchestrates modular handlers in `js/ui/handlers/` (platform, prop, enemy, npc, scene, sprite-editor). |
| `js/gameData/` | Load/save data flow + storage abstraction (MongoDB primary, localStorage fallback). |
| `js/gameEditor/` | Development-mode management (editor UI, context menus, tools). |
| `js/services/` | `PropService.js` — client↔server bridge for global props/sprite sheets. |
| `js/sync/` | Socket.IO client (collaborative-edit notifications, mostly stubbed). |
| `js/auth/` | Firebase client auth (`firebaseConfig`, `authSystem`, `authModal`). |

## Non-obvious facts / gotchas

- **Dev vs production mode** is a hard boundary. Development mode = edit platforms/props/enemies + test; production mode = pure gameplay with limited UI. Input dispatch and rendering both branch on `isDevelopmentMode`.
- **Three coordinate spaces:** screen (canvas px) ↔ viewport (design space) ↔ world (game space). `PropData.getActualPosition()` also folds in dynamic-platform offsets. Coordinate bugs usually come from mixing these.
- **Saves are explicit, not auto.** Autosave was removed (commit 848fdd4); a save/discard modal (commit 5159d93) guards scene edits. Don't assume edits persist without an explicit save.
- **HTML editor surfaces** are separate pages/modals: `index.html` (main editor), `play.html` (production play), `gallery.html` (browse published), plus `sprite-editor.html` / `tile-selector.html` / `inventory-sprite-editor.html`. `index.html` is large (~100KB) because it contains the full editor UI scaffold + modals.
- **Socket.IO sync is built but lightly used** — save/load goes through the REST API, not real-time sync.
