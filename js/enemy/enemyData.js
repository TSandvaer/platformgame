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
                scale: 3.2, // Visual sprite scale multiplier (100px sprite → 320px render)
                renderOffsetY: 137, // Adjust sprite position to align feet with collision box bottom
                animations: {
                    idle: { file: 'Orc-Idle.png', frames: 6, frameWidth: 100, frameHeight: 100 },
                    walk: { file: 'Orc-Walk.png', frames: 8, frameWidth: 100, frameHeight: 100 },
                    attack: { file: 'Orc-Attack01.png', frames: 4, frameWidth: 100, frameHeight: 100 },
                    hurt: { file: 'Orc-Hurt.png', frames: 4, frameWidth: 100, frameHeight: 100 },
                    death: { file: 'Orc-Death.png', frames: 4, frameWidth: 100, frameHeight: 100 }
                }
            },
            skeleton: {
                name: 'Skeleton',
                spriteFolder: 'sprites/Tiny RPG assets/Characters(100x100)/Skeleton/Skeleton',
                defaultHealth: 75,
                defaultDamage: 15,
                fleeHealthThreshold: 0.3, // Flee when health drops below 30%
                width: 44,
                height: 59,
                scale: 3.2, // Visual sprite scale multiplier (100px sprite → 320px render)
                renderOffsetY: 137, // Adjust sprite position to align feet with collision box bottom
                animations: {
                    idle: { file: 'Skeleton-Idle.png', frames: 6, frameWidth: 100, frameHeight: 100 },
                    walk: { file: 'Skeleton-Walk.png', frames: 8, frameWidth: 100, frameHeight: 100 },
                    attack: { file: 'Skeleton-Attack01.png', frames: 4, frameWidth: 100, frameHeight: 100 },
                    hurt: { file: 'Skeleton-Hurt.png', frames: 4, frameWidth: 100, frameHeight: 100 },
                    death: { file: 'Skeleton-Death.png', frames: 4, frameWidth: 100, frameHeight: 100 }
                }
            },
            babyDragon: {
                name: 'Baby Dragon',
                spriteFolder: 'sprites/Mattz Art/Baby Dragon 2D Pixel Art/Sprites/without_outline',
                defaultHealth: 150,
                defaultDamage: 30,
                fleeHealthThreshold: 0.2, // Flee when health drops below 20%
                width: 95,  // Collision box width - covers dragon body (158 * 0.6)
                height: 75, // Collision box height - covers dragon body (125 * 0.6)
                scale: 1.2, // Visual sprite scale multiplier
                renderOffsetY: -40, // Negative = float above ground (sprite visual)
                collisionOffsetY: -40, // Collision box also floats to match visual position
                facingInverted: true, // Sprite faces opposite direction from orcs/skeletons
                attackType: 'ranged', // Dragon shoots fire projectiles
                attackRange: 250, // Ranged attack distance (vs 60 for melee)
                projectileSpeed: 300, // Fire projectile speed (pixels/second)
                animations: {
                    idle: { file: 'IDLE.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    walk: { file: 'MOVE.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    attack: { file: 'ATTACK.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    hurt: { file: 'HURT.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    death: { file: 'DEATH.png', frames: 4, frameWidth: 158, frameHeight: 125 }
                }
            },
            // Alias for backward compatibility
            dragon: {
                name: 'Baby Dragon',
                spriteFolder: 'sprites/Mattz Art/Baby Dragon 2D Pixel Art/Sprites/without_outline',
                defaultHealth: 150,
                defaultDamage: 30,
                fleeHealthThreshold: 0.2,
                width: 95,
                height: 75,
                scale: 1.2,
                renderOffsetY: -40,
                collisionOffsetY: -40,
                facingInverted: true,
                attackType: 'ranged',
                attackRange: 250,
                projectileSpeed: 300,
                animations: {
                    idle: { file: 'IDLE.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    walk: { file: 'MOVE.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    attack: { file: 'ATTACK.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    hurt: { file: 'HURT.png', frames: 4, frameWidth: 158, frameHeight: 125 },
                    death: { file: 'DEATH.png', frames: 4, frameWidth: 158, frameHeight: 125 }
                }
            },
            adultDragon: {
                name: 'Adult Dragon',
                spriteFolder: 'sprites/Mattz Art/Dragon 2D Pixel Art v1.2/Sprites/without_outline',
                defaultHealth: 250,
                defaultDamage: 40,
                fleeHealthThreshold: 0.15, // Flee when health drops below 15% (tougher than baby)
                width: 100,  // Collision box width - covers large dragon body
                height: 80, // Collision box height - covers large dragon body
                scale: 1.5, // Visual sprite scale multiplier (make sprites larger)
                renderOffsetY: 23, // Ground-based dragon (not floating)
                collisionOffsetY: 0, // Collision box on ground
                facingInverted: true, // Sprite faces opposite direction from orcs/skeletons
                attackType: 'melee', // Uses melee attacks (both bite and fire breath)
                attackRange: 80, // Medium-range fire breath attack distance
                projectileSpeed: 350, // Not used (no projectiles)
                animations: {
                    idle: { file: 'IDLE.png', frames: 9, frameWidth: 144, frameHeight: 96 },
                    walk: { file: 'RUN.png', frames: 8, frameWidth: 144, frameHeight: 96 },
                    attack: { file: 'ATTACK 2.png', frames: 17, frameWidth: 144, frameHeight: 96 }, // Default ranged
                    attack_melee: { file: 'ATTACK 1.png', frames: 13, frameWidth: 144, frameHeight: 96 }, // Close range bite (1872x96)
                    attack_ranged: { file: 'ATTACK 2.png', frames: 17, frameWidth: 144, frameHeight: 96 }, // Long range fire
                    hurt: { file: 'HURT.png', frames: 3, frameWidth: 144, frameHeight: 96 },
                    death: { file: 'DEATH.png', frames: 7, frameWidth: 144, frameHeight: 96 }
                }
            },
            slime: {
                name: 'Slime',
                spriteFolder: 'sprites/Tiny RPG assets/Characters(100x100)/Slime/Slime',
                defaultHealth: 60,
                defaultDamage: 10,
                fleeHealthThreshold: 0.5, // Slimes flee easily when health drops below 50%
                width: 44,
                height: 59,
                scale: 3.2, // Visual sprite scale multiplier (100px sprite → 320px render)
                renderOffsetY: 137, // Adjust sprite position to align feet with collision box bottom
                animations: {
                    idle: { file: 'Slime-Idle.png', frames: 6, frameWidth: 100, frameHeight: 100 },
                    walk: { file: 'Slime-walk.png', frames: 6, frameWidth: 100, frameHeight: 100 },
                    attack: { file: 'Slime-Attack01.png', frames: 6, frameWidth: 100, frameHeight: 100 },
                    hurt: { file: 'slime-hurt.png', frames: 4, frameWidth: 100, frameHeight: 100 },
                    death: { file: 'slime-death.png', frames: 4, frameWidth: 100, frameHeight: 100 }
                }
            },
            goblin: {
                name: 'Goblin',
                spriteFolder: 'sprites/Mattz Art/Goblin 2D Pixel Art v1.1/Sprites/without_outline',
                defaultHealth: 80,
                defaultDamage: 15,
                fleeHealthThreshold: 0.4, // Flee when health drops below 40%
                width: 44,
                height: 80,
                scale: 2, // Visual sprite scale multiplier (adjusted for 115x78 sprites vs 100x100)
                renderOffsetY: 20, // Adjust sprite position to align feet with collision box bottom
                renderOffsetX: -20, // Shift sprite right so collision box covers body instead of club
                animations: {
                    idle: { file: 'IDLE.png', frames: 6, frameWidth: 115, frameHeight: 78 },
                    walk: { file: 'RUN.png', frames: 6, frameWidth: 115, frameHeight: 78 },
                    attack: { file: 'ATTACK1.png', frames: 6, frameWidth: 115, frameHeight: 78 },
                    hurt: { file: 'HURT.png', frames: 3, frameWidth: 115, frameHeight: 78 },
                    death: { file: 'DEATH.png', frames: 10, frameWidth: 115, frameHeight: 78 }
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
            initialX: x, // Design-time position (preserved across reloads)
            initialY: y, // Design-time position (preserved across reloads)
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
            facingInverted: typeData.facingInverted || false, // Some sprites face opposite direction
            collisionOffsetY: typeData.collisionOffsetY || 0, // Y offset for collision box (for floating enemies)
            renderOffsetY: typeData.renderOffsetY || 0, // Y offset for visual sprite rendering (for floating enemies)
            originalPosition: null, // Store original position for returning after fleeing

            // Attack type (melee or ranged)
            attackType: typeData.attackType || 'melee', // 'melee' or 'ranged'
            attackRange: typeData.attackRange || 50, // Edge-to-edge attack distance (50px for melee, higher for ranged)
            projectileSpeed: typeData.projectileSpeed || 300, // For ranged attacks

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
            patrolSpeed: 1,

            // Size multiplier for scaling enemy (both visually and collision box)
            sizeMultiplier: 1.0 // 1.0 = normal size, 0.5 = half size, 2.0 = double size
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
                // Always save initial positions (design-time), not runtime positions
                x: enemy.initialX !== undefined ? enemy.initialX : enemy.x,
                y: enemy.initialY !== undefined ? enemy.initialY : enemy.y,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                damage: enemy.damage,
                isMoving: enemy.isMoving,
                movementZone: enemy.movementZone,
                attractionZone: enemy.attractionZone,
                sizeMultiplier: enemy.sizeMultiplier
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
                // Set both initial and current positions from saved data
                enemy.initialX = enemyData.x;
                enemy.initialY = enemyData.y;
                enemy.x = enemyData.x;
                enemy.y = enemyData.y;
                enemy.health = enemyData.health || enemy.health;
                enemy.maxHealth = enemyData.maxHealth || enemy.maxHealth;
                enemy.damage = enemyData.damage || enemy.damage;
                enemy.isMoving = enemyData.isMoving || false;

                // Backward compatibility: default isVisible to true if not present
                enemy.isVisible = enemyData.isVisible !== undefined ? enemyData.isVisible : true;

                // Backward compatibility: ensure fleeHealthThreshold is set for existing enemies
                enemy.fleeHealthThreshold = enemyData.fleeHealthThreshold || typeData.fleeHealthThreshold || 0.4;

                // Backward compatibility: default sizeMultiplier to 1.0 if not present
                enemy.sizeMultiplier = enemyData.sizeMultiplier !== undefined ? enemyData.sizeMultiplier : 1.0;

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

    // Get all enemy types for UI display (excluding aliases)
    getEnemyTypes() {
        return Object.entries(this.enemyTypes)
            .filter(([key]) => key !== 'dragon') // Exclude dragon alias
            .map(([key, data]) => ({
                id: key,
                name: data.name,
                spriteFolder: data.spriteFolder,
                idleAnimation: data.animations.idle,
                defaultHealth: data.defaultHealth,
                defaultDamage: data.defaultDamage,
                facingInverted: data.facingInverted || false
            }));
    }
}