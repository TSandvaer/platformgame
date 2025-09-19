class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDevelopmentMode = true;
        this.showDashboard = true;

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

        this.camera = {
            x: 0,
            y: 0
        };

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
        // For now, manually define available backgrounds
        // In a real system, this would scan the backgrounds folder
        this.availableBackgrounds = [
            'none',
            'The Dawn'
        ];
    }

    loadBackground(backgroundName) {
        if (backgroundName === 'none' || !backgroundName) {
            this.currentBackground = null;
            return;
        }

        if (this.backgrounds[backgroundName]) {
            this.currentBackground = this.backgrounds[backgroundName];
            return;
        }

        // Load background layers
        const background = {
            name: backgroundName,
            layers: [],
            layersLoaded: 0,
            totalLayers: 8 // Assuming 8 layers based on folder structure
        };

        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            const imagePath = `backgrounds/${backgroundName}/${backgroundName}/Layers/${i}.png`;

            img.onload = () => {
                background.layersLoaded++;
            };
            img.onerror = (error) => {
                console.warn(`Failed to load background layer ${i} for "${backgroundName}"`);
            };
            img.src = imagePath;
            background.layers.push(img);
        }

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

    renderBackground() {
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
            const parallaxOffset = this.camera.x * parallaxSpeed;

            // Calculate how many times we need to repeat the image to fill the screen
            const imageWidth = layer.naturalWidth;
            const imageHeight = layer.naturalHeight;

            // Scale the image to fit the canvas height while maintaining aspect ratio
            const scale = this.canvas.height / imageHeight;
            const scaledWidth = imageWidth * scale;

            // Calculate starting position to ensure seamless repetition
            const startX = -parallaxOffset % scaledWidth;
            const tilesNeeded = Math.ceil((this.canvas.width + scaledWidth) / scaledWidth);

            // Draw repeated background tiles
            for (let i = 0; i < tilesNeeded; i++) {
                const x = startX + (i * scaledWidth);
                this.ctx.drawImage(
                    layer,
                    x, 0,  // Position
                    scaledWidth, this.canvas.height  // Size
                );
            }
        });
    }

    init() {
        this.setupEventListeners();
        this.setDevelopmentMode(true); // Properly initialize development mode UI
        this.gameLoop();
        this.updateUI();
        this.loadGameDataFromFile();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Handle Ctrl key for attack
            if (e.key === 'Control' && !this.player.isAttacking) {
                e.preventDefault(); // Prevent browser shortcuts like Ctrl+Space
                this.handlePlayerAttack();
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
            this.mouseX = clientMouseX + this.camera.x;
            this.mouseY = clientMouseY + this.camera.y;

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
    }

    handleInput() {
        if (this.isDevelopmentMode) {
            // Use delta time for framerate-independent movement (60fps = 16.67ms baseline)
            const moveMultiplier = this.deltaTime / 16.67;
            const speedMultiplier = (this.keys['shift']) ? 1.5 : 1.0;
            let isMoving = false;

            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.x -= this.player.speed * moveMultiplier * speedMultiplier;
                this.player.facing = 'left';
                isMoving = true;
            }
            if (this.keys['arrowright'] || this.keys['d']) {
                this.player.x += this.player.speed * moveMultiplier * speedMultiplier;
                this.player.facing = 'right';
                isMoving = true;
            }
            if (this.keys['arrowup'] || this.keys['w']) {
                this.player.y -= this.player.speed * moveMultiplier * speedMultiplier;
                isMoving = true;
            }
            if (this.keys['arrowdown'] || this.keys['s']) {
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

            this.platformSystem.platforms.forEach(platform => {
                if (this.platformSystem.checkCollision(this.player, platform)) {
                    if (this.player.velocityY > 0 && this.player.y < platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                    }
                }
            });

            // Check collision with obstacle props
            this.propSystem.checkPlayerPropCollisions(this.player);

            if (this.player.y > this.canvas.height) {
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

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render parallax background layers
        this.renderBackground();

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Debug: Log camera position during render
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp) {
            console.log('Rendering with camera position:', this.camera.x, this.camera.y);
        }

        this.platformSystem.platforms.forEach(platform => {
            // Render platform with sprite or color
            if (platform.spriteType !== 'color' && this.platformSpritesLoaded && this.platformSprites.tileset.image) {
                this.platformSystem.renderer.drawPlatformSprite(platform);
            } else {
                // Fallback to solid color
                this.ctx.fillStyle = platform.color;
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }

            if (this.isDevelopmentMode) {
                if (this.platformSystem.selectedPlatform && this.platformSystem.selectedPlatform.id === platform.id) {
                    this.ctx.strokeStyle = '#FFD700';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
                    this.drawResizeHandles(platform);
                } else {
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
                }
            }
        });

        // Render props (background props first, then obstacle props)
        this.propSystem.renderBackgroundProps(this.isDevelopmentMode);

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

        // Render obstacle props after player (in front of player)
        this.propSystem.renderObstacleProps(this.isDevelopmentMode);

        // Render all torch particles once per frame
        this.propSystem.renderParticles();

        this.ctx.restore();

        if (this.isDevelopmentMode) {
            this.renderDevInfo();
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
        const scaleInput = document.getElementById('propScaleInput');

        if (!propTypeSelect || !obstacleCheck || !scaleInput) return;

        const propType = propTypeSelect.value;
        const isObstacle = obstacleCheck.checked;
        const scale = parseFloat(scaleInput.value) || 1.0;

        // Add the prop at mouse position with custom scale
        this.addProp(mouseX, mouseY, propType, isObstacle, scale);

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

    renderDevInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 100, 200, 80);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Player X: ${Math.round(this.player.x)}`, 20, this.canvas.height - 80);
        this.ctx.fillText(`Player Y: ${Math.round(this.player.y)}`, 20, this.canvas.height - 65);
        this.ctx.fillText(`Camera X: ${Math.round(this.camera.x)}`, 20, this.canvas.height - 50);
        this.ctx.fillText(`On Ground: ${this.player.onGround}`, 20, this.canvas.height - 35);
        this.ctx.fillText(`Velocity Y: ${Math.round(this.player.velocityY)}`, 20, this.canvas.height - 20);
    }

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

        // Props controls
        document.getElementById('addPropBtn').addEventListener('click', () => {
            this.propSystem.propPlacementMode = !this.propSystem.propPlacementMode;
            const btn = document.getElementById('addPropBtn');
            btn.textContent = this.propSystem.propPlacementMode ? 'Cancel Placement' : 'Add Prop (Click on map)';
            btn.classList.toggle('danger', this.propSystem.propPlacementMode);
        });

        // Auto-update scale when prop type changes
        document.getElementById('propTypeSelect').addEventListener('change', (e) => {
            const propType = e.target.value;
            const scaleInput = document.getElementById('propScaleInput');

            // Set default scale based on prop type
            const defaultScale = propType === 'well' ? 1.0 :
                               (propType === 'barrel' || propType === 'crate') ? 1.2 :
                               (propType === 'smallPot' || propType === 'mediumPot' || propType === 'bigPot') ? 0.6 : 1.6;

            scaleInput.value = defaultScale.toFixed(1);
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

                // Update scale and recalculate width/height
                const newScale = parseFloat(document.getElementById('selectedPropScale').value) || 1.0;
                this.propSystem.selectedProp.scale = newScale;

                const propType = this.propTypes[this.propSystem.selectedProp.type];
                if (propType) {
                    this.propSystem.selectedProp.width = propType.width * newScale;
                    this.propSystem.selectedProp.height = propType.height * newScale;
                }
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
    }

    handlePlatformMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.camera.x;
        const mouseY = e.clientY - rect.top + this.camera.y;

        // Handle prop placement mode
        if (this.propSystem.propPlacementMode) {
            this.propSystem.placeProp(mouseX, mouseY);
            return;
        }

        // Handle platform placement mode
        if (this.platformSystem.platformPlacementMode) {
            this.platformSystem.manager.placePlatform(mouseX, mouseY);
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return;
        }

        // Check for prop clicks first (props should be selectable before platforms)
        const propResult = this.propSystem.handleMouseDown(mouseX, mouseY, this.platformSystem, e.ctrlKey);
        if (propResult.handled) {
            this.propSystem.updatePropProperties();
            this.propSystem.updatePropList();
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return;
        }

        for (let platform of this.platformSystem.platforms) {
            const resizeHandle = this.platformSystem.getResizeHandle(platform, mouseX, mouseY);
            if (resizeHandle) {
                this.platformSystem.isResizing = true;
                this.platformSystem.resizeHandle = resizeHandle;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.updatePlatformProperties();
                return;
            }

            if (this.platformSystem.isPointInPlatform(mouseX, mouseY, platform)) {
                this.platformSystem.isDragging = true;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.dragOffset = {
                    x: mouseX - platform.x,
                    y: mouseY - platform.y
                };
                this.platformSystem.updatePlatformProperties();
                this.platformSystem.updatePlatformList();
                return;
            }
        }

        this.platformSystem.selectedPlatform = null;
        this.propSystem.clearMultiSelection();
        this.platformSystem.updatePlatformProperties();
        this.propSystem.updatePropProperties();
        this.platformSystem.updatePlatformList();
        this.propSystem.updatePropList();
    }

    handlePlatformDrag(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left; // Mouse position relative to canvas (without camera offset)
        const clientMouseY = e.clientY - rect.top;
        const mouseX = clientMouseX + this.camera.x; // World coordinates
        const mouseY = clientMouseY + this.camera.y;

        // Store current mouse position for continuous scrolling
        this.lastMousePosition.x = clientMouseX;
        this.lastMousePosition.y = clientMouseY;

        // Handle camera scrolling during drag operations
        this.handleDragScrolling(clientMouseX, clientMouseY);

        // Handle prop dragging
        const propMoved = this.propSystem.handleMouseMove(mouseX, mouseY);
        if (propMoved) {
            this.propSystem.updatePropProperties();
            return;
        }

        if (!this.platformSystem.selectedPlatform) return;

        if (this.platformSystem.isDragging) {
            // Calculate new position based on mouse
            const newX = mouseX - this.platformSystem.dragOffset.x;
            const newY = mouseY - this.platformSystem.dragOffset.y;

            // Apply snapping
            const snappedPos = this.platformSystem.snapPlatformPosition(this.platformSystem.selectedPlatform, newX, newY);

            this.platformSystem.selectedPlatform.x = snappedPos.x;
            this.platformSystem.selectedPlatform.y = snappedPos.y;
            this.platformSystem.updatePlatformProperties();

            // Force render during drag to show camera movement immediately
            this.render();
        } else if (this.platformSystem.isResizing) {
            this.platformSystem.handlePlatformResize(mouseX, mouseY);
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
        } else if (this.platformSystem.isDraggingProp && this.propSystem.selectedProp) {
            // Similar logic for props
            const propScreenLeft = this.propSystem.selectedProp.x - this.camera.x;
            const propScreenRight = this.propSystem.selectedProp.x + this.propSystem.selectedProp.width - this.camera.x;

            if (propScreenLeft < scrollTriggerZone) {
                newDirection = 'left';
                console.log('Prop left edge near screen left, should scroll left');
            } else if (propScreenRight > canvasWidth - scrollTriggerZone) {
                newDirection = 'right';
                console.log('Prop right edge near screen right, should scroll right');
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
            } else if (this.platformSystem.isDraggingProp && this.propSystem.selectedProp) {
                const propScreenLeft = this.propSystem.selectedProp.x - this.camera.x;
                const propScreenRight = this.propSystem.selectedProp.x + this.propSystem.selectedProp.width - this.camera.x;

                if (direction === 'left' && propScreenLeft < scrollTriggerZone) {
                    shouldContinue = true;
                    const newCameraX = Math.max(0, this.camera.x - scrollSpeed);
                    this.camera.x = newCameraX;
                } else if (direction === 'right' && propScreenRight > canvasWidth - scrollTriggerZone) {
                    shouldContinue = true;
                    this.camera.x += scrollSpeed;
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

    handleKeyDown(e) {
        // Only handle keys in development mode
        if (!this.isDevelopmentMode) return;

        // Handle Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Prevent default browser behavior

            if (this.platformSystem.selectedPlatform) {
                // Delete selected platform
                this.platformSystem.deleteSelectedPlatform();
            } else if (this.propSystem.selectedProp) {
                // Delete selected prop
                this.propSystem.deleteSelectedProp();
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
        this.propSystem.isDraggingProp = false;
        this.platformSystem.isResizing = false;
        this.platformSystem.resizeHandle = null;

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

    handlePlatformResize(mouseX, mouseY) {
        if (!this.platformSystem.selectedPlatform || !this.platformSystem.resizeHandle) return;

        const platform = this.platformSystem.selectedPlatform;
        const minSize = 20;
        let newX = platform.x;
        let newY = platform.y;
        let newWidth = platform.width;
        let newHeight = platform.height;

        // Calculate new dimensions based on resize handle
        switch (this.platformSystem.resizeHandle) {
            case 'se': // Bottom-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'sw': // Bottom-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'ne': // Top-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'nw': // Top-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newX = platform.x + platform.width - newWidth;
                newY = platform.y + platform.height - newHeight;
                break;
            case 'w': // Left edge only
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                break;
            case 'e': // Right edge only
                newWidth = Math.max(minSize, mouseX - platform.x);
                break;
            case 'n': // Top edge only
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 's': // Bottom edge only
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
        }

        // Apply snapping to the calculated dimensions
        const snapped = this.snapResizePosition(platform, newX, newY, newWidth, newHeight, this.platformSystem.resizeHandle);

        // Apply the snapped values
        platform.x = snapped.x;
        platform.y = snapped.y;
        platform.width = Math.max(minSize, snapped.width);
        platform.height = Math.max(minSize, snapped.height);
    }

    getResizeHandle(platform, mouseX, mouseY) {
        const handleSize = 8;

        // Check corners first (higher priority)
        const corners = {
            nw: { x: platform.x, y: platform.y },
            ne: { x: platform.x + platform.width, y: platform.y },
            sw: { x: platform.x, y: platform.y + platform.height },
            se: { x: platform.x + platform.width, y: platform.y + platform.height }
        };

        for (let [handle, corner] of Object.entries(corners)) {
            if (Math.abs(mouseX - corner.x) <= handleSize && Math.abs(mouseY - corner.y) <= handleSize) {
                return handle;
            }
        }

        // Check edges if not on corners
        const isNearLeft = mouseX >= platform.x - handleSize && mouseX <= platform.x + handleSize;
        const isNearRight = mouseX >= platform.x + platform.width - handleSize && mouseX <= platform.x + platform.width + handleSize;
        const isNearTop = mouseY >= platform.y - handleSize && mouseY <= platform.y + handleSize;
        const isNearBottom = mouseY >= platform.y + platform.height - handleSize && mouseY <= platform.y + platform.height + handleSize;

        const isInVerticalRange = mouseY >= platform.y && mouseY <= platform.y + platform.height;
        const isInHorizontalRange = mouseX >= platform.x && mouseX <= platform.x + platform.width;

        // Edge handles
        if (isNearLeft && isInVerticalRange) return 'w'; // West (left edge)
        if (isNearRight && isInVerticalRange) return 'e'; // East (right edge)
        if (isNearTop && isInHorizontalRange) return 'n'; // North (top edge)
        if (isNearBottom && isInHorizontalRange) return 's'; // South (bottom edge)

        return null;
    }

    drawResizeHandles(platform) {
        const handleSize = 6;
        this.ctx.fillStyle = '#FFD700';

        // Draw corner handles
        const corners = [
            { x: platform.x, y: platform.y },
            { x: platform.x + platform.width, y: platform.y },
            { x: platform.x, y: platform.y + platform.height },
            { x: platform.x + platform.width, y: platform.y + platform.height }
        ];

        corners.forEach(corner => {
            this.ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize);
        });
    }

    isPointInPlatform(x, y, platform) {
        return x >= platform.x && x <= platform.x + platform.width &&
               y >= platform.y && y <= platform.y + platform.height;
    }

    updatePlatformList() {
        const listElement = document.getElementById('platformList');
        listElement.innerHTML = this.platformSystem.platforms.map(platform =>
            `<div class="platform-item ${this.platformSystem.selectedPlatform && this.platformSystem.selectedPlatform.id === platform.id ? 'selected' : ''}"
                  data-platform-id="${platform.id}">
                Platform ${platform.id + 1} (${platform.x}, ${platform.y}) ${platform.width}x${platform.height}
            </div>`
        ).join('');

        // Add click listeners to platform items
        listElement.querySelectorAll('.platform-item').forEach(item => {
            item.addEventListener('click', () => {
                const platformId = parseInt(item.dataset.platformId);
                this.platformSystem.selectedPlatform = this.platformSystem.platforms.find(p => p.id === platformId);
                this.platformSystem.updatePlatformProperties();
                this.platformSystem.updatePlatformList();
            });
        });
    }

    updatePlatformProperties() {
        const propertiesDiv = document.getElementById('platformProperties');

        if (this.platformSystem.selectedPlatform) {
            propertiesDiv.style.display = 'block';
            document.getElementById('platformX').value = Math.round(this.platformSystem.selectedPlatform.x);
            document.getElementById('platformY').value = Math.round(this.platformSystem.selectedPlatform.y);
            document.getElementById('platformWidth').value = this.platformSystem.selectedPlatform.width;
            document.getElementById('platformHeight').value = this.platformSystem.selectedPlatform.height;
            document.getElementById('platformSpriteType').value = this.platformSystem.selectedPlatform.spriteType || 'color';
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    updateSelectedPlatform() {
        if (!this.platformSystem.selectedPlatform) return;

        this.platformSystem.selectedPlatform.x = parseInt(document.getElementById('platformX').value);
        this.platformSystem.selectedPlatform.y = parseInt(document.getElementById('platformY').value);
        this.platformSystem.selectedPlatform.width = parseInt(document.getElementById('platformWidth').value);
        this.platformSystem.selectedPlatform.height = Math.min(32, Math.max(10, parseInt(document.getElementById('platformHeight').value)));
        this.platformSystem.selectedPlatform.spriteType = document.getElementById('platformSpriteType').value;

        this.platformSystem.updatePlatformList();
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
            const response = await fetch('./gameData.json');
            if (response.ok) {
                const gameData = await response.json();
                this.loadGameDataFromObject(gameData);
            } else {
                // Fallback to localStorage if JSON file not found
                this.loadSavedData();
            }
        } catch (error) {
            console.log('No gameData.json found, using default data');
            // Fallback to localStorage
            this.loadSavedData();
        }
    }

    loadGameDataFromObject(gameData) {
        try {
            if (gameData.scenes && gameData.scenes.length > 0) {
                this.scenes = gameData.scenes;
                if (this.scenes[0].platforms) {
                    this.platformSystem.platforms = [...this.scenes[0].platforms];
                    this.platformSystem.nextPlatformId = Math.max(...this.platformSystem.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes[0].props) {
                    this.propSystem.props = [...this.scenes[0].props];
                    this.propSystem.nextPropId = Math.max(...this.propSystem.props.map(p => p.id || 0)) + 1;
                }

                // Restore background if it exists
                if (this.scenes[0].background && this.scenes[0].background.name && this.scenes[0].background.name !== 'none') {
                    this.loadBackground(this.scenes[0].background.name);

                    // Update the UI dropdown to match the loaded background (with small delay for DOM)
                    setTimeout(() => {
                        const backgroundSelect = document.getElementById('backgroundSelect');
                        if (backgroundSelect) {
                            backgroundSelect.value = this.scenes[0].background.name;
                        }
                    }, 100);
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
                    this.platformSystem.nextPlatformId = Math.max(...this.platformSystem.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes.length > 0 && this.scenes[0].props) {
                    this.propSystem.props = [...this.scenes[0].props];
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