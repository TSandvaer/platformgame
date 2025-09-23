class FreeCameraSystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.cameraSystem = game.cameraSystem;

        // Free camera scrolling state
        this.freeCameraScrollTimer = null;
        this.freeCameraScrollDirection = null;
    }

    handleFreeCameraScroll(clientMouseX, clientMouseY) {
        // Only in development mode with free camera
        if (!this.game.isDevelopmentMode || this.cameraSystem.mode !== 'free') {
            this.stopFreeCameraScroll();
            return;
        }

        const scrollZone = 80; // Pixels from edge to start scrolling
        const canvasWidth = this.canvas.width;
        let newDirection = null;

        // Determine scroll direction based on mouse position
        if (clientMouseX < scrollZone) {
            newDirection = 'left';
        } else if (clientMouseX > canvasWidth - scrollZone) {
            newDirection = 'right';
        }

        // Start or update scrolling
        if (newDirection !== this.freeCameraScrollDirection) {
            this.stopFreeCameraScroll();
            if (newDirection) {
                this.startFreeCameraScroll(newDirection);
            }
        }
    }

    startFreeCameraScroll(direction) {
        this.freeCameraScrollDirection = direction;
        this.freeCameraScrollTimer = setInterval(() => {
            const scrollSpeed = 6;

            if (direction === 'left') {
                const newCameraX = Math.max(0, this.cameraSystem.x - scrollSpeed);
                this.cameraSystem.x = newCameraX;
            } else if (direction === 'right') {
                this.cameraSystem.x += scrollSpeed;
            }

            // Force render to show camera movement
            this.game.render();
        }, 30);
    }

    stopFreeCameraScroll() {
        if (this.freeCameraScrollTimer) {
            clearInterval(this.freeCameraScrollTimer);
            this.freeCameraScrollTimer = null;
        }
        this.freeCameraScrollDirection = null;
    }

    // Clean up timers when destroying
    destroy() {
        this.stopFreeCameraScroll();
    }
}