class EditorUI {
    constructor(editorSystem) {
        this.editor = editorSystem;
        this.game = editorSystem.game;
    }

    initialize() {
        // Set up UI event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mode switching buttons
        const devModeBtn = document.getElementById('devModeBtn');
        if (devModeBtn) {
            devModeBtn.addEventListener('click', () => {
                this.editor.setDevelopmentMode(true);
            });
        }

        const productionBtn = document.getElementById('productionBtn');
        if (productionBtn) {
            productionBtn.addEventListener('click', () => {
                this.editor.setDevelopmentMode(false);
            });
        }

        const backToDevBtn = document.getElementById('backToDevBtn');
        if (backToDevBtn) {
            backToDevBtn.addEventListener('click', () => {
                this.editor.setDevelopmentMode(true);
            });
        }

        // Dashboard toggle
        const toggleDashboardBtn = document.getElementById('toggleDashboardBtn');
        if (toggleDashboardBtn) {
            toggleDashboardBtn.addEventListener('click', () => {
                this.editor.toggleDashboard();
            });
        }

        // Add transition button
        const addTransitionBtn = document.getElementById('addTransition');
        if (addTransitionBtn) {
            addTransitionBtn.addEventListener('click', () => {
                this.handleAddTransition();
            });
        }

        // Add platform button
        const addPlatformBtn = document.getElementById('addPlatform');
        if (addPlatformBtn) {
            addPlatformBtn.addEventListener('click', () => {
                this.game.platformSystem.togglePlatformPlacement();
            });
        }
    }

    updateUIVisibility(isDev) {
        // Update mode display
        const currentMode = document.getElementById('currentMode');
        if (currentMode) {
            currentMode.textContent = isDev ? 'Development' : 'Production';
        }

        // Show/hide development panels
        const devPanels = [
            'coordinates',
            'platformEditor',
            'backgroundEditor',
            'viewportEditor',
            'propsEditor',
            'sceneProperties'
        ];

        devPanels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.style.display = isDev ? 'block' : 'none';
            }
        });

        // Show/hide development buttons
        const devButtons = [
            'devModeBtn',
            'productionBtn',
            'toggleDashboardBtn',
            'cameraModeBtn',
            'focusPlayerBtn'
        ];

        devButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.display = isDev ? 'inline-block' : 'none';
            }
        });

        // Show/hide back to dev button
        const backToDevBtn = document.getElementById('backToDevBtn');
        if (backToDevBtn) {
            backToDevBtn.style.display = isDev ? 'none' : 'inline-block';
        }

        // Handle dashboard visibility
        if (!isDev) {
            this.editor.showDashboard = false;
            this.toggleDashboard(false);
        } else {
            this.editor.showDashboard = true;
            this.toggleDashboard(true);
        }
    }

    toggleDashboard(show) {
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            if (show) {
                dashboard.classList.remove('hidden');
            } else {
                dashboard.classList.add('hidden');
            }
        }

        // Notify camera system of dashboard state
        if (this.game.cameraSystem) {
            this.game.cameraSystem.setDashboardState(show);
        }
    }

    handleAddTransition() {
        if (!this.editor.isAddingTransition) {
            this.editor.startAddingTransition();
            const btn = document.getElementById('addTransition');
            if (btn) {
                btn.textContent = 'Cancel Transition';
                btn.classList.add('danger');
            }
        } else {
            this.editor.isAddingTransition = false;
            this.editor.transitionStart = null;
            this.editor.transitionEnd = null;
            const btn = document.getElementById('addTransition');
            if (btn) {
                btn.textContent = 'Add Transition Zone';
                btn.classList.remove('danger');
            }
        }
    }

    showTemporaryMessage(message) {
        // Create a temporary message div if it doesn't exist
        let msgDiv = document.getElementById('tempMessage');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'tempMessage';
            msgDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(msgDiv);
        }

        msgDiv.textContent = message;
        msgDiv.style.display = 'block';

        // Hide after 2 seconds
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 2000);
    }
}