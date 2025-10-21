class NPCMouseHandler {
    constructor(npcSystem, platformSystem, viewport, camera) {
        this.npcSystem = npcSystem;
        this.platformSystem = platformSystem;
        this.viewport = viewport;
        this.camera = camera;

        // Mouse interaction state
        this.npcPlacementMode = false;
        this.selectedNPCType = 'blacksmith'; // Default NPC type
        this.isDraggingNPC = false;
        this.draggedNPC = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        // Check if we're in NPC placement mode
        if (this.npcPlacementMode) {
            // Use the selected NPC type from the modal
            const npcType = this.selectedNPCType || 'blacksmith';

            // Create new NPC at click position
            const npc = this.npcSystem.addNPCToScene(worldMouseX, worldMouseY, npcType);
            if (npc) {

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
        } else {
            // Clicked on empty space - deselect current NPC
            this.npcSystem.selectNPC(null);

            // Update UI
            if (window.uiEventHandler) {
                window.uiEventHandler.updateNPCList();
                window.uiEventHandler.updateNPCProperties();
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
    }

    setNPCType(npcType) {
        this.selectedNPCType = npcType;
    }
}
