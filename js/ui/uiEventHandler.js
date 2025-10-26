/**
 * Main UI Event Handler - Coordinates all UI interactions
 * Refactored to use modular handlers for better organization
 */
class UIEventHandler {
    constructor(game) {
        this.game = game;

        // Initialize handler modules
        this.modalHandler = new ModalUIHandler(game);
        this.platformHandler = new PlatformUIHandler(game, this.modalHandler);
        this.propHandler = new PropUIHandler(game, this.modalHandler);
        this.enemyHandler = new EnemyUIHandler(game, this.modalHandler);
        this.npcHandler = new NPCUIHandler(game);
        this.sceneHandler = new SceneUIHandler(game);

        // Store references for backward compatibility
        this.handlers = {
            modal: this.modalHandler,
            platform: this.platformHandler,
            prop: this.propHandler,
            enemy: this.enemyHandler,
            npc: this.npcHandler,
            scene: this.sceneHandler
        };
    }

    /**
     * Initialize all UI event handlers
     */
    initialize() {
        this.setupUIListeners();
        this.setupAdditionalListeners();

        // Initialize all handler modules
        Object.values(this.handlers).forEach(handler => {
            if (handler.initialize) {
                handler.initialize();
            }
        });

        // Legacy method calls for compatibility
        this.setupPlatformEditorListeners();
        this.setupSceneEditorListeners();
        this.setupPropsEditorListeners();
        this.setupEnemiesEditorListeners();
        this.setupChestInventoryListeners();
        this.setupPlayerControlListeners();
        this.setupGUISettingsListeners();
        this.setupCharacterSelectionListeners();
        this.setupLootablesEditorListeners();
    }

