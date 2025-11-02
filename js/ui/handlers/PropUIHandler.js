/**
 * Handles all prop-related UI interactions
 */
class PropUIHandler extends UIHandler {
    constructor(game, modalHandler) {
        super(game);
        this.modalHandler = modalHandler;
        this.selectedModalPropType = null;
        this._mouseDownTarget = null; // Track where mousedown started for proper click-outside detection
    }

    /**
     * Initialize prop UI event listeners
     */
    initialize() {
        this.setupPropsEditorListeners();
        this.setupLegacyPropListeners();
        this.setupPropZOrderListeners();
        this.setupPropDropListeners();
        this.setupPropPlatformBindingListeners();
        this.setupPropMovementListeners();
    }

    /**
     * Set up legacy prop controls (for backward compatibility)
     */
    setupLegacyPropListeners() {
        // Props controls (old UI - optional, kept for backward compatibility)
        const addPropBtn = this.getElementById('addPropBtn', true); // Silent - optional element
        if (addPropBtn) {
            addPropBtn.addEventListener('click', () => {
                this.game.propSystem.togglePropPlacement();
            });
        }

        // Auto-update size when prop type changes (old UI - optional)
        const propTypeSelect = this.getElementById('propTypeSelect', true); // Silent - optional element
        if (propTypeSelect) {
            propTypeSelect.addEventListener('change', (e) => {
                const propType = e.target.value;
                const sizeInput = this.getElementById('propSizeInput', true); // Silent - optional element

                if (sizeInput) {
                    // Set default size based on prop type (all default to 1.5 now)
                    const defaultSize = 1.5;
                    sizeInput.value = defaultSize.toFixed(1);
                }
            });
        }

        this.addListener('clearPropsBtn', 'click', () => {
            if (confirm('Clear all props? This cannot be undone.')) {
                this.game.propSystem.props = [];
                this.game.propSystem.selectedProp = null;
                this.game.propSystem.updatePropProperties();
            }
        });
    }

