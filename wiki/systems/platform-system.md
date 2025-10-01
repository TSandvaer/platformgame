# Platform System Documentation

## System Overview

The Platform System manages all platform-related functionality including static and dynamic platforms, collision detection, movement patterns, and visual rendering.

## Architecture

```
PlatformSystem
├── PlatformData (platformData.js)
│   ├── platforms array
│   ├── selection state
│   └── placement mode
├── PlatformManager (platformManager.js)
│   ├── Mouse handling
│   ├── Property updates
│   └── Movement zones
├── PlatformCollisions (platformCollisions.js)
│   ├── Player collision
│   ├── Collision resolution
│   └── Blocking behavior
└── PlatformRenderer (platformRenderer.js)
    ├── Sprite rendering
    ├── Movement zone visualization
    └── Selection highlights
```

## Data Structure

### Platform Entity
```javascript
{
    id: 1,
    x: 100,
    y: 200,
    width: 150,
    height: 20,
    color: '#4ECDC4',
    spriteType: 'grass',
    positioning: 'absolute',

    // Damage properties
    damagePerSecond: 0,
    killEffect: 'normal', // 'normal' or 'sink'
    blockPlayer: false,

    // Movement properties
    isMoving: false,
    moveSpeed: 2,
    movementZone: {
        enabled: false,
        startX: 50,
        startY: 200,
        endX: 250,
        endY: 200,
        angle: 0
    },
    velocityX: 0,
    velocityY: 0,
    movementProgress: 0,
    movingDirection: 1,
    isMovementPaused: false,
    originalPosition: { x: 100, y: 200 },

    // Easing properties
    useEasing: false,
    easingDistance: 0.2,
    easingMinSpeed: 0.2,
    endDelay: 0,
    delayTimer: 0,
    isDelaying: false,

    // Spinning properties
    rotation: 0,
    isSpinning: false,
    spinSpeed: 1.0,
    spinClockwise: true
}
```

## Core Components

### PlatformData (platformData.js)

Manages platform data and state:

```javascript
class PlatformData {
    constructor() {
        this.platforms = [];
        this.nextPlatformId = 0;
        this.selectedPlatform = null;
        this.platformPlacementMode = false;
    }

    addPlatform(x, y) {
        const newPlatform = {
            id: this.nextPlatformId++,
            x: x,
            y: y,
            // ... default properties
        };
        this.platforms.push(newPlatform);
        return newPlatform;
    }

    deletePlatform(platformId) {
        this.platforms = this.platforms.filter(p => p.id !== platformId);
    }
}
```

### PlatformManager (platformManager.js)

Handles user interaction and platform management:

```javascript
class PlatformManager {
    handleMouseDown(mouseX, mouseY, camera, viewport) {
        // Check for movement zone handles
        // Check for platform selection
        // Check for resize handles
        // Start dragging if applicable
    }

    handleMouseMove(mouseX, mouseY, viewport, shiftKey) {
        // Update movement zone drawing
        // Handle platform dragging
        // Handle resize operations
        // Apply shift-key snapping
    }

    updatePlatformProperties() {
        // Sync UI with selected platform
        // Update property inputs
        // Show/hide relevant controls
    }
}
```

### PlatformCollisions (platformCollisions.js)

Manages collision detection and resolution:

```javascript
class PlatformCollisions {
    checkPlayerPlatformCollisions(player, platforms) {
        platforms.forEach(platform => {
            if (this.checkCollision(player, platform)) {
                if (platform.blockPlayer) {
                    this.resolveBlockingCollision(player, platform);
                } else {
                    // Standard top-only collision
                }
            }
        });
    }

    resolveBlockingCollision(player, platform) {
        // Calculate overlaps
        // Determine smallest overlap
        // Push player away from that side
        // Stop platform if moving
    }
}
```

## Movement System

### Movement Calculation

The movement system updates platform positions along defined paths:

```javascript
updateMovement(deltaTime) {
    platforms.forEach(platform => {
        if (platform.isMoving && !platform.isMovementPaused) {
            // Calculate movement along line
            const progressDelta = movement / lineLength;
            platform.movementProgress += progressDelta * platform.movingDirection;

            // Reverse at boundaries
            if (platform.movementProgress >= 1 || platform.movementProgress <= 0) {
                platform.movingDirection *= -1;
            }

            // Update position
            platform.x = startX + (endX - startX) * platform.movementProgress;
            platform.y = startY + (endY - startY) * platform.movementProgress;
        }
    });
}
```

### Movement Zones

Movement zones define the path platforms follow:

1. **Drawing**: Click and drag to create path
2. **Editing**: Drag handles to adjust
3. **Snapping**: Hold Shift for H/V alignment

