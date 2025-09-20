class PlatformMouseHandler {
    constructor(platformSystem, viewport, camera, canvas) {
        this.platformSystem = platformSystem;
        this.viewport = viewport;
        this.camera = camera;
        this.canvas = canvas;
    }

    handleMouseDown(e, propSystem, worldMouseX, worldMouseY) {
        // Handle platform placement mode
        if (this.platformSystem.platformPlacementMode) {
            this.platformSystem.manager.placePlatform(worldMouseX, worldMouseY);
            this.platformSystem.updatePlatformProperties();
            this.platformSystem.updatePlatformList();
            return true;
        }

        // Check for platform clicks
        for (let platform of this.platformSystem.platforms) {
            // Get actual position for mouse interaction
            const actualPos = this.platformSystem.data.getActualPosition(platform, this.viewport.designWidth, this.viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            const resizeHandle = this.platformSystem.getResizeHandle(renderPlatform, worldMouseX, worldMouseY);
            if (resizeHandle) {
                this.platformSystem.isResizing = true;
                this.platformSystem.resizeHandle = resizeHandle;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.updatePlatformProperties();
                return true;
            }

            if (this.platformSystem.isPointInPlatform(worldMouseX, worldMouseY, renderPlatform)) {
                this.platformSystem.isDragging = true;
                this.platformSystem.selectedPlatform = platform;
                this.platformSystem.dragOffset = {
                    x: worldMouseX - actualPos.x,
                    y: worldMouseY - actualPos.y
                };
                // Track initial position for movement direction detection
                this.platformSystem.initialDragPosition = {
                    x: platform.x,
                    y: platform.y
                };
                this.platformSystem.updatePlatformProperties();
                this.platformSystem.updatePlatformList();
                return true;
            }
        }

        // No platform was clicked
        this.platformSystem.selectedPlatform = null;
        this.platformSystem.updatePlatformProperties();
        this.platformSystem.updatePlatformList();
        return false;
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        if (!this.platformSystem.selectedPlatform) return false;

        if (this.platformSystem.isDragging) {
            // Calculate new position based on mouse (use world coordinates)
            const newX = worldMouseX - this.platformSystem.dragOffset.x;
            const newY = worldMouseY - this.platformSystem.dragOffset.y;

            // Apply snapping
            const snappedPos = this.snapPlatformPosition(this.platformSystem.selectedPlatform, newX, newY);

            // Apply boundary constraints - prevent platform from going outside scene bounds
            const platform = this.platformSystem.selectedPlatform;
            const leftEdge = 0;
            const bottomEdge = this.canvas.height;

            // Platform left edge should not go beyond scene left edge
            const minX = leftEdge;
            const constrainedX = Math.max(snappedPos.x, minX);

            // Platform bottom should align exactly with scene bottom
            const maxY = bottomEdge - platform.height;
            const constrainedY = Math.min(snappedPos.y, maxY);

            // Update both absolute and relative positions
            this.platformSystem.data.updateRelativePosition(
                this.platformSystem.selectedPlatform,
                constrainedX,
                constrainedY,
                this.viewport.designWidth,
                this.viewport.designHeight
            );

            this.platformSystem.updatePlatformProperties();

            return true;
        } else if (this.platformSystem.isResizing) {
            this.platformSystem.handlePlatformResize(worldMouseX, worldMouseY);
            this.platformSystem.updatePlatformProperties();
            return true;
        }

        return false;
    }

    handleMouseUp() {
        this.platformSystem.isDragging = false;
        this.platformSystem.isResizing = false;
        this.platformSystem.resizeHandle = null;
        this.platformSystem.initialDragPosition = null; // Clear movement tracking
    }

    snapPlatformPosition(platform, newX, newY) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;

        // Check against all other platforms
        for (const otherPlatform of this.platformSystem.platforms) {
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

    snapResizePosition(platform, newX, newY, newWidth, newHeight, resizeHandle) {
        const snapDistance = 10; // Pixels within which to snap
        let snappedX = newX;
        let snappedY = newY;
        let snappedWidth = newWidth;
        let snappedHeight = newHeight;

        // Check against all other platforms
        for (const otherPlatform of this.platformSystem.platforms) {
            if (otherPlatform.id === platform.id) continue; // Skip self

            // Snap based on resize handle type
            switch (resizeHandle) {
                case 'w': // Left edge resize
                    // Snap left edge to right edge of other platform
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Snap left edge to left edge of other platform
                    else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    break;

                case 'e': // Right edge resize
                    // Snap right edge to left edge of other platform
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    }
                    // Snap right edge to right edge of other platform
                    else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = otherPlatform.x + otherPlatform.width - newX;
                    }
                    break;

                case 'n': // Top edge resize
                    // Snap top edge to bottom edge of other platform
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    // Snap top edge to top edge of other platform
                    else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 's': // Bottom edge resize
                    // Snap bottom edge to top edge of other platform
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    }
                    // Snap bottom edge to bottom edge of other platform
                    else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = otherPlatform.y + otherPlatform.height - newY;
                    }
                    break;

                // Corner resizes combine edge snapping logic
                case 'nw': // Top-left
                    // Left edge
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Top edge
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 'ne': // Top-right
                    // Right edge
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    }
                    else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = otherPlatform.x + otherPlatform.width - newX;
                    }
                    // Top edge
                    if (Math.abs(newY - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedY = otherPlatform.y + otherPlatform.height;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    else if (Math.abs(newY - otherPlatform.y) <= snapDistance) {
                        snappedY = otherPlatform.y;
                        snappedHeight = platform.y + platform.height - snappedY;
                    }
                    break;

                case 'sw': // Bottom-left
                    // Left edge
                    if (Math.abs(newX - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedX = otherPlatform.x + otherPlatform.width;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    else if (Math.abs(newX - otherPlatform.x) <= snapDistance) {
                        snappedX = otherPlatform.x;
                        snappedWidth = platform.x + platform.width - snappedX;
                    }
                    // Bottom edge
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    }
                    else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = otherPlatform.y + otherPlatform.height - newY;
                    }
                    break;

                case 'se': // Bottom-right
                    // Right edge
                    if (Math.abs((newX + newWidth) - otherPlatform.x) <= snapDistance) {
                        snappedWidth = otherPlatform.x - newX;
                    }
                    else if (Math.abs((newX + newWidth) - (otherPlatform.x + otherPlatform.width)) <= snapDistance) {
                        snappedWidth = otherPlatform.x + otherPlatform.width - newX;
                    }
                    // Bottom edge
                    if (Math.abs((newY + newHeight) - otherPlatform.y) <= snapDistance) {
                        snappedHeight = otherPlatform.y - newY;
                    }
                    else if (Math.abs((newY + newHeight) - (otherPlatform.y + otherPlatform.height)) <= snapDistance) {
                        snappedHeight = otherPlatform.y + otherPlatform.height - newY;
                    }
                    break;
            }
        }

        return { x: snappedX, y: snappedY, width: snappedWidth, height: snappedHeight };
    }
}