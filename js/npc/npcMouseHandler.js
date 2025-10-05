class NPCMouseHandler {
    constructor(npcSystem, platformSystem, viewport, camera) {
        this.npcSystem = npcSystem;
        this.platformSystem = platformSystem;
        this.viewport = viewport;
        this.camera = camera;

        // Mouse interaction state
        this.npcPlacementMode = false;
        this.isDraggingNPC = false;
        this.draggedNPC = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        // Check if we're in NPC placement mode
        if (this.npcPlacementMode) {
            // Get current NPC type from UI
            const npcTypeSelect = document.getElementById('npcTypeSelect');
            const npcType = npcTypeSelect ? npcTypeSelect.value : 'blacksmith';

            // Create new NPC at click position
            const npc = this.npcSystem.addNPCToScene(worldMouseX, worldMouseY, npcType);
            if (npc) {
                console.log(`Placed ${npcType} NPC at (${worldMouseX}, ${worldMouseY})`);

                // Select the newly created NPC
                this.npcSystem.selectNPC(npc);

                // Update UI
                if (window.uiEventHandler) {
                    window.uiEventHandler.updateNPCList();
                    window.uiEventHandler.updateNPCProperties();
                }
            }

            // Exit placement mode after placing
            this.npcPlacementMode = false;
            return { handled: true, action: 'placed' };
        }

        // Check if clicking on an existing NPC
        const clickedNPC = this.npcSystem.getNPCAtPosition(worldMouseX, worldMouseY);

        if (clickedNPC) {
            if (ctrlPressed) {
                // Ctrl+Click: Duplicate NPC
                const duplicate = this.npcSystem.duplicateNPC(clickedNPC.id);
                if (duplicate) {
                    this.npcSystem.selectNPC(duplicate);
                    console.log(`Duplicated NPC ${clickedNPC.id} as ${duplicate.id}`);

                    // Update UI
                    if (window.uiEventHandler) {
                        window.uiEventHandler.updateNPCList();
                        window.uiEventHandler.updateNPCProperties();
                    }
                }
                return { handled: true, action: 'duplicated' };
            } else {
                // Normal click: Select and start dragging
                this.npcSystem.selectNPC(clickedNPC);
                this.isDraggingNPC = true;
                this.draggedNPC = clickedNPC;
                this.dragOffsetX = worldMouseX - clickedNPC.x;
                this.dragOffsetY = worldMouseY - clickedNPC.y;

                // Update UI
                if (window.uiEventHandler) {
                    window.uiEventHandler.updateNPCList();
                    window.uiEventHandler.updateNPCProperties();
                }

                return { handled: true, action: 'selected' };
            }
        }

        return { handled: false };
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        // Handle NPC dragging
        if (this.isDraggingNPC && this.draggedNPC) {
            const newX = worldMouseX - this.dragOffsetX;
            const newY = worldMouseY - this.dragOffsetY;

            this.npcSystem.moveNPC(this.draggedNPC.id, newX, newY);

            // Update UI position inputs
            if (window.uiEventHandler) {
                const xInput = document.getElementById('npcX');
                const yInput = document.getElementById('npcY');
                if (xInput) xInput.value = Math.round(newX);
                if (yInput) yInput.value = Math.round(newY);
            }

            return true;
        }

        return false;
    }

    handleMouseUp(ctrlPressed = false) {
        if (this.isDraggingNPC) {
            console.log(`Finished dragging NPC ${this.draggedNPC.id} to (${this.draggedNPC.x}, ${this.draggedNPC.y})`);
            this.isDraggingNPC = false;
            this.draggedNPC = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;

            // Update UI
            if (window.uiEventHandler) {
                window.uiEventHandler.updateNPCList();
            }

            return { handled: true, action: 'drag_complete' };
        }

        return { handled: false };
    }

    toggleNPCPlacement() {
        this.npcPlacementMode = !this.npcPlacementMode;
        console.log(`NPC placement mode: ${this.npcPlacementMode ? 'ON' : 'OFF'}`);

        // Update button appearance
        const addButton = document.getElementById('addNPCBtn');
        if (addButton) {
            if (this.npcPlacementMode) {
                addButton.textContent = 'Click on map to place NPC';
                addButton.classList.add('active');
            } else {
                addButton.textContent = 'Add NPC (Click on map)';
                addButton.classList.remove('active');
            }
        }
    }
}
