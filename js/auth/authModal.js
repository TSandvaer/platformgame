/**
 * Authentication Modal
 * Handles login and signup in a modal overlay for the game editor
 */

class AuthModal {
    constructor() {
        this.modal = null;
        this.currentTab = 'login';
        this.usernameCheckTimeout = null;
        this.createModal();
        this.attachEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="authModal" class="modal no-theme" style="display: none;">
                <div class="modal-content no-theme" style="width: 500px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>🎮 Platform Game Portal</h3>
                        <p style="color: #888; font-size: 14px; margin: 10px 0 0 0;">Please login or sign up to access the game editor</p>
                    </div>

                    <div class="modal-body">
                        <!-- Tab Switcher -->
                        <div class="auth-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #444;">
                            <button id="loginTab" class="auth-tab active" data-tab="login">
                                Login
                            </button>
                            <button id="signupTab" class="auth-tab" data-tab="signup">
                                Sign Up
                            </button>
                        </div>

                        <!-- Login Form -->
                        <div id="loginForm" class="auth-form" style="display: block;">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" placeholder="Enter your email" required>
                            </div>

                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <input type="password" id="loginPassword" placeholder="Enter your password" required>
                            </div>

                            <div id="loginError" class="error-message" style="display: none;"></div>

                            <button id="modalLoginBtn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
                                <span id="modalLoginBtnText">Login</span>
                                <span id="modalLoginBtnSpinner" style="display: none;">Logging in...</span>
                            </button>
                        </div>

                        <!-- Signup Form -->
                        <div id="signupForm" class="auth-form" style="display: none;">
                            <div class="form-group">
                                <label for="signupDisplayName">Display Name</label>
                                <input type="text" id="signupDisplayName" placeholder="Your name" required>
                            </div>

                            <div class="form-group">
                                <label for="signupUsername">
                                    Username
                                    <span id="usernameStatus" style="margin-left: 10px; font-size: 12px;"></span>
                                </label>
                                <input type="text" id="signupUsername" placeholder="Choose a username" required pattern="[a-z0-9_-]+" title="Lowercase letters, numbers, hyphens, and underscores only">
                                <small style="display: block; margin-top: 5px; color: #888;">
                                    Lowercase letters, numbers, hyphens, and underscores only
                                </small>
                            </div>

                            <div class="form-group">
                                <label for="signupEmail">Email</label>
                                <input type="email" id="signupEmail" placeholder="Enter your email" required>
                            </div>

                            <div class="form-group">
                                <label for="signupPassword">Password</label>
                                <input type="password" id="signupPassword" placeholder="Choose a password (min 6 characters)" required minlength="6">
                            </div>

                            <div class="form-group">
                                <label for="signupConfirmPassword">Confirm Password</label>
                                <input type="password" id="signupConfirmPassword" placeholder="Confirm your password" required minlength="6">
                            </div>

                            <div id="signupError" class="error-message" style="display: none;"></div>

                            <button id="signupBtn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
                                <span id="signupBtnText">Sign Up</span>
                                <span id="signupBtnSpinner" style="display: none;">Creating account...</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModal');

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 2px solid #444;
            }

            .auth-tab {
                background: none;
                border: none;
                color: #888;
                padding: 10px 20px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                border-bottom: 3px solid transparent;
                margin-bottom: -2px;
                transition: all 0.2s;
            }

            .auth-tab:hover {
                color: #aaa;
            }

            .auth-tab.active {
                color: #4CAF50;
                border-bottom-color: #4CAF50;
            }

            .auth-form {
                animation: fadeIn 0.3s;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #ddd;
                font-weight: 500;
            }

            .form-group input {
                width: 100%;
                padding: 12px;
                background: #333;
                border: 1px solid #555;
                border-radius: 6px;
                color: white;
                font-size: 14px;
                box-sizing: border-box;
            }

            .form-group input:focus {
                outline: none;
                border-color: #4CAF50;
            }

            .form-group input.error {
                border-color: #ff6b6b;
            }

            .form-group input.success {
                border-color: #4CAF50;
            }

            .error-message {
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid #ff6b6b;
                color: #ff6b6b;
                padding: 12px;
                border-radius: 6px;
                margin-top: 10px;
                font-size: 14px;
            }

            .btn-primary {
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }

            .btn-primary:hover:not(:disabled) {
                background: #45a049;
            }

