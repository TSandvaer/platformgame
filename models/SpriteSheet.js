const mongoose = require('mongoose');

/**
 * SpriteSheet Schema
 * Stores GLOBAL sprite sheet registrations that can be used across ALL games
 * Tracks which sprite sheets are available for prop definitions
 */
const spriteSheetSchema = new mongoose.Schema({
    // Unique key for this sprite sheet (e.g., "dungeon", "nature")
    // GLOBAL - shared across all games
    sheetKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Display name (e.g., "Dungeon Tileset", "Nature Props")
    name: {
        type: String,
        required: true,
        trim: true
    },

    // File path relative to game root (e.g., "PROPS/dungeon_props.png")
    filePath: {
        type: String,
        required: true,
        trim: true
    },

    // Default tile dimensions (optional, for grid-based sheets)
    // Props can override these with custom dimensions
    tileWidth: {
        type: Number,
        default: null
    },
    tileHeight: {
        type: Number,
        default: null
    },

    // Image dimensions (optional, populated when sheet is loaded)
    imageWidth: {
        type: Number,
        default: null
    },
    imageHeight: {
        type: Number,
        default: null
    },

    // Whether this sprite sheet is currently registered in the game
    isLoaded: {
        type: Boolean,
        default: true
    },

    // Category for organization
    category: {
        type: String,
        default: 'General'
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
spriteSheetSchema.index({ category: 1 });

// Instance method to get sprite sheet data for frontend
spriteSheetSchema.methods.toClientData = function() {
    return {
        id: this._id,
        sheetKey: this.sheetKey,
        name: this.name,
        filePath: this.filePath,
        tileWidth: this.tileWidth,
        tileHeight: this.tileHeight,
        imageWidth: this.imageWidth,
        imageHeight: this.imageHeight,
        category: this.category,
        isLoaded: this.isLoaded
    };
};

// Static method to find all sprite sheets (global)
spriteSheetSchema.statics.findAll = function() {
    return this.find({ isLoaded: true })
        .sort({ category: 1, name: 1 });
};

// Static method to register a new sprite sheet (global)
spriteSheetSchema.statics.registerSheet = function(sheetData) {
    return this.create({
        sheetKey: sheetData.sheetKey,
        name: sheetData.name,
        filePath: sheetData.filePath,
        tileWidth: sheetData.tileWidth || null,
        tileHeight: sheetData.tileHeight || null,
        category: sheetData.category || 'General',
        isLoaded: true
    });
};

module.exports = mongoose.model('SpriteSheet', spriteSheetSchema);
