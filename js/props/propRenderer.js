class PropRenderer {
    constructor(ctx, platformSprites, torchParticles) {
        this.ctx = ctx;
        this.platformSprites = platformSprites;
        this.torchParticles = torchParticles;
    }

    renderProps(props, propTypes, isDevelopmentMode, selectedProp, renderObstacles = false) {
        if (!this.platformSprites.villageProps.image) return;

        // Filter props based on whether we're rendering obstacles or not
        const filteredProps = props.filter(prop => prop.isObstacle === renderObstacles);

        // Sort by z-order (lowest first)
        filteredProps.sort((a, b) => (a.zOrder || 0) - (b.zOrder || 0));

        // Render each prop
        filteredProps.forEach(prop => {
            this.drawProp(prop, propTypes, isDevelopmentMode, selectedProp);
        });
    }

    drawProp(prop, propTypes, isDevelopmentMode, selectedProp) {
        const propType = propTypes[prop.type];
        if (!propType) return;

        const tileset = this.platformSprites.villageProps;
        if (!tileset.image) return;

        const sourceX = propType.tileX * tileset.tileWidth;
        const sourceY = propType.tileY * tileset.tileHeight;

        // Use individual prop scale if available, otherwise fallback to default
        const scale = prop.scale !== undefined ? prop.scale :
                     (prop.type === 'well' ? 1 :
                     (prop.type === 'barrel' || prop.type === 'crate') ? 1.2 :
                     (prop.type === 'smallPot' || prop.type === 'mediumPot' || prop.type === 'bigPot') ? 0.6 : 1.6);
        const renderWidth = propType.width * scale;
        const renderHeight = propType.height * scale;

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Show green background only for selected props
        if (isDevelopmentMode && selectedProp && selectedProp.id === prop.id) {
            this.ctx.fillStyle = '#44FF44';
            this.ctx.fillRect(prop.x, prop.y, renderWidth, renderHeight);
        }

        // Draw the prop sprite
        this.ctx.drawImage(
            tileset.image,
            sourceX, sourceY,
            propType.width, propType.height,  // Extract actual prop dimensions from tileset
            prop.x, prop.y,
            renderWidth, renderHeight
        );

        // Re-enable image smoothing
        this.ctx.imageSmoothingEnabled = true;

        // Development mode: show prop boundaries
        if (isDevelopmentMode) {
            if (selectedProp && selectedProp.id === prop.id) {
                this.ctx.strokeStyle = prop.isObstacle ? '#FF6B6B' : '#4ECDC4';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            } else {
                this.ctx.strokeStyle = prop.isObstacle ? '#FF9999' : '#99D6CE';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            }
        }

        // Render flame animation if this is a torch prop
        if (propType.hasFlame) {
            this.renderTorchFlame(prop, renderWidth, renderHeight, scale);
        }
    }

    renderTorchFlame(prop, renderWidth, renderHeight, scale) {
        if (!this.platformSprites.torchFlame || !this.platformSprites.torchFlame.image) return;

        const flameSprite = this.platformSprites.torchFlame;
        const currentTime = Date.now();

        try {
            // Enable image smoothing for smooth flame rendering
            this.ctx.imageSmoothingEnabled = true;

            // Calculate torch tip position (torch is scaled, so adjust accordingly)
            const torchCenterX = prop.x + (renderWidth / 2);
            // The torch flame should be at the very top of the torch
            const torchTopY = prop.y;

            // Animated flame using the sprite sheet
            // The sprite sheet is 128x128 pixels with 36 frames (6x6 grid)
            // Each frame is approximately 21x21 pixels with small gaps
            const spriteSheetSize = 128;
            const gridSize = 6;
            const frameSize = 21; // Actual frame size
            const framePadding = (spriteSheetSize - (frameSize * gridSize)) / gridSize; // Calculate padding
            const frameSizeWithPadding = frameSize + framePadding;

            // Create very subtle, natural flickering animation
            const animationSpeed = 150; // Medium speed for natural flicker
            // Use very similar frames for minimal variation
            const animationFrames = [
                13, 14, 13, 14, 13, 14,  // Subtle back and forth
                19, 20, 19, 14, 13, 14,  // Slight variation
                13, 19, 20, 19, 14, 13   // Return to start
            ];
            const frameIndex = Math.floor(currentTime / animationSpeed) % animationFrames.length;
            const currentFrameIndex = animationFrames[frameIndex];

            // Calculate position in sprite sheet
            const col = currentFrameIndex % gridSize;
            const row = Math.floor(currentFrameIndex / gridSize);

            const sourceX = col * frameSizeWithPadding;
            const sourceY = row * frameSizeWithPadding;

            // Scale flame size based on torch scale
            const flameScale = scale * 1.0; // Normal scale
            const flameWidth = 16 * flameScale; // Smaller width
            const flameHeight = 24 * flameScale; // Smaller height

            // Position flame at the very top of the torch
            const flameX = torchCenterX - (flameWidth / 2);
            const flameY = torchTopY - (flameHeight * 0.85); // Flame sits on top of torch

            // Save context state
            this.ctx.save();

            // Enable image smoothing for smooth flame
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Apply subtle glow effect
            this.ctx.shadowColor = 'rgba(255, 100, 0, 0.6)';
            this.ctx.shadowBlur = 15;

            // Draw flame sprite (21x21 source frame)
            this.ctx.drawImage(
                flameSprite.image,
                sourceX, sourceY,
                frameSize, frameSize,  // 21x21 source
                flameX, flameY,
                flameWidth, flameHeight
            );

            // Restore context state
            this.ctx.restore();

            // Add flame particles at the top of the flame
            this.addTorchParticles(torchCenterX, flameY, flameScale);

        } catch (error) {
            console.error('Error rendering torch flame:', error);
        }
    }

    addTorchParticles(x, y, scale) {
        // Add new particles very rarely for subtle effect
        if (Math.random() < 0.008) { // Very rare - 0.8% chance
            // Create a tiny spark that gently falls
            this.torchParticles.push({
                x: x + (Math.random() - 0.5) * 4 * scale, // Close to flame
                y: y + 10, // Start below flame
                vx: (Math.random() - 0.5) * 0.2, // Very slight drift
                vy: 0, // No initial upward velocity
                life: 1.0,
                size: 0.8, // Tiny particle
                fadeStart: 0.8
            });
        }
    }

    updateAndRenderParticles() {
        // Update and render particles
        for (let i = this.torchParticles.length - 1; i >= 0; i--) {
            const particle = this.torchParticles[i];

            // Update particle physics - sparks fall slowly
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.0003; // Extremely slow decay for long fall
            particle.vy += 0.05; // Very gentle gravity - slow fall
            particle.vx *= 0.999; // Almost no air resistance

            // Remove particles only when they fall way off screen
            if (particle.life <= 0 || particle.y > window.innerHeight + 500) {
                this.torchParticles.splice(i, 1);
                continue;
            }

            // Calculate opacity - very subtle particles
            let opacity;
            if (particle.life > 0.5) {
                opacity = 0.4; // Dim particles
            } else {
                // Fade out in the last 50% of life
                opacity = 0.4 * (particle.life / 0.5);
            }

            // Subtle orange glow color
            const hue = 30; // Orange
            const lightness = 60; // Not too bright

            this.ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${opacity})`;

            // Draw as tiny pixel
            const size = particle.size;
            this.ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), size, size);
        }
    }

    // Call this once per frame after all props have been rendered
    renderAllParticles() {
        this.updateAndRenderParticles();
    }
}