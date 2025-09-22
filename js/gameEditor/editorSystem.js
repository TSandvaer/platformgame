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
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.transitionEnd = null;
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

    // Transition zone handling
    startAddingTransition() {
        this.isAddingTransition = true;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    setTransitionStart(x, y) {
        this.transitionStart = { x, y };
        this.transitionEnd = { x, y };
    }

    updateTransitionEnd(x, y) {
        if (this.transitionStart) {
            this.transitionEnd = { x, y };
        }
    }

    completeTransition() {
        if (this.isAddingTransition && this.transitionStart && this.transitionEnd) {
            this.game.sceneSystem.handleTransitionCreation(
                this.transitionStart.x, this.transitionStart.y,
                this.transitionEnd.x, this.transitionEnd.y
            );
        }
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    renderTransitionPreview(ctx) {
        if (!this.isAddingTransition || !this.transitionStart || !this.transitionEnd) return;

        ctx.save();

        // Calculate rectangle bounds
        const x = Math.min(this.transitionStart.x, this.transitionEnd.x);
        const y = Math.min(this.transitionStart.y, this.transitionEnd.y);
        const width = Math.abs(this.transitionEnd.x - this.transitionStart.x);
        const height = Math.abs(this.transitionEnd.y - this.transitionStart.y);

        // Draw semi-transparent blue rectangle
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.fillRect(x, y, width, height);

        // Draw border
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw corner indicators
        ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
        const cornerSize = 5;
        ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);

        // Display dimensions
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = `${Math.round(width)} x ${Math.round(height)}`;
        ctx.strokeText(text, x + width/2 - 30, y - 10);
        ctx.fillText(text, x + width/2 - 30, y - 10);

        ctx.restore();
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

        // Render transition preview if active
        this.renderTransitionPreview(ctx);

        // Render any other development overlays
        this.tools.renderOverlays(ctx);
    }
}