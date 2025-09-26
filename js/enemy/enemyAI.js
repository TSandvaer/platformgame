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

        // Check if enemy should flee (health below threshold)
        const healthPercentage = enemy.health / enemy.maxHealth;

        // Debug: Check if fleeHealthThreshold is properly set
        if (enemy.id === 5 && enemy.health < enemy.maxHealth) {
            console.log(`DEBUG Enemy 5: fleeHealthThreshold = ${enemy.fleeHealthThreshold}, type = ${typeof enemy.fleeHealthThreshold}`);
        }

        const shouldFlee = healthPercentage <= (enemy.fleeHealthThreshold || 0.4) && !enemy.isDead;

        // Store original position when first entering flee state
        if (shouldFlee && enemy.aiState !== 'fleeing' && !enemy.originalPosition) {
            enemy.originalPosition = { x: enemy.x, y: enemy.y };
        }

        // Debug logging for flee behavior
        if (enemy.health < enemy.maxHealth && (enemy.id === 1 || enemy.id === 5)) { // Log for enemies 1 and 5 to match user's issue
            const thresholdToUse = enemy.fleeHealthThreshold || 0.4;
            console.log(`Enemy ${enemy.id} health: ${enemy.health}/${enemy.maxHealth} (${Math.round(healthPercentage * 100)}%), threshold: ${Math.round(thresholdToUse * 100)}%, shouldFlee: ${shouldFlee}, state: ${enemy.aiState}`);
        }

        // State machine logic
        switch (enemy.aiState) {
            case 'idle':
                // Only flee if player is reasonably close AND health is low
                // This prevents infinite flee/return loop when player is far away
                const closeEnoughToFleeFromIdle = distanceToPlayer < 250; // Only flee if player is within 250 pixels

                if (enemy.id === 5 && shouldFlee) {
                    console.log(`DEBUG: Enemy 5 in IDLE state, should flee: ${shouldFlee}, close enough: ${closeEnoughToFleeFromIdle}, distance: ${Math.round(distanceToPlayer)}`);
                }
                if (shouldFlee && closeEnoughToFleeFromIdle) {
                    console.log(`Enemy ${enemy.id} entering FLEEING state from idle (health: ${Math.round(healthPercentage * 100)}%, player distance: ${Math.round(distanceToPlayer)})`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if (playerInAttractionZone) {
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

                if (shouldFlee && closeEnoughToFlee) {
                    console.log(`Enemy ${enemy.id} entering FLEEING state from patrolling (health: ${Math.round(healthPercentage * 100)}%, player distance: ${Math.round(distanceToPlayer)})`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if (playerInAttractionZone) {
                    enemy.aiState = 'chasing';
                    enemy.target = playerCenter;
                } else if (!enemy.isMoving || !enemy.movementZone.enabled) {
                    enemy.aiState = 'idle';
                }
                break;

            case 'chasing':
                if (shouldFlee) {
                    console.log(`Enemy ${enemy.id} entering FLEEING state from chasing (health: ${Math.round(healthPercentage * 100)}%)`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else if (!playerInAttractionZone && distanceToPlayer > 200) {
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
                if (shouldFlee) {
                    console.log(`Enemy ${enemy.id} entering FLEEING state from attacking (health: ${Math.round(healthPercentage * 100)}%)`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                } else {
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
                    console.log(`Enemy 5 FLEEING: distance=${Math.round(distanceToPlayer)}, fleeDistance=${fleeDistance}, shouldFlee=${shouldFlee}, shouldStopFleeing=${shouldStopFleeing}`);
                }

                if (shouldStopFleeing) {
                    console.log(`Enemy ${enemy.id} stopping flee: health recovered=${!shouldFlee}, far away=${distanceToPlayer > fleeDistance}`);
                    // Health recovered or player is far away, return to original behavior
                    if (enemy.isMoving && enemy.movementZone.enabled) {
                        console.log(`Enemy ${enemy.id} returning to movement zone`);
                        enemy.aiState = 'returning_to_zone';
                        // Set target to movement zone center
                        const zoneCenterX = (enemy.movementZone.startX + enemy.movementZone.endX) / 2;
                        enemy.target = { x: zoneCenterX, y: enemy.movementZone.y };
                    } else {
                        console.log(`Enemy ${enemy.id} returning to original position`);
                        enemy.aiState = 'returning_to_position';
                        enemy.target = enemy.originalPosition;
                    }
                } else {
                    // Continue fleeing away from player, ignoring zones
                    enemy.target = playerCenter;
                }
                break;

            case 'returning_to_zone':
                // Return to movement zone after fleeing
                if (!enemy.target) {
                    console.log(`Enemy ${enemy.id} no target in returning_to_zone, switching to patrolling`);
                    enemy.aiState = 'patrolling';
                    break;
                }

                const distanceToZone = Math.abs(enemyCenter.x - enemy.target.x);
                // Only resume fleeing if player gets close AND health is still low
                const playerTooCloseForZone = distanceToPlayer < 200; // Player needs to be closer than 200 pixels to interrupt return

                if (enemy.id === 5) {
                    console.log(`Enemy 5 RETURNING_TO_ZONE: distanceToZone=${Math.round(distanceToZone)}, playerDistance=${Math.round(distanceToPlayer)}, playerTooClose=${playerTooCloseForZone}, shouldFlee=${shouldFlee}`);
                }

                if (distanceToZone < 20) {
                    // Reached zone, resume patrolling
                    console.log(`Enemy ${enemy.id} reached zone, resuming patrolling`);
                    enemy.aiState = 'patrolling';
                    enemy.target = null;
                    enemy.originalPosition = null;

                    // Reset patrol direction based on current position in zone
                    const enemyCenter = enemy.x + enemy.width / 2;
                    const zoneCenterX = (enemy.movementZone.startX + enemy.movementZone.endX) / 2;
                    // If enemy is at center or left of center, start moving right, otherwise left
                    enemy.patrolDirection = enemyCenter <= zoneCenterX ? 1 : -1;
                    console.log(`Enemy ${enemy.id} patrol direction set to ${enemy.patrolDirection} (center: ${enemyCenter}, zone center: ${zoneCenterX})`);
                } else if (shouldFlee && playerTooCloseForZone) {
                    // Player got close again AND health is still low, resume fleeing
                    console.log(`Enemy ${enemy.id} player got close while returning (distance: ${Math.round(distanceToPlayer)}), resuming fleeing`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                }
                break;

            case 'returning_to_position':
                // Return to original position after fleeing
                if (!enemy.target) {
                    console.log(`Enemy ${enemy.id} no target in returning_to_position, switching to idle`);
                    enemy.aiState = 'idle';
                    break;
                }

                const distanceToPosition = Math.abs(enemyCenter.x - enemy.target.x);
                // Only resume fleeing if player gets close AND health is still low
                const playerTooCloseForPosition = distanceToPlayer < 200; // Player needs to be closer than 200 pixels to interrupt return

                if (enemy.id === 5) {
                    console.log(`Enemy 5 RETURNING_TO_POSITION: distanceToPosition=${Math.round(distanceToPosition)}, playerDistance=${Math.round(distanceToPlayer)}, playerTooClose=${playerTooCloseForPosition}, shouldFlee=${shouldFlee}`);
                }

                if (distanceToPosition < 20) {
                    // Reached original position, resume idle
                    console.log(`Enemy ${enemy.id} reached original position, resuming idle`);
                    enemy.aiState = 'idle';
                    enemy.target = null;
                    enemy.originalPosition = null;
                } else if (shouldFlee && playerTooCloseForPosition) {
                    // Player got close again AND health is still low, resume fleeing
                    console.log(`Enemy ${enemy.id} player got close while returning (distance: ${Math.round(distanceToPlayer)}), resuming fleeing`);
                    enemy.aiState = 'fleeing';
                    enemy.target = playerCenter;
                }
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
            if (enemy.target) {
                const enemyCenter = enemy.x + enemy.width / 2;
                const targetX = enemy.target.x;
                enemy.facing = targetX > enemyCenter ? 'left' : 'right';
            }
        } else if (enemy.aiState !== 'attacking') {
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

        // Debug logging for enemy 5 patrol movement
        if (enemy.id === 5) {
            console.log(`Enemy 5 PATROL: center=${Math.round(enemyCenter)}, zone=[${zone.startX}, ${zone.endX}], direction=${enemy.patrolDirection}`);
        }

        // Check if we've reached the patrol boundaries
        if (enemy.patrolDirection > 0 && enemyCenter >= zone.endX) {
            enemy.patrolDirection = -1;
            if (enemy.id === 5) console.log(`Enemy 5 reached right boundary, turning left`);
        } else if (enemy.patrolDirection < 0 && enemyCenter <= zone.startX) {
            enemy.patrolDirection = 1;
            if (enemy.id === 5) console.log(`Enemy 5 reached left boundary, turning right`);
        }

        const movement = enemy.patrolDirection * enemy.speed;
        if (enemy.id === 5) {
            console.log(`Enemy 5 PATROL movement: ${movement} (direction: ${enemy.patrolDirection}, speed: ${enemy.speed})`);
        }

        return movement;
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