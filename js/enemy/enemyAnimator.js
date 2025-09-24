class EnemyAnimator {
    constructor(enemy, enemyTypeData) {
        this.enemy = enemy;
        this.enemyTypeData = enemyTypeData;
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
        const animations = this.enemyTypeData.animations;
        const baseFolder = this.enemyTypeData.spriteFolder;

        let loadedCount = 0;
        const totalSprites = Object.keys(animations).length;

        for (const [animName, animData] of Object.entries(animations)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                console.log(`Loaded enemy sprite: ${this.enemy.type}-${animName}`);
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                    console.log(`All ${this.enemy.type} sprites loaded successfully`);
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load enemy sprite: ${this.enemy.type}-${animName} from ${baseFolder}/${animData.file}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                    console.log(`${this.enemy.type} sprite loading complete (with some failures)`);
                }
            };
            img.src = `${baseFolder}/${animData.file}`;
            this.sprites[animName].image = img;
            this.sprites[animName].frames = animData.frames;
        }
    }

    update(deltaTime) {
        if (!this.spritesLoaded) return;

        // Update frame animation using delta time
        this.enemy.frameTimer += deltaTime;
        if (this.enemy.frameTimer >= this.enemy.frameRate) {
            this.enemy.frameTimer = 0;
            const sprite = this.sprites[this.enemy.currentAnimation];

            // Handle death animation - play once and stop at last frame
            if (this.enemy.currentAnimation === 'death') {
                if (this.enemy.frameIndex < sprite.frames - 1) {
                    this.enemy.frameIndex++;
                }
                // Stay at last frame when animation completes
            } else {
                // Normal looping animation for all other states
                this.enemy.frameIndex = (this.enemy.frameIndex + 1) % sprite.frames;
            }
        }

        // Handle attack timing
        if (this.enemy.isAttacking) {
            this.enemy.attackTimer += deltaTime;
            if (this.enemy.attackTimer >= this.enemy.attackDuration) {
                this.endAttack();
            }
        }
    }

    setAnimation(animationName) {
        // Don't change animation if currently attacking (unless setting to attack)
        if (this.enemy.isAttacking && animationName !== 'attack') {
            return false;
        }

        // Don't change animation if dead (unless setting to death)
        if (this.enemy.isDead && animationName !== 'death') {
            return false;
        }

        if (this.enemy.currentAnimation !== animationName) {
            this.enemy.currentAnimation = animationName;
            this.enemy.frameIndex = 0;
            this.enemy.frameTimer = 0;
            return true;
        }
        return false;
    }

    startAttack() {
        if (!this.enemy.isAttacking && !this.enemy.isDead) {
            this.enemy.isAttacking = true;
            this.enemy.attackTimer = 0;
            this.setAnimation('attack');
            return true;
        }
        return false;
    }

    endAttack() {
        this.enemy.isAttacking = false;
        this.enemy.attackTimer = 0;

        // Return to appropriate animation based on current state
        if (this.enemy.isDead) {
            this.setAnimation('death');
        } else if (this.enemy.isDamaged && this.enemy.damageTimer > 0) {
            this.setAnimation('hurt');
        } else if (Math.abs(this.enemy.velocityX) > 0.5) {
            this.setAnimation('walk');
        } else {
            this.setAnimation('idle');
        }
    }

    startHurt() {
        if (!this.enemy.isDead && !this.enemy.isAttacking) {
            this.setAnimation('hurt');
            return true;
        }
        return false;
    }

    startDeath() {
        this.enemy.isDead = true;
        this.enemy.isAttacking = false;
        this.setAnimation('death');
    }

    updateAnimationBasedOnState(isMoving) {
        // Don't update if attacking, hurt, or dead
        if (this.enemy.isAttacking) return;
        if (this.enemy.isDead) return;
        if (this.enemy.isDamaged && this.enemy.damageTimer > 0) return;

        if (isMoving || Math.abs(this.enemy.velocityX) > 0.5) {
            this.setAnimation('walk');

            // Speed up animation when running (chasing/attacking states)
            if (this.enemy.aiState === 'chasing' || this.enemy.aiState === 'attacking') {
                // Use faster animation speed when running (2x speed)
                this.enemy.frameRate = 75; // Faster than default 150
            } else {
                // Normal walking speed
                this.enemy.frameRate = 150; // Default walking speed
            }
        } else {
            this.setAnimation('idle');
            this.enemy.frameRate = 150; // Default idle speed
        }
    }

    getCurrentSprite() {
        return this.sprites[this.enemy.currentAnimation];
    }

    getCurrentFrame() {
        const sprite = this.getCurrentSprite();
        if (!sprite || !sprite.image) return null;

        return {
            image: sprite.image,
            sourceX: this.enemy.frameIndex * sprite.frameWidth,
            sourceY: 0,
            frameWidth: sprite.frameWidth,
            frameHeight: sprite.frameHeight
        };
    }

    isReady() {
        return this.spritesLoaded;
    }

    // Damage animation methods
    takeDamage() {
        if (!this.enemy.isDead) {
            this.enemy.isDamaged = true;
            this.enemy.damageTimer = 600; // Duration to match hurt animation cycle
            this.startHurt();
        }
    }

    updateDamageState(deltaTime) {
        if (this.enemy.isDamaged && this.enemy.damageTimer > 0) {
            if (this.enemy.isDead) {
                this.enemy.isDamaged = false;
                this.enemy.damageTimer = 0;
            } else {
                this.enemy.damageTimer -= deltaTime;
                if (this.enemy.damageTimer <= 0) {
                    this.enemy.isDamaged = false;
                    // Return to appropriate animation
                    this.updateAnimationBasedOnState(Math.abs(this.enemy.velocityX) > 0.5);
                }
            }
        }
    }
}