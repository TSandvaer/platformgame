class EnemyData {
    constructor() {
        this.enemies = [];
        this.nextEnemyId = 1;
        this.selectedEnemy = null;
        this.enemyTypes = {
            orc: {
                name: 'Orc',
                spriteFolder: 'sprites/Tiny RPG assets/Characters(100x100)/Orc/Orc',
                defaultHealth: 100,
                defaultDamage: 20,
                fleeHealthThreshold: 0.4, // Flee when health drops below 40%
                width: 44,
                height: 59,
                scale: 1.25,
                animations: {
                    idle: { file: 'Orc-Idle.png', frames: 6 },
                    walk: { file: 'Orc-Walk.png', frames: 8 },
                    attack: { file: 'Orc-Attack01.png', frames: 4 },
                    hurt: { file: 'Orc-Hurt.png', frames: 4 },
                    death: { file: 'Orc-Death.png', frames: 4 }
                }
            }
        };
    }

    createEnemy(x, y, enemyType = 'orc') {
        const typeData = this.enemyTypes[enemyType];
        if (!typeData) {
            console.error('Unknown enemy type:', enemyType);
            return null;
        }

        const enemy = {
            id: this.nextEnemyId++,
            type: enemyType,
            x: x,
            y: y,
            width: typeData.width,
            height: typeData.height,

            // Combat stats
            health: typeData.defaultHealth,
            maxHealth: typeData.defaultHealth,
            damage: typeData.defaultDamage,

            // Movement properties
            isMoving: false,
            movementZone: {
                enabled: false,
                startX: x - 50,
                endX: x + 50,
                y: y
            },

            // AI properties
            attractionZone: {
                enabled: false,
                x: x - 100,
                y: y + (typeData.height / 2) - 50,
                width: 200,
                height: 100
            },

            // Animation state
            currentAnimation: 'idle',
            frameIndex: 0,
            frameTimer: 0,
            frameRate: 150,
            facing: 'right',

            // Physics
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            speed: 2,

            // AI state
            aiState: 'idle', // idle, patrolling, chasing, attacking, fleeing, returning_to_zone, returning_to_position
            target: null,
            lastPlayerPosition: null,
            fleeHealthThreshold: typeData.fleeHealthThreshold || 0.4,
            originalPosition: null, // Store original position for returning after fleeing

            // Combat state
            isAttacking: false,
            attackTimer: 0,
            attackDuration: 600,
            attackCooldown: 1000,
            lastAttackTime: 0,

            // Status effects
            isDead: false,
            isDamaged: false,
            damageTimer: 0,
            deathTimer: 0,
            flashTimer: 0,
            isVisible: true, // New visibility flag to control rendering without removing from data

            // Patrol state
            patrolDirection: 1, // 1 for right, -1 for left
            patrolSpeed: 1
        };

        this.enemies.push(enemy);
        return enemy;
    }

    removeEnemy(id) {
        const index = this.enemies.findIndex(enemy => enemy.id === id);
        if (index !== -1) {
            const removed = this.enemies.splice(index, 1)[0];
            if (this.selectedEnemy && this.selectedEnemy.id === id) {
                this.selectedEnemy = null;
            }
            return removed;
        }
        return null;
    }

    getEnemyById(id) {
        return this.enemies.find(enemy => enemy.id === id);
    }

    getEnemiesInBounds(left, top, right, bottom) {
        return this.enemies.filter(enemy => {
            return enemy.x + enemy.width > left &&
                   enemy.x < right &&
                   enemy.y + enemy.height > top &&
                   enemy.y < bottom;
        });
    }

    clearAllEnemies() {
        this.enemies = [];
        this.selectedEnemy = null;
        this.nextEnemyId = 1;
    }

    // Export/Import functionality
    exportEnemyData() {
        return {
            enemies: this.enemies.map(enemy => ({
                id: enemy.id,
                type: enemy.type,
                x: enemy.x,
                y: enemy.y,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                damage: enemy.damage,
                isMoving: enemy.isMoving,
                movementZone: enemy.movementZone,
                attractionZone: enemy.attractionZone
            })),
            nextEnemyId: this.nextEnemyId
        };
    }

    importEnemyData(data) {
        if (!data || !Array.isArray(data.enemies)) return false;

        this.clearAllEnemies();
        this.nextEnemyId = data.nextEnemyId || 1;

        for (const enemyData of data.enemies) {
            const enemy = this.createEnemy(enemyData.x, enemyData.y, enemyData.type);
            if (enemy) {
                // Restore saved properties
                enemy.id = enemyData.id;
                enemy.health = enemyData.health || enemy.health;
                enemy.maxHealth = enemyData.maxHealth || enemy.maxHealth;
                enemy.damage = enemyData.damage || enemy.damage;
                enemy.isMoving = enemyData.isMoving || false;

                // Backward compatibility: default isVisible to true if not present
                enemy.isVisible = enemyData.isVisible !== undefined ? enemyData.isVisible : true;

                // Backward compatibility: ensure fleeHealthThreshold is set for existing enemies
                enemy.fleeHealthThreshold = enemyData.fleeHealthThreshold || typeData.fleeHealthThreshold || 0.4;

                if (enemyData.movementZone) {
                    enemy.movementZone = { ...enemy.movementZone, ...enemyData.movementZone };
                }
                if (enemyData.attractionZone) {
                    enemy.attractionZone = { ...enemy.attractionZone, ...enemyData.attractionZone };
                }
            }
        }

        return true;
    }

    // Utility methods
    getEnemyBounds(enemy) {
        return {
            left: enemy.x,
            right: enemy.x + enemy.width,
            top: enemy.y,
            bottom: enemy.y + enemy.height
        };
    }

    isPointInAttractionZone(enemy, x, y) {
        if (!enemy.attractionZone.enabled) return false;

        const zone = enemy.attractionZone;
        return x >= zone.x && x <= zone.x + zone.width &&
               y >= zone.y && y <= zone.y + zone.height;
    }

    getEnemyCenter(enemy) {
        return {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2
        };
    }
}