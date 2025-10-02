class PlatformCollisions {
    checkPlayerPlatformCollisions(player, platforms) {
        player.onGround = false;
        player.standingOnPlatform = null; // Reset platform reference

        // Track which platforms are colliding this frame
        const collidingPlatforms = new Set();
        let highestDamagingPlatformBelow = null;

        platforms.forEach(platform => {
            if (this.checkCollision(player, platform)) {
                collidingPlatforms.add(platform);

                // Check if this platform blocks player from all sides
                if (platform.blockPlayer) {
                    // Resolve collision from all sides
                    this.resolveBlockingCollision(player, platform);

                    // Apply damage if platform causes damage
                    if (platform.damagePerSecond > 0) {
                        player.addDamagingPlatform(platform);
                    }
                } else {
                    // Normal platform - only collide from top
                    if (player.velocityY > 0 && player.y < platform.y) {
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.onGround = true;
                        player.standingOnPlatform = platform; // Store reference to platform

                        // Check if this platform causes damage when player stands on it
                        if (platform.damagePerSecond > 0) {
                            player.addDamagingPlatform(platform);
                        }
                    }
                }
            } else {
                // Platform is not colliding - resume movement if it was paused due to blockPlayer
                if (platform.blockPlayer && platform.isMovementPaused && platform.pausedByBlockPlayer) {
                    platform.isMovementPaused = false;
                    platform.pausedByBlockPlayer = false;
                }
            }

            // Check if this platform is below the player (for damage detection when on moving platform)
            if (player.standingOnPlatform && player.standingOnPlatform !== platform) {
                // Check if player's bottom overlaps with this platform horizontally
                const playerBottom = player.y + player.height;
                const platformTop = platform.y;

                // Check horizontal overlap
                const horizontalOverlap = player.x < platform.x + platform.width &&
                                         player.x + player.width > platform.x;

                // Check if player has reached or passed through the platform's surface
                // The player's bottom must be at or just below the platform's top surface (from above)
                // Also ensure the player is above the platform (player.y < platformTop)
                const hasReachedSurface = playerBottom >= platformTop && player.y < platformTop;

                if (horizontalOverlap && hasReachedSurface && platform.damagePerSecond > 0) {
                    // Track the highest damaging platform the player has reached
                    if (!highestDamagingPlatformBelow ||
                        platform.y < highestDamagingPlatformBelow.y ||
                        (platform.y === highestDamagingPlatformBelow.y &&
                         platform.damagePerSecond > highestDamagingPlatformBelow.damagePerSecond)) {
                        highestDamagingPlatformBelow = platform;
                    }
                }
            }
        });

        // If player is on a moving platform and has reached a damaging platform's surface, handle collision
        if (highestDamagingPlatformBelow && player.standingOnPlatform) {
            const playerBottom = player.y + player.height;
            const platformTop = highestDamagingPlatformBelow.y;

            // Only process if player has actually reached the platform's surface
            if (playerBottom >= platformTop) {
                // Add the damaging platform to the player's list (needed for kill effect determination)
                player.addDamagingPlatform(highestDamagingPlatformBelow);

                // Check if the damaging platform is lethal (very high damage)
                if (highestDamagingPlatformBelow.damagePerSecond >= 100) {
                    // Instantly kill the player
                    player.health = 0;

                    // Transfer player to the damaging platform surface
                    player.standingOnPlatform = highestDamagingPlatformBelow;
                    player.y = highestDamagingPlatformBelow.y - player.height;
                    player.onGround = true;

                    // Stop player movement
                    player.velocityX = 0;
                    player.velocityY = 0;

                    console.log('💀 Player killed by reaching lava surface!', {
                        platform: highestDamagingPlatformBelow,
                        damage: highestDamagingPlatformBelow.damagePerSecond,
                        killEffect: highestDamagingPlatformBelow.killEffect,
                        playerBottom: playerBottom,
                        platformTop: platformTop
                    });
                }
            }
        }
    }

    resolveBlockingCollision(player, platform) {
        // Calculate overlap on each side
        const overlapLeft = (player.x + player.width) - platform.x;
        const overlapRight = (platform.x + platform.width) - player.x;
        const overlapTop = (player.y + player.height) - platform.y;
        const overlapBottom = (platform.y + platform.height) - player.y;

        // Find the smallest overlap (the side player should be pushed from)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        // Consider platform velocity when checking collision direction
        const platformVelocityY = platform.velocityY || 0;
        const platformVelocityX = platform.velocityX || 0;

        if (minOverlap === overlapTop) {
            // Collision from top - player lands on platform or platform crushes from above
            // Allow if player is moving down OR platform is moving down onto player
            if (player.velocityY > 0 || platformVelocityY > 0) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
                player.standingOnPlatform = platform;
            }
        } else if (minOverlap === overlapBottom) {
            // Collision from bottom - player hits head or platform moves up into player
            // Allow if player is moving up OR platform is moving up
            if (player.velocityY < 0 || platformVelocityY < 0 || platformVelocityY === 0) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        } else if (minOverlap === overlapLeft) {
            // Collision from left - always resolve
            player.x = platform.x - player.width;
            player.velocityX = 0;
        } else if (minOverlap === overlapRight) {
            // Collision from right - always resolve
            player.x = platform.x + platform.width;
            player.velocityX = 0;
        }

        // Stop platform movement if it's moving and blockPlayer is enabled
        if (platform.isMoving && platform.blockPlayer) {
            platform.isMovementPaused = true;
            platform.pausedByBlockPlayer = true; // Mark that this pause is due to blockPlayer
            platform.velocityX = 0;
            platform.velocityY = 0;
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}