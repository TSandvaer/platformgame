const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/users/register
 * Register a new user after Firebase signup
 * Body: { firebaseUid, email, username, displayName }
 */
router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, email, username, displayName } = req.body;

    // Validate required fields
    if (!firebaseUid || !email || !username || !displayName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide firebaseUid, email, username, and displayName'
      });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores'
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        error: 'Invalid username length',
        message: 'Username must be between 3 and 30 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { firebaseUid },
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.firebaseUid === firebaseUid) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this Firebase UID already exists'
        });
      }
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          error: 'Email already in use',
          message: 'An account with this email already exists'
        });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(409).json({
          error: 'Username taken',
          message: 'This username is already taken. Please choose another.'
        });
      }
    }

    // Create new user
    const newUser = new User({
      firebaseUid,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      displayName,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // Update last login
    await req.user.updateLastLogin();

    res.json({
      user: {
        id: req.user._id,
        firebaseUid: req.user.firebaseUid,
        email: req.user.email,
        username: req.user.username,
        displayName: req.user.displayName,
        profileImage: req.user.profileImage,
        bio: req.user.bio,
        role: req.user.role,
        stats: req.user.stats,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching your profile'
    });
  }
});

/**
 * PATCH /api/users/me
 * Update current user's profile
 * Body: { displayName?, profileImage?, bio? }
 */
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { displayName, profileImage, bio } = req.body;
    const updates = {};

    if (displayName !== undefined) {
      if (displayName.trim().length === 0 || displayName.length > 50) {
        return res.status(400).json({
          error: 'Invalid display name',
          message: 'Display name must be between 1 and 50 characters'
        });
      }
      updates.displayName = displayName.trim();
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({
          error: 'Bio too long',
          message: 'Bio must be 500 characters or less'
        });
      }
      updates.bio = bio;
    }

    // Update user
    Object.assign(req.user, updates);
    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An error occurred while updating your profile'
    });
  }
});

/**
 * GET /api/users/:username
 * Get public profile of a user by username
 */
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this username'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'This user account is not active'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching the user profile'
    });
  }
});

/**
 * GET /api/users/check-username/:username
 * Check if a username is available
 */
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.json({
        available: false,
        message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores'
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.json({
        available: false,
        message: 'Username must be between 3 and 30 characters'
      });
    }

    const isAvailable = await User.isUsernameAvailable(username);

    res.json({
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });

  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({
      error: 'Check failed',
      message: 'An error occurred while checking username availability'
    });
  }
});

module.exports = router;
