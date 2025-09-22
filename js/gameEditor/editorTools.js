class EditorTools {
    constructor(editorSystem) {
        this.editor = editorSystem;
        this.game = editorSystem.game;

        // Tool states
        this.activeTool = null;
        this.gridSnap = true;
        this.gridSize = 10;
    }

    initialize() {
        // Initialize any tool-specific settings
        this.setupGridSnapping();
    }

    setupGridSnapping() {
        // Grid snap can be toggled for precise placement
        this.gridSnap = true;
        this.gridSize = 10;
    }

    snapToGrid(value) {
        if (!this.gridSnap) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    snapPosition(x, y) {
        return {
            x: this.snapToGrid(x),
            y: this.snapToGrid(y)
        };
    }

    // Copy coordinates to clipboard
    copyCoordinates(x, y) {
        const coordsText = `${x}, ${y}`;

        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(coordsText).then(() => {
                console.log('📋 Coordinates copied to clipboard:', coordsText);
                if (this.editor.ui) {
                    this.editor.ui.showTemporaryMessage(`Copied: ${coordsText}`);
                }
            }).catch(err => {
                console.error('Failed to copy to clipboard:', err);
                this.fallbackCopyToClipboard(coordsText);
            });
        } else {
            this.fallbackCopyToClipboard(coordsText);
        }
    }

    fallbackCopyToClipboard(text) {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            console.log('📋 Coordinates copied to clipboard (fallback):', text);
            if (this.editor.ui) {
                this.editor.ui.showTemporaryMessage(`Copied: ${text}`);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            // Show the coordinates in an alert as last resort
            alert(`Coordinates: ${text}`);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // Platform tools
    addPlatformAt(x, y) {
        const snappedPos = this.snapPosition(x, y);
        this.game.platformSystem.addPlatform(snappedPos.x, snappedPos.y);
    }

    // Prop tools
    addPropAt(x, y, type) {
        const snappedPos = this.snapPosition(x, y);
        this.game.propSystem.addProp(type, snappedPos.x, snappedPos.y);
    }

    // Player start position tool
    setPlayerStartPosition(x, y) {
        const snappedPos = this.snapPosition(x, y);
        const currentScene = this.game.sceneSystem.currentScene;
        if (currentScene) {
            currentScene.settings.playerStartX = snappedPos.x;
            currentScene.settings.playerStartY = snappedPos.y;
            console.log(`Player start position set to: ${snappedPos.x}, ${snappedPos.y}`);
        }
    }

    // Render any development overlays
    renderOverlays(ctx) {
        if (!this.editor.isDevelopmentMode) return;

        // Render grid if enabled
        if (this.gridSnap) {
            this.renderGrid(ctx);
        }

        // Render tool-specific overlays
        if (this.activeTool) {
            this.renderToolOverlay(ctx);
        }
    }

    renderGrid(ctx) {
        // Only render grid in development mode with appropriate zoom level
        const camera = this.game.cameraSystem.camera;
        const viewport = this.game.viewport;

        // Don't render grid if zoomed out too much
        if (camera.zoom < 0.5) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;

        // Calculate visible grid area
        const startX = Math.floor(camera.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(camera.y / this.gridSize) * this.gridSize;
        const endX = startX + viewport.width + this.gridSize;
        const endY = startY + viewport.height + this.gridSize;

        // Draw vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            const screenX = (x - camera.x) * camera.zoom;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, viewport.height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            const screenY = (y - camera.y) * camera.zoom;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(viewport.width, screenY);
            ctx.stroke();
        }

        ctx.restore();
    }

    renderToolOverlay(ctx) {
        // Render overlay specific to the active tool
        switch (this.activeTool) {
            case 'platform':
                this.renderPlatformPreview(ctx);
                break;
            case 'prop':
                this.renderPropPreview(ctx);
                break;
            case 'transition':
                // Transition preview is handled by editorSystem
                break;
        }
    }

    renderPlatformPreview(ctx) {
        // Render a preview of where a platform would be placed
        if (this.game.inputMouse) {
            const mousePos = this.game.inputMouse.getMousePosition();
            const worldCoords = this.game.cameraSystem.screenToWorld(mousePos.x, mousePos.y);
            const snappedPos = this.snapPosition(worldCoords.x, worldCoords.y);

            ctx.save();
            ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
            ctx.strokeStyle = 'rgba(78, 205, 196, 0.8)';
            ctx.lineWidth = 2;

            // Default platform size
            const width = 150;
            const height = 20;

            ctx.fillRect(snappedPos.x, snappedPos.y, width, height);
            ctx.strokeRect(snappedPos.x, snappedPos.y, width, height);
            ctx.restore();
        }
    }

    renderPropPreview(ctx) {
        // Render a preview of where a prop would be placed
        // This would show the selected prop type at the mouse position
    }

    setActiveTool(toolName) {
        this.activeTool = toolName;
        console.log(`Active tool set to: ${toolName}`);
    }

    clearActiveTool() {
        this.activeTool = null;
    }
}