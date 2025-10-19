const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * This is used for server-side authentication token verification
 */
let firebaseApp;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    throw error;
  }
};

/**
 * Get Firebase Admin instance
 */
const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<DecodedIdToken>} Decoded token with user info
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  verifyIdToken,
  admin,
};
