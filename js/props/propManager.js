class PropManager {
    constructor(propData) {
        this.propData = propData;
        this.isRotatingProp = false;
        this.rotationStartY = 0;
        this.rotationStartAngle = 0;

        // Movement zone drawing state
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetProp = null; // Prop whose movement zone is being drawn

        // Movement zone editing state
        this.isDraggingMovementZoneHandle = false;
        this.draggingHandleType = null; // 'start' or 'end'
        this.draggingHandleProp = null;

        // Platform binding state
        this.isBindingToPlatform = false;
        this.bindingTargetProp = null;
    }

    handleMouseDown(mouseX, mouseY, platformSystem, ctrlPressed = false, shiftPressed = false, viewport, camera) {
        // Check if movement zone drawing mode is active
        if (this.isDrawingMovementZone) {
            this.startMovementZoneDrawing(mouseX, mouseY);
            return { handled: true, type: 'movementZoneStart' };
        }

        // Check for platform binding mode
        if (this.isBindingToPlatform) {
            const bindResult = this.handlePlatformBinding(mouseX, mouseY, platformSystem, viewport);
            if (bindResult.handled) {
                return bindResult;
            }
        }

        // Check for movement zone handle dragging (highest priority)
        const handleResult = this.checkMovementZoneHandles(mouseX, mouseY);
        if (handleResult.handled) {
            return handleResult;
        }

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
                this.updatePropProperties();
                this.updatePropList();
                this.isRotatingProp = true;
                this.rotationStartY = mouseY;
                this.rotationStartAngle = topProp.rotation || 0;
                return { handled: true, type: 'rotation', prop: topProp };
            } else {
                // Check if clicked prop is already in multi-selection
                if (this.propData.selectedProps.length > 1 && this.propData.selectedProps.includes(topProp)) {
                    // Expand selection to include all group members
                    const expandedSelection = this.propData.expandSelectionToFullGroups(this.propData.selectedProps);

                    // Start dragging all selected props (including full groups)
                    this.propData.isDraggingMultiple = true;
                    this.propData.cancelDragSelection(); // Cancel any ongoing drag selection
                    this.propData.selectedProp = topProp; // Set as primary for UI
                    this.updatePropProperties();
                    this.updatePropList();

                    // Calculate offsets for all props in expanded selection
                    this.propData.multiDragOffsets.clear();
                    expandedSelection.forEach(prop => {
                        const actualPos = this.propData.getActualPosition(prop, viewport.designWidth, viewport.designHeight);
                        this.propData.multiDragOffsets.set(prop.id, {
                            x: mouseX - actualPos.x,
                            y: mouseY - actualPos.y
                        });
                    });

                    // Store the expanded selection for dragging
                    this.propData.dragSelection = expandedSelection;

                    return { handled: true, type: 'multi-drag', prop: topProp };
                } else if (ctrlPressed) {
                    // Ctrl+click: toggle selection
                    if (this.propData.selectedProps.includes(topProp)) {
                        // Remove from selection
                        this.propData.removeFromSelection(topProp);
                        // Set primary selection to first remaining prop
                        if (this.propData.selectedProps.length > 0) {
                            this.propData.selectedProp = this.propData.selectedProps[0];
                        } else {
                            this.propData.selectedProp = null;
                        }
                        this.updatePropProperties();
                        this.updatePropList();
                    } else {
                        // Add to selection
                        this.propData.addToSelection(topProp);
                        this.propData.selectedProp = topProp; // Set as primary
                        this.updatePropProperties();
                        this.updatePropList();
                    }
                    return { handled: true, type: 'multi-select', prop: topProp };
                } else {
                    // Single selection - if prop is grouped, select entire group
                    if (topProp.groupId) {
                        // Select all props in the same group
                        const groupMembers = this.propData.getPropsInSameGroup(topProp);
                        this.propData.selectedProps = groupMembers;
                        this.propData.selectedProp = topProp; // Set clicked prop as primary
                        console.log('✅ Selected grouped prop:', topProp.id, 'with group:', topProp.groupId);
                        this.updatePropProperties();
                        this.updatePropList();
                    } else {
                        // Single ungrouped prop
                        this.propData.selectedProps = [topProp];
                        this.propData.selectedProp = topProp;
                        this.updatePropProperties();
                        this.updatePropList();
                    }
                    this.propData.isDraggingProp = true;
                    this.propData.cancelDragSelection(); // Cancel any ongoing drag selection

                    // Calculate drag offset using actual position
                    const actualPos = this.propData.getActualPosition(topProp, viewport.designWidth, viewport.designHeight);
                    this.propData.propDragOffset = {
                        x: mouseX - actualPos.x,
                        y: mouseY - actualPos.y
                    };
                    return { handled: true, type: 'drag', prop: topProp };
                }
            }
        } else {
            // Clicked on empty space - start drag selection
            this.propData.clearMultiSelection();
            this.propData.startDragSelection(mouseX, mouseY);
            return { handled: true, type: 'drag-select' };
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY, viewport, camera) {
        // Update movement zone drawing
        if (this.isDrawingMovementZone && this.movementZoneStart) {
            this.movementZoneEnd = { x: mouseX, y: mouseY };
            return true;
        }

        // Update movement zone handle dragging
        if (this.isDraggingMovementZoneHandle && this.draggingHandleProp) {
            this.updateMovementZoneHandle(mouseX, mouseY);
            return true;
        }

        if (this.propData.isDragSelecting && !this.propData.isDraggingProp && !this.propData.isDraggingMultiple) {
            // Update drag selection rectangle - only if not currently dragging props
            this.propData.updateDragSelection(mouseX, mouseY);
            return true;
        } else if (this.isRotatingProp && this.propData.selectedProp) {
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
            // Use the expanded selection (stored during drag start) or fall back to selected props
            const propsToMove = this.propData.dragSelection || this.propData.selectedProps;

            // Move all props in expanded selection using relative positioning
            propsToMove.forEach(prop => {
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

    handleMouseUp(ctrlPressed = false, viewport) {
        // Finish movement zone drawing
        if (this.isDrawingMovementZone && this.movementZoneStart && this.movementZoneEnd) {
            this.finishMovementZoneDrawing();
            return { handled: true, type: 'movementZoneFinish' };
        }

        // Finish movement zone handle dragging
        if (this.isDraggingMovementZoneHandle) {
            this.finishMovementZoneHandleDrag();
            return { handled: true, type: 'movementZoneHandleFinish' };
        }

        if (this.propData.isDragSelecting) {
            // Complete drag selection
            const selectedProps = this.propData.finishDragSelection(viewport, ctrlPressed);
            this.updatePropProperties();
            this.updatePropList();
            return { handled: true, type: 'drag-selection-complete', props: selectedProps };
        }

        this.propData.isDraggingProp = false;
        this.propData.isDraggingMultiple = false;
        this.propData.multiDragOffsets.clear();
        this.propData.dragSelection = null; // Clear the expanded selection
        this.isRotatingProp = false;
        return { handled: false };
    }

    placeProp(mouseX, mouseY) {
        // Get prop type, obstacle setting, size, damage, and destroyable from UI
        const propTypeSelect = document.getElementById('propTypeSelect');
        const obstacleCheck = document.getElementById('propObstacleCheck');
        const sizeInput = document.getElementById('propSizeInput');
        const damageInput = document.getElementById('propDamageInput');
        const destroyableCheck = document.getElementById('propDestroyableCheck');
        const durabilityInput = document.getElementById('propDurabilityInput');

        if (!propTypeSelect || !obstacleCheck || !sizeInput || !damageInput || !destroyableCheck || !durabilityInput) {
            console.error('UI elements not found for prop placement');
            return;
        }

        const propType = propTypeSelect.value;
        const isObstacle = obstacleCheck.checked;
        const sizeMultiplier = parseFloat(sizeInput.value) || 1.0;
        const damagePerSecond = parseFloat(damageInput.value) || 0;
        const destroyable = destroyableCheck.checked;
        const maxDurability = parseFloat(durabilityInput.value) || 100;

        this.propData.addProp(
            propType,
            mouseX,
            mouseY,
            isObstacle,
            sizeMultiplier,
            damagePerSecond,
            destroyable,
            maxDurability
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
            const propName = propType ? propType.name : prop.type; // Fallback to type string if propType not found
            const isSelected = this.propData.selectedProps.includes(prop);
            const isPrimary = this.propData.selectedProp && this.propData.selectedProp.id === prop.id;
            const groupInfo = prop.groupId ? ` [Group ${prop.groupId}]` : '';

            const durabilityInfo = prop.destroyable ?
                ` [💔 ${Math.ceil(prop.currentDurability)}/${prop.maxDurability}]` : '';
            const isDestroyingInfo = prop.isDestroying ? ' [💥 DESTROYING]' : '';
            const isDestroyedInfo = prop.isDestroyed ? ' [☠️ DESTROYED]' : '';

            return `<div class="prop-item ${isPrimary ? 'selected' : ''} ${isSelected ? 'multi-selected' : ''}"
                      data-prop-id="${prop.id}">
                    ${propName} (${Math.round(prop.x)}, ${Math.round(prop.y)})
                    ${prop.isObstacle ? ' [Obstacle]' : ''}${prop.damagePerSecond > 0 ? ` [🔥 ${prop.damagePerSecond} DPS]` : ''}${durabilityInfo}${isDestroyingInfo}${isDestroyedInfo}${groupInfo}
                    Z: ${prop.zOrder || 0}
                </div>`;
        }).join('');

        // Add click listeners to prop items
        listElement.querySelectorAll('.prop-item').forEach(item => {
            item.addEventListener('click', () => {
                const propId = parseInt(item.dataset.propId);
                const prop = this.propData.getPropById(propId);
                this.propData.selectedProp = prop;
                this.updatePropProperties();
                this.updatePropList();
            });
        });
    }

    updatePropProperties() {
        const propertiesDiv = document.getElementById('propProperties');
        if (!propertiesDiv) return;

        // Show/hide alignment controls based on selection count
        const alignmentControls = document.getElementById('alignmentControls');
        if (alignmentControls) {
            // Show alignment controls only when 2 or more props are selected
            alignmentControls.style.display = this.propData.selectedProps.length >= 2 ? 'flex' : 'none';
        }

        if (this.propData.selectedProp) {
            // Ensure backward compatibility - initialize missing movement properties
            this.ensureMovementProperties(this.propData.selectedProp);

            propertiesDiv.style.display = 'block';
            const xInput = document.getElementById('propX');
            const yInput = document.getElementById('propY');
            const sizeInput = document.getElementById('propSize');
            const rotationInput = document.getElementById('propRotation');
            const isObstacleInput = document.getElementById('selectedPropObstacle');
            const damageInput = document.getElementById('selectedPropDamage');
            const typeSelect = document.getElementById('propTypeSelect');
            const zOrderDisplay = document.getElementById('propZOrder');
            const destroyableInput = document.getElementById('selectedPropDestroyable');
            const durabilityInput = document.getElementById('selectedPropDurability');
            const maxDurabilityInput = document.getElementById('selectedPropMaxDurability');

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
            if (damageInput) damageInput.value = this.propData.selectedProp.damagePerSecond || 0;
            if (typeSelect) typeSelect.value = this.propData.selectedProp.type;
            if (destroyableInput) destroyableInput.checked = this.propData.selectedProp.destroyable || false;
            if (durabilityInput) {
                const currentDurability = this.propData.selectedProp.currentDurability;
                durabilityInput.value = currentDurability !== undefined ? Math.ceil(currentDurability) : 100;
            }
            if (maxDurabilityInput) {
                const maxDurability = this.propData.selectedProp.maxDurability;
                maxDurabilityInput.value = maxDurability !== undefined ? maxDurability : 100;
            }

            // Show/hide Item Drops section based on destroyable flag
            const itemDropsSection = document.getElementById('itemDropsSection');
            const itemDropsButtons = document.getElementById('itemDropsButtons');
            const isDestroyable = this.propData.selectedProp.destroyable || false;

            if (itemDropsSection) {
                itemDropsSection.style.display = isDestroyable ? 'block' : 'none';
            }
            if (itemDropsButtons) {
                itemDropsButtons.style.display = isDestroyable ? 'block' : 'none';
            }

            // Update movement properties
            const isMovingInput = document.getElementById('selectedPropIsMoving');
            const moveSpeedInput = document.getElementById('selectedPropMoveSpeed');
            const movementEnabledInput = document.getElementById('selectedPropMovementEnabled');
            const zoneStartXInput = document.getElementById('selectedPropZoneStartX');
            const zoneEndXInput = document.getElementById('selectedPropZoneEndX');
            const zoneYInput = document.getElementById('selectedPropZoneY');

            if (isMovingInput) isMovingInput.checked = this.propData.selectedProp.isMoving || false;
            if (moveSpeedInput) moveSpeedInput.value = this.propData.selectedProp.moveSpeed || 2;
            if (movementEnabledInput) movementEnabledInput.checked = this.propData.selectedProp.movementZone?.enabled || false;
            if (zoneStartXInput) zoneStartXInput.value = this.propData.selectedProp.movementZone?.startX || 0;
            if (zoneEndXInput) zoneEndXInput.value = this.propData.selectedProp.movementZone?.endX || 0;
            if (zoneYInput) zoneYInput.value = this.propData.selectedProp.movementZone?.y || 0;

            // Show/hide movement sections based on isMoving flag
            const isMoving = this.propData.selectedProp.isMoving || false;
            const propMovementSection = document.getElementById('propMovementSection');
            const propMovementZoneSection = document.getElementById('propMovementZoneSection');

            if (propMovementSection) {
                propMovementSection.style.display = isMoving ? 'block' : 'none';
            }
            if (propMovementZoneSection) {
                propMovementZoneSection.style.display = isMoving ? 'block' : 'none';
            }

            // Show/hide movement zone controls based on movement enabled flag
            const movementEnabled = this.propData.selectedProp.movementZone?.enabled || false;
            const propMovementZoneControls = document.getElementById('propMovementZoneControls');
            const propMovementZoneControls2 = document.getElementById('propMovementZoneControls2');
            const propMovementZoneControls3 = document.getElementById('propMovementZoneControls3');

            if (propMovementZoneControls) {
                propMovementZoneControls.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }
            if (propMovementZoneControls2) {
                propMovementZoneControls2.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }
            if (propMovementZoneControls3) {
                propMovementZoneControls3.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }

            // Add event listeners for movement checkboxes to update UI immediately
            if (isMovingInput) {
                // Remove existing listeners to avoid duplicates
                isMovingInput.removeEventListener('change', this.handleMovingCheckboxChange);
                this.handleMovingCheckboxChange = () => {
                    const propMovementSection = document.getElementById('propMovementSection');
                    const propMovementZoneSection = document.getElementById('propMovementZoneSection');
                    const propMovementZoneControls = document.getElementById('propMovementZoneControls');
                    const propMovementZoneControls2 = document.getElementById('propMovementZoneControls2');
                    const propMovementZoneControls3 = document.getElementById('propMovementZoneControls3');

                    const isMoving = isMovingInput.checked;
                    if (propMovementSection) propMovementSection.style.display = isMoving ? 'block' : 'none';
                    if (propMovementZoneSection) propMovementZoneSection.style.display = isMoving ? 'block' : 'none';

                    // Hide zone controls if not moving
                    if (!isMoving) {
                        if (propMovementZoneControls) propMovementZoneControls.style.display = 'none';
                        if (propMovementZoneControls2) propMovementZoneControls2.style.display = 'none';
                        if (propMovementZoneControls3) propMovementZoneControls3.style.display = 'none';
                    } else {
                        // Show zone controls if movement enabled
                        const movementEnabledInput = document.getElementById('selectedPropMovementEnabled');
                        const movementEnabled = movementEnabledInput?.checked || false;
                        if (propMovementZoneControls) propMovementZoneControls.style.display = movementEnabled ? 'block' : 'none';
                        if (propMovementZoneControls2) propMovementZoneControls2.style.display = movementEnabled ? 'block' : 'none';
                        if (propMovementZoneControls3) propMovementZoneControls3.style.display = movementEnabled ? 'block' : 'none';
                    }
                };
                isMovingInput.addEventListener('change', this.handleMovingCheckboxChange);
            }

            if (movementEnabledInput) {
                // Remove existing listeners to avoid duplicates
                movementEnabledInput.removeEventListener('change', this.handleMovementEnabledCheckboxChange);
                this.handleMovementEnabledCheckboxChange = () => {
                    const propMovementZoneControls = document.getElementById('propMovementZoneControls');
                    const propMovementZoneControls2 = document.getElementById('propMovementZoneControls2');
                    const propMovementZoneControls3 = document.getElementById('propMovementZoneControls3');

                    const movementEnabled = movementEnabledInput.checked;
                    const isMovingInput = document.getElementById('selectedPropIsMoving');
                    const isMoving = isMovingInput?.checked || false;

                    if (propMovementZoneControls) {
                        propMovementZoneControls.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                    if (propMovementZoneControls2) {
                        propMovementZoneControls2.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                    if (propMovementZoneControls3) {
                        propMovementZoneControls3.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                };
                movementEnabledInput.addEventListener('change', this.handleMovementEnabledCheckboxChange);
            }

            // Update spinning properties
            const isSpinningInput = document.getElementById('selectedPropIsSpinning');
            const spinSpeedInput = document.getElementById('selectedPropSpinSpeed');
            const spinClockwiseInput = document.getElementById('selectedPropSpinClockwise');

            if (isSpinningInput) isSpinningInput.checked = this.propData.selectedProp.isSpinning || false;
            if (spinSpeedInput) spinSpeedInput.value = this.propData.selectedProp.spinSpeed || 1.0;
            if (spinClockwiseInput) spinClockwiseInput.checked = this.propData.selectedProp.spinClockwise !== false; // Default true

            // Show/hide spinning sections based on isSpinning flag
            const isSpinning = this.propData.selectedProp.isSpinning || false;
            const propSpinningSection = document.getElementById('propSpinningSection');
            const propSpinDirectionSection = document.getElementById('propSpinDirectionSection');

            if (propSpinningSection) {
                propSpinningSection.style.display = isSpinning ? 'block' : 'none';
            }
            if (propSpinDirectionSection) {
                propSpinDirectionSection.style.display = isSpinning ? 'block' : 'none';
            }

            // Add event listener for spinning checkbox
            if (isSpinningInput) {
                isSpinningInput.removeEventListener('change', this.handleSpinningCheckboxChange);
                this.handleSpinningCheckboxChange = () => {
                    const propSpinningSection = document.getElementById('propSpinningSection');
                    const propSpinDirectionSection = document.getElementById('propSpinDirectionSection');
                    const isSpinning = isSpinningInput.checked;

                    if (propSpinningSection) propSpinningSection.style.display = isSpinning ? 'block' : 'none';
                    if (propSpinDirectionSection) propSpinDirectionSection.style.display = isSpinning ? 'block' : 'none';
                };
                isSpinningInput.addEventListener('change', this.handleSpinningCheckboxChange);
            }

            // Update the type display for single or multiple props
            const selectedPropTypeElement = document.getElementById('selectedPropType');
            if (selectedPropTypeElement) {
                if (this.propData.selectedProps.length === 1) {
                    // Single prop - show its type
                    selectedPropTypeElement.textContent = this.propData.selectedProp.type;
                } else if (this.propData.selectedProps.length > 1) {
                    // Multiple props - show all types separated by comma
                    const types = this.propData.selectedProps.map(prop => prop.type);
                    const uniqueTypes = [...new Set(types)]; // Remove duplicates
                    selectedPropTypeElement.textContent = uniqueTypes.join(', ');
                }
            }

            if (zOrderDisplay) zOrderDisplay.textContent = this.propData.selectedProp.zOrder || 0;

            // Show chest inventory button for chest types
            const chestInventoryButtonRow = document.getElementById('chestInventoryButtonRow');
            if (chestInventoryButtonRow) {
                const isChest = this.propData.selectedProp.type && this.propData.selectedProp.type.toLowerCase().includes('chest');
                chestInventoryButtonRow.style.display = isChest ? 'block' : 'none';
            }

            // Update drop configuration UI
            this.updateDropConfigurationUI();
        } else {
            propertiesDiv.style.display = 'none';

            // Hide chest inventory button when no prop is selected
            const chestInventoryButtonRow = document.getElementById('chestInventoryButtonRow');
            if (chestInventoryButtonRow) {
                chestInventoryButtonRow.style.display = 'none';
            }

            // Hide Item Drops section when no prop is selected
            const itemDropsSection = document.getElementById('itemDropsSection');
            const itemDropsButtons = document.getElementById('itemDropsButtons');
            if (itemDropsSection) {
                itemDropsSection.style.display = 'none';
            }
            if (itemDropsButtons) {
                itemDropsButtons.style.display = 'none';
            }

            // Hide movement sections when no prop is selected
            const propMovementSection = document.getElementById('propMovementSection');
            const propMovementZoneSection = document.getElementById('propMovementZoneSection');
            const propMovementZoneControls = document.getElementById('propMovementZoneControls');
            const propMovementZoneControls2 = document.getElementById('propMovementZoneControls2');
            const propMovementZoneControls3 = document.getElementById('propMovementZoneControls3');

            if (propMovementSection) propMovementSection.style.display = 'none';
            if (propMovementZoneSection) propMovementZoneSection.style.display = 'none';
            if (propMovementZoneControls) propMovementZoneControls.style.display = 'none';
            if (propMovementZoneControls2) propMovementZoneControls2.style.display = 'none';
            if (propMovementZoneControls3) propMovementZoneControls3.style.display = 'none';
        }
    }

    updateSelectedProp() {
        if (!this.propData.selectedProp) return;

        const xInput = document.getElementById('propX');
        const yInput = document.getElementById('propY');
        const sizeInput = document.getElementById('propSize');
        const rotationInput = document.getElementById('propRotation');
        const isObstacleInput = document.getElementById('selectedPropObstacle');
        const damageInput = document.getElementById('selectedPropDamage');
        const typeSelect = document.getElementById('propTypeSelect');
        const destroyableInput = document.getElementById('selectedPropDestroyable');
        const durabilityInput = document.getElementById('selectedPropDurability');
        const maxDurabilityInput = document.getElementById('selectedPropMaxDurability');
        // Movement inputs
        const isMovingInput = document.getElementById('selectedPropIsMoving');
        const moveSpeedInput = document.getElementById('selectedPropMoveSpeed');
        const movementEnabledInput = document.getElementById('selectedPropMovementEnabled');
        const zoneStartXInput = document.getElementById('selectedPropZoneStartX');
        const zoneEndXInput = document.getElementById('selectedPropZoneEndX');
        const zoneYInput = document.getElementById('selectedPropZoneY');
        // Spinning inputs
        const isSpinningInput = document.getElementById('selectedPropIsSpinning');
        const spinSpeedInput = document.getElementById('selectedPropSpinSpeed');
        const spinClockwiseInput = document.getElementById('selectedPropSpinClockwise');

        if (xInput) this.propData.selectedProp.x = parseInt(xInput.value);
        if (yInput) this.propData.selectedProp.y = parseInt(yInput.value);
        if (sizeInput) this.propData.selectedProp.sizeMultiplier = parseFloat(sizeInput.value);
        if (rotationInput) {
            // Convert degrees to radians for storage
            this.propData.selectedProp.rotation = parseFloat(rotationInput.value) * Math.PI / 180;
        }
        if (isObstacleInput) this.propData.selectedProp.isObstacle = isObstacleInput.checked;
        if (damageInput) this.propData.selectedProp.damagePerSecond = parseFloat(damageInput.value) || 0;
        if (typeSelect) this.propData.selectedProp.type = typeSelect.value;
        if (destroyableInput) {
            const wasDestroyable = this.propData.selectedProp.destroyable;
            this.propData.selectedProp.destroyable = destroyableInput.checked;

            // If prop just became destroyable, initialize durability
            if (!wasDestroyable && destroyableInput.checked) {
                this.propData.selectedProp.maxDurability = 100;
                this.propData.selectedProp.currentDurability = 100;
                // Initialize destruction properties if they don't exist
                this.propData.selectedProp.isDestroying = false;
                this.propData.selectedProp.destructionFrameIndex = 0;
                this.propData.selectedProp.destructionTimer = 0;
                this.propData.selectedProp.destructionFrameRate = 150;
                console.log('Prop made destroyable:', this.propData.selectedProp);
            } else if (wasDestroyable && !destroyableInput.checked) {
                // If prop is no longer destroyable, reset values
                this.propData.selectedProp.maxDurability = 0;
                this.propData.selectedProp.currentDurability = 0;
                this.propData.selectedProp.isDestroying = false;
            }

            // Ensure the prop has all required destruction properties
            this.propData.ensureDestructionProperties(this.propData.selectedProp);

            // Update Item Drops section visibility immediately
            const itemDropsSection = document.getElementById('itemDropsSection');
            const itemDropsButtons = document.getElementById('itemDropsButtons');
            if (itemDropsSection) {
                itemDropsSection.style.display = destroyableInput.checked ? 'block' : 'none';
            }
            if (itemDropsButtons) {
                itemDropsButtons.style.display = destroyableInput.checked ? 'block' : 'none';
            }
        }

        // Event listeners are now handled inside the selected prop block above
        if (maxDurabilityInput && this.propData.selectedProp.destroyable) {
            const newMaxDurability = parseFloat(maxDurabilityInput.value) || 100;
            this.propData.selectedProp.maxDurability = newMaxDurability;
            // Adjust current durability if it exceeds new max
            if (this.propData.selectedProp.currentDurability > newMaxDurability) {
                this.propData.selectedProp.currentDurability = newMaxDurability;
            }
        }
        if (durabilityInput && this.propData.selectedProp.destroyable) {
            this.propData.selectedProp.currentDurability = Math.min(
                parseFloat(durabilityInput.value) || 0,
                this.propData.selectedProp.maxDurability
            );
        }

        // Handle movement properties
        if (isMovingInput) {
            this.propData.selectedProp.isMoving = isMovingInput.checked;
        }
        if (moveSpeedInput) {
            this.propData.selectedProp.moveSpeed = parseFloat(moveSpeedInput.value) || 2;
        }
        if (movementEnabledInput) {
            // Initialize movement zone if it doesn't exist
            if (!this.propData.selectedProp.movementZone) {
                this.propData.selectedProp.movementZone = {
                    enabled: false,
                    startX: this.propData.selectedProp.x - 50,
                    endX: this.propData.selectedProp.x + 50,
                    y: this.propData.selectedProp.y
                };
            }
            this.propData.selectedProp.movementZone.enabled = movementEnabledInput.checked;
        }
        if (zoneStartXInput && this.propData.selectedProp.movementZone) {
            this.propData.selectedProp.movementZone.startX = parseFloat(zoneStartXInput.value) || 0;
        }
        if (zoneEndXInput && this.propData.selectedProp.movementZone) {
            this.propData.selectedProp.movementZone.endX = parseFloat(zoneEndXInput.value) || 0;
        }
        if (zoneYInput && this.propData.selectedProp.movementZone) {
            this.propData.selectedProp.movementZone.y = parseFloat(zoneYInput.value) || 0;
        }

        // Handle spinning properties
        if (isSpinningInput) {
            this.propData.selectedProp.isSpinning = isSpinningInput.checked;
        }
        if (spinSpeedInput) {
            this.propData.selectedProp.spinSpeed = parseFloat(spinSpeedInput.value) || 1.0;
        }
        if (spinClockwiseInput) {
            this.propData.selectedProp.spinClockwise = spinClockwiseInput.checked;
        }

        this.updatePropList();
        this.updatePropProperties(); // Update the UI to reflect the changes
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

    updateDropConfigurationUI() {
        const dropsList = document.getElementById('propDropsList');
        if (!dropsList || !this.propData.selectedProp) return;

        // Get the drop items for this specific prop instance
        const drops = this.propData.selectedProp.dropItems || [];

        if (drops.length === 0) {
            dropsList.innerHTML = '<div style="color: #888; font-size: 12px; text-align: center; padding: 10px;">No drops configured for this prop</div>';
        } else {
            dropsList.innerHTML = drops.map((drop, index) => `
                <div style="background-color: #444; padding: 8px; margin: 4px 0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; color: #4CAF50;">${drop.itemId}</div>
                        <div style="font-size: 11px; color: #ccc;">${(drop.chance * 100).toFixed(1)}% chance • Qty: ${drop.quantity || 1}</div>
                    </div>
                    <button class="btn small danger" onclick="window.propManager.removeDrop(${index})" style="padding: 2px 6px; font-size: 10px;">✕</button>
                </div>
            `).join('');
        }
    }

    removeDrop(index) {
        if (!this.propData.selectedProp) return;

        if (this.propData.selectedProp.dropItems && this.propData.selectedProp.dropItems[index]) {
            this.propData.selectedProp.dropItems.splice(index, 1);
            if (this.propData.selectedProp.dropItems.length === 0) {
                delete this.propData.selectedProp.dropItems;
            }
            this.updateDropConfigurationUI();
            console.log(`🎁 Removed drop item from prop ${this.propData.selectedProp.id}`);
        }
    }

    // Movement zone drawing methods
    startMovementZoneDrawing(mouseX, mouseY) {
        this.movementZoneStart = { x: mouseX, y: mouseY };
        this.movementZoneEnd = { x: mouseX, y: mouseY };
        console.log('🟣 Started prop movement zone drawing at', mouseX, mouseY);
    }

    finishMovementZoneDrawing() {
        if (!this.movementTargetProp || !this.movementZoneStart || !this.movementZoneEnd) {
            this.cancelMovementZoneDrawing();
            return;
        }

        // Calculate line start and end points
        const startX = this.movementZoneStart.x;
        const startY = this.movementZoneStart.y;
        const endX = this.movementZoneEnd.x;
        const endY = this.movementZoneEnd.y;

        // Calculate angle of the line
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX);

        // Ensure movement zone exists
        if (!this.movementTargetProp.movementZone) {
            this.movementTargetProp.movementZone = {
                enabled: false,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                angle: 0
            };
        }

        // Update prop movement zone
        this.movementTargetProp.movementZone.startX = startX;
        this.movementTargetProp.movementZone.startY = startY;
        this.movementTargetProp.movementZone.endX = endX;
        this.movementTargetProp.movementZone.endY = endY;
        this.movementTargetProp.movementZone.angle = angle;
        this.movementTargetProp.movementZone.enabled = true;

        // Initialize movement progress to start of line
        this.movementTargetProp.movementProgress = 0;

        console.log(`🟣 Movement zone set for prop ${this.movementTargetProp.id}:`, {
            startX, startY, endX, endY, angle: angle * 180 / Math.PI + '°'
        });

        // Reset drawing state
        this.cancelMovementZoneDrawing();

        // Update UI if available
        this.updatePropProperties();
    }

    cancelMovementZoneDrawing() {
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetProp = null;
        console.log('🟣 Prop movement zone drawing cancelled');
    }

    // Public methods to control movement zone drawing mode
    startMovementZoneDrawingMode(prop) {
        if (!prop) {
            console.error('Cannot start movement zone drawing: no prop selected');
            return;
        }

        this.movementTargetProp = prop;
        this.isDrawingMovementZone = true;
        console.log('🟣 Prop movement zone drawing mode started for prop', prop.id);
        console.log('🟣 Press Escape to cancel drawing');
    }

    clearMovementZone(prop) {
        if (!prop) {
            console.error('Cannot clear movement zone: no prop selected');
            return;
        }

        // Cancel any ongoing drawing
        this.cancelMovementZoneDrawing();

        // Clear movement zone
        if (prop.movementZone) {
            prop.movementZone.enabled = false;
            prop.movementZone.startX = 0;
            prop.movementZone.startY = 0;
            prop.movementZone.endX = 0;
            prop.movementZone.endY = 0;
            prop.movementZone.angle = 0;
        }

        // Reset movement state
        prop.movementProgress = 0;
        prop.movingDirection = 1;

        console.log('🟣 Cleared movement zone for prop', prop.id);

        // Update UI
        this.updatePropProperties();
    }

    // Render preview while drawing
    renderMovementZonePreview(ctx, viewport, camera) {
        if (!this.isDrawingMovementZone || !this.movementZoneStart || !this.movementZoneEnd) return;

        ctx.save();

        // Line points are already in world coordinates
        const renderStartX = this.movementZoneStart.x;
        const renderStartY = this.movementZoneStart.y;
        const renderEndX = this.movementZoneEnd.x;
        const renderEndY = this.movementZoneEnd.y;

        // Draw preview line (purple/magenta for props to distinguish from platforms)
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(renderStartX, renderStartY);
        ctx.lineTo(renderEndX, renderEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw zone markers
        ctx.fillStyle = 'magenta';
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Ensure prop has all required movement properties for backward compatibility
    ensureMovementProperties(prop) {
        // Initialize isMoving if missing
        if (prop.isMoving === undefined) {
            prop.isMoving = false;
        }

        // Initialize moveSpeed if missing
        if (prop.moveSpeed === undefined) {
            prop.moveSpeed = 2;
        }

        // Initialize movementZone if missing
        if (!prop.movementZone) {
            prop.movementZone = {
                enabled: false,
                startX: prop.x - 50,
                startY: prop.y,
                endX: prop.x + 50,
                endY: prop.y,
                angle: 0
            };
        }

        // Initialize movement state properties if missing
        if (prop.velocityX === undefined) prop.velocityX = 0;
        if (prop.velocityY === undefined) prop.velocityY = 0;
        if (prop.targetX === undefined) prop.targetX = prop.x;
        if (prop.targetY === undefined) prop.targetY = prop.y;
        if (prop.movingDirection === undefined) prop.movingDirection = 1;
        if (prop.movementProgress === undefined) prop.movementProgress = 0;

        // Initialize platform binding properties if missing
        if (prop.boundToPlatform === undefined) prop.boundToPlatform = null;
        if (!prop.platformBindOffset) prop.platformBindOffset = { x: 0, y: 0 };
    }

    // Movement zone handle methods
    checkMovementZoneHandles(mouseX, mouseY) {
        // Only check handles for the selected prop with valid movement zone
        const prop = this.propData.selectedProp;
        if (!prop || !prop.movementZone || !prop.movementZone.enabled) {
            return { handled: false };
        }

        const zone = prop.movementZone;
        const handleRadius = 8; // Slightly larger than visual handle for easier clicking

        // Check start handle
        const startDist = Math.sqrt((mouseX - zone.startX) ** 2 + (mouseY - zone.startY) ** 2);
        if (startDist <= handleRadius) {
            this.isDraggingMovementZoneHandle = true;
            this.draggingHandleType = 'start';
            this.draggingHandleProp = prop;
            console.log('🟣 Started dragging prop movement zone start handle');
            return { handled: true, type: 'movementZoneHandleStart' };
        }

        // Check end handle
        const endDist = Math.sqrt((mouseX - zone.endX) ** 2 + (mouseY - zone.endY) ** 2);
        if (endDist <= handleRadius) {
            this.isDraggingMovementZoneHandle = true;
            this.draggingHandleType = 'end';
            this.draggingHandleProp = prop;
            console.log('🟣 Started dragging prop movement zone end handle');
            return { handled: true, type: 'movementZoneHandleEnd' };
        }

        return { handled: false };
    }

    updateMovementZoneHandle(mouseX, mouseY) {
        if (!this.draggingHandleProp || !this.draggingHandleType) return;

        const zone = this.draggingHandleProp.movementZone;
        const prop = this.draggingHandleProp;

        if (this.draggingHandleType === 'start') {
            // Calculate how much the start point moved
            const deltaX = mouseX - zone.startX;
            const deltaY = mouseY - zone.startY;

            zone.startX = mouseX;
            zone.startY = mouseY;

            // Move the prop with the start handle (keep it centered on start point)
            prop.x += deltaX;
            prop.y += deltaY;

            // Update original position to match
            if (prop.originalPosition) {
                prop.originalPosition.x = prop.x;
                prop.originalPosition.y = prop.y;
            }
        } else if (this.draggingHandleType === 'end') {
            zone.endX = mouseX;
            zone.endY = mouseY;
        }

        // Recalculate angle
        const deltaX = zone.endX - zone.startX;
        const deltaY = zone.endY - zone.startY;
        zone.angle = Math.atan2(deltaY, deltaX);

        // Reset movement progress to start when zone is modified
        this.draggingHandleProp.movementProgress = 0;
        this.draggingHandleProp.movingDirection = 1;
    }

    finishMovementZoneHandleDrag() {
        if (this.draggingHandleProp) {
            console.log(`🟣 Finished dragging prop movement zone ${this.draggingHandleType} handle`);

            // Update UI to reflect changes
            this.updatePropProperties();
        }

        this.isDraggingMovementZoneHandle = false;
        this.draggingHandleType = null;
        this.draggingHandleProp = null;
    }

    // Platform binding methods
    startPlatformBinding(prop) {
        if (!prop) {
            console.error('Cannot start platform binding: no prop selected');
            return;
        }

        // Check if prop is already bound
        if (prop.boundToPlatform) {
            alert('This prop is already bound to a platform. Please unbind first.');
            return;
        }

        this.bindingTargetProp = prop;
        this.isBindingToPlatform = true;
        console.log('🟣 Platform binding mode started for prop', prop.id);
        console.log('🟣 Click on a platform to bind the prop to it');
    }

    handlePlatformBinding(mouseX, mouseY, platformSystem, viewport) {
        if (!this.bindingTargetProp || !platformSystem) {
            return { handled: false };
        }

        // Check if mouse is over any platform
        for (let platform of platformSystem.platforms) {
            // Get actual position based on positioning mode
            const actualPos = platformSystem.data.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            if (platformSystem.data.isPointInPlatform(mouseX, mouseY, renderPlatform)) {
                this.bindPropToPlatform(this.bindingTargetProp, platform, viewport);
                this.cancelPlatformBinding();
                return { handled: true, type: 'platformBinding' };
            }
        }

        // If clicked outside any platform, cancel binding
        this.cancelPlatformBinding();
        return { handled: true, type: 'platformBindingCancel' };
    }

    bindPropToPlatform(prop, platform, viewport) {
        // Calculate the prop's center position
        const propType = this.propData.propTypes[prop.type];
        const actualWidth = propType ? (propType.width || 32) * (prop.sizeMultiplier || 1) : 32;
        const actualHeight = propType ? (propType.height || 32) * (prop.sizeMultiplier || 1) : 32;
        const propCenterX = prop.x + actualWidth / 2;
        const propCenterY = prop.y + actualHeight / 2;

        // Calculate platform center
        const platformCenterX = platform.x + platform.width / 2;
        const platformCenterY = platform.y + platform.height / 2;

        // Calculate relative offset from platform center
        const offsetX = propCenterX - platformCenterX;
        const offsetY = propCenterY - platformCenterY;

        // Bind the prop
        prop.boundToPlatform = platform.id;
        prop.platformBindOffset = { x: offsetX, y: offsetY };

        console.log(`🟣 Bound prop ${prop.id} to platform ${platform.id} with offset (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);

        // Update UI
        this.updatePropProperties();
    }

    unbindFromPlatform(prop) {
        if (!prop) {
            console.error('Cannot unbind from platform: no prop selected');
            return;
        }

        if (!prop.boundToPlatform) {
            alert('This prop is not bound to any platform.');
            return;
        }

        console.log(`🟣 Unbound prop ${prop.id} from platform ${prop.boundToPlatform}`);

        prop.boundToPlatform = null;
        prop.platformBindOffset = { x: 0, y: 0 };

        // Update UI
        this.updatePropProperties();
    }

    cancelPlatformBinding() {
        this.isBindingToPlatform = false;
        this.bindingTargetProp = null;
        console.log('🟣 Platform binding mode cancelled');
    }
}