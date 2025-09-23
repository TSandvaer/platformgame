class InputMouse {
    constructor(game) {
        this.game = game;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragScrolling = false;
        this.dragScrollStartX = 0;
        this.dragScrollStartY = 0;
        this.dragScrollCameraStartX = 0;
        this.dragScrollCameraStartY = 0;

        this.setupMouseListeners();
    }

    setupMouseListeners() {
        // Canvas mouse events
        this.game.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.game.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        this.game.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.game.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());
        this.game.canvas.addEventListener('wheel', (e) => this.handleCanvasWheel(e));
        this.game.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Window-level mouse events for drag operations
        window.addEventListener('mousemove', (e) => this.handleWindowMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleWindowMouseUp(e));
    }

    handleCanvasMouseDown(e) {
        if (!this.game.isDevelopmentMode) return;

        // Hide context menu on any click (left click)
        if (e.button === 0) {
            this.game.hideContextMenu();
        }

        const rect = this.game.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;

        // Convert to world coordinates
        const worldCoords = this.game.cameraSystem.screenToWorld(clientMouseX, clientMouseY);
        const mouseX = worldCoords.x;
        const mouseY = worldCoords.y;

        // Handle right click or middle click for drag scrolling
        if (e.button === 2 || e.button === 1) {
            e.preventDefault();
            this.startDragScrolling(e);
            return;
        }

        // Handle transition zone creation
        if (this.game.sceneSystem.isAddingTransition) {
            this.game.sceneSystem.setTransitionStart(mouseX, mouseY);
            return;
        }

        // Handle platform addition
        if (this.game.isAddingPlatform) {
            this.handlePlatformCreation(mouseX, mouseY);
            return;
        }

        // Check if clicking on player start position handle
        if (this.checkPlayerStartHandle(mouseX, mouseY)) {
            this.game.isDraggingStartPosition = true;
            return;
        }

        // Handle platform interaction
        const platformResult = this.game.platformSystem.handleMouseDown(
            mouseX, mouseY, this.game.cameraSystem.camera, this.game.viewport
        );

        if (!platformResult.handled) {
            // Handle prop interaction
            this.game.propSystem.handleMouseDown(
                mouseX, mouseY,
                this.game.platformSystem,
                e.ctrlKey || e.metaKey,
                e.shiftKey,
                this.game.viewport,
                this.game.cameraSystem.camera
            );
        }
    }

    handleCanvasMouseUp(e) {
        if (!this.game.isDevelopmentMode) return;

        // Handle transition zone creation completion
        if (this.game.sceneSystem.isAddingTransition && this.game.sceneSystem.transitionStart) {
            this.completeTransitionZone(e);
            return;
        }

        // Handle platform operations
        this.game.platformSystem.handleMouseUp(e);

        // Handle prop operations
        this.game.propSystem.handleMouseUp(e.ctrlKey || e.metaKey, this.game.viewport);

        // Stop dragging player start position
        this.game.isDraggingStartPosition = false;

        // Stop drag scrolling
        this.stopDragScrolling();
    }

    handleCanvasMouseMove(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;

        // Handle drag scrolling
        if (this.dragScrolling) {
            this.updateDragScrolling(e);
            return;
        }

        // Handle free camera scrolling in development mode
        if (this.game.isDevelopmentMode) {
            this.game.handleFreeCameraScroll(clientMouseX, clientMouseY);
        }

        if (!this.game.isDevelopmentMode) return;

        // Convert to world coordinates
        const worldCoords = this.game.cameraSystem.screenToWorld(clientMouseX, clientMouseY);
        const mouseX = worldCoords.x;
        const mouseY = worldCoords.y;

        // Update transition zone preview
        if (this.game.sceneSystem.isAddingTransition && this.game.sceneSystem.transitionStart) {
            this.game.sceneSystem.setTransitionEnd(mouseX, mouseY);
        }

        // Update player start position dragging
        if (this.game.isDraggingStartPosition) {
            const currentScene = this.game.sceneSystem.currentScene;
            if (currentScene) {
                currentScene.settings.playerStartX = Math.round(mouseX);
                currentScene.settings.playerStartY = Math.round(mouseY);
            }
        }

        // Handle platform dragging/resizing
        this.game.platformSystem.handleMouseMove(mouseX, mouseY, this.game.viewport);

        // Handle prop dragging
        this.game.propSystem.handleMouseMove(mouseX, mouseY, this.game.viewport, this.game.cameraSystem.camera);

        // Update cursor based on what we're hovering over
        this.updateCursor(mouseX, mouseY);

        // Update coordinates display
        const coordsElement = document.getElementById('coordinates');
        if (coordsElement) {
            coordsElement.textContent = `X: ${Math.round(mouseX)}, Y: ${Math.round(mouseY)}`;
        }

        // Store last mouse position
        this.lastMouseX = clientMouseX;
        this.lastMouseY = clientMouseY;
    }

    handleCanvasMouseLeave() {
        // Stop drag scrolling
        this.stopDragScrolling();

        // Stop free camera scrolling
        if (this.game.stopFreeCameraScroll) {
            this.game.stopFreeCameraScroll();
        }
    }

    handleCanvasWheel(e) {
        if (!this.game.isDevelopmentMode) return;

        // Zoom functionality could be added here
        e.preventDefault();
    }

    handleContextMenu(e) {
        if (this.game.isDevelopmentMode) {
            e.preventDefault(); // Prevent browser context menu in development mode
            this.game.showContextMenu(e); // Show custom context menu
        }
    }

    handleWindowMouseMove(e) {
        if (!this.game.isDevelopmentMode) return;

        // Handle operations that need to continue outside canvas
        if (this.game.platformSystem.isDragging ||
            this.game.platformSystem.isResizing ||
            this.game.propSystem.isDraggingProp) {
            this.handleCanvasMouseMove(e);
        }
    }

    handleWindowMouseUp(e) {
        if (!this.game.isDevelopmentMode) return;

        // Handle operations that need to end outside canvas
        if (this.game.platformSystem.isDragging ||
            this.game.platformSystem.isResizing ||
            this.game.propSystem.isDraggingProp) {
            this.handleCanvasMouseUp(e);
        }
    }

    startDragScrolling(e) {
        this.dragScrolling = true;
        this.dragScrollStartX = e.clientX;
        this.dragScrollStartY = e.clientY;
        this.dragScrollCameraStartX = this.game.cameraSystem.x;
        this.dragScrollCameraStartY = this.game.cameraSystem.y;
        this.game.canvas.style.cursor = 'grabbing';
    }

    updateDragScrolling(e) {
        if (!this.dragScrolling) return;

        const deltaX = e.clientX - this.dragScrollStartX;
        const deltaY = e.clientY - this.dragScrollStartY;

        // Move camera in opposite direction of mouse drag
        this.game.cameraSystem.x = this.dragScrollCameraStartX - deltaX;
        this.game.cameraSystem.y = this.dragScrollCameraStartY - deltaY;

        // Apply camera bounds if in character mode
        if (this.game.cameraSystem.mode === 'character') {
            const sceneBounds = this.game.sceneSystem.getSceneBoundaries();
            if (sceneBounds) {
                this.game.cameraSystem.constrainToBounds(sceneBounds);
            }
        }
    }

    stopDragScrolling() {
        if (this.dragScrolling) {
            this.dragScrolling = false;
            this.game.canvas.style.cursor = 'default';
        }
    }

    handlePlatformCreation(mouseX, mouseY) {
        const platform = {
            x: Math.round(mouseX / 10) * 10,
            y: Math.round(mouseY / 10) * 10,
            width: 100,
            height: 20,
            type: 'ground',
            theme: 'grass'
        };

        this.game.platformSystem.addPlatform(platform);
        this.game.isAddingPlatform = false;
        document.getElementById('addPlatform').textContent = 'Add Platform (Click on map)';
    }

    completeTransitionZone(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;

        const worldCoords = this.game.cameraSystem.screenToWorld(clientMouseX, clientMouseY);
        this.game.sceneSystem.setTransitionEnd(worldCoords.x, worldCoords.y);

        // Complete the transition creation
        this.game.sceneSystem.finishTransitionCreation();
    }

    checkPlayerStartHandle(mouseX, mouseY) {
        const currentScene = this.game.sceneSystem.currentScene;
        if (!currentScene) return false;

        const startX = currentScene.settings.playerStartX;
        const startY = currentScene.settings.playerStartY;
        const handleSize = 20;

        return mouseX >= startX - handleSize/2 &&
               mouseX <= startX + handleSize/2 &&
               mouseY >= startY - handleSize/2 &&
               mouseY <= startY + handleSize/2;
    }

    updateCursor(mouseX, mouseY) {
        // Check if hovering over resize handles for selected platform
        if (this.game.platformSystem.selectedPlatform) {
            // Get actual position based on positioning mode
            const platform = this.game.platformSystem.selectedPlatform;
            const actualPos = this.game.platformSystem.data.getActualPosition(
                platform,
                this.game.viewport.designWidth,
                this.game.viewport.designHeight
            );
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            const resizeHandle = this.game.platformSystem.getResizeHandle(
                renderPlatform, mouseX, mouseY
            );
            if (resizeHandle) {
                const cursors = {
                    'top-left': 'nw-resize',
                    'top-right': 'ne-resize',
                    'bottom-left': 'sw-resize',
                    'bottom-right': 'se-resize',
                    'left': 'w-resize',
                    'right': 'e-resize',
                    'top': 'n-resize',
                    'bottom': 's-resize'
                };
                this.game.canvas.style.cursor = cursors[resizeHandle] || 'default';
                return;
            }
        }

        // Check other cursor states
        if (this.checkPlayerStartHandle(mouseX, mouseY)) {
            this.game.canvas.style.cursor = 'move';
        } else if (this.game.platformSystem.platforms.some(p => {
                   // Get actual position for hover detection
                   const actualPos = this.game.platformSystem.data.getActualPosition(
                       p, this.game.viewport.designWidth, this.game.viewport.designHeight
                   );
                   const renderPlatform = { ...p, x: actualPos.x, y: actualPos.y };
                   return this.game.platformSystem.isPointInPlatform(mouseX, mouseY, renderPlatform);
               }) ||
                   this.game.propSystem.props.some(prop =>
                   this.game.propSystem.data.isPointInProp(mouseX, mouseY, prop))) {
            this.game.canvas.style.cursor = 'pointer';
        } else {
            this.game.canvas.style.cursor = 'default';
        }
    }

    getMousePosition() {
        return {
            x: this.lastMouseX,
            y: this.lastMouseY
        };
    }
}