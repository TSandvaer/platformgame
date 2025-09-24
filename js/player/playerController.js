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

        // Handle space key for jump (one-time trigger)
        if (key === ' ' && this.data.onGround && !this.data.spaceKeyPressed) {
            const jumpPower = this.keys['shift'] ? 1.2 : 1.0;
            this.physics.jump(jumpPower);
            this.data.spaceKeyPressed = true;
            return true; // Handled
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

        // Check if player can run (has stamina and not in cooldown)
        const canRun = this.data.stamina > 0 && this.data.staminaExhaustedTimer <= 0;
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

        // Check if player can run (has stamina and not in cooldown)
        const canRun = this.data.stamina > 0 && this.data.staminaExhaustedTimer <= 0;
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