class PlayerRenderer {
    constructor(data, animator) {
        this.data = data;
        this.animator = animator;
    }

    render(ctx) {
        if (!this.animator.isReady()) {
            // Fallback to rendering a colored rectangle if sprites aren't loaded
            this.renderFallback(ctx);
            return;
        }

        const frame = this.animator.getCurrentFrame();
        if (!frame) {
            this.renderFallback(ctx);
            return;
        }

        this.renderSprite(ctx, frame);
    }

    renderSprite(ctx, frame) {
        ctx.save();

        // Calculate sprite render dimensions
        const baseSpriteSize = 256;
        const playerScale = this.data.width / 35; // Scale based on original player width
        const spriteRenderWidth = baseSpriteSize * playerScale;
        const spriteRenderHeight = baseSpriteSize * playerScale;
        const spriteOffsetX = (this.data.width - spriteRenderWidth) / 2;
        const spriteOffsetY = this.data.height - spriteRenderHeight + (110 * playerScale);

        // Handle kill effects
        let renderY = this.data.y + spriteOffsetY;
        let renderHeight = spriteRenderHeight;
        let sourceY = frame.sourceY;
        let sourceHeight = frame.frameHeight;

        // Apply sink effect if player is dead and sinking
        if (this.data.isDead && this.data.killEffect === 'sink' && this.data.sinkAmount > 0) {
            // Move the player down by the sink amount
            renderY += this.data.sinkAmount;

            // Reduce the visible height by clipping the bottom of the sprite
            const sinkRatio = this.data.sinkAmount / this.data.height;
            renderHeight = spriteRenderHeight * (1 - sinkRatio);
            sourceHeight = frame.frameHeight * (1 - sinkRatio);
        }

        // Note: Damage visual effect now handled by hurt animation sprite

        // Flip sprite horizontally if facing left
        if (this.data.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(
                frame.image,
                frame.sourceX, sourceY,
                frame.frameWidth, sourceHeight,
                -(this.data.x + spriteOffsetX + spriteRenderWidth),
                renderY,
                spriteRenderWidth, renderHeight
            );
        } else {
            ctx.drawImage(
                frame.image,
                frame.sourceX, sourceY,
                frame.frameWidth, sourceHeight,
                this.data.x + spriteOffsetX,
                renderY,
                spriteRenderWidth, renderHeight
            );
        }

        ctx.restore();
    }

    renderFallback(ctx) {
        ctx.save();

        // Handle kill effects for fallback rendering
        let renderY = this.data.y;
        let renderHeight = this.data.height;

        // Apply sink effect if player is dead and sinking
        if (this.data.isDead && this.data.killEffect === 'sink' && this.data.sinkAmount > 0) {
            renderY += this.data.sinkAmount;
            renderHeight = Math.max(0, this.data.height - this.data.sinkAmount);
        }

        // Render a colored rectangle as fallback (damage effect handled by hurt animation)
        ctx.fillStyle = this.data.color;
        ctx.fillRect(this.data.x, renderY, this.data.width, renderHeight);

        ctx.restore();
    }

    renderDebug(ctx, isDevelopmentMode) {
        if (!isDevelopmentMode) return;

        // Draw collision box
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.data.x, this.data.y, this.data.width, this.data.height);

        // Draw center point
        const center = this.data.getCenter();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw state info
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = '12px Arial';
        // Determine movement state (only show if moving or trying to move)
        let stateText = `${this.data.currentAnimation} | ${this.data.onGround ? 'ground' : 'air'}`;

        if (this.data.isRunning) {
            stateText += ' | running';
        } else if (this.data.isTryingToRun) {
            stateText += ' | trying to run';
        } else if (this.data.currentAnimation === 'walk') {
            stateText += ' | walking';
        }
        ctx.strokeText(stateText, this.data.x, this.data.y - 5);
        ctx.fillText(stateText, this.data.x, this.data.y - 5);
    }
}