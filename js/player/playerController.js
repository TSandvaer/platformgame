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

        // Handle Ctrl key for attack (but not in development mode with props selected)
        if (key === 'Control' && !this.data.isAttacking) {
            // Don't attack if in development mode and props are selected
            const hasSelectedProps = isDevelopmentMode && propSystem &&
                (propSystem.selectedProp ||
                 (propSystem.selectedProps && propSystem.selectedProps.length > 0));

            if (!hasSelectedProps) {
                this.startAttack();
                return true; // Handled
            }
        }

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
        // Check if we're nudging a prop
        const isNudgingProp = propSystem &&
            (propSystem.selectedProp ||
             (propSystem.selectedProps && propSystem.selectedProps.length > 0));

        // Use delta time for framerate-independent movement
        const moveMultiplier = deltaTime / 16.67;
        const speedMultiplier = this.keys['shift'] ? 1.5 : 1.0;
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

        // Update animation based on movement
        this.animator.updateAnimationBasedOnState(isMoving, true);
    }

    updateProductionControls() {
        const speedMultiplier = this.keys['shift'] ? 1.5 : 1.0;
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