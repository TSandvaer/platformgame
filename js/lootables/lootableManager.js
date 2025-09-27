class LootableManager {
    constructor(data) {
        this.data = data;
        this.currentLootableType = 'coin'; // Default lootable type
    }

    // UI Updates
    updateLootableList() {
        const lootableList = document.getElementById('lootableList');
        if (!lootableList) return;

        lootableList.innerHTML = '';

        this.data.lootables.forEach(lootable => {
            const listItem = document.createElement('li');
            listItem.className = 'lootable-item';
            const lootableType = this.data.lootableTypes[lootable.type];

            listItem.textContent = `${lootableType.name} (${lootable.id}) - (${Math.floor(lootable.x)}, ${Math.floor(lootable.y)})`;
            listItem.dataset.lootableId = lootable.id;

            // Highlight selected lootables
            if (this.data.selectedLootable === lootable) {
                listItem.classList.add('selected');
            } else if (this.data.selectedLootables.includes(lootable)) {
                listItem.classList.add('multi-selected');
            }

            // Click to select lootable
            listItem.addEventListener('click', (e) => {
                if (e.ctrlKey) {
                    this.data.toggleSelection(lootable);
                } else {
                    this.data.selectedLootable = lootable;
                    this.data.selectedLootables = [lootable];
                }
                this.updateLootableList();
                this.updateLootableProperties();
            });

            lootableList.appendChild(listItem);
        });
    }

    updateLootableProperties() {
        const propertiesPanel = document.getElementById('lootableProperties');
        if (!propertiesPanel) return;

        if (!this.data.selectedLootable) {
            propertiesPanel.innerHTML = '<p>No lootable selected</p>';
            return;
        }

        const lootable = this.data.selectedLootable;
        const lootableType = this.data.lootableTypes[lootable.type];

        propertiesPanel.innerHTML = `
            <h4>Lootable Properties</h4>
            <div class="property-group">
                <label>ID:</label>
                <span>${lootable.id}</span>
            </div>
            <div class="property-group">
                <label>Type:</label>
                <span>${lootableType.name}</span>
            </div>
            <div class="property-group">
                <label>X:</label>
                <input type="number" id="lootableX" value="${Math.floor(lootable.x)}" step="1">
            </div>
            <div class="property-group">
                <label>Y:</label>
                <input type="number" id="lootableY" value="${Math.floor(lootable.y)}" step="1">
            </div>
            <div class="property-group">
                <label>Visible:</label>
                <input type="checkbox" id="lootableVisible" ${lootable.isVisible ? 'checked' : ''}>
            </div>
            <button class="btn small danger" onclick="game.lootableSystem.deleteSelectedLootable(); game.lootableSystem.updateLootableList(); game.lootableSystem.updateLootableProperties();">Delete Lootable</button>
        `;

        // Add event listeners for property changes
        const xInput = document.getElementById('lootableX');
        const yInput = document.getElementById('lootableY');
        const visibleInput = document.getElementById('lootableVisible');

        if (xInput) {
            xInput.addEventListener('input', () => {
                lootable.x = parseFloat(xInput.value) || 0;
                this.updateLootableList();
            });
        }

        if (yInput) {
            yInput.addEventListener('input', () => {
                lootable.y = parseFloat(yInput.value) || 0;
                this.updateLootableList();
            });
        }

        if (visibleInput) {
            visibleInput.addEventListener('change', () => {
                lootable.isVisible = visibleInput.checked;
                this.updateLootableList();
            });
        }
    }

    // Placement mode
    toggleLootablePlacement() {
        this.data.lootablePlacementMode = !this.data.lootablePlacementMode;
        const button = document.getElementById('toggleLootablePlacement');
        if (button) {
            button.textContent = this.data.lootablePlacementMode ? 'Exit Placement' : 'Place Lootable';
        }
        console.log('Lootable placement mode:', this.data.lootablePlacementMode);
    }

    placeLootable(mouseX, mouseY) {
        if (!this.data.lootablePlacementMode) return;

        const newLootable = this.data.addLootable(this.currentLootableType, mouseX, mouseY);
        if (newLootable) {
            this.data.selectedLootable = newLootable;
            this.data.selectedLootables = [newLootable];
        }
    }

    // Mouse handling
    handleMouseDown(mouseX, mouseY, ctrlPressed = false, shiftPressed = false) {
        // If in placement mode, place lootable
        if (this.data.lootablePlacementMode) {
            this.placeLootable(mouseX, mouseY);
            return { handled: true, type: 'place' };
        }

        // Find lootable at mouse position
        const clickedLootable = this.data.getLootableAt(mouseX, mouseY);

        if (clickedLootable) {
            if (ctrlPressed) {
                // Multi-selection with Ctrl
                this.data.toggleSelection(clickedLootable);
                if (this.data.selectedLootables.includes(clickedLootable)) {
                    this.data.selectedLootable = clickedLootable;
                }
            } else if (shiftPressed && this.data.selectedLootable) {
                // Range selection with Shift (add to selection)
                if (!this.data.selectedLootables.includes(clickedLootable)) {
                    this.data.addToSelection(clickedLootable);
                }
            } else {
                // Normal selection - but if clicking on an already selected lootable in a multiselection, keep the multiselection
                if (this.data.selectedLootables.length > 1 && this.data.selectedLootables.includes(clickedLootable)) {
                    // Keep the multiselection, just change the primary selected lootable
                    this.data.selectedLootable = clickedLootable;
                } else {
                    // Normal single selection
                    this.data.selectedLootable = clickedLootable;
                    this.data.selectedLootables = [clickedLootable];
                }
            }

            // Start dragging
            this.data.isDraggingLootable = true;
            this.data.lootableDragOffset = {
                x: mouseX - clickedLootable.x,
                y: mouseY - clickedLootable.y
            };

            return { handled: true, type: 'drag', lootable: clickedLootable };
        } else if (!ctrlPressed && !shiftPressed) {
            // Clear selection if clicking empty space, but don't claim the click
            this.data.selectedLootable = null;
            this.data.selectedLootables = [];

            // Don't start drag selection here - let other systems handle the click first
            // Only start drag selection if no other system claims the click
            return { handled: false, type: 'clear' };
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY) {
        if (this.data.isDraggingLootable && this.data.selectedLootables.length > 0) {
            // Calculate movement delta
            const newX = mouseX - this.data.lootableDragOffset.x;
            const newY = mouseY - this.data.lootableDragOffset.y;

            if (this.data.selectedLootable) {
                const deltaX = newX - this.data.selectedLootable.x;
                const deltaY = newY - this.data.selectedLootable.y;

                // Move all selected lootables
                this.data.selectedLootables.forEach(lootable => {
                    lootable.x += deltaX;
                    lootable.y += deltaY;
                });
            }

            return true;
        }

        if (this.data.isDragSelecting) {
            this.data.updateDragSelection(mouseX, mouseY);
            return true;
        }

        return false;
    }

    handleMouseUp(ctrlPressed = false) {
        if (this.data.isDraggingLootable) {
            this.data.isDraggingLootable = false;
            return true;
        }

        if (this.data.isDragSelecting) {
            // Perform drag selection
            const selectedCount = this.data.finishDragSelection(ctrlPressed);
            if (selectedCount > 0) {
                this.updateLootableList();
                this.updateLootableProperties();
            }
            return true;
        }

        return false;
    }

    // Keyboard shortcuts
    handleKeyDown(event) {
        if (event.key === 'Delete' && this.data.selectedLootables.length > 0) {
            this.data.deleteSelectedLootables();
            this.updateLootableList();
            this.updateLootableProperties();
            return true;
        }

        // Copy/Paste
        if (event.ctrlKey && event.key === 'c') {
            this.data.copySelectedLootables();
            return true;
        }

        if (event.ctrlKey && event.key === 'v') {
            // TODO: Get mouse position for paste
            return true;
        }

        // Nudge with arrow keys
        if (this.data.selectedLootables.length > 0) {
            let deltaX = 0, deltaY = 0;

            switch (event.key) {
                case 'ArrowLeft': deltaX = -1; break;
                case 'ArrowRight': deltaX = 1; break;
                case 'ArrowUp': deltaY = -1; break;
                case 'ArrowDown': deltaY = 1; break;
                default: return false;
            }

            this.data.nudgeSelectedLootables(deltaX, deltaY);
            this.updateLootableList();
            this.updateLootableProperties();
            return true;
        }

        return false;
    }
}