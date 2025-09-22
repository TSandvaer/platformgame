class PlayerSystem {
    constructor() {
        this.data = new PlayerData();
        this.physics = new PlayerPhysics(this.data);
        this.animator = new PlayerAnimator(this.data);
        this.controller = new PlayerController(this.data, this.physics, this.animator);
        this.renderer = new PlayerRenderer(this.data, this.animator);
    }

    // Initialize the player system
    init() {
        // Reset to default state
        this.data.reset();
    }

    // Handle key events
    handleKeyDown(key, isDevelopmentMode, propSystem) {
        return this.controller.handleKeyDown(key, isDevelopmentMode, propSystem);
    }

    handleKeyUp(key) {
        this.controller.handleKeyUp(key);
    }

    // Main update loop
    update(deltaTime, isDevelopmentMode, platformSystem, propSystem, sceneSystem, viewport) {
        // Update controls
        this.controller.update(deltaTime, isDevelopmentMode, propSystem);

        // Update physics
        this.physics.update(deltaTime, isDevelopmentMode, platformSystem, propSystem, sceneSystem, viewport);

        // Update animation
        this.animator.update(deltaTime, isDevelopmentMode);
    }

    // Render the player
    render(ctx, isDevelopmentMode) {
        this.renderer.render(ctx);

        // Optionally render debug info
        if (isDevelopmentMode) {
            this.renderer.renderDebug(ctx, isDevelopmentMode);
        }
    }

    // Apply scene boundaries
    applyBoundaryConstraints(sceneBoundaries) {
        this.physics.applyBoundaryConstraints(sceneBoundaries);
    }

    // Get player state for saving/loading
    getState() {
        return this.data.getState();
    }

    // Load player state
    loadState(state) {
        this.data.loadState(state);
    }

    // Teleport player to position
    teleportTo(x, y) {
        this.physics.teleportTo(x, y);
    }

    // Get player bounds for collision detection
    getBounds() {
        return this.data.getBounds();
    }

    // Get player center position
    getCenter() {
        return this.data.getCenter();
    }

    // Proxy getters for commonly accessed properties
    get x() { return this.data.x; }
    get y() { return this.data.y; }
    get width() { return this.data.width; }
    get height() { return this.data.height; }
    get velocityX() { return this.data.velocityX; }
    get velocityY() { return this.data.velocityY; }
    get onGround() { return this.data.onGround; }
    get facing() { return this.data.facing; }
    get isAttacking() { return this.data.isAttacking; }
    get currentAnimation() { return this.data.currentAnimation; }

    // Proxy setters for commonly modified properties
    set x(value) { this.data.x = value; }
    set y(value) { this.data.y = value; }
    set velocityX(value) { this.data.velocityX = value; }
    set velocityY(value) { this.data.velocityY = value; }
    set onGround(value) { this.data.onGround = value; }
    set facing(value) { this.data.facing = value; }

    // Clear all input states
    clearInput() {
        this.controller.clearKeys();
    }

    // Check if sprites are loaded
    isReady() {
        return this.animator.isReady();
    }

    // Save current position as valid
    saveValidPosition() {
        this.data.saveValidPosition();
    }

    // Restore to last valid position
    restoreToValidPosition() {
        this.data.restoreToValidPosition();
    }
}