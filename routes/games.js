const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/games
 * Get user's games (authenticated) or all games (legacy - will show all for backward compatibility)
 * Returns: Array of games with minimal info (id, name, description, dates)
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        let query = { isActive: true };

        // If user is authenticated, filter by owner
        if (req.user) {
            query.ownerId = req.user._id;
        }

        const games = await Game.find(query)
            .select('_id name description gameInfo isPublished slug visibility stats createdAt updatedAt scenes')
            .sort({ updatedAt: -1 })
            .lean();

        console.log(`📋 GET /api/games - Found ${games.length} active game(s)${req.user ? ` for user ${req.user.username}` : ''}`);
        games.forEach(game => {
            console.log(`  - "${game.name}" (ID: ${game._id})`);
        });

        const gamesList = games.map(game => ({
            id: game._id,
            name: game.name,
            description: game.description,
            title: game.gameInfo?.title || 'Platform RPG Game',
            version: game.gameInfo?.version || '1.0.0',
            isPublished: game.isPublished || false,
            slug: game.slug,
            visibility: game.visibility || 'private',
            stats: game.stats || { playCount: 0, views: 0 },
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
                isPublished: game.isPublished || false,
                slug: game.slug,
                visibility: game.visibility,
                shareToken: game.shareToken,
                stats: game.stats,
                publishedAt: game.publishedAt,
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
 * Create a new game (requires authentication if user is logged in)
 * Body: { name, description?, gameData? }
 */
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { name, description, gameData } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Game name is required'
            });
        }

        let newGame;
        const gameDoc = {
            name: name.trim(),
            description: description || '',
            scenes: [],
            currentSceneId: 0,
            startSceneId: 0
        };

        // Assign owner if user is authenticated
        if (req.user) {
            gameDoc.ownerId = req.user._id;
        }

        if (gameData) {
            // Create from existing game data
            newGame = await Game.createFromGameData(name, gameData, description);
            if (req.user) {
                newGame.ownerId = req.user._id;
                await newGame.save();
            }
        } else {
            // Create empty game with defaults
            newGame = await Game.create(gameDoc);
        }

        // Update user stats
        if (req.user) {
            req.user.stats.gamesCreated += 1;
            await req.user.save();
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
 * Update an existing game (checks ownership if user is authenticated)
 * Body: { name?, description?, gameData? }
 */
router.put('/:id', optionalAuth, async (req, res) => {
    try {
        const { name, description, gameData } = req.body;

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Check ownership if user is authenticated
        if (req.user && game.ownerId) {
            if (game.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to edit this game'
                });
            }
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
            game.propDefinitions = gameData.propDefinitions || game.propDefinitions;
            game.spriteSheets = gameData.spriteSheets || game.spriteSheets;
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
 * Partially update game (for auto-save) - checks ownership if authenticated
 * Body: { gameData }
 */
router.patch('/:id', optionalAuth, async (req, res) => {
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

        // Check ownership if user is authenticated
        if (req.user && game.ownerId) {
            if (game.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to edit this game'
                });
            }
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
        game.propDefinitions = gameData.propDefinitions || game.propDefinitions;
        game.spriteSheets = gameData.spriteSheets || game.spriteSheets;

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
 * Delete a game (soft delete - marks as inactive) - checks ownership if authenticated
 */
router.delete('/:id', optionalAuth, async (req, res) => {
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

        // Check ownership if user is authenticated
        if (req.user && game.ownerId) {
            if (game.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to delete this game'
                });
            }
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
 * Duplicate an existing game - checks ownership if authenticated
 */
router.post('/:id/duplicate', optionalAuth, async (req, res) => {
    try {
        const originalGame = await Game.findById(req.params.id);

        if (!originalGame) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Check ownership if user is authenticated
        if (req.user && originalGame.ownerId) {
            if (originalGame.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to duplicate this game'
                });
            }
        }

        const newName = `${originalGame.name} (Copy)`;
        const gameData = originalGame.toGameData();

        const duplicatedGame = await Game.createFromGameData(
            newName,
            gameData,
            originalGame.description
        );

        // Assign owner if user is authenticated
        if (req.user) {
            duplicatedGame.ownerId = req.user._id;
            await duplicatedGame.save();
        }

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

// ===== Publishing Endpoints =====

/**
 * POST /api/games/:id/publish
 * Publish a game (requires authentication)
 * Body: { visibility?, slug? }
 */
router.post('/:id/publish', authenticate, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Check ownership
        if (!game.ownerId || game.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to publish this game'
            });
        }

        // Set visibility if provided
        if (req.body.visibility) {
            if (!['private', 'public'].includes(req.body.visibility)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid visibility. Must be "private" or "public"'
                });
            }
            game.visibility = req.body.visibility;
        }

        // Set custom slug if provided
        if (req.body.slug) {
            game.slug = req.body.slug;
        }

        // Publish the game
        await game.publish(req.user.username);

        // Generate share token for private games
        if (game.visibility === 'private' && !game.shareToken) {
            game.shareToken = game.generateShareToken();
            await game.save();
        }

        // Update user stats
        if (!game.wasPublishedBefore) {
            req.user.stats.gamesPublished += 1;
            await req.user.save();
        }

        const playUrl = `/play/${req.user.username}/${game.slug}`;
        const shareUrl = game.visibility === 'private'
            ? `${playUrl}?token=${game.shareToken}`
            : playUrl;

        res.json({
            success: true,
            message: 'Game published successfully',
            game: {
                id: game._id,
                name: game.name,
                slug: game.slug,
                isPublished: game.isPublished,
                visibility: game.visibility,
                publishedAt: game.publishedAt,
                playUrl,
                shareUrl
            }
        });
    } catch (error) {
        console.error('Error publishing game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to publish game',
            message: error.message
        });
    }
});

