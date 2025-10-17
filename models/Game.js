const mongoose = require('mongoose');

/**
 * Game Schema
 * Stores complete game data including scenes, characters, items, weapons, etc.
 * Each document represents one complete game (a set of scenes/levels)
 */
const gameSchema = new mongoose.Schema({
    // Game metadata
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'New Game'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },

    // Game info (version tracking)
    gameInfo: {
        title: { type: String, default: 'Platform RPG Game' },
        version: { type: String, default: '1.0.0' },
        lastModified: { type: String, default: () => new Date().toISOString().split('T')[0] }
    },

    // Core game data - stored as flexible schema to match existing structure
    scenes: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    currentSceneId: {
        type: Number,
        default: 0
    },

    startSceneId: {
        type: Number,
        default: 0
    },

    characters: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    classes: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    weapons: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    items: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    inventoryItems: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },

    gameSettings: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            hud: {
                x: 10,
                y: 10,
                width: 300,
                height: 100
            }
        }
    },

    GUISettings: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            theme: 'none'
        }
    },

    playerSettings: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            maxHealth: 100,
            healthRegen: 0,
            maxStamina: 100,
            staminaRegen: 1,
            moveSpeed: 5,
            jumpForce: 15,
            attackDamage: 10,
            attackSpeed: 1,
            defense: 0,
            critChance: 0.1,
            critDamage: 1.5,
            dodgeChance: 0.05,
            blockChance: 0.1
        }
    },

    characterSettings: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            selectedCharacter: 'soldier'
        }
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    // User/owner tracking (for future multi-user support)
    owner: {
        type: String,
        default: 'default'
    },

    // Active/archived status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'games'
});

// Pre-save middleware to update lastModified
gameSchema.pre('save', function(next) {
    this.gameInfo.lastModified = new Date().toISOString().split('T')[0];
    next();
});

// Instance method to get game data in the format expected by frontend
gameSchema.methods.toGameData = function() {
    return {
        gameInfo: this.gameInfo,
        scenes: this.scenes,
        currentSceneId: this.currentSceneId,
        startSceneId: this.startSceneId,
        characters: this.characters,
        classes: this.classes,
        weapons: this.weapons,
        items: this.items,
        inventoryItems: this.inventoryItems,
        gameSettings: this.gameSettings,
        GUISettings: this.GUISettings,
        playerSettings: this.playerSettings,
        characterSettings: this.characterSettings
    };
};

// Static method to create game from gameData object
gameSchema.statics.createFromGameData = function(name, gameData, description = '') {
    return this.create({
        name: name,
        description: description,
        gameInfo: gameData.gameInfo || {},
        scenes: gameData.scenes || [],
        currentSceneId: gameData.currentSceneId || 0,
        startSceneId: gameData.startSceneId || 0,
        characters: gameData.characters || [],
        classes: gameData.classes || [],
        weapons: gameData.weapons || [],
        items: gameData.items || [],
        inventoryItems: gameData.inventoryItems || [],
        gameSettings: gameData.gameSettings || {},
        GUISettings: gameData.GUISettings || {},
        playerSettings: gameData.playerSettings || {},
        characterSettings: gameData.characterSettings || {}
    });
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
