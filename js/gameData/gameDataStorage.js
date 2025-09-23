class GameDataStorage {
    constructor(gameDataSystem) {
        this.dataSystem = gameDataSystem;
        this.game = gameDataSystem.game;
        this.storageKey = 'platformGame_gameData';
    }

    initialize() {
        // Check for auto-save settings
        this.autoSaveEnabled = localStorage.getItem('platformGame_autoSave') !== 'false';
        this.autoSaveInterval = 60000; // Auto-save every minute

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

        this.autoSaveTimer = setInterval(() => {
            this.dataSystem.saveCurrentData();
        }, this.autoSaveInterval);
    }

    // Stop auto-save timer
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // Save to localStorage
    saveToLocalStorage(gameData) {
        try {
            const dataStr = JSON.stringify(gameData);
            localStorage.setItem(this.storageKey, dataStr);
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
            const dataStr = localStorage.getItem(this.storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                gameData.currentSceneId = currentSceneId;
                localStorage.setItem(this.storageKey, JSON.stringify(gameData));
                return true;
            }
        } catch (error) {
            console.error('Error updating current scene ID in localStorage:', error);
        }
        return false;
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            // Load from the main storage key
            const dataStr = localStorage.getItem(this.storageKey);
            if (dataStr) {
                const gameData = JSON.parse(dataStr);
                console.log('📂 Data structure:', {
                    hasScenes: !!gameData.scenes,
                    sceneCount: gameData.scenes?.length || 0,
                    currentSceneId: gameData.currentSceneId,
                    startSceneId: gameData.startSceneId
                });
                return gameData;
            }
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
                console.log(`File ${filePath} not found or not accessible`);
                return null;
            }

            const gameData = await response.json();
            return gameData;
        } catch (error) {
            console.error(`Error loading from file ${filePath}:`, error);
            return null;
        }
    }

    // Clear localStorage
    clearLocalStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.sceneStorageKey);
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
        }

        // Also remove very old format if it exists
        const oldScenesKey = 'platformGame_scenes';
        if (localStorage.getItem(oldScenesKey)) {
            localStorage.removeItem(oldScenesKey);
        }
    }

    // Get storage size
    getStorageSize() {
        let totalSize = 0;

        // Calculate size of our storage key
        const item = localStorage.getItem(this.storageKey);
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

    // Create backup
    createBackup(gameData) {
        const timestamp = new Date().getTime();
        const backupKey = `${this.storageKey}_backup_${timestamp}`;

        try {
            localStorage.setItem(backupKey, JSON.stringify(gameData));
            // Keep only the last 3 backups
            this.cleanOldBackups();

            return backupKey;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    // Clean old backups
    cleanOldBackups() {
        const backupPrefix = `${this.storageKey}_backup_`;
        const backups = [];

        // Find all backups
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

    // List available backups
    listBackups() {
        const backupPrefix = `${this.storageKey}_backup_`;
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