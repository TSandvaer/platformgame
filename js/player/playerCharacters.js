// Player Character Configurations
class PlayerCharacters {
    constructor() {
        this.characters = {
            soldier: {
                id: 'soldier',
                name: 'Soldier',
                description: 'A skilled warrior with balanced stats',

                // Sprite configuration
                spriteBasePath: 'sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Soldier',
                spriteSize: {
                    frameWidth: 100,
                    frameHeight: 100
                },

                // Player dimensions (hitbox for collisions)
                playerSize: {
                    width: 44,   // 35 * 1.25 = 43.75, rounded to 44
                    height: 59   // 47 * 1.25 = 58.75, rounded to 59
                },

                // Visual scale - how much larger the sprite should be than the hitbox
                visualScale: 3.3,  // Soldier sprite renders at 3.5x its actual size

                // Sprite bottom offset - adjusts vertical position (in sprite pixels before scaling)
                // Positive value moves sprite DOWN, negative moves UP
                spriteBottomOffset: 43,  // Soldier has empty space at bottom, move down

                // Animation configurations
                animations: {
                    idle: {
                        file: 'Soldier-Idle.png',
                        frames: 6,
                        frameRate: 150
                    },
                    walk: {
                        file: 'Soldier-Walk.png',
                        frames: 8,
                        frameRate: 150
                    },
                    attack: {
                        file: 'Soldier-Attack01.png',
                        frames: 4,
                        frameRate: 150
                    },
                    hurt: {
                        file: 'Soldier-Hurt.png',
                        frames: 4,
                        frameRate: 150
                    },
                    death: {
                        file: 'Soldier-Death.png',
                        frames: 4,
                        frameRate: 150
                    }
                },

                // Attack configuration
                attackDuration: 545  // milliseconds
            },

            dwarfWarrior: {
                id: 'dwarfWarrior',
                name: 'Dwarf Warrior',
                description: 'A tough dwarf with powerful attacks',

                // Sprite configuration
                spriteBasePath: 'sprites/PLAYER/CHARACTER/MATTZ ART/Dwarf Warrior 2D Pixel Art v1.2/Sprites/no_outline',
                spriteSize: {
                    frameWidth: 128,  // 1280px / 10 frames = 128px per frame
                    frameHeight: 96   // Actual sprite sheet height
                },

                // Player dimensions (hitbox for collisions)
                // Match soldier's collision box size
                playerSize: {
                    width: 44,   // Same as soldier
                    height: 59   // Same as soldier
                },

                // Visual scale - how much larger the sprite should be than the hitbox
                visualScale: 1.3,  // Dwarf sprite renders at 1.3x (128*1.3=166, 96*1.3=125)

                // Sprite bottom offset - adjusts vertical position (in sprite pixels before scaling)
                // Positive value moves sprite DOWN, negative moves UP
                spriteBottomOffset: 23,  // Dwarf sprite adjustment - aligns feet with collision box bottom

                // Sprite facing - set to true if the sprite sheet faces left by default
                invertFacing: true,  // Dwarf sprites face left, so invert the facing logic

                // Animation configurations
                animations: {
                    idle: {
                        file: 'IDLE.png',
                        frames: 10,
                        frameRate: 100
                    },
                    walk: {
                        file: 'RUN.png',  // Dwarf has RUN instead of WALK
                        frames: 8,
                        frameRate: 100
                    },
                    attack: {
                        file: 'ATTACK.png',
                        frames: 8,
                        frameRate: 100
                    },
                    hurt: {
                        file: 'HURT.png',
                        frames: 6,
                        frameRate: 100
                    },
                    death: {
                        file: 'DEATH.png',
                        frames: 10,
                        frameRate: 100
                    }
                },

                // Attack configuration
                attackDuration: 800  // milliseconds (8 frames * 100ms)
            }
        };
    }

    // Get character configuration by ID
    getCharacter(characterId) {
        return this.characters[characterId] || this.characters.soldier;
    }

    // Get all available characters
    getAllCharacters() {
        return Object.values(this.characters);
    }

    // Get character IDs
    getCharacterIds() {
        return Object.keys(this.characters);
    }

    // Check if character exists
    hasCharacter(characterId) {
        return characterId in this.characters;
    }
}
