class GameDataValidator {
    constructor(gameDataSystem) {
        this.dataSystem = gameDataSystem;
        this.game = gameDataSystem.game;

        // Define validation schemas
        this.schemas = {
            gameInfo: {
                required: ['title', 'version'],
                optional: ['lastModified', 'author', 'description']
            },
            scene: {
                required: ['id', 'name'],
                optional: ['platforms', 'props', 'transitions', 'settings', 'boundaries', 'background']
            },
            platform: {
                required: ['id', 'x', 'y', 'width', 'height'],
                optional: ['spriteType', 'color', 'positioning', 'relativeX', 'relativeY']
            },
            prop: {
                required: ['id', 'type', 'x', 'y'],
                optional: ['sizeMultiplier', 'isObstacle', 'rotation', 'flipX', 'flipY']
            },
            transition: {
                required: ['id', 'x', 'y', 'width', 'height', 'targetSceneId'],
                optional: ['targetX', 'targetY', 'bidirectional', 'name']
            },
            settings: {
                required: [],
                optional: ['playerStartX', 'playerStartY', 'gravity', 'jumpVelocity', 'moveSpeed']
            },
            boundaries: {
                required: [],
                optional: ['left', 'right', 'top', 'bottom']
            }
        };
    }

    initialize() {
        // Set up any validation-specific initialization
    }

    // Validate complete game data
    validateGameData(gameData) {
        if (!gameData || typeof gameData !== 'object') {
            console.error('Invalid game data: not an object');
            return false;
        }

        const errors = [];

        // Validate game info
        if (!this.validateGameInfo(gameData.gameInfo)) {
            errors.push('Invalid game info');
        }

        // Validate scenes
        if (gameData.scenes) {
            if (!Array.isArray(gameData.scenes)) {
                errors.push('Scenes must be an array');
            } else {
                gameData.scenes.forEach((scene, index) => {
                    if (!this.validateScene(scene)) {
                        errors.push(`Invalid scene at index ${index}: ${scene.name || scene.id}`);
                    }
                });
            }
        }

        // Validate scene IDs
        if (gameData.currentSceneId && gameData.scenes) {
            // Convert both to strings for comparison to handle mixed types
            const sceneIds = new Set(gameData.scenes.map(s => String(s.id)));
            if (!sceneIds.has(String(gameData.currentSceneId))) {
                errors.push(`Current scene ID "${gameData.currentSceneId}" not found in scenes`);
            }
        }

        if (gameData.startSceneId && gameData.scenes) {
            // Convert both to strings for comparison to handle mixed types
            const sceneIds = new Set(gameData.scenes.map(s => String(s.id)));
            if (!sceneIds.has(String(gameData.startSceneId))) {
                errors.push(`Start scene ID "${gameData.startSceneId}" not found in scenes`);
            }
        }

        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            return false;
        }

