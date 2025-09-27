class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found! Make sure gameCanvas exists in the DOM.');
            throw new Error('Canvas element not found');
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context from canvas!');
            throw new Error('Could not get 2D context');
        }

        // Make canvas focusable for key events
        this.canvas.tabIndex = 0;
        // Editor system will be initialized after other systems
        this.editorSystem = null;
        this.showDashboard = true;

        // Use viewport height for consistent sizing across browsers
        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;

        // Delta time tracking for frame-rate independent animations
        this.lastTime = 0;
        this.deltaTime = 0;

        // Initialize player system
        this.playerSystem = new PlayerSystem();
        this.playerSystem.init();

        // Keep player reference for backwards compatibility during transition
        this.player = this.playerSystem.data;
        this.spritesLoaded = this.playerSystem.isReady();

        // Sprite loading coordination
        this.spritesLoaded = {
            platforms: false,
            props: false
        };
        this.allSpritesLoaded = false;

        // Initialize background system
        this.backgroundSystem = new BackgroundSystem(this);

        this.gravity = 0.8;
        this.friction = 0.8;

        // Initialize platform system
        this.platformSystem = new PlatformSystem(this.ctx, () => {
            this.spritesLoaded.platforms = true;
            this.checkAllSpritesLoaded();
        });
        this.platformSystem.game = this; // Set game reference

        // Initialize prop system
        this.torchParticles = [];
        this.propSystem = new PropSystem(this.ctx, this.platformSystem.renderer.platformSprites, this.torchParticles, () => {
            this.spritesLoaded.props = true;
            this.checkAllSpritesLoaded();
        });

        // Initialize enemy system (mouse handler will be initialized later)
        this.enemySystem = new EnemySystem();

        // Initialize scene system
        this.sceneSystem = new SceneSystem(this);

        // Scene interaction state
        this.isDraggingStartPosition = false;
        this.startPositionDragOffset = { x: 0, y: 0 };

        // Initialize mouse handlers (will be set after viewport and camera are ready)

        // Mouse position tracking
        this.lastMousePosition = { x: 0, y: 0 };

        // Initialize camera system
        this.cameraSystem = new CameraSystem(this);

        // Initialize free camera system
        this.freeCameraSystem = new FreeCameraSystem(this);

        // Keep prop types reference for backward compatibility
        this.propTypes = this.propSystem.propTypes;

        // Initialize viewport system
        this.viewportSystem = new ViewportSystem(this);

        // Keep viewport reference for backward compatibility
        this.viewport = this.viewportSystem.getViewport();

        // Initialize input system
        this.inputSystem = new InputSystem(this);

        // Initialize Editor System
        this.editorSystem = new EditorSystem(this);
        this.editorSystem.initialize();

        // Initialize Game Data System
        this.gameDataSystem = new GameDataSystem(this);
        this.gameDataSystem.initialize();

        // Add development helper methods to window for testing
        if (this.isDevelopmentMode) {
            window.addTestEnemy = (x, y, type = 'orc') => {
                // If no position specified, place on the first platform
                if (x === undefined || y === undefined) {
                    if (this.platformSystem.platforms.length > 0) {
                        const platform = this.platformSystem.platforms[0];
                        x = platform.x + 100; // 100 pixels from left edge
                        y = platform.y - 59; // Just above the platform (enemy height is 59)
                        console.log(`Placing enemy on platform at (${x}, ${y}) - platform top is ${platform.y}`);
                    } else {
                        x = 200;
                        y = 200;
                        console.log('No platforms found, using default position');
                    }
                }

                console.log('Platform count:', this.platformSystem.platforms.length);
                console.log('Platforms:', this.platformSystem.platforms.map(p => ({x: p.x, y: p.y, w: p.width, h: p.height})));
                const enemy = this.enemySystem.addEnemyToScene(x, y, type);
                console.log('Added test enemy:', enemy);
                console.log('Enemy bottom will be at:', enemy.y + enemy.height, 'platform top is:', this.platformSystem.platforms[0]?.y);
                return enemy;
            };
            window.clearEnemies = () => {
                this.enemySystem.clearAllEnemies();
                console.log('Cleared all enemies');
            };
            window.getEnemyStats = () => {
                const stats = this.enemySystem.getEnemyStats();
                console.log('Enemy stats:', stats);
                return stats;
            };
            window.movePlayerToEnemies = () => {
                const enemies = this.enemySystem.data.enemies;
                if (enemies.length > 0) {
                    const enemy = enemies[0];
                    this.playerSystem.data.x = enemy.x - 100;
                    this.playerSystem.data.y = enemy.y;
                    console.log(`Moved player near enemy at (${this.playerSystem.data.x}, ${this.playerSystem.data.y})`);
                } else {
                    console.log('No enemies to move to');
                }
            };
            window.getEnemyPositions = () => {
                const enemies = this.enemySystem.data.enemies.map(e => ({
                    id: e.id,
                    x: e.x,
                    y: e.y,
                    bottom: e.y + e.height,
                    isDead: e.isDead,
                    currentAnimation: e.currentAnimation
                }));
                console.log('Enemy positions:', enemies);
                return enemies;
            };
            window.checkPositions = () => {
                console.log('Player position:', this.playerSystem.data.x, this.playerSystem.data.y);
                console.log('Camera position:', this.cameraSystem.camera.x, this.cameraSystem.camera.y);
                console.log('Canvas size:', this.canvas.width, this.canvas.height);
                console.log('Viewport:', this.viewport);

                const enemies = this.enemySystem.data.enemies;
                if (enemies.length > 0) {
                    const enemy = enemies[0];
                    console.log('First enemy at:', enemy.x, enemy.y, 'to', enemy.x + enemy.width, enemy.y + enemy.height);
                }
            };
            window.addEnemyOnPlatform = (x = 1000) => {
                // Find the platform that contains this x coordinate
                let bestPlatform = null;
                for (const platform of this.platformSystem.platforms) {
                    if (x >= platform.x && x <= platform.x + platform.width) {
                        bestPlatform = platform;
                        break;
                    }
                }

                if (!bestPlatform && this.platformSystem.platforms.length > 0) {
                    // If no platform found at exact x, use the closest one
                    bestPlatform = this.platformSystem.platforms[0];
                    x = bestPlatform.x + 100;
                }

                if (bestPlatform) {
                    // Spawn enemy HIGH ABOVE the platform so it falls down and lands properly
                    const y = bestPlatform.y - 200; // Spawn 200 pixels above platform
                    console.log(`Platform top at: ${bestPlatform.y}`);
                    console.log(`Spawning enemy 200px above platform at: ${y} (will fall down)`);

                    const enemy = this.enemySystem.addEnemyToScene(x, y, 'orc');

                    // Let enemy fall naturally - DO NOT force grounded
                    if (enemy) {
                        enemy.onGround = false; // Allow falling
                        enemy.velocityY = 0; // Start with no velocity

                        // Enable attraction zone so enemy will chase player
                        enemy.attractionZone.enabled = true;

                        console.log(`Enemy spawned at: ${enemy.y}, will fall to platform at: ${bestPlatform.y}`);
                    }
                    return enemy;
                } else {
                    console.log('No platforms found');
                    return null;
                }
            };
        }

        // Initialize UI Event Handler
        this.uiEventHandler = new UIEventHandler(this);
        window.uiEventHandler = this.uiEventHandler; // Make globally accessible

        // Initialize feedback system
        this.feedbackSystem = new FeedbackSystem(this);

        // Initialize development input handler
        this.developmentInputHandler = new DevelopmentInputHandler(this);

        // Initialize HUD system
        this.hudSystem = new HUDSystem(this);

        // Keep keys reference for backwards compatibility
        this.keys = this.inputSystem.keys;

        // Game data is now handled by gameDataSystem

        this.init();
    }

    checkAllSpritesLoaded() {
        if (this.spritesLoaded.platforms && this.spritesLoaded.props) {
            this.allSpritesLoaded = true;
            this.onAllSpritesLoaded();
        }
    }

    onAllSpritesLoaded() {
        // Check if we have pending gameData.json import
        if (this.pendingGameDataImport) {
            // Initialize scene system with imported data
            this.sceneSystem.data.importSceneData(this.pendingGameDataImport);
            this.sceneSystem.initialize();

            // Save the imported data to localStorage
            this.sceneSystem.saveScenes();

            this.pendingGameDataImport = null; // Clear pending data
        } else {
            // Initialize scene system normally
            this.sceneSystem.initialize();
        }

        // Position player at the current scene's start position
        this.positionPlayerAtSceneStart();

        // Initialize camera system with canvas and viewport
        this.cameraSystem.init(this.canvas, this.viewport);

        // Initialize enemy system now that viewport and camera are ready
        this.enemySystem.initialize(this.ctx, this.platformSystem, this.viewport, this.cameraSystem.camera);

        // Reload enemies from current scene now that enemy system is ready
        const currentScene = this.sceneSystem.currentScene;
        console.log('🎯 DEBUG: currentScene:', currentScene);
        console.log('🎯 DEBUG: currentScene.enemies:', currentScene?.enemies);
        console.log('🎯 DEBUG: currentScene.enemies.length:', currentScene?.enemies?.length);

        if (currentScene && currentScene.enemies && currentScene.enemies.length > 0) {
            console.log('🎯 Reloading', currentScene.enemies.length, 'enemies from scene after enemy system initialization');
            this.enemySystem.data.enemies = [...currentScene.enemies];
            this.enemySystem.animators.clear(); // Clear animators, they'll be recreated

            // Revive all enemies on reload
            this.reviveAllEnemies();

            // Update enemy UI to reflect loaded enemies
            if (window.uiEventHandler) {
                window.uiEventHandler.updateEnemyList();
                window.uiEventHandler.updateEnemyProperties();
            }
        } else {
            console.log('🎯 DEBUG: Not reloading enemies - condition failed');
            console.log('🎯 DEBUG: currentScene exists:', !!currentScene);
            console.log('🎯 DEBUG: currentScene.enemies exists:', !!(currentScene?.enemies));
            console.log('🎯 DEBUG: currentScene.enemies.length > 0:', !!(currentScene?.enemies?.length > 0));
        }

        // Then set development mode (which will call sceneSystem.updateUI())

        // Update platform UI after everything is loaded
        this.platformSystem.updatePlatformList();
        this.platformSystem.updatePlatformProperties();
    }


    applyViewportSettings() {
        this.viewportSystem.applySettings();
    }

    resetViewportSettings() {
        this.viewportSystem.resetSettings();
    }

    updateViewportUI() {
        this.viewportSystem.updateUI();
    }


    init() {
        // Setup UI button listeners
        this.uiEventHandler.initialize();

        // Input system sets up all game input event listeners
        this.backgroundSystem.populateDropdown();
        this.viewportSystem.updateViewport(); // Ensure viewport is properly initialized
        this.viewportSystem.updateUI(); // Initialize viewport UI

        // Scene system initialization is now handled by onPlatformSpritesLoaded()
        // after platform sprites are loaded

        this.gameLoop();
        this.updateUI();

        // Game data will be loaded after scene system is initialized in checkAllSpritesLoaded()
    }



    showFeedbackMessage(message, worldX = null, worldY = null) {
        this.feedbackSystem.showMessage(message, worldX, worldY);
    }


    setDevelopmentMode(isDev) {
        // Delegate to editor system
        this.editorSystem.setDevelopmentMode(isDev);
    }

    // Getter for backward compatibility
    get isDevelopmentMode() {
        return this.editorSystem ? this.editorSystem.isDevelopmentMode : true;
    }

    toggleDashboard() {
        // Delegate to editor system
        this.editorSystem.toggleDashboard();
    }

    // Getters for backward compatibility
    get showDashboard() {
        return this.editorSystem ? this.editorSystem.showDashboard : true;
    }

    set showDashboard(value) {
        if (this.editorSystem) {
            this.editorSystem.showDashboard = value;
        }
    }

    // Background system backward compatibility
    loadBackground(backgroundName) {
        this.backgroundSystem.loadBackground(backgroundName);
    }

    get currentBackground() {
        return this.backgroundSystem.getCurrentBackground();
    }

    get availableBackgrounds() {
        return this.backgroundSystem.getAvailableBackgrounds();
    }

    handleInput() {
        // Delegate to input system
        this.inputSystem.updatePlayerInput();
    }

    updatePhysics() {
        // Delegate to player system
        this.playerSystem.update(
            this.deltaTime,
            this.isDevelopmentMode,
            this.platformSystem,
            this.propSystem,
            this.sceneSystem,
            this.viewport
        );

        // Apply scene boundaries
        const sceneBoundaries = this.sceneSystem.getSceneBoundaries();
        if (sceneBoundaries) {
            this.playerSystem.applyBoundaryConstraints(sceneBoundaries);
        }

        // Update enemy system
        this.enemySystem.update(this.deltaTime, this.playerSystem.data, this.platformSystem.platforms);

        // Update HUD with current player stats
        if (this.hudSystem && this.playerSystem) {
            this.hudSystem.updatePlayerStats(
                this.playerSystem.data.health,
                this.playerSystem.data.maxHealth,
                this.playerSystem.data.stamina,
                this.playerSystem.data.maxStamina
            );
        }
    }

    updateDeathOverlay() {
        const deathOverlay = document.getElementById('deathOverlay');
        if (!deathOverlay) return;

        // Show overlay when player is dead
        if (this.player.isDead) {
            deathOverlay.style.display = 'flex';
        } else {
            deathOverlay.style.display = 'none';
        }
    }

    applyCameraBoundaryConstraints(targetX, targetY) {
        const currentScene = this.sceneSystem.currentScene;
        if (!currentScene || !currentScene.boundaries) {
            // Fallback to basic constraints if no scene boundaries
            this.cameraSystem.x = Math.max(0, targetX);
            this.cameraSystem.y = Math.max(0, targetY);
            return;
        }

        const bounds = currentScene.boundaries;

        // Calculate the actual visible area in world coordinates
        // This accounts for the actual canvas size and viewport scaling
        const visibleWorldWidth = this.canvas.width / this.viewport.scaleX;
        const visibleWorldHeight = this.canvas.height / this.viewport.scaleY;

        // Calculate the constrained camera position
        // Camera X constraints: use normal constraints for most cases
        let minCameraX, maxCameraX;
        const sceneWidth = bounds.right - bounds.left;

        if (visibleWorldWidth > sceneWidth && (bounds.right - visibleWorldWidth) < bounds.left) {
            // Only apply expanded bounds when visible area is larger than scene AND standard constraints would lock camera
            // This specifically targets laptop scaling issues where camera gets locked
            const excessWidth = visibleWorldWidth - sceneWidth;
            // Allow camera to move to follow player while keeping scene visible
            minCameraX = bounds.left - (excessWidth * 0.3);
            maxCameraX = bounds.left + (excessWidth * 0.3);
        } else {
            // Standard camera constraints for normal cases
            minCameraX = bounds.left;
            maxCameraX = Math.max(bounds.left, bounds.right - visibleWorldWidth);
        }

        // Camera Y constraints: more flexible for smaller screens
        let minCameraY, maxCameraY;

        if (visibleWorldHeight >= (bounds.bottom - bounds.top)) {
            // Screen is tall enough to show the entire scene height - align to bottom
            const sceneHeight = bounds.bottom - bounds.top;
            const excessHeight = visibleWorldHeight - sceneHeight;
            // Align scene to bottom by positioning camera to show the bottom boundary at viewport bottom
            minCameraY = bounds.bottom - visibleWorldHeight;
            maxCameraY = bounds.bottom - visibleWorldHeight;  // Same value for bottom alignment
        } else {
            // Screen is shorter than scene - use normal constraints
            minCameraY = bounds.top;
            maxCameraY = Math.max(bounds.top, bounds.bottom - visibleWorldHeight);
        }

        // Apply constraints
        this.cameraSystem.x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
        this.cameraSystem.y = Math.max(minCameraY, Math.min(maxCameraY, targetY));

        // Special handling for hidden dashboard: force camera to left boundary to eliminate gaps
        if (!this.showDashboard) {
            // When dashboard is hidden, ensure camera doesn't create gaps on the left
            this.cameraSystem.x = Math.max(this.cameraSystem.x, bounds.left);
            // Also ensure viewport offset is 0 for proper alignment
            this.viewport.offsetX = 0;
        }

        // Debug logging for camera constraints (can be removed for production)
    }

    updateViewport() {
        this.viewportSystem.updateViewport();
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return this.viewportSystem.screenToWorld(screenX, screenY);
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return this.viewportSystem.worldToScreen(worldX, worldY);
    }

    // Convert screen coordinates to viewport coordinates (without camera offset)
    screenToViewport(screenX, screenY) {
        return this.viewportSystem.screenToViewport(screenX, screenY);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background first, before any scaling (fills entire window)
        this.backgroundSystem.render();

        // Apply viewport scaling and offset
        this.ctx.save();
        this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
        this.ctx.scale(this.viewport.scaleX, this.viewport.scaleY);

        this.ctx.save();
        this.cameraSystem.applyTransform(this.ctx);

        // Disable image smoothing for crisp pixel art rendering
        this.ctx.imageSmoothingEnabled = false;

        // Debug: Log camera position during render
        if (this.platformSystem.isDragging || this.propSystem.isDraggingProp || this.isDraggingStartPosition) {
        }

        // Render player behind platforms if sinking
        if (this.playerSystem.shouldRenderBehindPlatforms()) {
            this.playerSystem.render(this.ctx, this.isDevelopmentMode);
        }

        // Render platforms using the platform system
        this.platformSystem.renderPlatforms(this.isDevelopmentMode, this.viewport);

        // Render props (background props first, then obstacle props)
        this.propSystem.renderBackgroundProps(this.isDevelopmentMode, this.viewport);

        // Render player normally if not sinking
        if (!this.playerSystem.shouldRenderBehindPlatforms()) {
            this.playerSystem.render(this.ctx, this.isDevelopmentMode);
        }

        this.ctx.restore();

        // Restore viewport scaling as well for obstacle props
        this.ctx.restore();

        // Render obstacle props after removing transformations
        // They need special handling for proper coordinate transformation
        this.propSystem.renderObstacleProps(this.isDevelopmentMode, this.viewport, this.cameraSystem.camera);

        // Render torch particles after obstacle props (they need the same transformation)
        this.propSystem.renderParticles(this.viewport, this.cameraSystem.camera, this.platformSystem.platforms);

        // Render enemies AFTER obstacle props so they appear on top and can be selected
        this.enemySystem.render(this.viewport, this.cameraSystem.camera, this.isDevelopmentMode);

        if (this.isDevelopmentMode) {
            // Apply viewport scaling for dev rendering
            this.ctx.save();
            this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
            this.ctx.scale(this.viewport.scaleX, this.viewport.scaleY);

            // Apply camera transformation for scene development overlays
            this.ctx.save();
            this.cameraSystem.applyTransform(this.ctx);

            // Render scene development overlays (transition zones, boundaries, etc.)
            this.sceneSystem.renderer.renderDevelopmentOverlays(this.ctx);

            this.ctx.restore();

            // Render drag selection rectangle
            this.renderDragSelection();

            // Render transition zone drag preview
            this.renderTransitionZoneDrag();

            this.ctx.restore();

            // Render editor system development info
            if (this.editorSystem) {
                this.editorSystem.renderDevelopmentInfo(this.ctx);
            }
        }

        // Render feedback messages (copy/paste notifications) on top of everything
        // Should work in both development and production modes
        this.renderFeedbackMessages();

        // Render HUD (player status) on top of everything
        if (this.hudSystem && this.hudSystem.isVisible) {
            this.hudSystem.render();
        }

        // Note: Damage visual now handled by hurt sprite animation
    }



    updateUI() {
        // Note: scenesList is now handled by the scene system, not here

        // Get game data from gameDataSystem
        const gameData = this.gameDataSystem ? this.gameDataSystem.gameData : null;
        if (!gameData) {
            return;
        }

        document.getElementById('charactersList').innerHTML = (gameData.characters || []).map(char =>
            `<div class="item">
                <div class="item-name">${char.name}</div>
                <div class="item-details">${char.description}</div>
            </div>`
        ).join('');

        document.getElementById('classesList').innerHTML = (gameData.classes || []).map(cls =>
            `<div class="item">
                <div class="item-name">${cls.name}</div>
                <div class="item-details">${cls.description}</div>
            </div>`
        ).join('');

        document.getElementById('weaponsList').innerHTML = (gameData.weapons || []).map(weapon =>
            `<div class="item">
                <div class="item-name">${weapon.name}</div>
                <div class="item-details">${weapon.description}</div>
            </div>`
        ).join('');

        document.getElementById('itemsList').innerHTML = (gameData.items || []).map(item =>
            `<div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">${item.description}</div>
            </div>`
        ).join('');
    }



    handleStartPositionDrag() {
        if (!this.isDraggingStartPosition) return;

        // Calculate new position based on mouse position minus drag offset
        const newX = this.mouseX - this.startPositionDragOffset.x;
        const newY = this.mouseY - this.startPositionDragOffset.y;

        // Update the start position
        this.sceneSystem.renderer.updateStartPosition(newX, newY);
    }

    handleFreeCameraScroll(clientMouseX, clientMouseY) {
        this.freeCameraSystem.handleFreeCameraScroll(clientMouseX, clientMouseY);
    }

    stopFreeCameraScroll() {
        this.freeCameraSystem.stopFreeCameraScroll();
    }


    positionPlayerAtSceneStart() {
        const currentScene = this.sceneSystem.currentScene;
        if (currentScene && currentScene.settings) {
            // Position player so their center is at the start point
            // (subtract half width and half height to center the player)
            this.player.x = currentScene.settings.playerStartX - (this.player.width / 2);
            this.player.y = currentScene.settings.playerStartY - (this.player.height / 2);
            this.player.velocityX = 0;
            this.player.velocityY = 0;

            // Update camera to follow player to the new position
            if (this.cameraSystem) {
                this.cameraSystem.camera.targetX = this.player.x;
                this.cameraSystem.camera.targetY = this.player.y;
            }

            console.log('Player centered at scene start point:', {
                startPoint: [currentScene.settings.playerStartX, currentScene.settings.playerStartY],
                playerTopLeft: [this.player.x, this.player.y],
                playerSize: [this.player.width, this.player.height]
            });
        } else {
            console.log('No current scene found, player remains at default position');
        }
    }


    showCopyPasteFeedback(text, prop) {
        this.feedbackSystem.showCopyPasteMessage(text, prop);
    }

    renderFeedbackMessages() {
        this.feedbackSystem.render();
    }

    renderDamageScreenFlash() {
        // Only show damage flash if player is currently damaged
        if (!this.playerSystem.data.isDamaged || this.playerSystem.data.damageTimer <= 0) {
            return;
        }

        // Calculate flash intensity based on remaining damage timer
        const intensity = this.playerSystem.data.damageTimer / 600; // 600ms is max damage timer
        const alpha = intensity * 0.3; // Max alpha of 0.3 for visibility

        // Draw red flash overlay
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    renderDragSelection() {
        if (!this.propSystem.isDragSelecting) return;

        const rect = this.propSystem.dragSelectionRect;
        if (!rect) return;

        // Apply camera transformation for world coordinates
        this.ctx.save();
        this.cameraSystem.applyTransform(this.ctx);

        // Draw selection rectangle
        this.ctx.strokeStyle = '#0099FF'; // Blue selection color
        this.ctx.fillStyle = 'rgba(0, 153, 255, 0.1)'; // Semi-transparent blue fill
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Dashed line

        // Fill and stroke the rectangle
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        // Reset line dash
        this.ctx.setLineDash([]);

        this.ctx.restore();
    }

    renderTransitionZoneDrag() {
        // Delegate to scene system
        if (this.sceneSystem) {
            this.ctx.save();
            this.cameraSystem.applyTransform(this.ctx);
            this.sceneSystem.renderTransitionPreview(this.ctx);
            this.ctx.restore();
        }
    }

    // renderPoliceBarrier method removed

    handleKeyDown(e) {
        this.developmentInputHandler.handleKeyDown(e);
    }


    updateCursor() {
        // Default cursor
        this.canvas.className = '';
        this.canvas.style.cursor = 'default';

        // Recalculate world coordinates to ensure consistency with mouse handlers
        const worldCoords = this.screenToWorld(this.lastMouseX, this.lastMouseY);
        const worldMouseX = worldCoords.x;
        const worldMouseY = worldCoords.y;

        // Check if mouse is over start position (highest priority)
        if (this.sceneSystem.renderer.isMouseOverStartPosition(worldMouseX, worldMouseY)) {
            this.canvas.style.cursor = 'move';
            return;
        }

        // Check if mouse is over any prop first (props have priority)
        // Find all props under mouse, then check the topmost one
        let propsUnderCursor = [];

        for (const prop of this.propSystem.props) {
            const propType = this.propTypes[prop.type];
            if (!propType) continue;

            const scale = prop.scale !== undefined ? prop.scale :
                         (prop.type === 'well' ? 1 :
                         (prop.type === 'barrel' || prop.type === 'crate') ? 1.2 :
                         (prop.type === 'smallPot' || prop.type === 'mediumPot' || prop.type === 'bigPot') ? 0.6 : 1.6);
            const renderWidth = propType.width * scale;
            const renderHeight = propType.height * scale;

            if (worldMouseX >= prop.x && worldMouseX <= prop.x + renderWidth &&
                worldMouseY >= prop.y && worldMouseY <= prop.y + renderHeight) {
                propsUnderCursor.push(prop);
            }
        }

        // If there are props under cursor, use blue cursor for the topmost one
        if (propsUnderCursor.length > 0) {
            this.canvas.className = 'blue-select-cursor';
            this.canvas.style.cursor = '';
            return; // Exit early, don't check platforms
        }

        // Check if mouse is over any platform or resize handle
        for (const platform of this.platformSystem.platforms) {
            // Get actual position for mouse interaction (same as platformMouseHandler)
            const actualPos = this.platformSystem.data.getActualPosition(platform, this.viewport.designWidth, this.viewport.designHeight);
            const renderPlatform = { ...platform, x: actualPos.x, y: actualPos.y };

            // Check for resize handle first
            const resizeHandle = this.platformSystem.getResizeHandle(renderPlatform, worldMouseX, worldMouseY);

            if (resizeHandle) {
                // Set appropriate blue cursor based on resize handle
                this.canvas.style.cursor = '';
                switch (resizeHandle) {
                    case 'nw':
                    case 'se':
                        this.canvas.className = 'blue-nw-resize-cursor';
                        break;
                    case 'ne':
                    case 'sw':
                        this.canvas.className = 'blue-ne-resize-cursor';
                        break;
                    case 'w':
                    case 'e':
                        this.canvas.className = 'blue-ew-resize-cursor';
                        break;
                    case 'n':
                    case 's':
                        this.canvas.className = 'blue-ns-resize-cursor';
                        break;
                }
                break; // Stop checking other platforms
            }

            // Check if mouse is inside platform area
            if (this.platformSystem.isPointInPlatform(worldMouseX, worldMouseY, renderPlatform)) {
                this.canvas.className = 'blue-select-cursor';
                this.canvas.style.cursor = '';
                break; // Stop checking other platforms once we find one
            }
        }
    }


    async savePlatforms() {
        // Use the new scene system for saving
        if (this.sceneSystem) {
            this.sceneSystem.saveScenes();

            // Create the gameData object
            const currentGameData = this.gameDataSystem ? this.gameDataSystem.gameData : {};
            const gameData = {
                gameInfo: {
                    title: "Platform RPG Game",
                    version: "1.0.0",
                    lastModified: new Date().toISOString().split('T')[0]
                },
                scenes: this.sceneSystem.exportSceneData().scenes,
                characters: currentGameData.characters || [],
                classes: currentGameData.classes || [],
                weapons: currentGameData.weapons || [],
                items: currentGameData.items || []
            };

            try {
                // Try to save to gameData.json file
                const response = await fetch('./gameData.json', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gameData, null, 2)
                });

                if (response.ok) {
                    alert('Platforms and game data saved to gameData.json!');
                } else {
                    throw new Error('Could not save to file');
                }
            } catch (error) {
                console.log('Could not save directly to file, downloading instead...');
                // Fallback: trigger download
                this.exportGameData();
            }
        }
    }

    updateSceneBoundaries() {
        const left = parseInt(document.getElementById('boundaryLeft').value) || 0;
        const right = parseInt(document.getElementById('boundaryRight').value) || 2000;
        const top = parseInt(document.getElementById('boundaryTop').value) || 0;
        const bottom = parseInt(document.getElementById('boundaryBottom').value) || 1000;

        // Validate boundaries
        if (left >= right) {
            alert('Left boundary must be less than right boundary');
            return;
        }
        if (top >= bottom) {
            alert('Top boundary must be less than bottom boundary');
            return;
        }

        this.sceneSystem.updateSceneBoundaries(left, right, top, bottom);
    }

    // Context Menu Methods

    showContextMenu(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientMouseX = e.clientX - rect.left;
        const clientMouseY = e.clientY - rect.top;
        const worldCoords = this.cameraSystem.screenToWorld(clientMouseX, clientMouseY);

        // Delegate to editor system's context menu
        this.editorSystem.contextMenu.show(e, worldCoords);
    }

    hideContextMenu() {
        // Delegate to editor system's context menu
        this.editorSystem.contextMenu.hide();
    }

    copyCoordinatesToClipboard() {
        // Get coordinates from editor system
        const coords = this.editorSystem.contextMenuCoords;
        if (coords) {
            this.editorSystem.tools.copyCoordinates(coords.x, coords.y);
        }
    }

    // Getters for backward compatibility
    get contextMenuCoords() {
        return this.editorSystem ? this.editorSystem.contextMenuCoords : null;
    }

    set contextMenuCoords(value) {
        if (this.editorSystem) {
            this.editorSystem.contextMenuCoords = value;
        }
    }

    // Keep showTemporaryMessage for backward compatibility
    showTemporaryMessage(message) {
        if (this.editorSystem && this.editorSystem.ui) {
            this.editorSystem.ui.showTemporaryMessage(message);
        }
    }

    // Transition zone getters for backward compatibility
    get isAddingTransition() {
        return this.editorSystem ? this.editorSystem.isAddingTransition : false;
    }

    set isAddingTransition(value) {
        if (this.editorSystem) {
            this.editorSystem.isAddingTransition = value;
        }
    }

    get transitionStart() {
        return this.editorSystem ? this.editorSystem.transitionStart : null;
    }

    set transitionStart(value) {
        if (this.editorSystem) {
            this.editorSystem.transitionStart = value;
        }
    }

    get transitionEnd() {
        return this.editorSystem ? this.editorSystem.transitionEnd : null;
    }

    set transitionEnd(value) {
        if (this.editorSystem) {
            this.editorSystem.transitionEnd = value;
        }
    }

    reviveAllEnemies() {
        // Revive all enemies by resetting their health and clearing death state
        this.enemySystem.data.enemies.forEach(enemy => {
            enemy.health = 100;
            enemy.maxHealth = 100;
            enemy.isDead = false;
            enemy.isDamaged = false;
            enemy.damageTimer = 0;
            enemy.deathTimer = 0;
            enemy.flashTimer = 0;
            enemy.isAttacking = false;
            enemy.attackTimer = 0;
            enemy.isVisible = true; // Restore visibility for all enemies

            // Reset animation state to idle
            enemy.currentAnimation = 'idle';
            enemy.frameIndex = 0;
            enemy.frameTimer = 0;

            // Reset AI state
            enemy.aiState = 'idle';
            enemy.target = null;
            enemy.lastPlayerPosition = null;
        });

        console.log(`🎯 Revived ${this.enemySystem.data.enemies.length} enemies - all health reset to 100 and made visible`);
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time in milliseconds
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps (e.g., when switching tabs)
        if (this.deltaTime > 100) this.deltaTime = 16.67; // ~60fps fallback

        this.handleInput();
        this.updatePhysics();
        this.cameraSystem.update(this.player, this.sceneSystem, this.platformSystem, this.propSystem, this.isDraggingStartPosition);
        this.updateDeathOverlay();
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Wait for DOM to be ready before creating the game
window.addEventListener('DOMContentLoaded', () => {
    const game = new PlatformRPG();
    window.game = game; // Make it available globally for debugging
});