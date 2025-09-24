class EnemyCollisions {
    constructor() {
        this.collisionMargin = 2; // Small margin for collision detection
    }

    // Check collision between enemy and player
    checkEnemyPlayerCollision(enemy, player) {
        if (enemy.isDead || player.isDead) return null;

        const enemyBounds = this.getEnemyBounds(enemy);
        const playerBounds = this.getPlayerBounds(player);

        if (this.boundsIntersect(enemyBounds, playerBounds)) {
            return {
                type: 'player',
                enemy: enemy,
                player: player,
                overlap: this.calculateOverlap(enemyBounds, playerBounds)
            };
        }

        return null;
    }

    // Check if enemy attack hits player
    checkEnemyAttackCollision(enemy, player) {
        if (!enemy.isAttacking || enemy.isDead || player.isDead) return null;

        // Get attack range based on enemy facing direction
        const attackRange = this.getAttackRange(enemy);
        const playerBounds = this.getPlayerBounds(player);

        if (this.boundsIntersect(attackRange, playerBounds)) {
            return {
                type: 'attack',
                enemy: enemy,
                player: player,
                damage: enemy.damage
            };
        }

        return null;
    }

    // Check if player attack hits enemy
    checkPlayerAttackCollision(player, enemy) {
        if (!player.isAttacking || player.isDead || enemy.isDead) return null;

        // Get player attack range based on facing direction
        const attackRange = this.getPlayerAttackRange(player);
        const enemyBounds = this.getEnemyBounds(enemy);

        if (this.boundsIntersect(attackRange, enemyBounds)) {
            return {
                type: 'playerAttack',
                player: player,
                enemy: enemy,
                damage: 25 // Default player damage, could be made configurable
            };
        }

        return null;
    }

    // Check collision between enemy and platforms
    checkEnemyPlatformCollisions(enemy, platforms) {
        const collisions = [];
        const enemyBounds = this.getEnemyBounds(enemy);

        for (const platform of platforms) {
            const platformBounds = this.getPlatformBounds(platform);

            if (this.boundsIntersect(enemyBounds, platformBounds)) {
                collisions.push({
                    type: 'platform',
                    enemy: enemy,
                    platform: platform,
                    overlap: this.calculateOverlap(enemyBounds, platformBounds)
                });
            }
        }

        return collisions;
    }

    // Check collision between enemy and props
    checkEnemyPropCollisions(enemy, props) {
        const collisions = [];
        const enemyBounds = this.getEnemyBounds(enemy);

        for (const prop of props) {
            const propBounds = this.getPropBounds(prop);

            if (this.boundsIntersect(enemyBounds, propBounds)) {
                collisions.push({
                    type: 'prop',
                    enemy: enemy,
                    prop: prop,
                    overlap: this.calculateOverlap(enemyBounds, propBounds)
                });
            }
        }

        return collisions;
    }

    // Utility methods for getting bounds
    getEnemyBounds(enemy) {
        return {
            left: enemy.x,
            right: enemy.x + enemy.width,
            top: enemy.y,
            bottom: enemy.y + enemy.height
        };
    }

    getPlayerBounds(player) {
        return {
            left: player.x,
            right: player.x + player.width,
            top: player.y,
            bottom: player.y + player.height
        };
    }

    getPlatformBounds(platform) {
        return {
            left: platform.x,
            right: platform.x + platform.width,
            top: platform.y,
            bottom: platform.y + platform.height
        };
    }

    getPropBounds(prop) {
        return {
            left: prop.x,
            right: prop.x + prop.width,
            top: prop.y,
            bottom: prop.y + prop.height
        };
    }

    getAttackRange(enemy) {
        const attackReach = 40; // How far the enemy can attack
        const attackWidth = 30; // Width of attack area
        const attackHeight = enemy.height * 0.8; // Height of attack area

        let attackX, attackY;

        if (enemy.facing === 'right') {
            attackX = enemy.x + enemy.width;
        } else {
            attackX = enemy.x - attackReach;
        }

        attackY = enemy.y + (enemy.height - attackHeight) / 2;

        return {
            left: attackX,
            right: attackX + attackReach,
            top: attackY,
            bottom: attackY + attackHeight
        };
    }

    getPlayerAttackRange(player) {
        const attackReach = 50; // How far the player can attack
        const attackWidth = 35; // Width of attack area
        const attackHeight = player.height * 0.8; // Height of attack area

        let attackX, attackY;

        if (player.facing === 'right') {
            attackX = player.x + player.width;
        } else {
            attackX = player.x - attackReach;
        }

        attackY = player.y + (player.height - attackHeight) / 2;

        return {
            left: attackX,
            right: attackX + attackReach,
            top: attackY,
            bottom: attackY + attackHeight
        };
    }

    // Check if two bounding boxes intersect
    boundsIntersect(bounds1, bounds2) {
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }

    // Calculate overlap between two bounding boxes
    calculateOverlap(bounds1, bounds2) {
        const overlapLeft = Math.max(bounds1.left, bounds2.left);
        const overlapRight = Math.min(bounds1.right, bounds2.right);
        const overlapTop = Math.max(bounds1.top, bounds2.top);
        const overlapBottom = Math.min(bounds1.bottom, bounds2.bottom);

        if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
            return {
                left: overlapLeft,
                right: overlapRight,
                top: overlapTop,
                bottom: overlapBottom,
                width: overlapRight - overlapLeft,
                height: overlapBottom - overlapTop
            };
        }

        return null;
    }

    // Get distance between two points
    getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if a point is within a rectangular area
    isPointInBounds(x, y, bounds) {
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom;
    }

    // Resolve collision by pushing enemy away from obstacle
    resolveCollision(enemy, collision) {
        if (!collision.overlap) return;

        const overlap = collision.overlap;
        const overlapWidth = overlap.width;
        const overlapHeight = overlap.height;

        // Get the obstacle (platform or prop)
        const obstacle = collision.platform || collision.prop;
        if (!obstacle) return;

        // Determine the direction to push the enemy
        let pushX = 0;
        let pushY = 0;

        // Choose the smallest overlap to minimize correction
        if (overlapWidth < overlapHeight) {
            // Horizontal collision
            if (enemy.x < obstacle.x) {
                pushX = -overlapWidth - this.collisionMargin;
            } else {
                pushX = overlapWidth + this.collisionMargin;
            }
        } else {
            // Vertical collision
            if (enemy.y < obstacle.y) {
                pushY = -overlapHeight - this.collisionMargin;
                enemy.onGround = true;
                enemy.velocityY = 0;
            } else {
                pushY = overlapHeight + this.collisionMargin;
                enemy.velocityY = 0;
            }
        }

        // Apply the correction
        enemy.x += pushX;
        enemy.y += pushY;

        // Stop velocity in the collision direction
        if (pushX !== 0) {
            enemy.velocityX = 0;
        }
    }
}