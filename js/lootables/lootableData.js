class LootableData {
    constructor() {
        this.lootables = [];
        this.selectedLootable = null;
        this.selectedLootables = [];
        this.nextLootableId = 1;
        this.lootablePlacementMode = false;
        this.isDraggingLootable = false;
        this.lootableDragOffset = { x: 0, y: 0 };
        this.clipboard = [];
        this.isDragSelecting = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lootableGroups = new Map();
        this.nextGroupId = 1;

        // Define lootable types
        this.lootableTypes = {
            coin: {
                name: 'Gold Coin',
                width: 32,
                height: 32,
                animated: true,
                animationFrames: 8,
                animationSpeed: 150, // ms per frame
                spritePath: 'sprites/Coins/gold'
            },
            heart: {
                name: 'Heart',
                width: 32,
                height: 32,
                animated: false,
                spritePath: 'sprites/heart'
            }
        };
    }

    // Basic lootable management
    addLootable(type, x, y) {
        if (!this.lootableTypes[type]) {
            console.error(`Unknown lootable type: ${type}`);
            return null;
        }

        const lootable = {
            id: this.nextLootableId++,
            type: type,
            x: x,
            y: y,
            isVisible: true
        };

        this.lootables.push(lootable);
        console.log(`Added lootable: ${type} at (${x}, ${y})`);
        return lootable;
    }

    deleteLootable(lootable) {
        const index = this.lootables.indexOf(lootable);
        if (index !== -1) {
            this.lootables.splice(index, 1);

            // Clear selection if this lootable was selected
            if (this.selectedLootable === lootable) {
                this.selectedLootable = null;
            }

            // Remove from multi-selection
            this.removeFromSelection(lootable);

            console.log(`Deleted lootable ${lootable.id}`);
        }
    }

    deleteSelectedLootable() {
        if (this.selectedLootable) {
            this.deleteLootable(this.selectedLootable);
        }
    }

    deleteSelectedLootables() {
        // Delete all selected lootables
        [...this.selectedLootables].forEach(lootable => {
            this.deleteLootable(lootable);
        });
        this.selectedLootables = [];
        this.selectedLootable = null;
    }

    // Position utilities
    isPointInLootable(x, y, lootable) {
        const lootableType = this.lootableTypes[lootable.type];
        if (!lootableType) return false;

        return x >= lootable.x &&
               x <= lootable.x + lootableType.width &&
               y >= lootable.y &&
               y <= lootable.y + lootableType.height;
    }

    getLootableAt(x, y) {
        // Search from end to beginning (top to bottom in z-order)
        for (let i = this.lootables.length - 1; i >= 0; i--) {
            const lootable = this.lootables[i];
            if (lootable.isVisible && this.isPointInLootable(x, y, lootable)) {
                return lootable;
            }
        }
        return null;
    }

    // Selection management
    addToSelection(lootable) {
        if (!this.selectedLootables.includes(lootable)) {
            this.selectedLootables.push(lootable);
        }
    }

    removeFromSelection(lootable) {
        const index = this.selectedLootables.indexOf(lootable);
        if (index !== -1) {
            this.selectedLootables.splice(index, 1);
        }
    }

    clearMultiSelection() {
        this.selectedLootables = [];
    }

    selectMultiple(lootables) {
        this.selectedLootables = [...lootables];
    }

    toggleSelection(lootable) {
        if (this.selectedLootables.includes(lootable)) {
            this.removeFromSelection(lootable);
        } else {
            this.addToSelection(lootable);
        }
    }

    // Copy/paste functionality
    copySelectedLootables() {
        if (this.selectedLootables.length > 0) {
            this.clipboard = this.selectedLootables.map(lootable => ({
                type: lootable.type,
                offsetX: lootable.x - this.selectedLootables[0].x,
                offsetY: lootable.y - this.selectedLootables[0].y
            }));
            console.log(`Copied ${this.clipboard.length} lootables to clipboard`);
        }
        return this.clipboard;
    }

    pasteLootables(mouseX, mouseY) {
        const pastedLootables = [];

        this.clipboard.forEach(item => {
            const newLootable = this.addLootable(
                item.type,
                mouseX + item.offsetX,
                mouseY + item.offsetY
            );
            if (newLootable) {
                pastedLootables.push(newLootable);
            }
        });

        if (pastedLootables.length > 0) {
            this.selectedLootables = pastedLootables;
            this.selectedLootable = pastedLootables[0];
            console.log(`Pasted ${pastedLootables.length} lootables`);
        }

        return pastedLootables;
    }

    // Animation updates (not needed for GIF animations - browser handles them)
    updateAnimations() {
        // No longer needed since we're using animated GIFs
        // The browser automatically handles GIF animation frames
    }

    // Drag selection
    startDragSelection(startX, startY) {
        this.isDragSelecting = true;
        this.dragSelectionStart = { x: startX, y: startY };
        this.dragSelectionEnd = { x: startX, y: startY };
    }

    updateDragSelection(endX, endY) {
        if (!this.isDragSelecting) return;
        this.dragSelectionEnd = { x: endX, y: endY };
    }

    finishDragSelection(addToSelection = false) {
        if (!this.isDragSelecting) return;

        const rect = this.getDragSelectionRect();
        const selectedLootables = this.getLootablesInRect(rect);

        if (!addToSelection) {
            this.clearMultiSelection();
        }

        selectedLootables.forEach(lootable => {
            this.addToSelection(lootable);
        });

        if (selectedLootables.length > 0) {
            this.selectedLootable = selectedLootables[0];
        }

        this.endDragSelection();
        return selectedLootables.length;
    }

    endDragSelection() {
        this.isDragSelecting = false;
        this.dragSelectionStart = null;
        this.dragSelectionEnd = null;
    }

    getDragSelectionRect() {
        if (!this.isDragSelecting || !this.dragSelectionStart || !this.dragSelectionEnd) {
            return null;
        }

        const left = Math.min(this.dragSelectionStart.x, this.dragSelectionEnd.x);
        const right = Math.max(this.dragSelectionStart.x, this.dragSelectionEnd.x);
        const top = Math.min(this.dragSelectionStart.y, this.dragSelectionEnd.y);
        const bottom = Math.max(this.dragSelectionStart.y, this.dragSelectionEnd.y);

        return {
            left,
            right,
            top,
            bottom,
            width: right - left,
            height: bottom - top,
            isDragging: this.isDragSelecting
        };
    }

    getLootablesInRect(rect) {
        if (!rect) return [];

        return this.lootables.filter(lootable => {
            const lootableType = this.lootableTypes[lootable.type];
            if (!lootableType || !lootable.isVisible) return false;

            // Check if lootable overlaps with selection rectangle
            const lootableLeft = lootable.x;
            const lootableRight = lootable.x + lootableType.width;
            const lootableTop = lootable.y;
            const lootableBottom = lootable.y + lootableType.height;

            return !(lootableRight < rect.left ||
                    lootableLeft > rect.right ||
                    lootableBottom < rect.top ||
                    lootableTop > rect.bottom);
        });
    }

    // Nudge functionality
    nudgeSelectedLootables(deltaX, deltaY) {
        this.selectedLootables.forEach(lootable => {
            lootable.x += deltaX;
            lootable.y += deltaY;
        });
    }

    // Get lootable by ID
    getLootableById(id) {
        return this.lootables.find(lootable => lootable.id === id);
    }
}