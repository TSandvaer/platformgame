class SceneManager {
    constructor(sceneData, game) {
        this.sceneData = sceneData;
        this.game = game;
        this.isTransitioning = false;
        this.transitionCallback = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Set up event delegation for scene list clicks
        const listElement = document.getElementById('scenesList');
        if (listElement) {
            listElement.addEventListener('click', (e) => {
                const sceneItem = e.target.closest('.scene-item');
                if (!sceneItem) return;

                const sceneId = sceneItem.dataset.sceneId;
                const action = e.target.dataset.action;

                // Handle different actions
                if (action === 'rename') {
                    e.stopPropagation();
                    this.game.sceneSystem.renameScene(sceneId);
                } else if (action === 'setStart') {
                    e.stopPropagation();
                    this.game.sceneSystem.setStartScene(sceneId);
                    this.game.sceneSystem.updateUI();
                } else if (action === 'duplicate') {
                    e.stopPropagation();
                    this.game.sceneSystem.duplicateScene(sceneId);
                } else if (action === 'delete') {
                    e.stopPropagation();
                    this.game.sceneSystem.deleteScene(sceneId);
                } else if (!e.target.closest('.scene-actions')) {
                    // Load scene if not clicking on action buttons
                    this.game.sceneSystem.loadScene(sceneId);
                }
            });
        }

        // Set up event delegation for scene properties panel
        const propertiesDiv = document.getElementById('sceneProperties');
        if (propertiesDiv) {
            propertiesDiv.addEventListener('click', (e) => {
                const action = e.target.dataset.action;

                if (action === 'apply-boundaries') {
                    e.stopPropagation();
                    this.game.updateSceneBoundaries();
                } else if (action === 'add-transition') {
                    e.stopPropagation();
                    this.game.sceneSystem.startAddingTransition();
                } else if (action === 'remove-transition') {
                    e.stopPropagation();
                    const zoneId = e.target.dataset.zoneId;
                    const result = this.game.sceneSystem.removeTransitionZone(zoneId);
                    this.game.sceneSystem.updateUI();
                }
            });

            propertiesDiv.addEventListener('change', (e) => {
                const action = e.target.dataset.action;

                if (action === 'boundary-change') {
                    // Auto-apply boundaries when input changes
                    this.game.updateSceneBoundaries();
                }
            });
        }

        // The addTransitionBtn is handled by event delegation above
    }

    // Scene loading and switching
    forceLoadScene(sceneId, playerStartX = null, playerStartY = null) {
        // Force load without any optimization checks
        const scene = this.sceneData.getSceneById(sceneId);
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return false;
        }
        // Skip all optimization checks and directly load the scene
        return this._performSceneLoad(scene, sceneId, playerStartX, playerStartY);
    }

    loadScene(sceneId, playerStartX = null, playerStartY = null) {
        const scene = this.sceneData.getSceneById(sceneId);
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return false;
        }
        const currentScene = this.sceneData.getCurrentScene();

        // Check if this is an initial load (no platforms loaded yet) or scene has platforms but they aren't loaded
        const scenePlatformCount = scene.platforms ? scene.platforms.length : 0;
        const loadedPlatformCount = this.game.platformSystem ? this.game.platformSystem.platforms.length : 0;
        const isInitialLoad = scenePlatformCount > 0 && loadedPlatformCount === 0;

        // If loading the same scene without a specific player position AND platforms are already loaded, skip the reload
        if (currentScene && currentScene.id === sceneId && playerStartX === null && playerStartY === null && !isInitialLoad) {
            return true;
        }

        // If loading the same scene with a specific player position AND platforms are already loaded, just update player position
        if (currentScene && currentScene.id === sceneId && (playerStartX !== null || playerStartY !== null) && !isInitialLoad) {

            // Only update player position
            if (this.game.player) {
                this.game.player.x = playerStartX !== null ? playerStartX : this.game.player.x;
                this.game.player.y = playerStartY !== null ? playerStartY : this.game.player.y;
                this.game.player.velocityX = 0;
                this.game.player.velocityY = 0;

                // Update camera to follow player
                if (this.game.camera) {
                    this.game.camera.targetX = this.game.player.x;
                    this.game.camera.targetY = this.game.player.y;
                }
            }
            return true;
        }
        return this._performSceneLoad(scene, sceneId, playerStartX, playerStartY, currentScene);
    }

    _performSceneLoad(scene, sceneId, playerStartX = null, playerStartY = null, currentScene = null) {
        // Save current scene data before switching to a different scene
        // But don't save if we're loading the same scene or there's no current scene
        if (currentScene && currentScene.id !== sceneId) {
            this.saveCurrentSceneData();
        }

        // Set as current scene
        this.sceneData.setCurrentScene(sceneId);

        // Immediately persist the current scene ID to localStorage
        if (this.game.gameDataSystem) {
            this.game.gameDataSystem.updateCurrentSceneId(sceneId);
        }

        // Clear any selections from previous scene
        if (this.game.platformSystem) {
            this.game.platformSystem.clearSelection();
            this.game.platformSystem.updatePlatformProperties();
        }
        if (this.game.propSystem) {
            this.game.propSystem.clearSelection();
            this.game.propSystem.updatePropProperties();
        }
        if (this.game.enemySystem && this.game.enemySystem.manager) {
            this.game.enemySystem.manager.selectedEnemy = null;
            // Update enemy UI if available
            if (window.uiEventHandler) {
                window.uiEventHandler.updateEnemyProperties();
                window.uiEventHandler.updateEnemyList();
            }
        }
        if (this.game.lootableSystem) {
            this.game.lootableSystem.clearSelection();
            this.game.lootableSystem.updateLootableList();
            this.game.lootableSystem.updateLootableProperties();
        }

        // Clean up any invalid transition zones in this scene
        this.cleanupInvalidTransitions(scene);

        // Load platforms
        // Create a deep copy of platforms
        const platformsCopy = JSON.parse(JSON.stringify(scene.platforms || []));
        this.game.platformSystem.platforms = platformsCopy;
        // Double-check by accessing data directly
        // Verify platforms were actually loaded
        if (scene.platforms && scene.platforms.length > 0 && this.game.platformSystem.platforms.length === 0) {
            console.error('❌ CRITICAL: Platforms failed to load into platformSystem!');
            console.error('❌ Scene has', scene.platforms.length, 'platforms but platformSystem has 0');
            // Force reload the platforms
            const emergencyCopy = JSON.parse(JSON.stringify(scene.platforms));
            this.game.platformSystem.data.platforms = emergencyCopy;
        }

        this.game.platformSystem.nextPlatformId = scene.platforms.length > 0 ?
            Math.max(...scene.platforms.map(p => p.id !== undefined ? p.id : 0)) + 1 : 0;

        // Load props and ensure they have valid IDs
        const propsToLoad = [...(scene.props || [])];

        // Ensure all props have valid IDs
        let nextPropId = 1;
        propsToLoad.forEach(prop => {
            if (prop.id === undefined || prop.id === null || isNaN(prop.id)) {
                console.warn(`Prop missing or has invalid ID, assigning new ID ${nextPropId}:`, prop);
                prop.id = nextPropId++;
            } else {
                nextPropId = Math.max(nextPropId, prop.id + 1);
            }
        });

        this.game.propSystem.props = propsToLoad;
        this.game.propSystem.data.nextPropId = nextPropId;
        this.game.propSystem.data.initializeGroupsFromProps();

        // Load lootables
        if (this.game.lootableSystem) {
            this.game.lootableSystem.lootables = [...(scene.lootables || [])];

            // Update next lootable ID to avoid conflicts
            if (scene.lootables && scene.lootables.length > 0) {
                const maxId = Math.max(...scene.lootables.map(l => l.id || 0));
                this.game.lootableSystem.data.nextLootableId = maxId + 1;
            }
        }

        // Load enemies
        if (this.game.enemySystem && this.game.enemySystem.data) {
            this.game.enemySystem.data.enemies = [...(scene.enemies || [])];
            this.game.enemySystem.animators.clear(); // Clear animators, they'll be recreated

            // Migrate enemy properties from type definitions (ensures enemies use current type data)
            this.migrateEnemyProperties(this.game.enemySystem.data.enemies, this.game.enemySystem.data.enemyTypes);

            // Reset enemy positions to initial/design-time positions after loading
            // This ensures enemies always start at their designed positions, not runtime positions
            for (const enemy of this.game.enemySystem.data.enemies) {
                if (enemy.initialX !== undefined) {
                    enemy.x = enemy.initialX;
                }
                if (enemy.initialY !== undefined) {
                    enemy.y = enemy.initialY;
                }
            }

            // Update nextEnemyId to prevent ID conflicts
            if (scene.enemies && scene.enemies.length > 0) {
                this.game.enemySystem.data.nextEnemyId = Math.max(...scene.enemies.map(e => e.id || 0)) + 1;
            }

            // Update enemy UI to reflect loaded enemies
            if (window.uiEventHandler) {
                window.uiEventHandler.updateEnemyList();
                window.uiEventHandler.updateEnemyProperties();
            }
        }

        // Verify enemies were actually loaded
        if (scene.enemies && scene.enemies.length > 0 && (!this.game.enemySystem.data.enemies || this.game.enemySystem.data.enemies.length === 0)) {
            console.error('❌ CRITICAL: Enemies failed to load into enemySystem!');
            console.error('❌ Scene has', scene.enemies.length, 'enemies but enemySystem has 0');
            console.error('❌ Scene enemies data:', scene.enemies);
            console.error('❌ EnemySystem.data:', this.game.enemySystem.data);
            // Force reload the enemies
            if (this.game.enemySystem && this.game.enemySystem.data) {
                const emergencyEnemiesCopy = JSON.parse(JSON.stringify(scene.enemies));
                this.game.enemySystem.data.enemies = emergencyEnemiesCopy;
                this.game.enemySystem.animators.clear();

                // Migrate enemy properties from type definitions
                this.migrateEnemyProperties(this.game.enemySystem.data.enemies, this.game.enemySystem.data.enemyTypes);

                // Reset enemy positions to initial/design-time positions after emergency reload
                for (const enemy of this.game.enemySystem.data.enemies) {
                    if (enemy.initialX !== undefined) {
                        enemy.x = enemy.initialX;
                    }
                    if (enemy.initialY !== undefined) {
                        enemy.y = enemy.initialY;
                    }
                }

                // Update nextEnemyId to prevent ID conflicts
                if (scene.enemies && scene.enemies.length > 0) {
                    this.game.enemySystem.data.nextEnemyId = Math.max(...scene.enemies.map(e => e.id || 0)) + 1;
                }

                // Update enemy UI after emergency reload
                if (window.uiEventHandler) {
                    window.uiEventHandler.updateEnemyList();
                    window.uiEventHandler.updateEnemyProperties();
                }
            }
        }

        // Load NPCs
        if (this.game.npcSystem && this.game.npcSystem.data) {
            this.game.npcSystem.data.npcs = [...(scene.npcs || [])];
            this.game.npcSystem.animators.clear(); // Clear animators, they'll be recreated

            // Update nextNPCId to prevent ID conflicts
            if (scene.npcs && scene.npcs.length > 0) {
                this.game.npcSystem.data.nextNPCId = Math.max(...scene.npcs.map(n => n.id || 0)) + 1;
            }

            // Update NPC UI to reflect loaded NPCs
            if (window.uiEventHandler) {
                window.uiEventHandler.updateNPCList();
                window.uiEventHandler.updateNPCProperties();
            }
        }

        // Verify props were actually loaded
        if (scene.props && scene.props.length > 0 && this.game.propSystem.props.length === 0) {
            console.error('❌ CRITICAL: Props failed to load into propSystem!');
            console.error('❌ Scene has', scene.props.length, 'props but propSystem has 0');
            // Force reload the props
            const emergencyPropsCopy = JSON.parse(JSON.stringify(scene.props));
            this.game.propSystem.props = emergencyPropsCopy;
            this.game.propSystem.data.initializeGroupsFromProps();
        }

        // Load background
        if (scene.background && scene.background.name && scene.background.name !== 'none') {
            this.game.loadBackground(scene.background.name);
        } else {
            this.game.loadBackground('none');
        }

        // Set player position
        if (this.game.player) {
            const startX = playerStartX !== null ? playerStartX : scene.settings.playerStartX;
            const startY = playerStartY !== null ? playerStartY : scene.settings.playerStartY;
            this.game.player.x = startX;
            this.game.player.y = startY;
            this.game.player.velocityX = 0;
            this.game.player.velocityY = 0;
        }

        // Load scene background if specified
        if (this.game.backgroundSystem && scene.settings.backgroundName) {
            this.game.backgroundSystem.loadBackground(scene.settings.backgroundName);
        }

        // Update main dashboard background dropdown
        this.updateMainDashboardBackground(scene);

        // Update camera to follow player - set position directly for immediate transition
        if (this.game.camera && this.game.player) {
            // Force viewport update to ensure correct dimensions after scene change
            this.game.updateViewport();

            // Use viewport dimensions for proper camera positioning
            const visibleWorldWidth = this.game.canvas.width / this.game.viewport.scaleX;
            const visibleWorldHeight = this.game.canvas.height / this.game.viewport.scaleY;

            // Calculate camera position to center on player in world coordinates
            const targetX = this.game.player.x - visibleWorldWidth / 2;
            const targetY = this.game.player.y - visibleWorldHeight / 2;

            // Apply camera boundary constraints immediately
            this.game.applyCameraBoundaryConstraints(targetX, targetY);
        }

        // Update UI
        this.updateSceneUI();

        // Update platform list to show platforms for the newly loaded scene
        if (this.game.platformSystem) {
            this.game.platformSystem.updatePlatformList();
        }

        // Update props list to show props for the newly loaded scene
        if (this.game.propSystem) {
            this.game.propSystem.updatePropList();
        }


        // Debug: Log transition zones in the loaded scene
        this.logTransitionZones();

        return true;
    }

    saveCurrentSceneData() {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            // Check if we're in initial loading phase (systems not fully initialized)
            const isInitialLoading = !this.game.allSpritesLoaded ||
                                   (this.game.enemySystem && !this.game.enemySystem.isInitialized);

            // Check if we're about to wipe out existing platforms
            if (currentScene.platforms.length > 0 && this.game.platformSystem.platforms.length === 0) {
                if (!isInitialLoading) {
                    console.warn('⚠️ WARNING: Attempting to save empty platforms over existing platforms!');
                    console.warn('⚠️ Scene had', currentScene.platforms.length, 'platforms but platformSystem has 0');
                    console.warn('⚠️ This likely means the platforms weren\'t loaded properly into memory');
                }

                // Try to reload the platforms into memory from the scene
                const platformsCopy = JSON.parse(JSON.stringify(currentScene.platforms));
                this.game.platformSystem.platforms = platformsCopy;
            }

            // Check if we're about to wipe out existing props
            // Only restore props if we're in the initial loading phase
            // During normal operation, allow props to be deleted
            if (currentScene.props.length > 0 && this.game.propSystem.props.length === 0) {
                if (isInitialLoading) {
                    // During initial loading, this might indicate props weren't loaded properly
                    console.warn('⚠️ Initial loading: Scene had props but propSystem is empty - restoring');
                    const propsCopy = JSON.parse(JSON.stringify(currentScene.props));
                    this.game.propSystem.props = propsCopy;
                    this.game.propSystem.data.initializeGroupsFromProps();
                } else {
                    // During normal operation, this is likely intentional (user deleted all props)
                }
            }

            // Check if enemy system is initialized
            if (this.game.enemySystem && this.game.enemySystem.isInitialized) {
            } else {
                // Don't save enemy data if enemy system isn't initialized - preserve existing enemy data
                if (currentScene.enemies && currentScene.enemies.length > 0) {
                }
            }

            // Use current enemy data if enemy system is initialized, otherwise preserve existing enemy data
            let enemyDataToSave;

            if (this.game.enemySystem && this.game.enemySystem.isInitialized) {
                const currentEnemyData = this.game.enemySystem.data.enemies;

                // Only prevent saving empty array during initial loading phase
                // During normal operation, allow empty arrays (user may have deleted all enemies)
                if (isInitialLoading &&
                    currentScene.enemies && currentScene.enemies.length > 0 &&
                    (!currentEnemyData || currentEnemyData.length === 0)) {

                    console.warn('🚨 INITIAL LOAD: Preserving enemy data from scene (not saving empty array)');
                    console.warn('🚨 Scene previously had:', currentScene.enemies.length, 'enemies');
                    console.warn('🚨 Current memory has:', currentEnemyData ? currentEnemyData.length : 'null', 'enemies');

                    // Preserve existing enemy data during initialization
                    enemyDataToSave = currentScene.enemies;
                } else {
                    // Safe to use current enemy data (including empty array from intentional deletions)
                    enemyDataToSave = currentEnemyData;
                    if (currentEnemyData && currentEnemyData.length === 0 && currentScene.enemies && currentScene.enemies.length > 0) {
                    }
                }
            } else {
                // Enemy system not initialized - preserve existing enemy data
                enemyDataToSave = currentScene.enemies;
            }


            // Check if we're about to wipe out existing lootables
            if (currentScene.lootables && currentScene.lootables.length > 0 &&
                (!this.game.lootableSystem?.lootables || this.game.lootableSystem.lootables.length === 0)) {
                if (isInitialLoading) {
                    // During initial loading, this indicates lootables weren't loaded properly - restore them
                    console.warn('⚠️ Initial loading: Scene had lootables but lootableSystem is empty - restoring');
                    const lootablesCopy = JSON.parse(JSON.stringify(currentScene.lootables));
                    if (this.game.lootableSystem) {
                        this.game.lootableSystem.lootables = lootablesCopy;
                    }
                } else if (!this.game.isDevelopmentMode) {
                    // During gameplay (not dev mode), preserve lootables if they've all been collected
                    console.warn('⚠️ WARNING: Attempting to save empty lootables over existing lootables during gameplay!');
                    console.warn('⚠️ Scene had', currentScene.lootables.length, 'lootables but lootableSystem has 0');
                    console.warn('⚠️ Preserving lootables to prevent collected items from being lost permanently');

                    // Try to reload the lootables into memory from the scene
                    const lootablesCopy = JSON.parse(JSON.stringify(currentScene.lootables));
                    if (this.game.lootableSystem) {
                        this.game.lootableSystem.lootables = lootablesCopy;
                    }
                } else {
                    // In dev mode with no lootables, user deleted them all - allow it
                }
            }

            // Handle lootable data
            let lootableDataToSave = [];
            if (this.game.lootableSystem && this.game.lootableSystem.lootables) {
                const currentLootableData = this.game.lootableSystem.lootables;

                // CRITICAL: Detect if lootables have been collected during gameplay
                // This prevents collected coins/hearts from being permanently lost from scene data
                // BUT: In development mode, allow deletions (user is editing, not playing)
                const originalCount = currentScene.lootables ? currentScene.lootables.length : 0;
                const currentCount = currentLootableData.length;

                if (originalCount > 0 && currentCount < originalCount && !this.game.isDevelopmentMode) {
                    // Lootables have been collected during gameplay (not in dev mode) - preserve original configuration
                    console.warn('🚨 LOOTABLE PROTECTION: Detected collected lootables during gameplay');
                    console.warn('🚨 Scene originally had:', originalCount, 'lootables');
                    console.warn('🚨 Current memory has:', currentCount, 'lootables');
                    console.warn('🚨 Preserving original lootable configuration to prevent permanent loss');

                    lootableDataToSave = currentScene.lootables;
                } else if (currentCount < originalCount && this.game.isDevelopmentMode) {
                    // Lootables were deleted in development mode - save current state

                    lootableDataToSave = currentLootableData;
                } else if (currentCount > originalCount) {
                    // New lootables have been added in the editor - save current state

                    lootableDataToSave = currentLootableData;
                } else {
                    // Same count or starting fresh - save current state
                    lootableDataToSave = currentLootableData;
                }

            }

            // Handle chest inventory protection (similar to lootable protection)
            let propsDataToSave = [...this.game.propSystem.props];

            // Check each chest to see if items were removed during gameplay
            propsDataToSave = propsDataToSave.map(prop => {
                if (prop.isChest && prop.chestInventory) {
                    // Find original chest data in scene
                    const originalProp = currentScene.props.find(originalProp =>
                        originalProp.id === prop.id && originalProp.isChest
                    );

                    if (originalProp && originalProp.chestInventory) {
                        const originalItemCount = originalProp.chestInventory.length;
                        const currentItemCount = prop.chestInventory.length;

                        // If items were removed, restore original inventory
                        if (originalItemCount > currentItemCount) {
                            console.warn('🚨 CHEST PROTECTION: Detected looted items from chest');
                            console.warn(`🚨 Chest ${prop.id} originally had: ${originalItemCount} items`);
                            console.warn(`🚨 Current memory has: ${currentItemCount} items`);
                            console.warn('🚨 Preserving original chest inventory to prevent permanent loss');

                            // Return chest with original inventory
                            return {
                                ...prop,
                                chestInventory: [...originalProp.chestInventory]
                            };
                        }
                    }
                }
                return prop;
            });

            // Get NPC data to save - check if NPC system is initialized
            let npcDataToSave = [];
            if (this.game.npcSystem && this.game.npcSystem.isInitialized) {
                npcDataToSave = this.game.npcSystem.data.npcs;
                if (npcDataToSave.length > 0) {
                }
            } else {
                // Don't save NPC data if NPC system isn't initialized - preserve existing NPC data
                if (currentScene.npcs && currentScene.npcs.length > 0) {
                    npcDataToSave = currentScene.npcs; // Preserve existing NPCs
                }
            }

            this.sceneData.updateSceneData(
                currentScene.id,
                this.game.platformSystem.platforms,
                propsDataToSave,
                enemyDataToSave,
                npcDataToSave,
                lootableDataToSave
            );
        }
    }

    // Scene transition handling
    checkTransitions(playerX, playerY) {
        if (this.isTransitioning) return;

        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return;

        const transitionZones = currentScene.transitions.zones;


        // Initialize set to track invalid zones if not exists
        if (!this.invalidZonesChecked) {
            this.invalidZonesChecked = new Set();
        }

        // Clear invalid zones cache when scene changes
        if (this.lastCheckedSceneId !== currentScene.id) {
            this.invalidZonesChecked.clear();
            this.lastCheckedSceneId = currentScene.id;
        }

        // Debug: Log all transition zones in current scene
        if (transitionZones.length > 0 && Math.random() < 0.001) { // Log occasionally to avoid spam
        }

        for (const zone of transitionZones) {
            // Skip zones we've already identified as invalid
            if (this.invalidZonesChecked.has(zone.id)) {
                continue;
            }

            // Skip and mark invalid zones
            if (!zone || zone.width <= 0 || zone.height <= 0) {
                console.warn('⚠️ Invalid transition zone detected:', zone);
                this.invalidZonesChecked.add(zone.id);
                continue;
            }

            // Mark self-referencing zones as invalid
            if (zone.targetSceneId === currentScene.id) {
                console.warn('🚫 Self-referencing transition zone detected, skipping:', zone.id);
                this.invalidZonesChecked.add(zone.id);
                continue;
            }

            // Mark zones with invalid targets as invalid
            if (!this.sceneData.getSceneById(zone.targetSceneId)) {
                console.warn('❌ Transition zone with invalid target detected, skipping:', zone.id);
                this.invalidZonesChecked.add(zone.id);
                continue;
            }

            // Check if player is near the zone (for debugging)
            const distance = Math.sqrt(
                Math.pow(playerX - (zone.x + zone.width/2), 2) +
                Math.pow(playerY - (zone.y + zone.height/2), 2)
            );

            if (distance < 100 && Math.random() < 0.02) { // Log when near
            }

            if (this.isPlayerInZone(playerX, playerY, zone)) {
                this.triggerTransition(zone);
                break;
            }
        }
    }

    isPlayerInZone(playerX, playerY, zone) {
        return playerX >= zone.x &&
               playerX <= zone.x + zone.width &&
               playerY >= zone.y &&
               playerY <= zone.y + zone.height;
    }

    triggerTransition(zone) {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) {
            console.error('No current scene!');
            return;
        }

        // CRITICAL: Prevent any transition to the same scene
        if (zone.targetSceneId === currentScene.id) {
            console.warn('🚫 Blocking self-transition! Zone points to current scene', {
                zoneId: zone.id,
                currentSceneId: currentScene.id,
                currentSceneName: currentScene.name,
                targetSceneId: zone.targetSceneId
            });
            // Don't trigger transition for invalid zones - they'll be cleaned up on next scene load
            return;
        }

        const targetScene = this.sceneData.getSceneById(zone.targetSceneId);
        if (!targetScene) {
            console.error('Target scene not found:', zone.targetSceneId);
            // Don't trigger transition for invalid zones - they'll be cleaned up on next scene load
            return;
        }

        this.isTransitioning = true;

        // Optional: Add transition effects here (fade, slide, etc.)

        // Load the target scene with specified player position
        this.loadScene(zone.targetSceneId, zone.playerStartX, zone.playerStartY);

        // Reset transition flag after a short delay
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    // Development mode helpers
    createNewScene(name, description) {
        // Save current scene data before creating new scene
        this.saveCurrentSceneData();

        const newScene = this.sceneData.createScene(name, description);

        // Immediately save to localStorage
        if (this.game && this.game.sceneSystem) {
            this.game.sceneSystem.saveScenes();
        }

        // Load the newly created scene to display it in the dashboard
        this.loadScene(newScene.id);

        return newScene;
    }

    duplicateCurrentScene() {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            this.saveCurrentSceneData();
            const duplicatedScene = this.sceneData.duplicateScene(currentScene.id);

            // Immediately save to localStorage
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }

            this.updateSceneUI();
            return duplicatedScene;
        }
        return null;
    }

    deleteScene(sceneId) {
        const scene = this.sceneData.getSceneById(sceneId);
        if (!scene) return false;

        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete the scene "${scene.name}"?\n\nThis action cannot be undone.`);
        if (!confirmed) return false;

        if (this.sceneData.deleteScene(sceneId)) {
            // Load the first available scene
            const firstScene = this.sceneData.scenes[0];
            if (firstScene) {
                this.loadScene(firstScene.id);
            }

            // Immediately save to localStorage
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }

            this.updateSceneUI();
            return true;
        }
        return false;
    }

    setStartScene(sceneId) {
        const scene = this.sceneData.getSceneById(sceneId);
        if (!scene) {
            console.error(`🎯 Cannot set start scene - scene with ID ${sceneId} not found`);
            return false;
        }

        const success = this.sceneData.setStartScene(sceneId);
        if (success) {
            // Immediately save to localStorage
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }

            this.updateSceneUI();
        }
        return success;
    }

    // Transition zone management
    addTransitionZone(x, y, width, height, targetSceneId, playerStartX, playerStartY) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            // Save current platform/prop data before adding transition
            this.saveCurrentSceneData();
            const zone = this.sceneData.addTransitionZone(currentScene.id, {
                x, y, width, height,
                targetSceneId,
                playerStartX,
                playerStartY
            });

            // Save scenes to persist the new transition zone
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }
            return zone;
        }
        return null;
    }

    removeTransitionZone(zoneId) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            const result = this.sceneData.removeTransitionZone(currentScene.id, zoneId);

            // Save scenes to persist the removal
            if (result && this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }

            return result;
        }
        return false;
    }

    // UI updates
    updateSceneUI() {
        this.updateScenesList();
        this.updateSceneProperties();
    }

    updateScenesList() {
        const listElement = document.getElementById('scenesList');
        if (!listElement) return;

        const currentScene = this.sceneData.getCurrentScene();
        const startScene = this.sceneData.getStartScene();

        const sceneHtml = this.sceneData.scenes.map(scene => {
            const isCurrentClass = currentScene && currentScene.id === scene.id ? 'current' : '';
            const isStartClass = startScene && startScene.id === scene.id ? 'start' : '';

            return `<div class="scene-item ${isCurrentClass} ${isStartClass}" data-scene-id="${scene.id}" style="cursor: pointer;" title="Click to load scene">
                <div class="scene-header">
                    <span class="scene-name" data-action="rename" style="cursor: pointer;" title="Click to rename">${scene.name}</span>
                    <div class="scene-badges">
                        ${startScene && startScene.id === scene.id ? '<span class="badge start-badge">START</span>' : ''}
                        ${currentScene && currentScene.id === scene.id ? '<span class="badge current-badge">CURRENT</span>' : ''}
                    </div>
                </div>
                <div class="scene-description">${scene.description}</div>
                <div class="scene-stats">
                    Platforms: ${scene.platforms.length} | Props: ${scene.props.length} | Transitions: ${scene.transitions.zones.length}
                </div>
                <div class="scene-actions">
                    <button data-action="setStart" class="btn-small">Set Start</button>
                    <button data-action="duplicate" class="btn-small">Duplicate</button>
                    ${this.sceneData.scenes.length > 1 ? `<button data-action="delete" class="btn-small btn-danger">Delete</button>` : ''}
                </div>
            </div>`;
        }).join('');

        listElement.innerHTML = sceneHtml;
    }

    updateSceneProperties() {
        const propertiesDiv = document.getElementById('sceneProperties');
        if (!propertiesDiv) return;

        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            propertiesDiv.style.display = 'block';
            propertiesDiv.innerHTML = `
                <h3>Scene Properties</h3>
                <div class="property-group">
                    <label>Name:</label>
                    <input type="text" id="sceneName" value="${currentScene.name}" onchange="game.sceneSystem.updateSceneName(this.value)">
                </div>
                <div class="property-group">
                    <label>Description:</label>
                    <textarea id="sceneDescription" onchange="game.sceneSystem.updateSceneDescription(this.value)">${currentScene.description}</textarea>
                </div>
                <div class="property-group">
                    <label>Player Start Position:</label>
                    <div class="input-row">
                        <input type="number" id="playerStartX" value="${currentScene.settings.playerStartX}" onchange="game.sceneSystem.updatePlayerStart()">
                        <input type="number" id="playerStartY" value="${currentScene.settings.playerStartY}" onchange="game.sceneSystem.updatePlayerStart()">
                    </div>
                </div>
                <div class="property-group">
                    <label>Background:</label>
                    <div class="input-row">
                        <span id="currentSceneBackgroundName" style="color: #4CAF50; font-weight: bold;">${currentScene.settings.backgroundName === 'none' || !currentScene.settings.backgroundName ? 'None' : this.game.backgroundSystem.formatBackgroundName(currentScene.settings.backgroundName)}</span>
                        <button class="btn small" id="selectSceneBackgroundBtn" style="margin-left: 10px;">Select Background</button>
                    </div>
                </div>
                <div class="property-group">
                    <label>Default Background Color:</label>
                    <div class="input-row">
                        <select id="defaultBackgroundColor" onchange="game.sceneSystem.manager.updateDefaultBackgroundColor(this.value)">
                            <option value="#87CEEB" ${(currentScene.settings.defaultBackgroundColor || '#87CEEB') === '#87CEEB' ? 'selected' : ''}>Sky Blue</option>
                            <option value="#000000" ${currentScene.settings.defaultBackgroundColor === '#000000' ? 'selected' : ''}>Black</option>
                        </select>
                    </div>
                </div>
                <div class="property-group">
                    <h4>Scene Boundaries</h4>
                    <div class="input-row">
                        <label>Left:</label>
                        <input type="number" id="boundaryLeft" value="${currentScene.boundaries.left}" style="width: 80px;" data-action="boundary-change">
                        <label>Right:</label>
                        <input type="number" id="boundaryRight" value="${currentScene.boundaries.right}" style="width: 80px;" data-action="boundary-change">
                    </div>
                    <div class="input-row">
                        <label>Top:</label>
                        <input type="number" id="boundaryTop" value="${currentScene.boundaries.top}" style="width: 80px;" data-action="boundary-change">
                        <label>Bottom:</label>
                        <input type="number" id="boundaryBottom" value="${currentScene.boundaries.bottom}" style="width: 80px;" data-action="boundary-change">
                    </div>
                    <button data-action="apply-boundaries" class="btn-small">Apply Boundaries</button>
                </div>
                <div class="property-group">
                    <h4>Transitions (${currentScene.transitions.zones.length})</h4>
                    <div id="transitionsList"></div>
                    <button data-action="add-transition" class="btn-small">Add Transition Zone</button>
                </div>
            `;

            // Set up background select button event listener (since controls are dynamically created)
            const selectSceneBgBtn = document.getElementById('selectSceneBackgroundBtn');
            if (selectSceneBgBtn) {
                // Remove any existing event listener to avoid duplicates
                selectSceneBgBtn.replaceWith(selectSceneBgBtn.cloneNode(true));
                const newSelectBtn = document.getElementById('selectSceneBackgroundBtn');
                newSelectBtn.addEventListener('click', () => {
                    // Open the background selection modal
                    if (this.game.backgroundSystem) {
                        this.game.backgroundSystem.openBackgroundModal();
                    }
                });
            }

            this.updateTransitionsList();
        } else {
            propertiesDiv.style.display = 'none';
        }
    }

    updateTransitionsList() {
        const listElement = document.getElementById('transitionsList');
        if (!listElement) return;

        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return;

        listElement.innerHTML = currentScene.transitions.zones.map(zone => {
            const targetScene = this.sceneData.getSceneById(zone.targetSceneId);
            return `<div class="transition-item">
                <div class="transition-info">
                    Zone ${zone.id} → ${targetScene ? targetScene.name : 'Unknown Scene'}
                    <br>Position: (${zone.x}, ${zone.y}) Size: ${zone.width}x${zone.height}
                    <br>Player Start: (${zone.playerStartX}, ${zone.playerStartY})
                </div>
                <button data-action="remove-transition" data-zone-id="${zone.id}" class="btn small" style="background-color: #dc3545; color: white;">Remove</button>
            </div>`;
        }).join('');
    }

    // Property update methods
    updateSceneName(name) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            currentScene.name = name;
            currentScene.metadata.modified = new Date().toISOString();
            this.updateSceneUI();
        }
    }

    updateSceneDescription(description) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            currentScene.description = description;
            currentScene.metadata.modified = new Date().toISOString();
            this.updateSceneUI();
        }
    }

    updatePlayerStart() {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            const startX = parseInt(document.getElementById('playerStartX').value);
            const startY = parseInt(document.getElementById('playerStartY').value);

            currentScene.settings.playerStartX = startX;
            currentScene.settings.playerStartY = startY;
            currentScene.metadata.modified = new Date().toISOString();

            // Save to localStorage to persist the change
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }
        }
    }

    updateDefaultBackgroundColor(color) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            currentScene.settings.defaultBackgroundColor = color;
            currentScene.metadata.modified = new Date().toISOString();

            // Save scenes to persist the change
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }
        }
    }

    updateMainDashboardBackground(scene) {
        // Update the main dashboard background display to reflect current scene's background
        const currentBgNameSpan = document.getElementById('currentBackgroundName');
        if (currentBgNameSpan && scene && scene.settings) {
            const backgroundName = scene.settings.backgroundName || 'none';
            currentBgNameSpan.textContent = backgroundName === 'none' ?
                'None' : this.game.backgroundSystem.formatBackgroundName(backgroundName);
        }
    }

    updateSceneBoundaries(left, right, top, bottom) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            currentScene.boundaries.left = left;
            currentScene.boundaries.right = right;
            currentScene.boundaries.top = top;
            currentScene.boundaries.bottom = bottom;
            currentScene.metadata.modified = new Date().toISOString();
            // Save to localStorage to persist changes
            if (this.game && this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }
        }
    }

    // Transition zone creation
    startAddingTransition() {
        // Use the EditorSystem's transition handling
        if (this.game.editorSystem) {
            this.game.editorSystem.startAddingTransition();
        }
    }

    handleTransitionCreation(startX, startY, endX, endY) {
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        // Ensure minimum size for transition zones
        const minSize = 15;
        if (width < minSize || height < minSize) {
            alert(`Transition zone too small! Please drag to create a zone at least ${minSize}x${minSize} pixels.`);
            return;
        }

        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);

        // Show dialog to select target scene
        this.showTransitionDialog(x, y, width, height);
    }

    showTransitionDialog(x, y, width, height) {
        const currentScene = this.sceneData.getCurrentScene();
        const scenes = this.sceneData.scenes.filter(s => s.id !== currentScene.id);
        
        if (scenes.length === 0) {
            alert('Create another scene first to set up transitions.');
            return;
        }

        const targetSceneId = prompt(`Select target scene:\n${scenes.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n\nEnter scene number:`);

        if (targetSceneId && !isNaN(targetSceneId)) {
            const sceneIndex = parseInt(targetSceneId) - 1;
            if (sceneIndex >= 0 && sceneIndex < scenes.length) {
                const targetScene = scenes[sceneIndex];

                // Ask user whether to use scene start point or custom coordinates
                const destinationType = prompt(
                    `Choose destination type:\n\n` +
                    `1. Use scene start point (${targetScene.settings.playerStartX}, ${targetScene.settings.playerStartY})\n` +
                    `2. Use custom coordinates\n\n` +
                    `Enter choice (1 or 2):`
                );

                let playerStartX, playerStartY;

                if (destinationType === '1') {
                    // Use scene's start point
                    playerStartX = targetScene.settings.playerStartX;
                    playerStartY = targetScene.settings.playerStartY;

                    this.addTransitionZone(
                        x, y, width, height,
                        targetScene.id,
                        playerStartX,
                        playerStartY
                    );
                    this.updateSceneUI();

                } else if (destinationType === '2') {
                    // Use custom coordinates
                    const customX = prompt('Player start X position in target scene:', targetScene.settings.playerStartX.toString());
                    const customY = prompt('Player start Y position in target scene:', targetScene.settings.playerStartY.toString());

                    if (customX !== null && customY !== null) {
                        this.addTransitionZone(
                            x, y, width, height,
                            targetScene.id,
                            parseInt(customX),
                            parseInt(customY)
                        );
                        this.updateSceneUI();
                    }
                } else {
                    // Invalid choice, do nothing
                }
            }
        }
    }

    // Clean up invalid transition zones
    cleanupInvalidTransitions(scene) {
        if (!scene.transitions || !scene.transitions.zones) return;

        const invalidZones = [];
        scene.transitions.zones.forEach(zone => {
            // Check for self-referencing transitions
            if (zone.targetSceneId === scene.id) {
                console.warn('🚫 Found self-referencing transition in scene', scene.name, '- removing');
                invalidZones.push(zone.id);
            }
            // Check for invalid dimensions
            else if (zone.width <= 0 || zone.height <= 0) {
                console.warn('⚠️ Found transition with invalid dimensions in scene', scene.name, '- removing');
                invalidZones.push(zone.id);
            }
            // Check for non-existent target scenes
            else if (!this.sceneData.getSceneById(zone.targetSceneId)) {
                console.warn('❌ Found transition to non-existent scene in', scene.name, '- removing');
                invalidZones.push(zone.id);
            }
        });

        // Remove all invalid zones
        invalidZones.forEach(zoneId => {
            const index = scene.transitions.zones.findIndex(z => z.id === zoneId);
            if (index !== -1) {
                scene.transitions.zones.splice(index, 1);
            }
        });

        if (invalidZones.length > 0) {
            // NOTE: Removed automatic save here as it was causing data corruption
            // by saving before scene data was fully loaded. The cleanup will be
            // persisted on the next manual save operation.
        }
    }

    // Debug method to log all transition zones in current scene
    logTransitionZones() {
        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return;

        const zones = currentScene.transitions.zones;
        if (zones.length > 0) {
        } else {
        }
    }

    // Migrate enemy properties from type definitions
    // This ensures enemies loaded from saves use current type definition values
    migrateEnemyProperties(enemies, enemyTypes) {
        if (!enemies || !enemyTypes) return;

        let migratedCount = 0;
        for (const enemy of enemies) {
            const typeData = enemyTypes[enemy.type];
            if (!typeData) {
                console.warn(`⚠️ Enemy ${enemy.id} has unknown type "${enemy.type}", skipping migration`);
                continue;
            }

            // Track if any properties were updated
            let wasUpdated = false;

            // Update collision box dimensions
            if (enemy.width !== typeData.width) {
                enemy.width = typeData.width;
                wasUpdated = true;
            }
            if (enemy.height !== typeData.height) {
                enemy.height = typeData.height;
                wasUpdated = true;
            }

            // Update collision offset for floating enemies
            const expectedOffsetY = typeData.collisionOffsetY || 0;
            if ((enemy.collisionOffsetY || 0) !== expectedOffsetY) {
                enemy.collisionOffsetY = expectedOffsetY;
                wasUpdated = true;
            }

            // Update render offset for floating enemies
            const expectedRenderOffsetY = typeData.renderOffsetY || 0;
            if ((enemy.renderOffsetY || 0) !== expectedRenderOffsetY) {
                enemy.renderOffsetY = expectedRenderOffsetY;
                wasUpdated = true;
            }

            // Update attack properties
            const expectedAttackType = typeData.attackType || 'melee';
            if ((enemy.attackType || 'melee') !== expectedAttackType) {
                enemy.attackType = expectedAttackType;
                wasUpdated = true;
            }

            const expectedAttackRange = typeData.attackRange || 60;
            if ((enemy.attackRange || 60) !== expectedAttackRange) {
                enemy.attackRange = expectedAttackRange;
                wasUpdated = true;
            }

            // Update facingInverted flag
            const expectedFacingInverted = typeData.facingInverted || false;
            if ((enemy.facingInverted || false) !== expectedFacingInverted) {
                enemy.facingInverted = expectedFacingInverted;
                wasUpdated = true;
            }

            // Update projectile speed for ranged enemies
            if (enemy.attackType === 'ranged') {
                const expectedProjectileSpeed = typeData.projectileSpeed || 300;
                if ((enemy.projectileSpeed || 300) !== expectedProjectileSpeed) {
                    enemy.projectileSpeed = expectedProjectileSpeed;
                    wasUpdated = true;
                }
            }

            if (wasUpdated) {
                migratedCount++;
            }
        }

        if (migratedCount > 0) {
        }
    }
}