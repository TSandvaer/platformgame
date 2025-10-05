class NPCSystem {
    constructor() {
        this.data = new NPCData();
        this.manager = new NPCManager(this.data);
        this.renderer = null;
        this.animators = new Map();
        this.mouseHandler = null;
        this.isInitialized = false;
    }

    initialize(ctx, platformSystem, viewport, camera) {
        this.renderer = new NPCRenderer(ctx);
        this.mouseHandler = new NPCMouseHandler(this, platformSystem, viewport, camera);
        this.isInitialized = true;
        console.log('NPC system initialized');
    }

    update(deltaTime) {
        if (!this.isInitialized) return;

        for (const npc of this.data.npcs) {
            // Skip invisible NPCs
            if (!npc.isVisible) {
                continue;
            }

            // Get or create animator for this NPC
            let animator = this.animators.get(npc.id);
            if (!animator) {
                animator = new NPCAnimator(npc, this.data.npcTypes[npc.type]);
                this.animators.set(npc.id, animator);
            }

            // Update animation
            animator.update(deltaTime);
        }
    }

    render(viewport, camera, isDevelopmentMode) {
        if (!this.isInitialized || !this.renderer) return;

        const selectedNPC = this.getSelectedNPC();
        for (const npc of this.data.npcs) {
            // Skip rendering invisible NPCs
            if (!npc.isVisible) {
                continue;
            }

            const animator = this.animators.get(npc.id);
            if (animator) {
                this.renderer.renderNPC(npc, animator, viewport, camera, isDevelopmentMode, selectedNPC);
            }
        }
    }

    // Scene management methods
    addNPCToScene(x, y, npcType = 'blacksmith') {
        return this.manager.addNPC(x, y, npcType);
    }

    removeNPCFromScene(npcId) {
        const removed = this.manager.removeNPC(npcId);
        if (removed) {
            this.animators.delete(npcId);
        }
        return removed;
    }

    getNPCAtPosition(x, y, tolerance = 10) {
        return this.manager.getNPCAtPosition(x, y, tolerance);
    }

    selectNPC(npc) {
        this.manager.selectNPC(npc);
    }

    getSelectedNPC() {
        return this.manager.getSelectedNPC();
    }

    updateNPCProperties(npcId, properties) {
        return this.manager.updateNPCProperties(npcId, properties);
    }

    moveNPC(npcId, x, y) {
        return this.manager.moveNPC(npcId, x, y);
    }

    duplicateNPC(npcId) {
        const duplicate = this.manager.duplicateNPC(npcId);
        if (duplicate) {
            // Animator will be created on next update
        }
        return duplicate;
    }

    clearAllNPCs() {
        this.manager.clearAllNPCs();
        this.animators.clear();
    }

    getNPCStats() {
        return this.manager.getNPCStats();
    }

    validateNPCData() {
        return this.manager.validateNPCData();
    }

    // Save/load functionality
    exportNPCData() {
        return this.data.exportNPCData();
    }

    importNPCData(data) {
        this.data.importNPCData(data);
        this.animators.clear(); // Clear animators, they'll be recreated on update
    }

    // Mouse handling methods
    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        if (!this.mouseHandler) return { handled: false };
        return this.mouseHandler.handleMouseDown(worldMouseX, worldMouseY, ctrlPressed, shiftPressed);
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        if (!this.mouseHandler) return false;
        return this.mouseHandler.handleMouseMove(worldMouseX, worldMouseY);
    }

    handleMouseUp(ctrlPressed = false) {
        if (!this.mouseHandler) return { handled: false };
        return this.mouseHandler.handleMouseUp(ctrlPressed);
    }

    // UI integration methods
    toggleNPCPlacement() {
        if (this.mouseHandler) {
            this.mouseHandler.toggleNPCPlacement();
        }
    }

    get npcPlacementMode() {
        return this.mouseHandler ? this.mouseHandler.npcPlacementMode : false;
    }

    get isDraggingNPC() {
        return this.mouseHandler ? this.mouseHandler.isDraggingNPC : false;
    }
}
