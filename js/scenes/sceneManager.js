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
                    this.game.sceneSystem.removeTransitionZone(zoneId);
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

        console.log('🔄 Force loading scene:', scene.name);

        // Skip all optimization checks and directly load the scene
        return this._performSceneLoad(scene, sceneId, playerStartX, playerStartY);
    }

    loadScene(sceneId, playerStartX = null, playerStartY = null) {
        const scene = this.sceneData.getSceneById(sceneId);
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return false;
        }

        console.log('🎬 Loading scene:', scene.name, 'ID:', sceneId, 'Platforms:', scene.platforms?.length || 0);

        const currentScene = this.sceneData.getCurrentScene();

        // Check if this is an initial load (no platforms loaded yet) or scene has platforms but they aren't loaded
        const scenePlatformCount = scene.platforms ? scene.platforms.length : 0;
        const loadedPlatformCount = this.game.platformSystem ? this.game.platformSystem.platforms.length : 0;
        const isInitialLoad = scenePlatformCount > 0 && loadedPlatformCount === 0;

        // If loading the same scene without a specific player position AND platforms are already loaded, skip the reload
        if (currentScene && currentScene.id === sceneId && playerStartX === null && playerStartY === null && !isInitialLoad) {
            console.log('Skipping reload of same scene without position change:', scene.name);
            return true;
        }

        // If loading the same scene with a specific player position AND platforms are already loaded, just update player position
        if (currentScene && currentScene.id === sceneId && (playerStartX !== null || playerStartY !== null) && !isInitialLoad) {
            console.log('Same scene transition - just updating player position:', scene.name, {
                newPosition: [playerStartX, playerStartY]
            });

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

        console.log('Loading scene:', scene.name);
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

        // Clean up any invalid transition zones in this scene
        this.cleanupInvalidTransitions(scene);

        // Load platforms
        console.log('🔧 DEBUG: Loading scene data');
        console.log('🔧 Loading platforms for scene:', scene.name, 'ID:', scene.id, 'Platform count:', scene.platforms.length);
        console.log('🔧 Loading props for scene:', scene.name, 'Prop count:', scene.props.length);

        // Removed corruption detection messages

        console.log('🔧 Scene platforms:', scene.platforms);
        console.log('🔧 Platforms being loaded:', scene.platforms.map(p => ({
            id: p.id,
            spriteType: p.spriteType,
            x: p.x,
            y: p.y
        })));

        console.log('🔧 PlatformSystem before:', this.game.platformSystem.platforms);
        console.log('🔧 PlatformSystem.data before:', this.game.platformSystem.data.platforms);

        // Create a deep copy of platforms
        const platformsCopy = JSON.parse(JSON.stringify(scene.platforms || []));
        console.log('🔧 Platforms copy:', platformsCopy);
        console.log('🔧 Scene platforms before copy:', scene.platforms);

        this.game.platformSystem.platforms = platformsCopy;

        console.log('🔧 PlatformSystem after setter:', this.game.platformSystem.platforms);
        console.log('🔧 PlatformSystem.data after setter:', this.game.platformSystem.data.platforms);

        // Double-check by accessing data directly
        console.log('🔧 Direct access test:', this.game.platformSystem.data.platforms.length, 'platforms in data');

        // Verify platforms were actually loaded
        if (scene.platforms && scene.platforms.length > 0 && this.game.platformSystem.platforms.length === 0) {
            console.error('❌ CRITICAL: Platforms failed to load into platformSystem!');
            console.error('❌ Scene has', scene.platforms.length, 'platforms but platformSystem has 0');
            console.log('🔄 Attempting emergency reload...');

            // Force reload the platforms
            const emergencyCopy = JSON.parse(JSON.stringify(scene.platforms));
            this.game.platformSystem.data.platforms = emergencyCopy;
            console.log('✅ Emergency reload complete:', this.game.platformSystem.platforms.length, 'platforms now in memory');
        }

        this.game.platformSystem.nextPlatformId = scene.platforms.length > 0 ?
            Math.max(...scene.platforms.map(p => p.id !== undefined ? p.id : 0)) + 1 : 0;

        // Load props
        console.log('🎭 Loading props for scene:', scene.name, 'Props count:', scene.props?.length || 0);
        this.game.propSystem.props = [...(scene.props || [])];
        this.game.propSystem.data.initializeGroupsFromProps();

        // Verify props were actually loaded
        if (scene.props && scene.props.length > 0 && this.game.propSystem.props.length === 0) {
            console.error('❌ CRITICAL: Props failed to load into propSystem!');
            console.error('❌ Scene has', scene.props.length, 'props but propSystem has 0');
            console.log('🔄 Attempting emergency reload of props...');

            // Force reload the props
            const emergencyPropsCopy = JSON.parse(JSON.stringify(scene.props));
            this.game.propSystem.props = emergencyPropsCopy;
            this.game.propSystem.data.initializeGroupsFromProps();
            console.log('✅ Emergency reload complete:', this.game.propSystem.props.length, 'props now in memory');
        }

        // Load background
        if (scene.background && scene.background.name && scene.background.name !== 'none') {
            console.log('🎨 Scene loading background:', scene.background.name);
            this.game.loadBackground(scene.background.name);
        } else {
            console.log('🎨 Scene loading no background (none)');
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

        // Update background dropdown to reflect current scene's background
        const backgroundSelect = document.getElementById('backgroundSelect');
        if (backgroundSelect && scene.background) {
            const backgroundName = scene.background.name || 'none';
            console.log('🎨 Updating background dropdown to:', backgroundName);
            backgroundSelect.value = backgroundName;
        }

        // Debug: Log transition zones in the loaded scene
        this.logTransitionZones();

        return true;
    }

    saveCurrentSceneData() {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            console.log('💾 DEBUG: About to save scene data');
            console.log('💾 Current scene ID:', currentScene.id, 'Name:', currentScene.name);
            console.log('💾 Platforms in memory:', this.game.platformSystem.platforms.length);
            console.log('💾 Props in memory:', this.game.propSystem.props.length);
            console.log('💾 Scene data before update - platforms:', currentScene.platforms.length, 'props:', currentScene.props.length);

            // Check if we're about to wipe out existing platforms
            if (currentScene.platforms.length > 0 && this.game.platformSystem.platforms.length === 0) {
                console.warn('⚠️ WARNING: Attempting to save empty platforms over existing platforms!');
                console.warn('⚠️ Scene had', currentScene.platforms.length, 'platforms but platformSystem has 0');
                console.warn('⚠️ This likely means the platforms weren\'t loaded properly into memory');

                // Try to reload the platforms into memory from the scene
                console.log('🔄 Attempting to reload platforms from scene data...');
                const platformsCopy = JSON.parse(JSON.stringify(currentScene.platforms));
                this.game.platformSystem.platforms = platformsCopy;
                console.log('🔄 Reloaded', this.game.platformSystem.platforms.length, 'platforms into memory');
            }

            // Check if we're about to wipe out existing props
            if (currentScene.props.length > 0 && this.game.propSystem.props.length === 0) {
                console.warn('⚠️ WARNING: Attempting to save empty props over existing props!');
                console.warn('⚠️ Scene had', currentScene.props.length, 'props but propSystem has 0');
                console.warn('⚠️ This likely means the props weren\'t loaded properly into memory');

                // Try to reload the props into memory from the scene
                console.log('🔄 Attempting to reload props from scene data...');
                const propsCopy = JSON.parse(JSON.stringify(currentScene.props));
                this.game.propSystem.props = propsCopy;
                this.game.propSystem.data.initializeGroupsFromProps();
                console.log('🔄 Reloaded', this.game.propSystem.props.length, 'props into memory');
            }

            console.log('💾 Saving current scene data for:', currentScene.name);
            console.log('💾 Platforms being saved:', this.game.platformSystem.platforms.map(p => ({
                id: p.id,
                spriteType: p.spriteType,
                x: p.x,
                y: p.y
            })));

            this.sceneData.updateSceneData(
                currentScene.id,
                this.game.platformSystem.platforms,
                this.game.propSystem.props
            );

            console.log('💾 Scene data after update - platforms:', currentScene.platforms.length, 'props:', currentScene.props.length);
        }
    }

    // Scene transition handling
    checkTransitions(playerX, playerY) {
        if (this.isTransitioning) return;

        const currentScene = this.sceneData.getCurrentScene();
        if (!currentScene) return;

        const transitionZones = currentScene.transitions.zones;

        // Debug: Show transition zone info when player moves
        if (transitionZones.length > 0 && Math.random() < 0.01) {
            console.log('🔄 Checking transitions:', {
                playerPos: [Math.round(playerX), Math.round(playerY)],
                zonesCount: transitionZones.length,
                zones: transitionZones.map(z => ({
                    id: z.id,
                    bounds: `(${z.x},${z.y}) to (${z.x + z.width},${z.y + z.height})`,
                    target: z.targetSceneId
                }))
            });
        }

        // Debug: Log when in production mode
        if (!this.game.isDevelopmentMode && transitionZones.length > 0 && Math.random() < 0.01) {
            console.log('🎮 Checking transitions in production mode', {
                playerPos: [Math.round(playerX), Math.round(playerY)],
                zonesCount: transitionZones.length,
                zones: transitionZones.map(z => ({
                    id: z.id,
                    bounds: `(${z.x},${z.y}) ${z.width}x${z.height}`,
                    target: this.sceneData.getSceneById(z.targetSceneId)?.name || 'INVALID'
                }))
            });
        }

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
            console.log('📍 Current scene has transition zones:', transitionZones.map(z => ({
                id: z.id,
                bounds: `(${z.x},${z.y}) ${z.width}x${z.height}`,
                targetSceneId: z.targetSceneId,
                targetScene: this.sceneData.getSceneById(z.targetSceneId)?.name || 'INVALID'
            })));
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
                console.log('📏 Player near transition zone:', {
                    distance: Math.round(distance),
                    playerPos: [Math.round(playerX), Math.round(playerY)],
                    zoneCenter: [Math.round(zone.x + zone.width/2), Math.round(zone.y + zone.height/2)],
                    zoneBounds: `(${zone.x},${zone.y}) ${zone.width}x${zone.height}`
                });
            }

            if (this.isPlayerInZone(playerX, playerY, zone)) {
                console.log('✅ Player entered transition zone:', {
                    zoneId: zone.id,
                    currentSceneName: currentScene.name,
                    currentSceneId: currentScene.id,
                    playerPos: [Math.round(playerX), Math.round(playerY)],
                    zonePos: [zone.x, zone.y],
                    zoneSize: [zone.width, zone.height],
                    targetSceneId: zone.targetSceneId,
                    targetSceneName: this.sceneData.getSceneById(zone.targetSceneId)?.name || 'INVALID'
                });
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
        console.log('Transitioning from', currentScene?.name, 'to scene:', targetScene.name, {
            zoneId: zone.id,
            playerWillMoveTo: [zone.playerStartX, zone.playerStartY]
        });

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

        this.updateSceneUI();
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
        return this.sceneData.setStartScene(sceneId);
    }

    // Transition zone management
    addTransitionZone(x, y, width, height, targetSceneId, playerStartX, playerStartY) {
        const currentScene = this.sceneData.getCurrentScene();
        if (currentScene) {
            console.log('🔗 DEBUG: Adding transition zone');
            console.log('🔗 Current scene ID:', currentScene.id, 'Name:', currentScene.name);
            console.log('🔗 Target scene ID:', targetSceneId);
            console.log('🔗 Current scene platforms before save:', currentScene.platforms.length);
            console.log('🔗 Current scene props before save:', currentScene.props.length);
            console.log('🔗 Loaded platforms:', this.game.platformSystem.platforms.length);
            console.log('🔗 Loaded props:', this.game.propSystem.props.length);

            // Save current platform/prop data before adding transition
            this.saveCurrentSceneData();

            console.log('🔗 Current scene platforms after save:', currentScene.platforms.length);
            console.log('🔗 Current scene props after save:', currentScene.props.length);

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

            console.log('🔗 Final current scene platforms:', currentScene.platforms.length);
            console.log('🔗 Final current scene props:', currentScene.props.length);

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
                <button data-action="remove-transition" data-zone-id="${zone.id}" class="btn-small btn-danger">Remove</button>
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

            console.log('🟩 Scene boundaries saved to scene data:', currentScene.boundaries);

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
        console.log('Click and drag to create a transition zone');
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
                    console.log('Invalid choice for destination type');
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
            console.log(`🧹 Cleaned up ${invalidZones.length} invalid transition zones from scene "${scene.name}"`);
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
            console.log(`Current scene "${currentScene.name}" has ${zones.length} transition zones:`,
                zones.map(zone => ({
                    id: zone.id,
                    position: [zone.x, zone.y],
                    size: [zone.width, zone.height],
                    targetSceneId: zone.targetSceneId,
                    targetSceneName: this.sceneData.getSceneById(zone.targetSceneId)?.name || 'Unknown'
                }))
            );
        } else {
            console.log(`Current scene "${currentScene.name}" has no transition zones`);
        }
    }
}