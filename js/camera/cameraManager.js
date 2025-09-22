class CameraManager {
    constructor(data) {
        this.data = data;
        this.canvas = null;
        this.viewport = null;
        this.showDashboard = true;
        this.isDevelopmentMode = true;
        this.isDragging = false;
    }

    init(canvas, viewport) {
        this.canvas = canvas;
        this.viewport = viewport;
    }

    setDashboardState(showDashboard) {
        this.showDashboard = showDashboard;
    }

    setDevelopmentMode(isDev) {
        this.isDevelopmentMode = isDev;
    }

    setDragState(isDragging) {
        this.isDragging = isDragging;
    }

    update(player, sceneSystem, platformSystem, propSystem, isDraggingStartPosition) {
        // Make sure camera is initialized
        if (!this.canvas || !this.viewport) {
            // Silently return if not initialized yet
            return;
        }

        // Don't update camera automatically during drag operations
        if (platformSystem.isDragging || propSystem.isDraggingProp || platformSystem.isResizing || isDraggingStartPosition || this.isDragging) {
            return;
        }

        // Handle camera based on mode and game state
        if (this.data.mode === 'character') {
            // Character mode: always follow player
            const targetX = player.x - this.canvas.width / 2;
            const targetY = player.y - this.canvas.height / 2;

            // Both development and production modes use scene boundary constraints
            this.applyCameraBoundaryConstraints(targetX, targetY, sceneSystem);
        } else if (this.data.mode === 'free') {
            // Free mode: only follow player in production mode
            if (!this.isDevelopmentMode) {
                const targetX = player.x - this.canvas.width / 2;
                const targetY = player.y - this.canvas.height / 2;
                this.applyCameraBoundaryConstraints(targetX, targetY, sceneSystem);
            }
            // In development mode with free camera, camera stays manual
        }
    }

    applyCameraBoundaryConstraints(targetX, targetY, sceneSystem) {
        if (!this.canvas || !this.viewport) {
            // If not initialized yet, just use basic constraints
            this.data.x = Math.max(0, targetX);
            this.data.y = Math.max(0, targetY);
            return;
        }

        const currentScene = sceneSystem.currentScene;
        if (!currentScene || !currentScene.boundaries) {
            // Fallback to basic constraints if no scene boundaries
            this.data.x = Math.max(0, targetX);
            this.data.y = Math.max(0, targetY);
            return;
        }

        const bounds = currentScene.boundaries;

        // Calculate the actual visible area in world coordinates
        // This accounts for the actual canvas size and viewport scaling
        const visibleWorldWidth = this.canvas.width / this.viewport.scaleX;
        const visibleWorldHeight = this.canvas.height / this.viewport.scaleY;

        // Calculate the constrained camera position
        // Camera X constraints: use normal constraints for most cases
        let minCameraX, maxCameraX;
        const sceneWidth = bounds.right - bounds.left;

        if (visibleWorldWidth > sceneWidth && (bounds.right - visibleWorldWidth) < bounds.left) {
            // Only apply expanded bounds when visible area is larger than scene AND standard constraints would lock camera
            // This specifically targets laptop scaling issues where camera gets locked
            const excessWidth = visibleWorldWidth - sceneWidth;
            // Allow camera to move to follow player while keeping scene visible
            minCameraX = bounds.left - (excessWidth * 0.3);
            maxCameraX = bounds.left + (excessWidth * 0.3);
        } else {
            // Standard camera constraints for normal cases
            minCameraX = bounds.left;
            maxCameraX = Math.max(bounds.left, bounds.right - visibleWorldWidth);
        }

        // Camera Y constraints: more flexible for smaller screens
        let minCameraY, maxCameraY;

        if (visibleWorldHeight >= (bounds.bottom - bounds.top)) {
            // Screen is tall enough to show the entire scene height - align to bottom
            const sceneHeight = bounds.bottom - bounds.top;
            const excessHeight = visibleWorldHeight - sceneHeight;
            // Align scene to bottom by positioning camera to show the bottom boundary at viewport bottom
            minCameraY = bounds.bottom - visibleWorldHeight;
            maxCameraY = bounds.bottom - visibleWorldHeight;  // Same value for bottom alignment
        } else {
            // Screen is shorter than scene - use normal constraints
            minCameraY = bounds.top;
            maxCameraY = Math.max(bounds.top, bounds.bottom - visibleWorldHeight);
        }

        // Apply constraints
        this.data.x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
        this.data.y = Math.max(minCameraY, Math.min(maxCameraY, targetY));

        // Special handling for hidden dashboard: force camera to left boundary to eliminate gaps
        if (!this.showDashboard) {
            // When dashboard is hidden, ensure camera doesn't create gaps on the left
            this.data.x = Math.max(this.data.x, bounds.left);
            // Also ensure viewport offset is 0 for proper alignment
            this.viewport.offsetX = 0;
        }

        // Debug logging for camera constraints (can be removed for production)
        // console.log('🎥 Camera constrained:', { target: { x: targetX, y: targetY }, actual: { x: this.data.x, y: this.data.y } });
    }

    focusOnPlayer(player) {
        if (!this.canvas) {
            // Silently return if not initialized yet
            return;
        }
        const targetX = player.x - this.canvas.width / 2;
        // Center player vertically in the view
        const targetY = player.y - this.canvas.height / 2;
        this.data.x = Math.max(0, targetX);
        this.data.y = Math.max(0, targetY);

        console.log('Camera focused on player at:', this.data.x);
    }

    scrollToKeepInView(target, scrollSpeed = 5) {
        if (!this.canvas) {
            return;
        }
        const oldCameraX = this.data.x;

        if (target.x !== undefined && target.width !== undefined) {
            const screenLeft = target.x - this.data.x;
            const screenRight = target.x + target.width - this.data.x;
            const marginFromEdge = 100;

            if (screenLeft < marginFromEdge) {
                const newCameraX = Math.max(0, this.data.x - scrollSpeed);
                this.data.x = newCameraX;
            } else if (screenRight > this.canvas.width - marginFromEdge) {
                this.data.x += scrollSpeed;
            }
        }

        if (oldCameraX !== this.data.x) {
            console.log('Scrolling camera from', oldCameraX, 'to', this.data.x);
        }
    }

    handleEdgeScroll(mouseX, scrollSpeed = 5) {
        // Only allow edge scrolling in development mode with free camera
        if (!this.isDevelopmentMode || this.data.mode !== 'free' || !this.canvas) {
            return;
        }

        const edgeThreshold = 50;

        if (mouseX < edgeThreshold) {
            const newCameraX = Math.max(0, this.data.x - scrollSpeed);
            this.data.x = newCameraX;
        } else if (mouseX > this.canvas.width - edgeThreshold) {
            this.data.x += scrollSpeed;
        }
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        if (!this.viewport) {
            // Return basic conversion if viewport not initialized
            return { x: screenX + this.data.x, y: screenY + this.data.y };
        }
        const worldX = (screenX - this.viewport.offsetX) / this.viewport.scaleX + this.data.x;
        const worldY = (screenY - this.viewport.offsetY) / this.viewport.scaleY + this.data.y;
        return { x: worldX, y: worldY };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        if (!this.viewport) {
            // Return basic conversion if viewport not initialized
            return { x: worldX - this.data.x, y: worldY - this.data.y };
        }
        const screenX = (worldX - this.data.x) * this.viewport.scaleX + this.viewport.offsetX;
        const screenY = (worldY - this.data.y) * this.viewport.scaleY + this.viewport.offsetY;
        return { x: screenX, y: screenY };
    }

    applyTransform(ctx) {
        ctx.translate(-this.data.x, -this.data.y);
    }
}