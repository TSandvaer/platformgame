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
        // TODO: Move to PlayerUIHandler
    }

    setupGUISettingsListeners() {
        // TODO: Move to PlayerUIHandler
    }

    setupCharacterSelectionListeners() {
        // TODO: Move to PlayerUIHandler
    }

    refreshInventoryItemsList() {
        // TODO: Move to InventoryUIHandler
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