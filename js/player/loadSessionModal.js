/**
 * Load Session Modal
 * Displays all existing save slots for the current game
 * Shows session name, character, last played time
 * Allows loading or deleting sessions
 */

class LoadSessionModal {
  constructor() {
    this.modal = null;
    this.gameId = null;
    this.sessions = [];
    this.onSessionLoaded = null;
    this.onSessionDeleted = null;
  }

  /**
   * Initialize the modal
   * @param {string} gameId - MongoDB game ID
   * @param {Function} onSessionLoaded - Callback when session is loaded
   * @param {Function} onSessionDeleted - Callback when session is deleted
   */
  initialize(gameId, onSessionLoaded, onSessionDeleted) {
    this.gameId = gameId;
    this.onSessionLoaded = onSessionLoaded;
    this.onSessionDeleted = onSessionDeleted;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="loadSessionModal" class="load-session-modal">
        <div class="load-session-content">
          <div class="load-session-header">
            <h2>Load Game</h2>
          </div>

          <div class="session-list" id="sessionList">
            <!-- Sessions will be loaded here -->
          </div>

          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" id="closeSessions">Back</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('loadSessionModal');
  }

  setupEventListeners() {
    document.getElementById('closeSessions').addEventListener('click', () => {
      this.hide();
    });
  }

  async loadSessions() {
    const listContainer = document.getElementById('sessionList');
    listContainer.innerHTML = '<p style="text-align: center; color: #888;">Loading...</p>';

    try {
      this.sessions = await window.sessionAPI.listSessions(this.gameId);

      if (this.sessions.length === 0) {
        this.showEmptyState();
      } else {
        this.renderSessions();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      listContainer.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Failed to load sessions</p>';
    }
  }

  showEmptyState() {
    const listContainer = document.getElementById('sessionList');
    listContainer.innerHTML = `
      <div class="empty-sessions">
        <div class="empty-sessions-icon">📁</div>
        <p>No saved games yet</p>
      </div>
    `;
  }

  renderSessions() {
    const listContainer = document.getElementById('sessionList');
    listContainer.innerHTML = '';

    this.sessions.forEach(session => {
      const card = this.createSessionCard(session);
      listContainer.appendChild(card);
    });
  }

  createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.dataset.sessionId = session._id;

    // Format last played time
    const lastPlayed = this.formatTimeSince(new Date(session.lastPlayed));

    // Get character display name
    const charData = window.playerCharacters?.characters?.[session.sessionCharacter];
    const charName = charData?.name || session.sessionCharacter;

    card.innerHTML = `
      <div class="session-character-icon">🎮</div>
      <div class="session-info">
        <h3 class="session-name">${this.escapeHtml(session.sessionName)}</h3>
        <div class="session-meta">
          <span class="session-meta-item">🎭 ${charName}</span>
          <span class="session-meta-item">🕐 ${lastPlayed}</span>
        </div>
      </div>
      <div class="session-actions">
        <button class="delete-btn" data-session-id="${session._id}">🗑️</button>
      </div>
    `;

    // Click to load (except on delete button)
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-btn')) {
        this.loadSession(session);
      }
    });

    // Delete button
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirmDeleteSession(session);
    });

    return card;
  }


  loadSession(session) {
    console.log('Loading session:', session);
    this.hide();

    if (this.onSessionLoaded) {
      this.onSessionLoaded(session);
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
      await this.loadSessions();

      // Notify callback
      if (this.onSessionDeleted) {
        this.onSessionDeleted(session);
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

  async show() {
    if (this.modal) {
      this.modal.classList.add('show');
      // Load sessions when showing
      await this.loadSessions();
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

  async refresh() {
    await this.loadSessions();
  }
}

// Export for use in play.html
window.LoadSessionModal = LoadSessionModal;
