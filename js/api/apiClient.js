/**
 * API Client for MongoDB Backend
 * Handles all communication between frontend and backend server
 */
class APIClient {
    constructor() {
        // Determine API base URL based on environment
        this.baseURL = this.getBaseURL();
        this.currentGameId = null;
    }

    /**
     * Get base URL for API calls
     */
    getBaseURL() {
        // In production, this would be your deployed server URL
        // For development, it's localhost:3000
        const isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname === '';

        if (isDevelopment) {
            return 'http://localhost:3000/api';
        }

        // For production, use the same host as the frontend
        return `${window.location.protocol}//${window.location.host}/api`;
    }

    /**
     * Make HTTP request to API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Get list of all games
     */
    async getAllGames() {
        return await this.request('/games');
    }

    /**
     * Get a specific game by ID
     */
    async getGame(gameId) {
        return await this.request(`/games/${gameId}`);
    }

    /**
     * Create a new game
     */
    async createGame(name, description = '', gameData = null) {
        return await this.request('/games', {
            method: 'POST',
            body: JSON.stringify({ name, description, gameData })
        });
    }

    /**
     * Update game metadata (name, description)
     */
    async updateGameMetadata(gameId, name, description) {
        return await this.request(`/games/${gameId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description })
        });
    }

    /**
     * Save game data (auto-save)
     */
    async saveGameData(gameId, gameData) {
        return await this.request(`/games/${gameId}`, {
            method: 'PATCH',
            body: JSON.stringify({ gameData })
        });
    }

    /**
     * Delete a game
     */
    async deleteGame(gameId) {
        return await this.request(`/games/${gameId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Duplicate a game
     */
    async duplicateGame(gameId) {
        return await this.request(`/games/${gameId}/duplicate`, {
            method: 'POST'
        });
    }

    /**
     * Check server health
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * Set current game ID
     */
    setCurrentGameId(gameId) {
        this.currentGameId = gameId;
        if (gameId) {
            localStorage.setItem('currentGameId', gameId);
        } else {
            localStorage.removeItem('currentGameId');
        }
    }

    /**
     * Get current game ID
     */
    getCurrentGameId() {
        if (!this.currentGameId) {
            this.currentGameId = localStorage.getItem('currentGameId');
        }
        return this.currentGameId;
    }

    /**
     * Load current game data
     */
    async loadCurrentGame() {
        const gameId = this.getCurrentGameId();
        if (!gameId) {
            throw new Error('No game selected');
        }
        return await this.getGame(gameId);
    }

    /**
     * Save current game data
     */
    async saveCurrentGame(gameData) {
        const gameId = this.getCurrentGameId();
        if (!gameId) {
            throw new Error('No game selected');
        }
        return await this.saveGameData(gameId, gameData);
    }
}

// Create global instance
window.apiClient = new APIClient();
