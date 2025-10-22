/**
 * Authentication System
 * Manages user authentication state and provides auth-related functionality
 */

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.listeners = [];
    this.isInitialized = false;
    this.initPromise = null;  // Track initialization promise to prevent duplicate listeners
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
      return 'http://localhost:3000/api';
    }

    // For production, use the same host as the frontend
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  /**
   * Initialize authentication system
   * Sets up Firebase auth state listener
   */
  async initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    // Return existing promise if already initializing (prevents duplicate listeners)
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      // Listen for auth state changes
      firebase.auth().onAuthStateChanged(async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');

        if (firebaseUser) {
          try {
            // Get Firebase ID token
            this.authToken = await firebaseUser.getIdToken();

            // Fetch user data from our backend
            const userData = await this.fetchUserData();

            this.currentUser = {
              firebaseUser: firebaseUser,
              userData: userData,
              token: this.authToken
            };

            console.log('✅ User authenticated:', userData.username);

            // Store token in localStorage for API calls
            localStorage.setItem('authToken', this.authToken);
          } catch (error) {
            console.error('Error fetching user data:', error);
            this.currentUser = null;
            this.authToken = null;
            localStorage.removeItem('authToken');
          }
        } else {
          this.currentUser = null;
          this.authToken = null;
          localStorage.removeItem('authToken');
        }

        // Notify all listeners
        this.notifyListeners();

        if (!this.isInitialized) {
          this.isInitialized = true;
          resolve();
        }
      });
    });

    return this.initPromise;
  }

  /**
   * Fetch user data from backend
   */
  async fetchUserData() {
    const response = await fetch(`${this.baseURL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {string} displayName
   */
  async register(email, password, username, displayName) {
    try {
      // Create Firebase user
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      // Get Firebase token
      const token = await firebaseUser.getIdToken();

      // Register user in our backend
      const response = await fetch(`${this.baseURL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: email,
          username: username,
          displayName: displayName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('✅ User registered successfully:', data.user);

      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('✅ User logged in successfully');
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      await firebase.auth().signOut();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if username is available
   * @param {string} username
   */
  async checkUsernameAvailability(username) {
    try {
      const response = await fetch(`${this.baseURL}/users/check-username/${username}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Get auth token for API calls
   */
  getAuthToken() {
    return this.authToken;
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback
   */
  onAuthStateChange(callback) {
    this.listeners.push(callback);

    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Get auth headers for API calls
   */
  getAuthHeaders() {
    if (!this.authToken) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.authToken}`
    };
  }
}

// Create global auth system instance
window.authSystem = new AuthSystem();
