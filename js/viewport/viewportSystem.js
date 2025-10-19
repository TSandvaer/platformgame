class ViewportSystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;

        // Viewport and scaling system
        this.viewport = {
            designWidth: 1920,    // Target design resolution width
            designHeight: 1080,   // Fixed design resolution height for proper scaling
            actualWidth: window.innerWidth - (game.showDashboard ? 300 : 0),
            actualHeight: window.innerHeight,
            scaleX: 1,
            scaleY: 1,
            scale: 1,             // Uniform scale factor
            offsetX: 0,           // Letterbox offset
            offsetY: 0,           // Letterbox offset
            mode: 'fit'           // 'fit', 'stretch', 'crop', 'pixel-perfect'
        };

        this.updateViewport();
    }

    applySettings() {
        const modeSelect = document.getElementById('viewportModeSelect');
        const designWidthEl = document.getElementById('designWidth');
        const designHeightEl = document.getElementById('designHeight');

        // Check if elements exist (editor mode)
        if (!modeSelect || !designWidthEl || !designHeightEl) return;

        this.viewport.mode = modeSelect.value;
        this.viewport.designWidth = parseInt(designWidthEl.value);
        this.viewport.designHeight = parseInt(designHeightEl.value);

        this.updateViewport();
        this.updateUI();
    }

    resetSettings() {
        this.viewport.mode = 'fit';
        this.viewport.designWidth = 1920;
        this.viewport.designHeight = 1080;

        // Update UI elements if they exist (editor mode)
        const modeSelect = document.getElementById('viewportModeSelect');
        const designWidthEl = document.getElementById('designWidth');
        const designHeightEl = document.getElementById('designHeight');

        if (modeSelect) modeSelect.value = 'fit';
        if (designWidthEl) designWidthEl.value = '1920';
        if (designHeightEl) designHeightEl.value = '1080';

        this.updateViewport();
        this.updateUI();
    }

    updateUI() {
        // Only update UI if elements exist (editor mode)
        const currentScaleEl = document.getElementById('currentScale');
        const actualSizeEl = document.getElementById('actualSize');

        if (currentScaleEl) currentScaleEl.textContent = `${this.viewport.scale.toFixed(2)}x`;
        if (actualSizeEl) actualSizeEl.textContent = `${this.viewport.actualWidth}x${this.viewport.actualHeight}`;
    }

    updateViewport() {
        this.viewport.actualWidth = window.innerWidth - (this.game.showDashboard ? 300 : 0);
        this.viewport.actualHeight = window.innerHeight;

        // Calculate scale factors
        const scaleX = this.viewport.actualWidth / this.viewport.designWidth;
        const scaleY = this.viewport.actualHeight / this.viewport.designHeight;

        switch (this.viewport.mode) {
            case 'fit':
                // Fit with aspect ratio preserved (letterbox/pillarbox)
                this.viewport.scale = Math.min(scaleX, scaleY);
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;

                // Align to left when dashboard is hidden (both dev and production), center otherwise
                if (!this.game.showDashboard) {
                    this.viewport.offsetX = 0; // Align to left (no gap on left side)
                    this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2; // Center vertically
                } else {
                    // Default centering behavior when dashboard is visible
                    this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                    this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                }
                break;
            case 'stretch':
                // Stretch to fill entire viewport (may distort)
                this.viewport.scaleX = scaleX;
                this.viewport.scaleY = scaleY;
                this.viewport.scale = Math.min(scaleX, scaleY); // For UI elements
                this.viewport.offsetX = 0;
                this.viewport.offsetY = 0;
                break;
            case 'crop':
                // Crop to fill viewport (maintain aspect ratio, crop edges)
                this.viewport.scale = Math.max(scaleX, scaleY);
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;
                this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                break;
            case 'pixel-perfect':
                // Use integer scaling only
                this.viewport.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
                this.viewport.scaleX = this.viewport.scale;
                this.viewport.scaleY = this.viewport.scale;
                this.viewport.offsetX = (this.viewport.actualWidth - this.viewport.designWidth * this.viewport.scale) / 2;
                this.viewport.offsetY = (this.viewport.actualHeight - this.viewport.designHeight * this.viewport.scale) / 2;
                break;
        }
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return this.game.cameraSystem.screenToWorld(screenX, screenY);
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return this.game.cameraSystem.worldToScreen(worldX, worldY);
    }

    // Convert screen coordinates to viewport coordinates (without camera offset)
    screenToViewport(screenX, screenY) {
        const viewportX = (screenX - this.viewport.offsetX) / this.viewport.scaleX;
        const viewportY = (screenY - this.viewport.offsetY) / this.viewport.scaleY;
        return { x: viewportX, y: viewportY };
    }

    // Get viewport object for backward compatibility
    getViewport() {
        return this.viewport;
    }

    // Handle window resize
    handleResize() {
        this.canvas.width = window.innerWidth - (this.game.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;
        this.updateViewport();
    }
}