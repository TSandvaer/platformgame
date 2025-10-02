class PlatformManager {
    constructor(platformData) {
        this.platformData = platformData;

        // Movement zone drawing state
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetPlatform = null; // Platform whose movement zone is being drawn

        // Movement zone editing state
        this.isDraggingMovementZoneHandle = false;
        this.draggingHandleType = null; // 'start' or 'end'
        this.draggingHandlePlatform = null;
    }

    handleMouseDown(mouseX, mouseY, camera, viewport) {
        // Check if movement zone drawing mode is active
        if (this.isDrawingMovementZone) {
            this.startMovementZoneDrawing(mouseX, mouseY);
            return { handled: true, type: 'movementZoneStart' };
        }

        // Check if platform placement mode is active
        if (this.platformData.platformPlacementMode) {
            this.placePlatform(mouseX, mouseY);
            return { handled: true, type: 'placement' };
        }

        // First pass: Check for movement zone handles on ALL platforms (highest priority)
        for (let platform of this.platformData.platforms) {
            if (platform.movementZone && platform.movementZone.enabled) {
                const handleResult = this.checkMovementZoneHandlesForPlatform(platform, mouseX, mouseY);
                if (handleResult.handled) {
                    // Select the platform if not already selected
                    this.platformData.selectedPlatform = platform;
                    this.updatePlatformProperties();
                    return handleResult;
                }
            }
        }

        // Second pass: Check for platform selection or resize
        for (let platform of this.platformData.platforms) {
            // Get actual position based on positioning mode
            let actualPos, renderPlatform;
            if (viewport) {
                actualPos = this.platformData.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
                renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };
            } else {
                renderPlatform = platform;
            }

            const resizeHandle = this.getResizeHandle(renderPlatform, mouseX, mouseY);
            if (resizeHandle) {
                this.platformData.isResizing = true;
                this.platformData.resizeHandle = resizeHandle;
                this.platformData.selectedPlatform = platform;
                // Store the starting state for resize operation
                this.platformData.resizeStartState = {
                    x: renderPlatform.x,
                    y: renderPlatform.y,
                    width: renderPlatform.width,
                    height: renderPlatform.height,
                    // Store original raw coordinates too
                    rawX: platform.x,
                    rawY: platform.y,
                    rawWidth: platform.width,
                    rawHeight: platform.height
                };
                return { handled: true, type: 'resize', platform };
            }

            if (this.platformData.isPointInPlatform(mouseX, mouseY, renderPlatform)) {
                this.platformData.isDragging = true;
                this.platformData.selectedPlatform = platform;
                // Store the drag offset using the difference between mouse and actual rendered position
                // But we need to calculate what the new raw position should be when dragging
                this.platformData.dragOffset = {
                    x: mouseX - renderPlatform.x,
                    y: mouseY - renderPlatform.y
                };
                // Store the original position for coordinate system consistency
                this.platformData.dragStartRawPos = { x: platform.x, y: platform.y };
                this.platformData.dragStartActualPos = { x: renderPlatform.x, y: renderPlatform.y };
                return { handled: true, type: 'drag', platform };
            }
        }

        // No platform was clicked - deselect current platform
        if (this.platformData.selectedPlatform) {
            this.platformData.selectedPlatform = null;
            this.updatePlatformProperties();
            this.updatePlatformList();
        }

        return { handled: false };
    }

    handleMouseMove(mouseX, mouseY, viewport, shiftKey = false) {
        // Update movement zone drawing
        if (this.isDrawingMovementZone && this.movementZoneStart) {
            this.movementZoneEnd = { x: mouseX, y: mouseY };
            return true;
        }

        // Update movement zone handle dragging
        if (this.isDraggingMovementZoneHandle && this.draggingHandlePlatform) {
            this.updateMovementZoneHandle(mouseX, mouseY, shiftKey);
            return true;
        }

        if (!this.platformData.selectedPlatform) return false;

        if (this.platformData.isDragging) {
            // Calculate new actual position based on mouse
            const newActualX = mouseX - this.platformData.dragOffset.x;
            const newActualY = mouseY - this.platformData.dragOffset.y;

            // Calculate the delta from the original actual position
            const deltaX = newActualX - this.platformData.dragStartActualPos.x;
            const deltaY = newActualY - this.platformData.dragStartActualPos.y;

            // Apply the delta to the original raw position
            const newRawX = this.platformData.dragStartRawPos.x + deltaX;
            const newRawY = this.platformData.dragStartRawPos.y + deltaY;

            // Apply snapping using raw coordinates
            const snappedPos = this.snapPlatformPosition(this.platformData.selectedPlatform, newRawX, newRawY);

            // Apply boundary constraints - prevent platform from going below bottom edge
            const platform = this.platformData.selectedPlatform;
            let constrainedY = snappedPos.y;
            if (viewport) {
                const bottomEdge = viewport.designHeight;
                constrainedY = Math.min(snappedPos.y, bottomEdge - platform.height);
            }

            // Calculate how much the platform moved
            const platformDeltaX = snappedPos.x - this.platformData.selectedPlatform.x;
            const platformDeltaY = constrainedY - this.platformData.selectedPlatform.y;

            this.platformData.selectedPlatform.x = snappedPos.x;
            this.platformData.selectedPlatform.y = constrainedY;

            // Move the movement zone with the platform
            if (this.platformData.selectedPlatform.movementZone && this.platformData.selectedPlatform.movementZone.enabled) {
                const zone = this.platformData.selectedPlatform.movementZone;
                zone.startX += platformDeltaX;
                zone.startY += platformDeltaY;
                zone.endX += platformDeltaX;
                zone.endY += platformDeltaY;
            }

            return true;
        } else if (this.platformData.isResizing) {
            this.handlePlatformResize(mouseX, mouseY);
            return true;
        }

        return false;
    }

    handleMouseUp() {
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

        this.platformData.isDragging = false;
        this.platformData.isResizing = false;
        this.platformData.resizeHandle = null;
        this.platformData.resizeStartState = null;
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

        // Check corners first (higher priority) - using same zones as edges
        // Top-left corner (outside platform)
        if (mouseX >= platform.x - handleSize && mouseX < platform.x &&
            mouseY >= platform.y - handleSize && mouseY < platform.y) {
            return 'top-left';
        }
        // Top-right corner (outside platform)
        if (mouseX > platform.x + platform.width && mouseX <= platform.x + platform.width + handleSize &&
            mouseY >= platform.y - handleSize && mouseY < platform.y) {
            return 'top-right';
        }
        // Bottom-left corner (outside platform)
        if (mouseX >= platform.x - handleSize && mouseX < platform.x &&
            mouseY > platform.y + platform.height && mouseY <= platform.y + platform.height + handleSize) {
            return 'bottom-left';
        }
        // Bottom-right corner (outside platform)
        if (mouseX > platform.x + platform.width && mouseX <= platform.x + platform.width + handleSize &&
            mouseY > platform.y + platform.height && mouseY <= platform.y + platform.height + handleSize) {
            return 'bottom-right';
        }

        // Check edges if not on corners - left/right zones include platform edge
        // Left edge: from 8 pixels left of platform to 4 pixels inside (to include yellow square)
        const leftZoneMinX = platform.x - handleSize;
        const leftZoneMaxX = platform.x + 4;  // Include part of the yellow square area
        const isNearLeft = mouseX >= leftZoneMinX && mouseX <= leftZoneMaxX &&
                          mouseY >= platform.y && mouseY <= platform.y + platform.height;

        const isNearRight = mouseX >= platform.x + platform.width - 4 && mouseX <= platform.x + platform.width + handleSize &&
                           mouseY >= platform.y && mouseY <= platform.y + platform.height;
        const isNearTop = mouseY >= platform.y - handleSize && mouseY < platform.y &&
                         mouseX >= platform.x && mouseX <= platform.x + platform.width;
        const isNearBottom = mouseY > platform.y + platform.height && mouseY <= platform.y + platform.height + handleSize &&
                            mouseX >= platform.x && mouseX <= platform.x + platform.width;

        if (isNearTop) return 'top';
        if (isNearBottom) return 'bottom';
        if (isNearLeft) return 'left';
        if (isNearRight) return 'right';

        return null;
    }

    handlePlatformResize(mouseX, mouseY) {
        if (!this.platformData.selectedPlatform || !this.platformData.resizeHandle) return;

        // Use the resize start state if available (contains the actual rendered position)
        const resizeState = this.platformData.resizeStartState;
        const platform = resizeState ?
            { ...this.platformData.selectedPlatform,
              x: resizeState.x,
              y: resizeState.y,
              width: resizeState.width,
              height: resizeState.height } :
            this.platformData.selectedPlatform;
        const tileWidth = 32; // Display tile width
        const tileHeight = 32; // Display tile height
        const minSize = tileHeight; // Minimum size should be at least one tile
        let newX = platform.x;
        let newY = platform.y;
        let newWidth = platform.width;
        let newHeight = platform.height;

        // Calculate new dimensions based on resize handle
        switch (this.platformData.resizeHandle) {
            case 'bottom-right': // Bottom-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'bottom-left': // Bottom-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'top-right': // Top-right
                newWidth = Math.max(minSize, mouseX - platform.x);
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'top-left': // Top-left
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'top': // Top edge
                newHeight = Math.max(minSize, platform.y + platform.height - mouseY);
                newY = platform.y + platform.height - newHeight;
                break;
            case 'bottom': // Bottom edge
                newHeight = Math.max(minSize, mouseY - platform.y);
                break;
            case 'left': // Left edge
                newWidth = Math.max(minSize, platform.x + platform.width - mouseX);
                newX = platform.x + platform.width - newWidth;
                break;
            case 'right': // Right edge
                newWidth = Math.max(minSize, mouseX - platform.x);
                break;
        }

        // Store original values before snapping for Y position adjustment
        const originalNewHeight = newHeight;

        // Snap dimensions to tile boundaries to ensure complete tiles
        newWidth = Math.round(newWidth / tileWidth) * tileWidth;
        newHeight = Math.round(newHeight / tileHeight) * tileHeight;

        // Ensure minimum size (at least one tile)
        newWidth = Math.max(tileWidth, newWidth);
        newHeight = Math.max(tileHeight, newHeight);

        // Adjust Y position for top edge resizing when height was snapped
        if ((this.platformData.resizeHandle === 'top' ||
             this.platformData.resizeHandle === 'top-right' ||
             this.platformData.resizeHandle === 'top-left') &&
            newHeight !== originalNewHeight) {
            const heightDifference = newHeight - originalNewHeight;
            newY = newY - heightDifference;
        }

        // Apply snapping for new position (if position changed)
        if (newX !== platform.x || newY !== platform.y) {
            const snappedPos = this.snapPlatformPosition(platform, newX, newY, true);
            newX = snappedPos.x;
            newY = snappedPos.y;
        }
        // Update the actual selected platform with new dimensions
        // If we used resizeStartState (rendered coordinates), we need to convert back to raw coordinates
        if (resizeState && resizeState.rawX !== undefined) {
            // Calculate the delta from the original rendered position
            const deltaX = newX - resizeState.x;
            const deltaY = newY - resizeState.y;
            const deltaWidth = newWidth - resizeState.width;
            const deltaHeight = newHeight - resizeState.height;
            // Apply deltas to the ORIGINAL raw coordinates (not current ones)
            this.platformData.selectedPlatform.x = resizeState.rawX + deltaX;
            this.platformData.selectedPlatform.y = resizeState.rawY + deltaY;
            this.platformData.selectedPlatform.width = resizeState.rawWidth + deltaWidth;
            this.platformData.selectedPlatform.height = resizeState.rawHeight + deltaHeight;

            // Ensure width and height are never negative or zero
            this.platformData.selectedPlatform.width = Math.max(32, this.platformData.selectedPlatform.width);
            this.platformData.selectedPlatform.height = Math.max(32, this.platformData.selectedPlatform.height);
        } else {
            // No coordinate transformation needed, use values directly
            this.platformData.selectedPlatform.x = newX;
            this.platformData.selectedPlatform.y = newY;
            this.platformData.selectedPlatform.width = Math.max(32, newWidth);
            this.platformData.selectedPlatform.height = Math.max(32, newHeight);
            console.log('🔧 Resize - Platform after (direct):', this.platformData.selectedPlatform);
        }
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
    updatePlatformList(scenePlatforms = null, sceneName = null) {
        const listElement = document.getElementById('platformList');
        if (!listElement) return;

        // Use provided scene platforms or fall back to all platforms
        const platformsToShow = scenePlatforms || this.platformData.platforms;

        // Update scene name in the header
        const sceneNameElement = document.getElementById('platformSceneName');
        if (sceneNameElement) {
            sceneNameElement.textContent = sceneName ? `- ${sceneName}` : '';
        }

        listElement.innerHTML = platformsToShow.map(platform =>
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
            // Ensure backward compatibility - initialize missing movement properties
            this.ensureMovementProperties(this.platformData.selectedPlatform);

            propertiesDiv.style.display = 'block';
            const xInput = document.getElementById('platformX');
            const yInput = document.getElementById('platformY');
            const widthInput = document.getElementById('platformWidth');
            const heightInput = document.getElementById('platformHeight');
            const spriteTypeInput = document.getElementById('platformSpriteType');
            const positioningInput = document.getElementById('platformPositioning');
            const relativeXInput = document.getElementById('platformRelativeX');
            const relativeYInput = document.getElementById('platformRelativeY');
            const damageInput = document.getElementById('platformDamage');
            const killEffectInput = document.getElementById('platformKillEffect');
            const relativeRow = document.getElementById('relativePositionRow');

            if (xInput) xInput.value = Math.round(this.platformData.selectedPlatform.x || 0);
            if (yInput) yInput.value = Math.round(this.platformData.selectedPlatform.y || 0);
            if (widthInput) widthInput.value = this.platformData.selectedPlatform.width || 100;
            if (heightInput) heightInput.value = this.platformData.selectedPlatform.height || 20;
            if (spriteTypeInput) spriteTypeInput.value = this.platformData.selectedPlatform.spriteType || 'color';
            if (damageInput) damageInput.value = this.platformData.selectedPlatform.damagePerSecond || 0;
            if (killEffectInput) killEffectInput.value = this.platformData.selectedPlatform.killEffect || 'normal';

            const blockPlayerInput = document.getElementById('platformBlockPlayer');
            if (blockPlayerInput) blockPlayerInput.checked = this.platformData.selectedPlatform.blockPlayer || false;

            // Handle positioning properties
            const positioning = this.platformData.selectedPlatform.positioning || 'absolute';
            if (positioningInput) positioningInput.value = positioning;
            if (relativeXInput) relativeXInput.value = this.platformData.selectedPlatform.relativeX || 0.5;
            if (relativeYInput) relativeYInput.value = this.platformData.selectedPlatform.relativeY || 0.5;

            // Show/hide relative position controls
            if (relativeRow) {
                relativeRow.style.display = positioning === 'screen-relative' ? 'block' : 'none';
            }

            // Update movement properties
            const isMovingInput = document.getElementById('selectedPlatformIsMoving');
            const moveSpeedInput = document.getElementById('selectedPlatformMoveSpeed');
            const movementEnabledInput = document.getElementById('selectedPlatformMovementEnabled');
            const zoneStartXInput = document.getElementById('selectedPlatformZoneStartX');
            const zoneEndXInput = document.getElementById('selectedPlatformZoneEndX');
            const zoneYInput = document.getElementById('selectedPlatformZoneY');

            if (isMovingInput) isMovingInput.checked = this.platformData.selectedPlatform.isMoving || false;
            if (moveSpeedInput) moveSpeedInput.value = this.platformData.selectedPlatform.moveSpeed || 2;
            if (movementEnabledInput) movementEnabledInput.checked = this.platformData.selectedPlatform.movementZone?.enabled || false;
            if (zoneStartXInput) zoneStartXInput.value = this.platformData.selectedPlatform.movementZone?.startX || 0;
            if (zoneEndXInput) zoneEndXInput.value = this.platformData.selectedPlatform.movementZone?.endX || 0;
            if (zoneYInput) zoneYInput.value = this.platformData.selectedPlatform.movementZone?.y || 0;

            // Show/hide movement sections based on isMoving flag
            const isMoving = this.platformData.selectedPlatform.isMoving || false;
            const platformMovementSection = document.getElementById('platformMovementSection');
            const platformMovementZoneSection = document.getElementById('platformMovementZoneSection');
            const platformMovementControlSection = document.getElementById('platformMovementControlSection');
            const platformEasingSection = document.getElementById('platformEasingSection');
            const platformEasingDistanceSection = document.getElementById('platformEasingDistanceSection');
            const platformEasingMinSpeedSection = document.getElementById('platformEasingMinSpeedSection');
            const platformEndDelaySection = document.getElementById('platformEndDelaySection');

            if (platformMovementSection) {
                platformMovementSection.style.display = isMoving ? 'block' : 'none';
            }
            if (platformMovementZoneSection) {
                platformMovementZoneSection.style.display = isMoving ? 'block' : 'none';
            }
            if (platformMovementControlSection) {
                platformMovementControlSection.style.display = isMoving ? 'block' : 'none';
            }
            if (platformEasingSection) {
                platformEasingSection.style.display = isMoving ? 'block' : 'none';
            }

            // Show easing distance and min speed only if easing is enabled
            const useEasing = this.platformData.selectedPlatform.useEasing || false;
            if (platformEasingDistanceSection) {
                platformEasingDistanceSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
            }
            if (platformEasingMinSpeedSection) {
                platformEasingMinSpeedSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
            }

            // Show end delay section when moving
            if (platformEndDelaySection) {
                platformEndDelaySection.style.display = isMoving ? 'block' : 'none';
            }

            // Show/hide movement zone controls based on movement enabled flag
            const movementEnabled = this.platformData.selectedPlatform.movementZone?.enabled || false;
            const platformMovementZoneControls = document.getElementById('platformMovementZoneControls');
            const platformMovementZoneControls2 = document.getElementById('platformMovementZoneControls2');
            const platformMovementZoneControls3 = document.getElementById('platformMovementZoneControls3');

            if (platformMovementZoneControls) {
                platformMovementZoneControls.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }
            if (platformMovementZoneControls2) {
                platformMovementZoneControls2.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }
            if (platformMovementZoneControls3) {
                platformMovementZoneControls3.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
            }

            // Add event listeners for movement checkboxes
            if (isMovingInput) {
                isMovingInput.removeEventListener('change', this.handlePlatformMovingCheckboxChange);
                this.handlePlatformMovingCheckboxChange = () => {
                    const isMoving = isMovingInput.checked;
                    if (platformMovementSection) platformMovementSection.style.display = isMoving ? 'block' : 'none';
                    if (platformMovementZoneSection) platformMovementZoneSection.style.display = isMoving ? 'block' : 'none';
                    if (platformMovementControlSection) platformMovementControlSection.style.display = isMoving ? 'block' : 'none';
                    if (platformEasingSection) platformEasingSection.style.display = isMoving ? 'block' : 'none';
                    if (platformEndDelaySection) platformEndDelaySection.style.display = isMoving ? 'block' : 'none';

                    // Show easing distance and min speed only if easing is enabled
                    const useEasingInput = document.getElementById('selectedPlatformUseEasing');
                    const useEasing = useEasingInput?.checked || false;
                    if (platformEasingDistanceSection) {
                        platformEasingDistanceSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
                    }
                    const platformEasingMinSpeedSection = document.getElementById('platformEasingMinSpeedSection');
                    if (platformEasingMinSpeedSection) {
                        platformEasingMinSpeedSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
                    }

                    if (!isMoving) {
                        if (platformMovementZoneControls) platformMovementZoneControls.style.display = 'none';
                        if (platformMovementZoneControls2) platformMovementZoneControls2.style.display = 'none';
                        if (platformMovementZoneControls3) platformMovementZoneControls3.style.display = 'none';
                    } else {
                        const movementEnabled = movementEnabledInput?.checked || false;
                        if (platformMovementZoneControls) platformMovementZoneControls.style.display = movementEnabled ? 'block' : 'none';
                        if (platformMovementZoneControls2) platformMovementZoneControls2.style.display = movementEnabled ? 'block' : 'none';
                        if (platformMovementZoneControls3) platformMovementZoneControls3.style.display = movementEnabled ? 'block' : 'none';
                    }
                };
                isMovingInput.addEventListener('change', this.handlePlatformMovingCheckboxChange);
            }

            if (movementEnabledInput) {
                movementEnabledInput.removeEventListener('change', this.handlePlatformMovementEnabledCheckboxChange);
                this.handlePlatformMovementEnabledCheckboxChange = () => {
                    const movementEnabled = movementEnabledInput.checked;
                    const isMoving = isMovingInput?.checked || false;

                    if (platformMovementZoneControls) {
                        platformMovementZoneControls.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                    if (platformMovementZoneControls2) {
                        platformMovementZoneControls2.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                    if (platformMovementZoneControls3) {
                        platformMovementZoneControls3.style.display = (isMoving && movementEnabled) ? 'block' : 'none';
                    }
                };
                movementEnabledInput.addEventListener('change', this.handlePlatformMovementEnabledCheckboxChange);
            }

            // Update spinning properties
            const isSpinningInput = document.getElementById('selectedPlatformIsSpinning');
            const spinSpeedInput = document.getElementById('selectedPlatformSpinSpeed');
            const spinClockwiseInput = document.getElementById('selectedPlatformSpinClockwise');

            if (isSpinningInput) isSpinningInput.checked = this.platformData.selectedPlatform.isSpinning || false;
            if (spinSpeedInput) spinSpeedInput.value = this.platformData.selectedPlatform.spinSpeed || 1.0;
            if (spinClockwiseInput) spinClockwiseInput.checked = this.platformData.selectedPlatform.spinClockwise !== false; // Default true

            // Update easing and delay properties
            const useEasingInput = document.getElementById('selectedPlatformUseEasing');
            const easingDistanceInput = document.getElementById('selectedPlatformEasingDistance');
            const easingMinSpeedInput = document.getElementById('selectedPlatformEasingMinSpeed');
            const endDelayInput = document.getElementById('selectedPlatformEndDelay');

            if (useEasingInput) useEasingInput.checked = this.platformData.selectedPlatform.useEasing || false;
            if (easingDistanceInput) easingDistanceInput.value = this.platformData.selectedPlatform.easingDistance || 0.2;
            if (easingMinSpeedInput) easingMinSpeedInput.value = this.platformData.selectedPlatform.easingMinSpeed || 0.2;
            if (endDelayInput) endDelayInput.value = this.platformData.selectedPlatform.endDelay || 0;

            // Show/hide spinning sections based on isSpinning flag
            const isSpinning = this.platformData.selectedPlatform.isSpinning || false;
            const platformSpinningSection = document.getElementById('platformSpinningSection');
            const platformSpinDirectionSection = document.getElementById('platformSpinDirectionSection');

            if (platformSpinningSection) {
                platformSpinningSection.style.display = isSpinning ? 'block' : 'none';
            }
            if (platformSpinDirectionSection) {
                platformSpinDirectionSection.style.display = isSpinning ? 'block' : 'none';
            }

            // Add event listener for spinning checkbox
            if (isSpinningInput) {
                isSpinningInput.removeEventListener('change', this.handlePlatformSpinningCheckboxChange);
                this.handlePlatformSpinningCheckboxChange = () => {
                    const platformSpinningSection = document.getElementById('platformSpinningSection');
                    const platformSpinDirectionSection = document.getElementById('platformSpinDirectionSection');
                    const isSpinning = isSpinningInput.checked;

                    if (platformSpinningSection) platformSpinningSection.style.display = isSpinning ? 'block' : 'none';
                    if (platformSpinDirectionSection) platformSpinDirectionSection.style.display = isSpinning ? 'block' : 'none';
                };
                isSpinningInput.addEventListener('change', this.handlePlatformSpinningCheckboxChange);
            }

            // Add event listener for easing checkbox
            if (useEasingInput) {
                useEasingInput.removeEventListener('change', this.handleEasingCheckboxChange);
                this.handleEasingCheckboxChange = () => {
                    const platformEasingDistanceSection = document.getElementById('platformEasingDistanceSection');
                    const platformEasingMinSpeedSection = document.getElementById('platformEasingMinSpeedSection');
                    const useEasing = useEasingInput.checked;
                    const isMoving = this.platformData.selectedPlatform?.isMoving || false;

                    if (platformEasingDistanceSection) {
                        platformEasingDistanceSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
                    }
                    if (platformEasingMinSpeedSection) {
                        platformEasingMinSpeedSection.style.display = (isMoving && useEasing) ? 'block' : 'none';
                    }
                };
                useEasingInput.addEventListener('change', this.handleEasingCheckboxChange);
            }

            // Update movement control button text
            this.updateMovementControlButtons(this.platformData.selectedPlatform);
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
        const damageInput = document.getElementById('platformDamage');
        const killEffectInput = document.getElementById('platformKillEffect');

        if (xInput) this.platformData.selectedPlatform.x = parseInt(xInput.value);
        if (yInput) this.platformData.selectedPlatform.y = parseInt(yInput.value);
        if (widthInput) this.platformData.selectedPlatform.width = parseInt(widthInput.value);
        if (heightInput) this.platformData.selectedPlatform.height = parseInt(heightInput.value);
        if (spriteTypeInput) this.platformData.selectedPlatform.spriteType = spriteTypeInput.value;
        if (damageInput) this.platformData.selectedPlatform.damagePerSecond = Math.max(0, parseFloat(damageInput.value) || 0);
        if (killEffectInput) this.platformData.selectedPlatform.killEffect = killEffectInput.value;

        const blockPlayerInput = document.getElementById('platformBlockPlayer');
        if (blockPlayerInput) this.platformData.selectedPlatform.blockPlayer = blockPlayerInput.checked;

        // Handle positioning properties
        if (positioningInput) this.platformData.selectedPlatform.positioning = positioningInput.value;
        if (relativeXInput) this.platformData.selectedPlatform.relativeX = parseFloat(relativeXInput.value);
        if (relativeYInput) this.platformData.selectedPlatform.relativeY = parseFloat(relativeYInput.value);

        // Handle movement properties
        const isMovingInput = document.getElementById('selectedPlatformIsMoving');
        const moveSpeedInput = document.getElementById('selectedPlatformMoveSpeed');
        const movementEnabledInput = document.getElementById('selectedPlatformMovementEnabled');
        const zoneStartXInput = document.getElementById('selectedPlatformZoneStartX');
        const zoneEndXInput = document.getElementById('selectedPlatformZoneEndX');
        const zoneYInput = document.getElementById('selectedPlatformZoneY');
        // Spinning inputs
        const isSpinningInput = document.getElementById('selectedPlatformIsSpinning');
        const spinSpeedInput = document.getElementById('selectedPlatformSpinSpeed');
        const spinClockwiseInput = document.getElementById('selectedPlatformSpinClockwise');

        if (isMovingInput) {
            this.platformData.selectedPlatform.isMoving = isMovingInput.checked;
        }
        if (moveSpeedInput) {
            this.platformData.selectedPlatform.moveSpeed = parseFloat(moveSpeedInput.value) || 2;
        }
        if (movementEnabledInput) {
            // Initialize movement zone if it doesn't exist
            if (!this.platformData.selectedPlatform.movementZone) {
                this.platformData.selectedPlatform.movementZone = {
                    enabled: false,
                    startX: this.platformData.selectedPlatform.x - 50,
                    endX: this.platformData.selectedPlatform.x + 50,
                    y: this.platformData.selectedPlatform.y
                };
            }
            this.platformData.selectedPlatform.movementZone.enabled = movementEnabledInput.checked;
        }
        if (zoneStartXInput && this.platformData.selectedPlatform.movementZone) {
            this.platformData.selectedPlatform.movementZone.startX = parseFloat(zoneStartXInput.value) || 0;
        }
        if (zoneEndXInput && this.platformData.selectedPlatform.movementZone) {
            this.platformData.selectedPlatform.movementZone.endX = parseFloat(zoneEndXInput.value) || 0;
        }
        if (zoneYInput && this.platformData.selectedPlatform.movementZone) {
            this.platformData.selectedPlatform.movementZone.y = parseFloat(zoneYInput.value) || 0;
        }

        // Handle spinning properties
        if (isSpinningInput) {
            this.platformData.selectedPlatform.isSpinning = isSpinningInput.checked;
        }
        if (spinSpeedInput) {
            this.platformData.selectedPlatform.spinSpeed = parseFloat(spinSpeedInput.value) || 1.0;
        }
        if (spinClockwiseInput) {
            this.platformData.selectedPlatform.spinClockwise = spinClockwiseInput.checked;
        }

        // Handle easing and delay properties
        const useEasingInput = document.getElementById('selectedPlatformUseEasing');
        const easingDistanceInput = document.getElementById('selectedPlatformEasingDistance');
        const easingMinSpeedInput = document.getElementById('selectedPlatformEasingMinSpeed');
        const endDelayInput = document.getElementById('selectedPlatformEndDelay');

        if (useEasingInput) {
            this.platformData.selectedPlatform.useEasing = useEasingInput.checked;
        }
        if (easingDistanceInput) {
            this.platformData.selectedPlatform.easingDistance = parseFloat(easingDistanceInput.value) || 0.2;
        }
        if (easingMinSpeedInput) {
            this.platformData.selectedPlatform.easingMinSpeed = parseFloat(easingMinSpeedInput.value) || 0.2;
        }
        if (endDelayInput) {
            this.platformData.selectedPlatform.endDelay = parseFloat(endDelayInput.value) || 0;
        }

        // Update relative position display
        this.updatePlatformProperties();

        this.updatePlatformList();
    }

    // Movement zone drawing methods
    startMovementZoneDrawing(mouseX, mouseY) {
        this.movementZoneStart = { x: mouseX, y: mouseY };
        this.movementZoneEnd = { x: mouseX, y: mouseY };
        console.log('🔵 Started platform movement zone drawing at', mouseX, mouseY);
    }

    finishMovementZoneDrawing() {
        if (!this.movementTargetPlatform || !this.movementZoneStart || !this.movementZoneEnd) {
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
        if (!this.movementTargetPlatform.movementZone) {
            this.movementTargetPlatform.movementZone = {
                enabled: false,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                angle: 0
            };
        }

        // Update platform movement zone
        this.movementTargetPlatform.movementZone.startX = startX;
        this.movementTargetPlatform.movementZone.startY = startY;
        this.movementTargetPlatform.movementZone.endX = endX;
        this.movementTargetPlatform.movementZone.endY = endY;
        this.movementTargetPlatform.movementZone.angle = angle;
        this.movementTargetPlatform.movementZone.enabled = true;

        // Initialize movement progress to start of line
        this.movementTargetPlatform.movementProgress = 0;

        // Reposition platform to start of movement zone line (centered on start point)
        this.movementTargetPlatform.x = startX - this.movementTargetPlatform.width / 2;
        this.movementTargetPlatform.y = startY - this.movementTargetPlatform.height / 2;

        // Update original position to match start of movement zone
        this.movementTargetPlatform.originalPosition = {
            x: this.movementTargetPlatform.x,
            y: this.movementTargetPlatform.y
        };

        console.log(`🔵 Movement zone set for platform ${this.movementTargetPlatform.id}:`, {
            startX, startY, endX, endY, angle: angle * 180 / Math.PI + '°',
            platformRepositioned: `(${this.movementTargetPlatform.x}, ${this.movementTargetPlatform.y})`
        });

        // Reset drawing state
        this.cancelMovementZoneDrawing();

        // Update UI if available
        this.updatePlatformProperties();
    }

    cancelMovementZoneDrawing() {
        this.isDrawingMovementZone = false;
        this.movementZoneStart = null;
        this.movementZoneEnd = null;
        this.movementTargetPlatform = null;
        console.log('🔵 Platform movement zone drawing cancelled');
    }

    // Public methods to control movement zone drawing mode
    startMovementZoneDrawingMode(platform) {
        if (!platform) {
            console.error('Cannot start movement zone drawing: no platform selected');
            return;
        }

        this.movementTargetPlatform = platform;
        this.isDrawingMovementZone = true;
        console.log('🔵 Platform movement zone drawing mode started for platform', platform.id);
        console.log('🔵 Press Escape to cancel drawing');
    }

    clearMovementZone(platform) {
        if (!platform) {
            console.error('Cannot clear movement zone: no platform selected');
            return;
        }

        // Cancel any ongoing drawing
        this.cancelMovementZoneDrawing();

        // Clear movement zone
        if (platform.movementZone) {
            platform.movementZone.enabled = false;
            platform.movementZone.startX = 0;
            platform.movementZone.startY = 0;
            platform.movementZone.endX = 0;
            platform.movementZone.endY = 0;
            platform.movementZone.angle = 0;
        }

        // Reset movement state
        platform.movementProgress = 0;
        platform.movingDirection = 1;

        console.log('🔵 Cleared movement zone for platform', platform.id);

        // Update UI
        this.updatePlatformProperties();
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

        // Draw preview line (cyan like enemy movement zones)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(renderStartX, renderStartY);
        ctx.lineTo(renderEndX, renderEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw zone markers
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Ensure platform has all required movement properties for backward compatibility
    ensureMovementProperties(platform) {
        // Initialize isMoving if missing
        if (platform.isMoving === undefined) {
            platform.isMoving = false;
        }

        // Initialize moveSpeed if missing
        if (platform.moveSpeed === undefined) {
            platform.moveSpeed = 2;
        }

        // Initialize movementZone if missing
        if (!platform.movementZone) {
            platform.movementZone = {
                enabled: false,
                startX: platform.x - 50,
                startY: platform.y,
                endX: platform.x + 50,
                endY: platform.y,
                angle: 0
            };
        }

        // Initialize movement state properties if missing
        if (platform.velocityX === undefined) platform.velocityX = 0;
        if (platform.velocityY === undefined) platform.velocityY = 0;
        if (platform.targetX === undefined) platform.targetX = platform.x;
        if (platform.targetY === undefined) platform.targetY = platform.y;
        if (platform.movingDirection === undefined) platform.movingDirection = 1;
        if (platform.movementProgress === undefined) platform.movementProgress = 0;
    }

    // Movement zone handle methods
    checkMovementZoneHandlesForPlatform(platform, mouseX, mouseY) {
        // Check handles for the given platform
        if (!platform || !platform.movementZone || !platform.movementZone.enabled) {
            return { handled: false };
        }

        const zone = platform.movementZone;
        const endHandleRadius = 12; // Larger radius for easier clicking (visual handle is 6px radius)
        const startHandleRadius = 15; // Even larger for start handle since it's often overlapped by platform

        // Check end handle first (higher priority since it doesn't move the platform)
        const endDist = Math.sqrt((mouseX - zone.endX) ** 2 + (mouseY - zone.endY) ** 2);
        if (endDist <= endHandleRadius) {
            this.isDraggingMovementZoneHandle = true;
            this.draggingHandleType = 'end';
            this.draggingHandlePlatform = platform;
            console.log('🔵 Started dragging platform movement zone end handle', {
                mouseX, mouseY, zoneX: zone.endX, zoneY: zone.endY, distance: endDist
            });
            return { handled: true, type: 'movementZoneHandleEnd' };
        }

        // Check start handle
        const startDist = Math.sqrt((mouseX - zone.startX) ** 2 + (mouseY - zone.startY) ** 2);
        if (startDist <= startHandleRadius) {
            this.isDraggingMovementZoneHandle = true;
            this.draggingHandleType = 'start';
            this.draggingHandlePlatform = platform;
            console.log('🔵 Started dragging platform movement zone start handle', {
                mouseX, mouseY, zoneX: zone.startX, zoneY: zone.startY, distance: startDist,
                platformX: platform.x, platformY: platform.y
            });
            return { handled: true, type: 'movementZoneHandleStart' };
        }

        return { handled: false };
    }

    updateMovementZoneHandle(mouseX, mouseY, shiftKey = false) {
        if (!this.draggingHandlePlatform || !this.draggingHandleType) return;

        const zone = this.draggingHandlePlatform.movementZone;
        const platform = this.draggingHandlePlatform;

        // Apply shift snapping if shift key is held
        let snappedX = mouseX;
        let snappedY = mouseY;

        if (shiftKey) {
            // Determine the reference point for snapping
            const refX = this.draggingHandleType === 'start' ? zone.endX : zone.startX;
            const refY = this.draggingHandleType === 'start' ? zone.endY : zone.startY;

            // Calculate deltas
            const deltaX = mouseX - refX;
            const deltaY = mouseY - refY;

            // Snap to horizontal or vertical based on which is closer
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Snap to horizontal
                snappedY = refY;
            } else {
                // Snap to vertical
                snappedX = refX;
            }
        }

        if (this.draggingHandleType === 'start') {
            // Calculate how much the start point moved
            const deltaX = snappedX - zone.startX;
            const deltaY = snappedY - zone.startY;

            zone.startX = snappedX;
            zone.startY = snappedY;

            // Move the platform with the start handle (keep it centered on start point)
            platform.x += deltaX;
            platform.y += deltaY;

            // Update original position to match
            platform.originalPosition.x = platform.x;
            platform.originalPosition.y = platform.y;
        } else if (this.draggingHandleType === 'end') {
            zone.endX = snappedX;
            zone.endY = snappedY;
        }

        // Recalculate angle
        const deltaX = zone.endX - zone.startX;
        const deltaY = zone.endY - zone.startY;
        zone.angle = Math.atan2(deltaY, deltaX);

        // Reset movement progress to start when zone is modified
        this.draggingHandlePlatform.movementProgress = 0;
        this.draggingHandlePlatform.movingDirection = 1;
    }

    finishMovementZoneHandleDrag() {
        if (this.draggingHandlePlatform) {
            console.log(`🔵 Finished dragging platform movement zone ${this.draggingHandleType} handle`);

            // Update UI to reflect changes
            this.updatePlatformProperties();
        }

        this.isDraggingMovementZoneHandle = false;
        this.draggingHandleType = null;
        this.draggingHandlePlatform = null;
    }

    // Movement control methods
    toggleMovementPause(platform) {
        if (!platform) {
            console.error('Cannot toggle movement pause: no platform provided');
            return;
        }

        platform.isMovementPaused = !platform.isMovementPaused;
        console.log(`🔵 Platform ${platform.id} movement ${platform.isMovementPaused ? 'paused' : 'resumed'}`);

        // Update button text
        this.updateMovementControlButtons(platform);
    }

    resetToOriginalPosition(platform) {
        if (!platform || !platform.originalPosition) {
            console.error('Cannot reset position: no platform or original position available');
            return;
        }

        platform.x = platform.originalPosition.x;
        platform.y = platform.originalPosition.y;
        platform.movementProgress = 0;
        platform.movingDirection = 1;
        platform.isMovementPaused = true; // Stop movement when resetting

        // Reset rotation to horizontal
        platform.rotation = 0;

        // Reset delay state
        platform.isDelaying = false;
        platform.delayTimer = 0;

        console.log(`🔵 Platform ${platform.id} reset to original position (${platform.x}, ${platform.y}), rotation, and stopped`);

        // Update UI
        this.updatePlatformProperties();
        this.updateMovementControlButtons(platform);
    }

    updateMovementControlButtons(platform) {
        const stopStartBtn = document.getElementById('stopStartPlatformMovement');
        if (stopStartBtn && platform) {
            stopStartBtn.textContent = platform.isMovementPaused ? 'Start Movement' : 'Stop Movement';
        }
    }
}