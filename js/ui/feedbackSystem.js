class FeedbackSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.cameraSystem = game.cameraSystem;
        this.viewport = game.viewport;

        this.feedbackMessages = [];
    }

    showMessage(message, worldX = null, worldY = null) {
        // Use provided coordinates or default to center of screen
        let x, y;
        if (worldX !== null && worldY !== null) {
            // Use provided world coordinates
            x = worldX;
            y = worldY;
        } else {
            // Default to center of screen
            const centerX = this.canvas.width / 2;
            const centerY = 100;
            x = this.cameraSystem.x + centerX / this.viewport.scaleX;
            y = this.cameraSystem.y + centerY / this.viewport.scaleY;
        }

        this.feedbackMessages.push({
            text: message,
            x: x,
            y: y,
            lifetime: 120, // frames to display
            opacity: 1.0
        });
    }

    showCopyPasteMessage(text, prop) {
        if (!prop) return;

        // Add feedback message with position and lifetime
        this.feedbackMessages.push({
            text: text,
            x: prop.x,
            y: prop.y - 20, // Above the prop
            lifetime: 120, // frames to display (about 2 seconds at 60fps)
            opacity: 1.0
        });
    }

    render() {
        if (!this.feedbackMessages || this.feedbackMessages.length === 0) return;

        this.ctx.save();

        // Process each feedback message
        for (let i = this.feedbackMessages.length - 1; i >= 0; i--) {
            const msg = this.feedbackMessages[i];

            // Update lifetime and fade out
            msg.lifetime--;
            msg.y -= 0.3; // Float upward more slowly
            msg.opacity = Math.min(1.0, msg.lifetime / 60); // Fade out in last second

            // Remove expired messages
            if (msg.lifetime <= 0) {
                this.feedbackMessages.splice(i, 1);
                continue;
            }

            // Convert world coordinates to screen coordinates
            const screenX = (msg.x - this.cameraSystem.x) * this.viewport.scaleX + this.viewport.offsetX;
            const screenY = (msg.y - this.cameraSystem.y) * this.viewport.scaleY + this.viewport.offsetY;

            // Draw background
            this.ctx.globalAlpha = msg.opacity * 0.8;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(screenX - 30, screenY - 10, 60, 20);

            // Draw text
            this.ctx.globalAlpha = msg.opacity;
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(msg.text, screenX, screenY);
        }

        this.ctx.restore();
    }

    // Clear all feedback messages
    clear() {
        this.feedbackMessages = [];
    }

    // Get number of active messages
    getMessageCount() {
        return this.feedbackMessages.length;
    }
}