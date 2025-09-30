class PropSystem {
    constructor(ctx, platformSprites, torchParticles, onSpritesLoadedCallback) {
        this.data = new PropData();
        this.renderer = new PropRenderer(ctx, platformSprites, torchParticles, onSpritesLoadedCallback);
        this.collisions = new PropCollisions();
        this.manager = new PropManager(this.data);
        this.game = null; // Will be set after construction

        // Initialize prop z-orders
        this.data.initializePropZOrders();
    }

    // Game reference setter - pass it down to PropData
    set game(value) {
        this._game = value;
        this.data.game = value;
    }

    get game() {
        return this._game;
    }

    // Data access methods
    get props() {
        return this.data.props;
    }

    set props(value) {
        this.data.props = value;
    }

    get selectedProp() {
        return this.data.selectedProp;
    }

    set selectedProp(value) {
        this.data.selectedProp = value;
    }

    get propPlacementMode() {
        return this.data.propPlacementMode;
    }

    set propPlacementMode(value) {
        this.data.propPlacementMode = value;
    }

    get isDraggingProp() {
        return this.data.isDraggingProp;
    }

    set isDraggingProp(value) {
        this.data.isDraggingProp = value;
    }

    get propDragOffset() {
        return this.data.propDragOffset;
    }

    set propDragOffset(value) {
        this.data.propDragOffset = value;
    }

    get nextPropId() {
        return this.data.nextPropId;
    }

    set nextPropId(value) {
        this.data.nextPropId = value;
    }

    get nextPropZOrder() {
        return this.data.nextPropZOrder;
    }

    set nextPropZOrder(value) {
        this.data.nextPropZOrder = value;
    }

    get propTypes() {
        return this.data.propTypes;
    }

    get isDragSelecting() {
        return this.data.isDragSelecting;
    }

    get dragSelectionRect() {
        return this.data.getDragSelectionRect();
    }

    // Rendering methods
    renderBackgroundProps(isDevelopmentMode, viewport) {
        this.renderer.renderProps(
            this.data.props,
            this.data.propTypes,
            isDevelopmentMode,
            this.data.selectedProp,
            false, // Render non-obstacle props (background)
            this.data.selectedProps,
            viewport
        );
    }

    renderObstacleProps(isDevelopmentMode, viewport, camera) {
        this.renderer.renderProps(
            this.data.props,
            this.data.propTypes,
            isDevelopmentMode,
            this.data.selectedProp,
            true, // Render obstacle props (foreground)
            this.data.selectedProps,
            viewport,
            camera
        );

        // Render movement zones for selected props in development mode
        if (isDevelopmentMode && this.data.selectedProp) {
            this.renderMovementZone(this.data.selectedProp, viewport, camera);
        }
    }

    // Render movement zone for a prop
    renderMovementZone(prop, viewport, camera) {
        if (!prop.movementZone || !prop.movementZone.enabled || !this.hasValidMovementZone(prop.movementZone)) return;

        const ctx = this.renderer.ctx;
        if (!ctx || !camera) return;

        ctx.save();

        const { startX, startY, endX, endY } = prop.movementZone;

        // Apply camera transformation
        let renderStartX = startX;
        let renderStartY = startY;
        let renderEndX = endX;
        let renderEndY = endY;

        if (viewport && camera) {
            renderStartX = (startX - camera.x) * viewport.scaleX + viewport.offsetX;
            renderStartY = (startY - camera.y) * viewport.scaleY + viewport.offsetY;
            renderEndX = (endX - camera.x) * viewport.scaleX + viewport.offsetX;
            renderEndY = (endY - camera.y) * viewport.scaleY + viewport.offsetY;
        }

        // Draw movement zone line (magenta for props to distinguish from platforms)
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(renderStartX, renderStartY);
        ctx.lineTo(renderEndX, renderEndY);
        ctx.stroke();

        // Draw zone markers (drag handles)
        ctx.fillStyle = 'magenta';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        // Start handle
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // End handle
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw inner dots to indicate drag handles
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw zone label
        ctx.fillStyle = 'magenta';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.font = `${10 * (viewport ? viewport.scaleX : 1)}px Arial`;
        ctx.textAlign = 'center';
        const labelX = (renderStartX + renderEndX) / 2;
        const labelY = (renderStartY + renderEndY) / 2 - 8;
        ctx.strokeText('movement zone', labelX, labelY);
        ctx.fillText('movement zone', labelX, labelY);

        ctx.restore();
    }

    // Render all torch particles - call this once per frame after rendering props
    renderParticles(viewport, camera, platforms) {
        this.renderer.renderAllParticles(viewport, camera, platforms);
    }

    drawProp(prop, isDevelopmentMode) {
        this.renderer.drawProp(
            prop,
            this.data.propTypes,
            isDevelopmentMode,
            this.data.selectedProp,
            this.data.selectedProps
        );
    }

    // Collision detection
    checkPlayerPropCollisions(player, viewport) {
        // Convert props to actual positions for collision detection
        const actualProps = this.data.props.map(prop => {
            const actualPos = this.data.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
            return { ...prop, x: actualPos.x, y: actualPos.y };
        });

        this.collisions.checkPlayerPropCollisions(
            player,
            actualProps,
            this.data.propTypes
        );
    }

    // Prop management
    addProp(type, x, y, isObstacle = false, scale = undefined, damagePerSecond = 0, destroyable = false, maxDurability = 100) {
        return this.data.addProp(type, x, y, isObstacle, scale, damagePerSecond, destroyable, maxDurability);
    }

    deleteSelectedProp() {
        this.data.deleteSelectedProp();
        this.manager.updatePropProperties();
        this.manager.updatePropList();

        // Save the scene to persist the deletion
        if (this.game && this.game.sceneSystem) {
            this.game.sceneSystem.saveScenes();
        }
    }

    togglePropPlacement() {
        this.manager.togglePropPlacement();
    }

    placeProp(mouseX, mouseY) {
        this.manager.placeProp(mouseX, mouseY);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    // Mouse event handling
    handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed = false, shiftPressed = false, viewport, camera) {
        const result = this.manager.handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed, shiftPressed, viewport, camera);
        if (result.handled) {
            this.manager.updatePropProperties();
            this.manager.updatePropList();
        }
        return result;
    }

    handleMouseMove(mouseX, mouseY, viewport, camera) {
        const moved = this.manager.handleMouseMove(mouseX, mouseY, viewport, camera);
        if (moved) {
            this.manager.updatePropProperties();
        }
        return moved;
    }

    handleMouseUp(ctrlPressed = false, viewport) {
        return this.manager.handleMouseUp(ctrlPressed, viewport);
    }

    // UI updates
    updatePropList() {
        this.manager.updatePropList();
    }

    updatePropProperties() {
        this.manager.updatePropProperties();
    }

    updateSelectedProp() {
        this.manager.updateSelectedProp();
    }

    // Utility methods
    isPointInProp(x, y, prop) {
        return this.data.isPointInProp(x, y, prop);
    }

    getPropType(typeName) {
        return this.data.getPropType(typeName);
    }

    // Z-order management
    movePropToFront() {
        this.manager.movePropToFront();
    }

    movePropToBack() {
        this.manager.movePropToBack();
    }

    // State management
    get currentPropType() {
        return this.manager.currentPropType;
    }

    set currentPropType(value) {
        this.manager.currentPropType = value;
    }

    get nextPropIsObstacle() {
        return this.manager.nextPropIsObstacle;
    }

    set nextPropIsObstacle(value) {
        this.manager.nextPropIsObstacle = value;
    }

    initializePropZOrders() {
        this.data.initializePropZOrders();
    }

    // Multi-selection methods
    addToSelection(prop) {
        this.data.addToSelection(prop);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    removeFromSelection(prop) {
        this.data.removeFromSelection(prop);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    clearMultiSelection() {
        this.data.clearMultiSelection();
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    selectMultiple(props) {
        this.data.selectMultiple(props);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    toggleSelection(prop) {
        this.data.toggleSelection(prop);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    // Copy/paste methods
    copySelectedProps() {
        return this.data.copySelectedProps();
    }

    pasteProps(mouseX, mouseY) {
        const pastedProps = this.data.pasteProps(mouseX, mouseY);
        if (pastedProps.length > 0) {
            this.manager.updatePropProperties();
            this.manager.updatePropList();
        }
        return pastedProps;
    }

    get copiedProps() {
        return this.data.clipboard;
    }

    get selectedProps() {
        return this.data.selectedProps;
    }

    get isDragSelecting() {
        return this.data.isDragSelecting;
    }

    get dragSelectionRect() {
        return this.data.getDragSelectionRect();
    }

    // Grouping methods
    groupSelectedProps() {
        if (this.data.selectedProps.length < 2) return null;

        // Expand selection to include all group members
        const expandedSelection = this.data.expandSelectionToFullGroups(this.data.selectedProps);

        // Collect all unique group IDs from the expanded selection
        const existingGroupIds = new Set();
        expandedSelection.forEach(prop => {
            if (prop.groupId) {
                existingGroupIds.add(prop.groupId);
            }
        });

        // Ungroup all existing groups that will be merged
        existingGroupIds.forEach(groupId => {
            this.data.ungroupProps(groupId);
        });

        // Create new group with all props from the expanded selection
        const groupId = this.data.createGroup(expandedSelection);

        // Update the selection to include all props in the new group
        this.data.selectedProps = expandedSelection;

        this.manager.updatePropProperties();
        this.manager.updatePropList();
        return groupId;
    }

    ungroupSelectedProps() {
        const groupsToUngroup = new Set();
        this.data.selectedProps.forEach(prop => {
            if (prop.groupId) {
                groupsToUngroup.add(prop.groupId);
            }
        });

        groupsToUngroup.forEach(groupId => this.data.ungroupProps(groupId));
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    deleteSelectedProps() {
        this.data.deleteSelectedProps();
        this.manager.updatePropProperties();
        this.manager.updatePropList();

        // Save the scene to persist the deletion
        if (this.game && this.game.sceneSystem) {
            this.game.sceneSystem.saveScenes();
        }
    }

    clearSelection() {
        this.clearMultiSelection();
    }

    nudgeSelectedProps(deltaX, deltaY) {
        this.data.nudgeSelectedProps(deltaX, deltaY);
        this.manager.updatePropProperties();
        this.manager.updatePropList();
    }

    // Destruction system methods
    damageProp(propId, damage) {
        return this.data.damageProp(propId, damage);
    }

    destroyProp(propId) {
        const prop = this.data.getPropById(propId);
        if (prop) {
            this.data.startDestruction(prop);
        }
    }

    // Update destruction animations - call this in the main game loop
    updateDestruction(deltaTime, platformSystem = null) {
        this.data.updateAllDestruction(deltaTime, platformSystem);
    }

    // Update chest animations
    updateChestAnimations(deltaTime) {
        for (const prop of this.data.props) {
            if (!prop.isChest) continue;

            // Ensure chest state is initialized properly
            if (prop.chestState === undefined || prop.chestState === null) {
                prop.chestState = 'closed';
                prop.chestAnimFrame = 0;
                prop.chestAnimTimer = 0;
            }

            // Update animation timer if chest is animating
            if (prop.chestState === 'opening' || prop.chestState === 'closing') {
                prop.chestAnimTimer += deltaTime;

                if (prop.chestAnimTimer >= prop.chestAnimSpeed) {
                    prop.chestAnimTimer = 0;

                    if (prop.chestState === 'opening') {
                        prop.chestAnimFrame++;
                        if (prop.chestAnimFrame >= 6) {
                            prop.chestAnimFrame = 6;
                            prop.chestState = 'open';
                            // Execute callback when chest finishes opening
                            if (prop.onOpenCallback && typeof prop.onOpenCallback === 'function') {
                                prop.onOpenCallback();
                                prop.onOpenCallback = null; // Clear callback after execution
                            }
                        }
                    } else if (prop.chestState === 'closing') {
                        prop.chestAnimFrame--;
                        if (prop.chestAnimFrame <= 0) {
                            prop.chestAnimFrame = 0;
                            prop.chestState = 'closed';
                        }
                    }
                }
            }
        }
    }

    // Check if player is near any chest and handle interaction
    checkChestInteraction(player) {
        const interactionDistance = 60; // Distance at which player can interact

        for (const prop of this.data.props) {
            if (!prop.isChest) continue;

            const propBounds = this.getPropBounds(prop);
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const propCenterX = (propBounds.left + propBounds.right) / 2;
            const propCenterY = (propBounds.top + propBounds.bottom) / 2;

            const distance = Math.sqrt(
                Math.pow(playerCenterX - propCenterX, 2) +
                Math.pow(playerCenterY - propCenterY, 2)
            );

            if (distance <= interactionDistance) {
                return prop; // Return the chest that's close enough to interact with
            }
        }

        return null;
    }

    // Toggle chest open/close state
    toggleChest(chest, onOpenCallback = null) {
        if (!chest || !chest.isChest) return;

        if (chest.chestState === 'closed') {
            chest.chestState = 'opening';
            // Store callback for when chest finishes opening
            chest.onOpenCallback = onOpenCallback;
        } else if (chest.chestState === 'open') {
            chest.chestState = 'closing';
            // Clear any pending callback
            chest.onOpenCallback = null;
        }
        // Don't toggle if already animating
    }

    // Check if player attack hits any destroyable props
    checkPlayerAttackCollisions(player) {
        if (!player.isAttacking || player.isDead) return [];

        const collisions = [];
        const attackRange = this.getPlayerAttackRange(player);

        for (const prop of this.data.props) {
            if (!prop.destroyable || prop.isDestroying || prop.isDestroyed || prop.isVisible === false) continue;

            const propBounds = this.getPropBounds(prop);
            if (this.boundsIntersect(attackRange, propBounds)) {
                collisions.push({
                    type: 'playerAttackProp',
                    player: player,
                    prop: prop,
                    damage: 25 // Default player damage to props
                });
            }
        }

        return collisions;
    }

    // Get player attack range (similar to enemy collision system)
    getPlayerAttackRange(player) {
        const attackReach = 60; // Player attack reach
        const attackWidth = 40; // Attack width

        // Player uses 'facing' property, not 'facingDirection'
        if (player.facing === 'right') {
            return {
                left: player.x + player.width,
                right: player.x + player.width + attackReach,
                top: player.y,
                bottom: player.y + player.height
            };
        } else {
            return {
                left: player.x - attackReach,
                right: player.x,
                top: player.y,
                bottom: player.y + player.height
            };
        }
    }

    // Get prop bounds for collision detection
    getPropBounds(prop) {
        const propType = this.data.propTypes[prop.type];
        const sizeMultiplier = prop.sizeMultiplier || 1.0;
        const width = propType ? propType.width * sizeMultiplier : 40;
        const height = propType ? propType.height * sizeMultiplier : 40;

        return {
            left: prop.x,
            right: prop.x + width,
            top: prop.y,
            bottom: prop.y + height
        };
    }

    // Check if two bounds intersect
    boundsIntersect(bounds1, bounds2) {
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }

    // Respawn all destroyed props (called on game start/reload)
    respawnAllProps() {
        return this.data.respawnAllProps();
    }

    // Update moving props and platforms
    updateMovement(deltaTime) {
        this.data.props.forEach(prop => {
            if (prop.isMoving && !prop.isDestroyed) {
                // Get movement speed in pixels per second
                const moveSpeed = prop.moveSpeed || 2;
                const pixelsPerMs = moveSpeed / 16.67; // Convert to pixels per 16.67ms (60fps)
                const movement = pixelsPerMs * deltaTime;

                if (prop.movementZone && prop.movementZone.enabled && this.hasValidMovementZone(prop.movementZone)) {
                    // Move along the defined line
                    const { startX, startY, endX, endY } = prop.movementZone;

                    // Calculate line length and direction
                    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
                    if (lineLength === 0) return; // Avoid division by zero

                    // Update movement progress along the line
                    const progressDelta = movement / lineLength;
                    prop.movementProgress += progressDelta * prop.movingDirection;

                    // Check boundaries and reverse direction if needed
                    if (prop.movementProgress >= 1) {
                        prop.movementProgress = 1;
                        prop.movingDirection = -1;
                    } else if (prop.movementProgress <= 0) {
                        prop.movementProgress = 0;
                        prop.movingDirection = 1;
                    }

                    // Calculate center position based on progress along the line
                    const centerX = startX + (endX - startX) * prop.movementProgress;
                    const centerY = startY + (endY - startY) * prop.movementProgress;

                    // Set prop position so its center follows the line
                    // For props, we need to calculate the actual size including any size multiplier
                    const propType = this.data.propTypes[prop.type];
                    const actualWidth = propType ? (propType.width || 32) * (prop.sizeMultiplier || 1) : 32;
                    const actualHeight = propType ? (propType.height || 32) * (prop.sizeMultiplier || 1) : 32;

                    prop.x = centerX - actualWidth / 2;
                    prop.y = centerY - actualHeight / 2;
                }
                // No fallback movement - props only move with valid drawn movement zones
            }
        });

        // Update bound props to follow their platforms
        this.updateBoundProps();
    }

    // Update props that are bound to platforms
    updateBoundProps() {
        // Get platform system for position lookup
        const platformSystem = this.game?.platformSystem;
        if (!platformSystem) return;

        this.data.props.forEach(prop => {
            // Store previous position to calculate velocity (for Newton's law)
            const previousX = prop.x;
            const previousY = prop.y;

            if (prop.boundToPlatform && !prop.isDestroyed) {
                // Find the platform this prop is bound to
                const boundPlatform = platformSystem.data.platforms.find(p => p.id === prop.boundToPlatform);
                if (boundPlatform) {
                    // Calculate platform center
                    const platformCenterX = boundPlatform.x + boundPlatform.width / 2;
                    const platformCenterY = boundPlatform.y + boundPlatform.height / 2;

                    // Calculate prop size for proper positioning
                    const propType = this.data.propTypes[prop.type];
                    const actualWidth = propType ? (propType.width || 32) * (prop.sizeMultiplier || 1) : 32;
                    const actualHeight = propType ? (propType.height || 32) * (prop.sizeMultiplier || 1) : 32;

                    // Calculate new prop position based on platform center + offset
                    const newPropCenterX = platformCenterX + prop.platformBindOffset.x;
                    const newPropCenterY = platformCenterY + prop.platformBindOffset.y;

                    // Set prop position (top-left corner)
                    prop.x = newPropCenterX - actualWidth / 2;
                    prop.y = newPropCenterY - actualHeight / 2;
                } else {
                    // Platform no longer exists, unbind the prop
                    console.warn(`🟣 Platform ${prop.boundToPlatform} no longer exists, unbinding prop ${prop.id}`);
                    prop.boundToPlatform = null;
                    prop.platformBindOffset = { x: 0, y: 0 };
                }
            }

            // Calculate and store prop velocity for this frame (for Newton's law when player stands on prop)
            prop.velocityX = prop.x - previousX;
            prop.velocityY = prop.y - previousY;
        });
    }

    // Check if a movement zone has valid coordinates (not all zeros and has actual length)
    hasValidMovementZone(movementZone) {
        if (!movementZone) return false;

        const { startX, startY, endX, endY } = movementZone;

        // Check if the line has any length
        // Return false if all coordinates are zero OR if start and end points are the same
        const hasLength = Math.abs(endX - startX) > 0.1 || Math.abs(endY - startY) > 0.1;
        const notAllZeros = !(startX === 0 && startY === 0 && endX === 0 && endY === 0);

        return hasLength && notAllZeros;
    }
}