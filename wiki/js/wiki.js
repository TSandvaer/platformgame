// Wiki Navigation and Content Management
class WikiApp {
    constructor() {
        this.currentPage = 'overview';
        this.pages = {};
        this.searchIndex = [];
        this.pageOrder = [
            'overview', 'quick-start', 'architecture',
            'player-system', 'platform-system', 'prop-system', 'scene-system', 'camera-system', 'input-system',
            'editor-overview', 'development-mode', 'editing-tools', 'data-management',
            'rendering-pipeline', 'game-loop', 'technologies', 'extending',
            'api-reference', 'troubleshooting', 'contributing'
        ];

        this.init();
    }

    init() {
        this.initializePages();
        this.setupEventListeners();
        this.loadPage(this.currentPage);
        this.buildSearchIndex();
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');
        mobileToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

        // Search functionality
        const searchButton = document.getElementById('searchButton');
        const searchModal = document.getElementById('searchModal');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');

        searchButton?.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchInput.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });

        searchModal?.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });

        searchInput?.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Navigation footer buttons
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        prevButton?.addEventListener('click', () => this.navigateToPage('prev'));
        nextButton?.addEventListener('click', () => this.navigateToPage('next'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        searchModal.classList.add('active');
                        searchInput.focus();
                        break;
                }
            }

            if (e.key === 'Escape') {
                searchModal.classList.remove('active');
            }
        });
    }

    loadPage(pageId) {
        const contentBody = document.getElementById('contentBody');
        const page = this.pages[pageId];

        if (page) {
            contentBody.innerHTML = page.content;
            this.currentPage = pageId;
            this.updateNavigation();
            this.updateBreadcrumb(page);
            this.updateNavigationButtons();
            this.scrollToTop();
        }
    }

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    updateBreadcrumb(page) {
        const currentSection = document.getElementById('currentSection');
        const currentPageElement = document.getElementById('currentPage');

        if (currentSection && currentPageElement) {
            currentSection.textContent = page.section || 'Documentation';
            currentPageElement.textContent = page.title || 'Page';
        }
    }

    updateNavigationButtons() {
        const currentIndex = this.pageOrder.indexOf(this.currentPage);
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        if (prevButton) {
            prevButton.disabled = currentIndex <= 0;
        }

        if (nextButton) {
            nextButton.disabled = currentIndex >= this.pageOrder.length - 1;
        }
    }

    navigateToPage(direction) {
        const currentIndex = this.pageOrder.indexOf(this.currentPage);
        let newIndex;

        if (direction === 'prev') {
            newIndex = Math.max(0, currentIndex - 1);
        } else {
            newIndex = Math.min(this.pageOrder.length - 1, currentIndex + 1);
        }

        if (newIndex !== currentIndex) {
            this.loadPage(this.pageOrder[newIndex]);
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    buildSearchIndex() {
        this.searchIndex = [];
        Object.entries(this.pages).forEach(([id, page]) => {
            const text = page.content.replace(/<[^>]*>/g, ' ').toLowerCase();
            this.searchIndex.push({
                id,
                title: page.title,
                content: text,
                section: page.section
            });
        });
    }

    performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');

        if (!query.trim()) {
            resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Start typing to search...</p>';
            return;
        }

        const results = this.searchIndex.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.includes(query.toLowerCase())
        ).slice(0, 10);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No results found.</p>';
            return;
        }

        const resultHTML = results.map(result => `
            <div class="search-result" onclick="wiki.loadPageFromSearch('${result.id}')">
                <h4>${result.title}</h4>
                <p>${result.section}</p>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultHTML;
    }

    loadPageFromSearch(pageId) {
        document.getElementById('searchModal').classList.remove('active');
        this.loadPage(pageId);
    }

    initializePages() {
        this.pages = {
            'overview': {
                title: 'Overview',
                section: 'Getting Started',
                content: `
                    <div class="page-content">
                        <h1>🌟 Platform RPG Game Documentation</h1>
                        <p>Welcome to the comprehensive documentation for the Platform RPG Game - a sophisticated 2D game engine built with modern web technologies.</p>

                        <div class="feature-grid">
                            <div class="feature-card">
                                <h3>🎮 Dual-Mode Architecture</h3>
                                <p>Seamlessly switch between Development Mode for content creation and Production Mode for gameplay testing.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                            <div class="feature-card">
                                <h3>🧱 Modular System Design</h3>
                                <p>12 core systems working together through clean interfaces and event-driven communication.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                            <div class="feature-card">
                                <h3>🎨 Visual Content Editor</h3>
                                <p>Comprehensive in-game editor with 100+ props, 25+ platform textures, and advanced editing tools.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                            <div class="feature-card">
                                <h3>🌍 Multi-Scene Worlds</h3>
                                <p>Create complex game worlds with seamless scene transitions and configurable boundaries.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                            <div class="feature-card">
                                <h3>💾 Advanced Data Management</h3>
                                <p>Automatic saving, JSON export/import, and robust data validation systems.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                            <div class="feature-card">
                                <h3>📱 Responsive Design</h3>
                                <p>Adaptive viewport system supporting multiple resolutions and scaling modes.</p>
                                <span class="status-badge implemented">✓ Implemented</span>
                            </div>
                        </div>

                        <h2>🚀 What You Can Build</h2>
                        <p>This engine provides everything needed to create sophisticated 2D platformer games:</p>
                        <ul>
                            <li><strong>Rich Environments</strong> - Multi-layered scenes with detailed props and varied terrain</li>
                            <li><strong>Complex Level Design</strong> - Interconnected scenes with transition zones</li>
                            <li><strong>Interactive Worlds</strong> - Physics-based gameplay with collision detection</li>
                            <li><strong>Professional Tools</strong> - Advanced editing capabilities rivaling commercial editors</li>
                        </ul>

                        <h2>🛠️ Technologies Used</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <strong>HTML5 Canvas</strong><br>
                                <span style="color: var(--text-muted); font-size: 0.9rem;">Rendering Engine</span>
                            </div>
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <strong>Vanilla JavaScript</strong><br>
                                <span style="color: var(--text-muted); font-size: 0.9rem;">ES6+ Architecture</span>
                            </div>
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <strong>CSS3</strong><br>
                                <span style="color: var(--text-muted); font-size: 0.9rem;">Modern Styling</span>
                            </div>
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <strong>LocalStorage API</strong><br>
                                <span style="color: var(--text-muted); font-size: 0.9rem;">Data Persistence</span>
                            </div>
                        </div>

                        <blockquote>
                            💡 <strong>Pro Tip:</strong> Start with the Quick Start guide to get hands-on experience, then dive into the Architecture section to understand the system design.
                        </blockquote>
                    </div>
                `
            },
            'quick-start': {
                title: 'Quick Start Guide',
                section: 'Getting Started',
                content: `
                    <div class="page-content">
                        <h1>🚀 Quick Start Guide</h1>
                        <p>Get up and running with the Platform RPG Game in minutes. This guide will walk you through your first steps.</p>

                        <h2>📋 Prerequisites</h2>
                        <p>Before you begin, ensure you have:</p>
                        <ul>
                            <li>Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                            <li>Local web server (or live server extension)</li>
                            <li>Basic understanding of HTML/JavaScript (for customization)</li>
                        </ul>

                        <h2>🎯 Step 1: Launch the Game</h2>
                        <ol>
                            <li>Open <code>index.html</code> in your web browser</li>
                            <li>The game will load in Development Mode by default</li>
                            <li>You'll see the game canvas and the development dashboard</li>
                        </ol>

                        <h2>🎮 Step 2: Understanding the Interface</h2>
                        <h3>Development Dashboard (Right Panel)</h3>
                        <ul>
                            <li><strong>Game Settings</strong> - Switch between Development/Production modes</li>
                            <li><strong>Scene Management</strong> - Create and manage game levels</li>
                            <li><strong>Platform Editor</strong> - Add and configure terrain</li>
                            <li><strong>Props Editor</strong> - Place interactive objects and decorations</li>
                            <li><strong>Background Settings</strong> - Configure scene backgrounds</li>
                        </ul>

                        <h3>Game Canvas (Left Area)</h3>
                        <ul>
                            <li><strong>Main viewport</strong> - Where your game world is displayed</li>
                            <li><strong>Player character</strong> - Blue square that represents the player</li>
                            <li><strong>Development overlays</strong> - Visual helpers for editing</li>
                        </ul>

                        <h2>🔨 Step 3: Your First Scene</h2>
                        <h3>Add Platforms</h3>
                        <ol>
                            <li>Click <strong>"Add Platform (Click on map)"</strong> in the Platform Editor</li>
                            <li>Click anywhere on the canvas to place a platform</li>
                            <li>Select the platform and experiment with:
                                <ul>
                                    <li>Dragging to move</li>
                                    <li>Resize handles (corners and edges)</li>
                                    <li>Texture selection in the properties panel</li>
                                </ul>
                            </li>
                        </ol>

                        <h3>Add Props</h3>
                        <ol>
                            <li>In the Props Editor, select a prop type (e.g., "house")</li>
                            <li>Click on the canvas to place props</li>
                            <li>Try multi-selection with Ctrl+click</li>
                            <li>Use the grouping and z-order tools</li>
                        </ol>

                        <h2>🎬 Step 4: Test Your Scene</h2>
                        <ol>
                            <li>Switch to <strong>Production Mode</strong> in Game Settings</li>
                            <li>Use WASD keys to move the player</li>
                            <li>Press Space to jump</li>
                            <li>Test platform collisions and physics</li>
                        </ol>

                        <h2>💾 Step 5: Save Your Work</h2>
                        <ul>
                            <li><strong>Auto-save</strong> - The game automatically saves to localStorage</li>
                            <li><strong>Manual export</strong> - Use Ctrl+E or the export button to download JSON</li>
                            <li><strong>Import</strong> - Load saved game data using the import button</li>
                        </ul>

                        <h2>🎯 Next Steps</h2>
                        <div class="feature-grid">
                            <div class="feature-card">
                                <h3>📖 Study the Architecture</h3>
                                <p>Understanding the modular system design will help you extend and customize the game.</p>
                            </div>
                            <div class="feature-card">
                                <h3>🎨 Master the Editor</h3>
                                <p>Explore advanced editing features like transition zones, grouping, and scene management.</p>
                            </div>
                            <div class="feature-card">
                                <h3>🔧 Dive into Systems</h3>
                                <p>Learn about individual systems like Player, Platform, and Prop management.</p>
                            </div>
                        </div>

                        <blockquote>
                            💡 <strong>Tip:</strong> Use the keyboard shortcuts Ctrl+C and Ctrl+V to copy and paste props efficiently!
                        </blockquote>
                    </div>
                `
            },
            'architecture': {
                title: 'System Architecture',
                section: 'Getting Started',
                content: `
                    <div class="page-content">
                        <h1>🏗️ System Architecture</h1>
                        <p>The Platform RPG Game follows a sophisticated modular architecture designed for maintainability, extensibility, and performance.</p>

                        <h2>🎯 Design Principles</h2>
                        <div class="feature-grid">
                            <div class="feature-card">
                                <h3>🧩 Modular Components</h3>
                                <p>Each system is self-contained with clear interfaces, making the codebase easy to understand and maintain.</p>
                            </div>
                            <div class="feature-card">
                                <h3>🔄 Event-Driven Communication</h3>
                                <p>Systems communicate through events and callbacks, ensuring loose coupling and flexibility.</p>
                            </div>
                            <div class="feature-card">
                                <h3>📊 Data-View Separation</h3>
                                <p>Each system separates data management, rendering, and business logic for better organization.</p>
                            </div>
                            <div class="feature-card">
                                <h3>🎮 Dual-Mode Design</h3>
                                <p>Development and Production modes share the same systems but with different behaviors.</p>
                            </div>
                        </div>

                        <h2>🏛️ Core Architecture</h2>
                        <pre><code>Game (Main Orchestrator)
├── PlayerSystem          # Character control & physics
├── PlatformSystem        # Terrain & collision detection
├── PropSystem           # Interactive objects & decorations
├── SceneSystem          # Level management & transitions
├── CameraSystem         # Viewport control & following
├── InputSystem          # Keyboard, mouse, editor input
├── EditorSystem         # Development tools & UI
├── GameDataSystem       # Save/load & data persistence
├── BackgroundSystem     # Layered background rendering
├── ViewportSystem       # Resolution scaling & responsive design
├── HUDSystem           # Player stats display
└── FeedbackSystem      # User notifications</code></pre>

                        <h2>🔧 System Structure Pattern</h2>
                        <p>Most systems follow a consistent internal structure:</p>
                        <pre><code>js/[system-name]/
├── [system]Data.js      # Data models and state management
├── [system]Renderer.js  # Drawing and visualization
├── [system]Manager.js   # Business logic and coordination
├── [system]System.js    # Main system interface
└── [additional modules] # Specialized functionality</code></pre>

                        <h3>📊 Data Layer</h3>
                        <ul>
                            <li><strong>State Management</strong> - Centralized data storage for each system</li>
                            <li><strong>Data Validation</strong> - Ensures data integrity and type safety</li>
                            <li><strong>Position Calculations</strong> - Handles coordinate transformations</li>
                        </ul>

                        <h3>🎨 Rendering Layer</h3>
                        <ul>
                            <li><strong>Canvas Operations</strong> - Direct 2D context drawing</li>
                            <li><strong>Sprite Management</strong> - Texture loading and mapping</li>
                            <li><strong>Visual Effects</strong> - Particles, animations, and overlays</li>
                        </ul>

                        <h3>⚙️ Management Layer</h3>
                        <ul>
                            <li><strong>Business Logic</strong> - Core system functionality</li>
                            <li><strong>Event Handling</strong> - User interaction processing</li>
                            <li><strong>System Coordination</strong> - Cross-system communication</li>
                        </ul>

                        <h2>🔄 Data Flow</h2>
                        <pre><code>User Input → Input System → Game Systems → Data Layer
                                                      ↓
Game Loop → Update Physics → Update Camera → Render Frame
                                                      ↓
Canvas Rendering ← Visual Systems ← Transformed Data</code></pre>

                        <h2>🎮 Game Loop Architecture</h2>
                        <ol>
                            <li><strong>Delta Time Calculation</strong> - Frame-rate independent timing</li>
                            <li><strong>Input Processing</strong> - Handle user interactions</li>
                            <li><strong>Physics Updates</strong> - Player movement and collisions</li>
                            <li><strong>Camera Updates</strong> - Follow player and apply constraints</li>
                            <li><strong>Rendering Pipeline</strong> - Draw all visual elements</li>
                        </ol>

                        <h2>📡 System Communication</h2>
                        <p>Systems interact through several patterns:</p>

                        <h3>🔗 Direct References</h3>
                        <p>Core systems maintain references to each other through the main Game class.</p>

                        <h3>📢 Event Callbacks</h3>
                        <p>Systems register callbacks for specific events (sprite loading, data changes).</p>

                        <h3>🚀 Method Delegation</h3>
                        <p>The Game class provides convenience methods that delegate to appropriate systems.</p>

                        <h2>🛡️ Error Handling & Validation</h2>
                        <ul>
                            <li><strong>Data Validation</strong> - GameDataValidator ensures data integrity</li>
                            <li><strong>Graceful Degradation</strong> - Systems handle missing dependencies</li>
                            <li><strong>Debug Logging</strong> - Comprehensive console output for development</li>
                            <li><strong>Fallback Mechanisms</strong> - Default values and error recovery</li>
                        </ul>

                        <blockquote>
                            💡 <strong>Design Philosophy:</strong> The architecture prioritizes developer experience and maintainability over micro-optimizations, making it easy to understand, debug, and extend.
                        </blockquote>
                    </div>
                `
            }
            // Additional pages would continue here...
        };

        // Add remaining pages
        this.addRemainingPages();
    }

    addRemainingPages() {
        // Load additional system pages
        if (typeof additionalPages !== 'undefined') {
            Object.assign(this.pages, additionalPages);
        }

        // Editor and advanced topic pages
        this.pages['scene-system'] = {
            title: 'Scene System',
            section: 'Core Systems',
            content: `
                <div class="page-content">
                    <h1>🌍 Scene System</h1>
                    <p>The Scene System manages level creation, transitions, and world organization in the Platform RPG Game.</p>

                    <h2>🎯 Core Concepts</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🗺️ Multi-Scene Worlds</h3>
                            <p>Create complex game worlds by connecting multiple scenes with seamless transitions.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🚪 Transition Zones</h3>
                            <p>Invisible areas that transport players between scenes with configurable spawn points.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🎨 Scene Backgrounds</h3>
                            <p>Multi-layered background system supporting 5 different background types per scene.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>📐 Boundary System</h3>
                            <p>Configurable scene boundaries that constrain player movement and camera positioning.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>🛠️ Scene Management</h2>
                    <h3>Creating Scenes</h3>
                    <ol>
                        <li>Use the "Create Scene" button in the Scene Management panel</li>
                        <li>Enter scene name and description</li>
                        <li>Configure initial settings (player start position, boundaries)</li>
                        <li>Add platforms, props, and background elements</li>
                    </ol>

                    <h3>Scene Properties</h3>
                    <ul>
                        <li><strong>Name</strong> - Unique identifier for the scene</li>
                        <li><strong>Description</strong> - Optional scene description</li>
                        <li><strong>Player Start Position</strong> - Where player spawns in this scene</li>
                        <li><strong>Boundaries</strong> - Left, right, top, bottom limits</li>
                        <li><strong>Background</strong> - Selected background type and layers</li>
                        <li><strong>Transition Zones</strong> - Areas that lead to other scenes</li>
                    </ul>

                    <h2>🚪 Transition System</h2>
                    <h3>Creating Transitions</h3>
                    <ol>
                        <li>Click "Add Transition Zone" in the Scene Management panel</li>
                        <li>Drag on the canvas to create the transition area</li>
                        <li>Select destination scene from dropdown</li>
                        <li>Set player spawn coordinates in destination scene</li>
                    </ol>

                    <h3>Transition Properties</h3>
                    <ul>
                        <li><strong>Source Area</strong> - Rectangle defining the trigger zone</li>
                        <li><strong>Destination Scene</strong> - Target scene ID</li>
                        <li><strong>Spawn Position</strong> - Where player appears in destination</li>
                        <li><strong>Trigger Type</strong> - Instant or require key press</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Design Tip:</strong> Use transition zones at scene edges to create the feeling of a continuous world while keeping individual scenes manageable in size.
                    </blockquote>
                </div>
            `
        };

        this.pages['camera-system'] = {
            title: 'Camera System',
            section: 'Core Systems',
            content: `
                <div class="page-content">
                    <h1>📹 Camera System</h1>
                    <p>The Camera System provides intelligent viewport control, player following, and smooth camera transitions.</p>

                    <h2>🎮 Camera Modes</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>👤 Character Follow Mode</h3>
                            <p>Production mode camera that smoothly follows the player with intelligent boundary constraints.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🆓 Free Camera Mode</h3>
                            <p>Development mode camera allowing complete freedom to explore and edit scenes.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🎯 Smart Boundaries</h3>
                            <p>Intelligent boundary system that adapts to different screen sizes and scene dimensions.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>⚡ Smooth Transitions</h3>
                            <p>Seamless camera movement between scenes and during gameplay events.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>⚙️ Camera Controls</h2>
                    <h3>Development Mode</h3>
                    <ul>
                        <li><strong>Middle Mouse / Right Mouse</strong> - Drag to pan camera</li>
                        <li><strong>Arrow Keys</strong> - Keyboard camera movement</li>
                        <li><strong>Free Movement</strong> - No boundary restrictions</li>
                        <li><strong>Grid Snapping</strong> - Align to pixel boundaries</li>
                    </ul>

                    <h3>Production Mode</h3>
                    <ul>
                        <li><strong>Automatic Following</strong> - Camera follows player movement</li>
                        <li><strong>Predictive Movement</strong> - Camera anticipates player direction</li>
                        <li><strong>Boundary Constraints</strong> - Respects scene boundaries</li>
                        <li><strong>Smooth Interpolation</strong> - Lag-free following with smooth motion</li>
                    </ul>

                    <h2>🔧 Technical Features</h2>
                    <h3>Coordinate Transformation</h3>
                    <p>The camera system handles conversion between different coordinate spaces:</p>
                    <ul>
                        <li><strong>World Coordinates</strong> - Game object positions</li>
                        <li><strong>Screen Coordinates</strong> - Browser window positions</li>
                        <li><strong>Viewport Coordinates</strong> - Scaled game view positions</li>
                    </ul>

                    <h3>Boundary Intelligence</h3>
                    <p>Advanced boundary handling for different scenarios:</p>
                    <ul>
                        <li><strong>Scene Larger than Screen</strong> - Normal camera constraints</li>
                        <li><strong>Scene Smaller than Screen</strong> - Center scene and allow limited movement</li>
                        <li><strong>Aspect Ratio Handling</strong> - Adapt to different screen sizes</li>
                        <li><strong>Responsive Boundaries</strong> - Adjust for mobile and desktop</li>
                    </ul>

                    <h2>📐 Configuration</h2>
                    <table>
                        <tr><th>Property</th><th>Default</th><th>Description</th></tr>
                        <tr><td>followSpeed</td><td>0.1</td><td>Camera following interpolation speed</td></tr>
                        <tr><td>lookAhead</td><td>50</td><td>Predictive movement distance</td></tr>
                        <tr><td>deadZone</td><td>32</td><td>Player movement threshold before camera moves</td></tr>
                        <tr><td>maxSpeed</td><td>8</td><td>Maximum camera movement speed</td></tr>
                    </table>

                    <blockquote>
                        💡 <strong>Performance Note:</strong> The camera system uses efficient interpolation algorithms to provide smooth movement without impacting game performance.
                    </blockquote>
                </div>
            `
        };

        this.pages['input-system'] = {
            title: 'Input System',
            section: 'Core Systems',
            content: `
                <div class="page-content">
                    <h1>⌨️ Input System</h1>
                    <p>The Input System handles all user interactions including keyboard controls, mouse input, and development editor interactions.</p>

                    <h2>🎮 Input Architecture</h2>
                    <pre><code>js/input/
├── inputKeyboard.js         # WASD/Arrow key handling
├── inputMouse.js           # Click, drag, scroll interactions
├── inputEditor.js          # Development mode specific controls
├── inputSystem.js          # Main input coordinator
└── developmentInputHandler.js # Advanced editing shortcuts</code></pre>

                    <h2>⌨️ Keyboard Controls</h2>
                    <h3>Player Movement</h3>
                    <table>
                        <tr><th>Key</th><th>Development Mode</th><th>Production Mode</th></tr>
                        <tr><td>W / ↑</td><td>Move Up</td><td>Jump / Climb Up</td></tr>
                        <tr><td>A / ←</td><td>Move Left</td><td>Move Left</td></tr>
                        <tr><td>S / ↓</td><td>Move Down</td><td>Climb Down</td></tr>
                        <tr><td>D / →</td><td>Move Right</td><td>Move Right</td></tr>
                        <tr><td>Space</td><td>Speed Boost</td><td>Jump</td></tr>
                        <tr><td>Shift</td><td>Speed Boost</td><td>Run</td></tr>
                    </table>

                    <h3>Editor Shortcuts</h3>
                    <table>
                        <tr><th>Shortcut</th><th>Action</th><th>Context</th></tr>
                        <tr><td>Ctrl+C</td><td>Copy</td><td>Selected platforms/props</td></tr>
                        <tr><td>Ctrl+V</td><td>Paste</td><td>Clipboard content</td></tr>
                        <tr><td>Ctrl+S</td><td>Save</td><td>Current game state</td></tr>
                        <tr><td>Ctrl+E</td><td>Export</td><td>Download game data</td></tr>
                        <tr><td>Delete</td><td>Remove</td><td>Selected objects</td></tr>
                        <tr><td>Escape</td><td>Deselect</td><td>Clear selection</td></tr>
                    </table>

                    <h2>🖱️ Mouse Interactions</h2>
                    <h3>Object Manipulation</h3>
                    <ul>
                        <li><strong>Left Click</strong> - Select objects, place platforms/props</li>
                        <li><strong>Ctrl+Click</strong> - Multi-selection toggle</li>
                        <li><strong>Drag</strong> - Move selected objects</li>
                        <li><strong>Right Click</strong> - Context menu</li>
                        <li><strong>Middle/Right Drag</strong> - Pan camera</li>
                    </ul>

                    <h3>Platform Editing</h3>
                    <ul>
                        <li><strong>Resize Handles</strong> - Drag corners/edges to resize</li>
                        <li><strong>Snap to Grid</strong> - Automatic 10-pixel alignment</li>
                        <li><strong>Visual Feedback</strong> - Blue cursors for selectable items</li>
                    </ul>

                    <h3>Prop Editing</h3>
                    <ul>
                        <li><strong>Shift+Drag</strong> - Rotate props</li>
                        <li><strong>Selection Rectangle</strong> - Drag to select multiple props</li>
                        <li><strong>Z-order Controls</strong> - Right-click menu for layering</li>
                    </ul>

                    <h2>🎯 Context-Aware Cursors</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🔵 Blue Select Cursor</h3>
                            <p>Appears when hovering over selectable platforms and props.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>↔️ Blue Resize Cursors</h3>
                            <p>Directional resize cursors matching the platform handle being hovered.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>✋ Move Cursor</h3>
                            <p>Hand cursor for dragging objects and camera panning.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🎯 Default Cursor</h3>
                            <p>Standard arrow for general interface interactions.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>🔧 Advanced Features</h2>
                    <h3>Smart Copy/Paste</h3>
                    <p>Intelligent clipboard system with automatic positioning:</p>
                    <ul>
                        <li><strong>Offset Positioning</strong> - Pasted objects appear offset from originals</li>
                        <li><strong>Multi-object Support</strong> - Copy/paste entire selections</li>
                        <li><strong>Property Preservation</strong> - Maintains object properties and relationships</li>
                    </ul>

                    <h3>Event Delegation</h3>
                    <p>The input system efficiently routes events to appropriate handlers:</p>
                    <pre><code>// Event flow example
Mouse Click → InputMouse → PlatformMouseHandler → PlatformManager
                        → PropMouseHandler → PropManager
                        → SceneMouseHandler → SceneManager</code></pre>

                    <h2>📱 Mobile Support</h2>
                    <ul>
                        <li><strong>Touch Events</strong> - Touch interactions mapped to mouse events</li>
                        <li><strong>Gesture Support</strong> - Pinch to zoom, pan gestures</li>
                        <li><strong>Virtual Controls</strong> - On-screen buttons for mobile gameplay</li>
                        <li><strong>Responsive UI</strong> - Interface adapts to touch targets</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Accessibility Note:</strong> The input system supports keyboard-only navigation and provides visual feedback for all interactive elements.
                    </blockquote>
                </div>
            `
        };

        // Editor documentation pages
        this.pages['editor-overview'] = {
            title: 'Editor Overview',
            section: 'Game Editor',
            content: `
                <div class="page-content">
                    <h1>🛠️ Game Editor Overview</h1>
                    <p>The integrated game editor provides professional-grade tools for creating complex 2D platformer games without external software.</p>

                    <h2>🎯 Editor Philosophy</h2>
                    <p>The editor is built on the principle of <strong>"What You See Is What You Play"</strong> - every element you create in the editor appears exactly the same during gameplay.</p>

                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🔄 Real-time Preview</h3>
                            <p>Instant visual feedback as you create and modify game elements.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🎮 Integrated Testing</h3>
                            <p>Switch between editing and playing without leaving the application.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🎨 Visual Tools</h3>
                            <p>Point-and-click interface for all common game development tasks.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📊 Data Management</h3>
                            <p>Automatic saving with export/import capabilities for collaboration.</p>
                        </div>
                    </div>

                    <h2>🖥️ Interface Layout</h2>
                    <h3>Main Canvas (Left)</h3>
                    <ul>
                        <li><strong>Game Viewport</strong> - Primary editing and preview area</li>
                        <li><strong>Development Overlays</strong> - Visual helpers for editing</li>
                        <li><strong>Context Menus</strong> - Right-click tools and options</li>
                        <li><strong>Status Indicators</strong> - Coordinate display and selection info</li>
                    </ul>

                    <h3>Development Dashboard (Right)</h3>
                    <ul>
                        <li><strong>Game Settings</strong> - Mode switching and general options</li>
                        <li><strong>Scene Management</strong> - Level creation and navigation</li>
                        <li><strong>Object Editors</strong> - Platform and prop editing tools</li>
                        <li><strong>Background Controls</strong> - Scene atmosphere settings</li>
                        <li><strong>Viewport Settings</strong> - Resolution and scaling options</li>
                    </ul>

                    <h2>🎨 Content Creation Workflow</h2>
                    <h3>1. Scene Setup</h3>
                    <ol>
                        <li>Create a new scene or select existing</li>
                        <li>Configure scene properties (name, boundaries, background)</li>
                        <li>Set player start position</li>
                    </ol>

                    <h3>2. Terrain Building</h3>
                    <ol>
                        <li>Add platforms using the Platform Editor</li>
                        <li>Select appropriate textures for different areas</li>
                        <li>Arrange platforms to create interesting level geometry</li>
                    </ol>

                    <h3>3. Environment Decoration</h3>
                    <ol>
                        <li>Place props to create atmosphere and detail</li>
                        <li>Use grouping and z-ordering for complex scenes</li>
                        <li>Add interactive elements and obstacles</li>
                    </ol>

                    <h3>4. Scene Connections</h3>
                    <ol>
                        <li>Create transition zones between scenes</li>
                        <li>Set up spawn points and connections</li>
                        <li>Test scene flow in production mode</li>
                    </ol>

                    <h2>⚡ Professional Features</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🎯 Multi-Selection</h3>
                            <p>Select and manipulate multiple objects simultaneously with Ctrl+click.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>📋 Copy/Paste System</h3>
                            <p>Efficient duplication with smart positioning and property preservation.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🎭 Grouping Tools</h3>
                            <p>Organize related objects into logical groups for easier management.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>📐 Precision Tools</h3>
                            <p>Snap-to-grid, alignment guides, and precise coordinate editing.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>🔧 Advanced Editing Tools</h2>
                    <h3>🎨 Sprite Editor Integration</h3>
                    <p>External sprite browser tool for visual prop selection:</p>
                    <ul>
                        <li>Open <code>sprite-editor.html</code> for visual prop browsing</li>
                        <li>Preview all 100+ prop types with visual thumbnails</li>
                        <li>Quick reference for prop categories and names</li>
                    </ul>

                    <h3>🧱 Tile Selector Tool</h3>
                    <p>Platform texture browser for easy texture selection:</p>
                    <ul>
                        <li>Open <code>tile-selector.html</code> for texture preview</li>
                        <li>Visual grid of all 25+ platform textures</li>
                        <li>Quick copy-paste of texture names</li>
                    </ul>

                    <h2>💾 Data Management</h2>
                    <h3>Automatic Saving</h3>
                    <ul>
                        <li><strong>Auto-save</strong> - Continuous saving to localStorage</li>
                        <li><strong>Session Persistence</strong> - Work preserved between browser sessions</li>
                        <li><strong>Crash Recovery</strong> - Automatic restoration of unsaved work</li>
                    </ul>

                    <h3>Export/Import System</h3>
                    <ul>
                        <li><strong>JSON Export</strong> - Complete game data as downloadable file</li>
                        <li><strong>Selective Import</strong> - Load specific scenes or entire projects</li>
                        <li><strong>Version Control</strong> - Track project modifications</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Pro Tip:</strong> Use the dual-mode system effectively - edit in Development mode, then test immediately in Production mode to verify gameplay flow.
                    </blockquote>
                </div>
            `
        };

        // Add remaining pages for development-mode, editing-tools, data-management, etc.
        this.addTechnicalPages();
    }

    addTechnicalPages() {
        this.pages['development-mode'] = {
            title: 'Development Mode',
            section: 'Game Editor',
            content: `
                <div class="page-content">
                    <h1>🔧 Development Mode</h1>
                    <p>Development Mode provides complete access to editing tools, debugging features, and content creation capabilities.</p>

                    <h2>🎯 Mode Differences</h2>
                    <table>
                        <tr><th>Feature</th><th>Development Mode</th><th>Production Mode</th></tr>
                        <tr><td>Player Movement</td><td>Free 8-directional</td><td>Physics-based platformer</td></tr>
                        <tr><td>Dashboard</td><td>Visible editor panel</td><td>Hidden/minimal UI</td></tr>
                        <tr><td>Object Interaction</td><td>Select and edit</td><td>Collision only</td></tr>
                        <tr><td>Camera</td><td>Free camera control</td><td>Follow player</td></tr>
                        <tr><td>Debug Overlays</td><td>Visible boundaries/zones</td><td>Hidden</td></tr>
                        <tr><td>Physics</td><td>Disabled for editing</td><td>Full simulation</td></tr>
                    </table>

                    <h2>🛠️ Development Tools</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🎨 Visual Debugging</h3>
                            <p>See platform outlines, collision boundaries, transition zones, and selection indicators.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📊 Real-time Info</h3>
                            <p>Mouse coordinates, object properties, and system status displayed continuously.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🖱️ Direct Manipulation</h3>
                            <p>Click, drag, resize, and modify objects directly on the canvas.</p>
                        </div>
                        <div class="feature-card">
                            <h3>⌨️ Keyboard Shortcuts</h3>
                            <p>Professional editor shortcuts for copy, paste, save, and navigation.</p>
                        </div>
                    </div>

                    <h2>🎮 Switching Modes</h2>
                    <h3>To Production Mode</h3>
                    <ol>
                        <li>Click "Production Mode" in Game Settings</li>
                        <li>Dashboard automatically hides</li>
                        <li>Player physics activate</li>
                        <li>Editing tools disable</li>
                    </ol>

                    <h3>Back to Development</h3>
                    <ol>
                        <li>Press F1 key or click mode toggle</li>
                        <li>Dashboard reappears</li>
                        <li>Free movement restored</li>
                        <li>Editing tools re-enable</li>
                    </ol>
                </div>
            `
        };

        this.pages['technologies'] = {
            title: 'Technologies & Frameworks',
            section: 'Advanced Topics',
            content: `
                <div class="page-content">
                    <h1>💻 Technologies & Frameworks</h1>
                    <p>The Platform RPG Game is built entirely with modern web technologies, requiring no external frameworks or dependencies.</p>

                    <h2>🌐 Core Technologies</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🎨 HTML5 Canvas</h3>
                            <p>Primary rendering engine providing hardware-accelerated 2D graphics with precise pixel control.</p>
                        </div>
                        <div class="feature-card">
                            <h3>⚡ Vanilla JavaScript</h3>
                            <p>ES6+ features including classes, modules, arrow functions, and async/await for modern architecture.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🎭 CSS3</h3>
                            <p>Modern styling with flexbox, grid, animations, and custom properties for responsive design.</p>
                        </div>
                        <div class="feature-card">
                            <h3>💾 Web APIs</h3>
                            <p>LocalStorage, File API, and Canvas 2D Context for persistence and user interaction.</p>
                        </div>
                    </div>

                    <h2>🏗️ Architectural Patterns</h2>
                    <h3>Object-Oriented Design</h3>
                    <ul>
                        <li><strong>ES6 Classes</strong> - Modern class syntax for clean inheritance</li>
                        <li><strong>Encapsulation</strong> - Private methods and data protection</li>
                        <li><strong>Polymorphism</strong> - Consistent interfaces across systems</li>
                        <li><strong>Composition</strong> - System collaboration over inheritance</li>
                    </ul>

                    <h3>Module Pattern</h3>
                    <ul>
                        <li><strong>System Separation</strong> - Each major feature in its own module</li>
                        <li><strong>Clear Interfaces</strong> - Well-defined public APIs</li>
                        <li><strong>Dependency Injection</strong> - Flexible system connections</li>
                        <li><strong>Lazy Loading</strong> - Resources loaded on demand</li>
                    </ul>

                    <h2>🎮 Game Engine Architecture</h2>
                    <h3>Component-Entity-System Pattern</h3>
                    <p>Game objects are composed of data components with systems providing behavior:</p>
                    <pre><code>// Entity examples
Platform = { position, size, texture, collision }
Prop = { position, scale, rotation, sprite, zOrder }
Player = { position, velocity, health, animation }</code></pre>

                    <h3>Event-Driven Communication</h3>
                    <p>Systems communicate through callbacks and event dispatching:</p>
                    <pre><code>// Event flow example
spriteLoader.onComplete(() => {
    platformSystem.initializeTextures();
    propSystem.initializeSprites();
    gameDataSystem.loadSavedData();
});</code></pre>

                    <h2>🎨 Rendering Technology</h2>
                    <h3>Canvas 2D Rendering</h3>
                    <ul>
                        <li><strong>Immediate Mode</strong> - Direct drawing commands each frame</li>
                        <li><strong>Layered Rendering</strong> - Background, game objects, UI layers</li>
                        <li><strong>Sprite Batching</strong> - Efficient texture atlas rendering</li>
                        <li><strong>Transform Stack</strong> - Nested coordinate transformations</li>
                    </ul>

                    <h3>Performance Optimizations</h3>
                    <ul>
                        <li><strong>Object Pooling</strong> - Reuse particle and effect objects</li>
                        <li><strong>Dirty Rectangle</strong> - Only redraw changed areas</li>
                        <li><strong>Spatial Partitioning</strong> - Efficient collision detection</li>
                        <li><strong>Frame Rate Independence</strong> - Delta-time calculations</li>
                    </ul>

                    <h2>💾 Data Persistence</h2>
                    <h3>LocalStorage Strategy</h3>
                    <ul>
                        <li><strong>JSON Serialization</strong> - Human-readable data format</li>
                        <li><strong>Incremental Saves</strong> - Save only changed data</li>
                        <li><strong>Backup System</strong> - Multiple save slots for recovery</li>
                        <li><strong>Compression</strong> - Minimize storage footprint</li>
                    </ul>

                    <h3>File I/O System</h3>
                    <ul>
                        <li><strong>JSON Export</strong> - Download complete game data</li>
                        <li><strong>Drag & Drop Import</strong> - Easy file loading</li>
                        <li><strong>Data Validation</strong> - Ensure file integrity</li>
                        <li><strong>Version Migration</strong> - Handle format changes</li>
                    </ul>

                    <h2>📱 Cross-Platform Support</h2>
                    <h3>Responsive Design</h3>
                    <ul>
                        <li><strong>Viewport Scaling</strong> - Adapt to any screen size</li>
                        <li><strong>Touch Events</strong> - Mobile-friendly interactions</li>
                        <li><strong>CSS Grid/Flexbox</strong> - Flexible UI layouts</li>
                        <li><strong>Media Queries</strong> - Device-specific styling</li>
                    </ul>

                    <h3>Browser Compatibility</h3>
                    <ul>
                        <li><strong>Modern Browsers</strong> - Chrome 60+, Firefox 55+, Safari 12+</li>
                        <li><strong>Feature Detection</strong> - Graceful degradation</li>
                        <li><strong>Polyfills</strong> - Minimal compatibility shims</li>
                        <li><strong>Progressive Enhancement</strong> - Core features always work</li>
                    </ul>

                    <h2>🔧 Development Tools</h2>
                    <h3>Built-in Debugging</h3>
                    <ul>
                        <li><strong>Console Logging</strong> - Detailed system information</li>
                        <li><strong>Visual Debug Overlays</strong> - Collision bounds, coordinates</li>
                        <li><strong>Performance Monitoring</strong> - FPS and memory tracking</li>
                        <li><strong>State Inspection</strong> - Real-time object properties</li>
                    </ul>

                    <h3>External Tools Integration</h3>
                    <ul>
                        <li><strong>Browser DevTools</strong> - Standard debugging workflow</li>
                        <li><strong>Sprite Editors</strong> - Visual asset management tools</li>
                        <li><strong>JSON Validators</strong> - Data integrity checking</li>
                        <li><strong>Image Editors</strong> - Asset creation pipeline</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Technology Choice:</strong> Using vanilla JavaScript ensures the game remains lightweight, fast, and free from external dependencies while providing maximum learning value.
                    </blockquote>
                </div>
            `
        };

        // Add remaining technical pages
        this.pages['api-reference'] = {
            title: 'API Reference',
            section: 'Reference',
            content: `
                <div class="page-content">
                    <h1>📚 API Reference</h1>
                    <p>Complete reference for the Platform RPG Game's JavaScript APIs and extension points.</p>

                    <h2>🎮 Game Class</h2>
                    <p>Main game orchestrator that coordinates all systems.</p>

                    <h3>Constructor</h3>
                    <pre><code>const game = new PlatformRPG();</code></pre>

                    <h3>Key Methods</h3>
                    <table>
                        <tr><th>Method</th><th>Parameters</th><th>Description</th></tr>
                        <tr><td>setDevelopmentMode()</td><td>boolean</td><td>Switch between development and production modes</td></tr>
                        <tr><td>loadBackground()</td><td>string</td><td>Load a background by name</td></tr>
                        <tr><td>saveCurrentData()</td><td>none</td><td>Save current game state to localStorage</td></tr>
                        <tr><td>exportGameData()</td><td>none</td><td>Download game data as JSON file</td></tr>
                    </table>

                    <h2>🧱 Platform System API</h2>
                    <h3>Adding Platforms</h3>
                    <pre><code>const platform = {
    x: 100,
    y: 200,
    width: 200,
    height: 20,
    spriteType: 'grass'
};
game.platformSystem.addPlatform(platform);</code></pre>

                    <h3>Platform Properties</h3>
                    <table>
                        <tr><th>Property</th><th>Type</th><th>Description</th></tr>
                        <tr><td>id</td><td>number</td><td>Unique platform identifier</td></tr>
                        <tr><td>x, y</td><td>number</td><td>Position coordinates</td></tr>
                        <tr><td>width, height</td><td>number</td><td>Platform dimensions</td></tr>
                        <tr><td>spriteType</td><td>string</td><td>Texture type name</td></tr>
                        <tr><td>positioning</td><td>string</td><td>'absolute' or 'screen-relative'</td></tr>
                    </table>

                    <h2>🎯 Prop System API</h2>
                    <h3>Adding Props</h3>
                    <pre><code>const prop = {
    type: 'house',
    x: 150,
    y: 180,
    scale: 1.0,
    zOrder: 1
};
game.propSystem.addProp(prop);</code></pre>

                    <h3>Prop Manipulation</h3>
                    <pre><code>// Select props
game.propSystem.selectProp(propId);
game.propSystem.selectMultiple([id1, id2, id3]);

// Group operations
game.propSystem.groupSelected();
game.propSystem.ungroupSelected();

// Z-order control
game.propSystem.sendToBack(propId);
game.propSystem.bringToFront(propId);</code></pre>

                    <h2>🌍 Scene System API</h2>
                    <h3>Scene Management</h3>
                    <pre><code>// Create new scene
const sceneData = {
    name: 'Forest Level',
    description: 'Dense forest area',
    settings: {
        playerStartX: 100,
        playerStartY: 200
    }
};
game.sceneSystem.createScene(sceneData);

// Switch scenes
game.sceneSystem.loadScene(sceneId);

// Add transition zone
game.sceneSystem.addTransitionZone({
    x: 200, y: 100, width: 50, height: 100,
    targetScene: 'forestLevel',
    spawnX: 50, spawnY: 150
});</code></pre>

                    <h2>🎨 Extending the System</h2>
                    <h3>Custom Prop Types</h3>
                    <pre><code>// Add new prop type
game.propSystem.propTypes.customProp = {
    name: 'Custom Prop',
    width: 32,
    height: 48,
    spriteX: 0,
    spriteY: 0,
    category: 'custom'
};</code></pre>

                    <h3>Custom Platform Textures</h3>
                    <pre><code>// Add new platform texture
game.platformSystem.renderer.platformSpriteTypes.customTexture = {
    tileset: 'tileset',
    tileX: 10,
    tileY: 5
};</code></pre>

                    <h3>Event Hooks</h3>
                    <pre><code>// Listen for system events
game.platformSystem.onPlatformAdded = (platform) => {
    console.log('Platform added:', platform);
};

game.sceneSystem.onSceneChanged = (newScene) => {
    console.log('Scene changed to:', newScene.name);
};</code></pre>

                    <blockquote>
                        💡 <strong>Extension Pattern:</strong> The system is designed to be easily extended through configuration objects and event hooks rather than modifying core code.
                    </blockquote>
                </div>
            `
        };

        this.pages['editing-tools'] = {
            title: 'Editing Tools',
            section: 'Game Editor',
            content: `
                <div class="page-content">
                    <h1>🎨 Editing Tools</h1>
                    <p>Comprehensive editing tools for creating and modifying game content in Development Mode.</p>

                    <h2>🖱️ Mouse Tools</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🎯 Selection Tool</h3>
                            <p>Click objects to select, view properties, and prepare for editing operations.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>📐 Drag & Drop</h3>
                            <p>Drag selected objects to reposition them anywhere on the canvas.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🔄 Resize Handles</h3>
                            <p>Visual resize handles appear on selected platforms for precise size adjustment.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🎨 Visual Feedback</h3>
                            <p>Selected objects highlight with colored outlines and control handles.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <table>
                        <tr><th>Shortcut</th><th>Action</th><th>Context</th></tr>
                        <tr><td>Ctrl+S</td><td>Save game data</td><td>Global</td></tr>
                        <tr><td>Ctrl+C</td><td>Copy selected object</td><td>Object selected</td></tr>
                        <tr><td>Ctrl+V</td><td>Paste copied object</td><td>After copy</td></tr>
                        <tr><td>Delete</td><td>Remove selected object</td><td>Object selected</td></tr>
                        <tr><td>F1</td><td>Toggle Development/Production</td><td>Global</td></tr>
                        <tr><td>F2</td><td>Toggle free camera mode</td><td>Development mode</td></tr>
                        <tr><td>Arrow Keys</td><td>Move player/camera</td><td>Context dependent</td></tr>
                    </table>

                    <h2>🛠️ Creation Tools</h2>
                    <h3>Platform Creation</h3>
                    <ol>
                        <li>Open Dashboard → Platforms tab</li>
                        <li>Click "Add Platform" button</li>
                        <li>Platform appears at mouse position</li>
                        <li>Drag to desired location</li>
                        <li>Resize using corner handles</li>
                        <li>Configure properties in Properties panel</li>
                    </ol>

                    <h3>Prop Placement</h3>
                    <ol>
                        <li>Open Dashboard → Props tab</li>
                        <li>Select prop type from available options</li>
                        <li>Click canvas to place prop</li>
                        <li>Fine-tune position by dragging</li>
                        <li>Adjust properties in Properties panel</li>
                    </ol>

                    <h2>📊 Properties Panel</h2>
                    <p>The Properties panel provides detailed control over selected objects:</p>
                    <ul>
                        <li><strong>Position</strong> - Precise X/Y coordinate control</li>
                        <li><strong>Dimensions</strong> - Width and height values</li>
                        <li><strong>Appearance</strong> - Colors, textures, and visual style</li>
                        <li><strong>Behavior</strong> - Collision settings, animations, interactions</li>
                        <li><strong>Metadata</strong> - Names, tags, and custom properties</li>
                    </ul>

                    <h2>🔍 Debug Visualizations</h2>
                    <p>Development mode provides several visual debugging aids:</p>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🔲 Object Outlines</h3>
                            <p>Visible boundaries for all platforms, props, and interactive objects.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🎯 Selection Indicators</h3>
                            <p>Highlighted selected objects with resize handles and move indicators.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📍 Coordinate Display</h3>
                            <p>Real-time mouse coordinates and object position information.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🌊 Transition Zones</h3>
                            <p>Visual representation of scene transition areas and triggers.</p>
                        </div>
                    </div>

                    <h2>💾 Save & Export</h2>
                    <p>Multiple options for preserving your work:</p>
                    <ul>
                        <li><strong>Auto-save</strong> - Continuous saving to browser localStorage</li>
                        <li><strong>Manual Save (Ctrl+S)</strong> - Explicit save trigger</li>
                        <li><strong>Export JSON</strong> - Download complete game data as file</li>
                        <li><strong>Import Data</strong> - Load previously exported game files</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Pro Tip:</strong> Use the combination of visual selection and keyboard shortcuts for maximum editing efficiency. The Properties panel updates in real-time as you modify objects.
                    </blockquote>
                </div>
            `
        };

        this.pages['data-management'] = {
            title: 'Data Management',
            section: 'Game Editor',
            content: `
                <div class="page-content">
                    <h1>💾 Data Management</h1>
                    <p>Comprehensive data persistence, import/export, and backup systems for your game content.</p>

                    <h2>🔄 Save System</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🔁 Auto-Save</h3>
                            <p>Continuous background saving ensures no work is lost during editing sessions.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>⌨️ Manual Save</h3>
                            <p>Ctrl+S triggers immediate save with visual confirmation feedback.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>🏪 LocalStorage</h3>
                            <p>Browser-based persistence keeps data available across sessions.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                        <div class="feature-card">
                            <h3>📱 Cross-Session</h3>
                            <p>Data persists between browser sessions and page refreshes.</p>
                            <span class="status-badge implemented">✓ Implemented</span>
                        </div>
                    </div>

                    <h2>📤 Export System</h2>
                    <h3>JSON Export</h3>
                    <ul>
                        <li>Complete game data in structured JSON format</li>
                        <li>Platform definitions with positions and properties</li>
                        <li>Prop placements and configurations</li>
                        <li>Scene data and transition zones</li>
                        <li>Player spawn points and game settings</li>
                    </ul>

                    <h3>Export Process</h3>
                    <ol>
                        <li>Click "Export Data" in Game Settings</li>
                        <li>Browser downloads JSON file automatically</li>
                        <li>File named with timestamp for easy identification</li>
                        <li>Data includes complete game state</li>
                    </ol>

                    <h2>📥 Import System</h2>
                    <h3>File Import</h3>
                    <ul>
                        <li>Upload previously exported JSON files</li>
                        <li>Automatic validation of data structure</li>
                        <li>Graceful error handling for corrupted files</li>
                        <li>Immediate application of imported data</li>
                    </ul>

                    <h3>Import Process</h3>
                    <ol>
                        <li>Click "Import Data" in Game Settings</li>
                        <li>Select JSON file from your computer</li>
                        <li>System validates file format</li>
                        <li>Data loads immediately if valid</li>
                        <li>Error message displayed if file is corrupted</li>
                    </ol>

                    <h2>🗂️ Data Structure</h2>
                    <pre><code>{
  "gameData": {
    "platforms": [
      {
        "x": 100,
        "y": 200,
        "width": 200,
        "height": 32,
        "color": "#8B4513",
        "type": "solid"
      }
    ],
    "props": [
      {
        "x": 150,
        "y": 180,
        "type": "tree",
        "scale": 1.0,
        "properties": {}
      }
    ],
    "scenes": [
      {
        "name": "level1",
        "background": "forest",
        "spawnPoint": { "x": 50, "y": 100 }
      }
    ],
    "settings": {
      "developmentMode": true,
      "debugMode": false
    }
  }
}</code></pre>

                    <h2>🔐 Data Safety</h2>
                    <h3>Backup Strategy</h3>
                    <ul>
                        <li><strong>Regular Exports</strong> - Export data frequently to files</li>
                        <li><strong>Version Control</strong> - Keep multiple versions of your game</li>
                        <li><strong>Cloud Storage</strong> - Store export files in cloud services</li>
                        <li><strong>Local Backups</strong> - Keep copies on multiple devices</li>
                    </ul>

                    <h3>Recovery Options</h3>
                    <ul>
                        <li><strong>Browser Recovery</strong> - LocalStorage survives browser restarts</li>
                        <li><strong>File Recovery</strong> - Import from previously exported files</li>
                        <li><strong>Partial Recovery</strong> - Manual reconstruction from memory</li>
                    </ul>

                    <h2>⚠️ Data Limitations</h2>
                    <ul>
                        <li><strong>Browser Storage</strong> - Limited by browser localStorage quotas (~5-10MB)</li>
                        <li><strong>Clearing Data</strong> - Browser cache clearing removes saved games</li>
                        <li><strong>Private Browsing</strong> - Data not persisted in incognito mode</li>
                        <li><strong>Cross-Browser</strong> - Data doesn't transfer between different browsers</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Best Practice:</strong> Export your game data regularly, especially before making major changes. Keep multiple backup files with descriptive names and dates.
                    </blockquote>
                </div>
            `
        };

        this.pages['rendering-pipeline'] = {
            title: 'Rendering Pipeline',
            section: 'Advanced Topics',
            content: `
                <div class="page-content">
                    <h1>🎭 Rendering Pipeline</h1>
                    <p>Understanding the Canvas 2D rendering system that powers the Platform RPG Game's graphics.</p>

                    <h2>🖼️ Rendering Architecture</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🎨 Canvas Context</h3>
                            <p>Single HTML5 Canvas element with 2D rendering context for all graphics operations.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🔄 Frame Loop</h3>
                            <p>RequestAnimationFrame-based game loop for smooth 60fps rendering performance.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📐 Coordinate System</h3>
                            <p>Standard 2D coordinate system with origin at top-left corner of canvas.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🎭 Layered Rendering</h3>
                            <p>Multiple rendering passes for backgrounds, objects, UI, and debug overlays.</p>
                        </div>
                    </div>

                    <h2>🔄 Render Cycle</h2>
                    <ol>
                        <li><strong>Clear Canvas</strong> - Clear previous frame contents</li>
                        <li><strong>Background</strong> - Render scene backgrounds and environments</li>
                        <li><strong>Platform System</strong> - Draw all platform objects</li>
                        <li><strong>Prop System</strong> - Render environmental props and decorations</li>
                        <li><strong>Player System</strong> - Draw player character with animations</li>
                        <li><strong>UI System</strong> - Render HUD, dashboard, and interface elements</li>
                        <li><strong>Debug Layer</strong> - Draw debug information and overlays (dev mode)</li>
                    </ol>

                    <h2>🎨 Drawing Methods</h2>
                    <h3>Platform Rendering</h3>
                    <pre><code>// Basic rectangle drawing
ctx.fillStyle = platform.color;
ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

// With rounded corners
ctx.roundRect(x, y, width, height, cornerRadius);
ctx.fill();</code></pre>

                    <h3>Sprite Rendering</h3>
                    <pre><code>// Draw player sprite with animation frame
ctx.drawImage(
    spriteSheet,
    frameX, frameY, frameWidth, frameHeight,  // Source
    player.x, player.y, player.width, player.height  // Destination
);</code></pre>

                    <h2>⚡ Performance Optimizations</h2>
                    <ul>
                        <li><strong>Dirty Rectangle</strong> - Only redraw changed areas when possible</li>
                        <li><strong>Object Culling</strong> - Skip rendering objects outside viewport</li>
                        <li><strong>Batch Operations</strong> - Group similar drawing calls together</li>
                        <li><strong>Context State</strong> - Minimize context state changes</li>
                    </ul>
                </div>
            `
        };

        this.pages['game-loop'] = {
            title: 'Game Loop',
            section: 'Advanced Topics',
            content: `
                <div class="page-content">
                    <h1>🔄 Game Loop</h1>
                    <p>The core game loop architecture that drives all game systems and maintains smooth performance.</p>

                    <h2>⏱️ Loop Structure</h2>
                    <pre><code>function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update all systems
    inputSystem.update(deltaTime);
    playerSystem.update(deltaTime);
    platformSystem.update(deltaTime);
    propSystem.update(deltaTime);
    sceneSystem.update(deltaTime);

    // Render everything
    renderSystem.render();

    // Request next frame
    requestAnimationFrame(gameLoop);
}</code></pre>

                    <h2>🎮 System Updates</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>📥 Input Processing</h3>
                            <p>Handle keyboard and mouse input, update input state buffers.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🏃 Player Updates</h3>
                            <p>Process player movement, physics, animations, and state changes.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🌍 Scene Management</h3>
                            <p>Update active scene, handle transitions, and manage object states.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📹 Camera System</h3>
                            <p>Update camera position, handle following logic, and viewport calculations.</p>
                        </div>
                    </div>

                    <h2>⏰ Timing & Frame Rate</h2>
                    <h3>RequestAnimationFrame</h3>
                    <ul>
                        <li>Browser-optimized frame timing (~60fps)</li>
                        <li>Automatic pause when tab is not visible</li>
                        <li>Synchronized with display refresh rate</li>
                        <li>Better performance than setTimeout/setInterval</li>
                    </ul>

                    <h3>Delta Time</h3>
                    <ul>
                        <li>Frame-rate independent movement calculations</li>
                        <li>Consistent gameplay speed across different devices</li>
                        <li>Smooth animation interpolation</li>
                        <li>Handles frame rate drops gracefully</li>
                    </ul>

                    <h2>🎯 Mode-Specific Behavior</h2>
                    <h3>Development Mode</h3>
                    <ul>
                        <li>Additional debug update passes</li>
                        <li>Real-time property monitoring</li>
                        <li>Visual debugging overlays</li>
                        <li>Mouse interaction processing</li>
                    </ul>

                    <h3>Production Mode</h3>
                    <ul>
                        <li>Optimized update cycles</li>
                        <li>Physics simulation active</li>
                        <li>Collision detection enabled</li>
                        <li>Minimal debugging overhead</li>
                    </ul>
                </div>
            `
        };

        this.pages['extending'] = {
            title: 'Extending the Game',
            section: 'Advanced Topics',
            content: `
                <div class="page-content">
                    <h1>🔌 Extending the Game</h1>
                    <p>Learn how to add new features, systems, and content to the Platform RPG Game engine.</p>

                    <h2>🧩 Adding New Systems</h2>
                    <h3>System Template</h3>
                    <pre><code>class NewGameSystem {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        this.data = [];
    }

    initialize() {
        // Setup system-specific initialization
        this.initialized = true;
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Update system logic
        this.data.forEach(item => {
            // Process each item
        });
    }

    render(ctx, camera) {
        if (!this.initialized) return;

        // Render system objects
        this.data.forEach(item => {
            // Draw each item
        });
    }

    // Public API methods
    addItem(properties) { /* ... */ }
    removeItem(id) { /* ... */ }
    getItems() { return this.data; }
}</code></pre>

                    <h2>🎨 Adding New Prop Types</h2>
                    <h3>Prop Definition</h3>
                    <pre><code>// In propData.js, add new prop type
