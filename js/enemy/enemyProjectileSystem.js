class EnemyProjectileSystem {
    constructor() {
        this.projectiles = [];
        this.nextProjectileId = 1;
    }

    createProjectile(enemy, targetX, targetY) {
        // Calculate direction to target
        // For projectile spawn position, use visual sprite position matching renderer logic
        const renderOffsetY = enemy.renderOffsetY || 0;

        // Calculate actual visual sprite dimensions (scaled)
        const enemyTypeData = window.game?.enemySystem?.data?.enemyTypes?.[enemy.type];
        const spriteWidth = enemyTypeData?.animations?.idle?.frameWidth || 100;
        const spriteHeight = enemyTypeData?.animations?.idle?.frameHeight || 100;
        const scale = enemyTypeData?.scale || 1;
        const visualSpriteHeight = spriteHeight * scale;
        const visualSpriteWidth = spriteWidth * scale;

        // Calculate sprite top position (matches enemyRenderer.js logic)
        // Sprite is bottom-aligned to collision box, with renderOffsetY applied
        const spriteOffsetY = (enemy.height - visualSpriteHeight) + renderOffsetY;
        const spriteTopY = enemy.y + spriteOffsetY;

        // Spawn from dragon's mouth/head area
        // X position: sprite left edge + mouth offset based on facing
        const spriteOffsetX = (enemy.width - visualSpriteWidth) / 2;
        const spriteLeftX = enemy.x + spriteOffsetX;
        const mouthOffsetX = enemy.facing === 'right' ? (visualSpriteWidth * 0.65) : (visualSpriteWidth * 0.35);
        const startX = spriteLeftX + mouthOffsetX;

        // Y position: sprite top + 52% down (where dragon's mouth is)
        const startY = spriteTopY + (visualSpriteHeight * 0.52);

        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Get projectile speed from enemy type or use default
        const speed = 300; // pixels per second

        const projectile = {
            id: this.nextProjectileId++,
            x: startX,
            y: startY,
            velocityX: dirX * speed,
            velocityY: dirY * speed,
            damage: enemy.damage,
            ownerId: enemy.id,
            facing: enemy.facing,

            // Animation state
            currentFrame: 0,
            frameTimer: 0,
            frameRate: 100, // ms per frame

            // Lifetime
            lifetime: 3000, // Remove after 3 seconds
            age: 0
        };

        this.projectiles.push(projectile);
        console.log(`🔥 Created fire projectile ${projectile.id} from enemy ${enemy.id}`);
        return projectile;
    }

    update(deltaTime, player, collisions) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            // Update position
            projectile.x += projectile.velocityX * (deltaTime / 1000);
            projectile.y += projectile.velocityY * (deltaTime / 1000);

            // Update animation
            projectile.frameTimer += deltaTime;
            if (projectile.frameTimer >= projectile.frameRate) {
                projectile.frameTimer = 0;
                projectile.currentFrame = (projectile.currentFrame + 1) % 6; // 6 frames
            }

            // Update age
            projectile.age += deltaTime;

            // Check if projectile hit player
            if (player && !player.isDead) {
                const hit = this.checkProjectilePlayerCollision(projectile, player);
                if (hit && !player.isDamaged) {
                    // Damage player
                    player.takeDamage(projectile.damage);
                    console.log(`🔥 Fire projectile ${projectile.id} hit player for ${projectile.damage} damage`);

                    // Remove projectile
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Remove if too old or off-screen
            if (projectile.age > projectile.lifetime || this.isOffScreen(projectile)) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    checkProjectilePlayerCollision(projectile, player) {
        const projectileWidth = 48; // Frame width
        const projectileHeight = 32; // Frame height

        return projectile.x < player.x + player.width &&
               projectile.x + projectileWidth > player.x &&
               projectile.y < player.y + player.height &&
               projectile.y + projectileHeight > player.y;
    }

    isOffScreen(projectile) {
        // Simple check - remove if far from origin
        // Could be improved with actual screen bounds
        return Math.abs(projectile.x) > 3000 || Math.abs(projectile.y) > 3000;
    }

    render(ctx, viewport, camera, projectileAnimator) {
        if (!projectileAnimator || !projectileAnimator.isReady()) {
            if (this.projectiles.length > 0 && !projectileAnimator) {
                console.warn('⚠️ Projectile animator is null, but we have', this.projectiles.length, 'projectiles');
            }
            if (this.projectiles.length > 0 && projectileAnimator && !projectileAnimator.isReady()) {
                console.warn('⚠️ Projectile animator not ready yet');
            }
            return;
        }

        if (this.projectiles.length > 0) {
            console.log('🔥 Rendering', this.projectiles.length, 'projectiles');
        }

        for (const projectile of this.projectiles) {
            projectileAnimator.render(ctx, projectile, viewport, camera);
        }
    }

    clearAll() {
        this.projectiles = [];
        this.nextProjectileId = 1;
    }

    getProjectileCount() {
        return this.projectiles.length;
    }
}
