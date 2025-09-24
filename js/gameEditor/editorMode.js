class EditorMode {
    constructor(editorSystem) {
        this.editor = editorSystem;
        this.game = editorSystem.game;
        this.currentMode = 'development';
    }

    initialize() {
        // Set initial mode
        this.setMode(true);
    }

    setMode(isDevelopment) {
        this.currentMode = isDevelopment ? 'development' : 'production';

        // Update game state based on mode
        if (isDevelopment) {
            this.enterDevelopmentMode();
        } else {
            this.enterProductionMode();
        }
    }

    enterDevelopmentMode() {
        // Enable development features
        console.log('Entering Development Mode');

        // Show player start position
        if (this.game.sceneSystem && this.game.sceneSystem.renderer) {
            this.game.sceneSystem.renderer.showStartPosition = true;
        }

        // Enable platform and prop editing
        this.enableEditing();

        // Keep camera in character mode by default in development
        // User can switch to free mode using the camera mode button if needed
        if (this.game.cameraSystem) {
            this.game.cameraSystem.mode = 'character';
        }
    }

    enterProductionMode() {
        // Disable development features
        console.log('Entering Production Mode');

        // Hide player start position
        if (this.game.sceneSystem && this.game.sceneSystem.renderer) {
            this.game.sceneSystem.renderer.showStartPosition = false;
        }

        // Disable platform and prop editing
        this.disableEditing();

        // Set camera to follow player
        if (this.game.cameraSystem) {
            this.game.cameraSystem.mode = 'character';
        }

        // Cancel any ongoing editing operations
        this.cancelAllEditOperations();

        // Load the start scene for production gameplay
        if (this.game.sceneSystem) {
            const success = this.game.sceneSystem.startGame();
            if (success) {
                console.log('🎯 Production mode: Loaded start scene for gameplay');
            } else {
                console.warn('🎯 Production mode: No start scene found, staying on current scene');
            }
        }
    }

    enableEditing() {
        // Enable platform editing
        if (this.game.platformSystem) {
            // Platform system already handles editing through isDevelopmentMode flag
        }

        // Enable prop editing
        if (this.game.propSystem) {
            // Prop system already handles editing through isDevelopmentMode flag
        }
    }

    disableEditing() {
        // Deselect any selected platforms
        if (this.game.platformSystem) {
            this.game.platformSystem.selectedPlatform = null;
            this.game.platformSystem.isDragging = false;
            this.game.platformSystem.isResizing = false;
        }

        // Deselect any selected props
        if (this.game.propSystem) {
            this.game.propSystem.selectedProp = null;
            this.game.propSystem.isDraggingProp = false;
            this.game.propSystem.isDraggingMultiple = false;
        }
    }

    cancelAllEditOperations() {
        // Cancel transition zone creation
        if (this.editor.isAddingTransition) {
            this.editor.isAddingTransition = false;
            this.editor.transitionStart = null;
            this.editor.transitionEnd = null;
        }

        // Cancel platform placement
        if (this.game.platformSystem && this.game.platformSystem.platformPlacementMode) {
            this.game.platformSystem.platformPlacementMode = false;
            const btn = document.getElementById('addPlatform');
            if (btn) {
                btn.textContent = 'Add Platform (Click on map)';
                btn.classList.remove('danger');
            }
        }

        // Hide context menu
        if (this.editor.contextMenu) {
            this.editor.contextMenu.hide();
        }
    }

    isDevelopment() {
        return this.currentMode === 'development';
    }

    isProduction() {
        return this.currentMode === 'production';
    }
}