class CameraSystem {
    constructor(game) {
        this.game = game;
        this.data = new CameraData();
        this.manager = new CameraManager(this.data);
        this.controller = new CameraController(this.data, this.manager);
    }

    init(canvas, viewport) {
        this.manager.init(canvas, viewport);
        this.controller.init();
    }

    // Update camera position based on game state
    update(player, sceneSystem, platformSystem, propSystem, isDraggingStartPosition) {
        this.manager.update(player, sceneSystem, platformSystem, propSystem, isDraggingStartPosition);
    }

    // Apply camera transform to rendering context
    applyTransform(ctx) {
        this.manager.applyTransform(ctx);
    }

    // Convert coordinates between screen and world space
    screenToWorld(screenX, screenY) {
        return this.manager.screenToWorld(screenX, screenY);
    }

    worldToScreen(worldX, worldY) {
        return this.manager.worldToScreen(worldX, worldY);
    }

    // Camera control methods
    toggleMode() {
        return this.controller.toggleMode();
    }

    focusOnPlayer(player) {
        this.controller.focusOnPlayer(player);
    }

    // Mouse interaction
    startDrag(mouseX, mouseY) {
        return this.controller.startDrag(mouseX, mouseY);
    }

    updateDrag(mouseX, mouseY) {
        return this.controller.updateDrag(mouseX, mouseY);
    }

    endDrag() {
        return this.controller.endDrag();
    }

    handleMouseMove(mouseX, mouseY, platformSystem, propSystem) {
        this.controller.handleMouseMove(mouseX, mouseY, platformSystem, propSystem);
    }

    // Keyboard control
    handleKeyboardScroll(direction, speed) {
        return this.controller.handleKeyboardScroll(direction, speed);
    }

    // Auto-scroll functionality
    autoScrollToKeepInView(target, marginFromEdge, scrollSpeed) {
        this.controller.autoScrollToKeepInView(target, marginFromEdge, scrollSpeed);
    }

    // State management
    setDevelopmentMode(isDev) {
        this.manager.setDevelopmentMode(isDev);
    }

    setDashboardState(showDashboard) {
        this.manager.setDashboardState(showDashboard);
    }

    // Direct camera access (for compatibility)
    get camera() {
        return this.data;
    }

    get x() {
        return this.data.x;
    }

    set x(value) {
        this.data.x = value;
    }

    get y() {
        return this.data.y;
    }

    set y(value) {
        this.data.y = value;
    }

    get mode() {
        return this.data.mode;
    }

    set mode(value) {
        this.data.setMode(value);
        this.controller.updateModeButton();
    }

    // Scene transitions
    resetForScene() {
        this.data.reset();
    }

    // Debug information
    getDebugInfo() {
        return this.controller.getDebugInfo();
    }

    // Save/Load camera state
    getState() {
        return this.data.getState();
    }

    loadState(state) {
        this.data.loadState(state);
        this.controller.updateModeButton();
    }
}