class SceneRenderer {
    constructor(sceneData, game) {
        this.sceneData = sceneData;
        this.game = game;
    }

    renderTransitionZones(ctx) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return;

        ctx.save();

        // Render transition zones
        currentScene.transitions.zones.forEach(zone => {
            this.renderTransitionZone(ctx, zone);
        });

        ctx.restore();
    }

    renderTransitionZone(ctx, zone) {
        // Get target scene for color coding
        const targetScene = this.sceneData.getSceneById(zone.targetSceneId);
        const hasValidTarget = !!targetScene;

        // Zone outline
        ctx.strokeStyle = hasValidTarget ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

        // Zone fill (semi-transparent)
        ctx.fillStyle = hasValidTarget ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

        // Label
        ctx.setLineDash([]);
        ctx.fillStyle = hasValidTarget ? '#00AA00' : '#AA0000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        const labelText = targetScene ? `→ ${targetScene.name}` : '⚠ Invalid Target';
        const labelX = zone.x + zone.width / 2;
        const labelY = zone.y + zone.height / 2;

        // Label background
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16);

        // Label text
        ctx.fillStyle = hasValidTarget ? '#00FF00' : '#FF0000';
        ctx.fillText(labelText, labelX, labelY + 4);

        // Zone ID (small)
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(`#${zone.id}`, zone.x + 2, zone.y + 12);
    }

    renderSceneBoundaries(ctx) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene || !this.game.isDevelopmentMode) return;

        if (!currentScene.boundaries) {
            console.warn('Scene missing boundaries:', currentScene);
            return;
        }

        const bounds = currentScene.boundaries;
        // Check if boundaries is a valid object with all required properties
        if (!bounds || typeof bounds !== 'object') {
            console.warn('Scene boundaries is not an object:', bounds);
            return;
        }

        if (typeof bounds.left === 'undefined' || typeof bounds.top === 'undefined' ||
            typeof bounds.right === 'undefined' || typeof bounds.bottom === 'undefined') {
            console.warn('Scene boundaries missing required properties:', bounds);
            return;
        }

        ctx.save();

        // Scene boundaries (optional visual guide)
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 10]);

        // Draw the scene boundaries as they are defined
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

        // Also draw the effective camera boundaries (what player sees in production mode)
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)'; // Red color for camera bounds
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        // Calculate the visible area that matches production mode
        const visibleWorldWidth = this.game.canvas.width / this.game.viewport.scaleX;
        const visibleWorldHeight = this.game.canvas.height / this.game.viewport.scaleY;

        // Show the maximum camera view area
        const maxCameraX = Math.max(bounds.left, bounds.right - visibleWorldWidth);
        const maxCameraY = Math.max(bounds.top, bounds.bottom - visibleWorldHeight);

        // Draw the effective viewing area rectangle
        ctx.strokeRect(bounds.left, bounds.top, Math.min(visibleWorldWidth, bounds.right - bounds.left), Math.min(visibleWorldHeight, bounds.bottom - bounds.top));

        // Labels
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('Scene Boundary', bounds.left + 10, bounds.top + 20);

        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillText('Camera View Area', bounds.left + 10, bounds.top + 40);

        ctx.restore();
    }

    renderPlayerStartPosition(ctx) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene || !this.game.isDevelopmentMode) return;

        if (!currentScene.settings || typeof currentScene.settings !== 'object') {
            return;
        }

        if (typeof currentScene.settings.playerStartX === 'undefined' ||
            typeof currentScene.settings.playerStartY === 'undefined') {
            return;
        }

        const startX = currentScene.settings.playerStartX;
        const startY = currentScene.settings.playerStartY;

        ctx.save();

        // Player start marker
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#0088AA';
        ctx.lineWidth = 2;

        // Circle
        ctx.beginPath();
        ctx.arc(startX, startY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cross
        ctx.strokeStyle = '#004455';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX - 6, startY);
        ctx.lineTo(startX + 6, startY);
        ctx.moveTo(startX, startY - 6);
        ctx.lineTo(startX, startY + 6);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#004455';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('START', startX, startY - 12);

        ctx.restore();
    }

    // Check if mouse is over the start position marker
    isMouseOverStartPosition(mouseX, mouseY) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene || !this.game.isDevelopmentMode) return false;

        if (!currentScene.settings || typeof currentScene.settings !== 'object') {
            return false;
        }

        if (typeof currentScene.settings.playerStartX === 'undefined' ||
            typeof currentScene.settings.playerStartY === 'undefined') {
            return false;
        }

        const startX = currentScene.settings.playerStartX;
        const startY = currentScene.settings.playerStartY;
        const radius = 12; // Slightly larger than the visual marker for easier clicking

        const distance = Math.sqrt((mouseX - startX) ** 2 + (mouseY - startY) ** 2);
        return distance <= radius;
    }

    // Update start position to new coordinates
    updateStartPosition(newX, newY) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return false;

        if (!currentScene.settings || typeof currentScene.settings !== 'object') {
            return false;
        }

        currentScene.settings.playerStartX = Math.round(newX);
        currentScene.settings.playerStartY = Math.round(newY);
        currentScene.metadata.modified = new Date().toISOString();

        // Update the UI to reflect the change
        this.game.sceneSystem.updateUI();

        return true;
    }

    // Render all development overlays
    renderDevelopmentOverlays(ctx) {
        if (!this.game.isDevelopmentMode) return;

        this.renderSceneBoundaries(ctx);
        this.renderPlayerStartPosition(ctx);
        this.renderTransitionZones(ctx);
    }
}