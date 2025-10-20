class PlayerAnimator {
    constructor(data) {
        this.data = data;
        this.characterConfig = null; // Will be set during initialization
        this.sprites = {
            idle: { image: null, frames: 6, frameWidth: 100, frameHeight: 100 },
            walk: { image: null, frames: 8, frameWidth: 100, frameHeight: 100 },
            attack: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            attack_melee: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            attack_ranged: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            hurt: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            death: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 }
        };
        this.spritesLoaded = false;

        // Initialize with default character (will be overridden by saved settings)
        this.initializeCharacter(this.data.selectedCharacter || 'soldier');
    }

    // Initialize character sprites based on character ID
    initializeCharacter(characterId) {
        // Get character configuration
        if (!window.playerCharacters) {
            console.error('PlayerCharacters not loaded! Loading default soldier sprites.');
            this.loadDefaultSoldierSprites();
            return;
        }

        this.characterConfig = window.playerCharacters.getCharacter(characterId);

        // Load sprites for this character
        this.loadSprites();
    }

    // Switch to a different character
    switchCharacter(characterId) {
        this.spritesLoaded = false;
        this.initializeCharacter(characterId);

        // Update player data dimensions
        if (this.characterConfig) {
            this.data.width = this.characterConfig.playerSize.width;
            this.data.height = this.characterConfig.playerSize.height;
            this.data.attackDuration = this.characterConfig.attackDuration;
        }
    }

    loadSprites() {
        if (!this.characterConfig) {
            console.error('No character config available');
            return;
        }

        const config = this.characterConfig;
        const basePath = config.spriteBasePath;

        // Build sprite paths from character configuration
        const spritePaths = {};
        const spriteConfigs = {};

        for (const [animKey, animConfig] of Object.entries(config.animations)) {
            spritePaths[animKey] = `${basePath}/${animConfig.file}`;
            spriteConfigs[animKey] = {
                frames: animConfig.frames,
                frameWidth: config.spriteSize.frameWidth,
                frameHeight: config.spriteSize.frameHeight,
                frameRate: animConfig.frameRate
            };

            // Initialize sprite entry if it doesn't exist (for attack_melee, attack_ranged)
            if (!this.sprites[animKey]) {
                this.sprites[animKey] = {
                    image: null,
                    frames: animConfig.frames,
                    frameWidth: config.spriteSize.frameWidth,
                    frameHeight: config.spriteSize.frameHeight
                };
            }
        }

        let loadedCount = 0;
        const totalSprites = Object.keys(spritePaths).length;

        // Update sprite configurations
        for (const [key, spriteConfig] of Object.entries(spriteConfigs)) {
            this.sprites[key].frames = spriteConfig.frames;
            this.sprites[key].frameWidth = spriteConfig.frameWidth;
            this.sprites[key].frameHeight = spriteConfig.frameHeight;
        }

        // Load sprite images
        for (const [key, path] of Object.entries(spritePaths)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load player sprite: ${key} from ${path}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                }
            };
            img.src = path;
            this.sprites[key].image = img;
        }
    }

    // Fallback to load default soldier sprites if PlayerCharacters isn't available
    loadDefaultSoldierSprites() {
        const spritePaths = {
            idle: '/sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png',
            walk: '/sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png',
            attack: '/sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack01.png',
            hurt: '/sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Hurt.png',
            death: '/sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Death.png'
        };

        let loadedCount = 0;
        const totalSprites = Object.keys(spritePaths).length;

        for (const [key, path] of Object.entries(spritePaths)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load player sprite: ${key} from ${path}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                }
            };
            img.src = path;
            this.sprites[key].image = img;
        }
    }

    update(deltaTime, isDevelopmentMode) {
        if (!this.spritesLoaded) return;

        // Update frame animation using delta time
        this.data.frameTimer += deltaTime;
        if (this.data.frameTimer >= this.data.frameRate) {
            this.data.frameTimer = 0;
            const sprite = this.sprites[this.data.currentAnimation];

            // Handle death animation - play once and stop at last frame
            if (this.data.currentAnimation === 'death') {
                if (this.data.frameIndex < sprite.frames - 1) {
                    this.data.frameIndex++;
                }
                // Stay at last frame when animation completes
            } else {
                // Normal looping animation for all other states
                this.data.frameIndex = (this.data.frameIndex + 1) % sprite.frames;
            }
        }

        // Handle attack timing
        if (this.data.isAttacking) {
            this.data.attackTimer += deltaTime;

            // Check if we should spawn a pending projectile
            if (this.data.pendingProjectile && !this.data.pendingProjectile.spawned) {
                const projectileConfig = this.data.pendingProjectile.characterConfig?.projectile;
                if (projectileConfig && this.data.attackTimer >= projectileConfig.spawnTime) {
                    // Get projectile system from window (since we don't have direct access)
                    const projectileSystem = window.game?.playerSystem?.projectileSystem;
                    if (projectileSystem) {
                        projectileSystem.createProjectile(
                            this.data,
                            this.data.pendingProjectile.targetX,
                            this.data.pendingProjectile.targetY,
                            this.data.pendingProjectile.characterConfig
                        );
                        this.data.pendingProjectile.spawned = true;
                    }
                }
            }

            if (this.data.attackTimer >= this.data.attackDuration) {
                this.endAttack(isDevelopmentMode);
            }
        }
    }

    setAnimation(animationName) {
        // Don't change animation if currently attacking (unless setting to attack animation)
        if (this.data.isAttacking && !animationName.startsWith('attack')) {
            return false;
        }

        if (this.data.currentAnimation !== animationName) {
            this.data.currentAnimation = animationName;
            this.data.frameIndex = 0;
            this.data.frameTimer = 0;
            return true;
        }
        return false;
    }

    startAttack(attackType = 'attack') {
        if (!this.data.isAttacking) {
            this.data.isAttacking = true;
            this.data.attackTimer = 0;

            // Set attack duration based on attack type
            if (attackType === 'attack_ranged' && this.characterConfig?.rangedAttackDuration) {
                this.data.attackDuration = this.characterConfig.rangedAttackDuration;
            } else if (attackType === 'attack_melee' && this.characterConfig?.attackDuration) {
                this.data.attackDuration = this.characterConfig.attackDuration;
            } else if (this.characterConfig?.attackDuration) {
                // Default attack duration
                this.data.attackDuration = this.characterConfig.attackDuration;
            }

            // Store current attack type
            this.data.currentAttackType = attackType;

            this.setAnimation(attackType);
            return true;
        }
        return false;
    }

    endAttack(isDevelopmentMode) {
        this.data.isAttacking = false;
        this.data.attackTimer = 0;
        this.data.currentAttackType = null;
        this.data.pendingProjectile = null; // Clear pending projectile

        // Return to appropriate animation based on current state
        if (!isDevelopmentMode && !this.data.onGround) {
            this.setAnimation('idle'); // Could be jump animation if available
        } else if (Math.abs(this.data.velocityX) > 0.5) {
            this.setAnimation('walk');
        } else {
            this.setAnimation('idle');
        }
    }

    updateAnimationBasedOnState(isMoving, isDevelopmentMode) {
        // Don't update if attacking, hurt, or dead
        if (this.data.isAttacking) return;
        if (this.data.isDead) return;
        if (this.data.isDamaged && this.data.damageTimer > 0) return;

        if (!this.data.onGround && !isDevelopmentMode) {
            this.setAnimation('idle'); // Could be jump animation
        } else if (isMoving || Math.abs(this.data.velocityX) > 0.5) {
            this.setAnimation('walk');
        } else {
            this.setAnimation('idle');
        }
    }

    getCurrentSprite() {
        return this.sprites[this.data.currentAnimation];
    }

    getCurrentFrame() {
        const sprite = this.getCurrentSprite();
        if (!sprite || !sprite.image) return null;

        return {
            image: sprite.image,
            sourceX: this.data.frameIndex * sprite.frameWidth,
            sourceY: 0,
            frameWidth: sprite.frameWidth,
            frameHeight: sprite.frameHeight
        };
    }

    isReady() {
        return this.spritesLoaded;
    }
}