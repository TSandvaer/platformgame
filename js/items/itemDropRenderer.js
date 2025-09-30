class ItemDropRenderer {
    constructor(game) {
        this.game = game;
        this.inventorySprites = {}; // Will store loaded sprites
        this.spritesLoaded = false;
        this.loadSprites();
    }

    loadSprites() {
        // Load the inventory sprite sheet that contains all item sprites
        const spriteImage = new Image();
        spriteImage.onload = () => {
            this.inventorySprites.image = spriteImage;
            this.spritesLoaded = true;
            console.log('Item drop sprites loaded successfully');
        };
        spriteImage.onerror = () => {
            console.error('Failed to load item drop sprites');
        };
        spriteImage.src = 'sprites/Inventory item sprite sets/inventory_items_pack1.png';
    }

    render(ctx, droppedItems, camera, viewport) {
        if (!this.spritesLoaded || !this.inventorySprites.image) {
            console.log(`📦 ItemDropRenderer: Cannot render - spritesLoaded: ${this.spritesLoaded}, image: ${!!this.inventorySprites.image}`);
            return;
        }

        // console.log(`📦 ItemDropRenderer: Rendering ${droppedItems.length} dropped items`);

        ctx.save();

        for (const item of droppedItems) {
            if (item.collected) continue;
            if (!item.visible) continue; // Skip rendering if item is not yet visible (spawn delay)

            // Get item definition from inventory data
            const itemData = this.game.inventoryItemsData?.inventoryItems[item.itemId];
            if (!itemData || !itemData.sprite) {
                console.log(`📦 ItemDropRenderer: No item data or sprite for ${item.itemId}`);
                continue;
            }

            // console.log(`📦 ItemDropRenderer: Rendering item ${item.id} (${item.itemId}) at (${item.x}, ${item.y})`);

            // Calculate screen position
            const screenX = (item.x - camera.x) * viewport.scaleX;
            const screenY = (item.y - camera.y) * viewport.scaleY;

            // Skip rendering if off-screen
            if (screenX < -50 || screenX > viewport.width + 50 ||
                screenY < -50 || screenY > viewport.height + 50) {
                continue;
            }

            // Apply item transformations
            ctx.save();

            // Move to item position
            ctx.translate(screenX + 8, screenY + 8); // Center the item (assuming 16x16 size)

            // Apply scaling
            const scale = item.scale * viewport.scaleX;
            ctx.scale(scale, scale);

            // Apply rotation for visual effect
            if (item.rotation) {
                ctx.rotate(item.rotation);
            }

            // Add visual effects based on item state
            if (!item.onGround) {
                // No floating effect - items should fall naturally
                // Just apply the physics-based position
            } else if (item.pickupTimer > 500 && item.pickupTimer < 3000) {
                // Very subtle idle animation when resting (barely noticeable)
                const idleOffset = Math.sin(item.pickupTimer * 0.003) * 0.5;
                ctx.translate(0, idleOffset);
            }

            // Draw the item sprite
            const sprite = itemData.sprite;
            ctx.drawImage(
                this.inventorySprites.image,
                sprite.x, sprite.y, sprite.width, sprite.height,
                -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height
            );

            // Add glow effect for collectible items
            if (item.onGround && item.pickupTimer > 500) {
                this.renderGlowEffect(ctx, sprite);
            }

            ctx.restore();
        }

        ctx.restore();
    }

    renderGlowEffect(ctx, sprite) {
        // Create a subtle glow effect around collectible items
        ctx.save();

        // Set glow properties
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.6;

        // Draw the sprite again slightly larger for glow
        ctx.drawImage(
            this.inventorySprites.image,
            sprite.x, sprite.y, sprite.width, sprite.height,
            -sprite.width / 2 - 2, -sprite.height / 2 - 2,
            sprite.width + 4, sprite.height + 4
        );

        ctx.restore();
    }

    // Render pickup effect (for when item is collected)
    renderPickupEffect(ctx, x, y, scale, alpha) {
        if (!this.spritesLoaded) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Draw a simple star or sparkle effect
        this.drawSparkle(ctx);

        ctx.restore();
    }

    drawSparkle(ctx) {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;

        // Draw a simple star shape
        ctx.beginPath();
        const spikes = 4;
        const outerRadius = 8;
        const innerRadius = 4;

        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Debug method to render item bounds
    renderDebugBounds(ctx, droppedItems, camera, viewport) {
        if (!this.game.isDevelopmentMode) return;

        ctx.save();
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;

        for (const item of droppedItems) {
            if (item.collected) continue;

            const screenX = (item.x - camera.x) * viewport.scaleX;
            const screenY = (item.y - camera.y) * viewport.scaleY;

            // Draw item bounds
            ctx.strokeRect(screenX, screenY, 16 * viewport.scaleX, 16 * viewport.scaleY);

            // Draw pickup radius
            ctx.beginPath();
            ctx.arc(
                screenX + 8 * viewport.scaleX,
                screenY + 8 * viewport.scaleY,
                30 * viewport.scaleX,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}