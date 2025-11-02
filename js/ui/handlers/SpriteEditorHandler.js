/**
 * SpriteEditorHandler
 * Handles the sprite editor modal for creating custom props from sprite sheets
 */
class SpriteEditorHandler {
    constructor(game) {
        this.game = game;
        this.currentSheet = null;
        this.currentSheetImage = null;
        this.selection = null; // { x, y, width, height } - in actual image pixels
        this.isSelecting = false;
        this.startPos = { x: 0, y: 0 }; // in actual image pixels
        this.currentZoom = 2; // Default 2x zoom

        // DOM Elements
        this.modal = document.getElementById('spriteEditorModal');
        this.canvas = document.getElementById('spriteEditorCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.sheetSelect = document.getElementById('spriteSheetSelect');

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Main sections
        this.canvasSection = document.getElementById('canvasSection');
        this.propertiesSection = document.getElementById('propertiesSection');
        this.registerSheetSection = document.getElementById('registerSheetSection');

        // Selection inputs
        this.selectionXInput = document.getElementById('selectionX');
        this.selectionYInput = document.getElementById('selectionY');
        this.selectionWidthInput = document.getElementById('selectionWidth');
        this.selectionHeightInput = document.getElementById('selectionHeight');

        // Prop property inputs
        this.propKeyInput = document.getElementById('propKey');
        this.propNameInput = document.getElementById('propName');
        this.propCategoryInput = document.getElementById('propCategory');
        this.propHasGlowInput = document.getElementById('propHasGlow');
        this.propHasFlameInput = document.getElementById('propHasFlame');
        this.propIsChestInput = document.getElementById('propIsChest');
        this.propIsObstacleInput = document.getElementById('propIsObstacle');
        this.propDestroyableInput = document.getElementById('propDestroyable');
        this.propDamagePerSecondInput = document.getElementById('propDamagePerSecond');
        this.propMaxDurabilityInput = document.getElementById('propMaxDurability');
        this.damagePropertiesSection = document.getElementById('damageProperties');

        // New sheet inputs
        this.newSheetKeyInput = document.getElementById('newSheetKey');
        this.newSheetNameInput = document.getElementById('newSheetName');
        this.newSheetPathInput = document.getElementById('newSheetPath');
        this.newSheetCategoryInput = document.getElementById('newSheetCategory');
    }

    setupEventListeners() {
        // Modal close
        const closeBtn = document.getElementById('closeSpriteEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Sprite sheet selection
        if (this.sheetSelect) {
            this.sheetSelect.addEventListener('change', (e) => this.onSheetSelected(e.target.value));
        }

        // Register new sheet
        const registerNewBtn = document.getElementById('registerNewSheetBtn');
        if (registerNewBtn) {
            registerNewBtn.addEventListener('click', () => this.showRegisterSheetForm());
        }

        const confirmRegisterBtn = document.getElementById('confirmRegisterSheetBtn');
        if (confirmRegisterBtn) {
            confirmRegisterBtn.addEventListener('click', () => this.registerNewSheet());
        }

        const cancelRegisterBtn = document.getElementById('cancelRegisterSheetBtn');
        if (cancelRegisterBtn) {
            cancelRegisterBtn.addEventListener('click', () => this.hideRegisterSheetForm());
        }

        // Canvas mouse events for selection
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
            this.canvas.addEventListener('mouseleave', (e) => this.onCanvasMouseUp(e));
        }

        // Clear selection button
        const clearBtn = document.getElementById('clearSelectionBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }

        // Save prop button
        const saveBtn = document.getElementById('savePropBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProp());
        }

        // Destroyable checkbox toggle damage properties
        if (this.propDestroyableInput) {
            this.propDestroyableInput.addEventListener('change', (e) => {
                if (this.damagePropertiesSection) {
                    this.damagePropertiesSection.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }

        // Zoom controls (will be added to HTML)
        this.setupZoomControls();
    }

    /**
     * Setup zoom controls
     */
    setupZoomControls() {
        // Create zoom controls dynamically
        const canvasSection = this.canvasSection;
        if (!canvasSection) return;

        // Check if zoom controls already exist
        if (canvasSection.querySelector('.zoom-controls')) return;

        const zoomDiv = document.createElement('div');
        zoomDiv.className = 'zoom-controls';
        zoomDiv.style.marginBottom = '10px';
        zoomDiv.innerHTML = `
            <span style="color: #aaa; margin-right: 10px;">Zoom:</span>
            <button class="zoom-btn" data-zoom="1">1x</button>
            <button class="zoom-btn zoom-active" data-zoom="2">2x</button>
            <button class="zoom-btn" data-zoom="3">3x</button>
            <button class="zoom-btn" data-zoom="4">4x</button>
            <button class="zoom-btn" data-zoom="6">6x</button>
        `;

        // Insert at the beginning of canvas section
        const h4 = canvasSection.querySelector('h4');
        if (h4) {
            h4.after(zoomDiv);
        }

        // Add event listeners to zoom buttons
        zoomDiv.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const zoom = parseInt(btn.dataset.zoom);
                this.setZoom(zoom);

                // Update active button
                zoomDiv.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('zoom-active'));
                btn.classList.add('zoom-active');
            });
        });

        // Add CSS for zoom buttons
        const style = document.createElement('style');
        style.textContent = `
            .zoom-btn {
                background-color: #666;
                border: none;
                color: white;
                padding: 5px 12px;
                margin: 0 3px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            .zoom-btn:hover {
                background-color: #555;
            }
            .zoom-btn.zoom-active {
                background-color: #4CAF50;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Set zoom level
     */
    setZoom(zoom) {
        this.currentZoom = zoom;
        this.redrawCanvas();
    }

    /**
     * Open the sprite editor modal
     */
    async open() {
        if (!this.modal) return;

        // Load available sprite sheets
        await this.loadSpriteSheets();

        this.modal.style.display = 'flex';
    }

    /**
     * Close the sprite editor modal
     */
    close() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        this.clearSelection();
        this.currentSheet = null;
        this.currentSheetImage = null;
    }

    /**
     * Load available sprite sheets from database (GLOBAL)
     */
    async loadSpriteSheets() {
        try {
            const sheets = await window.propService.getSpriteSheets();

            // Clear existing options
            this.sheetSelect.innerHTML = '<option value="">-- Select Sprite Sheet --</option>';

            // Add sheets to dropdown
            sheets.forEach(sheet => {
                const option = document.createElement('option');
                option.value = sheet.sheetKey;
                option.textContent = sheet.name;
                option.dataset.filePath = sheet.filePath;
                this.sheetSelect.appendChild(option);
            });

            console.log(`✓ Loaded ${sheets.length} sprite sheets`);
        } catch (error) {
            console.error('Error loading sprite sheets:', error);
            alert('Failed to load sprite sheets: ' + error.message);
        }
    }

    /**
     * Handle sprite sheet selection
     */
    async onSheetSelected(sheetKey) {
        if (!sheetKey) {
            this.canvasSection.style.display = 'none';
            this.propertiesSection.style.display = 'none';
            return;
        }

        const selectedOption = this.sheetSelect.options[this.sheetSelect.selectedIndex];
        const filePath = selectedOption.dataset.filePath;

        try {
            // Load sprite sheet image
            this.currentSheet = sheetKey;
            await this.loadSheetImage(filePath);

            // Show canvas section
            this.canvasSection.style.display = 'block';

            console.log(`✓ Loaded sprite sheet: ${sheetKey}`);
        } catch (error) {
            console.error('Error loading sprite sheet:', error);
            alert('Failed to load sprite sheet image: ' + error.message);
        }
    }

    /**
     * Load sprite sheet image onto canvas
     */
    loadSheetImage(filePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                this.currentSheetImage = img;

                // Set canvas size to image size (will be scaled by CSS)
                this.canvas.width = img.width;
                this.canvas.height = img.height;

                // Apply zoom to canvas via CSS
                this.canvas.style.width = (img.width * this.currentZoom) + 'px';
                this.canvas.style.height = (img.height * this.currentZoom) + 'px';

                // Draw image on canvas
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(img, 0, 0);

                resolve();
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${filePath}`));
            };

            img.src = filePath;
        });
    }

    /**
     * Get image coordinates from mouse event (accounting for zoom)
     */
    getImageCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / this.currentZoom);
        const y = Math.floor((clientY - rect.top) / this.currentZoom);
        return { x, y };
    }

    /**
     * Canvas mouse down - start selection
     */
    onCanvasMouseDown(e) {
        e.preventDefault();
        const coords = this.getImageCoordinates(e.clientX, e.clientY);
        this.isSelecting = true;
        this.startPos = {
            x: coords.x,
            y: coords.y
        };
    }

    /**
     * Canvas mouse move - update selection
     */
    onCanvasMouseMove(e) {
        if (!this.isSelecting) return;

        const coords = this.getImageCoordinates(e.clientX, e.clientY);

        // Calculate selection rectangle in actual image pixels
        const x = Math.min(this.startPos.x, coords.x);
        const y = Math.min(this.startPos.y, coords.y);
        const width = Math.abs(coords.x - this.startPos.x);
        const height = Math.abs(coords.y - this.startPos.y);

        this.selection = { x, y, width, height };

        // Redraw canvas with selection
        this.redrawCanvas();
    }

    /**
     * Canvas mouse up - finish selection
     */
    onCanvasMouseUp(e) {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        if (this.selection && this.selection.width > 0 && this.selection.height > 0) {
            this.updateSelectionInputs();
            this.propertiesSection.style.display = 'block';
        }
    }

    /**
     * Redraw canvas with current image and selection overlay
     */
    redrawCanvas() {
        if (!this.currentSheetImage) return;

        // Update canvas CSS size based on zoom
        this.canvas.style.width = (this.canvas.width * this.currentZoom) + 'px';
        this.canvas.style.height = (this.canvas.height * this.currentZoom) + 'px';

        // Clear and redraw image
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentSheetImage, 0, 0);

        // Draw selection rectangle (in actual image pixels)
        if (this.selection) {
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 2 / this.currentZoom; // Adjust line width for zoom
            this.ctx.strokeRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);

            // Draw semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            this.ctx.fillRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
        }
    }

    /**
     * Update selection coordinate inputs
     */
    updateSelectionInputs() {
        if (!this.selection) return;

        // Store exact pixel coordinates directly (not tile coordinates)
        // The renderer will handle these as pixel offsets
        this.selectionXInput.value = Math.round(this.selection.x);
        this.selectionYInput.value = Math.round(this.selection.y);
        this.selectionWidthInput.value = Math.round(this.selection.width);
        this.selectionHeightInput.value = Math.round(this.selection.height);
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.selection = null;
        this.isSelecting = false;

        // Redraw canvas without selection
        if (this.currentSheetImage) {
            this.redrawCanvas();
        }

        // Clear inputs
        if (this.selectionXInput) this.selectionXInput.value = '';
        if (this.selectionYInput) this.selectionYInput.value = '';
        if (this.selectionWidthInput) this.selectionWidthInput.value = '';
        if (this.selectionHeightInput) this.selectionHeightInput.value = '';
        if (this.propKeyInput) this.propKeyInput.value = '';
        if (this.propNameInput) this.propNameInput.value = '';

        this.propertiesSection.style.display = 'none';
    }

    /**
     * Save prop to database
     */
    async saveProp() {
        if (!this.selection) {
            alert('Please select a region on the sprite sheet first');
            return;
        }

        const propKey = this.propKeyInput.value.trim();
        const propName = this.propNameInput.value.trim();

        if (!propKey || !propName) {
            alert('Please provide both a Prop Key and Display Name');
            return;
        }

        const propData = {
            propKey: propKey,
            name: propName,
            spriteSheet: this.currentSheet,
            tileX: parseFloat(this.selectionXInput.value),
            tileY: parseFloat(this.selectionYInput.value),
            width: parseInt(this.selectionWidthInput.value),
            height: parseInt(this.selectionHeightInput.value),
            category: this.propCategoryInput.value.trim() || 'Custom',
            hasGlow: this.propHasGlowInput.checked,
            hasFlame: this.propHasFlameInput.checked,
            isChest: this.propIsChestInput.checked,
            isObstacle: this.propIsObstacleInput.checked,
            destroyable: this.propDestroyableInput.checked,
            damagePerSecond: this.propDestroyableInput.checked ? parseFloat(this.propDamagePerSecondInput.value) : 0,
            maxDurability: this.propDestroyableInput.checked ? parseFloat(this.propMaxDurabilityInput.value) : 100
        };

        try {
            // Try to create prop, if it exists, ask user if they want to update
            try {
                await window.propService.createProp(propData);
                alert(`✓ Prop "${propName}" created successfully!`);
            } catch (createError) {
                // If prop already exists, ask if they want to update it
                if (createError.message && createError.message.includes('already exists')) {
                    const shouldUpdate = confirm(`A prop with key "${propKey}" already exists. Do you want to update it with the new coordinates?`);
                    if (shouldUpdate) {
                        // Get the existing prop to find its ID
                        const existingProps = await window.propService.getProps();
                        const existingProp = existingProps.find(p => p.propKey === propKey);
                        if (existingProp) {
                            await window.propService.updateProp(existingProp._id, propData);
                            alert(`✓ Prop "${propName}" updated successfully!`);
                        }
                    } else {
                        return; // User cancelled, don't proceed
                    }
                } else {
                    throw createError; // Re-throw if it's a different error
                }
            }

            // Ensure sprite sheet is registered in renderer
            if (this.game.propSystem && this.game.propSystem.renderer) {
                const renderer = this.game.propSystem.renderer;
                // Check if sprite sheet is already registered
                if (!renderer.platformSprites[this.currentSheet]) {
                    console.log(`📥 Registering sprite sheet '${this.currentSheet}' in renderer...`);
                    // Get sprite sheet info from database
                    const sheets = await window.propService.getSpriteSheets();
                    const sheet = sheets.find(s => s.sheetKey === this.currentSheet);
                    if (sheet) {
                        await renderer.registerSpriteSheet(
                            sheet.sheetKey,
                            sheet.filePath,
                            sheet.tileWidth,
                            sheet.tileHeight
                        );
                    }
                }
            }

            // Reload props in game (GLOBAL)
            if (this.game.propSystem && this.game.propSystem.data) {
                await this.game.propSystem.data.loadPropTypesFromDatabase();
            }

            // Clear form
            this.clearSelection();
        } catch (error) {
            console.error('Error saving prop:', error);
            alert('Failed to save prop: ' + error.message);
        }
    }

    /**
     * Show register new sheet form
     */
    showRegisterSheetForm() {
        this.registerSheetSection.style.display = 'block';
        this.canvasSection.style.display = 'none';
        this.propertiesSection.style.display = 'none';
    }

    /**
     * Hide register new sheet form
     */
    hideRegisterSheetForm() {
        this.registerSheetSection.style.display = 'none';
    }

    /**
     * Register new sprite sheet
     */
    async registerNewSheet() {
        const sheetKey = this.newSheetKeyInput.value.trim();
        const sheetName = this.newSheetNameInput.value.trim();
        const filePath = this.newSheetPathInput.value.trim();
        const category = this.newSheetCategoryInput.value.trim() || 'General';

        if (!sheetKey || !sheetName || !filePath) {
            alert('Please fill in all required fields');
            return;
        }

        const sheetData = {
            sheetKey: sheetKey,
            name: sheetName,
            filePath: filePath,
            category: category
        };

        try {
            await window.propService.registerSpriteSheet(sheetData);
            alert(`✓ Sprite sheet "${sheetName}" registered successfully!`);

            // Register sheet in game renderer
            if (this.game.propSystem && this.game.propSystem.renderer) {
                await this.game.propSystem.renderer.registerSpriteSheet(sheetKey, filePath);
            }

            // Reload sprite sheets list
            await this.loadSpriteSheets();

            // Hide form
            this.hideRegisterSheetForm();

            // Clear inputs
            this.newSheetKeyInput.value = '';
            this.newSheetNameInput.value = '';
            this.newSheetPathInput.value = '';
            this.newSheetCategoryInput.value = 'General';
        } catch (error) {
            console.error('Error registering sprite sheet:', error);
            alert('Failed to register sprite sheet: ' + error.message);
        }
    }
}
