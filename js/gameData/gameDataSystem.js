// Default character stats - used for resetting characters to defaults
const DEFAULT_CHARACTER_STATS = {
    'soldier': {
        maxHealth: 120,
        healthRegen: 1,
        maxStamina: 100,
        staminaRegen: 5,
        runningCost: 1.5,
        jumpCost: 10,
        attackDamage: 30,
        walkSpeed: 5,
        runSpeed: 10,
        jumpForce: 15
    },
    'dwarfWarrior': {
        maxHealth: 150,
        healthRegen: 2,
        maxStamina: 80,
        staminaRegen: 4,
        runningCost: 2,
        jumpCost: 12,
        attackDamage: 40,
        walkSpeed: 4,
        runSpeed: 8,
        jumpForce: 12
    },
    'wizard': {
        maxHealth: 80,
        healthRegen: 0,
        maxStamina: 150,
        staminaRegen: 8,
        runningCost: 1,
        jumpCost: 8,
        attackDamage: 45,
        walkSpeed: 4.5,
        runSpeed: 9,
        jumpForce: 14
    },
    'archer': {
        maxHealth: 90,
        healthRegen: 0.5,
        maxStamina: 120,
        staminaRegen: 6,
        runningCost: 1.2,
        jumpCost: 9,
        attackDamage: 35,
        walkSpeed: 5.5,
        runSpeed: 11,
        jumpForce: 16
    }
};

class GameDataSystem {
    constructor(game) {
        this.game = game;

        // Initialize sub-systems
        this.storage = new GameDataStorage(this);
        this.exporter = new GameDataExporter(this);
        this.importer = new GameDataImporter(this);
        this.validator = new GameDataValidator(this);

        // Store reference to default character stats
        this.defaultCharacterStats = DEFAULT_CHARACTER_STATS;

        // Default game data structure
        this.defaultGameData = {
            gameInfo: {
                title: "Platform RPG Game",
                version: "1.0.0",
                lastModified: new Date().toISOString().split('T')[0]
            },
            scenes: [],
            currentSceneId: null,
            startSceneId: null,
            characters: [],
            classes: [],
            weapons: [],
            items: [],
            inventoryItems: [],
            gameSettings: {
                hud: {
                    position: { x: 20, y: 20 },
                    width: 220,
                    height: 80
                }
            },
            GUISettings: {
                theme: 'none' // Default theme is none (current styling)
            },
            playerSettings: {
                maxHealth: 100,
                healthRegen: 0,
                maxStamina: 100,
                staminaRegen: 5,
                attackDamage: 25,
                walkSpeed: 5,
                runSpeed: 10,
                jumpForce: 15
            },
            characterSettings: {
                selectedCharacter: 'soldier', // Default character
                availableCharacters: ['soldier', 'dwarfWarrior', 'wizard', 'archer'], // All characters available by default
                characterStats: JSON.parse(JSON.stringify(DEFAULT_CHARACTER_STATS)) // Deep copy of default stats
            }
        };

        // Current game data
        this.gameData = { ...this.defaultGameData };
    }

    initialize() {
        // Initialize all sub-systems
        this.storage.initialize();
        this.exporter.initialize();
        this.importer.initialize();
        this.validator.initialize();

        // Load saved data from localStorage (especially gameSettings, playerSettings, GUISettings, and characterSettings)
        this.loadSavedGameSettings();
        this.loadSavedPlayerSettings();
        this.loadSavedGUISettings();
        this.loadSavedCharacterSettings();

        // Set up event listeners
        this.setupEventListeners();
    }

    // Load just the gameSettings from localStorage (not full game data)
    loadSavedGameSettings() {
        try {
            const savedData = this.storage.loadFromLocalStorage();
            if (savedData && savedData.gameSettings) {
                // Apply only the gameSettings, not scenes or other data
                this.gameData.gameSettings = savedData.gameSettings;

                // HUD settings will be loaded by the HUD system itself via loadSettings()
                // Don't apply them here as it would bypass the manual position/size system
            }
        } catch (error) {
            console.error('Error loading game settings:', error);
        }
    }

