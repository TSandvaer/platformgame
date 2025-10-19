const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Firebase UID (unique identifier from Firebase Auth)
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User email (from Firebase Auth)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Username for URLs (e.g., /play/username/gamename)
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      // Only allow alphanumeric characters, hyphens, and underscores
      match: /^[a-z0-9_-]+$/,
    },

    // Display name (shown in UI)
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // Profile image URL (optional)
    profileImage: {
      type: String,
      default: null,
    },

    // User role for future permissions
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Bio or description (optional)
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },

    // Statistics
    stats: {
      gamesCreated: {
        type: Number,
        default: 0,
      },
      gamesPublished: {
        type: Number,
        default: 0,
      },
      totalPlays: {
        type: Number,
        default: 0,
      },
    },

    // Timestamps
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for efficient lookups
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

// Virtual for user's public profile URL
userSchema.virtual('profileUrl').get(function () {
  return `/profile/${this.username}`;
});

// Method to get public user info (safe to send to client)
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    profileImage: this.profileImage,
    bio: this.bio,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

// Method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find user by Firebase UID
userSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid });
};

// Static method to find user by username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Static method to check if username is available
userSchema.statics.isUsernameAvailable = async function (username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// Pre-save hook to ensure username is lowercase
userSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
