class EnemyManager {
    constructor(data) {
        this.data = data;
    }

    // Create a new enemy at the specified position
    addEnemy(x, y, enemyType = 'orc') {
        const enemy = this.data.createEnemy(x, y, enemyType);
        if (enemy) {
        }
        return enemy;
    }

    // Remove an enemy by ID
    removeEnemy(id) {
        const removed = this.data.removeEnemy(id);
        if (removed) {
        }
        return removed;
    }

    // Get enemy at specific coordinates (for selection)
    getEnemyAtPosition(x, y, tolerance = 10) {
        for (const enemy of this.data.enemies) {
            // Only return visible enemies
            if (!enemy.isVisible) continue;

            const collisionOffsetY = enemy.collisionOffsetY || 0;
            const sizeMultiplier = enemy.sizeMultiplier || 1.0;
            const actualWidth = enemy.width * sizeMultiplier;
            const actualHeight = enemy.height * sizeMultiplier;

            // Calculate Y offset to keep bottom of collision box at same position
            const scaleYOffset = enemy.height * (1 - sizeMultiplier);

            const enemyTop = enemy.y + collisionOffsetY + scaleYOffset;
            const enemyBottom = enemyTop + actualHeight;

            if (x >= enemy.x - tolerance && x <= enemy.x + actualWidth + tolerance &&
                y >= enemyTop - tolerance && y <= enemyBottom + tolerance) {
                return enemy;
            }
        }
        return null;
    }

    // Select an enemy
    selectEnemy(enemy) {
        this.data.selectedEnemy = enemy;
    }

    // Get currently selected enemy
    getSelectedEnemy() {
        return this.data.selectedEnemy;
    }

    // Update enemy properties
    updateEnemyProperties(enemyId, properties) {
        const enemy = this.data.getEnemyById(enemyId);
        if (!enemy) return false;

        // Update position
        if (properties.x !== undefined && !isNaN(properties.x)) {
            enemy.x = properties.x;
            enemy.initialX = properties.x; // Update design-time position
        }
        if (properties.y !== undefined && !isNaN(properties.y)) {
            enemy.y = properties.y;
            enemy.initialY = properties.y; // Update design-time position
        }

        // Update basic properties
        if (properties.health !== undefined) {
            enemy.health = Math.max(0, Math.min(properties.health, enemy.maxHealth));
        }
        if (properties.maxHealth !== undefined) {
            enemy.maxHealth = Math.max(1, properties.maxHealth);
            enemy.health = Math.min(enemy.health, enemy.maxHealth);
        }
        if (properties.damage !== undefined) {
            enemy.damage = Math.max(0, properties.damage);
        }
        if (properties.speed !== undefined && !isNaN(properties.speed)) {
            enemy.speed = Math.max(0.1, properties.speed);
        }
        if (properties.sizeMultiplier !== undefined && !isNaN(properties.sizeMultiplier)) {
            enemy.sizeMultiplier = Math.max(0.5, Math.min(3.0, properties.sizeMultiplier));
        }
        if (properties.fleeHealthThreshold !== undefined) {
            enemy.fleeHealthThreshold = Math.max(0, Math.min(1, properties.fleeHealthThreshold));
        }
        if (properties.initialFacing !== undefined) {
            enemy.initialFacing = properties.initialFacing;
            enemy.facing = properties.initialFacing; // Also update current facing
        }

        // Update movement properties
        if (properties.isMoving !== undefined) {
            enemy.isMoving = properties.isMoving;
        }

        // Update movement zone
        if (properties.movementZone) {
            enemy.movementZone = { ...enemy.movementZone, ...properties.movementZone };
        }

        // Update attraction zone
        if (properties.attractionZone) {
            enemy.attractionZone = { ...enemy.attractionZone, ...properties.attractionZone };
        }

        return true;
    }

    // Move enemy to new position
    moveEnemy(enemyId, x, y) {
        const enemy = this.data.getEnemyById(enemyId);
        if (!enemy) return false;

        enemy.x = x;
        enemy.y = y;
        // Update initial position (design-time position)
        enemy.initialX = x;
        enemy.initialY = y;

        // Update movement zone relative to new position
        if (enemy.movementZone.enabled) {
            const zoneWidth = enemy.movementZone.endX - enemy.movementZone.startX;
            enemy.movementZone.startX = x - zoneWidth / 2;
            enemy.movementZone.endX = x + zoneWidth / 2;
            enemy.movementZone.y = y;
        }

        return true;
    }

