/**
 * Firebase Client SDK Configuration
 * This file initializes Firebase for frontend authentication
 */

// Firebase configuration - these values are safe to expose in frontend
const firebaseConfig = {
  apiKey: "AIzaSyAWF2XirH19Kx_qy1VDxooIvmh0SlTF-rY",
  authDomain: "platformgame-c0312.firebaseapp.com",
  projectId: "platformgame-c0312",
  storageBucket: "platformgame-c0312.firebasestorage.app",
  messagingSenderId: "785241480154",
  appId: "1:785241480154:web:918dead7a65cdbb3377ee3",
  measurementId: "G-WWTCW85G1N"
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
