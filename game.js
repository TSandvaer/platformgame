class PlatformRPG {
    constructor() {
        console.log('PlatformRPG constructor called!');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found! Make sure gameCanvas exists in the DOM.');
            throw new Error('Canvas element not found');
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context from canvas!');
            throw new Error('Could not get 2D context');
        }

        // Make canvas focusable for key events
        this.canvas.tabIndex = 0;
        // Editor system will be initialized after other systems
        this.editorSystem = null;
        this.showDashboard = true;

        // Use viewport height for consistent sizing across browsers
        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;

        // Delta time tracking for frame-rate independent animations
        this.lastTime = 0;
        this.deltaTime = 0;

        // Initialize player system
        this.playerSystem = new PlayerSystem();
        this.playerSystem.init();

        // Keep player reference for backwards compatibility during transition
        this.player = this.playerSystem.data;
        this.spritesLoaded = this.playerSystem.isReady();

        // Sprite loading coordination
        this.spritesLoaded = {
            platforms: false,
            props: false
        };
        this.allSpritesLoaded = false;

        // Background management
        this.backgrounds = {};
        this.currentBackground = null;
        this.loadAvailableBackgrounds();


        this.gravity = 0.8;
        this.friction = 0.8;

        // Initialize platform system
        this.platformSystem = new PlatformSystem(this.ctx, () => {
            this.spritesLoaded.platforms = true;
            this.checkAllSpritesLoaded();
        });

        // Initialize prop system
        this.torchParticles = [];
        this.propSystem = new PropSystem(this.ctx, this.platformSystem.renderer.platformSprites, this.torchParticles, () => {
            this.spritesLoaded.props = true;
            this.checkAllSpritesLoaded();
        });

        // Initialize scene system
        this.sceneSystem = new SceneSystem(this);

        // Scene interaction state
        this.isDraggingStartPosition = false;
        this.startPositionDragOffset = { x: 0, y: 0 };

        // Initialize mouse handlers (will be set after viewport and camera are ready)


        // Camera scrolling during drag
        this.dragScrollTimer = null;
        this.dragScrollDirection = null;
        this.lastMousePosition = { x: 0, y: 0 };

        // Initialize camera system
        this.cameraSystem = new CameraSystem(this);

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

        // Camera system will handle camera state

        this.updateViewport();


        // Initialize input system
        this.inputSystem = new InputSystem(this);

        // Initialize Editor System
        this.editorSystem = new EditorSystem(this);
        this.editorSystem.initialize();

        // Keep keys reference for backwards compatibility
        this.keys = this.inputSystem.keys;

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


    checkAllSpritesLoaded() {
        if (this.spritesLoaded.platforms && this.spritesLoaded.props) {
            this.allSpritesLoaded = true;
            console.log('🎨 All sprites loaded, initializing scene system...');
            this.onAllSpritesLoaded();
        }
    }

    onAllSpritesLoaded() {
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

        // Initialize camera system with canvas and viewport
        this.cameraSystem.init(this.canvas, this.viewport);

        // Then set development mode (which will call sceneSystem.updateUI())

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
                // Removed background loading debug message
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
            const scaledCameraX = this.cameraSystem.x * viewportScale;
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
        console.log('Game init() called!');
        // Setup UI button listeners
        this.setupUIListeners();
        this.setupAdditionalListeners();

        // Input system sets up all game input event listeners
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

    // Input event listeners are now handled by InputSystem

    showFeedbackMessage(message, worldX = null, worldY = null) {
        if (!this.feedbackMessages) {
            this.feedbackMessages = [];
        }

        // Use provided coordinates or default to center of screen
        let x, y;
        if (worldX !== null && worldY !== null) {
            // Use provided world coordinates
            x = worldX;
            y = worldY;
        } else {
            // Default to center of screen
            const centerX = this.canvas.width / 2;
            const centerY = 100;
            x = this.cameraSystem.x + centerX / this.viewport.scaleX;
            y = this.cameraSystem.y + centerY / this.viewport.scaleY;
        }

        this.feedbackMessages.push({
            text: message,
            x: x,
            y: y,
            lifetime: 120, // frames to display
            opacity: 1.0
        });
    }

    // Setup UI button listeners (not moved to input system)
    setupUIListeners() {
        console.log('setupUIListeners called!');
        console.log('Setting up dev mode button...');
        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });
        console.log('Dev mode button setup complete');

        console.log('Setting up production button...');
        document.getElementById('productionBtn').addEventListener('click', () => {
            this.setDevelopmentMode(false);
        });

        console.log('Setting up dashboard button...');
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
            this.cameraSystem.toggleMode();
        });

        document.getElementById('focusPlayerBtn').addEventListener('click', () => {
            this.cameraSystem.focusOnPlayer(this.player);
        });

        document.getElementById('backToDevBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
            this.canvas.height = window.innerHeight;
            this.updateViewport();
        });

        console.log('Reached group button setup section!');
        // Multi-selection and grouping event listeners
        const groupButton = document.getElementById('groupProps');
        console.log('Group button element found:', groupButton);
        if (groupButton) {
            groupButton.addEventListener('click', () => {
            console.log('Group button clicked! Selected props:', this.propSystem.selectedProps?.length || 0);
            console.log('Selected prop IDs:', this.propSystem.selectedProps?.map(p => p.id) || []);

            if (this.propSystem.selectedProps?.length < 2) {
                console.log('Not enough props selected for grouping');
                alert('Select at least 2 props to create a group');
                return;
            }

            const groupId = this.propSystem.groupSelectedProps();
            if (groupId) {
                console.log(`Created group ${groupId} with ${this.propSystem.selectedProps.length} props`);
                console.log('Props after grouping:', this.propSystem.selectedProps.map(p => `ID:${p.id} Group:${p.groupId}`));
            } else {
                console.log('Grouping failed - groupSelectedProps returned null');
                alert('Grouping failed');
            }
            });
        } else {
            console.error('Group button not found!');
        }

        const ungroupButton = document.getElementById('ungroupProps');
        console.log('Ungroup button element found:', ungroupButton);
        if (ungroupButton) {
            ungroupButton.addEventListener('click', () => {
                this.propSystem.ungroupSelectedProps();
                console.log('Ungrouped selected props');
            });
        } else {
            console.error('Ungroup button not found!');
        }

        document.getElementById('deleteSelectedProps').addEventListener('click', () => {
            if (this.propSystem.selectedProps.length > 0) {
                if (confirm(`Delete ${this.propSystem.selectedProps.length} selected props?`)) {
                    this.propSystem.deleteSelectedProps();
                }
            } else {
                alert('No props selected');
            }
        });
    }


    setDevelopmentMode(isDev) {
        // Delegate to editor system
        this.editorSystem.setDevelopmentMode(isDev);
    }

    // Getter for backward compatibility
    get isDevelopmentMode() {
        return this.editorSystem ? this.editorSystem.isDevelopmentMode : true;
    }

    toggleDashboard() {
        // Delegate to editor system
        this.editorSystem.toggleDashboard();
    }

    // Getters for backward compatibility
    get showDashboard() {
        return this.editorSystem ? this.editorSystem.showDashboard : true;
    }

    set showDashboard(value) {
        if (this.editorSystem) {
            this.editorSystem.showDashboard = value;
        }
    }

    handleInput() {
        // Delegate to input system
        this.inputSystem.updatePlayerInput();
    }


    updatePhysics() {
        // Delegate to player system
        this.playerSystem.update(
            this.deltaTime,
            this.isDevelopmentMode,
            this.platformSystem,
            this.propSystem,
            this.sceneSystem,
            this.viewport
        );

        // Apply scene boundaries
        const sceneBoundaries = this.sceneSystem.getSceneBoundaries();
        if (sceneBoundaries) {
            this.playerSystem.applyBoundaryConstraints(sceneBoundaries);
        }
    }


    updateCameraOld() {
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
            this.cameraSystem.x = Math.max(0, targetX);
            this.cameraSystem.y = Math.max(0, targetY);
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
        this.cameraSystem.x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
        this.cameraSystem.y = Math.max(minCameraY, Math.min(maxCameraY, targetY));

        // Special handling for hidden dashboard: force camera to left boundary to eliminate gaps
        if (!this.showDashboard) {
            // When dashboard is hidden, ensure camera doesn't create gaps on the left
            this.cameraSystem.x = Math.max(this.cameraSystem.x, bounds.left);
            // Also ensure viewport offset is 0 for proper alignment
            this.viewport.offsetX = 0;
        }

        // Debug logging for camera constraints (can be removed for production)
        // console.log('🎥 Camera constrained:', { target: { x: targetX, y: targetY }, actual: { x: this.cameraSystem.x, y: this.cameraSystem.y } });
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
        return this.cameraSystem.screenToWorld(screenX, screenY);
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return this.cameraSystem.worldToScreen(worldX, worldY);
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
        this.cameraSystem.applyTransform(this.ctx);

        // Disable image smoothing for crisp pixel art rendering
        this.ctx.imageSmoothingEnabled = false;

        // Debug: Log camera position during render
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp || this.isDraggingStartPosition) {
            console.log('Rendering with camera position:', this.cameraSystem.x, this.cameraSystem.y);
        }

        // Render platforms using the platform system
        this.platformSystem.renderPlatforms(this.isDevelopmentMode, this.viewport);

        // Render props (background props first, then obstacle props)
        this.propSystem.renderBackgroundProps(this.isDevelopmentMode, this.viewport);

        // Render player using the player system
        this.playerSystem.render(this.ctx, this.isDevelopmentMode);

        this.ctx.restore();

        // Restore viewport scaling as well for obstacle props
        this.ctx.restore();

        // Render obstacle props after removing transformations
        // They need special handling for proper coordinate transformation
        this.propSystem.renderObstacleProps(this.isDevelopmentMode, this.viewport, this.cameraSystem.camera);

        // Render torch particles after obstacle props (they need the same transformation)
        this.propSystem.renderParticles(this.viewport, this.cameraSystem.camera);

        if (this.isDevelopmentMode) {
            // Apply viewport scaling for dev rendering
            this.ctx.save();
            this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
            this.ctx.scale(this.viewport.scaleX, this.viewport.scaleY);

            // Apply camera transformation for scene development overlays
            this.ctx.save();
            this.cameraSystem.applyTransform(this.ctx);

            // Render scene development overlays (transition zones, boundaries, etc.)
            this.sceneSystem.renderer.renderDevelopmentOverlays(this.ctx);

            this.ctx.restore();

            // Render drag selection rectangle
            this.renderDragSelection();

            // Render transition zone drag preview
            this.renderTransitionZoneDrag();

            this.ctx.restore();

            // Render editor system development info
            if (this.editorSystem) {
                this.editorSystem.renderDevelopmentInfo(this.ctx);
            }
        }

        // Render feedback messages (copy/paste notifications) on top of everything
        // Should work in both development and production modes
        this.renderFeedbackMessages();
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

    }

    setupAdditionalListeners() {
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
                this.propSystem.movePropToBack();
            }
        });

        document.getElementById('bringToFront').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.propSystem.movePropToFront();
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


    handleStartPositionDrag() {
        if (!this.isDraggingStartPosition) return;

        // Calculate new position based on mouse position minus drag offset
        const newX = this.mouseX - this.startPositionDragOffset.x;
        const newY = this.mouseY - this.startPositionDragOffset.y;

        // Update the start position
        this.sceneSystem.renderer.updateStartPosition(newX, newY);
    }

    handleFreeCameraScroll(clientMouseX, clientMouseY) {
        // Only in development mode with free camera
        if (!this.isDevelopmentMode || this.cameraSystem.mode !== 'free') {
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
                const newCameraX = Math.max(0, this.cameraSystem.x - scrollSpeed);
                this.cameraSystem.x = newCameraX;
            } else if (direction === 'right') {
                this.cameraSystem.x += scrollSpeed;
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

    toggleCameraModeOld() {
        this.cameraMode = this.cameraMode === 'free' ? 'character' : 'free';
        const btn = document.getElementById('cameraModeBtn');
        btn.textContent = `Camera: ${this.cameraMode === 'free' ? 'Free Mode' : 'Character Mode'}`;

        // Stop free camera scrolling when switching modes
        this.stopFreeCameraScroll();

        console.log('Camera mode switched to:', this.cameraMode);
    }

    focusPlayerOld() {
        // Move camera to focus on player
        const targetX = this.player.x - this.canvas.width / 2;
        this.cameraSystem.x = Math.max(0, targetX);

        // Force render to show immediate camera movement
        this.render();

        console.log('Camera focused on player at:', this.cameraSystem.x);
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
            if (this.cameraSystem) {
                this.cameraSystem.camera.targetX = this.player.x;
                this.cameraSystem.camera.targetY = this.player.y;
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
            const screenX = (msg.x - this.cameraSystem.x) * this.viewport.scaleX + this.viewport.offsetX;
            const screenY = (msg.y - this.cameraSystem.y) * this.viewport.scaleY + this.viewport.offsetY;

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
        this.cameraSystem.applyTransform(this.ctx);

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
        // Delegate to editor system
        if (this.editorSystem) {
            this.ctx.save();
            this.cameraSystem.applyTransform(this.ctx);
            this.editorSystem.renderTransitionPreview(this.ctx);
            this.ctx.restore();
        }
    }

    // renderPoliceBarrier method removed

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
            if (this.sceneSystem && this.allSpritesLoaded) {
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

    showContextMenu(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;
        const worldCoords = this.cameraSystem.screenToWorld(clientMouseX, clientMouseY);

        // Delegate to editor system's context menu
        this.editorSystem.contextMenu.show(e, worldCoords);
    }

    hideContextMenu() {
        // Delegate to editor system's context menu
        this.editorSystem.contextMenu.hide();
    }

    copyCoordinatesToClipboard() {
        // Get coordinates from editor system
        const coords = this.editorSystem.contextMenuCoords;
        if (coords) {
            this.editorSystem.tools.copyCoordinates(coords.x, coords.y);
        }
    }

    // Getters for backward compatibility
    get contextMenuCoords() {
        return this.editorSystem ? this.editorSystem.contextMenuCoords : null;
    }

    set contextMenuCoords(value) {
        if (this.editorSystem) {
            this.editorSystem.contextMenuCoords = value;
        }
    }

    // Keep showTemporaryMessage for backward compatibility
    showTemporaryMessage(message) {
        if (this.editorSystem && this.editorSystem.ui) {
            this.editorSystem.ui.showTemporaryMessage(message);
        }
    }

    // Transition zone getters for backward compatibility
    get isAddingTransition() {
        return this.editorSystem ? this.editorSystem.isAddingTransition : false;
    }

    set isAddingTransition(value) {
        if (this.editorSystem) {
            this.editorSystem.isAddingTransition = value;
        }
    }

    get transitionStart() {
        return this.editorSystem ? this.editorSystem.transitionStart : null;
    }

    set transitionStart(value) {
        if (this.editorSystem) {
            this.editorSystem.transitionStart = value;
        }
    }

    get transitionEnd() {
        return this.editorSystem ? this.editorSystem.transitionEnd : null;
    }

    set transitionEnd(value) {
        if (this.editorSystem) {
            this.editorSystem.transitionEnd = value;
        }
    }


    gameLoop(currentTime = 0) {
        // Calculate delta time in milliseconds
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps (e.g., when switching tabs)
        if (this.deltaTime > 100) this.deltaTime = 16.67; // ~60fps fallback

        this.handleInput();
        this.updatePhysics();
        this.cameraSystem.update(this.player, this.sceneSystem, this.platformSystem, this.propSystem, this.isDraggingStartPosition);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Wait for DOM to be ready before creating the game
window.addEventListener('DOMContentLoaded', () => {
    const game = new PlatformRPG();
    window.game = game; // Make it available globally for debugging
});