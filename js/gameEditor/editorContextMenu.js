class EditorContextMenu {
    constructor(editorSystem) {
        this.editor = editorSystem;
        this.game = editorSystem.game;
        this.contextMenuElement = null;
        this.contextCoords = null;
    }

    initialize() {
        // Get or create context menu element
        this.contextMenuElement = document.getElementById('contextMenu');
        if (!this.contextMenuElement) {
            this.createContextMenuElement();
        }

        // Set up context menu item listeners
        this.setupMenuItemListeners();

        // Set up document click to hide menu
        document.addEventListener('click', (e) => {
            if (!this.contextMenuElement.contains(e.target)) {
                this.hide();
            }
        });
    }

    createContextMenuElement() {
        // Create context menu if it doesn't exist
        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.style.cssText = `
            display: none;
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px 0;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            min-width: 150px;
        `;

        // Add menu items
        const menuItems = [
            { id: 'copyCoords', text: 'Copy Coordinates', icon: '📋' },
            { id: 'addPlatformHere', text: 'Add Platform Here', icon: '⬜' },
            { id: 'addPropHere', text: 'Add Prop Here', icon: '🌳' },
            { id: 'setPlayerStart', text: 'Set Player Start', icon: '🎮' },
            { separator: true },
            { id: 'deleteSelected', text: 'Delete Selected', icon: '🗑️' }
        ];

        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('hr');
                separator.style.cssText = 'margin: 5px 0; border: none; border-top: 1px solid #e0e0e0;';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.id = item.id;
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.text}`;
                menuItem.style.cssText = `
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #333;
                `;
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = '#f0f0f0';
                });
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                });
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);
        this.contextMenuElement = menu;
    }

    setupMenuItemListeners() {
        // Copy coordinates
        const copyCoords = document.getElementById('copyCoords');
        if (copyCoords) {
            copyCoords.addEventListener('click', () => {
                if (this.contextCoords) {
                    this.editor.tools.copyCoordinates(this.contextCoords.x, this.contextCoords.y);
                }
                this.hide();
            });
        }

        // Add platform here
        const addPlatformHere = document.getElementById('addPlatformHere');
        if (addPlatformHere) {
            addPlatformHere.addEventListener('click', () => {
                if (this.contextCoords) {
                    this.editor.tools.addPlatformAt(this.contextCoords.x, this.contextCoords.y);
                }
                this.hide();
            });
        }

        // Add prop here
        const addPropHere = document.getElementById('addPropHere');
        if (addPropHere) {
            addPropHere.addEventListener('click', () => {
                if (this.contextCoords) {
                    // Default to tree prop, but this could open a prop selection menu
                    this.game.propSystem.addProp('tree', this.contextCoords.x, this.contextCoords.y);
                }
                this.hide();
            });
        }

        // Set player start position
        const setPlayerStart = document.getElementById('setPlayerStart');
        if (setPlayerStart) {
            setPlayerStart.addEventListener('click', () => {
                if (this.contextCoords) {
                    this.editor.tools.setPlayerStartPosition(this.contextCoords.x, this.contextCoords.y);
                }
                this.hide();
            });
        }

        // Delete selected
        const deleteSelected = document.getElementById('deleteSelected');
        if (deleteSelected) {
            deleteSelected.addEventListener('click', () => {
                this.deleteSelectedItems();
                this.hide();
            });
        }
    }

    show(e, worldCoords) {
        if (!this.editor.isDevelopmentMode) return;

        // Prevent default browser context menu
        e.preventDefault();

        // Store coordinates for menu actions
        this.contextCoords = {
            x: Math.round(worldCoords.x),
            y: Math.round(worldCoords.y),
            screenX: e.clientX,
            screenY: e.clientY
        };

        // Store in editor system for backward compatibility
        this.editor.contextMenuCoords = this.contextCoords;

        // Position the menu at mouse location
        this.contextMenuElement.style.left = `${e.clientX}px`;
        this.contextMenuElement.style.top = `${e.clientY}px`;
        this.contextMenuElement.style.display = 'block';

        // Adjust position if menu would go off screen
        setTimeout(() => {
            const menuRect = this.contextMenuElement.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) {
                this.contextMenuElement.style.left = `${e.clientX - menuRect.width}px`;
            }
            if (menuRect.bottom > window.innerHeight) {
                this.contextMenuElement.style.top = `${e.clientY - menuRect.height}px`;
            }
        }, 0);

        // Update menu item states based on current selection
        this.updateMenuItemStates();
    }

    hide() {
        if (this.contextMenuElement) {
            this.contextMenuElement.style.display = 'none';
        }
    }

    updateMenuItemStates() {
        // Enable/disable menu items based on current state
        const deleteItem = document.getElementById('deleteSelected');
        if (deleteItem) {
            const hasSelection = this.game.platformSystem.selectedPlatform ||
                                this.game.propSystem.selectedProp;
            deleteItem.style.opacity = hasSelection ? '1' : '0.5';
            deleteItem.style.pointerEvents = hasSelection ? 'auto' : 'none';
        }
    }

    deleteSelectedItems() {
        // Delete selected platform
        if (this.game.platformSystem.selectedPlatform) {
            this.game.platformSystem.deleteSelectedPlatform();
        }

        // Delete selected prop(s)
        if (this.game.propSystem.selectedProp) {
            this.game.propSystem.deleteSelectedProps();
        }
    }
}