const newPropType = {
    type: 'custom_prop',
    name: 'Custom Prop',
    defaultProperties: {
        width: 32,
        height: 32,
        color: '#FF6B35',
        interactive: true,
        animation: 'idle'
    },

    // Rendering method
    render(ctx, prop, camera) {
        ctx.fillStyle = prop.color;
        ctx.fillRect(
            prop.x - camera.x,
            prop.y - camera.y,
            prop.width,
            prop.height
        );
    },

    // Update behavior
    update(prop, deltaTime) {
        // Custom update logic
    }
};</code></pre>

                    <h2>🎭 Custom Animations</h2>
                    <h3>Animation System</h3>
                    <pre><code>const customAnimation = {
    name: 'custom_anim',
    frames: [
        { x: 0, y: 0, width: 32, height: 32 },
        { x: 32, y: 0, width: 32, height: 32 },
        { x: 64, y: 0, width: 32, height: 32 }
    ],
    duration: 1000,  // 1 second total
    loop: true
};</code></pre>

                    <h2>🌍 Scene Templates</h2>
                    <h3>Custom Scene</h3>
                    <pre><code>const customScene = {
    name: 'custom_level',
    background: 'custom_bg',
    spawnPoint: { x: 100, y: 300 },

    // Scene-specific platforms
    platforms: [
        { x: 50, y: 350, width: 200, height: 32, color: '#8B4513' }
    ],

    // Scene-specific props
    props: [
        { x: 150, y: 320, type: 'tree', scale: 1.2 }
    ],

    // Custom scene behavior
    onEnter() {
        // Called when scene loads
    },

    onExit() {
        // Called when leaving scene
    }
};</code></pre>

                    <h2>🔧 Dashboard Extensions</h2>
                    <h3>Adding New Tabs</h3>
                    <pre><code>// Add to dashboard system
