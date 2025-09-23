class BackgroundSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;

        // Background management
        this.backgrounds = {};
        this.currentBackground = null;
        this.availableBackgrounds = [];

        this.loadAvailableBackgrounds();
    }

    loadAvailableBackgrounds() {
        // Available backgrounds found in the backgrounds folder
        this.availableBackgrounds = [
            'none',
            'DarkForest',
            'Mountains1',
            'Mountains2',
            'MountainWaterfall',
            'The Dawn'
        ];
    }

    loadBackground(backgroundName) {
        if (backgroundName === 'none' || !backgroundName) {
            this.currentBackground = null;
            return;
        }

        if (this.backgrounds[backgroundName]) {
            this.currentBackground = this.backgrounds[backgroundName];
            return;
        }

        // Load background layers based on background type
        const background = {
            name: backgroundName,
            layers: [],
            layersLoaded: 0,
            totalLayers: 0
        };

        let layerPaths = [];

        // Define layer paths for each background type
        switch (backgroundName) {
            case 'DarkForest':
                layerPaths = [
                    'backgrounds/DarkForest/layers/sky.png',
                    'backgrounds/DarkForest/layers/clouds_1.png',
                    'backgrounds/DarkForest/layers/clouds_2.png',
                    'backgrounds/DarkForest/layers/rocks.png',
                    'backgrounds/DarkForest/layers/ground_3.png',
                    'backgrounds/DarkForest/layers/ground_2.png',
                    'backgrounds/DarkForest/layers/ground_1.png',
                    'backgrounds/DarkForest/layers/plant.png'
                ];
                break;
            case 'Mountains1':
                layerPaths = [
                    'backgrounds/Mountains1/layers/sky.png',
                    'backgrounds/Mountains1/layers/clouds_4.png',
                    'backgrounds/Mountains1/layers/clouds_3.png',
                    'backgrounds/Mountains1/layers/clouds_2.png',
                    'backgrounds/Mountains1/layers/clouds_1.png',
                    'backgrounds/Mountains1/layers/rocks_2.png',
                    'backgrounds/Mountains1/layers/rocks_1.png'
                ];
                break;
            case 'Mountains2':
                layerPaths = [
                    'backgrounds/Mountains2/layers/sky.png',
                    'backgrounds/Mountains2/layers/clouds_3.png',
                    'backgrounds/Mountains2/layers/clouds_2.png',
                    'backgrounds/Mountains2/layers/clouds_1.png',
                    'backgrounds/Mountains2/layers/birds.png',
                    'backgrounds/Mountains2/layers/rocks_3.png',
                    'backgrounds/Mountains2/layers/rocks_2.png',
                    'backgrounds/Mountains2/layers/rocks_1.png',
                    'backgrounds/Mountains2/layers/pines.png'
                ];
                break;
            case 'MountainWaterfall':
                layerPaths = [
                    'backgrounds/MountainWaterfall/layers/sky.png',
                    'backgrounds/MountainWaterfall/layers/clouds_2.png',
                    'backgrounds/MountainWaterfall/layers/clouds_1.png',
                    'backgrounds/MountainWaterfall/layers/rocks.png',
                    'backgrounds/MountainWaterfall/layers/ground.png'
                ];
                break;
            case 'The Dawn':
                layerPaths = [];
                for (let i = 1; i <= 8; i++) {
                    layerPaths.push(`backgrounds/The Dawn/The Dawn/Layers/${i}.png`);
                }
                break;
            default:
                console.warn(`Unknown background: ${backgroundName}`);
                return;
        }

        background.totalLayers = layerPaths.length;

        // Load each layer
        layerPaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                background.layersLoaded++;
            };
            img.onerror = (error) => {
                console.warn(`Failed to load background layer: ${path}`);
            };
            img.src = path;
            background.layers.push(img);
        });

        this.backgrounds[backgroundName] = background;
        this.currentBackground = background;
    }

    render() {
        // Reset any transforms to ensure clean slate
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (!this.currentBackground || !this.currentBackground.layers.length) {
            // Render a default sky color instead of transparent
            this.ctx.fillStyle = '#87CEEB'; // Sky blue
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const background = this.currentBackground;

        // Render each background layer with different parallax speeds
        background.layers.forEach((layer, index) => {
            if (!layer.complete || !layer.naturalWidth) return; // Skip if not loaded

            // Calculate parallax offset for this layer
            // Layers closer to the back (lower index) move slower
            const parallaxSpeed = (index + 1) * 0.1; // 0.1, 0.2, 0.3, etc.
            // Scale the camera offset by viewport scale to maintain consistent parallax
            // Use safety fallback for viewport scale in case it's not initialized
            const viewportScale = this.game.viewport?.scaleX || 1;
            const cameraX = this.game.cameraSystem?.x || 0;
            const scaledCameraX = cameraX * viewportScale;
            const parallaxOffset = scaledCameraX * parallaxSpeed;

            // Calculate how many times we need to repeat the image to fill the screen
            const imageWidth = layer.naturalWidth;
            const imageHeight = layer.naturalHeight;

            // Scale the image to fit the canvas height while maintaining aspect ratio
            const scale = this.canvas.height / imageHeight;
            const scaledWidth = imageWidth * scale;

            // Calculate starting position to ensure seamless repetition
            const startX = -parallaxOffset % scaledWidth;
            const tilesNeeded = Math.ceil((this.canvas.width + scaledWidth) / scaledWidth);

            // Draw repeated background tiles - always fill entire canvas
            for (let i = 0; i < tilesNeeded; i++) {
                const x = startX + (i * scaledWidth);
                this.ctx.drawImage(
                    layer,
                    x, 0,  // Always start at Y=0 (top of canvas)
                    scaledWidth, this.canvas.height  // Always fill full canvas height
                );
            }
        });
    }

    populateDropdown() {
        const backgroundSelect = document.getElementById('backgroundSelect');
        if (!backgroundSelect) return;

        // Clear existing options except "none"
        backgroundSelect.innerHTML = '<option value="none">None</option>';

        // Add all available backgrounds
        this.availableBackgrounds.slice(1).forEach(backgroundName => {
            const option = document.createElement('option');
            option.value = backgroundName;
            option.textContent = this.formatBackgroundName(backgroundName);
            backgroundSelect.appendChild(option);
        });
    }

    formatBackgroundName(name) {
        // Convert camelCase to readable format
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    // Get current background for scene system
    getCurrentBackground() {
        return this.currentBackground;
    }

    // Get available backgrounds list
    getAvailableBackgrounds() {
        return this.availableBackgrounds;
    }
}