/**
 * POST /api/games/:id/unpublish
 * Unpublish a game (requires authentication)
 */
router.post('/:id/unpublish', authenticate, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Check ownership
        if (!game.ownerId || game.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to unpublish this game'
            });
        }

        await game.unpublish();

        res.json({
            success: true,
            message: 'Game unpublished successfully',
            game: {
                id: game._id,
                name: game.name,
                isPublished: game.isPublished
            }
        });
    } catch (error) {
        console.error('Error unpublishing game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unpublish game',
            message: error.message
        });
    }
});

/**
 * GET /api/games/public/gallery
 * Get all published public games for gallery
 * Query params: ?sort=newest|popular&limit=20
 */
router.get('/public/gallery', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || 'newest';

        let sortQuery = {};
        switch (sort) {
            case 'popular':
                sortQuery = { 'stats.playCount': -1 };
                break;
            case 'newest':
            default:
                sortQuery = { publishedAt: -1 };
                break;
        }

        const games = await Game.findPublished()
            .sort(sortQuery)
            .limit(limit)
            .lean();

        const gamesList = games.map(game => ({
            id: game._id,
            name: game.name,
            description: game.description,
            slug: game.slug,
            thumbnail: game.thumbnail,
            tags: game.tags,
            stats: game.stats,
            publishedAt: game.publishedAt,
            author: game.ownerId ? {
                username: game.ownerId.username,
                displayName: game.ownerId.displayName,
                profileImage: game.ownerId.profileImage
            } : null,
            playUrl: game.ownerId ? `/play/${game.ownerId.username}/${game.slug}` : null
        }));

        res.json({
            success: true,
            count: gamesList.length,
            games: gamesList
        });
    } catch (error) {
        console.error('Error fetching public games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch public games',
            message: error.message
        });
    }
});

/**
 * GET /api/games/play/:username/:slug
 * Get a published game by username and slug (for player)
 * Query params: ?token=xxx (for private games)
 */
router.get('/play/:username/:slug', async (req, res) => {
    try {
        const { username, slug } = req.params;
        const { token } = req.query;

        const game = await Game.findByUsernameAndSlug(username, slug);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found',
                message: 'This game does not exist or has been removed'
            });
        }

        // Check if game is published
        if (!game.isPublished) {
            return res.status(404).json({
                success: false,
                error: 'Game not published',
                message: 'This game is not currently published'
            });
        }

        // Check visibility and token for private games
        if (game.visibility === 'private') {
            if (!token || token !== game.shareToken) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    message: 'This game is private. A valid share link is required.'
                });
            }
        }

        // Increment view count
        await game.incrementViewCount();

        res.json({
            success: true,
            game: game.getPublicGameData(),
            author: {
                username: game.ownerId.username,
                displayName: game.ownerId.displayName,
                profileImage: game.ownerId.profileImage
            }
        });
    } catch (error) {
        console.error('Error fetching game for play:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load game',
            message: error.message
        });
    }
});

/**
 * POST /api/games/play/:username/:slug/played
 * Increment play count (called when game actually starts)
 */
router.post('/play/:username/:slug/played', async (req, res) => {
    try {
        const { username, slug } = req.params;

        const game = await Game.findByUsernameAndSlug(username, slug);

        if (!game || !game.isPublished) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        await game.incrementPlayCount();

        res.json({
            success: true,
            message: 'Play count updated'
        });
    } catch (error) {
        console.error('Error updating play count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update play count',
            message: error.message
        });
    }
});

/**
 * GET /api/games/user/:username
 * Get all published games by a specific user (for user profile page)
 */
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const games = await Game.find({
            ownerId: user._id,
            isPublished: true,
            isActive: true,
            visibility: 'public'
        })
            .select('_id name description slug thumbnail tags stats publishedAt')
            .sort({ publishedAt: -1 })
            .lean();

        const gamesList = games.map(game => ({
            id: game._id,
            name: game.name,
            description: game.description,
            slug: game.slug,
            thumbnail: game.thumbnail,
            tags: game.tags,
            stats: game.stats,
            publishedAt: game.publishedAt,
            playUrl: `/play/${username}/${game.slug}`
        }));

        res.json({
            success: true,
            user: user.getPublicProfile(),
            count: gamesList.length,
            games: gamesList
        });
    } catch (error) {
        console.error('Error fetching user games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user games',
            message: error.message
        });
    }
});

module.exports = router;