            .btn-primary:disabled {
                background: #666;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        // Tab switching
        document.getElementById('loginTab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('signupTab').addEventListener('click', () => this.switchTab('signup'));

        // Login form
        document.getElementById('modalLoginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('loginEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Signup form
        document.getElementById('signupBtn').addEventListener('click', () => this.handleSignup());
        document.getElementById('signupConfirmPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSignup();
        });

        // Username validation
        document.getElementById('signupUsername').addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            this.checkUsernameAvailability(e.target.value);
        });
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tab + 'Tab').classList.add('active');

        // Update form visibility
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';

        // Clear errors
        this.clearErrors();
    }

    async checkUsernameAvailability(username) {
        const statusEl = document.getElementById('usernameStatus');
        const usernameInput = document.getElementById('signupUsername');

        if (!username || username.length < 3) {
            statusEl.textContent = '';
            usernameInput.classList.remove('success', 'error');
            return;
        }

        // Debounce the check
        clearTimeout(this.usernameCheckTimeout);
        this.usernameCheckTimeout = setTimeout(async () => {
            try {
                statusEl.textContent = 'Checking...';
                statusEl.style.color = '#888';

                const response = await fetch(`http://localhost:3000/api/users/check-username/${username}`);
                const data = await response.json();

                if (data.available) {
                    statusEl.textContent = '✓ Available';
                    statusEl.style.color = '#4CAF50';
                    usernameInput.classList.remove('error');
                    usernameInput.classList.add('success');
                } else {
                    statusEl.textContent = '✗ Already taken';
                    statusEl.style.color = '#ff6b6b';
                    usernameInput.classList.remove('success');
                    usernameInput.classList.add('error');
                }
            } catch (error) {
                console.error('Error checking username:', error);
                statusEl.textContent = '';
                usernameInput.classList.remove('success', 'error');
            }
        }, 500);
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('login', 'Please fill in all fields');
            return;
        }

        const btn = document.getElementById('modalLoginBtn');
        const btnText = document.getElementById('modalLoginBtnText');
        const btnSpinner = document.getElementById('modalLoginBtnSpinner');

        try {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline';
            this.clearErrors();

            await authSystem.login(email, password);

            // Success - modal will be closed by the auth state change handler
            console.log('Login successful');

        } catch (error) {
            console.error('Login error:', error);
            this.showError('login', this.getErrorMessage(error));
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }

    async handleSignup() {
        const displayName = document.getElementById('signupDisplayName').value.trim();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validation
        if (!displayName || !username || !email || !password || !confirmPassword) {
            this.showError('signup', 'Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            this.showError('signup', 'Username must be at least 3 characters');
            return;
        }

        if (!/^[a-z0-9_-]+$/.test(username)) {
            this.showError('signup', 'Username can only contain lowercase letters, numbers, hyphens, and underscores');
            return;
        }

        if (password.length < 6) {
            this.showError('signup', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signup', 'Passwords do not match');
            return;
        }

        const btn = document.getElementById('signupBtn');
        const btnText = document.getElementById('signupBtnText');
        const btnSpinner = document.getElementById('signupBtnSpinner');

        try {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline';
            this.clearErrors();

            await authSystem.register(email, password, username, displayName);

            // Success - modal will be closed by the auth state change handler
            console.log('Signup successful');

        } catch (error) {
            console.error('Signup error:', error);
            this.showError('signup', this.getErrorMessage(error));
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }

    showError(form, message) {
        const errorEl = document.getElementById(form + 'Error');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    clearErrors() {
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('signupError').style.display = 'none';
    }

    getErrorMessage(error) {
        const errorCode = error.code;

        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return error.message || 'An error occurred. Please try again';
        }
    }

    show() {
        this.modal.style.display = 'flex';
        // Focus first input
        if (this.currentTab === 'login') {
            document.getElementById('loginEmail').focus();
        } else {
            document.getElementById('signupDisplayName').focus();
        }
    }

    hide() {
        this.modal.style.display = 'none';
        this.clearErrors();
        // Clear form fields
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('signupDisplayName').value = '';
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupConfirmPassword').value = '';
        document.getElementById('usernameStatus').textContent = '';
    }
}

// Initialize auth modal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authModal = new AuthModal();
    });
} else {
    window.authModal = new AuthModal();
}
