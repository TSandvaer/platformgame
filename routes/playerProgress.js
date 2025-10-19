const express = require('express');
const router = express.Router();
const PlayerProgress = require('../models/PlayerProgress');
const Game = require('../models/Game');
const { authenticate } = require('../middleware/auth');

/**
 * Player Progress Routes
 * Handles saving and loading player progress for published games
 * All routes require authentication to prevent cheating
 */

/**
 * GET /api/progress/:gameId
 * Load player progress for a specific game
 */
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;

    // Verify game exists and is published
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    if (!game.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This game is not published',
      });
    }

    // Find or create player progress
    const progress = await PlayerProgress.findOrCreate(gameId, playerId, {
      startSceneId: game.gameData.startSceneId,
      position: {
        x: game.gameData.scenes[0]?.settings?.playerStartX || 100,
        y: game.gameData.scenes[0]?.settings?.playerStartY || 100,
      },
      health: game.gameData.playerSettings?.maxHealth || 100,
      maxHealth: game.gameData.playerSettings?.maxHealth || 100,
      stamina: game.gameData.playerSettings?.maxStamina || 100,
      maxStamina: game.gameData.playerSettings?.maxStamina || 100,
      selectedCharacter: game.gameData.characterSettings?.selectedCharacter || 'soldier',
    });

    res.json({
      success: true,
      progress: {
        currentSceneId: progress.currentSceneId,
        position: progress.position,
        health: progress.health,
        maxHealth: progress.maxHealth,
        stamina: progress.stamina,
        maxStamina: progress.maxStamina,
        inventory: progress.inventory,
        beltItems: progress.beltItems,
        completedScenes: progress.completedScenes,
        selectedCharacter: progress.selectedCharacter,
        playtime: progress.playtime,
        deaths: progress.deaths,
        lastSaved: progress.lastSaved,
      },
    });
  } catch (error) {
    console.error('Error loading player progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load progress',
      error: error.message,
    });
  }
});

/**
 * POST /api/progress/:gameId
 * Save player progress for a specific game
 */
router.post('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;
    const progressData = req.body;

    // Verify game exists and is published
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    if (!game.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Cannot save progress for unpublished game',
      });
    }

    // Validate progress data
    if (progressData.currentSceneId === undefined ||
        progressData.position === undefined ||
        progressData.health === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress data',
      });
    }

    // Find or create progress
    let progress = await PlayerProgress.findOne({ gameId, playerId });

    if (!progress) {
      // Create new progress
      progress = new PlayerProgress({
        gameId,
        playerId,
        ...progressData,
      });
    } else {
      // Update existing progress
      await progress.updateProgress(progressData);
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Progress saved successfully',
      lastSaved: progress.lastSaved,
    });
  } catch (error) {
    console.error('Error saving player progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/progress/:gameId
 * Reset player progress for a specific game
 */
router.delete('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    // Find progress
    const progress = await PlayerProgress.findOne({ gameId, playerId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found to reset',
      });
    }

    // Reset progress to initial state
    await progress.reset({
      startSceneId: game.gameData.startSceneId,
      position: {
        x: game.gameData.scenes[0]?.settings?.playerStartX || 100,
        y: game.gameData.scenes[0]?.settings?.playerStartY || 100,
      },
      health: game.gameData.playerSettings?.maxHealth || 100,
      maxHealth: game.gameData.playerSettings?.maxHealth || 100,
      stamina: game.gameData.playerSettings?.maxStamina || 100,
      maxStamina: game.gameData.playerSettings?.maxStamina || 100,
    });

    res.json({
      success: true,
      message: 'Progress reset successfully',
    });
  } catch (error) {
    console.error('Error resetting player progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset progress',
      error: error.message,
    });
  }
});

/**
 * GET /api/progress/:gameId/stats
 * Get player statistics for a game (playtime, deaths, etc.)
 */
router.get('/:gameId/stats', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerId = req.user.firebaseUid;

    const progress = await PlayerProgress.findOne({ gameId, playerId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found',
      });
    }

    res.json({
      success: true,
      stats: {
        playtime: progress.playtime,
        deaths: progress.deaths,
        completedScenes: progress.completedScenes.length,
        lastPlayed: progress.lastSaved,
        createdAt: progress.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
});

module.exports = router;
