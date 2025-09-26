class EnemySystem {
    constructor() {
        this.data = new EnemyData();
        this.manager = new EnemyManager(this.data);
        this.ai = new EnemyAI();
        this.collisions = new EnemyCollisions();
        this.renderer = null;
        this.animators = new Map();
        this.mouseHandler = null;
        this.isInitialized = false;
    }

    initialize(ctx, platformSystem, viewport, camera) {
        this.renderer = new EnemyRenderer(ctx);
        this.mouseHandler = new EnemyMouseHandler(this, platformSystem, viewport, camera);
        this.isInitialized = true;
        console.log('Enemy system initialized');
    }

    update(deltaTime, player, platforms) {
        if (!this.isInitialized) return;

        // Use a reverse for loop to safely remove dead enemies
        for (let i = this.data.enemies.length - 1; i >= 0; i--) {
            const enemy = this.data.enemies[i];

            // Backward compatibility: ensure fleeHealthThreshold is set for existing enemies
            if (enemy.fleeHealthThreshold === undefined || enemy.fleeHealthThreshold === null) {
                enemy.fleeHealthThreshold = 0.4;
                console.log(`Fixed missing fleeHealthThreshold for enemy ${enemy.id}`);
            }

            // Handle death timer countdown
            if (enemy.isDead && enemy.isVisible) {
                enemy.deathTimer -= deltaTime;
                enemy.flashTimer += deltaTime; // Update flash timer for blinking effect
                if (enemy.deathTimer <= 0) {
                    // Hide the corpse instead of removing from data (only once)
                    console.log(`👻 Enemy ${enemy.id} corpse hidden after 2 seconds - preserved in data for revival`);

                    enemy.isVisible = false;
                    this.animators.delete(enemy.id); // Clean up animator for performance

                    // Update UI if this was the selected enemy
                    if (this.data.selectedEnemy && this.data.selectedEnemy.id === enemy.id) {
                        this.data.selectedEnemy = null;
                        if (window.uiEventHandler) {
                            window.uiEventHandler.updateEnemyList();
                            window.uiEventHandler.updateEnemyProperties();
                        }
                    }
                }
            }

            // Skip AI, combat, and animation updates for invisible enemies
            if (!enemy.isVisible) {
                continue; // Skip to next enemy - invisible enemies don't need updates
            }

            // Update AI (includes physics and platform collision detection)
            this.ai.update(enemy, deltaTime, player, platforms);

            // Get or create animator for this enemy
            let animator = this.animators.get(enemy.id);
            if (!animator) {
                animator = new EnemyAnimator(enemy, this.data.enemyTypes[enemy.type]);
                this.animators.set(enemy.id, animator);
            }

            // Update animation
            animator.update(deltaTime);
            animator.updateDamageState(deltaTime);
            animator.updateAnimationBasedOnState(Math.abs(enemy.velocityX) > 0.5);

            // Handle combat (only if enemy is alive)
            if (!enemy.isDead) {
                this.handleCombat(enemy, player, animator);
            }
        }
    }

    handleCombat(enemy, player, animator) {
        if (!player || enemy.isDead || player.isDead) return;

        // Check if enemy can attack player
        if (this.ai.canAttackPlayer(enemy, player)) {
            const currentTime = Date.now();
            if (currentTime - enemy.lastAttackTime > enemy.attackCooldown) {
                enemy.lastAttackTime = currentTime;
                animator.startAttack();
            }
        }

        // Check enemy attack collision with player
        if (enemy.isAttacking) {
            const attackCollision = this.collisions.checkEnemyAttackCollision(enemy, player);
            if (attackCollision && !player.isDamaged) {
                // Damage player using player's takeDamage method
                player.takeDamage(attackCollision.damage);
                console.log(`Enemy ${enemy.id} attacked player for ${attackCollision.damage} damage`);
            }
        }

        // Check player attack collision with enemy
        if (player.isAttacking) {
            const playerAttackCollision = this.collisions.checkPlayerAttackCollision(player, enemy);
            if (playerAttackCollision && !enemy.isDamaged) {
                this.damageEnemy(enemy, playerAttackCollision.damage, animator);
            }
        }

        // Check basic collision between enemy and player
        const collision = this.collisions.checkEnemyPlayerCollision(enemy, player);
        if (collision) {
            // Push player away from enemy (enemy stays stationary)
            const overlap = collision.overlap;
            if (overlap && overlap.width < overlap.height) {
                // Horizontal collision - push player back fully
                if (player.x < enemy.x) {
                    player.x = enemy.x - player.width - 2; // Push player to left of enemy
                } else {
                    player.x = enemy.x + enemy.width + 2; // Push player to right of enemy
                }
                player.velocityX = 0; // Stop player movement
            } else if (overlap) {
                // Vertical collision
                if (player.y < enemy.y) {
                    player.y = enemy.y - player.height - 2; // Push player above enemy
                } else {
                    player.y = enemy.y + enemy.height + 2; // Push player below enemy
                }
                player.velocityY = 0; // Stop player vertical movement
            }
        }
    }

    damageEnemy(enemy, damage, animator) {
        enemy.health -= damage;
        const healthPercentage = enemy.health / enemy.maxHealth;
        console.log(`Enemy ${enemy.id} took ${damage} damage, health: ${enemy.health}/${enemy.maxHealth} (${Math.round(healthPercentage * 100)}%)`);
        console.log(`Enemy ${enemy.id} flee threshold: ${Math.round((enemy.fleeHealthThreshold || 0.4) * 100)}%, should flee: ${healthPercentage <= (enemy.fleeHealthThreshold || 0.4)}`);

        if (enemy.health <= 0) {
            enemy.health = 0;
            enemy.isDead = true;
            enemy.deathTimer = 2000; // 2 seconds in milliseconds
            enemy.flashTimer = 0; // Initialize flash timer for death effect
            animator.startDeath();
            console.log(`Enemy ${enemy.id} died - corpse will disappear in 2 seconds`);
        } else {
            animator.takeDamage();
        }
    }

    render(viewport, camera, isDevelopmentMode) {
        if (!this.isInitialized || !this.renderer) return;

        const selectedEnemy = this.getSelectedEnemy();
        for (const enemy of this.data.enemies) {
            // Skip rendering invisible enemies
            if (!enemy.isVisible) {
                continue;
            }

            const animator = this.animators.get(enemy.id);
            if (animator) {
                this.renderer.renderEnemy(enemy, animator, viewport, camera, isDevelopmentMode, selectedEnemy);
                this.renderer.renderHealthBar(enemy, viewport, camera);
            }
        }

        // Render attraction zone drawing preview
        if (this.mouseHandler) {
            this.mouseHandler.renderAttractionZonePreview(this.renderer.ctx);
            this.mouseHandler.renderMovementZonePreview(this.renderer.ctx);
        }
    }

    // Scene management methods
    addEnemyToScene(x, y, enemyType = 'orc') {
        return this.manager.addEnemy(x, y, enemyType);
    }

    removeEnemyFromScene(enemyId) {
        const removed = this.manager.removeEnemy(enemyId);
        if (removed) {
            this.animators.delete(enemyId);
        }
        return removed;
    }

    getEnemyAtPosition(x, y, tolerance = 10) {
        return this.manager.getEnemyAtPosition(x, y, tolerance);
    }

    selectEnemy(enemy) {
        this.manager.selectEnemy(enemy);
    }

    getSelectedEnemy() {
        return this.manager.getSelectedEnemy();
    }

    updateEnemyProperties(enemyId, properties) {
        return this.manager.updateEnemyProperties(enemyId, properties);
    }

    moveEnemy(enemyId, x, y) {
        return this.manager.moveEnemy(enemyId, x, y);
    }

    duplicateEnemy(enemyId) {
        const duplicate = this.manager.duplicateEnemy(enemyId);
        if (duplicate) {
            // Animator will be created on next update
        }
        return duplicate;
    }

    clearAllEnemies() {
        this.manager.clearAllEnemies();
        this.animators.clear();
    }

    getEnemyStats() {
        return this.manager.getEnemyStats();
    }

    validateEnemyData() {
        return this.manager.validateEnemyData();
    }

    resetAllEnemies() {
        this.manager.resetAllEnemies();
        // Reset animators too
        for (const [enemyId, animator] of this.animators) {
            const enemy = this.data.getEnemyById(enemyId);
            if (enemy) {
                animator.setAnimation('idle');
            }
        }
    }

    // Save/load functionality
    exportEnemyData() {
        return this.data.exportData();
    }

    importEnemyData(data) {
        this.data.importData(data);
        this.animators.clear(); // Clear animators, they'll be recreated on update
    }

    // Mouse handling methods
    handleMouseDown(worldMouseX, worldMouseY, ctrlPressed = false, shiftPressed = false) {
        if (!this.mouseHandler) return { handled: false };
        return this.mouseHandler.handleMouseDown(worldMouseX, worldMouseY, ctrlPressed, shiftPressed);
    }

    handleMouseMove(worldMouseX, worldMouseY) {
        if (!this.mouseHandler) return false;
        return this.mouseHandler.handleMouseMove(worldMouseX, worldMouseY);
    }

    handleMouseUp(ctrlPressed = false) {
        if (!this.mouseHandler) return { handled: false };
        return this.mouseHandler.handleMouseUp(ctrlPressed);
    }

    // UI integration methods
    toggleEnemyPlacement() {
        if (this.mouseHandler) {
            this.mouseHandler.toggleEnemyPlacement();
        }
    }

    get enemyPlacementMode() {
        return this.mouseHandler ? this.mouseHandler.enemyPlacementMode : false;
    }

    // Attraction zone drawing methods
    startAttractionZoneDrawing(enemy) {
        if (this.mouseHandler) {
            this.mouseHandler.startAttractionZoneDrawingMode(enemy);
            return true;
        }
        return false;
    }

    cancelAttractionZoneDrawing() {
        if (this.mouseHandler) {
            this.mouseHandler.cancelAttractionZoneDrawing();
        }
    }

    get isDrawingAttractionZone() {
        return this.mouseHandler ? this.mouseHandler.isDrawingAttractionZone : false;
    }

    // Movement zone drawing methods
    startMovementZoneDrawing(enemy) {
        if (this.mouseHandler) {
            this.mouseHandler.startMovementZoneDrawingMode(enemy);
            return true;
        }
        return false;
    }

    cancelMovementZoneDrawing() {
        if (this.mouseHandler) {
            this.mouseHandler.cancelMovementZoneDrawing();
        }
    }

    get isDrawingMovementZone() {
        return this.mouseHandler ? this.mouseHandler.isDrawingMovementZone : false;
    }

    get isDraggingEnemy() {
        return this.mouseHandler ? this.mouseHandler.isDraggingEnemy : false;
    }
}