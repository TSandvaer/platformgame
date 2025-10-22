const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Initialize Firebase Admin SDK
const { initializeFirebase } = require('./config/firebase');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your actual domain
    methods: ['GET', 'POST']
  }
});

// Initialize Firebase (with error handling)
try {
  initializeFirebase();
} catch (error) {
  console.warn('⚠ Firebase initialization skipped:', error.message);
  console.warn('  Please configure Firebase credentials in .env to enable authentication');
}

// Middleware
app.use(cors());

// Compression middleware (gzip/deflate) - reduces file sizes by 60-70%
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9, 6 is good balance)
}));

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
// Files are automatically compressed via compression middleware
app.use(express.static(__dirname));

// Socket.IO Configuration for Real-Time Game Data Sync
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join a game room when user opens a game
    socket.on('join-game', (gameId) => {
        socket.join(`game:${gameId}`);
        console.log(`📥 Socket ${socket.id} joined game room: ${gameId}`);
        socket.gameId = gameId; // Store gameId on socket for later use
    });

    // Leave a game room
    socket.on('leave-game', (gameId) => {
        socket.leave(`game:${gameId}`);
        console.log(`📤 Socket ${socket.id} left game room: ${gameId}`);
    });

    // When a client saves game data, notify all other clients in the same game room
    socket.on('save-game-data', (data) => {
        const { gameId, userId, userName } = data;
        console.log(`💾 Game ${gameId} saved by ${userName || userId}, broadcasting to room...`);

        // Broadcast to all other clients in this game's room (except the sender)
        socket.to(`game:${gameId}`).emit('game-data-updated', {
            gameId,
            updatedBy: userName || userId || 'Unknown',
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        if (socket.gameId) {
            console.log(`  - Was in game room: ${socket.gameId}`);
        }
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

// Start server (use server instead of app to support Socket.IO)
server.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ WebSocket server ready for real-time sync`);
    console.log(`✓ Game Editor available at http://localhost:${PORT}/index.html`);
    console.log(`✓ User API at http://localhost:${PORT}/api/users`);
    console.log(`✓ Game API at http://localhost:${PORT}/api/games`);
});

module.exports = { app, server, io };
