const mongoose = require('mongoose');

/**
 * Player Progress Model
 * Stores individual player progress for each game they play
 * Completely server-side to prevent cheating
 */

const playerProgressSchema = new mongoose.Schema(
  {
    // Reference to the game
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true,
    },

    // Player's Firebase UID (not user account, but player who plays the game)
    playerId: {
      type: String,
      required: true,
      index: true,
    },

    // Session/save slot name (e.g., "My First Adventure", "Speedrun", etc.)
    sessionName: {
      type: String,
      required: true,
      maxlength: 30,
      trim: true,
    },

    // Character locked to this session (cannot be changed after creation)
    sessionCharacter: {
      type: String,
      required: true,
      default: 'soldier',
    },

    // Current game state
    currentSceneId: {
      type: Number,
      required: true,
    },

    // Player position in current scene
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },

    // Player stats
    health: {
      type: Number,
      required: true,
      min: 0,
    },

    maxHealth: {
      type: Number,
      required: true,
      min: 1,
    },

    stamina: {
      type: Number,
      required: true,
      min: 0,
    },

    maxStamina: {
      type: Number,
      required: true,
      min: 1,
    },

    // Player inventory
    inventory: {
      type: [
        {
          itemId: String,
          quantity: Number,
          itemData: mongoose.Schema.Types.Mixed, // Full item data for display
        },
      ],
      default: [],
    },

    // Quick belt items (slots 1-4)
    beltItems: {
      type: [
        {
          slot: Number, // 0-3 (for keys 1-4)
          itemId: String,
          quantity: Number,
          itemData: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },

    // Completed scenes/checkpoints
    completedScenes: {
      type: [Number],
      default: [],
    },

    // Additional metadata
    playtime: {
      type: Number, // Total playtime in seconds
      default: 0,
    },

    deaths: {
      type: Number,
      default: 0,
    },

    // Timestamps
    lastSaved: {
      type: Date,
      default: Date.now,
    },

    lastPlayed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for fast lookups by game, player, and session (allows multiple sessions per player per game)
playerProgressSchema.index({ gameId: 1, playerId: 1, sessionName: 1 }, { unique: true });

// Update lastSaved timestamp before saving
playerProgressSchema.pre('save', function (next) {
  this.lastSaved = new Date();
  next();
});

// Static method to create a new session
playerProgressSchema.statics.createSession = async function (gameId, playerId, sessionName, sessionCharacter, initialData = {}) {
  // Check if session name already exists for this player and game
  const existing = await this.findOne({ gameId, playerId, sessionName });
  if (existing) {
    throw new Error('A session with this name already exists');
  }

  // Check if player has reached max sessions (10)
  const sessionCount = await this.countDocuments({ gameId, playerId });
  if (sessionCount >= 10) {
    throw new Error('Maximum of 10 save slots reached');
  }

  // Create new session with defaults
  const session = new this({
    gameId,
    playerId,
    sessionName,
    sessionCharacter,
    currentSceneId: initialData.startSceneId || 1,
    position: initialData.position || { x: 100, y: 100 },
    health: initialData.health || 100,
    maxHealth: initialData.maxHealth || 100,
    stamina: initialData.stamina || 100,
    maxStamina: initialData.maxStamina || 100,
    inventory: [],
    beltItems: [],
    completedScenes: [],
    playtime: 0,
    deaths: 0,
  });

  await session.save();
  return session;
};

// Static method to list all sessions for a player and game
playerProgressSchema.statics.listSessions = async function (gameId, playerId) {
  return this.find({ gameId, playerId })
    .sort({ lastPlayed: -1 }) // Most recently played first
    .select('_id sessionName sessionCharacter lastPlayed createdAt playtime deaths')
    .lean();
};

// Method to update progress
playerProgressSchema.methods.updateProgress = async function (progressData) {
  // Update all provided fields
  if (progressData.currentSceneId !== undefined) {
    this.currentSceneId = progressData.currentSceneId;
  }
  if (progressData.position !== undefined) {
    this.position = progressData.position;
  }
  if (progressData.health !== undefined) {
    this.health = Math.max(0, progressData.health);
  }
  if (progressData.maxHealth !== undefined) {
    this.maxHealth = Math.max(1, progressData.maxHealth);
  }
  if (progressData.stamina !== undefined) {
    this.stamina = Math.max(0, progressData.stamina);
  }
  if (progressData.maxStamina !== undefined) {
    this.maxStamina = Math.max(1, progressData.maxStamina);
  }
  if (progressData.inventory !== undefined) {
    this.inventory = progressData.inventory;
  }
  if (progressData.beltItems !== undefined) {
    this.beltItems = progressData.beltItems;
  }
  if (progressData.completedScenes !== undefined) {
    this.completedScenes = progressData.completedScenes;
  }
  if (progressData.playtime !== undefined) {
    this.playtime = progressData.playtime;
  }
  if (progressData.deaths !== undefined) {
    this.deaths = progressData.deaths;
  }

  // Update lastPlayed timestamp whenever progress is saved
  this.lastPlayed = new Date();

  // NOTE: sessionCharacter is NOT updatable - it's locked to the session

  return this.save();
};

// Method to reset progress to initial state (but keeps session name and character)
playerProgressSchema.methods.reset = async function (initialData = {}) {
  this.currentSceneId = initialData.startSceneId || 1;
  this.position = initialData.position || { x: 100, y: 100 };
  this.health = initialData.health || 100;
  this.maxHealth = initialData.maxHealth || 100;
  this.stamina = initialData.stamina || 100;
  this.maxStamina = initialData.maxStamina || 100;
  this.inventory = [];
  this.beltItems = [];
  this.completedScenes = [];
  this.playtime = 0;
  this.deaths = 0;
  this.lastPlayed = new Date();

  // NOTE: sessionName and sessionCharacter are NOT reset - they're part of the session identity

  return this.save();
};

const PlayerProgress = mongoose.model('PlayerProgress', playerProgressSchema);

module.exports = PlayerProgress;
