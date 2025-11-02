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
        description: { type: String, default: 'Start your adventure in this exciting game' },
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

    // Prop definitions and sprite sheets (for games using database-defined props)
    propDefinitions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    spriteSheets: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
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

    // Multi-user ownership and publishing fields
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for backward compatibility
        index: true
    },

    // Publishing status
    isPublished: {
        type: Boolean,
        default: false,
        index: true
    },

    publishedAt: {
        type: Date,
        default: null
    },

    // URL slug for published games (unique per user)
    // Format: /play/:username/:slug
    slug: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
        // Slug validation: alphanumeric, hyphens, underscores
        match: /^[a-z0-9_-]+$/
    },

    // Game visibility
    visibility: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
    },

    // Share token for private game sharing
    shareToken: {
        type: String,
        default: null,
        index: true
    },

    // Analytics
    stats: {
        playCount: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        lastPlayed: {
            type: Date,
            default: null
        }
    },

    // Game thumbnail for gallery (URL or base64)
    thumbnail: {
        type: String,
        default: null
    },

    // Tags for discovery
    tags: {
        type: [String],
        default: []
    },

    // Active/archived status
    isActive: {
        type: Boolean,
        default: true
    },

    // Legacy field for backward compatibility (deprecated)
    owner: {
        type: String,
        default: null
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
        characterSettings: this.characterSettings,
        propDefinitions: this.propDefinitions,
        spriteSheets: this.spriteSheets
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
        characterSettings: gameData.characterSettings || {},
        propDefinitions: gameData.propDefinitions || {},
        spriteSheets: gameData.spriteSheets || {}
    });
};

// Instance method to generate slug from game name
gameSchema.methods.generateSlug = function() {
    // Convert name to lowercase, replace spaces with hyphens, remove special chars
    let slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 50); // Limit length

    // If slug is empty, use default
    if (!slug) {
        slug = 'game';
    }

    return slug;
};

// Instance method to generate unique share token
gameSchema.methods.generateShareToken = function() {
    // Generate a random token for sharing private games
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
};

// Instance method to publish game
gameSchema.methods.publish = async function(username) {
    // Generate slug from game name if not set
    if (!this.slug) {
        let baseSlug = this.generateSlug();
        let slug = baseSlug;
        let counter = 1;

        // Check for slug uniqueness for this user
        const Game = this.constructor;
        while (true) {
            const existingGame = await Game.findOne({
                ownerId: this.ownerId,
                slug: slug,
                _id: { $ne: this._id }
            });

            if (!existingGame) {
                break;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }

    this.isPublished = true;
    this.publishedAt = new Date();

    return this.save();
};

// Instance method to unpublish game
gameSchema.methods.unpublish = function() {
    this.isPublished = false;
    return this.save();
};

// Instance method to increment play count
gameSchema.methods.incrementPlayCount = function() {
    this.stats.playCount += 1;
    this.stats.lastPlayed = new Date();
    return this.save();
};

// Instance method to increment view count
gameSchema.methods.incrementViewCount = function() {
    this.stats.views += 1;
    return this.save();
};

// Instance method to get public game data (safe to send to player)
gameSchema.methods.getPublicGameData = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        slug: this.slug,
        thumbnail: this.thumbnail,
        tags: this.tags,
        stats: this.stats,
        publishedAt: this.publishedAt,
        gameData: this.toGameData()
    };
};

// Static method to find published games
gameSchema.statics.findPublished = function(filters = {}) {
    return this.find({
        isPublished: true,
        isActive: true,
        visibility: 'public',
        ...filters
    }).populate('ownerId', 'username displayName profileImage');
};

// Static method to find game by username and slug
gameSchema.statics.findByUsernameAndSlug = async function(username, slug) {
    const User = mongoose.model('User');
    const user = await User.findByUsername(username);

    if (!user) {
        return null;
    }

    return this.findOne({
        ownerId: user._id,
        slug: slug,
        isActive: true
    }).populate('ownerId', 'username displayName profileImage');
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
