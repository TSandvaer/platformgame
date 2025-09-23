class PlayerAnimator {
    constructor(data) {
        this.data = data;
        this.sprites = {
            idle: { image: null, frames: 6, frameWidth: 100, frameHeight: 100 },
            walk: { image: null, frames: 8, frameWidth: 100, frameHeight: 100 },
            attack: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            hurt: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 },
            death: { image: null, frames: 4, frameWidth: 100, frameHeight: 100 }
        };
        this.spritesLoaded = false;
        this.loadSprites();
    }

    loadSprites() {
        const spritePaths = {
            idle: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Idle.png',
            walk: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png',
            attack: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Attack01.png',
            hurt: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Hurt.png',
            death: 'sprites/Tiny RPG assets/Characters(100x100)/Soldier/Soldier/Soldier-Death.png'
        };

        let loadedCount = 0;
        const totalSprites = Object.keys(spritePaths).length;

        for (const [key, path] of Object.entries(spritePaths)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                console.log(`Loaded player sprite: ${key}`);
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                    console.log('All player sprites loaded successfully');
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load player sprite: ${key} from ${path}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                    console.log('Player sprite loading complete (with some failures)');
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
            if (this.data.attackTimer >= this.data.attackDuration) {
                this.endAttack(isDevelopmentMode);
            }
        }
    }

    setAnimation(animationName) {
        // Don't change animation if currently attacking (unless setting to attack)
        if (this.data.isAttacking && animationName !== 'attack') {
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

    startAttack() {
        if (!this.data.isAttacking) {
            this.data.isAttacking = true;
            this.data.attackTimer = 0;
            this.setAnimation('attack');
            return true;
        }
        return false;
    }

    endAttack(isDevelopmentMode) {
        this.data.isAttacking = false;
        this.data.attackTimer = 0;

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