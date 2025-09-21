class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Make canvas focusable for key events
        this.canvas.tabIndex = 0;
        this.isDevelopmentMode = true;
        this.showDashboard = true;

        // Use viewport height for consistent sizing across browsers
        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;

        // Delta time tracking for frame-rate independent animations
        this.lastTime = 0;
        this.deltaTime = 0;

        this.player = {
            x: 100,
            y: 400,
            width: 44,  // 35 * 1.25 = 43.75, rounded to 44
            height: 59, // 47 * 1.25 = 58.75, rounded to 59
            velocityX: 0,
            velocityY: 0,
            speed: 5.5,
            jumpPower: -14,
            onGround: false,
            color: '#FF6B6B',
            lastValidPosition: { x: 100, y: 400 }, // Track last known good position
            facing: 'right',
            currentAnimation: 'idle',
            frameIndex: 0,
            frameTimer: 0,
            frameRate: 150, // milliseconds per frame (was 6 frames @ 60fps = 100ms)
            isAttacking: false,
            attackTimer: 0,
            attackDuration: 545,
            spaceKeyPressed: false
        };

        this.sprites = {
            idle: { image: null, frames: 6, frameWidth: 100, frameHeight: 100 },
            walk: { image: null, frames: 8, frameWidth: 100, frameHeight: 100 },
            attack: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            hurt: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            death: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 }
        };

        this.spritesLoaded = false;
        this.loadSprites();

        // Platform sprites
        this.platformSprites = {
            tileset: { image: null, tileWidth: 16, tileHeight: 16 },
            villageProps: { image: null, tileWidth: 32, tileHeight: 32 },
            torchFlame: { image: null, frameWidth: 21, frameHeight: 21, totalFrames: 6 }
        };
        this.platformSpritesLoaded = false;
        this.loadPlatformSprites();

        // Background management
        this.backgrounds = {};
        this.currentBackground = null;
        this.loadAvailableBackgrounds();


        this.gravity = 0.8;
        this.friction = 0.8;

        // Initialize platform system
        this.platformSystem = new PlatformSystem(this.ctx, this.platformSprites);

        // Initialize prop system
        this.torchParticles = [];
        this.propSystem = new PropSystem(this.ctx, this.platformSprites, this.torchParticles);

        // Initialize scene system
        this.sceneSystem = new SceneSystem(this);

        // Scene interaction state
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.isDraggingStartPosition = false;
        this.startPositionDragOffset = { x: 0, y: 0 };

        // Initialize mouse handlers (will be set after viewport and camera are ready)
        this.platformMouseHandler = null;
        this.propsMouseHandler = null;


        // Camera scrolling during drag
        this.dragScrollTimer = null;
        this.dragScrollDirection = null;
        this.lastMousePosition = { x: 0, y: 0 };

        // Camera mode system
        this.cameraMode = 'character'; // 'free' or 'character'
        this.freeCameraScrollTimer = null;
        this.freeCameraScrollDirection = null;

        // Temporary prop types reference for backward compatibility
        this.propTypes = {
            // Reference to prop system's types
            ...this.propSystem.propTypes
        };

        // Viewport and scaling system
        this.viewport = {
            designWidth: 1920,    // Target design resolution width
            designHeight: 1080,   // Fixed design resolution height for proper scaling
            actualWidth: window.innerWidth - (this.showDashboard ? 300 : 0),
            actualHeight: window.innerHeight,
            scaleX: 1,
            scaleY: 1,
            scale: 1,             // Uniform scale factor
            offsetX: 0,           // Letterbox offset
            offsetY: 0,           // Letterbox offset
            mode: 'fit'           // 'fit', 'stretch', 'crop', 'pixel-perfect'
        };

        this.camera = {
            x: 0,
            y: 0
        };

        this.updateViewport();

        // Initialize mouse handlers after viewport and camera are ready
        this.platformMouseHandler = new PlatformMouseHandler(
            this.platformSystem,
            this.viewport,
            this.camera,
            this.canvas
        );
        this.propsMouseHandler = new PropsMouseHandler(
            this.propSystem,
            this.propSystem.manager,
            this.platformSystem,
            this.viewport,
            this.camera
        );

        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;

        // Scene data is now handled by the sceneSystem
        this.pendingGameDataImport = null; // Store gameData.json data until scene system is ready

        this.gameData = {
            characters: [
                { name: 'Hero', description: 'Main player character' }
            ],
            classes: [
                { name: 'Warrior', description: 'Melee combat specialist' }
            ],
            weapons: [
                { name: 'Iron Sword', description: 'Basic melee weapon', damage: 10 }
            ],
            items: [
                { name: 'Health Potion', description: 'Restores 50 HP', effect: 'heal', value: 50 }
            ]
        };

        this.init();
    }

    loadSprites() {
        const spriteFiles = {
            idle: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png',
            walk: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png',
            attack: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack01.png',
            hurt: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Hurt.png',
            death: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Death.png'
        };

        let loadedCount = 0;
        const totalSprites = Object.keys(spriteFiles).length;

        Object.entries(spriteFiles).forEach(([animationName, filePath]) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.onerror = () => {
                console.error(`Failed to load sprite: ${filePath}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.src = filePath;
            this.sprites[animationName].image = img;
        });
    }

    loadPlatformSprites() {
        let loadedCount = 0;
        const totalImages = 3;

        const checkAllLoaded = () => {
            if (loadedCount === totalImages) {
                this.platformSpritesLoaded = true;
                console.log('🎨 All platform sprites loaded, initializing scene system...');
                this.onPlatformSpritesLoaded();
            }
        };

        // Load ground tileset
        const groundImg = new Image();
        groundImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        groundImg.onerror = () => {
            console.error('Failed to load ground tileset');
        };
        groundImg.src = 'textures_02_08_25.png';
        this.platformSprites.tileset.image = groundImg;

        // Load village props tileset
        const propsImg = new Image();
        propsImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        propsImg.onerror = () => {
            console.error('Failed to load village props tileset');
        };
        propsImg.src = 'sprites/Pixel Art Platformer/Texture/TX Village Props.png';
        this.platformSprites.villageProps.image = propsImg;

        // Load torch flame animation
        const torchFlameImg = new Image();
        torchFlameImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        torchFlameImg.onerror = () => {
            console.error('Failed to load torch flame sprite');
        };
        torchFlameImg.src = 'sprites/Pixel Art Platformer/Texture/TX FX Torch Flame.png';
        this.platformSprites.torchFlame.image = torchFlameImg;
    }

    onPlatformSpritesLoaded() {
        console.log('🎨 Platform sprites loaded, initializing scene system...');

        // Check if we have pending gameData.json import
        if (this.pendingGameDataImport) {
            console.log('📦 Loading pending gameData.json import...');
            // Initialize scene system with imported data
            this.sceneSystem.data.importSceneData(this.pendingGameDataImport);
            this.sceneSystem.initialize();

            // Save the imported data to localStorage
            this.sceneSystem.saveScenes();
            console.log('✅ Imported scene data saved to localStorage');

            this.pendingGameDataImport = null; // Clear pending data
        } else {
            // Initialize scene system normally
            this.sceneSystem.initialize();
        }

        // Position player at the current scene's start position
        this.positionPlayerAtSceneStart();

        // Then set development mode (which will call sceneSystem.updateUI())
        this.setDevelopmentMode(true); // Properly initialize development mode UI

        // Update platform UI after everything is loaded
        this.platformSystem.updatePlatformList();
        this.platformSystem.updatePlatformProperties();

        console.log('✅ Scene system fully initialized');
        console.log('✅ Final platform count:', this.platformSystem.platforms.length);
    }

    loadAvailableBackgrounds() {
        // Available backgrounds found in the backgrounds folder
        this.availableBackgrounds = [
            'none',
            'DarkForest',
            'Mountains1',
            'Mountains2',
            'MountainWaterfall',
            'The Dawn'
        ];
    }

    loadBackground(backgroundName) {
        console.log('🎨 loadBackground called with:', backgroundName);
        if (backgroundName === 'none' || !backgroundName) {
            this.currentBackground = null;
            console.log('🚫 Setting background to null (none)');
            return;
        }

        if (this.backgrounds[backgroundName]) {
            this.currentBackground = this.backgrounds[backgroundName];
            console.log('✅ Background already loaded, using cached:', backgroundName);
            return;
        }

        console.log('📥 Loading new background:', backgroundName);

        // Load background layers based on background type
        const background = {
            name: backgroundName,
            layers: [],
            layersLoaded: 0,
            totalLayers: 0
        };

        let layerPaths = [];

        // Define layer paths for each background type
        switch (backgroundName) {
            case 'DarkForest':
                layerPaths = [
                    'backgrounds/DarkForest/layers/sky.png',
                    'backgrounds/DarkForest/layers/clouds_1.png',
                    'backgrounds/DarkForest/layers/clouds_2.png',
                    'backgrounds/DarkForest/layers/rocks.png',
                    'backgrounds/DarkForest/layers/ground_3.png',
                    'backgrounds/DarkForest/layers/ground_2.png',
                    'backgrounds/DarkForest/layers/ground_1.png',
                    'backgrounds/DarkForest/layers/plant.png'
                ];
                break;
            case 'Mountains1':
                layerPaths = [
                    'backgrounds/Mountains1/layers/sky.png',
                    'backgrounds/Mountains1/layers/clouds_4.png',
                    'backgrounds/Mountains1/layers/clouds_3.png',
                    'backgrounds/Mountains1/layers/clouds_2.png',
                    'backgrounds/Mountains1/layers/clouds_1.png',
                    'backgrounds/Mountains1/layers/rocks_2.png',
                    'backgrounds/Mountains1/layers/rocks_1.png'
                ];
                break;
            case 'Mountains2':
                layerPaths = [
                    'backgrounds/Mountains2/layers/sky.png',
                    'backgrounds/Mountains2/layers/clouds_3.png',
                    'backgrounds/Mountains2/layers/clouds_2.png',
                    'backgrounds/Mountains2/layers/clouds_1.png',
                    'backgrounds/Mountains2/layers/birds.png',
                    'backgrounds/Mountains2/layers/rocks_3.png',
                    'backgrounds/Mountains2/layers/rocks_2.png',
                    'backgrounds/Mountains2/layers/rocks_1.png',
                    'backgrounds/Mountains2/layers/pines.png'
                ];
                break;
            case 'MountainWaterfall':
                layerPaths = [
                    'backgrounds/MountainWaterfall/layers/sky.png',
                    'backgrounds/MountainWaterfall/layers/clouds_2.png',
                    'backgrounds/MountainWaterfall/layers/clouds_1.png',
                    'backgrounds/MountainWaterfall/layers/rocks.png',
                    'backgrounds/MountainWaterfall/layers/ground.png'
                ];
                break;
            case 'The Dawn':
                layerPaths = [];
                for (let i = 1; i <= 8; i++) {
                    layerPaths.push(`backgrounds/The Dawn/The Dawn/Layers/${i}.png`);
                }
                break;
            default:
                console.warn(`Unknown background: ${backgroundName}`);
                return;
        }

        background.totalLayers = layerPaths.length;

        // Load each layer
        layerPaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                background.layersLoaded++;
                console.log(`Loaded background layer ${index + 1}/${background.totalLayers} for ${backgroundName}`);
            };
            img.onerror = (error) => {
                console.warn(`Failed to load background layer: ${path}`);
            };
            img.src = path;
            background.layers.push(img);
        });

        this.backgrounds[backgroundName] = background;
        this.currentBackground = background;
    }

    setSceneBackground(backgroundName) {
        console.log('🎨 setSceneBackground called with:', backgroundName);
        // Update current scene background using the new scene system
        if (this.sceneSystem) {
            const currentScene = this.sceneSystem.currentScene;
            if (currentScene) {
                // Initialize background property if it doesn't exist
                if (!currentScene.background) {
                    currentScene.background = {
                        name: 'none',
                        layers: []
                    };
                }
                currentScene.background.name = backgroundName;
                currentScene.background.layers = [];
                currentScene.metadata.modified = new Date().toISOString();

                // Save the scene data to persist the background change
                this.sceneSystem.saveScenes();
            }
        }

        // Load the background
        this.loadBackground(backgroundName);
    }

    applyViewportSettings() {
        const modeSelect = document.getElementById('viewportModeSelect');
        const designWidth = parseInt(document.getElementById('designWidth').value);
        const designHeight = parseInt(document.getElementById('designHeight').value);

        this.viewport.mode = modeSelect.value;
        this.viewport.designWidth = designWidth;
        this.viewport.designHeight = designHeight;

        this.updateViewport();
        this.updateViewportUI();
    }

    resetViewportSettings() {
        this.viewport.mode = 'fit';
        this.viewport.designWidth = 1920;
        this.viewport.designHeight = 1080;

        document.getElementById('viewportModeSelect').value = 'fit';
        document.getElementById('designWidth').value = '1920';
        document.getElementById('designHeight').value = '1080';

        this.updateViewport();
        this.updateViewportUI();
    }

    updateViewportUI() {
        document.getElementById('currentScale').textContent = `${this.viewport.scale.toFixed(2)}x`;
        document.getElementById('actualSize').textContent = `${this.viewport.actualWidth}x${this.viewport.actualHeight}`;
    }

    renderBackground() {
        // Reset any transforms to ensure clean slate
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (!this.currentBackground || !this.currentBackground.layers.length) {
            // Render a default sky color instead of transparent
            this.ctx.fillStyle = '#87CEEB'; // Sky blue
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const background = this.currentBackground;

        // Render each background layer with different parallax speeds
        background.layers.forEach((layer, index) => {
            if (!layer.complete || !layer.naturalWidth) return; // Skip if not loaded

            // Calculate parallax offset for this layer
            // Layers closer to the back (lower index) move slower
            const parallaxSpeed = (index + 1) * 0.1; // 0.1, 0.2, 0.3, etc.
            // Scale the camera offset by viewport scale to maintain consistent parallax
            // Use safety fallback for viewport scale in case it's not initialized
            const viewportScale = this.viewport?.scaleX || 1;
            const scaledCameraX = this.camera.x * viewportScale;
            const parallaxOffset = scaledCameraX * parallaxSpeed;

            // Calculate how many times we need to repeat the image to fill the screen
            const imageWidth = layer.naturalWidth;
            const imageHeight = layer.naturalHeight;

            // Scale the image to fit the canvas height while maintaining aspect ratio
            const scale = this.canvas.height / imageHeight;
            const scaledWidth = imageWidth * scale;

            // Calculate starting position to ensure seamless repetition
            const startX = -parallaxOffset % scaledWidth;
            const tilesNeeded = Math.ceil((this.canvas.width + scaledWidth) / scaledWidth);

            // Draw repeated background tiles - always fill entire canvas
            for (let i = 0; i < tilesNeeded; i++) {
                const x = startX + (i * scaledWidth);
                this.ctx.drawImage(
                    layer,
                    x, 0,  // Always start at Y=0 (top of canvas)
                    scaledWidth, this.canvas.height  // Always fill full canvas height
                );
            }
        });
    }

    init() {
        this.setupEventListeners();
        this.populateBackgroundDropdown();
        this.updateViewport(); // Ensure viewport is properly initialized
        this.updateViewportUI(); // Initialize viewport UI

        // Scene system initialization is now handled by onPlatformSpritesLoaded()
        // after platform sprites are loaded

        this.gameLoop();
        this.updateUI();
        this.loadGameDataFromFile();
    }

    populateBackgroundDropdown() {
        const backgroundSelect = document.getElementById('backgroundSelect');
        if (!backgroundSelect) return;

        // Clear existing options except "none"
        backgroundSelect.innerHTML = '<option value="none">None</option>';

        // Add all available backgrounds
        this.availableBackgrounds.slice(1).forEach(backgroundName => {
            const option = document.createElement('option');
            option.value = backgroundName;
            option.textContent = this.formatBackgroundName(backgroundName);
            backgroundSelect.appendChild(option);
        });
    }

    formatBackgroundName(name) {
        // Convert camelCase to readable format
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            // Skip game key handling if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Don't register arrow keys for player movement if we're nudging props
            const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
            const isNudgingProp = this.isDevelopmentMode &&
                                  (this.propSystem.selectedProp ||
                                   (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0));

            if (!(isArrowKey && isNudgingProp)) {
                this.keys[e.key.toLowerCase()] = true;
            }

            // Handle Ctrl key for attack (but not in development mode with props selected)
            if (e.key === 'Control' && !this.player.isAttacking) {
                // Don't attack if in development mode and props are selected (Ctrl is used for multi-selection)
                const hasSelectedProps = this.isDevelopmentMode &&
                    (this.propSystem.selectedProp || (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0));

                if (!hasSelectedProps) {
                    e.preventDefault(); // Prevent browser shortcuts like Ctrl+Space
                    this.handlePlayerAttack();
                }
            }

            // Handle space key for jump (one-time trigger) - works in both development and production modes
            if (e.key === ' ' && this.player.onGround && !this.player.spaceKeyPressed) {
                const jumpPower = this.keys['shift'] ? -17 : this.player.jumpPower;
                this.player.velocityY = jumpPower;
                this.player.onGround = false;
                this.player.spaceKeyPressed = true;
                e.preventDefault(); // Prevent page scrolling
            }

            // Prevent browser shortcuts when Ctrl is held down with other keys
            if (e.ctrlKey && (e.key === ' ' || e.key === 'Space')) {
                e.preventDefault(); // Specifically prevent Ctrl+Space
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;

            // Reset space key flag when released
            if (e.key === ' ') {
                this.player.spaceKeyPressed = false;
            }

            // Prevent browser shortcuts for Control key
            if (e.key === 'Control') {
                e.preventDefault();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientMouseX = e.clientX - rect.left;
            const clientMouseY = e.clientY - rect.top;

            // Store client mouse position for copy/paste
            this.lastMouseX = clientMouseX;
            this.lastMouseY = clientMouseY;

            // Convert screen coordinates to both coordinate systems
            const worldCoords = this.screenToWorld(clientMouseX, clientMouseY);
            const viewportCoords = this.screenToViewport(clientMouseX, clientMouseY);
            this.mouseX = worldCoords.x;  // Keep world coordinates for backward compatibility
            this.mouseY = worldCoords.y;
            this.viewportMouseX = viewportCoords.x;  // Add viewport coordinates
            this.viewportMouseY = viewportCoords.y;

            if (this.isDevelopmentMode) {
                document.getElementById('coordinates').textContent =
                    `X: ${Math.round(this.mouseX)}, Y: ${Math.round(this.mouseY)}`;

                this.updateCursor();
                this.handleStartPositionDrag();
                this.handlePlatformDrag(e);

                // Handle free camera mode mouse edge scrolling
                if (this.cameraMode === 'free' && !this.platformSystem.isDragging && !this.platformSystem.isDraggingProp && !this.platformSystem.isResizing) {
                    this.handleFreeCameraScroll(clientMouseX, clientMouseY);
                }
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isDevelopmentMode) {
                this.handlePlatformMouseDown(e);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isDevelopmentMode) {
                this.handlePlatformMouseUp(e);
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            // Stop free camera scrolling when mouse leaves canvas
            this.stopFreeCameraScroll();
        });

        // Right-click context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            if (this.isDevelopmentMode) {
                e.preventDefault(); // Prevent default browser context menu
                this.showContextMenu(e);
            }
        });

        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });

        document.getElementById('productionBtn').addEventListener('click', () => {
            this.setDevelopmentMode(false);
        });

        document.getElementById('toggleDashboardBtn').addEventListener('click', () => {
            this.toggleDashboard();
        });

        // Prevent the toggle dashboard button from being triggered by space key
        document.getElementById('toggleDashboardBtn').addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        document.getElementById('cameraModeBtn').addEventListener('click', () => {
            this.toggleCameraMode();
        });

        document.getElementById('focusPlayerBtn').addEventListener('click', () => {
            this.focusPlayer();
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
            this.canvas.height = window.innerHeight;
            this.updateViewport();
        });

        // Add keyboard event listener for Delete key
        window.addEventListener('keydown', (e) => {
            // Skip game key handling if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            this.handleKeyDown(e);
        });

        this.setupPlatformEditorListeners();
        this.setupSceneEditorListeners();
    }

    handlePlayerAttack() {
        if (!this.player.isAttacking) {
            this.player.isAttacking = true;
            this.player.attackTimer = 0;
            this.setPlayerAnimation('attack');

            // Attack in the direction the player is currently facing
            // Don't change facing direction during attack - use current facing
        }
    }

    setDevelopmentMode(isDev) {
        this.isDevelopmentMode = isDev;
        document.getElementById('currentMode').textContent = isDev ? 'Development' : 'Production';
        document.getElementById('coordinates').style.display = isDev ? 'block' : 'none';
        document.getElementById('platformEditor').style.display = isDev ? 'block' : 'none';
        document.getElementById('backgroundEditor').style.display = isDev ? 'block' : 'none';
        document.getElementById('viewportEditor').style.display = isDev ? 'block' : 'none';
        document.getElementById('propsEditor').style.display = isDev ? 'block' : 'none';
        document.getElementById('sceneProperties').style.display = isDev ? 'block' : 'none';

        // Clear invalid zones cache when switching modes
        if (this.sceneSystem && this.sceneSystem.manager) {
            this.sceneSystem.manager.invalidZonesChecked = new Set();
            this.sceneSystem.manager.lastCheckedSceneId = null;
        }

        if (isDev) {
            this.platformSystem.updatePlatformList();
            this.propSystem.updatePropList();
            this.sceneSystem.updateUI();
        } else {
            // Production mode - start with the designated start scene
            this.sceneSystem.startGame();
        }
    }

    toggleDashboard() {
        this.showDashboard = !this.showDashboard;
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.toggle('hidden', !this.showDashboard);

        // Update canvas element size
        const newWidth = window.innerWidth - (this.showDashboard ? 300 : 0);
        const newHeight = window.innerHeight;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        // Also update CSS size to match
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';

        // Keep design dimensions and viewport mode constant
        this.viewport.designWidth = 1920;
        this.viewport.designHeight = 1080;

        this.updateViewport();

        // Reset space key state to prevent it from getting stuck
        this.player.spaceKeyPressed = false;

        // Ensure canvas maintains focus for key events
        this.canvas.focus();

        // Force a render to see the changes immediately
        this.render();
    }

    handleInput() {
        if (this.isDevelopmentMode) {
            // Check if we're nudging a prop - if so, don't move the player
            const isNudgingProp = this.propSystem.selectedProp ||
                                 (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0);

            // Use delta time for framerate-independent movement (60fps = 16.67ms baseline)
            const moveMultiplier = this.deltaTime / 16.67;
            const speedMultiplier = (this.keys['shift']) ? 1.5 : 1.0;
            let isMoving = false;

            // Don't use arrow keys for player movement if nudging props
            if (!isNudgingProp) {
                if (this.keys['arrowleft']) {
                    this.player.x -= this.player.speed * moveMultiplier * speedMultiplier;
                    this.player.facing = 'left';
                    isMoving = true;
                }
                if (this.keys['arrowright']) {
                    this.player.x += this.player.speed * moveMultiplier * speedMultiplier;
                    this.player.facing = 'right';
                    isMoving = true;
                }
                if (this.keys['arrowup']) {
                    this.player.y -= this.player.speed * moveMultiplier * speedMultiplier;
                    isMoving = true;
                }
                if (this.keys['arrowdown']) {
                    this.player.y += this.player.speed * moveMultiplier * speedMultiplier;
                    isMoving = true;
                }
            }

            // WASD still works for player movement regardless of prop selection
            if (this.keys['a']) {
                this.player.x -= this.player.speed * moveMultiplier * speedMultiplier;
                this.player.facing = 'left';
                isMoving = true;
            }
            if (this.keys['d']) {
                this.player.x += this.player.speed * moveMultiplier * speedMultiplier;
                this.player.facing = 'right';
                isMoving = true;
            }
            if (this.keys['w']) {
                this.player.y -= this.player.speed * moveMultiplier * speedMultiplier;
                isMoving = true;
            }
            if (this.keys['s']) {
                this.player.y += this.player.speed * moveMultiplier * speedMultiplier;
                isMoving = true;
            }
            this.setPlayerAnimation(isMoving ? 'walk' : 'idle');
        } else {
            const speedMultiplier = (this.keys['shift']) ? 1.5 : 1.0;
            let isMoving = false;
            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.velocityX = -this.player.speed * speedMultiplier;
                this.player.facing = 'left';
                isMoving = true;
            } else if (this.keys['arrowright'] || this.keys['d']) {
                this.player.velocityX = this.player.speed * speedMultiplier;
                this.player.facing = 'right';
                isMoving = true;
            } else {
                this.player.velocityX *= this.friction;
            }


            // Set animation based on movement and ground state
            if (!this.player.onGround) {
                this.setPlayerAnimation('idle'); // Could be jump animation if you have one
            } else if (isMoving || Math.abs(this.player.velocityX) > 0.5) {
                this.setPlayerAnimation('walk');
            } else {
                this.setPlayerAnimation('idle');
            }
        }
    }

    setPlayerAnimation(animationName) {
        // Don't change animation if currently attacking (unless setting to attack)
        if (this.player.isAttacking && animationName !== 'attack') {
            return;
        }

        if (this.player.currentAnimation !== animationName) {
            this.player.currentAnimation = animationName;
            this.player.frameIndex = 0;
            this.player.frameTimer = 0;
        }
    }

    updatePlayerAnimation() {
        if (!this.spritesLoaded) return;

        // Update frame animation using delta time
        this.player.frameTimer += this.deltaTime;
        if (this.player.frameTimer >= this.player.frameRate) {
            this.player.frameTimer = 0;
            const sprite = this.sprites[this.player.currentAnimation];
            this.player.frameIndex = (this.player.frameIndex + 1) % sprite.frames;
        }

        // Handle attack timing - check this after frame updates
        if (this.player.isAttacking) {
            this.player.attackTimer += this.deltaTime;
            if (this.player.attackTimer >= this.player.attackDuration) {
                this.player.isAttacking = false;
                this.player.attackTimer = 0;
                // Return to appropriate animation based on current state
                if (!this.isDevelopmentMode && !this.player.onGround) {
                    this.setPlayerAnimation('idle');
                } else if (Math.abs(this.player.velocityX) > 0.5) {
                    this.setPlayerAnimation('walk');
                } else {
                    this.setPlayerAnimation('idle');
                }
            }
        }
    }

    updatePhysics() {
        if (!this.isDevelopmentMode) {
            // Track position before physics update
            const startX = this.player.x;
            const startY = this.player.y;

            // Use delta time for framerate-independent physics (60fps = 16.67ms baseline)
            const physicsMultiplier = this.deltaTime / 16.67;

            this.player.velocityY += this.gravity * physicsMultiplier;

            this.player.x += this.player.velocityX * physicsMultiplier;
            this.player.y += this.player.velocityY * physicsMultiplier;

            // Detect large jumps in position (potential teleportation)
            const deltaX = Math.abs(this.player.x - startX);
            const deltaY = Math.abs(this.player.y - startY);

            // If position changed dramatically (more than would be possible with normal physics)
            if (deltaX > 200 || deltaY > 200) {
                console.warn('🚨 LARGE POSITION CHANGE DETECTED IN PHYSICS!', {
                    from: { x: startX, y: startY },
                    to: { x: this.player.x, y: this.player.y },
                    delta: { x: deltaX, y: deltaY },
                    velocity: { x: this.player.velocityX, y: this.player.velocityY },
                    physicsMultiplier
                });
            }

            this.player.onGround = false;

            // Check collision with platforms using actual positions
            const beforeCollisionX = this.player.x;
            const beforeCollisionY = this.player.y;

            this.platformSystem.checkPlayerPlatformCollisions(this.player, this.viewport);

            // Check if platform collision caused teleportation
            if (Math.abs(this.player.x - beforeCollisionX) > 200 || Math.abs(this.player.y - beforeCollisionY) > 200) {
                console.warn('🚨 PLATFORM COLLISION CAUSED TELEPORTATION!', {
                    before: { x: beforeCollisionX, y: beforeCollisionY },
                    after: { x: this.player.x, y: this.player.y }
                });
            }

            // Check collision with obstacle props
            const beforePropX = this.player.x;
            const beforePropY = this.player.y;

            this.propSystem.checkPlayerPropCollisions(this.player, this.viewport);

            // Check if prop collision caused teleportation
            if (Math.abs(this.player.x - beforePropX) > 200 || Math.abs(this.player.y - beforePropY) > 200) {
                console.warn('🚨 PROP COLLISION CAUSED TELEPORTATION!', {
                    before: { x: beforePropX, y: beforePropY },
                    after: { x: this.player.x, y: this.player.y }
                });
            }

            // Check scene transitions using player center point
            const beforeTransitionX = this.player.x;
            const beforeTransitionY = this.player.y;

            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            this.sceneSystem.checkTransitions(playerCenterX, playerCenterY);

            // Check if transition caused teleportation
            if (Math.abs(this.player.x - beforeTransitionX) > 200 || Math.abs(this.player.y - beforeTransitionY) > 200) {
                console.warn('🚨 SCENE TRANSITION CAUSED TELEPORTATION!', {
                    before: { x: beforeTransitionX, y: beforeTransitionY },
                    after: { x: this.player.x, y: this.player.y },
                    centerPoint: { x: playerCenterX, y: playerCenterY }
                });
            }

            // Apply scene boundary constraints to player position
            this.applyPlayerBoundaryConstraints();

            // Check if player fell below the viewport (using player's bottom edge)
            if (this.player.y + this.player.height > this.viewport.designHeight + 100) {
                console.log('⚠️ Player fell below viewport, resetting to start position', {
                    playerY: this.player.y,
                    playerBottom: this.player.y + this.player.height,
                    viewportHeight: this.viewport.designHeight
                });
                // Reset player to current scene's start position
                const currentScene = this.sceneSystem.currentScene;
                if (currentScene) {
                    this.player.x = currentScene.settings.playerStartX;
                    this.player.y = currentScene.settings.playerStartY;
                } else {
                    // Fallback to default position
                    this.player.x = 100;
                    this.player.y = 400;
                }
                this.player.velocityX = 0;
                this.player.velocityY = 0;
            }
        }
    }


    updateCamera() {
        // Don't update camera automatically during drag operations
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp || this.platformSystem.isResizing || this.isDraggingStartPosition) {
            return;
        }

        // Handle camera based on mode and game state
        if (this.cameraMode === 'character') {
            // Character mode: always follow player
            const targetX = this.player.x - this.canvas.width / 2;
            const targetY = this.player.y - this.canvas.height / 2;

            // Both development and production modes use scene boundary constraints
            this.applyCameraBoundaryConstraints(targetX, targetY);
        } else if (this.cameraMode === 'free') {
            // Free mode: only follow player in production mode
            if (!this.isDevelopmentMode) {
                const targetX = this.player.x - this.canvas.width / 2;
                const targetY = this.player.y - this.canvas.height / 2;
                this.applyCameraBoundaryConstraints(targetX, targetY);
            }
            // In development mode with free camera, camera stays manual
        }
    }

    applyCameraBoundaryConstraints(targetX, targetY) {
        const currentScene = this.sceneSystem.currentScene;
        if (!currentScene || !currentScene.boundaries) {
            // Fallback to basic constraints if no scene boundaries
            this.camera.x = Math.max(0, targetX);
            this.camera.y = Math.max(0, targetY);
            return;
        }

        const bounds = currentScene.boundaries;

        // Calculate the actual visible area in world coordinates
        // This accounts for the actual canvas size and viewport scaling
        const visibleWorldWidth = this.canvas.width / this.viewport.scaleX;
        const visibleWorldHeight = this.canvas.height / this.viewport.scaleY;

        // Calculate the constrained camera position
        // Camera X constraints: use normal constraints for most cases
        let minCameraX, maxCameraX;
        const sceneWidth = bounds.right - bounds.left;

        if (visibleWorldWidth > sceneWidth && (bounds.right - visibleWorldWidth) < bounds.left) {
            // Only apply expanded bounds when visible area is larger than scene AND standard constraints would lock camera
            // This specifically targets laptop scaling issues where camera gets locked
            const excessWidth = visibleWorldWidth - sceneWidth;
            // Allow camera to move to follow player while keeping scene visible
            minCameraX = bounds.left - (excessWidth * 0.3);
            maxCameraX = bounds.left + (excessWidth * 0.3);
        } else {
            // Standard camera constraints for normal cases
            minCameraX = bounds.left;
            maxCameraX = Math.max(bounds.left, bounds.right - visibleWorldWidth);
        }

        // Camera Y constraints: more flexible for smaller screens
        let minCameraY, maxCameraY;

        if (visibleWorldHeight >= (bounds.bottom - bounds.top)) {
            // Screen is tall enough to show the entire scene height - align to bottom
            const sceneHeight = bounds.bottom - bounds.top;
            const excessHeight = visibleWorldHeight - sceneHeight;
            // Align scene to bottom by positioning camera to show the bottom boundary at viewport bottom
            minCameraY = bounds.bottom - visibleWorldHeight;
            maxCameraY = bounds.bottom - visibleWorldHeight;  // Same value for bottom alignment
        } else {
            // Screen is shorter than scene - use normal constraints
            minCameraY = bounds.top;
            maxCameraY = Math.max(bounds.top, bounds.bottom - visibleWorldHeight);
        }

        // Apply constraints
        this.camera.x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
        this.camera.y = Math.max(minCameraY, Math.min(maxCameraY, targetY));

        // Special handling for hidden dashboard: force camera to left boundary to eliminate gaps
        if (!this.showDashboard) {
            // When dashboard is hidden, ensure camera doesn't create gaps on the left
            this.camera.x = Math.max(this.camera.x, bounds.left);
            // Also ensure viewport offset is 0 for proper alignment
            this.viewport.offsetX = 0;
        }

        // Debug logging for camera constraints (can be removed for production)
        // console.log('🎥 Camera constrained:', { target: { x: targetX, y: targetY }, actual: { x: this.camera.x, y: this.camera.y } });
    }

    applyPlayerBoundaryConstraints() {
        const currentScene = this.sceneSystem.currentScene;
        if (!currentScene || !currentScene.boundaries) {
            return; // No constraints if no scene boundaries
        }

        const bounds = currentScene.boundaries;
        const originalX = this.player.x;
        const originalY = this.player.y;

        // Constrain player position to scene boundaries
        const playerLeft = this.player.x;
        const playerRight = this.player.x + this.player.width;
        const playerTop = this.player.y;
        const playerBottom = this.player.y + this.player.height;

        // Apply horizontal constraints
        if (playerLeft < bounds.left) {
            this.player.x = bounds.left;
            this.player.velocityX = 0; // Stop horizontal movement
        } else if (playerRight > bounds.right) {
            this.player.x = bounds.right - this.player.width;
            this.player.velocityX = 0; // Stop horizontal movement
        }

        // Apply vertical constraints
        if (playerTop < bounds.top) {
            this.player.y = bounds.top;
            this.player.velocityY = 0; // Stop vertical movement
        } else if (playerBottom > bounds.bottom) {
            this.player.y = bounds.bottom - this.player.height;
            this.player.velocityY = 0; // Stop vertical movement
            this.player.onGround = true; // Player landed on bottom boundary
        }

        // Debug logging for player constraints (can be removed for production)
        // if (this.player.x !== originalX || this.player.y !== originalY) {
        //     console.log('🚧 Player constrained by scene boundaries:', { original: { x: originalX, y: originalY }, constrained: { x: this.player.x, y: this.player.y } });
        // }
    }

    updateViewport() {
        this.viewport.actualWidth = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.viewport.actualHeight = window.innerHeight;

        // Calculate scale factors
        const scaleX = this.viewport.actualWidth / this.viewport.designWidth;
        const scaleY = this.viewport.actualHeight / this.viewport.designHeight;

        switch (this.viewport.mode) {
            case 'fit':
                // Fit with aspect ratio preserved (letterbox/pillarbox)
                this.viewport.scale = Math.min(scaleX, scaleY);
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;

                // Align to left when dashboard is hidden (both dev and production), center otherwise
                if (!this.showDashboard) {
                    this.viewport.offsetX = 0; // Align to left (no gap on left side)
                    this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2; // Center vertically
                } else {
                    // Default centering behavior when dashboard is visible
                    this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                    this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                }
                break;
            case 'stretch':
                // Stretch to fill entire viewport (may distort)
                this.viewport.scaleX = scaleX;
                this.viewport.scaleY = scaleY;
                this.viewport.scale = Math.min(scaleX, scaleY); // For UI elements
                this.viewport.offsetX = 0;
                this.viewport.offsetY = 0;
                break;
            case 'crop':
                // Crop to fill viewport (maintain aspect ratio, crop edges)
                this.viewport.scale = Math.max(scaleX, scaleY);
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;
                this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                break;
            case 'pixel-perfect':
                // Use integer scaling only
                this.viewport.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;
                this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                break;
        }
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.viewport.offsetX) / this.viewport.scaleX + this.camera.x;
        const worldY = (screenY - this.viewport.offsetY) / this.viewport.scaleY + this.camera.y;
        return { x: worldX, y: worldY };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.camera.x) * this.viewport.scaleX + this.viewport.offsetX;
        const screenY = (worldY - this.camera.y) * this.viewport.scaleY + this.viewport.offsetY;
        return { x: screenX, y: screenY };
    }

    // Convert screen coordinates to viewport coordinates (without camera offset)
    screenToViewport(screenX, screenY) {
        const viewportX = (screenX - this.viewport.offsetX) / this.viewport.scaleX;
        const viewportY = (screenY - this.viewport.offsetY) / this.viewport.scaleY;
        return { x: viewportX, y: viewportY };
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background first, before any scaling (fills entire window)
        this.renderBackground();

        // Apply viewport scaling and offset
        this.ctx.save();
        this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
        this.ctx.scale(this.viewport.scaleX, this.viewport.scaleY);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Disable image smoothing for crisp pixel art rendering
        this.ctx.imageSmoothingEnabled = false;

        // Debug: Log camera position during render
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp || this.isDraggingStartPosition) {
            console.log('Rendering with camera position:', this.camera.x, this.camera.y);
        }

        // Render platforms using the platform system
        this.platformSystem.renderPlatforms(this.isDevelopmentMode, this.viewport);

        // Render props (background props first, then obstacle props)
        this.propSystem.renderBackgroundProps(this.isDevelopmentMode, this.viewport);

        // Render player sprite or fallback to rectangle
        if (this.spritesLoaded && this.sprites[this.player.currentAnimation].image) {
            this.drawPlayerSprite();
        } else {
            // Fallback to rectangle
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }

        if (this.isDevelopmentMode) {
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }

        this.ctx.restore();

        // Restore viewport scaling as well for obstacle props
        this.ctx.restore();

        // Render obstacle props after removing transformations
        // They need special handling for proper coordinate transformation
        this.propSystem.renderObstacleProps(this.isDevelopmentMode, this.viewport, this.camera);

        // Render torch particles after obstacle props (they need the same transformation)
        this.propSystem.renderParticles(this.viewport, this.camera);

        if (this.isDevelopmentMode) {
            // Apply viewport scaling for dev rendering
            this.ctx.save();
            this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
            this.ctx.scale(this.viewport.scaleX, this.viewport.scaleY);

            // Apply camera transformation for scene development overlays
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);

            // Render scene development overlays (transition zones, boundaries, etc.)
            this.sceneSystem.renderer.renderDevelopmentOverlays(this.ctx);

            this.ctx.restore();

            // Render drag selection rectangle
            this.renderDragSelection();

            // Render transition zone drag preview
            this.renderTransitionZoneDrag();

            this.ctx.restore();

            // Draw yellow and black striped police barrier at bottom of scene (in screen coordinates)
            this.renderPoliceBarrier();

            // Render feedback messages (copy/paste notifications) on top of everything
            this.renderFeedbackMessages();
        }
    }

    drawPlayerSprite() {
        const sprite = this.sprites[this.player.currentAnimation];
        if (!sprite.image) return;

        const sourceX = this.player.frameIndex * sprite.frameWidth;
        const sourceY = 0;

        this.ctx.save();

        // Make sprite render larger than collision box, scaled with player size
        const baseSpriteSize = 256;
        const playerScale = this.player.width / 35; // Scale based on original player width (35)
        const spriteRenderWidth = baseSpriteSize * playerScale;
        const spriteRenderHeight = baseSpriteSize * playerScale;
        const spriteOffsetX = (this.player.width - spriteRenderWidth) / 2;
        const spriteOffsetY = this.player.height - spriteRenderHeight + (110 * playerScale); // Adjust to center character in collision box

        // Flip sprite horizontally if facing left
        if (this.player.facing === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                sprite.image,
                sourceX, sourceY,
                sprite.frameWidth, sprite.frameHeight,
                -(this.player.x + spriteOffsetX + spriteRenderWidth), this.player.y + spriteOffsetY,
                spriteRenderWidth, spriteRenderHeight
            );
        } else {
            this.ctx.drawImage(
                sprite.image,
                sourceX, sourceY,
                sprite.frameWidth, sprite.frameHeight,
                this.player.x + spriteOffsetX, this.player.y + spriteOffsetY,
                spriteRenderWidth, spriteRenderHeight
            );
        }

        this.ctx.restore();
    }


    // Prop rendering methods have been moved to propSystem

    /* Old renderTorchFlame - now handled by propSystem
    renderTorchFlame(prop, renderWidth, renderHeight, scale) {
        if (!this.platformSprites.torchFlame || !this.platformSprites.torchFlame.image) return;

        const flameSprite = this.platformSprites.torchFlame;
        const currentTime = Date.now();

        try {
            // Enable image smoothing for smooth flame rendering
            this.ctx.imageSmoothingEnabled = true;

            // Calculate torch tip position
            const torchCenterX = prop.x + (renderWidth / 2);
            const torchTopY = prop.y;

            // Natural flame animation - use individual 21x21 sprites for breathing effect
            const frameIndex = Math.floor(currentTime / 150) % 4; // Use 4 frames for breathing cycle

            // Back to 6x6 grid, but use different positions for breathing effect
            const gridSize = 6;
            const frameSize = Math.floor(128 / gridSize); // 21 pixels per frame

            // Create breathing by using flames from different rows (different flame sizes)
            const breathingSequence = [
                { x: 0, y: 0 }, // Small flame
                { x: 1, y: 0 }, // Medium flame
                { x: 2, y: 0 }, // Large flame
                { x: 1, y: 0 }  // Back to medium
            ];

            const currentFrame = breathingSequence[frameIndex];
            const sourceX = currentFrame.x * frameSize;
            const sourceY = currentFrame.y * frameSize;

            // Larger flame size - taller and wider
            const flameWidth = 65; // Wider (was 50)
            const flameHeight = 110; // Much taller (was 85)

            // Adjust position - fine-tuned positioning
            const flameX = torchCenterX - 33.5; // 0.5px more left (was -33, now -33.5)
            const flameY = torchTopY - 100.5; // 0.5px up (was -100, now -100.5)

            // Save context state
            this.ctx.save();

            // Enable image smoothing for smooth flame
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Enhanced glow effect for more dramatic flame
            this.ctx.shadowColor = 'rgba(255, 120, 0, 0.9)';
            this.ctx.shadowBlur = 25; // Larger glow
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Smoother, more natural fire colors with more blur
            this.ctx.filter = 'hue-rotate(10deg) saturate(2.2) brightness(1.4) contrast(1.2) blur(1.2px)';

            this.ctx.drawImage(
                flameSprite.image,
                sourceX, sourceY,
                frameSize, frameSize,
                flameX, flameY,
                flameWidth, flameHeight
            );

            this.ctx.restore();

            // Much fewer particles
            if (Math.random() < 0.03) { // Only 3% chance - very rare particles
                // Random side drift - either left or right
                const sideDirection = Math.random() < 0.5 ? -1 : 1;
                const horizontalDrift = sideDirection * (0.3 + Math.random() * 0.7); // 0.3 to 1.0 speed

                this.torchParticles.push({
                    x: torchCenterX + (Math.random() - 0.5) * 12, // Slightly wider start spread
                    y: torchTopY - 15, // Start near torch tip
                    vx: horizontalDrift, // Drift to one side
                    vy: 0, // Start with no upward velocity
                    life: 1.0,
                    decay: 0.008, // Slow decay so they fall far
                    size: 1 + Math.random(),
                    brightness: 0.9 + Math.random() * 0.1
                });
            }

            // Update and render falling spark particles
            this.ctx.save();
            for (let i = this.torchParticles.length - 1; i >= 0; i--) {
                const particle = this.torchParticles[i];

                // Simple falling physics
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.15; // Strong gravity - particles fall down
                particle.life -= particle.decay;

                // Remove dead particles
                if (particle.life <= 0) {
                    this.torchParticles.splice(i, 1);
                    continue;
                }

                // Simple spark rendering without glow
                const alpha = particle.life;
                const brightness = particle.brightness;

                const red = Math.floor(255 * brightness * alpha);
                const green = Math.floor(180 * brightness * alpha);
                const blue = Math.floor(60 * brightness * alpha);

                this.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            this.ctx.restore();

            // Re-enable image smoothing
            this.ctx.imageSmoothingEnabled = true;

        } catch (error) {
            console.error('Error rendering torch flame:', error);
        }
    }
    */

    // Prop management methods have been moved to propSystem
    /* Keep for reference
    addProp(x, y, type, isObstacle = false, customScale = null) {
        const propType = this.propTypes[type];
        if (!propType) return;

        // Default scale values for different prop types
        const defaultScale = type === 'well' ? 1 :
                           (type === 'barrel' || type === 'crate') ? 1.2 :
                           (type === 'smallPot' || type === 'mediumPot' || type === 'bigPot') ? 0.6 : 1.6;

        const scale = customScale !== null ? customScale : defaultScale;

        const newProp = {
            id: this.propSystem.nextPropId++,
            x: x,
            y: y,
            type: type,
            isObstacle: isObstacle,
            scale: scale,
            width: propType.width * scale,
            height: propType.height * scale,
            zOrder: this.propSystem.nextPropZOrder++
        };

        this.propSystem.props.push(newProp);
        return newProp;
    }
    */

    /* Keep for reference
    placeProp(mouseX, mouseY) {
        // Get selected prop type, obstacle setting, and scale from UI
        const propTypeSelect = document.getElementById('propTypeSelect');
        const obstacleCheck = document.getElementById('propObstacleCheck');
        const sizeInput = document.getElementById('propSizeInput');

        if (!propTypeSelect || !obstacleCheck || !sizeInput) return;

        const propType = propTypeSelect.value;
        const isObstacle = obstacleCheck.checked;
        const sizeMultiplier = parseFloat(sizeInput.value) || 1.0;

        // Add the prop at mouse position with custom size
        this.addProp(mouseX, mouseY, propType, isObstacle, sizeMultiplier);

        // Exit placement mode
        this.propSystem.propPlacementMode = false;
        const btn = document.getElementById('addPropBtn');
        if (btn) {
            btn.textContent = 'Add Prop (Click on map)';
            btn.classList.remove('danger');
        }
    }
    */

    /* Keep for reference
    updatePropProperties() {
        const propProperties = document.getElementById('propProperties');
        if (!propProperties) return;

        if (this.propSystem.selectedProp) {
            propProperties.style.display = 'block';

            const propType = this.propTypes[this.propSystem.selectedProp.type];
            document.getElementById('selectedPropType').textContent = propType ? propType.name : this.propSystem.selectedProp.type;
            document.getElementById('propX').value = this.propSystem.selectedProp.x;
            document.getElementById('propY').value = this.propSystem.selectedProp.y;
            document.getElementById('selectedPropObstacle').checked = this.propSystem.selectedProp.isObstacle;

            // Show current scale or default if not set
            const currentScale = this.propSystem.selectedProp.scale !== undefined ? this.propSystem.selectedProp.scale :
                               (this.propSystem.selectedProp.type === 'well' ? 1 :
                               (this.propSystem.selectedProp.type === 'barrel' || this.propSystem.selectedProp.type === 'crate') ? 1.2 :
                               (this.propSystem.selectedProp.type === 'smallPot' || this.propSystem.selectedProp.type === 'mediumPot' || this.propSystem.selectedProp.type === 'bigPot') ? 0.6 : 1.6);
            document.getElementById('selectedPropScale').value = currentScale.toFixed(1);
        } else {
            propProperties.style.display = 'none';
        }
    }
    */


    updateUI() {
        // Note: scenesList is now handled by the scene system, not here

        document.getElementById('charactersList').innerHTML = this.gameData.characters.map(char =>
            `<div class="item">
                <div class="item-name">${char.name}</div>
                <div class="item-details">${char.description}</div>
            </div>`
        ).join('');

        document.getElementById('classesList').innerHTML = this.gameData.classes.map(cls =>
            `<div class="item">
                <div class="item-name">${cls.name}</div>
                <div class="item-details">${cls.description}</div>
            </div>`
        ).join('');

        document.getElementById('weaponsList').innerHTML = this.gameData.weapons.map(weapon =>
            `<div class="item">
                <div class="item-name">${weapon.name}</div>
                <div class="item-details">${weapon.description}</div>
            </div>`
        ).join('');

        document.getElementById('itemsList').innerHTML = this.gameData.items.map(item =>
            `<div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">${item.description}</div>
            </div>`
        ).join('');
    }

    setupPlatformEditorListeners() {
        document.getElementById('addPlatform').addEventListener('click', () => {
            this.platformSystem.togglePlatformPlacement();
        });

        document.getElementById('updatePlatform').addEventListener('click', () => {
            this.platformSystem.updateSelectedPlatform();
        });

        document.getElementById('deletePlatform').addEventListener('click', () => {
            this.platformSystem.deleteSelectedPlatform();
        });

        // Platform positioning controls
        document.getElementById('platformPositioning').addEventListener('change', () => {
            this.platformSystem.updateSelectedPlatform();
        });

        document.getElementById('exportGameData').addEventListener('click', () => {
            this.exportGameData();
        });

        document.getElementById('importGameDataBtn').addEventListener('click', () => {
            document.getElementById('importGameData').click();
        });

        document.getElementById('importGameData').addEventListener('change', (e) => {
            this.importGameData(e);
        });

        // Background controls
        document.getElementById('applyBackground').addEventListener('click', () => {
            const selectedBackground = document.getElementById('backgroundSelect').value;
            this.setSceneBackground(selectedBackground);
        });

        // Viewport controls
        document.getElementById('applyViewport').addEventListener('click', () => {
            this.applyViewportSettings();
        });

        document.getElementById('resetViewport').addEventListener('click', () => {
            this.resetViewportSettings();
        });

        document.getElementById('viewportModeSelect').addEventListener('change', () => {
            this.applyViewportSettings();
        });

        // Props controls
        document.getElementById('addPropBtn').addEventListener('click', () => {
            this.propSystem.propPlacementMode = !this.propSystem.propPlacementMode;
            const btn = document.getElementById('addPropBtn');
            btn.textContent = this.propSystem.propPlacementMode ? 'Cancel Placement' : 'Add Prop (Click on map)';
            btn.classList.toggle('danger', this.propSystem.propPlacementMode);
        });

        // Auto-update size when prop type changes
        document.getElementById('propTypeSelect').addEventListener('change', (e) => {
            const propType = e.target.value;
            const sizeInput = document.getElementById('propSizeInput');

            // Set default size based on prop type (all default to 1.5 now)
            const defaultSize = 1.5;

            sizeInput.value = defaultSize.toFixed(1);
        });

        document.getElementById('clearPropsBtn').addEventListener('click', () => {
            if (confirm('Clear all props? This cannot be undone.')) {
                this.propSystem.props = [];
                this.propSystem.selectedProp = null;
                this.propSystem.updatePropProperties();
            }
        });

        // Prop properties event listeners
        document.getElementById('updateProp').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.propSystem.selectedProp.x = parseInt(document.getElementById('propX').value);
                this.propSystem.selectedProp.y = parseInt(document.getElementById('propY').value);
                this.propSystem.selectedProp.isObstacle = document.getElementById('selectedPropObstacle').checked;

                // Update size multiplier
                const newSize = parseFloat(document.getElementById('propSize').value) || 1.0;
                this.propSystem.selectedProp.sizeMultiplier = newSize;

                // Remove old width/height properties as they're calculated from sizeMultiplier now
                delete this.propSystem.selectedProp.width;
                delete this.propSystem.selectedProp.height;
                delete this.propSystem.selectedProp.scale;
            }
        });

        document.getElementById('deleteProp').addEventListener('click', () => {
            if (this.propSystem.selectedProp && confirm('Delete this prop? This cannot be undone.')) {
                this.propSystem.deleteSelectedProp();
                this.propSystem.updatePropProperties();
                this.propSystem.updatePropList();
            }
        });

        document.getElementById('sendToBackground').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.propsMouseHandler.sendPropToBackground(this.propSystem.selectedProp);
            }
        });

        document.getElementById('bringToFront').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.propsMouseHandler.bringPropToFront(this.propSystem.selectedProp);
            }
        });

        // Multi-selection and grouping event listeners
        document.getElementById('groupProps').addEventListener('click', () => {
            const groupId = this.propSystem.groupSelectedProps();
            if (groupId) {
                console.log(`Created group ${groupId} with ${this.propSystem.selectedProps.length} props`);
            } else {
                alert('Select at least 2 props to create a group');
            }
        });

        document.getElementById('ungroupProps').addEventListener('click', () => {
            this.propSystem.ungroupSelectedProps();
            console.log('Ungrouped selected props');
        });

        document.getElementById('deleteSelectedProps').addEventListener('click', () => {
            if (this.propSystem.selectedProps.length > 0) {
                if (confirm(`Delete ${this.propSystem.selectedProps.length} selected props?`)) {
                    this.propSystem.deleteSelectedProps();
                }
            } else {
                alert('No props selected');
            }
        });

        // Alignment button event listeners
        document.getElementById('alignLeft').addEventListener('click', () => {
            this.propSystem.data.alignPropsLeft();
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
        });

        document.getElementById('alignCenter').addEventListener('click', () => {
            this.propSystem.data.alignPropsCenter();
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
        });

        document.getElementById('alignRight').addEventListener('click', () => {
            this.propSystem.data.alignPropsRight();
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
        });

        document.getElementById('alignTop').addEventListener('click', () => {
            this.propSystem.data.alignPropsTop();
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
        });

        document.getElementById('alignBottom').addEventListener('click', () => {
            this.propSystem.data.alignPropsBottom();
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
        });

        // Context menu event listeners
        this.setupContextMenuListeners();
    }

    setupSceneEditorListeners() {
        // Scene management controls
        document.getElementById('createSceneBtn').addEventListener('click', () => {
            const name = prompt('Scene name:', 'New Scene');
            const description = prompt('Scene description:', '');
            if (name !== null) {
                this.sceneSystem.createScene(name, description);
            }
        });

        document.getElementById('saveSceneBtn').addEventListener('click', () => {
            const spinner = document.getElementById('saveSpinner');
            const overlay = document.getElementById('sceneSavedOverlay');

            console.log('🔴 SAVE BUTTON CLICKED');
            console.log('🔴 Current scene:', this.sceneSystem.data.getCurrentScene()?.name);
            console.log('🔴 Platforms in memory:', this.platformSystem.platforms.length);
            console.log('🔴 Props in memory:', this.propSystem.props.length);

            spinner.style.display = 'inline-block';

            // Use setTimeout to ensure spinner shows before save operation
            setTimeout(() => {
                console.log('🔴 About to call saveScenes()');
                this.sceneSystem.saveScenes();
                console.log('🔴 saveScenes() completed');

                spinner.style.display = 'none';

                // Show overlay briefly
                overlay.style.display = 'flex';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1500);
            }, 10);
        });

        document.getElementById('addTransitionBtn').addEventListener('click', () => {
            this.sceneSystem.startAddingTransition();
        });

        // Scene property inputs - use onchange events for real-time updates
        const sceneNameInput = document.getElementById('sceneName');
        if (sceneNameInput) {
            sceneNameInput.addEventListener('change', () => {
                this.sceneSystem.updateSceneName(sceneNameInput.value);
            });
        }

        const sceneDescInput = document.getElementById('sceneDescription');
        if (sceneDescInput) {
            sceneDescInput.addEventListener('change', () => {
                this.sceneSystem.updateSceneDescription(sceneDescInput.value);
            });
        }

        const playerStartX = document.getElementById('playerStartX');
        const playerStartY = document.getElementById('playerStartY');
        if (playerStartX && playerStartY) {
            const updatePlayerStart = () => {
                this.sceneSystem.updatePlayerStart();
            };
            playerStartX.addEventListener('change', updatePlayerStart);
            playerStartY.addEventListener('change', updatePlayerStart);
        }

    }

    handlePlatformMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;

        // Convert screen coordinates to both world coordinates (for platforms) and viewport coordinates (for props)
        const worldCoords = this.screenToWorld(clientMouseX, clientMouseY);
        const viewportCoords = this.screenToViewport(clientMouseX, clientMouseY);
        const worldMouseX = worldCoords.x;
        const worldMouseY = worldCoords.y;
        const viewportMouseX = viewportCoords.x;
        const viewportMouseY = viewportCoords.y;

        // Handle prop placement mode
        if (this.propSystem.propPlacementMode) {
            this.propSystem.placeProp(worldMouseX, worldMouseY);
            return;
        }

        // Handle platform placement mode
        if (this.platformSystem.platformPlacementMode) {
            this.platformSystem.manager.placePlatform(worldMouseX, worldMouseY);
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return;
        }

        // Handle transition zone creation mode
        if (this.isAddingTransition) {
            this.transitionStart = { x: worldMouseX, y: worldMouseY };
            return;
        }

        // Handle start position dragging
        if (this.sceneSystem.renderer.isMouseOverStartPosition(worldMouseX, worldMouseY)) {
            this.isDraggingStartPosition = true;
            const currentScene = this.sceneSystem.currentScene;
            if (currentScene) {
                this.startPositionDragOffset.x = worldMouseX - currentScene.settings.playerStartX;
                this.startPositionDragOffset.y = worldMouseY - currentScene.settings.playerStartY;
            }
            return;
        }


        // Check for prop clicks first (props should be selectable before platforms)
        const propResult = this.propsMouseHandler.handleMouseDown(worldMouseX, worldMouseY, e.ctrlKey, e.shiftKey);
        if (propResult.handled) {
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return;
        }

        // Handle platform clicks using the platform mouse handler
        const platformHandled = this.platformMouseHandler.handleMouseDown(e, this.propSystem, worldMouseX, worldMouseY);
        if (platformHandled) {
            return;
        }

        // No platform was clicked - start drag selection for props
        this.propSystem.data.startDragSelection(worldMouseX, worldMouseY);
    }

    handleStartPositionDrag() {
        if (!this.isDraggingStartPosition) return;

        // Calculate new position based on mouse position minus drag offset
        const newX = this.mouseX - this.startPositionDragOffset.x;
        const newY = this.mouseY - this.startPositionDragOffset.y;

        // Update the start position
        this.sceneSystem.renderer.updateStartPosition(newX, newY);
    }

    handlePlatformDrag(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;

        // Convert to both coordinate systems
        const worldCoords = this.screenToWorld(clientMouseX, clientMouseY);
        const viewportCoords = this.screenToViewport(clientMouseX, clientMouseY);
        const worldMouseX = worldCoords.x;
        const worldMouseY = worldCoords.y;
        const viewportMouseX = viewportCoords.x;
        const viewportMouseY = viewportCoords.y;

        // Store current mouse position for continuous scrolling
        this.lastMousePosition.x = clientMouseX;
        this.lastMousePosition.y = clientMouseY;

        // Handle camera scrolling during drag operations
        this.handleDragScrolling(clientMouseX, clientMouseY);

        // Handle prop dragging using the props mouse handler
        const propMoved = this.propsMouseHandler.handleMouseMove(worldMouseX, worldMouseY);
        if (propMoved) {
            this.propSystem.updatePropProperties();
            return;
        }

        // Handle platform dragging using the platform mouse handler
        const platformMoved = this.platformMouseHandler.handleMouseMove(worldMouseX, worldMouseY);
        if (platformMoved) {
            // Force render during drag to show camera movement immediately
            this.render();
        }
    }

    handleDragScrolling(clientMouseX, clientMouseY) {
        // Only scroll if we're actually dragging something
        if (!this.platformSystem.isDragging && !this.propSystem.isDraggingProp && !this.propSystem.isDraggingMultiple && !this.platformSystem.isResizing) {
            this.stopDragScrolling();
            return;
        }

        const scrollTriggerZone = 50; // Pixels from screen edge to trigger scrolling
        const canvasWidth = this.canvas.width;
        let newDirection = null;

        // Check platform/prop edges instead of mouse position
        if (this.platformSystem.isDragging && this.platformSystem.selectedPlatform) {
            // Calculate platform bounds relative to screen (camera view)
            const platformScreenLeft = this.platformSystem.selectedPlatform.x - this.camera.x;
            const platformScreenRight = this.platformSystem.selectedPlatform.x + this.platformSystem.selectedPlatform.width - this.camera.x;

            console.log('Platform screen bounds:', platformScreenLeft, 'to', platformScreenRight, 'Canvas width:', canvasWidth);

            // Check which edges are near screen edges
            const leftEdgeNearScreen = platformScreenLeft < scrollTriggerZone;
            const rightEdgeNearScreen = platformScreenRight > canvasWidth - scrollTriggerZone;

            // Calculate movement direction by comparing current position with initial position
            const movementDeltaX = this.platformSystem.selectedPlatform.x - (this.platformSystem.initialDragPosition?.x || this.platformSystem.selectedPlatform.x);
            const isMovingRight = movementDeltaX > 2; // Small threshold to avoid jitter
            const isMovingLeft = movementDeltaX < -2;

            // If both edges are near screen edges (long platform), choose based on movement direction
            if (leftEdgeNearScreen && rightEdgeNearScreen) {
                if (isMovingRight) {
                    newDirection = 'right';
                    console.log('Long platform: Moving right, scroll right');
                } else if (isMovingLeft) {
                    newDirection = 'left';
                    console.log('Long platform: Moving left, scroll left');
                }
                // If not moving much, don't scroll
            }
            // If only left edge is near screen edge and moving left
            else if (leftEdgeNearScreen && (isMovingLeft || !isMovingRight)) {
                newDirection = 'left';
                console.log('Platform left edge near screen left, should scroll left');
            }
            // If only right edge is near screen edge and moving right
            else if (rightEdgeNearScreen && (isMovingRight || !isMovingLeft)) {
                newDirection = 'right';
                console.log('Platform right edge near screen right, should scroll right');
            }
        } else if ((this.propSystem.isDraggingProp || this.propSystem.isDraggingMultiple) && this.propSystem.selectedProp) {
            // Similar logic for props - need to calculate prop dimensions
            const propType = this.propSystem.getPropType(this.propSystem.selectedProp.type);
            if (propType) {
                const sizeMultiplier = this.propSystem.selectedProp.sizeMultiplier || 1.0;
                const propWidth = propType.width * sizeMultiplier;
                const propHeight = propType.height * sizeMultiplier;

                const propScreenLeft = this.propSystem.selectedProp.x - this.camera.x;
                const propScreenRight = this.propSystem.selectedProp.x + propWidth - this.camera.x;

                if (propScreenLeft < scrollTriggerZone) {
                    newDirection = 'left';
                    console.log('Prop left edge near screen left, should scroll left');
                } else if (propScreenRight > canvasWidth - scrollTriggerZone) {
                    newDirection = 'right';
                    console.log('Prop right edge near screen right, should scroll right');
                }
            }
        }

        // Start or update scrolling
        if (newDirection !== this.dragScrollDirection) {
            this.stopDragScrolling();
            if (newDirection) {
                console.log('Starting scroll in direction:', newDirection);
                this.startDragScrolling(newDirection);
            }
        }
    }

    startDragScrolling(direction) {
        this.dragScrollDirection = direction;
        console.log('Starting drag scroll timer for direction:', direction);
        this.dragScrollTimer = setInterval(() => {
            const scrollSpeed = 8; // Faster scrolling speed
            const oldCameraX = this.camera.x;
            const scrollTriggerZone = 50;
            const canvasWidth = this.canvas.width;

            let shouldContinue = false;

            // Check if platform/prop edges are still near screen edges
            if (this.platformSystem.isDragging && this.platformSystem.selectedPlatform) {
                const platformScreenLeft = this.platformSystem.selectedPlatform.x - this.camera.x;
                const platformScreenRight = this.platformSystem.selectedPlatform.x + this.platformSystem.selectedPlatform.width - this.camera.x;

                if (direction === 'left' && platformScreenLeft < scrollTriggerZone) {
                    shouldContinue = true;
                    const newCameraX = Math.max(0, this.camera.x - scrollSpeed);
                    this.camera.x = newCameraX;
                } else if (direction === 'right' && platformScreenRight > canvasWidth - scrollTriggerZone) {
                    shouldContinue = true;
                    this.camera.x += scrollSpeed;
                }
            } else if ((this.propSystem.isDraggingProp || this.propSystem.isDraggingMultiple) && this.propSystem.selectedProp) {
                // Calculate prop dimensions
                const propType = this.propSystem.getPropType(this.propSystem.selectedProp.type);
                if (propType) {
                    const sizeMultiplier = this.propSystem.selectedProp.sizeMultiplier || 1.0;
                    const propWidth = propType.width * sizeMultiplier;

                    const propScreenLeft = this.propSystem.selectedProp.x - this.camera.x;
                    const propScreenRight = this.propSystem.selectedProp.x + propWidth - this.camera.x;

                    if (direction === 'left' && propScreenLeft < scrollTriggerZone) {
                        shouldContinue = true;
                        const newCameraX = Math.max(0, this.camera.x - scrollSpeed);
                        this.camera.x = newCameraX;
                    } else if (direction === 'right' && propScreenRight > canvasWidth - scrollTriggerZone) {
                        shouldContinue = true;
                        this.camera.x += scrollSpeed;
                    }
                }
            }

            if (!shouldContinue) {
                this.stopDragScrolling();
                return;
            }

            console.log('Scrolling camera from', oldCameraX, 'to', this.camera.x);

            // Force a re-render to show the camera movement
            this.render();
        }, 50); // 50ms interval for smooth scrolling
    }

    stopDragScrolling() {
        if (this.dragScrollTimer) {
            clearInterval(this.dragScrollTimer);
            this.dragScrollTimer = null;
        }
        this.dragScrollDirection = null;
    }

    handleFreeCameraScroll(clientMouseX, clientMouseY) {
        // Only in development mode with free camera
        if (!this.isDevelopmentMode || this.cameraMode !== 'free') {
            this.stopFreeCameraScroll();
            return;
        }

        const scrollZone = 80; // Pixels from edge to start scrolling
        const canvasWidth = this.canvas.width;
        let newDirection = null;

        // Determine scroll direction based on mouse position
        if (clientMouseX < scrollZone) {
            newDirection = 'left';
        } else if (clientMouseX > canvasWidth - scrollZone) {
            newDirection = 'right';
        }

        // Start or update scrolling
        if (newDirection !== this.freeCameraScrollDirection) {
            this.stopFreeCameraScroll();
            if (newDirection) {
                this.startFreeCameraScroll(newDirection);
            }
        }
    }

    startFreeCameraScroll(direction) {
        this.freeCameraScrollDirection = direction;
        this.freeCameraScrollTimer = setInterval(() => {
            const scrollSpeed = 6;

            if (direction === 'left') {
                const newCameraX = Math.max(0, this.camera.x - scrollSpeed);
                this.camera.x = newCameraX;
            } else if (direction === 'right') {
                this.camera.x += scrollSpeed;
            }

            // Force render to show camera movement
            this.render();
        }, 30);
    }

    stopFreeCameraScroll() {
        if (this.freeCameraScrollTimer) {
            clearInterval(this.freeCameraScrollTimer);
            this.freeCameraScrollTimer = null;
        }
        this.freeCameraScrollDirection = null;
    }

    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'free' ? 'character' : 'free';
        const btn = document.getElementById('cameraModeBtn');
        btn.textContent = `Camera: ${this.cameraMode === 'free' ? 'Free Mode' : 'Character Mode'}`;

        // Stop free camera scrolling when switching modes
        this.stopFreeCameraScroll();

        console.log('Camera mode switched to:', this.cameraMode);
    }

    focusPlayer() {
        // Move camera to focus on player
        const targetX = this.player.x - this.canvas.width / 2;
        this.camera.x = Math.max(0, targetX);

        // Force render to show immediate camera movement
        this.render();

        console.log('Camera focused on player at:', this.camera.x);
    }

    positionPlayerAtSceneStart() {
        const currentScene = this.sceneSystem.currentScene;
        if (currentScene && currentScene.settings) {
            // Position player so their center is at the start point
            // (subtract half width and half height to center the player)
            this.player.x = currentScene.settings.playerStartX - (this.player.width / 2);
            this.player.y = currentScene.settings.playerStartY - (this.player.height / 2);
            this.player.velocityX = 0;
            this.player.velocityY = 0;

            // Update camera to follow player to the new position
            if (this.camera) {
                this.camera.targetX = this.player.x;
                this.camera.targetY = this.player.y;
            }

            console.log('Player centered at scene start point:', {
                startPoint: [currentScene.settings.playerStartX, currentScene.settings.playerStartY],
                playerTopLeft: [this.player.x, this.player.y],
                playerSize: [this.player.width, this.player.height]
            });
        } else {
            console.log('No current scene found, player remains at default position');
        }
    }


    /* Keep for reference - moved to propSystem
    initializePropZOrders() {
        // Assign z-orders to any props that don't have them
        this.propSystem.props.forEach(prop => {
            if (prop.zOrder === undefined || prop.zOrder === null || isNaN(prop.zOrder)) {
                prop.zOrder = this.propSystem.nextPropZOrder++;
            }
        });

        // Update the next z-order counter to be higher than any existing z-order
        const maxExistingZOrder = this.propSystem.props.reduce((max, prop) =>
            Math.max(max, prop.zOrder || 0), 0);
        this.propSystem.nextPropZOrder = Math.max(this.propSystem.nextPropZOrder, maxExistingZOrder + 1);
    }
    */

    showCopyPasteFeedback(text, prop) {
        if (!prop) return;

        // Create a temporary feedback object to display
        if (!this.feedbackMessages) {
            this.feedbackMessages = [];
        }

        // Add feedback message with position and lifetime
        this.feedbackMessages.push({
            text: text,
            x: prop.x,
            y: prop.y - 20, // Above the prop
            lifetime: 120, // frames to display (about 2 seconds at 60fps)
            opacity: 1.0
        });
    }

    renderFeedbackMessages() {
        if (!this.feedbackMessages || this.feedbackMessages.length === 0) return;

        this.ctx.save();

        // Process each feedback message
        for (let i = this.feedbackMessages.length - 1; i >= 0; i--) {
            const msg = this.feedbackMessages[i];

            // Update lifetime and fade out
            msg.lifetime--;
            msg.y -= 0.3; // Float upward more slowly
            msg.opacity = Math.min(1.0, msg.lifetime / 60); // Fade out in last second

            // Remove expired messages
            if (msg.lifetime <= 0) {
                this.feedbackMessages.splice(i, 1);
                continue;
            }

            // Convert world coordinates to screen coordinates
            const screenX = (msg.x - this.camera.x) * this.viewport.scaleX + this.viewport.offsetX;
            const screenY = (msg.y - this.camera.y) * this.viewport.scaleY + this.viewport.offsetY;

            // Draw background
            this.ctx.globalAlpha = msg.opacity * 0.8;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(screenX - 30, screenY - 10, 60, 20);

            // Draw text
            this.ctx.globalAlpha = msg.opacity;
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(msg.text, screenX, screenY);
        }

        this.ctx.restore();
    }

    renderDragSelection() {
        if (!this.propSystem.isDragSelecting) return;

        const rect = this.propSystem.dragSelectionRect;
        if (!rect) return;

        // Apply camera transformation for world coordinates
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw selection rectangle
        this.ctx.strokeStyle = '#0099FF'; // Blue selection color
        this.ctx.fillStyle = 'rgba(0, 153, 255, 0.1)'; // Semi-transparent blue fill
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Dashed line

        // Fill and stroke the rectangle
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        // Reset line dash
        this.ctx.setLineDash([]);

        this.ctx.restore();
    }

    renderTransitionZoneDrag() {
        if (!this.isAddingTransition || !this.transitionStart) return;

        // Use existing mouse coordinates (already in world space)
        const endX = this.mouseX;
        const endY = this.mouseY;

        // Calculate drag rectangle
        const startX = this.transitionStart.x;
        const startY = this.transitionStart.y;

        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);

        // Apply camera transformation for world coordinates
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw transition zone preview in purple
        this.ctx.strokeStyle = '#9966FF'; // Purple border
        this.ctx.fillStyle = 'rgba(153, 102, 255, 0.2)'; // Semi-transparent purple fill
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 4]); // Dashed line

        // Fill and stroke the rectangle
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);

        // Add label
        this.ctx.fillStyle = '#9966FF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Transition Zone (${Math.round(width)}x${Math.round(height)})`, x, y - 5);

        // Reset line dash
        this.ctx.setLineDash([]);

        this.ctx.restore();
    }

    renderPoliceBarrier() {
        // Draw barrier at the actual canvas bottom in screen coordinates
        const stripeWidth = 40; // Width of each diagonal stripe
        const barrierHeight = 12; // Height of the barrier
        const canvasBottom = this.canvas.height;

        // Draw directly in screen coordinates (no camera transform)
        this.ctx.save();

        // Draw the barrier background at canvas bottom
        this.ctx.fillStyle = '#000000'; // Black background
        this.ctx.fillRect(0, canvasBottom - barrierHeight, this.canvas.width, barrierHeight);

        // Draw diagonal yellow stripes
        this.ctx.fillStyle = '#FFFF00'; // Bright yellow

        // Calculate how many stripes we need to cover the width
        const numStripes = Math.ceil(this.canvas.width / stripeWidth) + 2; // Extra stripes for offset

        for (let i = 0; i < numStripes; i++) {
            // Create diagonal stripes by drawing angled rectangles
            this.ctx.save();

            // Position for this stripe
            const xStart = (i * stripeWidth) - stripeWidth; // Start a bit left to ensure coverage

            // Create diagonal stripe path
            this.ctx.beginPath();
            this.ctx.moveTo(xStart, canvasBottom - barrierHeight);
            this.ctx.lineTo(xStart + stripeWidth/2, canvasBottom - barrierHeight);
            this.ctx.lineTo(xStart + stripeWidth, canvasBottom);
            this.ctx.lineTo(xStart + stripeWidth/2, canvasBottom);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }

        // Add a thin black border line at the very bottom
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, canvasBottom);
        this.ctx.lineTo(this.canvas.width, canvasBottom);
        this.ctx.stroke();

        this.ctx.restore();
    }

    handleKeyDown(e) {
        // Only handle keys in development mode
        if (!this.isDevelopmentMode) return;

        // Handle Copy (Ctrl+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            if (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0) {
                if (this.propSystem.data.copySelectedProps()) {
                    // Show visual feedback
                    this.showCopyPasteFeedback('Copied!', this.propSystem.selectedProp);
                    console.log('Props copied to clipboard');
                }
            }
        }

        // Handle Paste (Ctrl+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            if (this.propSystem.data.clipboard && this.propSystem.data.clipboard.length > 0) {
                // Use current mouse position (already in world coordinates)
                const pastedProps = this.propSystem.data.pasteProps(this.mouseX, this.mouseY);
                if (pastedProps.length > 0) {
                    this.propSystem.updatePropList();
                    this.propSystem.updatePropProperties();
                    // Show visual feedback at paste location
                    this.showCopyPasteFeedback('Pasted!', pastedProps[0]);
                    console.log(`Pasted ${pastedProps.length} prop(s)`);
                }
            }
        }

        // Handle Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Prevent default browser behavior

            if (this.platformSystem.selectedPlatform) {
                // Delete selected platform
                this.platformSystem.deleteSelectedPlatform();
            } else if (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0) {
                // Delete all selected props (handles both single and multiple selection)
                this.propSystem.deleteSelectedProps();
            }
        }

        // Handle arrow keys for nudging selected props
        if (this.propSystem.selectedProp || (this.propSystem.selectedProps && this.propSystem.selectedProps.length > 0)) {
            let nudgeX = 0;
            let nudgeY = 0;

            switch(e.key) {
                case 'ArrowLeft':
                    nudgeX = -1;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    nudgeX = 1;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    nudgeY = -1;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    nudgeY = 1;
                    e.preventDefault();
                    break;
            }

            if (nudgeX !== 0 || nudgeY !== 0) {
                // Check if Shift is held for larger movement (10px)
                const moveAmount = e.shiftKey ? 10 : 1;
                nudgeX *= moveAmount;
                nudgeY *= moveAmount;

                // Move selected props
                if (this.propSystem.selectedProps.length > 0) {
                    // Expand selection to include all group members
                    const expandedSelection = this.propSystem.data.expandSelectionToFullGroups(this.propSystem.selectedProps);

                    // Multi-selection nudge for all props in groups
                    expandedSelection.forEach(prop => {
                        prop.x += nudgeX;
                        prop.y += nudgeY;
                        // Update relative position if needed
                        if (prop.positioning === 'screen-relative' && this.viewport) {
                            this.propSystem.updateRelativePosition(
                                prop,
                                prop.x,
                                prop.y,
                                this.viewport.designWidth,
                                this.viewport.designHeight
                            );
                        }
                    });
                } else if (this.propSystem.selectedProp) {
                    // Single prop nudge - but check if it's grouped
                    const propsToMove = this.propSystem.selectedProp.groupId ?
                        this.propSystem.data.getPropsInSameGroup(this.propSystem.selectedProp) :
                        [this.propSystem.selectedProp];

                    propsToMove.forEach(prop => {
                        prop.x += nudgeX;
                        prop.y += nudgeY;
                        // Update relative position if needed
                        if (prop.positioning === 'screen-relative' && this.viewport) {
                            this.propSystem.updateRelativePosition(
                                prop,
                                prop.x,
                                prop.y,
                                this.viewport.designWidth,
                                this.viewport.designHeight
                            );
                        }
                    });
                }

                // Update the properties panel if visible
                this.propSystem.updatePropProperties();
            }
        }
    }


    /* Keep for reference - moved to propSystem
    deleteSelectedProp() {
        if (!this.propSystem.selectedProp) return;

        this.propSystem.props = this.propSystem.props.filter(prop => prop.id !== this.propSystem.selectedProp.id);
        this.propSystem.selectedProp = null;
        this.updatePropProperties();

        console.log('Prop deleted via Delete key');
    }
    */

    handlePlatformMouseUp(e) {
        // Handle transition zone creation completion
        if (this.isAddingTransition && this.transitionStart) {
            const rect = this.canvas.getBoundingClientRect();
            const clientMouseX = e.clientX - rect.left;
            const clientMouseY = e.clientY - rect.top;
            const worldCoords = this.screenToWorld(clientMouseX, clientMouseY);

            this.sceneSystem.handleTransitionCreation(
                this.transitionStart.x, this.transitionStart.y,
                worldCoords.x, worldCoords.y
            );

            this.isAddingTransition = false;
            this.transitionStart = null;
            return;
        }

        // Handle start position drag completion
        if (this.isDraggingStartPosition) {
            this.isDraggingStartPosition = false;
            this.startPositionDragOffset = { x: 0, y: 0 };
            return;
        }

        // Handle platform mouse up using the platform mouse handler
        this.platformMouseHandler.handleMouseUp();

        // Handle prop mouse up using the props mouse handler
        this.propsMouseHandler.handleMouseUp(e.ctrlKey);

        // Stop camera scrolling when drag ends
        this.stopDragScrolling();
    }

    updateCursor() {
        // Default cursor
        this.canvas.style.cursor = 'default';

        // Recalculate world coordinates to ensure consistency with mouse handlers
        const worldCoords = this.screenToWorld(this.lastMouseX, this.lastMouseY);
        const worldMouseX = worldCoords.x;
        const worldMouseY = worldCoords.y;

        // Check if mouse is over start position (highest priority)
        if (this.sceneSystem.renderer.isMouseOverStartPosition(worldMouseX, worldMouseY)) {
            this.canvas.style.cursor = 'move';
            return;
        }


        // Check if mouse is over any prop first (props have priority)
        // Find all props under mouse, then check the topmost one
        let propsUnderCursor = [];

        for (const prop of this.propSystem.props) {
            const propType = this.propTypes[prop.type];
            if (!propType) continue;

            const scale = prop.scale !== undefined ? prop.scale :
                         (prop.type === 'well' ? 1 :
                         (prop.type === 'barrel' || prop.type === 'crate') ? 1.2 :
                         (prop.type === 'smallPot' || prop.type === 'mediumPot' || prop.type === 'bigPot') ? 0.6 : 1.6);
            const renderWidth = propType.width * scale;
            const renderHeight = propType.height * scale;

            if (worldMouseX >= prop.x && worldMouseX <= prop.x + renderWidth &&
                worldMouseY >= prop.y && worldMouseY <= prop.y + renderHeight) {
                propsUnderCursor.push(prop);
            }
        }

        // If there are props under cursor, use move cursor for the topmost one
        if (propsUnderCursor.length > 0) {
            this.canvas.style.cursor = 'move';
            return; // Exit early, don't check platforms
        }

        // Check if mouse is over any platform or resize handle
        for (const platform of this.platformSystem.platforms) {
            // Get actual position for mouse interaction (same as platformMouseHandler)
            const actualPos = this.platformSystem.data.getActualPosition(platform, this.viewport.designWidth, this.viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };


            // Check for resize handle first
            const resizeHandle = this.platformSystem.getResizeHandle(renderPlatform, worldMouseX, worldMouseY);

            if (resizeHandle) {
                // Set appropriate cursor based on resize handle
                switch (resizeHandle) {
                    case 'nw':
                    case 'se':
                        this.canvas.style.cursor = 'nw-resize';
                        break;
                    case 'ne':
                    case 'sw':
                        this.canvas.style.cursor = 'ne-resize';
                        break;
                    case 'w':
                    case 'e':
                        this.canvas.style.cursor = 'ew-resize';
                        break;
                    case 'n':
                    case 's':
                        this.canvas.style.cursor = 'ns-resize';
                        break;
                }
                break; // Stop checking other platforms
            }

            // Check if mouse is inside platform area
            if (this.platformSystem.isPointInPlatform(worldMouseX, worldMouseY, renderPlatform)) {
                this.canvas.style.cursor = 'move';
                break; // Stop checking other platforms once we find one
            }
        }
    }

    // Platform-related methods have been moved to platformSystem




    async savePlatforms() {
        // Use the new scene system for saving
        if (this.sceneSystem) {
            this.sceneSystem.saveScenes();

            // Create the gameData object
            const gameData = {
                gameInfo: {
                    title: "Platform RPG Game",
                    version: "1.0.0",
                    lastModified: new Date().toISOString().split('T')[0]
                },
                scenes: this.sceneSystem.exportSceneData().scenes,
                characters: this.gameData.characters,
                classes: this.gameData.classes,
                weapons: this.gameData.weapons,
                items: this.gameData.items
            };

            try {
                // Try to save to gameData.json file
                const response = await fetch('./gameData.json', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gameData, null, 2)
                });

                if (response.ok) {
                    alert('Platforms and game data saved to gameData.json!');
                } else {
                    throw new Error('Could not save to file');
                }
            } catch (error) {
                console.log('Could not save directly to file, downloading instead...');
                // Fallback: trigger download
                this.exportGameData();
            }
        }
    }

    async loadGameDataFromFile() {
        // Check if we have saved scene data in localStorage first
        const savedSceneData = localStorage.getItem('platformGame_sceneData');
        if (savedSceneData) {
            console.log('✅ Found saved scene data in localStorage, using that instead of gameData.json');
            this.loadSavedData();
            return;
        }

        // If no localStorage data, try to load from gameData.json as fallback
        try {
            console.log('🔄 No localStorage data found, attempting to load gameData.json...');
            const response = await fetch('./gameData.json');
            if (response.ok) {
                console.log('✅ gameData.json found, loading from JSON file');
                const gameData = await response.json();
                this.loadGameDataFromObject(gameData);
            } else {
                console.log('❌ gameData.json response not ok, loading defaults');
                // No saved data and no JSON file, start fresh
                console.log('🆕 Starting with default game state');
            }
        } catch (error) {
            console.log('❌ No gameData.json found, error:', error);
            console.log('🆕 Starting with default game state');
        }
    }

    loadGameDataFromObject(gameData) {
        try {
            console.log('📁 Loading game data from object');

            // Check if scene system is already initialized
            if (this.sceneSystem && this.platformSpritesLoaded) {
                // Scene system is ready, import immediately
                if (gameData.scenes && gameData.scenes.length > 0) {
                    console.log('🔄 Importing scene data immediately (scene system is ready)');

                    // Import the scene data
                    this.sceneSystem.data.importSceneData({
                        scenes: gameData.scenes,
                        currentSceneId: gameData.currentSceneId || gameData.scenes[0].id,
                        startSceneId: gameData.startSceneId || gameData.scenes[0].id
                    });

                    console.log('📥 Imported scenes:', this.sceneSystem.data.scenes.map(s => ({
                        id: s.id,
                        name: s.name,
                        platforms: s.platforms?.length || 0,
                        props: s.props?.length || 0
                    })));

                    // Force clear the current platforms to ensure reload
                    this.platformSystem.platforms = [];

                    // Force load the start scene or current scene (bypass optimization)
                    const sceneToLoad = gameData.startSceneId || gameData.currentSceneId || gameData.scenes[0].id;
                    console.log('📥 Force loading imported scene:', sceneToLoad);
                    this.sceneSystem.manager.forceLoadScene(sceneToLoad);

                    // Save the imported data to localStorage
                    this.sceneSystem.saveScenes();

                    // Update UI
                    this.sceneSystem.updateUI();
                    this.platformSystem.updatePlatformList();
                    this.platformSystem.updatePlatformProperties();

                    console.log('✅ Scene data imported and saved to localStorage');
                }
            } else {
                // Store the scene data to be loaded after scene system initializes
                if (gameData.scenes && gameData.scenes.length > 0) {
                    this.pendingGameDataImport = {
                        scenes: gameData.scenes,
                        currentSceneId: gameData.currentSceneId || gameData.scenes[0].id,
                        startSceneId: gameData.startSceneId || gameData.scenes[0].id
                    };
                    console.log('📦 Stored scene data for later import (waiting for scene system)');
                }
            }

            // Load other game data immediately
            if (gameData.characters) {
                this.gameData.characters = gameData.characters;
            }
            if (gameData.classes) {
                this.gameData.classes = gameData.classes;
            }
            if (gameData.weapons) {
                this.gameData.weapons = gameData.weapons;
            }
            if (gameData.items) {
                this.gameData.items = gameData.items;
            }

            this.updateUI();
        } catch (e) {
            console.error('Error loading game data:', e);
        }
    }

    loadSavedData() {
        // Use the new scene system to load saved data
        if (this.sceneSystem) {
            this.sceneSystem.loadSavedScenes();
            return;
        }

        // All loading is now handled by the scene system in onPlatformSpritesLoaded()
    }

    exportGameData() {
        // Save current scene data using the new scene system
        if (this.sceneSystem) {
            this.sceneSystem.saveScenes();
        }

        // Get the full scene data including currentSceneId and startSceneId
        const sceneData = this.sceneSystem ? this.sceneSystem.exportSceneData() : { scenes: [], currentSceneId: null, startSceneId: null };

        const gameData = {
            gameInfo: {
                title: "Platform RPG Game",
                version: "1.0.0",
                lastModified: new Date().toISOString().split('T')[0]
            },
            scenes: sceneData.scenes,
            currentSceneId: sceneData.currentSceneId,
            startSceneId: sceneData.startSceneId,
            characters: this.gameData.characters,
            classes: this.gameData.classes,
            weapons: this.gameData.weapons,
            items: this.gameData.items
        };

        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'gameData.json';
        link.click();

        URL.revokeObjectURL(link.href);
    }

    updateSceneBoundaries() {
        const left = parseInt(document.getElementById('boundaryLeft').value) || 0;
        const right = parseInt(document.getElementById('boundaryRight').value) || 2000;
        const top = parseInt(document.getElementById('boundaryTop').value) || 0;
        const bottom = parseInt(document.getElementById('boundaryBottom').value) || 1000;

        // Validate boundaries
        if (left >= right) {
            alert('Left boundary must be less than right boundary');
            return;
        }
        if (top >= bottom) {
            alert('Top boundary must be less than bottom boundary');
            return;
        }

        this.sceneSystem.updateSceneBoundaries(left, right, top, bottom);
        console.log('🟩 Scene boundaries updated:', { left, right, top, bottom });
    }


    importGameData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                this.loadGameDataFromObject(gameData);

                // Reset platform editor
                this.platformSystem.selectedPlatform = null;
                this.platformSystem.updatePlatformProperties();
                this.platformSystem.updatePlatformList();

                alert('Game data imported successfully!');
            } catch (error) {
                alert('Error importing game data. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset the file input
        event.target.value = '';
    }

    // Context Menu Methods
    setupContextMenuListeners() {
        // Store context menu coordinates
        this.contextMenuCoords = { x: 0, y: 0 };

        // Copy coordinates action
        document.getElementById('copyCoordinates').addEventListener('click', () => {
            this.copyCoordinatesToClipboard();
            this.hideContextMenu();
        });

        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Hide context menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
            }
        });
    }

    showContextMenu(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;
        const worldCoords = this.screenToWorld(clientMouseX, clientMouseY);

        // Store coordinates for use by menu actions
        this.contextMenuCoords = {
            x: Math.round(worldCoords.x),
            y: Math.round(worldCoords.y),
            screenX: e.clientX,
            screenY: e.clientY
        };

        const contextMenu = document.getElementById('contextMenu');

        // Position the menu at the mouse location
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.display = 'block';

        // Adjust position if menu would go off screen
        const menuRect = contextMenu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            contextMenu.style.left = `${e.clientX - menuRect.width}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            contextMenu.style.top = `${e.clientY - menuRect.height}px`;
        }
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'none';
    }

    copyCoordinatesToClipboard() {
        const coordsText = `${this.contextMenuCoords.x}, ${this.contextMenuCoords.y}`;

        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(coordsText).then(() => {
                console.log('📋 Coordinates copied to clipboard:', coordsText);
                this.showTemporaryMessage(`Copied: ${coordsText}`);
            }).catch(err => {
                console.error('Failed to copy to clipboard:', err);
                this.fallbackCopyToClipboard(coordsText);
            });
        } else {
            // Fallback for older browsers or non-secure contexts
            this.fallbackCopyToClipboard(coordsText);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            console.log('📋 Coordinates copied to clipboard (fallback):', text);
            this.showTemporaryMessage(`Copied: ${text}`);
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.showTemporaryMessage('Copy failed - coordinates: ' + text);
        }

        document.body.removeChild(textArea);
    }

    showTemporaryMessage(message) {
        // Create a temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            left: ${this.contextMenuCoords.screenX + 10}px;
            top: ${this.contextMenuCoords.screenY - 30}px;
            background-color: rgba(0, 0, 0, 0.8);
            color: #ccc;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1001;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        `;

        document.body.appendChild(messageDiv);

        // Fade in
        setTimeout(() => {
            messageDiv.style.opacity = '1';
        }, 10);

        // Fade out and remove after 1.5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 200);
        }, 1500);
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time in milliseconds
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps (e.g., when switching tabs)
        if (this.deltaTime > 100) this.deltaTime = 16.67; // ~60fps fallback

        this.handleInput();
        this.updatePhysics();
        this.updatePlayerAnimation();
        this.updateCamera();
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

const game = new PlatformRPG();