    // Load just the playerSettings from localStorage (not full game data)
    loadSavedPlayerSettings() {
        try {
            const savedData = this.storage.loadFromLocalStorage();

            if (savedData && savedData.playerSettings) {

                // Apply only the playerSettings
                this.gameData.playerSettings = savedData.playerSettings;

                // Apply player settings immediately if player system exists
                if (this.game.playerSystem && this.game.playerSystem.data) {
                    const player = this.game.playerSystem.data;

                    // Determine which character is being used
                    // Check savedData first since characterSettings might not be loaded into player yet
                    const selectedCharacter = savedData.characterSettings?.selectedCharacter ||
                                            player.selectedCharacter ||
                                            'soldier';

                    // Try to get character-specific stats first
                    let settings = null;
                    if (savedData.characterSettings?.characterStats?.[selectedCharacter]) {
                        settings = savedData.characterSettings.characterStats[selectedCharacter];
                    } else {
                        // Fall back to global player settings
                        settings = savedData.playerSettings;
                    }

                    // Apply saved settings to player
                    player.maxHealth = settings.maxHealth || 100;
                    player.healthRegenRate = settings.healthRegen || 0;
                    player.maxStamina = settings.maxStamina || 100;
                    player.staminaRegenRate = settings.staminaRegen || 5;
                    player.attackDamage = settings.attackDamage || 25;
                    player.speed = settings.walkSpeed || 5;
                    player.runSpeed = settings.runSpeed || 10;
                    player.jumpPower = -Math.abs(settings.jumpForce || 15);
                    player.jumpCost = settings.jumpCost || 10;
                    player.runningCost = settings.runningCost || 1.5;

                    // Initialize health and stamina to max values
                    player.health = player.maxHealth;
                    player.stamina = player.maxStamina;

                } else {
                    console.warn('⚠️ Player system not available yet - settings loaded but not applied');
                }
            } else {
            }
        } catch (error) {
            console.error('Error loading player settings:', error);
        }
    }

