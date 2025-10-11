class PlayerDataStorage {
    constructor() {
        this.storageKey = 'platformGame_playerData';
    }

    // Save player data to localStorage
    save(playerData) {
        try {
            const dataToSave = {
                playerInventory: playerData.playerInventory || [],
                lastSaved: new Date().toISOString()
            };

            const dataStr = JSON.stringify(dataToSave);
            localStorage.setItem(this.storageKey, dataStr);
            return true;
        } catch (error) {
            console.error('❌ Error saving player data:', error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Player data could not be saved.');
            }

            return false;
        }
    }

    // Load player data from localStorage
    load() {
        try {
            const dataStr = localStorage.getItem(this.storageKey);
            if (dataStr) {
                const playerData = JSON.parse(dataStr);
                return playerData;
            }
            return null;
        } catch (error) {
            console.error('❌ Error loading player data:', error);
            return null;
        }
    }

    // Clear player data from localStorage
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('❌ Error clearing player data:', error);
            return false;
        }
    }

    // Check if localStorage is available
    isAvailable() {
        try {
            const testKey = 'platformGame_test_playerData';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get storage size for player data
    getStorageSize() {
        try {
            const item = localStorage.getItem(this.storageKey);
            if (item) {
                // Return size in KB
                return Math.round(item.length / 1024 * 100) / 100;
            }
            return 0;
        } catch (error) {
            console.error('❌ Error getting storage size:', error);
            return 0;
        }
    }

    // Update only the player inventory without affecting other data
    updateInventory(playerInventory) {
        try {
            // Load existing data or create new
            const existingData = this.load() || {};

            // Update inventory
            existingData.playerInventory = playerInventory || [];
            existingData.lastSaved = new Date().toISOString();

            // Save back
            const dataStr = JSON.stringify(existingData);
            localStorage.setItem(this.storageKey, dataStr);
            return true;
        } catch (error) {
            console.error('❌ Error updating player inventory:', error);
            return false;
        }
    }
}