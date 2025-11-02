const mongoose = require('mongoose');

/**
 * PropDefinition Schema
 * Stores global prop definitions that can be used across ALL games
 * Each prop represents a placeable object in the game editor
 */
const propDefinitionSchema = new mongoose.Schema({
    // Unique key for this prop (e.g., "dungeonTorch")
    // GLOBAL - shared across all games
    propKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Display name (e.g., "Dungeon Torch")
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Sprite sheet reference
    spriteSheet: {
        type: String,
        required: true,
        trim: true
    },

    // Sprite coordinates (floating point for precise positioning)
    tileX: {
        type: Number,
        required: true
    },
    tileY: {
        type: Number,
        required: true
    },

    // Sprite dimensions in pixels
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },

    // Category for organization in prop editor
    category: {
        type: String,
        required: true,
        default: 'Uncategorized'
    },

    // Optional special properties
    hasGlow: {
        type: Boolean,
        default: false
    },
    hasFlame: {
        type: Boolean,
        default: false
    },
    isChest: {
        type: Boolean,
        default: false
    },
    chestRow: {
        type: Number,
        default: 0
    },
    isObstacle: {
        type: Boolean,
        default: false
    },
    destroyable: {
        type: Boolean,
        default: false
    },
    damagePerSecond: {
        type: Number,
        default: 0
    },
    maxDurability: {
        type: Number,
        default: 100
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for category filtering
propDefinitionSchema.index({ category: 1 });

module.exports = mongoose.model('PropDefinition', propDefinitionSchema);