    /**
     * Set up props editor modal event listeners
     */
    setupPropsEditorListeners() {
        // Open sprite editor button
        const spriteEditorBtn = this.getElementById('openSpriteEditorBtn');
        if (spriteEditorBtn) {
            spriteEditorBtn.addEventListener('click', () => {
                if (window.uiEventHandler && window.uiEventHandler.spriteEditorHandler) {
                    window.uiEventHandler.spriteEditorHandler.open();
                }
            });
        }

        // Open props editor button
        const openBtn = this.getElementById('openPropsEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openPropsEditorModal();
            });
        }

        // Close props editor modal
        const closeBtn = this.getElementById('closePropsEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePropsEditorModal();
            });
        }

        // Click outside to close - track mousedown and mouseup to prevent closing during text selection drag
        const modal = this.getElementById('propsEditorModal');
        if (modal) {
            modal.addEventListener('mousedown', (e) => {
                this._mouseDownTarget = e.target;
            });

            modal.addEventListener('mouseup', (e) => {
                // Only close if both mousedown and mouseup happened on the modal overlay
                if (e.target === modal && this._mouseDownTarget === modal) {
                    this.closePropsEditorModal();
                }
                this._mouseDownTarget = null;
            });
        }

        // Modal "Add Prop" button
        const modalAddBtn = this.getElementById('modalAddPropBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addPropFromModal();
            });
        }
    }

    /**
     * Set up prop z-order controls (send to back/bring to front)
     */
    setupPropZOrderListeners() {
        // Send to background button
        this.addListener('sendToBackground', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.movePropToBack();
            }
        });

        // Bring to front button
        this.addListener('bringToFront', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.movePropToFront();
            }
        });
    }

    /**
     * Open the props editor modal
     */
    openPropsEditorModal() {
        const modal = this.getElementById('propsEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderPropsGrid();
        }
    }

    /**
     * Close the props editor modal
     */
    closePropsEditorModal() {
        const modal = this.getElementById('propsEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selection
        this.selectedModalPropType = null;
        this.updateModalPropConfig();
    }

    /**
     * Render the props grid in the modal
     */
    renderPropsGrid() {
        const container = this.getElementById('propsGridContainer');
        if (!container) return;

        const propData = this.game.propSystem.data;
        const categories = propData.getCategories();

        let html = '';

        categories.forEach(category => {
            const props = propData.getPropsByCategory(category);
            if (props.length === 0) return;

            html += `<div class="prop-category">
                <h4 style="margin: 15px 0 10px 0; color: #4CAF50; font-size: 14px; border-bottom: 1px solid #444; padding-bottom: 5px;">${category}</h4>
                <div class="props-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-bottom: 20px;">`;

            props.forEach(prop => {
                const isSelected = this.selectedModalPropType === prop.id;
                html += `<div class="prop-grid-item ${isSelected ? 'selected' : ''}" data-prop-id="${prop.id}" style="
                    cursor: pointer;
                    padding: 6px;
                    background-color: ${isSelected ? '#2a4a2a' : '#333'};
                    border: 2px solid ${isSelected ? '#4CAF50' : 'transparent'};
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.2s;
                    min-height: 100px;
                ">
                    <div style="
                        width: 100%;
                        flex: 1;
                        background-color: #F9F7F5;
                        border-radius: 3px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                    ">
                        <canvas class="prop-thumbnail" data-prop-id="${prop.id}" width="64" height="64" style="image-rendering: pixelated; max-width: 100%; max-height: 100%; background: transparent;"></canvas>
                    </div>
                    <div style="font-size: 10px; color: #ccc; text-align: center; word-wrap: break-word; width: 100%;">${prop.name}</div>
                </div>`;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;

        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .prop-grid-item:hover {
                background-color: #3a3a3a !important;
                border-color: #666 !important;
            }
            .prop-grid-item.selected:hover {
                background-color: #2a4a2a !important;
                border-color: #4CAF50 !important;
            }
        `;
        if (!document.getElementById('propsGridStyles')) {
            style.id = 'propsGridStyles';
            document.head.appendChild(style);
        }

        // Render thumbnails
        this.renderPropThumbnails();

        // Add click handlers
        container.querySelectorAll('.prop-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const propId = item.dataset.propId;
                this.selectPropType(propId);
            });
        });
    }

    /**
     * Render prop thumbnails
     */
    renderPropThumbnails() {
        const propData = this.game.propSystem.data;
        const canvases = document.querySelectorAll('.prop-thumbnail');

        canvases.forEach(canvas => {
            const propId = canvas.dataset.propId;
            const propType = propData.propTypes[propId];

            if (!propType) return;

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Handle chests differently (they use a different sprite sheet)
            if (propType.isChest) {
                this.renderChestThumbnail(ctx, propType, canvas);
            } else {
                this.renderRegularPropThumbnail(ctx, propType, canvas);
            }
        });
    }

    /**
     * Render regular prop thumbnail
     */
    renderRegularPropThumbnail(ctx, propType, canvas) {
        // Use the already-loaded image from the game's platform sprites
        const platformSprites = this.game.platformSystem.renderer.platformSprites;

        // Get sprite sheet based on propType's spriteSheet property, default to villageProps for backward compatibility
        const spriteSheetName = propType.spriteSheet || 'villageProps';
        const spriteSheet = platformSprites[spriteSheetName];

        if (!spriteSheet) {
            console.warn(`Sprite sheet '${spriteSheetName}' not found for prop type '${propType.name}'`);
            return;
        }

        const img = spriteSheet.image;

        if (!img || !img.complete) {
            // If image isn't loaded yet, try again after a short delay
            setTimeout(() => {
                this.renderRegularPropThumbnail(ctx, propType, canvas);
            }, 100);
            return;
        }

        // Calculate scaling to fit in max 64x64, maintaining aspect ratio
        const maxSize = 64;
        const scale = Math.min(maxSize / propType.width, maxSize / propType.height, 1.0); // Don't scale up, only down
        const renderWidth = propType.width * scale;
        const renderHeight = propType.height * scale;

        // Resize canvas to actual render size to avoid stretching
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = renderWidth + 'px';
        canvas.style.height = renderHeight + 'px';

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // If tileWidth/tileHeight match the full image dimensions, treat tileX/tileY as pixel coordinates
        // Otherwise, treat them as tile coordinates that need to be multiplied
        let sourceX, sourceY;
        if (spriteSheet.tileWidth === img.width && spriteSheet.tileHeight === img.height) {
            // Non-tiled sprite sheet: use pixel coordinates directly
            sourceX = propType.tileX;
            sourceY = propType.tileY;
        } else {
            // Tiled sprite sheet: multiply by tile dimensions
            sourceX = propType.tileX * spriteSheet.tileWidth;
            sourceY = propType.tileY * spriteSheet.tileHeight;
        }

        ctx.drawImage(
            img,
            sourceX, sourceY, propType.width, propType.height,
            0, 0, renderWidth, renderHeight
        );
    }

    /**
     * Render chest thumbnail
     */
    renderChestThumbnail(ctx, propType, canvas) {
        // Use the already-loaded chest sprite from prop renderer
        const propSprites = this.game.propSystem.renderer.propSprites;
        const img = propSprites.chestAnimation.image;

        if (!img || !img.complete) {
            // If image isn't loaded yet, try again after a short delay
            setTimeout(() => {
                this.renderChestThumbnail(ctx, propType, canvas);
            }, 100);
            return;
        }

        // Chests use 73x73 frames in the loaded spritesheet
        const frameSize = 73;
        const maxSize = 64;
        const scale = Math.min(maxSize / frameSize, 1.0); // Don't scale up
        const renderWidth = frameSize * scale;
        const renderHeight = frameSize * scale;

        // Resize canvas to actual render size
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = renderWidth + 'px';
        canvas.style.height = renderHeight + 'px';

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chest sprite: frame 0 (closed), row based on chest type
        const frameX = 0 * frameSize; // Frame 0 (closed)
        const frameY = propType.chestRow * frameSize;

        ctx.drawImage(
            img,
            frameX, frameY, frameSize, frameSize,
            0, 0, renderWidth, renderHeight
        );
    }

    /**
     * Select a prop type in the modal
     */
    selectPropType(propId) {
        this.selectedModalPropType = propId;

        // Update visual selection
        document.querySelectorAll('.prop-grid-item').forEach(item => {
            const isSelected = item.dataset.propId === propId;
            item.classList.toggle('selected', isSelected);
            item.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            item.style.borderColor = isSelected ? '#4CAF50' : 'transparent';
        });

        // Update configuration panel
        this.updateModalPropConfig();
    }

    /**
     * Update modal prop configuration display
     */
    updateModalPropConfig() {
        const configDiv = this.getElementById('selectedPropConfig');
        const noSelectionDiv = this.getElementById('noPropSelected');
        const propNameSpan = this.getElementById('selectedPropTypeName');

        if (this.selectedModalPropType) {
            const propType = this.game.propSystem.data.propTypes[this.selectedModalPropType];
            if (propType) {
                configDiv.style.display = 'block';
                noSelectionDiv.style.display = 'none';
                propNameSpan.textContent = propType.name;
            }
        } else {
            configDiv.style.display = 'none';
            noSelectionDiv.style.display = 'block';
        }
    }

    /**
     * Add prop from modal configuration
     */
    addPropFromModal() {
        if (!this.selectedModalPropType) {
            alert('Please select a prop type first');
            return;
        }

        // Get values from modal inputs
        const isObstacle = document.getElementById('modalPropObstacleCheck').checked;
        const size = parseFloat(document.getElementById('modalPropSizeInput').value) || 1.5;
        const damage = parseInt(document.getElementById('modalPropDamageInput').value) || 0;
        const destroyable = document.getElementById('modalPropDestroyableCheck').checked;
        const durability = parseInt(document.getElementById('modalPropDurabilityInput').value) || 100;

        // Store these values so propSystem can use them when placing
        this.game.propSystem.pendingPropConfig = {
            type: this.selectedModalPropType,
            isObstacle: isObstacle,
            size: size,
            damage: damage,
            destroyable: destroyable,
            durability: durability
        };

        // Close modal
        this.closePropsEditorModal();

        // Activate prop placement mode
        this.game.propSystem.togglePropPlacement();

    }

    /**
     * Set up prop drop configuration event listeners
     */
    setupPropDropListeners() {
        // Add drop button
        this.addListener('addPropDropBtn', 'click', () => {
            this.showDropConfigModal();
        });

        // Clear all drops button
        this.addListener('clearPropDropsBtn', 'click', () => {
            if (this.game.propSystem.selectedProp && confirm('Clear all drops for this prop?')) {
                delete this.game.propSystem.selectedProp.dropItems;
                this.game.propSystem.manager.updateDropConfigurationUI();
                console.log(`🎁 Cleared all drops for prop ${this.game.propSystem.selectedProp.id}`);
            }
        });

        // Note: Drop configuration modal buttons (closeDropConfigModal, cancelDropConfig, addDropConfirm)
        // are handled dynamically in showDropConfigModal() to avoid conflicts with EnemyUIHandler
    }

    /**
     * Show the drop configuration modal for props
     */
    showDropConfigModal() {
        if (!this.game.propSystem.selectedProp) return;

        // Populate the item dropdown
        const itemSelect = this.getElementById('dropItemSelect');
        if (itemSelect && this.game.inventoryItemsData) {
            itemSelect.innerHTML = '<option value="">Choose an item...</option>';

            // Add all available inventory items
            const inventoryItems = this.game.inventoryItemsData.inventoryItems;
            for (const itemId in inventoryItems) {
                const item = inventoryItems[itemId];
                const option = document.createElement('option');
                option.value = itemId;
                option.textContent = `${item.name} (${itemId})`;
                itemSelect.appendChild(option);
            }
        }

        // Reset form values
        const chanceInput = this.getElementById('dropChanceInput');
        const quantityInput = this.getElementById('dropQuantityInput');
        if (chanceInput) chanceInput.value = '40';
        if (quantityInput) quantityInput.value = '1';

        // Update modal title
        const titleEl = this.getElementById('dropConfigModalTitle');
        if (titleEl) titleEl.textContent = 'Configure Item Drops';

        // Set up modal button event listeners (dynamically to avoid conflicts with EnemyUIHandler)
        // Clone and replace buttons to remove any old listeners
        const confirmBtn = this.getElementById('addDropConfirm');
        const cancelBtn = this.getElementById('cancelDropConfig');
        const closeBtn = this.getElementById('closeDropConfigModal');

        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', () => {
                this.addDropToSelectedProp();
            });
        }

        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.addEventListener('click', () => {
                const modal = this.getElementById('dropConfigModal');
                if (modal) modal.style.display = 'none';
            });
        }

        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', () => {
                const modal = this.getElementById('dropConfigModal');
                if (modal) modal.style.display = 'none';
            });
        }

        // Show modal
        const modal = this.getElementById('dropConfigModal');
        if (modal) modal.style.display = 'flex';
    }

    /**
     * Add a drop item to the selected prop
     */
    addDropToSelectedProp() {
        if (!this.game.propSystem.selectedProp) return;

        const itemId = this.getElementById('dropItemSelect')?.value;
        const inputPercent = parseFloat(this.getElementById('dropChanceInput')?.value);
        const chance = inputPercent / 100; // Convert percentage to decimal
        const quantity = parseInt(this.getElementById('dropQuantityInput')?.value) || 1;

        if (!itemId) {
            alert('Please select an item');
            return;
        }

        if (inputPercent <= 0 || inputPercent > 100) {
            alert('Drop chance must be between 1 and 100%');
            return;
        }

        // Initialize dropItems array on the prop instance if it doesn't exist
        if (!this.game.propSystem.selectedProp.dropItems) {
            this.game.propSystem.selectedProp.dropItems = [];
        }

        // Check if this item is already configured
        const existingIndex = this.game.propSystem.selectedProp.dropItems.findIndex(drop => drop.itemId === itemId);
        if (existingIndex !== -1) {
            // Update existing drop
            this.game.propSystem.selectedProp.dropItems[existingIndex] = { itemId, chance, quantity };
            console.log(`🎁 Updated drop for ${itemId} on prop ${this.game.propSystem.selectedProp.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        } else {
            // Add new drop
            this.game.propSystem.selectedProp.dropItems.push({ itemId, chance, quantity });
            console.log(`🎁 Added drop for ${itemId} to prop ${this.game.propSystem.selectedProp.id}: ${(chance * 100).toFixed(1)}% chance, qty ${quantity}`);
        }

        // Update UI
        this.game.propSystem.manager.updateDropConfigurationUI();

        // Close modal
        const modal = this.getElementById('dropConfigModal');
        if (modal) modal.style.display = 'none';
    }

    /**
     * Set up platform binding buttons
     */
    setupPropPlatformBindingListeners() {
        // Bind to platform button
        this.addListener('bindToPlatform', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.startPlatformBinding(this.game.propSystem.selectedProp);
                // Show visual feedback
                this.showBindingModeMessage();
            } else {
                alert('Please select a prop first');
            }
        });

        // Unbind from platform button
        this.addListener('unbindFromPlatform', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.unbindFromPlatform(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });
    }

    /**
     * Show visual feedback when in platform binding mode
     */
    showBindingModeMessage() {
        // Show visual indicator that binding mode is active
        const message = document.createElement('div');
        message.id = 'bindingModeMessage';
        message.textContent = 'Click on a platform to bind the prop to it (or click elsewhere to cancel)';
        message.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(76, 175, 80, 0.95); color: white; padding: 15px 25px; border-radius: 8px; font-size: 14px; z-index: 10000; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
        document.body.appendChild(message);

        // Change cursor
        this.game.canvas.style.cursor = 'crosshair';

        // Remove message and reset cursor when binding completes/cancels
        const checkBinding = setInterval(() => {
            if (!this.game.propSystem.manager.isBindingToPlatform) {
                const msg = document.getElementById('bindingModeMessage');
                if (msg) msg.remove();
                this.game.canvas.style.cursor = 'default';
                clearInterval(checkBinding);
            }
        }, 100);
    }

    /**
     * Set up prop movement zone controls
     */
    setupPropMovementListeners() {
        // Draw prop movement zone button
        this.addListener('drawPropMovementZone', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.startMovementZoneDrawingMode(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });

        // Clear prop movement zone button
        this.addListener('clearPropMovementZone', 'click', () => {
            if (this.game.propSystem.selectedProp) {
                this.game.propSystem.manager.clearMovementZone(this.game.propSystem.selectedProp);
            } else {
                alert('Please select a prop first');
            }
        });
    }
}