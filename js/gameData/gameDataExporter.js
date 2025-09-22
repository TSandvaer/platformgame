class GameDataExporter {
    constructor(gameDataSystem) {
        this.dataSystem = gameDataSystem;
        this.game = gameDataSystem.game;
    }

    initialize() {
        // Set up any export-specific initialization
    }

    // Export game data to JSON file
    exportToFile(gameData, filename = 'gameData.json') {
        try {
            // Beautify the JSON for readability
            const dataStr = JSON.stringify(gameData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.generateFilename(filename);

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            console.log(`📥 Exported game data to ${link.download}`);
            return true;
        } catch (error) {
            console.error('Error exporting game data:', error);
            alert('Failed to export game data. Please try again.');
            return false;
        }
    }

    // Generate filename with timestamp
    generateFilename(baseFilename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const nameParts = baseFilename.split('.');
        const extension = nameParts.pop();
        const name = nameParts.join('.');
        return `${name}_${timestamp}.${extension}`;
    }

    // Export specific scene
    exportScene(sceneId, filename = 'scene.json') {
        const scene = this.game.sceneSystem?.data.getScene(sceneId);
        if (!scene) {
            console.error(`Scene ${sceneId} not found`);
            return false;
        }

        const sceneData = {
            gameInfo: {
                title: "Platform RPG Scene Export",
                version: "1.0.0",
                exportDate: new Date().toISOString().split('T')[0]
            },
            scene: scene
        };

        return this.exportToFile(sceneData, `scene_${scene.name}_export.json`);
    }

    // Export only platforms
    exportPlatforms(filename = 'platforms.json') {
        const currentScene = this.game.sceneSystem?.currentScene;
        if (!currentScene) {
            console.error('No current scene');
            return false;
        }

        const platformData = {
            sceneId: currentScene.id,
            sceneName: currentScene.name,
            platforms: currentScene.platforms || [],
            exportDate: new Date().toISOString()
        };

        return this.exportToFile(platformData, filename);
    }

    // Export only props
    exportProps(filename = 'props.json') {
        const currentScene = this.game.sceneSystem?.currentScene;
        if (!currentScene) {
            console.error('No current scene');
            return false;
        }

        const propData = {
            sceneId: currentScene.id,
            sceneName: currentScene.name,
            props: currentScene.props || [],
            exportDate: new Date().toISOString()
        };

        return this.exportToFile(propData, filename);
    }

    // Export as HTML playable version
    exportAsHTML(gameData) {
        // This would generate a standalone HTML file with the game
        // For now, just export the data with HTML template info
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>${gameData.gameInfo.title}</title>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script>
        // Embedded game data
        const gameData = ${JSON.stringify(gameData, null, 2)};

        // Game initialization would go here
        console.log('Game data loaded:', gameData);
        alert('HTML export feature coming soon!');
    </script>
</body>
</html>`;

        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${gameData.gameInfo.title.replace(/\s+/g, '_')}_game.html`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📦 Exported as HTML (template only for now)');
    }

    // Export for version control (minimal format)
    exportForVersionControl(gameData) {
        // Remove redundant or generated data for cleaner version control
        const cleanData = {
            gameInfo: gameData.gameInfo,
            scenes: gameData.scenes.map(scene => ({
                id: scene.id,
                name: scene.name,
                platforms: scene.platforms?.map(p => ({
                    id: p.id,
                    x: p.x,
                    y: p.y,
                    width: p.width,
                    height: p.height,
                    spriteType: p.spriteType,
                    positioning: p.positioning
                })),
                props: scene.props?.map(p => ({
                    id: p.id,
                    type: p.type,
                    x: p.x,
                    y: p.y,
                    sizeMultiplier: p.sizeMultiplier,
                    isObstacle: p.isObstacle
                })),
                transitions: scene.transitions,
                settings: scene.settings,
                boundaries: scene.boundaries
            })),
            currentSceneId: gameData.currentSceneId,
            startSceneId: gameData.startSceneId
        };

        return this.exportToFile(cleanData, 'gameData_clean.json');
    }

    // Export statistics
    exportStatistics() {
        const stats = this.gatherStatistics();
        return this.exportToFile(stats, 'game_statistics.json');
    }

    // Gather game statistics
    gatherStatistics() {
        const scenes = this.game.sceneSystem?.data.scenes || [];

        return {
            exportDate: new Date().toISOString(),
            gameInfo: this.dataSystem.gameData.gameInfo,
            statistics: {
                totalScenes: scenes.length,
                totalPlatforms: scenes.reduce((sum, s) => sum + (s.platforms?.length || 0), 0),
                totalProps: scenes.reduce((sum, s) => sum + (s.props?.length || 0), 0),
                totalTransitions: scenes.reduce((sum, s) => sum + (s.transitions?.length || 0), 0),
                scenesBreakdown: scenes.map(s => ({
                    id: s.id,
                    name: s.name,
                    platforms: s.platforms?.length || 0,
                    props: s.props?.length || 0,
                    transitions: s.transitions?.length || 0
                })),
                storageSize: this.dataSystem.storage.getStorageSize() + ' KB'
            }
        };
    }
}