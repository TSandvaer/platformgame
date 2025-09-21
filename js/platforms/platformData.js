class PlatformData {
    constructor() {
        // Start with empty platforms - they will be loaded from scene data
        this.platforms = [];
        this.nextPlatformId = 0;
        this.selectedPlatform = null;

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
            positioning: 'absolute', // 'absolute', 'relative', 'screen-relative'
            relativeX: 0.5,         // Relative position (0-1) for screen-relative mode
            relativeY: 0.5          // Relative position (0-1) for screen-relative mode
        };

        this.platforms.push(newPlatform);
        this.selectedPlatform = newPlatform;
        return newPlatform;
    }

    deletePlatform(platformId) {
        this.platforms = this.platforms.filter(p => p.id !== platformId);
        if (this.selectedPlatform && this.selectedPlatform.id === platformId) {
            this.selectedPlatform = null;
        }
    }

    deleteSelectedPlatform() {
        if (!this.selectedPlatform) return;
        this.deletePlatform(this.selectedPlatform.id);
    }

    updatePlatform(platform, updates) {
        Object.assign(platform, updates);
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
}