/**
 * Game Selector UI
 * Allows users to select, create, and manage multiple games
 */
class GameSelector {
    constructor() {
        this.apiClient = window.apiClient;
        this.games = [];
        this.selectedGameId = null;
        this.modal = null;
        this.renamingGameId = null; // Track which game is being renamed
        this.mouseDownTarget = null; // Track where mousedown started for proper click-outside detection
    }

    /**
     * Initialize the game selector
     */
    initialize() {
        this.createModal();
        this.setupEventListeners();

        // Update current game indicator on load
        setTimeout(() => {
            this.updateCurrentGameIndicator();
        }, 1000);
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        // Create modal overlay
        const modalHTML = `
            <div id="game-selector-modal" class="game-selector-modal" style="display: none;">
                <div class="game-selector-content">
                    <div class="game-selector-header">
                        <h2>Select Game</h2>
                        <button class="close-btn" onclick="gameSelector.close()">&times;</button>
                    </div>

                    <div class="game-selector-body">
                        <div class="game-selector-actions">
                            <button class="btn-primary" onclick="gameSelector.showCreateGameForm()">
                                + Create New Game
                            </button>
                            <button class="btn-secondary" onclick="gameSelector.refresh()">
                                Refresh
                            </button>
                        </div>

                        <div id="game-list-container" class="game-list-container">
                            <div class="loading-message">Loading games...</div>
                        </div>

                        <div id="create-game-form" class="create-game-form" style="display: none;">
                            <h3>Create New Game</h3>
                            <div class="form-group">
                                <label for="new-game-name">Game Name:</label>
                                <input type="text" id="new-game-name" placeholder="Enter game name..." />
                            </div>
                            <div class="form-group">
                                <label for="new-game-description">Description (optional):</label>
                                <textarea id="new-game-description" placeholder="Enter game description..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="copy-current-data" />
                                    Copy current game data to new game
                                </label>
                            </div>
                            <div class="form-actions">
                                <button class="btn-primary" onclick="gameSelector.createGame()">Create</button>
                                <button class="btn-secondary" onclick="gameSelector.hideCreateGameForm()">Cancel</button>
                            </div>
                        </div>

                        <div id="rename-game-form" class="create-game-form" style="display: none;">
                            <h3>Rename Game</h3>
                            <div class="form-group">
                                <label for="rename-game-name">Game Name:</label>
                                <input type="text" id="rename-game-name" placeholder="Enter new game name..." />
                            </div>
                            <div class="form-group">
                                <label for="rename-game-description">Description (optional):</label>
                                <textarea id="rename-game-description" placeholder="Enter game description..."></textarea>
                            </div>
                            <div class="form-actions">
                                <button class="btn-primary" onclick="gameSelector.submitRenameGame()">Rename</button>
                                <button class="btn-secondary" onclick="gameSelector.hideRenameGameForm()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('game-selector-modal');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close modal when clicking outside - track mousedown and mouseup to prevent closing during text selection drag
        this.modal.addEventListener('mousedown', (e) => {
            this.mouseDownTarget = e.target;
        });

        this.modal.addEventListener('mouseup', (e) => {
            // Only close if both mousedown and mouseup happened on the modal overlay
            if (e.target === this.modal && this.mouseDownTarget === this.modal) {
                this.close();
            }
            this.mouseDownTarget = null;
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    /**
     * Open the game selector modal
     */
    async open() {
        // Defensive check: if modal doesn't exist yet, initialize first
        if (!this.modal) {
            console.warn('⚠️ Game selector not initialized, initializing now...');
            this.createModal();
            this.setupEventListeners();
        }

        this.modal.style.display = 'block';
        await this.loadGames();
    }

    /**
     * Close the game selector modal
     */
    close() {
        this.modal.style.display = 'none';
        this.hideCreateGameForm();
        this.hideRenameGameForm();
    }

    /**
     * Refresh the game list
     */
    async refresh() {
        await this.loadGames();
    }

    /**
     * Load all games from API
     */
    async loadGames() {
        const container = document.getElementById('game-list-container');
        container.innerHTML = '<div class="loading-message">Loading games...</div>';

        try {
            const response = await this.apiClient.getAllGames();

            if (response.success && response.games) {
                this.games = response.games;
                this.renderGameList();
            } else {
                container.innerHTML = '<div class="error-message">Failed to load games</div>';
            }
        } catch (error) {
            console.error('Error loading games:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Cannot connect to server</p>
                    <p class="error-details">${error.message}</p>
                    <p class="error-hint">Make sure the server is running with: npm start</p>
                </div>
            `;
        }
    }

    /**
     * Render the list of games
     */
    renderGameList() {
        const container = document.getElementById('game-list-container');
        const currentGameId = this.apiClient.getCurrentGameId();

        if (this.games.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <p>No games found</p>
                    <p>Create your first game to get started</p>
                </div>
            `;
            return;
        }

        const gamesHTML = this.games.map(game => {
            const isSelected = game.id === currentGameId;
            const lastModified = new Date(game.updatedAt).toLocaleDateString();

            return `
                <div class="game-item ${isSelected ? 'selected' : ''}" data-game-id="${game.id}">
                    <div class="game-info">
                        <h3>${this.escapeHTML(game.name)}</h3>
                        ${game.description ? `<p class="game-description">${this.escapeHTML(game.description)}</p>` : ''}
                        <div class="game-meta">
                            <span class="scene-count">${game.sceneCount || 0} scenes</span>
                            <span class="last-modified">Modified: ${lastModified}</span>
                        </div>
                    </div>
                    <div class="game-actions">
                        <button class="btn-select ${isSelected ? 'selected' : ''}"
                                onclick="gameSelector.selectGame('${game.id}')"
                                ${isSelected ? 'disabled' : ''}>
                            ${isSelected ? 'Current' : 'Select'}
                        </button>
                        <button class="btn-rename" onclick="gameSelector.showRenameGameForm('${game.id}')"
                                title="Rename game">
                            Rename
                        </button>
                        <button class="btn-duplicate" onclick="gameSelector.duplicateGame('${game.id}')"
                                title="Duplicate game">
                            Copy
                        </button>
                        <button class="btn-delete" onclick="gameSelector.deleteGame('${game.id}')"
                                title="Delete game">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="game-list">${gamesHTML}</div>`;
    }

    /**
     * Show create game form
     */
    showCreateGameForm() {
        this.hideRenameGameForm(); // Hide rename form if open
        document.getElementById('create-game-form').style.display = 'block';
        document.getElementById('game-list-container').style.display = 'none';
        document.getElementById('new-game-name').focus();
    }

    /**
     * Hide create game form
     */
    hideCreateGameForm() {
        document.getElementById('create-game-form').style.display = 'none';
        document.getElementById('game-list-container').style.display = 'block';

        // Clear form
        document.getElementById('new-game-name').value = '';
        document.getElementById('new-game-description').value = '';
        document.getElementById('copy-current-data').checked = false;
    }

    /**
     * Create a new game
     */
    async createGame() {
        const name = document.getElementById('new-game-name').value.trim();
        const description = document.getElementById('new-game-description').value.trim();
        const copyCurrentData = document.getElementById('copy-current-data').checked;

        if (!name) {
            alert('Please enter a game name');
            return;
        }

        try {
            let gameData = null;

            if (copyCurrentData && window.game && window.game.gameDataSystem) {
                gameData = window.game.gameDataSystem.collectCurrentGameData();
            }

            const response = await this.apiClient.createGame(name, description, gameData);

            if (response.success) {
                // ALWAYS set the current game ID to the newly created game
                // This ensures subsequent saves go to the correct game
                this.apiClient.setCurrentGameId(response.game.id);

                alert('Game created successfully!');
                this.hideCreateGameForm();
                await this.loadGames();

                // Ask if they want to reload to load the new game
                if (confirm('Switch to the new game now? (Page will reload)')) {
                    window.location.reload();
                } else {
                    // Update the indicator to show we're now editing the new game
                    this.updateCurrentGameIndicator(response.game.id);
                    alert('Now editing: ' + response.game.name + '\n\nYou may want to reload the page to see the new game\'s data.');
                }
            } else {
                alert('Failed to create game: ' + response.error);
            }
        } catch (error) {
            console.error('Error creating game:', error);
            alert('Error creating game: ' + error.message);
        }
    }

    /**
     * Select a game to edit
     */
    async selectGame(gameId) {
        if (confirm('Switch to this game? Any unsaved changes will be lost.')) {
            try {
                // Set the current game ID
                this.apiClient.setCurrentGameId(gameId);

                // Update the UI indicator
                this.updateCurrentGameIndicator(gameId);

                // Reload the page to load the new game
                window.location.reload();
            } catch (error) {
                console.error('Error selecting game:', error);
                alert('Error selecting game: ' + error.message);
            }
        }
    }

    /**
     * Update the current game indicator in the UI
     */
    async updateCurrentGameIndicator(gameId = null) {
        const indicator = document.getElementById('currentGameIndicator');
        if (!indicator) return;

        const currentGameId = gameId || this.apiClient.getCurrentGameId();

        if (!currentGameId) {
            indicator.style.display = 'none';
            return;
        }

        try {
            const response = await this.apiClient.getGame(currentGameId);
            if (response.success && response.game) {
                indicator.innerHTML = `Currently editing <span style="color: #4a90e2; font-weight: 500;">${this.escapeHTML(response.game.name)}</span>`;
                indicator.style.display = 'inline';
                indicator.title = `Game ID: ${currentGameId}`;
            }
        } catch (error) {
            console.error('Error loading game name:', error);
            indicator.innerHTML = `Currently editing <span style="color: #4a90e2; font-weight: 500;">Game ID: ${currentGameId.substring(0, 8)}...</span>`;
            indicator.style.display = 'inline';
        }
    }

    /**
     * Duplicate a game
     */
    async duplicateGame(gameId) {
        if (confirm('Create a copy of this game?')) {
            try {
                const response = await this.apiClient.duplicateGame(gameId);

                if (response.success) {
                    alert('Game duplicated successfully!');
                    await this.loadGames();
                } else {
                    alert('Failed to duplicate game: ' + response.error);
                }
            } catch (error) {
                console.error('Error duplicating game:', error);
                alert('Error duplicating game: ' + error.message);
            }
        }
    }

    /**
     * Delete a game
     */
    async deleteGame(gameId) {
        const currentGameId = this.apiClient.getCurrentGameId();

        if (gameId === currentGameId) {
            alert('Cannot delete the currently active game. Switch to another game first.');
            return;
        }

        if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
            try {
                const response = await this.apiClient.deleteGame(gameId);

                if (response.success) {
                    alert('Game deleted successfully!');
                    await this.loadGames();
                } else {
                    alert('Failed to delete game: ' + response.error);
                }
            } catch (error) {
                console.error('Error deleting game:', error);
                alert('Error deleting game: ' + error.message);
            }
        }
    }

    /**
     * Show rename game form
     */
    async showRenameGameForm(gameId) {
        this.hideCreateGameForm(); // Hide create form if open

        // Find the game in the list
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
            alert('Game not found');
            return;
        }

        // Store the game ID being renamed
        this.renamingGameId = gameId;

        // Populate the form with current values
        document.getElementById('rename-game-name').value = game.name;
        document.getElementById('rename-game-description').value = game.description || '';

        // Show the rename form
        document.getElementById('rename-game-form').style.display = 'block';
        document.getElementById('game-list-container').style.display = 'none';
        document.getElementById('rename-game-name').focus();
        document.getElementById('rename-game-name').select();
    }

    /**
     * Hide rename game form
     */
    hideRenameGameForm() {
        document.getElementById('rename-game-form').style.display = 'none';
        document.getElementById('game-list-container').style.display = 'block';

        // Clear form
        document.getElementById('rename-game-name').value = '';
        document.getElementById('rename-game-description').value = '';
        this.renamingGameId = null;
    }

    /**
     * Submit rename game
     */
    async submitRenameGame() {
        if (!this.renamingGameId) {
            alert('No game selected for renaming');
            return;
        }

        const name = document.getElementById('rename-game-name').value.trim();
        const description = document.getElementById('rename-game-description').value.trim();

        if (!name) {
            alert('Please enter a game name');
            return;
        }

        try {
            const response = await this.apiClient.updateGameMetadata(this.renamingGameId, name, description);

            if (response.success) {
                alert('Game renamed successfully!');
                this.hideRenameGameForm();
                await this.loadGames();

                // Update the current game indicator if we renamed the active game
                const currentGameId = this.apiClient.getCurrentGameId();
                if (this.renamingGameId === currentGameId) {
                    this.updateCurrentGameIndicator(currentGameId);
                }
            } else {
                alert('Failed to rename game: ' + response.error);
            }
        } catch (error) {
            console.error('Error renaming game:', error);
            alert('Error renaming game: ' + error.message);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Check if a game is selected and valid, if not, show the selector
     */
    async checkAndPromptGameSelection() {
        const currentGameId = this.apiClient.getCurrentGameId();

        if (!currentGameId) {
            console.log('No game selected, showing game selector...');
            await this.open();
            return false;
        }

        // Verify the game actually exists in MongoDB
        try {
            const response = await this.apiClient.getGame(currentGameId);
            if (!response.success || !response.game) {
                console.warn(`⚠️ Game ID ${currentGameId} not found in database, clearing and showing selector...`);
                // Clear invalid game ID
                this.apiClient.setCurrentGameId(null);
                await this.open();
                return false;
            }
            console.log(`✅ Valid game selected: ${response.game.name}`);
            return true;
        } catch (error) {
            console.error('Error verifying game:', error);
            // Clear invalid game ID on error
            this.apiClient.setCurrentGameId(null);
            await this.open();
            return false;
        }
    }
}

// Create global instance
window.gameSelector = new GameSelector();
