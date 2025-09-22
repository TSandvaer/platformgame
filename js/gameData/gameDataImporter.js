class GameDataImporter {
    constructor(gameDataSystem) {
        this.dataSystem = gameDataSystem;
        this.game = gameDataSystem.game;
    }

    initialize() {
        // Set up any import-specific initialization
    }

    // Import game data from file input
    importFromFile(event, callback) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        // Check file type
        if (!file.type.match('application/json') && !file.name.endsWith('.json')) {
            alert('Please select a valid JSON file');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                console.log(`📤 Importing game data from ${file.name}`);

                // Validate before importing
                if (this.dataSystem.validator.validateGameData(gameData)) {
                    if (callback) {
                        callback(gameData);
                    }
                } else {
                    alert('Invalid game data format. Please check the file.');
                    console.error('Validation failed for imported data');
                }
            } catch (error) {
                alert('Error reading file. Please check the file format.');
                console.error('Import error:', error);
            }

            // Reset file input
            event.target.value = '';
        };

        reader.onerror = (error) => {
            alert('Error reading file');
            console.error('File read error:', error);
            event.target.value = '';
        };

        // Read the file
        reader.readAsText(file);
    }

    // Import scene data only
    importScene(sceneData) {
        if (!sceneData.scene) {
            console.error('No scene data found in import');
            return false;
        }

        // Add or replace scene in current game
        const scene = sceneData.scene;
        const existingSceneIndex = this.game.sceneSystem.data.scenes.findIndex(s => s.id === scene.id);

        if (existingSceneIndex >= 0) {
            // Replace existing scene
            if (confirm(`Scene "${scene.name}" already exists. Replace it?`)) {
                this.game.sceneSystem.data.scenes[existingSceneIndex] = scene;
                console.log(`✅ Replaced scene: ${scene.name}`);
            } else {
                return false;
            }
        } else {
            // Add new scene
            this.game.sceneSystem.data.scenes.push(scene);
            console.log(`✅ Added new scene: ${scene.name}`);
        }

        // Update UI
        this.game.sceneSystem.updateUI();
        return true;
    }

    // Import and merge data
    mergeImport(importData, options = {}) {
        const {
            mergePlatforms = true,
            mergeProps = true,
            mergeTransitions = true,
            overwriteSettings = false
        } = options;

        const currentData = this.dataSystem.collectCurrentGameData();
        const mergedData = { ...currentData };

        // Merge scenes
        if (importData.scenes) {
            importData.scenes.forEach(importScene => {
                const existingSceneIndex = mergedData.scenes.findIndex(s => s.id === importScene.id);

                if (existingSceneIndex >= 0) {
                    // Merge existing scene
                    const existingScene = mergedData.scenes[existingSceneIndex];

                    if (mergePlatforms && importScene.platforms) {
                        existingScene.platforms = this.mergeArrays(
                            existingScene.platforms || [],
                            importScene.platforms,
                            'id'
                        );
                    }

                    if (mergeProps && importScene.props) {
                        existingScene.props = this.mergeArrays(
                            existingScene.props || [],
                            importScene.props,
                            'id'
                        );
                    }

                    if (mergeTransitions && importScene.transitions) {
                        existingScene.transitions = this.mergeArrays(
                            existingScene.transitions || [],
                            importScene.transitions,
                            'id'
                        );
                    }

                    if (overwriteSettings && importScene.settings) {
                        existingScene.settings = importScene.settings;
                    }
                } else {
                    // Add new scene
                    mergedData.scenes.push(importScene);
                }
            });
        }

        // Merge other data
        if (importData.characters) {
            mergedData.characters = this.mergeArrays(
                mergedData.characters || [],
                importData.characters,
                'id'
            );
        }

        if (importData.items) {
            mergedData.items = this.mergeArrays(
                mergedData.items || [],
                importData.items,
                'id'
            );
        }

        return mergedData;
    }

    // Helper to merge arrays by ID
    mergeArrays(existing, incoming, idField = 'id') {
        const merged = [...existing];
        const existingIds = new Set(existing.map(item => item[idField]));

        incoming.forEach(item => {
            if (!existingIds.has(item[idField])) {
                merged.push(item);
            } else {
                // Replace existing item with same ID
                const index = merged.findIndex(e => e[idField] === item[idField]);
                if (index >= 0) {
                    merged[index] = item;
                }
            }
        });

        return merged;
    }

    // Import platforms to current scene
    importPlatforms(platformData) {
        const currentScene = this.game.sceneSystem?.currentScene;
        if (!currentScene) {
            alert('No scene selected');
            return false;
        }

        if (!platformData.platforms || !Array.isArray(platformData.platforms)) {
            alert('Invalid platform data');
            return false;
        }

        // Add platforms to current scene
        platformData.platforms.forEach(platform => {
            this.game.platformSystem.data.platforms.push(platform);
        });

        // Update UI
        this.game.platformSystem.updatePlatformList();
        console.log(`✅ Imported ${platformData.platforms.length} platforms`);
        return true;
    }

    // Import props to current scene
    importProps(propData) {
        const currentScene = this.game.sceneSystem?.currentScene;
        if (!currentScene) {
            alert('No scene selected');
            return false;
        }

        if (!propData.props || !Array.isArray(propData.props)) {
            alert('Invalid prop data');
            return false;
        }

        // Add props to current scene
        propData.props.forEach(prop => {
            this.game.propSystem.props.push(prop);
        });

        // Update UI
        this.game.propSystem.updatePropList();
        console.log(`✅ Imported ${propData.props.length} props`);
        return true;
    }

    // Import from URL
    async importFromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const gameData = await response.json();

            // Validate and apply
            if (this.dataSystem.validator.validateGameData(gameData)) {
                return this.dataSystem.applyGameData(gameData);
            } else {
                console.error('Invalid game data from URL');
                return false;
            }
        } catch (error) {
            console.error('Error importing from URL:', error);
            return false;
        }
    }

    // Import from clipboard
    async importFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const gameData = JSON.parse(text);

            if (this.dataSystem.validator.validateGameData(gameData)) {
                return this.dataSystem.applyGameData(gameData);
            } else {
                alert('Invalid game data in clipboard');
                return false;
            }
        } catch (error) {
            alert('Could not read clipboard or invalid JSON data');
            console.error('Clipboard import error:', error);
            return false;
        }
    }
}