class PlayerInventorySystem {
    constructor(game) {
        this.game = game;
        this.currentChest = null;
        this.isModalOpen = false;

        // Initialize player data storage
        this.playerDataStorage = new PlayerDataStorage();

        // Initialize event listeners
        this.setupEventListeners();

        // Clear player inventory on load (as requested)
        this.clearPlayerInventoryOnLoad();
    }

    setupEventListeners() {
        // Close modal button
        const closeBtn = document.getElementById('closePlayerChestModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeChestModal();
            });
        }

        // Close modal on outside click
        const modal = document.getElementById('playerChestModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeChestModal();
                }
            });
        }

        // Listen for E key to close chest modal
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.isModalOpen && this.currentChest) {
                this.closeChestModal();
            }
        });

        // Listen for I key to toggle player inventory
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'i' && !this.game.isDevelopmentMode) {
                e.preventDefault();
                this.togglePlayerInventoryModal();
            }
        });

        // Player inventory modal event listeners
        this.setupPlayerInventoryListeners();
    }

    // Clear player inventory on game load (as requested)
    clearPlayerInventoryOnLoad() {
        // Clear player inventory in memory
        if (this.game.playerSystem && this.game.playerSystem.data) {
            this.game.playerSystem.data.clearInventory();
        }

        // Also clear any existing player data from localStorage
        this.playerDataStorage.clear();

    }

    // Open chest modal and display contents
    openChestModal(chest) {
        if (!chest || !chest.isChest) {
            console.error('❌ Invalid chest provided to openChestModal');
            return;
        }

        this.currentChest = chest;
        this.isModalOpen = true;

        // Update modal title
        const titleElement = document.getElementById('playerChestModalTitle');
        if (titleElement) {
            titleElement.textContent = `Chest #${chest.id} Contents`;
        }

        // Update description based on chest contents
        const descElement = document.getElementById('playerChestDescription');
        if (descElement) {
            const itemCount = chest.chestInventory ? chest.chestInventory.length : 0;
            if (itemCount === 0) {
                descElement.textContent = 'This chest is empty';
            } else {
                descElement.textContent = `Click on items to collect them (${itemCount} items)`;
            }
        }

        // Render chest items
        this.renderChestItems();

        // Show modal
        const modal = document.getElementById('playerChestModal');
        if (modal) {
            modal.style.display = 'flex';
        }

    }

    // Close chest modal
    closeChestModal() {
        // Trigger chest closing animation if chest is still open
        if (this.currentChest && this.currentChest.chestState === 'open') {
            this.game.propSystem.toggleChest(this.currentChest);
        }

        this.isModalOpen = false;
        this.currentChest = null;

        // Hide modal
        const modal = document.getElementById('playerChestModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Hide tooltip
        this.hideTooltip();

    }

    // Render chest items in the grid
    renderChestItems() {
        const gridElement = document.getElementById('playerChestItemsGrid');
        if (!gridElement || !this.currentChest) return;

        const chestInventory = this.currentChest.chestInventory || [];

        if (chestInventory.length === 0) {
            gridElement.innerHTML = '<div class="chest-empty">This chest is empty</div>';
            return;
        }

        let html = '';
        chestInventory.forEach((item, index) => {
            // Create sprite canvas for each item
            const spriteHtml = this.createItemSpriteHtml(item, index);

            html += `<div class="chest-item" data-item-index="${index}" data-item-id="${item.id}">
                ${spriteHtml}
                ${item.quantity && item.quantity > 1 ? `<div class="chest-item-quantity">${item.quantity}</div>` : ''}
            </div>`;
        });

        gridElement.innerHTML = html;

        // Add event listeners for items
        const itemElements = gridElement.querySelectorAll('.chest-item');
        itemElements.forEach(itemElement => {
            itemElement.addEventListener('click', (e) => {
                const itemIndex = parseInt(itemElement.dataset.itemIndex);
                this.collectItem(itemIndex);
            });

            // Add tooltip functionality
            itemElement.addEventListener('mouseenter', (e) => {
                const itemIndex = parseInt(itemElement.dataset.itemIndex);
                this.showTooltip(e, chestInventory[itemIndex]);
            });

            itemElement.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            itemElement.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e);
            });
        });
    }

    // Create sprite HTML for an item
    createItemSpriteHtml(item, index) {
        if (!item.sprite) {
            return `<div style="width: 32px; height: 32px; background-color: transparent; border: 1px solid #888; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;">?</div>`;
        }

        const canvasId = `itemSprite_${index}`;

        // Use pixel-perfect scaling - only 2x for very small sprites to maintain sharpness
        const scale = item.sprite.width < 12 || item.sprite.height < 12 ? 2 : 1;
        const displayWidth = item.sprite.width * scale;
        const displayHeight = item.sprite.height * scale;

        // Create canvas with proper dimensions to avoid distortion
        const canvasHtml = `<canvas id="${canvasId}" class="chest-item-sprite" width="${displayWidth}" height="${displayHeight}" style="width: ${displayWidth}px; height: ${displayHeight}px; background: transparent;"></canvas>`;

        // Schedule sprite rendering after DOM update
        setTimeout(() => {
            this.renderItemSprite(canvasId, item.sprite, scale);
        }, 0);

        return canvasHtml;
    }

    // Render item sprite on canvas
    renderItemSprite(canvasId, spriteData, scale = 1) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Disable image smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        const img = new Image();

        img.onload = () => {
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw sprite with pixel-perfect scaling
            ctx.drawImage(
                img,
                spriteData.x, spriteData.y, spriteData.width, spriteData.height, // Source
                0, 0, spriteData.width * scale, spriteData.height * scale // Destination with proper scaling
            );
        };

        img.src = spriteData.src;
    }

    // Collect item from chest
    collectItem(itemIndex) {
        if (!this.currentChest || !this.currentChest.chestInventory) {
            console.error('❌ No chest or chest inventory available');
            return;
        }

        const item = this.currentChest.chestInventory[itemIndex];
        if (!item) {
            console.error('❌ Item not found at index:', itemIndex);
            return;
        }

        // Add to player inventory
        const success = this.game.playerSystem.data.addItemToInventory(item, 1);
        if (!success) {
            console.error('❌ Failed to add item to player inventory');
            return;
        }

        // Remove from chest or reduce quantity
        if (item.stackable && item.quantity > 1) {
            item.quantity -= 1;
        } else {
            this.currentChest.chestInventory.splice(itemIndex, 1);
        }

        // Save player data
        this.savePlayerData();

        // NOTE: NOT saving scene data here because chest changes should be temporary
        // Chests should reset to their original state on reload (no save game system yet)

        // Re-render chest items
        this.renderChestItems();

        // Update description
        const descElement = document.getElementById('playerChestDescription');
        if (descElement) {
            const itemCount = this.currentChest.chestInventory.length;
            if (itemCount === 0) {
                descElement.textContent = 'This chest is empty';
            } else {
                descElement.textContent = `Click on items to collect them (${itemCount} items)`;
            }
        }

    }

    // Show tooltip for item
    showTooltip(event, item) {
        const tooltip = document.getElementById('itemTooltip');
        const titleElement = document.getElementById('tooltipTitle');
        const descElement = document.getElementById('tooltipDescription');
        const detailsElement = document.getElementById('tooltipDetails');

        if (tooltip && titleElement && descElement && detailsElement) {
            titleElement.textContent = item.name;
            descElement.textContent = item.description || 'No description';

            // Add item details
            let details = `Type: ${item.type}`;
            if (item.rarity) details += ` | Rarity: ${item.rarity}`;
            if (item.value) details += ` | Value: ${item.value}`;
            if (item.stackable) details += ` | Stackable`;
            detailsElement.textContent = details;

            tooltip.style.display = 'block';
            this.updateTooltipPosition(event);
        }
    }

    // Hide tooltip
    hideTooltip() {
        const tooltip = document.getElementById('itemTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Update tooltip position
    updateTooltipPosition(event) {
        const tooltip = document.getElementById('itemTooltip');
        if (tooltip && tooltip.style.display === 'block') {
            tooltip.style.left = event.clientX + 10 + 'px';
            tooltip.style.top = event.clientY - 10 + 'px';
        }
    }

    // Save player data to localStorage and server (if in player mode)
    savePlayerData() {
        if (this.game.playerSystem && this.game.playerSystem.data) {
            this.playerDataStorage.save(this.game.playerSystem.data);

            // Also save to server if in player mode
            if (window.PLAYER_MODE && window.progressAPI) {
                setTimeout(() => {
                    try {
                        const currentSceneId = this.game.sceneManager?.currentSceneId || 0;
                        const completedScenes = this.game.sceneManager?.completedScenes || [];
                        const playtime = this.game.playtime || 0;
                        const deaths = this.game.deaths || 0;

                        const progressData = this.game.playerSystem.data.serializeProgress(
                            currentSceneId,
                            completedScenes,
                            playtime,
                            deaths
                        );

                        window.progressAPI.saveProgress(progressData).catch(err => {
                            console.error('Failed to save progress:', err);
                        });
                    } catch (error) {
                        console.error('Error saving progress:', error);
                    }
                }, 100);
            }
        }
    }

    // Load player data from localStorage
    loadPlayerData() {
        const savedData = this.playerDataStorage.load();
        if (savedData && this.game.playerSystem && this.game.playerSystem.data) {
            // Restore player inventory
            if (savedData.playerInventory) {
                this.game.playerSystem.data.playerInventory = savedData.playerInventory;
            }
        }
    }

    // Get player inventory for debugging
    getPlayerInventory() {
        return this.game.playerSystem?.data?.getInventory() || [];
    }

    // Player inventory modal methods
    setupPlayerInventoryListeners() {
        // Player inventory state
        this.isPlayerInventoryOpen = false;
        this.selectedInventoryItem = null;

        // Close player inventory modal
        const closeBtn = document.getElementById('closePlayerInventoryModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePlayerInventoryModal();
            });
        }

        // Close modal on outside click
        const modal = document.getElementById('playerInventoryModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePlayerInventoryModal();
                }
            });
        }

        // Context menu event listeners
        this.setupContextMenuListeners();

        // Hide context menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#itemContextMenu')) {
                this.hideContextMenu();
            }
        });
    }

    setupContextMenuListeners() {
        // Consume item option
        const consumeOption = document.getElementById('consumeItemOption');
        if (consumeOption) {
            consumeOption.addEventListener('click', () => {
                this.consumeSelectedItem();
                this.hideContextMenu();
            });
        }

        // Discard item option
        const discardOption = document.getElementById('discardItemOption');
        if (discardOption) {
            discardOption.addEventListener('click', () => {
                this.discardSelectedItem();
                this.hideContextMenu();
            });
        }
    }

    // Toggle player inventory modal
    togglePlayerInventoryModal() {
        if (this.isPlayerInventoryOpen) {
            this.closePlayerInventoryModal();
        } else {
            this.openPlayerInventoryModal();
        }
    }

    // Open player inventory modal
    openPlayerInventoryModal() {
        if (this.isModalOpen && this.currentChest) {
            // Don't open player inventory if chest modal is open
            return;
        }

        this.isPlayerInventoryOpen = true;

        // Update description based on inventory contents
        const descElement = document.getElementById('playerInventoryDescription');
        if (descElement) {
            const playerInventory = this.getPlayerInventory();
            const consumableCount = playerInventory.filter(item => item.type === 'consumable').length;
            if (playerInventory.length === 0) {
                descElement.textContent = 'Your inventory is empty';
            } else if (consumableCount > 0) {
                descElement.textContent = `Right-click consumable items to use them (${consumableCount} consumables available)`;
            } else {
                descElement.textContent = 'Your items are displayed below';
            }
        }

        // Render player inventory items
        this.renderPlayerInventory();

        // Show modal
        const modal = document.getElementById('playerInventoryModal');
        if (modal) {
            modal.style.display = 'flex';
        }

    }

    // Close player inventory modal
    closePlayerInventoryModal() {
        this.isPlayerInventoryOpen = false;
        this.selectedInventoryItem = null;

        // Hide modal
        const modal = document.getElementById('playerInventoryModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Hide context menu and tooltip
        this.hideContextMenu();
        this.hideTooltip();

    }

    // Render player inventory items
    renderPlayerInventory() {
        const gridElement = document.getElementById('playerInventoryGrid');
        if (!gridElement) return;

        const playerInventory = this.getPlayerInventory();

        if (playerInventory.length === 0) {
            gridElement.innerHTML = '<div class="inventory-empty">Your inventory is empty</div>';
            return;
        }

        let html = '';
        playerInventory.forEach((item, index) => {
            // Create sprite canvas for each item
            const spriteHtml = this.createPlayerInventoryItemSpriteHtml(item, index);
            const isConsumable = item.type === 'consumable';

            html += `<div class="player-inventory-item ${isConsumable ? 'consumable' : ''}"
                          data-item-index="${index}"
                          data-item-id="${item.id}"
                          data-item-type="${item.type}"
                          draggable="${isConsumable ? 'true' : 'false'}">
                ${spriteHtml}
                ${item.quantity && item.quantity > 1 ? `<div class="chest-item-quantity">${item.quantity}</div>` : ''}
            </div>`;
        });

        gridElement.innerHTML = html;

        // Add event listeners for items
        const itemElements = gridElement.querySelectorAll('.player-inventory-item');
        itemElements.forEach(itemElement => {
            const itemIndex = parseInt(itemElement.dataset.itemIndex);
            const item = playerInventory[itemIndex];

            // Left click for tooltips and selection
            itemElement.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectInventoryItem(itemIndex);
            });

            // Right click for context menu (consumables only)
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (item.type === 'consumable') {
                    this.showContextMenu(e, itemIndex);
                }
            });

            // Tooltip functionality
            itemElement.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, item);
            });

            itemElement.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            itemElement.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e);
            });
        });

        // Render belt items (with retry if spritesheet not loaded)
        this.renderBeltItems();

        // If spritesheet isn't loaded yet, try again after a short delay
        if (this.game.inventoryItemsData && this.game.inventoryItemsData.spritesheet && !this.game.inventoryItemsData.spritesheet.complete) {
            setTimeout(() => {
                this.renderBeltItems();
            }, 100);
        }

        // Attach drag and drop listeners
        this.attachDragDropListeners();
    }

    // Create sprite HTML for player inventory item
    createPlayerInventoryItemSpriteHtml(item, index) {
        if (!item.sprite) {
            return `<div style="width: 32px; height: 32px; background-color: transparent; border: 1px solid #888; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;">?</div>`;
        }

        const canvasId = `playerItemSprite_${index}`;

        // Use pixel-perfect scaling - only 2x for very small sprites to maintain sharpness
        const scale = item.sprite.width < 12 || item.sprite.height < 12 ? 2 : 1;
        const displayWidth = item.sprite.width * scale;
        const displayHeight = item.sprite.height * scale;

        // Create canvas with proper dimensions to avoid distortion
        const canvasHtml = `<canvas id="${canvasId}" class="chest-item-sprite" width="${displayWidth}" height="${displayHeight}" style="width: ${displayWidth}px; height: ${displayHeight}px; background: transparent;"></canvas>`;

        // Schedule sprite rendering after DOM update
        setTimeout(() => {
            this.renderItemSprite(canvasId, item.sprite, scale);
        }, 0);

        return canvasHtml;
    }

    // Select inventory item
    selectInventoryItem(itemIndex) {
        this.selectedInventoryItem = itemIndex;
    }

    // Show context menu for consumable items
    showContextMenu(event, itemIndex) {
        const item = this.getPlayerInventory()[itemIndex];
        if (!item || item.type !== 'consumable') return;

        this.selectedInventoryItem = itemIndex;

        const contextMenu = document.getElementById('itemContextMenu');
        if (contextMenu) {
            // Position the context menu
            contextMenu.style.left = event.clientX + 'px';
            contextMenu.style.top = event.clientY + 'px';
            contextMenu.style.display = 'block';

            // Update consume option text based on item
            const consumeOption = document.getElementById('consumeItemOption');
            if (consumeOption) {
                consumeOption.textContent = `🍀 Consume ${item.name}`;
            }
        }

    }

    // Hide context menu
    hideContextMenu() {
        const contextMenu = document.getElementById('itemContextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    // Consume selected item
    consumeSelectedItem() {
        if (this.selectedInventoryItem === null) return;

        const playerInventory = this.getPlayerInventory();
        const item = playerInventory[this.selectedInventoryItem];

        if (!item || item.type !== 'consumable') {
            console.error('❌ Cannot consume non-consumable item');
            return;
        }

        // Apply item effects
        this.applyItemEffects(item);

        // Remove item from inventory
        this.game.playerSystem.data.removeItemFromInventory(item.id, 1);

        // Save player data
        this.savePlayerData();

        // Re-render inventory
        this.renderPlayerInventory();

        // Update description
        this.updatePlayerInventoryDescription();

    }

    // Discard selected item
    discardSelectedItem() {
        if (this.selectedInventoryItem === null) return;

        const playerInventory = this.getPlayerInventory();
        const item = playerInventory[this.selectedInventoryItem];

        if (!item) return;

        // Remove item from inventory
        this.game.playerSystem.data.removeItemFromInventory(item.id, 1);

        // Save player data
        this.savePlayerData();

        // Re-render inventory
        this.renderPlayerInventory();

        // Update description
        this.updatePlayerInventoryDescription();

    }

    // Apply consumable item effects
    applyItemEffects(item) {
        if (!item.effects || !this.game.playerSystem?.data) return;

        const player = this.game.playerSystem.data;
        const effects = item.effects;

        // Apply health effect
        if (effects.health) {
            const oldHealth = player.health;
            player.health = Math.min(player.maxHealth, player.health + effects.health);
            const actualHealing = player.health - oldHealth;
            if (actualHealing > 0) {
                this.showEffectMessage(`+${actualHealing} Health`, player.x, player.y - 30, '#4CAF50');
            }
        }

        // Apply stamina effect
        if (effects.stamina) {
            const oldStamina = player.stamina;
            player.stamina = Math.min(player.maxStamina, player.stamina + effects.stamina);
            const actualRestore = player.stamina - oldStamina;
            if (actualRestore > 0) {
                this.showEffectMessage(`+${actualRestore} Stamina`, player.x, player.y - 50, '#2196F3');
            }
        }

        // Add more effects as needed (attack damage, speed boosts, etc.)
        if (effects.attackDamage) {
            // Temporary boost (could be implemented with timers)
        }
    }

    // Show effect message above player
    showEffectMessage(text, x, y, color = '#4CAF50') {
        if (this.game.showFeedbackMessage) {
            this.game.showFeedbackMessage(text, x, y, color);
        }
    }

    // Update player inventory description
    updatePlayerInventoryDescription() {
        const descElement = document.getElementById('playerInventoryDescription');
        if (descElement && this.isPlayerInventoryOpen) {
            const playerInventory = this.getPlayerInventory();
            const consumableCount = playerInventory.filter(item => item.type === 'consumable').length;
            if (playerInventory.length === 0) {
                descElement.textContent = 'Your inventory is empty';
            } else if (consumableCount > 0) {
                descElement.textContent = `Right-click consumable items to use them (${consumableCount} consumables available)`;
            } else {
                descElement.textContent = 'Your items are displayed below';
            }
        }
    }

    // Render belt items in the inventory modal
    renderBeltItems() {
        const beltGrid = document.getElementById('playerBeltGrid');
        if (!beltGrid) {
            return;
        }

        const playerBelt = this.game.playerSystem?.data?.belt || [null, null, null, null];
        const beltSlots = beltGrid.querySelectorAll('.belt-slot');


        beltSlots.forEach((slot, index) => {
            const item = playerBelt[index];

            // Clear ALL existing content first
            while (slot.firstChild) {
                slot.removeChild(slot.firstChild);
            }

            // Re-add the number label
            const numberSpan = document.createElement('span');
            numberSpan.style.cssText = 'position: absolute; top: 2px; left: 4px; color: #FFD700; font-size: 12px; font-weight: bold; z-index: 10;';
            numberSpan.textContent = String(index + 1);
            slot.appendChild(numberSpan);

            if (item) {
                let spriteAdded = false;

                // Try to create proper sprite for the item
                if (item.sprite && this.game.inventoryItemsData && this.game.inventoryItemsData.spritesheet) {
                    const spritesheet = this.game.inventoryItemsData.spritesheet;

                    // Check if spritesheet is loaded
                    if (spritesheet.complete || spritesheet.naturalWidth > 0) {
                        const canvas = document.createElement('canvas');
                        canvas.width = 40;
                        canvas.height = 40;
                        canvas.style.cssText = 'width: 40px; height: 40px; margin: auto; image-rendering: pixelated; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; background: transparent;';

                        const ctx = canvas.getContext('2d', { alpha: true });
                        ctx.imageSmoothingEnabled = false;

                        try {
                            // Clear canvas with transparency
                            ctx.clearRect(0, 0, 40, 40);

                            // Calculate proper scaling to maintain aspect ratio
                            const spriteAspect = item.sprite.width / item.sprite.height;
                            let drawWidth = 32;
                            let drawHeight = 32;

                            if (spriteAspect > 1) {
                                // Wider than tall
                                drawHeight = 32 / spriteAspect;
                            } else {
                                // Taller than wide
                                drawWidth = 32 * spriteAspect;
                            }

                            const drawX = (40 - drawWidth) / 2;
                            const drawY = (40 - drawHeight) / 2;

                            ctx.drawImage(
                                spritesheet,
                                item.sprite.x, item.sprite.y,
                                item.sprite.width, item.sprite.height,
                                drawX, drawY, drawWidth, drawHeight
                            );
                            slot.appendChild(canvas);
                            spriteAdded = true;
                        } catch (e) {
                            console.warn('Failed to draw belt sprite:', e);
                            spriteAdded = false;
                        }
                    } else {
                    }
                }

                // Only add fallback if sprite wasn't successfully added
                if (!spriteAdded) {
                    // Fallback colored div if no sprite
                    const itemDiv = document.createElement('div');
                    const color = item.id === 'healthPotion' ? '#FF4444' :
                                 item.id === 'staminaPotion' ? '#FFD700' : '#4CAF50';
                    itemDiv.style.cssText = `width: 40px; height: 40px; background: ${color}; margin: auto; border-radius: 4px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1;`;
                    slot.appendChild(itemDiv);
                }

                // Add item name label with higher z-index
                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'position: absolute; bottom: 2px; left: 2px; right: 2px; background: rgba(0,0,0,0.7); color: white; font-size: 9px; padding: 1px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; z-index: 15;';
                nameDiv.textContent = item.name || item.id;
                slot.appendChild(nameDiv);

                // Add quantity if > 1 with higher z-index
                if (item.quantity > 1) {
                    const qtyDiv = document.createElement('div');
                    qtyDiv.style.cssText = 'position: absolute; top: 16px; right: 2px; background: rgba(0,0,0,0.8); color: white; font-size: 11px; font-weight: bold; padding: 1px 3px; border-radius: 2px; z-index: 15;';
                    qtyDiv.textContent = item.quantity;
                    slot.appendChild(qtyDiv);
                }

                slot.dataset.itemId = item.id;
            } else {
                slot.dataset.itemId = '';
            }
        });
    }

    // Attach drag and drop event listeners
    attachDragDropListeners() {
        // Inventory items (draggable)
        const inventoryItems = document.querySelectorAll('.player-inventory-item[draggable="true"]');
        inventoryItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('itemIndex', item.dataset.itemIndex);
                e.dataTransfer.setData('itemId', item.dataset.itemId);
                e.dataTransfer.setData('source', 'inventory');
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        // Belt slots (drop targets)
        const beltSlots = document.querySelectorAll('.belt-slot');
        beltSlots.forEach((slot, slotIndex) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                slot.style.backgroundColor = '#666';
            });

            slot.addEventListener('dragleave', () => {
                slot.style.backgroundColor = '#555';
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.style.backgroundColor = '#555';

                const source = e.dataTransfer.getData('source');
                const itemId = e.dataTransfer.getData('itemId');
                const itemIndex = parseInt(e.dataTransfer.getData('itemIndex'));

                if (source === 'inventory') {
                    // Moving item from inventory to belt
                    const playerInventory = this.getPlayerInventory();
                    const item = playerInventory[itemIndex];

                    if (item && item.type === 'consumable') {
                        // Create the belt item (actual item, not reference)
                        const beltItem = { ...item };

                        // Add to belt
                        const success = this.game.playerSystem.data.addItemToBelt(slotIndex, beltItem);

                        if (success) {
                            // Remove from inventory since it's now in the belt
                            this.game.playerSystem.data.removeItemFromInventory(item.id, 1);


                            // Re-render to update both inventory and belt display
                            this.renderPlayerInventory();

                            // Also explicitly re-render belt items after a short delay
                            setTimeout(() => {
                                this.renderBeltItems();
                            }, 50);
                        }
                    }
                }
            });

            // Click on belt slot to move item back to inventory
            slot.addEventListener('click', () => {
                const item = this.game.playerSystem?.data?.belt[slotIndex];
                if (item) {
                    // Add back to inventory
                    this.game.playerSystem.data.addItemToInventory(item);

                    // Remove from belt
                    this.game.playerSystem.data.removeItemFromBelt(slotIndex);

                    // Re-render
                    this.renderPlayerInventory();

                }
            });
        });
    }
}