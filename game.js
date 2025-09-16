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
            width: 27,
            height: 33,
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
            tileset: { image: null, tileWidth: 32, tileHeight: 32 },
            villageProps: { image: null, tileWidth: 32, tileHeight: 32 }
        };
        this.platformSpritesLoaded = false;
        this.loadPlatformSprites();

        // Platform sprite type mappings - using seamless tiling approach
        this.platformSpriteTypes = {
            color: { tileset: 'none', tileX: -1, tileY: -1 }, // Use solid color instead
            // Ground tileset options
            grass: { tileset: 'tileset', tileX: 1, tileY: 0 }, // Use stone coordinates for seamless grass
            dirt: { tileset: 'tileset', tileX: 1, tileY: 2 }, // Try bottom row coordinates for dirt
            stone: { tileset: 'tileset', tileX: 2, tileY: 0 }, // Different stone tile
            darkDirt: { tileset: 'tileset', tileX: 1, tileY: 1 }, // Previous dirt coordinates
            lightGrass: { tileset: 'tileset', tileX: 0, tileY: 0 }, // Original grass tile for light grass
            // Village Props tileset options
            woodenLog: { tileset: 'villageProps', tileX: 3, tileY: 11 }, // Wooden log platform
            stoneBlock: { tileset: 'villageProps', tileX: 24, tileY: 20 }, // Stone block
            woodenPlank: { tileset: 'villageProps', tileX: 0, tileY: 24 }, // Wooden plank
            bridge: { tileset: 'villageProps', tileX: 11, tileY: 20 }, // Bridge piece
            metalPlatform: { tileset: 'villageProps', tileX: 12, tileY: 10 } // Metal platform
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
                platforms: [...this.platforms]
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
            idle: 'Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png',
            walk: 'Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png',
            attack: 'Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack01.png',
            hurt: 'Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Hurt.png',
            death: 'Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Death.png'
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
        groundImg.src = 'Pixel Art Platformer/Texture/TX Tileset Ground.png';
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
        propsImg.src = 'Pixel Art Platformer/Texture/TX Village Props.png';
        this.platformSprites.villageProps.image = propsImg;
    }

    init() {
        this.setupEventListeners();
        this.gameLoop();
        this.updateUI();
        this.loadGameDataFromFile();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Handle Ctrl key for attack
            if (e.key === 'Control' && !this.player.isAttacking) {
                this.handlePlayerAttack();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left + this.camera.x;
            this.mouseY = e.clientY - rect.top + this.camera.y;

            if (this.isDevelopmentMode) {
                document.getElementById('coordinates').textContent =
                    `X: ${Math.round(this.mouseX)}, Y: ${Math.round(this.mouseY)}`;

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
        const spriteRenderWidth = 160;
        const spriteRenderHeight = 160;
        const spriteOffsetX = (this.player.width - spriteRenderWidth) / 2 + 2;
        const spriteOffsetY = this.player.height - spriteRenderHeight + 67; // Align feet with bottom of collision box

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

        const tileWidth = tileset.tileWidth;
        const tileHeight = tileset.tileHeight;

        // Calculate how many tiles we need to fill the platform
        const tilesX = Math.ceil(platform.width / tileWidth);
        const tilesY = Math.ceil(platform.height / tileHeight);

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Draw tiled sprite
        for (let tileY = 0; tileY < tilesY; tileY++) {
            for (let tileX = 0; tileX < tilesX; tileX++) {
                // Use Math.floor to ensure pixel-perfect positioning
                const drawX = Math.floor(platform.x + (tileX * tileWidth));
                const drawY = Math.floor(platform.y + (tileY * tileHeight));

                // Calculate the width and height to draw (handle partial tiles at edges)
                const drawWidth = Math.min(tileWidth, platform.width - (tileX * tileWidth));
                const drawHeight = Math.min(tileHeight, platform.height - (tileY * tileHeight));

                // Only draw if the tile would be visible
                if (drawWidth > 0 && drawHeight > 0) {
                    // For partial tiles, we need to be careful with source clipping
                    const sourceWidth = Math.min(tileWidth, drawWidth);
                    const sourceHeight = Math.min(tileHeight, drawHeight);

                    this.ctx.drawImage(
                        tileset.image,
                        spriteInfo.tileX * tileWidth, spriteInfo.tileY * tileHeight, // Source position
                        sourceWidth, sourceHeight, // Source size (clipped for partial tiles)
                        drawX, drawY, // Destination position
                        drawWidth, drawHeight // Destination size
                    );
                }
            }
        }

        // Re-enable image smoothing for other rendering
        this.ctx.imageSmoothingEnabled = true;
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
    }

    handlePlatformMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.camera.x;
        const mouseY = e.clientY - rect.top + this.camera.y;

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
        this.updatePlatformProperties();
        this.updatePlatformList();
    }

    handlePlatformDrag(e) {
        if (!this.selectedPlatform) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.camera.x;
        const mouseY = e.clientY - rect.top + this.camera.y;

        if (this.isDragging) {
            this.selectedPlatform.x = mouseX - this.dragOffset.x;
            this.selectedPlatform.y = mouseY - this.dragOffset.y;
            this.updatePlatformProperties();
        } else if (this.isResizing) {
            this.handlePlatformResize(mouseX, mouseY);
            this.updatePlatformProperties();
        }
    }

    handlePlatformMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    handlePlatformResize(mouseX, mouseY) {
        if (!this.selectedPlatform || !this.resizeHandle) return;

        const platform = this.selectedPlatform;
        const minSize = 20;

        switch (this.resizeHandle) {
            case 'se': // Bottom-right
                platform.width = Math.max(minSize, mouseX - platform.x);
                platform.height = Math.max(minSize, mouseY - platform.y);
                break;
            case 'sw': // Bottom-left
                const newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                platform.x = platform.x + platform.width - newWidth;
                platform.width = newWidth;
                platform.height = Math.max(minSize, mouseY - platform.y);
                break;
            case 'ne': // Top-right
                platform.width = Math.max(minSize, mouseX - platform.x);
                const newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                platform.y = platform.y + platform.height - newHeight;
                platform.height = newHeight;
                break;
            case 'nw': // Top-left
                const newWidthNW = Math.max(minSize, platform.x + platform.width - mouseX);
                const newHeightNW = Math.max(minSize, platform.y + platform.height - mouseY);
                platform.x = platform.x + platform.width - newWidthNW;
                platform.y = platform.y + platform.height - newHeightNW;
                platform.width = newWidthNW;
                platform.height = newHeightNW;
                break;
        }
    }

    getResizeHandle(platform, mouseX, mouseY) {
        const handleSize = 8;
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
        this.selectedPlatform.height = parseInt(document.getElementById('platformHeight').value);
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
        // Update the current scene with the current platforms
        if (this.scenes.length > 0) {
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platforms));

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
                alert('Platforms saved! gameData.json downloaded - please replace the existing file.');
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
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    exportGameData() {
        // Update current scene with current platforms
        if (this.scenes.length > 0) {
            this.scenes[0].platforms = JSON.parse(JSON.stringify(this.platforms));
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