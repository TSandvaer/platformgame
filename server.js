const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for large game data
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (your game frontend)
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✓ Connected to MongoDB Atlas');
    console.log(`✓ Database: ${mongoose.connection.name}`);
})
.catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
});

// Import routes
const gameRoutes = require('./routes/games');

// API Routes
app.use('/api/games', gameRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ Game available at http://localhost:${PORT}/index.html`);
});

module.exports = app;
