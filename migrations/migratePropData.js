const PropDefinition = require('../models/PropDefinition');
const SpriteSheet = require('../models/SpriteSheet');
const mongoose = require('mongoose');

/**
 * Migration to populate MongoDB with hardcoded props from propData.js
 * This runs once on server startup to transfer all props to database
 */
async function migratePropData() {
    try {
        // Check if migration has already run
        const MigrationModel = mongoose.connection.collection('migrations');
        const migrationRecord = await MigrationModel.findOne({ name: 'propDataMigration' });

        if (migrationRecord) {
            console.log('✓ Prop data migration already completed, skipping...');
            return;
        }

        console.log('📥 Starting prop data migration from propData.js to MongoDB...');

        // Step 1: Register sprite sheets
        console.log('  → Registering sprite sheets...');

        const spriteSheets = [
            {
                sheetKey: 'villageProps',
                name: 'TX Village Props',
                filePath: 'sprites/PROPS/Pixel Art Platformer/Texture/TX Village Props.png',
                category: 'Village'
            },
            {
                sheetKey: 'trees',
                name: 'Fantasy Forest - Trees',
                filePath: 'sprites/PROPS/Full Fantasy Forest/Trees.png',
                category: 'Nature'
            },
            {
                sheetKey: 'vegetation',
                name: 'Fantasy Forest - Vegetation',
                filePath: 'sprites/PROPS/Full Fantasy Forest/Vegetation.png',
                category: 'Nature'
            }
        ];

        for (const sheetData of spriteSheets) {
            const existing = await SpriteSheet.findOne({ sheetKey: sheetData.sheetKey });
            if (!existing) {
                await SpriteSheet.registerSheet(sheetData);
                console.log(`    ✓ Registered sprite sheet: ${sheetData.name}`);
            } else {
                console.log(`    ⊙ Sprite sheet already exists: ${sheetData.name}`);
            }
        }

        // Step 2: Define all props from propData.js
        console.log('  → Migrating prop definitions...');

        const props = [
            // Buildings & Structures
            { key: 'house', prop: { tileX: 0, tileY: 6, width: 32, height: 32, name: 'House', spriteSheet: 'villageProps', category: 'Buildings' }},
            { key: 'tower', prop: { tileX: 15, tileY: 0, width: 32, height: 32, name: 'Tower', spriteSheet: 'villageProps', category: 'Buildings' }},
            { key: 'windmill', prop: { tileX: 15, tileY: 14, width: 64, height: 64, name: 'Windmill', spriteSheet: 'villageProps', category: 'Buildings' }},
            { key: 'woodenPole', prop: { tileX: 29.41, tileY: 0.94, width: 15, height: 100, name: 'Wooden Pole', spriteSheet: 'villageProps', category: 'Buildings' }},
            { key: 'woodenPoleArm', prop: { tileX: 30.53, tileY: 1.16, width: 32, height: 24, name: 'Wooden Pole Arm', spriteSheet: 'villageProps', category: 'Buildings' }},
            { key: 'bannerPole', prop: { tileX: 17.78, tileY: 7.16, width: 48, height: 91, name: 'Banner Pole', spriteSheet: 'villageProps', category: 'Structures' }},
            { key: 'poleBarrier', prop: { tileX: 27.25, tileY: 0.56, width: 47, height: 47, name: 'Pole Barrier', spriteSheet: 'villageProps', category: 'Structures' }},

            // Fences & Walls
            { key: 'fenceNail', prop: { tileX: 2.56, tileY: 3.41, width: 5, height: 6, name: 'Fence Nail', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fencePole1', prop: { tileX: 1.09, tileY: 2.94, width: 8, height: 35, name: 'Fence Pole 1', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fencePole2', prop: { tileX: 1.69, tileY: 2.91, width: 7, height: 36, name: 'Fence Pole 2', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fencePole3', prop: { tileX: 2.16, tileY: 2.94, width: 9, height: 35, name: 'Fence Pole 3', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fenceBoard1', prop: { tileX: 2.81, tileY: 2.97, width: 43, height: 11, name: 'Fence Board 1', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fenceBoard2', prop: { tileX: 2.81, tileY: 3.31, width: 42, height: 11, name: 'Fence Board 2', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fenceBoard3', prop: { tileX: 2.81, tileY: 3.66, width: 43, height: 13, name: 'Fence Board 3', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fencePoleSpiked', prop: { tileX: 5.31, tileY: 2.94, width: 13, height: 36, name: 'Fence Pole Spiked', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'fenceBoardShort', prop: { tileX: 6.28, tileY: 3.34, width: 15, height: 10, name: 'Fence Board Short', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'boardFenceComplete', prop: { tileX: 14.13, tileY: 2.75, width: 87, height: 41, name: 'Board Fence Complete', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'mossyBrickWall', prop: { tileX: 22.84, tileY: 19.69, width: 138, height: 43, name: 'Mossy Brick Wall', spriteSheet: 'villageProps', category: 'Fences' }},

            // Trees & Nature
            { key: 'tree1', prop: { tileX: 15, tileY: 8, width: 32, height: 32, name: 'Tree 1', spriteSheet: 'villageProps', category: 'Nature' }},
            { key: 'tree2', prop: { tileX: 25.88, tileY: 13.88, width: 159, height: 166, name: 'Tree 2', spriteSheet: 'villageProps', category: 'Nature' }},
            { key: 'tree3', prop: { tileX: 0.00, tileY: 0.25, width: 63, height: 88, name: 'Tree 3', spriteSheet: 'trees', category: 'Nature' }},
            { key: 'tree4', prop: { tileX: 2.03, tileY: -0.03, width: 61, height: 97, name: 'Tree 4', spriteSheet: 'trees', category: 'Nature' }},

            // Decorative Items
            { key: 'barrel', prop: { tileX: 6.05, tileY: 1, width: 29, height: 32, name: 'Barrel', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'crate', prop: { tileX: 4, tileY: 1, width: 32, height: 32, name: 'Crate', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'bigCrate', prop: { tileX: 1.31, tileY: 0.59, width: 44, height: 45, name: 'Big Crate', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'fence', prop: { tileX: 5, tileY: 2, width: 32, height: 16, name: 'Fence', spriteSheet: 'villageProps', category: 'Fences' }},
            { key: 'bigPot', prop: { tileX: 10.24, tileY: 1.08, width: 19.4, height: 30.5, name: 'Big Pot', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'mediumPot', prop: { tileX: 8.19, tileY: 1.00, width: 20, height: 32, name: 'Medium Pot', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'smallPot', prop: { tileX: 9.13, tileY: 1.34, width: 25, height: 23, name: 'Small Pot', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'well', prop: { tileX: 1, tileY: 5.1, width: 90, height: 95, name: 'Well', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'bucket', prop: { tileX: 4.13, tileY: 7.19, width: 24, height: 27, name: 'Bucket', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'table', prop: { tileX: 9.81, tileY: 6.13, width: 74, height: 28, name: 'Table', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'chair', prop: { tileX: 12.28, tileY: 5.84, width: 23, height: 38, name: 'Chair', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'mug', prop: { tileX: 10.66, tileY: 5.69, width: 10, height: 11, name: 'Mug', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'graveStone1', prop: { tileX: 13.94, tileY: 5.19, width: 35, height: 27, name: 'Grave Stone 1', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'graveStone2', prop: { tileX: 15.94, tileY: 4.50, width: 37, height: 49, name: 'Grave Stone 2', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'cart', prop: { tileX: 1.00, tileY: 9.59, width: 96, height: 40, name: 'Cart', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'cartWheel', prop: { tileX: 3.97, tileY: 8.97, width: 33, height: 34, name: 'Cart Wheel', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'hayStack1', prop: { tileX: 5.97, tileY: 7.88, width: 64, height: 37, name: 'Hay Stack 1', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'hayStack2', prop: { tileX: 8.84, tileY: 8.06, width: 43, height: 31, name: 'Hay Stack 2', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'bonFire', prop: { tileX: 11.03, tileY: 8.22, width: 63, height: 26, name: 'Bon Fire', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'sackClosed', prop: { tileX: 14.09, tileY: 6.88, width: 27, height: 38, name: 'Sack Closed', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'sackOpen', prop: { tileX: 16.03, tileY: 6.84, width: 27, height: 38, name: 'Sack Open', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'banner', prop: { tileX: 20.03, tileY: 7.06, width: 29, height: 60, name: 'Banner', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'scareCrow', prop: { tileX: 21.97, tileY: 7.16, width: 65, height: 91, name: 'Scare Crow', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'trainingTargetDoll', prop: { tileX: 24.25, tileY: 7.88, width: 48, height: 68, name: 'Training Target Doll', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'anvil', prop: { tileX: 26.78, tileY: 5.38, width: 42, height: 21, name: 'Anvil', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'prayingStatue', prop: { tileX: 21.97, tileY: 3.56, width: 35, height: 78, name: 'Praying Statue', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'celticCrossStone', prop: { tileX: 20.06, tileY: 4.63, width: 28, height: 45, name: 'Celtic Cross Stone', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'crossStone', prop: { tileX: 18.06, tileY: 4.56, width: 29, height: 47, name: 'Cross Stone', spriteSheet: 'villageProps', category: 'Decorative' }},
            { key: 'fireBowl', prop: { tileX: 24.91, tileY: 1.00, width: 39, height: 33, name: 'Fire Bowl', spriteSheet: 'villageProps', category: 'Decorative' }},

            // Food and consumables
            { key: 'wine', prop: { tileX: 10.31, tileY: 5.41, width: 7, height: 20, name: 'Wine', spriteSheet: 'villageProps', category: 'Food' }},
            { key: 'apple', prop: { tileX: 10.66, tileY: 5.34, width: 7, height: 9, name: 'Apple', spriteSheet: 'villageProps', category: 'Food' }},
            { key: 'cake', prop: { tileX: 11.06, tileY: 5.75, width: 17, height: 8, name: 'Cake', spriteSheet: 'villageProps', category: 'Food' }},
            { key: 'pumpkin1', prop: { tileX: 18.00, tileY: 3.00, width: 32, height: 33, name: 'Pumpkin 1', spriteSheet: 'villageProps', category: 'Food' }},
            { key: 'pumpkin2', prop: { tileX: 19.16, tileY: 3.25, width: 22, height: 25, name: 'Pumpkin 2', spriteSheet: 'villageProps', category: 'Food' }},

            // Signs
            { key: 'signpost', prop: { tileX: 15.00, tileY: 0.53, width: 32, height: 47, name: 'Signpost', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPostDirectional', prop: { tileX: 12.06, tileY: 0.66, width: 28, height: 44, name: 'Signpost Directional', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPostMultidirectional', prop: { tileX: 13.00, tileY: 0.25, width: 30, height: 57, name: 'Signpost Multidirectional', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signText1', prop: { tileX: 14.25, tileY: 1.13, width: 17, height: 7, name: 'Sign Text 1', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signText2', prop: { tileX: 14.25, tileY: 1.38, width: 16, height: 7, name: 'Sign Text 2', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signText3', prop: { tileX: 14.25, tileY: 1.63, width: 17, height: 6, name: 'Sign Text 3', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signText4', prop: { tileX: 16.19, tileY: 0.78, width: 20, height: 6, name: 'Sign Text 4', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signText5', prop: { tileX: 16.25, tileY: 1.06, width: 17, height: 7, name: 'Sign Text 5', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signWall', prop: { tileX: 5.84, tileY: 5.00, width: 71, height: 65, name: 'Sign Wall', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPaper1', prop: { tileX: 8.09, tileY: 5.16, width: 13, height: 16, name: 'Sign Paper 1', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPaper2', prop: { tileX: 8.09, tileY: 5.66, width: 13, height: 16, name: 'Sign Paper 2', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPaper3', prop: { tileX: 8.09, tileY: 6.16, width: 12, height: 16, name: 'Sign Paper 3', spriteSheet: 'villageProps', category: 'Signs' }},
            { key: 'signPaper4', prop: { tileX: 8.56, tileY: 5.16, width: 14, height: 20, name: 'Sign Paper 4', spriteSheet: 'villageProps', category: 'Signs' }},

            // Lamps
            { key: 'lamp', prop: { tileX: 31.31, tileY: 0.19, width: 13, height: 18, name: 'Lamp', spriteSheet: 'villageProps', category: 'Lighting', hasGlow: false }},
            { key: 'lampLighted', prop: { tileX: 30.28, tileY: 0.16, width: 13, height: 19, name: 'Lamp Lighted', spriteSheet: 'villageProps', category: 'Lighting', hasGlow: true }},
            { key: 'torch', prop: { tileX: 20.38, tileY: 1.16, width: 8, height: 24, name: 'Torch', spriteSheet: 'villageProps', category: 'Lighting', hasFlame: true }},

            // Chests
            { key: 'chest1', prop: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 1', spriteSheet: 'villageProps', category: 'Items', isChest: true, chestRow: 0 }},
            { key: 'chest2', prop: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 2', spriteSheet: 'villageProps', category: 'Items', isChest: true, chestRow: 1 }},
            { key: 'chest3', prop: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 3', spriteSheet: 'villageProps', category: 'Items', isChest: true, chestRow: 2 }},
            { key: 'chest4', prop: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 4', spriteSheet: 'villageProps', category: 'Items', isChest: true, chestRow: 3 }},

            // Vegetation
            { key: 'bush1', prop: { tileX: 14.03, tileY: 17.84, width: 93, height: 40, name: 'Bush 1', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'bush2', prop: { tileX: 11.13, tileY: 18.06, width: 57, height: 32, name: 'Bush 2', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'bush3', prop: { tileX: 17.97, tileY: 17.81, width: 97, height: 40, name: 'Bush 3', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'bush4', prop: { tileX: 0.25, tileY: 0.59, width: 16, height: 14, name: 'Bush 4', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'bush5', prop: { tileX: 1.34, tileY: 0.72, width: 9, height: 10, name: 'Bush 5', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'bush6', prop: { tileX: 2.31, tileY: 0.66, width: 13, height: 13, name: 'Bush 6', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'bush7', prop: { tileX: 3.09, tileY: 0.66, width: 26, height: 14, name: 'Bush 7', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'bush8', prop: { tileX: 0.19, tileY: 1.28, width: 19, height: 26, name: 'Bush 8', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'bush9', prop: { tileX: 0.19, tileY: 2.59, width: 19, height: 14, name: 'Bush 9', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'tree1Alt', prop: { tileX: 21.56, tileY: 14.56, width: 124, height: 146, name: 'Tree 1 Alt', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'flower1', prop: { tileX: 27.16, tileY: 8.16, width: 22, height: 59, name: 'Flower 1', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'flower2', prop: { tileX: 28.06, tileY: 8.00, width: 28, height: 64, name: 'Flower 2', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'flower3', prop: { tileX: 29.03, tileY: 8.09, width: 29, height: 61, name: 'Flower 3', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'flower4', prop: { tileX: 3.13, tileY: 1.22, width: 22, height: 27, name: 'Flower 4', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'plant1', prop: { tileX: 1.00, tileY: 2.28, width: 31, height: 24, name: 'Plant 1', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'stone1', prop: { tileX: 25.47, tileY: 11.31, width: 34, height: 23, name: 'Stone 1', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'stone2', prop: { tileX: 27.28, tileY: 11.13, width: 47, height: 29, name: 'Stone 2', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'stone3', prop: { tileX: 29.16, tileY: 11.50, width: 22, height: 17, name: 'Stone 3', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'treeStump', prop: { tileX: 24.97, tileY: 5.13, width: 33, height: 29, name: 'Tree Stump', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'flowerBundle', prop: { tileX: 23.22, tileY: 5.34, width: 19, height: 10, name: 'Flower Bundle', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass1', prop: { tileX: 12.16, tileY: 14.66, width: 20, height: 13, name: 'Grass 1', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass2', prop: { tileX: 13.09, tileY: 14.63, width: 27, height: 14, name: 'Grass 2', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass3', prop: { tileX: 14.28, tileY: 14.75, width: 13, height: 9, name: 'Grass 3', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass4', prop: { tileX: 12.16, tileY: 15.59, width: 21, height: 15, name: 'Grass 4', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass5', prop: { tileX: 13.09, tileY: 15.69, width: 25, height: 11, name: 'Grass 5', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass6', prop: { tileX: 14.19, tileY: 15.63, width: 19, height: 13, name: 'Grass 6', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass7', prop: { tileX: 12.19, tileY: 16.56, width: 21, height: 16, name: 'Grass 7', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass8', prop: { tileX: 13.03, tileY: 16.69, width: 30, height: 11, name: 'Grass 8', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass9', prop: { tileX: 14.16, tileY: 16.72, width: 21, height: 11, name: 'Grass 9', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'grass10', prop: { tileX: 1.19, tileY: 1.69, width: 18, height: 12, name: 'Grass 10', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'grass11', prop: { tileX: 2.13, tileY: 2.66, width: 21, height: 14, name: 'Grass 11', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'grass12', prop: { tileX: 3.28, tileY: 2.75, width: 13, height: 11, name: 'Grass 12', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'grass13', prop: { tileX: 1.03, tileY: 3.72, width: 32, height: 12, name: 'Grass 13', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'grass14', prop: { tileX: 2.09, tileY: 3.66, width: 26, height: 13, name: 'Grass 14', spriteSheet: 'vegetation', category: 'Vegetation' }},
            { key: 'corn1', prop: { tileX: 16.03, tileY: 15.38, width: 30, height: 54, name: 'Corn 1', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'corn2', prop: { tileX: 17.00, tileY: 15.09, width: 29, height: 62, name: 'Corn 2', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'corn3', prop: { tileX: 18.06, tileY: 15.16, width: 29, height: 60, name: 'Corn 3', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'corn4', prop: { tileX: 19.13, tileY: 15.31, width: 24, height: 54, name: 'Corn 4', spriteSheet: 'villageProps', category: 'Vegetation' }},
            { key: 'corn5', prop: { tileX: 20.13, tileY: 15.47, width: 25, height: 49, name: 'Corn 5', spriteSheet: 'villageProps', category: 'Vegetation' }},

            // Weapons & Tools
            { key: 'toolRackFrame', prop: { tileX: 7.91, tileY: 2.94, width: 70, height: 35, name: 'Tool Rack Frame', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'sword1', prop: { tileX: 10.97, tileY: 2.13, width: 38, height: 11, name: 'Sword 1', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'sword2', prop: { tileX: 10.97, tileY: 2.59, width: 37, height: 10, name: 'Sword 2', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'spear', prop: { tileX: 10.94, tileY: 3.13, width: 65, height: 9, name: 'Spear', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'axe', prop: { tileX: 10.97, tileY: 3.50, width: 39, height: 15, name: 'Axe', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'hoe', prop: { tileX: 10.97, tileY: 4.00, width: 51, height: 13, name: 'Hoe', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'hammer', prop: { tileX: 11.00, tileY: 4.47, width: 33, height: 15, name: 'Hammer', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'bowTrainingTarget', prop: { tileX: 22.34, tileY: 0.56, width: 41, height: 47, name: 'Bow Training Target', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'arrow', prop: { tileX: 22.38, tileY: 0.16, width: 36, height: 11, name: 'Arrow', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'metalStar', prop: { tileX: 27.06, tileY: 3.06, width: 29, height: 29, name: 'Metal Star', spriteSheet: 'villageProps', category: 'Weapons' }},
            { key: 'metalSpikeMat', prop: { tileX: 24.94, tileY: 3.63, width: 34, height: 13, name: 'Metal Spike Mat', spriteSheet: 'villageProps', category: 'Weapons' }}
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const { key, prop } of props) {
            const existing = await PropDefinition.findOne({ propKey: key });
            if (!existing) {
                await PropDefinition.create({
                    propKey: key,
                    name: prop.name,
                    spriteSheet: prop.spriteSheet,
                    tileX: prop.tileX,
                    tileY: prop.tileY,
                    width: prop.width,
                    height: prop.height,
                    category: prop.category,
                    hasGlow: prop.hasGlow || false,
                    hasFlame: prop.hasFlame || false,
                    isChest: prop.isChest || false,
                    chestRow: prop.chestRow || 0,
                    isObstacle: false,
                    destroyable: false,
                    damagePerSecond: 0,
                    maxDurability: 100
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`    ✓ Created ${createdCount} props`);
        if (skippedCount > 0) {
            console.log(`    ⊙ Skipped ${skippedCount} existing props`);
        }

        // Step 3: Mark migration as complete
        await MigrationModel.insertOne({
            name: 'propDataMigration',
            completedAt: new Date(),
            propsCreated: createdCount,
            spriteSheets: 3
        });

        console.log(`✅ Prop data migration completed successfully!`);
        console.log(`   Total: ${createdCount} props and 3 sprite sheets migrated to MongoDB`);

    } catch (error) {
        console.error('❌ Error during prop data migration:', error);
        throw error;
    }
}

module.exports = migratePropData;
