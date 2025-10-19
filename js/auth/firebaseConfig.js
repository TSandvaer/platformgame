/**
 * Firebase Client SDK Configuration
 * This file initializes Firebase for frontend authentication
 */

// Firebase configuration - these values are safe to expose in frontend
const firebaseConfig = {
  apiKey: "AIzaSyAbFS9qIZermH6Uo6BsPy_xNWG6TH1w_fs",
  authDomain: "platformgame-8fd34.firebaseapp.com",
  projectId: "platformgame-8fd34",
  storageBucket: "platformgame-8fd34.firebasestorage.app",
  messagingSenderId: "58865281085",
  appId: "1:58865281085:web:ef328e77729fffbcf3a254"
};

// Initialize Firebase
let app;
let auth;

try {
  // Initialize Firebase App
  app = firebase.initializeApp(firebaseConfig);

  // Get Firebase Auth instance
  auth = firebase.auth();

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}

// Export auth instance for use in other modules
window.firebaseAuth = auth;
window.firebaseApp = app;
