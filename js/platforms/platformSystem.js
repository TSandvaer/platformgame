class PlatformSystem {
    constructor(ctx, platformSprites) {
        this.data = new PlatformData();
        this.renderer = new PlatformRenderer(ctx, platformSprites);
        this.collisions = new PlatformCollisions();
        this.manager = new PlatformManager(this.data);
    }

    // Data access methods
    get platforms() {
        return this.data.platforms;
    }

    set platforms(value) {
        this.data.platforms = value;
    }

    get selectedPlatform() {
        return this.data.selectedPlatform;
    }

    set selectedPlatform(value) {
        this.data.selectedPlatform = value;
    }

    get platformPlacementMode() {
        return this.data.platformPlacementMode;
    }

    set platformPlacementMode(value) {
        this.data.platformPlacementMode = value;
    }

    get nextPlatformId() {
        return this.data.nextPlatformId;
    }

    set nextPlatformId(value) {
        this.data.nextPlatformId = value;
    }

    // Rendering
    renderPlatforms(isDevelopmentMode, viewport) {
        this.data.platforms.forEach(platform => {
            const isSelected = this.data.selectedPlatform && this.data.selectedPlatform.id === platform.id;

            // Get actual position based on positioning mode
            const actualPos = this.data.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            this.renderer.renderPlatform(renderPlatform, isDevelopmentMode, isSelected);
        });
    }

    // Collision detection
    checkPlayerPlatformCollisions(player, viewport) {
        // Convert platforms to actual positions for collision detection
        const actualPlatforms = this.data.platforms.map(platform => {
            const actualPos = this.data.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
            return { ...platform, x: actualPos.x, y: actualPos.y };
        });
        this.collisions.checkPlayerPlatformCollisions(player, actualPlatforms);
    }

    checkCollision(rect1, rect2) {
        return this.collisions.checkCollision(rect1, rect2);
    }

    // Platform management
    addPlatform(x, y) {
        return this.data.addPlatform(x, y);
    }

    deleteSelectedPlatform() {
        this.data.deleteSelectedPlatform();
        this.manager.updatePlatformProperties();
        this.manager.updatePlatformList();
    }

    togglePlatformPlacement() {
        this.manager.togglePlatformPlacement();
    }

    // Mouse event handling
    handleMouseDown(mouseX, mouseY, camera) {
        const result = this.manager.handleMouseDown(mouseX, mouseY, camera);
        if (result.handled) {
            this.manager.updatePlatformProperties();
            this.manager.updatePlatformList();
        }
        return result;
    }

    handleMouseMove(mouseX, mouseY, viewport) {
        const moved = this.manager.handleMouseMove(mouseX, mouseY, viewport);
        if (moved) {
            this.manager.updatePlatformProperties();
        }
        return moved;
    }

    handleMouseUp() {
        this.manager.handleMouseUp();
    }

    // UI updates
    updatePlatformList() {
        this.manager.updatePlatformList();
    }

    updatePlatformProperties() {
        this.manager.updatePlatformProperties();
    }

    updateSelectedPlatform() {
        this.manager.updateSelectedPlatform();
    }

    // Utility methods
    isPointInPlatform(x, y, platform) {
        return this.data.isPointInPlatform(x, y, platform);
    }

    getResizeHandle(platform, mouseX, mouseY) {
        return this.manager.getResizeHandle(platform, mouseX, mouseY);
    }

    snapPlatformPosition(platform, newX, newY) {
        return this.manager.snapPlatformPosition(platform, newX, newY);
    }

    handlePlatformResize(mouseX, mouseY) {
        this.manager.handlePlatformResize(mouseX, mouseY);
    }

    // State management
    get isDragging() {
        return this.data.isDragging;
    }

    set isDragging(value) {
        this.data.isDragging = value;
    }

    get isResizing() {
        return this.data.isResizing;
    }

    set isResizing(value) {
        this.data.isResizing = value;
    }

    get dragOffset() {
        return this.data.dragOffset;
    }

    set dragOffset(value) {
        this.data.dragOffset = value;
    }

    get resizeHandle() {
        return this.data.resizeHandle;
    }

    set resizeHandle(value) {
        this.data.resizeHandle = value;
    }

    get resizeStartState() {
        return this.data.resizeStartState;
    }

    set resizeStartState(value) {
        this.data.resizeStartState = value;
    }
}