# Technology Stack

## Core Technologies

### Frontend Technologies

#### HTML5
- **Canvas API**: Primary rendering surface for the game
- **Local Storage API**: Data persistence
- **Audio API**: Sound effects and music
- **Fullscreen API**: Fullscreen game mode
- **File API**: Import/export functionality

#### CSS3
- **Flexbox/Grid**: UI layout system
- **CSS Variables**: Theme customization
- **Animations**: UI transitions and effects
- **Media Queries**: Responsive design
- **Custom Properties**: Dynamic styling

#### JavaScript (ES6+)
- **Classes**: Object-oriented programming
- **Modules**: Code organization (via script tags)
- **Arrow Functions**: Concise syntax
- **Template Literals**: String formatting
- **Destructuring**: Clean data access
- **Spread/Rest**: Array/object operations
- **Async/Await**: Asynchronous operations
- **Promises**: Asset loading

## No External Dependencies

The project intentionally uses **zero external libraries** or frameworks:

### Why No Dependencies?
1. **Performance**: No overhead from abstractions
2. **Learning**: Direct interaction with web APIs
3. **Portability**: Works anywhere with a browser
4. **Maintenance**: No dependency updates needed
5. **Size**: Minimal download size
6. **Security**: No third-party vulnerabilities

### Custom Implementations
Instead of libraries, custom implementations for:
- Physics engine
- Collision detection
- Particle systems
- State management
- Event handling
- Animation system
- UI components
- Data persistence

## Browser APIs Used

### Canvas 2D Context
```javascript
const ctx = canvas.getContext('2d');

// Drawing operations
ctx.drawImage(image, x, y, width, height);
ctx.fillRect(x, y, width, height);
ctx.strokeRect(x, y, width, height);

// Transformations
ctx.save();
ctx.translate(x, y);
ctx.rotate(angle);
ctx.scale(scaleX, scaleY);
ctx.restore();

// Styling
ctx.fillStyle = '#color';
ctx.strokeStyle = '#color';
ctx.globalAlpha = 0.5;
ctx.globalCompositeOperation = 'multiply';
```

### Local Storage
```javascript
// Save game data
localStorage.setItem('platformRPG_gameData', JSON.stringify(data));

// Load game data
const data = JSON.parse(localStorage.getItem('platformRPG_gameData'));

// Check storage availability
if (typeof(Storage) !== "undefined") {
    // Local storage supported
}
```

### RequestAnimationFrame
```javascript
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}
```

### Event Listeners
```javascript
// Keyboard input
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Mouse input
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('wheel', handleWheel);
canvas.addEventListener('contextmenu', handleContextMenu);

// Window events
window.addEventListener('resize', handleResize);
window.addEventListener('blur', handleBlur);
window.addEventListener('focus', handleFocus);
```

## Development Tools

### Required Tools
- **Text Editor**: Any code editor (VS Code recommended)
- **Web Browser**: Modern browser with DevTools
- **Local Server**: For testing (optional, can use file://)

### Recommended Tools
- **VS Code**: With JavaScript/HTML/CSS extensions
- **Chrome DevTools**: For debugging and profiling
- **Git**: Version control
- **Image Editor**: For sprite creation
- **Audio Editor**: For sound effects

## Asset Pipeline

### Sprite Assets
- **Format**: PNG with transparency
- **Organization**: Sprite sheets for animations
- **Naming**: Semantic naming convention
- **Loading**: Asynchronous with promises

```javascript
class SpriteLoader {
    async loadSprite(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    }
}
```

### Audio Assets
- **Format**: MP3/OGG for compatibility
- **Categories**: Music, SFX, UI sounds
- **Loading**: Preload critical sounds
- **Playback**: Web Audio API or HTML5 Audio

### Data Formats

#### Scene Data (JSON)
```json
{
    "id": "scene_001",
    "name": "Village",
    "platforms": [],
    "props": [],
    "enemies": [],
    "settings": {
        "backgroundImage": "village_bg",
        "music": "village_theme"
    }
}
```

#### Sprite Definition (JSON)
```json
{
    "id": "player_sprite",
    "src": "assets/sprites/player.png",
    "frameWidth": 32,
    "frameHeight": 32,
    "animations": {
        "idle": { "frames": [0, 1], "speed": 0.1 },
        "walk": { "frames": [2, 3, 4, 5], "speed": 0.2 }
    }
}
```

## Performance Optimizations

### Rendering Optimizations
- **Canvas Layer Caching**: Static elements cached
- **Sprite Batching**: Group similar draw calls
- **Viewport Culling**: Only render visible objects
- **Dirty Rectangles**: Partial canvas updates

### Memory Optimizations
- **Object Pooling**: Reuse frequently created objects
- **Lazy Loading**: Load assets when needed
- **Texture Atlases**: Combine sprites
- **Resource Cleanup**: Proper disposal

### JavaScript Optimizations
- **Minimize DOM Access**: Cache references
- **Avoid Memory Leaks**: Cleanup listeners
- **Use RAF**: Smooth animations
- **Batch Operations**: Group updates

## Browser Compatibility

### Minimum Requirements
```javascript
// Feature detection
const features = {
    canvas: !!document.createElement('canvas').getContext,
    localStorage: typeof(Storage) !== "undefined",
    requestAnimationFrame: !!window.requestAnimationFrame,
    es6: checkES6Support()
};

function checkES6Support() {
    try {
        new Function("(a = 0) => a");
        return true;
    } catch (e) {
        return false;
    }
}
```

### Polyfills (if needed)
```javascript
// RequestAnimationFrame polyfill
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { setTimeout(callback, 1000/60); };
```

## Code Organization

### File Structure
```
js/
├── systems/          # Core game systems
├── components/       # Reusable components
├── utils/           # Utility functions
├── config/          # Configuration files
└── constants/       # Game constants
```

### Naming Conventions
- **Classes**: PascalCase (PlayerSystem)
- **Methods**: camelCase (updatePlayer)
- **Constants**: UPPER_SNAKE (MAX_HEALTH)
- **Files**: kebab-case (player-system.js)
- **CSS Classes**: kebab-case (modal-container)

### Code Style
```javascript
// Class definition
class PlayerSystem {
    constructor(data) {
        this.data = data;
        this.initialize();
    }

    initialize() {
        // Initialization logic
    }

    update(deltaTime) {
        // Update logic
    }

    render(ctx) {
        // Render logic
    }
}

// Module pattern
const GameUtils = {
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    lerp(start, end, amount) {
        return start + (end - start) * amount;
    }
};
```

## Security Considerations

### XSS Prevention
- No innerHTML with user content
- No eval() or Function() with user input
- Sanitize all user-provided data

### Storage Security
- Validate data before storage
- Check storage quotas
- Handle storage exceptions
- Clear sensitive data

### Resource Limits
- Cap maximum entities
- Limit particle counts
- Restrict file sizes
- Timeout long operations

---

Next: [Getting Started](./04-getting-started.md) →