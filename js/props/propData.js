class PropData {
    constructor() {
        this.props = [];
        this.nextPropId = 1;
        this.nextPropZOrder = 1;
        this.selectedProp = null;
        this.game = null; // Will be set by PropSystem

        // Multi-selection and grouping
        this.selectedProps = []; // Array of selected props
        this.propGroups = new Map(); // Map of groupId -> array of prop IDs
        this.nextGroupId = 1;

        // Prop placement system
        this.propPlacementMode = false;
        this.isDraggingProp = false;
        this.isDraggingMultiple = false;
        this.propDragOffset = { x: 0, y: 0 };
        this.multiDragOffsets = new Map(); // Map of propId -> offset for multi-drag

        // Drag selection system
        this.isDragSelecting = false;
        this.dragSelectionStart = { x: 0, y: 0 };
        this.dragSelectionEnd = { x: 0, y: 0 };

        // Clipboard for copy/paste
        this.clipboard = []; // Array of copied prop data

        // Prop types with their tileset coordinates and properties
        this.propTypes = {
            // Buildings & Structures
            house: { tileX: 0, tileY: 6, width: 32, height: 32, name: 'House', spriteSheet: 'villageProps' },
            tower: { tileX: 15, tileY: 0, width: 32, height: 32, name: 'Tower', spriteSheet: 'villageProps' },
            windmill: { tileX: 15, tileY: 14, width: 64, height: 64, name: 'Windmill', spriteSheet: 'villageProps' },
            woodenPole: {tileX: 29.41,tileY: 0.94,width: 15,height: 100,name: 'woodenPole', spriteSheet: 'villageProps'},
            woodenPoleArm: {tileX: 30.53,tileY: 1.16,width: 32,height: 24,name: 'woodenPoleArm', spriteSheet: 'villageProps'},
            bannerPole: { tileX: 17.78, tileY: 7.16, width: 48, height: 91, name: 'Banner Pole', spriteSheet: 'villageProps' },
            poleBarrier: { tileX: 27.25, tileY: 0.56, width: 47, height: 47, name: 'Pole Barrier', spriteSheet: 'villageProps' },
            
            // Fences & Walls
            fenceNail: { tileX: 2.56, tileY: 3.41, width: 5, height: 6, name: 'Fence Nail', spriteSheet: 'villageProps' },
            fencePole1: {tileX: 1.09,tileY: 2.94,width: 8,height: 35,name: 'Fence Pole1', spriteSheet: 'villageProps'},
            fencePole2: {tileX: 1.69,tileY: 2.91,width: 7,height: 36,name: 'Fence Pole2', spriteSheet: 'villageProps'},
            fencePole3: { tileX: 2.16, tileY: 2.94, width: 9, height: 35, name: 'Fence Pole3', spriteSheet: 'villageProps' },
            fenceBoard1: { tileX: 2.81, tileY: 2.97, width: 43, height: 11, name: 'Fence Board1', spriteSheet: 'villageProps' },
            fenceBoard2: { tileX: 2.81, tileY: 3.31, width: 42, height: 11, name: 'Fence Board2', spriteSheet: 'villageProps' },
            fenceBoard3: { tileX: 2.81, tileY: 3.66, width: 43, height: 13, name: 'Fence Board3', spriteSheet: 'villageProps' },
            fencePoleSpiked: { tileX: 5.31, tileY: 2.94, width: 13, height: 36, name: 'Fence Pole Spiked', spriteSheet: 'villageProps' },
            fenceBoardShort: { tileX: 6.28, tileY: 3.34, width: 15, height: 10, name: 'Fence Board Short', spriteSheet: 'villageProps' },
            boardFenceComplete: { tileX: 14.13, tileY: 2.75, width: 87, height: 41, name: 'Board Fence Complete', spriteSheet: 'villageProps' },
            mossyBrickWall: { tileX: 22.84, tileY: 19.69, width: 138, height: 43, name: 'Mossy Brick Wall', spriteSheet: 'villageProps' },
            // Trees & Nature
            tree1: { tileX: 15, tileY: 8, width: 32, height: 32, name: 'Tree 1', spriteSheet: 'villageProps' },
            tree2: { tileX: 25.88, tileY: 13.88, width: 159, height: 166, name: 'Tree 2', spriteSheet: 'villageProps' },
            tree3: { tileX: 0.00, tileY: 0.25, width: 63, height: 88, name: 'Tree 3', spriteSheet: 'trees' },
            tree4: { tileX: 2.03, tileY: -0.03, width: 61, height: 97, name: 'Tree 4', spriteSheet: 'trees' },
            //bush: { tileX: 6, tileY: 2, width: 32, height: 16, name: 'Bush', spriteSheet: 'villageProps' },

            // Decorative Items
            barrel: {
                tileX: 6.05,
                tileY: 1,
                width: 29,
                height: 32,
                name: 'Barrel',
                spriteSheet: 'villageProps'
            },
            crate: { tileX: 4, tileY: 1, width: 32, height: 32, name: 'Crate', spriteSheet: 'villageProps' },
            bigCrate: { tileX: 1.31, tileY: 0.59, width: 44, height: 45, name: 'bigCrate', spriteSheet: 'villageProps' },
            fence: { tileX: 5, tileY: 2, width: 32, height: 16, name: 'Fence', spriteSheet: 'villageProps' },
            bigPot: { tileX: 10.24, tileY: 1.08, width: 19.4, height: 30.5, name: 'bigPot', spriteSheet: 'villageProps' },
            mediumPot: { tileX: 8.19, tileY: 1.00, width: 20, height: 32, name: 'mediumPot', spriteSheet: 'villageProps' },
            smallPot: { tileX: 9.13, tileY: 1.34, width: 25, height: 23, name: 'smallPot', spriteSheet: 'villageProps' },
            well: { tileX: 1, tileY: 5.1, width: 90, height: 95, name: 'Well', spriteSheet: 'villageProps' },
            bucket: { tileX: 4.13, tileY: 7.19, width: 24, height: 27, name: 'bucket', spriteSheet: 'villageProps' },
            table: { tileX: 9.81, tileY: 6.13, width: 74, height: 28, name: 'Table', spriteSheet: 'villageProps' },
            chair: { tileX: 12.28, tileY: 5.84, width: 23, height: 38, name: 'Chair', spriteSheet: 'villageProps' },
            mug: { tileX: 10.66, tileY: 5.69, width: 10, height: 11, name: 'Mug', spriteSheet: 'villageProps' },
            graveStone1: { tileX: 13.94, tileY: 5.19, width: 35, height: 27, name: 'Grave Stone1', spriteSheet: 'villageProps' },
            graveStone2: { tileX: 15.94, tileY: 4.50, width: 37, height: 49, name: 'Grave Stone2', spriteSheet: 'villageProps' },
            cart: { tileX: 1.00, tileY: 9.59, width: 96, height: 40, name: 'Cart', spriteSheet: 'villageProps' },
            cartWheel: { tileX: 3.97, tileY: 8.97, width: 33, height: 34, name: 'Cart Wheel', spriteSheet: 'villageProps' },
            hayStack1: { tileX: 5.97, tileY: 7.88, width: 64, height: 37, name: 'Hay Stack1', spriteSheet: 'villageProps' },
            hayStack2: { tileX: 8.84, tileY: 8.06, width: 43, height: 31, name: 'Hay Stack2', spriteSheet: 'villageProps' },
            bonFire: { tileX: 11.03, tileY: 8.22, width: 63, height: 26, name: 'Bon Fire', spriteSheet: 'villageProps' },
            sackClosed: { tileX: 14.09, tileY: 6.88, width: 27, height: 38, name: 'Sack Closed', spriteSheet: 'villageProps' },
            sackOpen: { tileX: 16.03, tileY: 6.84, width: 27, height: 38, name: 'Sack Open', spriteSheet: 'villageProps' },
            banner: { tileX: 20.03, tileY: 7.06, width: 29, height: 60, name: 'Banner', spriteSheet: 'villageProps' },
            scareCrow: { tileX: 21.97, tileY: 7.16, width: 65, height: 91, name: 'Scare Crow', spriteSheet: 'villageProps' },
            trainingTargetDoll: { tileX: 24.25, tileY: 7.88, width: 48, height: 68, name: 'Training Target Doll', spriteSheet: 'villageProps' },
            anvil: { tileX: 26.78, tileY: 5.38, width: 42, height: 21, name: 'Anvil', spriteSheet: 'villageProps' },
            prayingStatue: { tileX: 21.97, tileY: 3.56, width: 35, height: 78, name: 'Praying Statue', spriteSheet: 'villageProps' },
            celticCrossStone: { tileX: 20.06, tileY: 4.63, width: 28, height: 45, name: 'Celtic Cross Stone', spriteSheet: 'villageProps' },
            crossStone: { tileX: 18.06, tileY: 4.56, width: 29, height: 47, name: 'Cross Stone', spriteSheet: 'villageProps' },
            fireBowl: { tileX: 24.91, tileY: 1.00, width: 39, height: 33, name: 'Fire Bowl', spriteSheet: 'villageProps' },
            // Food and consumables
            wine: { tileX: 10.31, tileY: 5.41, width: 7, height: 20, name: 'Wine', spriteSheet: 'villageProps' },
            apple: { tileX: 10.66, tileY: 5.34, width: 7, height: 9, name: 'Apple', spriteSheet: 'villageProps' },
            cake: { tileX: 11.06, tileY: 5.75, width: 17, height: 8, name: 'Cake', spriteSheet: 'villageProps' },
            pumpkin1: { tileX: 18.00, tileY: 3.00, width: 32, height: 33, name: 'Pumpkin1', spriteSheet: 'villageProps' },
            pumpkin2: { tileX: 19.16, tileY: 3.25, width: 22, height: 25, name: 'Pumpkin2', spriteSheet: 'villageProps' },
            // Signs
            signpost: { tileX: 15.00, tileY: 0.53, width: 32, height: 47, name: 'Signpost', spriteSheet: 'villageProps' },
            signPostDirectional: { tileX: 12.06, tileY: 0.66, width: 28, height: 44, name: 'signpostDirectional', spriteSheet: 'villageProps' },
            signPostMultidirectional: { tileX: 13.00, tileY: 0.25, width: 30, height: 57, name: 'signpostMultidirectional', spriteSheet: 'villageProps' },
            signText1: { tileX: 14.25, tileY: 1.13, width: 17, height: 7, name: 'signText1', spriteSheet: 'villageProps' },
            signText2: { tileX: 14.25, tileY: 1.38, width: 16, height: 7, name: 'signText2', spriteSheet: 'villageProps' },
            signText3: { tileX: 14.25, tileY: 1.63, width: 17, height: 6, name: 'signText3', spriteSheet: 'villageProps' },
            signText4: { tileX: 16.19, tileY: 0.78, width: 20, height: 6, name: 'signText4', spriteSheet: 'villageProps' },
            signText5: { tileX: 16.25, tileY: 1.06, width: 17, height: 7, name: 'signText5', spriteSheet: 'villageProps' },
            signWall: { tileX: 5.84, tileY: 5.00, width: 71, height: 65, name: 'signWall', spriteSheet: 'villageProps' },
            signPaper1: { tileX: 8.09, tileY: 5.16, width: 13, height: 16, name: 'signPaper1', spriteSheet: 'villageProps' },
            signPaper2: { tileX: 8.09, tileY: 5.66, width: 13, height: 16, name: 'signPaper2', spriteSheet: 'villageProps' },
            signPaper3: { tileX: 8.09, tileY: 6.16, width: 12, height: 16, name: 'signPaper3', spriteSheet: 'villageProps' },
            signPaper4: { tileX: 8.56, tileY: 5.16, width: 14, height: 20, name: 'signPaper4', spriteSheet: 'villageProps' },

            // Lamps
            lamp: { tileX: 31.31, tileY: 0.19, width: 13, height: 18, name: 'Lamp', spriteSheet: 'villageProps' },
            lampLighted: { tileX: 30.28, tileY: 0.16, width: 13, height: 19, name: 'lampLighted', hasGlow: true, spriteSheet: 'villageProps' },
            torch: { tileX: 20.38, tileY: 1.16, width: 8, height: 24, name: 'Torch', hasFlame: true, spriteSheet: 'villageProps' },

            // Chests (4 different styles, 7 frames each)
            // These don't use the village props tileset, they use their own sprite sheet
            // Setting tileX and tileY to -1 to indicate they don't use the tileset
            // Chest graphic is 32x40 pixels (extra height for lid animation)
            // Note: Chests use special rendering logic and don't need spriteSheet property
            chest1: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 1', isChest: true, chestRow: 0 },
            chest2: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 2', isChest: true, chestRow: 1 },
            chest3: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 3', isChest: true, chestRow: 2 },
            chest4: { tileX: -1, tileY: -1, width: 32, height: 40, name: 'Chest Style 4', isChest: true, chestRow: 3 },

            // Vegetation
            bush1: { tileX: 14.03, tileY: 17.84, width: 93, height: 40, name: 'bush1', spriteSheet: 'villageProps' },
            bush2: { tileX: 11.13, tileY: 18.06, width: 57, height: 32, name: 'Bush2', spriteSheet: 'villageProps' },
            bush3: { tileX: 17.97, tileY: 17.81, width: 97, height: 40, name: 'Bush3', spriteSheet: 'villageProps' },
            bush4: { tileX: 0.25, tileY: 0.59, width: 16, height: 14, name: 'Bush 4', spriteSheet: 'vegetation' },
            bush5: { tileX: 1.34, tileY: 0.72, width: 9, height: 10, name: 'Bush 5', spriteSheet: 'vegetation' },
            bush6: { tileX: 2.31, tileY: 0.66, width: 13, height: 13, name: 'Bush 6', spriteSheet: 'vegetation' },
            bush7: { tileX: 3.09, tileY: 0.66, width: 26, height: 14, name: 'Bush 7', spriteSheet: 'vegetation' },
            bush8: { tileX: 0.19, tileY: 1.28, width: 19, height: 26, name: 'Bush 8', spriteSheet: 'vegetation' },
            bush9: { tileX: 0.19, tileY: 2.59, width: 19, height: 14, name: 'Bush 9', spriteSheet: 'vegetation' },            
            tree1: { tileX: 21.56, tileY: 14.56, width: 124, height: 146, name: 'tree1', spriteSheet: 'villageProps' },
            flower1: { tileX: 27.16, tileY: 8.16, width: 22, height: 59, name: 'Flower1', spriteSheet: 'villageProps' },
            flower2: { tileX: 28.06, tileY: 8.00, width: 28, height: 64, name: 'Flower2', spriteSheet: 'villageProps' },
            flower3: { tileX: 29.03, tileY: 8.09, width: 29, height: 61, name: 'Flower3', spriteSheet: 'villageProps' },
            flower4: { tileX: 3.13, tileY: 1.22, width: 22, height: 27, name: 'Flower4', spriteSheet: 'vegetation' },
            plant1: { tileX: 1.00, tileY: 2.28, width: 31, height: 24, name: 'Plant1', spriteSheet: 'vegetation' },
            stone1: { tileX: 25.47, tileY: 11.31, width: 34, height: 23, name: 'Stone1', spriteSheet: 'villageProps' },
            stone2: { tileX: 27.28, tileY: 11.13, width: 47, height: 29, name: 'Stone2', spriteSheet: 'villageProps' },
            stone3: { tileX: 29.16, tileY: 11.50, width: 22, height: 17, name: 'Stone3', spriteSheet: 'villageProps' },
            treeStump: { tileX: 24.97, tileY: 5.13, width: 33, height: 29, name: 'Tree Stump', spriteSheet: 'villageProps' },
            flowerBundle: { tileX: 23.22, tileY: 5.34, width: 19, height: 10, name: 'Flower Bundle', spriteSheet: 'villageProps' },
            grass1: { tileX: 12.16, tileY: 14.66, width: 20, height: 13, name: 'Grass1', spriteSheet: 'villageProps' },
            grass2: { tileX: 13.09, tileY: 14.63, width: 27, height: 14, name: 'Grass2', spriteSheet: 'villageProps' },
            grass3: { tileX: 14.28, tileY: 14.75, width: 13, height: 9, name: 'Grass3', spriteSheet: 'villageProps' },
            grass4: { tileX: 12.16, tileY: 15.59, width: 21, height: 15, name: 'Grass4', spriteSheet: 'villageProps' },
            grass5: { tileX: 13.09, tileY: 15.69, width: 25, height: 11, name: 'Grass5', spriteSheet: 'villageProps' },
            grass6: { tileX: 14.19, tileY: 15.63, width: 19, height: 13, name: 'Grass6', spriteSheet: 'villageProps' },
            grass7: { tileX: 12.19, tileY: 16.56, width: 21, height: 16, name: 'Grass7', spriteSheet: 'villageProps' },
            grass8: { tileX: 13.03, tileY: 16.69, width: 30, height: 11, name: 'Grass8', spriteSheet: 'villageProps' },
            grass9: { tileX: 14.16, tileY: 16.72, width: 21, height: 11, name: 'Grass9', spriteSheet: 'villageProps' },            
            grass10: { tileX: 1.19, tileY: 1.69, width: 18, height: 12, name: 'Grass10', spriteSheet: 'vegetation' },
            grass11: { tileX: 2.13, tileY: 2.66, width: 21, height: 14, name: 'Grass11', spriteSheet: 'vegetation' },
            grass12: { tileX: 3.28, tileY: 2.75, width: 13, height: 11, name: 'Grass12', spriteSheet: 'vegetation' },
            grass13: { tileX: 1.03, tileY: 3.72, width: 32, height: 12, name: 'Grass13', spriteSheet: 'vegetation' },
            grass14: { tileX: 2.09, tileY: 3.66, width: 26, height: 13, name: 'Grass14', spriteSheet: 'vegetation' },
            corn1: { tileX: 16.03, tileY: 15.38, width: 30, height: 54, name: 'Corn1', spriteSheet: 'villageProps' },
            corn2: { tileX: 17.00, tileY: 15.09, width: 29, height: 62, name: 'Corn2', spriteSheet: 'villageProps' },
            corn3: { tileX: 18.06, tileY: 15.16, width: 29, height: 60, name: 'Corn3', spriteSheet: 'villageProps' },
            corn4: { tileX: 19.13, tileY: 15.31, width: 24, height: 54, name: 'Corn4', spriteSheet: 'villageProps' },
            corn5: { tileX: 20.13, tileY: 15.47, width: 25, height: 49, name: 'Corn5', spriteSheet: 'villageProps' },
            //Weapons & tools, weaponPractice and weaponDecoration
            toolRackFrame: { tileX: 7.91, tileY: 2.94, width: 70, height: 35, name: 'Tool Rack Frame', spriteSheet: 'villageProps' },
            sword1: { tileX: 10.97, tileY: 2.13, width: 38, height: 11, name: 'Sword1', spriteSheet: 'villageProps' },
            sword2: { tileX: 10.97, tileY: 2.59, width: 37, height: 10, name: 'Sword2', spriteSheet: 'villageProps' },
            spear: { tileX: 10.94, tileY: 3.13, width: 65, height: 9, name: 'Spear', spriteSheet: 'villageProps' },
            axe: { tileX: 10.97, tileY: 3.50, width: 39, height: 15, name: 'Axe', spriteSheet: 'villageProps' },
            hoe: { tileX: 10.97, tileY: 4.00, width: 51, height: 13, name: 'Hoe', spriteSheet: 'villageProps' },
            hammer: { tileX: 11.00, tileY: 4.47, width: 33, height: 15, name: 'Hammer', spriteSheet: 'villageProps' },
            bowTrainingTarget: { tileX: 22.34, tileY: 0.56, width: 41, height: 47, name: 'Bow Training Target', spriteSheet: 'villageProps' },
            arrow: { tileX: 22.38, tileY: 0.16, width: 36, height: 11, name: 'Arrow', spriteSheet: 'villageProps' },
            metalStar: { tileX: 27.06, tileY: 3.06, width: 29, height: 29, name: 'Metal Star', spriteSheet: 'villageProps' },
            metalSpikeMat: { tileX: 24.94, tileY: 3.63, width: 34, height: 13, name: 'Metal Spike Mat', spriteSheet: 'villageProps' },
        };

        // Prop categories for organized display
        this.propCategories = {
            'Buildings': ['house', 'tower', 'windmill', 'woodenPole', 'woodenPoleArm'],
            'Structures': ['bannerPole', 'poleBarrier'],
            'Fences & Walls': ['fenceNail', 'fencePole1', 'fencePole2', 'fencePole3', 'fenceBoard1', 'fenceBoard2', 'fenceBoard3', 'fencePoleSpiked', 'fenceBoardShort', 'boardFenceComplete', 'mossyBrickWall'],
            'Decorative': ['table', 'chair', 'mug', 'graveStone1', 'graveStone2', 'cart', 'cartWheel', 'hayStack1', 'hayStack2', 'bonFire', 'sackClosed', 'sackOpen', 'banner', 'scareCrow', 'trainingTargetDoll', 'anvil', 'prayingStatue', 'celticCrossStone', 'crossStone', 'fireBowl'],
            'Food & Consumables': ['wine', 'apple', 'cake', 'pumpkin1', 'pumpkin2'],
            'Nature': ['tree1', 'tree2', 'tree3', 'tree4'],
            'Signs': ['signpost', 'signPostDirectional', 'signPostMultidirectional', 'signText1', 'signText2', 'signText3', 'signText4', 'signText5', 'signWall', 'signPaper1', 'signPaper2', 'signPaper3', 'signPaper4'],
            'Items': ['barrel', 'crate', 'bigCrate', 'chest1', 'chest2', 'chest3', 'chest4', 'fence', 'well', 'bucket', 'lamp', 'lampLighted', 'torch', 'bigPot', 'mediumPot', 'smallPot'],
            'Vegetation': ['bush1', 'bush2', 'bush3', 'bush4', 'bush5', 'bush6', 'bush7', 'bush8', 'bush9', 'flower1', 'flower2', 'flower3', 'flower4', 'plant1', 'stone1', 'stone2', 'stone3', 'treeStump', 'flowerBundle', 'grass1', 'grass2', 'grass3', 'grass4', 'grass5', 'grass6', 'grass7', 'grass8', 'grass9', 'grass10', 'grass11', 'grass12', 'grass13', 'grass14', 'corn1', 'corn2', 'corn3', 'corn4', 'corn5'],
            'Weapons & Tools': ['toolRackFrame', 'sword1', 'sword2', 'spear', 'axe', 'hoe', 'hammer', 'bowTrainingTarget', 'arrow', 'metalStar', 'metalSpikeMat']
        };
    }

    // Get all category names
    getCategories() {
        return Object.keys(this.propCategories);
    }

    // Get props by category
    getPropsByCategory(category) {
        const propIds = this.propCategories[category] || [];
        return propIds.map(id => ({
            id: id,
            ...this.propTypes[id]
        })).filter(prop => prop.name); // Filter out any undefined props
    }

    // Get all props organized by category
    getAllPropsByCategory() {
        const result = {};
        for (const category in this.propCategories) {
            result[category] = this.getPropsByCategory(category);
        }
        return result;
    }

    initializePropZOrders() {
        // Assign z-orders to any existing props that don't have them
        this.props.forEach(prop => {
            if (prop.zOrder === undefined || prop.zOrder === null) {
                prop.zOrder = this.nextPropZOrder++;
            }

            // Initialize chest properties for loaded chests
            if (prop.isChest) {
                if (prop.chestState === undefined || prop.chestState === null) {
                    prop.chestState = 'closed';
                }
                if (prop.chestAnimFrame === undefined || prop.chestAnimFrame === null) {
                    prop.chestAnimFrame = 0;
                }
                if (prop.chestAnimTimer === undefined) {
                    prop.chestAnimTimer = 0;
                }
                if (prop.chestAnimSpeed === undefined) {
                    prop.chestAnimSpeed = 100;
                }
                if (prop.chestInventory === undefined || prop.chestInventory === null) {
                    prop.chestInventory = [];
                }
            }
        });

        // Update nextPropId to be higher than any existing prop ID
        if (this.props.length > 0) {
            const maxId = Math.max(...this.props.map(prop => prop.id || 0));
            this.nextPropId = maxId + 1;
        }

        // Update nextPropZOrder to be higher than any existing z-order
        if (this.props.length > 0) {
            const maxZOrder = Math.max(...this.props.map(prop => prop.zOrder || 0));
            this.nextPropZOrder = maxZOrder + 1;
        }
    }

    getNextUniqueId() {
        // Ensure nextPropId is always higher than any existing prop ID
        if (this.props.length > 0) {
            const maxId = Math.max(...this.props.map(prop => prop.id || 0));
            this.nextPropId = Math.max(this.nextPropId, maxId + 1);
        }
        return this.nextPropId++;
    }

    addProp(type, x, y, isObstacle = false, sizeMultiplier = 1.0, damagePerSecond = 0, destroyable = false, maxDurability = 100) {
        const propType = this.propTypes[type];
        if (!propType) return null;

        const newProp = {
            id: this.getNextUniqueId(),
            type: type,
            x: x,
            y: y,
            isObstacle: isObstacle,
            zOrder: this.nextPropZOrder++,
            positioning: 'absolute', // 'absolute', 'screen-relative'
            relativeX: 0.5,         // Relative position (0-1) for screen-relative mode
            relativeY: 0.5,         // Relative position (0-1) for screen-relative mode
            sizeMultiplier: sizeMultiplier,  // Resolution-independent size multiplier
            rotation: 0,            // Rotation angle in radians
            damagePerSecond: damagePerSecond, // Damage dealt to player per second
            // Chest-specific properties
            isChest: propType.isChest || false,
            chestState: propType.isChest ? 'closed' : null, // 'closed', 'opening', 'open', 'closing'
            chestAnimFrame: propType.isChest ? 0 : null, // Always start at frame 0 (closed)
            chestAnimTimer: 0,
            chestAnimSpeed: 100, // milliseconds per frame
            chestInventory: propType.isChest ? [] : null, // Array of inventory items in this chest
            // Destruction system properties
            destroyable: destroyable,
            maxDurability: destroyable ? maxDurability : 0,
            currentDurability: destroyable ? maxDurability : 0,
            isDestroying: false,
            destructionFrameIndex: 0,
            destructionTimer: 0,
            destructionFrameRate: 150, // milliseconds per frame
            isDestroyed: false,
            isVisible: true,
            isDamaged: false,
            damageTimer: 0,
            // Movement system properties
            isMoving: false,
            moveSpeed: 2,
            movementZone: {
                enabled: false,
                startX: x - 50,
                startY: y,
                endX: x + 50,
                endY: y,
                angle: 0  // Angle in radians for line direction
            },
            // Movement state
            velocityX: 0,
            velocityY: 0,
            targetX: x,
            targetY: y,
            movingDirection: 1, // 1 for forward along line, -1 for backward
            movementProgress: 0, // 0-1 position along the movement line
            // Movement control properties
            originalPosition: { x: x, y: y }, // Store original position for reset
            // Movement easing and delay properties
            useEasing: false, // Enable easing near movement zone ends
            easingDistance: 0.2, // Distance from ends (0-1) where easing applies
            easingMinSpeed: 0.2, // Minimum speed multiplier when easing (0-1, e.g. 0.2 = 20% of normal speed)
            endDelay: 0, // Delay in milliseconds at movement zone ends
            delayTimer: 0, // Current delay timer
            isDelaying: false, // Whether prop is currently delaying at an end
            // Spinning properties
            isSpinning: false,
            spinSpeed: 1.0, // Rotations per second
            spinClockwise: true, // true for clockwise, false for counter-clockwise
            // Platform binding properties
            boundToPlatform: null, // Platform ID this prop is bound to
            platformBindOffset: { x: 0, y: 0 } // Relative offset from platform center
        };

        this.props.push(newProp);
        this.selectedProp = newProp;
        return newProp;
    }

    deleteProp(propId) {
        // Convert propId to number to ensure proper comparison
        const idToDelete = typeof propId === 'string' ? parseInt(propId) : propId;

        this.props = this.props.filter(prop => {
            // Also convert prop.id to ensure consistent comparison
            const propIdNum = typeof prop.id === 'string' ? parseInt(prop.id) : prop.id;
            const keep = propIdNum !== idToDelete;
            return keep;
        });

        if (this.selectedProp && this.selectedProp.id === propId) {
            this.selectedProp = null;
        }
    }

    deleteSelectedProp() {
        if (!this.selectedProp) {
            return;
        }
        this.deleteProp(this.selectedProp.id);
        this.selectedProp = null; // Clear selection after deletion
    }

    updateProp(prop, updates) {
        Object.assign(prop, updates);
    }

    getPropById(id) {
        return this.props.find(p => p.id === id);
    }

    selectProp(prop) {
        this.selectedProp = prop;
    }

    clearSelection() {
        this.selectedProp = null;
    }

    getPropType(typeName) {
        return this.propTypes[typeName];
    }

    isPointInProp(x, y, prop) {
        const propType = this.propTypes[prop.type];
        if (!propType) return false;

        const sizeMultiplier = prop.sizeMultiplier !== undefined ? prop.sizeMultiplier : 1.0;
        const renderWidth = propType.width * sizeMultiplier;
        const renderHeight = propType.height * sizeMultiplier;

        // If prop has rotation, transform the point to local coordinates
        if (prop.rotation && prop.rotation !== 0) {
            // Get prop center
            const centerX = prop.x + renderWidth / 2;
            const centerY = prop.y + renderHeight / 2;

            // Translate point to origin (relative to prop center)
            const translatedX = x - centerX;
            const translatedY = y - centerY;

            // Rotate point back (negative rotation to "unrotate" the point)
            const cos = Math.cos(-prop.rotation);
            const sin = Math.sin(-prop.rotation);
            const rotatedX = translatedX * cos - translatedY * sin;
            const rotatedY = translatedX * sin + translatedY * cos;

            // Translate back to prop coordinates
            const localX = rotatedX + centerX;
            const localY = rotatedY + centerY;

            // Check if the unrotated point is inside the prop bounds
            return localX >= prop.x && localX <= prop.x + renderWidth &&
                   localY >= prop.y && localY <= prop.y + renderHeight;
        }

        // No rotation - use simple bounds check
        const isInside = x >= prop.x && x <= prop.x + renderWidth &&
                        y >= prop.y && y <= prop.y + renderHeight;

        return isInside;
    }

    // Z-order management
    moveToFront(prop) {
        prop.zOrder = this.nextPropZOrder++;
    }

    moveToBack(prop) {
        // Find minimum z-order
        const minZOrder = Math.min(...this.props.map(p => p.zOrder || 0));
        prop.zOrder = minZOrder - 1;
    }

    swapZOrder(prop1, prop2) {
        const tempZOrder = prop1.zOrder;
        prop1.zOrder = prop2.zOrder;
        prop2.zOrder = tempZOrder;
    }

    // Multi-selection methods
    addToSelection(prop) {
        if (!this.selectedProps.includes(prop)) {
            this.selectedProps.push(prop);
        }
        this.selectedProp = prop; // Keep track of primary selection
    }

    removeFromSelection(prop) {
        this.selectedProps = this.selectedProps.filter(p => p.id !== prop.id);
        if (this.selectedProp === prop) {
            this.selectedProp = this.selectedProps.length > 0 ? this.selectedProps[0] : null;
        }
    }

    clearMultiSelection() {
        this.selectedProps = [];
        this.selectedProp = null;
    }

    selectMultiple(props) {
        this.selectedProps = [...props];
        this.selectedProp = props.length > 0 ? props[0] : null;
    }

    isSelected(prop) {
        return this.selectedProps.includes(prop);
    }

    toggleSelection(prop) {
        if (this.isSelected(prop)) {
            this.removeFromSelection(prop);
        } else {
            this.addToSelection(prop);
        }
    }

    // Grouping methods
    createGroup(props) {
        if (props.length < 2) return null;

        const groupId = this.nextGroupId++;
        const propIds = props.map(p => p.id);

        // Add groupId to each prop
        props.forEach(prop => {
            prop.groupId = groupId;
        });

        this.propGroups.set(groupId, propIds);
        return groupId;
    }

    ungroupProps(groupId) {
        const propIds = this.propGroups.get(groupId);
        if (propIds) {
            // Remove groupId from props
            propIds.forEach(propId => {
                const prop = this.getPropById(propId);
                if (prop) {
                    delete prop.groupId;
                }
            });
            this.propGroups.delete(groupId);
        }
    }

    getGroupMembers(groupId) {
        const propIds = this.propGroups.get(groupId);
        if (!propIds) return [];
        return propIds.map(id => this.getPropById(id)).filter(p => p);
    }

    getPropsInSameGroup(prop) {
        if (!prop.groupId) return [prop];
        // Use direct filtering instead of the Map, as Map might not be initialized for loaded groups
        return this.props.filter(p => p.groupId && p.groupId === prop.groupId);
    }

    // Helper to expand selection to include all group members
    expandSelectionToFullGroups(selectedProps) {
        const expandedSet = new Set();

        selectedProps.forEach(prop => {
            if (prop.groupId) {
                // If prop is grouped, add all props in the group
                const groupMembers = this.getPropsInSameGroup(prop);
                groupMembers.forEach(member => expandedSet.add(member));
            } else {
                // Non-grouped prop, just add it
                expandedSet.add(prop);
            }
        });

        return Array.from(expandedSet);
    }

    // Helper to group props by their groupId
    groupPropsByGroup(props) {
        const groupMap = new Map();
        const ungroupedIndex = { current: -1 }; // Use object to track unique indices for ungrouped

        props.forEach(prop => {
            const key = prop.groupId || `ungrouped_${ungroupedIndex.current--}`;
            if (!groupMap.has(key)) {
                groupMap.set(key, []);
            }
            groupMap.get(key).push(prop);
        });

        return Array.from(groupMap.values());
    }

    // Initialize groups from loaded props (called after loading from JSON)
    initializeGroupsFromProps() {
        this.propGroups.clear();
        const groupMap = new Map(); // temp map to collect prop IDs by group

        this.props.forEach(prop => {
            if (prop.groupId) {
                if (!groupMap.has(prop.groupId)) {
                    groupMap.set(prop.groupId, []);
                }
                groupMap.get(prop.groupId).push(prop.id);

                // Update nextGroupId to avoid conflicts
                this.nextGroupId = Math.max(this.nextGroupId, prop.groupId + 1);
            }
        });

        // Transfer to propGroups Map
        groupMap.forEach((propIds, groupId) => {
            this.propGroups.set(groupId, propIds);
        });
    }

    // Helper to delete multiple props
    deleteSelectedProps() {
        if (this.selectedProps.length === 0) return;

        // Ungroup any grouped props first
        const groupsToUngroup = new Set();
        this.selectedProps.forEach(prop => {
            if (prop.groupId) {
                groupsToUngroup.add(prop.groupId);
            }
        });

        groupsToUngroup.forEach(groupId => this.ungroupProps(groupId));

        // Delete the props
        const idsToDelete = this.selectedProps.map(p => p.id);
        this.props = this.props.filter(prop => !idsToDelete.includes(prop.id));

        this.clearMultiSelection();
    }

    // Convert screen-relative positioning to absolute coordinates
    getActualPosition(prop, designWidth, designHeight) {
        // Default to absolute positioning if not specified (for backward compatibility)
        const positioning = prop.positioning || 'absolute';

        if (positioning === 'screen-relative') {
            const relativeX = prop.relativeX || 0.5;
            const relativeY = prop.relativeY || 0.5;
            return {
                x: relativeX * designWidth,
                y: relativeY * designHeight
            };
        }
        return { x: prop.x, y: prop.y };
    }

    // Update relative coordinates when absolute position changes
    updateRelativePosition(prop, newX, newY, designWidth, designHeight) {
        if (prop.positioning === 'screen-relative') {
            prop.relativeX = newX / designWidth;
            prop.relativeY = newY / designHeight;
        }
        prop.x = newX;
        prop.y = newY;
    }

    // Copy selected props to clipboard
    copySelectedProps() {
        // If no multi-selection but a single prop is selected
        if (this.selectedProps.length === 0 && this.selectedProp) {
            this.clipboard = [{
                type: this.selectedProp.type,
                x: 0, // Offset from paste position
                y: 0, // Offset from paste position
                sizeMultiplier: this.selectedProp.sizeMultiplier || 1.0,
                isObstacle: this.selectedProp.isObstacle || false,
                rotation: this.selectedProp.rotation || 0,
                damagePerSecond: this.selectedProp.damagePerSecond || 0,
                groupId: null, // Single props should not inherit group IDs
                zOrder: this.selectedProp.zOrder || 0,
                positioning: this.selectedProp.positioning,
                relativeX: this.selectedProp.relativeX,
                relativeY: this.selectedProp.relativeY
            }];
            return true;
        }

        if (this.selectedProps.length === 0) return false;

        // Clear clipboard
        this.clipboard = [];

        // Expand selection to include all grouped props
        const propsToCopy = new Set();
        this.selectedProps.forEach(prop => {
            if (prop.groupId) {
                // If prop is grouped, add all props in the group
                const groupMembers = this.getPropsInSameGroup(prop);
                groupMembers.forEach(member => propsToCopy.add(member));
            } else {
                // Non-grouped prop, just add it
                propsToCopy.add(prop);
            }
        });

        // Convert Set to Array for easier processing
        const propsArray = Array.from(propsToCopy);

        // Calculate center point for relative positioning on paste
        let minX = Infinity, minY = Infinity;
        propsArray.forEach(prop => {
            minX = Math.min(minX, prop.x);
            minY = Math.min(minY, prop.y);
        });

        // Track old groupIds to new groupIds mapping for pasting
        const groupIdMap = new Map();
        let tempGroupId = 1000; // Temporary high number to avoid conflicts

        // Deep copy each prop with relative positions
        propsArray.forEach(prop => {
            const copiedProp = {
                type: prop.type,
                x: prop.x - minX, // Store relative to top-left of selection
                y: prop.y - minY,
                isObstacle: prop.isObstacle,
                positioning: prop.positioning,
                relativeX: prop.relativeX,
                relativeY: prop.relativeY,
                sizeMultiplier: prop.sizeMultiplier || 1.0,
                rotation: prop.rotation || 0,
                damagePerSecond: prop.damagePerSecond || 0,
                groupId: prop.groupId // Preserve grouping
            };
            this.clipboard.push(copiedProp);
        });

        return true;
    }

    // Nudge selected props
    nudgeSelectedProps(deltaX, deltaY) {
        if (this.selectedProps.length === 0 && this.selectedProp) {
            // If no multi-selection, nudge the single selected prop
            this.selectedProp.x += deltaX;
            this.selectedProp.y += deltaY;
            return;
        }

        // Nudge all selected props
        this.selectedProps.forEach(prop => {
            prop.x += deltaX;
            prop.y += deltaY;
        });
    }

    // Paste props from clipboard at specified position
    pasteProps(mouseX, mouseY) {
        if (this.clipboard.length === 0) return [];

        const pastedProps = [];

        // Clear selection
        this.clearMultiSelection();

        // Map old group IDs to new ones to preserve grouping
        const groupIdMap = new Map();

        // Create new props from clipboard
        this.clipboard.forEach((clipProp, index) => {
            const newProp = {
                id: this.getNextUniqueId(),
                type: clipProp.type,
                x: mouseX + clipProp.x + (index * 5), // Small offset to prevent overlap
                y: mouseY + clipProp.y + (index * 5), // Small offset to prevent overlap
                isObstacle: clipProp.isObstacle,
                zOrder: this.nextPropZOrder++,
                positioning: clipProp.positioning,
                relativeX: clipProp.relativeX,
                relativeY: clipProp.relativeY,
                sizeMultiplier: clipProp.sizeMultiplier,
                rotation: clipProp.rotation,
                damagePerSecond: clipProp.damagePerSecond || 0
            };

            // Handle grouping - create new group IDs for pasted groups
            if (clipProp.groupId) {
                if (!groupIdMap.has(clipProp.groupId)) {
                    groupIdMap.set(clipProp.groupId, this.nextGroupId++);
                }
                newProp.groupId = groupIdMap.get(clipProp.groupId);
            }

            // Add to props array
            this.props.push(newProp);
            pastedProps.push(newProp);

            // Add to selection
            this.selectedProps.push(newProp);
        });

        // Update propGroups Map for newly created groups
        groupIdMap.forEach((newGroupId, oldGroupId) => {
            const groupMembers = pastedProps
                .filter(prop => prop.groupId === newGroupId)
                .map(prop => prop.id);

            if (groupMembers.length > 0) {
                this.propGroups.set(newGroupId, groupMembers);
            }
        });

        // Set the first pasted prop as primary selection
        if (pastedProps.length > 0) {
            this.selectedProp = pastedProps[0];
        }

        return pastedProps;
    }

    // Alignment methods for multiple selected props
    alignPropsLeft() {
        if (this.selectedProps.length < 2) return;

        // Expand selection to include all group members
        const expandedSelection = this.expandSelectionToFullGroups(this.selectedProps);

        // Group props by their groupId (ungrouped props get their own "group")
        const groups = this.groupPropsByGroup(expandedSelection);

        // Find the leftmost edge among all groups
        let minX = Infinity;
        groups.forEach(group => {
            const groupMinX = Math.min(...group.map(prop => prop.x));
            minX = Math.min(minX, groupMinX);
        });

        // Align each group to the leftmost edge
        groups.forEach(group => {
            const groupMinX = Math.min(...group.map(prop => prop.x));
            const offset = minX - groupMinX;

            // Move all props in the group by the same offset
            group.forEach(prop => {
                prop.x += offset;
            });
        });
    }

    alignPropsRight() {
        if (this.selectedProps.length < 2) return;

        // Expand selection to include all group members
        const expandedSelection = this.expandSelectionToFullGroups(this.selectedProps);

        // Group props by their groupId
        const groups = this.groupPropsByGroup(expandedSelection);

        // Find the rightmost edge among all groups
        let maxRight = -Infinity;
        groups.forEach(group => {
            const groupMaxRight = Math.max(...group.map(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propWidth = propType.width * sizeMultiplier;
                    return prop.x + propWidth;
                }
                return prop.x;
            }));
            maxRight = Math.max(maxRight, groupMaxRight);
        });

        // Align each group to the rightmost edge
        groups.forEach(group => {
            const groupMaxRight = Math.max(...group.map(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propWidth = propType.width * sizeMultiplier;
                    return prop.x + propWidth;
                }
                return prop.x;
            }));
            const offset = maxRight - groupMaxRight;

            // Move all props in the group by the same offset
            group.forEach(prop => {
                prop.x += offset;
            });
        });
    }

    alignPropsCenter() {
        if (this.selectedProps.length < 2) return;

        // Expand selection to include all group members
        const expandedSelection = this.expandSelectionToFullGroups(this.selectedProps);

        // Group props by their groupId
        const groups = this.groupPropsByGroup(expandedSelection);

        // Find the average center position of all groups
        let totalCenterX = 0;
        groups.forEach(group => {
            let groupMinX = Infinity;
            let groupMaxX = -Infinity;

            group.forEach(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propWidth = propType.width * sizeMultiplier;
                    groupMinX = Math.min(groupMinX, prop.x);
                    groupMaxX = Math.max(groupMaxX, prop.x + propWidth);
                } else {
                    groupMinX = Math.min(groupMinX, prop.x);
                    groupMaxX = Math.max(groupMaxX, prop.x);
                }
            });

            const groupCenterX = (groupMinX + groupMaxX) / 2;
            totalCenterX += groupCenterX;
        });

        const targetCenterX = totalCenterX / groups.length;

        // Align each group's center to the target center
        groups.forEach(group => {
            let groupMinX = Infinity;
            let groupMaxX = -Infinity;

            group.forEach(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propWidth = propType.width * sizeMultiplier;
                    groupMinX = Math.min(groupMinX, prop.x);
                    groupMaxX = Math.max(groupMaxX, prop.x + propWidth);
                } else {
                    groupMinX = Math.min(groupMinX, prop.x);
                    groupMaxX = Math.max(groupMaxX, prop.x);
                }
            });

            const groupCenterX = (groupMinX + groupMaxX) / 2;
            const offset = targetCenterX - groupCenterX;

            // Move all props in the group by the same offset
            group.forEach(prop => {
                prop.x += offset;
            });
        });
    }

    alignPropsTop() {
        if (this.selectedProps.length < 2) return;

        // Expand selection to include all group members
        const expandedSelection = this.expandSelectionToFullGroups(this.selectedProps);

        // Group props by their groupId
        const groups = this.groupPropsByGroup(expandedSelection);

        // Find the topmost edge among all groups
        let minY = Infinity;
        groups.forEach(group => {
            const groupMinY = Math.min(...group.map(prop => prop.y));
            minY = Math.min(minY, groupMinY);
        });

        // Align each group to the topmost edge
        groups.forEach(group => {
            const groupMinY = Math.min(...group.map(prop => prop.y));
            const offset = minY - groupMinY;

            // Move all props in the group by the same offset
            group.forEach(prop => {
                prop.y += offset;
            });
        });
    }

    alignPropsBottom() {
        if (this.selectedProps.length < 2) return;

        // Expand selection to include all group members
        const expandedSelection = this.expandSelectionToFullGroups(this.selectedProps);

        // Group props by their groupId
        const groups = this.groupPropsByGroup(expandedSelection);

        // Find the bottommost edge among all groups
        let maxBottom = -Infinity;
        groups.forEach(group => {
            const groupMaxBottom = Math.max(...group.map(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propHeight = propType.height * sizeMultiplier;
                    return prop.y + propHeight;
                }
                return prop.y;
            }));
            maxBottom = Math.max(maxBottom, groupMaxBottom);
        });

        // Align each group to the bottommost edge
        groups.forEach(group => {
            const groupMaxBottom = Math.max(...group.map(prop => {
                const propType = this.propTypes[prop.type];
                if (propType) {
                    const sizeMultiplier = prop.sizeMultiplier || 1.0;
                    const propHeight = propType.height * sizeMultiplier;
                    return prop.y + propHeight;
                }
                return prop.y;
            }));
            const offset = maxBottom - groupMaxBottom;

            // Move all props in the group by the same offset
            group.forEach(prop => {
                prop.y += offset;
            });
        });
    }

    // Drag selection methods
    startDragSelection(startX, startY) {
        this.isDragSelecting = true;
        this.dragSelectionStart = { x: startX, y: startY };
        this.dragSelectionEnd = { x: startX, y: startY };
    }

    updateDragSelection(endX, endY) {
        if (!this.isDragSelecting) return;
        this.dragSelectionEnd = { x: endX, y: endY };
    }

    finishDragSelection(viewport, addToSelection = false) {
        if (!this.isDragSelecting) return;

        const rect = this.getDragSelectionRect();
        const selectedProps = this.getPropsInRect(rect, viewport);

        if (!addToSelection) {
            this.clearMultiSelection();
        }

        selectedProps.forEach(prop => {
            if (!addToSelection || !this.isSelected(prop)) {
                this.addToSelection(prop);
            }
        });

        this.isDragSelecting = false;
        return selectedProps;
    }

    cancelDragSelection() {
        this.isDragSelecting = false;
    }

    getDragSelectionRect() {
        if (!this.isDragSelecting) return null;

        const minX = Math.min(this.dragSelectionStart.x, this.dragSelectionEnd.x);
        const maxX = Math.max(this.dragSelectionStart.x, this.dragSelectionEnd.x);
        const minY = Math.min(this.dragSelectionStart.y, this.dragSelectionEnd.y);
        const maxY = Math.max(this.dragSelectionStart.y, this.dragSelectionEnd.y);

        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    getPropsInRect(rect, viewport) {
        if (!rect) return [];

        const propsInRect = [];

        for (let prop of this.props) {
            // Get actual position for the prop
            const actualPos = this.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
            const propType = this.propTypes[prop.type];

            if (propType) {
                const sizeMultiplier = prop.sizeMultiplier || 1.0;
                const propWidth = propType.width * sizeMultiplier;
                const propHeight = propType.height * sizeMultiplier;

                // Check if prop rectangle intersects with selection rectangle
                const propLeft = actualPos.x;
                const propRight = actualPos.x + propWidth;
                const propTop = actualPos.y;
                const propBottom = actualPos.y + propHeight;

                const rectLeft = rect.x;
                const rectRight = rect.x + rect.width;
                const rectTop = rect.y;
                const rectBottom = rect.y + rect.height;

                // Check for intersection
                if (propLeft < rectRight && propRight > rectLeft &&
                    propTop < rectBottom && propBottom > rectTop) {
                    propsInRect.push(prop);
                }
            }
        }

        return propsInRect;
    }

    // Destruction system methods
    damageProp(propId, damage) {
        const prop = this.getPropById(propId);
        if (!prop || !prop.destroyable || prop.isDestroying) return false;

        // Ensure the prop has proper destruction properties
        this.ensureDestructionProperties(prop);

        prop.currentDurability = Math.max(0, prop.currentDurability - damage);

        if (prop.currentDurability <= 0) {
            this.startDestruction(prop);
            return true; // Prop was destroyed
        }
        return false; // Prop was damaged but not destroyed
    }

    startDestruction(prop) {
        if (!prop || !prop.destroyable || prop.isDestroying) return;

        prop.isDestroying = true;
        prop.destructionFrameIndex = 0;
        prop.destructionTimer = 0;
        prop.currentDurability = 0;

        // Trigger item drops if this prop has drop items configured
        this.triggerItemDrops(prop);
    }

    updateDestruction(prop, deltaTime) {
        if (!prop.isDestroying) return false;

        prop.destructionTimer += deltaTime;

        if (prop.destructionTimer >= prop.destructionFrameRate) {
            prop.destructionTimer = 0;
            prop.destructionFrameIndex++;

            // Check if destruction animation is complete
            const hasDestructionSprite = this.hasDestructionSprite(prop.type);
            const maxFrames = hasDestructionSprite ? 5 : 6; // 5 for sprite animation, 6 for blink effect (3 blinks)

            if (prop.destructionFrameIndex >= maxFrames) {
                // For props with destruction sprites, start falling debris phase
                if (hasDestructionSprite) {
                    prop.isDestroying = false;
                    prop.isFallingDebris = true;
                                prop.debrisVelocityY = -0.8; // Reduced upward velocity to start falling sooner
                    prop.debrisGravity = 0.04; // Much slower gravity for graceful fall like embers

                    // Store original position to restore after debris animation
                    prop.originalX = prop.x;
                    prop.originalY = prop.y;

                    // Use separate debris position that doesn't affect the stored prop position
                    prop.debrisX = prop.x;
                    prop.debrisY = prop.y - 10; // Start debris slightly higher up

                    // Keep the prop at original position while debris animates separately
                    // Don't modify prop.x or prop.y anymore

                } else {
                    // For props without destruction sprites, just mark as destroyed
                    prop.isDestroyed = true;
                    prop.isVisible = false;
                    prop.isDestroying = false;
                }
                return true; // Prop was destroyed (but not removed)
            }
        }

        return false; // Still destroying
    }

    hasDestructionSprite(propType) {
        // For now, only barrel has a destruction sprite
        // This can be expanded later for other prop types
        return propType === 'barrel';
    }

    // Update all props with destruction animations
    updateAllDestruction(deltaTime, platformSystem = null) {
        const propsToRemove = [];

        for (const prop of this.props) {
            if (prop.isDestroying) {
                const wasRemoved = this.updateDestruction(prop, deltaTime);
                if (wasRemoved) {
                    // Prop was already removed by updateDestruction, no need to track
                    break; // Break since the array was modified
                }
            } else if (prop.isFallingDebris) {
                this.updateFallingDebris(prop, deltaTime, platformSystem);
            }
        }
    }

    // Update falling debris physics
    updateFallingDebris(prop, deltaTime, platformSystem) {
        if (!prop.isFallingDebris) return;

        // If debris has landed, only update the landing timer, not physics
        if (prop.debrisHasLanded) {
            if (prop.debrisLandingTimer) {
                        prop.debrisLandingTimer -= deltaTime;
                if (prop.debrisLandingTimer <= 0) {
                    // Stop falling debris rendering first
                    prop.isFallingDebris = false;
                    prop.debrisHasLanded = false;
                    // Clear debris coordinates
                    delete prop.debrisX;
                    delete prop.debrisY;
                    // Then restore original position and destroy
                    prop.x = prop.originalX;
                    prop.y = prop.originalY;
                    prop.isDestroyed = true;
                    prop.isVisible = false;
                }
            }
            return;
        }

        // Apply gravity to debris position (not prop position)
        prop.debrisVelocityY += prop.debrisGravity;
        prop.debrisY += prop.debrisVelocityY;

        // Check for platform collision (debris is small, only 10% of original height)
        const propType = this.propTypes[prop.type];
        const sizeMultiplier = prop.sizeMultiplier || 1.0;
        const originalHeight = propType ? propType.height * sizeMultiplier : 40;
        const debrisHeight = originalHeight * 0.1;
        const debrisBottom = prop.debrisY + debrisHeight;

        // Find closest platform below debris (using debris position)
        let groundY = this.findGroundForDebris(prop, debrisHeight, platformSystem);

        if (debrisBottom >= groundY) {
            // Debris hit ground
            prop.debrisY = groundY - debrisHeight;

            // Apply barrel-specific offset correction to make debris sit properly on platform
            if (prop.type === 'barrel') {
                prop.debrisY -= 25; // Move barrel debris up by 10 pixels
            }

            prop.debrisVelocityY = 0;
            prop.debrisHasLanded = true; // Stop physics updates

            // Add a brief pause before disappearing so player can see it land
            if (!prop.debrisLandingTimer) {
                prop.debrisLandingTimer = 500; // 500ms delay before disappearing
            }
        }
    }

    // Find ground level for falling debris
    findGroundForDebris(prop, debrisHeight, platformSystem) {
        let closestPlatformY = 1000; // Start with large value, fall back to 600 if no platforms found

        if (platformSystem && platformSystem.platforms) {
            const propType = this.propTypes[prop.type];
            const sizeMultiplier = prop.sizeMultiplier || 1.0;
            const width = propType ? propType.width * sizeMultiplier : 40;
            const debrisCenter = prop.debrisX + width / 2;

            for (const platform of platformSystem.platforms) {
                // Check if debris center is over platform
                const tolerance = 10;

                const inRange = debrisCenter >= platform.x - tolerance &&
                               debrisCenter <= platform.x + platform.width + tolerance;
                const belowDebris = platform.y >= prop.debrisY;

                if (inRange && belowDebris && platform.y < closestPlatformY) {
                    closestPlatformY = platform.y;
                }
            }
        }

        return closestPlatformY < 1000 ? closestPlatformY : 600;
    }

    // Ensure prop has all required destruction properties
    ensureDestructionProperties(prop) {
        if (prop.destroyable && (prop.maxDurability === undefined || prop.currentDurability === undefined)) {
            prop.maxDurability = prop.maxDurability || 100;
            prop.currentDurability = prop.currentDurability !== undefined ? prop.currentDurability : prop.maxDurability;
            prop.isDestroying = prop.isDestroying || false;
            prop.destructionFrameIndex = prop.destructionFrameIndex || 0;
            prop.destructionTimer = prop.destructionTimer || 0;
            prop.destructionFrameRate = prop.destructionFrameRate || 150;
            prop.isDestroyed = prop.isDestroyed || false;
            prop.isVisible = prop.isVisible !== false; // Default to visible
            prop.isDamaged = prop.isDamaged || false;
            prop.damageTimer = prop.damageTimer || 0;
        }
    }

    // Reset all destroyable props to full durability (called on game reload)
    respawnAllProps() {
        let respawnedCount = 0;
        let restoredCount = 0;

        for (const prop of this.props) {
            if (prop.destroyable) {
                // Reset ALL destroyable props to full durability
                const wasDestroyed = prop.isDestroyed;
                const wasDamaged = prop.currentDurability < prop.maxDurability;

                prop.currentDurability = prop.maxDurability;
                prop.isDestroyed = false;
                prop.isVisible = true;
                prop.isDestroying = false;
                prop.destructionFrameIndex = 0;
                prop.destructionTimer = 0;
                prop.isDamaged = false;
                prop.damageTimer = 0;

                // Reset falling debris state
                prop.isFallingDebris = false;
                prop.debrisHasLanded = false;
                prop.debrisLandingTimer = 0;
                prop.debrisVelocityY = 0;
                prop.debrisGravity = 0;

                // Restore original position if it was saved during debris animation
                if (prop.originalX !== undefined && prop.originalY !== undefined) {
                    prop.x = prop.originalX;
                    prop.y = prop.originalY;
                    delete prop.originalX;
                    delete prop.originalY;
                }

                // Clean up debris coordinates
                delete prop.debrisX;
                delete prop.debrisY;

                if (wasDestroyed) {
                    respawnedCount++;
                } else if (wasDamaged) {
                    restoredCount++;
                }
            }
        }

        if (respawnedCount > 0 || restoredCount > 0) {
        }

        return respawnedCount + restoredCount;
    }

    triggerItemDrops(prop) {
        // console.log(`🎁 triggerItemDrops called for prop ${prop.id} (${prop.type})`);
        // console.log(`🎁 Prop dropItems:`, prop.dropItems);
        // console.log(`🎁 Game instance available:`, !!this.game);

        // Check if this specific prop instance has drop items configured
        if (!prop.dropItems) {
            return;
        }

        if (!this.game) {
            return;
        }

        // Get prop type for dimensions
        const propType = this.propTypes[prop.type];
        if (!propType) {
            return;
        }

        // Calculate drop position (center of prop for better animation)
        const dropX = prop.x + (propType.width / 2);
        const dropY = prop.y + (propType.height / 2); // Center of prop

        // console.log(`🎁 Processing ${prop.dropItems.length} possible drops for prop ${prop.id} (${prop.type}) at (${dropX}, ${dropY})`);

        // Process each possible drop for this specific prop
        prop.dropItems.forEach((dropItem, index) => {
            // console.log(`🎁 Drop ${index + 1}: ${dropItem.itemId}, chance: ${dropItem.chance} (${(dropItem.chance * 100).toFixed(1)}%), quantity: ${dropItem.quantity || 1}`);

            // Roll for drop chance
            const roll = Math.random();
            if (roll <= dropItem.chance) {
                // Item should drop!

                // Drop the item using the game's item drop system
                if (this.game.itemDropSystem) {
                    const platforms = this.game.platformSystem ? this.game.platformSystem.platforms : [];
                    const quantity = dropItem.quantity || 1;

                    for (let i = 0; i < quantity; i++) {
                        const createdItem = this.game.itemDropSystem.dropItem(dropItem.itemId, dropX, dropY, platforms);
                        if (createdItem) {
                        } else {
                            console.warn(`🎁 Failed to create drop ${i + 1}/${quantity}`);
                        }
                    }
                } else {
                    console.warn('ItemDropSystem not available on game instance');
                }
            } else {
            }
        });
    }
}