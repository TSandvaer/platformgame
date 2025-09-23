// Additional system documentation pages
const additionalPages = {
    'player-system': {
        title: 'Player System',
        section: 'Core Systems',
        content: `
            <div class="page-content">
                <h1>👤 Player System</h1>
                <p>The Player System manages character movement, physics, animations, and interactions with the game world.</p>

                <h2>📁 System Structure</h2>
                <pre><code>js/player/
├── playerData.js        # Character state and properties
├── playerPhysics.js     # Movement physics and collision
├── playerController.js  # Input handling and controls
├── playerAnimator.js    # Sprite animation management
└── playerRenderer.js    # Character rendering and debug</code></pre>

                <h2>🎮 Core Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>🏃 Movement Physics</h3>
                        <p>Realistic gravity, jumping mechanics, and ground detection with frame-rate independent physics.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>❤️ Health & Stamina</h3>
                        <p>Complete player stats system with configurable health and stamina values.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>🎭 Sprite Animation</h3>
                        <p>Multi-frame character animations for idle, walking, jumping, and combat actions.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>🔄 Dual-Mode Behavior</h3>
                        <p>Different physics in Development (free movement) vs Production (platformer physics).</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                </div>

                <h2>⚙️ Configuration</h2>
                <h3>Player Properties</h3>
                <table>
                    <tr><th>Property</th><th>Default</th><th>Description</th></tr>
                    <tr><td>width</td><td>32</td><td>Player character width in pixels</td></tr>
                    <tr><td>height</td><td>48</td><td>Player character height in pixels</td></tr>
                    <tr><td>maxHealth</td><td>100</td><td>Maximum health points</td></tr>
                    <tr><td>maxStamina</td><td>100</td><td>Maximum stamina points</td></tr>
                    <tr><td>speed</td><td>5</td><td>Base movement speed</td></tr>
                    <tr><td>jumpPower</td><td>15</td><td>Jump velocity strength</td></tr>
                </table>

                <h3>Physics Constants</h3>
                <table>
                    <tr><th>Constant</th><th>Value</th><th>Description</th></tr>
                    <tr><td>gravity</td><td>0.8</td><td>Downward acceleration force</td></tr>
                    <tr><td>friction</td><td>0.8</td><td>Ground friction coefficient</td></tr>
                    <tr><td>terminalVelocity</td><td>20</td><td>Maximum falling speed</td></tr>
                </table>

                <h2>🎮 Controls</h2>
                <h3>Development Mode</h3>
                <ul>
                    <li><strong>WASD / Arrow Keys</strong> - Free 8-directional movement</li>
                    <li><strong>Shift</strong> - Increase movement speed</li>
                    <li><strong>No physics constraints</strong> - Player can move through platforms</li>
                </ul>

                <h3>Production Mode</h3>
                <ul>
                    <li><strong>A/D or Left/Right</strong> - Horizontal movement</li>
                    <li><strong>W/S or Up/Down</strong> - Climbing (on ladders/ropes)</li>
                    <li><strong>Space or Up</strong> - Jump (only when on ground)</li>
                    <li><strong>Full physics simulation</strong> - Gravity, collision, boundaries</li>
                </ul>

                <h2>🔄 System Integration</h2>
                <h3>Platform Collision</h3>
                <p>The Player System integrates with the Platform System for:</p>
                <ul>
                    <li>Ground detection for jumping</li>
                    <li>Collision resolution for solid platforms</li>
                    <li>Surface friction calculation</li>
                </ul>

                <h3>Scene Boundaries</h3>
                <p>Works with Scene System for:</p>
                <ul>
                    <li>Keeping player within scene bounds</li>
                    <li>Triggering scene transitions</li>
                    <li>Respawning at start positions</li>
                </ul>

                <h3>Camera Following</h3>
                <p>Coordinates with Camera System for:</p>
                <ul>
                    <li>Smooth camera following</li>
                    <li>Predictive camera movement</li>
                    <li>Boundary-aware positioning</li>
                </ul>

                <blockquote>
                    💡 <strong>Performance Note:</strong> The Player System uses delta-time calculations to ensure consistent movement across different frame rates and device performance levels.
                </blockquote>
            </div>
        `
    },

    'platform-system': {
        title: 'Platform System',
        section: 'Core Systems',
        content: `
            <div class="page-content">
                <h1>🧱 Platform System</h1>
                <p>The Platform System manages terrain creation, editing, collision detection, and visual rendering of platforms in the game world.</p>

                <h2>📁 System Structure</h2>
                <pre><code>js/platforms/
├── platformData.js           # Platform storage and positioning
├── platformRenderer.js       # Sprite-based platform rendering
├── platformCollisions.js     # Player-platform collision detection
├── platformManager.js        # Interactive editing and manipulation
├── platformMouseHandler.js   # Mouse interaction for editing
└── platformSystem.js         # Main system interface</code></pre>

                <h2>🎨 Visual Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>🖼️ 25+ Texture Types</h3>
                        <p>Rich variety of platform textures including grass, stone, wood, metal, and dirt variants.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>📏 Real-time Editing</h3>
                        <p>Visual drag-and-drop editing with resize handles and snap-to-grid functionality.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>📐 Positioning Modes</h3>
                        <p>Support for both absolute world coordinates and screen-relative positioning.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                    <div class="feature-card">
                        <h3>⚡ Performance Optimized</h3>
                        <p>Efficient sprite sheet rendering with minimal draw calls and optimized collision detection.</p>
                        <span class="status-badge implemented">✓ Implemented</span>
                    </div>
                </div>

                <h2>🎨 Available Textures</h2>
                <h3>Ground & Nature</h3>
                <ul>
                    <li><strong>grass</strong> - Green grassy texture</li>
                    <li><strong>dirt</strong> - Brown earth texture</li>
                    <li><strong>sand</strong> - Sandy/desert texture</li>
                    <li><strong>mud</strong> - Dark muddy texture</li>
                    <li><strong>clay</strong> - Reddish clay texture</li>
                </ul>

                <h3>Stone & Rock</h3>
                <ul>
                    <li><strong>cobblestone</strong> - Classic cobblestone pattern</li>
                    <li><strong>darkStone</strong> - Dark stone variation</li>
                    <li><strong>lightStone</strong> - Light stone variation</li>
                    <li><strong>roughStone</strong> - Textured rough stone</li>
                    <li><strong>bricks</strong> - Brick pattern</li>
                </ul>

                <h3>Wood & Construction</h3>
                <ul>
                    <li><strong>wood</strong> - Natural wood planks</li>
                    <li><strong>darkWood</strong> - Dark wood variant</li>
                    <li><strong>bamboo</strong> - Bamboo texture</li>
                    <li><strong>thatch</strong> - Thatched roof material</li>
                </ul>

                <h3>Metal & Industrial</h3>
                <ul>
                    <li><strong>metal</strong> - Metallic surface</li>
                    <li><strong>copper</strong> - Copper-colored metal</li>
                    <li><strong>steel</strong> - Steel/iron texture</li>
                    <li><strong>rusty</strong> - Rusted metal</li>
                </ul>

                <h2>⚙️ Editing Tools</h2>
                <h3>Platform Creation</h3>
                <ol>
                    <li>Click "Add Platform" in the dashboard</li>
                    <li>Click on the canvas to place</li>
                    <li>Platform appears with default size (100x20)</li>
                    <li>Automatically snaps to 10-pixel grid</li>
                </ol>

                <h3>Platform Manipulation</h3>
                <ul>
                    <li><strong>Move</strong> - Click and drag platform</li>
                    <li><strong>Resize</strong> - Drag corner/edge handles</li>
                    <li><strong>Properties</strong> - Edit size, position, texture in panel</li>
                    <li><strong>Delete</strong> - Select and press Delete key</li>
                </ul>

                <h3>Advanced Features</h3>
                <ul>
                    <li><strong>Multi-selection</strong> - Ctrl+click for multiple platforms</li>
                    <li><strong>Copy/Paste</strong> - Ctrl+C / Ctrl+V with offset positioning</li>
                    <li><strong>Alignment tools</strong> - Snap to grid and other platforms</li>
                    <li><strong>Visual feedback</strong> - Blue cursors and selection outlines</li>
                </ul>

                <h2>🔧 Technical Details</h2>
                <h3>Collision Detection</h3>
                <p>The platform system uses efficient AABB (Axis-Aligned Bounding Box) collision detection:</p>
                <pre><code>// Collision check example
function checkCollision(player, platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y < platform.y + platform.height &&
           player.y + player.height > platform.y;
}</code></pre>

                <h3>Rendering Pipeline</h3>
                <ol>
                    <li><strong>Sprite Loading</strong> - Load texture atlas on startup</li>
                    <li><strong>Texture Mapping</strong> - Map platform types to sprite coordinates</li>
                    <li><strong>Efficient Drawing</strong> - Batch draw calls for performance</li>
                    <li><strong>Development Overlays</strong> - Add selection indicators and handles</li>
                </ol>

                <h3>Data Structure</h3>
                <pre><code>// Platform object structure
{
    id: number,              // Unique identifier
    x: number,               // X position (world coordinates)
    y: number,               // Y position (world coordinates)
    width: number,           // Platform width in pixels
    height: number,          // Platform height in pixels
    spriteType: string,      // Texture type ('grass', 'stone', etc.)
    color: string,           // Fallback color if no texture
    positioning: string      // 'absolute' or 'screen-relative'
}</code></pre>

                <blockquote>
                    💡 <strong>Performance Tip:</strong> For large levels, consider using spatial partitioning to optimize collision detection with many platforms.
                </blockquote>
            </div>
        `
    },

    'prop-system': {
        title: 'Prop System',
        section: 'Core Systems',
        content: `
            <div class="page-content">
                <h1>🎯 Prop System</h1>
                <p>The Prop System manages interactive objects, decorations, and environmental elements that bring your game world to life.</p>

                <h2>📁 System Structure</h2>
                <pre><code>js/props/
├── propData.js              # Object definitions and positioning
├── propRenderer.js          # Sprite rendering with layering
├── propCollisions.js        # Obstacle collision detection
├── propManager.js           # Selection and manipulation
├── propsMouseHandler.js     # Mouse interaction handling
└── propSystem.js            # Main system interface</code></pre>

                <h2>🎭 Prop Categories</h2>
                <p>Over 100 unique prop types organized into logical categories:</p>

                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>🏠 Buildings</h3>
                        <p>Houses, towers, windmills, and architectural elements for creating settlements.</p>
                        <span class="status-badge implemented">✓ 15+ Types</span>
                    </div>
                    <div class="feature-card">
                        <h3>🌳 Nature</h3>
                        <p>Trees, bushes, stones, grass patches, and natural environmental elements.</p>
                        <span class="status-badge implemented">✓ 25+ Types</span>
                    </div>
                    <div class="feature-card">
                        <h3>⚔️ Tools & Weapons</h3>
                        <p>Swords, axes, farming tools, and equipment for interactive gameplay.</p>
                        <span class="status-badge implemented">✓ 20+ Types</span>
                    </div>
                    <div class="feature-card">
                        <h3>🍎 Items & Food</h3>
                        <p>Consumables, treasures, and collectible items for gameplay mechanics.</p>
                        <span class="status-badge implemented">✓ 15+ Types</span>
                    </div>
                </div>

                <h2>🎨 Advanced Features</h2>
                <h3>🎯 Multi-Selection System</h3>
                <ul>
                    <li><strong>Ctrl+Click</strong> - Add/remove props from selection</li>
                    <li><strong>Drag Selection</strong> - Select multiple props with rectangle</li>
                    <li><strong>Group Operations</strong> - Move, copy, or modify selected props together</li>
                </ul>

                <h3>📐 Grouping & Organization</h3>
                <ul>
                    <li><strong>Group Creation</strong> - Combine related props into logical groups</li>
                    <li><strong>Hierarchical Structure</strong> - Nested groups for complex scenes</li>
                    <li><strong>Group Transform</strong> - Scale, rotate, or move entire groups</li>
                </ul>

                <h3>🎭 Z-Order Management</h3>
                <ul>
                    <li><strong>Layer Control</strong> - Background vs foreground rendering</li>
                    <li><strong>Send to Back/Front</strong> - Precise depth ordering</li>
                    <li><strong>Visual Indicators</strong> - Clear feedback on rendering order</li>
                </ul>

                <h3>🔄 Transform Tools</h3>
                <ul>
                    <li><strong>Rotation</strong> - Rotate props with Shift+drag</li>
                    <li><strong>Scaling</strong> - Resize props proportionally</li>
                    <li><strong>Smart Positioning</strong> - Snap to grid and alignment guides</li>
                </ul>

                <h2>⚡ Special Effects</h2>
                <h3>🔥 Particle System</h3>
                <p>The torch prop includes a sophisticated particle system:</p>
                <ul>
                    <li><strong>Flame Animation</strong> - Realistic fire particle effects</li>
                    <li><strong>Dynamic Lighting</strong> - Flickering light simulation</li>
                    <li><strong>Performance Optimized</strong> - Efficient particle pooling</li>
                </ul>

                <h3>🎬 Animation Support</h3>
                <ul>
                    <li><strong>Sprite Animation</strong> - Multi-frame animated props</li>
                    <li><strong>Idle Animations</strong> - Subtle movement for living props</li>
                    <li><strong>Interactive Animations</strong> - Trigger-based animations</li>
                </ul>

                <h2>🔧 Editing Workflow</h2>
                <h3>Prop Placement</h3>
                <ol>
                    <li>Select prop type from the comprehensive dropdown</li>
                    <li>Click on canvas to place prop instance</li>
                    <li>Use visual handles to adjust position and scale</li>
                    <li>Set collision properties (obstacle vs decoration)</li>
                </ol>

                <h3>Advanced Editing</h3>
                <ol>
                    <li><strong>Copy Operations</strong> - Ctrl+C to copy selected props</li>
                    <li><strong>Smart Paste</strong> - Ctrl+V with automatic offset positioning</li>
                    <li><strong>Batch Editing</strong> - Modify multiple props simultaneously</li>
                    <li><strong>Property Panel</strong> - Fine-tune position, scale, and behavior</li>
                </ol>

                <h2>🎯 Collision Types</h2>
                <h3>🚧 Obstacle Props</h3>
                <p>Props that block player movement:</p>
                <ul>
                    <li>Buildings and structures</li>
                    <li>Large furniture pieces</li>
                    <li>Walls and barriers</li>
                    <li>Trees and large vegetation</li>
                </ul>

                <h3>🎨 Decorative Props</h3>
                <p>Visual-only props that don't affect gameplay:</p>
                <ul>
                    <li>Small decorative items</li>
                    <li>Ground scatter objects</li>
                    <li>Background vegetation</li>
                    <li>Atmospheric elements</li>
                </ul>

                <h2>📊 Data Structure</h2>
                <pre><code>// Prop object structure
{
    id: number,              // Unique identifier
    type: string,            // Prop type ('house', 'tree', etc.)
    x: number,               // X position (world coordinates)
    y: number,               // Y position (world coordinates)
    scale: number,           // Scale multiplier (default: 1.0)
    rotation: number,        // Rotation in degrees (default: 0)
    zOrder: number,          // Rendering depth (higher = front)
    groupId: string,         // Group membership identifier
    collision: boolean,      // Whether prop blocks movement
    visible: boolean         // Visibility toggle
}</code></pre>

                <h2>🎨 Prop Type Examples</h2>
                <h3>🏘️ Buildings</h3>
                <ul>
                    <li><code>house</code> - Basic residential building</li>
                    <li><code>tower</code> - Tall defensive structure</li>
                    <li><code>windmill</code> - Animated windmill with rotating blades</li>
                    <li><code>barn</code> - Large agricultural building</li>
                </ul>

                <h3>🌿 Nature Elements</h3>
                <ul>
                    <li><code>bigTree</code> - Large deciduous tree</li>
                    <li><code>bush</code> - Small shrub vegetation</li>
                    <li><code>rock</code> - Natural stone formations</li>
                    <li><code>grass</code> - Grass patch details</li>
                </ul>

                <h3>⚔️ Equipment</h3>
                <ul>
                    <li><code>sword</code> - Medieval sword weapon</li>
                    <li><code>axe</code> - Woodcutting or battle axe</li>
                    <li><code>bow</code> - Ranged weapon bow</li>
                    <li><code>shield</code> - Defensive equipment</li>
                </ul>

                <blockquote>
                    💡 <strong>Design Tip:</strong> Use a mix of collision and decorative props to create rich, detailed environments that are both visually appealing and functionally interesting for gameplay.
                </blockquote>
            </div>
        `
    }

    // Additional pages would continue here for scene-system, camera-system, etc.
};

// Export for use in main wiki application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = additionalPages;
} else if (typeof window !== 'undefined') {
    window.additionalPages = additionalPages;
}