    /**
     * Set up core UI listeners
     */
    setupUIListeners() {
        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(true);
        });
        document.getElementById('productionBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(false);
        });

        document.getElementById('cameraModeBtn').addEventListener('click', () => {
            this.game.cameraSystem.toggleMode();
        });

        document.getElementById('backToDevBtn').addEventListener('click', () => {
            this.game.setDevelopmentMode(true);
        });

        window.addEventListener('resize', () => {
            this.game.viewportSystem.handleResize();
        });

        // Multi-selection and grouping event listeners
        const groupButton = document.getElementById('groupProps');
        if (groupButton) {
            groupButton.addEventListener('click', () => {
                if (this.game.propSystem.selectedProps?.length < 2) {
                    alert('Select at least 2 props to create a group');
                    return;
                }

                const groupId = this.game.propSystem.groupSelectedProps();
                if (!groupId) {
                    alert('Grouping failed');
                }
            });
        }

        const ungroupButton = document.getElementById('ungroupProps');
        if (ungroupButton) {
            ungroupButton.addEventListener('click', () => {
                this.game.propSystem.ungroupSelectedProps();
            });
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

    /**
     * Set up additional listeners
     */
    setupAdditionalListeners() {
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
    }

    // ========== DELEGATE METHODS FOR BACKWARD COMPATIBILITY ==========

    /**
     * Platform editor listeners (delegated)
     */
    setupPlatformEditorListeners() {
        // Delegated to PlatformUIHandler
    }

    /**
     * Scene editor listeners (delegated)
     */
    setupSceneEditorListeners() {
        // Delegated to SceneUIHandler
    }

    /**
     * Props editor listeners (delegated)
     */
    setupPropsEditorListeners() {
        // Delegated to PropUIHandler
    }

    /**
     * Enemies editor listeners (delegated)
     */
    setupEnemiesEditorListeners() {
        // Delegated to EnemyUIHandler
    }

    /**
     * Lootables editor listeners
     */
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

    /**
     * Show confirmation modal (delegated)
     */
    showConfirmationModal(message, onConfirm, onCancel = null) {
        return this.modalHandler.showConfirmationModal(message, onConfirm, onCancel);
    }

    /**
     * Close confirmation modal (delegated)
     */
    closeConfirmationModal() {
        return this.modalHandler.closeConfirmationModal();
    }

    /**
     * Close game settings modal (delegated)
     */
    closeGameSettingsModal() {
        return this.modalHandler.closeGameSettingsModal();
    }

    /**
     * Update enemy list (delegated)
     */
    updateEnemyList() {
        return this.enemyHandler.updateEnemyList();
    }

    /**
     * Update enemy properties (delegated)
     */
    updateEnemyProperties() {
        return this.enemyHandler.updateEnemyProperties();
    }

    /**
     * Update NPC list (delegated)
     */
    updateNPCList() {
        return this.npcHandler.updateNPCList();
    }

    /**
     * Update NPC properties (delegated)
     */
    updateNPCProperties() {
        return this.npcHandler.updateNPCProperties();
    }

    // ========== PLACEHOLDER METHODS TO BE MIGRATED ==========

    /**
     * These methods still need to be migrated to appropriate handlers
     */

    setupChestInventoryListeners() {
        // TODO: Move to InventoryUIHandler
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

        // Heal Player button
        const healBtn = document.getElementById('healPlayer');
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                if (this.game.playerSystem && this.game.playerSystem.data) {
                    this.game.playerSystem.data.health = this.game.playerSystem.data.maxHealth;
                }
            });
        }

        // Restore Stamina button
        const staminaBtn = document.getElementById('restoreStamina');
        if (staminaBtn) {
            staminaBtn.addEventListener('click', () => {
                if (this.game.playerSystem && this.game.playerSystem.data) {
                    this.game.playerSystem.data.stamina = this.game.playerSystem.data.maxStamina;
                }
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
        if (!this.game.playerSystem || !this.game.playerSystem.data) {
            console.warn('⚠️ Player system not available for loading values');
            return;
        }

        const player = this.game.playerSystem.data;

        // Try to load saved settings first, then fall back to current player values
        let settings = null;
        if (this.game.gameDataSystem && this.game.gameDataSystem.gameData.playerSettings) {
            settings = this.game.gameDataSystem.gameData.playerSettings;
        } else {
        }

        // Load values into inputs (use saved settings if available, otherwise current player values)
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


        // Update input fields
        const updateInput = (id, value) => {
            const input = document.getElementById(id);
            if (input) input.value = this.formatNumberForInput(value);
        };

        updateInput('playerMaxHealth', valuesToLoad.maxHealth);
        updateInput('playerHealthRegen', valuesToLoad.healthRegen);
        updateInput('playerMaxStamina', valuesToLoad.maxStamina);
        updateInput('playerStaminaRegen', valuesToLoad.staminaRegen);
        updateInput('playerRunningCost', valuesToLoad.runningCost);
        updateInput('playerJumpCost', valuesToLoad.jumpCost);
        updateInput('playerAttackDamage', valuesToLoad.attackDamage);
        updateInput('playerWalkSpeed', valuesToLoad.walkSpeed);
        updateInput('playerRunSpeed', valuesToLoad.runSpeed);
        updateInput('playerJumpForce', valuesToLoad.jumpForce);

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

        // Apply to player
        player.maxHealth = maxHealth;
        player.healthRegenRate = healthRegen;
        player.maxStamina = maxStamina;
        player.staminaRegenRate = staminaRegen;
        player.runningCost = runningCost;
        player.jumpCost = jumpCost;
        player.attackDamage = attackDamage;
        player.speed = walkSpeed;
        player.runSpeed = runSpeed;
        player.jumpPower = -Math.abs(jumpForce); // Negative because jump is upward

        // Ensure health doesn't exceed new max
        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }

        // Ensure stamina doesn't exceed new max
        if (player.stamina > player.maxStamina) {
            player.stamina = player.maxStamina;
        }

        // Save settings to gameDataSystem
        if (this.game.gameDataSystem) {
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
            this.game.gameDataSystem.updatePlayerSettings(playerSettings);
        }

    }

    resetPlayerSettings() {
        // Reset to default values
        const updateInput = (id, value) => {
            const input = document.getElementById(id);
            if (input) input.value = value;
        };

        updateInput('playerMaxHealth', 100);
        updateInput('playerHealthRegen', 0);
        updateInput('playerMaxStamina', 100);
        updateInput('playerStaminaRegen', 5);
        updateInput('playerRunningCost', 1.5);
        updateInput('playerJumpCost', 10);
        updateInput('playerAttackDamage', 25);
        updateInput('playerWalkSpeed', 5);
        updateInput('playerRunSpeed', 10);
        updateInput('playerJumpForce', 15);

        // Apply the reset values
        this.applyPlayerSettings();

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
        }
    }

    resetGUISettings() {
        // Reset to default values
        const themeSelect = document.getElementById('guiThemeSelect');
        if (themeSelect) themeSelect.value = 'none';

        // Apply the reset values
        this.applyGUISettings();

    }

    setupCharacterSelectionListeners() {
        // Load current character values into the controls
        this.loadCharacterValues();

        // Apply Character button
        const applyBtn = document.getElementById('applyCharacterSelection');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCharacterSelection();
            });
        }

        // Reset Character button
        const resetBtn = document.getElementById('resetCharacterSelection');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCharacterSelection();
            });
        }

        // Character Stats Modal - Close button
        const closeModalBtn = document.getElementById('closeCharacterStatsModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeCharacterStatsModal();
            });
        }

        // Character Stats Modal - Reset to Default button
        const resetStatsBtn = document.getElementById('resetCharacterStatsBtn');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', () => {
                this.resetCharacterStatsToDefault();
            });
        }

        // Character Stats Modal - Cancel button
        const cancelStatsBtn = document.getElementById('cancelCharacterStatsBtn');
        if (cancelStatsBtn) {
            cancelStatsBtn.addEventListener('click', () => {
                this.closeCharacterStatsModal();
            });
        }

        // Character Stats Modal - Save button
        const saveStatsBtn = document.getElementById('saveCharacterStatsBtn');
        if (saveStatsBtn) {
            saveStatsBtn.addEventListener('click', () => {
                this.saveCharacterStats();
            });
        }

        // Character Stats Modal - Click outside to close
        const statsModal = document.getElementById('characterStatsModal');
        if (statsModal) {
            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) {
                    this.closeCharacterStatsModal();
                }
            });
        }
    }

    loadCharacterValues() {
        if (!this.game.playerSystem || !this.game.playerSystem.data) {
            console.warn('⚠️ Player system not available for loading character values');
            return;
        }

        const player = this.game.playerSystem.data;
        const currentCharacter = player.selectedCharacter || 'soldier';

        // Update current character display
        const currentCharacterName = document.getElementById('currentCharacterName');
        if (currentCharacterName && window.playerCharacters) {
            const charConfig = window.playerCharacters.getCharacter(currentCharacter);
            currentCharacterName.textContent = charConfig.name;
        }

        // Render character selection grid
        this.renderCharacterSelectionGrid(currentCharacter);
    }

    renderCharacterSelectionGrid(selectedCharacterId) {
        const gridContainer = document.getElementById('characterSelectionGrid');
        if (!gridContainer || !window.playerCharacters) return;

        const characters = window.playerCharacters.getAllCharacters();
        this.selectedCharacterId = selectedCharacterId || 'soldier';

        // Get available characters from game settings
        const availableCharacters = this.game.gameDataSystem?.gameData?.characterSettings?.availableCharacters ||
                                    ['soldier', 'dwarfWarrior', 'wizard', 'archer'];

        let html = '';

        characters.forEach(character => {
            const isSelected = this.selectedCharacterId === character.id;
            const isAvailable = availableCharacters.includes(character.id);

            html += `<div class="character-card ${isSelected ? 'selected' : ''}" data-character-id="${character.id}" style="
                cursor: pointer;
                padding: 12px;
                background-color: ${isSelected ? '#2a4a2a' : '#333'};
                border: 2px solid ${isSelected ? '#4CAF50' : '#555'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            ">
                <div style="font-weight: bold; color: ${isSelected ? '#4CAF50' : '#fff'}; font-size: 14px;">
                    ${character.name}
                </div>
                <div style="color: #aaa; font-size: 11px; text-align: center;">
                    ${character.description}
                </div>
                <div style="color: #888; font-size: 10px;">
                    Size: ${character.playerSize.width}x${character.playerSize.height}
                </div>
                ${isSelected ? '<div class="character-check" style="color: #4CAF50; font-size: 11px; font-weight: bold;">✓ Selected</div>' : ''}
                <div class="character-availability-badge" style="
                    margin-top: 4px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: bold;
                    background-color: ${isAvailable ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 107, 107, 0.2)'};
                    color: ${isAvailable ? '#4CAF50' : '#ff6b6b'};
                    border: 1px solid ${isAvailable ? '#4CAF50' : '#ff6b6b'};
                ">
                    ${isAvailable ? '✓ Available in game' : '✗ Unavailable for game'}
                </div>
                ${isAvailable ? `<button class="character-stats-btn" data-character-id="${character.id}" style="
                    margin-top: 8px;
                    padding: 6px 12px;
                    background-color: #555;
                    color: #fff;
                    border: 1px solid #777;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                ">Set character game stats</button>` : ''}
            </div>`;
        });

        gridContainer.innerHTML = html;

        // Add hover effects style
        const style = document.createElement('style');
        style.textContent = `
            .character-card:hover {
                background-color: #3a3a3a !important;
                border-color: #777 !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            .character-card.selected:hover {
                background-color: #2a4a2a !important;
                border-color: #4CAF50 !important;
            }
            .character-stats-btn:hover {
                background-color: #667eea !important;
                border-color: #667eea !important;
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
            }
        `;
        if (!document.getElementById('characterCardStyles')) {
            style.id = 'characterCardStyles';
            document.head.appendChild(style);
        }

        // Add click handlers
        gridContainer.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const characterId = card.dataset.characterId;

                // Check if Ctrl key is pressed (or Cmd on Mac)
                if (e.ctrlKey || e.metaKey) {
                    // Toggle availability
                    this.toggleCharacterAvailability(characterId);
                } else {
                    // Normal click - select character
                    this.selectCharacter(characterId);
                }
            });
        });

        // Add click handlers for stats buttons
        gridContainer.querySelectorAll('.character-stats-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                const characterId = btn.dataset.characterId;
                this.openCharacterStatsModal(characterId);
            });
        });
    }

    selectCharacter(characterId) {
        this.selectedCharacterId = characterId;

        // Update visual selection
        document.querySelectorAll('.character-card').forEach(card => {
            const isSelected = card.dataset.characterId === characterId;
            card.classList.toggle('selected', isSelected);
            card.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            card.style.borderColor = isSelected ? '#4CAF50' : '#555';

            // Update text color for character name
            const nameDiv = card.querySelector('div');
            if (nameDiv) {
                nameDiv.style.color = isSelected ? '#4CAF50' : '#fff';
            }

            // Add or remove checkmark
            const existingCheck = card.querySelector('.character-check');
            if (existingCheck) {
                existingCheck.remove();
            }

            if (isSelected) {
                const checkmark = document.createElement('div');
                checkmark.className = 'character-check';
                checkmark.style.cssText = 'color: #4CAF50; font-size: 11px; font-weight: bold;';
                checkmark.textContent = '✓ Selected';
                card.appendChild(checkmark);
            }
        });

    }

    async toggleCharacterAvailability(characterId) {
        // Don't allow toggling the currently selected character
        if (characterId === this.selectedCharacterId) {
            console.warn('⚠️ Cannot toggle availability for the currently selected character');
            // Show a temporary message to the user
            if (this.game.editorSystem && this.game.editorSystem.ui) {
                this.game.editorSystem.ui.showTemporaryMessage('Cannot disable the currently selected character', 2000);
            }
            return;
        }

        // Get current available characters
        const availableCharacters = this.game.gameDataSystem?.gameData?.characterSettings?.availableCharacters ||
                                    ['soldier', 'dwarfWarrior', 'wizard', 'archer'];

        // Toggle availability
        const isCurrentlyAvailable = availableCharacters.includes(characterId);
        let newAvailableCharacters;

        if (isCurrentlyAvailable) {
            // Remove from available list
            newAvailableCharacters = availableCharacters.filter(id => id !== characterId);

            // Ensure at least one character remains available
            if (newAvailableCharacters.length === 0) {
                console.warn('⚠️ Cannot disable all characters - at least one must be available');
                if (this.game.editorSystem && this.game.editorSystem.ui) {
                    this.game.editorSystem.ui.showTemporaryMessage('At least one character must be available', 2000);
                }
                return;
            }
        } else {
            // Add to available list
            newAvailableCharacters = [...availableCharacters, characterId];
        }

        // Update character settings (saves to both localStorage and MongoDB)
        if (this.game.gameDataSystem) {
            await this.game.gameDataSystem.updateCharacterSettings({
                availableCharacters: newAvailableCharacters
            });
        }

        // Re-render the grid to show updated availability
        this.renderCharacterSelectionGrid(this.selectedCharacterId);

        console.log(`✅ Character ${characterId} ${isCurrentlyAvailable ? 'disabled' : 'enabled'} for game`);
    }

    applyCharacterSelection() {
        if (!this.selectedCharacterId) {
            console.warn('No character selected');
            return;
        }

        if (!this.game.playerSystem || !window.playerCharacters) {
            console.error('Cannot apply character selection - system not ready');
            return;
        }

        const characterConfig = window.playerCharacters.getCharacter(this.selectedCharacterId);

        // Update player data
        this.game.playerSystem.data.selectedCharacter = this.selectedCharacterId;

        // Switch character sprites and dimensions
        this.game.playerSystem.animator.switchCharacter(this.selectedCharacterId);

        // Apply character-specific stats if they exist
        if (this.game.gameDataSystem) {
            const characterStats = this.game.gameDataSystem.getCharacterStats(this.selectedCharacterId);
            if (characterStats) {
                const player = this.game.playerSystem.data;

                player.maxHealth = characterStats.maxHealth;
                player.healthRegenRate = characterStats.healthRegen;
                player.maxStamina = characterStats.maxStamina;
                player.staminaRegenRate = characterStats.staminaRegen;
                player.attackDamage = characterStats.attackDamage;
                player.speed = characterStats.walkSpeed;
                player.runSpeed = characterStats.runSpeed;
                player.jumpPower = -Math.abs(characterStats.jumpForce);
                player.jumpCost = characterStats.jumpCost;
                player.runningCost = characterStats.runningCost;

                // Set health and stamina to max values for testing
                player.health = player.maxHealth;
                player.stamina = player.maxStamina;

                console.log(`✅ Applied character-specific stats for ${this.selectedCharacterId}`);
            }
        }

        // Update current character display
        const currentCharacterName = document.getElementById('currentCharacterName');
        if (currentCharacterName) {
            currentCharacterName.textContent = characterConfig.name;
        }

        // Save to localStorage via gameDataSystem
        if (this.game.gameDataSystem) {
            this.game.gameDataSystem.updateCharacterSettings({
                selectedCharacter: this.selectedCharacterId
            });
        }

    }

    resetCharacterSelection() {
        this.selectCharacter('soldier');
        this.applyCharacterSelection();
    }

    // Character Stats Modal Methods
    openCharacterStatsModal(characterId) {
        // Store the character we're editing
        this.editingCharacterId = characterId;

        // Get character name for modal title
        const characterConfig = window.playerCharacters?.getCharacter(characterId);
        const characterName = characterConfig?.name || characterId;

        const modalTitle = document.getElementById('characterStatsModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `${characterName} - Character Stats`;
        }

        // Load character stats into the form
        this.loadCharacterStatsToForm(characterId);

        // Show the modal
        const modal = document.getElementById('characterStatsModal');
        if (modal) {
            modal.style.display = 'flex';
        }

        console.log(`📝 Opened character stats modal for: ${characterName}`);
    }

    loadCharacterStatsToForm(characterId) {
        if (!this.game.gameDataSystem) {
            console.error('❌ Game data system not available');
            return;
        }

        // Get character stats (will use defaults if not set)
        const stats = this.game.gameDataSystem.getCharacterStats(characterId);

        // Populate form fields
        const fields = {
            'charMaxHealth': stats.maxHealth,
            'charHealthRegen': stats.healthRegen,
            'charMaxStamina': stats.maxStamina,
            'charStaminaRegen': stats.staminaRegen,
            'charRunningCost': stats.runningCost,
            'charJumpCost': stats.jumpCost,
            'charAttackDamage': stats.attackDamage,
            'charWalkSpeed': stats.walkSpeed,
            'charRunSpeed': stats.runSpeed,
            'charJumpForce': stats.jumpForce
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = value;
            }
        });

        console.log(`✅ Loaded stats for ${characterId}:`, stats);
    }

    resetCharacterStatsToDefault() {
        if (!this.editingCharacterId || !this.game.gameDataSystem) {
            console.error('❌ Cannot reset stats - no character selected or game data system unavailable');
            return;
        }

        // Get default stats for this character
        const defaultStats = this.game.gameDataSystem.getDefaultCharacterStats(this.editingCharacterId);

        // Populate form with defaults
        const fields = {
            'charMaxHealth': defaultStats.maxHealth,
            'charHealthRegen': defaultStats.healthRegen,
            'charMaxStamina': defaultStats.maxStamina,
            'charStaminaRegen': defaultStats.staminaRegen,
            'charRunningCost': defaultStats.runningCost,
            'charJumpCost': defaultStats.jumpCost,
            'charAttackDamage': defaultStats.attackDamage,
            'charWalkSpeed': defaultStats.walkSpeed,
            'charRunSpeed': defaultStats.runSpeed,
            'charJumpForce': defaultStats.jumpForce
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = value;
            }
        });

        console.log(`🔄 Reset ${this.editingCharacterId} stats to defaults`);
    }

    async saveCharacterStats() {
        if (!this.editingCharacterId || !this.game.gameDataSystem) {
            console.error('❌ Cannot save stats - no character selected or game data system unavailable');
            return;
        }

        // Read values from form
        const stats = {
            maxHealth: parseFloat(document.getElementById('charMaxHealth').value),
            healthRegen: parseFloat(document.getElementById('charHealthRegen').value),
            maxStamina: parseFloat(document.getElementById('charMaxStamina').value),
            staminaRegen: parseFloat(document.getElementById('charStaminaRegen').value),
            runningCost: parseFloat(document.getElementById('charRunningCost').value),
            jumpCost: parseFloat(document.getElementById('charJumpCost').value),
            attackDamage: parseFloat(document.getElementById('charAttackDamage').value),
            walkSpeed: parseFloat(document.getElementById('charWalkSpeed').value),
            runSpeed: parseFloat(document.getElementById('charRunSpeed').value),
            jumpForce: parseFloat(document.getElementById('charJumpForce').value)
        };

        // Save to game data system (saves to both localStorage and MongoDB)
        await this.game.gameDataSystem.updateCharacterStats(this.editingCharacterId, stats);

        console.log(`💾 Saved character stats for ${this.editingCharacterId}:`, stats);

        // If this character is currently selected, apply stats immediately
        if (this.game.playerSystem && this.game.playerSystem.data) {
            const currentCharacter = this.game.playerSystem.data.selectedCharacter;
            if (currentCharacter === this.editingCharacterId) {
                const player = this.game.playerSystem.data;

                player.maxHealth = stats.maxHealth;
                player.healthRegenRate = stats.healthRegen;
                player.maxStamina = stats.maxStamina;
                player.staminaRegenRate = stats.staminaRegen;
                player.attackDamage = stats.attackDamage;
                player.speed = stats.walkSpeed;
                player.runSpeed = stats.runSpeed;
                player.jumpPower = -Math.abs(stats.jumpForce);
                player.jumpCost = stats.jumpCost;
                player.runningCost = stats.runningCost;

                // Set health and stamina to max values
                player.health = player.maxHealth;
                player.stamina = player.maxStamina;

                console.log(`✅ Applied stats immediately to currently selected character: ${currentCharacter}`);
            }
        }

        // Show success message if available
        if (this.game.editorSystem && this.game.editorSystem.ui) {
            this.game.editorSystem.ui.showTemporaryMessage('Character stats saved successfully', 2000);
        }

        // Close modal
        this.closeCharacterStatsModal();
    }

    closeCharacterStatsModal() {
        const modal = document.getElementById('characterStatsModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Clear editing state
        this.editingCharacterId = null;

        console.log('❌ Closed character stats modal');
    }

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
    }

    /**
     * Helper methods (keep in main handler)
     */
    formatNumberForInput(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                return value.toString();
            }
            return value.toFixed(2).replace(/\.?0+$/, '');
        }
        return value.toString();
    }

    parseNumberFromInput(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
}