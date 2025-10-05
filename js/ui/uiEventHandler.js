class UIEventHandler {
    constructor(game) {
        this.game = game;
    }

    setupUIListeners() {
        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(true);
        });
        document.getElementById('productionBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(false);
        });
        document.getElementById('toggleDashboardBtn').addEventListener('click', () => {
            this.game.toggleDashboard();
        });

        // Prevent the toggle dashboard button from being triggered by space key
        document.getElementById('toggleDashboardBtn').addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        document.getElementById('cameraModeBtn').addEventListener('click', () => {
            this.game.cameraSystem.toggleMode();
        });

        document.getElementById('focusPlayerBtn').addEventListener('click', () => {
            this.game.cameraSystem.focusOnPlayer(this.game.player);
        });

        document.getElementById('backToDevBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(true);
        });

        window.addEventListener('resize', () => {
            this.game.viewportSystem.handleResize();
        });

        // Player controls event listeners
        this.setupPlayerControlListeners();

        // GUI settings event listeners
        this.setupGUISettingsListeners();

        // Multi-selection and grouping event listeners
        const groupButton = document.getElementById('groupProps');
        if (groupButton) {
            groupButton.addEventListener('click', () => {
            if (this.game.propSystem.selectedProps?.length < 2) {
                alert('Select at least 2 props to create a group');
                return;
            }

            const groupId = this.game.propSystem.groupSelectedProps();
            if (groupId) {
            } else {
                alert('Grouping failed');
            }
            });
        } else {
            console.error('Group button not found!');
        }

        const ungroupButton = document.getElementById('ungroupProps');
        if (ungroupButton) {
            ungroupButton.addEventListener('click', () => {
                this.game.propSystem.ungroupSelectedProps();
            });
        } else {
            console.error('Ungroup button not found!');
        }

        document.getElementById('deleteSelectedProps').addEventListener('click', () => {
            if (this.game.propSystem.selectedProps.length > 0) {
                if (confirm(`Delete ${this.game.propSystem.selectedProps.length} selected props?`)) {
                    this.game.propSystem.deleteSelectedProps();
                }
            } else {
                alert('No props selected');
            }
        });
    }

    setupPlatformEditorListeners() {
        document.getElementById('addPlatform').addEventListener('click', () => {
            this.game.platformSystem.togglePlatformPlacement();
        });

        document.getElementById('updatePlatform').addEventListener('click', () => {
            this.game.platformSystem.updateSelectedPlatform();
        });

        document.getElementById('deletePlatform').addEventListener('click', () => {
            this.game.platformSystem.deleteSelectedPlatform();
        });

        // Draw platform movement zone button
        document.getElementById('drawPlatformMovementZone').addEventListener('click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.startMovementZoneDrawingMode(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Clear platform movement zone button
        document.getElementById('clearPlatformMovementZone').addEventListener('click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.clearMovementZone(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Stop/start platform movement button
        document.getElementById('stopStartPlatformMovement').addEventListener('click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.toggleMovementPause(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Reset platform position button
        document.getElementById('resetPlatformPosition').addEventListener('click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.resetToOriginalPosition(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Platform positioning controls
        document.getElementById('platformPositioning').addEventListener('change', () => {
            this.game.platformSystem.updateSelectedPlatform();
        });

        // Game data export/import is now handled by gameDataSystem in its initialize method

        // Background controls are now handled dynamically in scene properties

        // Viewport controls
        document.getElementById('applyViewport').addEventListener('click', () => {
            this.game.applyViewportSettings();
        });

        document.getElementById('resetViewport').addEventListener('click', () => {
            this.game.resetViewportSettings();
        });

        document.getElementById('viewportModeSelect').addEventListener('change', () => {
            this.game.applyViewportSettings();
        });

        // Props controls (old UI - optional, kept for backward compatibility)
        const addPropBtn = document.getElementById('addPropBtn');
        if (addPropBtn) {
            addPropBtn.addEventListener('click', () => {
                this.game.propSystem.togglePropPlacement();
            });
        }

        // Auto-update size when prop type changes (old UI - optional)
        const propTypeSelect = document.getElementById('propTypeSelect');
        if (propTypeSelect) {
            propTypeSelect.addEventListener('change', (e) => {
                const propType = e.target.value;
                const sizeInput = document.getElementById('propSizeInput');

                if (sizeInput) {
                    // Set default size based on prop type (all default to 1.5 now)
                    const defaultSize = 1.5;
                    sizeInput.value = defaultSize.toFixed(1);
                }
            });
        }

        document.getElementById('clearPropsBtn').addEventListener('click', () => {
            if (confirm('Clear all props? This cannot be undone.')) {
                this.game.propSystem.props = [];
                this.game.propSystem.selectedProp = null;
                this.game.propSystem.updatePropProperties();
            }
        });

        // Inventory Items controls
        const refreshInventoryItemsBtn = document.getElementById('refreshInventoryItems');
        if (refreshInventoryItemsBtn) {
            refreshInventoryItemsBtn.addEventListener('click', () => {
                this.refreshInventoryItemsList();
            });
        }

        const clearInventoryItemsBtn = document.getElementById('clearInventoryItems');
        if (clearInventoryItemsBtn) {
            clearInventoryItemsBtn.addEventListener('click', () => {
                if (confirm('Clear all inventory items? This cannot be undone.')) {
                    this.game.gameDataSystem.clearInventoryItems();
                    this.refreshInventoryItemsList();
                }
            });
        }

        // Lootable controls (old UI - optional, kept for backward compatibility)
        const toggleLootablePlacementBtn = document.getElementById('toggleLootablePlacement');
        if (toggleLootablePlacementBtn) {
            toggleLootablePlacementBtn.addEventListener('click', () => {
                if (this.game.lootableSystem) {
                    this.game.lootableSystem.toggleLootablePlacement();
                }
            });
        }

        const lootableTypeSelect = document.getElementById('lootableTypeSelect');
        if (lootableTypeSelect && this.game.lootableSystem) {
            lootableTypeSelect.addEventListener('change', (e) => {
                this.game.lootableSystem.currentLootableType = e.target.value;
            });
        }

        const clearLootablesBtn = document.getElementById('clearLootablesBtn');
        if (clearLootablesBtn) {
            clearLootablesBtn.addEventListener('click', () => {
                if (confirm('Clear all lootables? This cannot be undone.')) {
                    if (this.game.lootableSystem) {
                        this.game.lootableSystem.lootables = [];
                        this.game.lootableSystem.selectedLootable = null;
                        this.game.lootableSystem.updateLootableList();
                        this.game.lootableSystem.updateLootableProperties();
                    }
                }
            });
        }

        // Enemy controls
        document.getElementById('addEnemyBtn').addEventListener('click', () => {
            console.log('🎯 Add Enemy button clicked');
            this.game.enemySystem.toggleEnemyPlacement();
        });

        document.getElementById('clearEnemiesBtn').addEventListener('click', () => {
            if (confirm('Clear all enemies? This cannot be undone.')) {
                this.game.enemySystem.clearAllEnemies();
                this.updateEnemyList();
                this.updateEnemyProperties();
            }
        });

        // NPC controls
        document.getElementById('addNPCBtn').addEventListener('click', () => {
            console.log('🎯 Add NPC button clicked');
            this.game.npcSystem.toggleNPCPlacement();
        });

        document.getElementById('clearNPCsBtn').addEventListener('click', () => {
            if (confirm('Clear all NPCs? This cannot be undone.')) {
                this.game.npcSystem.clearAllNPCs();
                this.updateNPCList();
                this.updateNPCProperties();
            }
        });

    }

    setupAdditionalListeners() {
        // Prop properties event listeners
        document.getElementById('updateProp').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.selectedProp.x = parseInt(document.getElementById('propX').value);
                this.game.propSystem.selectedProp.y = parseInt(document.getElementById('propY').value);
                this.game.propSystem.selectedProp.isObstacle = document.getElementById('selectedPropObstacle').checked;

                // Update size multiplier
                const newSize = this.parseNumberFromInput(document.getElementById('propSize').value) || 1.0;
                this.game.propSystem.selectedProp.sizeMultiplier = newSize;

                // Remove old width/height properties as they're calculated from sizeMultiplier now
                delete this.game.propSystem.selectedProp.width;
                delete this.game.propSystem.selectedProp.height;
                delete this.game.propSystem.selectedProp.scale;
            }
        });

        document.getElementById('deleteProp').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp && confirm('Delete this prop? This cannot be undone.')) {
                this.game.propSystem.deleteSelectedProp();
                this.game.propSystem.updatePropProperties();
                this.game.propSystem.updatePropList();
            }
        });

        document.getElementById('sendToBackground').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.movePropToBack();
            }
        });

        document.getElementById('bringToFront').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.movePropToFront();
            }
        });

        // Draw prop movement zone button
        document.getElementById('drawPropMovementZone').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.startMovementZoneDrawingMode(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Clear prop movement zone button
        document.getElementById('clearPropMovementZone').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.clearMovementZone(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Reset prop position button
        document.getElementById('resetPropPosition').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.resetToOriginalPosition(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Bind to platform button
        document.getElementById('bindToPlatform').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.startPlatformBinding(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Unbind from platform button
        document.getElementById('unbindFromPlatform').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.unbindFromPlatform(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Alignment button event listeners
        document.getElementById('alignLeft').addEventListener('click', () => {
            this.game.propSystem.data.alignPropsLeft();
            this.game.propSystem.updatePropProperties();
            this.game.propSystem.updatePropList();
        });

        document.getElementById('alignCenter').addEventListener('click', () => {
            this.game.propSystem.data.alignPropsCenter();
            this.game.propSystem.updatePropProperties();
            this.game.propSystem.updatePropList();
        });

        document.getElementById('alignRight').addEventListener('click', () => {
            this.game.propSystem.data.alignPropsRight();
            this.game.propSystem.updatePropProperties();
            this.game.propSystem.updatePropList();
        });

        document.getElementById('alignTop').addEventListener('click', () => {
            this.game.propSystem.data.alignPropsTop();
            this.game.propSystem.updatePropProperties();
            this.game.propSystem.updatePropList();
        });

        document.getElementById('alignBottom').addEventListener('click', () => {
            this.game.propSystem.data.alignPropsBottom();
            this.game.propSystem.updatePropProperties();
            this.game.propSystem.updatePropList();
        });

        // Drop configuration event listeners
        document.getElementById('addPropDropBtn').addEventListener('click', () => {
            this.showDropConfigModal();
        });

        document.getElementById('clearPropDropsBtn').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp && confirm('Clear all drops for this prop?')) {
                delete this.game.propSystem.selectedProp.dropItems;
                this.game.propSystem.manager.updateDropConfigurationUI();
                console.log(`🎁 Cleared all drops for prop ${this.game.propSystem.selectedProp.id}`);
            }
        });

        // Drop configuration modal event listeners
        document.getElementById('closeDropConfigModal').addEventListener('click', () => {
            document.getElementById('dropConfigModal').style.display = 'none';
        });

        document.getElementById('cancelDropConfig').addEventListener('click', () => {
            document.getElementById('dropConfigModal').style.display = 'none';
        });

        document.getElementById('addDropConfirm').addEventListener('click', () => {
            // Check if this is for enemy or prop drops
            if (this._isEnemyDropModal) {
                this.addDropToSelectedEnemy();
            } else {
                this.addDropToSelectedProp();
            }
        });

        // Enemy drop configuration event listeners
        document.getElementById('addEnemyDropBtn').addEventListener('click', () => {
            this.showEnemyDropConfigModal();
        });

        document.getElementById('clearEnemyDropsBtn').addEventListener('click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy && confirm('Clear all drops for this enemy?')) {
                delete selectedEnemy.dropItems;
                this.updateEnemyDropConfigurationUI(selectedEnemy);
                console.log(`🎁 Cleared all drops for enemy ${selectedEnemy.id}`);
            }
        });

        // Enemy properties event listeners
        document.getElementById('updateEnemy').addEventListener('click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                selectedEnemy.x = parseInt(document.getElementById('enemyX').value);
                selectedEnemy.y = parseInt(document.getElementById('enemyY').value);
                selectedEnemy.maxHealth = parseInt(document.getElementById('enemyHealth').value);
                selectedEnemy.health = selectedEnemy.maxHealth; // Reset current health to max
                selectedEnemy.damage = parseInt(document.getElementById('enemyDamage').value);
                selectedEnemy.speed = this.parseNumberFromInput(document.getElementById('enemySpeed').value);
                selectedEnemy.isMoving = document.getElementById('enemyIsMoving').checked;
                selectedEnemy.attractionZone.enabled = document.getElementById('enemyAttractionEnabled').checked;
                selectedEnemy.movementZone.enabled = document.getElementById('enemyMovementEnabled').checked;

                this.updateEnemyList();
            }
        });

        document.getElementById('deleteEnemy').addEventListener('click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy && confirm('Delete this enemy? This cannot be undone.')) {
                this.game.enemySystem.removeEnemyFromScene(selectedEnemy.id);
                this.updateEnemyList();
                this.updateEnemyProperties();
            }
        });

        document.getElementById('drawAttractionZone').addEventListener('click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                const success = this.game.enemySystem.startAttractionZoneDrawing(selectedEnemy);
                if (success) {
                    // Update button state to show drawing mode is active
                    const button = document.getElementById('drawAttractionZone');
                    button.textContent = 'Drawing... (drag on map)';
                    button.classList.add('danger');
                    button.disabled = true;

                    // Set up a way to reset button state when drawing is finished
                    this.checkAttractionZoneDrawingComplete();

                    console.log('🎯 Started attraction zone drawing mode for enemy', selectedEnemy.id);
                } else {
                    alert('Failed to start attraction zone drawing. Make sure an enemy is selected.');
                }
            } else {
                alert('Please select an enemy first.');
            }
        });

        document.getElementById('drawMovementZone').addEventListener('click', () => {
            const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
            if (selectedEnemy) {
                const success = this.game.enemySystem.startMovementZoneDrawing(selectedEnemy);
                if (success) {
                    // Update button state to show drawing mode is active
                    const button = document.getElementById('drawMovementZone');
                    button.textContent = 'Drawing... (drag on map)';
                    button.classList.add('danger');
                    button.disabled = true;

                    // Set up a way to reset button state when drawing is finished
                    this.checkMovementZoneDrawingComplete();

                    console.log('🎯 Started movement zone drawing mode for enemy', selectedEnemy.id);
                } else {
                    alert('Failed to start movement zone drawing. Make sure an enemy is selected.');
                }
            } else {
                alert('Please select an enemy first.');
            }
        });

        // Chest Inventory event listeners
        this.setupChestInventoryListeners();

        // Context menu event listeners
    }

    checkAttractionZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingAttractionZone) {
                // Drawing is finished, reset button state
                const button = document.getElementById('drawAttractionZone');
                if (button) {
                    button.textContent = 'Draw Attraction Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new attraction zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
                console.log('🎯 Attraction zone drawing completed, button reset');
            }
        }, 100); // Check every 100ms
    }

    checkMovementZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingMovementZone) {
                // Drawing is finished, reset button state
                const button = document.getElementById('drawMovementZone');
                if (button) {
                    button.textContent = 'Draw Movement Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new movement zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
                console.log('🎯 Movement zone drawing completed, button reset');
            }
        }, 100); // Check every 100ms
    }

    setupSceneEditorListeners() {
        // Scene management controls
        document.getElementById('createSceneBtn').addEventListener('click', () => {
            const name = prompt('Scene name:', 'New Scene');
            const description = prompt('Scene description:', '');
            if (name !== null) {
                this.game.sceneSystem.createScene(name, description);
            }
        });

        document.getElementById('saveSceneBtn').addEventListener('click', () => {
            const spinner = document.getElementById('saveSpinner');
            const overlay = document.getElementById('sceneSavedOverlay');
            spinner.style.display = 'inline-block';

            // Use setTimeout to ensure spinner shows before save operation
            setTimeout(() => {
                this.game.sceneSystem.saveScenes();
                spinner.style.display = 'none';

                // Show overlay briefly
                overlay.style.display = 'flex';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1500);
            }, 10);
        });

        // Scene property inputs - use onchange events for real-time updates
        const sceneNameInput = document.getElementById('sceneName');
        if (sceneNameInput) {
            sceneNameInput.addEventListener('change', () => {
                this.game.sceneSystem.updateSceneName(sceneNameInput.value);
            });
        }

        const sceneDescInput = document.getElementById('sceneDescription');
        if (sceneDescInput) {
            sceneDescInput.addEventListener('change', () => {
                this.game.sceneSystem.updateSceneDescription(sceneDescInput.value);
            });
        }

        const playerStartX = document.getElementById('playerStartX');
        const playerStartY = document.getElementById('playerStartY');
        if (playerStartX && playerStartY) {
            const updatePlayerStart = () => {
                this.game.sceneSystem.updatePlayerStart();
            };
            playerStartX.addEventListener('change', updatePlayerStart);
            playerStartY.addEventListener('change', updatePlayerStart);
        }

        // NPC properties event listeners
        document.getElementById('updateNPC').addEventListener('click', () => {
            const selectedNPC = this.game.npcSystem.getSelectedNPC();
            if (selectedNPC) {
                selectedNPC.x = parseInt(document.getElementById('npcX').value);
                selectedNPC.y = parseInt(document.getElementById('npcY').value);
                selectedNPC.facing = document.getElementById('npcFacing').value;
                selectedNPC.interactionRadius = parseInt(document.getElementById('npcInteractionRadius').value);
                selectedNPC.canInteract = document.getElementById('npcCanInteract').checked;

                this.updateNPCList();
            }
        });

        document.getElementById('deleteNPC').addEventListener('click', () => {
            const selectedNPC = this.game.npcSystem.getSelectedNPC();
            if (selectedNPC && confirm('Delete this NPC? This cannot be undone.')) {
                this.game.npcSystem.removeNPCFromScene(selectedNPC.id);
                this.updateNPCList();
                this.updateNPCProperties();
            }
        });

    }

    // Enemy UI methods
    updateEnemyList() {
        const listElement = document.getElementById('enemyList');
        if (!listElement) return;

        listElement.innerHTML = this.game.enemySystem.data.enemies.map(enemy => {
            const isSelected = this.game.enemySystem.getSelectedEnemy() === enemy;
            return `<div class="item ${isSelected ? 'selected' : ''}" data-enemy-id="${enemy.id}">
                <div class="item-name">${enemy.type} (${Math.round(enemy.x)}, ${Math.round(enemy.y)})</div>
                <div class="item-details">HP: ${enemy.health}/${enemy.maxHealth}, DMG: ${enemy.damage}</div>
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

    updateEnemyProperties() {
        const propertiesDiv = document.getElementById('enemyProperties');
        if (!propertiesDiv) return;

        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (selectedEnemy) {
            propertiesDiv.style.display = 'block';

            // Update input values
            const xInput = document.getElementById('enemyX');
            const yInput = document.getElementById('enemyY');
            const healthInput = document.getElementById('enemyHealth');
            const damageInput = document.getElementById('enemyDamage');
            const speedInput = document.getElementById('enemySpeed');
            const isMovingInput = document.getElementById('enemyIsMoving');
            const attractionEnabledInput = document.getElementById('enemyAttractionEnabled');
            const movementEnabledInput = document.getElementById('enemyMovementEnabled');

            if (xInput) xInput.value = Math.round(selectedEnemy.x);
            if (yInput) yInput.value = Math.round(selectedEnemy.y);
            if (healthInput) healthInput.value = selectedEnemy.maxHealth;
            if (damageInput) damageInput.value = selectedEnemy.damage;
            if (speedInput) speedInput.value = selectedEnemy.speed;
            if (isMovingInput) isMovingInput.checked = selectedEnemy.isMoving;
            if (attractionEnabledInput) attractionEnabledInput.checked = selectedEnemy.attractionZone.enabled;
            if (movementEnabledInput) movementEnabledInput.checked = selectedEnemy.movementZone.enabled;

            // Update enemy drop configuration UI
            this.updateEnemyDropConfigurationUI(selectedEnemy);
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    // NPC UI methods
    updateNPCList() {
        const listElement = document.getElementById('npcList');
        if (!listElement) return;

        listElement.innerHTML = this.game.npcSystem.data.npcs.map(npc => {
            const isSelected = this.game.npcSystem.getSelectedNPC() === npc;
            return `<div class="item ${isSelected ? 'selected' : ''}" data-npc-id="${npc.id}">
                <div class="item-name">${npc.type} (${Math.round(npc.x)}, ${Math.round(npc.y)})</div>
                <div class="item-details">ID: ${npc.id}, Facing: ${npc.facing}</div>
            </div>`;
        }).join('');

        // Add click listeners to NPC items
        listElement.querySelectorAll('[data-npc-id]').forEach(item => {
            item.addEventListener('click', () => {
                const npcId = parseInt(item.dataset.npcId);
                const npc = this.game.npcSystem.data.getNPCById(npcId);
                if (npc) {
                    this.game.npcSystem.selectNPC(npc);
                    this.updateNPCProperties();
                    this.updateNPCList();
                }
            });
        });
    }

    updateNPCProperties() {
        const propertiesDiv = document.getElementById('npcProperties');
        if (!propertiesDiv) return;

        const selectedNPC = this.game.npcSystem.getSelectedNPC();
        if (selectedNPC) {
            propertiesDiv.style.display = 'block';

            // Update input values
            const xInput = document.getElementById('npcX');
            const yInput = document.getElementById('npcY');
            const facingInput = document.getElementById('npcFacing');
            const interactionRadiusInput = document.getElementById('npcInteractionRadius');
            const canInteractInput = document.getElementById('npcCanInteract');

            if (xInput) xInput.value = Math.round(selectedNPC.x);
            if (yInput) yInput.value = Math.round(selectedNPC.y);
            if (facingInput) facingInput.value = selectedNPC.facing;
            if (interactionRadiusInput) interactionRadiusInput.value = selectedNPC.interactionRadius;
            if (canInteractInput) canInteractInput.checked = selectedNPC.canInteract;
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    setupPlayerControlListeners() {
        // Load current player values into the controls
        this.loadPlayerValues();

        // Apply Settings button
        const applyBtn = document.getElementById('applyPlayerSettings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyPlayerSettings();
            });
        }

        // Reset Settings button
        const resetBtn = document.getElementById('resetPlayerSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetPlayerSettings();
            });
        }

        // Full Heal button
        const healBtn = document.getElementById('healPlayer');
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                this.healPlayer();
            });
        }

        // Restore Stamina button
        const staminaBtn = document.getElementById('restoreStamina');
        if (staminaBtn) {
            staminaBtn.addEventListener('click', () => {
                this.restoreStamina();
            });
        }

        // Real-time updates on input changes
        const inputs = [
            'playerMaxHealth', 'playerHealthRegen', 'playerMaxStamina', 'playerStaminaRegen',
            'playerRunningCost', 'playerJumpCost', 'playerAttackDamage', 'playerWalkSpeed',
            'playerRunSpeed', 'playerJumpForce'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    // Apply immediately for responsive feedback
                    this.applyPlayerSettings();
                });
            }
        });
    }

    loadPlayerValues() {
        console.log('🔄 loadPlayerValues() called');
        if (!this.game.playerSystem || !this.game.playerSystem.data) {
            console.warn('⚠️ Player system not available for loading values');
            return;
        }

        const player = this.game.playerSystem.data;
        console.log('🔄 Current player data:', {
            maxHealth: player.maxHealth,
            healthRegenRate: player.healthRegenRate,
            maxStamina: player.maxStamina,
            staminaRegenRate: player.staminaRegenRate,
            attackDamage: player.attackDamage,
            speed: player.speed,
            runSpeed: player.runSpeed,
            jumpPower: player.jumpPower
        });

        // Try to load saved settings first, then fall back to current player values
        let settings = null;
        if (this.game.gameDataSystem && this.game.gameDataSystem.gameData.playerSettings) {
            settings = this.game.gameDataSystem.gameData.playerSettings;
            console.log('🔄 Found saved settings in gameData:', settings);
        } else {
            console.log('🔄 No saved settings found in gameData - using player values');
        }

        // Load values into inputs (use saved settings if available, otherwise current player values)
        const maxHealthInput = document.getElementById('playerMaxHealth');
        const healthRegenInput = document.getElementById('playerHealthRegen');
        const maxStaminaInput = document.getElementById('playerMaxStamina');
        const staminaRegenInput = document.getElementById('playerStaminaRegen');
        const runningCostInput = document.getElementById('playerRunningCost');
        const jumpCostInput = document.getElementById('playerJumpCost');
        const attackDamageInput = document.getElementById('playerAttackDamage');
        const walkSpeedInput = document.getElementById('playerWalkSpeed');
        const runSpeedInput = document.getElementById('playerRunSpeed');
        const jumpForceInput = document.getElementById('playerJumpForce');

        const valuesToLoad = {
            maxHealth: settings?.maxHealth || player.maxHealth || 100,
            healthRegen: settings?.healthRegen || player.healthRegenRate || 0,
            maxStamina: settings?.maxStamina || player.maxStamina || 100,
            staminaRegen: settings?.staminaRegen || player.staminaRegenRate || 5,
            runningCost: settings?.runningCost || player.runningCost || 1.5,
            jumpCost: settings?.jumpCost || player.jumpCost || 10,
            attackDamage: settings?.attackDamage || player.attackDamage || 25,
            walkSpeed: settings?.walkSpeed || player.speed || 5,
            runSpeed: settings?.runSpeed || player.runSpeed || 10,
            jumpForce: settings?.jumpForce || Math.abs(player.jumpPower) || 15
        };

        console.log('🔄 Values being loaded into UI inputs:', valuesToLoad);

        // Ensure all values use period as decimal separator for consistent parsing
        if (maxHealthInput) maxHealthInput.value = this.formatNumberForInput(valuesToLoad.maxHealth);
        if (healthRegenInput) healthRegenInput.value = this.formatNumberForInput(valuesToLoad.healthRegen);
        if (maxStaminaInput) maxStaminaInput.value = this.formatNumberForInput(valuesToLoad.maxStamina);
        if (staminaRegenInput) staminaRegenInput.value = this.formatNumberForInput(valuesToLoad.staminaRegen);
        if (runningCostInput) runningCostInput.value = this.formatNumberForInput(valuesToLoad.runningCost);
        if (jumpCostInput) jumpCostInput.value = this.formatNumberForInput(valuesToLoad.jumpCost);
        if (attackDamageInput) attackDamageInput.value = this.formatNumberForInput(valuesToLoad.attackDamage);
        if (walkSpeedInput) walkSpeedInput.value = this.formatNumberForInput(valuesToLoad.walkSpeed);
        if (runSpeedInput) runSpeedInput.value = this.formatNumberForInput(valuesToLoad.runSpeed);
        if (jumpForceInput) jumpForceInput.value = this.formatNumberForInput(valuesToLoad.jumpForce);

        console.log('✅ Player values loaded into UI inputs');
    }

    // Helper method to ensure consistent decimal format (period) for input fields
    formatNumberForInput(value) {
        if (value === null || value === undefined) return '';
        // Convert to number first, then to string to ensure consistent format
        const num = parseFloat(value.toString().replace(',', '.'));
        if (isNaN(num)) return '';
        // Force English locale formatting to ensure period decimal separator
        return num.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 10 });
    }

    // Helper method to parse number from input, handling both comma and period separators
    parseNumberFromInput(value) {
        if (!value) return 0;
        // Replace comma with period for consistent parsing
        const normalizedValue = value.toString().replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? 0 : parsed;
    }

    applyPlayerSettings() {
        if (!this.game.playerSystem || !this.game.playerSystem.data) return;

        const player = this.game.playerSystem.data;

        // Get values from inputs using locale-safe parsing
        const maxHealth = this.parseNumberFromInput(document.getElementById('playerMaxHealth')?.value) || 100;
        const healthRegen = this.parseNumberFromInput(document.getElementById('playerHealthRegen')?.value) || 0;
        const maxStamina = this.parseNumberFromInput(document.getElementById('playerMaxStamina')?.value) || 100;
        const staminaRegen = this.parseNumberFromInput(document.getElementById('playerStaminaRegen')?.value) || 5;
        const runningCost = this.parseNumberFromInput(document.getElementById('playerRunningCost')?.value) || 1.5;
        const jumpCost = this.parseNumberFromInput(document.getElementById('playerJumpCost')?.value) || 10;
        const attackDamage = this.parseNumberFromInput(document.getElementById('playerAttackDamage')?.value) || 25;
        const walkSpeed = this.parseNumberFromInput(document.getElementById('playerWalkSpeed')?.value) || 5;
        const runSpeed = this.parseNumberFromInput(document.getElementById('playerRunSpeed')?.value) || 10;
        const jumpForce = this.parseNumberFromInput(document.getElementById('playerJumpForce')?.value) || 15;


        // Apply the values to player
        player.maxHealth = maxHealth;
        player.healthRegenRate = healthRegen;
        player.maxStamina = maxStamina;
        player.staminaRegenRate = staminaRegen;
        player.runningCost = runningCost;
        player.jumpCost = jumpCost;
        player.speed = walkSpeed;
        player.jumpPower = -Math.abs(jumpForce); // Jump power is negative
        player.runSpeed = runSpeed;
        player.attackDamage = attackDamage;

        // Update current health/stamina if they exceed new maximums
        if (player.health > maxHealth) player.health = maxHealth;
        if (player.stamina > maxStamina) player.stamina = maxStamina;

        // Save to localStorage via gameDataSystem
        const playerSettings = {
            maxHealth,
            healthRegen,
            maxStamina,
            staminaRegen,
            runningCost,
            jumpCost,
            attackDamage,
            walkSpeed,
            runSpeed,
            jumpForce
        };

        if (this.game.gameDataSystem) {
            console.log('🎮 About to save player settings:', playerSettings);
            this.game.gameDataSystem.updatePlayerSettings(playerSettings);
            console.log('🎮 Player settings save completed');
        } else {
            console.error('❌ gameDataSystem not available for saving player settings');
        }

        console.log('🎮 Player settings applied and saved:', playerSettings);
    }

    resetPlayerSettings() {
        // Reset to default values
        document.getElementById('playerMaxHealth').value = 100;
        document.getElementById('playerHealthRegen').value = 0;
        document.getElementById('playerMaxStamina').value = 100;
        document.getElementById('playerStaminaRegen').value = 5;
        document.getElementById('playerRunningCost').value = 1.5;
        document.getElementById('playerJumpCost').value = 10;
        document.getElementById('playerAttackDamage').value = 25;
        document.getElementById('playerWalkSpeed').value = 5;
        document.getElementById('playerRunSpeed').value = 10;
        document.getElementById('playerJumpForce').value = 15;

        // Apply the reset values
        this.applyPlayerSettings();

        console.log('🔄 Player settings reset to defaults');
    }

    setupGUISettingsListeners() {
        // Load current GUI values into the controls
        this.loadGUIValues();

        // Apply Settings button
        const applyBtn = document.getElementById('applyGUISettings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyGUISettings();
            });
        }

        // Reset Settings button
        const resetBtn = document.getElementById('resetGUISettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGUISettings();
            });
        }

        // Real-time updates on theme selection changes
        const themeSelect = document.getElementById('guiThemeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                // Apply immediately for responsive feedback
                this.applyGUISettings();
            });
        }
    }

    loadGUIValues() {
        const gameData = this.game.gameDataSystem ? this.game.gameDataSystem.gameData : null;
        const guiSettings = gameData?.GUISettings;

        // Load theme selection
        const themeSelect = document.getElementById('guiThemeSelect');
        if (themeSelect) {
            themeSelect.value = guiSettings?.theme || 'none';
        }
    }

    applyGUISettings() {
        // Get values from inputs
        const theme = document.getElementById('guiThemeSelect')?.value || 'none';

        // Save to localStorage via gameDataSystem
        const guiSettings = { theme };

        if (this.game.gameDataSystem) {
            this.game.gameDataSystem.updateGUISettings(guiSettings);
            console.log('🎨 GUI settings applied:', guiSettings);
        }
    }

    resetGUISettings() {
        // Reset to default values
        document.getElementById('guiThemeSelect').value = 'none';

        // Apply the reset values
        this.applyGUISettings();

        console.log('🔄 GUI settings reset to defaults');
    }

    healPlayer() {
        if (!this.game.playerSystem || !this.game.playerSystem.data) return;

        const player = this.game.playerSystem.data;
        player.health = player.maxHealth;
        player.isDead = false;
        player.deathTimer = 0;

        console.log('🩹 Player fully healed!');
    }

    restoreStamina() {
        if (!this.game.playerSystem || !this.game.playerSystem.data) return;

        const player = this.game.playerSystem.data;
        player.stamina = player.maxStamina;
        player.staminaExhaustedTimer = 0;

        console.log('⚡ Player stamina restored!');
    }

    // Refresh the inventory items list display
    refreshInventoryItemsList() {
        const listElement = document.getElementById('inventoryItemsList');
        if (!listElement) return;

        // Get hardcoded inventory items from the data class
        const inventoryItemsData = this.game.inventoryItemsData ? this.game.inventoryItemsData.getAllItems() : {};
        const inventoryItems = Object.values(inventoryItemsData);

        if (inventoryItems.length === 0) {
            listElement.innerHTML = 'No inventory items defined yet. Use the sprite editor to add items.';
            return;
        }

        let html = '';
        inventoryItems.forEach((item, index) => {
            html += `<div style="margin-bottom: 8px; padding: 6px; background-color: #333; border-radius: 3px;">
                <div style="font-weight: bold; color: #4CAF50;">${item.name}</div>
                <div style="color: #aaa; font-size: 11px;">
                    ID: ${item.id} | Type: ${item.type} |
                    Sprite: ${item.sprite?.x || 0}, ${item.sprite?.y || 0}, ${item.sprite?.width || 0}x${item.sprite?.height || 0}
                </div>
                <div style="color: #ccc; font-size: 11px; margin-top: 2px;">${item.description || 'No description'}</div>
            </div>`;
        });

        listElement.innerHTML = html;
        console.log(`📦 Inventory items list refreshed: ${inventoryItems.length} items`);
    }

    // Setup chest inventory modal and selection event listeners
    setupChestInventoryListeners() {
        // Current chest being edited
        this.currentChestBeingEdited = null;
        this.selectedInventoryItemForChest = null;

        // Chest inventory button
        const chestInventoryBtn = document.getElementById('chestInventoryBtn');
        if (chestInventoryBtn) {
            chestInventoryBtn.addEventListener('click', () => {
                this.openChestInventoryModal();
            });
        }

        // Close chest inventory modal
        const closeChestInventoryModal = document.getElementById('closeChestInventoryModal');
        if (closeChestInventoryModal) {
            closeChestInventoryModal.addEventListener('click', () => {
                this.closeChestInventoryModal();
            });
        }

        // Add item to chest button
        const addItemToChestBtn = document.getElementById('addItemToChestBtn');
        if (addItemToChestBtn) {
            addItemToChestBtn.addEventListener('click', () => {
                this.openInventorySelectionModal();
            });
        }

        // Clear chest inventory button
        const clearChestInventoryBtn = document.getElementById('clearChestInventoryBtn');
        if (clearChestInventoryBtn) {
            clearChestInventoryBtn.addEventListener('click', () => {
                this.clearChestInventory();
            });
        }

        // Close inventory selection modal
        const closeInventorySelectionModal = document.getElementById('closeInventorySelectionModal');
        if (closeInventorySelectionModal) {
            closeInventorySelectionModal.addEventListener('click', () => {
                this.closeInventorySelectionModal();
            });
        }

        // Cancel item selection button
        const cancelItemSelectionBtn = document.getElementById('cancelItemSelectionBtn');
        if (cancelItemSelectionBtn) {
            cancelItemSelectionBtn.addEventListener('click', () => {
                this.closeInventorySelectionModal();
            });
        }

        // Add selected item button
        const addSelectedItemBtn = document.getElementById('addSelectedItemBtn');
        if (addSelectedItemBtn) {
            addSelectedItemBtn.addEventListener('click', () => {
                this.addSelectedItemToChest();
            });
        }

        // Search functionality for inventory items
        const inventorySearchInput = document.getElementById('inventorySearchInput');
        if (inventorySearchInput) {
            inventorySearchInput.addEventListener('input', (e) => {
                this.filterInventoryItems(e.target.value);
            });
        }

        // Modal click outside to close
        const chestInventoryModal = document.getElementById('chestInventoryModal');
        if (chestInventoryModal) {
            chestInventoryModal.addEventListener('click', (e) => {
                if (e.target === chestInventoryModal) {
                    this.closeChestInventoryModal();
                }
            });
        }

        const inventorySelectionModal = document.getElementById('inventorySelectionModal');
        if (inventorySelectionModal) {
            inventorySelectionModal.addEventListener('click', (e) => {
                if (e.target === inventorySelectionModal) {
                    this.closeInventorySelectionModal();
                }
            });
        }

        // Game Settings Modal handlers
        const gameSettingsBtn = document.getElementById('gameSettingsBtn');
        if (gameSettingsBtn) {
            gameSettingsBtn.addEventListener('click', () => {
                const modal = document.getElementById('gameSettingsModal');
                if (modal) {
                    modal.style.display = 'flex';
                    // Refresh inventory items list when modal opens
                    this.refreshInventoryItemsList();
                }
            });
        }

        const closeGameSettingsModal = document.getElementById('closeGameSettingsModal');
        if (closeGameSettingsModal) {
            closeGameSettingsModal.addEventListener('click', () => {
                this.closeGameSettingsModal();
            });
        }

        const gameSettingsModal = document.getElementById('gameSettingsModal');
        if (gameSettingsModal) {
            gameSettingsModal.addEventListener('click', (e) => {
                if (e.target === gameSettingsModal) {
                    this.closeGameSettingsModal();
                }
            });
        }
    }

    // Open chest inventory editor modal
    openChestInventoryModal() {
        const selectedProp = this.game.propSystem.selectedProp;
        if (!selectedProp || !selectedProp.isChest) {
            alert('Please select a chest first');
            return;
        }

        this.currentChestBeingEdited = selectedProp;

        // Update modal content
        const chestIdElement = document.getElementById('chestInventoryModalId');
        if (chestIdElement) {
            chestIdElement.textContent = `Chest #${selectedProp.id}`;
        }

        // Show the modal
        const modal = document.getElementById('chestInventoryModal');
        if (modal) {
            modal.style.display = 'flex';
        }

        // Refresh the chest items list
        this.refreshChestItemsList();
    }

    // Close chest inventory modal
    closeChestInventoryModal() {
        const modal = document.getElementById('chestInventoryModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentChestBeingEdited = null;
    }

    // Close game settings modal
    closeGameSettingsModal() {
        const modal = document.getElementById('gameSettingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Refresh the items list in the chest
    refreshChestItemsList() {
        const listElement = document.getElementById('chestItemsList');
        if (!listElement || !this.currentChestBeingEdited) return;

        const chestInventory = this.currentChestBeingEdited.chestInventory || [];

        if (chestInventory.length === 0) {
            listElement.innerHTML = 'No items in chest';
            return;
        }

        let html = '';
        chestInventory.forEach((item, index) => {
            html += `<div style="margin-bottom: 8px; padding: 6px; background-color: #333; border-radius: 3px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; color: #4CAF50;">${item.name}</div>
                    <div style="color: #aaa; font-size: 11px;">Type: ${item.type} | Quantity: ${item.quantity || 1}</div>
                    <div style="color: #ccc; font-size: 11px; margin-top: 2px;">${item.description || 'No description'}</div>
                </div>
                <button class="btn small danger" onclick="uiEventHandler.removeItemFromChest(${index})" style="margin-left: 10px;">Remove</button>
            </div>`;
        });

        listElement.innerHTML = html;
    }

    // Remove item from chest
    removeItemFromChest(index) {
        if (!this.currentChestBeingEdited || !this.currentChestBeingEdited.chestInventory) return;

        this.currentChestBeingEdited.chestInventory.splice(index, 1);
        this.refreshChestItemsList();
        console.log(`📦 Removed item from chest #${this.currentChestBeingEdited.id}`);
    }

    // Clear all items from chest
    clearChestInventory() {
        if (!this.currentChestBeingEdited) return;

        if (confirm('Clear all items from this chest? This cannot be undone.')) {
            this.currentChestBeingEdited.chestInventory = [];
            this.refreshChestItemsList();
            console.log(`📦 Cleared all items from chest #${this.currentChestBeingEdited.id}`);
        }
    }

    // Open inventory selection modal
    openInventorySelectionModal() {
        const modal = document.getElementById('inventorySelectionModal');
        if (modal) {
            modal.style.display = 'flex';
        }

        // Clear search and refresh items list
        const searchInput = document.getElementById('inventorySearchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        this.refreshAvailableInventoryItems();

        // Disable add button initially
        const addBtn = document.getElementById('addSelectedItemBtn');
        if (addBtn) {
            addBtn.disabled = true;
        }

        this.selectedInventoryItemForChest = null;
    }

    // Close inventory selection modal
    closeInventorySelectionModal() {
        const modal = document.getElementById('inventorySelectionModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.selectedInventoryItemForChest = null;
    }

    // Refresh available inventory items in selection modal
    refreshAvailableInventoryItems(searchTerm = '') {
        const listElement = document.getElementById('availableInventoryItemsList');
        if (!listElement) return;

        // Get all available inventory items
        const inventoryItemsData = this.game.inventoryItemsData ? this.game.inventoryItemsData.getAllItems() : {};
        const inventoryItems = Object.values(inventoryItemsData);

        // Filter by search term if provided
        const filteredItems = searchTerm ?
            inventoryItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            ) : inventoryItems;

        if (filteredItems.length === 0) {
            listElement.innerHTML = searchTerm ? 'No items match your search' : 'No inventory items available';
            return;
        }

        let html = '';
        filteredItems.forEach((item) => {
            html += `<div class="inventory-item-option" data-item-id="${item.id}" style="margin-bottom: 8px; padding: 8px; background-color: #333; border-radius: 3px; cursor: pointer; border: 2px solid transparent;">
                <div style="font-weight: bold; color: #4CAF50;">${item.name}</div>
                <div style="color: #aaa; font-size: 11px;">
                    Type: ${item.type} | Rarity: ${item.rarity} | Value: ${item.value || 0}
                </div>
                <div style="color: #ccc; font-size: 11px; margin-top: 2px;">${item.description || 'No description'}</div>
            </div>`;
        });

        listElement.innerHTML = html;

        // Add click handlers to items
        const itemOptions = listElement.querySelectorAll('.inventory-item-option');
        itemOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectInventoryItemForChest(option.dataset.itemId);
            });
        });
    }

    // Filter inventory items by search term
    filterInventoryItems(searchTerm) {
        this.refreshAvailableInventoryItems(searchTerm);
    }

    // Select an inventory item for adding to chest
    selectInventoryItemForChest(itemId) {
        // Get the item data
        const itemData = this.game.inventoryItemsData ? this.game.inventoryItemsData.getItem(itemId) : null;
        if (!itemData) return;

        this.selectedInventoryItemForChest = itemData;

        // Update visual selection
        const itemOptions = document.querySelectorAll('.inventory-item-option');
        itemOptions.forEach(option => {
            if (option.dataset.itemId === itemId) {
                option.style.border = '2px solid #4CAF50';
                option.style.backgroundColor = '#2a4a2a';
            } else {
                option.style.border = '2px solid transparent';
                option.style.backgroundColor = '#333';
            }
        });

        // Enable add button
        const addBtn = document.getElementById('addSelectedItemBtn');
        if (addBtn) {
            addBtn.disabled = false;
        }
    }

    // Add selected item to chest
    addSelectedItemToChest() {
        if (!this.selectedInventoryItemForChest || !this.currentChestBeingEdited) {
            alert('Please select an item first');
            return;
        }

        // Create a copy of the item for the chest
        const chestItem = {
            ...this.selectedInventoryItemForChest,
            quantity: 1 // Default quantity
        };

        // Initialize chest inventory if needed
        if (!this.currentChestBeingEdited.chestInventory) {
            this.currentChestBeingEdited.chestInventory = [];
        }

        // Check if item is stackable and already exists
        if (chestItem.stackable) {
            const existingItem = this.currentChestBeingEdited.chestInventory.find(item => item.id === chestItem.id);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                this.currentChestBeingEdited.chestInventory.push(chestItem);
            }
        } else {
            // Non-stackable, always add as new item
            this.currentChestBeingEdited.chestInventory.push(chestItem);
        }

        console.log(`📦 Added ${chestItem.name} to chest #${this.currentChestBeingEdited.id}`);

        // Close selection modal and refresh chest list
        this.closeInventorySelectionModal();
        this.refreshChestItemsList();
    }

    // Initialize all event listeners
    initialize() {
        this.setupUIListeners();
        this.setupPlatformEditorListeners();
        this.setupAdditionalListeners();
        this.setupSceneEditorListeners();
        this.setupPropsEditorListeners();
        this.setupLootablesEditorListeners();

        // Initialize enemy UI
        this.updateEnemyList();
        this.updateEnemyProperties();

        // Initialize NPC UI
        this.updateNPCList();
        this.updateNPCProperties();
    }

    showDropConfigModal() {
        if (!this.game.propSystem.selectedProp) return;

        // Populate the item dropdown
        const itemSelect = document.getElementById('dropItemSelect');
        if (itemSelect && this.game.inventoryItemsData) {
            itemSelect.innerHTML = '<option value="">Choose an item...</option>';

            // Add all available inventory items
            const inventoryItems = this.game.inventoryItemsData.inventoryItems;
            for (const itemId in inventoryItems) {
                const item = inventoryItems[itemId];
                const option = document.createElement('option');
                option.value = itemId;
                option.textContent = `${item.name} (${itemId})`;
                itemSelect.appendChild(option);
            }
        }

        // Reset form values
        document.getElementById('dropChanceInput').value = '40';
        document.getElementById('dropQuantityInput').value = '1';

        // Update modal title
        document.getElementById('dropConfigModalTitle').textContent = 'Configure Item Drops';

        // Show modal
        document.getElementById('dropConfigModal').style.display = 'flex';
        this._isEnemyDropModal = false; // Flag to indicate this is for prop drops
    }

    addDropToSelectedProp() {
        if (!this.game.propSystem.selectedProp) return;

        const itemId = document.getElementById('dropItemSelect').value;
        const inputPercent = parseFloat(document.getElementById('dropChanceInput').value);
        const chance = inputPercent / 100; // Convert percentage to decimal
        const quantity = parseInt(document.getElementById('dropQuantityInput').value) || 1;

        // console.log(`🎁 UI Input: ${inputPercent}% -> Converted to: ${chance} (${(chance * 100).toFixed(1)}%)`);

        if (!itemId) {
            alert('Please select an item');
            return;
        }

        if (inputPercent <= 0 || inputPercent > 100) {
            alert('Drop chance must be between 1 and 100%');
            return;
        }

        // Initialize dropItems array on the prop instance if it doesn't exist
        if (!this.game.propSystem.selectedProp.dropItems) {
            this.game.propSystem.selectedProp.dropItems = [];
        }

        // Check if this item is already configured
        const existingIndex = this.game.propSystem.selectedProp.dropItems.findIndex(drop => drop.itemId === itemId);
        if (existingIndex !== -1) {
            // Update existing drop
            this.game.propSystem.selectedProp.dropItems[existingIndex] = { itemId, chance, quantity };
            console.log(`🎁 Updated drop for ${itemId} on prop ${this.game.propSystem.selectedProp.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        } else {
            // Add new drop
            this.game.propSystem.selectedProp.dropItems.push({ itemId, chance, quantity });
            console.log(`🎁 Added drop for ${itemId} to prop ${this.game.propSystem.selectedProp.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        }

        // Update UI
        this.game.propSystem.manager.updateDropConfigurationUI();

        // Close modal
        document.getElementById('dropConfigModal').style.display = 'none';
    }

    updateEnemyDropConfigurationUI(enemy) {
        const dropsList = document.getElementById('enemyDropsList');
        if (!dropsList || !enemy) return;

        // Get the drop items for this specific enemy instance
        const drops = enemy.dropItems || [];

        if (drops.length === 0) {
            dropsList.innerHTML = '<div style="color: #888; font-size: 12px; text-align: center; padding: 10px;">No drops configured for this enemy</div>';
        } else {
            dropsList.innerHTML = drops.map((drop, index) => `
                <div style="background-color: #444; padding: 8px; margin: 4px 0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; color: #4CAF50;">${drop.itemId}</div>
                        <div style="font-size: 11px; color: #ccc;">${(drop.chance * 100).toFixed(1)}% chance • Qty: ${drop.quantity || 1}</div>
                    </div>
                    <button class="btn small danger" onclick="window.uiEventHandler.removeEnemyDrop(${index})" style="padding: 2px 6px; font-size: 10px;">✕</button>
                </div>
            `).join('');
        }
    }

    removeEnemyDrop(index) {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (!selectedEnemy) return;

        if (selectedEnemy.dropItems && selectedEnemy.dropItems[index]) {
            selectedEnemy.dropItems.splice(index, 1);
            if (selectedEnemy.dropItems.length === 0) {
                delete selectedEnemy.dropItems;
            }
            this.updateEnemyDropConfigurationUI(selectedEnemy);
            console.log(`🎁 Removed drop item from enemy ${selectedEnemy.id}`);
        }
    }

    showEnemyDropConfigModal() {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (!selectedEnemy) return;

        // Populate the item dropdown
        const itemSelect = document.getElementById('dropItemSelect');
        if (itemSelect && this.game.inventoryItemsData) {
            itemSelect.innerHTML = '<option value="">Choose an item...</option>';

            // Add all available inventory items
            const inventoryItems = this.game.inventoryItemsData.inventoryItems;
            for (const itemId in inventoryItems) {
                const item = inventoryItems[itemId];
                const option = document.createElement('option');
                option.value = itemId;
                option.textContent = `${item.name} (${itemId})`;
                itemSelect.appendChild(option);
            }
        }

        // Reset form values
        document.getElementById('dropChanceInput').value = '40';
        document.getElementById('dropQuantityInput').value = '1';

        // Update modal title
        document.getElementById('dropConfigModalTitle').textContent = 'Configure Enemy Death Drops';

        // Show modal
        document.getElementById('dropConfigModal').style.display = 'flex';
        this._isEnemyDropModal = true; // Flag to indicate this is for enemy drops
    }

    addDropToSelectedEnemy() {
        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();
        if (!selectedEnemy) return;

        const itemId = document.getElementById('dropItemSelect').value;
        const inputPercent = parseFloat(document.getElementById('dropChanceInput').value);
        const chance = inputPercent / 100; // Convert percentage to decimal
        const quantity = parseInt(document.getElementById('dropQuantityInput').value) || 1;

        // console.log(`🎁 Enemy UI Input: ${inputPercent}% -> Converted to: ${chance} (${(chance * 100).toFixed(1)}%)`);

        if (!itemId) {
            alert('Please select an item');
            return;
        }

        if (inputPercent <= 0 || inputPercent > 100) {
            alert('Drop chance must be between 1 and 100%');
            return;
        }

        // Initialize dropItems array on the enemy instance if it doesn't exist
        if (!selectedEnemy.dropItems) {
            selectedEnemy.dropItems = [];
        }

        // Check if this item is already configured
        const existingIndex = selectedEnemy.dropItems.findIndex(drop => drop.itemId === itemId);
        if (existingIndex !== -1) {
            // Update existing drop
            selectedEnemy.dropItems[existingIndex] = { itemId, chance, quantity };
            console.log(`🎁 Updated drop for ${itemId} on enemy ${selectedEnemy.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        } else {
            // Add new drop
            selectedEnemy.dropItems.push({ itemId, chance, quantity });
            console.log(`🎁 Added drop for ${itemId} to enemy ${selectedEnemy.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        }

        // Update UI
        this.updateEnemyDropConfigurationUI(selectedEnemy);

        // Close modal
        document.getElementById('dropConfigModal').style.display = 'none';
        this._isEnemyDropModal = false;
    }

    // Props Editor Modal Methods
    setupPropsEditorListeners() {
        // Open props editor button
        const openBtn = document.getElementById('openPropsEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openPropsEditorModal();
            });
        }

        // Close props editor modal
        const closeBtn = document.getElementById('closePropsEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePropsEditorModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('propsEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePropsEditorModal();
                }
            });
        }

        // Modal "Add Prop" button
        const modalAddBtn = document.getElementById('modalAddPropBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addPropFromModal();
            });
        }
    }

    openPropsEditorModal() {
        const modal = document.getElementById('propsEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderPropsGrid();
        }
    }

    closePropsEditorModal() {
        const modal = document.getElementById('propsEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selection
        this.selectedModalPropType = null;
        this.updateModalPropConfig();
    }

    renderPropsGrid() {
        const container = document.getElementById('propsGridContainer');
        if (!container) return;

        const propData = this.game.propSystem.data;
        const categories = propData.getCategories();

        let html = '';

        categories.forEach(category => {
            const props = propData.getPropsByCategory(category);
            if (props.length === 0) return;

            html += `<div class="prop-category">
                <h4 style="margin: 15px 0 10px 0; color: #4CAF50; font-size: 14px; border-bottom: 1px solid #444; padding-bottom: 5px;">${category}</h4>
                <div class="props-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-bottom: 20px;">`;

            props.forEach(prop => {
                const isSelected = this.selectedModalPropType === prop.id;
                html += `<div class="prop-grid-item ${isSelected ? 'selected' : ''}" data-prop-id="${prop.id}" style="
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
                    min-height: 100px;
                ">
                    <div style="
                        width: 100%;
                        flex: 1;
                        background-color: #F9F7F5;
                        border-radius: 3px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                    ">
                        <canvas class="prop-thumbnail" data-prop-id="${prop.id}" width="64" height="64" style="image-rendering: pixelated; max-width: 100%; max-height: 100%; background: transparent;"></canvas>
                    </div>
                    <div style="font-size: 10px; color: #ccc; text-align: center; word-wrap: break-word; width: 100%;">${prop.name}</div>
                </div>`;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;

        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .prop-grid-item:hover {
                background-color: #3a3a3a !important;
                border-color: #666 !important;
            }
            .prop-grid-item.selected:hover {
                background-color: #2a4a2a !important;
                border-color: #4CAF50 !important;
            }
        `;
        if (!document.getElementById('propsGridStyles')) {
            style.id = 'propsGridStyles';
            document.head.appendChild(style);
        }

        // Render thumbnails
        this.renderPropThumbnails();

        // Add click handlers
        container.querySelectorAll('.prop-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const propId = item.dataset.propId;
                this.selectPropType(propId);
            });
        });
    }

    renderPropThumbnails() {
        const propData = this.game.propSystem.data;
        const canvases = document.querySelectorAll('.prop-thumbnail');

        canvases.forEach(canvas => {
            const propId = canvas.dataset.propId;
            const propType = propData.propTypes[propId];

            if (!propType) return;

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Handle chests differently (they use a different sprite sheet)
            if (propType.isChest) {
                this.renderChestThumbnail(ctx, propType, canvas);
            } else {
                this.renderRegularPropThumbnail(ctx, propType, canvas);
            }
        });
    }

    renderRegularPropThumbnail(ctx, propType, canvas) {
        // Use the already-loaded image from the game's platform sprites
        const platformSprites = this.game.platformSystem.renderer.platformSprites;
        const img = platformSprites.villageProps.image;

        if (!img || !img.complete) {
            // If image isn't loaded yet, try again after a short delay
            setTimeout(() => {
                this.renderRegularPropThumbnail(ctx, propType, canvas);
            }, 100);
            return;
        }

        // Calculate scaling to fit in max 64x64, maintaining aspect ratio
        const maxSize = 64;
        const scale = Math.min(maxSize / propType.width, maxSize / propType.height, 1.0); // Don't scale up, only down
        const renderWidth = propType.width * scale;
        const renderHeight = propType.height * scale;

        // Resize canvas to actual render size to avoid stretching
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = renderWidth + 'px';
        canvas.style.height = renderHeight + 'px';

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw from tileset
        const tileSize = 32;
        const sourceX = propType.tileX * tileSize;
        const sourceY = propType.tileY * tileSize;

        ctx.drawImage(
            img,
            sourceX, sourceY, propType.width, propType.height,
            0, 0, renderWidth, renderHeight
        );
    }

    renderChestThumbnail(ctx, propType, canvas) {
        // Use the already-loaded chest sprite from prop renderer
        const propSprites = this.game.propSystem.renderer.propSprites;
        const img = propSprites.chestAnimation.image;

        if (!img || !img.complete) {
            // If image isn't loaded yet, try again after a short delay
            setTimeout(() => {
                this.renderChestThumbnail(ctx, propType, canvas);
            }, 100);
            return;
        }

        // Chests use 73x73 frames in the loaded spritesheet
        const frameSize = 73;
        const maxSize = 64;
        const scale = Math.min(maxSize / frameSize, 1.0); // Don't scale up
        const renderWidth = frameSize * scale;
        const renderHeight = frameSize * scale;

        // Resize canvas to actual render size
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = renderWidth + 'px';
        canvas.style.height = renderHeight + 'px';

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chest sprite: frame 0 (closed), row based on chest type
        const frameX = 0 * frameSize; // Frame 0 (closed)
        const frameY = propType.chestRow * frameSize;

        ctx.drawImage(
            img,
            frameX, frameY, frameSize, frameSize,
            0, 0, renderWidth, renderHeight
        );
    }

    selectPropType(propId) {
        this.selectedModalPropType = propId;

        // Update visual selection
        document.querySelectorAll('.prop-grid-item').forEach(item => {
            const isSelected = item.dataset.propId === propId;
            item.classList.toggle('selected', isSelected);
            item.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            item.style.borderColor = isSelected ? '#4CAF50' : 'transparent';
        });

        // Update configuration panel
        this.updateModalPropConfig();
    }

    updateModalPropConfig() {
        const configDiv = document.getElementById('selectedPropConfig');
        const noSelectionDiv = document.getElementById('noPropSelected');
        const propNameSpan = document.getElementById('selectedPropTypeName');

        if (this.selectedModalPropType) {
            const propType = this.game.propSystem.data.propTypes[this.selectedModalPropType];
            if (propType) {
                configDiv.style.display = 'block';
                noSelectionDiv.style.display = 'none';
                propNameSpan.textContent = propType.name;
            }
        } else {
            configDiv.style.display = 'none';
            noSelectionDiv.style.display = 'block';
        }
    }

    addPropFromModal() {
        if (!this.selectedModalPropType) {
            alert('Please select a prop type first');
            return;
        }

        // Get values from modal inputs
        const isObstacle = document.getElementById('modalPropObstacleCheck').checked;
        const size = parseFloat(document.getElementById('modalPropSizeInput').value) || 1.5;
        const damage = parseInt(document.getElementById('modalPropDamageInput').value) || 0;
        const destroyable = document.getElementById('modalPropDestroyableCheck').checked;
        const durability = parseInt(document.getElementById('modalPropDurabilityInput').value) || 100;

        // Store these values so propSystem can use them when placing
        this.game.propSystem.pendingPropConfig = {
            type: this.selectedModalPropType,
            isObstacle: isObstacle,
            size: size,
            damage: damage,
            destroyable: destroyable,
            durability: durability
        };

        // Close modal
        this.closePropsEditorModal();

        // Activate prop placement mode
        this.game.propSystem.togglePropPlacement();

        console.log(`Props editor: Selected ${this.selectedModalPropType} for placement`);
    }

    // Lootables Editor Modal Methods
    setupLootablesEditorListeners() {
        // Open lootables editor button
        const openBtn = document.getElementById('openLootablesEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openLootablesEditorModal();
            });
        }

        // Close lootables editor modal
        const closeBtn = document.getElementById('closeLootablesEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeLootablesEditorModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('lootablesEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeLootablesEditorModal();
                }
            });
        }

        // Modal "Add Lootable" button
        const modalAddBtn = document.getElementById('modalAddLootableBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addLootableFromModal();
            });
        }

        // Exit lootable placement button
        const exitPlacementBtn = document.getElementById('exitLootablePlacementBtn');
        if (exitPlacementBtn) {
            exitPlacementBtn.addEventListener('click', () => {
                if (this.game.lootableSystem) {
                    this.game.lootableSystem.lootablePlacementMode = false;
                    this.updateLootablePlacementUI();
                }
            });
        }
    }

    updateLootablePlacementUI() {
        const exitPlacementRow = document.getElementById('exitLootablePlacementRow');
        if (exitPlacementRow && this.game.lootableSystem) {
            exitPlacementRow.style.display = this.game.lootableSystem.lootablePlacementMode ? 'flex' : 'none';
        }
    }

    openLootablesEditorModal() {
        const modal = document.getElementById('lootablesEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderLootablesGrid();
        }
    }

    closeLootablesEditorModal() {
        const modal = document.getElementById('lootablesEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selection
        this.selectedModalLootableType = null;
        this.updateModalLootableConfig();
    }

    renderLootablesGrid() {
        const container = document.querySelector('#lootablesGridContainer .lootables-grid');
        if (!container) return;

        const lootableData = this.game.lootableSystem.data;
        const lootables = lootableData.getLootableTypes();

        let html = '';

        lootables.forEach(lootable => {
            const isSelected = this.selectedModalLootableType === lootable.id;
            html += `<div class="lootable-grid-item ${isSelected ? 'selected' : ''}" data-lootable-id="${lootable.id}" style="
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
                min-height: 120px;
            ">
                <div style="
                    width: 100%;
                    flex: 1;
                    background-color: #F9F7F5;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                ">
                    <canvas class="lootable-thumbnail" data-lootable-id="${lootable.id}" width="64" height="64" style="image-rendering: pixelated; max-width: 100%; max-height: 100%; background: transparent;"></canvas>
                </div>
                <div style="font-size: 11px; color: #ccc; text-align: center; word-wrap: break-word; width: 100%;">${lootable.name}</div>
            </div>`;
        });

        container.innerHTML = html;

        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .lootable-grid-item:hover {
                background-color: #3a3a3a !important;
                border-color: #666 !important;
            }
            .lootable-grid-item.selected:hover {
                background-color: #2a4a2a !important;
                border-color: #4CAF50 !important;
            }
        `;
        if (!document.getElementById('lootablesGridStyles')) {
            style.id = 'lootablesGridStyles';
            document.head.appendChild(style);
        }

        // Render thumbnails
        this.renderLootableThumbnails();

        // Add click handlers
        container.querySelectorAll('.lootable-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const lootableId = item.dataset.lootableId;
                this.selectLootableType(lootableId);
            });
        });
    }

    renderLootableThumbnails() {
        const lootableRenderer = this.game.lootableSystem.renderer;
        const canvases = document.querySelectorAll('.lootable-thumbnail');

        canvases.forEach(canvas => {
            const lootableId = canvas.dataset.lootableId;
            const sprite = lootableRenderer.sprites[lootableId];

            if (!sprite || !sprite.image || !sprite.image.complete) {
                // If image isn't loaded yet, try again after a short delay
                setTimeout(() => {
                    this.renderLootableThumbnails();
                }, 100);
                return;
            }

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            // Calculate scaling to fit in max 64x64, maintaining aspect ratio
            const maxSize = 64;
            const scale = Math.min(maxSize / sprite.width, maxSize / sprite.height, 2.0); // Allow up to 2x scale for small sprites
            const renderWidth = sprite.width * scale;
            const renderHeight = sprite.height * scale;

            // Resize canvas to actual render size
            canvas.width = renderWidth;
            canvas.height = renderHeight;
            canvas.style.width = renderWidth + 'px';
            canvas.style.height = renderHeight + 'px';

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the first frame of the sprite (frame 0)
            ctx.drawImage(
                sprite.image,
                0, 0, sprite.width, sprite.height,
                0, 0, renderWidth, renderHeight
            );
        });
    }

    selectLootableType(lootableId) {
        this.selectedModalLootableType = lootableId;

        // Update visual selection
        document.querySelectorAll('.lootable-grid-item').forEach(item => {
            const isSelected = item.dataset.lootableId === lootableId;
            item.classList.toggle('selected', isSelected);
            item.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            item.style.borderColor = isSelected ? '#4CAF50' : 'transparent';
        });

        // Update configuration panel
        this.updateModalLootableConfig();
    }

    updateModalLootableConfig() {
        const configDiv = document.getElementById('selectedLootableConfig');
        const noSelectionDiv = document.getElementById('noLootableSelected');
        const lootableNameSpan = document.getElementById('selectedLootableTypeName');

        if (this.selectedModalLootableType) {
            const lootableType = this.game.lootableSystem.data.lootableTypes[this.selectedModalLootableType];
            if (lootableType) {
                configDiv.style.display = 'block';
                noSelectionDiv.style.display = 'none';
                lootableNameSpan.textContent = lootableType.name;
            }
        } else {
            configDiv.style.display = 'none';
            noSelectionDiv.style.display = 'block';
        }
    }

    addLootableFromModal() {
        if (!this.selectedModalLootableType) {
            alert('Please select a lootable type first');
            return;
        }

        // Save the selected type before closing modal (which clears it)
        const selectedType = this.selectedModalLootableType;

        // Store the selected type so lootableSystem can use it when placing
        this.game.lootableSystem.pendingLootableConfig = {
            type: selectedType
        };

        // Close modal
        this.closeLootablesEditorModal();

        // Activate lootable placement mode
        this.game.lootableSystem.toggleLootablePlacement();

        // Update UI to show exit placement button
        this.updateLootablePlacementUI();

        console.log(`Lootables editor: Selected ${selectedType} for placement`);
    }
}