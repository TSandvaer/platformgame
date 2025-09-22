class InputEditor {
    constructor(game) {
        this.game = game;
        this.setupEditorListeners();
    }

    setupEditorListeners() {
        this.setupPlatformEditorListeners();
        this.setupSceneEditorListeners();
        this.setupPropsEditorListeners();
        this.setupBackgroundEditorListeners();
        this.setupViewportEditorListeners();
        this.setupImportExportListeners();
    }

    setupPlatformEditorListeners() {
        const addPlatformBtn = document.getElementById('addPlatform');
        if (addPlatformBtn) {
            addPlatformBtn.addEventListener('click', () => {
                this.game.platformSystem.togglePlatformPlacement();
            });
        }

        const updatePlatformBtn = document.getElementById('updatePlatform');
        if (updatePlatformBtn) {
            updatePlatformBtn.addEventListener('click', () => {
                this.game.platformSystem.updateSelectedPlatform();
            });
        }

        const deletePlatformBtn = document.getElementById('deletePlatform');
        if (deletePlatformBtn) {
            deletePlatformBtn.addEventListener('click', () => {
                this.game.platformSystem.deleteSelectedPlatform();
            });
        }

        const platformPositioning = document.getElementById('platformPositioning');
        if (platformPositioning) {
            platformPositioning.addEventListener('change', () => {
                this.game.platformSystem.updateSelectedPlatform();
            });
        }
    }

    setupSceneEditorListeners() {
        const createSceneBtn = document.getElementById('createSceneBtn');
        if (createSceneBtn) {
            createSceneBtn.addEventListener('click', () => {
                const name = prompt('Scene name:', 'New Scene');
                const description = prompt('Scene description:', '');
                if (name !== null) {
                    this.game.sceneSystem.createScene(name, description);
                }
            });
        }

        const saveSceneBtn = document.getElementById('saveSceneBtn');
        if (saveSceneBtn) {
            saveSceneBtn.addEventListener('click', () => {
                this.saveScene();
            });
        }

        const addTransitionBtn = document.getElementById('addTransitionBtn');
        if (addTransitionBtn) {
            addTransitionBtn.addEventListener('click', () => {
                this.game.sceneSystem.startAddingTransition();
            });
        }

        // Scene property inputs
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

        // Scene boundary inputs
        const boundaryInputs = ['boundaryLeft', 'boundaryRight', 'boundaryTop', 'boundaryBottom'];
        boundaryInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.updateSceneBoundaries();
                });
            }
        });

        // Player start position inputs
        const startPosInputs = ['playerStartX', 'playerStartY'];
        startPosInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.updatePlayerStartPosition();
                });
            }
        });

        const updateBoundariesBtn = document.getElementById('updateBoundariesBtn');
        if (updateBoundariesBtn) {
            updateBoundariesBtn.addEventListener('click', () => {
                this.game.sceneSystem.updateSceneBoundaries();
            });
        }
    }

    setupPropsEditorListeners() {
        const addPropBtn = document.getElementById('addPropBtn');
        if (addPropBtn) {
            addPropBtn.addEventListener('click', () => {
                this.game.propSystem.togglePropPlacement();
            });
        }

        const propType = document.getElementById('propType');
        if (propType) {
            propType.addEventListener('change', () => {
                this.game.propSystem.updatePropPlacementType();
            });
        }

        const updatePropBtn = document.getElementById('updateProp');
        if (updatePropBtn) {
            updatePropBtn.addEventListener('click', () => {
                this.game.propSystem.updateSelectedProp();
            });
        }

        const deletePropBtn = document.getElementById('deleteProp');
        if (deletePropBtn) {
            deletePropBtn.addEventListener('click', () => {
                this.game.propSystem.deleteSelectedProp();
            });
        }

        // Prop positioning inputs
        const propInputs = ['propX', 'propY', 'propWidth', 'propHeight', 'propScale'];
        propInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateSelectedProp();
                });
            }
        });

        const propIsObstacle = document.getElementById('propIsObstacle');
        if (propIsObstacle) {
            propIsObstacle.addEventListener('change', () => {
                this.updateSelectedProp();
            });
        }
    }

    setupBackgroundEditorListeners() {
        const applyBackgroundBtn = document.getElementById('applyBackground');
        if (applyBackgroundBtn) {
            applyBackgroundBtn.addEventListener('click', () => {
                const selectedBackground = document.getElementById('backgroundSelect').value;
                this.game.sceneSystem.setSceneBackground(selectedBackground);
            });
        }
    }

    setupViewportEditorListeners() {
        const applyViewportBtn = document.getElementById('applyViewport');
        if (applyViewportBtn) {
            applyViewportBtn.addEventListener('click', () => {
                this.game.applyViewportSettings();
            });
        }

        const resetViewportBtn = document.getElementById('resetViewport');
        if (resetViewportBtn) {
            resetViewportBtn.addEventListener('click', () => {
                this.game.resetViewportSettings();
            });
        }

        const viewportModeSelect = document.getElementById('viewportModeSelect');
        if (viewportModeSelect) {
            viewportModeSelect.addEventListener('change', () => {
                this.game.applyViewportSettings();
            });
        }
    }

    setupImportExportListeners() {
        const exportBtn = document.getElementById('exportGameData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.game.gameDataSystem.exportGameData();
            });
        }

        const importBtn = document.getElementById('importGameDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('importGameData').click();
            });
        }

        const importInput = document.getElementById('importGameData');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                this.game.gameDataSystem.importGameData(e);
            });
        }
    }

    saveScene() {
        const spinner = document.getElementById('saveSpinner');
        const overlay = document.getElementById('sceneSavedOverlay');

        console.log('🔴 SAVE BUTTON CLICKED');
        console.log('🔴 Current scene:', this.game.sceneSystem.data.getCurrentScene()?.name);
        console.log('🔴 Platforms in memory:', this.game.platformSystem.platforms.length);
        console.log('🔴 Props in memory:', this.game.propSystem.props.length);

        if (spinner) spinner.style.display = 'inline-block';

        // Use setTimeout to ensure spinner shows before save operation
        setTimeout(() => {
            console.log('🔴 About to call saveScenes()');
            this.game.sceneSystem.saveScenes();
            console.log('🔴 saveScenes() completed');

            if (spinner) spinner.style.display = 'none';

            // Show overlay briefly
            if (overlay) {
                overlay.style.display = 'flex';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1500);
            }
        }, 10);
    }

    updateSceneBoundaries() {
        const left = parseInt(document.getElementById('boundaryLeft')?.value) || 0;
        const right = parseInt(document.getElementById('boundaryRight')?.value) || 2000;
        const top = parseInt(document.getElementById('boundaryTop')?.value) || 0;
        const bottom = parseInt(document.getElementById('boundaryBottom')?.value) || 1080;

        const currentScene = this.game.sceneSystem.currentScene;
        if (currentScene) {
            currentScene.boundaries = { left, right, top, bottom };
            currentScene.metadata.modified = new Date().toISOString();
        }
    }

    updatePlayerStartPosition() {
        const x = parseInt(document.getElementById('playerStartX')?.value) || 100;
        const y = parseInt(document.getElementById('playerStartY')?.value) || 400;

        const currentScene = this.game.sceneSystem.currentScene;
        if (currentScene) {
            currentScene.settings.playerStartX = x;
            currentScene.settings.playerStartY = y;
            currentScene.metadata.modified = new Date().toISOString();
        }
    }

    updateSelectedProp() {
        if (!this.game.propSystem.selectedProp) return;

        const prop = this.game.propSystem.selectedProp;
        prop.x = parseFloat(document.getElementById('propX')?.value) || prop.x;
        prop.y = parseFloat(document.getElementById('propY')?.value) || prop.y;
        prop.width = parseFloat(document.getElementById('propWidth')?.value) || prop.width;
        prop.height = parseFloat(document.getElementById('propHeight')?.value) || prop.height;
        prop.scale = parseFloat(document.getElementById('propScale')?.value) || prop.scale;
        prop.isObstacle = document.getElementById('propIsObstacle')?.checked || false;
    }
}