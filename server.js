const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Firebase Admin SDK
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Initialize Firebase (with error handling)
try {
  initializeFirebase();
} catch (error) {
  console.warn('⚠ Firebase initialization skipped:', error.message);
  console.warn('  Please configure Firebase credentials in .env to enable authentication');
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for large game data
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

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
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/playerProgress');
const sessionRoutes = require('./routes/gameSessions');
const path = require('path');

// API Routes (must come before static file middleware)
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Player routes - serve play.html for game URLs
app.get('/play/:username/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'play.html'));
});

// Gallery route - serve gallery.html
app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

// Serve static files (AFTER routes so routes take priority)
app.use(express.static(__dirname));

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
    console.log(`✓ Game Editor available at http://localhost:${PORT}/index.html`);
    console.log(`✓ User API at http://localhost:${PORT}/api/users`);
    console.log(`✓ Game API at http://localhost:${PORT}/api/games`);
});

module.exports = app;
