class PropSystem {
    constructor(ctx, platformSprites, torchParticles, onSpritesLoadedCallback) {
        this.data = new PropData();
        this.renderer = new PropRenderer(ctx, platformSprites, torchParticles, onSpritesLoadedCallback);
        this.collisions = new PropCollisions();
        this.manager = new PropManager(this.data);

        // Initialize prop z-orders
        this.data.initializePropZOrders();
    }

    // Data access methods
    get props() {
        return this.data.props;
    }

    set props(value) {
        if (value && value.length > 0) {
            console.log('🎭 Props being set:', value.map(p => ({
                id: p.id,
                type: p.type,
                x: p.x,
                y: p.y
            })));
        }
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
    updateDestruction(deltaTime) {
        this.data.updateAllDestruction(deltaTime);
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
}