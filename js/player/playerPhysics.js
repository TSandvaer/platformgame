class PlayerPhysics {
    constructor(data) {
        this.data = data;
        this.gravity = 0.8;
    }

    update(deltaTime, isDevelopmentMode, platformSystem, propSystem, sceneSystem, viewport) {
        if (isDevelopmentMode) {
            return; // No physics in development mode
        }

        // Track position before physics update
        const startX = this.data.x;
        const startY = this.data.y;

        // Use delta time for framerate-independent physics (60fps = 16.67ms baseline)
        const physicsMultiplier = deltaTime / 16.67;

        // Apply gravity
        this.data.velocityY += this.gravity * physicsMultiplier;

        // Update position
        this.data.x += this.data.velocityX * physicsMultiplier;
        this.data.y += this.data.velocityY * physicsMultiplier;

        // Detect large jumps in position (potential teleportation)
        const deltaX = Math.abs(this.data.x - startX);
        const deltaY = Math.abs(this.data.y - startY);

        // If position changed dramatically (more than would be possible with normal physics)
        if (deltaX > 200 || deltaY > 200) {
            console.warn('🚨 LARGE POSITION CHANGE DETECTED IN PHYSICS!', {
                from: { x: startX, y: startY },
                to: { x: this.data.x, y: this.data.y },
                delta: { x: deltaX, y: deltaY },
                velocity: { x: this.data.velocityX, y: this.data.velocityY },
                physicsMultiplier
            });
        }

        // Reset ground state
        this.data.onGround = false;

        // Check collisions
        this.checkCollisions(platformSystem, propSystem, sceneSystem, viewport);

        // Check if player fell off the world
        this.checkWorldBounds();
    }

    checkCollisions(platformSystem, propSystem, sceneSystem, viewport) {
        // Check platform collisions
        const beforeCollisionX = this.data.x;
        const beforeCollisionY = this.data.y;

        platformSystem.checkPlayerPlatformCollisions(this.data, viewport);

        // Check if platform collision caused teleportation
        if (Math.abs(this.data.x - beforeCollisionX) > 200 ||
            Math.abs(this.data.y - beforeCollisionY) > 200) {
            console.warn('🚨 PLATFORM COLLISION CAUSED TELEPORTATION!', {
                before: { x: beforeCollisionX, y: beforeCollisionY },
                after: { x: this.data.x, y: this.data.y }
            });
        }

        // Check prop collisions
        const beforePropX = this.data.x;
        const beforePropY = this.data.y;

        propSystem.checkPlayerPropCollisions(this.data, viewport);

        // Check if prop collision caused teleportation
        if (Math.abs(this.data.x - beforePropX) > 200 ||
            Math.abs(this.data.y - beforePropY) > 200) {
            console.warn('🚨 PROP COLLISION CAUSED TELEPORTATION!', {
                before: { x: beforePropX, y: beforePropY },
                after: { x: this.data.x, y: this.data.y }
            });
        }

        // Check scene transitions
        const beforeTransitionX = this.data.x;
        const beforeTransitionY = this.data.y;

        const playerCenter = this.data.getCenter();
        sceneSystem.checkTransitions(playerCenter.x, playerCenter.y);

        // Check if transition caused teleportation
        if (Math.abs(this.data.x - beforeTransitionX) > 200 ||
            Math.abs(this.data.y - beforeTransitionY) > 200) {
            console.warn('🚨 SCENE TRANSITION CAUSED TELEPORTATION!', {
                before: { x: beforeTransitionX, y: beforeTransitionY },
                after: { x: this.data.x, y: this.data.y },
                centerPoint: playerCenter
            });
        }
    }

    applyBoundaryConstraints(sceneBoundaries) {
        if (!sceneBoundaries) return;

        const bounds = sceneBoundaries;
        const originalX = this.data.x;
        const originalY = this.data.y;

        // Apply horizontal constraints
        if (this.data.x < bounds.left) {
            this.data.x = bounds.left;
            this.data.velocityX = 0;
        } else if (this.data.x + this.data.width > bounds.right) {
            this.data.x = bounds.right - this.data.width;
            this.data.velocityX = 0;
        }

        // Apply vertical constraints
        if (this.data.y < bounds.top) {
            this.data.y = bounds.top;
            this.data.velocityY = 0;
        } else if (this.data.y + this.data.height > bounds.bottom) {
            this.data.y = bounds.bottom - this.data.height;
            this.data.velocityY = 0;
            this.data.onGround = true;
        }
    }

    checkWorldBounds() {
        // Check if player fell below the viewport
        const playerBottom = this.data.y + this.data.height;

        if (playerBottom > 2000) { // Far below any reasonable game area
            console.warn('🎮 Player fell off the world! Respawning...');
            this.respawnPlayer();
        }
    }

    respawnPlayer() {
        // Try to use last valid position
        if (this.data.lastValidPosition) {
            this.data.x = this.data.lastValidPosition.x;
            this.data.y = this.data.lastValidPosition.y;
        } else {
            // Fallback to default spawn
            this.data.x = 100;
            this.data.y = 400;
        }

        this.data.velocityX = 0;
        this.data.velocityY = 0;
        this.data.onGround = false;
    }

    jump(powerMultiplier = 1.0) {
        if (this.data.onGround) {
            this.data.velocityY = this.data.jumpPower * powerMultiplier;
            this.data.onGround = false;
            return true;
        }
        return false;
    }

    applyFriction() {
        this.data.velocityX *= this.data.friction;
    }

    setGravity(gravity) {
        this.gravity = gravity;
    }

    teleportTo(x, y) {
        this.data.x = x;
        this.data.y = y;
        this.data.velocityX = 0;
        this.data.velocityY = 0;
        this.data.saveValidPosition();
    }
}