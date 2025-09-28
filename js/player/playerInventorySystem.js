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

        // Listen for E key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.isModalOpen) {
                this.closeChestModal();
            }
        });
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
            return `<div style="width: 32px; height: 32px; background-color: #666; border: 1px solid #888; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;">?</div>`;
        }

        const canvasId = `itemSprite_${index}`;

        // Create canvas element
        const canvasHtml = `<canvas id="${canvasId}" class="chest-item-sprite" width="${item.sprite.width}" height="${item.sprite.height}" style="width: ${Math.min(48, item.sprite.width * 2)}px; height: ${Math.min(48, item.sprite.height * 2)}px;"></canvas>`;

        // Schedule sprite rendering after DOM update
        setTimeout(() => {
            this.renderItemSprite(canvasId, item.sprite);
        }, 0);

        return canvasHtml;
    }

    // Render item sprite on canvas
    renderItemSprite(canvasId, spriteData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw sprite
            ctx.drawImage(
                img,
                spriteData.x, spriteData.y, spriteData.width, spriteData.height, // Source
                0, 0, canvas.width, canvas.height // Destination
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
}