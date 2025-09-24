class EnemyAI {
    constructor() {
        this.gravity = 0.8;
        this.friction = 0.9;
    }

    update(enemy, deltaTime, player, platforms) {
        if (enemy.isDead) return;

        // Physics multiplier for frame-rate independent updates
        const physicsMultiplier = deltaTime / 16.67;

        // Update AI state machine
        this.updateAIState(enemy, player, physicsMultiplier);

        // Apply AI movement
        this.applyMovement(enemy, physicsMultiplier);

        // Apply physics
        this.applyPhysics(enemy, physicsMultiplier, platforms);
    }

    updateAIState(enemy, player, physicsMultiplier) {
        if (!player) return;

        const playerCenter = this.getPlayerCenter(player);
        const enemyCenter = this.getEnemyCenter(enemy);
        const distanceToPlayer = this.getDistance(enemyCenter, playerCenter);

        // Check if player is in attraction zone
        const playerInAttractionZone = enemy.attractionZone.enabled &&
            this.isPointInZone(playerCenter.x, playerCenter.y, enemy.attractionZone);

        // State machine logic
        switch (enemy.aiState) {
            case 'idle':
                if (playerInAttractionZone) {
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                } else if (enemy.isMoving && enemy.movementZone.enabled) {
                    enemy.aiState = 'patrolling';
                }
                break;

            case 'patrolling':
                if (playerInAttractionZone) {
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                } else if (!enemy.isMoving || !enemy.movementZone.enabled) {
                    enemy.aiState = 'idle';
                }
                break;

            case 'chasing':
                if (!playerInAttractionZone && distanceToPlayer > 200) {
                    // Lost player, return to previous state
                    enemy.aiState = enemy.isMoving ? 'patrolling' : 'idle';
                    enemy.target = null;
                } else if (distanceToPlayer < 60) {
                    // Close enough to attack
                    enemy.aiState = 'attacking';
                    enemy.target = playerCenter;
                } else {
                    // Continue chasing
                    enemy.target = playerCenter;
                }
                break;

            case 'attacking':
                // Face the player when attacking (playerCenter already declared above)
                enemy.facing = playerCenter.x > enemyCenter.x ? 'right' : 'left';
                enemy.target = playerCenter;

                if (!playerInAttractionZone) {
                    // Player left attraction zone, return to idle or patrolling
                    enemy.aiState = enemy.isMoving ? 'patrolling' : 'idle';
                    enemy.target = null;
                } else if (distanceToPlayer > 80) {
                    // Player still in attraction zone but moved out of attack range, resume chasing
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                }
                // Note: Attack logic is handled by the combat system in enemySystem.js
                // We stay in 'attacking' state as long as player is close and in attraction zone
                break;
        }
    }

    applyMovement(enemy, physicsMultiplier) {
        let targetVelocityX = 0;

        switch (enemy.aiState) {
            case 'idle':
                // No movement - ensure velocity is zero
                targetVelocityX = 0;
                break;

            case 'patrolling':
                if (enemy.movementZone.enabled) {
                    targetVelocityX = this.calculatePatrolMovement(enemy);
                }
                break;

            case 'chasing':
            case 'attacking':
                if (enemy.target) {
                    targetVelocityX = this.calculateChaseMovement(enemy);
                }
                break;
        }

        // Apply movement with acceleration
        const acceleration = 0.2 * physicsMultiplier;
        if (Math.abs(targetVelocityX - enemy.velocityX) > 0.1) {
            enemy.velocityX += (targetVelocityX - enemy.velocityX) * acceleration;
        } else {
            enemy.velocityX = targetVelocityX;
        }

        // Apply stronger friction when idle to stop sliding
        if (enemy.aiState === 'idle') {
            enemy.velocityX *= 0.8; // Strong friction for idle enemies
        }

        // Update facing direction (but not during attacking state)
        if (enemy.aiState !== 'attacking') {
            if (enemy.velocityX > 0.1) {
                enemy.facing = 'right';
            } else if (enemy.velocityX < -0.1) {
                enemy.facing = 'left';
            }
        }
    }

    calculatePatrolMovement(enemy) {
        const zone = enemy.movementZone;
        const enemyCenter = enemy.x + enemy.width / 2;

        // Check if we've reached the patrol boundaries
        if (enemy.patrolDirection > 0 && enemyCenter >= zone.endX) {
            enemy.patrolDirection = -1;
        } else if (enemy.patrolDirection < 0 && enemyCenter <= zone.startX) {
            enemy.patrolDirection = 1;
        }

        return enemy.patrolDirection * enemy.speed;
    }

    calculateChaseMovement(enemy) {
        if (!enemy.target) return 0;

        const enemyCenter = enemy.x + enemy.width / 2;
        const targetX = enemy.target.x;

        // Use running speed (2.5x normal speed) when chasing/attracted to player
        const runningSpeed = enemy.speed * 2.5;

        // Simple AI: move towards target at running speed
        if (targetX > enemyCenter + 10) {
            return runningSpeed;
        } else if (targetX < enemyCenter - 10) {
            return -runningSpeed;
        }

        return 0;
    }

    applyPhysics(enemy, physicsMultiplier, platforms) {
        // Only apply gravity if not on ground
        if (!enemy.onGround) {
            enemy.velocityY += this.gravity * physicsMultiplier;
        }

        // Update horizontal position
        enemy.x += enemy.velocityX * physicsMultiplier;

        // Only update vertical position if not on ground
        if (!enemy.onGround) {
            enemy.y += enemy.velocityY * physicsMultiplier;
        }

        // Apply friction
        enemy.velocityX *= this.friction;

        // Check platform collisions if not grounded
        if (!enemy.onGround && platforms && platforms.length > 0) {
            this.checkPlatformCollisions(enemy, platforms);
        }
    }

    checkPlatformCollisions(enemy, platforms) {
        // Only log when enemy is getting close to platforms
        const enemyBottom = enemy.y + enemy.height;

        // Find ALL platforms enemy overlaps horizontally that are below it
        // Priority: platforms closer to the bottom of the screen (higher Y values)
        const allOverlappingPlatforms = platforms.filter(p =>
            enemy.x + enemy.width > p.x && enemy.x < p.x + p.width &&
            p.y > enemy.y
        ).sort((a, b) => b.y - a.y); // Sort by Y position (LOWEST/BOTTOM first)

        // Prefer platforms that are closer to the bottom (visible ground platforms)
        const overlappingPlatforms = allOverlappingPlatforms;

        if (overlappingPlatforms.length > 0 && enemyBottom > overlappingPlatforms[0].y - 200) {
            console.log(`🎯 Enemy ${enemy.id} near platforms! Enemy: (${Math.round(enemy.x)}, ${Math.round(enemy.y)}) bottom=${Math.round(enemyBottom)} velocity=${Math.round(enemy.velocityY)}`);
            console.log(`🎯 Platforms below enemy:`, overlappingPlatforms.map((p, idx) => `Platform ${p.id || idx} at y=${p.y}`).join(', '));
        }

        // Check collision with platforms in order from LOWEST to HIGHEST (bottom platforms first)
        for (const platform of overlappingPlatforms) {
            const platformTop = platform.y;

            // Check if enemy is falling and would land on platform
            if (enemy.velocityY > 0 && enemyBottom >= platformTop && platformTop > enemy.y) {
                // Land on platform - position enemy ON TOP of platform
                enemy.y = platformTop - enemy.height;
                enemy.velocityY = 0;
                enemy.onGround = true;
                console.log(`🎯 Enemy ${enemy.id} LANDED on Platform ${platform.id || '?'} at y=${platformTop}! Enemy final position: y=${enemy.y}, bottom=${enemy.y + enemy.height}`);
                break; // Stop checking other platforms once landed
            }
        }
    }

    // Utility methods
    getPlayerCenter(player) {
        return {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
        };
    }

    getEnemyCenter(enemy) {
        return {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2
        };
    }

    getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isPointInZone(x, y, zone) {
        return x >= zone.x && x <= zone.x + zone.width &&
               y >= zone.y && y <= zone.y + zone.height;
    }

    // Combat helper methods
    canAttackPlayer(enemy, player) {
        if (enemy.isDead) return false;

        const currentTime = Date.now();
        if (currentTime - enemy.lastAttackTime < enemy.attackCooldown) return false;

        const playerCenter = this.getPlayerCenter(player);
        const enemyCenter = this.getEnemyCenter(enemy);
        const distance = this.getDistance(enemyCenter, playerCenter);

        return distance < 60; // Attack range
    }

    getAttackDirection(enemy, player) {
        const playerCenter = this.getPlayerCenter(player);
        const enemyCenter = this.getEnemyCenter(enemy);

        return playerCenter.x > enemyCenter.x ? 'right' : 'left';
    }
}