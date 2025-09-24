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

        for (const enemy of this.data.enemies) {
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

            // Handle combat
            this.handleCombat(enemy, player, animator);
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
        console.log(`Enemy ${enemy.id} took ${damage} damage, health: ${enemy.health}/${enemy.maxHealth}`);

        if (enemy.health <= 0) {
            enemy.health = 0;
            enemy.isDead = true;
            animator.startDeath();
            console.log(`Enemy ${enemy.id} died`);
        } else {
            animator.takeDamage();
        }
    }

    render(viewport, camera, isDevelopmentMode) {
        if (!this.isInitialized || !this.renderer) return;

        const selectedEnemy = this.getSelectedEnemy();
        for (const enemy of this.data.enemies) {
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
}