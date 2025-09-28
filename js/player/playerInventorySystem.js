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

        console.log('🗑️ Player inventory and localStorage data cleared on game load (no save feature yet)');
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

        console.log(`📦 Opened chest #${chest.id} with ${chest.chestInventory?.length || 0} items`);
    }

    // Close chest modal
    closeChestModal() {
        // Trigger chest closing animation if chest is still open
        if (this.currentChest && this.currentChest.chestState === 'open') {
            this.game.propSystem.toggleChest(this.currentChest);
            console.log('📦 Closing chest animation started');
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

        console.log('📦 Closed chest modal');
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

        console.log(`✅ Collected ${item.name} from chest #${this.currentChest.id}`);
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

    // Save player data to localStorage
    savePlayerData() {
        if (this.game.playerSystem && this.game.playerSystem.data) {
            this.playerDataStorage.save(this.game.playerSystem.data);
        }
    }

    // Load player data from localStorage
    loadPlayerData() {
        const savedData = this.playerDataStorage.load();
        if (savedData && this.game.playerSystem && this.game.playerSystem.data) {
            // Restore player inventory
            if (savedData.playerInventory) {
                this.game.playerSystem.data.playerInventory = savedData.playerInventory;
                console.log(`📂 Loaded ${savedData.playerInventory.length} items into player inventory`);
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

        console.log('🎒 Opened player inventory modal');
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

        console.log('🎒 Closed player inventory modal');
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
                          data-item-type="${item.type}">
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
        console.log(`📦 Selected inventory item: ${this.getPlayerInventory()[itemIndex]?.name}`);
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

        console.log(`📋 Showing context menu for ${item.name}`);
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

        console.log(`✅ Consumed ${item.name}`);
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

        console.log(`🗑️ Discarded ${item.name}`);
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
                console.log(`❤️ Healed ${actualHealing} HP (${oldHealth} → ${player.health})`);
                this.showEffectMessage(`+${actualHealing} Health`, player.x, player.y - 30, '#4CAF50');
            }
        }

        // Apply stamina effect
        if (effects.stamina) {
            const oldStamina = player.stamina;
            player.stamina = Math.min(player.maxStamina, player.stamina + effects.stamina);
            const actualRestore = player.stamina - oldStamina;
            if (actualRestore > 0) {
                console.log(`⚡ Restored ${actualRestore} Stamina (${oldStamina} → ${player.stamina})`);
                this.showEffectMessage(`+${actualRestore} Stamina`, player.x, player.y - 50, '#2196F3');
            }
        }

        // Add more effects as needed (attack damage, speed boosts, etc.)
        if (effects.attackDamage) {
            // Temporary boost (could be implemented with timers)
            console.log(`⚔️ Attack damage boost: +${effects.attackDamage}`);
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
}