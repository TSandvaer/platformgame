const express = require('express');
const router = express.Router();
const PlayerProgress = require('../models/PlayerProgress');
const { authenticate } = require('../middleware/auth');

/**
 * Game Session Routes
 * Manages multiple save slots (sessions) per player per game
 * All routes require authentication
 */

/**
 * GET /api/sessions/:gameId
 * List all sessions for the authenticated user for a specific game
 */
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;

    const sessions = await PlayerProgress.listSessions(gameId, playerId);

    res.json({
      success: true,
      sessions: sessions,
      count: sessions.length,
      maxSessions: 10,
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load sessions',
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:gameId
 * Create a new session for a game
 * Body: { sessionName, selectedCharacter }
 */
router.post('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;
    const { sessionName, selectedCharacter } = req.body;

    // Validate input
    if (!sessionName || !sessionName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Session name is required',
      });
    }

    if (sessionName.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Session name must be 30 characters or less',
      });
    }

    if (!selectedCharacter) {
      return res.status(400).json({
        success: false,
        message: 'Character selection is required',
      });
    }

    // Valid characters (match playerCharacters.js)
    const validCharacters = ['soldier', 'dwarfWarrior', 'wizard', 'archer'];
    if (!validCharacters.includes(selectedCharacter)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid character selection',
      });
    }

    // Create new session
    const session = await PlayerProgress.createSession(
      gameId,
      playerId,
      sessionName.trim(),
      selectedCharacter
    );

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session: {
        _id: session._id,
        sessionName: session.sessionName,
        sessionCharacter: session.sessionCharacter,
        createdAt: session.createdAt,
        lastPlayed: session.lastPlayed,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);

    // Handle specific errors
    if (error.message === 'A session with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Maximum of 10 save slots reached') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message,
    });
  }
});

/**
 * GET /api/sessions/:gameId/:sessionId
 * Load a specific session's full progress data
 */
router.get('/:gameId/:sessionId', authenticate, async (req, res) => {
  try {
    const { gameId, sessionId } = req.params;
    const playerId = req.user.firebaseUid;

    const session = await PlayerProgress.findOne({
      _id: sessionId,
      gameId: gameId,
      playerId: playerId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Update lastPlayed timestamp when loading
    session.lastPlayed = new Date();
    await session.save();

    res.json({
      success: true,
      session: {
        _id: session._id,
        sessionName: session.sessionName,
        sessionCharacter: session.sessionCharacter,
        currentSceneId: session.currentSceneId,
        position: session.position,
        health: session.health,
        maxHealth: session.maxHealth,
        stamina: session.stamina,
        maxStamina: session.maxStamina,
        inventory: session.inventory,
        beltItems: session.beltItems,
        completedScenes: session.completedScenes,
        playtime: session.playtime,
        deaths: session.deaths,
        lastPlayed: session.lastPlayed,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('Error loading session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load session',
      error: error.message,
    });
  }
});

/**
 * PUT /api/sessions/:gameId/:sessionId
 * Update session progress (save game)
 * Body: { progress data }
 */
router.put('/:gameId/:sessionId', authenticate, async (req, res) => {
  try {
    const { gameId, sessionId } = req.params;
    const playerId = req.user.firebaseUid;
    const progressData = req.body;

    const session = await PlayerProgress.findOne({
      _id: sessionId,
      gameId: gameId,
      playerId: playerId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Update progress
    await session.updateProgress(progressData);

    res.json({
      success: true,
      message: 'Progress saved',
      lastSaved: session.lastSaved,
      lastPlayed: session.lastPlayed,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/sessions/:gameId/:sessionId
 * Delete a session (save slot)
 */
router.delete('/:gameId/:sessionId', authenticate, async (req, res) => {
  try {
    const { gameId, sessionId } = req.params;
    const playerId = req.user.firebaseUid;

    const session = await PlayerProgress.findOneAndDelete({
      _id: sessionId,
      gameId: gameId,
      playerId: playerId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
      deletedSession: {
        _id: session._id,
        sessionName: session.sessionName,
      },
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message,
    });
  }
});

module.exports = router;
