class EnemyProjectileAnimator {
    constructor() {
        this.sprite = {
            image: null,
            frames: 6,
            frameWidth: 48,
            frameHeight: 32,
            totalWidth: 288
        };
        this.spriteLoaded = false;
        this.loadSprite();
    }

    loadSprite() {
        const img = new Image();
        img.onload = () => {
            this.spriteLoaded = true;
        };
        img.onerror = () => {
            console.error('❌ Failed to load fire projectile sprite');
        };
        img.src = '/sprites/Mattz Art/Baby Dragon 2D Pixel Art/Sprites/without_outline/projectile_diagonal.png';
        this.sprite.image = img;
    }

    isReady() {
        return this.spriteLoaded && this.sprite.image;
    }

    render(ctx, projectile, viewport, camera) {
        if (!this.isReady()) return;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Calculate source frame position
        const sourceX = projectile.currentFrame * this.sprite.frameWidth;
        const sourceY = 0;

        // Calculate render position
        let renderX = projectile.x;
        let renderY = projectile.y;

        if (viewport && camera) {
            renderX = (projectile.x - camera.x) * viewport.scaleX + viewport.offsetX;
            renderY = (projectile.y - camera.y) * viewport.scaleY + viewport.offsetY;
        }

        const renderWidth = this.sprite.frameWidth * (viewport ? viewport.scaleX : 1);
        const renderHeight = this.sprite.frameHeight * (viewport ? viewport.scaleY : 1);

        // Calculate rotation angle based on velocity direction
        // Add PI to flip sprite 180 degrees so flame points forward (not tail)
        // Add ~15 degrees to angle fire downward slightly
        const angleAdjustment = 20 * (Math.PI / 180); // 15 degrees in radians
        const angle = Math.atan2(projectile.velocityY, projectile.velocityX) + Math.PI + angleAdjustment;

        // Calculate center point for rotation
        const centerX = renderX + renderWidth / 2;
        const centerY = renderY + renderHeight / 2;

        // Translate to center, rotate, then translate back
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Draw sprite centered at origin (0, 0) after rotation
        ctx.drawImage(
            this.sprite.image,
            sourceX, sourceY,
            this.sprite.frameWidth, this.sprite.frameHeight,
            -renderWidth / 2, -renderHeight / 2,
            renderWidth, renderHeight
        );

        ctx.restore();
    }
}
