/**
 * Handles all NPC-related UI interactions
 */
class NPCUIHandler extends UIHandler {
    constructor(game) {
        super(game);
        this.selectedModalNPCType = null;
    }

    /**
     * Initialize NPC UI event listeners
     */
    initialize() {
        this.setupNPCControls();
        this.setupNPCEditorListeners();
        this.setupNPCPropertyEditing();
    }

    /**
     * Set up NPC controls
     */
    setupNPCControls() {
        this.addListener('clearNPCsBtn', 'click', () => {
            if (confirm('Clear all NPCs? This cannot be undone.')) {
                this.game.npcSystem.clearAllNPCs();
                this.updateNPCList();
                this.updateNPCProperties();
            }
        });
    }

    /**
     * Set up NPC editor modal listeners
     */
    setupNPCEditorListeners() {
        // Open NPCs editor button
        const openBtn = this.getElementById('openNPCsEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openNPCEditorModal();
            });
        }

        // Close NPCs editor modal
        const closeBtn = this.getElementById('closeNPCsEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeNPCEditorModal();
            });
        }

        // Click outside to close
        const modal = this.getElementById('npcsEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeNPCEditorModal();
                }
            });
        }

        // Modal "Add NPC" button
        const modalAddBtn = this.getElementById('modalAddNPCBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addNPCFromModal();
            });
        }
    }

    /**
     * Open NPC editor modal
     */
    openNPCEditorModal() {
        const modal = this.getElementById('npcsEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderNPCsGrid();
        }
    }

    /**
     * Close NPC editor modal
     */
    closeNPCEditorModal() {
        const modal = this.getElementById('npcsEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Render NPCs grid with thumbnails
     */
    renderNPCsGrid() {
        const gridContainer = document.querySelector('#npcsGridContainer .npcs-grid');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';

        const npcData = this.game.npcSystem.data;
        const npcTypes = Object.keys(npcData.npcTypes);

        npcTypes.forEach(npcType => {
            const npcConfig = npcData.npcTypes[npcType];

            const card = document.createElement('div');
            card.className = 'npc-card';
            card.style.cssText = `
                border: 2px solid #555;
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                background: #2a2a2a;
            `;

            // Thumbnail canvas
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            canvas.style.cssText = `
                width: 100%;
                height: auto;
                image-rendering: pixelated;
                margin-bottom: 5px;
            `;

            // NPC name
            const name = document.createElement('div');
            name.textContent = npcConfig.name;
            name.style.cssText = `
                font-size: 12px;
                color: #fff;
                margin-top: 5px;
            `;

            card.appendChild(canvas);
            card.appendChild(name);

            // Hover effect
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#4CAF50';
                card.style.transform = 'scale(1.05)';
            });
            card.addEventListener('mouseleave', () => {
                if (this.selectedModalNPCType !== npcType) {
                    card.style.borderColor = '#555';
                }
                card.style.transform = 'scale(1)';
            });

            // Click handler
            card.addEventListener('click', () => {
                this.selectNPCType(npcType);

                // Update all cards' border colors
                gridContainer.querySelectorAll('.npc-card').forEach(c => {
                    c.style.borderColor = '#555';
                });
                card.style.borderColor = '#4CAF50';
            });

            gridContainer.appendChild(card);

            // Render thumbnail after card is added to DOM
            this.renderNPCThumbnail(canvas, npcConfig, npcType);
        });
    }

    /**
     * Render NPC thumbnail on canvas
     */
    renderNPCThumbnail(canvas, npcConfig, npcType) {
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const idleAnim = npcConfig.animations.idle;
        const spritePath = `${npcConfig.spriteFolder}/${idleAnim.file}`;

        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate source position (use first frame of idle animation)
            const frameWidth = idleAnim.frameWidth;
            const frameHeight = idleAnim.frameHeight;
            const sx = 0; // First frame
            const sy = 0;

            // Calculate scaling to fit in canvas
            const scale = Math.min(
                canvas.width / frameWidth,
                canvas.height / frameHeight
            ) * 0.8; // 0.8 to add some padding

            const dWidth = frameWidth * scale;
            const dHeight = frameHeight * scale;
            const dx = (canvas.width - dWidth) / 2;
            const dy = (canvas.height - dHeight) / 2;

            // Draw sprite
            ctx.drawImage(
                img,
                sx, sy, frameWidth, frameHeight,
                dx, dy, dWidth, dHeight
            );
        };

        img.onerror = () => {
            // Draw placeholder on error
            ctx.fillStyle = '#444';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', canvas.width / 2, canvas.height / 2);
        };

        img.src = spritePath;
    }

    /**
     * Select NPC type in modal
     */
    selectNPCType(npcType) {
        this.selectedModalNPCType = npcType;
        this.updateModalNPCConfig();
    }

    /**
     * Update modal NPC configuration display
     */
    updateModalNPCConfig() {
        const configDiv = this.getElementById('selectedNPCConfig');
        const noSelectionDiv = this.getElementById('noNPCSelected');
        const typeNameSpan = this.getElementById('selectedNPCTypeName');

        if (this.selectedModalNPCType) {
            const npcConfig = this.game.npcSystem.data.npcTypes[this.selectedModalNPCType];

            if (configDiv) configDiv.style.display = 'block';
            if (noSelectionDiv) noSelectionDiv.style.display = 'none';
            if (typeNameSpan) typeNameSpan.textContent = npcConfig.name;
        } else {
            if (configDiv) configDiv.style.display = 'none';
            if (noSelectionDiv) noSelectionDiv.style.display = 'block';
        }
    }

    /**
     * Add NPC from modal and enable placement mode
     */
    addNPCFromModal() {
        if (!this.selectedModalNPCType) {
            alert('Please select an NPC type first');
            return;
        }

        // Set the NPC type in the NPC system
        this.game.npcSystem.setNPCType(this.selectedModalNPCType);

        // Enable NPC placement mode
        this.game.npcSystem.enableNPCPlacement();

        // Close modal
        this.closeNPCEditorModal();

        // Show feedback
        const npcConfig = this.game.npcSystem.data.npcTypes[this.selectedModalNPCType];
        console.log(`NPC placement mode enabled for ${npcConfig.name}. Click on the map to place.`);
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