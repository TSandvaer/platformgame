/**
 * Handles all prop-related UI interactions
 */
class PropUIHandler extends UIHandler {
    constructor(game, modalHandler) {
        super(game);
        this.modalHandler = modalHandler;
        this.selectedModalPropType = null;
    }

    /**
     * Initialize prop UI event listeners
     */
    initialize() {
        this.setupPropsEditorListeners();
        this.setupLegacyPropListeners();
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

        // Click outside to close
        const modal = this.getElementById('propsEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePropsEditorModal();
                }
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
        const img = platformSprites.villageProps.image;

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

        // Draw from tileset
        const tileSize = 32;
        const sourceX = propType.tileX * tileSize;
        const sourceY = propType.tileY * tileSize;

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
}