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
            'Dawn2',
            'Dynamic_Space_Nebula_Aqua_Pink',
            'Dynamic_Space_Nebula_Blue',
            'Dynamic_Space_Nebula_Red',
            'Dynamic_Space_Stars_Small_1',
            'Dynamic_Space_Stars_Small_2',
            'Dynamic_Space_Stars_Big_1_1',
            'Dynamic_Space_Stars_Big_1_2',
            'Flay_Night_4_BG',
            'Mountains1',
            'Mountains2',
            'MountainWaterfall',
            'Parallax_Forest_Background_Blue',
            'PixelFantasy_Caves',
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
            case 'Dawn2':
                layerPaths = [];
                for (let i = 1; i <= 8; i++) {
                    layerPaths.push(`backgrounds/Dawn2/Layers/${i}.png`);
                }
                break;
            case 'Dynamic_Space_Nebula_Aqua_Pink':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Nebula Aqua-Pink.png'
                ];
                break;
            case 'Dynamic_Space_Nebula_Blue':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Nebula Blue.png'
                ];
                break;
            case 'Dynamic_Space_Nebula_Red':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Nebula Red.png'
                ];
                break;
            case 'Dynamic_Space_Stars_Small_1':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Stars Small_1.png'
                ];
                break;
            case 'Dynamic_Space_Stars_Small_2':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Stars Small_2.png'
                ];
                break;
            case 'Dynamic_Space_Stars_Big_1_1':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Stars-Big_1_1_PC.png'
                ];
                break;
            case 'Dynamic_Space_Stars_Big_1_2':
                layerPaths = [
                    'backgrounds/Dynamic Space Background/Stars-Big_1_2_PC.png'
                ];
                break;
            case 'Flay_Night_4_BG':
                layerPaths = [
                    'backgrounds/Flay Night 4 BG/Flat Night 4 BG.png'
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
            case 'Parallax_Forest_Background_Blue':
                layerPaths = [
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/01_Mist.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/02_Bushes.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/03_Particles.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/04_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/05_Particles.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/06_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/07_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/08_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/09_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/10_Sky.png'
                ];
                break;
            case 'PixelFantasy_Caves':
                layerPaths = [
                    'backgrounds/PixelFantasy_Caves_1.0/background1.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background2.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background3.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background4a.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background4b.png'
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
                console.log(`✅ Background layer loaded: ${path} (${background.layersLoaded}/${background.totalLayers})`);
                console.log(`   Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
            };
            img.onerror = (error) => {
                console.error(`❌ Failed to load background layer: ${path}`, error);
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
            // Get default background color from current scene settings
            const currentScene = this.game.sceneSystem?.data?.getCurrentScene();
            const defaultColor = currentScene?.settings?.defaultBackgroundColor || '#87CEEB'; // Fallback to sky blue

            this.ctx.fillStyle = defaultColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const background = this.currentBackground;

        // Special handling for space backgrounds - fill with black first
        if (background.name && background.name.startsWith('Dynamic_Space_')) {
            this.ctx.fillStyle = '#000000'; // Black space background
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Render each background layer with different parallax speeds
        // For parallax backgrounds, use a custom layer strategy since each layer is a full opaque image
        let layersToRender;
        if (background.name === 'Parallax_Forest_Background_Blue') {
            // For forest: render all layers naturally (they have transparency)
            layersToRender = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]; // Sky to foreground (back to front)
        } else {
            layersToRender = [...Array(background.layers.length).keys()];
        }

        for (let i = 0; i < layersToRender.length; i++) {
            const index = layersToRender[i];
            const layer = background.layers[index];
            if (!layer.complete || !layer.naturalWidth) {
                return; // Skip if not loaded
            }

            // Calculate parallax offset for this layer
            // Background layers (lower index) move slower, foreground layers (higher index) move faster
            // For 8 layers (0-7), we want speeds like: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8
            const totalLayers = background.layers.length;
            const parallaxSpeed = (index + 1) / (totalLayers + 2); // Creates speeds from ~0.11 to ~0.8

            // Get camera position
            const cameraX = this.game.cameraSystem?.x || 0;

            // Calculate parallax offset - background layers move slower than camera
            const parallaxOffset = cameraX * parallaxSpeed;

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


                try {
                    if (background.name === 'Parallax_Forest_Background_Blue') {
                        // Natural forest background rendering - layers have built-in transparency
                        this.ctx.globalCompositeOperation = 'source-over';
                        this.ctx.globalAlpha = 1.0; // Use full alpha, let layer transparency handle blending

                        this.ctx.drawImage(
                            layer,
                            x, 0,
                            scaledWidth, this.canvas.height
                        );

                    } else {
                        // For other backgrounds, use normal drawing
                        this.ctx.globalCompositeOperation = 'source-over';
                        this.ctx.globalAlpha = 1.0;
                        this.ctx.drawImage(
                            layer,
                            x, 0,
                            scaledWidth, this.canvas.height
                        );
                    }

                } catch (error) {
                    console.error(`🏞️ Error drawing layer ${index}:`, error);
                }

                // Reset alpha and blending for next layer
                this.ctx.globalAlpha = 1.0;
                this.ctx.globalCompositeOperation = 'source-over';
            }
        }
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

    // Initialize background selection modal
    initializeBackgroundModal() {
        const modal = document.getElementById('backgroundSelectionModal');
        const closeBtn = document.getElementById('closeBackgroundSelectionModal');
        const selectBtn = document.getElementById('selectBackgroundBtn');
        const applyBtn = document.getElementById('applyBackgroundBtn');

        // Set up event listeners
        if (selectBtn) {
            selectBtn.addEventListener('click', () => {
                this.openBackgroundModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeBackgroundModal();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applySelectedBackground();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeBackgroundModal();
                }
            });
        }
    }

    openBackgroundModal() {
        const modal = document.getElementById('backgroundSelectionModal');
        if (!modal) return;

        // Render background thumbnails
        this.renderBackgroundThumbnails();

        // Show modal
        modal.style.display = 'block';

        // Reset selection
        this.selectedBackgroundForModal = null;
        document.getElementById('selectedBackgroundConfig').style.display = 'none';
        document.getElementById('noBackgroundSelected').style.display = 'block';
    }

    closeBackgroundModal() {
        const modal = document.getElementById('backgroundSelectionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    renderBackgroundThumbnails() {
        const gridContainer = document.querySelector('.backgrounds-grid');
        if (!gridContainer) return;

        // Clear existing thumbnails
        gridContainer.innerHTML = '';

        // Create thumbnails for each background
        this.availableBackgrounds.forEach(backgroundName => {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'background-thumbnail';
            thumbnailDiv.style.cssText = `
                border: 2px solid #444;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                overflow: hidden;
                background-color: #222;
            `;

            // Create canvas for thumbnail
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 120;
            canvas.style.cssText = 'width: 100%; height: 120px; display: block;';

            // Create label
            const label = document.createElement('div');
            label.style.cssText = `
                padding: 8px;
                text-align: center;
                background-color: #333;
                color: white;
                font-size: 12px;
                font-weight: bold;
            `;
            label.textContent = backgroundName === 'none' ? 'None' : this.formatBackgroundName(backgroundName);

            thumbnailDiv.appendChild(canvas);
            thumbnailDiv.appendChild(label);

            // Render thumbnail
            this.renderBackgroundThumbnail(canvas, backgroundName);

            // Add click handler
            thumbnailDiv.addEventListener('click', () => {
                this.selectBackgroundForModal(backgroundName, thumbnailDiv);
            });

            // Add hover effect
            thumbnailDiv.addEventListener('mouseenter', () => {
                if (!thumbnailDiv.classList.contains('selected')) {
                    thumbnailDiv.style.borderColor = '#666';
                    thumbnailDiv.style.transform = 'scale(1.05)';
                }
            });

            thumbnailDiv.addEventListener('mouseleave', () => {
                if (!thumbnailDiv.classList.contains('selected')) {
                    thumbnailDiv.style.borderColor = '#444';
                    thumbnailDiv.style.transform = 'scale(1)';
                }
            });

            gridContainer.appendChild(thumbnailDiv);
        });
    }

    renderBackgroundThumbnail(canvas, backgroundName) {
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (backgroundName === 'none') {
            // Draw "None" background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No Background', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Get or load background data
        const background = this.backgrounds[backgroundName];
        if (!background || background.layers.length === 0) {
            // If not loaded, create a temporary load for thumbnail
            this.loadBackgroundForThumbnail(backgroundName, canvas);
            return;
        }

        // Render the background layers as a thumbnail
        this.renderBackgroundLayers(ctx, background, canvas.width, canvas.height);
    }

    loadBackgroundForThumbnail(backgroundName, canvas) {
        const ctx = canvas.getContext('2d');

        // Show loading state
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);

        // Get all layer paths for this background
        let layerPaths = [];

        switch(backgroundName) {
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
            case 'Dawn2':
                for (let i = 1; i <= 8; i++) {
                    layerPaths.push(`backgrounds/Dawn2/Layers/${i}.png`);
                }
                break;
            case 'Dynamic_Space_Nebula_Aqua_Pink':
                layerPaths = ['backgrounds/Dynamic Space Background/Nebula Aqua-Pink.png'];
                break;
            case 'Dynamic_Space_Nebula_Blue':
                layerPaths = ['backgrounds/Dynamic Space Background/Nebula Blue.png'];
                break;
            case 'Dynamic_Space_Nebula_Red':
                layerPaths = ['backgrounds/Dynamic Space Background/Nebula Red.png'];
                break;
            case 'Dynamic_Space_Stars_Small_1':
                layerPaths = ['backgrounds/Dynamic Space Background/Stars Small_1.png'];
                break;
            case 'Dynamic_Space_Stars_Small_2':
                layerPaths = ['backgrounds/Dynamic Space Background/Stars Small_2.png'];
                break;
            case 'Dynamic_Space_Stars_Big_1_1':
                layerPaths = ['backgrounds/Dynamic Space Background/Stars-Big_1_1_PC.png'];
                break;
            case 'Dynamic_Space_Stars_Big_1_2':
                layerPaths = ['backgrounds/Dynamic Space Background/Stars-Big_1_2_PC.png'];
                break;
            case 'Flay_Night_4_BG':
                layerPaths = ['backgrounds/Flay Night 4 BG/Flat Night 4 BG.png'];
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
            case 'Parallax_Forest_Background_Blue':
                layerPaths = [
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/10_Sky.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/09_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/08_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/07_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/06_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/05_Particles.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/04_Forest.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/03_Particles.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/02_Bushes.png',
                    'backgrounds/Parallax Forest Background/Parallax Forest Background - Blue/01_Mist.png'
                ];
                break;
            case 'PixelFantasy_Caves':
                layerPaths = [
                    'backgrounds/PixelFantasy_Caves_1.0/background1.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background2.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background3.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background4a.png',
                    'backgrounds/PixelFantasy_Caves_1.0/background4b.png'
                ];
                break;
            case 'The Dawn':
                for (let i = 1; i <= 8; i++) {
                    layerPaths.push(`backgrounds/The Dawn/The Dawn/Layers/${i}.png`);
                }
                break;
        }

        if (layerPaths.length > 0) {
            // Load all layers for proper thumbnail
            const layers = [];
            let loadedCount = 0;

            const drawAllLayers = () => {
                console.log(`🖼️ Drawing thumbnail for ${backgroundName}, ${layers.length} layers loaded`);
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Fill background first (for space backgrounds)
                if (backgroundName.startsWith('Dynamic_Space_')) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Draw all layers in order
                let successCount = 0;
                layers.forEach((img, index) => {
                    if (!img.complete || !img.naturalWidth) {
                        console.warn(`🖼️ Layer ${index} skipped: complete=${img.complete}, naturalWidth=${img.naturalWidth}`);
                        return;
                    }

                    // IMPORTANT: Use naturalWidth/naturalHeight for Image objects
                    // img.width and img.height can be 0 if the image hasn't been added to DOM
                    // naturalWidth/naturalHeight contain the actual loaded image dimensions
                    const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
                    const scaledWidth = img.naturalWidth * scale;
                    const scaledHeight = img.naturalHeight * scale;
                    const x = (canvas.width - scaledWidth) / 2;
                    const y = (canvas.height - scaledHeight) / 2;

                    console.log(`🖼️ Drawing layer ${index}: ${img.naturalWidth}x${img.naturalHeight} -> ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)} at (${x.toFixed(1)}, ${y.toFixed(1)})`);

                    // For Parallax Forest, render in reverse order (sky first)
                    if (backgroundName === 'Parallax_Forest_Background_Blue') {
                        ctx.globalAlpha = 1.0;
                    }

                    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                    successCount++;
                });

                console.log(`🖼️ Successfully drew ${successCount}/${layers.length} layers for ${backgroundName}`);
                ctx.globalAlpha = 1.0;
            };

            console.log(`📦 Starting to load ${layerPaths.length} layers for ${backgroundName}`);

            layerPaths.forEach((path, index) => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    console.log(`✅ Thumbnail layer ${index} loaded: ${path} (${loadedCount}/${layerPaths.length})`);
                    console.log(`   Checking: loadedCount=${loadedCount}, layerPaths.length=${layerPaths.length}, equal=${loadedCount === layerPaths.length}`);
                    if (loadedCount === layerPaths.length) {
                        // All layers loaded, draw them
                        console.log(`🎨 All ${layerPaths.length} layers loaded for ${backgroundName}, drawing now...`);
                        setTimeout(() => drawAllLayers(), 0); // Use setTimeout to ensure all images are fully ready
                    }
                };
                img.onerror = (error) => {
                    loadedCount++;
                    console.error(`❌ Failed to load thumbnail layer ${index}: ${path}`, error);
                    if (loadedCount === layerPaths.length) {
                        // Even with errors, draw what we have
                        console.log(`⚠️ All layers processed for ${backgroundName} (with errors), drawing...`);
                        drawAllLayers();
                    }
                };
                img.src = path;
                layers[index] = img;
            });
        }
    }

    renderBackgroundLayers(ctx, background, width, height) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Special handling for space backgrounds
        if (background.name && background.name.startsWith('Dynamic_Space_')) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
        }

        // Determine layer rendering order
        // For Parallax Forest, render back to front (sky first)
        let layersToRender;
        if (background.name === 'Parallax_Forest_Background_Blue') {
            // Sky to foreground (back to front)
            layersToRender = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
        } else {
            // Normal order for other backgrounds
            layersToRender = [...Array(background.layers.length).keys()];
        }

        // Render each layer
        for (let i = 0; i < layersToRender.length; i++) {
            const index = layersToRender[i];
            const layer = background.layers[index];

            if (!layer.complete || !layer.naturalWidth) {
                continue;
            }

            // Calculate scaling to fit thumbnail
            const scale = Math.min(width / layer.naturalWidth, height / layer.naturalHeight);
            const scaledWidth = layer.naturalWidth * scale;
            const scaledHeight = layer.naturalHeight * scale;
            const x = (width - scaledWidth) / 2;
            const y = (height - scaledHeight) / 2;

            ctx.drawImage(layer, x, y, scaledWidth, scaledHeight);
        }
    }

    selectBackgroundForModal(backgroundName, thumbnailDiv) {
        // Remove previous selection
        document.querySelectorAll('.background-thumbnail').forEach(thumb => {
            thumb.classList.remove('selected');
            thumb.style.borderColor = '#444';
            thumb.style.transform = 'scale(1)';
        });

        // Add selection to clicked thumbnail
        thumbnailDiv.classList.add('selected');
        thumbnailDiv.style.borderColor = '#4CAF50';
        thumbnailDiv.style.transform = 'scale(1.05)';

        // Store selected background
        this.selectedBackgroundForModal = backgroundName;

        // Update UI
        document.getElementById('selectedBackgroundName').textContent =
            backgroundName === 'none' ? 'None' : this.formatBackgroundName(backgroundName);
        document.getElementById('selectedBackgroundConfig').style.display = 'block';
        document.getElementById('noBackgroundSelected').style.display = 'none';
    }

    applySelectedBackground() {
        if (this.selectedBackgroundForModal === null || this.selectedBackgroundForModal === undefined) {
            return;
        }

        // Load the selected background
        this.loadBackground(this.selectedBackgroundForModal);

        // Update the current scene's background setting
        const currentScene = this.game.sceneSystem?.data?.getCurrentScene();
        if (currentScene) {
            currentScene.settings.backgroundName = this.selectedBackgroundForModal;
            currentScene.metadata.modified = new Date().toISOString();

            // Save the scene
            if (this.game.sceneSystem) {
                this.game.sceneSystem.saveScenes();
            }
        }

        // Update the display name in the dashboard (main background display)
        const currentBgNameSpan = document.getElementById('currentBackgroundName');
        if (currentBgNameSpan) {
            currentBgNameSpan.textContent = this.selectedBackgroundForModal === 'none' ?
                'None' : this.formatBackgroundName(this.selectedBackgroundForModal);
        }

        // Update the display name in scene properties
        const sceneBgNameSpan = document.getElementById('currentSceneBackgroundName');
        if (sceneBgNameSpan) {
            sceneBgNameSpan.textContent = this.selectedBackgroundForModal === 'none' ?
                'None' : this.formatBackgroundName(this.selectedBackgroundForModal);
        }

        console.log(`🖼️ Applied background: ${this.selectedBackgroundForModal}`);

        // Close the modal
        this.closeBackgroundModal();
    }
}