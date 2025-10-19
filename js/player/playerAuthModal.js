/**
 * Player Auth Modal
 * Login/Register UI for players (shown before game loads)
 * Simpler and more game-focused than the editor auth modal
 */

class PlayerAuthModal {
  constructor() {
    this.modal = null;
    this.currentMode = 'login'; // 'login' or 'register'
    this.onAuthSuccess = null; // Callback when auth succeeds
    this.gameTitle = '';
    this.gameAuthor = '';
  }

  /**
   * Initialize the modal
   * @param {string} gameTitle - Name of the game
   * @param {string} gameAuthor - Author of the game
   * @param {Function} onAuthSuccess - Callback when user authenticates
   */
  initialize(gameTitle, gameAuthor, onAuthSuccess) {
    this.gameTitle = gameTitle;
    this.gameAuthor = gameAuthor;
    this.onAuthSuccess = onAuthSuccess;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="playerAuthModal" class="player-auth-modal">
        <div class="player-auth-content">
          <div class="player-auth-header">
            <h2 id="playerAuthGameTitle">${this.gameTitle}</h2>
            <p class="player-auth-author">by ${this.gameAuthor}</p>
            <p class="player-auth-message">Login to save your progress</p>
          </div>

          <div class="player-auth-body">
            <!-- Login Form -->
            <div id="playerLoginForm" class="player-auth-form">
              <h3>Login</h3>
              <div class="player-form-group">
                <input type="email" id="playerLoginEmail" placeholder="Email" required>
              </div>
              <div class="player-form-group">
                <input type="password" id="playerLoginPassword" placeholder="Password" required>
              </div>
              <div class="player-form-error" id="playerLoginError"></div>
              <button class="player-btn player-btn-primary" id="playerLoginBtn">
                <span class="player-btn-text">Login</span>
                <span class="player-btn-spinner" style="display: none;">⟳</span>
              </button>
              <p class="player-auth-switch">
                Don't have an account?
                <a href="#" id="playerShowRegister">Sign up</a>
              </p>
            </div>

            <!-- Register Form -->
            <div id="playerRegisterForm" class="player-auth-form" style="display: none;">
              <h3>Create Account</h3>
              <div class="player-form-group">
                <input type="text" id="playerRegisterUsername" placeholder="Username (3-30 characters)" required minlength="3" maxlength="30">
                <small class="player-form-hint">Lowercase, alphanumeric, hyphens, underscores only</small>
              </div>
              <div class="player-form-group">
                <input type="text" id="playerRegisterDisplayName" placeholder="Display Name" required maxlength="50">
              </div>
              <div class="player-form-group">
                <input type="email" id="playerRegisterEmail" placeholder="Email" required>
              </div>
              <div class="player-form-group">
                <input type="password" id="playerRegisterPassword" placeholder="Password (min 6 characters)" required minlength="6">
              </div>
              <div class="player-form-error" id="playerRegisterError"></div>
              <button class="player-btn player-btn-primary" id="playerRegisterBtn">
                <span class="player-btn-text">Create Account</span>
                <span class="player-btn-spinner" style="display: none;">⟳</span>
              </button>
              <p class="player-auth-switch">
                Already have an account?
                <a href="#" id="playerShowLogin">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('playerAuthModal');
  }

  setupEventListeners() {
    // Switch between login and register
    document.getElementById('playerShowRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchMode('register');
    });

    document.getElementById('playerShowLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchMode('login');
    });

    // Login button
    document.getElementById('playerLoginBtn').addEventListener('click', () => {
      this.handleLogin();
    });

    // Register button
    document.getElementById('playerRegisterBtn').addEventListener('click', () => {
      this.handleRegister();
    });

    // Enter key support
    document.getElementById('playerLoginEmail').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
    document.getElementById('playerLoginPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
    document.getElementById('playerRegisterPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleRegister();
    });
  }

  switchMode(mode) {
    this.currentMode = mode;

    if (mode === 'login') {
      document.getElementById('playerLoginForm').style.display = 'block';
      document.getElementById('playerRegisterForm').style.display = 'none';
      this.clearErrors();
    } else {
      document.getElementById('playerLoginForm').style.display = 'none';
      document.getElementById('playerRegisterForm').style.display = 'block';
      this.clearErrors();
    }
  }

  async handleLogin() {
    const email = document.getElementById('playerLoginEmail').value.trim();
    const password = document.getElementById('playerLoginPassword').value;
    const errorDiv = document.getElementById('playerLoginError');
    const btn = document.getElementById('playerLoginBtn');
    const btnText = btn.querySelector('.player-btn-text');
    const btnSpinner = btn.querySelector('.player-btn-spinner');

    // Validate
    if (!email || !password) {
      this.showError('login', 'Please fill in all fields');
      return;
    }

    // Show loading
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    errorDiv.textContent = '';

    try {
      await window.authSystem.login(email, password);
      // Auth system will trigger state change, which will call onAuthSuccess
      this.hide();
    } catch (error) {
      console.error('Login error:', error);
      this.showError('login', error.message || 'Login failed. Please try again.');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  }

  async handleRegister() {
    const username = document.getElementById('playerRegisterUsername').value.trim().toLowerCase();
    const displayName = document.getElementById('playerRegisterDisplayName').value.trim();
    const email = document.getElementById('playerRegisterEmail').value.trim();
    const password = document.getElementById('playerRegisterPassword').value;
    const errorDiv = document.getElementById('playerRegisterError');
    const btn = document.getElementById('playerRegisterBtn');
    const btnText = btn.querySelector('.player-btn-text');
    const btnSpinner = btn.querySelector('.player-btn-spinner');

    // Validate
    if (!username || !displayName || !email || !password) {
      this.showError('register', 'Please fill in all fields');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      this.showError('register', 'Username can only contain lowercase letters, numbers, hyphens, and underscores');
      return;
    }

    if (username.length < 3 || username.length > 30) {
      this.showError('register', 'Username must be 3-30 characters');
      return;
    }

    if (password.length < 6) {
      this.showError('register', 'Password must be at least 6 characters');
      return;
    }

    // Show loading
    btn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    errorDiv.textContent = '';

    try {
      // Check username availability
      const available = await window.authSystem.checkUsernameAvailability(username);
      if (!available) {
        this.showError('register', 'Username is already taken');
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        return;
      }

      await window.authSystem.register(email, password, username, displayName);
      // Auth system will trigger state change, which will call onAuthSuccess
      this.hide();
    } catch (error) {
      console.error('Registration error:', error);
      this.showError('register', error.message || 'Registration failed. Please try again.');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  }

  showError(mode, message) {
    const errorDiv = document.getElementById(mode === 'login' ? 'playerLoginError' : 'playerRegisterError');
    errorDiv.textContent = message;
  }

  clearErrors() {
    document.getElementById('playerLoginError').textContent = '';
    document.getElementById('playerRegisterError').textContent = '';
  }

  show() {
    if (this.modal) {
      this.modal.style.display = 'flex';
    }
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }

    // Call success callback
    if (this.onAuthSuccess) {
      this.onAuthSuccess();
    }
  }

  updateGameInfo(title, author) {
    this.gameTitle = title;
    this.gameAuthor = author;
    const titleEl = document.getElementById('playerAuthGameTitle');
    const authorEl = document.querySelector('.player-auth-author');
    if (titleEl) titleEl.textContent = title;
    if (authorEl) authorEl.textContent = `by ${author}`;
  }
}

// Export for use in play.html
window.PlayerAuthModal = PlayerAuthModal;
