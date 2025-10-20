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
        this.setupNPCPropertyEditing();
    }

    /**
     * Set up NPC controls
     */
    setupNPCControls() {
        this.addListener('addNPCBtn', 'click', () => {
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
     * Set up NPC property editing controls
     */
    setupNPCPropertyEditing() {
        // Update NPC button
        this.addListener('updateNPC', 'click', () => {
            this.updateSelectedNPC();
        });

        // Delete NPC button
        this.addListener('deleteNPC', 'click', () => {
            this.deleteSelectedNPC();
        });

        // NPC property input change handlers
        const propertyInputs = [
            'npcX', 'npcY', 'npcInteractionRadius'
        ];

        propertyInputs.forEach(inputId => {
            const input = this.getElementById(inputId, true); // Silent - optional
            if (input) {
                input.addEventListener('input', () => {
                    // Real-time update as user types
                    this.updateSelectedNPC();
                });
            }
        });

        // Facing dropdown change handler
        const facingSelect = this.getElementById('npcFacing', true);
        if (facingSelect) {
            facingSelect.addEventListener('change', () => {
                this.updateSelectedNPC();
            });
        }

        // Can interact checkbox handler
        this.addListener('npcCanInteract', 'change', (e) => {
            const selectedNPC = this.game.npcSystem.getSelectedNPC();
            if (selectedNPC) {
                selectedNPC.canInteract = e.target.checked;
                this.updateNPCList();
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

        const selectedNPC = this.game.npcSystem.getSelectedNPC();

        list.innerHTML = npcs.map(npc => {
            const isSelected = selectedNPC && selectedNPC.id === npc.id;
            return `<div class="item ${isSelected ? 'selected' : ''}" data-npc-id="${npc.id}">
                <div class="item-name">${npc.type} (${Math.round(npc.x)}, ${Math.round(npc.y)})</div>
                <div class="item-details">ID: ${npc.id}, Facing: ${npc.facing || 'right'}</div>
            </div>`;
        }).join('');

        // Add click handlers
        list.querySelectorAll('[data-npc-id]').forEach(item => {
            item.addEventListener('click', () => {
                const npcId = parseInt(item.dataset.npcId);
                const npc = this.game.npcSystem.data.getNPCById(npcId);
                if (npc) {
                    this.game.npcSystem.selectNPC(npc);
                    this.updateNPCProperties();
                    this.updateNPCList(); // Refresh list to show selection
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
            propertiesDiv.style.display = 'none';
            return;
        }

        propertiesDiv.style.display = 'block';

        // Update NPC properties form
        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            if (element && value !== undefined && !isNaN(value)) {
                element.value = value;
            } else if (element) {
                element.value = '';
            }
        };

        updateValue('npcX', Math.round(selectedNPC.x));
        updateValue('npcY', Math.round(selectedNPC.y));
        updateValue('npcInteractionRadius', selectedNPC.interactionRadius || 50);

        // Update facing dropdown
        const facingSelect = document.getElementById('npcFacing');
        if (facingSelect) {
            facingSelect.value = selectedNPC.facing || 'right';
        }

        // Update checkbox
        const canInteractCheckbox = document.getElementById('npcCanInteract');
        if (canInteractCheckbox) {
            canInteractCheckbox.checked = selectedNPC.canInteract !== undefined ? selectedNPC.canInteract : true;
        }
    }

    /**
     * Update the selected NPC with values from input fields
     */
    updateSelectedNPC() {
        const selectedNPC = this.game.npcSystem.getSelectedNPC();
        if (!selectedNPC) return;

        // Get values from inputs
        const xInput = parseInt(document.getElementById('npcX')?.value);
        const yInput = parseInt(document.getElementById('npcY')?.value);
        const interactionRadiusInput = parseInt(document.getElementById('npcInteractionRadius')?.value);
        const facingInput = document.getElementById('npcFacing')?.value;

        // Only use input values if they're valid numbers
        const x = !isNaN(xInput) ? xInput : selectedNPC.x;
        const y = !isNaN(yInput) ? yInput : selectedNPC.y;
        const interactionRadius = !isNaN(interactionRadiusInput) ? interactionRadiusInput : (selectedNPC.interactionRadius || 50);
        const facing = facingInput || selectedNPC.facing || 'right';

        // Update NPC properties
        selectedNPC.x = x;
        selectedNPC.y = y;
        selectedNPC.interactionRadius = interactionRadius;
        selectedNPC.facing = facing;

        // Update UI
        this.updateNPCList();
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