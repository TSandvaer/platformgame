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

            // Calculate torch tip position
            const torchCenterX = prop.x + (renderWidth / 2);
            const torchTopY = prop.y;

            // Natural flame animation - use individual 21x21 sprites for breathing effect
            const frameIndex = Math.floor(currentTime / 150) % 4; // Use 4 frames for breathing cycle

            // Back to 6x6 grid
            const gridSize = 6;
            const frameSize = Math.floor(128 / gridSize); // 21 pixels per frame

            // Create breathing by using flames from different rows
            const breathingSequence = [
                { x: 0, y: 0 }, // Small flame
                { x: 1, y: 0 }, // Medium flame
                { x: 2, y: 0 }, // Large flame
                { x: 1, y: 0 }  // Back to medium
            ];

            const currentFrame = breathingSequence[frameIndex];
            const sourceX = currentFrame.x * frameSize;
            const sourceY = currentFrame.y * frameSize;

            // Larger flame size
            const flameWidth = 65;
            const flameHeight = 110;

            // Adjust position
            const flameX = torchCenterX - 33.5;
            const flameY = torchTopY - 100.5;

            // Save context state
            this.ctx.save();

            // Enable image smoothing for smooth flame
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Apply subtle glow effect
            this.ctx.shadowColor = 'rgba(255, 100, 0, 0.6)';
            this.ctx.shadowBlur = 15;

            // Draw flame sprite
            this.ctx.drawImage(
                flameSprite.image,
                sourceX, sourceY,
                frameSize, frameSize,
                flameX, flameY,
                flameWidth, flameHeight
            );

            // Restore context state
            this.ctx.restore();

            // Add flame particles
            this.addTorchParticles(torchCenterX, torchTopY);
            this.updateAndRenderParticles();

        } catch (error) {
            console.error('Error rendering torch flame:', error);
        }
    }

    addTorchParticles(x, y) {
        // Add new particles occasionally
        if (Math.random() < 0.3) {
            this.torchParticles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y - 80,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 1.5 - 0.5,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
    }

    updateAndRenderParticles() {
        // Update and render particles
        for (let i = this.torchParticles.length - 1; i >= 0; i--) {
            const particle = this.torchParticles[i];

            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy -= 0.05; // Float upward

            // Remove dead particles
            if (particle.life <= 0) {
                this.torchParticles.splice(i, 1);
                continue;
            }

            // Render particle
            const opacity = particle.life * 0.6;
            const hue = 30 + (1 - particle.life) * 30; // Orange to red
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}