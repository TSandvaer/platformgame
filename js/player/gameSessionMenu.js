/**
 * Game Session Menu
 * Main menu for managing save slots/sessions in published games
 * Shows "New Game" and "Load Game" options
 * Includes inline session creation on same blurred background
 */

class GameSessionMenu {
  constructor() {
    this.modal = null;
    this.gameTitle = '';
    this.gameId = null;
    this.gameData = null;
    this.hasExistingSessions = false;
    this.onLoadGameCallback = null;
    this.onSessionCreatedCallback = null;
    this.onSessionLoadedCallback = null;
    this.onSessionDeletedCallback = null;

    // Session creation state
    this.sessionName = '';
    this.selectedCharacter = null;
    this.currentView = 'menu'; // 'menu', 'create-name', 'create-character', 'load-sessions'
    this.sessions = [];
  }

  /**
   * Initialize the session menu
   * @param {string} gameTitle - Name of the game
   * @param {string} gameId - MongoDB game ID
   * @param {Function} onSessionCreated - Callback when session is created
   * @param {Function} onSessionLoaded - Callback when session is loaded
   * @param {Function} onSessionDeleted - Callback when session is deleted (optional)
   * @param {string} gameDescription - Description of the game (optional)
   * @param {Object} gameData - Full game data including characterSettings (optional)
   */
  async initialize(gameTitle, gameId, onSessionCreated, onSessionLoaded, onSessionDeleted = null, gameDescription = '', gameData = null) {
    this.gameTitle = gameTitle;
    this.gameId = gameId;
    this.gameData = gameData;
    this.gameDescription = gameDescription || 'Start your adventure in this exciting game';
    this.onSessionCreatedCallback = onSessionCreated;
    this.onSessionLoadedCallback = onSessionLoaded;
    this.onSessionDeletedCallback = onSessionDeleted;

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
          <!-- Main Menu View -->
          <div class="menu-view active" id="menuView">
            <h1 class="session-menu-title">${this.gameTitle}</h1>
            <p class="session-menu-subtitle">${this.gameDescription}</p>

            <div class="session-menu-buttons">
              <button class="session-btn session-btn-primary" id="newGameBtn">
                New Game
              </button>
              <button class="session-btn session-btn-secondary" id="loadGameBtn" ${!this.hasExistingSessions ? 'disabled' : ''}>
                Load Game
              </button>
            </div>
          </div>

          <!-- Session Name View -->
          <div class="menu-view" id="sessionNameView">
            <h1 class="session-menu-title">Create New Game</h1>
            <p class="session-menu-subtitle">Name your adventure</p>

            <div class="session-error" id="sessionError" style="display: none;"></div>

            <div class="session-form-group-overlay">
              <input
                type="text"
                id="sessionNameInput"
                placeholder="My Adventure"
                maxlength="30"
                autocomplete="off"
              >
              <span class="char-counter" id="charCounter">0 / 30</span>
            </div>

            <div class="session-menu-buttons">
              <button class="session-btn session-btn-secondary" id="backToMenuBtn">
                Back
              </button>
              <button class="session-btn session-btn-primary" id="nextToCharacterBtn">
                Next
              </button>
            </div>
          </div>

          <!-- Character Selection View -->
          <div class="menu-view" id="characterSelectView">
            <h1 class="session-menu-title">Choose Your Character</h1>
            <p class="session-menu-subtitle">This cannot be changed later</p>

            <div class="character-grid-overlay" id="characterGridOverlay"></div>

            <div class="session-menu-buttons">
              <button class="session-btn session-btn-secondary" id="backToNameBtn">
                Back
              </button>
              <button class="session-btn session-btn-primary" id="createSessionBtn" disabled>
                Start Adventure
              </button>
            </div>
          </div>

          <!-- Load Sessions View -->
          <div class="menu-view" id="loadSessionsView">
            <h1 class="session-menu-title">Load Game</h1>
            <p class="session-menu-subtitle">Select a saved adventure</p>

            <div class="session-list-overlay" id="sessionListOverlay">
              <!-- Sessions will be loaded here -->
            </div>

            <div class="session-menu-buttons">
              <button class="session-btn session-btn-secondary" id="backToMenuFromLoadBtn">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('sessionMenuModal');
  }

