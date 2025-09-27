class PlatformRenderer {
    constructor(ctx, onSpritesLoadedCallback) {
        this.ctx = ctx;
        this.onSpritesLoadedCallback = onSpritesLoadedCallback;

        // Initialize platform sprites
        this.platformSprites = {
            tileset: { image: null, tileWidth: 16, tileHeight: 16 },
            villageProps: { image: null, tileWidth: 32, tileHeight: 32 },
        };
        this.spritesLoaded = false;
        this.loadSprites();

        // Platform sprite type mappings - based on actual tileset layout
        this.platformSpriteTypes = {
            color: { tileset: 'none', tileX: -1, tileY: -1 }, // Use solid color instead
            transparent: { tileset: 'none', tileX: -2, tileY: -2 }, // Special transparent type

            // Stone/Rock textures (examining first few rows for stone-like textures)
            cobblestone: { tileset: 'tileset', tileX: 6, tileY: 1 }, // Actually cobblestone texture
            darkStone: { tileset: 'tileset', tileX: 1, tileY: 0 }, // Dark stone variation
            lightStone: { tileset: 'tileset', tileX: 2, tileY: 0 }, // Light stone variation
            bricks: { tileset: 'tileset', tileX: 0, tileY: 3 }, // Actually brick pattern
            roughStone: { tileset: 'tileset', tileX: 3, tileY: 0 }, // Rough stone

            // Ground/Dirt textures (looking for brown/earthy textures)
            dirt: { tileset: 'tileset', tileX: 21, tileY: 22 }, // Brown/dirt texture
            grass: { tileset: 'tileset', tileX: 20, tileY: 22 }, // Green grass-like texture
            sand: { tileset: 'tileset', tileX: 2, tileY: 2 }, // Sandy/tan texture
            mud: { tileset: 'tileset', tileX: 3, tileY: 2 }, // Darker mud texture

            // Wood textures
            wood: { tileset: 'tileset', tileX: 4, tileY: 1 }, // Wood plank texture
            darkWood: { tileset: 'tileset', tileX: 5, tileY: 1 }, // Dark wood variation
            logs: { tileset: 'tileset', tileX: 4, tileY: 0 }, // Log-like texture

            // Ice/Crystal textures
            ice: { tileset: 'tileset', tileX: 7, tileY: 3 }, // Blue ice-like texture
            crystal: { tileset: 'tileset', tileX: 6, tileY: 3 }, // Crystal/gem texture

            // Metal textures
            metal: { tileset: 'tileset', tileX: 5, tileY: 0 }, // Metal/steel texture
            rust: { tileset: 'tileset', tileX: 7, tileY: 0 }, // Rusty metal texture

            // Mossy/overgrown textures
            moss: { tileset: 'tileset', tileX: 0, tileY: 2 }, // Mossy stone
            vines: { tileset: 'tileset', tileX: 7, tileY: 1 }, // Vine-covered texture

            // Fancy/decorative textures
            gold: { tileset: 'tileset', tileX: 6, tileY: 2 }, // Gold/fancy texture
            pattern: { tileset: 'tileset', tileX: 5, tileY: 3 }, // Decorative pattern

            // Path/Road textures
            path: { tileset: 'tileset', tileX: 3, tileY: 1 }, // Path/road texture
            tiles: { tileset: 'tileset', tileX: 2, tileY: 3 }, // Tile flooring

            // Natural stone variations
            granite: { tileset: 'tileset', tileX: 6, tileY: 0 }, // Granite-like texture
            slate: { tileset: 'tileset', tileX: 1, tileY: 3 }, // Slate/shale texture
            sandstone: { tileset: 'tileset', tileX: 3, tileY: 3 }, // Sandstone texture
            limestone: { tileset: 'tileset', tileX: 4, tileY: 3 }, // Limestone texture

            // Special/Magic textures
            lava: { tileset: 'tileset', tileX: 7, tileY: 13 }, // Lava/hot texture
            magic: { tileset: 'tileset', tileX: 5, tileY: 2 }, // Magical/glowing texture
            water: { tileset: 'tileset', tileX: 4, tileY: 2 }, // Water texture

            // Village Props tileset options
            roof: { tileset: 'villageProps', tileX: 0, tileY: 0 }, // Roof tiles
            wall: { tileset: 'villageProps', tileX: 1, tileY: 0 }, // Wall texture
            floor: { tileset: 'villageProps', tileX: 2, tileY: 0 }, // Floor boards
            fence: { tileset: 'villageProps', tileX: 3, tileY: 0 }, // Fence texture
            bridge: { tileset: 'villageProps', tileX: 4, tileY: 0 }, // Bridge planks
        };
    }

    loadSprites() {
        let loadedCount = 0;
        const totalImages = 2; // Only tileset and villageProps for platforms

        const checkAllLoaded = () => {
            if (loadedCount === totalImages) {
                this.spritesLoaded = true;
                if (this.onSpritesLoadedCallback) {
                    this.onSpritesLoadedCallback();
                }
            }
        };

        // Load ground tileset
        const groundImg = new Image();
        groundImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        groundImg.onerror = () => {
            console.error('Failed to load ground tileset');
        };
        groundImg.src = 'textures_02_08_25.png';
        this.platformSprites.tileset.image = groundImg;

        // Load village props tileset
        const propsImg = new Image();
        propsImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        propsImg.onerror = () => {
            console.error('Failed to load village props tileset');
        };
        propsImg.src = 'sprites/Pixel Art Platformer/Texture/TX Village Props.png';
        this.platformSprites.villageProps.image = propsImg;
    }

    renderPlatform(platform, isDevelopmentMode, isSelected) {
        if (platform.spriteType === 'transparent') {
            // Handle transparent platforms
            if (isDevelopmentMode) {
                this.drawTransparentPlatform(platform);
            }
            // In production mode, transparent platforms are invisible (no rendering)
        } else if (platform.spriteType !== 'color' && this.platformSprites.tileset.image) {
            this.drawPlatformSprite(platform);
        } else {
            // Fallback to solid color
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        if (isDevelopmentMode) {
            // For transparent platforms, always show a subtle border so they're visible in dev mode
            if (platform.spriteType === 'transparent') {
                this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([3, 3]);
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
                this.ctx.setLineDash([]);
            }

            // Draw damage indicator for platforms with damage > 0
            if (platform.damagePerSecond > 0) {
                this.ctx.strokeStyle = '#FF4444';
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(platform.x - 2, platform.y - 2, platform.width + 4, platform.height + 4);
                this.ctx.setLineDash([]);

                // Draw damage text indicator
                this.ctx.fillStyle = '#FF4444';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`🔥 ${platform.damagePerSecond} DPS`,
                    platform.x + platform.width / 2,
                    platform.y - 8);
            }

            if (isSelected) {
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

                // Draw resize handles
                this.drawResizeHandles(platform);
            }
        }
    }

    drawPlatformSprite(platform) {
        // Get sprite type info
        const spriteInfo = this.platformSpriteTypes[platform.spriteType];
        if (!spriteInfo || spriteInfo.tileX === -1) return;

        // Get the correct tileset based on sprite info
        let tileset;
        if (spriteInfo.tileset === 'villageProps') {
            tileset = this.platformSprites.villageProps;
        } else {
            tileset = this.platformSprites.tileset;
        }

        if (!tileset.image) return;

        const sourceTileWidth = tileset.tileWidth;  // Source size (16x16)
        const sourceTileHeight = tileset.tileHeight;

        // Display tiles as 32x32 regardless of source size
        const displayTileWidth = 32;
        const displayTileHeight = 32;

        // Calculate how many tiles we need to fill the platform (based on display size)
        const tilesX = Math.ceil(platform.width / displayTileWidth);
        const tilesY = Math.ceil(platform.height / displayTileHeight);

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Draw tiled sprite
        for (let tileY = 0; tileY < tilesY; tileY++) {
            for (let tileX = 0; tileX < tilesX; tileX++) {
                // Calculate position without flooring to prevent gaps
                const drawX = platform.x + (tileX * displayTileWidth);
                const drawY = platform.y + (tileY * displayTileHeight);

                // Calculate the width and height to draw (handle partial tiles at edges)
                const remainingWidth = platform.width - (tileX * displayTileWidth);
                const remainingHeight = platform.height - (tileY * displayTileHeight);

                // Use a small overlap only for non-edge tiles to prevent seams
                const isEdgeTileX = (tileX === tilesX - 1) || remainingWidth <= displayTileWidth;
                const isEdgeTileY = (tileY === tilesY - 1) || remainingHeight <= displayTileHeight;

                const overlapX = isEdgeTileX ? 0 : 0.5;
                const overlapY = isEdgeTileY ? 0 : 0.5;

                const drawWidth = Math.min(displayTileWidth + overlapX, remainingWidth);
                const drawHeight = Math.min(displayTileHeight + overlapY, remainingHeight);

                // Only draw if the tile would be visible
                if (drawWidth > 0 && drawHeight > 0) {
                    // Use source dimensions for reading from texture, display dimensions for rendering
                    // Add an inset to the source to prevent bleeding from adjacent tiles
                    // Larger inset needed for tiles that have strong color differences with neighbors
                    const sourceInset = 0.5; // Half pixel inset to ensure no bleeding
                    const sourceX = spriteInfo.tileX * sourceTileWidth + sourceInset;
                    const sourceY = spriteInfo.tileY * sourceTileHeight + sourceInset;
                    const sourceW = sourceTileWidth - (sourceInset * 2);
                    const sourceH = sourceTileHeight - (sourceInset * 2);

                    this.ctx.drawImage(
                        tileset.image,
                        sourceX, sourceY, // Source position with tiny inset
                        sourceW, sourceH, // Source size slightly reduced to avoid bleeding
                        Math.round(drawX), Math.round(drawY), // Round destination position to avoid sub-pixel rendering
                        Math.ceil(drawWidth), Math.ceil(drawHeight) // Ceiling to ensure full coverage
                    );
                }
            }
        }

        // Keep image smoothing disabled for crisp pixel art
        // Note: Re-enabling is handled by other renderers if needed
    }

    drawTransparentPlatform(platform) {
        // Save the current context state
        this.ctx.save();

        // Set global alpha for semi-transparency
        this.ctx.globalAlpha = 0.3;

        // Draw checkered pattern
        const checkerSize = 8; // Size of each checker square

        // Calculate how many checkers fit in the platform
        const checkersX = Math.ceil(platform.width / checkerSize);
        const checkersY = Math.ceil(platform.height / checkerSize);

        for (let i = 0; i < checkersX; i++) {
            for (let j = 0; j < checkersY; j++) {
                // Alternate colors in a checkerboard pattern
                const isLight = (i + j) % 2 === 0;
                this.ctx.fillStyle = isLight ? '#CCCCCC' : '#888888';

                // Calculate actual checker position and size (clipped to platform bounds)
                const checkerX = platform.x + (i * checkerSize);
                const checkerY = platform.y + (j * checkerSize);
                const checkerW = Math.min(checkerSize, platform.x + platform.width - checkerX);
                const checkerH = Math.min(checkerSize, platform.y + platform.height - checkerY);

                // Only draw if the checker is within platform bounds
                if (checkerW > 0 && checkerH > 0) {
                    this.ctx.fillRect(checkerX, checkerY, checkerW, checkerH);
                }
            }
        }

        // Restore the context state
        this.ctx.restore();
    }

    drawResizeHandles(platform) {
        const handleSize = 8;
        this.ctx.fillStyle = '#FFD700';

        // Draw corner handles - positioned exactly at platform corners
        const handles = [
            { x: platform.x, y: platform.y },                                        // Top-left
            { x: platform.x + platform.width, y: platform.y },                      // Top-right
            { x: platform.x, y: platform.y + platform.height },                     // Bottom-left
            { x: platform.x + platform.width, y: platform.y + platform.height }     // Bottom-right
        ];

        handles.forEach(handle => {
            this.ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
        });

        // Draw edge handles - positioned exactly at platform edge centers
        const edgeHandles = [
            { x: platform.x + platform.width/2, y: platform.y },                    // Top
            { x: platform.x + platform.width/2, y: platform.y + platform.height },  // Bottom
            { x: platform.x, y: platform.y + platform.height/2 },                   // Left
            { x: platform.x + platform.width, y: platform.y + platform.height/2 }   // Right
        ];

        edgeHandles.forEach(handle => {
            this.ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
        });
    }
}