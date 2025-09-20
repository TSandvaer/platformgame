class PropManager {
    constructor(propData) {
        this.propData = propData;
        this.isRotatingProp = false;
        this.rotationStartY = 0;
        this.rotationStartAngle = 0;
    }

    handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed = false, shiftPressed = false, viewport, camera) {
        // Check if prop placement mode is active
        if (this.propData.propPlacementMode) {
            this.placeProp(mouseX, mouseY);
            return { handled: true, type: 'placement' };
        }

        // Check for prop selection using actual positions
        // Find all props under the mouse, then select the one with highest z-order
        let propsUnderMouse = [];

        for (let prop of this.propData.props) {
            // Get actual position for mouse interaction
            const actualPos = this.propData.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
            const renderProp = { ...prop, x: actualPos.x, y: actualPos.y };

            // Mouse coordinates are in world space
            // Props are stored in world coordinates
            // We need to test in the same coordinate space
            let testX = mouseX;
            let testY = mouseY;

            // All props use world coordinates for hit testing
            // The rendering transformation is handled separately

            if (this.propData.isPointInProp(testX, testY, renderProp)) {
                propsUnderMouse.push(prop);
            }
        }

        // If we found props under mouse, select the one with highest z-order (topmost)
        if (propsUnderMouse.length > 0) {
            const topProp = propsUnderMouse.reduce((highest, current) =>
                (current.zOrder || 0) > (highest.zOrder || 0) ? current : highest
            );

            platformSystem.selectedPlatform = null;

            if (shiftPressed) {
                // Rotation mode - select and start rotating
                this.propData.selectedProps = [topProp];
                this.propData.selectedProp = topProp;
                this.isRotatingProp = true;
                this.rotationStartY = mouseY;
                this.rotationStartAngle = topProp.rotation || 0;
                return { handled: true, type: 'rotation', prop: topProp };
            } else if (ctrlPressed) {
                // Multi-selection mode - just toggle selection, don't start dragging
                this.propData.toggleSelection(topProp);
                return { handled: true, type: 'selection', prop: topProp };
            } else {
                // Check if clicked prop is already in multi-selection
                if (this.propData.selectedProps.length > 1 && this.propData.selectedProps.includes(topProp)) {
                    // Start dragging all selected props
                    this.propData.isDraggingMultiple = true;
                    this.propData.selectedProp = topProp; // Set as primary for UI

                    // Calculate offsets for all selected props using actual positions
                    this.propData.multiDragOffsets.clear();
                    this.propData.selectedProps.forEach(prop => {
                        const actualPos = this.propData.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
                        this.propData.multiDragOffsets.set(prop.id, {
                            x: mouseX - actualPos.x,
                            y: mouseY - actualPos.y
                        });
                    });
                    return { handled: true, type: 'multi-drag', prop: topProp };
                } else {
                    // Single selection
                    this.propData.selectedProps = [topProp];
                    this.propData.selectedProp = topProp;
                    this.propData.isDraggingProp = true;

                    // Calculate drag offset using actual position
                    const actualPos = this.propData.getActualPosition(topProp, viewport.designWidth, viewport.designHeight);
                    this.propData.propDragOffset = {
                        x: mouseX - actualPos.x,
                        y: mouseY - actualPos.y
                    };
                    return { handled: true, type: 'drag', prop: topProp };
                }
            }
        } else if (!ctrlPressed) {
            // Clicked on empty space - clear selection
            this.propData.clearMultiSelection();
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY, viewport, camera) {
        if (this.isRotatingProp && this.propData.selectedProp) {
            // Calculate rotation based on vertical mouse movement
            const deltaY = mouseY - this.rotationStartY;
            const rotationSpeed = 0.01; // Radians per pixel
            const newRotation = this.rotationStartAngle + (deltaY * rotationSpeed);

            // Update rotation for selected prop(s)
            if (this.propData.selectedProps.length > 1) {
                // Rotate all selected props
                this.propData.selectedProps.forEach(prop => {
                    prop.rotation = newRotation;
                });
            } else {
                // Rotate single prop
                this.propData.selectedProp.rotation = newRotation;
            }

            this.updatePropProperties();
            return true;
        } else if (this.propData.isDraggingMultiple) {
            // Move all selected props using relative positioning
            this.propData.selectedProps.forEach(prop => {
                const offset = this.propData.multiDragOffsets.get(prop.id);
                if (offset) {
                    // All props use world coordinates
                    const newX = mouseX - offset.x;
                    const newY = mouseY - offset.y;
                    this.propData.updateRelativePosition(prop, newX, newY, viewport.designWidth, viewport.designHeight);
                }
            });
            return true;
        } else if (this.propData.isDraggingProp && this.propData.selectedProp) {
            // Check if this prop is part of a group
            const groupMembers = this.propData.getPropsInSameGroup(this.propData.selectedProp);

            if (groupMembers.length > 1) {
                // All props use world coordinates
                const newX = mouseX - this.propData.propDragOffset.x;
                const newY = mouseY - this.propData.propDragOffset.y;

                // Get current actual position to calculate delta
                const currentActual = this.propData.getActualPosition(this.propData.selectedProp, viewport.designWidth, viewport.designHeight);
                const deltaX = newX - currentActual.x;
                const deltaY = newY - currentActual.y;

                groupMembers.forEach(prop => {
                    const propActual = this.propData.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
                    this.propData.updateRelativePosition(
                        prop,
                        propActual.x + deltaX,
                        propActual.y + deltaY,
                        viewport.designWidth,
                        viewport.designHeight
                    );
                });
            } else {
                // All props use world coordinates
                const newX = mouseX - this.propData.propDragOffset.x;
                const newY = mouseY - this.propData.propDragOffset.y;
                this.propData.updateRelativePosition(this.propData.selectedProp, newX, newY, viewport.designWidth, viewport.designHeight);
            }
            return true;
        }
        return false;
    }

    handleMouseUp() {
        this.propData.isDraggingProp = false;
        this.propData.isDraggingMultiple = false;
        this.propData.multiDragOffsets.clear();
        this.isRotatingProp = false;
    }

    placeProp(mouseX, mouseY) {
        // Get prop type, obstacle setting, and size from UI
        const propTypeSelect = document.getElementById('propTypeSelect');
        const obstacleCheck = document.getElementById('propObstacleCheck');
        const sizeInput = document.getElementById('propSizeInput');

        if (!propTypeSelect || !obstacleCheck || !sizeInput) {
            console.error('UI elements not found for prop placement');
            return;
        }

        const propType = propTypeSelect.value;
        const isObstacle = obstacleCheck.checked;
        const sizeMultiplier = parseFloat(sizeInput.value) || 1.0;

        this.propData.addProp(
            propType,
            mouseX,
            mouseY,
            isObstacle,
            sizeMultiplier
        );

        // Exit placement mode
        this.propData.propPlacementMode = false;
        this.updatePlacementButton();
    }

    togglePropPlacement() {
        this.propData.propPlacementMode = !this.propData.propPlacementMode;
        this.updatePlacementButton();
    }

    updatePlacementButton() {
        const btn = document.getElementById('addPropBtn');
        if (btn) {
            btn.textContent = this.propData.propPlacementMode ? 'Cancel Placement' : 'Add Prop (Click on map)';
            btn.classList.toggle('danger', this.propData.propPlacementMode);
        }
    }

    // UI update methods
    updatePropList() {
        const listElement = document.getElementById('propList');
        if (!listElement) return;

        listElement.innerHTML = this.propData.props.map(prop => {
            const propType = this.propData.getPropType(prop.type);
            const isSelected = this.propData.selectedProps.includes(prop);
            const isPrimary = this.propData.selectedProp && this.propData.selectedProp.id === prop.id;
            const groupInfo = prop.groupId ? ` [Group ${prop.groupId}]` : '';

            return `<div class="prop-item ${isPrimary ? 'selected' : ''} ${isSelected ? 'multi-selected' : ''}"
                      data-prop-id="${prop.id}">
                    ${propType.name} (${Math.round(prop.x)}, ${Math.round(prop.y)})
                    ${prop.isObstacle ? ' [Obstacle]' : ''}${groupInfo}
                    Z: ${prop.zOrder || 0}
                </div>`;
        }).join('');

        // Add click listeners to prop items
        listElement.querySelectorAll('.prop-item').forEach(item => {
            item.addEventListener('click', () => {
                const propId = parseInt(item.dataset.propId);
                this.propData.selectedProp = this.propData.getPropById(propId);
                this.updatePropProperties();
                this.updatePropList();
            });
        });
    }

    updatePropProperties() {
        const propertiesDiv = document.getElementById('propProperties');
        if (!propertiesDiv) return;

        if (this.propData.selectedProp) {
            propertiesDiv.style.display = 'block';
            const xInput = document.getElementById('propX');
            const yInput = document.getElementById('propY');
            const sizeInput = document.getElementById('propSize');
            const rotationInput = document.getElementById('propRotation');
            const isObstacleInput = document.getElementById('propIsObstacle');
            const typeSelect = document.getElementById('propTypeSelect');
            const zOrderDisplay = document.getElementById('propZOrder');

            if (xInput) xInput.value = Math.round(this.propData.selectedProp.x);
            if (yInput) yInput.value = Math.round(this.propData.selectedProp.y);
            if (sizeInput) {
                sizeInput.value = this.propData.selectedProp.sizeMultiplier !== undefined ?
                    this.propData.selectedProp.sizeMultiplier :
                    1.0;
            }
            if (rotationInput) {
                // Convert radians to degrees for display
                const rotation = this.propData.selectedProp.rotation || 0;
                rotationInput.value = (rotation * 180 / Math.PI).toFixed(1);
            }
            if (isObstacleInput) isObstacleInput.checked = this.propData.selectedProp.isObstacle;
            if (typeSelect) typeSelect.value = this.propData.selectedProp.type;
            if (zOrderDisplay) zOrderDisplay.textContent = this.propData.selectedProp.zOrder || 0;
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    updateSelectedProp() {
        if (!this.propData.selectedProp) return;

        const xInput = document.getElementById('propX');
        const yInput = document.getElementById('propY');
        const sizeInput = document.getElementById('propSize');
        const rotationInput = document.getElementById('propRotation');
        const isObstacleInput = document.getElementById('propIsObstacle');
        const typeSelect = document.getElementById('propTypeSelect');

        if (xInput) this.propData.selectedProp.x = parseInt(xInput.value);
        if (yInput) this.propData.selectedProp.y = parseInt(yInput.value);
        if (sizeInput) this.propData.selectedProp.sizeMultiplier = parseFloat(sizeInput.value);
        if (rotationInput) {
            // Convert degrees to radians for storage
            this.propData.selectedProp.rotation = parseFloat(rotationInput.value) * Math.PI / 180;
        }
        if (isObstacleInput) this.propData.selectedProp.isObstacle = isObstacleInput.checked;
        if (typeSelect) this.propData.selectedProp.type = typeSelect.value;

        this.updatePropList();
    }


    // Z-order management UI
    movePropToFront() {
        if (!this.propData.selectedProp) return;
        this.propData.moveToFront(this.propData.selectedProp);
        this.updatePropProperties();
        this.updatePropList();
    }

    movePropToBack() {
        if (!this.propData.selectedProp) return;
        this.propData.moveToBack(this.propData.selectedProp);
        this.updatePropProperties();
        this.updatePropList();
    }
}