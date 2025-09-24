class SceneData {
    constructor() {
        // Scene collection
        this.scenes = [];
        this.currentSceneId = null;
        this.startSceneId = null;

        // Initialize with default scene if empty
        this.initializeDefaultScene();
    }

    initializeDefaultScene() {
        if (this.scenes.length === 0) {
            const defaultScene = this.createScene('Tutorial', 'Starting scene with basic platforms');

            // Add some basic starter platforms to the default scene
            defaultScene.platforms = [
                { id: 0, x: 0, y: 550, width: 300, height: 50, color: '#4ECDC4', spriteType: 'color', positioning: 'absolute', relativeX: 0.5, relativeY: 0.5 },
                { id: 1, x: 400, y: 450, width: 200, height: 20, color: '#4ECDC4', spriteType: 'color', positioning: 'absolute', relativeX: 0.5, relativeY: 0.5 },
                { id: 2, x: 700, y: 350, width: 150, height: 20, color: '#4ECDC4', spriteType: 'color', positioning: 'absolute', relativeX: 0.5, relativeY: 0.5 },
                { id: 3, x: 950, y: 250, width: 200, height: 20, color: '#4ECDC4', spriteType: 'color', positioning: 'absolute', relativeX: 0.5, relativeY: 0.5 },
                { id: 4, x: 1200, y: 400, width: 300, height: 50, color: '#4ECDC4', spriteType: 'color', positioning: 'absolute', relativeX: 0.5, relativeY: 0.5 }
            ];

            // Initialize empty arrays for other scene elements
            defaultScene.props = defaultScene.props || [];
            defaultScene.enemies = defaultScene.enemies || [];

            this.currentSceneId = defaultScene.id;
            this.startSceneId = defaultScene.id;
        }
    }

    createScene(name, description = '') {
        const newScene = {
            id: this.getNextSceneId(),
            name: name || `Scene ${this.scenes.length + 1}`,
            description: description,
            platforms: [],
            props: [],
            enemies: [],
            background: {
                name: 'none',
                layers: []
            },
            // Scene transition settings
            transitions: {
                // Array of transition zones
                zones: []
            },
            // Scene boundaries (optional - for camera constraints)
            boundaries: {
                left: 0,
                right: 2000,
                top: 0,
                bottom: 1000
            },
            // Scene settings
            settings: {
                playerStartX: 100,
                playerStartY: 100,
                gravity: 0.8,
                playerSpeed: 5
            },
            // Scene metadata
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };

        this.scenes.push(newScene);
        return newScene;
    }

    getNextSceneId() {
        return this.scenes.length > 0 ? Math.max(...this.scenes.map(s => s.id)) + 1 : 1;
    }

    getSceneById(id) {
        // Handle both string and number IDs
        return this.scenes.find(scene => scene.id == id || scene.id === String(id) || String(scene.id) === String(id));
    }

    getCurrentScene() {
        return this.getSceneById(this.currentSceneId);
    }

    getStartScene() {
        return this.getSceneById(this.startSceneId);
    }

    setCurrentScene(sceneId) {
        const scene = this.getSceneById(sceneId);
        if (scene) {
            this.currentSceneId = sceneId;
            return true;
        }
        return false;
    }

    setStartScene(sceneId) {
        const scene = this.getSceneById(sceneId);
        if (scene) {
            this.startSceneId = sceneId;
            return true;
        }
        return false;
    }

    deleteScene(sceneId) {
        console.log(`🎯 Attempting to delete scene with ID: ${sceneId} (type: ${typeof sceneId})`);
        console.log(`🎯 Available scenes:`, this.scenes.map(s => ({ id: s.id, name: s.name, idType: typeof s.id })));

        const index = this.scenes.findIndex(scene => scene.id == sceneId || scene.id === String(sceneId) || String(scene.id) === String(sceneId));
        console.log(`🎯 Found scene at index: ${index}, total scenes: ${this.scenes.length}`);

        if (index !== -1 && this.scenes.length > 1) { // Don't delete the last scene
            const deletedScene = this.scenes[index];
            this.scenes.splice(index, 1);
            console.log(`🎯 Deleted scene: ${deletedScene.name}, remaining scenes: ${this.scenes.length}`);

            // Update current/start scene if deleted
            if (this.currentSceneId == sceneId || String(this.currentSceneId) === String(sceneId)) {
                this.currentSceneId = this.scenes[0].id;
                console.log(`🎯 Updated currentSceneId to: ${this.currentSceneId}`);
            }
            if (this.startSceneId == sceneId || String(this.startSceneId) === String(sceneId)) {
                this.startSceneId = this.scenes[0].id;
                console.log(`🎯 Updated startSceneId to: ${this.startSceneId}`);
            }
            return true;
        }

        console.log(`🎯 Scene deletion failed - index: ${index}, scenes length: ${this.scenes.length}`);
        return false;
    }

    duplicateScene(sceneId) {
        const originalScene = this.getSceneById(sceneId);
        if (originalScene) {
            const duplicatedScene = JSON.parse(JSON.stringify(originalScene));
            duplicatedScene.id = this.getNextSceneId();
            duplicatedScene.name = `${originalScene.name} (Copy)`;
            duplicatedScene.metadata.created = new Date().toISOString();
            duplicatedScene.metadata.modified = new Date().toISOString();

            this.scenes.push(duplicatedScene);
            return duplicatedScene;
        }
        return null;
    }

    addTransitionZone(sceneId, transitionZone) {
        const scene = this.getSceneById(sceneId);
        if (scene) {
            // Transition zone structure:
            // {
            //   id: unique_id,
            //   x: x_position,
            //   y: y_position,
            //   width: zone_width,
            //   height: zone_height,
            //   targetSceneId: destination_scene_id,
            //   playerStartX: where_to_place_player_in_target_scene,
            //   playerStartY: where_to_place_player_in_target_scene,
            //   direction: 'right'|'left'|'up'|'down' (optional)
            // }
            const zone = {
                id: this.getNextTransitionId(scene),
                ...transitionZone
            };
            scene.transitions.zones.push(zone);
            scene.metadata.modified = new Date().toISOString();
            return zone;
        }
        return null;
    }

    getNextTransitionId(scene) {
        return scene.transitions.zones.length > 0 ?
            Math.max(...scene.transitions.zones.map(z => z.id)) + 1 : 1;
    }

    removeTransitionZone(sceneId, zoneId) {
        const scene = this.getSceneById(sceneId);
        if (scene) {
            const index = scene.transitions.zones.findIndex(zone => zone.id === zoneId);
            if (index !== -1) {
                scene.transitions.zones.splice(index, 1);
                scene.metadata.modified = new Date().toISOString();
                return true;
            }
        }
        return false;
    }

    getTransitionZonesForScene(sceneId) {
        const scene = this.getSceneById(sceneId);
        return scene ? scene.transitions.zones : [];
    }

    updateSceneData(sceneId, platforms, props, enemies = []) {
        const scene = this.getSceneById(sceneId);
        if (scene) {
            console.log(`📝 updateSceneData called for scene ${sceneId}:`, {
                platforms: platforms.length,
                props: props.length,
                enemies: enemies.length,
                existingEnemies: scene.enemies?.length || 0
            });

            // CRITICAL: Log if we're about to clear enemies
            if (scene.enemies && scene.enemies.length > 0 && (!enemies || enemies.length === 0)) {
                console.error('🚨🚨🚨 CRITICAL: About to clear enemies from scene data!');
                console.error('🚨 Scene had', scene.enemies.length, 'enemies');
                console.error('🚨 New data has', enemies?.length || 0, 'enemies');
                console.error('🚨 Existing enemies:', scene.enemies.map(e => `${e.id}(${e.isDead ? 'dead' : 'alive'}:${e.isVisible !== false ? 'visible' : 'hidden'})`));
                console.error('🚨 New enemies:', enemies ? enemies.map(e => `${e.id}(${e.isDead ? 'dead' : 'alive'}:${e.isVisible ? 'visible' : 'hidden'})`) : 'NULL');
                console.error('🚨 Call stack:', new Error().stack);
            }

            // Update platforms, props, and enemies, but preserve all other scene data
            scene.platforms = JSON.parse(JSON.stringify(platforms));
            scene.props = JSON.parse(JSON.stringify(props));
            scene.enemies = JSON.parse(JSON.stringify(enemies));
            console.log(`📝 Scene data updated successfully: enemies = ${enemies.length}, IDs:`, enemies.map(e => `${e.id}(${e.isDead ? 'dead' : 'alive'}:${e.isVisible ? 'visible' : 'hidden'})`));

            scene.metadata.modified = new Date().toISOString();

            // Note: settings (including playerStartX/Y), transitions, boundaries, etc.
            // are preserved as they are not overwritten here
            return true;
        }
        return false;
    }

    exportSceneData() {
        return {
            scenes: this.scenes,
            currentSceneId: this.currentSceneId,
            startSceneId: this.startSceneId
        };
    }

    importSceneData(data) {
        if (data.scenes && Array.isArray(data.scenes)) {
            console.log('🔍 IMPORT DEBUG: Raw scene data from localStorage:');
            data.scenes.forEach((scene, i) => {
                console.log(`🔍 Scene ${i} "${scene.name}" enemies:`, scene.enemies);
            });

            // Migrate/validate each scene to ensure it has all required properties
            this.scenes = data.scenes.map(scene => this.migrateScene(scene));

            console.log('🔍 IMPORT DEBUG: After migration:');
            this.scenes.forEach((scene, i) => {
                console.log(`🔍 Scene ${i} "${scene.name}" enemies:`, scene.enemies);
            });

            // Debug: check what we have after migration
            if (this.scenes.length > 0) {
            }

            // Note: Removed dangerous auto-replacement logic that was overwriting valid scene data
            // with default platforms when adding transitions. The original logic was too aggressive
            // and would incorrectly trigger during normal operations, corrupting user's scene data.

            this.currentSceneId = data.currentSceneId || (this.scenes.length > 0 ? this.scenes[0].id : null);
            this.startSceneId = data.startSceneId || this.currentSceneId;
            return true;
        }
        return false;
    }

    // Ensure a scene has all required properties with defaults
    migrateScene(scene) {
        console.log(`🔍 MIGRATE DEBUG: Before migrating scene "${scene.name}":`, { enemies: scene.enemies });

        const defaults = {
            platforms: [],
            props: [],
            enemies: [],
            background: {
                name: 'none',
                layers: []
            },
            transitions: {
                zones: []
            },
            boundaries: {
                left: 0,
                right: 2000,
                top: 0,
                bottom: 1000
            },
            settings: {
                playerStartX: 100,
                playerStartY: 100,
                gravity: 0.8,
                playerSpeed: 5
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };

        // Merge with defaults to ensure all properties exist
        const migratedScene = {
            id: scene.id,
            name: scene.name || 'Unnamed Scene',
            description: scene.description || '',
            platforms: scene.platforms || defaults.platforms,
            props: scene.props || defaults.props,
            enemies: scene.enemies || defaults.enemies,
            background: { ...defaults.background, ...(scene.background || {}) },
            transitions: { ...defaults.transitions, ...(scene.transitions || {}) },
            boundaries: { ...defaults.boundaries, ...(scene.boundaries || {}) },
            settings: { ...defaults.settings, ...(scene.settings || {}) },
            metadata: { ...defaults.metadata, ...(scene.metadata || {}) }
        };

        console.log(`🔍 MIGRATE DEBUG: After migrating scene "${scene.name}":`, { enemies: migratedScene.enemies });
        return migratedScene;
    }
}