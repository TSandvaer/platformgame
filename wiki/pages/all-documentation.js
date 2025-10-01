// Complete Platform RPG Game Documentation
const completeDocumentation = {
    'overview': {
        title: 'Overview',
        section: 'Getting Started',
        content: `
            <div class="page-content">
                <h1>🌟 Platform RPG Game - Overview</h1>

                <div class="intro-section">
                    <p class="lead">A web-based 2D platform game engine with an integrated level editor. Built entirely in vanilla JavaScript, providing a complete game development environment that runs directly in the browser.</p>
                </div>

                <h2>🎯 Core Philosophy</h2>
                <div class="philosophy-grid">
                    <div class="principle-card">
                        <h3>No Dependencies</h3>
                        <p>Pure vanilla JavaScript with no external libraries</p>
                    </div>
                    <div class="principle-card">
                        <h3>Integrated Editor</h3>
                        <p>Seamless switch between playing and editing with Tab key</p>
                    </div>
                    <div class="principle-card">
                        <h3>Real-time Testing</h3>
                        <p>Test changes instantly without recompilation</p>
                    </div>
                    <div class="principle-card">
                        <h3>Browser-based</h3>
                        <p>Runs entirely in browser using HTML5 Canvas</p>
                    </div>
                </div>

                <h2>🚀 Key Features</h2>

                <h3>Game Engine</h3>
                <ul>
                    <li><strong>2D Physics Engine</strong> - Custom physics with gravity, collisions, and momentum</li>
                    <li><strong>Sprite Rendering</strong> - Efficient sprite rendering with animation support</li>
                    <li><strong>Particle System</strong> - Visual effects for combat and interactions</li>
                    <li><strong>Audio System</strong> - Sound effects and background music</li>
                    <li><strong>State Management</strong> - Scene-based state with transitions</li>
                </ul>

                <h3>Level Editor</h3>
                <ul>
                    <li><strong>Visual Editing</strong> - Click-and-drag interface for all elements</li>
                    <li><strong>Real-time Preview</strong> - See changes immediately</li>
                    <li><strong>Multi-selection</strong> - Select and edit multiple objects</li>
                    <li><strong>Copy/Paste</strong> - Duplicate objects and configurations</li>
                    <li><strong>Grid Snapping</strong> - Optional alignment for precision</li>
                </ul>

                <h3>Game Systems</h3>
                <div class="systems-overview">
                    <div class="system-card">
                        <h4>Platform System</h4>
                        <ul>
                            <li>Static and moving platforms</li>
                            <li>Spinning platforms</li>
                            <li>Damaging platforms</li>
                            <li>Blocking platforms</li>
                            <li>Visual movement zones</li>
                        </ul>
                    </div>
                    <div class="system-card">
                        <h4>Props System</h4>
                        <ul>
                            <li>50+ decorative props</li>
                            <li>Interactive objects</li>
                            <li>Destroyable props</li>
                            <li>Platform binding</li>
                            <li>Modal editor interface</li>
                        </ul>
                    </div>
                    <div class="system-card">
                        <h4>Enemy System</h4>
                        <ul>
                            <li>Multiple enemy types</li>
                            <li>AI pathfinding</li>
                            <li>Combat interactions</li>
                            <li>Health system</li>
                            <li>Visual placement</li>
                        </ul>
                    </div>
                    <div class="system-card">
                        <h4>Lootables System</h4>
                        <ul>
                            <li>Collectible items</li>
                            <li>Health pickups</li>
                            <li>Score system</li>
                            <li>Modal editor</li>
                            <li>Visual placement</li>
                        </ul>
                    </div>
                </div>

                <h2>📋 Requirements</h2>
                <table>
                    <tr><th>Browser</th><th>Minimum Version</th></tr>
                    <tr><td>Chrome</td><td>90+</td></tr>
                    <tr><td>Firefox</td><td>88+</td></tr>
                    <tr><td>Safari</td><td>14+</td></tr>
                    <tr><td>Edge</td><td>90+</td></tr>
                </table>

                <div class="info-box">
                    <h3>Recommended Specs</h3>
                    <ul>
                        <li>Resolution: 1920x1080 or higher</li>
                        <li>RAM: 4GB+ for smooth performance</li>
                        <li>GPU: Hardware acceleration enabled</li>
                        <li>Input: Mouse required, keyboard for controls</li>
                    </ul>
                </div>

                <h2>🎮 Getting Started</h2>
                <ol>
                    <li>Open <code>index.html</code> in a modern browser</li>
                    <li>Press <kbd>Tab</kbd> to enter development mode</li>
                    <li>Use the dashboard to add game elements</li>
                    <li>Press <kbd>Tab</kbd> again to test your level</li>
                    <li>Press <kbd>Ctrl+S</kbd> to save your work</li>
                </ol>
            </div>
        `
    },

    'architecture': {
        title: 'Architecture',
        section: 'Getting Started',
        content: `
            <div class="page-content">
                <h1>🏗️ System Architecture</h1>

                <p>The Platform RPG Game uses a modular, component-based architecture built on vanilla JavaScript.</p>

                <h2>Architecture Principles</h2>

                <h3>1. Separation of Concerns</h3>
                <ul>
                    <li><strong>Data Layer</strong> - Manages state and data structures</li>
                    <li><strong>Logic Layer</strong> - Handles game mechanics and rules</li>
                    <li><strong>Rendering Layer</strong> - Manages visual output</li>
                    <li><strong>Input Layer</strong> - Processes user interactions</li>
                </ul>

                <h3>2. Event-Driven Design</h3>
                <ul>
                    <li>Direct method calls for synchronous operations</li>
                    <li>Event listeners for UI interactions</li>
                    <li>State changes for reactive updates</li>
                    <li>Callbacks for asynchronous operations</li>
                </ul>

                <h3>3. Component System</h3>
                <pre><code>// Example: Platform entity composition
platform = {
    // Core components
    id: 1,
    x: 100, y: 200,
    width: 150, height: 20,

    // Behavior components
    isMoving: false,
    damagePerSecond: 0,
    blockPlayer: false,

    // Render component
    spriteType: 'grass',
    rotation: 0
}</code></pre>

                <h2>System Diagram</h2>
                <pre class="architecture-diagram">
Game.js (Main Loop)
    ├── Input System
    │   ├── InputKeyboard
    │   ├── InputMouse
    │   └── InputSystem
    │
    ├── Core Systems
    │   ├── PlayerSystem
    │   ├── PlatformSystem
    │   ├── PropSystem
    │   ├── EnemySystem
    │   └── LootableSystem
    │
    ├── Scene Management
    │   ├── SceneSystem
    │   ├── SceneData
    │   └── SceneManager
    │
    ├── Rendering
    │   ├── CameraSystem
    │   ├── BackgroundSystem
    │   ├── ParticleSystem
    │   └── Canvas Renderer
    │
    └── UI Systems
        ├── UIEventHandler
        ├── HUDSystem
        └── Modal System</pre>

                <h2>Game Loop</h2>
                <pre><code>class Game {
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;

        // Update phase
        this.update(deltaTime);

        // Render phase
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        this.inputSystem.update();
        this.playerSystem.update(deltaTime);
        this.enemySystem.update(deltaTime);
        this.platformSystem.updateMovement(deltaTime);
        this.cameraSystem.update();
    }

    render() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render in layer order
        this.backgroundSystem.render();
        this.platformSystem.render();
        this.propSystem.render();
        this.playerSystem.render();
        this.hudSystem.render();
    }
}</code></pre>

                <h2>Data Management</h2>

                <h3>Local Storage Schema</h3>
                <pre><code>{
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
                "settings": {...}
            }
        },
        "playerData": {
            "health": 100,
            "inventory": [...]
        }
    }
}</code></pre>

                <h2>Rendering Pipeline</h2>

                <h3>Layer Order (Back to Front)</h3>
                <ol>
                    <li>Background - Parallax backgrounds</li>
                    <li>Platforms - Static and moving</li>
                    <li>Props - Decorative objects</li>
                    <li>Enemies - AI entities</li>
                    <li>Lootables - Collectibles</li>
                    <li>Player - Character and effects</li>
                    <li>Particles - Visual effects</li>
                    <li>UI/HUD - Interface elements</li>
                </ol>

                <h2>Performance Optimization</h2>
                <ul>
                    <li><strong>Viewport Culling</strong> - Only render visible objects</li>
                    <li><strong>Sprite Batching</strong> - Group similar sprites</li>
                    <li><strong>Object Pooling</strong> - Reuse particle objects</li>
                    <li><strong>Dirty Rectangles</strong> - Update only changed regions</li>
                </ul>
            </div>
        `
    },

    'technologies': {
        title: 'Technologies',
        section: 'Advanced Topics',
        content: `
            <div class="page-content">
                <h1>💻 Technology Stack</h1>

                <h2>Core Technologies</h2>

                <h3>HTML5</h3>
                <ul>
                    <li><strong>Canvas API</strong> - Primary rendering surface</li>
                    <li><strong>Local Storage API</strong> - Data persistence</li>
                    <li><strong>Audio API</strong> - Sound effects and music</li>
                    <li><strong>Fullscreen API</strong> - Fullscreen game mode</li>
                    <li><strong>File API</strong> - Import/export functionality</li>
                </ul>

                <h3>CSS3</h3>
                <ul>
                    <li><strong>Flexbox/Grid</strong> - UI layout system</li>
                    <li><strong>CSS Variables</strong> - Theme customization</li>
                    <li><strong>Animations</strong> - UI transitions</li>
                    <li><strong>Custom Properties</strong> - Dynamic styling</li>
                </ul>

                <h3>JavaScript (ES6+)</h3>
                <ul>
                    <li><strong>Classes</strong> - Object-oriented programming</li>
                    <li><strong>Arrow Functions</strong> - Concise syntax</li>
                    <li><strong>Template Literals</strong> - String formatting</li>
                    <li><strong>Destructuring</strong> - Clean data access</li>
                    <li><strong>Async/Await</strong> - Asynchronous operations</li>
                </ul>

                <h2>Zero Dependencies Philosophy</h2>

                <div class="info-box warning">
                    <h3>No External Libraries</h3>
                    <p>This project uses <strong>zero external dependencies</strong> by design.</p>
                </div>

                <h3>Why No Dependencies?</h3>
                <ol>
                    <li><strong>Performance</strong> - No overhead from abstractions</li>
                    <li><strong>Learning</strong> - Direct interaction with web APIs</li>
                    <li><strong>Portability</strong> - Works anywhere with a browser</li>
                    <li><strong>Maintenance</strong> - No dependency updates needed</li>
                    <li><strong>Security</strong> - No third-party vulnerabilities</li>
                </ol>

                <h3>Custom Implementations</h3>
                <ul>
                    <li>Physics engine</li>
                    <li>Collision detection</li>
                    <li>Particle systems</li>
                    <li>State management</li>
                    <li>Animation system</li>
                    <li>UI components</li>
                </ul>

                <h2>Browser APIs</h2>

                <h3>Canvas 2D Context</h3>
                <pre><code>const ctx = canvas.getContext('2d');

// Drawing operations
ctx.drawImage(image, x, y, width, height);
ctx.fillRect(x, y, width, height);

// Transformations
ctx.save();
ctx.translate(x, y);
ctx.rotate(angle);
ctx.scale(scaleX, scaleY);
ctx.restore();

// Styling
ctx.fillStyle = '#color';
ctx.globalAlpha = 0.5;</code></pre>

                <h3>Local Storage</h3>
                <pre><code>// Save game data
localStorage.setItem('platformRPG_gameData', JSON.stringify(data));

// Load game data
const data = JSON.parse(localStorage.getItem('platformRPG_gameData'));

// Check availability
if (typeof(Storage) !== "undefined") {
    // Storage supported
}</code></pre>

                <h3>RequestAnimationFrame</h3>
                <pre><code>function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}</code></pre>

                <h2>Asset Pipeline</h2>

                <h3>Sprite Loading</h3>
                <pre><code>class SpriteLoader {
    async loadSprite(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    }
}</code></pre>

                <h2>Code Organization</h2>
                <pre>js/
├── systems/      # Core game systems
├── components/   # Reusable components
├── utils/        # Utility functions
├── config/       # Configuration
└── constants/    # Game constants</pre>

                <h3>Naming Conventions</h3>
                <ul>
                    <li><strong>Classes</strong>: PascalCase (PlayerSystem)</li>
                    <li><strong>Methods</strong>: camelCase (updatePlayer)</li>
                    <li><strong>Constants</strong>: UPPER_SNAKE (MAX_HEALTH)</li>
                    <li><strong>Files</strong>: kebab-case (player-system.js)</li>
                </ul>
            </div>
        `
    },

    'editor-overview': {
        title: 'Editor Overview',
        section: 'Game Editor',
        content: `
            <div class="page-content">
                <h1>🛠️ Game Editor Overview</h1>

                <p>The Platform RPG Game includes a fully integrated level editor that allows you to create, modify, and test game levels in real-time.</p>

                <h2>Accessing the Editor</h2>

                <div class="key-binding">
                    <kbd>Tab</kbd> - Toggle between Play and Edit modes
                </div>

                <h2>Editor Interface</h2>

                <div class="interface-diagram">
                    <pre>┌─────────────────────┐
│  DEVELOPMENT MODE   │
├─────────────────────┤
│  Camera Controls    │
│  Scene Management   │
│  Platforms          │
│  Props              │
│  Enemies            │
│  Lootables          │
│  Transitions        │
└─────────────────────┘</pre>
                </div>

                <h2>Core Features</h2>

                <h3>Object Placement</h3>
                <ul>
                    <li>Click to place objects in the world</li>
                    <li>Drag to reposition</li>
                    <li>Grid snapping with Ctrl</li>
                </ul>

                <h3>Multi-Selection</h3>
                <ul>
                    <li>Box selection by dragging</li>
                    <li>Ctrl+Click to add/remove</li>
                    <li>Ctrl+A to select all</li>
                </ul>

                <h3>Copy/Paste</h3>
                <ul>
                    <li>Ctrl+C to copy selected</li>
                    <li>Ctrl+V to paste at mouse</li>
                    <li>Maintains all properties</li>
                </ul>

                <h2>Modal Editors</h2>

                <h3>Props Editor Modal</h3>
                <div class="feature-card">
                    <h4>Visual Selection</h4>
                    <ul>
                        <li>Grid layout with thumbnails</li>
                        <li>Categories: Buildings, Nature, etc.</li>
                        <li>Configure before placement</li>
                        <li>50+ props available</li>
                    </ul>
                </div>

                <h3>Lootables Editor Modal</h3>
                <div class="feature-card">
                    <h4>Item Placement</h4>
                    <ul>
                        <li>Visual item selection</li>
                        <li>Coins, hearts, gems</li>
                        <li>Click to place multiple</li>
                        <li>Easy configuration</li>
                    </ul>
                </div>

                <h2>Keyboard Shortcuts</h2>

                <table>
                    <tr><th>Key</th><th>Action</th></tr>
                    <tr><td><kbd>Tab</kbd></td><td>Toggle editor</td></tr>
                    <tr><td><kbd>Ctrl+S</kbd></td><td>Save scene</td></tr>
                    <tr><td><kbd>Delete</kbd></td><td>Delete selected</td></tr>
                    <tr><td><kbd>Escape</kbd></td><td>Cancel/Deselect</td></tr>
                    <tr><td><kbd>Ctrl+C</kbd></td><td>Copy</td></tr>
                    <tr><td><kbd>Ctrl+V</kbd></td><td>Paste</td></tr>
                    <tr><td><kbd>Ctrl+A</kbd></td><td>Select all</td></tr>
                    <tr><td><kbd>Arrows</kbd></td><td>Nudge objects</td></tr>
                    <tr><td><kbd>Shift+Arrows</kbd></td><td>Nudge 10px</td></tr>
                    <tr><td><kbd>X</kbd></td><td>Damage props</td></tr>
                </table>

                <h2>Mouse Controls</h2>

                <table>
                    <tr><th>Action</th><th>Result</th></tr>
                    <tr><td>Left Click</td><td>Select/Place</td></tr>
                    <tr><td>Right Click + Drag</td><td>Pan camera</td></tr>
                    <tr><td>Click + Drag</td><td>Move objects</td></tr>
                    <tr><td>Drag Empty</td><td>Box select</td></tr>
                    <tr><td>Ctrl + Click</td><td>Multi-select</td></tr>
                </table>

                <h2>Visual Indicators</h2>

                <ul>
                    <li><span style="color: yellow">Yellow Outline</span> - Selected object</li>
                    <li><span style="color: red">Red Outline</span> - Multi-selected</li>
                    <li><span style="color: blue">Blue Outline</span> - Hovering</li>
                    <li><span style="color: green">Green Outline</span> - Valid placement</li>
                </ul>

                <h2>Workflow Tips</h2>

                <ol>
                    <li>Start with basic platform layout</li>
                    <li>Add props for decoration</li>
                    <li>Configure moving platforms</li>
                    <li>Place enemies strategically</li>
                    <li>Add lootables as rewards</li>
                    <li>Test frequently with Tab</li>
                    <li>Save regularly with Ctrl+S</li>
                </ol>
            </div>
        `
    },

    'platform-editor': {
        title: 'Platform Editor',
        section: 'Game Editor',
        content: `
            <div class="page-content">
                <h1>🧱 Platform Editor Guide</h1>

                <p>Create and configure the fundamental traversal elements of your levels.</p>

                <h2>Platform Types</h2>

                <div class="platform-types">
                    <div class="type-card">
                        <h3>Static Platforms</h3>
                        <p>Basic traversal and ground</p>
                        <ul>
                            <li>Fixed position</li>
                            <li>Solid collision</li>
                            <li>Various sprites</li>
                        </ul>
                    </div>

                    <div class="type-card">
                        <h3>Moving Platforms</h3>
                        <p>Dynamic traversal challenges</p>
                        <ul>
                            <li>Path-based movement</li>
                            <li>Configurable speed</li>
                            <li>End delays</li>
                        </ul>
                    </div>

                    <div class="type-card">
                        <h3>Spinning Platforms</h3>
                        <p>Rotating obstacles</p>
                        <ul>
                            <li>Rotation speed control</li>
                            <li>Clockwise/Counter</li>
                            <li>Physics effects</li>
                        </ul>
                    </div>

                    <div class="type-card">
                        <h3>Damaging Platforms</h3>
                        <p>Environmental hazards</p>
                        <ul>
                            <li>DPS configuration</li>
                            <li>Kill effects</li>
                            <li>Visual indicators</li>
                        </ul>
                    </div>

                    <div class="type-card">
                        <h3>Blocking Platforms</h3>
                        <p>Solid obstacles</p>
                        <ul>
                            <li>Block from all sides</li>
                            <li>Stop on collision</li>
                            <li>Crushing mechanics</li>
                        </ul>
                    </div>
                </div>

                <h2>Platform Properties</h2>

                <table>
                    <tr><th>Property</th><th>Range</th><th>Description</th></tr>
                    <tr><td>Position (X,Y)</td><td>Any</td><td>World coordinates</td></tr>
                    <tr><td>Size (W,H)</td><td>20-500</td><td>Platform dimensions</td></tr>
                    <tr><td>Sprite Type</td><td>Various</td><td>Visual appearance</td></tr>
                    <tr><td>Damage</td><td>0-100 DPS</td><td>Damage per second</td></tr>
                    <tr><td>Kill Effect</td><td>Normal/Sink</td><td>Death animation</td></tr>
                    <tr><td>Block Player</td><td>Yes/No</td><td>Solid from all sides</td></tr>
                </table>

                <h2>Movement System</h2>

                <h3>Setting Up Movement</h3>
                <ol>
                    <li>Select platform</li>
                    <li>Check "Moving Platform"</li>
                    <li>Click "Draw Movement Zone"</li>
                    <li>Click and drag to define path</li>
                    <li>Configure speed and options</li>
                </ol>

                <h3>Movement Zone Features</h3>

                <div class="info-box">
                    <h4>Shift+Drag Snapping</h4>
                    <p>Hold <kbd>Shift</kbd> while dragging to snap to perfect horizontal or vertical lines!</p>
                </div>

                <ul>
                    <li><strong>Blue Line</strong> - Movement path</li>
                    <li><strong>Green Circle</strong> - Start point</li>
                    <li><strong>Red Circle</strong> - End point</li>
                    <li><strong>Drag Handles</strong> - Adjust endpoints</li>
                </ul>

                <h3>Movement Configuration</h3>

                <pre><code>Movement Settings
├── Speed: 1-10 pixels/frame
├── Easing: Enable smooth acceleration
│   ├── Distance: 0.1-1.0 (when to slow)
│   └── Min Speed: 0.1-1.0 (minimum speed)
└── End Delay: 0-5000ms pause at ends</code></pre>

                <h2>Spinning Configuration</h2>

                <table>
                    <tr><th>Speed</th><th>Effect</th></tr>
                    <tr><td>0.1-0.5 rps</td><td>Slow, easy to ride</td></tr>
                    <tr><td>0.5-2.0 rps</td><td>Challenging</td></tr>
                    <tr><td>2.0-5.0 rps</td><td>Very difficult</td></tr>
                </table>

                <h2>Common Patterns</h2>

                <h3>Elevator</h3>
                <pre><code>Settings:
- Vertical movement
- Speed: 2
- End Delay: 1000ms
- No damage</code></pre>

                <h3>Crushing Ceiling</h3>
                <pre><code>Settings:
- Vertical movement
- Speed: 4
- Block Player: true
- Damage: 100 DPS</code></pre>

                <h3>Moving Bridge</h3>
                <pre><code>Settings:
- Horizontal movement
- Speed: 3
- Easing: enabled
- End Delay: 500ms</code></pre>
            </div>
        `
    },

    'props-editor': {
        title: 'Props Editor',
        section: 'Game Editor',
        content: `
            <div class="page-content">
                <h1>🎯 Props Editor Guide</h1>

                <p>Visual, grid-based interface for placing decorative and interactive objects.</p>

                <h2>Accessing Props Editor</h2>

                <ol>
                    <li>Enter Development Mode (<kbd>Tab</kbd>)</li>
                    <li>Click "Open Props Editor" button</li>
                    <li>Modal window appears with prop grid</li>
                </ol>

                <h2>Prop Categories</h2>

                <div class="categories-grid">
                    <div class="category-card">
                        <h3>🏠 Buildings (10)</h3>
                        <p>House, Tower, Church, Castle, Ruins, etc.</p>
                    </div>

                    <div class="category-card">
                        <h3>🌳 Nature (15)</h3>
                        <p>Trees, Rocks, Plants, Mushrooms, etc.</p>
                    </div>

                    <div class="category-card">
                        <h3>🏗️ Structures (10)</h3>
                        <p>Poles, Barriers, Bridges, Gates, etc.</p>
                    </div>

                    <div class="category-card">
                        <h3>🕯️ Decorations (8)</h3>
                        <p>Torch, Lantern, Barrel, Crate, etc.</p>
                    </div>

                    <div class="category-card">
                        <h3>💎 Items (5)</h3>
                        <p>Chest, Key, Potion, Sword, Shield</p>
                    </div>

                    <div class="category-card">
                        <h3>🪑 Furniture (4)</h3>
                        <p>Table, Chair, Bed, Bookshelf</p>
                    </div>

                    <div class="category-card">
                        <h3>🌾 Farm (4)</h3>
                        <p>Fence, Hay Bale, Scarecrow, Well</p>
                    </div>

                    <div class="category-card">
                        <h3>⚰️ Graveyard (3)</h3>
                        <p>Gravestones, Cross</p>
                    </div>
                </div>

                <h2>Prop Configuration</h2>

                <h3>Basic Properties</h3>
                <ul>
                    <li><strong>Is Obstacle</strong> - Blocks movement when checked</li>
                    <li><strong>Size Multiplier</strong> - Scale from 0.5x to 3.0x</li>
                    <li><strong>Damage Per Second</strong> - 0 to 100 DPS</li>
                </ul>

                <h3>Destroyable Properties</h3>
                <ul>
                    <li><strong>Destroyable</strong> - Can be destroyed when checked</li>
                    <li><strong>Max Durability</strong> - Health points (1-1000)</li>
                </ul>

                <h2>Props on Moving Platforms</h2>

                <div class="info-box">
                    <h3>Automatic Binding</h3>
                    <p>Props placed on platforms automatically bind and move with them!</p>
                </div>

                <h3>Binding Behavior</h3>
                <ul>
                    <li>Props detect platform underneath</li>
                    <li>Maintain relative position</li>
                    <li>Inherit all movement and rotation</li>
                    <li>Move as single unit</li>
                </ul>

                <h3>Common Bound Patterns</h3>

                <div class="pattern-examples">
                    <div class="pattern">
                        <h4>Moving Castle</h4>
                        <p>Platform + Castle + Towers + Flags</p>
                    </div>

                    <div class="pattern">
                        <h4>Rotating Windmill</h4>
                        <p>Spinning platform + Windmill props</p>
                    </div>

                    <div class="pattern">
                        <h4>Decorated Elevator</h4>
                        <p>Platform + Railings + Control panel</p>
                    </div>
                </div>

                <h2>Spinning Props</h2>

                <p>Some props have built-in rotation animations:</p>
                <ul>
                    <li>Windmill - Continuous blade rotation</li>
                    <li>Water Wheel - Steady rotation</li>
                    <li>Gears - Mechanical rotation</li>
                    <li>Fans - Spinning blades</li>
                </ul>

                <h2>Visual Effects</h2>

                <h3>Damage States</h3>
                <ul>
                    <li>100-75% - Normal appearance</li>
                    <li>74-50% - Slightly damaged</li>
                    <li>49-25% - Heavily damaged</li>
                    <li>24-1% - Critical damage</li>
                    <li>0% - Destroyed with particles</li>
                </ul>

                <h2>Tips & Tricks</h2>

                <ul>
                    <li>Use <kbd>Ctrl+C</kbd> and <kbd>Ctrl+V</kbd> for quick duplication</li>
                    <li>Hold <kbd>Ctrl</kbd> for grid snapping</li>
                    <li>Press <kbd>X</kbd> to damage destroyable props</li>
                    <li>Group related props for easier management</li>
                    <li>Mix categories for variety</li>
                    <li>Use different scales for depth</li>
                </ul>
            </div>
        `
    },

    'advanced-movement': {
        title: 'Advanced Movement',
        section: 'Game Editor',
        content: `
            <div class="page-content">
                <h1>🔄 Advanced Movement and Rotation Guide</h1>

                <p>Master complex movement patterns and rotation mechanics for platforms and props.</p>

                <h2>Platform Movement System</h2>

                <h3>Basic Setup</h3>
                <ol>
                    <li>Select platform</li>
                    <li>Enable "Moving Platform"</li>
                    <li>Draw movement zone</li>
                    <li>Configure speed and options</li>
                </ol>

                <h3>Movement Zone Drawing</h3>

                <div class="feature-highlight">
                    <h4>✨ Shift+Drag Snapping</h4>
                    <p>Hold <kbd>Shift</kbd> while dragging to snap to perfect horizontal or vertical lines!</p>
                </div>

                <ul>
                    <li><strong>Click</strong> - Set start point</li>
                    <li><strong>Drag</strong> - Define path</li>
                    <li><strong>Release</strong> - Set end point</li>
                    <li><strong>Shift+Drag</strong> - Snap to H/V</li>
                </ul>

                <h3>Advanced Movement Options</h3>

                <h4>Easing System</h4>
                <table>
                    <tr><th>Property</th><th>Range</th><th>Effect</th></tr>
                    <tr><td>Easing Distance</td><td>0.1-1.0</td><td>When to start slowing</td></tr>
                    <tr><td>Min Speed</td><td>0.1-1.0</td><td>Minimum speed during ease</td></tr>
                </table>

                <pre><code>Example Easing Configs:
• Gentle: Distance 0.3, Min 0.2
• Sudden: Distance 0.1, Min 0.5
• Smooth: Distance 0.5, Min 0.1</code></pre>

                <h4>End Delays</h4>
                <ul>
                    <li>0ms - Continuous movement</li>
                    <li>500ms - Brief pause</li>
                    <li>1000ms - Standard wait</li>
                    <li>3000ms - Extended stop</li>
                </ul>

                <h2>Platform Spinning</h2>

                <h3>Configuration</h3>
                <pre><code>Spinning Settings
├── Enable: [checkbox]
├── Speed: 0.1-5.0 rps
├── Direction: CW/CCW
└── Current: 0-360°</code></pre>

                <h3>Speed Effects</h3>
                <table>
                    <tr><th>Speed (rps)</th><th>Difficulty</th><th>Use Case</th></tr>
                    <tr><td>0.1-0.5</td><td>Easy</td><td>Decorative, easy traverse</td></tr>
                    <tr><td>0.5-2.0</td><td>Medium</td><td>Challenge platform</td></tr>
                    <tr><td>2.0-5.0</td><td>Hard</td><td>Expert obstacle</td></tr>
                </table>

                <h2>Combined Movement + Spinning</h2>

                <p>Platforms can move AND spin simultaneously for complex challenges:</p>

                <pre><code>{
    // Movement along path
    isMoving: true,
    moveSpeed: 2,
    movementZone: {...},

    // Rotation
    isSpinning: true,
    spinSpeed: 1.0,
    spinClockwise: true
}</code></pre>

                <h2>Props Bound to Platforms</h2>

                <h3>Automatic Binding</h3>
                <ol>
                    <li>Place prop on platform</li>
                    <li>System auto-detects overlap</li>
                    <li>Prop binds to platform</li>
                    <li>Inherits all movement</li>
                </ol>

                <h3>Binding Effects</h3>
                <ul>
                    <li><strong>Position</strong> - Maintains offset</li>
                    <li><strong>Movement</strong> - Follows path</li>
                    <li><strong>Rotation</strong> - Orbits if spinning</li>
                    <li><strong>Velocity</strong> - Inherits speed</li>
                </ul>

                <h2>Movement Patterns</h2>

                <div class="pattern-grid">
                    <div class="pattern-card">
                        <h3>Elevator</h3>
                        <pre>Movement: Vertical
Speed: 2
Delay: 1500ms
Easing: Yes</pre>
                    </div>

                    <div class="pattern-card">
                        <h3>Patrol</h3>
                        <pre>Movement: Horizontal
Speed: 3
Delay: 500ms
Easing: No</pre>
                    </div>

                    <div class="pattern-card">
                        <h3>Crusher</h3>
                        <pre>Movement: Vertical
Speed: 5
BlockPlayer: true
Damage: 100</pre>
                    </div>

                    <div class="pattern-card">
                        <h3>Ferry</h3>
                        <pre>Movement: Horizontal
Speed: 1.5
Delay: 2000ms
Props: Fences</pre>
                    </div>
                </div>

                <h2>Advanced Techniques</h2>

                <h3>Synchronized Platforms</h3>
                <ol>
                    <li>Create identical movement zones</li>
                    <li>Match speeds and delays</li>
                    <li>Offset starting progress (0, 0.5)</li>
                </ol>

                <h3>Chain Reactions</h3>
                <ol>
                    <li>Use delays for timing</li>
                    <li>Position for transfers</li>
                    <li>Test thoroughly</li>
                </ol>

                <h2>Performance Tips</h2>

                <ul>
                    <li>Limit to ~20 moving platforms</li>
                    <li>Use simple straight paths</li>
                    <li>Minimize spinning platforms (~10)</li>
                    <li>Test FPS regularly</li>
                </ul>

                <h2>Troubleshooting</h2>

                <table>
                    <tr><th>Issue</th><th>Solution</th></tr>
                    <tr><td>Platform not moving</td><td>Check speed > 0, zone drawn</td></tr>
                    <tr><td>Erratic movement</td><td>Redraw movement zone</td></tr>
                    <tr><td>Props not following</td><td>Ensure overlap, reload scene</td></tr>
                    <tr><td>Low FPS</td><td>Reduce moving platforms</td></tr>
                </table>
            </div>
        `
    },

    'lootables-editor': {
        title: 'Lootables Editor',
        section: 'Game Editor',
        content: `
            <div class="page-content">
                <h1>💎 Lootables Editor Guide</h1>

                <p>Place and configure collectible items and rewards in your levels.</p>

                <h2>Accessing the Editor</h2>

                <ol>
                    <li>Enter Development Mode (<kbd>Tab</kbd>)</li>
                    <li>Click "Open Lootables Editor"</li>
                    <li>Modal shows available items</li>
                </ol>

                <h2>Lootable Types</h2>

                <div class="lootable-grid">
                    <div class="lootable-card">
                        <h3>🪙 Coin</h3>
                        <ul>
                            <li>Basic currency</li>
                            <li>Score points</li>
                            <li>Common placement</li>
                        </ul>
                    </div>

                    <div class="lootable-card">
                        <h3>❤️ Heart</h3>
                        <ul>
                            <li>Health restore</li>
                            <li>+25 HP</li>
                            <li>Strategic placement</li>
                        </ul>
                    </div>

                    <div class="lootable-card">
                        <h3>💎 Gem</h3>
                        <ul>
                            <li>Rare collectible</li>
                            <li>High value</li>
                            <li>Hidden areas</li>
                        </ul>
                    </div>
                </div>

                <h2>Placement Workflow</h2>

                <ol>
                    <li>Open Lootables Editor</li>
                    <li>Click item thumbnail</li>
                    <li>Click "Add Lootable"</li>
                    <li>Click in world to place</li>
                    <li>Continue placing or exit</li>
                </ol>

                <div class="info-box">
                    <h3>Exit Placement Mode</h3>
                    <p>Click "Exit Lootable Placement" button when done placing items.</p>
                </div>

                <h2>Management Features</h2>

                <h3>Selection</h3>
                <ul>
                    <li>Click to select single item</li>
                    <li>Ctrl+Click for multi-select</li>
                    <li>Box select by dragging</li>
                </ul>

                <h3>Editing</h3>
                <ul>
                    <li>Drag to move items</li>
                    <li>Delete key to remove</li>
                    <li>Ctrl+C/V to copy/paste</li>
                </ul>

                <h2>Strategic Placement</h2>

                <h3>Coin Trails</h3>
                <p>Guide players along intended paths</p>
                <ul>
                    <li>Line up coins along platforms</li>
                    <li>Create jump indicators</li>
                    <li>Mark safe routes</li>
                </ul>

                <h3>Health Pickups</h3>
                <p>Place hearts strategically</p>
                <ul>
                    <li>After difficult sections</li>
                    <li>Before boss areas</li>
                    <li>Hidden for exploration</li>
                </ul>

                <h3>Reward Placement</h3>
                <p>Use gems for special rewards</p>
                <ul>
                    <li>Secret areas</li>
                    <li>Skill challenges</li>
                    <li>Exploration bonuses</li>
                </ul>

                <h2>Best Practices</h2>

                <ul>
                    <li>Space coins evenly for rhythm</li>
                    <li>Use hearts sparingly</li>
                    <li>Hide gems for replay value</li>
                    <li>Test collection paths</li>
                    <li>Balance risk vs reward</li>
                </ul>
            </div>
        `
    },

    'controls': {
        title: 'Game Controls',
        section: 'Gameplay',
        content: `
            <div class="page-content">
                <h1>🎮 Game Controls Reference</h1>

                <h2>Player Movement</h2>

                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td><kbd>A</kbd> / <kbd>←</kbd></td><td>Move Left</td></tr>
                    <tr><td><kbd>D</kbd> / <kbd>→</kbd></td><td>Move Right</td></tr>
                    <tr><td><kbd>W</kbd> / <kbd>↑</kbd></td><td>Jump</td></tr>
                    <tr><td><kbd>S</kbd> / <kbd>↓</kbd></td><td>Crouch/Drop</td></tr>
                    <tr><td><kbd>Space</kbd></td><td>Alternative Jump</td></tr>
                    <tr><td><kbd>Shift</kbd> + Move</td><td>Run (faster)</td></tr>
                </table>

                <h2>Combat Controls</h2>

                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td>Left Click</td><td>Attack toward mouse</td></tr>
                    <tr><td>Hold <kbd>Ctrl</kbd></td><td>Block (if equipped)</td></tr>
                    <tr><td><kbd>Q</kbd></td><td>Quick attack combo</td></tr>
                    <tr><td><kbd>E</kbd></td><td>Interact (chests, signs)</td></tr>
                </table>

                <h2>Editor Controls</h2>

                <h3>Mode & Camera</h3>
                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td><kbd>Tab</kbd></td><td>Toggle Development Mode</td></tr>
                    <tr><td>Mouse to Edge</td><td>Pan camera</td></tr>
                    <tr><td>Right Click + Drag</td><td>Manual pan</td></tr>
                    <tr><td><kbd>F</kbd></td><td>Free camera mode</td></tr>
                    <tr><td><kbd>C</kbd></td><td>Center on player</td></tr>
                </table>

                <h3>Selection</h3>
                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td>Left Click</td><td>Select single</td></tr>
                    <tr><td><kbd>Ctrl</kbd> + Click</td><td>Multi-select</td></tr>
                    <tr><td>Click + Drag</td><td>Box select</td></tr>
                    <tr><td><kbd>Ctrl+A</kbd></td><td>Select all</td></tr>
                    <tr><td><kbd>Escape</kbd></td><td>Deselect</td></tr>
                </table>

                <h3>Editing</h3>
                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td><kbd>Delete</kbd></td><td>Delete selected</td></tr>
                    <tr><td><kbd>Ctrl+C</kbd></td><td>Copy</td></tr>
                    <tr><td><kbd>Ctrl+V</kbd></td><td>Paste</td></tr>
                    <tr><td><kbd>Ctrl+S</kbd></td><td>Save scene</td></tr>
                    <tr><td><kbd>Ctrl+Z</kbd></td><td>Undo</td></tr>
                    <tr><td><kbd>Ctrl+Y</kbd></td><td>Redo</td></tr>
                </table>

                <h3>Object Manipulation</h3>
                <table>
                    <tr><th>Control</th><th>Action</th></tr>
                    <tr><td>Arrow Keys</td><td>Nudge 1 pixel</td></tr>
                    <tr><td><kbd>Shift</kbd> + Arrows</td><td>Nudge 10 pixels</td></tr>
                    <tr><td><kbd>R</kbd></td><td>Rotate selected</td></tr>
                    <tr><td><kbd>X</kbd></td><td>Damage/destroy props</td></tr>
                    <tr><td><kbd>H</kbd></td><td>Toggle visibility</td></tr>
                </table>

                <h2>Special Controls</h2>

                <h3>Platform Movement Zones</h3>
                <ul>
                    <li><strong>Draw Zone</strong> - Click and drag</li>
                    <li><strong>Shift + Drag</strong> - Snap to H/V</li>
                    <li><strong>Drag Handles</strong> - Adjust endpoints</li>
                </ul>

                <h3>Modal Editors</h3>
                <ul>
                    <li>Click thumbnails to select</li>
                    <li>Configure properties</li>
                    <li>Click "Add" to place</li>
                    <li><kbd>Escape</kbd> to close</li>
                </ul>

                <h2>Context-Sensitive</h2>

                <h3>Near Chest</h3>
                <ul>
                    <li><kbd>E</kbd> - Open/close chest</li>
                    <li><kbd>E</kbd> (open) - View inventory</li>
                </ul>

                <h3>On Moving Platform</h3>
                <ul>
                    <li>Movement keys work normally</li>
                    <li>Platform velocity inherited</li>
                    <li>Jump includes momentum</li>
                </ul>

                <h2>Quick Reference</h2>

                <div class="quick-ref">
                    <pre>Essential Shortcuts:
Movement: WASD or Arrows
Jump: W or Space
Attack: Left Click
Editor: Tab
Save: Ctrl+S
Copy: Ctrl+C
Paste: Ctrl+V
Delete: Delete</pre>
                </div>
            </div>
        `
    },

    'platform-system': {
        title: 'Platform System',
        section: 'Core Systems',
        content: `
            <div class="page-content">
                <h1>🧱 Platform System Documentation</h1>

                <p>Manages all platform-related functionality including static and dynamic platforms, collision detection, movement patterns, and visual rendering.</p>

                <h2>Architecture</h2>

                <pre>PlatformSystem
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
    └── Selection highlights</pre>

                <h2>Data Structure</h2>

                <pre><code>platform = {
    // Core properties
    id: 1,
    x: 100, y: 200,
    width: 150, height: 20,
    spriteType: 'grass',

    // Damage properties
    damagePerSecond: 0,
    killEffect: 'normal',
    blockPlayer: false,

    // Movement properties
    isMoving: false,
    moveSpeed: 2,
    movementZone: {
        enabled: false,
        startX: 50, startY: 200,
        endX: 250, endY: 200,
        angle: 0
    },

    // Spinning properties
    isSpinning: false,
    spinSpeed: 1.0,
    spinClockwise: true,
    rotation: 0
}</code></pre>

                <h2>Movement System</h2>

                <h3>Movement Calculation</h3>
                <pre><code>updateMovement(deltaTime) {
    platforms.forEach(platform => {
        if (platform.isMoving && !platform.isPaused) {
            // Calculate progress along path
            const progress = movement / lineLength;
            platform.movementProgress += progress;

            // Update position
            platform.x = startX + (endX - startX) * progress;
            platform.y = startY + (endY - startY) * progress;
        }
    });
}</code></pre>

                <h3>Easing System</h3>
                <p>Smooth acceleration/deceleration near path ends:</p>
                <pre><code>if (platform.useEasing) {
    const distance = 1 - platform.movementProgress;
    if (distance < platform.easingDistance) {
        const multiplier = distance / platform.easingDistance;
        movement *= Math.max(multiplier, platform.minSpeed);
    }
}</code></pre>

                <h2>Collision System</h2>

                <h3>Standard Platforms</h3>
                <ul>
                    <li>Only solid from top</li>
                    <li>Player can jump through</li>
                    <li>Land on top</li>
                </ul>

                <h3>Blocking Platforms</h3>
                <ul>
                    <li>Solid from all sides</li>
                    <li>Stop movement on collision</li>
                    <li>Apply damage if configured</li>
                </ul>

                <h3>Damage Application</h3>
                <pre><code>if (platform.damagePerSecond > 0) {
    player.addDamagingPlatform(platform);
    // Damage applied per frame based on DPS
}</code></pre>

                <h2>Performance</h2>

                <h3>Limits</h3>
                <ul>
                    <li>Max 200 platforms per scene</li>
                    <li>Max 50 moving platforms</li>
                    <li>Max 20 spinning platforms</li>
                </ul>

                <h3>Optimization</h3>
                <ul>
                    <li>Viewport culling</li>
                    <li>Batch rendering</li>
                    <li>Simple paths preferred</li>
                    <li>Limit active movers</li>
                </ul>

                <h2>API Reference</h2>

                <h3>Methods</h3>
                <pre><code>// Management
addPlatform(x, y)
deletePlatform(id)
updatePlatform(platform, updates)
selectPlatform(platform)

// Movement
startMovement(platform)
stopMovement(platform)
resetPosition(platform)

// Collision
checkCollision(rect1, rect2)
checkPlayerPlatformCollisions(player, platforms)</code></pre>
            </div>
        `
    },

    'combat': {
        title: 'Combat System',
        section: 'Gameplay',
        content: `
            <div class="page-content">
                <h1>⚔️ Combat System</h1>

                <p>The combat system provides melee-based combat mechanics with stamina management and visual feedback.</p>

                <h2>Combat Mechanics</h2>

                <h3>Basic Attack</h3>
                <ul>
                    <li><strong>Input</strong>: Left mouse click</li>
                    <li><strong>Direction</strong>: Toward mouse cursor</li>
                    <li><strong>Damage</strong>: 10-25 points per hit</li>
                    <li><strong>Range</strong>: Short melee range</li>
                    <li><strong>Cooldown</strong>: 0.5 seconds</li>
                </ul>

                <h3>Combo System</h3>
                <ul>
                    <li><strong>3-Hit Combo</strong>: Click 3 times rapidly</li>
                    <li><strong>Damage Multiplier</strong>: 1x, 1.5x, 2x</li>
                    <li><strong>Timing Window</strong>: 1 second between hits</li>
                    <li><strong>Reset</strong>: After 1.5 seconds of no input</li>
                </ul>

                <h2>Damage System</h2>

                <h3>Damage Types</h3>
                <table>
                    <tr><th>Source</th><th>Damage</th><th>Effect</th></tr>
                    <tr><td>Basic Attack</td><td>10-25</td><td>Knockback</td></tr>
                    <tr><td>Platform Damage</td><td>1-100 DPS</td><td>Continuous</td></tr>
                    <tr><td>Enemy Contact</td><td>5-20</td><td>Knockback</td></tr>
                    <tr><td>Environmental</td><td>Variable</td><td>Various</td></tr>
                </table>

                <h3>Health System</h3>
                <ul>
                    <li><strong>Max Health</strong>: 100 HP</li>
                    <li><strong>Health Regeneration</strong>: None (pickup only)</li>
                    <li><strong>Health Pickups</strong>: Hearts restore 25 HP</li>
                    <li><strong>Death</strong>: Respawn at scene start</li>
                </ul>

                <h2>Stamina System</h2>

                <h3>Stamina Usage</h3>
                <ul>
                    <li><strong>Attack</strong>: 10 stamina per swing</li>
                    <li><strong>Sprint</strong>: 5 stamina per second</li>
                    <li><strong>Block</strong>: 2 stamina per second</li>
                    <li><strong>Jump</strong>: 5 stamina</li>
                </ul>

                <h3>Stamina Recovery</h3>
                <ul>
                    <li><strong>Base Recovery</strong>: 10 stamina per second</li>
                    <li><strong>While Standing</strong>: 15 per second</li>
                    <li><strong>While Crouching</strong>: 20 per second</li>
                    <li><strong>Max Stamina</strong>: 100 points</li>
                </ul>

                <h2>Visual Feedback</h2>

                <h3>Damage Numbers</h3>
                <ul>
                    <li>Float upward from impact point</li>
                    <li>Color coded by damage amount</li>
                    <li>Critical hits show larger numbers</li>
                </ul>

                <h3>Hit Effects</h3>
                <ul>
                    <li>Screen shake on heavy impacts</li>
                    <li>Red flash when taking damage</li>
                    <li>Particle effects on hit</li>
                    <li>Knockback animation</li>
                </ul>

                <h2>Enemy Combat</h2>

                <h3>Enemy Types</h3>
                <table>
                    <tr><th>Enemy</th><th>Health</th><th>Damage</th><th>Behavior</th></tr>
                    <tr><td>Slime</td><td>30</td><td>5</td><td>Patrol, jump attack</td></tr>
                    <tr><td>Bat</td><td>20</td><td>8</td><td>Flying, dive attack</td></tr>
                    <tr><td>Skeleton</td><td>50</td><td>15</td><td>Melee, block</td></tr>
                    <tr><td>Boss</td><td>200</td><td>25</td><td>Multiple patterns</td></tr>
                </table>

                <h3>AI Behaviors</h3>
                <ul>
                    <li><strong>Patrol</strong>: Move between waypoints</li>
                    <li><strong>Chase</strong>: Follow player when in range</li>
                    <li><strong>Attack</strong>: Strike when close enough</li>
                    <li><strong>Retreat</strong>: Back away when damaged</li>
                </ul>

                <h2>Combat Strategy</h2>

                <h3>Tips</h3>
                <ul>
                    <li>Time attacks to create combos</li>
                    <li>Manage stamina carefully</li>
                    <li>Use environment to your advantage</li>
                    <li>Learn enemy patterns</li>
                    <li>Collect hearts before battles</li>
                </ul>

                <h3>Advanced Techniques</h3>
                <ul>
                    <li><strong>Hit and Run</strong>: Attack then retreat</li>
                    <li><strong>Combo Cancel</strong>: Jump to reset combo</li>
                    <li><strong>Platform Advantage</strong>: Attack from above</li>
                    <li><strong>Crowd Control</strong>: Use knockback to manage groups</li>
                </ul>
            </div>
        `
    },

    'movement': {
        title: 'Movement & Physics',
        section: 'Gameplay',
        content: `
            <div class="page-content">
                <h1>🏃 Movement & Physics</h1>

                <p>The physics system provides realistic platformer mechanics with gravity, momentum, and collision detection.</p>

                <h2>Movement Mechanics</h2>

                <h3>Basic Movement</h3>
                <table>
                    <tr><th>Action</th><th>Speed</th><th>Acceleration</th></tr>
                    <tr><td>Walk</td><td>5 units/frame</td><td>0.5</td></tr>
                    <tr><td>Run (Shift)</td><td>8 units/frame</td><td>0.7</td></tr>
                    <tr><td>Air Movement</td><td>3 units/frame</td><td>0.3</td></tr>
                    <tr><td>Crouch Walk</td><td>2 units/frame</td><td>0.3</td></tr>
                </table>

                <h3>Jumping</h3>
                <ul>
                    <li><strong>Jump Height</strong>: 64 pixels (4 tiles)</li>
                    <li><strong>Jump Power</strong>: 15 velocity units</li>
                    <li><strong>Double Jump</strong>: 75% of initial jump</li>
                    <li><strong>Wall Jump</strong>: 80% power, 45° angle</li>
                    <li><strong>Coyote Time</strong>: 100ms after leaving platform</li>
                </ul>

                <h2>Physics System</h2>

                <h3>Gravity</h3>
                <ul>
                    <li><strong>Gravity Force</strong>: 0.8 units/frame²</li>
                    <li><strong>Terminal Velocity</strong>: 20 units/frame</li>
                    <li><strong>Jump Gravity</strong>: 0.6 (reduced while ascending)</li>
                    <li><strong>Fall Gravity</strong>: 1.0 (normal while falling)</li>
                </ul>

                <h3>Momentum</h3>
                <ul>
                    <li><strong>Ground Friction</strong>: 0.8 coefficient</li>
                    <li><strong>Air Friction</strong>: 0.95 coefficient</li>
                    <li><strong>Ice Friction</strong>: 0.98 (slippery)</li>
                    <li><strong>Max Velocity X</strong>: 15 units/frame</li>
                    <li><strong>Max Velocity Y</strong>: 20 units/frame</li>
                </ul>

                <h2>Collision System</h2>

                <h3>Collision Types</h3>
                <ul>
                    <li><strong>Solid Platforms</strong>: Block from all sides</li>
                    <li><strong>One-Way Platforms</strong>: Only solid from top</li>
                    <li><strong>Slopes</strong>: Angled surfaces (up to 45°)</li>
                    <li><strong>Moving Platforms</strong>: Inherit platform velocity</li>
                </ul>

                <h3>Collision Detection</h3>
                <pre><code>AABB Collision (Axis-Aligned Bounding Box)
- Fast rectangular collision
- Pixel-perfect at boundaries
- Separate X and Y resolution
- Prevents tunneling</code></pre>

                <h2>Platform Interactions</h2>

                <h3>Static Platforms</h3>
                <ul>
                    <li>Simple collision detection</li>
                    <li>Support one-way platforms</li>
                    <li>Variable friction surfaces</li>
                </ul>

                <h3>Moving Platforms</h3>
                <ul>
                    <li>Player inherits platform velocity</li>
                    <li>Sticky platforms (player moves with platform)</li>
                    <li>Jump retains platform momentum</li>
                    <li>Smooth transitions on/off platform</li>
                </ul>

                <h3>Spinning Platforms</h3>
                <ul>
                    <li>Angular momentum affects player</li>
                    <li>Centrifugal force when on edge</li>
                    <li>Jump direction influenced by rotation</li>
                    <li>Difficulty increases with speed</li>
                </ul>

                <h2>Advanced Movement</h2>

                <h3>Wall Mechanics</h3>
                <ul>
                    <li><strong>Wall Slide</strong>: Reduced fall speed near walls</li>
                    <li><strong>Wall Jump</strong>: Push off walls at angle</li>
                    <li><strong>Wall Climb</strong>: Limited vertical movement</li>
                    <li><strong>Corner Grab</strong>: Hang from ledges</li>
                </ul>

                <h3>Special Movements</h3>
                <ul>
                    <li><strong>Dash</strong>: Quick burst in direction</li>
                    <li><strong>Ground Pound</strong>: Fast downward attack</li>
                    <li><strong>Long Jump</strong>: Extended horizontal jump</li>
                    <li><strong>Spin Jump</strong>: Higher jump with spin</li>
                </ul>

                <h2>Environmental Effects</h2>

                <h3>Surface Types</h3>
                <table>
                    <tr><th>Surface</th><th>Friction</th><th>Effect</th></tr>
                    <tr><td>Normal</td><td>0.8</td><td>Standard movement</td></tr>
                    <tr><td>Ice</td><td>0.98</td><td>Slippery, momentum retained</td></tr>
                    <tr><td>Mud</td><td>0.5</td><td>Slow, high friction</td></tr>
                    <tr><td>Conveyor</td><td>0.8</td><td>Adds constant velocity</td></tr>
                </table>

                <h3>Physics Modifiers</h3>
                <ul>
                    <li><strong>Low Gravity Zones</strong>: 50% gravity</li>
                    <li><strong>Wind Areas</strong>: Constant horizontal force</li>
                    <li><strong>Water Sections</strong>: Buoyancy and drag</li>
                    <li><strong>Speed Zones</strong>: Multiplied movement speed</li>
                </ul>

                <h2>Performance Tips</h2>
                <ul>
                    <li>Physics runs at fixed 60 FPS</li>
                    <li>Delta time ensures consistent speed</li>
                    <li>Collision checks optimized with spatial partitioning</li>
                    <li>Only active objects updated per frame</li>
                </ul>
            </div>
        `
    },

    'items': {
        title: 'Items & Inventory',
        section: 'Gameplay',
        content: `
            <div class="page-content">
                <h1>💼 Items & Inventory System</h1>

                <p>The inventory system manages collectibles, equipment, and interactive items throughout the game.</p>

                <h2>Item Categories</h2>

                <h3>Collectibles</h3>
                <table>
                    <tr><th>Item</th><th>Effect</th><th>Value</th></tr>
                    <tr><td>🪙 Coin</td><td>Currency/Score</td><td>1 point</td></tr>
                    <tr><td>💎 Gem</td><td>Rare currency</td><td>10 points</td></tr>
                    <tr><td>⭐ Star</td><td>Level completion</td><td>Special</td></tr>
                    <tr><td>🔑 Key</td><td>Unlock doors/chests</td><td>Quest item</td></tr>
                </table>

                <h3>Consumables</h3>
                <table>
                    <tr><th>Item</th><th>Effect</th><th>Stack Size</th></tr>
                    <tr><td>❤️ Heart</td><td>Restore 25 HP</td><td>10</td></tr>
                    <tr><td>🧪 Potion</td><td>Various effects</td><td>5</td></tr>
                    <tr><td>🍖 Food</td><td>Restore stamina</td><td>20</td></tr>
                    <tr><td>⚡ Energy</td><td>Speed boost</td><td>3</td></tr>
                </table>

                <h3>Equipment</h3>
                <table>
                    <tr><th>Slot</th><th>Items</th><th>Effect</th></tr>
                    <tr><td>Weapon</td><td>Sword, Staff</td><td>Damage boost</td></tr>
                    <tr><td>Armor</td><td>Leather, Iron</td><td>Defense boost</td></tr>
                    <tr><td>Accessory</td><td>Ring, Amulet</td><td>Special abilities</td></tr>
                    <tr><td>Tool</td><td>Rope, Torch</td><td>Utility functions</td></tr>
                </table>

                <h2>Inventory Management</h2>

                <h3>Storage</h3>
                <ul>
                    <li><strong>Player Inventory</strong>: 20 slots</li>
                    <li><strong>Quick Slots</strong>: 5 slots (1-5 keys)</li>
                    <li><strong>Equipment Slots</strong>: 4 slots</li>
                    <li><strong>Stack Limits</strong>: Varies by item type</li>
                </ul>

                <h3>Chest System</h3>
                <ul>
                    <li><strong>Chest Capacity</strong>: 30 slots</li>
                    <li><strong>Shared Storage</strong>: Between scenes</li>
                    <li><strong>Locked Chests</strong>: Require keys</li>
                    <li><strong>Treasure Chests</strong>: One-time rewards</li>
                </ul>

                <h2>Item Interaction</h2>

                <h3>Collection</h3>
                <ul>
                    <li>Walk over items to collect</li>
                    <li>Auto-pickup for currency</li>
                    <li>Manual pickup for equipment</li>
                    <li>Full inventory prevents pickup</li>
                </ul>

                <h3>Usage</h3>
                <ul>
                    <li><strong>Number Keys (1-5)</strong>: Use quick slot items</li>
                    <li><strong>E Key</strong>: Interact with chests/NPCs</li>
                    <li><strong>Click Item</strong>: Use from inventory</li>
                    <li><strong>Drag & Drop</strong>: Move between slots</li>
                </ul>

                <h2>Chest Interface</h2>

                <h3>Opening Chests</h3>
                <ol>
                    <li>Approach chest</li>
                    <li>Press E to open</li>
                    <li>Inventory modal appears</li>
                    <li>Transfer items between inventories</li>
                    <li>Press Escape or X to close</li>
                </ol>

                <h3>Item Transfer</h3>
                <ul>
                    <li><strong>Click</strong>: Select item</li>
                    <li><strong>Drag</strong>: Move to destination</li>
                    <li><strong>Shift+Click</strong>: Quick transfer</li>
                    <li><strong>Ctrl+Click</strong>: Split stack</li>
                </ul>

                <h2>Special Items</h2>

                <h3>Quest Items</h3>
                <ul>
                    <li>Cannot be dropped or sold</li>
                    <li>Required for progression</li>
                    <li>Displayed separately</li>
                    <li>Persist across deaths</li>
                </ul>

                <h3>Rare Items</h3>
                <ul>
                    <li>Unique properties</li>
                    <li>Limited availability</li>
                    <li>Special visual effects</li>
                    <li>Achievement rewards</li>
                </ul>

                <h2>Item Properties</h2>

                <h3>Data Structure</h3>
                <pre><code>item = {
    id: "sword_iron",
    name: "Iron Sword",
    type: "weapon",
    icon: "sword_icon.png",
    stackable: false,
    maxStack: 1,
    value: 100,
    properties: {
        damage: 15,
        durability: 100,
        enchantments: []
    }
}</code></pre>

                <h3>Item Attributes</h3>
                <ul>
                    <li><strong>Durability</strong>: Degrades with use</li>
                    <li><strong>Value</strong>: Sell/buy price</li>
                    <li><strong>Weight</strong>: Affects movement (optional)</li>
                    <li><strong>Rarity</strong>: Common/Rare/Legendary</li>
                </ul>

                <h2>Economy System</h2>

                <h3>Currency</h3>
                <ul>
                    <li><strong>Coins</strong>: Basic currency</li>
                    <li><strong>Gems</strong>: Premium currency</li>
                    <li><strong>Exchange Rate</strong>: 10 coins = 1 gem</li>
                </ul>

                <h3>Trading</h3>
                <ul>
                    <li>Buy items from merchants</li>
                    <li>Sell unwanted items</li>
                    <li>Trade with NPCs</li>
                    <li>Auction system (multiplayer)</li>
                </ul>

                <h2>Storage Tips</h2>

                <ul>
                    <li>Organize items by type</li>
                    <li>Keep consumables in quick slots</li>
                    <li>Store valuables in chests</li>
                    <li>Sell duplicate equipment</li>
                    <li>Save rare items for later</li>
                </ul>
            </div>
        `
    }
};

// Merge with existing pages
if (typeof additionalPages !== 'undefined') {
    Object.assign(completeDocumentation, additionalPages);
}

// Export for use
window.wikiPages = completeDocumentation;