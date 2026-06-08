# Prop Editor System

The prop system is the most actively-developed area (commits `1be32b8`→`139aae1`). Its defining idea: **prop definitions and sprite sheets are GLOBAL (MongoDB-backed, shared across all games); placed props are scene-local instances that reference a definition by key.**

## The two-layer model

- **Global layer (MongoDB):**
  - `SpriteSheet` (`models/SpriteSheet.js`) — registered sheet: `sheetKey`, `filePath`, dimensions, `category`.
  - `PropDefinition` (`models/PropDefinition.js`) — reusable template: `propKey`, sprite ref (`spriteSheet` + `tileX/tileY/width/height`), and behavior flags (`isObstacle`, `destroyable`, `isChest`/`chestRow`, `hasGlow`, `hasFlame`, `damagePerSecond`, `maxDurability`).
  - Served by `routes/props.js` (`/api/props/spritesheets`, `/api/props/props`, `/api/props/categories`).
- **Scene-local layer (client):** `js/props/propData.js` holds per-scene prop **instances**. An instance references a definition via its `type`/key and adds placement + runtime state:

```
{ id, type, x, y, scale, rotation, zOrder,
  isObstacle, isDamaged, durability:{current,max}, damagePerSecond,
  destroyable, isChest, dropItems:[{itemId, quantity}], animationState }
```

## Client components (`js/props/`, `js/services/`, `js/ui/handlers/`)

- **`PropService` (`js/services/PropService.js`)** — bridges client ↔ `/api/props`. Fetches/creates/updates global sprite sheets + prop definitions. Loaded **before** `propData.js` in `index.html` (script-tag order dependency).
- **`propData` / `propRenderer` / `propCollisions` / `propManager` / `propsMouseHandler` / `propSystem`** — the standard Data/Renderer/Collisions/Manager/MouseHandler/System split for placing, drawing, colliding, and dev-editing props.
- **`PropUIHandler`** (in `js/ui/handlers/`) — the prop editor modal: position/rotation, damage/durability, z-order, obstacle/destroyable flags, drop-item config, movement zones.
- **`SpriteEditorHandler`** — canvas-based sprite **selection** tool: drag-select a rectangular region on a sprite sheet, zoom, preview, register/delete global sheets, and **create a `PropDefinition` from the selection**.

## Behaviors built into props

- **Durability/damage:** props take damage (enemy/player attacks, `damagePerSecond`) and animate destruction with particles.
- **Drop items:** destroyable props (and chests) drop inventory items on destruction (`dropItems[]`), feeding the world-space item-drop system.
- **Chests:** `isChest` props open with an animation and integrate with the inventory UI.
- **Movement zones:** props can move (moving-platform-style) via bound zones.
- **Torch/flame particles:** `hasFlame`/`hasGlow` props emit particles managed per-frame by `propSystem` and passed to the renderer.

## Gotchas

- **Definition vs instance:** editing a `PropDefinition` changes the template for ALL games; editing a placed prop only changes that scene instance. Keep the distinction clear when debugging "why did my prop change everywhere?".
- **Script-tag load order:** `PropService.js` must load before `propData.js` (see `index.html` ~line 781). New prop files need a `<script>` tag added in the right order — there is no module resolution.
- **Obstacle props render after the camera transform** (render step 9 in [architecture-overview.md](architecture-overview.md)) — placement math must account for that.
