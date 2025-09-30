class PlayerController {
    constructor(data, physics, animator) {
        this.data = data;
        this.physics = physics;
        this.animator = animator;
        this.keys = {};
    }

    handleKeyDown(key, isDevelopmentMode, propSystem) {
        // Store key state
        this.keys[key.toLowerCase()] = true;

        // Handle belt item usage (keys 1-4) - only in production mode
        if (!isDevelopmentMode && ['1', '2', '3', '4'].includes(key)) {
            const slotIndex = parseInt(key) - 1;
            if (this.data.useBeltItem(slotIndex)) {
                return true; // Handled - item was used
            }
        }

        // Handle space key for jump (one-time trigger)
        if (key === ' ' && this.data.onGround && !this.data.spaceKeyPressed) {
            // Check if player has enough stamina to jump
            const jumpCost = this.data.jumpCost || 10;
            if (this.data.stamina >= jumpCost) {
                const jumpPower = this.keys['shift'] ? 1.2 : 1.0;
                this.physics.jump(jumpPower);
                this.data.spaceKeyPressed = true;
                return true; // Handled
            } else {
                // Not enough stamina, but still consume the key press
                this.data.spaceKeyPressed = true;
                return false; // Not handled (no jump occurred)
            }
        }

        // Ctrl key attack disabled - now using mouse click for attacks
        // (keeping this comment for reference - attacks now handled by mouse input)

        return false; // Not handled
    }

    handleKeyUp(key) {
        this.keys[key.toLowerCase()] = false;

        // Reset space key flag when released
        if (key === ' ') {
            this.data.spaceKeyPressed = false;
        }
    }

    update(deltaTime, isDevelopmentMode, propSystem) {
        if (isDevelopmentMode) {
            this.updateDevelopmentControls(deltaTime, propSystem);
        } else {
            this.updateProductionControls();
        }
    }

    updateDevelopmentControls(deltaTime, propSystem) {
        // Don't allow movement if player is dead
        if (this.data.isDead) {
            this.animator.updateAnimationBasedOnState(false, true);
            return;
        }

        // Check if we're nudging a prop
        const isNudgingProp = propSystem &&
            (propSystem.selectedProp ||
             (propSystem.selectedProps && propSystem.selectedProps.length > 0));

        // Use delta time for framerate-independent movement
        const moveMultiplier = deltaTime / 16.67;

        // Check if player can run (has enough stamina to start running and not in cooldown)
        const runningCost = this.data.runningCost || 1.5;
        const minStaminaToRun = runningCost / 60; // Minimum stamina for one frame of running
        const canRun = this.data.stamina >= minStaminaToRun && this.data.staminaExhaustedTimer <= 0;
        const wantsToRun = this.keys['shift'];
        const isRunning = wantsToRun && canRun;
        const speedMultiplier = isRunning ? 1.62 : 1.0; // 1.5 * 1.08 = 8% faster running

        let isMoving = false;

        // Don't use arrow keys for player movement if nudging props
        if (!isNudgingProp) {
            if (this.keys['arrowleft']) {
                this.data.x -= this.data.speed * moveMultiplier * speedMultiplier;
                this.data.facing = 'left';
                isMoving = true;
            }
            if (this.keys['arrowright']) {
                this.data.x += this.data.speed * moveMultiplier * speedMultiplier;
                this.data.facing = 'right';
                isMoving = true;
            }
            if (this.keys['arrowup']) {
                this.data.y -= this.data.speed * moveMultiplier * speedMultiplier;
                isMoving = true;
            }
            if (this.keys['arrowdown']) {
                this.data.y += this.data.speed * moveMultiplier * speedMultiplier;
                isMoving = true;
            }
        }

        // WASD works regardless of prop selection
        if (this.keys['a']) {
            this.data.x -= this.data.speed * moveMultiplier * speedMultiplier;
            this.data.facing = 'left';
            isMoving = true;
        }
        if (this.keys['d']) {
            this.data.x += this.data.speed * moveMultiplier * speedMultiplier;
            this.data.facing = 'right';
            isMoving = true;
        }
        if (this.keys['w']) {
            this.data.y -= this.data.speed * moveMultiplier * speedMultiplier;
            isMoving = true;
        }
        if (this.keys['s']) {
            this.data.y += this.data.speed * moveMultiplier * speedMultiplier;
            isMoving = true;
        }

        // Update running state - but only if we have stamina
        this.data.isRunning = isRunning && isMoving && this.data.stamina > 0;

        // Store whether player is trying to run (for stamina regeneration)
        this.data.isTryingToRun = wantsToRun && isMoving;

        // Update animation based on movement
        this.animator.updateAnimationBasedOnState(isMoving, true);
    }

    updateProductionControls() {
        // Don't allow movement if player is dead
        if (this.data.isDead) {
            this.data.velocityX = 0; // Stop any existing momentum
            this.animator.updateAnimationBasedOnState(false, false);
            return;
        }

        // Check if player can run (has enough stamina to start running and not in cooldown)
        const runningCost = this.data.runningCost || 1.5;
        const minStaminaToRun = runningCost / 60; // Minimum stamina for one frame of running
        const canRun = this.data.stamina >= minStaminaToRun && this.data.staminaExhaustedTimer <= 0;
        const wantsToRun = this.keys['shift'];
        const isRunning = wantsToRun && canRun;
        const speedMultiplier = isRunning ? 1.62 : 1.0; // 1.5 * 1.08 = 8% faster running

        let isMoving = false;

        if (this.keys['arrowleft'] || this.keys['a']) {
            this.data.velocityX = -this.data.speed * speedMultiplier;
            this.data.facing = 'left';
            isMoving = true;
        } else if (this.keys['arrowright'] || this.keys['d']) {
            this.data.velocityX = this.data.speed * speedMultiplier;
            this.data.facing = 'right';
            isMoving = true;
        } else {
            this.physics.applyFriction();
        }

        // Update running state - but only if we have stamina
        this.data.isRunning = isRunning && isMoving && this.data.stamina > 0;

        // Store whether player is trying to run (for stamina regeneration)
        this.data.isTryingToRun = wantsToRun && isMoving;

        // Update animation based on movement
        this.animator.updateAnimationBasedOnState(isMoving, false);
    }

    startAttack() {
        return this.animator.startAttack();
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }

    clearKeys() {
        this.keys = {};
        this.data.spaceKeyPressed = false;
    }
}