    setupEventListeners() {
        // Import/Export button event listeners are now handled by InputEditor.js
        // to avoid duplicate event handlers

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentData();
            }
            // Ctrl/Cmd + E to export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportGameData();
            }
        });
    }

    // Load game data on startup
    async loadGameData() {
        // Try to load from MongoDB/storage first
        const savedData = await this.storage.loadGameData();
        if (savedData && savedData.scenes && savedData.scenes.length > 0) {
            // Log what we found

            // Check if at least the tutorial scene has platforms (other scenes might legitimately be empty)
            const tutorialScene = savedData.scenes.find(s => s.name === 'Tutorial' || s.id === 0);
            const hasTutorialPlatforms = tutorialScene && tutorialScene.platforms && tutorialScene.platforms.length > 0;

            if (hasTutorialPlatforms || savedData.scenes.length > 1) {
                this.applyGameData(savedData);
                return;
            } else {
            }
        }

        // No saved data found in MongoDB - proceed with default initialization
        // Check if scene system already has default scenes before applying empty defaults
        if (this.game.sceneSystem && this.game.sceneSystem.data.scenes.length > 0) {
            // Collect current scene data instead of overwriting
            const currentGameData = this.collectCurrentGameData();
            this.gameData = currentGameData;
        } else {
            this.applyGameData(this.defaultGameData);
        }
    }

    // Apply loaded data to the game
    applyGameData(gameData, options = {}) {
        const { skipSave = false } = options;

        // Validate the data first
        if (!this.validator.validateGameData(gameData)) {
            console.error('Invalid game data structure');
            return false;
        }

        this.gameData = gameData;

        // Apply scenes to scene system
        if (this.game.sceneSystem && gameData.scenes) {
            this.game.sceneSystem.data.importSceneData({
                scenes: gameData.scenes,
                currentSceneId: gameData.currentSceneId || (gameData.scenes[0]?.id || null),
                startSceneId: gameData.startSceneId || (gameData.scenes[0]?.id || null)
            });

            // Save the scene data to localStorage using scene system's method
            // Skip save when applying remote updates (data is already in MongoDB)
            if (!skipSave) {
                this.game.sceneSystem.saveScenes();
            } else {
                console.log('⏭️ Skipping save (applying remote data from MongoDB)');
            }

            // Load the appropriate scene
            if (this.game.allSpritesLoaded) {
                const sceneToLoad = gameData.startSceneId || gameData.currentSceneId || gameData.scenes[0]?.id;
                if (sceneToLoad) {
                    this.game.sceneSystem.manager.forceLoadScene(sceneToLoad);
                }
            }
        }

        // Apply other game data (characters, items, etc.)
        if (gameData.characters) this.gameData.characters = gameData.characters;
        if (gameData.classes) this.gameData.classes = gameData.classes;
        if (gameData.weapons) this.gameData.weapons = gameData.weapons;
        if (gameData.items) this.gameData.items = gameData.items;

        // Apply game settings (HUD, etc.)
        if (gameData.gameSettings) {
            this.gameData.gameSettings = gameData.gameSettings;

            // HUD settings will be handled by the HUD system itself
            // The HUD system will read from gameSettings during its loadSettings() call
        }

        // Note: We don't save here because this is called during load/import
        // Saves should only happen explicitly via saveCurrentData() or auto-save
        return true;
    }

    // Save current game state
    async saveCurrentData() {
        const gameData = this.collectCurrentGameData();
        await this.storage.saveGameData(gameData);
    }

    // Update just the current scene ID in localStorage
    updateCurrentSceneId(currentSceneId) {
        this.storage.updateCurrentSceneId(currentSceneId);
    }

    // Update just the gameSettings in localStorage without triggering full save
    updateGameSettings(gameSettings) {
        if (!gameSettings) return;

        // Update the in-memory gameData
        this.gameData.gameSettings = { ...this.gameData.gameSettings, ...gameSettings };

        // Update only gameSettings in localStorage
        this.storage.updateGameSettings(this.gameData.gameSettings);
    }

    updatePlayerSettings(playerSettings) {
        if (!playerSettings) {
            console.warn('⚠️ updatePlayerSettings called with no settings');
            return;
        }


        // Update the in-memory gameData
        this.gameData.playerSettings = { ...this.gameData.playerSettings, ...playerSettings };


        // Update only playerSettings in localStorage
        const success = this.storage.updatePlayerSettings(this.gameData.playerSettings);

        if (success) {
        } else {
            console.error('❌ Failed to save player settings to localStorage');
        }
    }

    // Load just the GUISettings from localStorage
    loadSavedGUISettings() {
        try {
            const savedData = this.storage.loadFromLocalStorage();
            if (savedData && savedData.GUISettings) {
                // Apply only the GUISettings
                this.gameData.GUISettings = savedData.GUISettings;

                // Apply GUI theme immediately
                this.applyGUITheme(savedData.GUISettings.theme);
            }
        } catch (error) {
            console.error('Error loading GUI settings:', error);
        }
    }

    updateGUISettings(guiSettings) {
        if (!guiSettings) return;

        // Update the in-memory gameData
        this.gameData.GUISettings = { ...this.gameData.GUISettings, ...guiSettings };

        // Update only GUISettings in localStorage
        this.storage.updateGUISettings(this.gameData.GUISettings);

        // Apply the theme change immediately
        this.applyGUITheme(guiSettings.theme);
    }

    // Load just the characterSettings from localStorage
    loadSavedCharacterSettings() {
        try {
            const savedData = this.storage.loadFromLocalStorage();

            if (savedData && savedData.characterSettings) {

                // Apply only the characterSettings
                this.gameData.characterSettings = savedData.characterSettings;

                // Apply character settings immediately if player system exists
                if (this.game.playerSystem && this.game.playerSystem.data) {
                    const player = this.game.playerSystem.data;
                    const settings = savedData.characterSettings;

                    // Apply saved character to player
                    const selectedCharacter = settings.selectedCharacter || 'soldier';
                    player.selectedCharacter = selectedCharacter;

                    // Switch character if animator is ready
                    if (this.game.playerSystem.animator && window.playerCharacters) {
                        this.game.playerSystem.animator.switchCharacter(selectedCharacter);
                    } else {
                        console.warn('⚠️ Animator not ready yet - character will load on next init');
                    }
                } else {
                    console.warn('⚠️ Player system not available yet - settings loaded but not applied');
                }
            } else {
            }
        } catch (error) {
            console.error('Error loading character settings:', error);
        }
    }

    async updateCharacterSettings(characterSettings) {
        if (!characterSettings) {
            console.warn('⚠️ updateCharacterSettings called with no settings');
            return;
        }


        // Update the in-memory gameData
        this.gameData.characterSettings = { ...this.gameData.characterSettings, ...characterSettings };


        // Update only characterSettings in localStorage
        const success = this.storage.updateCharacterSettings(this.gameData.characterSettings);

        if (success) {
        } else {
            console.error('❌ Failed to save character settings to localStorage');
        }

        // Save full game data to MongoDB immediately
        await this.saveCurrentData();
        console.log('✅ Character settings saved to MongoDB');
    }

    // Get default stats for a specific character
    getDefaultCharacterStats(characterId) {
        return this.defaultCharacterStats[characterId] ?
               JSON.parse(JSON.stringify(this.defaultCharacterStats[characterId])) :
               null;
    }

    // Get current stats for a specific character
    getCharacterStats(characterId) {
        if (!this.gameData.characterSettings.characterStats) {
            // Initialize if not present
            this.gameData.characterSettings.characterStats = JSON.parse(JSON.stringify(DEFAULT_CHARACTER_STATS));
        }
        return this.gameData.characterSettings.characterStats[characterId] || this.getDefaultCharacterStats(characterId);
    }

    // Update stats for a specific character
    async updateCharacterStats(characterId, stats) {
        if (!characterId || !stats) {
            console.warn('⚠️ updateCharacterStats called with invalid parameters');
            return;
        }

        // Ensure characterStats exists
        if (!this.gameData.characterSettings.characterStats) {
            this.gameData.characterSettings.characterStats = JSON.parse(JSON.stringify(DEFAULT_CHARACTER_STATS));
        }

        // Update stats for specific character
        this.gameData.characterSettings.characterStats[characterId] = { ...stats };

        // Update characterSettings in localStorage
        const success = this.storage.updateCharacterSettings(this.gameData.characterSettings);

        if (success) {
            console.log(`✅ Stats updated for character: ${characterId}`);
        } else {
            console.error('❌ Failed to save character stats to localStorage');
        }

        // Save full game data to MongoDB immediately
        await this.saveCurrentData();
        console.log('✅ Character stats saved to MongoDB');
    }

    // Apply GUI theme to the interface
    applyGUITheme(theme) {
        const body = document.body;

        // Remove any existing theme classes
        body.classList.remove('gui-theme-none', 'gui-theme-fantasy-wooden');

        // Apply new theme class
        if (theme === 'fantasy-wooden') {
            body.classList.add('gui-theme-fantasy-wooden');
        } else {
            body.classList.add('gui-theme-none');
        }
    }

    // Inventory Items Management
    addInventoryItem(item) {
        // Ensure the item has required properties
        if (!item.id || !item.name) {
            console.error('Inventory item must have id and name properties');
            return false;
        }

        // Check if item with this ID already exists
        const existingIndex = this.gameData.inventoryItems.findIndex(i => i.id === item.id);
        if (existingIndex !== -1) {
            console.warn(`Inventory item with ID '${item.id}' already exists. Updating existing item.`);
            this.gameData.inventoryItems[existingIndex] = { ...item };
        } else {
            this.gameData.inventoryItems.push({ ...item });
        }

        // Save to localStorage
        this.storage.updateInventoryItems(this.gameData.inventoryItems);
        return true;
    }

    updateInventoryItems(inventoryItems) {
        // Update inventory items in memory
        this.gameData.inventoryItems = [...inventoryItems];

        // Save to localStorage via storage system
        this.storage.updateInventoryItems(this.gameData.inventoryItems);
    }

    removeInventoryItem(itemId) {
        const index = this.gameData.inventoryItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.gameData.inventoryItems.splice(index, 1);
            this.storage.updateInventoryItems(this.gameData.inventoryItems);
            return true;
        }
        return false;
    }

    getInventoryItems() {
        return [...this.gameData.inventoryItems];
    }

    clearInventoryItems() {
        this.gameData.inventoryItems = [];
        this.storage.updateInventoryItems(this.gameData.inventoryItems);
    }

    // Check if game is ready for auto-save (all systems initialized)
    isReadyForAutoSave() {
        // Check if all sprites are loaded
        if (!this.game.allSpritesLoaded) {
            return false;
        }

        // Check if scene system is initialized
        if (!this.game.sceneSystem || !this.game.sceneSystem.currentScene) {
            return false;
        }

        // Check if enemy system is initialized (if it exists)
        if (this.game.enemySystem && !this.game.enemySystem.isInitialized) {
            return false;
        }

        // Check if NPC system is initialized (if it exists)
        if (this.game.npcSystem && !this.game.npcSystem.isInitialized) {
            return false;
        }

        return true;
    }

    // Collect current game state
    collectCurrentGameData() {
        // Get scene data from scene system
        const sceneData = this.game.sceneSystem ?
            this.game.sceneSystem.exportSceneData() :
            { scenes: [], currentSceneId: null, startSceneId: null };

        // Collect current HUD settings (use unscaled manual values)
        const hudSettings = this.game.hudSystem ? {
            position: this.game.hudSystem.manualPosition || {
                x: this.game.hudSystem.position.x / this.game.hudSystem.uiScale,
                y: this.game.hudSystem.position.y / this.game.hudSystem.uiScale
            },
            width: this.game.hudSystem.manualSize ?
                this.game.hudSystem.manualSize.width :
                (this.game.hudSystem.width / this.game.hudSystem.uiScale),
            height: this.game.hudSystem.manualSize ?
                this.game.hudSystem.manualSize.height :
                (this.game.hudSystem.height / this.game.hudSystem.uiScale)
        } : this.defaultGameData.gameSettings.hud;

        return {
            gameInfo: {
                title: "Platform RPG Game",
                version: "1.0.0",
                lastModified: new Date().toISOString().split('T')[0]
            },
            scenes: sceneData.scenes,
            currentSceneId: sceneData.currentSceneId,
            startSceneId: sceneData.startSceneId,
            characters: this.gameData.characters || [],
            classes: this.gameData.classes || [],
            weapons: this.gameData.weapons || [],
            items: this.gameData.items || [],
            gameSettings: {
                hud: hudSettings
            },
            playerSettings: this.gameData.playerSettings || this.defaultGameData.playerSettings,
            inventoryItems: this.gameData.inventoryItems || [],
            GUISettings: this.gameData.GUISettings || this.defaultGameData.GUISettings,
            characterSettings: this.gameData.characterSettings || this.defaultGameData.characterSettings
        };
    }

    // Export game data to file
    exportGameData() {
        // Save current state first
        this.saveCurrentData();

        // Collect and export data
        const gameData = this.collectCurrentGameData();
        this.exporter.exportToFile(gameData, 'gameData.json');
    }

    // Import game data from file
    importGameData(event) {
        this.importer.importFromFile(event, (gameData) => {
            if (this.applyGameData(gameData)) {
                // Update UI after successful import
                if (this.game.platformSystem) {
                    this.game.platformSystem.selectedPlatform = null;
                    this.game.platformSystem.updatePlatformProperties();
                    this.game.platformSystem.updatePlatformList();
                }

                if (this.game.propSystem) {
                    this.game.propSystem.updatePropList();
                }

                alert('Game data imported successfully!');

                // Reload the page to load the newly imported data from localStorage
                window.location.reload();
            } else {
                alert('Error importing game data. Please check the file format.');
            }
        });
    }

    // Clear all game data
    clearGameData() {
        if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
            this.storage.clearLocalStorage();
            this.gameData = { ...this.defaultGameData };

            // Clear scene system
            if (this.game.sceneSystem) {
                this.game.sceneSystem.data.clearAllScenes();
            }

            // Clear platform system
            if (this.game.platformSystem) {
                this.game.platformSystem.platforms = [];
                this.game.platformSystem.selectedPlatform = null;
                this.game.platformSystem.updatePlatformProperties();
                this.game.platformSystem.updatePlatformList();
            }

            // Clear prop system
            if (this.game.propSystem) {
                this.game.propSystem.props = [];
                this.game.propSystem.updatePropList();
            }
        }
    }
}