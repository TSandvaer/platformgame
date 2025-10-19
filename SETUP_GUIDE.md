# Multi-User Platform Game Portal - Setup Guide

## ✅ What's Been Implemented

### Backend (100% Complete)
- ✅ Firebase Admin SDK integration
- ✅ User model with MongoDB
- ✅ Authentication middleware
- ✅ User registration and profile management API
- ✅ Game ownership and multi-user support
- ✅ Publishing system (publish/unpublish games)
- ✅ Public game gallery API
- ✅ Private game sharing with tokens
- ✅ Analytics (views, plays)

### Frontend (Phase 4 - 75% Complete)
- ✅ Firebase Auth client SDK
- ✅ Login page (`login.html`)
- ✅ Signup page (`signup.html`)
- ✅ Authentication state management (`authSystem.js`)
- ✅ User menu in editor with dropdown
- ✅ API client with auto-auth headers
- ✅ Publishing API methods
- ⏳ Publishing UI modal (placeholder - ready for implementation)
- ⏳ Game selector updates (needs testing)

### Still To Do
- ⏳ Publishing modal UI
- ⏳ Player app (separate lightweight build)
- ⏳ Public game gallery page
- ⏳ Build pipeline (Webpack/Vite)

---

## 🚀 Quick Start

### 1. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 2. Open the Editor

Navigate to: `http://localhost:3000/index.html`

You'll see:
- A "Login / Sign Up" button in the top right
- All existing functionality still works without logging in (backward compatible)

### 3. Create an Account

1. Click "Login / Sign Up"
2. Click "Sign up" link
3. Fill in:
   - Display Name: Your name
   - Username: lowercase, no spaces (used in URLs like `/play/yourname/gamename`)
   - Email: Your email
   - Password: At least 6 characters

4. Click "Create Account"

### 4. You're In!

After signing up, you'll be redirected to the editor and see:
- Your display name in the top-right corner
- A dropdown menu with options:
  - 📤 Publish Game
  - 🎮 My Games
  - 👤 Profile
  - 🚪 Logout

---

## 🎮 How It Works Now

### Game Ownership

**When logged in:**
- Games you create are automatically assigned to your account
- You only see YOUR games in the game selector
- Other users cannot edit your games

**When NOT logged in (legacy mode):**
- Works exactly as before
- Games are not owned by anyone
- Anyone can see and edit any game

### API Behavior

All API requests now include authentication headers when you're logged in:

```javascript
// Automatically adds: Authorization: Bearer <your-firebase-token>
await apiClient.getAllGames(); // Returns only YOUR games if authenticated
await apiClient.createGame('My Game'); // Auto-assigns to you
```

---

## 📤 Publishing Games (Coming Next)

The backend is ready! You can test publishing via the API:

```javascript
// Get current game ID
const gameId = apiClient.getCurrentGameId();

// Publish it
const result = await apiClient.publishGame(gameId, 'public');

console.log('Play URL:', result.game.playUrl);
// Example: /play/yourname/my-awesome-game
```

### Publishing Options

```javascript
// Public game (appears in gallery)
await apiClient.publishGame(gameId, 'public');

// Private game (share link only)
await apiClient.publishGame(gameId, 'private');
// Returns: shareUrl with token

// Custom slug
await apiClient.publishGame(gameId, 'public', 'super-mario-clone');
// URL: /play/yourname/super-mario-clone
```

---

## 🔐 Authentication Flow

### For Users:
1. Visit editor → Not logged in → See "Login / Sign Up" button
2. Click button → Go to login page
3. Sign up or log in
4. Redirected back to editor
5. See user menu with your name

### For Developers:

The `authSystem` object is available globally:

```javascript
// Check if user is logged in
if (authSystem.isAuthenticated()) {
  const user = authSystem.getCurrentUser();
  console.log('User:', user.userData.username);
}

// Listen for auth changes
authSystem.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user.userData);
  } else {
    console.log('User logged out');
  }
});

// Get auth headers for manual API calls
const headers = authSystem.getAuthHeaders();
// Returns: { 'Authorization': 'Bearer <token>' }
```

---

## 🗂️ New Files Structure

```
/js/auth/
  firebaseConfig.js      - Firebase client SDK configuration
  authSystem.js          - Authentication state management

/js/ui/
  userMenuHandler.js     - User menu dropdown logic

/css/
  auth.css               - Login/signup page styles
  user-menu.css          - User menu dropdown styles

/config/
  firebase.js            - Firebase Admin SDK (backend)

/middleware/
  auth.js                - Authentication middleware (backend)

/models/
  User.js                - User MongoDB model (backend)

/routes/
  users.js               - User API routes (backend)

login.html               - Login page
signup.html              - Signup page
```

---

## 🧪 Testing the System

### Test User Registration

1. Go to `http://localhost:3000/signup.html`
2. Create an account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`

### Test Game Ownership

1. Login as `testuser`
2. Create a new game "Test Game 1"
3. Logout
4. Create another account `testuser2`
5. Notice you don't see "Test Game 1" (it belongs to `testuser`)

### Test Publishing (via Console)

```javascript
// In browser console after logging in
const gameId = apiClient.getCurrentGameId();
const result = await apiClient.publishGame(gameId, 'public');
console.log('Published!', result.game.playUrl);
```

---

## 🐛 Troubleshooting

### "Firebase initialization skipped"
- Check that your `.env` file has valid Firebase credentials
- Restart the server after updating `.env`

### "User not found in database"
- The user exists in Firebase but not in MongoDB
- This happens if registration failed
- Delete the Firebase user and try signing up again

### Games not filtering by owner
- Make sure you're logged in
- Check browser console for auth errors
- Verify `Authorization` header is being sent:
  - Open DevTools → Network → Click on `/games` request → Headers tab

### Can't see user menu
- Firebase SDK might not have loaded
- Check browser console for errors
- Verify `authSystem` is available: type `authSystem` in console

---

## 🎯 Next Steps

### Recommended Implementation Order:

1. **Publishing Modal UI** (1-2 hours)
   - Add modal to editor for publishing games
   - Show game URL, visibility options
   - Generate share links for private games

2. **Game Gallery Page** (2-3 hours)
   - Create `gallery.html`
   - Browse all published games
   - Click to play

3. **Player App** (3-4 hours)
   - Separate build without editor code
   - Loads game from `/play/:username/:slug`
   - Minified and optimized

4. **Build Pipeline** (2-3 hours)
   - Webpack or Vite configuration
   - Separate bundles for editor vs player

---

## 💡 Tips

- **Backward Compatibility**: The system still works without authentication!
- **Testing**: Use incognito windows to test multiple users
- **Database**: Check MongoDB Atlas to see user and game data
- **Logs**: Server logs show all auth attempts

---

## 📚 API Reference

See `IMPLEMENTATION_PROGRESS.md` for complete API documentation including all 18 endpoints for user management, game publishing, and public access.

---

**You're ready to go!** The foundation is solid. Start by testing user registration and game ownership, then implement the publishing UI when ready.
