const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

/**
 * GET /api/games
 * Get all games (list view)
 * Returns: Array of games with minimal info (id, name, description, dates)
 */
router.get('/', async (req, res) => {
    try {
        const games = await Game.find({ isActive: true })
            .select('_id name description gameInfo createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .lean();

        console.log(`📋 GET /api/games - Found ${games.length} active game(s)`);
        games.forEach(game => {
            console.log(`  - "${game.name}" (ID: ${game._id})`);
        });

        const gamesList = games.map(game => ({
            id: game._id,
            name: game.name,
            description: game.description,
            title: game.gameInfo?.title || 'Platform RPG Game',
            version: game.gameInfo?.version || '1.0.0',
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            sceneCount: game.scenes?.length || 0
        }));

        res.json({
            success: true,
            count: gamesList.length,
            games: gamesList
        });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch games',
            message: error.message
        });
    }
});

/**
 * GET /api/games/:id
 * Get a specific game by ID (full data)
 * Returns: Complete game data ready for the game engine
 */
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        res.json({
            success: true,
            game: {
                id: game._id,
                name: game.name,
                description: game.description,
                gameData: game.toGameData(),
                createdAt: game.createdAt,
                updatedAt: game.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game',
            message: error.message
        });
    }
});

/**
 * POST /api/games
 * Create a new game
 * Body: { name, description?, gameData? }
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, gameData } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Game name is required'
            });
        }

        let newGame;

        if (gameData) {
            // Create from existing game data
            newGame = await Game.createFromGameData(name, gameData, description);
        } else {
            // Create empty game with defaults
            newGame = await Game.create({
                name: name.trim(),
                description: description || '',
                scenes: [],
                currentSceneId: 0,
                startSceneId: 0
            });
        }

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game: {
                id: newGame._id,
                name: newGame.name,
                description: newGame.description,
                gameData: newGame.toGameData(),
                createdAt: newGame.createdAt,
                updatedAt: newGame.updatedAt
            }
        });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create game',
            message: error.message
        });
    }
});

/**
 * PUT /api/games/:id
 * Update an existing game
 * Body: { name?, description?, gameData? }
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, description, gameData } = req.body;

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Update metadata if provided
        if (name !== undefined) {
            game.name = name.trim();
        }
        if (description !== undefined) {
            game.description = description;
        }

        // Update game data if provided
        if (gameData) {
            game.gameInfo = gameData.gameInfo || game.gameInfo;
            game.scenes = gameData.scenes || game.scenes;
            game.currentSceneId = gameData.currentSceneId !== undefined ? gameData.currentSceneId : game.currentSceneId;
            game.startSceneId = gameData.startSceneId !== undefined ? gameData.startSceneId : game.startSceneId;
            game.characters = gameData.characters || game.characters;
            game.classes = gameData.classes || game.classes;
            game.weapons = gameData.weapons || game.weapons;
            game.items = gameData.items || game.items;
            game.inventoryItems = gameData.inventoryItems || game.inventoryItems;
            game.gameSettings = gameData.gameSettings || game.gameSettings;
            game.GUISettings = gameData.GUISettings || game.GUISettings;
            game.playerSettings = gameData.playerSettings || game.playerSettings;
            game.characterSettings = gameData.characterSettings || game.characterSettings;
        }

        await game.save();

        res.json({
            success: true,
            message: 'Game updated successfully',
            game: {
                id: game._id,
                name: game.name,
                description: game.description,
                gameData: game.toGameData(),
                createdAt: game.createdAt,
                updatedAt: game.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update game',
            message: error.message
        });
    }
});

/**
 * PATCH /api/games/:id
 * Partially update game (for auto-save)
 * Body: { gameData }
 */
router.patch('/:id', async (req, res) => {
    try {
        const { gameData } = req.body;

        if (!gameData) {
            return res.status(400).json({
                success: false,
                error: 'gameData is required'
            });
        }

        console.log(`📝 PATCH request received for game ID: ${req.params.id}`);

        const game = await Game.findById(req.params.id);

        if (!game) {
            console.error(`❌ Game not found with ID: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        console.log(`✓ Updating game: "${game.name}" (ID: ${game._id})`);
        console.log(`  - Scenes: ${gameData.scenes?.length || 0}`);

        // Update only the game data (used for auto-save)
        game.gameInfo = gameData.gameInfo || game.gameInfo;
        game.scenes = gameData.scenes || game.scenes;
        game.currentSceneId = gameData.currentSceneId !== undefined ? gameData.currentSceneId : game.currentSceneId;
        game.startSceneId = gameData.startSceneId !== undefined ? gameData.startSceneId : game.startSceneId;
        game.characters = gameData.characters || game.characters;
        game.classes = gameData.classes || game.classes;
        game.weapons = gameData.weapons || game.weapons;
        game.items = gameData.items || game.items;
        game.inventoryItems = gameData.inventoryItems || game.inventoryItems;
        game.gameSettings = gameData.gameSettings || game.gameSettings;
        game.GUISettings = gameData.GUISettings || game.GUISettings;
        game.playerSettings = gameData.playerSettings || game.playerSettings;
        game.characterSettings = gameData.characterSettings || game.characterSettings;

        await game.save();

        console.log(`✅ Game saved: "${game.name}" at ${game.updatedAt}`);

        res.json({
            success: true,
            message: 'Game saved successfully',
            updatedAt: game.updatedAt
        });
    } catch (error) {
        console.error('Error saving game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save game',
            message: error.message
        });
    }
});

/**
 * DELETE /api/games/:id
 * Delete a game (soft delete - marks as inactive)
 */
router.delete('/:id', async (req, res) => {
    try {
        console.log(`🗑️ DELETE request received for game ID: ${req.params.id}`);

        const game = await Game.findById(req.params.id);

        if (!game) {
            console.error(`❌ Game not found with ID: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        console.log(`✓ Deleting game: "${game.name}" (ID: ${game._id})`);

        // Soft delete - mark as inactive
        game.isActive = false;
        await game.save();

        console.log(`✅ Game deleted successfully: "${game.name}"`);

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete game',
            message: error.message
        });
    }
});

/**
 * POST /api/games/:id/duplicate
 * Duplicate an existing game
 */
router.post('/:id/duplicate', async (req, res) => {
    try {
        const originalGame = await Game.findById(req.params.id);

        if (!originalGame) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        const newName = `${originalGame.name} (Copy)`;
        const gameData = originalGame.toGameData();

        const duplicatedGame = await Game.createFromGameData(
            newName,
            gameData,
            originalGame.description
        );

        res.status(201).json({
            success: true,
            message: 'Game duplicated successfully',
            game: {
                id: duplicatedGame._id,
                name: duplicatedGame.name,
                description: duplicatedGame.description,
                gameData: duplicatedGame.toGameData(),
                createdAt: duplicatedGame.createdAt,
                updatedAt: duplicatedGame.updatedAt
            }
        });
    } catch (error) {
        console.error('Error duplicating game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate game',
            message: error.message
        });
    }
});

module.exports = router;
