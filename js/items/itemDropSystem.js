class ItemDropSystem {
    constructor(game) {
        this.game = game;
        this.droppedItems = []; // Array of items currently falling/dropped
        this.gravity = 0.2; // Even slower gravity for more graceful falling
        this.friction = 0.92; // More air resistance
        this.bounce = 0.6; // Higher bounce for more realistic effect
        this.pickupDistance = 30; // Distance at which player auto-picks up items

        // Initialize renderer
        this.renderer = null; // Will be set when renderer is created
    }

    // Drop an item at specified coordinates
    dropItem(itemId, x, y, platforms) {
        const closestPlatform = this.findClosestPlatform(x, y, platforms);
        if (!closestPlatform) {
            console.warn('No platform found for item drop');
            return null;
        }

        // Item drops exactly at the provided position with consistent physics
        const droppedItem = {
            id: this.generateDropId(),
            itemId: itemId,
            x: x - 8, // Center the 16px item at the drop position
            y: y - 8, // Center the 16px item at the drop position
            velocityX: (Math.random() - 0.5) * 0.8, // Small random horizontal spread
            velocityY: -4.5, // Higher initial pop for more visible arc
            targetPlatform: closestPlatform, // Store reference to target platform
            onGround: false,
            bounceCount: 0,
            maxBounces: 3, // More bounces for realistic effect
            scale: 0.6, // Smaller than normal inventory size
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.03, // Gentle rotation for floating effect
            floatOffset: Math.random() * Math.PI * 2, // Random start for floating animation
            pickupTimer: 0,
            collected: false
        };

        console.log(`📦 Created item at (${droppedItem.x.toFixed(1)}, ${droppedItem.y.toFixed(1)}) with velocity (${droppedItem.velocityX.toFixed(2)}, ${droppedItem.velocityY.toFixed(2)})`);

        this.droppedItems.push(droppedItem);
        return droppedItem;
    }

    // Update all dropped items physics and animations
    update(deltaTime, platforms, player) {
        this.droppedItems = this.droppedItems.filter(item => {
            if (item.collected) return false;

            // Update physics
            this.updateItemPhysics(item, deltaTime, platforms);

            // Check for player pickup
            if (this.checkPlayerPickup(item, player)) {
                this.collectItem(item, player);
                return false; // Remove from array
            }

            // Update visual effects
            if (!item.onGround) {
                item.rotation += item.rotationSpeed * deltaTime;
            }
            item.pickupTimer += deltaTime;

            return true;
        });
    }

    updateItemPhysics(item, deltaTime, platforms) {
        // Apply physics only if not on ground
        if (!item.onGround) {
            // Safety check: if item has fallen too far or is stuck, force it to settle
            if (item.y > 2000 || (Math.abs(item.velocityY) < 0.01 && item.pickupTimer > 1000)) {
                console.log(`⚠️ Item ${item.id} stuck or fell too far (y: ${item.y}, vy: ${item.velocityY}), forcing to ground`);
                // Force item to nearest platform below
                const platformBelow = this.findNearestPlatformBelow(item, platforms);
                if (platformBelow) {
                    item.y = platformBelow.y - 16;
                    item.velocityY = 0;
                    item.velocityX = 0;
                    item.onGround = true;
                    item.rotationSpeed = 0;
                } else {
                    // No platform below, just settle it at current position
                    item.velocityY = 0;
                    item.velocityX = 0;
                    item.onGround = true;
                    item.rotationSpeed = 0;
                }
                return;
            }

            // Apply normal gravity
            item.velocityY += this.gravity * deltaTime;

            // Apply friction to horizontal movement
            item.velocityX *= this.friction;

            // Limit velocities to prevent runaway physics
            const maxHorizontalVelocity = 1.5;
            const maxVerticalVelocity = 5; // Controlled max speed
            item.velocityX = Math.max(-maxHorizontalVelocity, Math.min(maxHorizontalVelocity, item.velocityX));
            item.velocityY = Math.max(-maxVerticalVelocity, Math.min(maxVerticalVelocity, item.velocityY));

            // Update position
            item.x += item.velocityX * deltaTime;
            item.y += item.velocityY * deltaTime;

            // Check platform collisions (adapted from enemy system)
            this.checkPlatformCollisions(item, platforms);
        }
    }

    checkPlatformCollisions(item, platforms) {
        const itemBottom = item.y + 16; // Assuming 16px height for small items
        const itemRight = item.x + 16; // Assuming 16px width for small items
        const prevBottom = (item.y - item.velocityY * 16) + 16; // Previous frame position

        // Find platforms that item overlaps horizontally
        let overlappingPlatforms = platforms.filter(p =>
            itemRight > p.x && item.x < p.x + p.width
        );

        // Sort platforms by Y position (topmost first)
        overlappingPlatforms.sort((a, b) => a.y - b.y);

        // Check if item would land on any platform
        for (const platform of overlappingPlatforms) {
            const platformTop = platform.y;

            // Check if item is falling and crossed through the platform this frame
            // This prevents fast-moving items from passing through platforms
            if (item.velocityY > 0 && itemBottom >= platformTop && prevBottom <= platformTop + 10) {
                const isTargetPlatform = item.targetPlatform &&
                    platform.x === item.targetPlatform.x && platform.y === item.targetPlatform.y;

                // console.log(`📦 Item landing on platform at y=${platform.y}`);

                // Land on platform
                item.y = platformTop - 16; // Item height
                item.bounceCount++;

                // Check if should stop bouncing
                if (item.bounceCount >= item.maxBounces || Math.abs(item.velocityY) < 1) {
                    // Stop bouncing - item settles
                    item.velocityY = 0;
                    item.velocityX *= 0.2; // Greatly reduce horizontal movement
                    item.onGround = true;
                    item.rotationSpeed *= 0.05; // Almost stop rotation
                    // console.log(`📦 Item settled on platform`);
                } else {
                    // Continue bouncing with reduced velocity
                    if (item.bounceCount > 1) {
                        // After first bounce, reduce bounce factor progressively
                        item.velocityY = -Math.abs(item.velocityY) * this.bounce * Math.pow(0.7, item.bounceCount - 1);
                    } else {
                        // First bounce
                        item.velocityY = -Math.abs(item.velocityY) * this.bounce;
                    }
                    // Apply some horizontal damping on each bounce
                    item.velocityX *= 0.8;
                }
                return; // Stop checking other platforms once landed
            }
        }
    }

    checkPlayerPickup(item, player) {
        if (!player || item.pickupTimer < 500) return false; // 500ms delay before pickup

        const dx = player.x + player.width / 2 - item.x;
        const dy = player.y + player.height / 2 - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.pickupDistance;
    }

    collectItem(item, player) {
        item.collected = true;

        // Add item to player inventory
        const inventoryItem = this.game.inventoryItemsData.inventoryItems[item.itemId];
        if (inventoryItem) {
            // Add item to player's inventory using the player system
            const success = this.game.playerSystem.data.addItemToInventory(inventoryItem, 1);

            if (success) {
                // Show pickup effect
                this.showPickupEffect(item, inventoryItem);
                console.log(`✅ Player picked up: ${inventoryItem.name}`);
            } else {
                console.warn(`❌ Failed to add ${inventoryItem.name} to player inventory (inventory full?)`);
            }
        } else {
            console.warn(`❌ Item ${item.itemId} not found in inventory data`);
        }
    }

    showPickupEffect(item, inventoryItem) {
        if (this.game.showFeedbackMessage) {
            this.game.showFeedbackMessage(
                `+${inventoryItem.name}`,
                item.x,
                item.y - 20,
                '#4CAF50'
            );
        }
    }

    // Find closest platform to drop point with improved logic
    findNearestPlatformBelow(item, platforms) {
        if (!platforms || platforms.length === 0) return null;

        let nearestPlatform = null;
        let minDistance = Infinity;

        for (const platform of platforms) {
            // Check if platform is below the item
            if (platform.y > item.y) {
                // Check if item would fall onto this platform (horizontally aligned)
                if (item.x + 16 > platform.x && item.x < platform.x + platform.width) {
                    const distance = platform.y - item.y;
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestPlatform = platform;
                    }
                }
            }
        }

        return nearestPlatform;
    }

    findClosestPlatform(x, y, platforms) {
        if (!platforms || platforms.length === 0) {
            console.warn('No platforms available for item drop');
            return null;
        }

        let bestPlatform = null;
        let bestScore = Infinity;

        console.log(`🎯 Finding platform for drop at (${x.toFixed(1)}, ${y.toFixed(1)}), checking ${platforms.length} platforms`);

        for (const platform of platforms) {
            // Calculate distance to platform center
            const platformCenterX = platform.x + platform.width / 2;
            const platformCenterY = platform.y;

            const dx = x - platformCenterX;
            const dy = y - platformCenterY;
            const horizontalDistance = Math.abs(dx);
            const verticalDistance = Math.abs(dy);

            // Create a scoring system that heavily favors:
            // 1. Platforms at similar height or slightly below
            // 2. Platforms that are horizontally close
            let score = horizontalDistance; // Base score on horizontal distance

            // Check if drop point is ON this platform (item should stay on same platform)
            const onThisPlatform = (x >= platform.x && x <= platform.x + platform.width) &&
                                  (y >= platform.y - 50 && y <= platform.y + 50);

            if (onThisPlatform) {
                // Drop point is ON this platform - heavily favor this platform
                score = horizontalDistance * 0.1; // Minimal penalty for same platform
                console.log(`🎯 DROP IS ON THIS PLATFORM - heavily favoring it`);
            } else {
                // Vertical scoring for other platforms:
                if (platformCenterY < y - 100) {
                    // Platform is way above drop point - heavily penalize
                    score += verticalDistance * 5;
                } else if (platformCenterY < y) {
                    // Platform is above drop point - penalize
                    score += verticalDistance * 2;
                } else if (platformCenterY <= y + 200) {
                    // Platform is at similar level or reasonably below - prefer this
                    score += verticalDistance * 0.5;
                } else {
                    // Platform is way below - penalize but less than above
                    score += verticalDistance * 1.5;
                }
            }

            console.log(`🎯 Platform at (${platformCenterX.toFixed(1)}, ${platformCenterY.toFixed(1)}): hDist=${horizontalDistance.toFixed(1)}, vDist=${verticalDistance.toFixed(1)}, score=${score.toFixed(1)}`);

            if (score < bestScore) {
                bestScore = score;
                bestPlatform = platform;
            }
        }

        if (bestPlatform) {
            const platformCenterX = bestPlatform.x + bestPlatform.width / 2;
            const platformCenterY = bestPlatform.y;
            console.log(`🎯 Selected platform at (${platformCenterX.toFixed(1)}, ${platformCenterY.toFixed(1)}), score: ${bestScore.toFixed(1)}`);
        } else {
            console.warn('🎯 No suitable platform found');
        }

        return bestPlatform;
    }

    generateDropId() {
        return 'drop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Debug method to test dropping items manually
    testDrop(x, y, itemId = 'healthPotion') {
        if (this.game.platformSystem) {
            console.log(`🧪 Testing manual drop at (${x}, ${y})`);
            return this.dropItem(itemId, x, y, this.game.platformSystem.platforms);
        } else {
            console.warn('Platform system not available');
            return null;
        }
    }

    // Render all dropped items
    render(ctx, camera, viewport) {
        if (this.renderer) {
            // console.log(`📦 ItemDropSystem: Rendering ${this.droppedItems.length} items with renderer`);
            this.renderer.render(ctx, this.droppedItems, camera, viewport);
        } else {
            console.log(`📦 ItemDropSystem: No renderer available`);
        }
    }

    // Clean up all dropped items (for scene changes, etc.)
    clearAllDrops() {
        this.droppedItems = [];
    }

    // Get count of items currently dropped
    getDroppedItemCount() {
        return this.droppedItems.length;
    }
}