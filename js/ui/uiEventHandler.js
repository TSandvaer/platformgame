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

        // Background controls
        document.getElementById('applyBackground').addEventListener('click', () => {
            const selectedBackground = document.getElementById('backgroundSelect').value;
            this.game.sceneSystem.setSceneBackground(selectedBackground);
        });

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

    }

    setupAdditionalListeners() {
        // Prop properties event listeners
        document.getElementById('updateProp').addEventListener('click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.selectedProp.x = parseInt(document.getElementById('propX').value);
                this.game.propSystem.selectedProp.y = parseInt(document.getElementById('propY').value);
                this.game.propSystem.selectedProp.isObstacle = document.getElementById('selectedPropObstacle').checked;

                // Update size multiplier
                const newSize = parseFloat(document.getElementById('propSize').value) || 1.0;
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

        // Context menu event listeners
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

    // Initialize all event listeners
    initialize() {
        this.setupUIListeners();
        this.setupPlatformEditorListeners();
        this.setupAdditionalListeners();
        this.setupSceneEditorListeners();
    }
}