        return true;
    }

    // Validate game info
    validateGameInfo(gameInfo) {
        if (!gameInfo) {
            // Game info is optional, but if present must be valid
            return true;
        }

        return this.validateObject(gameInfo, this.schemas.gameInfo);
    }

    // Validate scene
    validateScene(scene) {
        if (!this.validateObject(scene, this.schemas.scene)) {
            return false;
        }

        // Validate platforms
        if (scene.platforms && Array.isArray(scene.platforms)) {
            for (const platform of scene.platforms) {
                if (!this.validatePlatform(platform)) {
                    console.error('Invalid platform:', platform);
                    return false;
                }
            }
        }

        // Validate props
        if (scene.props && Array.isArray(scene.props)) {
            for (const prop of scene.props) {
                if (!this.validateProp(prop)) {
                    console.error('Invalid prop:', prop);
                    return false;
                }
            }
        }

        // Validate transitions
        if (scene.transitions && Array.isArray(scene.transitions)) {
            for (const transition of scene.transitions) {
                if (!this.validateTransition(transition)) {
                    console.error('Invalid transition:', transition);
                    return false;
                }
            }
        }

        // Validate settings
        if (scene.settings && !this.validateSettings(scene.settings)) {
            return false;
        }

        // Validate boundaries
        if (scene.boundaries && !this.validateBoundaries(scene.boundaries)) {
            return false;
        }

        return true;
    }

    // Validate platform
    validatePlatform(platform) {
        return this.validateObject(platform, this.schemas.platform) &&
               this.validateNumber(platform.x) &&
               this.validateNumber(platform.y) &&
               this.validateNumber(platform.width, 1) &&
               this.validateNumber(platform.height, 1);
    }

    // Validate prop
    validateProp(prop) {
        return this.validateObject(prop, this.schemas.prop) &&
               this.validateNumber(prop.x) &&
               this.validateNumber(prop.y) &&
               (!prop.sizeMultiplier || this.validateNumber(prop.sizeMultiplier, 0.1, 10));
    }

    // Validate transition
    validateTransition(transition) {
        return this.validateObject(transition, this.schemas.transition) &&
               this.validateNumber(transition.x) &&
               this.validateNumber(transition.y) &&
               this.validateNumber(transition.width, 1) &&
               this.validateNumber(transition.height, 1);
    }

    // Validate settings
    validateSettings(settings) {
        return this.validateObject(settings, this.schemas.settings) &&
               (!settings.playerStartX || this.validateNumber(settings.playerStartX)) &&
               (!settings.playerStartY || this.validateNumber(settings.playerStartY)) &&
               (!settings.gravity || this.validateNumber(settings.gravity, 0)) &&
               (!settings.jumpVelocity || this.validateNumber(settings.jumpVelocity)) &&
               (!settings.moveSpeed || this.validateNumber(settings.moveSpeed, 0));
    }

    // Validate boundaries
    validateBoundaries(boundaries) {
        return this.validateObject(boundaries, this.schemas.boundaries) &&
               (!boundaries.left || this.validateNumber(boundaries.left)) &&
               (!boundaries.right || this.validateNumber(boundaries.right)) &&
               (!boundaries.top || this.validateNumber(boundaries.top)) &&
               (!boundaries.bottom || this.validateNumber(boundaries.bottom));
    }

    // Helper to validate object against schema
    validateObject(obj, schema) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        // Check required fields
        for (const field of schema.required) {
            if (!(field in obj)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        return true;
    }

    // Helper to validate number
    validateNumber(value, min = -Infinity, max = Infinity) {
        return typeof value === 'number' &&
               !isNaN(value) &&
               value >= min &&
               value <= max;
    }

    // Repair common issues in game data
    repairGameData(gameData) {
        const repaired = JSON.parse(JSON.stringify(gameData)); // Deep clone

        // Ensure basic structure
        if (!repaired.gameInfo) {
            repaired.gameInfo = {
                title: "Platform RPG Game",
                version: "1.0.0",
                lastModified: new Date().toISOString().split('T')[0]
            };
        }

        if (!repaired.scenes) {
            repaired.scenes = [];
        }

        // Repair scenes
        repaired.scenes = repaired.scenes.map(scene => this.repairScene(scene));

        // Ensure scene IDs are valid
        const sceneIds = new Set(repaired.scenes.map(s => s.id));

        if (!sceneIds.has(repaired.currentSceneId)) {
            repaired.currentSceneId = repaired.scenes[0]?.id || null;
        }

        if (!sceneIds.has(repaired.startSceneId)) {
            repaired.startSceneId = repaired.scenes[0]?.id || null;
        }

        return repaired;
    }

    // Repair scene data
    repairScene(scene) {
        // Ensure required fields
        if (!scene.id) {
            scene.id = 'scene_' + Date.now();
        }

        if (!scene.name) {
            scene.name = 'Unnamed Scene';
        }

        // Ensure arrays
        if (!Array.isArray(scene.platforms)) {
            scene.platforms = [];
        }

        if (!Array.isArray(scene.props)) {
            scene.props = [];
        }

        if (!Array.isArray(scene.transitions)) {
            scene.transitions = [];
        }

        // Repair platforms
        scene.platforms = scene.platforms.map((p, i) => ({
            id: p.id || `platform_${i}`,
            x: Number(p.x) || 0,
            y: Number(p.y) || 0,
            width: Number(p.width) || 100,
            height: Number(p.height) || 20,
            ...p
        }));

        // Repair props
        scene.props = scene.props.map((p, i) => ({
            id: p.id || `prop_${i}`,
            type: p.type || 'tree',
            x: Number(p.x) || 0,
            y: Number(p.y) || 0,
            ...p
        }));

        return scene;
    }

    // Check for potential issues
    checkForIssues(gameData) {
        const issues = [];

        // Check for duplicate IDs
        if (gameData.scenes) {
            const sceneIds = new Set();
            gameData.scenes.forEach(scene => {
                if (sceneIds.has(scene.id)) {
                    issues.push(`Duplicate scene ID: ${scene.id}`);
                }
                sceneIds.add(scene.id);

                // Check platform IDs
                const platformIds = new Set();
                scene.platforms?.forEach(platform => {
                    if (platformIds.has(platform.id)) {
                        issues.push(`Duplicate platform ID in scene ${scene.name}: ${platform.id}`);
                    }
                    platformIds.add(platform.id);
                });
            });
        }

        // Check for orphaned transitions
        const sceneIds = new Set(gameData.scenes?.map(s => s.id) || []);
        gameData.scenes?.forEach(scene => {
            scene.transitions?.forEach(transition => {
                if (!sceneIds.has(transition.targetSceneId)) {
                    issues.push(`Transition in scene ${scene.name} points to non-existent scene: ${transition.targetSceneId}`);
                }
            });
        });

        return issues;
    }
}