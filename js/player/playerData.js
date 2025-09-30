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

        // Combat stats
        this.attackDamage = 25;

        // Movement stats
        this.runSpeed = 8; // Running speed (different from walk speed)
        this.staminaRegenRate = 5; // Stamina per second regeneration rate
        this.runningCost = 1.5; // Stamina cost per second while running
        this.jumpCost = 10; // Stamina cost per jump

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

        // Stamina regeneration system
        this.lastStaminaRegenTime = 0;
        this.staminaRegenCooldown = 100; // 100ms between stamina regen ticks

        // Running state
        this.isRunning = false;
        this.isTryingToRun = false; // Whether player is holding shift while moving
        this.staminaExhaustedTimer = 0; // Cooldown timer after stamina depletion
        this.hasJumpedThisFrame = false; // Track if player has jumped this frame for stamina cost

        // Death state
        this.isDead = false;
        this.deathTimer = 0; // Timer for death sequence (3 seconds)
        this.deathStartTime = 0;
        this.killEffect = 'normal'; // Current kill effect: 'normal' or 'sink'
        this.sinkAmount = 0; // How much player has sunk into platform (for sink effect)

        // Tracking
        this.lastValidPosition = { x: 100, y: 400 };

        // Platform/Prop physics - for Newton's first law (object at rest stays at rest relative to moving platform/prop)
        this.standingOnPlatform = null; // Reference to platform player is standing on
        this.standingOnProp = null; // Reference to prop player is standing on
        this.platformVelocity = { x: 0, y: 0 }; // Velocity inherited from platform/prop

        // Player inventory system
        this.playerInventory = []; // Array of items in player's inventory

        // Belt system - 4 slots for quick access (keys 1-4)
        this.belt = [null, null, null, null]; // 4 belt slots for consumables
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
        this.killEffect = 'normal';
        this.sinkAmount = 0;
        this.lastValidPosition = { x: 100, y: 400 };

        // Reset damage system
        this.isDamaged = false;
        this.damageTimer = 0;
        this.damagingProps = [];
        this.damagingPlatforms = [];
        this.lastDamageTime = 0;

        // Reset health regeneration
        this.lastHealthRegenTime = 0;

        // Reset stamina regeneration
        this.lastStaminaRegenTime = 0;

        // Clear player inventory (as requested - no save feature yet)
        this.playerInventory = [];
        this.belt = [null, null, null, null];
    }

    // Player inventory management methods
    addItemToInventory(item, quantity = 1) {
        if (!item || !item.id) {
            console.error('❌ Invalid item provided to addItemToInventory');
            return false;
        }

        // Check if item is stackable and already exists
        if (item.stackable) {
            const existingItem = this.playerInventory.find(invItem => invItem.id === item.id);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + quantity;
                console.log(`📦 Added ${quantity}x ${item.name} to player inventory (now ${existingItem.quantity})`);
                return true;
            }
        }

        // Add new item (or non-stackable item)
        const inventoryItem = {
            ...item,
            quantity: quantity
        };

        this.playerInventory.push(inventoryItem);
        console.log(`📦 Added ${quantity}x ${item.name} to player inventory`);
        return true;
    }

    removeItemFromInventory(itemId, quantity = 1) {
        const itemIndex = this.playerInventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            return false;
        }

        const item = this.playerInventory[itemIndex];
        if (item.stackable && item.quantity > quantity) {
            // Reduce quantity
            item.quantity -= quantity;
            console.log(`📦 Removed ${quantity}x ${item.name} from player inventory (${item.quantity} remaining)`);
        } else {
            // Remove entire item
            this.playerInventory.splice(itemIndex, 1);
            console.log(`📦 Removed ${item.name} from player inventory`);
        }

        return true;
    }

    hasItem(itemId) {
        return this.playerInventory.some(item => item.id === itemId);
    }

    getItemQuantity(itemId) {
        const item = this.playerInventory.find(item => item.id === itemId);
        return item ? (item.quantity || 1) : 0;
    }

    getInventory() {
        return [...this.playerInventory]; // Return copy to prevent external modification
    }

    clearInventory() {
        this.playerInventory = [];
        console.log('🗑️ Player inventory cleared');
    }

    // Belt management methods
    addItemToBelt(slotIndex, item) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.error('❌ Invalid belt slot index:', slotIndex);
            return false;
        }

        // Check if item is consumable
        if (!item || item.type !== 'consumable') {
            console.error('❌ Only consumable items can be placed in belt');
            return false;
        }

        const existingItem = this.belt[slotIndex];

        // If slot is empty, just place the item
        if (!existingItem) {
            this.belt[slotIndex] = { ...item };
            console.log(`⚔️ Added ${item.name} to belt slot ${slotIndex + 1}`);
            return true;
        }

        // If same item type, stack them
        if (existingItem.id === item.id) {
            const itemQuantity = item.quantity || 1;
            existingItem.quantity = (existingItem.quantity || 1) + itemQuantity;
            console.log(`⚔️ Stacked ${item.name} in belt slot ${slotIndex + 1} (quantity: ${existingItem.quantity})`);
            return true;
        }

        // Different item type - replace the existing item
        // Return the displaced item to inventory
        this.addItemToInventory(existingItem);
        this.belt[slotIndex] = { ...item };
        console.log(`⚔️ Replaced ${existingItem.name} with ${item.name} in belt slot ${slotIndex + 1} (returned ${existingItem.name} to inventory)`);
        return true;
    }

    removeItemFromBelt(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.error('❌ Invalid belt slot index:', slotIndex);
            return null;
        }

        const item = this.belt[slotIndex];
        this.belt[slotIndex] = null;
        return item;
    }

    useBeltItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.error('❌ Invalid belt slot index:', slotIndex);
            return false;
        }

        const beltItem = this.belt[slotIndex];
        if (!beltItem) {
            console.log(`⚔️ No item in belt slot ${slotIndex + 1}`);
            return false;
        }

        // Use the consumable item directly from belt (apply its effects)
        if (beltItem.healAmount) {
            const healAmount = beltItem.healAmount;
            this.health = Math.min(this.health + healAmount, this.maxHealth);
            console.log(`💊 Used ${beltItem.name} - Healed ${healAmount} HP`);
        }

        if (beltItem.staminaAmount) {
            const staminaAmount = beltItem.staminaAmount;
            this.stamina = Math.min(this.stamina + staminaAmount, this.maxStamina);
            console.log(`⚡ Used ${beltItem.name} - Restored ${staminaAmount} stamina`);
        }

        // Apply any other effects
        if (beltItem.effects) {
            if (beltItem.effects.health) {
                this.health = Math.min(this.health + beltItem.effects.health, this.maxHealth);
            }
            if (beltItem.effects.stamina) {
                this.stamina = Math.min(this.stamina + beltItem.effects.stamina, this.maxStamina);
            }
        }

        // Handle quantity - reduce by 1 or remove completely
        if (beltItem.quantity && beltItem.quantity > 1) {
            beltItem.quantity -= 1;
            console.log(`⚔️ ${beltItem.name} quantity reduced to ${beltItem.quantity} in belt slot ${slotIndex + 1}`);
        } else {
            // Remove from belt when used up
            this.belt[slotIndex] = null;
            console.log(`⚔️ Belt slot ${slotIndex + 1} is now empty`);
        }

        return true;
    }

    clearBelt() {
        this.belt = [null, null, null, null];
        console.log('🗑️ Belt cleared');
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

        // Stamina regeneration (when not running and stamina is not full)
        if (this.stamina < this.maxStamina && !this.isRunning &&
            currentTime - this.lastStaminaRegenTime >= this.staminaRegenCooldown) {

            // Calculate stamina regen amount for this interval
            const staminaRegenAmount = (this.staminaRegenRate * this.staminaRegenCooldown) / 1000;
            this.stamina = Math.min(this.maxStamina, this.stamina + staminaRegenAmount);
            this.lastStaminaRegenTime = currentTime;
        }

        // Check for death
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            this.deathStartTime = currentTime;
            this.deathTimer = 3000; // 3 seconds in milliseconds

            // Determine kill effect from the deadliest platform
            const allDamageSources = [...this.damagingProps, ...this.damagingPlatforms];
            if (allDamageSources.length > 0) {
                // Find the source with highest damage
                const deadliestSource = allDamageSources.reduce((max, current) =>
                    current.damagePerSecond > max.damagePerSecond ? current : max
                );

                // Set kill effect from platform (props don't have kill effects, default to normal)
                this.killEffect = deadliestSource.killEffect || 'normal';
            } else {
                this.killEffect = 'normal';
            }

            this.sinkAmount = 0; // Reset sink amount

            // Trigger death animation
            this.currentAnimation = 'death';
            this.frameIndex = 0;
            this.frameTimer = 0;

            console.log(`💀 Player died with ${this.killEffect} effect! Respawning in 3 seconds...`);
        }

        // Handle death timer and kill effects
        if (this.isDead && this.deathTimer > 0) {
            this.deathTimer -= deltaTime;

            // Handle sink effect during death
            if (this.killEffect === 'sink') {
                // Gradually sink into the platform over the death timer duration
                const sinkProgress = (3000 - this.deathTimer) / 3000; // 0 to 1
                this.sinkAmount = Math.min(this.height * 0.8, sinkProgress * this.height * 0.8); // Sink up to 80% of height
            }

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