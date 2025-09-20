class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
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
            designHeight: window.innerHeight,   // Match actual window height for consistent scene boundary
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

        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;

        this.scenes = [
            {
                id: 1,
                name: 'Tutorial',
                description: 'Starting scene with basic platforms',
                platforms: [...this.platformSystem.platforms],
                props: [...this.propSystem.props],
                background: {
                    name: 'none',
                    layers: []
                }
            }
        ];

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

        // Load ground tileset
        const groundImg = new Image();
        groundImg.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                this.platformSpritesLoaded = true;
            }
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
            if (loadedCount === totalImages) {
                this.platformSpritesLoaded = true;
            }
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
            if (loadedCount === totalImages) {
                this.platformSpritesLoaded = true;
            }
        };
        torchFlameImg.onerror = () => {
            console.error('Failed to load torch flame sprite');
        };
        torchFlameImg.src = 'sprites/Pixel Art Platformer/Texture/TX FX Torch Flame.png';
        this.platformSprites.torchFlame.image = torchFlameImg;
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
        // Update current scene background
        if (this.scenes.length > 0) {
            // Initialize background property if it doesn't exist
            if (!this.scenes[0].background) {
                this.scenes[0].background = {
                    name: 'none',
                    layers: []
                };
            }
            this.scenes[0].background.name = backgroundName;
            this.scenes[0].background.layers = [];
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
        this.setDevelopmentMode(true); // Properly initialize development mode UI
        this.populateBackgroundDropdown();
        this.updateViewport(); // Ensure viewport is properly initialized
        this.updateViewportUI(); // Initialize viewport UI
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

            // Handle space key for jump (one-time trigger)
            if (e.key === ' ' && this.player.onGround && !this.isDevelopmentMode && !this.player.spaceKeyPressed) {
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

        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });

        document.getElementById('productionBtn').addEventListener('click', () => {
            this.setDevelopmentMode(false);
        });

        document.getElementById('toggleDashboardBtn').addEventListener('click', () => {
            this.toggleDashboard();
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
            this.handleKeyDown(e);
        });

        this.setupPlatformEditorListeners();
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

        if (isDev) {
            this.platformSystem.updatePlatformList();
            this.propSystem.updatePropList();
        }
    }

    toggleDashboard() {
        this.showDashboard = !this.showDashboard;
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.toggle('hidden', !this.showDashboard);
        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;
        this.updateViewport();
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
            // Use delta time for framerate-independent physics (60fps = 16.67ms baseline)
            const physicsMultiplier = this.deltaTime / 16.67;

            this.player.velocityY += this.gravity * physicsMultiplier;

            this.player.x += this.player.velocityX * physicsMultiplier;
            this.player.y += this.player.velocityY * physicsMultiplier;

            this.player.onGround = false;

            // Check collision with platforms using actual positions
            this.platformSystem.checkPlayerPlatformCollisions(this.player, this.viewport);

            // Check collision with obstacle props
            this.propSystem.checkPlayerPropCollisions(this.player, this.viewport);

            if (this.player.y > this.viewport.designHeight) {
                this.player.x = 100;
                this.player.y = 400;
                this.player.velocityX = 0;
                this.player.velocityY = 0;
            }
        }
    }


    updateCamera() {
        // Don't update camera automatically during drag operations
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp || this.platformSystem.isResizing) {
            return;
        }

        // Handle camera based on mode and game state
        if (this.cameraMode === 'character') {
            // Character mode: always follow player
            const targetX = this.player.x - this.canvas.width / 2;
            this.camera.x = Math.max(0, targetX);
        } else if (this.cameraMode === 'free') {
            // Free mode: only follow player in production mode
            if (!this.isDevelopmentMode) {
                const targetX = this.player.x - this.canvas.width / 2;
                this.camera.x = Math.max(0, targetX);
            }
            // In development mode with free camera, camera stays manual
        }
    }

    updateViewport() {
        this.viewport.actualWidth = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.viewport.actualHeight = window.innerHeight;
        this.viewport.designHeight = window.innerHeight; // Keep design height in sync with actual height

        // Calculate scale factors
        const scaleX = this.viewport.actualWidth / this.viewport.designWidth;
        const scaleY = this.viewport.actualHeight / this.viewport.designHeight;

        switch (this.viewport.mode) {
            case 'fit':
                // Fit with aspect ratio preserved (letterbox/pillarbox)
                this.viewport.scale = Math.min(scaleX, scaleY);
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;
                this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
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
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp) {
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

            // Draw yellow and black striped police barrier at bottom of scene
            this.renderPoliceBarrier();

            // Render drag selection rectangle
            this.renderDragSelection();

            this.ctx.restore();

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
        document.getElementById('scenesList').innerHTML = this.scenes.map(scene =>
            `<div class="item">
                <div class="item-name">${scene.name}</div>
                <div class="item-details">${scene.description}</div>
            </div>`
        ).join('');

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

        document.getElementById('savePlatforms').addEventListener('click', () => {
            this.savePlatforms();
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
                this.propSystem.props = this.propSystem.props.filter(prop => prop.id !== this.propSystem.selectedProp.id);
                this.propSystem.selectedProp = null;
                this.propSystem.updatePropProperties();
                this.propSystem.updatePropList();
            }
        });

        document.getElementById('sendToBackground').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.sendPropToBackground(this.propSystem.selectedProp);
            }
        });

        document.getElementById('bringToFront').addEventListener('click', () => {
            if (this.propSystem.selectedProp) {
                this.bringPropToFront(this.propSystem.selectedProp);
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


        // Check for prop clicks first (props should be selectable before platforms)
        // Pass both world and viewport coordinates for proper handling
        const propResult = this.propSystem.handleMouseDown(worldMouseX, worldMouseY, this.platformSystem, e.ctrlKey, e.shiftKey, this.viewport, this.camera);
        if (propResult.handled) {
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return;
        }

        for (let platform of this.platformSystem.platforms) {
            // Get actual position for mouse interaction
            const actualPos = this.platformSystem.data.getActualPosition(platform, this.viewport.designWidth, this.viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            const resizeHandle = this.platformSystem.getResizeHandle(renderPlatform, worldMouseX, worldMouseY);
            if (resizeHandle) {
                this.platformSystem.isResizing = true;
                this.platformSystem.resizeHandle = resizeHandle;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.updatePlatformProperties();
                return;
            }

            if (this.platformSystem.isPointInPlatform(worldMouseX, worldMouseY, renderPlatform)) {
                this.platformSystem.isDragging = true;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.dragOffset = {
                    x: worldMouseX - actualPos.x,
                    y: worldMouseY - actualPos.y
                };
                this.platformSystem.updatePlatformProperties();
                this.platformSystem.updatePlatformList();
                return;
            }
        }

        // No platform was clicked - start drag selection for props
        this.platformSystem.selectedPlatform = null;
        this.platformSystem.updatePlatformProperties();
        this.platformSystem.updatePlatformList();

        // Start drag selection if no platform was selected
        this.propSystem.data.startDragSelection(worldMouseX, worldMouseY);
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

        // Handle prop dragging (use world coordinates and pass camera)
        const propMoved = this.propSystem.handleMouseMove(worldMouseX, worldMouseY, this.viewport, this.camera);
        if (propMoved) {
            this.propSystem.updatePropProperties();
            return;
        }

        if (!this.platformSystem.selectedPlatform) return;

        if (this.platformSystem.isDragging) {
            // Calculate new position based on mouse (use world coordinates)
            const newX = worldMouseX - this.platformSystem.dragOffset.x;
            const newY = worldMouseY - this.platformSystem.dragOffset.y;

            // Apply snapping
            const snappedPos = this.platformSystem.snapPlatformPosition(this.platformSystem.selectedPlatform, newX, newY);

            // Apply boundary constraints - prevent platform from going outside scene bounds
            const platform = this.platformSystem.selectedPlatform;
            const leftEdge = 0;
            const bottomEdge = this.viewport.designHeight;

            // Platform left edge should not go beyond scene left edge
            const minX = leftEdge;
            const constrainedX = Math.max(snappedPos.x, minX);

            // Platform bottom should align exactly with scene bottom (cyan line)
            const maxY = bottomEdge - platform.height;
            const constrainedY = Math.min(snappedPos.y, maxY);


            // Update both absolute and relative positions
            this.platformSystem.data.updateRelativePosition(
                this.platformSystem.selectedPlatform,
                constrainedX,
                constrainedY,
                this.viewport.designWidth,
                this.viewport.designHeight
            );
            this.platformSystem.updatePlatformProperties();

            // Force render during drag to show camera movement immediately
            this.render();
        } else if (this.platformSystem.isResizing) {
            this.platformSystem.handlePlatformResize(worldMouseX, worldMouseY);
            this.platformSystem.updatePlatformProperties();
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

            // Check if platform left edge is near left screen edge
            if (platformScreenLeft < scrollTriggerZone) {
                newDirection = 'left';
                console.log('Platform left edge near screen left, should scroll left');
            }
            // Check if platform right edge is near right screen edge
            else if (platformScreenRight > canvasWidth - scrollTriggerZone) {
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

    sendPropToBackground(prop) {
        // Get all z-orders, filtering out undefined/null values and converting to numbers
        const zOrders = this.propSystem.props.map(p => p.zOrder || 0).filter(z => !isNaN(z));

        // Find the lowest z-order, defaulting to 0 if no valid z-orders exist
        const minZOrder = zOrders.length > 0 ? Math.min(...zOrders) : 0;

        // Set this prop's z-order to be lower than the minimum
        prop.zOrder = minZOrder - 1;

        console.log(`Sent prop ${prop.type} to background with z-order: ${prop.zOrder}`);
    }

    bringPropToFront(prop) {
        // Get all z-orders, filtering out undefined/null values and converting to numbers
        const zOrders = this.propSystem.props.map(p => p.zOrder || 0).filter(z => !isNaN(z));

        // Find the highest z-order, defaulting to 0 if no valid z-orders exist
        const maxZOrder = zOrders.length > 0 ? Math.max(...zOrders) : 0;

        // Set this prop's z-order to be higher than the maximum
        prop.zOrder = maxZOrder + 1;

        // Update the next z-order counter to be higher
        this.propSystem.nextPropZOrder = Math.max(this.propSystem.nextPropZOrder, prop.zOrder + 1);

        console.log(`Brought prop ${prop.type} to front with z-order: ${prop.zOrder}`);
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

    renderPoliceBarrier() {
        // Draw barrier at the scene boundary, which now matches the browser window bottom
        const y = this.viewport.designHeight;
        const stripeWidth = 40; // Width of each diagonal stripe
        const barrierHeight = 12; // Height of the barrier

        // Apply camera transformation for world coordinates
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw the barrier background (slightly above the bottom line)
        this.ctx.fillStyle = '#000000'; // Black background
        this.ctx.fillRect(0, y - barrierHeight, this.viewport.designWidth, barrierHeight);

        // Draw diagonal yellow stripes
        this.ctx.fillStyle = '#FFFF00'; // Bright yellow

        // Calculate how many stripes we need to cover the width
        const totalWidth = this.viewport.designWidth;
        const numStripes = Math.ceil(totalWidth / stripeWidth) + 2; // Extra stripes for offset

        for (let i = 0; i < numStripes; i++) {
            // Create diagonal stripes by drawing angled rectangles
            this.ctx.save();

            // Position for this stripe
            const xStart = (i * stripeWidth) - stripeWidth; // Start a bit left to ensure coverage

            // Create diagonal stripe path
            this.ctx.beginPath();
            this.ctx.moveTo(xStart, y - barrierHeight);
            this.ctx.lineTo(xStart + stripeWidth/2, y - barrierHeight);
            this.ctx.lineTo(xStart + stripeWidth, y);
            this.ctx.lineTo(xStart + stripeWidth/2, y);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }

        // Add a thin black border line at the very bottom
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.viewport.designWidth, y);
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
        this.platformSystem.isDragging = false;
        this.platformSystem.isResizing = false;
        this.platformSystem.resizeHandle = null;

        // Handle prop mouse up (includes single and multi-selection dragging)
        this.propSystem.handleMouseUp(e.ctrlKey, this.viewport);

        // Stop camera scrolling when drag ends
        this.stopDragScrolling();
    }

    updateCursor() {
        // Default cursor
        this.canvas.style.cursor = 'default';

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

            if (this.mouseX >= prop.x && this.mouseX <= prop.x + renderWidth &&
                this.mouseY >= prop.y && this.mouseY <= prop.y + renderHeight) {
                propsUnderCursor.push(prop);
            }
        }

        // If there are props under cursor, use move cursor for the topmost one
        if (propsUnderCursor.length > 0) {
            this.canvas.style.cursor = 'move';
            return; // Exit early, don't check platforms
        }

        // Check if mouse is over any platform
        for (const platform of this.platformSystem.platforms) {
            if (this.mouseX >= platform.x && this.mouseX <= platform.x + platform.width &&
                this.mouseY >= platform.y && this.mouseY <= platform.y + platform.height) {

                // Check if mouse is near corners (resize handles)
                const cornerSize = 8; // Size of corner resize area
                const isNearLeft = this.mouseX <= platform.x + cornerSize;
                const isNearRight = this.mouseX >= platform.x + platform.width - cornerSize;
                const isNearTop = this.mouseY <= platform.y + cornerSize;
                const isNearBottom = this.mouseY >= platform.y + platform.height - cornerSize;

                if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
                    // Resize cursors for corners
                    if ((isNearLeft && isNearTop) || (isNearRight && isNearBottom)) {
                        this.canvas.style.cursor = 'nw-resize';
                    } else if ((isNearRight && isNearTop) || (isNearLeft && isNearBottom)) {
                        this.canvas.style.cursor = 'ne-resize';
                    } else if (isNearLeft || isNearRight) {
                        this.canvas.style.cursor = 'ew-resize';
                    } else if (isNearTop || isNearBottom) {
                        this.canvas.style.cursor = 'ns-resize';
                    }
                } else {
                    // Move cursor for platform body
                    this.canvas.style.cursor = 'move';
                }
                break; // Stop checking other platforms once we find one
            }
        }
    }

    // Platform-related methods have been moved to platformSystem

    snapPlatformPosition(platform, newX, newY) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;

        // Check against all other platforms
        for (const otherPlatform of this.platformSystem.platforms) {
            if (otherPlatform.id === platform.id) continue; // Skip self

            // Horizontal snapping (left/right edges)
            // Left edge of moving platform to right edge of other platform
            if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                snappedX = otherPlatform.x + otherPlatform.width;
            }
            // Right edge of moving platform to left edge of other platform
            else if (Math.abs((newX + platform.width) - otherPlatform.x) <= snapDistance) {
                snappedX = otherPlatform.x - platform.width;
            }
            // Left edges align
            else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                snappedX = otherPlatform.x;
            }
            // Right edges align
            else if (Math.abs((newX + platform.width) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                snappedX = otherPlatform.x + otherPlatform.width - platform.width;
            }

            // Vertical snapping (top/bottom edges)
            // Top edge of moving platform to bottom edge of other platform
            if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                snappedY = otherPlatform.y + otherPlatform.height;
            }
            // Bottom edge of moving platform to top edge of other platform
            else if (Math.abs((newY + platform.height) - otherPlatform.y) <= snapDistance) {
                snappedY = otherPlatform.y - platform.height;
            }
            // Top edges align
            else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                snappedY = otherPlatform.y;
            }
            // Bottom edges align
            else if (Math.abs((newY + platform.height) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                snappedY = otherPlatform.y + otherPlatform.height - platform.height;
            }
        }

        return { x: snappedX, y: snappedY };
    }

    snapResizePosition(platform, newX, newY, newWidth, newHeight, resizeHandle) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;
        let snappedWidth = newWidth;
        let snappedHeight = newHeight;

        // Check against all other platforms
        for (const otherPlatform of this.platformSystem.platforms) {
            if (otherPlatform.id === platform.id) continue; // Skip self

            // Snap based on resize handle type
            switch (resizeHandle) {
                case 'w': // Left edge resize
                    // Snap left edge to right edge of other platform
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Snap left edge to left edge of other platform
                    else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    break;

                case 'e': // Right edge resize
                    // Snap right edge to left edge of other platform
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    }
                    // Snap right edge to right edge of other platform
                    else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = (otherPlatform.x + otherPlatform.width) - newX;
                    }
                    break;

                case 'n': // Top edge resize
                    // Snap top edge to bottom edge of other platform
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    // Snap top edge to top edge of other platform
                    else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 's': // Bottom edge resize
                    // Snap bottom edge to top edge of other platform
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    }
                    // Snap bottom edge to bottom edge of other platform
                    else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = (otherPlatform.y + otherPlatform.height) - newY;
                    }
                    break;

                // Corner resize handles can snap both dimensions
                case 'nw': // Top-left corner
                    // Snap left edge
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    } else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Snap top edge
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    } else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 'ne': // Top-right corner
                    // Snap right edge
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    } else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = (otherPlatform.x + otherPlatform.width) - newX;
                    }
                    // Snap top edge
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    } else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 'sw': // Bottom-left corner
                    // Snap left edge
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    } else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Snap bottom edge
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    } else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = (otherPlatform.y + otherPlatform.height) - newY;
                    }
                    break;

                case 'se': // Bottom-right corner
                    // Snap right edge
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    } else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = (otherPlatform.x + otherPlatform.width) - newX;
                    }
                    // Snap bottom edge
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    } else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = (otherPlatform.y + otherPlatform.height) - newY;
                    }
                    break;
            }
        }

        return { x: snappedX, y: snappedY, width: snappedWidth, height: snappedHeight };
    }



    async savePlatforms() {
        // Update the current scene with the current platforms and props
        if (this.scenes.length > 0) {
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platformSystem.platforms));
            this.scenes[0].props = JSON.parse(JSON.stringify(this.propSystem.props));

            // Save to localStorage as backup
            localStorage.setItem('platformGame_scenes', JSON.stringify(this.scenes));

            // Create the gameData object
            const gameData = {
                gameInfo: {
                    title: "Platform RPG Game",
                    version: "1.0.0",
                    lastModified: new Date().toISOString().split('T')[0]
                },
                scenes: this.scenes,
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
        try {
            console.log('🔄 Attempting to load gameData.json...');
            const response = await fetch('./gameData.json');
            if (response.ok) {
                console.log('✅ gameData.json found, loading from JSON file');
                const gameData = await response.json();
                this.loadGameDataFromObject(gameData);
            } else {
                console.log('❌ gameData.json response not ok, falling back to localStorage');
                // Fallback to localStorage if JSON file not found
                this.loadSavedData();
            }
        } catch (error) {
            console.log('❌ No gameData.json found, error:', error);
            console.log('🔄 Falling back to localStorage');
            // Fallback to localStorage
            this.loadSavedData();
        }
    }

    loadGameDataFromObject(gameData) {
        try {
            console.log('📁 Loading game data from object');
            if (gameData.scenes && gameData.scenes.length > 0) {
                this.scenes = gameData.scenes;
                if (this.scenes[0].platforms) {
                    this.platformSystem.platforms = [...this.scenes[0].platforms];

                    // Migrate platforms to ensure they have positioning properties
                    this.platformSystem.platforms.forEach(platform => {
                        if (!platform.positioning) {
                            platform.positioning = 'absolute';
                            platform.relativeX = 0.5;
                            platform.relativeY = 0.5;
                            console.log(`Migrated platform ${platform.id} to have positioning properties`);
                        }
                    });

                    this.platformSystem.nextPlatformId = Math.max(...this.platformSystem.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes[0].props) {
                    this.propSystem.props = [...this.scenes[0].props];

                    // Initialize groups from loaded props
                    this.propSystem.data.initializeGroupsFromProps();

                    // Migrate props to ensure they have positioning properties and convert scale to sizeMultiplier
                    let migratedCount = 0;
                    let scaleConvertCount = 0;
                    this.propSystem.props.forEach(prop => {
                        if (!prop.positioning) {
                            prop.positioning = 'absolute';
                            prop.relativeX = 0.5;
                            prop.relativeY = 0.5;
                            migratedCount++;
                        }

                        // Migrate scale to sizeMultiplier
                        if (prop.scale !== undefined && prop.sizeMultiplier === undefined) {
                            prop.sizeMultiplier = prop.scale;
                            delete prop.scale;
                            scaleConvertCount++;
                        }

                        // Remove old width/height properties as they're calculated from sizeMultiplier now
                        delete prop.width;
                        delete prop.height;
                    });
                    if (migratedCount > 0) {
                        console.log(`✅ Migrated ${migratedCount} props to have positioning properties`);
                    }
                    if (scaleConvertCount > 0) {
                        console.log(`✅ Converted ${scaleConvertCount} props from scale to sizeMultiplier`);
                    }

                    this.propSystem.nextPropId = Math.max(...this.propSystem.props.map(p => p.id || 0)) + 1;
                }

                // Restore background if it exists
                if (this.scenes[0].background && this.scenes[0].background.name && this.scenes[0].background.name !== 'none') {
                    console.log('🎨 Loading background:', this.scenes[0].background.name);
                    this.loadBackground(this.scenes[0].background.name);

                    // Update the UI dropdown to match the loaded background (with small delay for DOM)
                    setTimeout(() => {
                        const backgroundSelect = document.getElementById('backgroundSelect');
                        if (backgroundSelect) {
                            backgroundSelect.value = this.scenes[0].background.name;
                            console.log('📝 Set dropdown to:', this.scenes[0].background.name);
                        }
                    }, 100);
                } else {
                    console.log('⚠️ No background found in scene data');
                }
            }

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
        const savedScenes = localStorage.getItem('platformGame_scenes');
        if (savedScenes) {
            try {
                this.scenes = JSON.parse(savedScenes);
                if (this.scenes.length > 0 && this.scenes[0].platforms) {
                    this.platformSystem.platforms = [...this.scenes[0].platforms];

                    // Migrate platforms to ensure they have positioning properties
                    this.platformSystem.platforms.forEach(platform => {
                        if (!platform.positioning) {
                            platform.positioning = 'absolute';
                            platform.relativeX = 0.5;
                            platform.relativeY = 0.5;
                            console.log(`Migrated platform ${platform.id} to have positioning properties (localStorage)`);
                        }
                    });

                    this.platformSystem.nextPlatformId = Math.max(...this.platformSystem.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes.length > 0 && this.scenes[0].props) {
                    this.propSystem.props = [...this.scenes[0].props];

                    // Initialize groups from loaded props
                    this.propSystem.data.initializeGroupsFromProps();

                    // Migrate props to ensure they have positioning properties and convert scale to sizeMultiplier
                    let migratedCount = 0;
                    let scaleConvertCount = 0;
                    this.propSystem.props.forEach(prop => {
                        if (!prop.positioning) {
                            prop.positioning = 'absolute';
                            prop.relativeX = 0.5;
                            prop.relativeY = 0.5;
                            migratedCount++;
                        }

                        // Migrate scale to sizeMultiplier
                        if (prop.scale !== undefined && prop.sizeMultiplier === undefined) {
                            prop.sizeMultiplier = prop.scale;
                            delete prop.scale;
                            scaleConvertCount++;
                        }

                        // Remove old width/height properties as they're calculated from sizeMultiplier now
                        delete prop.width;
                        delete prop.height;
                    });
                    if (migratedCount > 0) {
                        console.log(`✅ Migrated ${migratedCount} props to have positioning properties (localStorage)`);
                    }
                    if (scaleConvertCount > 0) {
                        console.log(`✅ Converted ${scaleConvertCount} props from scale to sizeMultiplier (localStorage)`);
                    }

                    this.propSystem.nextPropId = Math.max(...this.propSystem.props.map(p => p.id || 0)) + 1;
                }

                // Restore background if it exists
                if (this.scenes.length > 0 && this.scenes[0].background && this.scenes[0].background.name && this.scenes[0].background.name !== 'none') {
                    this.loadBackground(this.scenes[0].background.name);

                    // Update the UI dropdown to match the loaded background (with small delay for DOM)
                    setTimeout(() => {
                        const backgroundSelect = document.getElementById('backgroundSelect');
                        if (backgroundSelect) {
                            backgroundSelect.value = this.scenes[0].background.name;
                        }
                    }, 100);
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    exportGameData() {
        // Update current scene with current platforms and props
        if (this.scenes.length > 0) {
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platformSystem.platforms));
            this.scenes[0].props = JSON.parse(JSON.stringify(this.propSystem.props));
        }

        const gameData = {
            gameInfo: {
                title: "Platform RPG Game",
                version: "1.0.0",
                lastModified: new Date().toISOString().split('T')[0]
            },
            scenes: this.scenes,
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