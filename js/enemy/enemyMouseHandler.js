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

        // Movement zone drawing state
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetEnemy = null; // Enemy whose movement zone is being drawn

        // Enemy dragging state
        this.isDraggingEnemy = false;
        this.dragOffset = { x: 0, y: 0 };
        this.draggedEnemy = null;

        // Click vs drag detection
        this.mouseDownStarted = false;
        this.mouseDownPosition = { x: 0, y: 0 };
        this.potentialDragEnemy = null;
        this.dragThreshold = 5; // pixels to move before starting drag
    }

    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        console.log('🎯 EnemyMouseHandler.handleMouseDown called, placement mode:', this.enemyPlacementMode);

        // Check if attraction zone drawing mode is active
        if (this.isDrawingAttractionZone) {
            this.startAttractionZoneDrawing(worldMouseX, worldMouseY);
            return { handled: true, type: 'attractionZoneStart' };
        }

        // Check if movement zone drawing mode is active
        if (this.isDrawingMovementZone) {
            this.startMovementZoneDrawing(worldMouseX, worldMouseY);
            return { handled: true, type: 'movementZoneStart' };
        }

        // Check if enemy placement mode is active
        if (this.enemyPlacementMode) {
            console.log('🎯 Placing enemy at', worldMouseX, worldMouseY);
            this.placeEnemy(worldMouseX, worldMouseY);
            return { handled: true, type: 'placement' };
        }

        // Check for potential enemy interaction
        const enemy = this.enemySystem.getEnemyAtPosition(worldMouseX, worldMouseY, 10);
        if (enemy) {
            // Prepare for potential drag, but don't select yet
            this.mouseDownStarted = true;
            this.mouseDownPosition = { x: worldMouseX, y: worldMouseY };
            this.potentialDragEnemy = enemy;
            this.dragOffset = {
                x: worldMouseX - enemy.x,
                y: worldMouseY - enemy.y
            };

            return { handled: true, type: 'potential-drag', enemy: enemy };
        }

        return { handled: false };
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        // Check if we should start dragging based on mouse movement
        if (this.mouseDownStarted && this.potentialDragEnemy && !this.isDraggingEnemy) {
            const deltaX = Math.abs(worldMouseX - this.mouseDownPosition.x);
            const deltaY = Math.abs(worldMouseY - this.mouseDownPosition.y);

            if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                // Start dragging - mouse moved far enough
                this.isDraggingEnemy = true;
                this.draggedEnemy = this.potentialDragEnemy;
                this.potentialDragEnemy = null;
                console.log('🎯 Started dragging enemy', this.draggedEnemy.id);
            }
        }

        // Update enemy dragging
        if (this.isDraggingEnemy && this.draggedEnemy) {
            this.draggedEnemy.x = worldMouseX - this.dragOffset.x;
            this.draggedEnemy.y = worldMouseY - this.dragOffset.y;
            return true;
        }

        // Update attraction zone drawing
        if (this.isDrawingAttractionZone && this.attractionZoneStart) {
            this.attractionZoneEnd = { x: worldMouseX, y: worldMouseY };
            return true;
        }

        // Update movement zone drawing
        if (this.isDrawingMovementZone && this.movementZoneStart) {
            this.movementZoneEnd = { x: worldMouseX, y: worldMouseY };
            return true;
        }

        return false;
    }

    handleMouseUp(ctrlPressed = false) {
        // Handle click vs drag completion
        if (this.mouseDownStarted) {
            if (this.isDraggingEnemy && this.draggedEnemy) {
                // Finish enemy dragging
                this.isDraggingEnemy = false;

                // Update UI to reflect new position
                if (window.uiEventHandler) {
                    window.uiEventHandler.updateEnemyProperties();
                    window.uiEventHandler.updateEnemyList();
                }

                const draggedEnemy = this.draggedEnemy;
                this.draggedEnemy = null;
                this.dragOffset = { x: 0, y: 0 };
                this.mouseDownStarted = false;
                this.potentialDragEnemy = null;

                return { handled: true, type: 'drag-complete', enemy: draggedEnemy };
            } else if (this.potentialDragEnemy) {
                // This was a click without drag - select the enemy
                const enemyToSelect = this.potentialDragEnemy;
                this.enemySystem.selectEnemy(enemyToSelect);

                // Update UI to reflect selection
                if (window.uiEventHandler) {
                    window.uiEventHandler.updateEnemyProperties();
                    window.uiEventHandler.updateEnemyList();
                }

                // Reset state
                this.mouseDownStarted = false;
                this.potentialDragEnemy = null;
                this.dragOffset = { x: 0, y: 0 };

                return { handled: true, type: 'selection', enemy: enemyToSelect };
            }
        }

        // Finish attraction zone drawing
        if (this.isDrawingAttractionZone && this.attractionZoneStart && this.attractionZoneEnd) {
            this.finishAttractionZoneDrawing();
            return { handled: true, type: 'attractionZoneFinish' };
        }

        // Finish movement zone drawing
        if (this.isDrawingMovementZone && this.movementZoneStart && this.movementZoneEnd) {
            this.finishMovementZoneDrawing();
            return { handled: true, type: 'movementZoneFinish' };
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

    // Movement zone drawing methods
    startMovementZoneDrawing(mouseX, mouseY) {
        this.movementZoneStart = { x: mouseX, y: mouseY };
        this.movementZoneEnd = { x: mouseX, y: mouseY };
        console.log('🎯 Started movement zone drawing at', mouseX, mouseY);
    }

    finishMovementZoneDrawing() {
        if (!this.movementTargetEnemy || !this.movementZoneStart || !this.movementZoneEnd) {
            this.cancelMovementZoneDrawing();
            return;
        }

        // Calculate horizontal line bounds for movement zone
        const startX = Math.min(this.movementZoneStart.x, this.movementZoneEnd.x);
        const endX = Math.max(this.movementZoneStart.x, this.movementZoneEnd.x);
        const y = this.movementTargetEnemy.y + this.movementTargetEnemy.height; // Use enemy ground level

        // Update enemy movement zone
        this.movementTargetEnemy.movementZone.startX = startX;
        this.movementTargetEnemy.movementZone.endX = endX;
        this.movementTargetEnemy.movementZone.y = y;
        this.movementTargetEnemy.movementZone.enabled = true;

        console.log(`🎯 Movement zone set for enemy ${this.movementTargetEnemy.id}:`, { startX, endX, y });

        // Reset drawing state
        this.cancelMovementZoneDrawing();

        // Update UI if available
        if (window.uiEventHandler) {
            window.uiEventHandler.updateEnemyProperties();
        }
    }

    cancelMovementZoneDrawing() {
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetEnemy = null;
        console.log('🎯 Movement zone drawing cancelled');
    }

    // Cancel any ongoing enemy interaction
    cancelEnemyInteraction() {
        this.mouseDownStarted = false;
        this.potentialDragEnemy = null;
        this.isDraggingEnemy = false;
        this.draggedEnemy = null;
        this.dragOffset = { x: 0, y: 0 };
        console.log('🎯 Enemy interaction cancelled');
    }

    // Public methods to control movement zone drawing mode
    startMovementZoneDrawingMode(enemy) {
        if (!enemy) {
            console.error('Cannot start movement zone drawing: no enemy selected');
            return;
        }

        this.movementTargetEnemy = enemy;
        this.isDrawingMovementZone = true;
        console.log('🎯 Movement zone drawing mode started for enemy', enemy.id);
    }

    // Render preview while drawing
    renderMovementZonePreview(ctx) {
        if (!this.isDrawingMovementZone || !this.movementZoneStart || !this.movementZoneEnd) return;

        ctx.save();

        // Calculate horizontal line bounds
        const startX = Math.min(this.movementZoneStart.x, this.movementZoneEnd.x);
        const endX = Math.max(this.movementZoneStart.x, this.movementZoneEnd.x);
        const y = this.movementTargetEnemy ? this.movementTargetEnemy.y + this.movementTargetEnemy.height : this.movementZoneStart.y;

        // Apply camera transformation if available
        let renderStartX = startX;
        let renderEndX = endX;
        let renderY = y;

        if (this.viewport && this.camera) {
            renderStartX = (startX - this.camera.x) * this.viewport.scaleX + this.viewport.offsetX;
            renderEndX = (endX - this.camera.x) * this.viewport.scaleX + this.viewport.offsetX;
            renderY = (y - this.camera.y) * this.viewport.scaleY + this.viewport.offsetY;
        }

        // Draw preview line (cyan like the existing movement zone)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(renderStartX, renderY);
        ctx.lineTo(renderEndX, renderY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw zone markers
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(renderStartX, renderY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(renderEndX, renderY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}