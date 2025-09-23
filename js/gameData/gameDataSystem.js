class GameDataSystem {
    constructor(game) {
        this.game = game;

        // Initialize sub-systems
        this.storage = new GameDataStorage(this);
        this.exporter = new GameDataExporter(this);
        this.importer = new GameDataImporter(this);
        this.validator = new GameDataValidator(this);

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
            items: []
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

        // Set up event listeners
        this.setupEventListeners();
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
        // Try to load from localStorage first
        const savedData = this.storage.loadFromLocalStorage();
        if (savedData && savedData.scenes && savedData.scenes.length > 0) {
            // Log what we found
            console.log('📂 Found saved data with scenes:', savedData.scenes.map(s => ({
                id: s.id,
                name: s.name,
                platforms: s.platforms ? s.platforms.length : 0
            })));

            // Check if at least the tutorial scene has platforms (other scenes might legitimately be empty)
            const tutorialScene = savedData.scenes.find(s => s.name === 'Tutorial' || s.id === 0);
            const hasTutorialPlatforms = tutorialScene && tutorialScene.platforms && tutorialScene.platforms.length > 0;

            if (hasTutorialPlatforms || savedData.scenes.length > 1) {
                console.log('✅ Loaded valid game data from localStorage');
                this.applyGameData(savedData);
                return;
            } else {
                console.log('⚠️ localStorage data appears incomplete, loading from file instead');
            }
        }

        // Try to load from gameData.json file
        const fileData = await this.storage.loadFromFile('./gameData.json');
        if (fileData) {
            console.log('✅ Loaded game data from gameData.json');
            this.applyGameData(fileData);
            return;
        }

        // Check if scene system already has default scenes before applying empty defaults
        if (this.game.sceneSystem && this.game.sceneSystem.data.scenes.length > 0) {
            console.log('🆕 SceneSystem already has scenes, not overwriting with empty defaults');
            // Collect current scene data instead of overwriting
            const currentGameData = this.collectCurrentGameData();
            this.gameData = currentGameData;
        } else {
            console.log('🆕 Starting with default game state');
            this.applyGameData(this.defaultGameData);
        }
    }

    // Apply loaded data to the game
    applyGameData(gameData) {
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
            this.game.sceneSystem.saveScenes();

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

        // Save the imported data to localStorage
        this.storage.saveToLocalStorage(gameData);
        console.log('💾 Imported data saved to localStorage');

        return true;
    }

    // Save current game state
    saveCurrentData() {
        const gameData = this.collectCurrentGameData();
        this.storage.saveToLocalStorage(gameData);
        console.log('💾 Game data saved to localStorage');
    }

    // Collect current game state
    collectCurrentGameData() {
        // Get scene data from scene system
        const sceneData = this.game.sceneSystem ?
            this.game.sceneSystem.exportSceneData() :
            { scenes: [], currentSceneId: null, startSceneId: null };

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
            items: this.gameData.items || []
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

            console.log('🗑️ All game data cleared');
        }
    }
}