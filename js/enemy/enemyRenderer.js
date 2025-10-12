class EnemyRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    renderEnemy(enemy, animator, viewport, camera, isDevelopmentMode, selectedEnemy = null) {
        if (!animator.isReady()) {
            // Fallback to rendering a colored rectangle if sprites aren't loaded
            this.renderFallback(enemy, viewport, camera);
        } else {
            const frame = animator.getCurrentFrame();
            if (!frame) {
                this.renderFallback(enemy, viewport, camera);
            } else {
                this.renderSprite(enemy, frame, viewport, camera);
            }
        }

        // Render health bar if enemy is damaged
        this.renderHealthBar(enemy, viewport, camera);

        // Render selection indicator if this enemy is selected
        if (selectedEnemy && selectedEnemy.id === enemy.id) {
            this.renderSelectionIndicator(enemy, viewport, camera);
        }

        // Render fleeing text if enemy is fleeing
        if (enemy.aiState === 'fleeing') {
            this.renderFleeingText(enemy, viewport, camera);
        }

        // Render debug info in development mode
        if (isDevelopmentMode) {
            this.renderDebugInfo(enemy, viewport, camera, selectedEnemy);
        }
    }

    renderSprite(enemy, frame, viewport, camera) {
        this.ctx.save();

        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Check if dead enemy should be visible (blinking effect)
        if (enemy.isDead && !this.shouldRenderDeadEnemy(enemy)) {
            this.ctx.restore();
            return;
        }

        // Get enemy type data for scale and rendering offsets
        const enemyTypeData = window.game?.enemySystem?.data?.enemyTypes?.[enemy.type];
        const typeScale = enemyTypeData?.scale || 1.0;
        const sizeMultiplier = enemy.sizeMultiplier || 1.0;
        const totalScale = typeScale * sizeMultiplier; // Combine type scale and instance size multiplier
        // Check enemy instance first (for dynamic changes like death fall), then type data
        const baseRenderOffsetY = (enemy.renderOffsetY !== undefined) ? enemy.renderOffsetY : (enemyTypeData?.renderOffsetY || 0);
        const baseRenderOffsetX = (enemy.renderOffsetX !== undefined) ? enemy.renderOffsetX : (enemyTypeData?.renderOffsetX || 0);
        // Scale the render offsets proportionally with enemy size
        const renderOffsetY = baseRenderOffsetY * sizeMultiplier;
        const renderOffsetX = baseRenderOffsetX * sizeMultiplier;

        // Calculate Y offset to keep bottom of collision box at same position
        const scaleYOffset = enemy.height * (1 - sizeMultiplier);

        // Apply camera and viewport transformation (with scale Y offset)
        let renderX = enemy.x;
        let renderY = enemy.y + scaleYOffset;
        if (viewport && camera) {
            renderX = (enemy.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = ((enemy.y + scaleYOffset) - camera.y) * viewport.scaleY + viewport.offsetY;
        }

        // Calculate sprite render dimensions using actual frame dimensions and total scale
        const spriteRenderWidth = Math.round(frame.frameWidth * totalScale);
        const spriteRenderHeight = Math.round(frame.frameHeight * totalScale);

        // Compensate for different animation heights (e.g., attack_melee is shorter)
        // Get the "standard" sprite height (idle animation) for comparison
        const standardHeight = enemyTypeData?.animations?.idle?.frameHeight || frame.frameHeight;
        const standardRenderHeight = Math.round(standardHeight * totalScale);
        const heightDifference = standardRenderHeight - spriteRenderHeight;

        // If current animation is shorter, adjust offset to keep sprite at same vertical position
        // (subtract the difference to move sprite up)
        const heightCompensation = heightDifference;

        // Calculate scaled enemy dimensions for collision box
        const enemyScaledWidth = enemy.width * sizeMultiplier;
        const enemyScaledHeight = enemy.height * sizeMultiplier;

        // Center sprite horizontally on enemy collision box, align bottom (with optional offsets)
        const spriteOffsetX = Math.round((enemyScaledWidth - spriteRenderWidth) / 2) + renderOffsetX;
        const spriteOffsetY = Math.round(enemyScaledHeight - spriteRenderHeight) + renderOffsetY - heightCompensation;

        // Apply viewport scaling to offsets with pixel-perfect rounding
        const scaledOffsetX = Math.round(spriteOffsetX * (viewport ? viewport.scaleX : 1));
        const scaledOffsetY = Math.round(spriteOffsetY * (viewport ? viewport.scaleY : 1));
        const scaledWidth = Math.round(spriteRenderWidth * (viewport ? viewport.scaleX : 1));
        const scaledHeight = Math.round(spriteRenderHeight * (viewport ? viewport.scaleY : 1));

        // Flip sprite horizontally based on facing direction
        // If facingInverted is true, flip the logic (for sprites oriented opposite way)
        const shouldFlip = enemy.facingInverted ? (enemy.facing === 'right') : (enemy.facing === 'left');

        if (shouldFlip) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                frame.image,
                frame.sourceX, frame.sourceY,
                frame.frameWidth, frame.frameHeight,
                -(renderX + scaledOffsetX + scaledWidth),
                renderY + scaledOffsetY,
                scaledWidth, scaledHeight
            );
        } else {
            this.ctx.drawImage(
                frame.image,
                frame.sourceX, frame.sourceY,
                frame.frameWidth, frame.frameHeight,
                renderX + scaledOffsetX,
                renderY + scaledOffsetY,
                scaledWidth, scaledHeight
            );
        }

        this.ctx.restore();
    }

    renderFallback(enemy, viewport, camera) {
        this.ctx.save();

        // Disable image smoothing for crisp fallback rendering
        this.ctx.imageSmoothingEnabled = false;

        // Check if dead enemy should be visible (blinking effect)
        if (enemy.isDead && !this.shouldRenderDeadEnemy(enemy)) {
            this.ctx.restore();
            return;
        }

        // Use direct world coordinates like player renderer (camera transformation handled elsewhere)
        let renderX = enemy.x;
        let renderY = enemy.y;
        let renderWidth = enemy.width;
        let renderHeight = enemy.height;

        // Choose color based on enemy state
        let enemyColor = '#8B4513'; // Brown for orc
        if (enemy.isDead) {
            enemyColor = '#666666'; // Gray when dead
        } else if (enemy.isDamaged) {
            enemyColor = '#FF4444'; // Red when damaged
        } else if (enemy.isAttacking) {
            enemyColor = '#FF8800'; // Orange when attacking
        }

        // Render a colored rectangle as fallback
        this.ctx.fillStyle = enemyColor;
        this.ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

        // Add type indicator
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${12 * (viewport ? viewport.scaleX : 1)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(enemy.type.toUpperCase(), renderX + renderWidth / 2, renderY + renderHeight / 2);

        this.ctx.restore();
    }

    renderDebugInfo(enemy, viewport, camera, selectedEnemy = null) {
        this.ctx.save();

        // Apply camera and viewport transformation
        const sizeMultiplier = enemy.sizeMultiplier || 1.0;
        const enemyScaledWidth = enemy.width * sizeMultiplier;
        const enemyScaledHeight = enemy.height * sizeMultiplier;

        // Calculate Y offset to keep bottom of collision box at same position
        const scaleYOffset = enemy.height * (1 - sizeMultiplier);

        let renderX = enemy.x;
        let renderY = enemy.y + scaleYOffset;
        let renderWidth = enemyScaledWidth;
        let renderHeight = enemyScaledHeight;

        // Apply collision box offset for floating enemies
        const collisionOffsetY = enemy.collisionOffsetY || 0;

        if (viewport && camera) {
            renderX = (enemy.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = ((enemy.y + collisionOffsetY + scaleYOffset) - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = enemyScaledWidth * viewport.scaleX;
            renderHeight = enemyScaledHeight * viewport.scaleY;
        } else {
            renderY = enemy.y + collisionOffsetY + scaleYOffset;
        }

        // Draw collision box
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(renderX, renderY, renderWidth, renderHeight);

        // Draw center point
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(renderX + renderWidth / 2, renderY + renderHeight / 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw movement zone if enabled and enemy is selected
        if (enemy.movementZone.enabled && selectedEnemy && selectedEnemy.id === enemy.id) {
            const zoneStartX = viewport && camera ?
                (enemy.movementZone.startX - camera.x) * viewport.scaleX + viewport.offsetX :
                enemy.movementZone.startX;
            const zoneEndX = viewport && camera ?
                (enemy.movementZone.endX - camera.x) * viewport.scaleX + viewport.offsetX :
                enemy.movementZone.endX;
            const zoneY = viewport && camera ?
                (enemy.movementZone.y - camera.y) * viewport.scaleY + viewport.offsetY :
                enemy.movementZone.y;

            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(zoneStartX, zoneY);
            this.ctx.lineTo(zoneEndX, zoneY);
            this.ctx.stroke();

            // Draw zone markers
            this.ctx.fillStyle = 'cyan';
            this.ctx.beginPath();
            this.ctx.arc(zoneStartX, zoneY, 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(zoneEndX, zoneY, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw zone label
            this.ctx.fillStyle = 'cyan';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.font = `${10 * (viewport ? viewport.scaleX : 1)}px Arial`;
            this.ctx.textAlign = 'center';
            const labelX = (zoneStartX + zoneEndX) / 2;
            const labelY = zoneY - 8;
            this.ctx.strokeText('movement zone', labelX, labelY);
            this.ctx.fillText('movement zone', labelX, labelY);
        }

        // Draw attraction zone if enabled and enemy is selected
        if (enemy.attractionZone.enabled && selectedEnemy && selectedEnemy.id === enemy.id) {
            const zoneX = viewport && camera ?
                (enemy.attractionZone.x - camera.x) * viewport.scaleX + viewport.offsetX :
                enemy.attractionZone.x;
            const zoneY = viewport && camera ?
                (enemy.attractionZone.y - camera.y) * viewport.scaleY + viewport.offsetY :
                enemy.attractionZone.y;
            const zoneWidth = enemy.attractionZone.width * (viewport ? viewport.scaleX : 1);
            const zoneHeight = enemy.attractionZone.height * (viewport ? viewport.scaleY : 1);

            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
            this.ctx.setLineDash([]);

            // Draw zone label
            this.ctx.fillStyle = 'yellow';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            this.ctx.font = `${10 * (viewport ? viewport.scaleX : 1)}px Arial`;
            this.ctx.textAlign = 'center';
            const labelX = zoneX + zoneWidth / 2;
            const labelY = zoneY - 8;
            this.ctx.strokeText('attraction zone', labelX, labelY);
            this.ctx.fillText('attraction zone', labelX, labelY);
        }

        // Draw state info
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = `${12 * (viewport ? viewport.scaleX : 1)}px Arial`;
        this.ctx.textAlign = 'left';

        const infoY = renderY - 10;
        let infoText = `${enemy.type} | ${enemy.currentAnimation} | ${enemy.aiState}`;
        if (enemy.health < enemy.maxHealth) {
            infoText += ` | HP:${Math.ceil(enemy.health)}/${enemy.maxHealth}`;
        }

        this.ctx.strokeText(infoText, renderX, infoY);
        this.ctx.fillText(infoText, renderX, infoY);

        this.ctx.restore();
    }

    renderHealthBar(enemy, viewport, camera) {
        if (enemy.isDead || enemy.health >= enemy.maxHealth) return;

        this.ctx.save();

        // Apply camera and viewport transformation
        const sizeMultiplier = enemy.sizeMultiplier || 1.0;
        const enemyScaledWidth = enemy.width * sizeMultiplier;

        // Calculate Y offset to keep bottom of collision box at same position
        const scaleYOffset = enemy.height * (1 - sizeMultiplier);

        let renderX = enemy.x;
        let renderY = enemy.y + scaleYOffset;
        let renderWidth = enemyScaledWidth;

        if (viewport && camera) {
            renderX = (enemy.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = ((enemy.y + scaleYOffset) - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = enemyScaledWidth * viewport.scaleX;
        }

        // Health bar dimensions
        const barWidth = renderWidth;
        const barHeight = 6;
        const barX = renderX;
        const barY = renderY - 15;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health bar
        const healthPercentage = enemy.health / enemy.maxHealth;
        const healthColor = healthPercentage > 0.5 ? '#4CAF50' :
                           healthPercentage > 0.25 ? '#FFC107' : '#F44336';

        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);

        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        this.ctx.restore();
    }

    renderSelectionIndicator(enemy, viewport, camera) {
        this.ctx.save();

        // Apply camera and viewport transformation
        const sizeMultiplier = enemy.sizeMultiplier || 1.0;
        const enemyScaledWidth = enemy.width * sizeMultiplier;
        const enemyScaledHeight = enemy.height * sizeMultiplier;

        // Calculate Y offset to keep bottom of collision box at same position
        const scaleYOffset = enemy.height * (1 - sizeMultiplier);

        let renderX = enemy.x;
        let renderY = enemy.y + scaleYOffset;
        let renderWidth = enemyScaledWidth;
        let renderHeight = enemyScaledHeight;

        if (viewport && camera) {
            renderX = (enemy.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = ((enemy.y + scaleYOffset) - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = enemyScaledWidth * viewport.scaleX;
            renderHeight = enemyScaledHeight * viewport.scaleY;
        }

        // Draw selection outline (bright green)
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(renderX - 3, renderY - 3, renderWidth + 6, renderHeight + 6);

        // Draw selection indicator above enemy
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECTED', renderX + renderWidth / 2, renderY - 8);

        this.ctx.restore();
    }

    renderFleeingText(enemy, viewport, camera) {
        this.ctx.save();

        // Apply camera and viewport transformation
        const sizeMultiplier = enemy.sizeMultiplier || 1.0;
        const enemyScaledWidth = enemy.width * sizeMultiplier;

        // Calculate Y offset to keep bottom of collision box at same position
        const scaleYOffset = enemy.height * (1 - sizeMultiplier);

        let renderX = enemy.x;
        let renderY = enemy.y + scaleYOffset;
        let renderWidth = enemyScaledWidth;

        if (viewport && camera) {
            renderX = (enemy.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = ((enemy.y + scaleYOffset) - camera.y) * viewport.scaleY + viewport.offsetY;
            renderWidth = enemyScaledWidth * viewport.scaleX;
        }

        // Text properties
        const fontSize = 14 * (viewport ? viewport.scaleX : 1);
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';

        // Position text above enemy
        const textX = renderX + renderWidth / 2;
        const textY = renderY - 25 * (viewport ? viewport.scaleY : 1);

        // Draw text background for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textMetrics = this.ctx.measureText('FLEEING');
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        const paddingX = 6;
        const paddingY = 4;

        this.ctx.fillRect(
            textX - textWidth / 2 - paddingX,
            textY - textHeight + paddingY,
            textWidth + paddingX * 2,
            textHeight + paddingY
        );

        // Draw text with yellow color to indicate fleeing
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText('FLEEING', textX, textY);
        this.ctx.fillText('FLEEING', textX, textY);


        this.ctx.restore();
    }

    shouldRenderDeadEnemy(enemy) {
        // Create blinking effect - enemy blinks faster as death timer gets lower
        const blinkInterval = 150; // Base blink speed in milliseconds
        const fastBlinkThreshold = 500; // Start fast blinking in last 500ms

        let currentBlinkInterval = blinkInterval;
        if (enemy.deathTimer <= fastBlinkThreshold) {
            // Fast blinking in the final moments (75ms intervals)
            currentBlinkInterval = 75;
        }

        // Use flashTimer to determine if enemy should be visible
        // Math.floor(enemy.flashTimer / interval) % 2 creates alternating 0 and 1
        return Math.floor(enemy.flashTimer / currentBlinkInterval) % 2 === 0;
    }
}