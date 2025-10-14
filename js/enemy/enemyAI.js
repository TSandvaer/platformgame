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
        this.applyMovement(enemy, player, physicsMultiplier);

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

        // Check if enemy is aggroed (attacked by player)
        // Aggro lasts for 10 seconds after being hit
        const isAggroed = enemy.isAggroed && enemy.aggroTime && (Date.now() - enemy.aggroTime < 10000);

        // Check if enemy should flee (health below threshold)
        const healthPercentage = enemy.health / enemy.maxHealth;

        // Debug: Check if fleeHealthThreshold is properly set
        if (enemy.id === 5 && enemy.health < enemy.maxHealth) {
        }

        const shouldFlee = healthPercentage <= (enemy.fleeHealthThreshold ?? 0.4) && !enemy.isDead;

        // Clear recovery time if health has recovered above flee threshold
        if (!shouldFlee && enemy.fleeRecoveryTime) {
            enemy.fleeRecoveryTime = null;
            if (enemy.id === 5) {
            }
        }

        // Store original position when first entering flee state
        if (shouldFlee && enemy.aiState !== 'fleeing' && !enemy.originalPosition) {
            enemy.originalPosition = { x: enemy.x, y: enemy.y };
        }

        // Debug logging for flee behavior
        if (enemy.health < enemy.maxHealth && (enemy.id === 1 || enemy.id === 5)) { // Log for enemies 1 and 5 to match user's issue
            const thresholdToUse = enemy.fleeHealthThreshold || 0.4;
        }

        // State machine logic
        switch (enemy.aiState) {
            case 'idle':
                // Only flee if player is reasonably close AND health is low
                // This prevents infinite flee/return loop when player is far away
                const closeEnoughToFleeFromIdle = distanceToPlayer < 250; // Only flee if player is within 250 pixels

                // Check if enemy is in recovery period after fleeing
                const currentTimeIdle = Date.now();
                const inRecoveryPeriodIdle = enemy.fleeRecoveryTime && currentTimeIdle < enemy.fleeRecoveryTime;

                if (enemy.id === 5 && shouldFlee) {
                }
                if (shouldFlee && closeEnoughToFleeFromIdle) {
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if ((playerInAttractionZone || distanceToPlayer < 150 || isAggroed) && !inRecoveryPeriodIdle && !shouldFlee) {
                    // Chase if player is in attraction zone OR player is very close (within 150px) OR enemy has been aggroed
                    // Only chase if not in recovery period AND health is not below flee threshold
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                } else if (enemy.isMoving && enemy.movementZone.enabled) {
                    enemy.aiState = 'patrolling';
                }
                break;

            case 'patrolling':
                // Only flee if player is reasonably close AND health is low
                // This prevents infinite flee/return loop when player is far away
                const closeEnoughToFlee = distanceToPlayer < 250; // Only flee if player is within 250 pixels

                // Check if enemy is in recovery period after fleeing
                const currentTime = Date.now();
                const inRecoveryPeriod = enemy.fleeRecoveryTime && currentTime < enemy.fleeRecoveryTime;

                if (enemy.id === 5 && inRecoveryPeriod) {
                }

                if (shouldFlee && closeEnoughToFlee) {
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if ((playerInAttractionZone || distanceToPlayer < 150 || isAggroed) && !inRecoveryPeriod && !shouldFlee) {
                    // Chase if player is in attraction zone OR player is very close (within 150px) OR enemy has been aggroed
                    // Only chase if not in recovery period AND health is not below flee threshold
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                } else if (!enemy.isMoving || !enemy.movementZone.enabled) {
                    enemy.aiState = 'idle';
                }
                break;

            case 'chasing':
                if (shouldFlee) {
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if (!playerInAttractionZone && !isAggroed && distanceToPlayer > 300) {
                    // Lost player (left attraction zone, not aggroed, AND moved far away), return to previous state
                    // Buffer distance prevents disengagement when player is pushed to zone edge
                    // If aggroed, continue chasing even outside attraction zone
                    enemy.aiState = enemy.isMoving ? 'patrolling' : 'idle';
                    enemy.target = null;
                } else {
                    // Check edge-to-edge distance for attack range
                    const edgeDistance = this.getEdgeToEdgeDistance(enemy, player);
                    if (edgeDistance <= enemy.attackRange) {
                        // Close enough to attack (uses enemy's attack range - 50 for melee, 250 for ranged)
                        enemy.aiState = 'attacking';
                        enemy.target = playerCenter;
                    } else {
                        // Continue chasing
                        enemy.target = playerCenter;
                    }
                }
                break;

            case 'attacking':
                if (shouldFlee) {
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else {
                    // Face the player when attacking
                    // Add buffer zone to prevent rapid facing changes when player is very close
                    const facingBuffer = 20; // Don't change facing if player is within 20px of center
                    const dx = playerCenter.x - enemyCenter.x;

                    if (Math.abs(dx) > facingBuffer) {
                        // Only change facing if player is clearly to one side or the other
                        enemy.facing = dx > 0 ? 'right' : 'left';
                    }
                    // If player is within buffer zone, keep current facing

                    enemy.target = playerCenter;

                    if (!playerInAttractionZone && !isAggroed && distanceToPlayer > 300) {
                        // Player left attraction zone, not aggroed, AND moved far away, return to idle or patrolling
                        // Buffer distance prevents disengagement when player is pushed to zone edge during combat
                        // If aggroed, continue fighting even outside attraction zone
                        enemy.aiState = enemy.isMoving ? 'patrolling' : 'idle';
                        enemy.target = null;
                    } else {
                        // Check edge-to-edge distance to see if player moved out of range
                        const edgeDistance = this.getEdgeToEdgeDistance(enemy, player);
                        if (edgeDistance > enemy.attackRange + 30 && !shouldFlee) {
                            // Player moved out of attack range, resume chasing (only if health is not low)
                            enemy.aiState = 'chasing';
                            enemy.target = playerCenter;
                        }
                    }
                }
                // Note: Attack logic is handled by the combat system in enemySystem.js
                // We stay in 'attacking' state as long as player is close and in attraction zone
                break;

            case 'fleeing':
                // Stop fleeing if health recovered or if player is far away
                const fleeDistance = 300; // Distance at which enemy stops fleeing
                const shouldStopFleeing = !shouldFlee || distanceToPlayer > fleeDistance;

                // Debug logging for enemy 5
                if (enemy.id === 5) {
                }

                if (shouldStopFleeing) {
                    // Health recovered or player is far away, return to original behavior
                    if (enemy.isMoving && enemy.movementZone.enabled) {
                        enemy.aiState = 'returning_to_zone';
                        // Set target to movement zone center
                        const zoneCenterX = (enemy.movementZone.startX + enemy.movementZone.endX) / 2;
                        enemy.target = { x: zoneCenterX, y: enemy.movementZone.y };
                    } else {
                        enemy.aiState = 'returning_to_position';
                        enemy.target = { x: enemy.initialX, y: enemy.initialY };
                    }
                } else {
                    // Continue fleeing away from player, ignoring zones
                    enemy.target = playerCenter;
                }
                break;

            case 'returning_to_zone':
                // Return to movement zone after fleeing
                if (!enemy.target) {
                    enemy.aiState = 'patrolling';
                    break;
                }

                const distanceToZone = Math.abs(enemyCenter.x - enemy.target.x);
                // Only resume fleeing if player gets close AND health is still low
                const playerTooCloseForZone = distanceToPlayer < 200; // Player needs to be closer than 200 pixels to interrupt return

                if (enemy.id === 5) {
                }

                if (distanceToZone < 20) {
                    // Reached zone, resume patrolling
                    enemy.aiState = 'patrolling';
                    enemy.target = null;
                    enemy.originalPosition = null;

                    // Set recovery period to prevent immediate re-engagement with player if health is still low
                    if (shouldFlee) {
                        enemy.fleeRecoveryTime = Date.now() + 3000; // 3 second recovery period
                    }

                    // Reset patrol direction based on current position in zone
                    const enemyCenter = enemy.x + enemy.width / 2;
                    const zoneCenterX = (enemy.movementZone.startX + enemy.movementZone.endX) / 2;
                    // If enemy is at center or left of center, start moving right, otherwise left
                    enemy.patrolDirection = enemyCenter <= zoneCenterX ? 1 : -1;
                } else if (shouldFlee && playerTooCloseForZone) {
                    // Player got close again AND health is still low, resume fleeing
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                }
                break;

            case 'returning_to_position':
                // Return to original position after fleeing
                if (!enemy.target) {
                    enemy.aiState = 'idle';
                    break;
                }

                const distanceToPosition = Math.abs(enemyCenter.x - enemy.target.x);
                // Only resume fleeing if player gets close AND health is still low
                const playerTooCloseForPosition = distanceToPlayer < 200; // Player needs to be closer than 200 pixels to interrupt return

                if (enemy.id === 5) {
                }

                if (distanceToPosition < 20) {
                    // Reached original position, resume idle
                    enemy.aiState = 'idle';
                    enemy.target = null;
                    enemy.originalPosition = null;

                    // Set recovery period to prevent immediate re-engagement with player if health is still low
                    if (shouldFlee) {
                        enemy.fleeRecoveryTime = Date.now() + 3000; // 3 second recovery period
                    }
                } else if (shouldFlee && playerTooCloseForPosition) {
                    // Player got close again AND health is still low, resume fleeing
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                }
                break;
        }
    }

    applyMovement(enemy, player, physicsMultiplier) {
        let targetVelocityX = 0;

        switch (enemy.aiState) {
            case 'idle':
                // No movement - ensure velocity is zero
                targetVelocityX = 0;
                break;

            case 'patrolling':
                if (enemy.movementZone.enabled) {
                    // Handle delay at patrol boundaries
                    if (enemy.isDelaying) {
                        enemy.delayTimer -= 16.67 * physicsMultiplier; // Decrement delay timer
                        if (enemy.delayTimer <= 0) {
                            enemy.isDelaying = false; // Delay complete
                            // Reverse direction after delay
                            enemy.patrolDirection = -enemy.patrolDirection;
                        }
                        targetVelocityX = 0; // Don't move while delaying
                        enemy.velocityX = 0; // Instantly stop to prevent overshooting
                    } else {
                        targetVelocityX = this.calculatePatrolMovement(enemy);
                    }
                }
                break;

            case 'chasing':
                if (enemy.target) {
                    targetVelocityX = this.calculateChaseMovement(enemy, player);
                }
                break;

            case 'attacking':
                // Stop moving when attacking - let the attack animation play
                targetVelocityX = 0;
                // Instantly stop to prevent pushing into player
                enemy.velocityX = 0;
                break;

            case 'fleeing':
                if (enemy.target) {
                    targetVelocityX = this.calculateFleeMovement(enemy);
                }
                break;

            case 'returning_to_zone':
            case 'returning_to_position':
                if (enemy.target) {
                    targetVelocityX = this.calculateReturnMovement(enemy);
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

        // Update facing direction (but not during attacking state, and face away when fleeing)
        if (enemy.aiState === 'fleeing') {
            // Face away from player when fleeing
            // Facing always represents actual direction (renderer handles sprite inversion)
            if (enemy.target) {
                const enemyCenter = enemy.x + enemy.width / 2;
                const targetX = enemy.target.x;
                enemy.facing = targetX > enemyCenter ? 'left' : 'right';
            }
        } else if (enemy.aiState !== 'attacking') {
            // Update facing based on movement direction
            // The facing always matches the direction of movement
            // The renderer handles sprite inversion via facingInverted flag
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
            // Reached right boundary
            if (enemy.movementDelay > 0 && !enemy.isDelaying) {
                // Clamp position and start delay at boundary
                enemy.x = zone.endX - enemy.width / 2;
                enemy.isDelaying = true;
                enemy.delayTimer = enemy.movementDelay;
                return 0; // Stop movement while starting delay
            } else if (enemy.movementDelay === 0) {
                // No delay configured, reverse immediately without clamping
                enemy.patrolDirection = -1;
            }
        } else if (enemy.patrolDirection < 0 && enemyCenter <= zone.startX) {
            // Reached left boundary
            if (enemy.movementDelay > 0 && !enemy.isDelaying) {
                // Clamp position and start delay at boundary
                enemy.x = zone.startX - enemy.width / 2;
                enemy.isDelaying = true;
                enemy.delayTimer = enemy.movementDelay;
                return 0; // Stop movement while starting delay
            } else if (enemy.movementDelay === 0) {
                // No delay configured, reverse immediately without clamping
                enemy.patrolDirection = 1;
            }
        }

        const movement = enemy.patrolDirection * enemy.speed;

        return movement;
    }

    calculateChaseMovement(enemy, player) {
        if (!enemy.target || !player) return 0;

        const enemyCenter = enemy.x + enemy.width / 2;
        const targetX = enemy.target.x;

        // Use running speed (2.5x normal speed) when chasing/attracted to player
        const runningSpeed = enemy.speed * 2.5;

        // Calculate edge-to-edge distance to determine if we're in attack range
        const edgeDistance = this.getEdgeToEdgeDistance(enemy, player);

        // Stop moving when within attack range (edge-to-edge)
        if (edgeDistance <= enemy.attackRange) {
            return 0; // Stop moving when in attack range
        }

        // Move towards target at running speed
        const distanceX = targetX - enemyCenter;
        return distanceX > 0 ? runningSpeed : -runningSpeed;
    }

    calculateFleeMovement(enemy) {
        if (!enemy.target) return 0;

        const enemyCenter = enemy.x + enemy.width / 2;
        const targetX = enemy.target.x;

        // Use running speed (2.5x normal speed) when fleeing from player
        const runningSpeed = enemy.speed * 2.5;

        // Simple AI: move away from target at running speed
        if (targetX > enemyCenter + 10) {
            return -runningSpeed; // Move left when player is to the right
        } else if (targetX < enemyCenter - 10) {
            return runningSpeed;  // Move right when player is to the left
        }

        return 0;
    }

    calculateReturnMovement(enemy) {
        if (!enemy.target) return 0;

        const enemyCenter = enemy.x + enemy.width / 2;
        const targetX = enemy.target.x;

        // Use normal walking speed when returning
        const walkingSpeed = enemy.speed;

        // Simple AI: move toward target position
        if (targetX > enemyCenter + 10) {
            return walkingSpeed; // Move right when target is to the right
        } else if (targetX < enemyCenter - 10) {
            return -walkingSpeed; // Move left when target is to the left
        }

        return 0;
    }

    applyPhysics(enemy, physicsMultiplier, platforms) {
        // Reset ground status - will be set to true if enemy is on a platform
        enemy.onGround = false;

        // Update horizontal position
        enemy.x += enemy.velocityX * physicsMultiplier;

        // Always update vertical position (gravity will be applied if needed)
        enemy.y += enemy.velocityY * physicsMultiplier;

        // Apply friction
        enemy.velocityX *= this.friction;

        // Check platform collisions and update ground status
        if (platforms && platforms.length > 0) {
            this.checkPlatformCollisions(enemy, platforms);
        }

        // Apply gravity if not on ground (after platform collision check)
        if (!enemy.onGround) {
            enemy.velocityY += this.gravity * physicsMultiplier;
        }
    }

    checkPlatformCollisions(enemy, platforms) {
        const enemyBottom = enemy.y + enemy.height;
        const tolerance = 2; // Small tolerance for floating point precision

        // Find platforms that enemy overlaps horizontally
        const overlappingPlatforms = platforms.filter(p =>
            enemy.x + enemy.width > p.x && enemy.x < p.x + p.width
        ).sort((a, b) => a.y - b.y); // Sort by Y position (topmost first)

        // Check if enemy is standing on any platform
        for (const platform of overlappingPlatforms) {
            const platformTop = platform.y;

            // Check if enemy is standing on platform (within tolerance)
            if (enemyBottom >= platformTop - tolerance && enemyBottom <= platformTop + tolerance) {
                // Enemy is on the platform
                enemy.y = platformTop - enemy.height;
                enemy.velocityY = 0;
                enemy.onGround = true;
                return; // Found ground, no need to check other platforms
            }

            // Check if enemy is falling and would collide with platform
            if (enemy.velocityY > 0 && enemyBottom >= platformTop && enemy.y < platformTop) {
                // Land on platform
                enemy.y = platformTop - enemy.height;
                enemy.velocityY = 0;
                enemy.onGround = true;
                return; // Landed, no need to check other platforms
            }
        }

        // If we get here, enemy is not on any platform (will fall due to gravity)
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

        // Use edge-to-edge distance instead of center-to-center
        const edgeDistance = this.getEdgeToEdgeDistance(enemy, player);

        return edgeDistance < enemy.attackRange; // Use enemy's attack range (50 for melee, 250 for ranged)
    }

    // Calculate edge-to-edge distance between enemy and player
    getEdgeToEdgeDistance(enemy, player) {
        const playerCenter = this.getPlayerCenter(player);
        const enemyCenter = this.getEnemyCenter(enemy);
        const centerDistance = this.getDistance(enemyCenter, playerCenter);

        // Subtract half widths to get edge-to-edge distance
        const combinedRadius = (enemy.width / 2) + (player.width / 2);
        const edgeDistance = Math.max(0, centerDistance - combinedRadius);

        return edgeDistance;
    }

    getAttackDirection(enemy, player) {
        const playerCenter = this.getPlayerCenter(player);
        const enemyCenter = this.getEnemyCenter(enemy);

        return playerCenter.x > enemyCenter.x ? 'right' : 'left';
    }
}