class LootableSystem {
    constructor(ctx, onSpritesLoadedCallback) {
        console.log('🍯 LootableSystem constructor called');
        this.data = new LootableData();
        this.renderer = new LootableRenderer(ctx);
        this.manager = new LootableManager(this.data);

        console.log('🍯 LootableSystem components created');
        console.log('🍯 Data:', !!this.data);
        console.log('🍯 Renderer:', !!this.renderer);
        console.log('🍯 Manager:', !!this.manager);

        // Load sprites
        this.renderer.loadSprites(onSpritesLoadedCallback);
        console.log('🍯 Started loading lootable sprites');
    }

    // Data access methods
    get lootables() {
        return this.data.lootables;
    }

    set lootables(value) {
        if (value && value.length > 0) {
            console.log('🍯 Lootables being set:', value.map(l => ({
                id: l.id,
                type: l.type,
                x: l.x,
                y: l.y
            })));
        }
        this.data.lootables = value;
    }

    get selectedLootable() {
        return this.data.selectedLootable;
    }

    set selectedLootable(value) {
        this.data.selectedLootable = value;
    }

    get lootablePlacementMode() {
        return this.data.lootablePlacementMode;
    }

    set lootablePlacementMode(value) {
        this.data.lootablePlacementMode = value;
    }

    get isDraggingLootable() {
        return this.data.isDraggingLootable;
    }

    get selectedLootables() {
        return this.data.selectedLootables;
    }

    get lootableTypes() {
        return this.data.lootableTypes;
    }

    // Rendering methods
    renderLootables(isDevelopmentMode, viewport, camera) {
        this.renderer.renderLootables(
            this.data.lootables,
            this.data.lootableTypes,
            isDevelopmentMode,
            this.data.selectedLootable,
            this.data.selectedLootables,
            viewport,
            camera
        );
    }

    renderPlacementPreview(mouseX, mouseY) {
        if (this.data.lootablePlacementMode) {
            this.renderer.renderPlacementPreview(
                mouseX,
                mouseY,
                this.manager.currentLootableType,
                this.data.lootableTypes
            );
        }
    }

    renderDragSelection() {
        if (this.data.isDragSelecting && this.data.dragSelectionStart && this.data.dragSelectionEnd) {
            this.renderer.drawDragSelection(
                this.data.dragSelectionStart.x,
                this.data.dragSelectionStart.y,
                this.data.dragSelectionEnd.x,
                this.data.dragSelectionEnd.y
            );
        }
    }

    // Lootable management
    addLootable(type, x, y) {
        return this.data.addLootable(type, x, y);
    }

    deleteSelectedLootable() {
        this.data.deleteSelectedLootable();
        this.manager.updateLootableList();
        this.manager.updateLootableProperties();
    }

    deleteSelectedLootables() {
        this.data.deleteSelectedLootables();
        this.manager.updateLootableList();
        this.manager.updateLootableProperties();
    }

    toggleLootablePlacement() {
        this.manager.toggleLootablePlacement();
    }

    placeLootable(mouseX, mouseY) {
        this.manager.placeLootable(mouseX, mouseY);
        this.manager.updateLootableList();
        this.manager.updateLootableProperties();
    }

    // Mouse event handling
    handleMouseDown(mouseX, mouseY, ctrlPressed = false, shiftPressed = false) {
        const result = this.manager.handleMouseDown(mouseX, mouseY, ctrlPressed, shiftPressed);
        if (result.handled) {
            this.manager.updateLootableList();
            this.manager.updateLootableProperties();
        }
        return result;
    }

    handleMouseMove(mouseX, mouseY) {
        const moved = this.manager.handleMouseMove(mouseX, mouseY);
        if (moved) {
            this.manager.updateLootableProperties();
        }
        return moved;
    }

    handleMouseUp(ctrlPressed = false) {
        return this.manager.handleMouseUp(ctrlPressed);
    }

    // Keyboard event handling
    handleKeyDown(event) {
        const handled = this.manager.handleKeyDown(event);
        if (handled) {
            // Update UI if needed
        }
        return handled;
    }

    // UI updates
    updateLootableList() {
        this.manager.updateLootableList();
    }

    updateLootableProperties() {
        this.manager.updateLootableProperties();
    }

    // Animation updates
    update() {
        this.data.updateAnimations();
    }

    // Copy/paste methods
    copySelectedLootables() {
        return this.data.copySelectedLootables();
    }

    pasteLootables(mouseX, mouseY) {
        const pastedLootables = this.data.pasteLootables(mouseX, mouseY);
        if (pastedLootables.length > 0) {
            this.manager.updateLootableList();
            this.manager.updateLootableProperties();
        }
        return pastedLootables;
    }

    // Selection methods
    clearSelection() {
        this.data.selectedLootable = null;
        this.data.clearMultiSelection();
        this.manager.updateLootableList();
        this.manager.updateLootableProperties();
    }

    // State management
    get currentLootableType() {
        return this.manager.currentLootableType;
    }

    set currentLootableType(value) {
        this.manager.currentLootableType = value;
    }

    // Utility methods
    isPointInLootable(x, y, lootable) {
        return this.data.isPointInLootable(x, y, lootable);
    }

    getLootableAt(x, y) {
        return this.data.getLootableAt(x, y);
    }

    getLootableById(id) {
        return this.data.getLootableById(id);
    }

    // Sprites loaded check
    get spritesLoaded() {
        return this.renderer.spritesLoaded;
    }
}