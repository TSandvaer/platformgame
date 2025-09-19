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

        // Prop types with their tileset coordinates and properties
        this.propTypes = {
            // Buildings & Structures
            house: { tileX: 0, tileY: 6, width: 32, height: 32, name: 'House' },
            tower: { tileX: 15, tileY: 0, width: 32, height: 32, name: 'Tower' },
            windmill: { tileX: 15, tileY: 14, width: 64, height: 64, name: 'Windmill' },

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
            lampLighted: { tileX: 30.28, tileY: 0.16, width: 13, height: 19, name: 'lampLighted' },
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

    addProp(type, x, y, isObstacle = false, scale = undefined) {
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
            relativeY: 0.5          // Relative position (0-1) for screen-relative mode
        };

        // Add scale if provided
        if (scale !== undefined) {
            newProp.scale = scale;
        }

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

        const scale = prop.scale !== undefined ? prop.scale :
                     (prop.type === 'well' ? 1 :
                     (prop.type === 'barrel' || prop.type === 'crate') ? 1.2 :
                     (prop.type === 'smallPot' || prop.type === 'mediumPot' || prop.type === 'bigPot') ? 0.6 : 1.6);
        const renderWidth = propType.width * scale;
        const renderHeight = propType.height * scale;

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
        return this.getGroupMembers(prop.groupId);
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
}