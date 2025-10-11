class LootableSystem {
    constructor(ctx, onSpritesLoadedCallback) {
        this.data = new LootableData();
        this.renderer = new LootableRenderer(ctx);
        this.manager = new LootableManager(this.data);
        this.game = null; // Will be set after construction


        // Load sprites
        this.renderer.loadSprites(onSpritesLoadedCallback);
    }

    // Game reference setter - pass it down to LootableData
    set game(value) {
        this._game = value;
        this.data.game = value;
    }

    get game() {
        return this._game;
    }

    // Data access methods
    get lootables() {
        return this.data.lootables;
    }

    set lootables(value) {
        if (value && value.length > 0) {
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
        this.renderer.updateAnimations(this.data.lootableTypes);
    }

    // Check for player-lootable collisions (called from game loop)
    checkPlayerCollisions(player) {
        if (!player || this.data.lootables.length === 0) return [];

        const collectedLootables = [];

        // Check each lootable for collision with player
        for (let i = this.data.lootables.length - 1; i >= 0; i--) {
            const lootable = this.data.lootables[i];

            // Only check lootables that are visible
            if (lootable.isVisible) {
                const lootableType = this.data.lootableTypes[lootable.type];

                // Check collection conditions based on lootable type
                let canCollect = false;

                if (lootable.type === 'coin') {
                    canCollect = true; // Coins can always be collected
                } else if (lootable.type === 'heart') {
                    // Hearts can only be collected if player health is below maximum
                    canCollect = player.health < player.maxHealth;
                }

                // Simple bounding box collision and collection condition
                if (canCollect && this.isPlayerTouchingLootable(player, lootable, lootableType)) {
                    // Collect the lootable
                    collectedLootables.push({
                        x: lootable.x,
                        y: lootable.y,
                        type: lootable.type
                    });

                    // Apply lootable effects
                    if (lootable.type === 'heart') {
                        // Heal player for 20 HP
                        const healAmount = 20;
                        player.health = Math.min(player.maxHealth, player.health + healAmount);
                    }

                    // Remove lootable from array
                    this.data.lootables.splice(i, 1);

                    // Clear selection if this lootable was selected
                    if (this.data.selectedLootable === lootable) {
                        this.data.selectedLootable = null;
                    }
                    this.data.selectedLootables = this.data.selectedLootables.filter(l => l !== lootable);
                }
            }
        }

        // Update UI if lootables were collected
        if (collectedLootables.length > 0) {
            this.manager.updateLootableList();
            this.manager.updateLootableProperties();
        }

        return collectedLootables;
    }

    // Check if player is touching a lootable
    isPlayerTouchingLootable(player, lootable, lootableType) {
        const playerLeft = player.x;
        const playerRight = player.x + player.width;
        const playerTop = player.y;
        const playerBottom = player.y + player.height;

        const lootableLeft = lootable.x;
        const lootableRight = lootable.x + lootableType.width;
        const lootableTop = lootable.y;
        const lootableBottom = lootable.y + lootableType.height;

        return !(playerRight < lootableLeft ||
                 playerLeft > lootableRight ||
                 playerBottom < lootableTop ||
                 playerTop > lootableBottom);
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