    // Duplicate an enemy
    duplicateEnemy(enemyId) {
        const original = this.data.getEnemyById(enemyId);
        if (!original) return null;

        const duplicate = this.addEnemy(original.x + 50, original.y, original.type);
        if (duplicate) {
            // Copy properties from original
            duplicate.health = original.health;
            duplicate.maxHealth = original.maxHealth;
            duplicate.damage = original.damage;
            duplicate.isMoving = original.isMoving;
            duplicate.sizeMultiplier = original.sizeMultiplier || 1.0;
            duplicate.initialFacing = original.initialFacing || 'right';
            duplicate.facing = duplicate.initialFacing;
            duplicate.movementZone = { ...original.movementZone };
            duplicate.attractionZone = { ...original.attractionZone };

            // Offset zones for the duplicate
            duplicate.movementZone.startX += 50;
            duplicate.movementZone.endX += 50;
            duplicate.attractionZone.x += 50;
        }

        return duplicate;
    }

    // Get enemies in a specific area
    getEnemiesInArea(x, y, width, height) {
        return this.data.getEnemiesInBounds(x, y, x + width, y + height);
    }

    // Clear all enemies
    clearAllEnemies() {
        const count = this.data.enemies.length;
        this.data.clearAllEnemies();
    }

    // Get enemy statistics
    getEnemyStats() {
        const stats = {
            total: this.data.enemies.length,
            byType: {},
            alive: 0,
            dead: 0,
            moving: 0,
            stationary: 0
        };

        for (const enemy of this.data.enemies) {
            // Count by type
            stats.byType[enemy.type] = (stats.byType[enemy.type] || 0) + 1;

            // Count by status
            if (enemy.isDead) {
                stats.dead++;
            } else {
                stats.alive++;
            }

            // Count by movement
            if (enemy.isMoving) {
                stats.moving++;
            } else {
                stats.stationary++;
            }
        }

        return stats;
    }

    // Validate enemy data
    validateEnemyData() {
        const issues = [];

        for (const enemy of this.data.enemies) {
            // Check for invalid positions
            if (enemy.x < 0 || enemy.y < 0) {
                issues.push(`Enemy ${enemy.id} has negative coordinates`);
            }

            // Check for invalid health
            if (enemy.health > enemy.maxHealth) {
                issues.push(`Enemy ${enemy.id} health exceeds max health`);
            }

            // Check movement zone validity
            if (enemy.movementZone.enabled && enemy.movementZone.startX >= enemy.movementZone.endX) {
                issues.push(`Enemy ${enemy.id} has invalid movement zone`);
            }

            // Check attraction zone validity
            if (enemy.attractionZone.enabled && (enemy.attractionZone.width <= 0 || enemy.attractionZone.height <= 0)) {
                issues.push(`Enemy ${enemy.id} has invalid attraction zone`);
            }
        }

        return issues;
    }

    // Reset all enemies to default state
    resetAllEnemies() {
        for (const enemy of this.data.enemies) {
            // Reset position to initial/design-time position
            if (enemy.initialX !== undefined) {
                enemy.x = enemy.initialX;
            }
            if (enemy.initialY !== undefined) {
                enemy.y = enemy.initialY;
            }
            // Reset facing to initial facing direction
            if (enemy.initialFacing !== undefined) {
                enemy.facing = enemy.initialFacing;
            }
            enemy.health = enemy.maxHealth;
            enemy.isDead = false;
            enemy.isDamaged = false;
            enemy.damageTimer = 0;
            enemy.aiState = 'idle';
            enemy.isAttacking = false;
            enemy.attackTimer = 0;
            enemy.currentAnimation = 'idle';
            enemy.frameIndex = 0;
            enemy.frameTimer = 0;
            enemy.velocityX = 0;
            enemy.velocityY = 0;
            enemy.target = null;
        }
    }
}