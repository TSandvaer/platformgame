class EditorSystem {
    constructor(game) {
        this.game = game;
        this.isDevelopmentMode = true;
        this.showDashboard = true;

        // Initialize sub-systems
        this.ui = new EditorUI(this);
        this.mode = new EditorMode(this);
        this.tools = new EditorTools(this);
        this.contextMenu = new EditorContextMenu(this);

        // Editor state
        this.contextMenuCoords = null;
    }

    initialize() {
        // Initialize all sub-systems
        this.ui.initialize();
        this.mode.initialize();
        this.tools.initialize();
        this.contextMenu.initialize();

        // Set initial mode
        this.setDevelopmentMode(true);
    }

    setDevelopmentMode(isDev) {
        this.isDevelopmentMode = isDev;
        this.mode.setMode(isDev);
        this.ui.updateUIVisibility(isDev);

        // Update related systems
        this.game.cameraSystem.setDevelopmentMode(isDev);

        // Clear invalid zones cache when switching modes
        if (this.game.sceneSystem && this.game.sceneSystem.manager) {
            this.game.sceneSystem.manager.invalidZonesChecked = new Set();
            this.game.sceneSystem.manager.lastCheckedSceneId = null;
        }

        if (isDev) {
            this.game.platformSystem.updatePlatformList();
            this.game.propSystem.updatePropList();
            this.game.sceneSystem.updateUI();
        } else {
            // Production mode - start with the designated start scene
            this.game.sceneSystem.startGame();
        }
    }

    toggleDashboard() {
        this.showDashboard = !this.showDashboard;
        this.ui.toggleDashboard(this.showDashboard);

        // Update canvas size
        const newWidth = window.innerWidth - (this.showDashboard ? 300 : 0);
        const newHeight = window.innerHeight;

        this.game.canvas.width = newWidth;
        this.game.canvas.height = newHeight;
        this.game.canvas.style.width = newWidth + 'px';
        this.game.canvas.style.height = newHeight + 'px';

        // Keep design dimensions constant
        this.game.viewport.designWidth = 1920;
        this.game.viewport.designHeight = 1080;

        this.game.updateViewport();

        // Reset space key state to prevent it from getting stuck
        this.game.player.spaceKeyPressed = false;

        // Ensure canvas maintains focus for key events
        this.game.canvas.focus();

        // Force a render to see the changes immediately
        this.game.render();
    }

    renderDevelopmentInfo(ctx) {
        if (!this.isDevelopmentMode) return;

        // Update coordinates display
        const coordsElement = document.getElementById('coordinates');
        if (coordsElement && this.game.inputMouse) {
            const mousePos = this.game.inputMouse.getMousePosition();
            const worldCoords = this.game.cameraSystem.screenToWorld(mousePos.x, mousePos.y);
            coordsElement.textContent = `X: ${Math.round(worldCoords.x)}, Y: ${Math.round(worldCoords.y)}`;
        }

        // Render any other development overlays
        this.tools.renderOverlays(ctx);
    }
}