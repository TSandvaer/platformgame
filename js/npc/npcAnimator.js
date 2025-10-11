class NPCAnimator {
    constructor(npc, npcTypeData) {
        this.npc = npc;
        this.npcTypeData = npcTypeData;
        this.sprites = {
            idle: { image: null, frames: 7, frameWidth: 96, frameHeight: 96 }
        };
        this.spritesLoaded = false;
        this.loadSprites();
    }

    loadSprites() {
        const animations = this.npcTypeData.animations;
        const baseFolder = this.npcTypeData.spriteFolder;

        let loadedCount = 0;
        const totalSprites = Object.keys(animations).length;

        for (const [animName, animData] of Object.entries(animations)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load NPC sprite: ${this.npc.type}-${animName} from ${baseFolder}/${animData.file}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                }
            };
            img.src = `${baseFolder}/${animData.file}`;
            this.sprites[animName].image = img;
            this.sprites[animName].frames = animData.frames;
            this.sprites[animName].frameWidth = animData.frameWidth || 96;
            this.sprites[animName].frameHeight = animData.frameHeight || 96;
        }
    }

    update(deltaTime) {
        if (!this.spritesLoaded) return;

        // Update frame animation using delta time
        this.npc.frameTimer += deltaTime;
        if (this.npc.frameTimer >= this.npc.frameRate) {
            this.npc.frameTimer = 0;
            const sprite = this.sprites[this.npc.currentAnimation];

            // Loop animation continuously for NPCs
            this.npc.frameIndex = (this.npc.frameIndex + 1) % sprite.frames;
        }
    }

    setAnimation(animationName) {
        if (this.npc.currentAnimation !== animationName) {
            this.npc.currentAnimation = animationName;
            this.npc.frameIndex = 0;
            this.npc.frameTimer = 0;
            return true;
        }
        return false;
    }

    getCurrentSprite() {
        return this.sprites[this.npc.currentAnimation];
    }

    getCurrentFrame() {
        const sprite = this.getCurrentSprite();
        if (!sprite || !sprite.image) return null;

        return {
            image: sprite.image,
            sourceX: this.npc.frameIndex * sprite.frameWidth,
            sourceY: 0,
            frameWidth: sprite.frameWidth,
            frameHeight: sprite.frameHeight
        };
    }

    isReady() {
        return this.spritesLoaded;
    }
}
