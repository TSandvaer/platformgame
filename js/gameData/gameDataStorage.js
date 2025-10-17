class GameDataStorage {
    constructor(gameDataSystem) {
        this.dataSystem = gameDataSystem;
        this.game = gameDataSystem.game;
        this.storageKeyPrefix = 'platformGame_gameData';

        // Storage mode: 'mongodb' or 'localStorage'
        this.storageMode = 'mongodb'; // Default to MongoDB
        this.useLocalStorageFallback = true; // Use localStorage as fallback if API is unavailable

        // API client reference (will be set during initialization)
        this.apiClient = window.apiClient;
    }

    /**
     * Get the localStorage key for the current game
     * Each game gets its own localStorage cache
     */
    getStorageKey() {
        const gameId = this.apiClient?.getCurrentGameId();
        if (gameId) {
            return `${this.storageKeyPrefix}_${gameId}`;
        }
        // Fallback to generic key if no game selected
        return this.storageKeyPrefix;
    }

    initialize() {
        // Check for auto-save settings
        this.autoSaveEnabled = localStorage.getItem('platformGame_autoSave') !== 'false';
        this.autoSaveInterval = 60000; // Auto-save every minute
        this.initialAutoSaveDelay = 10000; // Wait 10 seconds before first auto-save (allow initialization)

        // Clean up any inconsistent legacy data
        this.cleanupLegacyData();

        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }
    }

    // Start auto-save timer
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        // Wait before starting auto-save to allow game initialization
        console.log('⏱️ Auto-save: Waiting', this.initialAutoSaveDelay / 1000, 'seconds before first auto-save...');

        setTimeout(() => {
            console.log('✅ Auto-save: Starting auto-save timer (saves every', this.autoSaveInterval / 1000, 'seconds)');

            this.autoSaveTimer = setInterval(() => {
                // CRITICAL: Check if game is ready before auto-saving
                if (!this.dataSystem.isReadyForAutoSave()) {
                    console.warn('⚠️ Auto-save: Skipping save - game not fully initialized');
                    return;
                }

                console.log('💾 Auto-save: Saving game data...');
                this.dataSystem.saveCurrentData();
                console.log('✅ Auto-save: Save complete');
            }, this.autoSaveInterval);
        }, this.initialAutoSaveDelay);
    }

    // Stop auto-save timer
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // Save game data (MongoDB or localStorage)
    async saveGameData(gameData) {
        if (this.storageMode === 'mongodb') {
            return await this.saveToMongoDB(gameData);
        } else {
            return this.saveToLocalStorage(gameData);
        }
    }

    // Save to MongoDB via API
    async saveToMongoDB(gameData) {
        try {
            if (!this.apiClient) {
                console.warn('⚠️ API client not available, falling back to localStorage');
                return this.saveToLocalStorage(gameData);
            }

            const gameId = this.apiClient.getCurrentGameId();
            if (!gameId) {
                console.error('❌ CRITICAL: No game ID found! Cannot save to MongoDB.');
                console.error('This should not happen. Please select a game from the game selector.');
                if (this.useLocalStorageFallback) {
                    return this.saveToLocalStorage(gameData);
                }
                return false;
            }

            console.log(`💾 Saving to MongoDB - Game ID: ${gameId}`);
            await this.apiClient.saveGameData(gameId, gameData);
            console.log(`✅ Game saved successfully - ID: ${gameId}`);

            // Also save to localStorage as backup
            if (this.useLocalStorageFallback) {
                this.saveToLocalStorage(gameData);
            }

            return true;
        } catch (error) {
            console.error('❌ Error saving to MongoDB:', error);

            // Fallback to localStorage
            if (this.useLocalStorageFallback) {
                console.log('⚠️ Falling back to localStorage');
                return this.saveToLocalStorage(gameData);
            }

            return false;
        }
    }

    // Save to localStorage
    saveToLocalStorage(gameData) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = JSON.stringify(gameData);
            localStorage.setItem(storageKey, dataStr);
            console.log(`💾 Saved to localStorage with key: ${storageKey}`);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please export your game data and clear some space.');
            }

            return false;
        }
    }

    // Update only the current scene ID in localStorage
    updateCurrentSceneId(currentSceneId) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.currentSceneId = currentSceneId;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            }
        } catch (error) {
            console.error('Error updating current scene ID in localStorage:', error);
        }
        return false;
    }

    // Update only the gameSettings in localStorage
    updateGameSettings(gameSettings) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.gameSettings = gameSettings;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            }
        } catch (error) {
            console.error('Error updating game settings in localStorage:', error);
        }
        return false;
    }

    // Update only the playerSettings in localStorage
    updatePlayerSettings(playerSettings) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.playerSettings = playerSettings;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            } else {
                console.warn('⚠️ Storage: No existing game data found in localStorage');
            }
        } catch (error) {
            console.error('❌ Storage: Error updating player settings in localStorage:', error);
        }
        return false;
    }

    // Update only the inventoryItems in localStorage
    updateInventoryItems(inventoryItems) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.inventoryItems = inventoryItems;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            }
        } catch (error) {
            console.error('Error updating inventory items in localStorage:', error);
        }
        return false;
    }

    // Update only the GUISettings in localStorage
    updateGUISettings(guiSettings) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.GUISettings = guiSettings;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            }
        } catch (error) {
            console.error('Error updating GUI settings in localStorage:', error);
        }
        return false;
    }

    // Update only the characterSettings in localStorage
    updateCharacterSettings(characterSettings) {
        try {
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.characterSettings = characterSettings;
                localStorage.setItem(storageKey, JSON.stringify(gameData));
                return true;
            } else {
                console.warn('⚠️ Storage: No existing game data found in localStorage');
            }
        } catch (error) {
            console.error('❌ Storage: Error updating character settings in localStorage:', error);
        }
        return false;
    }

    // Load game data (MongoDB or localStorage)
    async loadGameData() {
        if (this.storageMode === 'mongodb') {
            return await this.loadFromMongoDB();
        } else {
            return this.loadFromLocalStorage();
        }
    }

    // Load from MongoDB via API
    async loadFromMongoDB() {
        try {
            console.log('📥 Attempting to load from MongoDB...');

            if (!this.apiClient) {
                console.warn('⚠️ API client not available, falling back to localStorage');
                return this.loadFromLocalStorage();
            }

            const gameId = this.apiClient.getCurrentGameId();
            console.log(`📥 Current game ID: ${gameId}`);

            if (!gameId) {
                console.warn('⚠️ No game selected, cannot load from MongoDB');
                if (this.useLocalStorageFallback) {
                    return this.loadFromLocalStorage();
                }
                return null;
            }

            console.log(`📥 Fetching game from MongoDB: ${gameId}`);
            const response = await this.apiClient.getGame(gameId);

            if (response.success && response.game) {
                console.log('✅ Game loaded from MongoDB successfully');
                console.log(`   - Name: ${response.game.name}`);
                console.log(`   - Scenes: ${response.game.gameData?.scenes?.length || 0}`);

                // Also save to localStorage as cache
                if (this.useLocalStorageFallback) {
                    this.saveToLocalStorage(response.game.gameData);
                }

                return response.game.gameData;
            } else {
                console.error('❌ MongoDB response failed:', response);
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading from MongoDB:', error);

            // Fallback to localStorage
            if (this.useLocalStorageFallback) {
                console.log('⚠️ Falling back to localStorage');
                return this.loadFromLocalStorage();
            }

            return null;
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            // Load from the game-specific storage key
            const storageKey = this.getStorageKey();
            const dataStr = localStorage.getItem(storageKey);
            if (dataStr) {
                console.log(`📂 Loaded from localStorage with key: ${storageKey}`);
                const gameData = JSON.parse(dataStr);
                return gameData;
            }
            console.log(`📂 No data found in localStorage for key: ${storageKey}`);
            return null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    // Load from file
    async loadFromFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                return null;
            }

            const gameData = await response.json();
            return gameData;
        } catch (error) {
            console.error(`Error loading from file ${filePath}:`, error);
            return null;
        }
    }

    // Clear localStorage for current game
    clearLocalStorage() {
        try {
            const storageKey = this.getStorageKey();
            localStorage.removeItem(storageKey);
            console.log(`🗑️ Cleared localStorage for key: ${storageKey}`);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Clean up inconsistent legacy data
    cleanupLegacyData() {
        // Remove any remaining legacy scene data
        const legacySceneKey = 'platformGame_sceneData';
        if (localStorage.getItem(legacySceneKey)) {
            localStorage.removeItem(legacySceneKey);
            console.log('🗑️ Cleaned up legacy scene data');
        }

        // Also remove very old format if it exists
        const oldScenesKey = 'platformGame_scenes';
        if (localStorage.getItem(oldScenesKey)) {
            localStorage.removeItem(oldScenesKey);
            console.log('🗑️ Cleaned up old scenes data');
        }

        // Remove old non-game-specific storage key (before per-game keys)
        const oldGameDataKey = 'platformGame_gameData';
        if (localStorage.getItem(oldGameDataKey)) {
            localStorage.removeItem(oldGameDataKey);
            console.log('🗑️ Cleaned up old non-game-specific storage key');
        }
    }

    // Get storage size for current game
    getStorageSize() {
        let totalSize = 0;

        // Calculate size of current game's storage key
        const storageKey = this.getStorageKey();
        const item = localStorage.getItem(storageKey);
        if (item) {
            totalSize += item.length;
        }

        // Return size in KB
        return Math.round(totalSize / 1024 * 100) / 100;
    }

    // Check if storage is available
    isStorageAvailable() {
        try {
            const testKey = 'platformGame_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Create backup for current game
    createBackup(gameData) {
        const timestamp = new Date().getTime();
        const storageKey = this.getStorageKey();
        const backupKey = `${storageKey}_backup_${timestamp}`;

        try {
            localStorage.setItem(backupKey, JSON.stringify(gameData));
            // Keep only the last 3 backups for this game
            this.cleanOldBackups();

            return backupKey;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    // Clean old backups for current game
    cleanOldBackups() {
        const storageKey = this.getStorageKey();
        const backupPrefix = `${storageKey}_backup_`;
        const backups = [];

        // Find all backups for current game
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(backupPrefix)) {
                const timestamp = parseInt(key.replace(backupPrefix, ''));
                backups.push({ key, timestamp });
            }
        }

        // Sort by timestamp (newest first)
        backups.sort((a, b) => b.timestamp - a.timestamp);

        // Remove old backups (keep only 3)
        for (let i = 3; i < backups.length; i++) {
            localStorage.removeItem(backups[i].key);
        }
    }

    // Restore from backup
    restoreBackup(backupKey) {
        try {
            const dataStr = localStorage.getItem(backupKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                return gameData;
            }
            return null;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return null;
        }
    }

    // List available backups for current game
    listBackups() {
        const storageKey = this.getStorageKey();
        const backupPrefix = `${storageKey}_backup_`;
        const backups = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(backupPrefix)) {
                const timestamp = parseInt(key.replace(backupPrefix, ''));
                const date = new Date(timestamp);
                backups.push({
                    key,
                    timestamp,
                    date: date.toLocaleString()
                });
            }
        }

        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }
}