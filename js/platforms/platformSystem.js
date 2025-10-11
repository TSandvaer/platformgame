class PlatformSystem {
    constructor(ctx, onSpritesLoadedCallback) {
        this.data = new PlatformData();
        this.renderer = new PlatformRenderer(ctx, onSpritesLoadedCallback);
        this.collisions = new PlatformCollisions();
        this.manager = new PlatformManager(this.data);
        this.game = null; // Will be set by Game after construction
    }

    // Data access methods
    get platforms() {
        return this.data.platforms;
    }

    set platforms(value) {
        this.data.platforms = value;
    }

    get selectedPlatform() {
        return this.data.selectedPlatform;
    }

    set selectedPlatform(value) {
        this.data.selectedPlatform = value;
    }

    get platformPlacementMode() {
        return this.data.platformPlacementMode;
    }

    set platformPlacementMode(value) {
        this.data.platformPlacementMode = value;
    }

    get nextPlatformId() {
        return this.data.nextPlatformId;
    }

    set nextPlatformId(value) {
        this.data.nextPlatformId = value;
    }

    // Rendering
    renderPlatforms(isDevelopmentMode, viewport) {
        if (this.data.platforms.length === 0) {
            // Reduce console spam - only warn occasionally
            if (!this._lastNoplatformsWarning || Date.now() - this._lastNoplatformsWarning > 5000) {
                console.warn('⚠️ No platforms to render in platformSystem!');
                this._lastNoplatformsWarning = Date.now();
            }
        }

        // Sort platforms by z-order before rendering (lowest first = background)
        const sortedPlatforms = [...this.data.platforms].sort((a, b) => (a.zOrder || 0) - (b.zOrder || 0));

        sortedPlatforms.forEach(platform => {
            const isSelected = this.data.selectedPlatform && this.data.selectedPlatform.id === platform.id;

            // Get actual position based on positioning mode
            const actualPos = this.data.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            this.renderer.renderPlatform(renderPlatform, isDevelopmentMode, isSelected);

            // Render movement zone in development mode for selected platform
            if (isDevelopmentMode && isSelected && platform.movementZone && platform.movementZone.enabled && this.hasValidMovementZone(platform.movementZone)) {
                this.renderMovementZone(platform, viewport);
            }
        });
    }

    // Render movement zone for a platform
    renderMovementZone(platform, viewport) {
        const ctx = this.renderer.ctx;
        if (!ctx) return;

        ctx.save();

        const { startX, startY, endX, endY } = platform.movementZone;

        // Use world coordinates directly - camera transformation is applied by the caller
        const renderStartX = startX;
        const renderStartY = startY;
        const renderEndX = endX;
        const renderEndY = endY;

        // Draw movement zone line (cyan like enemy movement zones)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(renderStartX, renderStartY);
        ctx.lineTo(renderEndX, renderEndY);
        ctx.stroke();

        // Draw zone markers (drag handles)
        ctx.fillStyle = 'cyan';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        // Start handle
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // End handle
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw inner dots to indicate drag handles
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(renderStartX, renderStartY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(renderEndX, renderEndY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw zone label
        ctx.fillStyle = 'cyan';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.font = `${10 * (viewport ? viewport.scaleX : 1)}px Arial`;
        ctx.textAlign = 'center';
        const labelX = (renderStartX + renderEndX) / 2;
        const labelY = (renderStartY + renderEndY) / 2 - 8;
        ctx.strokeText('movement zone', labelX, labelY);
        ctx.fillText('movement zone', labelX, labelY);

        ctx.restore();
    }

    // Collision detection
    checkPlayerPlatformCollisions(player, viewport) {
        // Convert platforms to actual positions for collision detection
        const actualPlatforms = this.data.platforms.map(platform => {
            const actualPos = this.data.getActualPosition(platform, viewport.designWidth, viewport.designHeight);
            return { ...platform, x: actualPos.x, y: actualPos.y };
        });
        this.collisions.checkPlayerPlatformCollisions(player, actualPlatforms);
    }

    checkCollision(rect1, rect2) {
        return this.collisions.checkCollision(rect1, rect2);
    }

    // Platform management
    addPlatform(x, y) {
        return this.data.addPlatform(x, y);
    }

    deleteSelectedPlatform() {
        this.data.deleteSelectedPlatform();
        this.manager.updatePlatformProperties();
        this.manager.updatePlatformList();
    }

    togglePlatformPlacement() {
        this.manager.togglePlatformPlacement();
    }

    // Mouse event handling
    handleMouseDown(mouseX, mouseY, camera, viewport, allowBackgroundPlatforms = false) {
        const result = this.manager.handleMouseDown(mouseX, mouseY, camera, viewport, allowBackgroundPlatforms);
        if (result.handled) {
            this.manager.updatePlatformProperties();
            this.manager.updatePlatformList();
        }
        return result;
    }

    handleMouseMove(mouseX, mouseY, viewport, shiftKey = false) {
        const moved = this.manager.handleMouseMove(mouseX, mouseY, viewport, shiftKey);
        if (moved) {
            this.manager.updatePlatformProperties();
        }
        return moved;
    }

    handleMouseUp() {
        this.manager.handleMouseUp();
    }

    // UI updates
    updatePlatformList() {
        const currentScene = this.game?.sceneSystem?.currentScene;
        const scenePlatforms = currentScene ? currentScene.platforms : [];
        this.manager.updatePlatformList(scenePlatforms, currentScene?.name);
    }

    updatePlatformProperties() {
        this.manager.updatePlatformProperties();
    }

    updateSelectedPlatform() {
        this.manager.updateSelectedPlatform();
    }

    // Selection methods
    clearSelection() {
        this.data.clearSelection();
    }

    // Utility methods
    isPointInPlatform(x, y, platform) {
        return this.data.isPointInPlatform(x, y, platform);
    }

    getResizeHandle(platform, mouseX, mouseY) {
        return this.manager.getResizeHandle(platform, mouseX, mouseY);
    }

    snapPlatformPosition(platform, newX, newY) {
        return this.manager.snapPlatformPosition(platform, newX, newY);
    }

    handlePlatformResize(mouseX, mouseY) {
        this.manager.handlePlatformResize(mouseX, mouseY);
    }

    // State management
    get isDragging() {
        return this.data.isDragging || this.manager.isDraggingMovementZoneHandle;
    }

    set isDragging(value) {
        this.data.isDragging = value;
    }

    get isResizing() {
        return this.data.isResizing;
    }

    set isResizing(value) {
        this.data.isResizing = value;
    }

    get dragOffset() {
        return this.data.dragOffset;
    }

    set dragOffset(value) {
        this.data.dragOffset = value;
    }

    get resizeHandle() {
        return this.data.resizeHandle;
    }

    set resizeHandle(value) {
        this.data.resizeHandle = value;
    }

    get resizeStartState() {
        return this.data.resizeStartState;
    }

    set resizeStartState(value) {
        this.data.resizeStartState = value;
    }

    // Update moving platforms
    updateMovement(deltaTime) {
        this.data.platforms.forEach(platform => {
            // Store previous position to calculate velocity
            const previousX = platform.x;
            const previousY = platform.y;

            if (platform.isMoving && !platform.isMovementPaused) {
                // Handle delay at movement zone ends
                if (platform.isDelaying) {
                    platform.delayTimer -= deltaTime;
                    if (platform.delayTimer <= 0) {
                        platform.isDelaying = false;
                        platform.delayTimer = 0;
                    } else {
                        // Platform is delaying, skip movement
                        platform.velocityX = 0;
                        platform.velocityY = 0;
                        return;
                    }
                }

                // Get movement speed in pixels per second
                const moveSpeed = platform.moveSpeed || 2;
                const pixelsPerMs = moveSpeed / 16.67; // Convert to pixels per 16.67ms (60fps)
                let movement = pixelsPerMs * deltaTime;

                if (platform.movementZone && platform.movementZone.enabled && this.hasValidMovementZone(platform.movementZone)) {
                    // Move along the defined line
                    const { startX, startY, endX, endY } = platform.movementZone;

                    // Calculate line length and direction
                    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
                    if (lineLength === 0) return; // Avoid division by zero

                    // Apply easing if enabled - only when approaching an endpoint, not leaving
                    if (platform.useEasing) {
                        const easingDistance = platform.easingDistance || 0.2;
                        const distanceFromStart = platform.movementProgress;
                        const distanceFromEnd = 1 - platform.movementProgress;

                        // Calculate easing multiplier (0-1) based on distance from ends
                        let easingMultiplier = 1.0;

                        // Only ease when approaching the target endpoint
                        if (platform.movingDirection === 1 && distanceFromEnd < easingDistance) {
                            // Moving forward, approaching end - ease out
                            easingMultiplier = distanceFromEnd / easingDistance;
                        } else if (platform.movingDirection === -1 && distanceFromStart < easingDistance) {
                            // Moving backward, approaching start - ease out
                            easingMultiplier = distanceFromStart / easingDistance;
                        }

                        // Apply smoothstep function for smoother easing
                        if (easingMultiplier < 1.0) {
                            easingMultiplier = easingMultiplier * easingMultiplier * (3 - 2 * easingMultiplier);

                            // Clamp minimum movement to prevent getting stuck near boundaries
                            const minMultiplier = platform.easingMinSpeed || 0.2;
                            easingMultiplier = Math.max(easingMultiplier, minMultiplier);
                        }

                        movement *= easingMultiplier;
                    }

                    // Update movement progress along the line
                    const progressDelta = movement / lineLength;
                    platform.movementProgress += progressDelta * platform.movingDirection;

                    // Check boundaries and reverse direction if needed
                    if (platform.movementProgress >= 1) {
                        platform.movementProgress = 1;
                        platform.movingDirection = -1;
                        // Start delay if configured
                        if (platform.endDelay > 0) {
                            platform.isDelaying = true;
                            platform.delayTimer = platform.endDelay;
                        }
                    } else if (platform.movementProgress <= 0) {
                        platform.movementProgress = 0;
                        platform.movingDirection = 1;
                        // Start delay if configured
                        if (platform.endDelay > 0) {
                            platform.isDelaying = true;
                            platform.delayTimer = platform.endDelay;
                        }
                    }

                    // Calculate center position based on progress along the line
                    const centerX = startX + (endX - startX) * platform.movementProgress;
                    const centerY = startY + (endY - startY) * platform.movementProgress;

                    // Set platform position so its center follows the line
                    platform.x = centerX - platform.width / 2;
                    platform.y = centerY - platform.height / 2;
                }
                // No fallback movement - platforms only move with valid drawn movement zones
            }

            // Calculate and store platform velocity for this frame
            platform.velocityX = platform.x - previousX;
            platform.velocityY = platform.y - previousY;
        });

        // Update spinning platforms
        this.updateSpinning(deltaTime);
    }

    // Update spinning platforms
    updateSpinning(deltaTime) {
        this.data.platforms.forEach(platform => {
            if (platform.isSpinning) {
                // Calculate rotation change based on spin speed and deltaTime
                // spinSpeed is in rotations per second, convert to radians per millisecond
                const rotationsPerSecond = platform.spinSpeed || 1.0;
                const radiansPerSecond = rotationsPerSecond * 2 * Math.PI;
                const radiansPerMs = radiansPerSecond / 1000;
                const rotationDelta = radiansPerMs * deltaTime;

                // Apply rotation in the correct direction
                if (platform.spinClockwise) {
                    platform.rotation += rotationDelta;
                } else {
                    platform.rotation -= rotationDelta;
                }

                // Keep rotation in the range [0, 2*PI] to avoid overflow
                platform.rotation = platform.rotation % (2 * Math.PI);
                if (platform.rotation < 0) {
                    platform.rotation += 2 * Math.PI;
                }
            }
        });
    }

    // Check if a movement zone has valid coordinates (not all zeros and has actual length)
    hasValidMovementZone(movementZone) {
        if (!movementZone) return false;

        const { startX, startY, endX, endY } = movementZone;

        // Check if the line has any length
        // Return false if all coordinates are zero OR if start and end points are the same
        const hasLength = Math.abs(endX - startX) > 0.1 || Math.abs(endY - startY) > 0.1;
        const notAllZeros = !(startX === 0 && startY === 0 && endX === 0 && endY === 0);

        return hasLength && notAllZeros;
    }

    // Z-order management
    movePlatformToFront() {
        this.manager.movePlatformToFront();
    }

    movePlatformToBack() {
        this.manager.movePlatformToBack();
    }
}