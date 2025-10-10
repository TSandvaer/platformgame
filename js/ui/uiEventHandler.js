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
     * Lootables editor listeners (delegated)
     */
    setupLootablesEditorListeners() {
        // To be implemented in LootableUIHandler
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
                    console.log('💚 Player healed to full health');
                }
            });
        }

        // Restore Stamina button
        const staminaBtn = document.getElementById('restoreStamina');
        if (staminaBtn) {
            staminaBtn.addEventListener('click', () => {
                if (this.game.playerSystem && this.game.playerSystem.data) {
                    this.game.playerSystem.data.stamina = this.game.playerSystem.data.maxStamina;
                    console.log('⚡ Player stamina restored to full');
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

        console.log('✅ Player values loaded into UI inputs');
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

        console.log('🎮 Player settings applied and saved');
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
        const themeSelect = document.getElementById('guiThemeSelect');
        if (themeSelect) themeSelect.value = 'none';

        // Apply the reset values
        this.applyGUISettings();

        console.log('🔄 GUI settings reset to defaults');
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

        let html = '';

        characters.forEach(character => {
            const isSelected = this.selectedCharacterId === character.id;
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
                ${isSelected ? '<div style="color: #4CAF50; font-size: 11px; font-weight: bold;">✓ Selected</div>' : ''}
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
        `;
        if (!document.getElementById('characterCardStyles')) {
            style.id = 'characterCardStyles';
            document.head.appendChild(style);
        }

        // Add click handlers
        gridContainer.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.characterId;
                this.selectCharacter(characterId);
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

        console.log(`Selected character: ${characterId}`);
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

        console.log(`✅ Character changed to: ${characterConfig.name}`);
    }

    resetCharacterSelection() {
        this.selectCharacter('soldier');
        this.applyCharacterSelection();
        console.log('🔄 Character reset to Soldier');
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
        console.log(`📦 Inventory items list refreshed: ${inventoryItems.length} items`);
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