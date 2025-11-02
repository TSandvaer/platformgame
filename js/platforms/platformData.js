class PlatformData {
    constructor() {
        // Start with empty platforms - they will be loaded from scene data
        this.platforms = [];
        this.nextPlatformId = 0;
        this.nextPlatformZOrder = 0;
        this.selectedPlatform = null;
        this.game = null; // Will be set by platformSystem

        // Platform placement system
        this.platformPlacementMode = false;

        // Platform drag/resize state
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.resizeStartState = null;
    }

    addPlatform(x, y) {
        const newPlatform = {
            id: this.nextPlatformId++,
            x: x,
            y: y,
            width: 150,
            height: 20,
            color: '#4ECDC4',
            spriteType: 'color',
            zOrder: 0,              // Rendering order (lower values render first/behind)
            positioning: 'absolute', // 'absolute', 'relative', 'screen-relative'
            relativeX: 0.5,         // Relative position (0-1) for screen-relative mode
            relativeY: 0.5,         // Relative position (0-1) for screen-relative mode
            damagePerSecond: 0,     // Damage dealt to player per second when standing on platform
            killEffect: 'normal',   // Kill effect: 'normal' (player lies on platform) or 'sink' (player sinks into platform)
            blockPlayer: false,     // If true, blocks player from all sides and stops movement on collision
            // Movement system properties
            isMoving: false,
            moveSpeed: 2,
            movementZone: {
                enabled: false,
                startX: x - 50,
                startY: y,
                endX: x + 50,
                endY: y,
                angle: 0  // Angle in radians for line direction
            },
            // Movement state
            velocityX: 0,
            velocityY: 0,
            targetX: x,
            targetY: y,
            movingDirection: 1, // 1 for forward along line, -1 for backward
            movementProgress: 0, // 0-1 position along the movement line
            // Movement control properties
            isMovementPaused: false, // For stop/start control in dev mode
            originalPosition: { x: x, y: y }, // Store original position for reset
            // Movement easing and delay properties
            useEasing: false, // Enable easing near movement zone ends
            easingDistance: 0.2, // Distance from ends (0-1) where easing applies
            easingMinSpeed: 0.2, // Minimum speed multiplier when easing (0-1, e.g. 0.2 = 20% of normal speed)
            endDelay: 0, // Delay in milliseconds at movement zone ends
            delayTimer: 0, // Current delay timer
            isDelaying: false, // Whether platform is currently delaying at an end
            // Spinning properties
            rotation: 0, // Current rotation angle in radians
            isSpinning: false,
            spinSpeed: 1.0, // Rotations per second
            spinClockwise: true // true for clockwise, false for counter-clockwise
        };

        this.platforms.push(newPlatform);
        this.selectedPlatform = newPlatform;

        // Mark scene as dirty when platform is added
        if (this.game && this.game.sceneSystem && this.game.sceneSystem.manager) {
            this.game.sceneSystem.manager.markSceneAsDirty();
        }

        return newPlatform;
    }

    deletePlatform(platformId) {
        this.platforms = this.platforms.filter(p => p.id !== platformId);
        if (this.selectedPlatform && this.selectedPlatform.id === platformId) {
            this.selectedPlatform = null;
        }

        // Mark scene as dirty when platform is deleted
        if (this.game && this.game.sceneSystem && this.game.sceneSystem.manager) {
            this.game.sceneSystem.manager.markSceneAsDirty();
        }
    }

    deleteSelectedPlatform() {
        if (!this.selectedPlatform) return;
        this.deletePlatform(this.selectedPlatform.id);
    }

    updatePlatform(platform, updates) {
        Object.assign(platform, updates);

        // Mark scene as dirty when platform is updated
        if (this.game && this.game.sceneSystem && this.game.sceneSystem.manager) {
            this.game.sceneSystem.manager.markSceneAsDirty();
        }
    }

    getPlatformById(id) {
        return this.platforms.find(p => p.id === id);
    }

    selectPlatform(platform) {
        this.selectedPlatform = platform;
    }

    clearSelection() {
        this.selectedPlatform = null;
    }

    isPointInPlatform(x, y, platform) {
        return x >= platform.x && x <= platform.x + platform.width &&
               y >= platform.y && y <= platform.y + platform.height;
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Convert screen-relative positioning to absolute coordinates
    getActualPosition(platform, designWidth, designHeight) {
        if (platform.positioning === 'screen-relative') {
            return {
                x: platform.relativeX * designWidth,
                y: platform.relativeY * designHeight
            };
        }
        return { x: platform.x, y: platform.y };
    }

    // Update relative coordinates when absolute position changes
    updateRelativePosition(platform, newX, newY, designWidth, designHeight) {
        if (platform.positioning === 'screen-relative') {
            platform.relativeX = newX / designWidth;
            platform.relativeY = newY / designHeight;
        }
        platform.x = newX;
        platform.y = newY;
    }

    // Z-order management
    moveToFront(platform) {
        platform.zOrder = this.nextPlatformZOrder++;
    }

    moveToBack(platform) {
        // Find minimum z-order
        const minZOrder = Math.min(...this.platforms.map(p => p.zOrder || 0));
        platform.zOrder = minZOrder - 1;
    }
}