class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDevelopmentMode = true;
        this.showDashboard = true;

        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;

        this.player = {
            x: 100,
            y: 400,
            width: 35,
            height: 47,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            jumpPower: -15,
            onGround: false,
            color: '#FF6B6B',
            facing: 'right',
            currentAnimation: 'idle',
            frameIndex: 0,
            frameTimer: 0,
            frameRate: 6,
            isAttacking: false,
            attackTimer: 0,
            attackDuration: 24
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
            villageProps: { image: null, tileWidth: 32, tileHeight: 32 }
        };
        this.platformSpritesLoaded = false;
        this.loadPlatformSprites();

        // Background management
        this.backgrounds = {};
        this.currentBackground = null;
        this.loadAvailableBackgrounds();

        // Platform sprite type mappings - based on actual tileset layout
        this.platformSpriteTypes = {
            color: { tileset: 'none', tileX: -1, tileY: -1 }, // Use solid color instead

            // Stone/Rock textures (examining first few rows for stone-like textures)
            cobblestone: { tileset: 'tileset', tileX: 6, tileY: 1 }, // Actually cobblestone texture
            darkStone: { tileset: 'tileset', tileX: 1, tileY: 0 }, // Dark stone variation
            lightStone: { tileset: 'tileset', tileX: 2, tileY: 0 }, // Light stone variation
            bricks: { tileset: 'tileset', tileX: 0, tileY: 3 }, // Actually brick pattern
            roughStone: { tileset: 'tileset', tileX: 3, tileY: 0 }, // Rough stone

            // Ground/Dirt textures (looking for brown/earthy textures)
            dirt: { tileset: 'tileset', tileX: 21, tileY: 22 }, // Brown dirt texture
            darkDirt: { tileset: 'tileset', tileX: 3, tileY: 23 }, // Darker dirt
            sand: { tileset: 'tileset', tileX: 5, tileY: 22 }, // Sandy texture
            clay: { tileset: 'tileset', tileX: 3, tileY: 1 }, // Clay-like texture
            rockySoil: { tileset: 'tileset', tileX: 4, tileY: 1 }, // Rocky soil

            // Grass textures (looking for green textures)
            grass: { tileset: 'tileset', tileX: 20, tileY: 22 }, // Actually grass texture
            sandGrass: { tileset: 'tileset', tileX: 7, tileY: 22 }, // sand substrate and grass
            darkGrass: { tileset: 'tileset', tileX: 17, tileY: 22 }, // Dark green
            mossyGrass: { tileset: 'tileset', tileX: 3, tileY: 2 }, // Mossy texture
            dryGrass: { tileset: 'tileset', tileX: 4, tileY: 2 }, // Yellowish grass

            // Wood textures (looking for wooden/brown planked textures)
            lightWood: { tileset: 'tileset', tileX: 16, tileY: 10 }, // Light wood planks
            darkWood: { tileset: 'tileset', tileX: 3, tileY: 10 }, // Dark wood planks
            plank: { tileset: 'tileset', tileX: 2, tileY: 10 }, // Wood plank texture
            log: { tileset: 'tileset', tileX: 4, tileY: 9 }, // Log texture
            bark: { tileset: 'tileset', tileX: 3, tileY: 9 }, // Bark texture

            // Metal textures (looking for metallic/shiny textures)
            iron: { tileset: 'tileset', tileX: 0, tileY: 5 }, // Iron/metal texture
            steel: { tileset: 'tileset', tileX: 4, tileY: 4 }, // Steel texture
            copper: { tileset: 'tileset', tileX: 6, tileY: 4 }, // Copper-like
            gold: { tileset: 'tileset', tileX: 23, tileY: 13 }, // Gold-like
            silver: { tileset: 'tileset', tileX: 3, tileY: 4 }, // Silver-like

            // Special textures
            lava: { tileset: 'tileset', tileX: 7, tileY: 13 }, // Red/orange lava
            water: { tileset: 'tileset', tileX: 1, tileY: 5 }, // Blue water
            ice: { tileset: 'tileset', tileX: 2, tileY: 5 }, // Light blue ice
            crystal: { tileset: 'tileset', tileX: 3, tileY: 5 }, // Crystal-like
            gem: { tileset: 'tileset', tileX: 4, tileY: 5 } // Gem-like
        };

        this.gravity = 0.8;
        this.friction = 0.8;

        this.platforms = [
            { id: 0, x: 0, y: 550, width: 300, height: 50, color: '#4ECDC4', spriteType: 'color' },
            { id: 1, x: 400, y: 450, width: 200, height: 20, color: '#4ECDC4', spriteType: 'color' },
            { id: 2, x: 700, y: 350, width: 150, height: 20, color: '#4ECDC4', spriteType: 'color' },
            { id: 3, x: 950, y: 250, width: 200, height: 20, color: '#4ECDC4', spriteType: 'color' },
            { id: 4, x: 1200, y: 400, width: 300, height: 50, color: '#4ECDC4', spriteType: 'color' }
        ];
        this.nextPlatformId = 5;

        // Village Props system
        this.props = [];
        this.nextPropId = 1;
        this.selectedProp = null;
        this.propPlacementMode = false;
        this.isDraggingProp = false;
        this.propDragOffset = { x: 0, y: 0 };

        // Village Props types with their tileset coordinates and properties
        this.propTypes = {
            // Buildings & Structures
            house: { tileX: 0, tileY: 6, width: 32, height: 32, name: 'House' },
            tower: { tileX: 15, tileY: 0, width: 32, height: 32, name: 'Tower' },
            windmill: { tileX: 15, tileY: 14, width: 64, height: 64, name: 'Windmill' },

            // Trees & Nature
            tree1: { tileX: 15, tileY: 8, width: 32, height: 32, name: 'Tree 1' },
            tree2: { tileX: 16, tileY: 8, width: 32, height: 32, name: 'Tree 2' },
            bush: { tileX: 6, tileY: 2, width: 32, height: 16, name: 'Bush' },

            // Decorative Items
            barrel: { tileX: 6, tileY: 1, width: 20, height: 20, name: 'Barrel' },
            crate: { tileX: 4, tileY: 1, width: 20, height: 20, name: 'Crate' },
            fence: { tileX: 5, tileY: 2, width: 32, height: 16, name: 'Fence' },

            // Functional Items
            well: { tileX: 1, tileY: 6, width: 64, height: 64, name: 'Well' },
            signpost: { tileX: 11, tileY: 0, width: 16, height: 32, name: 'Signpost' },
            lamp: { tileX: 12, tileY: 0, width: 16, height: 32, name: 'Lamp' }
        };

        this.camera = {
            x: 0,
            y: 0
        };

        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDragging = false;
        this.isResizing = false;
        this.selectedPlatform = null;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;

        this.scenes = [
            {
                id: 1,
                name: 'Tutorial',
                description: 'Starting scene with basic platforms',
                platforms: [...this.platforms],
                props: [],
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
        const totalImages = 2;

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

            // Prevent browser shortcuts when Ctrl is held down with other keys
            if (e.ctrlKey && (e.key === ' ' || e.key === 'Space')) {
                e.preventDefault(); // Specifically prevent Ctrl+Space
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;

            // Prevent browser shortcuts for Control key
            if (e.key === 'Control') {
                e.preventDefault();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left + this.camera.x;
            this.mouseY = e.clientY - rect.top + this.camera.y;

            if (this.isDevelopmentMode) {
                document.getElementById('coordinates').textContent =
                    `X: ${Math.round(this.mouseX)}, Y: ${Math.round(this.mouseY)}`;

                this.updateCursor();
                this.handlePlatformDrag(e);
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

        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });

        document.getElementById('productionBtn').addEventListener('click', () => {
            this.setDevelopmentMode(false);
        });

        document.getElementById('toggleDashboardBtn').addEventListener('click', () => {
            this.toggleDashboard();
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
            this.canvas.height = window.innerHeight;
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
            this.updatePlatformList();
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
            let isMoving = false;
            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.x -= this.player.speed;
                this.player.facing = 'left';
                isMoving = true;
            }
            if (this.keys['arrowright'] || this.keys['d']) {
                this.player.x += this.player.speed;
                this.player.facing = 'right';
                isMoving = true;
            }
            if (this.keys['arrowup'] || this.keys['w']) {
                this.player.y -= this.player.speed;
                isMoving = true;
            }
            if (this.keys['arrowdown'] || this.keys['s']) {
                this.player.y += this.player.speed;
                isMoving = true;
            }
            this.setPlayerAnimation(isMoving ? 'walk' : 'idle');
        } else {
            let isMoving = false;
            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.velocityX = -this.player.speed;
                this.player.facing = 'left';
                isMoving = true;
            } else if (this.keys['arrowright'] || this.keys['d']) {
                this.player.velocityX = this.player.speed;
                this.player.facing = 'right';
                isMoving = true;
            } else {
                this.player.velocityX *= this.friction;
            }

            if (this.keys[' '] && this.player.onGround) {
                this.player.velocityY = this.player.jumpPower;
                this.player.onGround = false;
            }

            // Set animation based on movement and ground state
            if (!this.player.onGround) {
                this.setPlayerAnimation('idle'); // Could be jump animation if you have one
            } else if (isMoving && Math.abs(this.player.velocityX) > 0.5) {
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

        // Update frame animation
        this.player.frameTimer++;
        if (this.player.frameTimer >= this.player.frameRate) {
            this.player.frameTimer = 0;
            const sprite = this.sprites[this.player.currentAnimation];
            this.player.frameIndex = (this.player.frameIndex + 1) % sprite.frames;
        }

        // Handle attack timing - check this after frame updates
        if (this.player.isAttacking) {
            this.player.attackTimer++;
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
            this.player.velocityY += this.gravity;

            this.player.x += this.player.velocityX;
            this.player.y += this.player.velocityY;

            this.player.onGround = false;

            this.platforms.forEach(platform => {
                if (this.checkCollision(this.player, platform)) {
                    if (this.player.velocityY > 0 && this.player.y < platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                    }
                }
            });

            // Check collision with obstacle props - 4-sided collision
            this.props.filter(prop => prop.isObstacle).forEach(prop => {
                if (this.checkCollision(this.player, prop)) {
                    // Calculate overlap on each side
                    const overlapLeft = (this.player.x + this.player.width) - prop.x;
                    const overlapRight = (prop.x + prop.width) - this.player.x;
                    const overlapTop = (this.player.y + this.player.height) - prop.y;
                    const overlapBottom = (prop.y + prop.height) - this.player.y;

                    // Find the smallest overlap to determine collision side
                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    if (minOverlapX < minOverlapY) {
                        // Horizontal collision (left or right side)
                        if (overlapLeft < overlapRight) {
                            // Colliding with left side of prop
                            this.player.x = prop.x - this.player.width;
                        } else {
                            // Colliding with right side of prop
                            this.player.x = prop.x + prop.width;
                        }
                        this.player.velocityX = 0;
                    } else {
                        // Vertical collision (top or bottom side)
                        if (overlapTop < overlapBottom) {
                            // Colliding with top side of prop (landing on it)
                            this.player.y = prop.y - this.player.height;
                            this.player.velocityY = 0;
                            this.player.onGround = true;
                        } else {
                            // Colliding with bottom side of prop (hitting from below)
                            this.player.y = prop.y + prop.height;
                            this.player.velocityY = 0;
                        }
                    }
                }
            });

            if (this.player.y > this.canvas.height) {
                this.player.x = 100;
                this.player.y = 400;
                this.player.velocityX = 0;
                this.player.velocityY = 0;
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2;
        this.camera.x = Math.max(0, targetX);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render parallax background layers
        this.renderBackground();

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.platforms.forEach(platform => {
            // Render platform with sprite or color
            if (platform.spriteType !== 'color' && this.platformSpritesLoaded && this.platformSprites.tileset.image) {
                this.drawPlatformSprite(platform);
            } else {
                // Fallback to solid color
                this.ctx.fillStyle = platform.color;
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }

            if (this.isDevelopmentMode) {
                if (this.selectedPlatform && this.selectedPlatform.id === platform.id) {
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
        this.renderProps();

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
        if (this.platformSprites.villageProps.image) {
            this.props.filter(prop => prop.isObstacle).forEach(prop => {
                this.drawProp(prop);
            });
        }

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

        // Make sprite render larger than collision box
        const spriteRenderWidth = 256;
        const spriteRenderHeight = 256;
        const spriteOffsetX = (this.player.width - spriteRenderWidth) / 2;
        const spriteOffsetY = this.player.height - spriteRenderHeight + 110; // Adjust to center character in collision box

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

    drawPlatformSprite(platform) {
        // Get sprite type info
        const spriteInfo = this.platformSpriteTypes[platform.spriteType];
        if (!spriteInfo || spriteInfo.tileX === -1) return;

        // Get the correct tileset based on sprite info
        let tileset;
        if (spriteInfo.tileset === 'villageProps') {
            tileset = this.platformSprites.villageProps;
        } else {
            tileset = this.platformSprites.tileset;
        }

        if (!tileset.image) return;

        const sourceTileWidth = tileset.tileWidth;  // Source size (16x16)
        const sourceTileHeight = tileset.tileHeight;

        // Display tiles as 32x32 regardless of source size
        const displayTileWidth = 32;
        const displayTileHeight = 32;

        // Calculate how many tiles we need to fill the platform (based on display size)
        const tilesX = Math.ceil(platform.width / displayTileWidth);
        const tilesY = Math.ceil(platform.height / displayTileHeight);

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Draw tiled sprite
        for (let tileY = 0; tileY < tilesY; tileY++) {
            for (let tileX = 0; tileX < tilesX; tileX++) {
                // Use Math.floor to ensure pixel-perfect positioning (display size)
                const drawX = Math.floor(platform.x + (tileX * displayTileWidth));
                const drawY = Math.floor(platform.y + (tileY * displayTileHeight));

                // Calculate the width and height to draw (handle partial tiles at edges)
                const drawWidth = Math.min(displayTileWidth, platform.width - (tileX * displayTileWidth));
                const drawHeight = Math.min(displayTileHeight, platform.height - (tileY * displayTileHeight));

                // Only draw if the tile would be visible
                if (drawWidth > 0 && drawHeight > 0) {
                    // Use source dimensions for reading from texture, display dimensions for rendering
                    const sourceX = spriteInfo.tileX * sourceTileWidth;
                    const sourceY = spriteInfo.tileY * sourceTileHeight;

                    this.ctx.drawImage(
                        tileset.image,
                        sourceX, sourceY, // Source position (16x16 coordinates)
                        sourceTileWidth, sourceTileHeight, // Source size (always full 16x16 tile)
                        drawX, drawY, // Destination position
                        drawWidth, drawHeight // Destination size (32x32 scaled up)
                    );
                }
            }
        }

        // Re-enable image smoothing for other rendering
        this.ctx.imageSmoothingEnabled = true;
    }

    renderProps() {
        if (!this.platformSprites.villageProps.image) return;

        // Render background props first (behind player)
        this.props.filter(prop => !prop.isObstacle).forEach(prop => {
            this.drawProp(prop);
        });

        // Render obstacle props after player (will be handled in main render)
    }

    drawProp(prop) {
        const propType = this.propTypes[prop.type];
        if (!propType) return;

        const tileset = this.platformSprites.villageProps;
        if (!tileset.image) return;

        const sourceX = propType.tileX * tileset.tileWidth;
        const sourceY = propType.tileY * tileset.tileHeight;

        // Scale props to be more visible (2x scale)
        const renderWidth = propType.width * 2;
        const renderHeight = propType.height * 2;

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Debug: Always show colored rectangle so we can see the prop
        this.ctx.fillStyle = prop.isObstacle ? '#FF4444' : '#44FF44';
        this.ctx.fillRect(prop.x, prop.y, renderWidth, renderHeight);

        // Draw border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);

        // Try to draw sprite on top
        // Always extract 32x32 from tileset but render at custom size
        this.ctx.drawImage(
            tileset.image,
            sourceX, sourceY,
            32, 32,  // Always extract 32x32 from tileset
            prop.x, prop.y,
            renderWidth, renderHeight
        );

        // Re-enable image smoothing
        this.ctx.imageSmoothingEnabled = true;

        // Development mode: show prop boundaries
        if (this.isDevelopmentMode) {
            if (this.selectedProp && this.selectedProp.id === prop.id) {
                this.ctx.strokeStyle = prop.isObstacle ? '#FF6B6B' : '#4ECDC4';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            } else {
                this.ctx.strokeStyle = prop.isObstacle ? '#FF9999' : '#99D6CE';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            }
        }
    }

    addProp(x, y, type, isObstacle = false) {
        const propType = this.propTypes[type];
        if (!propType) return;

        const newProp = {
            id: this.nextPropId++,
            x: x,
            y: y,
            type: type,
            isObstacle: isObstacle,
            width: propType.width * 2,  // 2x scale
            height: propType.height * 2
        };

        this.props.push(newProp);
        return newProp;
    }

    placeProp(mouseX, mouseY) {
        // Get selected prop type and obstacle setting from UI
        const propTypeSelect = document.getElementById('propTypeSelect');
        const obstacleCheck = document.getElementById('propObstacleCheck');

        if (!propTypeSelect || !obstacleCheck) return;

        const propType = propTypeSelect.value;
        const isObstacle = obstacleCheck.checked;

        // Add the prop at mouse position
        this.addProp(mouseX, mouseY, propType, isObstacle);

        // Exit placement mode
        this.propPlacementMode = false;
        const btn = document.getElementById('addPropBtn');
        if (btn) {
            btn.textContent = 'Add Prop (Click on map)';
            btn.classList.remove('danger');
        }
    }

    updatePropProperties() {
        const propProperties = document.getElementById('propProperties');
        if (!propProperties) return;

        if (this.selectedProp) {
            propProperties.style.display = 'block';

            const propType = this.propTypes[this.selectedProp.type];
            document.getElementById('selectedPropType').textContent = propType ? propType.name : this.selectedProp.type;
            document.getElementById('propX').value = this.selectedProp.x;
            document.getElementById('propY').value = this.selectedProp.y;
            document.getElementById('selectedPropObstacle').checked = this.selectedProp.isObstacle;
        } else {
            propProperties.style.display = 'none';
        }
    }

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
            this.addPlatform();
        });

        document.getElementById('savePlatforms').addEventListener('click', () => {
            this.savePlatforms();
        });

        document.getElementById('updatePlatform').addEventListener('click', () => {
            this.updateSelectedPlatform();
        });

        document.getElementById('deletePlatform').addEventListener('click', () => {
            this.deleteSelectedPlatform();
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
            this.propPlacementMode = !this.propPlacementMode;
            const btn = document.getElementById('addPropBtn');
            btn.textContent = this.propPlacementMode ? 'Cancel Placement' : 'Add Prop (Click on map)';
            btn.classList.toggle('danger', this.propPlacementMode);
        });

        document.getElementById('clearPropsBtn').addEventListener('click', () => {
            if (confirm('Clear all props? This cannot be undone.')) {
                this.props = [];
                this.selectedProp = null;
                this.updatePropProperties();
            }
        });

        // Prop properties event listeners
        document.getElementById('updateProp').addEventListener('click', () => {
            if (this.selectedProp) {
                this.selectedProp.x = parseInt(document.getElementById('propX').value);
                this.selectedProp.y = parseInt(document.getElementById('propY').value);
                this.selectedProp.isObstacle = document.getElementById('selectedPropObstacle').checked;
            }
        });

        document.getElementById('deleteProp').addEventListener('click', () => {
            if (this.selectedProp && confirm('Delete this prop? This cannot be undone.')) {
                this.props = this.props.filter(prop => prop.id !== this.selectedProp.id);
                this.selectedProp = null;
                this.updatePropProperties();
            }
        });
    }

    handlePlatformMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.camera.x;
        const mouseY = e.clientY - rect.top + this.camera.y;

        // Handle prop placement mode
        if (this.propPlacementMode) {
            this.placeProp(mouseX, mouseY);
            return;
        }

        // Check for prop clicks first (props should be selectable before platforms)
        for (let prop of this.props) {
            const propType = this.propTypes[prop.type];
            if (!propType) continue;

            // Check if mouse is within prop bounds (using 2x scale like in rendering)
            const renderWidth = propType.width * 2;
            const renderHeight = propType.height * 2;

            if (mouseX >= prop.x && mouseX <= prop.x + renderWidth &&
                mouseY >= prop.y && mouseY <= prop.y + renderHeight) {
                this.selectedProp = prop;
                this.selectedPlatform = null;
                this.isDraggingProp = true;
                this.propDragOffset = {
                    x: mouseX - prop.x,
                    y: mouseY - prop.y
                };
                this.updatePropProperties();
                this.updatePlatformProperties();
                this.updatePlatformList();
                return;
            }
        }

        for (let platform of this.platforms) {
            const resizeHandle = this.getResizeHandle(platform, mouseX, mouseY);
            if (resizeHandle) {
                this.isResizing = true;
                this.resizeHandle = resizeHandle;
                this.selectedPlatform = platform;
                this.updatePlatformProperties();
                return;
            }

            if (this.isPointInPlatform(mouseX, mouseY, platform)) {
                this.isDragging = true;
                this.selectedPlatform = platform;
                this.dragOffset = {
                    x: mouseX - platform.x,
                    y: mouseY - platform.y
                };
                this.updatePlatformProperties();
                this.updatePlatformList();
                return;
            }
        }

        this.selectedPlatform = null;
        this.selectedProp = null;
        this.updatePlatformProperties();
        this.updatePropProperties();
        this.updatePlatformList();
    }

    handlePlatformDrag(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.camera.x;
        const mouseY = e.clientY - rect.top + this.camera.y;

        // Handle prop dragging
        if (this.isDraggingProp && this.selectedProp) {
            this.selectedProp.x = mouseX - this.propDragOffset.x;
            this.selectedProp.y = mouseY - this.propDragOffset.y;
            this.updatePropProperties();
            return;
        }

        if (!this.selectedPlatform) return;

        if (this.isDragging) {
            // Calculate new position based on mouse
            const newX = mouseX - this.dragOffset.x;
            const newY = mouseY - this.dragOffset.y;

            // Apply snapping
            const snappedPos = this.snapPlatformPosition(this.selectedPlatform, newX, newY);

            this.selectedPlatform.x = snappedPos.x;
            this.selectedPlatform.y = snappedPos.y;
            this.updatePlatformProperties();
        } else if (this.isResizing) {
            this.handlePlatformResize(mouseX, mouseY);
            this.updatePlatformProperties();
        }
    }

    handlePlatformMouseUp(e) {
        this.isDragging = false;
        this.isDraggingProp = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    updateCursor() {
        // Default cursor
        this.canvas.style.cursor = 'default';

        // Check if mouse is over any prop first (props have priority)
        for (const prop of this.props) {
            const propType = this.propTypes[prop.type];
            if (!propType) continue;

            const renderWidth = propType.width * 2;
            const renderHeight = propType.height * 2;

            if (this.mouseX >= prop.x && this.mouseX <= prop.x + renderWidth &&
                this.mouseY >= prop.y && this.mouseY <= prop.y + renderHeight) {
                this.canvas.style.cursor = 'move';
                return; // Exit early, don't check platforms
            }
        }

        // Check if mouse is over any platform
        for (const platform of this.platforms) {
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

    snapPlatformPosition(platform, newX, newY) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;

        // Check against all other platforms
        for (const otherPlatform of this.platforms) {
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
        for (const otherPlatform of this.platforms) {
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
        if (!this.selectedPlatform || !this.resizeHandle) return;

        const platform = this.selectedPlatform;
        const minSize = 20;
        let newX = platform.x;
        let newY = platform.y;
        let newWidth = platform.width;
        let newHeight = platform.height;

        // Calculate new dimensions based on resize handle
        switch (this.resizeHandle) {
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
        const snapped = this.snapResizePosition(platform, newX, newY, newWidth, newHeight, this.resizeHandle);

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
        listElement.innerHTML = this.platforms.map(platform =>
            `<div class="platform-item ${this.selectedPlatform && this.selectedPlatform.id === platform.id ? 'selected' : ''}"
                  data-platform-id="${platform.id}">
                Platform ${platform.id + 1} (${platform.x}, ${platform.y}) ${platform.width}x${platform.height}
            </div>`
        ).join('');

        // Add click listeners to platform items
        listElement.querySelectorAll('.platform-item').forEach(item => {
            item.addEventListener('click', () => {
                const platformId = parseInt(item.dataset.platformId);
                this.selectedPlatform = this.platforms.find(p => p.id === platformId);
                this.updatePlatformProperties();
                this.updatePlatformList();
            });
        });
    }

    updatePlatformProperties() {
        const propertiesDiv = document.getElementById('platformProperties');

        if (this.selectedPlatform) {
            propertiesDiv.style.display = 'block';
            document.getElementById('platformX').value = Math.round(this.selectedPlatform.x);
            document.getElementById('platformY').value = Math.round(this.selectedPlatform.y);
            document.getElementById('platformWidth').value = this.selectedPlatform.width;
            document.getElementById('platformHeight').value = this.selectedPlatform.height;
            document.getElementById('platformSpriteType').value = this.selectedPlatform.spriteType || 'color';
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    updateSelectedPlatform() {
        if (!this.selectedPlatform) return;

        this.selectedPlatform.x = parseInt(document.getElementById('platformX').value);
        this.selectedPlatform.y = parseInt(document.getElementById('platformY').value);
        this.selectedPlatform.width = parseInt(document.getElementById('platformWidth').value);
        this.selectedPlatform.height = Math.min(32, Math.max(10, parseInt(document.getElementById('platformHeight').value)));
        this.selectedPlatform.spriteType = document.getElementById('platformSpriteType').value;

        this.updatePlatformList();
    }

    deleteSelectedPlatform() {
        if (!this.selectedPlatform) return;

        this.platforms = this.platforms.filter(p => p.id !== this.selectedPlatform.id);
        this.selectedPlatform = null;
        this.updatePlatformProperties();
        this.updatePlatformList();
    }

    addPlatform() {
        const newPlatform = {
            id: this.nextPlatformId++,
            x: this.mouseX || 100,
            y: this.mouseY || 100,
            width: 150,
            height: 20,
            color: '#4ECDC4',
            spriteType: 'color'
        };

        this.platforms.push(newPlatform);
        this.selectedPlatform = newPlatform;
        this.updatePlatformProperties();
        this.updatePlatformList();
    }

    async savePlatforms() {
        // Update the current scene with the current platforms and props
        if (this.scenes.length > 0) {
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platforms));
            this.scenes[0].props = JSON.parse(JSON.stringify(this.props));

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
                    this.platforms = [...this.scenes[0].platforms];
                    this.nextPlatformId = Math.max(...this.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes[0].props) {
                    this.props = [...this.scenes[0].props];
                    this.nextPropId = Math.max(...this.props.map(p => p.id || 0)) + 1;
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
                    this.platforms = [...this.scenes[0].platforms];
                    this.nextPlatformId = Math.max(...this.platforms.map(p => p.id || 0)) + 1;
                }

                // Load props if they exist
                if (this.scenes.length > 0 && this.scenes[0].props) {
                    this.props = [...this.scenes[0].props];
                    this.nextPropId = Math.max(...this.props.map(p => p.id || 0)) + 1;
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
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platforms));
            this.scenes[0].props = JSON.parse(JSON.stringify(this.props));
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
                this.selectedPlatform = null;
                this.updatePlatformProperties();
                this.updatePlatformList();

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

    gameLoop() {
        this.handleInput();
        this.updatePhysics();
        this.updatePlayerAnimation();
        this.updateCamera();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

const game = new PlatformRPG();