class SceneSystem {
    constructor(game) {
        this.game = game;
        this.data = new SceneData();
        this.manager = new SceneManager(this.data, game);
        this.renderer = new SceneRenderer(this.data, game);
    }

    // Initialization
    initialize() {
        console.log('🔧 SceneSystem initializing...');
        console.log('🔧 Initial scenes count:', this.data.scenes.length);
        if (this.data.scenes.length > 0) {
            console.log('🔧 First scene platforms:', this.data.scenes[0].platforms);
        }

        const loaded = this.loadSavedScenes();
        console.log('🔧 Scene loading result:', loaded);

        // If no saved scenes were loaded, load the default scene
        if (!loaded && this.data.scenes.length > 0) {
            console.log('🔧 No saved scenes found, loading default scene');
            const defaultScene = this.data.scenes[0];
            console.log('🔧 Default scene id:', defaultScene.id, 'name:', defaultScene.name);
            console.log('🔧 Default scene platforms:', defaultScene.platforms);
            this.manager.loadScene(defaultScene.id);
        }

        console.log('🔧 Current scenes:', this.data.scenes.length);
        console.log('🔧 Current scene:', this.data.getCurrentScene());
        console.log('🔧 PlatformSystem platforms after init:', this.game.platformSystem.platforms);
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
        const sceneData = this.data.exportSceneData();
        localStorage.setItem('platformGame_sceneData', JSON.stringify(sceneData));

        // Backward compatibility code removed - old scenes array is no longer used
    }

    loadSavedScenes() {
        const savedData = localStorage.getItem('platformGame_sceneData');
        if (savedData) {
            try {
                const sceneData = JSON.parse(savedData);
                this.data.importSceneData(sceneData);

                // Load the start scene (not the last current scene)
                const startScene = this.data.getStartScene();
                if (startScene) {
                    this.manager.loadScene(startScene.id);
                } else {
                    // Fallback: load first scene if no start scene is set
                    const firstScene = this.data.scenes[0];
                    if (firstScene) {
                        this.manager.loadScene(firstScene.id);
                    }
                }

                return true;
            } catch (e) {
                console.error('Error loading scene data:', e);
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
                    console.log('🔄 Migrating legacy scene data to new format...');

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
                    console.log('✅ Legacy data migrated and old format removed');

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

    // Transition creation
    startAddingTransition() {
        this.manager.startAddingTransition();
    }

    handleTransitionCreation(startX, startY, endX, endY) {
        this.manager.handleTransitionCreation(startX, startY, endX, endY);
    }
}