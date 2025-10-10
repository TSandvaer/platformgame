/**
 * Handles all scene-related UI interactions
 */
class SceneUIHandler extends UIHandler {
    constructor(game) {
        super(game);
    }

    /**
     * Initialize scene UI event listeners
     */
    initialize() {
        this.setupSceneEditorListeners();
    }

    /**
     * Set up scene editor event listeners
     */
    setupSceneEditorListeners() {
        // Scene management controls
        this.addListener('createSceneBtn', 'click', () => {
            const name = prompt('Scene name:', 'New Scene');
            const description = prompt('Scene description:', '');
            if (name !== null) {
                this.game.sceneSystem.createScene(name, description);
            }
        });

        this.addListener('saveSceneBtn', 'click', () => {
            const spinner = this.getElementById('saveSpinner');
            const overlay = this.getElementById('sceneSavedOverlay');
            if (spinner) spinner.style.display = 'inline-block';

            // Use setTimeout to ensure spinner shows before save operation
            setTimeout(() => {
                this.game.sceneSystem.saveScenes();
                if (spinner) spinner.style.display = 'none';

                // Show overlay briefly
                if (overlay) {
                    overlay.style.display = 'flex';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 1500);
                }
            }, 10);
        });

        // Scene property inputs - use onchange events for real-time updates
        const sceneNameInput = this.getElementById('sceneName');
        if (sceneNameInput) {
            sceneNameInput.addEventListener('change', () => {
                this.game.sceneSystem.updateSceneName(sceneNameInput.value);
            });
        }

        const sceneDescInput = this.getElementById('sceneDescription');
        if (sceneDescInput) {
            sceneDescInput.addEventListener('change', () => {
                this.game.sceneSystem.updateSceneDescription(sceneDescInput.value);
            });
        }

        // Boundary update button
        this.addListener('updateBoundariesBtn', 'click', () => {
            this.game.updateSceneBoundaries();
        });

        // Add transition zone button
        this.addListener('addTransitionBtn', 'click', () => {
            this.game.isAddingTransition = !this.game.isAddingTransition;
            const btn = this.getElementById('addTransitionBtn');
            if (btn) {
                btn.textContent = this.game.isAddingTransition ? 'Cancel Adding Transition' : 'Add Transition Zone';
                btn.classList.toggle('danger', this.game.isAddingTransition);
            }
        });
    }
}