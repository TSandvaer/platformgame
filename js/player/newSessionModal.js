/**
 * New Session Modal
 * Two-step modal for creating new game sessions:
 * Step 1: Enter session name
 * Step 2: Select character (with sprite preview)
 */

class NewSessionModal {
  constructor() {
    this.modal = null;
    this.currentStep = 1;
    this.sessionName = '';
    this.selectedCharacter = null;
    this.gameId = null;
    this.onSessionCreated = null;
  }

  /**
   * Initialize the modal
   * @param {string} gameId - MongoDB game ID
   * @param {Function} onSessionCreated - Callback when session is created (receives session data)
   */
  initialize(gameId, onSessionCreated) {
    this.gameId = gameId;
    this.onSessionCreated = onSessionCreated;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="newSessionModal" class="new-session-modal">
        <div class="new-session-content">
          <div class="new-session-header">
            <h2>Create New Game</h2>
          </div>

          <div class="session-error" id="newSessionError"></div>

          <!-- Step 1: Session Name -->
          <div class="new-session-step step-name active" id="stepName">
            <div class="session-form-group">
              <label for="sessionNameInput">Name your adventure</label>
              <input
                type="text"
                id="sessionNameInput"
                placeholder="My First Adventure"
                maxlength="30"
                autocomplete="off"
              >
              <span class="char-counter" id="charCounter">0 / 30</span>
            </div>

            <div class="modal-footer">
              <button class="modal-btn modal-btn-secondary" id="cancelNameBtn">Cancel</button>
              <button class="modal-btn modal-btn-primary" id="nextToCharacterBtn">Next</button>
            </div>
          </div>

          <!-- Step 2: Character Selection -->
          <div class="new-session-step step-character" id="stepCharacter">
            <p style="text-align: center; color: #aaa; margin-bottom: 20px;">
              Choose your character (this cannot be changed later)
            </p>

            <div class="character-grid" id="characterGrid"></div>

            <div class="modal-footer">
              <button class="modal-btn modal-btn-secondary" id="backToNameBtn">Back</button>
              <button class="modal-btn modal-btn-primary" id="createSessionBtn" disabled>Create</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('newSessionModal');
  }

  setupEventListeners() {
    // Session name input with character counter
    const sessionInput = document.getElementById('sessionNameInput');
    const charCounter = document.getElementById('charCounter');

    sessionInput.addEventListener('input', () => {
      const length = sessionInput.value.length;
      charCounter.textContent = `${length} / 30`;

      // Update counter color
      charCounter.classList.remove('warning', 'limit');
      if (length > 25) {
        charCounter.classList.add('warning');
      }
      if (length === 30) {
        charCounter.classList.add('limit');
      }
    });

    // Enter key on name input
    sessionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.goToCharacterSelection();
      }
    });

    // Step 1 buttons
    document.getElementById('cancelNameBtn').addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('nextToCharacterBtn').addEventListener('click', () => {
      this.goToCharacterSelection();
    });

    // Step 2 buttons
    document.getElementById('backToNameBtn').addEventListener('click', () => {
      this.goToStep(1);
    });

    document.getElementById('createSessionBtn').addEventListener('click', () => {
      this.createSession();
    });
  }

  goToCharacterSelection() {
    const sessionInput = document.getElementById('sessionNameInput');
    const name = sessionInput.value.trim();

    // Validate name
    if (!name) {
      this.showError('Please enter a name for your adventure');
      sessionInput.focus();
      return;
    }

    this.sessionName = name;
    this.clearError();

    // Load character selection
    this.loadCharacterSelection();

    // Go to step 2
    this.goToStep(2);
  }

  goToStep(step) {
    this.currentStep = step;

    // Hide all steps
    document.querySelectorAll('.new-session-step').forEach(el => {
      el.classList.remove('active');
    });

    // Show current step
    if (step === 1) {
      document.getElementById('stepName').classList.add('active');
    } else if (step === 2) {
      document.getElementById('stepCharacter').classList.add('active');
    }
  }

  loadCharacterSelection() {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = '';

    // Get available characters from PlayerCharacters instance
    if (!window.playerCharacters || !window.playerCharacters.characters) {
      console.error('PlayerCharacters not loaded');
      grid.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Failed to load characters</p>';
      return;
    }

    const characters = window.playerCharacters.characters;

    // Display characters in order: soldier, dwarfWarrior, wizard, archer
    const characterOrder = ['soldier', 'dwarfWarrior', 'wizard', 'archer'];

    characterOrder.forEach(charKey => {
      if (!characters[charKey]) return;

      const char = characters[charKey];
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.character = charKey;

      const sizeInfo = `${char.playerSize.width}x${char.playerSize.height}`;

      card.innerHTML = `
        <div class="character-info">
          <div class="character-name">${char.name}</div>
          <div class="character-description">${char.description}</div>
          <div class="character-size">Size: ${sizeInfo}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectCharacter(charKey);
      });

      grid.appendChild(card);
    });
  }


  selectCharacter(charKey) {
    // Remove previous selection
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Select this character
    const card = document.querySelector(`.character-card[data-character="${charKey}"]`);
    if (card) {
      card.classList.add('selected');
    }

    this.selectedCharacter = charKey;

    // Enable create button
    document.getElementById('createSessionBtn').disabled = false;
  }

  async createSession() {
    if (!this.selectedCharacter) {
      this.showError('Please select a character');
      return;
    }

    const createBtn = document.getElementById('createSessionBtn');
    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';

    try {
      const session = await window.sessionAPI.createSession(
        this.gameId,
        this.sessionName,
        this.selectedCharacter
      );

      console.log('✅ Session created:', session);

      // Hide modal
      this.hide();

      // Call success callback
      if (this.onSessionCreated) {
        this.onSessionCreated(session);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      this.showError(error.message || 'Failed to create session');
      createBtn.disabled = false;
      createBtn.textContent = 'Create';
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('newSessionError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  }

  clearError() {
    const errorDiv = document.getElementById('newSessionError');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
  }

  show() {
    if (this.modal) {
      this.modal.classList.add('show');
      // Reset to step 1
      this.goToStep(1);
      // Clear form
      document.getElementById('sessionNameInput').value = '';
      document.getElementById('charCounter').textContent = '0 / 30';
      this.selectedCharacter = null;
      this.clearError();
      // Focus on input
      setTimeout(() => {
        document.getElementById('sessionNameInput').focus();
      }, 100);
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
}

// Export for use in play.html
window.NewSessionModal = NewSessionModal;
