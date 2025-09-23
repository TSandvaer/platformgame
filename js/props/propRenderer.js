class PropRenderer {
    constructor(ctx, platformSprites, torchParticles, onSpritesLoadedCallback) {
        this.ctx = ctx;
        this.platformSprites = platformSprites; // Keep reference to platform sprites for villageProps
        this.torchParticles = torchParticles;
        this.onSpritesLoadedCallback = onSpritesLoadedCallback;

        // Initialize prop-specific sprites
        this.propSprites = {
            torchFlame: { image: null, frameWidth: 21, frameHeight: 21, totalFrames: 6 }
        };
        this.spritesLoaded = false;
        this.loadSprites();
    }

    loadSprites() {
        let loadedCount = 0;
        const totalImages = 1; // Only torch flame for props

        const checkAllLoaded = () => {
            if (loadedCount === totalImages) {
                this.spritesLoaded = true;
                if (this.onSpritesLoadedCallback) {
                    this.onSpritesLoadedCallback();
                }
            }
        };

        // Load torch flame animation
        const torchFlameImg = new Image();
        torchFlameImg.onload = () => {
            loadedCount++;
            checkAllLoaded();
        };
        torchFlameImg.onerror = () => {
            console.error('Failed to load torch flame sprite');
        };
        torchFlameImg.src = 'sprites/Pixel Art Platformer/Texture/TX FX Torch Flame.png';
        this.propSprites.torchFlame.image = torchFlameImg;
    }

    renderProps(props, propTypes, isDevelopmentMode, selectedProp, renderObstacles = false, selectedProps = [], viewport, camera) {
        if (!this.platformSprites.villageProps.image) return;

        // Filter props based on whether we're rendering obstacles or not
        const filteredProps = props.filter(prop => prop.isObstacle === renderObstacles);

        // Sort by z-order (lowest first)
        filteredProps.sort((a, b) => (a.zOrder || 0) - (b.zOrder || 0));

        // Render each prop using actual positions
        filteredProps.forEach(prop => {
            // Get actual position based on positioning mode
            const actualPos = this.getActualPosition(prop, viewport);
            let renderProp = { ...prop, x: actualPos.x, y: actualPos.y };

            // If rendering obstacles (which are outside all transforms),
            // apply full transformation manually
            if (renderObstacles && viewport && camera) {
                // Convert world to screen coordinates
                const screenX = (actualPos.x - camera.x) * viewport.scaleX + viewport.offsetX;
                const screenY = (actualPos.y - camera.y) * viewport.scaleY + viewport.offsetY;
                renderProp = { ...prop, x: screenX, y: screenY };
            }

            this.drawProp(renderProp, propTypes, isDevelopmentMode, selectedProp, selectedProps, renderObstacles ? viewport : null);
        });
    }

    // Get actual position based on positioning mode
    getActualPosition(prop, viewport) {
        // Safety check for viewport
        if (!viewport) {
            console.warn('Viewport not provided to getActualPosition, using raw coordinates');
            return { x: prop.x, y: prop.y };
        }

        // Default to absolute positioning if not specified
        const positioning = prop.positioning || 'absolute';

        if (positioning === 'screen-relative') {
            const relativeX = prop.relativeX || 0.5;
            const relativeY = prop.relativeY || 0.5;
            return {
                x: relativeX * viewport.designWidth,
                y: relativeY * viewport.designHeight
            };
        }
        return { x: prop.x, y: prop.y };
    }

    drawProp(prop, propTypes, isDevelopmentMode, selectedProp, selectedProps = [], viewport = null) {
        const propType = propTypes[prop.type];
        if (!propType) return;

        const tileset = this.platformSprites.villageProps;
        if (!tileset.image) return;

        const sourceX = propType.tileX * tileset.tileWidth;
        const sourceY = propType.tileY * tileset.tileHeight;

        // Use sizeMultiplier for resolution-independent sizing
        const sizeMultiplier = prop.sizeMultiplier !== undefined ? prop.sizeMultiplier : 1.0;

        // Apply viewport scaling if this is an obstacle prop (rendered outside transforms)
        const viewportScale = viewport ? viewport.scaleX : 1;
        const renderWidth = propType.width * sizeMultiplier * viewportScale;
        const renderHeight = propType.height * sizeMultiplier * viewportScale;

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Save context state for rotation
        this.ctx.save();

        // Apply rotation if prop has rotation value
        if (prop.rotation && prop.rotation !== 0) {
            // Translate to prop center, rotate, then translate back
            const centerX = prop.x + renderWidth / 2;
            const centerY = prop.y + renderHeight / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(prop.rotation);
            this.ctx.translate(-centerX, -centerY);
        }

        // Show backgrounds for selected props in development mode
        if (isDevelopmentMode) {
            const isMultiSelected = selectedProps.some(p => p.id === prop.id);
            const isPrimarySelected = selectedProp && selectedProp.id === prop.id;

            if (isMultiSelected) {
                // Multi-selected props get blue background
                this.ctx.fillStyle = isPrimarySelected ? '#4444FF' : '#6666DD';
                this.ctx.fillRect(prop.x, prop.y, renderWidth, renderHeight);
            } else if (isPrimarySelected) {
                // Single selected prop gets green background
                this.ctx.fillStyle = '#44FF44';
                this.ctx.fillRect(prop.x, prop.y, renderWidth, renderHeight);
            }
        }

        // Draw the prop sprite
        this.ctx.drawImage(
            tileset.image,
            sourceX, sourceY,
            propType.width, propType.height,  // Extract actual prop dimensions from tileset
            prop.x, prop.y,
            renderWidth, renderHeight
        );

        // Development mode: show prop boundaries (while still in rotation context)
        if (isDevelopmentMode) {
            const isMultiSelected = selectedProps.some(p => p.id === prop.id);
            const isPrimarySelected = selectedProp && selectedProp.id === prop.id;

            if (isMultiSelected) {
                // Multi-selected props get thicker blue borders
                this.ctx.strokeStyle = isPrimarySelected ? '#0066FF' : '#3399FF';
                this.ctx.lineWidth = isPrimarySelected ? 3 : 2;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);

                // Add group indicator if prop is grouped
                if (prop.groupId) {
                    this.ctx.strokeStyle = '#FF9900';
                    this.ctx.lineWidth = 1;
                    this.ctx.setLineDash([5, 5]);
                    this.ctx.strokeRect(prop.x - 2, prop.y - 2, renderWidth + 4, renderHeight + 4);
                    this.ctx.setLineDash([]);
                }
            } else if (isPrimarySelected) {
                // Single selected prop gets thick green border
                this.ctx.strokeStyle = prop.isObstacle ? '#FF6B6B' : '#4ECDC4';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            } else {
                // Unselected props get thin borders
                this.ctx.strokeStyle = prop.isObstacle ? '#FF9999' : '#99D6CE';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(prop.x, prop.y, renderWidth, renderHeight);
            }
        }

        // Restore context state (removes rotation)
        this.ctx.restore();

        // Re-enable image smoothing
        this.ctx.imageSmoothingEnabled = true;

        // Render flame animation if this is a torch prop
        if (propType.hasFlame) {
            const flameScale = prop.sizeMultiplier !== undefined ? prop.sizeMultiplier : 1.0;
            this.renderTorchFlame(prop, renderWidth, renderHeight, flameScale);
        }

        // Render glow effect if this is a lamp prop
        if (propType.hasGlow) {
            this.renderLampGlow(prop, renderWidth, renderHeight, viewportScale);
        }
    }

    renderTorchFlame(prop, renderWidth, renderHeight, flameScale) {
        if (!this.propSprites.torchFlame || !this.propSprites.torchFlame.image) return;

        const flameSprite = this.propSprites.torchFlame;
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
            const flameSizeScale = flameScale * 1.0; // Normal scale
            const flameWidth = 16 * flameSizeScale; // Smaller width
            const flameHeight = 24 * flameSizeScale; // Smaller height

            // Position flame at the very top of the torch
            const flameX = torchCenterX - (flameWidth / 2);
            const flameY = torchTopY - (flameHeight * 0.85); // Flame sits on top of torch

            // Save context state
            this.ctx.save();

            // Enable image smoothing for smooth flame
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Apply enhanced warm orange glow with multiple layers for cozy effect
            const flickerBase = Math.sin(currentTime * 0.002) * 0.1 + Math.sin(currentTime * 0.005) * 0.05;
            const glowIntensity = 0.7 + flickerBase; // Gentle flickering

            // Create layered glow effect for smooth halo
            this.ctx.shadowColor = `rgba(255, 140, 40, ${glowIntensity})`;
            this.ctx.shadowBlur = 25;

            // Draw flame sprite (21x21 source frame)
            this.ctx.drawImage(
                flameSprite.image,
                sourceX, sourceY,
                frameSize, frameSize,  // 21x21 source
                flameX, flameY,
                flameWidth, flameHeight
            );

            // Add second layer of softer, wider glow for cozy halo effect
            this.ctx.shadowColor = `rgba(255, 180, 80, ${glowIntensity * 0.4})`;
            this.ctx.shadowBlur = 40;
            this.ctx.drawImage(
                flameSprite.image,
                sourceX, sourceY,
                frameSize, frameSize,
                flameX, flameY,
                flameWidth, flameHeight
            );

            // Restore context state
            this.ctx.restore();

            // Add flame particles at the top of the flame
            this.addTorchParticles(prop, torchCenterX, flameY, flameSizeScale);

        } catch (error) {
            console.error('Error rendering torch flame:', error);
        }
    }

    renderLampGlow(prop, renderWidth, renderHeight, viewportScale) {
        const currentTime = Date.now();

        // Save context state
        this.ctx.save();

        // Calculate lamp center position
        const lampCenterX = prop.x + (renderWidth / 2);
        const lampCenterY = prop.y + (renderHeight / 2);

        // Create subtle flickering effect with multiple sine waves for organic movement
        const flicker1 = Math.sin(currentTime * 0.003) * 0.05;
        const flicker2 = Math.sin(currentTime * 0.007) * 0.03;
        const flicker3 = Math.sin(currentTime * 0.011) * 0.02;
        const flickerIntensity = 1 + flicker1 + flicker2 + flicker3;

        // Create smaller pulsing glow radius
        const baseGlowRadius = 25 * viewportScale;
        const glowRadius = baseGlowRadius * flickerIntensity;

        // Create more subtle glow layers for depth
        const glowLayers = [
            { radius: glowRadius * 2.0, opacity: 0.02, color: '255, 200, 100' },
            { radius: glowRadius * 1.5, opacity: 0.03, color: '255, 210, 120' },
            { radius: glowRadius * 1.0, opacity: 0.05, color: '255, 220, 140' },
            { radius: glowRadius * 0.7, opacity: 0.08, color: '255, 230, 160' },
            { radius: glowRadius * 0.4, opacity: 0.12, color: '255, 240, 180' }
        ];

        // Set composite operation for additive blending
        this.ctx.globalCompositeOperation = 'lighter';

        // Draw each glow layer
        glowLayers.forEach(layer => {
            const gradient = this.ctx.createRadialGradient(
                lampCenterX, lampCenterY, 0,
                lampCenterX, lampCenterY, layer.radius
            );

            gradient.addColorStop(0, `rgba(${layer.color}, ${layer.opacity * flickerIntensity})`);
            gradient.addColorStop(0.4, `rgba(${layer.color}, ${layer.opacity * flickerIntensity * 0.5})`);
            gradient.addColorStop(0.7, `rgba(${layer.color}, ${layer.opacity * flickerIntensity * 0.2})`);
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                lampCenterX - layer.radius,
                lampCenterY - layer.radius,
                layer.radius * 2,
                layer.radius * 2
            );
        });

        // Add a subtle core glow
        const coreGradient = this.ctx.createRadialGradient(
            lampCenterX, lampCenterY, 0,
            lampCenterX, lampCenterY, renderWidth * 0.6
        );

        coreGradient.addColorStop(0, `rgba(255, 255, 220, ${0.3 * flickerIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(255, 250, 200, ${0.2 * flickerIntensity})`);
        coreGradient.addColorStop(0.6, `rgba(255, 240, 180, ${0.1 * flickerIntensity})`);
        coreGradient.addColorStop(1, 'rgba(255, 230, 160, 0)');

        this.ctx.fillStyle = coreGradient;
        this.ctx.fillRect(
            lampCenterX - renderWidth,
            lampCenterY - renderHeight,
            renderWidth * 2,
            renderHeight * 2
        );

        // Restore context state
        this.ctx.restore();
    }

    addTorchParticles(prop, x, y, scale) {
        // Simple random chance approach - much more reliable
        // At 60fps, 0.0008 chance = roughly 1 ember every 2 seconds per torch
        if (Math.random() < 0.0008) {
            // Create glowing sparks that rise from the flame tip then fall
            this.torchParticles.push({
                x: x + (Math.random() - 0.5) * 6 * scale, // Tighter spread from flame
                y: y, // Start right at flame tip
                startY: y, // Store starting position for distance calculation
                vx: (Math.random() - 0.5) * 0.3 * scale, // Slower horizontal drift
                vy: -(Math.random() * 0.8 + 0.2), // Slower initial upward velocity
                life: 1.0,
                maxLife: 1.0, // Track original life for glow calculation
                size: 3.0 + Math.random() * 3.0, // Much larger, more visible embers (3-6px)
                glowIntensity: 1.0, // Start with full glow
                windPhase: Math.random() * Math.PI * 2, // Random starting phase for wind movement
                windStrength: 0.5 + Math.random() * 0.3, // Individual wind sensitivity
                fadeDistance: 120 + Math.random() * 80, // Distance to fall before fading out (120-200px)
            });
        }
    }

    updateAndRenderParticles(viewport, camera, platforms) {
        // Update and render particles
        for (let i = this.torchParticles.length - 1; i >= 0; i--) {
            const particle = this.torchParticles[i];

            // Update particle physics with gentle leaf-like wave movement
            const currentTime = Date.now();

            // Create gentle wave motion instead of directional wind
            const waveMotion = Math.sin(currentTime * 0.0008 + particle.windPhase) * 0.15;
            const gentleSway = Math.sin(currentTime * 0.0012 + particle.windPhase * 0.7) * 0.1;

            // Apply gentle horizontal wave movement without accumulating velocity
            particle.x += waveMotion + gentleSway;
            particle.y += particle.vy;

            // Calculate distance fallen from starting position
            const distanceFallen = particle.y - particle.startY;
            const fadeStartDistance = particle.fadeDistance - 30; // Start fading 30px before fade distance

            // Normal decay rate, but accelerate when approaching fade distance
            let decayRate = 0.0015;
            if (distanceFallen > fadeStartDistance) {
                // Accelerate fade-out in the final 30 pixels of fall
                const fadeProgress = (distanceFallen - fadeStartDistance) / 30;
                decayRate = 0.0015 + (fadeProgress * 0.02); // Much faster decay near platform
            }

            particle.life -= decayRate;
            particle.vy += 0.015; // Much slower gravity for floating leaf effect

            // Reset horizontal velocity to prevent drifting far from torch
            particle.vx *= 0.95; // Strong dampening to keep embers near torch

            // Check for platform collisions if platforms are provided
            let hitPlatform = false;
            if (platforms && platforms.length > 0) {
                for (const platform of platforms) {
                    // Simple bounding box collision detection
                    const emberLeft = particle.x - particle.size / 2;
                    const emberRight = particle.x + particle.size / 2;
                    const emberBottom = particle.y + particle.size / 2;

                    // Check if ember is within platform horizontal bounds and touching top surface
                    if (emberLeft < platform.x + platform.width &&
                        emberRight > platform.x &&
                        emberBottom >= platform.y &&
                        particle.y < platform.y + platform.height) {
                        hitPlatform = true;
                        break;
                    }
                }
            }

            // Remove particles when they die, fall too far, reach fade distance, or hit platform
            if (particle.life <= 0 || particle.y > window.innerHeight + 300 ||
                distanceFallen >= particle.fadeDistance || hitPlatform) {
                this.torchParticles.splice(i, 1);
                continue;
            }

            // Calculate glow intensity - bright at start, fade gradually
            const lifeRatio = particle.life / particle.maxLife;
            particle.glowIntensity = lifeRatio;

            // Opacity starts high and fades to almost nothing at ground
            const opacity = Math.max(0.1, lifeRatio * 0.9);

            // Improved color progression: bright white-yellow to deep orange-red
            const hue = 60 - (1 - lifeRatio) * 40; // Bright yellow to deep orange-red
            const saturation = 90 + lifeRatio * 10; // High saturation throughout
            const lightness = 85 - (1 - lifeRatio) * 45; // Very bright to moderate

            // Save context for glow effect
            this.ctx.save();

            // Enhanced glow effect for embers
            if (particle.glowIntensity > 0.3) {
                this.ctx.shadowColor = `hsla(${hue}, ${saturation}%, 70%, ${particle.glowIntensity * 0.9})`;
                this.ctx.shadowBlur = 6 + particle.glowIntensity * 8;
            }

            this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;

            // Apply camera and viewport transformation to particle position
            let renderX = particle.x;
            let renderY = particle.y;
            if (viewport && camera) {
                // Convert world to screen coordinates
                renderX = (particle.x - camera.x) * viewport.scaleX + viewport.offsetX;
                renderY = (particle.y - camera.y) * viewport.scaleY + viewport.offsetY;
            }

            // Draw as glowing ember with rounded shape, scaled by viewport
            const size = particle.size * (viewport ? viewport.scaleX : 1);

            // Draw as circle for more natural ember appearance
            this.ctx.beginPath();
            this.ctx.arc(renderX, renderY, size / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Add small bright core for hot embers
            if (particle.glowIntensity > 0.7) {
                this.ctx.fillStyle = `hsla(${Math.min(hue + 20, 60)}, 100%, 95%, ${opacity * 0.8})`;
                this.ctx.beginPath();
                this.ctx.arc(renderX, renderY, size / 4, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Restore context
            this.ctx.restore();
        }
    }

    // Call this once per frame after all props have been rendered
    renderAllParticles(viewport, camera, platforms) {
        this.updateAndRenderParticles(viewport, camera, platforms);
    }
}