### Easing System

Smooth acceleration/deceleration near path ends:

```javascript
if (platform.useEasing) {
    const distanceFromEnd = 1 - platform.movementProgress;
    if (distanceFromEnd < platform.easingDistance) {
        const easingMultiplier = distanceFromEnd / platform.easingDistance;
        movement *= Math.max(easingMultiplier, platform.easingMinSpeed);
    }
}
```

## Collision System

### Collision Types

1. **Standard Platforms**
   - Only solid from top
   - Player can jump through
   - Land on top

2. **Blocking Platforms**
   - Solid from all sides
   - Stop movement on collision
   - Apply damage if configured

### Damage Application

Platforms can damage the player:

```javascript
if (platform.damagePerSecond > 0) {
    player.addDamagingPlatform(platform);
    // Damage applied per frame based on DPS
}
```

### Kill Effects

1. **Normal**: Player dies on platform surface
2. **Sink**: Player gradually sinks into platform

## Rendering System

### Sprite Types

Platforms can use different visual styles:

- **color**: Solid color fill
- **grass**: Green grass texture
- **stone**: Gray stone texture
- **wood**: Brown wood texture
- **ice**: Blue ice texture
- **metal**: Silver metal texture

### Render Order

1. Platform sprite/color
2. Movement zone (if in editor)
3. Selection outline (if selected)
4. Rotation (if spinning)

### Visual Indicators

```javascript
renderPlatform(ctx, platform, camera) {
    // Save context state
    ctx.save();

    // Apply rotation if spinning
    if (platform.isSpinning) {
        ctx.translate(centerX, centerY);
        ctx.rotate(platform.rotation);
        ctx.translate(-centerX, -centerY);
    }

    // Draw platform
    if (platform.spriteType === 'color') {
        ctx.fillStyle = platform.color;
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.drawImage(sprite, x, y, width, height);
    }

    // Draw selection outline
    if (platform === selectedPlatform) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }

    ctx.restore();
}
```

## Performance Optimization

### Viewport Culling

Only render platforms visible on screen:

```javascript
platforms.filter(platform => {
    return platform.x < camera.x + viewport.width &&
           platform.x + platform.width > camera.x &&
           platform.y < camera.y + viewport.height &&
           platform.y + platform.height > camera.y;
});
```

### Update Optimization

- Skip stationary platforms
- Batch similar operations
- Use dirty flags for changes
- Limit active moving platforms

## Integration Points

### With Player System
- Collision detection
- Damage application
- Movement inheritance
- Platform standing state

### With Props System
- Props can bind to platforms
- Inherit platform movement
- Maintain relative positions

### With Camera System
- Viewport culling
- Screen-relative positioning
- Camera boundaries

### With Scene System
- Platform data persistence
- Scene transitions
- Platform copying

## Configuration

### Default Values
```javascript
const PLATFORM_DEFAULTS = {
    width: 150,
    height: 20,
    color: '#4ECDC4',
    spriteType: 'color',
    moveSpeed: 2,
    damagePerSecond: 0,
    maxHeight: 32
};
```

### Limits
```javascript
const PLATFORM_LIMITS = {
    maxPerScene: 200,
    maxMoving: 50,
    maxSpinning: 20,
    minWidth: 20,
    minHeight: 10
};
```

## API Reference

### Public Methods

```javascript
// Platform management
addPlatform(x, y)
deletePlatform(id)
updatePlatform(platform, updates)
getPlatformById(id)
selectPlatform(platform)
clearSelection()

// Movement control
startMovement(platform)
stopMovement(platform)
resetPosition(platform)
clearMovementZone(platform)

// Collision
checkCollision(rect1, rect2)
checkPlayerPlatformCollisions(player, platforms)

// Rendering
render(ctx, camera, viewport)
renderMovementZones(ctx, camera)
```

### Events

The platform system triggers these events:

- `platformAdded` - New platform created
- `platformDeleted` - Platform removed
- `platformSelected` - Platform selected
- `platformMoved` - Platform position changed
- `platformCollision` - Collision detected

## Best Practices

1. **Limit Moving Platforms**: Keep under 20 per scene
2. **Optimize Paths**: Use simple, straight lines
3. **Test Collisions**: Verify all platform edges
4. **Group Similar**: Copy/paste platform sets
5. **Use Appropriate Types**: Choose correct sprite type
6. **Configure Damage**: Set reasonable DPS values
7. **Test Performance**: Monitor FPS with many platforms

---

Related: [Player System](./player-system.md) | [Props System](./props-system.md) | [Scene System](./scene-system.md)