const newTab = {
    id: 'custom_tab',
    title: 'Custom Tools',
    icon: '🔧',

    render(container) {
        container.innerHTML = \`
            &lt;div class="tab-content"&gt;
                &lt;h3&gt;Custom Tools&lt;/h3&gt;
                &lt;button onclick="customFunction()"&gt;Custom Action&lt;/button&gt;
            &lt;/div&gt;
        \`;
    }
};</code></pre>

                    <h2>📡 Event System Integration</h2>
                    <h3>Custom Events</h3>
                    <pre><code>// Emit custom events
game.eventSystem.emit('custom_event', {
    data: 'custom_data',
    timestamp: Date.now()
});

// Listen for events
game.eventSystem.on('custom_event', (eventData) => {
    console.log('Custom event received:', eventData);
});</code></pre>

                    <h2>💾 Data Persistence</h2>
                    <h3>Custom Data Saving</h3>
                    <pre><code>// Extend save system
const originalSaveData = game.saveCurrentData;
game.saveCurrentData = function() {
    const data = originalSaveData.call(this);

    // Add custom data
    data.customSystem = {
        customProperty: this.customSystem.getValue(),
        customArray: this.customSystem.getArray()
    };

    return data;
};</code></pre>

                    <h2>🎮 Input Extensions</h2>
                    <h3>Custom Controls</h3>
                    <pre><code>// Add custom key bindings
game.inputSystem.addKeyBinding('KeyR', () => {
    // Custom action for R key
    game.customSystem.performAction();
});

// Mouse event extensions
game.inputSystem.onMouseClick((x, y, button) => {
    if (button === 2) { // Right click
        // Custom right-click behavior
        game.contextMenu.show(x, y);
    }
});</code></pre>

                    <blockquote>
                        💡 <strong>Extension Philosophy:</strong> The game is designed for extensibility through composition rather than modification. Always add new features as separate systems that integrate with existing ones.
                    </blockquote>
                </div>
            `
        };

        this.pages['troubleshooting'] = {
            title: 'Troubleshooting',
            section: 'Reference',
            content: `
                <div class="page-content">
                    <h1>🔍 Troubleshooting</h1>
                    <p>Common issues and solutions for the Platform RPG Game engine.</p>

                    <h2>🚫 Common Issues</h2>
                    <div class="feature-grid">
                        <div class="feature-card error">
                            <h3>❌ Game Won't Load</h3>
                            <p>Check browser console for JavaScript errors. Ensure all files are properly loaded.</p>
                        </div>
                        <div class="feature-card error">
                            <h3>🐌 Poor Performance</h3>
                            <p>Try reducing debug mode features or clearing browser cache.</p>
                        </div>
                        <div class="feature-card error">
                            <h3>💾 Save Data Lost</h3>
                            <p>Check if localStorage is enabled and not full. Private browsing prevents saving.</p>
                        </div>
                        <div class="feature-card error">
                            <h3>🎮 Controls Not Working</h3>
                            <p>Ensure canvas element has focus. Click on the game area first.</p>
                        </div>
                    </div>

                    <h2>🔧 Debug Tools</h2>
                    <h3>Browser Console</h3>
                    <pre><code>// Check game state
console.log(game);
console.log(game.playerSystem.getPlayerData());
console.log(game.platformSystem.platforms);

// Toggle debug modes
game.debugMode = true;
game.setDevelopmentMode(true);</code></pre>

                    <h3>Performance Monitoring</h3>
                    <pre><code>// Monitor frame rate
let frameCount = 0;
setInterval(() => {
    console.log('FPS:', frameCount);
    frameCount = 0;
}, 1000);

// In game loop
frameCount++;</code></pre>

                    <h2>⚠️ Browser Compatibility</h2>
                    <table>
                        <tr><th>Browser</th><th>Minimum Version</th><th>Known Issues</th></tr>
                        <tr><td>Chrome</td><td>60+</td><td>None</td></tr>
                        <tr><td>Firefox</td><td>55+</td><td>None</td></tr>
                        <tr><td>Safari</td><td>12+</td><td>Some ES6 features limited</td></tr>
                        <tr><td>Edge</td><td>79+</td><td>None</td></tr>
                    </table>

                    <h2>📱 Mobile Issues</h2>
                    <ul>
                        <li><strong>Touch Controls</strong> - Limited mobile support, keyboard required</li>
                        <li><strong>Performance</strong> - May run slowly on older mobile devices</li>
                        <li><strong>Screen Size</strong> - Designed for desktop/tablet screens</li>
                    </ul>

                    <h2>🛠️ Quick Fixes</h2>
                    <h3>Reset Game Data</h3>
                    <pre><code>// Clear all save data
localStorage.removeItem('gameData');
location.reload();</code></pre>

                    <h3>Force Reload Assets</h3>
                    <pre><code>// Hard refresh to reload all files
location.reload(true);
// or Ctrl+Shift+R</code></pre>
                </div>
            `
        };

        this.pages['contributing'] = {
            title: 'Contributing',
            section: 'Reference',
            content: `
                <div class="page-content">
                    <h1>🤝 Contributing</h1>
                    <p>Guidelines for contributing to the Platform RPG Game project.</p>

                    <h2>🎯 How to Contribute</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>🐛 Bug Reports</h3>
                            <p>Report issues with detailed reproduction steps and browser information.</p>
                        </div>
                        <div class="feature-card">
                            <h3>✨ Feature Requests</h3>
                            <p>Suggest new features that align with the project's modular architecture.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📝 Documentation</h3>
                            <p>Improve documentation, add examples, or fix typos.</p>
                        </div>
                        <div class="feature-card">
                            <h3>💻 Code Contributions</h3>
                            <p>Submit pull requests with new features or bug fixes.</p>
                        </div>
                    </div>

                    <h2>🏗️ Development Setup</h2>
                    <ol>
                        <li>Clone or download the project files</li>
                        <li>Open index.html in a modern web browser</li>
                        <li>Enable browser developer tools</li>
                        <li>Make changes to JavaScript/CSS files</li>
                        <li>Test changes in both Development and Production modes</li>
                    </ol>

                    <h2>📋 Coding Standards</h2>
                    <h3>JavaScript Style</h3>
                    <ul>
                        <li><strong>ES6+ Features</strong> - Use modern JavaScript syntax</li>
                        <li><strong>Class-based OOP</strong> - Follow existing class patterns</li>
                        <li><strong>Consistent Naming</strong> - camelCase for variables and methods</li>
                        <li><strong>Clear Comments</strong> - Document complex logic</li>
                    </ul>

                    <h3>System Design</h3>
                    <ul>
                        <li><strong>Modular Architecture</strong> - Keep systems separate and focused</li>
                        <li><strong>Event-driven Communication</strong> - Use events for system interaction</li>
                        <li><strong>Configuration over Code</strong> - Make features configurable</li>
                        <li><strong>Backwards Compatibility</strong> - Don't break existing save files</li>
                    </ul>

                    <h2>🧪 Testing Guidelines</h2>
                    <h3>Manual Testing</h3>
                    <ul>
                        <li>Test in both Development and Production modes</li>
                        <li>Verify saving/loading functionality works</li>
                        <li>Check performance with many objects</li>
                        <li>Test on different screen sizes</li>
                    </ul>

                    <h3>Browser Testing</h3>
                    <ul>
                        <li>Chrome/Edge (Chromium-based)</li>
                        <li>Firefox</li>
                        <li>Safari (if available)</li>
                    </ul>

                    <h2>📦 Submitting Changes</h2>
                    <h3>Before Submitting</h3>
                    <ul>
                        <li>Test your changes thoroughly</li>
                        <li>Update documentation if needed</li>
                        <li>Follow the existing code style</li>
                        <li>Keep changes focused and atomic</li>
                    </ul>

                    <h3>Change Description</h3>
                    <ul>
                        <li>Describe what the change does</li>
                        <li>Explain why the change is needed</li>
                        <li>List any breaking changes</li>
                        <li>Include screenshots for UI changes</li>
                    </ul>

                    <h2>🎨 Asset Contributions</h2>
                    <h3>Sprites & Graphics</h3>
                    <ul>
                        <li>Use consistent pixel art style</li>
                        <li>Provide multiple sizes if needed</li>
                        <li>Include source files when possible</li>
                        <li>Respect copyright and licensing</li>
                    </ul>

                    <blockquote>
                        💡 <strong>Community:</strong> This project welcomes contributions from developers of all skill levels. Start small and work your way up to larger features!
                    </blockquote>
                </div>
            `
        };

        // Integrate additional pages from systems.js if available
        if (typeof additionalPages !== 'undefined') {
            Object.assign(this.pages, additionalPages);
        }
    }
}

// Initialize the wiki when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wiki = new WikiApp();
});

// Add CSS for search results
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-result {
        padding: var(--spacing-md);
        border-radius: var(--border-radius-md);
        background: var(--bg-elevated);
        margin-bottom: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid var(--bg-tertiary);
    }

    .search-result:hover {
        background: var(--bg-surface);
        border-color: var(--accent-blue);
        transform: translateY(-1px);
    }

    .search-result h4 {
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 1rem;
    }

    .search-result p {
        color: var(--text-muted);
        margin: 0;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(searchStyles);