/**
 * Handles all enemy-related UI interactions
 */
class EnemyUIHandler extends UIHandler {
    constructor(game, modalHandler) {
        super(game);
        this.modalHandler = modalHandler;
        this.selectedModalEnemyType = null;
    }

    /**
     * Initialize enemy UI event listeners
     */
    initialize() {
        this.setupEnemyControls();
        this.setupEnemiesEditorListeners();
        this.setupEnemyZoneDrawing();
        this.setupEnemyPropertyEditing();
    }

    /**
     * Set up basic enemy controls
     */
    setupEnemyControls() {
        this.addListener('clearEnemiesBtn', 'click', () => {
            if (confirm('Clear all enemies? This cannot be undone.')) {
                this.game.enemySystem.clearAllEnemies();
                this.updateEnemyList();
                this.updateEnemyProperties();
            }
        });
    }

    /**
     * Set up enemy zone drawing controls
     */
    setupEnemyZoneDrawing() {
        // Draw Attraction Zone button
        this.addListener('drawAttractionZone', 'click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                const success = this.game.enemySystem.startAttractionZoneDrawing(selectedEnemy);
                if (success) {
                    // Update button state to show drawing mode is active
                    const button = this.getElementById('drawAttractionZone');
                    if (button) {
                        button.textContent = 'Drawing... (drag on map)';
                        button.classList.add('danger');
                        button.disabled = true;
                    }

                    // Set up a way to reset button state when drawing is finished
                    this.checkAttractionZoneDrawingComplete();

                } else {
                    alert('Failed to start attraction zone drawing. Make sure an enemy is selected.');
                }
            } else {
                alert('Please select an enemy first.');
            }
        });

        // Draw Movement Zone button
        this.addListener('drawMovementZone', 'click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                const success = this.game.enemySystem.startMovementZoneDrawing(selectedEnemy);
                if (success) {
                    // Update button state to show drawing mode is active
                    const button = this.getElementById('drawMovementZone');
                    if (button) {
                        button.textContent = 'Drawing... (drag on map)';
                        button.classList.add('danger');
                        button.disabled = true;
                    }

                    // Set up a way to reset button state when drawing is finished
                    this.checkMovementZoneDrawingComplete();

                } else {
                    alert('Failed to start movement zone drawing. Make sure an enemy is selected.');
                }
            } else {
                alert('Please select an enemy first.');
            }
        });
    }

    /**
     * Set up enemies editor modal event listeners
     */
    setupEnemiesEditorListeners() {
        // Open enemies editor button
        const openBtn = this.getElementById('openEnemiesEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openEnemiesEditorModal();
            });
        }

        // Close enemies editor modal
        const closeBtn = this.getElementById('closeEnemiesEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeEnemiesEditorModal();
            });
        }

        // Click outside to close
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEnemiesEditorModal();
                }
            });
        }

        // Modal "Add Enemy" button
        const modalAddBtn = this.getElementById('modalAddEnemyBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addEnemyFromModal();
            });
        }
    }

    /**
     * Open the enemies editor modal
     */
    openEnemiesEditorModal() {
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderEnemiesGrid();
        }
    }

    /**
     * Close the enemies editor modal
     */
    closeEnemiesEditorModal() {
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selection
        this.selectedModalEnemyType = null;
        this.updateModalEnemyConfig();
    }

    /**
     * Render the enemies grid in the modal
     */
    renderEnemiesGrid() {
        const container = document.querySelector('#enemiesGridContainer .enemies-grid');
        if (!container) return;

        const enemyData = this.game.enemySystem.data;
        const enemies = enemyData.getEnemyTypes();

        let html = '';

        enemies.forEach(enemy => {
            const isSelected = this.selectedModalEnemyType === enemy.id;
            html += `<div class="enemy-grid-item ${isSelected ? 'selected' : ''}" data-enemy-id="${enemy.id}" style="
                cursor: pointer;
                padding: 6px;
                background-color: ${isSelected ? '#2a4a2a' : '#333'};
                border: 2px solid ${isSelected ? '#4CAF50' : 'transparent'};
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                transition: all 0.2s;
                min-height: 145px;
            ">
                <div style="
                    height: 120px;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    overflow: hidden;
                ">
                    <canvas class="enemy-thumbnail" data-enemy-id="${enemy.id}" width="100" height="120" style="image-rendering: pixelated; max-width: 100%; max-height: 100%; background: transparent;"></canvas>
                </div>
                <div style="font-size: 11px; color: #ccc; text-align: center; word-wrap: break-word; width: 100%;">${enemy.name}</div>
            </div>`;
        });

        container.innerHTML = html;

        // Render thumbnails
        this.renderEnemyThumbnails();

        // Add click handlers
        container.querySelectorAll('.enemy-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const enemyId = item.dataset.enemyId;
                this.selectEnemyType(enemyId);
            });
        });
    }

    /**
     * Render enemy thumbnails
     */
    renderEnemyThumbnails() {
        const enemyData = this.game.enemySystem.data;
        const canvases = document.querySelectorAll('.enemy-thumbnail');

        canvases.forEach(canvas => {
            const enemyId = canvas.dataset.enemyId;
            const enemyType = enemyData.enemyTypes[enemyId];

            if (!enemyType) return;

            // Load the idle sprite sheet for this enemy
            const idleAnim = enemyType.animations.idle;
            const spritePath = `${enemyType.spriteFolder}/${idleAnim.file}`;

            const img = new Image();
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;

                // Calculate middle frame
                const middleFrame = Math.floor(idleAnim.frames / 2);
                const frameWidth = idleAnim.frameWidth;
                const frameHeight = idleAnim.frameHeight;
                const sourceX = middleFrame * frameWidth;

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Calculate scaling to fit in 100x120 canvas, maintaining aspect ratio
                const maxWidth = 100;
                const maxHeight = 120;
                let scale = Math.min(maxWidth / frameWidth, maxHeight / frameHeight, 2.5); // Allow up to 2.5x scale

                // Make orc, skeleton, slime, and goblin double size
                if (enemyId === 'orc' || enemyId === 'skeleton' || enemyId === 'slime' || enemyId === 'goblin') {
                    scale *= 2.0;
                }

                const renderWidth = frameWidth * scale;
                const renderHeight = frameHeight * scale;

                // Center the sprite in the canvas
                const offsetX = (maxWidth - renderWidth) / 2;
                const offsetY = (maxHeight - renderHeight) / 2;

                // Handle sprites that face the opposite direction (facingInverted)
                if (enemyType.facingInverted) {
                    ctx.save();
                    ctx.translate(maxWidth, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        img,
                        sourceX, 0, frameWidth, frameHeight,
                        maxWidth - offsetX - renderWidth, offsetY, renderWidth, renderHeight
                    );
                    ctx.restore();
                } else {
                    // Draw the middle frame
                    ctx.drawImage(
                        img,
                        sourceX, 0, frameWidth, frameHeight,
                        offsetX, offsetY, renderWidth, renderHeight
                    );
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load enemy sprite: ${spritePath}`);
            };
            img.src = spritePath;
        });
    }

    /**
     * Select an enemy type in the modal
     */
    selectEnemyType(enemyId) {
        this.selectedModalEnemyType = enemyId;

        // Update visual selection
        document.querySelectorAll('.enemy-grid-item').forEach(item => {
            const isSelected = item.dataset.enemyId === enemyId;
            item.classList.toggle('selected', isSelected);
            item.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            item.style.borderColor = isSelected ? '#4CAF50' : 'transparent';
        });

        // Update configuration panel
        this.updateModalEnemyConfig();
    }

    /**
     * Update modal enemy configuration display
     */
    updateModalEnemyConfig() {
        const configDiv = this.getElementById('selectedEnemyConfig');
        const noSelectionDiv = this.getElementById('noEnemySelected');
        const enemyNameSpan = this.getElementById('selectedEnemyTypeName');

        if (this.selectedModalEnemyType) {
            const enemyType = this.game.enemySystem.data.enemyTypes[this.selectedModalEnemyType];
            if (enemyType) {
                if (configDiv) configDiv.style.display = 'block';
                if (noSelectionDiv) noSelectionDiv.style.display = 'none';
                if (enemyNameSpan) enemyNameSpan.textContent = enemyType.name;
            }
        } else {
            if (configDiv) configDiv.style.display = 'none';
            if (noSelectionDiv) noSelectionDiv.style.display = 'block';
        }
    }

    /**
     * Add enemy from modal configuration
     */
    addEnemyFromModal() {
        if (!this.selectedModalEnemyType) {
            alert('Please select an enemy type first');
            return;
        }

        // Get default values from enemy type definition
        const enemyTypeData = this.game.enemySystem.data.enemyTypes[this.selectedModalEnemyType];

        if (!enemyTypeData) {
            console.error('Enemy type not found:', this.selectedModalEnemyType);
            return;
        }

        // Store pending enemy config in mouseHandler where it will be used
        // Use correct property names: defaultHealth, defaultDamage (not health, damage)
        // Speed defaults to 2 if not specified in type definition
        const config = {
            type: this.selectedModalEnemyType,
            health: enemyTypeData.defaultHealth,
            speed: 2, // Default speed (not in type definition)
            damage: enemyTypeData.defaultDamage
        };

        if (this.game.enemySystem.mouseHandler) {
            this.game.enemySystem.mouseHandler.setPendingEnemyConfig(config);
        }

        // Close modal
        this.closeEnemiesEditorModal();

        // Activate enemy placement mode
        this.game.enemySystem.toggleEnemyPlacement();
    }

    /**
     * Update enemy list UI
     */
    updateEnemyList() {
        const listElement = document.getElementById('enemyList');
        if (!listElement) return;

        listElement.innerHTML = this.game.enemySystem.data.enemies.map(enemy => {
            const isSelected = this.game.enemySystem.getSelectedEnemy() === enemy;
            // Format coordinates safely - show "?" if NaN
            const xPos = !isNaN(enemy.x) && enemy.x !== undefined ? Math.round(enemy.x) : '?';
            const yPos = !isNaN(enemy.y) && enemy.y !== undefined ? Math.round(enemy.y) : '?';
            const hp = !isNaN(enemy.health) && enemy.health !== undefined ? enemy.health : '?';
            const maxHp = !isNaN(enemy.maxHealth) && enemy.maxHealth !== undefined ? enemy.maxHealth : '?';
            const dmg = !isNaN(enemy.damage) && enemy.damage !== undefined ? enemy.damage : '?';

            return `<div class="item ${isSelected ? 'selected' : ''}" data-enemy-id="${enemy.id}">
                <div class="item-name">${enemy.type} (${xPos}, ${yPos})</div>
                <div class="item-details">HP: ${hp}/${maxHp}, DMG: ${dmg}</div>
            </div>`;
        }).join('');

        // Add click listeners to enemy items
        listElement.querySelectorAll('[data-enemy-id]').forEach(item => {
            item.addEventListener('click', () => {
                const enemyId = parseInt(item.dataset.enemyId);
                const enemy = this.game.enemySystem.data.getEnemyById(enemyId);
                if (enemy) {
                    this.game.enemySystem.selectEnemy(enemy);
                    this.updateEnemyProperties();
                    this.updateEnemyList();
                }
            });
        });
    }

    /**
     * Update enemy properties UI
     */
    updateEnemyProperties() {
        const propertiesDiv = document.getElementById('enemyProperties');
        if (!propertiesDiv) return;

        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();

        if (!selectedEnemy) {
            propertiesDiv.style.display = 'none';
            return;
        }

        propertiesDiv.style.display = 'block';

        // Update enemy properties form
        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            // Only update if value is valid (not NaN or undefined)
            if (element && value !== undefined && !isNaN(value)) {
                element.value = value;
            } else if (element) {
                // If value is invalid, clear the field or show 0
                element.value = '';
            }
        };

        updateValue('enemyX', Math.round(selectedEnemy.x));
        updateValue('enemyY', Math.round(selectedEnemy.y));
        updateValue('enemyHealth', selectedEnemy.health);
        updateValue('enemyDamage', selectedEnemy.damage);
        updateValue('enemySpeed', selectedEnemy.speed);
        updateValue('enemySize', selectedEnemy.sizeMultiplier || 1.0);
        updateValue('enemyFleeThreshold', selectedEnemy.fleeHealthThreshold ?? 0.4);

        // Update facing dropdown
        const facingSelect = document.getElementById('enemyFacing');
        if (facingSelect) {
            facingSelect.value = selectedEnemy.initialFacing || 'right';
        }

        // Update checkboxes
        const updateCheckbox = (id, checked) => {
            const element = document.getElementById(id);
            if (element) element.checked = checked;
        };

        updateCheckbox('enemyIsMoving', selectedEnemy.isMoving);
        updateCheckbox('enemyAttractionEnabled', selectedEnemy.attractionZone?.enabled || false);
        updateCheckbox('enemyMovementEnabled', selectedEnemy.movementZone?.enabled || false);

        // Update death drops display
        this.updateEnemyDropsList(selectedEnemy);
    }

    /**
     * Update enemy drops list display
     */
    updateEnemyDropsList(enemy) {
        const dropsList = document.getElementById('enemyDropsList');
        if (!dropsList) return;

        if (!enemy.dropItems || enemy.dropItems.length === 0) {
            dropsList.innerHTML = '<div style="color: #888; font-size: 12px; text-align: center; padding: 10px;">No drops configured</div>';
            return;
        }

        const inventoryItems = this.game.inventoryItemsData ? this.game.inventoryItemsData.getAllItems() : {};

        let html = '';
        enemy.dropItems.forEach((drop, index) => {
            const item = inventoryItems[drop.itemId];
            const itemName = item ? item.name : drop.itemId;
            const chancePercent = Math.round(drop.chance * 100);

            html += `<div style="background-color: #444; padding: 6px; border-radius: 3px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #4CAF50; font-size: 11px;">${itemName}</div>
                    <div style="color: #aaa; font-size: 10px;">Chance: ${chancePercent}% | Qty: ${drop.quantity}</div>
                </div>
                <button class="btn small danger" onclick="window.uiEventHandler.enemyHandler.removeEnemyDrop(${index})" style="padding: 2px 6px; font-size: 10px;">✕</button>
            </div>`;
        });

        dropsList.innerHTML = html;
    }

    /**
     * Remove an enemy drop by index
     */
    removeEnemyDrop(index) {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (selectedEnemy && selectedEnemy.dropItems) {
            selectedEnemy.dropItems.splice(index, 1);
            this.updateEnemyProperties();
        }
    }

    /**
     * Check if attraction zone drawing is complete
     */
    checkAttractionZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingAttractionZone) {
                // Drawing is finished, reset button state
                const button = this.getElementById('drawAttractionZone');
                if (button) {
                    button.textContent = 'Draw Attraction Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new attraction zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
            }
        }, 100); // Check every 100ms
    }

    /**
     * Check if movement zone drawing is complete
     */
    checkMovementZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingMovementZone) {
                // Drawing is finished, reset button state
                const button = this.getElementById('drawMovementZone');
                if (button) {
                    button.textContent = 'Draw Movement Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new movement zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
            }
        }, 100); // Check every 100ms
    }

    /**
     * Set up enemy property editing controls
     */
    setupEnemyPropertyEditing() {
        // Update Enemy button
        this.addListener('updateEnemy', 'click', () => {
            this.updateSelectedEnemy();
        });

        // Delete Enemy button
        this.addListener('deleteEnemy', 'click', () => {
            this.deleteSelectedEnemy();
        });

        // Enemy property input change handlers
        const propertyInputs = [
            'enemyX', 'enemyY', 'enemyHealth', 'enemyDamage', 'enemySpeed', 'enemySize', 'enemyFleeThreshold', 'enemyFacing'
        ];

        propertyInputs.forEach(inputId => {
            const input = this.getElementById(inputId, true); // Silent - optional
            if (input) {
                input.addEventListener('input', () => {
                    // Real-time update as user types
                    this.updateSelectedEnemy();
                });
            }
        });

        // Checkbox handlers
        this.addListener('enemyIsMoving', 'change', (e) => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                selectedEnemy.isMoving = e.target.checked;
                this.updateEnemyList();
            }
        });

        this.addListener('enemyAttractionEnabled', 'change', (e) => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy && selectedEnemy.attractionZone) {
                selectedEnemy.attractionZone.enabled = e.target.checked;
                this.updateEnemyList();
            }
        });

        this.addListener('enemyMovementEnabled', 'change', (e) => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy && selectedEnemy.movementZone) {
                selectedEnemy.movementZone.enabled = e.target.checked;
                this.updateEnemyList();
            }
        });

        // Enemy drop management
        this.addListener('addEnemyDropBtn', 'click', () => {
            this.openDropConfigModal('enemy');
        });

        this.addListener('clearEnemyDropsBtn', 'click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy && confirm('Clear all drops from this enemy?')) {
                selectedEnemy.dropItems = [];
                this.updateEnemyProperties();
            }
        });
    }

    /**
     * Update the selected enemy with values from input fields
     */
    updateSelectedEnemy() {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (!selectedEnemy) return;

        // Get values from inputs - fallback to current values if invalid
        const xInput = parseInt(document.getElementById('enemyX')?.value);
        const yInput = parseInt(document.getElementById('enemyY')?.value);
        const healthInput = parseInt(document.getElementById('enemyHealth')?.value);
        const damageInput = parseInt(document.getElementById('enemyDamage')?.value);
        const speedInput = parseFloat(document.getElementById('enemySpeed')?.value);
        const sizeInput = parseFloat(document.getElementById('enemySize')?.value);
        const fleeThresholdInput = parseFloat(document.getElementById('enemyFleeThreshold')?.value);
        const facingInput = document.getElementById('enemyFacing')?.value;

        // Only use input values if they're valid numbers, otherwise keep current values
        const x = !isNaN(xInput) ? xInput : selectedEnemy.x;
        const y = !isNaN(yInput) ? yInput : selectedEnemy.y;
        const health = !isNaN(healthInput) ? healthInput : selectedEnemy.health;
        const damage = !isNaN(damageInput) ? damageInput : selectedEnemy.damage;
        const speed = !isNaN(speedInput) ? speedInput : selectedEnemy.speed;
        const sizeMultiplier = !isNaN(sizeInput) ? sizeInput : (selectedEnemy.sizeMultiplier || 1.0);
        const fleeHealthThreshold = !isNaN(fleeThresholdInput) ? fleeThresholdInput : (selectedEnemy.fleeHealthThreshold ?? 0.4);
        const initialFacing = facingInput || selectedEnemy.initialFacing || 'right';

        // Update enemy properties
        this.game.enemySystem.updateEnemyProperties(selectedEnemy.id, {
            x: x,
            y: y,
            health: health,
            damage: damage,
            speed: speed,
            sizeMultiplier: sizeMultiplier,
            fleeHealthThreshold: fleeHealthThreshold,
            initialFacing: initialFacing
        });

        // Update UI
        this.updateEnemyList();
    }

    /**
     * Delete the selected enemy
     */
    deleteSelectedEnemy() {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (!selectedEnemy) return;

        if (confirm(`Delete enemy at (${Math.round(selectedEnemy.x)}, ${Math.round(selectedEnemy.y)})?`)) {
            this.game.enemySystem.removeEnemyFromScene(selectedEnemy.id);
            this.updateEnemyList();
            this.updateEnemyProperties();
        }
    }

    /**
     * Open drop configuration modal
     */
    openDropConfigModal(dropContext) {
        // Store the context (enemy or prop)
        this.dropContext = dropContext;

        const modal = document.getElementById('dropConfigModal');
        if (!modal) return;

        // Update modal title
        const title = document.getElementById('dropConfigModalTitle');
        if (title) {
            title.textContent = dropContext === 'enemy' ? 'Configure Enemy Death Drops' : 'Configure Prop Drops';
        }

        // Populate item dropdown
        this.populateDropItemSelect();

        // Show modal
        modal.style.display = 'flex';

        // Set up modal buttons (one-time setup with event handler replacement)
        const confirmBtn = document.getElementById('addDropConfirm');
        const cancelBtn = document.getElementById('cancelDropConfig');

        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', () => {
                this.addDropFromModal();
            });
        }

        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => {
                this.closeDropConfigModal();
            });
        }
    }

    /**
     * Close drop configuration modal
     */
    closeDropConfigModal() {
        const modal = document.getElementById('dropConfigModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Populate drop item select dropdown
     */
    populateDropItemSelect() {
        const select = document.getElementById('dropItemSelect');
        if (!select) return;

        // Get all available inventory items
        const inventoryItems = this.game.inventoryItemsData ? this.game.inventoryItemsData.getAllItems() : {};

        // Clear and populate dropdown
        select.innerHTML = '<option value="">Choose an item...</option>';

        Object.values(inventoryItems).forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }

    /**
     * Add drop from modal configuration
     */
    addDropFromModal() {
        const itemId = document.getElementById('dropItemSelect')?.value;
        const chance = parseInt(document.getElementById('dropChanceInput')?.value) || 40;
        const quantity = parseInt(document.getElementById('dropQuantityInput')?.value) || 1;

        if (!itemId) {
            alert('Please select an item');
            return;
        }

        if (this.dropContext === 'enemy') {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                if (!selectedEnemy.dropItems) {
                    selectedEnemy.dropItems = [];
                }

                selectedEnemy.dropItems.push({
                    itemId: itemId,
                    chance: chance / 100, // Convert percentage to 0-1
                    quantity: quantity
                });

                this.updateEnemyProperties();
            }
        }

        this.closeDropConfigModal();
    }
}