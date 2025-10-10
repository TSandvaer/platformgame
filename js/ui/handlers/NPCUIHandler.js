/**
 * Handles all NPC-related UI interactions
 */
class NPCUIHandler extends UIHandler {
    constructor(game) {
        super(game);
    }

    /**
     * Initialize NPC UI event listeners
     */
    initialize() {
        this.setupNPCControls();
    }

    /**
     * Set up NPC controls
     */
    setupNPCControls() {
        this.addListener('addNPCBtn', 'click', () => {
            console.log('🎯 Add NPC button clicked');
            this.game.npcSystem.toggleNPCPlacement();
        });

        this.addListener('clearNPCsBtn', 'click', () => {
            if (confirm('Clear all NPCs? This cannot be undone.')) {
                this.game.npcSystem.clearAllNPCs();
                this.updateNPCList();
                this.updateNPCProperties();
            }
        });
    }

    /**
     * Update NPC list UI
     */
    updateNPCList() {
        const list = this.getElementById('npcList');
        if (!list || !this.game.npcSystem) return;

        const npcs = this.game.npcSystem.data.npcs;
        if (npcs.length === 0) {
            list.innerHTML = '<div class="empty-state">No NPCs in scene</div>';
            return;
        }

        list.innerHTML = npcs.map(npc => `
            <div class="list-item npc-item" data-npc-id="${npc.id}">
                <span class="npc-type">${npc.type}</span>
                <span class="npc-id">ID: ${npc.id}</span>
            </div>
        `).join('');

        // Add click handlers
        list.querySelectorAll('.npc-item').forEach(item => {
            item.addEventListener('click', () => {
                const npcId = item.dataset.npcId;
                const npc = this.game.npcSystem.data.getNPCById(npcId);
                if (npc) {
                    this.game.npcSystem.selectNPC(npc);
                    this.updateNPCProperties();
                }
            });
        });
    }

    /**
     * Update NPC properties UI
     */
    updateNPCProperties() {
        const selectedNPC = this.game.npcSystem.getSelectedNPC();
        const propertiesDiv = this.getElementById('npcProperties');

        if (!propertiesDiv) return;

        if (!selectedNPC) {
            propertiesDiv.innerHTML = '<div class="empty-state">Select an NPC to edit properties</div>';
            return;
        }

        propertiesDiv.innerHTML = `
            <div class="property-group">
                <h3>NPC Properties</h3>
                <label>Type: <strong>${selectedNPC.type}</strong></label>
                <label>ID: <strong>${selectedNPC.id}</strong></label>
                <label>Position: (${Math.round(selectedNPC.x)}, ${Math.round(selectedNPC.y)})</label>
                <label>Health: ${selectedNPC.health}/${selectedNPC.maxHealth}</label>
                <button class="btn danger" onclick="window.uiEventHandler.npcHandler.deleteSelectedNPC()">Delete NPC</button>
            </div>
        `;
    }

    /**
     * Delete selected NPC
     */
    deleteSelectedNPC() {
        const selectedNPC = this.game.npcSystem.getSelectedNPC();
        if (selectedNPC) {
            if (confirm('Delete this NPC?')) {
                this.game.npcSystem.removeNPCFromScene(selectedNPC.id);
                this.updateNPCList();
                this.updateNPCProperties();
            }
        }
    }
}