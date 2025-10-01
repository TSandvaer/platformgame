# System Architecture

## Overview

The Platform RPG Game uses a modular, component-based architecture built on vanilla JavaScript. The system is designed for maintainability, extensibility, and real-time editing capabilities.

## Core Architecture Principles

### 1. Separation of Concerns
Each system is responsible for a single domain:
- **Data Layer**: Manages state and data structures
- **Logic Layer**: Handles game mechanics and rules
- **Rendering Layer**: Manages visual output
- **Input Layer**: Processes user interactions

### 2. Event-Driven Design
Systems communicate through:
- Direct method calls for synchronous operations
- Event listeners for UI interactions
- State changes for reactive updates
- Callbacks for asynchronous operations

### 3. Component System
Game entities are composed of components:
```javascript
// Example: Platform entity
platform = {
    // Core components
    id: 1,
    x: 100,
    y: 200,
    width: 150,
    height: 20,

    // Behavior components
    isMoving: false,
    damagePerSecond: 0,
    blockPlayer: false,

    // Render component
    spriteType: 'grass',
    rotation: 0
}
```

## System Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Game.js                       │
│              (Main Game Loop)                   │
└─────────────┬───────────────────────────────────┘
              │
              ├──► Input System
              │    ├── InputKeyboard
              │    ├── InputMouse
              │    └── InputSystem
              │
              ├──► Core Systems
              │    ├── PlayerSystem
              │    │   ├── PlayerData
              │    │   ├── PlayerPhysics
              │    │   ├── PlayerController
              │    │   ├── PlayerCombat
              │    │   └── PlayerRenderer
              │    │
              │    ├── PlatformSystem
              │    │   ├── PlatformData
              │    │   ├── PlatformCollisions
              │    │   ├── PlatformManager
              │    │   └── PlatformRenderer
              │    │
              │    ├── PropSystem
              │    │   ├── PropData
              │    │   ├── PropManager
              │    │   └── PropRenderer
              │    │
              │    ├── EnemySystem
              │    │   ├── EnemyData
              │    │   ├── EnemyAI
              │    │   ├── EnemyManager
              │    │   └── EnemyRenderer
              │    │
              │    └── LootableSystem
              │        ├── LootableData
              │        ├── LootableManager
              │        └── LootableRenderer
              │
              ├──► Scene Management
              │    ├── SceneSystem
              │    ├── SceneData
              │    └── SceneManager
              │
              ├──► Rendering
              │    ├── CameraSystem
              │    ├── BackgroundSystem
              │    ├── ParticleSystem
              │    └── Canvas Renderer
              │
              └──► UI Systems
                   ├── UIEventHandler
                   ├── HUDSystem
                   ├── InventoryUI
                   └── Modal System
```

## Core Components

### Game Loop (game.js)
The main game loop coordinates all systems:

```javascript
class Game {
    constructor() {
        this.initializeSystems();
        this.setupEventListeners();
        this.startGameLoop();
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;

        // Update phase
        this.update(deltaTime);

        // Render phase
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Update all systems in order
        this.inputSystem.update();
        this.playerSystem.update(deltaTime);
        this.enemySystem.update(deltaTime);
        this.platformSystem.updateMovement(deltaTime);
        this.particleSystem.update(deltaTime);
        this.cameraSystem.update();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render in layer order
        this.backgroundSystem.render();
        this.platformSystem.render();
        this.propSystem.render();
        this.enemySystem.render();
        this.lootableSystem.render();
        this.playerSystem.render();
        this.particleSystem.render();
        this.hudSystem.render();
    }
}
```

### System Pattern
Each major system follows this pattern:

```javascript
class SystemName {
    constructor() {
        this.data = new SystemData();
        this.manager = new SystemManager(this.data);
        this.renderer = new SystemRenderer();
    }

    update(deltaTime) {
        this.manager.update(deltaTime);
    }

    render(ctx, camera) {
        this.renderer.render(ctx, camera, this.data);
    }
}
```

## Data Management

### Local Storage Schema
```javascript
{
    "platformRPG_gameData": {
        "currentSceneId": "scene_001",
        "scenes": {
            "scene_001": {
                "id": "scene_001",
                "name": "Forest Village",
                "platforms": [...],
                "props": [...],
                "enemies": [...],
                "lootables": [...],
                "transitions": [...],
                "settings": {...}
            }
        },
        "playerData": {
            "health": 100,
            "maxHealth": 100,
            "inventory": [...],
            "stats": {...}
        },
        "gameSettings": {
            "musicVolume": 0.5,
            "sfxVolume": 0.7,
            "difficulty": "normal"
        }
    }
}
```

### State Management
- **Immutable Updates**: Data changes create new objects
- **Centralized State**: Single source of truth per system
- **Reactive Updates**: UI updates on state changes
- **Persistence**: Automatic saving to localStorage

## Rendering Pipeline

### Layer Order (Back to Front)
1. **Background**: Parallax backgrounds
2. **Platforms**: Static and moving platforms
3. **Props**: Decorative and interactive objects
4. **Enemies**: AI-controlled entities
5. **Lootables**: Collectible items
6. **Player**: Player character and effects
7. **Particles**: Visual effects
8. **UI/HUD**: Interface elements

### Optimization Techniques
- **Viewport Culling**: Only render visible objects
- **Sprite Batching**: Group similar sprites
- **Canvas Layers**: Separate static/dynamic content
- **Dirty Rectangle**: Update only changed regions
- **Object Pooling**: Reuse particle and effect objects

## Collision System

### Collision Detection
```javascript
// AABB (Axis-Aligned Bounding Box) collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
```

### Collision Resolution
- **Player-Platform**: Solid ground, one-way platforms
- **Player-Enemy**: Damage and knockback
- **Player-Props**: Interaction or blocking
- **Player-Lootables**: Collection
- **Platform-Props**: Binding and movement

## Input Handling

### Input Flow
```
User Input → Event Listener → Input System → Game Systems → State Change → UI Update
```

### Input Modes
1. **Production Mode**: Game controls only
2. **Development Mode**: Editor controls + game controls
3. **Modal Mode**: UI-specific controls

## Performance Considerations

### Memory Management
- **Lazy Loading**: Load assets on demand
- **Resource Pooling**: Reuse objects
- **Garbage Collection**: Minimize allocations
- **Sprite Atlases**: Reduce texture switches

### Frame Rate Optimization
- **Fixed Time Step**: Consistent physics
- **Variable Rendering**: Adaptive quality
- **RequestAnimationFrame**: Browser-optimized timing
- **Delta Time**: Frame-independent movement

## Extension Points

### Adding New Systems
1. Create system classes (Data, Manager, Renderer)
2. Register in Game.js initialization
3. Add to update/render loops
4. Connect to input handlers
5. Add UI controls if needed

### Adding New Entity Types
1. Define data structure
2. Create manager for logic
3. Implement renderer
4. Add collision handling
5. Create editor interface

## Security Considerations

- **Input Validation**: Sanitize all user inputs
- **Storage Limits**: Check localStorage quotas
- **Resource Limits**: Cap entity counts
- **Error Handling**: Graceful degradation
- **XSS Prevention**: No eval() or innerHTML with user data

---

Next: [Technology Stack](./03-technology-stack.md) →