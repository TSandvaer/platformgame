/**
 * Game Session Menu
 * Main menu for managing save slots/sessions in published games
 * Shows "New Game" and "Load Game" options
 */

class GameSessionMenu {
  constructor() {
    this.modal = null;
    this.gameTitle = '';
    this.gameId = null;
    this.hasExistingSessions = false;
    this.onNewGameCallback = null;
    this.onLoadGameCallback = null;
  }

  /**
   * Initialize the session menu
   * @param {string} gameTitle - Name of the game
   * @param {string} gameId - MongoDB game ID
   * @param {Function} onNewGame - Callback when "New Game" is clicked
   * @param {Function} onLoadGame - Callback when "Load Game" is clicked
   */
  async initialize(gameTitle, gameId, onNewGame, onLoadGame) {
    this.gameTitle = gameTitle;
    this.gameId = gameId;
    this.onNewGameCallback = onNewGame;
    this.onLoadGameCallback = onLoadGame;

    // Check if user has existing sessions
    await this.checkExistingSessions();

    // Create modal HTML
    this.createModal();
    this.setupEventListeners();
  }

  async checkExistingSessions() {
    try {
      const sessions = await window.sessionAPI.listSessions(this.gameId);
      this.hasExistingSessions = sessions && sessions.length > 0;
    } catch (error) {
      console.error('Error checking sessions:', error);
      this.hasExistingSessions = false;
    }
  }

  createModal() {
    const modalHTML = `
      <div id="sessionMenuModal" class="session-menu-modal">
        <div class="session-menu-content">
          <h1 class="session-menu-title">${this.gameTitle}</h1>
          <p class="session-menu-subtitle">Choose an option to continue</p>

          <div class="session-menu-buttons">
            <button class="session-btn session-btn-primary" id="newGameBtn">
              🎮 New Game
            </button>
            <button class="session-btn session-btn-secondary" id="loadGameBtn" ${!this.hasExistingSessions ? 'disabled' : ''}>
              📁 Load Game
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('sessionMenuModal');
  }

  setupEventListeners() {
    // New Game button
    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.hide();
      if (this.onNewGameCallback) {
        this.onNewGameCallback();
      }
    });

    // Load Game button
    document.getElementById('loadGameBtn').addEventListener('click', () => {
      if (this.hasExistingSessions) {
        this.hide();
        if (this.onLoadGameCallback) {
          this.onLoadGameCallback();
        }
      }
    });
  }

  show() {
    if (this.modal) {
      this.modal.classList.add('show');
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.remove('show');
    }
  }

  destroy() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  /**
   * Refresh the menu (re-check if sessions exist)
   */
  async refresh() {
    await this.checkExistingSessions();

    // Update Load Game button state
    const loadBtn = document.getElementById('loadGameBtn');
    if (loadBtn) {
      loadBtn.disabled = !this.hasExistingSessions;
    }
  }
}

// Export for use in play.html
window.GameSessionMenu = GameSessionMenu;
