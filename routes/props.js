const express = require('express');
const router = express.Router();
const PropDefinition = require('../models/PropDefinition');
const SpriteSheet = require('../models/SpriteSheet');

// ============================================
// SPRITE SHEET ROUTES (GLOBAL)
// ============================================

// GET all sprite sheets
router.get('/spritesheets', async (req, res) => {
    try {
        const spriteSheets = await SpriteSheet.findAll();
        res.json(spriteSheets.map(sheet => sheet.toClientData()));
    } catch (error) {
        console.error('Error fetching sprite sheets:', error);
        res.status(500).json({ error: 'Failed to fetch sprite sheets', message: error.message });
    }
});

// POST new sprite sheet
router.post('/spritesheets', async (req, res) => {
    try {
        const sheetData = req.body;

        // Check if sheet key already exists globally
        const existingSheet = await SpriteSheet.findOne({
            sheetKey: sheetData.sheetKey
        });

        if (existingSheet) {
            return res.status(400).json({
                error: 'Sprite sheet already exists',
                message: `A sprite sheet with key "${sheetData.sheetKey}" already exists`
            });
        }

        const spriteSheet = await SpriteSheet.registerSheet(sheetData);
        res.status(201).json(spriteSheet.toClientData());
    } catch (error) {
        console.error('Error creating sprite sheet:', error);
        res.status(500).json({ error: 'Failed to create sprite sheet', message: error.message });
    }
});

// PUT update sprite sheet
router.put('/spritesheets/:sheetId', async (req, res) => {
    try {
        const { sheetId } = req.params;
        const updateData = req.body;

        const spriteSheet = await SpriteSheet.findByIdAndUpdate(
            sheetId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!spriteSheet) {
            return res.status(404).json({ error: 'Sprite sheet not found' });
        }

        res.json(spriteSheet.toClientData());
    } catch (error) {
        console.error('Error updating sprite sheet:', error);
        res.status(500).json({ error: 'Failed to update sprite sheet', message: error.message });
    }
});

// DELETE sprite sheet
router.delete('/spritesheets/:sheetId', async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Check if any props are using this sprite sheet
        const sheet = await SpriteSheet.findById(sheetId);
        if (!sheet) {
            return res.status(404).json({ error: 'Sprite sheet not found' });
        }

        const propsUsingSheet = await PropDefinition.countDocuments({
            spriteSheet: sheet.sheetKey
        });

        if (propsUsingSheet > 0) {
            return res.status(400).json({
                error: 'Cannot delete sprite sheet',
                message: `${propsUsingSheet} prop(s) are still using this sprite sheet`
            });
        }

        await SpriteSheet.findByIdAndDelete(sheetId);
        res.json({ success: true, message: 'Sprite sheet deleted successfully' });
    } catch (error) {
        console.error('Error deleting sprite sheet:', error);
        res.status(500).json({ error: 'Failed to delete sprite sheet', message: error.message });
    }
});

// ============================================
// PROP DEFINITION ROUTES (GLOBAL)
// ============================================

// GET all props
router.get('/props', async (req, res) => {
    try {
        const { category } = req.query;

        const query = {};
        if (category) {
            query.category = category;
        }

        const props = await PropDefinition.find(query).sort({ category: 1, name: 1 });
        res.json(props);
    } catch (error) {
        console.error('Error fetching props:', error);
        res.status(500).json({ error: 'Failed to fetch props', message: error.message });
    }
});

// GET single prop by ID
router.get('/props/:propId', async (req, res) => {
    try {
        const { propId } = req.params;
        const prop = await PropDefinition.findById(propId);

        if (!prop) {
            return res.status(404).json({ error: 'Prop not found' });
        }

        res.json(prop);
    } catch (error) {
        console.error('Error fetching prop:', error);
        res.status(500).json({ error: 'Failed to fetch prop', message: error.message });
    }
});

// POST new prop definition
router.post('/props', async (req, res) => {
    try {
        const propData = req.body;

        // Check if prop key already exists globally
        const existingProp = await PropDefinition.findOne({
            propKey: propData.propKey
        });

        if (existingProp) {
            return res.status(400).json({
                error: 'Prop already exists',
                message: `A prop with key "${propData.propKey}" already exists`
            });
        }

        // Verify sprite sheet exists
        const spriteSheet = await SpriteSheet.findOne({
            sheetKey: propData.spriteSheet
        });

        if (!spriteSheet) {
            return res.status(400).json({
                error: 'Invalid sprite sheet',
                message: `Sprite sheet "${propData.spriteSheet}" not found`
            });
        }

        const prop = await PropDefinition.create(propData);

        res.status(201).json(prop);
    } catch (error) {
        console.error('Error creating prop:', error);
        res.status(500).json({ error: 'Failed to create prop', message: error.message });
    }
});

// PUT update prop definition
router.put('/props/:propId', async (req, res) => {
    try {
        const { propId } = req.params;
        const updateData = req.body;

        // If updating sprite sheet, verify it exists
        if (updateData.spriteSheet) {
            const spriteSheet = await SpriteSheet.findOne({
                sheetKey: updateData.spriteSheet
            });

            if (!spriteSheet) {
                return res.status(400).json({
                    error: 'Invalid sprite sheet',
                    message: `Sprite sheet "${updateData.spriteSheet}" not found`
                });
            }
        }

        const prop = await PropDefinition.findByIdAndUpdate(
            propId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!prop) {
            return res.status(404).json({ error: 'Prop not found' });
        }

        res.json(prop);
    } catch (error) {
        console.error('Error updating prop:', error);
        res.status(500).json({ error: 'Failed to update prop', message: error.message });
    }
});

// DELETE prop definition
router.delete('/props/:propId', async (req, res) => {
    try {
        const { propId } = req.params;

        const prop = await PropDefinition.findByIdAndDelete(propId);

        if (!prop) {
            return res.status(404).json({ error: 'Prop not found' });
        }

        res.json({ success: true, message: 'Prop deleted successfully' });
    } catch (error) {
        console.error('Error deleting prop:', error);
        res.status(500).json({ error: 'Failed to delete prop', message: error.message });
    }
});

// GET prop categories
router.get('/props/categories', async (req, res) => {
    try {
        const categories = await PropDefinition.distinct('category');
        res.json(categories.sort());
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
    }
});

module.exports = router;
