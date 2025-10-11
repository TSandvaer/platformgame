class PlayerProjectileSystem {
    constructor() {
        this.projectiles = [];
        this.nextProjectileId = 1;
    }

    createProjectile(player, targetX, targetY, characterConfig) {
        // Get projectile configuration from character
        const projectileConfig = characterConfig?.projectile;
        if (!projectileConfig) {
            console.warn('Character does not have projectile configuration');
            return null;
        }

        // Calculate spawn position from player's collision box position
        // Use configured spawn offset if available, otherwise use default
        const spawnOffset = projectileConfig.spawnOffset;
        let startX, startY;

        if (spawnOffset && spawnOffset[player.facing]) {
            // Use character-specific spawn offset (accounts for visual sprite position)
            const offset = spawnOffset[player.facing];
            startX = player.x + offset.x;
            startY = player.y + offset.y;
        } else {
            // Fallback to simple center-based calculation
            const playerCenter = player.x + player.width / 2;
            const playerMiddleY = player.y + player.height / 2;
            const offsetX = player.facing === 'right' ? 25 : -25;
            const offsetY = -5;
            startX = playerCenter + offsetX;
            startY = playerMiddleY + offsetY;
        }

        // Calculate direction to target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Get projectile speed from config
        const speed = projectileConfig.speed || 400; // pixels per second
        const damage = projectileConfig.damage || 30;

        const projectile = {
            id: this.nextProjectileId++,
            x: startX,
            y: startY,
            velocityX: dirX * speed,
            velocityY: dirY * speed,
            damage: damage,
            facing: player.facing,

            // Animation state
            currentFrame: 0,
            frameTimer: 0,
            frameRate: 100, // ms per frame

            // Lifetime
            lifetime: 3000, // Remove after 3 seconds
            age: 0
        };

        this.projectiles.push(projectile);
        return projectile;
    }

    update(deltaTime, enemies) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            // Update position
            projectile.x += projectile.velocityX * (deltaTime / 1000);
            projectile.y += projectile.velocityY * (deltaTime / 1000);

            // Update animation
            projectile.frameTimer += deltaTime;
            if (projectile.frameTimer >= projectile.frameRate) {
                projectile.frameTimer = 0;
                projectile.currentFrame = (projectile.currentFrame + 1) % 5; // 5 frames
            }

            // Update age
            projectile.age += deltaTime;

            // Check if projectile hit any enemy
            if (enemies && enemies.length > 0) {
                for (const enemy of enemies) {
                    // Skip invisible or dead enemies
                    if (!enemy.isVisible || enemy.isDead) continue;

                    const hit = this.checkProjectileEnemyCollision(projectile, enemy);
                    if (hit && !enemy.isDamaged) {
                        // Store hit information for enemy system to process
                        projectile.hitEnemy = enemy;
                        projectile.shouldRemove = true;
                        break;
                    }
                }
            }

            // Remove if too old or off-screen
            // Don't remove hit projectiles yet - let enemy system process them first
            if (!projectile.hitEnemy && (projectile.shouldRemove || projectile.age > projectile.lifetime || this.isOffScreen(projectile))) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    checkProjectileEnemyCollision(projectile, enemy) {
        const projectileWidth = 32; // Frame width
        const projectileHeight = 32; // Frame height

        // Account for enemy's collision offset if present
        const collisionOffsetY = enemy.collisionOffsetY || 0;

        return projectile.x < enemy.x + enemy.width &&
               projectile.x + projectileWidth > enemy.x &&
               projectile.y < enemy.y + collisionOffsetY + enemy.height &&
               projectile.y + projectileHeight > enemy.y + collisionOffsetY;
    }

    isOffScreen(projectile) {
        // Simple check - remove if far from origin
        return Math.abs(projectile.x) > 3000 || Math.abs(projectile.y) > 3000;
    }

    render(ctx, viewport, camera, projectileAnimator, characterConfig) {
        if (!projectileAnimator) {
            return;
        }

        // Load character projectile if needed
        if (characterConfig && !projectileAnimator.isReady(characterConfig)) {
            return;
        }

        for (const projectile of this.projectiles) {
            projectileAnimator.render(ctx, projectile, viewport, camera, characterConfig);
        }
    }

    clearAll() {
        this.projectiles = [];
        this.nextProjectileId = 1;
    }

    getProjectileCount() {
        return this.projectiles.length;
    }

    // Get projectiles that hit enemies and remove them from the list
    getAndClearHitProjectiles() {
        const hitProjectiles = this.projectiles.filter(p => p.hitEnemy);
        // Remove hit projectiles from the array
        this.projectiles = this.projectiles.filter(p => !p.hitEnemy);
        return hitProjectiles;
    }
}
