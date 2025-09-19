class PlatformManager {
    constructor(platformData) {
        this.platformData = platformData;
    }

    handleMouseDown(mouseX, mouseY, camera) {
        // Check if platform placement mode is active
        if (this.platformData.platformPlacementMode) {
            this.placePlatform(mouseX, mouseY);
            return { handled: true, type: 'placement' };
        }

        // Check for platform selection or resize
        for (let platform of this.platformData.platforms) {
            const resizeHandle = this.getResizeHandle(platform, mouseX, mouseY);
            if (resizeHandle) {
                this.platformData.isResizing = true;
                this.platformData.resizeHandle = resizeHandle;
                this.platformData.selectedPlatform = platform;
                return { handled: true, type: 'resize', platform };
            }

            if (this.platformData.isPointInPlatform(mouseX, mouseY, platform)) {
                this.platformData.isDragging = true;
                this.platformData.selectedPlatform = platform;
                this.platformData.dragOffset = {
                    x: mouseX - platform.x,
                    y: mouseY - platform.y
                };
                return { handled: true, type: 'drag', platform };
            }
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY) {
        if (!this.platformData.selectedPlatform) return false;

        if (this.platformData.isDragging) {
            // Calculate new position based on mouse
            const newX = mouseX - this.platformData.dragOffset.x;
            const newY = mouseY - this.platformData.dragOffset.y;

            // Apply snapping
            const snappedPos = this.snapPlatformPosition(this.platformData.selectedPlatform, newX, newY);

            this.platformData.selectedPlatform.x = snappedPos.x;
            this.platformData.selectedPlatform.y = snappedPos.y;
            return true;
        } else if (this.platformData.isResizing) {
            this.handlePlatformResize(mouseX, mouseY);
            return true;
        }

        return false;
    }

    handleMouseUp() {
        this.platformData.isDragging = false;
        this.platformData.isResizing = false;
        this.platformData.resizeHandle = null;
    }

    placePlatform(mouseX, mouseY) {
        // Add the platform at mouse position
        this.platformData.addPlatform(mouseX, mouseY);

        // Exit placement mode
        this.platformData.platformPlacementMode = false;
        const btn = document.getElementById('addPlatform');
        if (btn) {
            btn.textContent = 'Add Platform (Click on map)';
            btn.classList.remove('danger');
        }
    }

    togglePlatformPlacement() {
        this.platformData.platformPlacementMode = !this.platformData.platformPlacementMode;
        const btn = document.getElementById('addPlatform');
        if (btn) {
            btn.textContent = this.platformData.platformPlacementMode ? 'Cancel Placement' : 'Add Platform (Click on map)';
            btn.classList.toggle('danger', this.platformData.platformPlacementMode);
        }
    }

    getResizeHandle(platform, mouseX, mouseY) {
        const handleSize = 8;

        // Check corners first (higher priority)
        const corners = {
            nw: { x: platform.x, y: platform.y },
            ne: { x: platform.x + platform.width, y: platform.y },
            sw: { x: platform.x, y: platform.y + platform.height },
            se: { x: platform.x + platform.width, y: platform.y + platform.height }
        };

        for (let [handle, corner] of Object.entries(corners)) {
            if (Math.abs(mouseX - corner.x) <= handleSize && Math.abs(mouseY - corner.y) <= handleSize) {
                return handle;
            }
        }

        // Check edges if not on corners
        const isNearLeft = mouseX >= platform.x - handleSize && mouseX <= platform.x + handleSize;
        const isNearRight = mouseX >= platform.x + platform.width - handleSize && mouseX <= platform.x + platform.width + handleSize;
        const isNearTop = mouseY >= platform.y - handleSize && mouseY <= platform.y + handleSize;
        const isNearBottom = mouseY >= platform.y + platform.height - handleSize && mouseY <= platform.y + platform.height + handleSize;
        const isInHorizontalBounds = mouseX >= platform.x && mouseX <= platform.x + platform.width;
        const isInVerticalBounds = mouseY >= platform.y && mouseY <= platform.y + platform.height;

        if (isNearTop && isInHorizontalBounds) return 'n';
        if (isNearBottom && isInHorizontalBounds) return 's';
        if (isNearLeft && isInVerticalBounds) return 'w';
        if (isNearRight && isInVerticalBounds) return 'e';

        return null;
    }

    handlePlatformResize(mouseX, mouseY) {
        if (!this.platformData.selectedPlatform || !this.platformData.resizeHandle) return;

        const platform = this.platformData.selectedPlatform;
        const minSize = 20;
        let newX = platform.x;
        let newY = platform.y;
        let newWidth = platform.width;
        let newHeight = platform.height;

        // Calculate new dimensions based on resize handle
        switch (this.platformData.resizeHandle) {
            case 'se': // Bottom-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'sw': // Bottom-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'ne': // Top-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'nw': // Top-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'n': // Top edge
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 's': // Bottom edge
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'w': // Left edge
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                break;
            case 'e': // Right edge
                newWidth = Math.max(minSize, mouseX - platform.x);
                break;
        }

        // Apply snapping for new position (if position changed)
        if (newX !== platform.x || newY !== platform.y) {
            const snappedPos = this.snapPlatformPosition(platform, newX, newY, true);
            newX = snappedPos.x;
            newY = snappedPos.y;
        }

        // Update platform dimensions
        platform.x = newX;
        platform.y = newY;
        platform.width = newWidth;
        platform.height = newHeight;
    }

    snapPlatformPosition(platform, newX, newY, skipSelf = false) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;

        // Check against all other platforms
        for (const otherPlatform of this.platformData.platforms) {
            if (otherPlatform.id === platform.id) continue; // Skip self

            // Horizontal snapping (left/right edges)
            // Left edge of moving platform to right edge of other platform
            if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                snappedX = otherPlatform.x + otherPlatform.width;
            }
            // Right edge of moving platform to left edge of other platform
            else if (Math.abs((newX + platform.width) - otherPlatform.x) <= snapDistance) {
                snappedX = otherPlatform.x - platform.width;
            }
            // Left edges align
            else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                snappedX = otherPlatform.x;
            }
            // Right edges align
            else if (Math.abs((newX + platform.width) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                snappedX = otherPlatform.x + otherPlatform.width - platform.width;
            }

            // Vertical snapping (top/bottom edges)
            // Top edge of moving platform to bottom edge of other platform
            if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                snappedY = otherPlatform.y + otherPlatform.height;
            }
            // Bottom edge of moving platform to top edge of other platform
            else if (Math.abs((newY + platform.height) - otherPlatform.y) <= snapDistance) {
                snappedY = otherPlatform.y - platform.height;
            }
            // Top edges align
            else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                snappedY = otherPlatform.y;
            }
            // Bottom edges align
            else if (Math.abs((newY + platform.height) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                snappedY = otherPlatform.y + otherPlatform.height - platform.height;
            }
        }

        return { x: snappedX, y: snappedY };
    }

    // UI update methods
    updatePlatformList() {
        const listElement = document.getElementById('platformList');
        if (!listElement) return;

        listElement.innerHTML = this.platformData.platforms.map(platform =>
            `<div class="platform-item ${this.platformData.selectedPlatform && this.platformData.selectedPlatform.id === platform.id ? 'selected' : ''}"
                  data-platform-id="${platform.id}">
                Platform ${platform.id + 1} (${platform.x}, ${platform.y}) ${platform.width}x${platform.height}
            </div>`
        ).join('');

        // Add click listeners to platform items
        listElement.querySelectorAll('.platform-item').forEach(item => {
            item.addEventListener('click', () => {
                const platformId = parseInt(item.dataset.platformId);
                this.platformData.selectedPlatform = this.platformData.getPlatformById(platformId);
                this.updatePlatformProperties();
                this.updatePlatformList();
            });
        });
    }

    updatePlatformProperties() {
        const propertiesDiv = document.getElementById('platformProperties');
        if (!propertiesDiv) return;

        if (this.platformData.selectedPlatform) {
            propertiesDiv.style.display = 'block';
            const xInput = document.getElementById('platformX');
            const yInput = document.getElementById('platformY');
            const widthInput = document.getElementById('platformWidth');
            const heightInput = document.getElementById('platformHeight');
            const spriteTypeInput = document.getElementById('platformSpriteType');
            const positioningInput = document.getElementById('platformPositioning');
            const relativeXInput = document.getElementById('platformRelativeX');
            const relativeYInput = document.getElementById('platformRelativeY');
            const relativeRow = document.getElementById('relativePositionRow');

            if (xInput) xInput.value = Math.round(this.platformData.selectedPlatform.x);
            if (yInput) yInput.value = Math.round(this.platformData.selectedPlatform.y);
            if (widthInput) widthInput.value = this.platformData.selectedPlatform.width;
            if (heightInput) heightInput.value = this.platformData.selectedPlatform.height;
            if (spriteTypeInput) spriteTypeInput.value = this.platformData.selectedPlatform.spriteType || 'color';

            // Handle positioning properties
            const positioning = this.platformData.selectedPlatform.positioning || 'absolute';
            if (positioningInput) positioningInput.value = positioning;
            if (relativeXInput) relativeXInput.value = this.platformData.selectedPlatform.relativeX || 0.5;
            if (relativeYInput) relativeYInput.value = this.platformData.selectedPlatform.relativeY || 0.5;

            // Show/hide relative position controls
            if (relativeRow) {
                relativeRow.style.display = positioning === 'screen-relative' ? 'block' : 'none';
            }
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    updateSelectedPlatform() {
        if (!this.platformData.selectedPlatform) return;

        const xInput = document.getElementById('platformX');
        const yInput = document.getElementById('platformY');
        const widthInput = document.getElementById('platformWidth');
        const heightInput = document.getElementById('platformHeight');
        const spriteTypeInput = document.getElementById('platformSpriteType');
        const positioningInput = document.getElementById('platformPositioning');
        const relativeXInput = document.getElementById('platformRelativeX');
        const relativeYInput = document.getElementById('platformRelativeY');

        if (xInput) this.platformData.selectedPlatform.x = parseInt(xInput.value);
        if (yInput) this.platformData.selectedPlatform.y = parseInt(yInput.value);
        if (widthInput) this.platformData.selectedPlatform.width = parseInt(widthInput.value);
        if (heightInput) this.platformData.selectedPlatform.height = Math.min(32, Math.max(10, parseInt(heightInput.value)));
        if (spriteTypeInput) this.platformData.selectedPlatform.spriteType = spriteTypeInput.value;

        // Handle positioning properties
        if (positioningInput) this.platformData.selectedPlatform.positioning = positioningInput.value;
        if (relativeXInput) this.platformData.selectedPlatform.relativeX = parseFloat(relativeXInput.value);
        if (relativeYInput) this.platformData.selectedPlatform.relativeY = parseFloat(relativeYInput.value);

        // Update relative position display
        this.updatePlatformProperties();

        this.updatePlatformList();
    }
}