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
        this.totalSprites = 3; // coin, heart, pickup effect

        // Pickup effects
        this.pickupEffects = [];
        this.pickupEffectSprite = null;

        // Animation state for sprite sheets
        this.animationState = {
            coin: {
                currentFrame: 0,
                lastFrameTime: 0
            },
            heart: {
                currentFrame: 0,
                lastFrameTime: 0
            }
        };
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
        coinImg.src = 'sprites/Coins/gold/golden.rotate.png';

        // Load heart sprite (animated)
        const heartImg = new Image();
        heartImg.onload = () => {
            console.log('💖 Heart sprite loaded successfully');
            this.sprites.heart = {
                image: heartImg,
                width: 20, // 60px ÷ 3 = 20px per frame
                height: 20, // 60px ÷ 3 = 20px per frame
                animated: true
            };
            this.checkAllLoaded();
        };
        heartImg.onerror = () => {
            console.error('💖 Failed to load heart sprite');
        };
        heartImg.src = 'sprites/Heart/heart_rotating2.png';

        // Load pickup effect sprite (sprite sheet with 8 frames, 256x32, 1 row)
        const pickupImg = new Image();
        pickupImg.onload = () => {
            console.log('✨ Pickup effect sprite loaded successfully');
            this.pickupEffectSprite = {
                image: pickupImg,
                frameWidth: 32, // 256px ÷ 8 frames = 32px per frame
                frameHeight: 32,
                totalFrames: 8,
                animationSpeed: 80 // ms per frame for smooth animation
            };
            this.checkAllLoaded();
        };
        pickupImg.onerror = () => {
            console.error('✨ Failed to load pickup effect sprite');
        };
        pickupImg.src = 'sprites/Coins/pick_up_effect.png';
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

    // Update animation frames
    updateAnimations(lootableTypes) {
        const currentTime = Date.now();

        // Update coin animation
        if (this.animationState.coin && lootableTypes.coin && lootableTypes.coin.animated) {
            const timeSinceLastFrame = currentTime - this.animationState.coin.lastFrameTime;

            if (timeSinceLastFrame >= lootableTypes.coin.animationSpeed) {
                this.animationState.coin.currentFrame =
                    (this.animationState.coin.currentFrame + 1) % lootableTypes.coin.animationFrames;
                this.animationState.coin.lastFrameTime = currentTime;
            }
        }

        // Update heart animation
        if (this.animationState.heart && lootableTypes.heart && lootableTypes.heart.animated) {
            const timeSinceLastFrame = currentTime - this.animationState.heart.lastFrameTime;

            if (timeSinceLastFrame >= lootableTypes.heart.animationSpeed) {
                this.animationState.heart.currentFrame =
                    (this.animationState.heart.currentFrame + 1) % lootableTypes.heart.animationFrames;
                this.animationState.heart.lastFrameTime = currentTime;
            }
        }
    }

    // Add pickup effect at position
    addPickupEffect(x, y) {
        this.pickupEffects.push({
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 640, // 8 frames × 80ms = 640ms total animation
            currentFrame: 0,
            lastFrameTime: Date.now()
        });
    }

    // Update and remove expired pickup effects
    updatePickupEffects() {
        const currentTime = Date.now();

        this.pickupEffects = this.pickupEffects.filter(effect => {
            // Update animation frame
            if (this.pickupEffectSprite && (currentTime - effect.lastFrameTime) >= this.pickupEffectSprite.animationSpeed) {
                effect.currentFrame++;
                effect.lastFrameTime = currentTime;

                // If we've shown all frames, remove the effect
                if (effect.currentFrame >= this.pickupEffectSprite.totalFrames) {
                    return false; // Remove this effect
                }
            }

            // Also remove if duration exceeded (fallback)
            return (currentTime - effect.startTime) < effect.duration;
        });
    }

    // Render pickup effects
    renderPickupEffects(viewport, camera) {
        if (!this.pickupEffectSprite) return;

        this.pickupEffects.forEach(effect => {
            // Apply viewport and camera transformations
            let renderX = effect.x;
            let renderY = effect.y;

            if (viewport && camera) {
                renderX = (effect.x - camera.x) * viewport.scaleX + viewport.offsetX;
                renderY = (effect.y - camera.y) * viewport.scaleY + viewport.offsetY;
            }

            // Calculate source position for current frame (horizontal sprite sheet)
            const sourceX = effect.currentFrame * this.pickupEffectSprite.frameWidth;
            const sourceY = 0; // Single row

            this.ctx.drawImage(
                this.pickupEffectSprite.image,
                sourceX, sourceY, this.pickupEffectSprite.frameWidth, this.pickupEffectSprite.frameHeight, // Source rectangle
                Math.floor(renderX), Math.floor(renderY), this.pickupEffectSprite.frameWidth, this.pickupEffectSprite.frameHeight // Destination
            );
        });
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
            // Render animated sprite sheet
            if ((lootable.type === 'coin' && this.animationState.coin) ||
                (lootable.type === 'heart' && this.animationState.heart)) {

                const animState = this.animationState[lootable.type];
                const frameIndex = animState.currentFrame;
                const frameWidth = sprite.width;
                const frameHeight = sprite.height;

                let sourceX, sourceY;

                if (lootable.type === 'heart') {
                    // Heart sprite sheet is arranged in a 3x3 grid (3 columns, 3 rows) with 7 total frames
                    const framesPerRow = 3;
                    const col = frameIndex % framesPerRow;
                    const row = Math.floor(frameIndex / framesPerRow);
                    sourceX = col * frameWidth;
                    sourceY = row * frameHeight;
                } else {
                    // Coin is horizontal layout
                    sourceX = frameIndex * frameWidth;
                    sourceY = 0;
                }

                this.ctx.drawImage(
                    sprite.image,
                    sourceX, sourceY, frameWidth, frameHeight, // Source rectangle (frame from sprite sheet)
                    Math.floor(lootable.x), Math.floor(lootable.y), frameWidth, frameHeight // Destination
                );
            } else {
                // Fallback for other animated types
                this.ctx.drawImage(
                    sprite.image,
                    Math.floor(lootable.x), Math.floor(lootable.y),
                    sprite.width, sprite.height
                );
            }
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