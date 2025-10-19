/**
 * Session API Client
 * Handles communication with game session endpoints
 * Manages multiple save slots per player per game
 */

class SessionAPI {
  constructor() {
    this.baseURL = this.getBaseURL();
  }

  /**
   * Get base URL for API calls based on environment
   */
  getBaseURL() {
    const isDevelopment = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '';

    if (isDevelopment) {
      return 'http://localhost:3000/api/sessions';
    }

    // For production, use the same host as the frontend
    return `${window.location.protocol}//${window.location.host}/api/sessions`;
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
   * List all sessions for a game
   * @param {string} gameId - MongoDB game ID
   * @returns {Promise<Array>} Array of sessions
   */
  async listSessions(gameId) {
    try {
      const response = await fetch(`${this.baseURL}/${gameId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load sessions');
      }

      console.log(`✅ Loaded ${data.sessions.length} sessions`);
      return data.sessions;
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      throw error;
    }
  }

  /**
   * Create a new session
   * @param {string} gameId - MongoDB game ID
   * @param {string} sessionName - Name for the session (1-30 chars)
   * @param {string} selectedCharacter - Character key (e.g., 'soldier', 'wizard')
   * @returns {Promise<Object>} Created session data
   */
  async createSession(gameId, sessionName, selectedCharacter) {
    try {
      const response = await fetch(`${this.baseURL}/${gameId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sessionName,
          selectedCharacter,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session');
      }

      console.log('✅ Session created:', data.session.sessionName);
      return data.session;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  /**
   * Load a specific session's data
   * @param {string} gameId - MongoDB game ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session data with full progress
   */
  async loadSession(gameId, sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${gameId}/${sessionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load session');
      }

      console.log('✅ Session loaded:', data.session.sessionName);
      return data.session;
    } catch (error) {
      console.error('❌ Error loading session:', error);
      throw error;
    }
  }

  /**
   * Save session progress
   * @param {string} gameId - MongoDB game ID
   * @param {string} sessionId - Session ID
   * @param {Object} progressData - Progress data to save
   * @returns {Promise<Object>} Save response
   */
  async saveSessionProgress(gameId, sessionId, progressData) {
    try {
      const response = await fetch(`${this.baseURL}/${gameId}/${sessionId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(progressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save progress');
      }

      return data;
    } catch (error) {
      console.error('❌ Error saving session progress:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param {string} gameId - MongoDB game ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteSession(gameId, sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${gameId}/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete session');
      }

      console.log('✅ Session deleted');
      return data;
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      throw error;
    }
  }
}

// Create global instance
window.sessionAPI = new SessionAPI();
