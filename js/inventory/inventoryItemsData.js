class InventoryItemsData {
    constructor() {
        // Available inventory items with their sprite coordinates and properties
        this.inventoryItems = {
            // Example items - these can be generated using the inventory sprite editor
            // Each item should have: id, name, type, description, sprite data, and game properties

            // Consumables
            healthPotion: {
                id: 'healthPotion',
                name: 'Health Potion',
                type: 'consumable',
                description: 'Restores 50 health points when consumed.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 18,
                    y: 0,
                    width: 11,
                    height: 16
                },
                stackable: true,
                maxStack: 99,
                rarity: 'common',
                value: 50,
                effects: {
                    health: 50
                }
            },

            manaPotion: {
                id: 'manaPotion',
                name: 'Mana Potion',
                type: 'consumable',
                description: 'Restores 30 stamina points when consumed.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 34,
                    y: 0,
                    width: 11,
                    height: 15
                },
                stackable: true,
                maxStack: 99,
                rarity: 'common',
                value: 40,
                effects: {
                    stamina: 30
                }
            },

            // Weapons
            ironSword: {
                id: 'ironSword',
                name: 'Iron Sword',
                type: 'weapon',
                description: 'A sturdy iron sword. Increases attack damage by 15.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 64,
                    y: 0,
                    width: 32,
                    height: 32
                },
                stackable: false,
                maxStack: 1,
                rarity: 'common',
                value: 150,
                stats: {
                    attackDamage: 15
                }
            },

            // Armor
            leatherArmor: {
                id: 'leatherArmor',
                name: 'Leather Armor',
                type: 'armor',
                description: 'Basic leather armor. Provides 10 additional health.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 96,
                    y: 0,
                    width: 32,
                    height: 32
                },
                stackable: false,
                maxStack: 1,
                rarity: 'common',
                value: 200,
                stats: {
                    health: 10
                }
            },

            // Materials
            ironOre: {
                id: 'ironOre',
                name: 'Iron Ore',
                type: 'material',
                description: 'Raw iron ore. Used for crafting weapons and tools.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 0,
                    y: 32,
                    width: 32,
                    height: 32
                },
                stackable: true,
                maxStack: 99,
                rarity: 'common',
                value: 10
            },

            wood: {
                id: 'wood',
                name: 'Wood',
                type: 'material',
                description: 'Common wood. Used for crafting basic items.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 32,
                    y: 32,
                    width: 32,
                    height: 32
                },
                stackable: true,
                maxStack: 99,
                rarity: 'common',
                value: 5
            },

            // Tools
            pickaxe: {
                id: 'pickaxe',
                name: 'Pickaxe',
                type: 'tool',
                description: 'Used for mining ore and breaking rocks.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 64,
                    y: 32,
                    width: 32,
                    height: 32
                },
                stackable: false,
                maxStack: 1,
                rarity: 'common',
                value: 100,
                durability: 100
            },

            // Quest Items
            ancientKey: {
                id: 'ancientKey',
                name: 'Ancient Key',
                type: 'quest',
                description: 'A mysterious ancient key. Opens special doors.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 96,
                    y: 32,
                    width: 32,
                    height: 32
                },
                stackable: false,
                maxStack: 1,
                rarity: 'rare',
                value: 0, // Quest items typically have no monetary value
                questItem: true
            },

            // Accessories
            speedRing: {
                id: 'speedRing',
                name: 'Ring of Speed',
                type: 'accessory',
                description: 'Increases movement speed by 2.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 0,
                    y: 64,
                    width: 32,
                    height: 32
                },
                stackable: false,
                maxStack: 1,
                rarity: 'uncommon',
                value: 300,
                stats: {
                    walkSpeed: 2,
                    runSpeed: 2
                }
            },

            // Miscellaneous
            goldCoin: {
                id: 'goldCoin',
                name: 'Gold Coin',
                type: 'misc',
                description: 'Standard currency used for trading.',
                sprite: {
                    src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                    x: 32,
                    y: 64,
                    width: 32,
                    height: 32
                },
                stackable: true,
                maxStack: 999,
                rarity: 'common',
                value: 1
            }
        };
    }

    // Get all available inventory items
    getAllItems() {
        return { ...this.inventoryItems };
    }

    // Get a specific item by ID
    getItem(itemId) {
        return this.inventoryItems[itemId] ? { ...this.inventoryItems[itemId] } : null;
    }

    // Get items by type
    getItemsByType(type) {
        const items = {};
        Object.keys(this.inventoryItems).forEach(key => {
            if (this.inventoryItems[key].type === type) {
                items[key] = { ...this.inventoryItems[key] };
            }
        });
        return items;
    }

    // Get items by rarity
    getItemsByRarity(rarity) {
        const items = {};
        Object.keys(this.inventoryItems).forEach(key => {
            if (this.inventoryItems[key].rarity === rarity) {
                items[key] = { ...this.inventoryItems[key] };
            }
        });
        return items;
    }

    // Check if an item exists
    itemExists(itemId) {
        return this.inventoryItems.hasOwnProperty(itemId);
    }

    // Get all item types
    getItemTypes() {
        const types = new Set();
        Object.values(this.inventoryItems).forEach(item => {
            types.add(item.type);
        });
        return Array.from(types);
    }

    // Get all rarities
    getRarities() {
        const rarities = new Set();
        Object.values(this.inventoryItems).forEach(item => {
            rarities.add(item.rarity);
        });
        return Array.from(rarities);
    }

    // Add a new item (for use with sprite editor)
    addItem(itemData) {
        if (!itemData.id) {
            console.error('Item must have an ID');
            return false;
        }

        if (this.inventoryItems[itemData.id]) {
            console.warn(`Item with ID '${itemData.id}' already exists. Updating existing item.`);
        }

        // Ensure required properties exist
        const item = {
            id: itemData.id,
            name: itemData.name || 'Unnamed Item',
            type: itemData.type || 'misc',
            description: itemData.description || 'No description',
            sprite: itemData.sprite || {
                src: 'sprites/Inventory item sprite sets/inventory_items_pack1.png',
                x: 0,
                y: 0,
                width: 32,
                height: 32
            },
            stackable: itemData.stackable !== undefined ? itemData.stackable : true,
            maxStack: itemData.maxStack || (itemData.stackable ? 99 : 1),
            rarity: itemData.rarity || 'common',
            value: itemData.value || 10,
            ...itemData // Include any additional properties
        };

        this.inventoryItems[itemData.id] = item;
        return true;
    }

    // Remove an item
    removeItem(itemId) {
        if (this.inventoryItems[itemId]) {
            delete this.inventoryItems[itemId];
            return true;
        }
        return false;
    }

    // Get formatted list for display
    getFormattedList() {
        return Object.values(this.inventoryItems).map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            spriteInfo: `${item.sprite.x}, ${item.sprite.y}, ${item.sprite.width}x${item.sprite.height}`,
            description: item.description
        }));
    }
}