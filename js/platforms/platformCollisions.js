class PlatformCollisions {
    checkPlayerPlatformCollisions(player, platforms) {
        player.onGround = false;
        player.standingOnPlatform = null; // Reset platform reference

        // Track which platforms are colliding this frame
        const collidingPlatforms = new Set();

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
        });
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