/**
 * Handles all enemy-related UI interactions
 */
class EnemyUIHandler extends UIHandler {
    constructor(game, modalHandler) {
        super(game);
        this.modalHandler = modalHandler;
        this.selectedModalEnemyType = null;
    }

    /**
     * Initialize enemy UI event listeners
     */
    initialize() {
        this.setupEnemyControls();
        this.setupEnemiesEditorListeners();
    }

    /**
     * Set up basic enemy controls
     */
    setupEnemyControls() {
        this.addListener('clearEnemiesBtn', 'click', () => {
            if (confirm('Clear all enemies? This cannot be undone.')) {
                this.game.enemySystem.clearAllEnemies();
                this.updateEnemyList();
                this.updateEnemyProperties();
            }
        });
    }

    /**
     * Set up enemies editor modal event listeners
     */
    setupEnemiesEditorListeners() {
        // Open enemies editor button
        const openBtn = this.getElementById('openEnemiesEditorBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openEnemiesEditorModal();
            });
        }

        // Close enemies editor modal
        const closeBtn = this.getElementById('closeEnemiesEditorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeEnemiesEditorModal();
            });
        }

        // Click outside to close
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEnemiesEditorModal();
                }
            });
        }

        // Modal "Add Enemy" button
        const modalAddBtn = this.getElementById('modalAddEnemyBtn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', () => {
                this.addEnemyFromModal();
            });
        }
    }

    /**
     * Open the enemies editor modal
     */
    openEnemiesEditorModal() {
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderEnemiesGrid();
        }
    }

    /**
     * Close the enemies editor modal
     */
    closeEnemiesEditorModal() {
        const modal = this.getElementById('enemiesEditorModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Clear selection
        this.selectedModalEnemyType = null;
        this.updateModalEnemyConfig();
    }

    /**
     * Render the enemies grid in the modal
     */
    renderEnemiesGrid() {
        const container = document.querySelector('#enemiesGridContainer .enemies-grid');
        if (!container) return;

        const enemyData = this.game.enemySystem.data;
        const enemies = enemyData.getEnemyTypes();

        let html = '';

        enemies.forEach(enemy => {
            const isSelected = this.selectedModalEnemyType === enemy.id;
            html += `<div class="enemy-grid-item ${isSelected ? 'selected' : ''}" data-enemy-id="${enemy.id}" style="
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
                min-height: 145px;
            ">
                <div style="
                    height: 120px;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    overflow: hidden;
                ">
                    <canvas class="enemy-thumbnail" data-enemy-id="${enemy.id}" width="100" height="120" style="image-rendering: pixelated; max-width: 100%; max-height: 100%; background: transparent;"></canvas>
                </div>
                <div style="font-size: 11px; color: #ccc; text-align: center; word-wrap: break-word; width: 100%;">${enemy.name}</div>
            </div>`;
        });

        container.innerHTML = html;

        // Render thumbnails
        this.renderEnemyThumbnails();

        // Add click handlers
        container.querySelectorAll('.enemy-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const enemyId = item.dataset.enemyId;
                this.selectEnemyType(enemyId);
            });
        });
    }

    /**
     * Render enemy thumbnails
     */
    renderEnemyThumbnails() {
        // Implement thumbnail rendering for enemies
        // This would be similar to the original implementation
    }

    /**
     * Select an enemy type in the modal
     */
    selectEnemyType(enemyId) {
        this.selectedModalEnemyType = enemyId;

        // Update visual selection
        document.querySelectorAll('.enemy-grid-item').forEach(item => {
            const isSelected = item.dataset.enemyId === enemyId;
            item.classList.toggle('selected', isSelected);
            item.style.backgroundColor = isSelected ? '#2a4a2a' : '#333';
            item.style.borderColor = isSelected ? '#4CAF50' : 'transparent';
        });

        // Update configuration panel
        this.updateModalEnemyConfig();
    }

    /**
     * Update modal enemy configuration display
     */
    updateModalEnemyConfig() {
        const configDiv = this.getElementById('selectedEnemyConfig');
        const noSelectionDiv = this.getElementById('noEnemySelected');
        const enemyNameSpan = this.getElementById('selectedEnemyTypeName');

        if (this.selectedModalEnemyType) {
            const enemyType = this.game.enemySystem.data.enemyTypes[this.selectedModalEnemyType];
            if (enemyType) {
                if (configDiv) configDiv.style.display = 'block';
                if (noSelectionDiv) noSelectionDiv.style.display = 'none';
                if (enemyNameSpan) enemyNameSpan.textContent = enemyType.name;
            }
        } else {
            if (configDiv) configDiv.style.display = 'none';
            if (noSelectionDiv) noSelectionDiv.style.display = 'block';
        }
    }

    /**
     * Add enemy from modal configuration
     */
    addEnemyFromModal() {
        if (!this.selectedModalEnemyType) {
            alert('Please select an enemy type first');
            return;
        }

        // Get values from modal inputs
        const health = parseInt(document.getElementById('modalEnemyHealthInput').value) || 100;
        const speed = parseFloat(document.getElementById('modalEnemySpeedInput').value) || 1;
        const damage = parseInt(document.getElementById('modalEnemyDamageInput').value) || 10;

        // Store these values so enemySystem can use them when placing
        this.game.enemySystem.pendingEnemyConfig = {
            type: this.selectedModalEnemyType,
            health: health,
            speed: speed,
            damage: damage
        };

        // Close modal
        this.closeEnemiesEditorModal();

        // Activate enemy placement mode
        this.game.enemySystem.toggleEnemyPlacement();

        console.log(`Enemies editor: Selected ${this.selectedModalEnemyType} for placement`);
    }

    /**
     * Update enemy list UI
     */
    updateEnemyList() {
        const listElement = document.getElementById('enemyList');
        if (!listElement) return;

        listElement.innerHTML = this.game.enemySystem.data.enemies.map(enemy => {
            const isSelected = this.game.enemySystem.getSelectedEnemy() === enemy;
            return `<div class="item ${isSelected ? 'selected' : ''}" data-enemy-id="${enemy.id}">
                <div class="item-name">${enemy.type} (${Math.round(enemy.x)}, ${Math.round(enemy.y)})</div>
                <div class="item-details">HP: ${enemy.health}/${enemy.maxHealth}, DMG: ${enemy.damage}</div>
            </div>`;
        }).join('');

        // Add click listeners to enemy items
        listElement.querySelectorAll('[data-enemy-id]').forEach(item => {
            item.addEventListener('click', () => {
                const enemyId = parseInt(item.dataset.enemyId);
                const enemy = this.game.enemySystem.data.getEnemyById(enemyId);
                if (enemy) {
                    this.game.enemySystem.selectEnemy(enemy);
                    this.updateEnemyProperties();
                    this.updateEnemyList();
                }
            });
        });
    }

    /**
     * Update enemy properties UI
     */
    updateEnemyProperties() {
        const propertiesDiv = document.getElementById('enemyProperties');
        if (!propertiesDiv) return;

        const selectedEnemy = this.game.enemySystem.getSelectedEnemy();

        if (!selectedEnemy) {
            propertiesDiv.style.display = 'none';
            return;
        }

        propertiesDiv.style.display = 'block';

        // Update enemy properties form
        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        };

        updateValue('enemyX', Math.round(selectedEnemy.x));
        updateValue('enemyY', Math.round(selectedEnemy.y));
        updateValue('enemyHealth', selectedEnemy.health);
        updateValue('enemyDamage', selectedEnemy.damage);
        updateValue('enemySpeed', selectedEnemy.speed);

        // Update checkboxes
        const updateCheckbox = (id, checked) => {
            const element = document.getElementById(id);
            if (element) element.checked = checked;
        };

        updateCheckbox('enemyIsMoving', selectedEnemy.isMoving);
        updateCheckbox('enemyAttractionEnabled', selectedEnemy.attractionZone?.enabled || false);
        updateCheckbox('enemyMovementEnabled', selectedEnemy.movementZone?.enabled || false);
    }

    /**
     * Check if attraction zone drawing is complete
     */
    checkAttractionZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingAttractionZone) {
                // Drawing is finished, reset button state
                const button = this.getElementById('drawAttractionZone');
                if (button) {
                    button.textContent = 'Draw Attraction Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new attraction zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
                console.log('🎯 Attraction zone drawing completed, button reset');
            }
        }, 100); // Check every 100ms
    }

    /**
     * Check if movement zone drawing is complete
     */
    checkMovementZoneDrawingComplete() {
        // Poll to check if drawing is finished
        const checkInterval = setInterval(() => {
            if (!this.game.enemySystem.isDrawingMovementZone) {
                // Drawing is finished, reset button state
                const button = this.getElementById('drawMovementZone');
                if (button) {
                    button.textContent = 'Draw Movement Zone';
                    button.classList.remove('danger');
                    button.disabled = false;
                }

                // Update the UI to reflect the new movement zone settings
                this.updateEnemyProperties();

                clearInterval(checkInterval);
                console.log('🎯 Movement zone drawing completed, button reset');
            }
        }, 100); // Check every 100ms
    }
}