class PlayerData {
    constructor() {
        // Position and size
        this.x = 100;
        this.y = 400;
        this.width = 44;  // 35 * 1.25 = 43.75, rounded to 44
        this.height = 59; // 47 * 1.25 = 58.75, rounded to 59

        // Physics properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 4.675; // 5.5 * 0.85 = 15% slower
        this.jumpPower = -14;
        this.onGround = false;
        this.friction = 0.9;

        // Visual properties
        this.color = '#FF6B6B';
        this.facing = 'right';

        // Animation state
        this.currentAnimation = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameRate = 150; // milliseconds per frame

        // Attack state
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 545;

        // Input state
        this.spaceKeyPressed = false;

        // Player stats for HUD
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;

        // Damage system
        this.isDamaged = false;
        this.damageTimer = 0;
        this.damageCooldown = 500; // 500ms between damage applications
        this.damagingProps = [];   // Array of props currently causing damage
        this.damagingPlatforms = []; // Array of platforms currently causing damage
        this.lastDamageTime = 0;

        // Health regeneration system
        this.healthRegenRate = 50; // HP per second regeneration rate (fast for testing)
        this.lastHealthRegenTime = 0;
        this.healthRegenCooldown = 100; // 100ms between regen ticks

        // Running state
        this.isRunning = false;
        this.isTryingToRun = false; // Whether player is holding shift while moving
        this.staminaExhaustedTimer = 0; // Cooldown timer after stamina depletion

        // Death state
        this.isDead = false;
        this.deathTimer = 0; // Timer for death sequence (3 seconds)
        this.deathStartTime = 0;

        // Tracking
        this.lastValidPosition = { x: 100, y: 400 };
    }

    reset() {
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.facing = 'right';
        this.currentAnimation = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.spaceKeyPressed = false;
        this.health = this.maxHealth;
        this.stamina = this.maxStamina;
        this.isRunning = false;
        this.isTryingToRun = false;
        this.staminaExhaustedTimer = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathStartTime = 0;
        this.lastValidPosition = { x: 100, y: 400 };

        // Reset damage system
        this.isDamaged = false;
        this.damageTimer = 0;
        this.damagingProps = [];
        this.damagingPlatforms = [];
        this.lastDamageTime = 0;

        // Reset health regeneration
        this.lastHealthRegenTime = 0;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.lastValidPosition.x = x;
        this.lastValidPosition.y = y;
    }

    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    saveValidPosition() {
        this.lastValidPosition.x = this.x;
        this.lastValidPosition.y = this.y;
    }

    restoreToValidPosition() {
        this.x = this.lastValidPosition.x;
        this.y = this.lastValidPosition.y;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // Damage system methods
    takeDamage(amount) {
        if (amount <= 0) return false;

        // Apply damage
        this.health = Math.max(0, this.health - amount);
        this.isDamaged = true;
        this.damageTimer = 600; // Duration to match hurt animation cycle (4 frames × 150ms)

        console.log(`Player took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);

        // Trigger hurt animation if available
        if (this.health > 0 && this.currentAnimation !== 'hurt') {
            this.currentAnimation = 'hurt';
            this.frameIndex = 0;
            this.frameTimer = 0;
        }

        return true;
    }

    updateDamageSystem(deltaTime, currentTime, isDevelopmentMode = false) {
        // Update damage visual timer (but clear it if player is dead)
        if (this.isDamaged && this.damageTimer > 0) {
            if (this.isDead) {
                this.isDamaged = false;
                this.damageTimer = 0;
            } else {
                this.damageTimer -= deltaTime;
                if (this.damageTimer <= 0) {
                    this.isDamaged = false;
                }
            }
        }

        // Apply damage from touching props and platforms (only in production mode and if not dead)
        if (!isDevelopmentMode && !this.isDead && (this.damagingProps.length > 0 || this.damagingPlatforms.length > 0) && currentTime - this.lastDamageTime >= this.damageCooldown) {
            // Find highest damage among all touching props and platforms
            const propDamages = this.damagingProps.map(prop => prop.damagePerSecond);
            const platformDamages = this.damagingPlatforms.map(platform => platform.damagePerSecond);
            const allDamages = [...propDamages, ...platformDamages];

            if (allDamages.length > 0) {
                const maxDamage = Math.max(...allDamages);
                if (maxDamage > 0) {
                    // Calculate damage for this interval (damage per second * time interval)
                    const damageAmount = (maxDamage * this.damageCooldown) / 1000;
                    this.takeDamage(damageAmount);
                    this.lastDamageTime = currentTime;
                }
            }
        }

        // Health regeneration (when not taking damage and health is not full)
        if (this.health < this.maxHealth && this.damagingProps.length === 0 && this.damagingPlatforms.length === 0 &&
            currentTime - this.lastHealthRegenTime >= this.healthRegenCooldown) {

            // Calculate regen amount for this interval
            const regenAmount = (this.healthRegenRate * this.healthRegenCooldown) / 1000;
            this.health = Math.min(this.maxHealth, this.health + regenAmount);
            this.lastHealthRegenTime = currentTime;

            if (this.health >= this.maxHealth) {
                console.log('Health fully regenerated!');
            }
        }

        // Check for death
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            this.deathStartTime = currentTime;
            this.deathTimer = 3000; // 3 seconds in milliseconds

            // Trigger death animation
            this.currentAnimation = 'death';
            this.frameIndex = 0;
            this.frameTimer = 0;

            console.log('💀 Player died! Respawning in 3 seconds...');
        }

        // Handle death timer
        if (this.isDead && this.deathTimer > 0) {
            this.deathTimer -= deltaTime;
            if (this.deathTimer <= 0) {
                // Respawn player
                this.isDead = false;
                this.health = this.maxHealth;
                this.stamina = this.maxStamina;

                // Reset position to last valid or default spawn
                if (this.lastValidPosition) {
                    this.x = this.lastValidPosition.x;
                    this.y = this.lastValidPosition.y;
                } else {
                    this.x = 100;
                    this.y = 400;
                }

                this.velocityX = 0;
                this.velocityY = 0;
                this.onGround = false;
                console.log('✨ Player respawned!');
            }
        }

        // Clear damaging props and platforms lists (will be repopulated by collision detection)
        this.damagingProps = [];
        this.damagingPlatforms = [];
    }

    addDamagingProp(prop) {
        if (prop.damagePerSecond > 0) {
            this.damagingProps.push(prop);
        }
    }

    addDamagingPlatform(platform) {
        if (platform.damagePerSecond > 0) {
            this.damagingPlatforms.push(platform);
        }
    }

    getState() {
        return {
            position: { x: this.x, y: this.y },
            velocity: { x: this.velocityX, y: this.velocityY },
            size: { width: this.width, height: this.height },
            facing: this.facing,
            onGround: this.onGround,
            currentAnimation: this.currentAnimation,
            isAttacking: this.isAttacking
        };
    }

    loadState(state) {
        if (state.position) {
            this.x = state.position.x;
            this.y = state.position.y;
        }
        if (state.velocity) {
            this.velocityX = state.velocity.x;
            this.velocityY = state.velocity.y;
        }
        if (state.size) {
            this.width = state.size.width;
            this.height = state.size.height;
        }
        if (state.facing !== undefined) this.facing = state.facing;
        if (state.onGround !== undefined) this.onGround = state.onGround;
        if (state.currentAnimation !== undefined) this.currentAnimation = state.currentAnimation;
        if (state.isAttacking !== undefined) this.isAttacking = state.isAttacking;
    }
}