class InputKeyboard {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        // Skip game key handling if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Store key state for regular game input
        const key = e.key.toLowerCase();

        // Don't register arrow keys for player movement if we're nudging props
        const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
        const isNudgingProp = this.game.isDevelopmentMode &&
            (this.game.propSystem.selectedProp ||
             (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0));

        if (!(isArrowKey && isNudgingProp)) {
            this.keys[key] = true;
        }

        // Let player system handle special keys
        const handled = this.game.playerSystem.handleKeyDown(e.key, this.game.isDevelopmentMode, this.game.propSystem);
        if (handled && e.key === ' ') {
            e.preventDefault(); // Prevent page scrolling for space
        }
        if (handled && e.key === 'Control') {
            e.preventDefault(); // Prevent browser shortcuts
        }

        // Prevent browser shortcuts when Ctrl is held down with other keys
        if (e.ctrlKey && (e.key === ' ' || e.key === 'Space')) {
            e.preventDefault();
        }

        // Handle development mode keyboard shortcuts
        if (this.game.isDevelopmentMode) {
            this.handleDevelopmentKeys(e);
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;

        // Let player system handle key up
        this.game.playerSystem.handleKeyUp(e.key);

        // Prevent browser shortcuts for Control key
        if (e.key === 'Control') {
            e.preventDefault();
        }
    }

    handleDevelopmentKeys(e) {
        // Handle Copy (Ctrl+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            this.handleCopy();
        }

        // Handle Paste (Ctrl+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            this.handlePaste();
        }

        // Handle Select All (Ctrl+A)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            this.handleSelectAll();
        }

        // Handle Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.handleDelete();
        }

        // Handle Escape key
        if (e.key === 'Escape') {
            this.handleEscape();
        }

        // Handle arrow key nudging for selected props
        if (this.game.propSystem.selectedProp ||
            (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0)) {
            this.handlePropNudging(e);
        }
    }

    handleCopy() {
        // Get current mouse position for feedback message
        const mousePos = this.game.inputSystem.mouse.getMousePosition();
        const worldCoords = this.game.cameraSystem.screenToWorld(mousePos.x, mousePos.y);

        // Copy selected platforms (if platform multi-selection is supported)
        if (this.game.platformSystem.getSelectedPlatforms) {
            const selectedPlatforms = this.game.platformSystem.getSelectedPlatforms();
            if (selectedPlatforms.length > 0) {
                this.game.platformSystem.copyPlatforms(selectedPlatforms);
                this.game.showFeedbackMessage(`Copied ${selectedPlatforms.length} platform(s)`, worldCoords.x, worldCoords.y);
                return;
            }
        }

        // Copy selected props
        if (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0) {
            this.game.propSystem.copySelectedProps();
            this.game.showFeedbackMessage(`Copied ${this.game.propSystem.selectedProps.length} prop(s)`, worldCoords.x, worldCoords.y);
        } else if (this.game.propSystem.selectedProp) {
            this.game.propSystem.copySelectedProps();
            this.game.showFeedbackMessage('Copied 1 prop', worldCoords.x, worldCoords.y);
        }
    }

    handlePaste() {
        // Get current mouse position from input system
        const mousePos = this.game.inputSystem.mouse.getMousePosition();
        const worldCoords = this.game.cameraSystem.screenToWorld(mousePos.x, mousePos.y);

        // Try to paste platforms first
        if (this.game.platformSystem.clipboard && this.game.platformSystem.clipboard.length > 0) {
            const pastedCount = this.game.platformSystem.pastePlatforms(worldCoords.x, worldCoords.y);

            if (pastedCount > 0) {
                this.game.showFeedbackMessage(`Pasted ${pastedCount} platform(s)`, worldCoords.x, worldCoords.y);
            }
            return;
        }

        // Try to paste props
        if (this.game.propSystem.copiedProps && this.game.propSystem.copiedProps.length > 0) {
            const count = this.game.propSystem.copiedProps.length;
            this.game.propSystem.pasteProps(worldCoords.x, worldCoords.y);
            this.game.showFeedbackMessage(`Pasted ${count} prop(s)`, worldCoords.x, worldCoords.y);
        }
    }

    handleSelectAll() {
        // Select all platforms (if platform multi-selection is supported)
        const allPlatforms = this.game.platformSystem.platforms;
        if (allPlatforms && allPlatforms.length > 0 && this.game.platformSystem.selectedPlatforms !== undefined) {
            this.game.platformSystem.selectedPlatforms = [...allPlatforms];
            this.game.showFeedbackMessage(`Selected ${allPlatforms.length} platform(s)`);
        }
    }

    handleDelete() {
        // Delete selected platforms (if platform multi-selection is supported)
        if (this.game.platformSystem.getSelectedPlatforms) {
            const selectedPlatforms = this.game.platformSystem.getSelectedPlatforms();
            if (selectedPlatforms.length > 0) {
                selectedPlatforms.forEach(platform => {
                    const index = this.game.platformSystem.platforms.indexOf(platform);
                    if (index > -1) {
                        this.game.platformSystem.platforms.splice(index, 1);
                    }
                });
                this.game.platformSystem.clearSelection();
                this.game.showFeedbackMessage(`Deleted ${selectedPlatforms.length} platform(s)`);
                return;
            }
        }

        // Delete selected props
        if (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0) {
            const count = this.game.propSystem.selectedProps.length;
            this.game.propSystem.deleteSelectedProps();
            this.game.showFeedbackMessage(`Deleted ${count} prop(s)`);
        } else if (this.game.propSystem.selectedProp) {
            this.game.propSystem.deleteSelectedProp();
            this.game.showFeedbackMessage('Deleted 1 prop');
        }
    }

    handleEscape() {
        // Clear platform selection
        this.game.platformSystem.clearSelection();

        // Clear prop selection
        this.game.propSystem.clearSelection();

        // Cancel any ongoing operations
        if (this.game.isAddingTransition) {
            this.game.isAddingTransition = false;
            this.game.transitionStart = null;
            this.game.showFeedbackMessage('Transition zone creation cancelled');
        }

        if (this.game.isAddingPlatform) {
            this.game.isAddingPlatform = false;
            this.game.showFeedbackMessage('Platform creation cancelled');
        }
    }

    handlePropNudging(e) {
        const nudgeAmount = e.shiftKey ? 10 : 1;
        let nudged = false;

        if (e.key === 'ArrowLeft') {
            this.game.propSystem.nudgeSelectedProps(-nudgeAmount, 0);
            nudged = true;
        } else if (e.key === 'ArrowRight') {
            this.game.propSystem.nudgeSelectedProps(nudgeAmount, 0);
            nudged = true;
        } else if (e.key === 'ArrowUp') {
            this.game.propSystem.nudgeSelectedProps(0, -nudgeAmount);
            nudged = true;
        } else if (e.key === 'ArrowDown') {
            this.game.propSystem.nudgeSelectedProps(0, nudgeAmount);
            nudged = true;
        }

        if (nudged) {
            e.preventDefault();
        }
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }

    clearKeys() {
        this.keys = {};
    }
}