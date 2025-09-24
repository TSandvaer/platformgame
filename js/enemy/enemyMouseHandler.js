class EnemyMouseHandler {
    constructor(enemySystem, platformSystem, viewport, camera) {
        this.enemySystem = enemySystem;
        this.platformSystem = platformSystem;
        this.viewport = viewport;
        this.camera = camera;
        this.enemyPlacementMode = false;

        // Attraction zone drawing state
        this.isDrawingAttractionZone = false;
        this.attractionZoneStart = null;
        this.attractionZoneEnd = null;
        this.targetEnemy = null; // Enemy whose attraction zone is being drawn
    }

    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        console.log('🎯 EnemyMouseHandler.handleMouseDown called, placement mode:', this.enemyPlacementMode);

        // Check if attraction zone drawing mode is active
        if (this.isDrawingAttractionZone) {
            this.startAttractionZoneDrawing(worldMouseX, worldMouseY);
            return { handled: true, type: 'attractionZoneStart' };
        }

        // Check if enemy placement mode is active
        if (this.enemyPlacementMode) {
            console.log('🎯 Placing enemy at', worldMouseX, worldMouseY);
            this.placeEnemy(worldMouseX, worldMouseY);
            return { handled: true, type: 'placement' };
        }

        // Check for enemy selection
        const enemy = this.enemySystem.getEnemyAtPosition(worldMouseX, worldMouseY, 10);
        if (enemy) {
            this.enemySystem.selectEnemy(enemy);
            return { handled: true, type: 'selection', enemy: enemy };
        }

        return { handled: false };
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        // Update attraction zone drawing
        if (this.isDrawingAttractionZone && this.attractionZoneStart) {
            this.attractionZoneEnd = { x: worldMouseX, y: worldMouseY };
            return true;
        }

        return false;
    }

    handleMouseUp(ctrlPressed = false) {
        // Finish attraction zone drawing
        if (this.isDrawingAttractionZone && this.attractionZoneStart && this.attractionZoneEnd) {
            this.finishAttractionZoneDrawing();
            return { handled: true, type: 'attractionZoneFinish' };
        }

        return { handled: false };
    }

    placeEnemy(mouseX, mouseY) {
        // Get enemy type from UI
        const enemyTypeSelect = document.getElementById('enemyTypeSelect');
        const enemyType = enemyTypeSelect ? enemyTypeSelect.value : 'orc';

        // Spawn enemy exactly like player start point - at click position and let it fall naturally
        const spawnY = mouseY;
        console.log(`🎯 Spawning enemy at click position like player start point`);

        // For debugging, still show platforms at this X position
        const platforms = this.platformSystem.platforms || [];
        const overlappingPlatforms = platforms.filter(p =>
            mouseX + 30 > p.x && mouseX - 30 < p.x + p.width
        ).sort((a, b) => a.y - b.y);

        console.log(`🎯 CLICK POSITION: (${Math.round(mouseX)}, ${Math.round(mouseY)})`);
        console.log(`🎯 SPAWN POSITION: (${Math.round(mouseX)}, ${Math.round(spawnY)})`);
        console.log(`🎯 Platforms at click X:`, overlappingPlatforms.map(p => `Platform at (${Math.round(p.x)}-${Math.round(p.x + p.width)}, y=${Math.round(p.y)})`));

        // Add enemy to scene at spawn position
        const enemy = this.enemySystem.addEnemyToScene(mouseX, spawnY, enemyType);

        if (enemy) {
            console.log(`🎯 ENEMY CREATED: ID=${enemy.id} at (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`);
        }

        // Enable attraction zone by default for placed enemies
        if (enemy && enemy.attractionZone) {
            enemy.attractionZone.enabled = true;
        }

        // Update UI to show the new enemy
        if (window.uiEventHandler) {
            window.uiEventHandler.updateEnemyList();
        }

        // Exit placement mode
        this.enemyPlacementMode = false;
        this.updatePlacementButton();

        return enemy;
    }

    toggleEnemyPlacement() {
        this.enemyPlacementMode = !this.enemyPlacementMode;
        console.log('🎯 Enemy placement mode toggled to:', this.enemyPlacementMode);
        this.updatePlacementButton();
    }

    updatePlacementButton() {
        const btn = document.getElementById('addEnemyBtn');
        if (btn) {
            btn.textContent = this.enemyPlacementMode ? 'Cancel Placement' : 'Add Enemy (Click on map)';
            btn.classList.toggle('danger', this.enemyPlacementMode);
        }
    }

    // Attraction zone drawing methods
    startAttractionZoneDrawing(mouseX, mouseY) {
        this.attractionZoneStart = { x: mouseX, y: mouseY };
        this.attractionZoneEnd = { x: mouseX, y: mouseY };
        console.log('🎯 Started attraction zone drawing at', mouseX, mouseY);
    }

    finishAttractionZoneDrawing() {
        if (!this.targetEnemy || !this.attractionZoneStart || !this.attractionZoneEnd) {
            this.cancelAttractionZoneDrawing();
            return;
        }

        // Calculate rectangle bounds
        const x = Math.min(this.attractionZoneStart.x, this.attractionZoneEnd.x);
        const y = Math.min(this.attractionZoneStart.y, this.attractionZoneEnd.y);
        const width = Math.abs(this.attractionZoneEnd.x - this.attractionZoneStart.x);
        const height = Math.abs(this.attractionZoneEnd.y - this.attractionZoneStart.y);

        // Update enemy attraction zone
        this.targetEnemy.attractionZone.x = x;
        this.targetEnemy.attractionZone.y = y;
        this.targetEnemy.attractionZone.width = width;
        this.targetEnemy.attractionZone.height = height;
        this.targetEnemy.attractionZone.enabled = true;

        console.log(`🎯 Attraction zone set for enemy ${this.targetEnemy.id}:`, { x, y, width, height });

        // Reset drawing state
        this.cancelAttractionZoneDrawing();

        // Update UI if available
        if (window.uiEventHandler) {
            window.uiEventHandler.updateEnemyProperties();
        }
    }

    cancelAttractionZoneDrawing() {
        this.isDrawingAttractionZone = false;
        this.attractionZoneStart = null;
        this.attractionZoneEnd = null;
        this.targetEnemy = null;
        console.log('🎯 Attraction zone drawing cancelled');
    }

    // Public methods to control attraction zone drawing mode
    startAttractionZoneDrawingMode(enemy) {
        if (!enemy) {
            console.error('Cannot start attraction zone drawing: no enemy selected');
            return;
        }

        this.targetEnemy = enemy;
        this.isDrawingAttractionZone = true;
        console.log('🎯 Attraction zone drawing mode started for enemy', enemy.id);
    }

    // Render preview while drawing
    renderAttractionZonePreview(ctx) {
        if (!this.isDrawingAttractionZone || !this.attractionZoneStart || !this.attractionZoneEnd) return;

        ctx.save();

        // Calculate rectangle bounds
        const x = Math.min(this.attractionZoneStart.x, this.attractionZoneEnd.x);
        const y = Math.min(this.attractionZoneStart.y, this.attractionZoneEnd.y);
        const width = Math.abs(this.attractionZoneEnd.x - this.attractionZoneStart.x);
        const height = Math.abs(this.attractionZoneEnd.y - this.attractionZoneStart.y);

        // Apply camera transformation if available
        let renderX = x;
        let renderY = y;
        let renderWidth = width;
        let renderHeight = height;

        if (this.viewport && this.camera) {
            renderX = (x - this.camera.x) * this.viewport.scaleX + this.viewport.offsetX;
            renderY = (y - this.camera.y) * this.viewport.scaleY + this.viewport.offsetY;
            renderWidth = width * this.viewport.scaleX;
            renderHeight = height * this.viewport.scaleY;
        }

        // Draw preview rectangle
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(renderX, renderY, renderWidth, renderHeight);
        ctx.setLineDash([]);

        // Fill with semi-transparent color
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

        ctx.restore();
    }
}