const { verifyIdToken } = require('../config/firebase');
const User = require('../models/User');

/**
 * Middleware to verify Firebase authentication token
 * Attaches user object to request if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    // Extract token
    const idToken = authHeader.split('Bearer ')[1];

    // Verify token with Firebase
    const decodedToken = await verifyIdToken(idToken);

    // Find user in database by Firebase UID
    const user = await User.findByFirebaseUid(decodedToken.uid);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found in database. Please complete registration.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.firebaseUid = decodedToken.uid;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token'
      });
    }

    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block request if no token
 * Useful for routes that can be accessed by both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const user = await User.findByFirebaseUid(decodedToken.uid);

    if (user && user.isActive) {
      req.user = user;
      req.firebaseUid = decodedToken.uid;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user has specific role
 * Should be used after authenticate middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns a resource
 * Expects resource to have an 'ownerId' field
 */
const requireOwnership = (getResource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const resource = await getResource(req);

      if (!resource) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Resource not found'
        });
      }

      // Check ownership (convert both to strings for comparison)
      if (resource.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }

      // Attach resource to request for later use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        error: 'Server error',
        message: 'An error occurred while checking permissions'
      });
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireOwnership,
};
