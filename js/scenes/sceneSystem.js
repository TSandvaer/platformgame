class SceneSystem {
    constructor(game) {
        this.game = game;
        this.data = new SceneData();
        this.manager = new SceneManager(this.data, game);
        this.renderer = new SceneRenderer(this.data, game);

        // Transition zone creation state
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    // Initialization
    initialize() {
        if (this.data.scenes.length > 0) {
        }

        const loaded = this.loadSavedScenes();
        // If no saved scenes were loaded, load the default scene
        if (!loaded && this.data.scenes.length > 0) {
            const defaultScene = this.data.scenes[0];
            this.manager.loadScene(defaultScene.id);
        } else if (loaded) {
        } else {
        }
        // Temporary alert-based debugging to see what's happening
        const currentScene = this.data.getCurrentScene();
        if (currentScene) {
            console.warn(`DEBUG: Current scene "${currentScene.name}" has ${currentScene.platforms?.length || 0} platforms`);
            console.warn(`DEBUG: PlatformSystem has ${this.game.platformSystem.platforms.length} platforms loaded`);
        } else {
            console.warn('DEBUG: No current scene set!');
        }
        this.manager.updateSceneUI();
    }

    // Scene data access
    get scenes() {
        return this.data.scenes;
    }

    get currentScene() {
        return this.data.getCurrentScene();
    }

    get startScene() {
        return this.data.getStartScene();
    }

    // Scene management
    createScene(name, description) {
        return this.manager.createNewScene(name, description);
    }

    loadScene(sceneId, playerStartX = null, playerStartY = null) {
        return this.manager.loadScene(sceneId, playerStartX, playerStartY);
    }

    deleteScene(sceneId) {
        return this.manager.deleteScene(sceneId);
    }

    duplicateScene(sceneId) {
        return this.manager.duplicateCurrentScene();
    }

    renameScene(sceneId) {
        const scene = this.data.getSceneById(sceneId);
        if (!scene) return false;

        const newName = prompt('Enter new scene name:', scene.name);
        if (newName !== null && newName.trim() !== '' && newName !== scene.name) {
            scene.name = newName.trim();
            scene.metadata.modified = new Date().toISOString();
            this.updateUI();
            return true;
        }
        return false;
    }

    setStartScene(sceneId) {
        return this.manager.setStartScene(sceneId);
    }

    // Get scene boundaries for physics constraints
    getSceneBoundaries() {
        const currentScene = this.currentScene;
        if (!currentScene || !currentScene.boundaries) {
            return null;
        }
        return currentScene.boundaries;
    }

    // Background management
    setSceneBackground(backgroundName) {
        const currentScene = this.currentScene;
        if (currentScene) {
            // Initialize background property if it doesn't exist
            if (!currentScene.background) {
                currentScene.background = {
                    name: 'none',
                    layers: []
                };
            }
            currentScene.background.name = backgroundName;
            currentScene.background.layers = [];
            currentScene.metadata.modified = new Date().toISOString();

            // Save the scene data to persist the background change
            this.saveScenes();

            // Load the background in the game
            this.game.loadBackground(backgroundName);
        }
    }

    // Transition management
    addTransitionZone(x, y, width, height, targetSceneId, playerStartX, playerStartY) {
        return this.manager.addTransitionZone(x, y, width, height, targetSceneId, playerStartX, playerStartY);
    }

    removeTransitionZone(zoneId) {
        return this.manager.removeTransitionZone(zoneId);
    }

    checkTransitions(playerX, playerY) {
        this.manager.checkTransitions(playerX, playerY);
    }

    // Rendering
    renderTransitionZones(ctx) {
        if (this.game.isDevelopmentMode) {
            this.renderer.renderTransitionZones(ctx);
        }
    }

    // Save/Load
    saveScenes() {
        this.manager.saveCurrentSceneData();

        // Use the GameDataSystem to save all game data
        if (this.game.gameDataSystem) {
            this.game.gameDataSystem.saveCurrentData();
        }
    }

    loadSavedScenes() {
        // First try to load from the GameDataSystem's complete data
        if (this.game.gameDataSystem) {
            const completeData = this.game.gameDataSystem.storage.loadFromLocalStorage();
            if (completeData && completeData.scenes) {
                this.data.importSceneData({
                    scenes: completeData.scenes,
                    currentSceneId: completeData.currentSceneId,
                    startSceneId: completeData.startSceneId
                });

                // Load the last current scene
                const currentSceneId = completeData.currentSceneId;
                if (currentSceneId) {
                    const sceneToLoad = this.data.getSceneById(currentSceneId);
                    this.manager.loadScene(currentSceneId);
                } else {
                    const startScene = this.data.getStartScene();
                    if (startScene) {
                        this.manager.loadScene(startScene.id);
                    } else {
                        const firstScene = this.data.scenes[0];
                        if (firstScene) {
                            this.manager.loadScene(firstScene.id);
                        }
                    }
                }
                return true;
            }
        }

        // Fallback: try to load from old format
        return this.loadLegacyScenes();
    }

    loadLegacyScenes() {
        const savedScenes = localStorage.getItem('platformGame_scenes');
        if (savedScenes) {
            try {
                const oldScenes = JSON.parse(savedScenes);
                if (oldScenes.length > 0) {
                    // Convert old format to new format
                    this.data.scenes = oldScenes.map((scene, index) => ({
                        id: scene.id || index + 1,
                        name: scene.name || `Scene ${index + 1}`,
                        description: scene.description || '',
                        platforms: scene.platforms || [],
                        props: scene.props || [],
                        background: scene.background || { name: 'none', layers: [] },
                        transitions: { zones: [] },
                        boundaries: { left: 0, right: 2000, top: 0, bottom: 1000 },
                        settings: {
                            playerStartX: 100,
                            playerStartY: 100,
                            gravity: 0.8,
                            playerSpeed: 5
                        },
                        metadata: {
                            created: new Date().toISOString(),
                            modified: new Date().toISOString()
                        }
                    }));

                    this.data.currentSceneId = this.data.scenes[0].id;
                    this.data.startSceneId = this.data.scenes[0].id;

                    // Save in new format
                    this.saveScenes();

                    // Delete old format to prevent future confusion
                    localStorage.removeItem('platformGame_scenes');
                    // Load the first scene
                    this.manager.loadScene(this.data.scenes[0].id);
                    return true;
                }
            } catch (e) {
                console.error('Error loading legacy scenes:', e);
            }
        }
        return false;
    }

    // Export/Import
    exportSceneData() {
        this.manager.saveCurrentSceneData();
        return this.data.exportSceneData();
    }

    importSceneData(data) {
        return this.data.importSceneData(data);
    }

    // Production mode
    startGame() {
        const startScene = this.data.getStartScene();
        if (startScene) {
            this.manager.loadScene(startScene.id);
            return true;
        }
        return false;
    }

    // UI Updates
    updateUI() {
        this.manager.updateSceneUI();
    }

    // Properties
    updateSceneName(name) {
        this.manager.updateSceneName(name);
    }

    updateSceneDescription(description) {
        this.manager.updateSceneDescription(description);
    }

    updatePlayerStart() {
        this.manager.updatePlayerStart();
    }

    updateSceneBoundaries(left, right, top, bottom) {
        this.manager.updateSceneBoundaries(left, right, top, bottom);
    }

    // Transition creation
    startAddingTransition() {
        this.isAddingTransition = true;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    setTransitionStart(x, y) {
        if (!this.isAddingTransition) return;
        this.transitionStart = { x, y };
        this.transitionEnd = { x, y };
    }

    setTransitionEnd(x, y) {
        if (!this.isAddingTransition || !this.transitionStart) return;
        this.transitionEnd = { x, y };
    }

    finishTransitionCreation() {
        if (!this.isAddingTransition || !this.transitionStart || !this.transitionEnd) return;

        const startX = this.transitionStart.x;
        const startY = this.transitionStart.y;
        const endX = this.transitionEnd.x;
        const endY = this.transitionEnd.y;

        // Create the transition zone using the existing manager method
        this.manager.handleTransitionCreation(startX, startY, endX, endY);

        // Reset state
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    cancelTransitionCreation() {
        this.isAddingTransition = false;
        this.transitionStart = null;
        this.transitionEnd = null;
    }

    renderTransitionPreview(ctx) {
        if (!this.isAddingTransition || !this.transitionStart || !this.transitionEnd) return;

        ctx.save();

        // Calculate rectangle bounds
        const x = Math.min(this.transitionStart.x, this.transitionEnd.x);
        const y = Math.min(this.transitionStart.y, this.transitionEnd.y);
        const width = Math.abs(this.transitionEnd.x - this.transitionStart.x);
        const height = Math.abs(this.transitionEnd.y - this.transitionStart.y);

        // Draw semi-transparent purple rectangle
        ctx.fillStyle = 'rgba(128, 0, 128, 0.3)';
        ctx.fillRect(x, y, width, height);

        // Draw border
        ctx.strokeStyle = 'rgba(128, 0, 128, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw corner indicators
        ctx.fillStyle = 'rgba(128, 0, 128, 0.8)';
        const cornerSize = 5;
        ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);

        ctx.restore();
    }

    handleTransitionCreation(startX, startY, endX, endY) {
        this.manager.handleTransitionCreation(startX, startY, endX, endY);
    }
}