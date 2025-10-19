/**
 * Progress API Client
 * Handles saving and loading player progress to/from server
 * Requires authentication to prevent cheating
 */

class ProgressAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/progress';
    this.currentGameId = null;
    this.currentSessionId = null; // For session-based saves
    this.autoSaveInterval = null;
    this.lastSaveTime = null;
  }

  /**
   * Set the current game ID
   * @param {string} gameId - MongoDB game ID
   */
  setGameId(gameId) {
    this.currentGameId = gameId;
  }

  /**
   * Set the current session ID (for session-based saves)
   * @param {string} sessionId - Session ID
   */
  setSessionId(sessionId) {
    this.currentSessionId = sessionId;
    console.log('📁 Progress API now using session:', sessionId);
  }

  /**
   * Get auth headers with Firebase token
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Load player progress from server
   * @returns {Promise<Object>} Player progress data
   */
  async loadProgress() {
    if (!this.currentGameId) {
      throw new Error('Game ID not set');
    }

    try {
      const response = await fetch(`${this.baseURL}/${this.currentGameId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load progress');
      }

      console.log('✅ Progress loaded from server:', data.progress);
      return data.progress;
    } catch (error) {
      console.error('❌ Error loading progress:', error);
      throw error;
    }
  }

  /**
   * Save player progress to server
   * If sessionId is set, saves to session endpoint
   * Otherwise, saves to legacy progress endpoint
   * @param {Object} progressData - Progress data to save
   * @returns {Promise<Object>} Save response
   */
  async saveProgress(progressData) {
    if (!this.currentGameId) {
      throw new Error('Game ID not set');
    }

    // If we have a session ID, delegate to sessionAPI
    if (this.currentSessionId && window.sessionAPI) {
      try {
        const result = await window.sessionAPI.saveSessionProgress(
          this.currentGameId,
          this.currentSessionId,
          progressData
        );
        this.lastSaveTime = new Date();
        console.log('💾 Progress saved to session');
        return result;
      } catch (error) {
        console.error('❌ Error saving session progress:', error);
        throw error;
      }
    }

    // Legacy save (no session)
    try {
      const response = await fetch(`${this.baseURL}/${this.currentGameId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(progressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save progress');
      }

      this.lastSaveTime = new Date(data.lastSaved);
      console.log('💾 Progress saved to server (legacy)');
      return data;
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      throw error;
    }
  }

  /**
   * Reset player progress (start over)
   * @returns {Promise<Object>} Reset response
   */
  async resetProgress() {
    if (!this.currentGameId) {
      throw new Error('Game ID not set');
    }

    if (!confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/${this.currentGameId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset progress');
      }

      console.log('🔄 Progress reset');
      return data;
    } catch (error) {
      console.error('❌ Error resetting progress:', error);
      throw error;
    }
  }

  /**
   * Get player statistics
   * @returns {Promise<Object>} Player stats
   */
  async getStats() {
    if (!this.currentGameId) {
      throw new Error('Game ID not set');
    }

    try {
      const response = await fetch(`${this.baseURL}/${this.currentGameId}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats');
      }

      return data.stats;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Enable auto-save every X seconds
   * @param {number} intervalSeconds - How often to auto-save (default: 30 seconds)
   * @param {Function} getProgressDataFn - Function that returns current progress data
   */
  enableAutoSave(intervalSeconds = 30, getProgressDataFn) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        const progressData = getProgressDataFn();
        await this.saveProgress(progressData);

        // Show notification
        if (window.game && window.game.editorSystem && window.game.editorSystem.ui) {
          window.game.editorSystem.ui.showTemporaryMessage('Progress auto-saved');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalSeconds * 1000);

    console.log(`⏱️ Auto-save enabled (every ${intervalSeconds} seconds)`);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏱️ Auto-save disabled');
    }
  }

  /**
   * Get time since last save
   * @returns {string} Human-readable time string
   */
  getTimeSinceLastSave() {
    if (!this.lastSaveTime) {
      return 'Never';
    }

    const now = new Date();
    const diff = now - this.lastSaveTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return `${seconds}s ago`;
    }
  }
}

// Create global instance
window.progressAPI = new ProgressAPI();
