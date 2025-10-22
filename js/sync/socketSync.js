/**
 * Socket.IO Client for Real-Time Game Data Synchronization
 * Handles WebSocket connection and multi-tab sync
 */
class SocketSync {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentGameId = null;
        this.onRemoteUpdateCallback = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Initialize Socket.IO connection
     */
    initialize() {
        // Determine server URL based on environment
        const serverURL = this.getServerURL();

        console.log('🔌 Initializing Socket.IO client...');
        console.log('📍 Server URL:', serverURL);

        // Connect to Socket.IO server
        this.socket = io(serverURL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Get server URL for Socket.IO connection
     */
    getServerURL() {
        const isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname === '';

        if (isDevelopment) {
            return 'http://localhost:3000';
        }

        // For production, use the same host as the frontend
        return `${window.location.protocol}//${window.location.host}`;
    }

    /**
     * Set up Socket.IO event listeners
     */
    setupEventListeners() {
        // Connection established
        this.socket.on('connect', () => {
            console.log('✅ Socket.IO connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Rejoin game room if we were in one
            if (this.currentGameId) {
                this.joinGame(this.currentGameId);
            }
        });

        // Connection lost
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected us, manually reconnect
                this.socket.connect();
            }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}...`);
            this.reconnectAttempts = attemptNumber;
        });

        // Reconnection successful
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconnected after ${attemptNumber} attempts`);
            this.reconnectAttempts = 0;
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect to Socket.IO server');
            this.showNotification('Connection lost. Please refresh the page.', 'error');
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error.message);
        });

        // Game data updated by another tab/user
        this.socket.on('game-data-updated', (data) => {
            console.log('📥 Game data updated remotely:', data);
            const { gameId, updatedBy, timestamp } = data;

            // Show notification to user
            this.showNotification(`Game updated by ${updatedBy}`, 'info');

            // Trigger reload callback if registered
            if (this.onRemoteUpdateCallback) {
                this.onRemoteUpdateCallback(gameId, updatedBy, timestamp);
            }
        });
    }

    /**
     * Join a game room
     */
    joinGame(gameId) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Socket not connected, cannot join game room');
            return;
        }

        // Leave current game room if any
        if (this.currentGameId && this.currentGameId !== gameId) {
            this.leaveGame(this.currentGameId);
        }

        console.log(`📥 Joining game room: ${gameId}`);
        this.socket.emit('join-game', gameId);
        this.currentGameId = gameId;
    }

    /**
     * Leave a game room
     */
    leaveGame(gameId) {
        if (!this.socket) return;

        console.log(`📤 Leaving game room: ${gameId}`);
        this.socket.emit('leave-game', gameId);

        if (this.currentGameId === gameId) {
            this.currentGameId = null;
        }
    }

    /**
     * Notify server that we saved game data
     */
    notifySave(gameId) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Socket not connected, cannot notify save');
            return;
        }

        // Get user info from auth system
        const userId = window.authSystem?.currentUser?.uid || 'Unknown';
        const userName = window.authSystem?.currentUser?.displayName ||
                        window.authSystem?.currentUser?.email ||
                        'Unknown User';

        console.log(`💾 Notifying server of save for game: ${gameId}`);
        this.socket.emit('save-game-data', {
            gameId,
            userId,
            userName
        });
    }

    /**
     * Register callback for remote updates
     */
    onRemoteUpdate(callback) {
        this.onRemoteUpdateCallback = callback;
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notificationContainer = document.getElementById('sync-notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'sync-notification-container';
            notificationContainer.className = 'sync-notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `sync-notification sync-notification-${type}`;

        // Add icon based on type
        const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : '🔄';
        notification.innerHTML = `
            <span class="sync-notification-icon">${icon}</span>
            <span class="sync-notification-message">${message}</span>
        `;

        notificationContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('sync-notification-show');
        }, 10);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('sync-notification-show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting Socket.IO...');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentGameId = null;
        }
    }

    /**
     * Check if connected to Socket.IO server
     */
    isSocketConnected() {
        return this.socket && this.isConnected;
    }
}

// Create global instance
window.socketSync = new SocketSync();