  setupEventListeners() {
    // Main Menu - New Game button
    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.showSessionNameView();
    });

    // Main Menu - Load Game button
    document.getElementById('loadGameBtn').addEventListener('click', () => {
      if (this.hasExistingSessions) {
        this.showLoadSessionsView();
      }
    });

    // Session Name - Input tracking
    const sessionInput = document.getElementById('sessionNameInput');
    const charCounter = document.getElementById('charCounter');

    sessionInput.addEventListener('input', () => {
      const length = sessionInput.value.length;
      charCounter.textContent = `${length} / 30`;
    });

    sessionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.goToCharacterSelection();
      }
    });

    // Session Name - Back button
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
      this.showMenuView();
    });

    // Session Name - Next button
    document.getElementById('nextToCharacterBtn').addEventListener('click', () => {
      this.goToCharacterSelection();
    });

    // Character Selection - Back button
    document.getElementById('backToNameBtn').addEventListener('click', () => {
      this.showSessionNameView();
    });

    // Character Selection - Create button
    document.getElementById('createSessionBtn').addEventListener('click', () => {
      this.createSession();
    });

    // Load Sessions - Back button
    document.getElementById('backToMenuFromLoadBtn').addEventListener('click', () => {
      this.showMenuView();
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

  // ===== View Transitions =====

  showMenuView() {
    // Hide all views
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show menu view
    document.getElementById('menuView').classList.add('active');
    this.currentView = 'menu';

    // Reset state
    this.sessionName = '';
    this.selectedCharacter = null;

    // Clear any errors
    const errorDiv = document.getElementById('sessionError');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  showSessionNameView() {
    // Hide all views
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show session name view
    document.getElementById('sessionNameView').classList.add('active');
    this.currentView = 'create-name';

    // Clear and focus input
    const input = document.getElementById('sessionNameInput');
    if (input) {
      input.value = '';
      input.focus();
    }

    // Reset character counter
    const charCounter = document.getElementById('charCounter');
    if (charCounter) {
      charCounter.textContent = '0 / 30';
    }

    // Clear any errors
    const errorDiv = document.getElementById('sessionError');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  async goToCharacterSelection() {
    const input = document.getElementById('sessionNameInput');
    const sessionName = input.value.trim();

    // Validate session name
    if (!sessionName) {
      this.showError('Please enter a name for your adventure');
      return;
    }

    if (sessionName.length < 2) {
      this.showError('Adventure name must be at least 2 characters');
      return;
    }

    // Save session name
    this.sessionName = sessionName;

    // Hide all views
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show character selection view
    document.getElementById('characterSelectView').classList.add('active');
    this.currentView = 'create-character';

    // Load characters
    await this.loadCharacterSelection();
  }

  async loadCharacterSelection() {
    const gridContainer = document.getElementById('characterGridOverlay');
    if (!gridContainer) return;

    // Clear existing content
    gridContainer.innerHTML = '';

    // Get available characters from PlayerCharacters global
    if (!window.playerCharacters) {
      this.showError('Character data not loaded');
      return;
    }

    // Get available characters from game settings
    const availableCharacters = this.gameData?.gameData?.characterSettings?.availableCharacters ||
                                ['soldier', 'dwarfWarrior', 'wizard', 'archer']; // Default: all available

    // Get all character IDs and filter by availability
    const allCharacterKeys = window.playerCharacters.getCharacterIds();
    const characterKeys = allCharacterKeys.filter(charKey => availableCharacters.includes(charKey));

    // Check if any characters are available
    if (characterKeys.length === 0) {
      gridContainer.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">No characters available for selection. Please contact the game creator.</p>';
      return;
    }

    characterKeys.forEach(charKey => {
      const char = window.playerCharacters.getCharacter(charKey);

      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.character = charKey;

      card.innerHTML = `
        <div class="character-info">
          <div class="character-name">${char.name}</div>
          <div class="character-description">${char.description || 'A brave adventurer'}</div>
          <div class="character-size">Size: ${char.playerSize.width}x${char.playerSize.height}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectCharacter(charKey);
      });

      gridContainer.appendChild(card);
    });

    // Apply grid styling
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    gridContainer.style.gap = '15px';
    gridContainer.style.margin = '20px 0';
  }

  selectCharacter(charKey) {
    // Update selected character
    this.selectedCharacter = charKey;

    // Update UI
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`[data-character="${charKey}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    // Enable create button
    const createBtn = document.getElementById('createSessionBtn');
    if (createBtn) {
      createBtn.disabled = false;
    }
  }

  async createSession() {
    if (!this.sessionName || !this.selectedCharacter) {
      this.showError('Please complete all steps');
      return;
    }

    try {
      // Disable create button to prevent double-clicks
      const createBtn = document.getElementById('createSessionBtn');
      if (createBtn) {
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
      }

      // Create session via API
      const session = await window.sessionAPI.createSession(
        this.gameId,
        this.sessionName,
        this.selectedCharacter
      );

      // Hide overlay
      this.hide();

      // Call the session created callback
      if (this.onSessionCreatedCallback) {
        this.onSessionCreatedCallback(session);
      }

    } catch (error) {
      console.error('Error creating session:', error);
      this.showError(error.message || 'Failed to create session');

      // Re-enable create button
      const createBtn = document.getElementById('createSessionBtn');
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.textContent = 'Start Adventure';
      }
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('sessionError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  // ===== Load Sessions View =====

  async showLoadSessionsView() {
    // Hide all views
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show load sessions view
    document.getElementById('loadSessionsView').classList.add('active');
    this.currentView = 'load-sessions';

    // Load sessions
    await this.loadSessionsList();
  }

  async loadSessionsList() {
    const listContainer = document.getElementById('sessionListOverlay');
    listContainer.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6); padding: 40px;">Loading...</p>';

    try {
      this.sessions = await window.sessionAPI.listSessions(this.gameId);

      if (this.sessions.length === 0) {
        this.showEmptySessionsState();
      } else {
        this.renderSessionsList();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      listContainer.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Failed to load sessions</p>';
    }
  }

  showEmptySessionsState() {
    const listContainer = document.getElementById('sessionListOverlay');
    listContainer.innerHTML = `
      <div class="empty-sessions-overlay">
        <div class="empty-sessions-icon">📁</div>
        <p>No saved games yet</p>
      </div>
    `;
  }

  renderSessionsList() {
    const listContainer = document.getElementById('sessionListOverlay');
    listContainer.innerHTML = '';

    this.sessions.forEach(session => {
      const card = this.createSessionCardOverlay(session);
      listContainer.appendChild(card);
    });
  }

  createSessionCardOverlay(session) {
    const card = document.createElement('div');
    card.className = 'session-card-overlay';
    card.dataset.sessionId = session._id;

    // Format last played time
    const lastPlayed = this.formatTimeSince(new Date(session.lastPlayed));

    // Get character display name
    const charData = window.playerCharacters?.getCharacter(session.sessionCharacter);
    const charName = charData?.name || session.sessionCharacter;

    card.innerHTML = `
      <div class="session-character-icon-overlay">🎮</div>
      <div class="session-info-overlay">
        <h3 class="session-name-overlay">${this.escapeHtml(session.sessionName)}</h3>
        <div class="session-meta-overlay">
          <span class="session-meta-item-overlay">🎭 ${charName}</span>
          <span class="session-meta-item-overlay">🕐 ${lastPlayed}</span>
        </div>
      </div>
      <div class="session-actions-overlay">
        <button class="delete-btn-overlay" data-session-id="${session._id}">🗑️</button>
      </div>
    `;

    // Click to load (except on delete button)
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-btn-overlay')) {
        this.loadSession(session);
      }
    });

    // Delete button
    const deleteBtn = card.querySelector('.delete-btn-overlay');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirmDeleteSession(session);
    });

    return card;
  }

  loadSession(session) {
    console.log('Loading session:', session);
    this.hide();

    if (this.onSessionLoadedCallback) {
      this.onSessionLoadedCallback(session);
    }
  }

  async confirmDeleteSession(session) {
    const confirmed = confirm(
      `Are you sure you want to delete "${session.sessionName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await window.sessionAPI.deleteSession(this.gameId, session._id);
      console.log('✅ Session deleted');

      // Reload sessions
      await this.loadSessionsList();

      // Notify callback
      if (this.onSessionDeletedCallback) {
        this.onSessionDeletedCallback(session);
      }

      // Update hasExistingSessions flag and Load Game button state
      await this.checkExistingSessions();
      const loadBtn = document.getElementById('loadGameBtn');
      if (loadBtn) {
        loadBtn.disabled = !this.hasExistingSessions;
      }

      // If no sessions left, go back to menu
      if (!this.hasExistingSessions) {
        this.showMenuView();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session: ' + error.message);
    }
  }

  formatTimeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in play.html
window.GameSessionMenu = GameSessionMenu;
