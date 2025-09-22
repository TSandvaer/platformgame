class InputSystem {
    constructor(game) {
        this.game = game;

        // Initialize input modules
        this.keyboard = new InputKeyboard(game);
        this.mouse = new InputMouse(game);
        this.editor = new InputEditor(game);
    }

    // Get keyboard state
    get keys() {
        return this.keyboard.keys;
    }

    // Check if a key is pressed
    isKeyPressed(key) {
        return this.keyboard.isKeyPressed(key);
    }

    // Clear all input states
    clearAll() {
        this.keyboard.clearKeys();
        this.mouse.stopDragScrolling();
    }

    // Get mouse position
    getMousePosition() {
        return this.mouse.getMousePosition();
    }

    // Check if drag scrolling
    isDragScrolling() {
        return this.mouse.dragScrolling;
    }

    // Start/stop drag scrolling programmatically
    startDragScrolling(e) {
        this.mouse.startDragScrolling(e);
    }

    stopDragScrolling() {
        this.mouse.stopDragScrolling();
    }

    // Handle input for player movement (called from game loop)
    updatePlayerInput() {
        // Pass keys to player controller
        this.game.playerSystem.controller.keys = this.keyboard.keys;
    }

    // Show feedback messages
    showFeedbackMessage(message) {
        this.game.showFeedbackMessage(message);
    }
}