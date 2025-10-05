class NPCRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    renderNPC(npc, animator, viewport, camera, isDevelopmentMode, selectedNPC = null) {
        if (!animator.isReady()) {
            // Fallback to rendering a colored rectangle if sprites aren't loaded
            this.renderFallback(npc, viewport, camera);
        } else {
            const frame = animator.getCurrentFrame();
            if (!frame) {
                this.renderFallback(npc, viewport, camera);
            } else {
                this.renderSprite(npc, frame, viewport, camera);
            }
        }

        // Render debug info in development mode
        if (isDevelopmentMode) {
            // Render selection indicator if this NPC is selected
            if (selectedNPC && selectedNPC.id === npc.id) {
                this.renderSelectionIndicator(npc, viewport, camera);
            }

            this.renderDebugInfo(npc, viewport, camera);
        }
    }

    renderSprite(npc, frame, viewport, camera) {
        this.ctx.save();

        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Apply camera and viewport transformation
        let renderX = npc.x;
        let renderY = npc.y;
        if (viewport && camera) {
            renderX = (npc.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = (npc.y - camera.y) * viewport.scaleY + viewport.offsetY;
        }

        // Calculate sprite render dimensions - scale to 1.5x size
        const renderScale = 1.5;
        const spriteRenderWidth = Math.round(frame.frameWidth * renderScale);
        const spriteRenderHeight = Math.round(frame.frameHeight * renderScale);
        const spriteOffsetX = Math.round((npc.width - spriteRenderWidth) / 2);
        const spriteOffsetY = Math.round(npc.height - spriteRenderHeight);

        // Apply viewport scaling to offsets with pixel-perfect rounding
        const scaledOffsetX = Math.round(spriteOffsetX * (viewport ? viewport.scaleX : 1));
        const scaledOffsetY = Math.round(spriteOffsetY * (viewport ? viewport.scaleY : 1));
        const scaledWidth = Math.round(spriteRenderWidth * (viewport ? viewport.scaleX : 1));
        const scaledHeight = Math.round(spriteRenderHeight * (viewport ? viewport.scaleY : 1));

        // Flip sprite horizontally if facing left
        if (npc.facing === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                frame.image,
                frame.sourceX, frame.sourceY,
                frame.frameWidth, frame.frameHeight,
                -(renderX + scaledOffsetX + scaledWidth),
                renderY + scaledOffsetY,
                scaledWidth, scaledHeight
            );
        } else {
            this.ctx.drawImage(
                frame.image,
                frame.sourceX, frame.sourceY,
                frame.frameWidth, frame.frameHeight,
                renderX + scaledOffsetX,
                renderY + scaledOffsetY,
                scaledWidth, scaledHeight
            );
        }

        this.ctx.restore();
    }

    renderFallback(npc, viewport, camera) {
        this.ctx.save();

        // Disable image smoothing for crisp fallback rendering
        this.ctx.imageSmoothingEnabled = false;

        // Use direct world coordinates
        let renderX = npc.x;
        let renderY = npc.y;
        let renderWidth = npc.width;
        let renderHeight = npc.height;

        // Choose color based on NPC type
        let npcColor = '#FFD700'; // Gold for NPCs (default)
        if (npc.type === 'blacksmith') {
            npcColor = '#B87333'; // Copper for blacksmith
        }

        // Render a colored rectangle as fallback
        this.ctx.fillStyle = npcColor;
        this.ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

        // Add type indicator
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${12 * (viewport ? viewport.scaleX : 1)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.type.toUpperCase(), renderX + renderWidth / 2, renderY + renderHeight / 2);

        this.ctx.restore();
    }

    renderDebugInfo(npc, viewport, camera) {
        this.ctx.save();

        // Apply camera and viewport transformation
        let renderX = npc.x;
        let renderY = npc.y;
        let renderWidth = npc.width;
        let renderHeight = npc.height;

        if (viewport && camera) {
            renderX = (npc.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = (npc.y - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = npc.width * viewport.scaleX;
            renderHeight = npc.height * viewport.scaleY;
        }

        // Draw collision box
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(renderX, renderY, renderWidth, renderHeight);

        // Draw center point
        this.ctx.fillStyle = 'gold';
        this.ctx.beginPath();
        this.ctx.arc(renderX + renderWidth / 2, renderY + renderHeight / 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw interaction radius
        if (npc.canInteract) {
            const centerX = renderX + renderWidth / 2;
            const centerY = renderY + renderHeight / 2;
            const radius = npc.interactionRadius * (viewport ? viewport.scaleX : 1);

            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw state info
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = `${12 * (viewport ? viewport.scaleX : 1)}px Arial`;
        this.ctx.textAlign = 'left';

        const infoY = renderY - 10;
        const infoText = `${npc.type} | ${npc.currentAnimation} | ID:${npc.id}`;

        this.ctx.strokeText(infoText, renderX, infoY);
        this.ctx.fillText(infoText, renderX, infoY);

        this.ctx.restore();
    }

    renderSelectionIndicator(npc, viewport, camera) {
        this.ctx.save();

        // Apply camera and viewport transformation
        let renderX = npc.x;
        let renderY = npc.y;
        let renderWidth = npc.width;
        let renderHeight = npc.height;

        if (viewport && camera) {
            renderX = (npc.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = (npc.y - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = npc.width * viewport.scaleX;
            renderHeight = npc.height * viewport.scaleY;
        }

        // Draw selection outline (bright cyan for NPCs)
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(renderX - 3, renderY - 3, renderWidth + 6, renderHeight + 6);

        // Draw selection indicator above NPC
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECTED', renderX + renderWidth / 2, renderY - 8);

        this.ctx.restore();
    }
}
