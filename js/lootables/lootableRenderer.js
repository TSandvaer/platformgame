class LootableRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = {
            coin: null,
            heart: null
        };

        this.spritesLoaded = false;
        this.onSpritesLoadedCallback = null;
        this.loadedSprites = 0;
        this.totalSprites = 2;
    }

    // Load lootable sprites
    loadSprites(onSpritesLoadedCallback) {
        this.onSpritesLoadedCallback = onSpritesLoadedCallback;

        // Load coin sprite (animated GIF)
        const coinImg = new Image();
        coinImg.onload = () => {
            this.sprites.coin = {
                image: coinImg,
                width: 32,
                height: 32,
                animated: true
            };
            this.checkAllLoaded();
        };
        coinImg.src = 'sprites/Coins/gold.rotate.gif';

        // Load heart sprite (static)
        const heartImg = new Image();
        heartImg.onload = () => {
            this.sprites.heart = {
                image: heartImg,
                width: 32,
                height: 32
            };
            this.checkAllLoaded();
        };
        heartImg.src = 'sprites/Heart/Heart.png';
    }

    checkAllLoaded() {
        this.loadedSprites++;
        if (this.loadedSprites >= this.totalSprites) {
            this.spritesLoaded = true;
            console.log('All lootable sprites loaded successfully');
            if (this.onSpritesLoadedCallback) {
                this.onSpritesLoadedCallback();
            }
        }
    }

    // Render all lootables
    renderLootables(lootables, lootableTypes, isDevelopmentMode, selectedLootable, selectedLootables = [], viewport, camera) {
        if (!this.spritesLoaded) return;

        // Sort by z-order (if we add z-order later) or render in order
        lootables.forEach(lootable => {
            if (lootable.isVisible) {
                // Apply viewport and camera transformations like prop system
                let renderLootable = lootable;
                if (viewport && camera) {
                    // Convert world to screen coordinates
                    const screenX = (lootable.x - camera.x) * viewport.scaleX + viewport.offsetX;
                    const screenY = (lootable.y - camera.y) * viewport.scaleY + viewport.offsetY;
                    renderLootable = { ...lootable, x: screenX, y: screenY };
                }

                this.drawLootable(renderLootable, lootableTypes, isDevelopmentMode, selectedLootable, selectedLootables);
            }
        });

        // Draw selection rectangles in development mode
        if (isDevelopmentMode) {
            this.drawSelectionIndicators(selectedLootable, selectedLootables, lootableTypes, viewport, camera);
        }
    }

    // Draw individual lootable
    drawLootable(lootable, lootableTypes, isDevelopmentMode, selectedLootable, selectedLootables) {
        const lootableType = lootableTypes[lootable.type];
        if (!lootableType) return;

        const sprite = this.sprites[lootable.type];
        if (!sprite || !sprite.image) return;

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.save();

        if (lootableType.animated && sprite.animated) {
            // Render animated lootable (animated GIF - browser handles animation)
            this.ctx.drawImage(
                sprite.image,
                Math.floor(lootable.x), Math.floor(lootable.y),
                sprite.width, sprite.height
            );
        } else {
            // Render static lootable (like heart)
            this.ctx.drawImage(
                sprite.image,
                Math.floor(lootable.x), Math.floor(lootable.y),
                sprite.width, sprite.height
            );
        }

        this.ctx.restore();
    }

    // Draw selection indicators in development mode
    drawSelectionIndicators(selectedLootable, selectedLootables, lootableTypes, viewport, camera) {
        // Draw selection rectangle for primary selected lootable
        if (selectedLootable) {
            let renderLootable = selectedLootable;
            if (viewport && camera) {
                const screenX = (selectedLootable.x - camera.x) * viewport.scaleX + viewport.offsetX;
                const screenY = (selectedLootable.y - camera.y) * viewport.scaleY + viewport.offsetY;
                renderLootable = { ...selectedLootable, x: screenX, y: screenY };
            }
            this.drawSelectionRect(renderLootable, lootableTypes, '#00FF00', 2); // Green for primary selection
        }

        // Draw selection rectangles for multi-selected lootables
        selectedLootables.forEach(lootable => {
            if (lootable !== selectedLootable) {
                let renderLootable = lootable;
                if (viewport && camera) {
                    const screenX = (lootable.x - camera.x) * viewport.scaleX + viewport.offsetX;
                    const screenY = (lootable.y - camera.y) * viewport.scaleY + viewport.offsetY;
                    renderLootable = { ...lootable, x: screenX, y: screenY };
                }
                this.drawSelectionRect(renderLootable, lootableTypes, '#FFFF00', 1); // Yellow for multi-selection
            }
        });
    }

    // Draw selection rectangle around lootable
    drawSelectionRect(lootable, lootableTypes, color, lineWidth) {
        const lootableType = lootableTypes[lootable.type];
        if (!lootableType) return;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([5, 5]);

        this.ctx.strokeRect(
            Math.floor(lootable.x) - 2,
            Math.floor(lootable.y) - 2,
            lootableType.width + 4,
            lootableType.height + 4
        );

        this.ctx.restore();
    }

    // Draw drag selection rectangle
    drawDragSelection(startX, startY, currentX, currentY) {
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        this.ctx.save();
        this.ctx.strokeStyle = '#0099FF';
        this.ctx.fillStyle = 'rgba(0, 153, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 3]);

        this.ctx.fillRect(left, top, width, height);
        this.ctx.strokeRect(left, top, width, height);

        this.ctx.restore();
    }

    // Render placement preview
    renderPlacementPreview(mouseX, mouseY, lootableType, lootableTypes) {
        if (!this.spritesLoaded) return;

        const typeData = lootableTypes[lootableType];
        const sprite = this.sprites[lootableType];

        if (!typeData || !sprite || !sprite.image) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.7;
        this.ctx.imageSmoothingEnabled = false;

        // Show sprite preview (both animated and static use the same method now)
        this.ctx.drawImage(
            sprite.image,
            Math.floor(mouseX), Math.floor(mouseY),
            sprite.width, sprite.height
        );

        this.ctx.restore();
    }
}