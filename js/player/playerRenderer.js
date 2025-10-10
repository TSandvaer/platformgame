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

        // Disable image smoothing for crisp pixel art
        ctx.imageSmoothingEnabled = false;

        // Get actual sprite frame dimensions from the current frame
        const baseSpriteWidth = frame.frameWidth;
        const baseSpriteHeight = frame.frameHeight;

        // Get the visual scale from the character config (via animator)
        // Default to 2.6 if not available (for backward compatibility)
        const visualScale = this.animator.characterConfig?.visualScale || 2.6;

        // Apply the character-specific visual scale
        const scale = visualScale;

        // Round dimensions to avoid fractional pixels for sharper rendering
        const spriteRenderWidth = Math.round(baseSpriteWidth * scale);
        const spriteRenderHeight = Math.round(baseSpriteHeight * scale);
        const spriteOffsetX = Math.round((this.data.width - spriteRenderWidth) / 2);

        // Get sprite bottom offset from character config (in sprite pixels, will be scaled)
        const spriteBottomOffset = this.animator.characterConfig?.spriteBottomOffset || 0;
        const spriteOffsetY = Math.round(this.data.height - spriteRenderHeight + (spriteBottomOffset * scale));

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

        // Check if sprite facing should be inverted (for sprite sheets that face left by default)
        const invertFacing = this.animator.characterConfig?.invertFacing || false;
        const shouldFlip = invertFacing ? (this.data.facing === 'right') : (this.data.facing === 'left');

        // Flip sprite horizontally based on facing direction
        if (shouldFlip) {
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

        // Disable image smoothing for crisp fallback rendering
        ctx.imageSmoothingEnabled = false;

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