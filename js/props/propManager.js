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
}