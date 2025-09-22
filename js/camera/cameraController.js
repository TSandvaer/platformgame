class CameraController {
    constructor(data, manager) {
        this.data = data;
        this.manager = manager;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.cameraStartX = 0;
        this.cameraStartY = 0;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Camera mode button will be handled by game.js
        // This class just provides the methods
    }

    toggleMode() {
        const newMode = this.data.toggleMode();
        const btn = document.getElementById('cameraModeBtn');
        if (btn) {
            btn.textContent = `Camera: ${newMode === 'free' ? 'Free Mode' : 'Character Mode'}`;
        }

        // Reset any drag state when switching modes
        this.isDragging = false;

        console.log('Camera mode switched to:', newMode);
        return newMode;
    }

    focusOnPlayer(player) {
        this.manager.focusOnPlayer(player);
    }

    startDrag(mouseX, mouseY) {
        // Only allow dragging in free mode in development
        if (this.data.mode !== 'free' || !this.manager.isDevelopmentMode) {
            return false;
        }

        this.isDragging = true;
        this.dragStartX = mouseX;
        this.dragStartY = mouseY;
        this.cameraStartX = this.data.x;
        this.cameraStartY = this.data.y;
        this.manager.setDragState(true);
        return true;
    }

    updateDrag(mouseX, mouseY) {
        if (!this.isDragging) {
            return false;
        }

        const deltaX = mouseX - this.dragStartX;
        const deltaY = mouseY - this.dragStartY;

        // Move camera in opposite direction of mouse drag for intuitive panning
        this.data.x = this.cameraStartX - deltaX;
        this.data.y = this.cameraStartY - deltaY;

        // Apply basic constraints
        this.data.x = Math.max(0, this.data.x);
        this.data.y = Math.max(0, this.data.y);

        return true;
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.manager.setDragState(false);
            return true;
        }
        return false;
    }

    handleMouseMove(mouseX, mouseY, platformSystem, propSystem) {
        // Handle edge scrolling only in free camera mode during development
        if (this.data.mode === 'free' && this.manager.isDevelopmentMode) {
            // Don't edge scroll if dragging something
            if (!platformSystem.isDragging && !propSystem.isDraggingProp && !this.isDragging) {
                this.manager.handleEdgeScroll(mouseX);
            }
        }
    }

    // Handle keyboard-based camera movement (for development mode)
    handleKeyboardScroll(direction, speed = 10) {
        if (this.data.mode !== 'free' || !this.manager.isDevelopmentMode) {
            return false;
        }

        switch(direction) {
            case 'left':
                this.data.x = Math.max(0, this.data.x - speed);
                break;
            case 'right':
                this.data.x += speed;
                break;
            case 'up':
                this.data.y = Math.max(0, this.data.y - speed);
                break;
            case 'down':
                this.data.y += speed;
                break;
            default:
                return false;
        }
        return true;
    }

    // Auto-scroll to keep an object in view (useful for dragged items)
    autoScrollToKeepInView(target, marginFromEdge = 100, scrollSpeed = 5) {
        if (this.data.mode !== 'free' || !this.manager.isDevelopmentMode) {
            return;
        }

        this.manager.scrollToKeepInView(target, scrollSpeed);
    }

    // Get current camera state for debugging
    getDebugInfo() {
        return {
            mode: this.data.mode,
            position: { x: this.data.x, y: this.data.y },
            target: { x: this.data.targetX, y: this.data.targetY },
            isDragging: this.isDragging,
            isDevelopmentMode: this.manager.isDevelopmentMode
        };
    }

    // Update camera mode button text (used when loading scenes or changing modes externally)
    updateModeButton() {
        const btn = document.getElementById('cameraModeBtn');
        if (btn) {
            btn.textContent = `Camera: ${this.data.mode === 'free' ? 'Free Mode' : 'Character Mode'}`;
        }
    }
}