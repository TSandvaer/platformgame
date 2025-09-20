class PropData {
    constructor() {
        this.props = [];
        this.nextPropId = 1;
        this.nextPropZOrder = 1;
        this.selectedProp = null;

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

        // Clipboard for copy/paste
        this.clipboard = []; // Array of copied prop data

        // Prop types with their tileset coordinates and properties
        this.propTypes = {
            // Buildings & Structures
            house: { tileX: 0, tileY: 6, width: 32, height: 32, name: 'House' },
            tower: { tileX: 15, tileY: 0, width: 32, height: 32, name: 'Tower' },
            windmill: { tileX: 15, tileY: 14, width: 64, height: 64, name: 'Windmill' },
            woodenPole: {tileX: 29.41,tileY: 0.94,width: 15,height: 100,name: 'woodenPole'},
            woodenPoleArm: {tileX: 30.53,tileY: 1.16,width: 32,height: 24,name: 'woodenPoleArm'},
            // Fences & Walls
            fenceNail: { tileX: 2.56, tileY: 3.41, width: 5, height: 6, name: 'Fence Nail' },
            fencePole1: {tileX: 1.09,tileY: 2.94,width: 8,height: 35,name: 'Fence Pole1'},
            fencePole2: {tileX: 1.69,tileY: 2.91,width: 7,height: 36,name: 'Fence Pole2'},
            fencePole3: { tileX: 2.16, tileY: 2.94, width: 9, height: 35, name: 'Fence Pole3' },
            fenceBoard1: { tileX: 2.81, tileY: 2.97, width: 43, height: 11, name: 'Fence Board1' },
            fenceBoard2: { tileX: 2.81, tileY: 3.31, width: 42, height: 11, name: 'Fence Board2' },
            fenceBoard3: { tileX: 2.81, tileY: 3.66, width: 43, height: 13, name: 'Fence Board3' },
            fencePoleSpiked: { tileX: 5.31, tileY: 2.94, width: 13, height: 36, name: 'Fence Pole Spiked' },
            fenceBoardShort: { tileX: 6.28, tileY: 3.34, width: 15, height: 10, name: 'Fence Board Short' },
            boardFenceComplete: { tileX: 14.13, tileY: 2.75, width: 87, height: 41, name: 'Board Fence Complete' },
            // Trees & Nature
            tree1: { tileX: 15, tileY: 8, width: 32, height: 32, name: 'Tree 1' },
            tree2: { tileX: 16, tileY: 8, width: 32, height: 32, name: 'Tree 2' },
            bush: { tileX: 6, tileY: 2, width: 32, height: 16, name: 'Bush' },

            // Decorative Items
            barrel: { tileX: 6.05, tileY: 1, width: 29, height: 32, name: 'Barrel' },
            crate: { tileX: 4, tileY: 1, width: 32, height: 32, name: 'Crate' },
            bigCrate: { tileX: 1.31, tileY: 0.59, width: 44, height: 45, name: 'bigCrate' },
            fence: { tileX: 5, tileY: 2, width: 32, height: 16, name: 'Fence' },
            bigPot: { tileX: 10.24, tileY: 1.08, width: 19.4, height: 30.5, name: 'bigPot' },
            mediumPot: { tileX: 8.19, tileY: 1.00, width: 20, height: 32, name: 'mediumPot' },
            smallPot: { tileX: 9.13, tileY: 1.34, width: 25, height: 23, name: 'smallPot' },
            well: { tileX: 1, tileY: 5.1, width: 90, height: 95, name: 'Well' },
            bucket: { tileX: 4.13, tileY: 7.19, width: 24, height: 27, name: 'bucket' },
            toolRackFrame: { tileX: 7.91, tileY: 2.94, width: 70, height: 35, name: 'Tool Rack Frame' },
            sword1: { tileX: 10.97, tileY: 2.13, width: 38, height: 11, name: 'Sword1' },
            sword2: { tileX: 10.97, tileY: 2.59, width: 37, height: 10, name: 'Sword2' },
            spear: { tileX: 10.94, tileY: 3.13, width: 65, height: 9, name: 'Spear' },
            axe: { tileX: 10.97, tileY: 3.50, width: 39, height: 15, name: 'Axe' },
            hoe: { tileX: 10.97, tileY: 4.00, width: 51, height: 13, name: 'Hoe' },
            hammer: { tileX: 11.00, tileY: 4.47, width: 33, height: 15, name: 'Hammer' },
            table: { tileX: 9.81, tileY: 6.13, width: 74, height: 28, name: 'Table' },
            chair: { tileX: 12.28, tileY: 5.84, width: 23, height: 38, name: 'Chair' },
            wine: { tileX: 10.31, tileY: 5.41, width: 7, height: 20, name: 'Wine' },
            apple: { tileX: 10.66, tileY: 5.34, width: 7, height: 9, name: 'Apple' },
            mug: { tileX: 10.66, tileY: 5.69, width: 10, height: 11, name: 'Mug' },
            cake: { tileX: 11.06, tileY: 5.75, width: 17, height: 8, name: 'Cake' },

            // Signs
            signpost: { tileX: 15.00, tileY: 0.53, width: 32, height: 47, name: 'Signpost' },
            signPostDirectional: { tileX: 12.06, tileY: 0.66, width: 28, height: 44, name: 'signpostDirectional' },
            signPostMultidirectional: { tileX: 13.00, tileY: 0.25, width: 30, height: 57, name: 'signpostMultidirectional' },
            signText1: { tileX: 14.25, tileY: 1.13, width: 17, height: 7, name: 'signText1' },
            signText2: { tileX: 14.25, tileY: 1.38, width: 16, height: 7, name: 'signText2' },
            signText3: { tileX: 14.25, tileY: 1.63, width: 17, height: 6, name: 'signText3' },
            signText4: { tileX: 16.19, tileY: 0.78, width: 20, height: 6, name: 'signText4' },
            signText5: { tileX: 16.25, tileY: 1.06, width: 17, height: 7, name: 'signText5' },
            signWall: { tileX: 5.84, tileY: 5.00, width: 71, height: 65, name: 'signWall' },
            signPaper1: { tileX: 8.09, tileY: 5.16, width: 13, height: 16, name: 'signPaper1' },
            signPaper2: { tileX: 8.09, tileY: 5.66, width: 13, height: 16, name: 'signPaper2' },
            signPaper3: { tileX: 8.09, tileY: 6.16, width: 12, height: 16, name: 'signPaper3' },
            signPaper4: { tileX: 8.56, tileY: 5.16, width: 14, height: 20, name: 'signPaper4' },

            // Lamps
            lamp: { tileX: 31.31, tileY: 0.19, width: 13, height: 18, name: 'Lamp' },
            lampLighted: { tileX: 30.28, tileY: 0.16, width: 13, height: 19, name: 'lampLighted', hasGlow: true },
            torch: { tileX: 20.38, tileY: 1.16, width: 8, height: 24, name: 'Torch', hasFlame: true },

            // Vegetation
            bush1: { tileX: 14.03, tileY: 17.84, width: 93, height: 40, name: 'bush1' },
            tree1: { tileX: 21.56, tileY: 14.56, width: 124, height: 146, name: 'tree1' },
        };
    }

    initializePropZOrders() {
        // Assign z-orders to any existing props that don't have them
        this.props.forEach(prop => {
            if (prop.zOrder === undefined || prop.zOrder === null) {
                prop.zOrder = this.nextPropZOrder++;
            }
        });
    }

    addProp(type, x, y, isObstacle = false, sizeMultiplier = 1.0) {
        const propType = this.propTypes[type];
        if (!propType) return null;

        const newProp = {
            id: this.nextPropId++,
            type: type,
            x: x,
            y: y,
            isObstacle: isObstacle,
            zOrder: this.nextPropZOrder++,
            positioning: 'absolute', // 'absolute', 'screen-relative'
            relativeX: 0.5,         // Relative position (0-1) for screen-relative mode
            relativeY: 0.5,         // Relative position (0-1) for screen-relative mode
            sizeMultiplier: sizeMultiplier,  // Resolution-independent size multiplier
            rotation: 0             // Rotation angle in radians
        };

        this.props.push(newProp);
        this.selectedProp = newProp;
        return newProp;
    }

    deleteProp(propId) {
        this.props = this.props.filter(prop => prop.id !== propId);
        if (this.selectedProp && this.selectedProp.id === propId) {
            this.selectedProp = null;
        }
    }

    deleteSelectedProp() {
        if (!this.selectedProp) return;
        this.deleteProp(this.selectedProp.id);
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
        return this.props.filter(p => p.groupId === prop.groupId);
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

        console.log(`Initialized ${this.propGroups.size} groups from loaded props`);
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
                groupId: prop.groupId // Preserve grouping
            };
            this.clipboard.push(copiedProp);
        });

        console.log(`Copied ${this.clipboard.length} prop(s) to clipboard`);
        return true;
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
        this.clipboard.forEach(clipProp => {
            const newProp = {
                id: this.nextPropId++,
                type: clipProp.type,
                x: mouseX + clipProp.x,
                y: mouseY + clipProp.y,
                isObstacle: clipProp.isObstacle,
                zOrder: this.nextPropZOrder++,
                positioning: clipProp.positioning,
                relativeX: clipProp.relativeX,
                relativeY: clipProp.relativeY,
                sizeMultiplier: clipProp.sizeMultiplier,
                rotation: clipProp.rotation
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

        console.log(`Pasted ${pastedProps.length} prop(s)`);
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

        console.log(`Aligned ${groups.length} groups to left edge at x=${minX}`);
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

        console.log(`Aligned ${groups.length} groups to right edge at x=${maxRight}`);
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

        console.log(`Aligned ${groups.length} groups to center at x=${targetCenterX}`);
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

        console.log(`Aligned ${groups.length} groups to top edge at y=${minY}`);
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

        console.log(`Aligned ${groups.length} groups to bottom edge at y=${maxBottom}`);
    }
}