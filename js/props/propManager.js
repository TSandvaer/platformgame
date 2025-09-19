class PropManager {
    constructor(propData) {
        this.propData = propData;
        this.currentPropType = 'barrel';
        this.nextPropIsObstacle = false;
    }

    handleMouseDown(mouseX, mouseY, platformSystem) {
        // Check if prop placement mode is active
        if (this.propData.propPlacementMode) {
            this.placeProp(mouseX, mouseY);
            return { handled: true, type: 'placement' };
        }

        // Check for prop selection
        // Find all props under the mouse, then select the one with highest z-order
        let propsUnderMouse = [];

        for (let prop of this.propData.props) {
            if (this.propData.isPointInProp(mouseX, mouseY, prop)) {
                propsUnderMouse.push(prop);
            }
        }

        // If we found props under mouse, select the one with highest z-order (topmost)
        if (propsUnderMouse.length > 0) {
            const topProp = propsUnderMouse.reduce((highest, current) =>
                (current.zOrder || 0) > (highest.zOrder || 0) ? current : highest
            );

            this.propData.selectedProp = topProp;
            platformSystem.selectedPlatform = null;
            this.propData.isDraggingProp = true;
            this.propData.propDragOffset = {
                x: mouseX - topProp.x,
                y: mouseY - topProp.y
            };
            return { handled: true, type: 'drag', prop: topProp };
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY) {
        if (this.propData.isDraggingProp && this.propData.selectedProp) {
            this.propData.selectedProp.x = mouseX - this.propData.propDragOffset.x;
            this.propData.selectedProp.y = mouseY - this.propData.propDragOffset.y;
            return true;
        }
        return false;
    }

    handleMouseUp() {
        this.propData.isDraggingProp = false;
    }

    placeProp(mouseX, mouseY) {
        const scale = this.currentPropType === 'well' ? 1 :
                     (this.currentPropType === 'barrel' || this.currentPropType === 'crate') ? 1.2 :
                     (this.currentPropType === 'smallPot' || this.currentPropType === 'mediumPot' || this.currentPropType === 'bigPot') ? 0.6 :
                     1.6;

        this.propData.addProp(
            this.currentPropType,
            mouseX,
            mouseY,
            this.nextPropIsObstacle,
            scale
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
        const btn = document.getElementById('addProp');
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
            return `<div class="prop-item ${this.propData.selectedProp && this.propData.selectedProp.id === prop.id ? 'selected' : ''}"
                      data-prop-id="${prop.id}">
                    ${propType.name} (${Math.round(prop.x)}, ${Math.round(prop.y)})
                    ${prop.isObstacle ? ' [Obstacle]' : ''}
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
            const scaleInput = document.getElementById('propScale');
            const isObstacleInput = document.getElementById('propIsObstacle');
            const typeSelect = document.getElementById('propTypeSelect');
            const zOrderDisplay = document.getElementById('propZOrder');

            if (xInput) xInput.value = Math.round(this.propData.selectedProp.x);
            if (yInput) yInput.value = Math.round(this.propData.selectedProp.y);
            if (scaleInput) {
                scaleInput.value = this.propData.selectedProp.scale !== undefined ?
                    this.propData.selectedProp.scale :
                    this.getDefaultScale(this.propData.selectedProp.type);
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
        const scaleInput = document.getElementById('propScale');
        const isObstacleInput = document.getElementById('propIsObstacle');
        const typeSelect = document.getElementById('propTypeSelect');

        if (xInput) this.propData.selectedProp.x = parseInt(xInput.value);
        if (yInput) this.propData.selectedProp.y = parseInt(yInput.value);
        if (scaleInput) this.propData.selectedProp.scale = parseFloat(scaleInput.value);
        if (isObstacleInput) this.propData.selectedProp.isObstacle = isObstacleInput.checked;
        if (typeSelect) this.propData.selectedProp.type = typeSelect.value;

        this.updatePropList();
    }

    getDefaultScale(propType) {
        if (propType === 'well') return 1;
        if (propType === 'barrel' || propType === 'crate') return 1.2;
        if (propType === 'smallPot' || propType === 'mediumPot' || propType === 'bigPot') return 0.6;
        return 1.6;
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