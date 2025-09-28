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

        // Props controls
        document.getElementById('addPropBtn').addEventListener('click', () => {
            this.game.propSystem.togglePropPlacement();
        });

        // Auto-update size when prop type changes
        document.getElementById('propTypeSelect').addEventListener('change', (e) => {
            const propType = e.target.value;
            const sizeInput = document.getElementById('propSizeInput');

            // Set default size based on prop type (all default to 1.5 now)
            const defaultSize = 1.5;

            sizeInput.value = defaultSize.toFixed(1);
        });

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

        // Lootable controls
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
        if (maxHealthInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.maxHealth);
            console.log(`🔄 Setting maxHealth: ${valuesToLoad.maxHealth} -> ${formattedValue}`);
            maxHealthInput.value = formattedValue;
        }
        if (healthRegenInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.healthRegen);
            console.log(`🔄 Setting healthRegen: ${valuesToLoad.healthRegen} -> ${formattedValue}`);
            healthRegenInput.value = formattedValue;
        }
        if (maxStaminaInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.maxStamina);
            console.log(`🔄 Setting maxStamina: ${valuesToLoad.maxStamina} -> ${formattedValue}`);
            maxStaminaInput.value = formattedValue;
        }
        if (staminaRegenInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.staminaRegen);
            console.log(`🔄 Setting staminaRegen: ${valuesToLoad.staminaRegen} -> ${formattedValue}`);
            staminaRegenInput.value = formattedValue;
        }
        if (runningCostInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.runningCost);
            console.log(`🔄 Setting runningCost: ${valuesToLoad.runningCost} -> ${formattedValue}`);
            runningCostInput.value = formattedValue;
        }
        if (jumpCostInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.jumpCost);
            console.log(`🔄 Setting jumpCost: ${valuesToLoad.jumpCost} -> ${formattedValue}`);
            jumpCostInput.value = formattedValue;
        }
        if (attackDamageInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.attackDamage);
            console.log(`🔄 Setting attackDamage: ${valuesToLoad.attackDamage} -> ${formattedValue}`);
            attackDamageInput.value = formattedValue;
        }
        if (walkSpeedInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.walkSpeed);
            console.log(`🔄 Setting walkSpeed: ${valuesToLoad.walkSpeed} -> ${formattedValue}`);
            walkSpeedInput.value = formattedValue;
        }
        if (runSpeedInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.runSpeed);
            console.log(`🔄 Setting runSpeed: ${valuesToLoad.runSpeed} -> ${formattedValue}`);
            runSpeedInput.value = formattedValue;
        }
        if (jumpForceInput) {
            const formattedValue = this.formatNumberForInput(valuesToLoad.jumpForce);
            console.log(`🔄 Setting jumpForce: ${valuesToLoad.jumpForce} -> ${formattedValue}`);
            jumpForceInput.value = formattedValue;
        }

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

        console.log('🎮 Parsed input values for saving:', {
            jumpCost: jumpCost,
            jumpCostInput: document.getElementById('playerJumpCost')?.value,
            runningCost: runningCost,
            runningCostInput: document.getElementById('playerRunningCost')?.value
        });

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

        // Initialize enemy UI
        this.updateEnemyList();
        this.updateEnemyProperties();
    }
}