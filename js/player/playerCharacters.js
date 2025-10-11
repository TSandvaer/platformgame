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
                    attack_melee: {
                        file: 'Soldier-Attack01.png',
                        frames: 4,
                        frameRate: 150
                    },
                    attack_ranged: {
                        file: 'Soldier-Attack03.png',
                        frames: 9,
                        frameRate: 100
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
                attackDuration: 545,  // milliseconds (melee attack)
                rangedAttackDuration: 900,  // milliseconds (9 frames * 100ms for bow)

                // Projectile configuration (arrow)
                projectile: {
                    spriteSheet: 'sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Soldier/Arrow(projectile)/Arrow01(32x32).png',
                    frameWidth: 32,
                    frameHeight: 32,
                    frames: 1,  // Static arrow sprite (no animation)
                    speed: 500,  // pixels per second (faster than wizard)
                    damage: 25,  // Base arrow damage
                    spawnTime: 750,  // Spawn arrow at 750ms (frame 7.5 of 9, near end of bow release)
                    // Spawn offset relative to visual sprite position
                    spawnOffset: {
                        right: { x: 50, y: 20 },  // When facing right (at bow tip)
                        left: { x: -6, y: 20 }    // When facing left (at bow tip)
                    }
                }
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
                visualScale: 1.6,  // Dwarf sprite renders at 1.6x (128*1.6=205, 96*1.6=154)

                // Sprite bottom offset - adjusts vertical position (in sprite pixels before scaling)
                // Positive value moves sprite DOWN, negative moves UP
                spriteBottomOffset: 25,  // Dwarf sprite adjustment - aligns feet with collision box bottom

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
            },

            wizard: {
                id: 'wizard',
                name: 'Wizard',
                description: 'A powerful mage with melee and ranged magic attacks',

                // Sprite configuration
                spriteBasePath: 'sprites/PLAYER/CHARACTER/MATTZ ART/Wizard 2D Pixel Art v2.0/Sprites/without_outline',
                spriteSize: {
                    frameWidth: 128,  // 768px / 6 frames = 128px per frame (for idle)
                    frameHeight: 78   // Actual sprite sheet height
                },

                // Player dimensions (hitbox for collisions)
                // Match soldier's collision box size for consistency
                playerSize: {
                    width: 44,   // Same as soldier
                    height: 59   // Same as soldier
                },

                // Visual scale - how much larger the sprite should be than the hitbox
                visualScale: 1.8,  // Wizard sprite renders at 1.8x (128*1.8=230, 78*1.8=140)

                // Sprite bottom offset - adjusts vertical position (in sprite pixels before scaling)
                // Positive value moves sprite DOWN, negative moves UP
                spriteBottomOffset: 13,  // Wizard sprite adjustment - aligns feet with collision box bottom

                // Sprite facing - set to true if the sprite sheet faces left by default
                invertFacing: true,  // Wizard sprites face left, so invert the facing logic

                // Animation configurations
                animations: {
                    idle: {
                        file: 'IDLE.png',
                        frames: 6,
                        frameRate: 150
                    },
                    walk: {
                        file: 'WALK.png',
                        frames: 4,
                        frameRate: 150
                    },
                    attack_melee: {
                        file: 'MELEE ATTACK.png',
                        frames: 9,
                        frameRate: 100
                    },
                    attack_ranged: {
                        file: 'RANGED ATTACK.png',
                        frames: 10,
                        frameRate: 100
                    },
                    hurt: {
                        file: 'HURT.png',
                        frames: 4,
                        frameRate: 150
                    },
                    death: {
                        file: 'DEATH.png',
                        frames: 6,
                        frameRate: 150
                    }
                },

                // Attack configuration
                attackDuration: 900,  // milliseconds (9 frames * 100ms for melee)
                rangedAttackDuration: 1000,  // milliseconds (10 frames * 100ms for ranged)

                // Projectile configuration
                projectile: {
                    spriteSheet: 'sprites/PLAYER/CHARACTER/MATTZ ART/Wizard 2D Pixel Art v2.0/Projectile.png',
                    frameWidth: 32,
                    frameHeight: 32,
                    frames: 5,
                    speed: 400,  // pixels per second
                    damage: 30,  // Base projectile damage
                    spawnTime: 800,  // Spawn fireball at 800ms (frame 8 of 10, near end of staff wave)
                    // Spawn offset relative to visual sprite position (not collision box)
                    // These values are in world pixels and account for the visual sprite rendering
                    spawnOffset: {
                        right: { x: 68, y: -9 },  // When facing right
                        left: { x: -50, y: -9 }   // When facing left
                    }
                }
            },

            archer: {
                id: 'archer',
                name: 'Archer',
                description: 'A skilled archer specializing in ranged attacks',

                // Sprite configuration
                spriteBasePath: 'sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Archer/Archer',
                spriteSize: {
                    frameWidth: 100,
                    frameHeight: 100
                },

                // Player dimensions (hitbox for collisions)
                playerSize: {
                    width: 44,   // Same as soldier
                    height: 59   // Same as soldier
                },

                // Visual scale - how much larger the sprite should be than the hitbox
                visualScale: 3.3,  // Same as soldier

                // Sprite bottom offset - adjusts vertical position (in sprite pixels before scaling)
                // Positive value moves sprite DOWN, negative moves UP
                spriteBottomOffset: 43,  // Similar to soldier

                // Animation configurations
                animations: {
                    idle: {
                        file: 'Archer-Idle.png',
                        frames: 6,
                        frameRate: 150
                    },
                    walk: {
                        file: 'Archer-Walk.png',
                        frames: 8,
                        frameRate: 150
                    },
                    attack: {
                        file: 'Archer-Attack01.png',
                        frames: 9,
                        frameRate: 100
                    },
                    attack_ranged: {
                        file: 'Archer-Attack01.png',
                        frames: 9,
                        frameRate: 100
                    },
                    hurt: {
                        file: 'Archer-Hurt.png',
                        frames: 4,
                        frameRate: 150
                    },
                    death: {
                        file: 'Archer-Death.png',
                        frames: 4,
                        frameRate: 150
                    }
                },

                // Attack configuration
                attackDuration: 900,  // milliseconds (9 frames * 100ms)
                rangedAttackDuration: 900,  // milliseconds (9 frames * 100ms for bow)

                // Projectile configuration (arrow)
                projectile: {
                    spriteSheet: 'sprites/PLAYER/CHARACTER/Tiny RPG assets/Characters(100x100)/Archer/Arrow(projectile)/Arrow02(32x32).png',
                    frameWidth: 32,
                    frameHeight: 32,
                    frames: 1,  // Static arrow sprite (no animation)
                    speed: 550,  // pixels per second (faster than soldier)
                    damage: 30,  // Archer arrows deal more damage
                    spawnTime: 750,  // Spawn arrow at 750ms (frame 7.5 of 9, near end of bow release)
                    // Spawn offset relative to visual sprite position
                    spawnOffset: {
                        right: { x: 50, y: 20 },  // When facing right (at bow tip)
                        left: { x: -6, y: 20 }    // When facing left (at bow tip)
                    }
                }
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
