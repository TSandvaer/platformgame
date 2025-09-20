class PropSystem {
    constructor(ctx, platformSprites, torchParticles) {
        this.data = new PropData();
        this.renderer = new PropRenderer(ctx, platformSprites, torchParticles);
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
    renderParticles(viewport, camera) {
        this.renderer.renderAllParticles(viewport, camera);
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
    addProp(type, x, y, isObstacle = false, scale = undefined) {
        return this.data.addProp(type, x, y, isObstacle, scale);
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
    handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed = false, viewport, camera) {
        const result = this.manager.handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed, viewport, camera);
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

    handleMouseUp() {
        this.manager.handleMouseUp();
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

    get selectedProps() {
        return this.data.selectedProps;
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
}