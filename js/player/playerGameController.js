/**
 * Player Game Controller
 * Initializes and runs published games in the player app
 * This is a wrapper around PlatformRPG that skips editor functionality
 */

class PlayerGameController {
    constructor(canvas, gameData) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameData = gameData;
        this.game = null;

        this.initialize();
    }

    initialize() {
        try {
            // Create a modified game instance
            // We'll patch the PlatformRPG constructor to skip editor initialization
            const originalEditorSystem = window.EditorSystem;
            const originalGameDataSystem = window.GameDataSystem;

            // Temporarily replace EditorSystem with a dummy
            window.EditorSystem = class DummyEditorSystem {
                constructor(game) {
                    this.game = game;
                    this.isDevelopmentMode = false;
                    this.showDashboard = false;
                    this.ui = { showTemporaryMessage: () => {} };
                    this.contextMenu = { show: () => {}, hide: () => {} };
                    this.tools = { copyCoordinates: () => {} };
                    this.contextMenuCoords = null;
                }
                initialize() {}
                setDevelopmentMode() {}
                toggleDashboard() {}
                renderDevelopmentInfo() {}
            };

            // Temporarily replace GameDataSystem to inject our loaded game data
            const loadedGameData = this.gameData;
            console.log('🎯 About to replace GameDataSystem');
            console.log('   - Original GameDataSystem:', window.GameDataSystem);
            console.log('   - loadedGameData:', loadedGameData);
            console.log('   - loadedGameData.gameSettings:', loadedGameData?.gameSettings);
            console.log('   - loadedGameData.gameSettings.hud:', loadedGameData?.gameSettings?.hud);

            window.GameDataSystem = class PlayerGameDataSystem {
                constructor(game) {
                    console.log('🔧 PlayerGameDataSystem constructor called!');
                    this.game = game;
                    this.gameData = loadedGameData;

                    console.log('🔧 PlayerGameDataSystem constructor');
                    console.log('   - loadedGameData:', loadedGameData);
                    console.log('   - loadedGameData.gameSettings:', loadedGameData?.gameSettings);
                    console.log('   - loadedGameData.gameSettings.hud:', loadedGameData?.gameSettings?.hud);
                    console.log('   - this.gameData set to:', this.gameData);
                    console.log('   - this.gameData.gameSettings:', this.gameData?.gameSettings);

                    // Stub storage to prevent loading from localStorage
                    this.storage = {
                        initialize: () => {},
                        loadFromLocalStorage: () => null,
                        saveGameData: () => {},
                        updateCurrentSceneId: () => {}
                    };

                    // Stub other sub-systems
                    this.exporter = { initialize: () => {} };
                    this.importer = { initialize: () => {} };
                    this.validator = {
                        initialize: () => {},
                        validateGameData: () => true
                    };

                    // Set pending import directly on game instance during construction
                    if (game && loadedGameData && loadedGameData.scenes) {
                        game.pendingGameDataImport = loadedGameData;
                    }
                }
                initialize() {
                    // Ensure pending import is set
                    if (this.game && loadedGameData && loadedGameData.scenes) {
                        this.game.pendingGameDataImport = loadedGameData;
                        console.log('Game data injected:', loadedGameData);
                    }

                    // Load all game settings (HUD, player, GUI, character)
                    this.loadSavedGameSettings();
                    this.loadSavedPlayerSettings();
                    this.loadSavedGUISettings();
                    this.loadSavedCharacterSettings();
                }
                loadSavedGameSettings() {
                    // Apply game settings from loaded data
                    if (loadedGameData && loadedGameData.gameSettings) {
                        this.gameData.gameSettings = loadedGameData.gameSettings;
                        console.log('🎮 Player mode: Loading HUD settings:', loadedGameData.gameSettings.hud);

                        // Apply HUD settings if HUD system exists
                        if (this.game.hudSystem && loadedGameData.gameSettings.hud) {
                            console.log('🎮 Player mode: Applying HUD settings to HUD system');
                            this.game.hudSystem.loadSettings(loadedGameData.gameSettings.hud);
                        } else {
                            console.warn('⚠️ Player mode: HUD system not ready yet, settings will be loaded during HUD init');
                        }
                    } else {
                        console.warn('⚠️ Player mode: No gameSettings found in loaded data');
                    }
                }
                loadSavedPlayerSettings() {
                    // Apply player settings from loaded data
                    if (loadedGameData && loadedGameData.playerSettings) {
                        this.gameData.playerSettings = loadedGameData.playerSettings;

                        if (this.game.playerSystem && this.game.playerSystem.data) {
                            const player = this.game.playerSystem.data;
                            const settings = loadedGameData.playerSettings;

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

                            if (player.health > player.maxHealth) player.health = player.maxHealth;
                            if (player.stamina > player.maxStamina) player.stamina = player.maxStamina;
                        }
                    }
                }
                loadSavedGUISettings() {
                    // Apply GUI settings from loaded data
                    if (loadedGameData && loadedGameData.GUISettings) {
                        this.gameData.GUISettings = loadedGameData.GUISettings;
                    }
                }
                loadSavedCharacterSettings() {
                    // Apply character settings from loaded data
                    if (loadedGameData && loadedGameData.characterSettings) {
                        this.gameData.characterSettings = loadedGameData.characterSettings;

                        if (this.game.playerSystem && this.game.playerSystem.data) {
                            const player = this.game.playerSystem.data;
                            const settings = loadedGameData.characterSettings;

                            const selectedCharacter = settings.selectedCharacter || 'soldier';
                            player.selectedCharacter = selectedCharacter;

                            if (this.game.playerSystem.animator && window.playerCharacters) {
                                this.game.playerSystem.animator.switchCharacter(selectedCharacter);
                            }
                        }
                    }
                }
                setupEventListeners() {}
                exportGameData() {
                    return loadedGameData;
                }
                collectCurrentGameData() {
                    return loadedGameData;
                }
            };

            // Create the game instance
            this.game = new PlatformRPG();

            // CRITICAL FIX: Override the gameData that was set by GameDataSystem constructor
            // The real GameDataSystem constructor sets this.gameData = {...this.defaultGameData}
            // which contains hardcoded HUD settings {width: 220, height: 80}
            // We need to replace it with our loaded data from MongoDB
            if (this.game.gameDataSystem && loadedGameData) {
                console.log('🔥 OVERRIDE: Replacing gameDataSystem.gameData with loaded data');
                console.log('   - Before override (defaults):', this.game.gameDataSystem.gameData.gameSettings?.hud);

                // Replace the entire gameData object with our loaded data
                this.game.gameDataSystem.gameData = loadedGameData;

                console.log('   - After override (from MongoDB):', this.game.gameDataSystem.gameData.gameSettings?.hud);

                // Force HUD system to reload settings with the correct data
                if (this.game.hudSystem && loadedGameData.gameSettings?.hud) {
                    console.log('🔥 OVERRIDE: Forcing HUD to reload settings');
                    this.game.hudSystem.loadSettings(loadedGameData.gameSettings.hud);
                }
            }

            // Double-check that pending import is set (safety check)
            if (!this.game.pendingGameDataImport && loadedGameData && loadedGameData.scenes) {
                this.game.pendingGameDataImport = loadedGameData;
                console.log('Game data set after construction (safety check):', loadedGameData);
            }

            // Restore original classes
            window.EditorSystem = originalEditorSystem;
            window.GameDataSystem = originalGameDataSystem;

            // Force production mode and hide dashboard
            this.game.editorSystem.isDevelopmentMode = false;
            this.game.editorSystem.showDashboard = false;
            this.game.showDashboard = false;

            // Notify camera system that dashboard is hidden
            if (this.game.cameraSystem) {
                this.game.cameraSystem.setDashboardState(false);
            }

            // Update viewport for full-screen rendering (no dashboard)
            if (this.game.viewportSystem) {
                this.game.viewportSystem.updateViewport();
            }

            // Hide dashboard elements
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.style.display = 'none';
            }

            const controls = document.querySelector('.controls');
            if (controls) {
                controls.style.display = 'none';
            }

            // Resize canvas to full viewport
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            console.log('Player game initialized successfully');
        } catch (error) {
            console.error('Error initializing player game:', error);
            throw error;
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.game && this.game.viewportSystem) {
            this.game.viewportSystem.updateViewport();
        }
    }

    getGame() {
        return this.game;
    }
}

// Export for use in player app
window.PlayerGameController = PlayerGameController;
