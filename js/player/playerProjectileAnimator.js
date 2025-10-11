class PlayerProjectileAnimator {
    constructor() {
        // Cache for loaded projectile sprites by character ID
        this.spriteCache = {};
        this.currentCharacterId = null;
        this.currentSprite = null;
    }

    // Load projectile sprite for a specific character
    loadProjectileForCharacter(characterConfig) {
        if (!characterConfig || !characterConfig.projectile) {
            return false;
        }

        const characterId = characterConfig.id;

        // Return cached sprite if already loaded
        if (this.spriteCache[characterId]) {
            this.currentCharacterId = characterId;
            this.currentSprite = this.spriteCache[characterId];
            return true;
        }

        // Create new sprite entry
        const projectileConfig = characterConfig.projectile;
        const sprite = {
            image: null,
            frames: projectileConfig.frames || 1,
            frameWidth: projectileConfig.frameWidth || 32,
            frameHeight: projectileConfig.frameHeight || 32,
            loaded: false
        };

        // Load sprite image
        const img = new Image();
        img.onload = () => {
            sprite.loaded = true;
        };
        img.onerror = () => {
            console.error(`Failed to load ${characterId} projectile sprite from ${projectileConfig.spriteSheet}`);
        };
        img.src = projectileConfig.spriteSheet;
        sprite.image = img;

        // Cache the sprite
        this.spriteCache[characterId] = sprite;
        this.currentCharacterId = characterId;
        this.currentSprite = sprite;

        return true;
    }

    isReady(characterConfig) {
        if (!characterConfig) return false;

        // Load sprite if not already loaded
        if (this.currentCharacterId !== characterConfig.id) {
            this.loadProjectileForCharacter(characterConfig);
        }

        return this.currentSprite && this.currentSprite.loaded && this.currentSprite.image;
    }

    render(ctx, projectile, viewport, camera, characterConfig) {
        // Try to use provided character config, fallback to current sprite
        if (characterConfig && this.currentCharacterId !== characterConfig.id) {
            this.loadProjectileForCharacter(characterConfig);
        }

        if (!this.currentSprite || !this.currentSprite.loaded || !this.currentSprite.image) {
            return;
        }

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Calculate source frame position
        // Clamp frame index to available frames (handles single-frame sprites like soldier's arrow)
        const frameIndex = Math.min(projectile.currentFrame, this.currentSprite.frames - 1);
        const sourceX = frameIndex * this.currentSprite.frameWidth;
        const sourceY = 0;

        // Calculate render position
        let renderX = projectile.x;
        let renderY = projectile.y;

        if (viewport && camera) {
            renderX = (projectile.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = (projectile.y - camera.y) * viewport.scaleY + viewport.offsetY;
        }

        const renderWidth = this.currentSprite.frameWidth * (viewport ? viewport.scaleX : 1);
        const renderHeight = this.currentSprite.frameHeight * (viewport ? viewport.scaleY : 1);

        // Calculate rotation angle based on velocity direction
        const angle = Math.atan2(projectile.velocityY, projectile.velocityX);

        // Calculate center point for rotation
        const centerX = renderX + renderWidth / 2;
        const centerY = renderY + renderHeight / 2;

        // Translate to center, rotate, then translate back
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Draw sprite centered at origin (0, 0) after rotation
        ctx.drawImage(
            this.currentSprite.image,
            sourceX, sourceY,
            this.currentSprite.frameWidth, this.currentSprite.frameHeight,
            -renderWidth / 2, -renderHeight / 2,
            renderWidth, renderHeight
        );

        ctx.restore();
    }
}
