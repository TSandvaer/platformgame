# Quick Test Guide - Multi-User Platform Game Portal

## Prerequisites
- MongoDB Atlas running (connection string in `.env`)
- Firebase project configured (credentials in `.env`)
- Node.js and npm installed

---

## Step 1: Start the Server

```bash
npm start
```

Expected output:
```
✅ Firebase Admin SDK initialized successfully
✅ Connected to MongoDB Atlas
Server running on port 3000
```

---

## Step 2: Create Your First User

1. **Open signup page:**
   - Navigate to: `http://localhost:3000/signup.html`

2. **Fill in the form:**
   - Email: `test@example.com`
   - Password: `password123` (at least 6 characters)
   - Username: `testuser` (lowercase, will be used in URLs)
   - Display Name: `Test User`

3. **Submit the form**
   - Username availability will be checked in real-time
   - If successful, you'll be redirected to the editor
   - You should see "Test User" in the top-right corner

**Troubleshooting:**
- If username is taken, try: `testuser2`, `testuser3`, etc.
- Check browser console for errors
- Verify Firebase is configured correctly in `.env`

---

## Step 3: Create a Simple Game

1. **Create a new game:**
   - Click "🎮 Select Game" button
   - Click "Create New Game"
   - Enter name: "My First Game"
   - Click "Create"

2. **Add platforms:**
   - Switch to "Platforms" tab in right panel
   - Click "Add Platform (Click on map)"
   - Click on the canvas to place platforms
   - Create a simple level with 2-3 platforms

3. **Add an enemy (optional):**
   - Switch to "Enemies" tab
   - Click "Open Enemy Editor"
   - Select an enemy type (e.g., Orc)
   - Click "Add Enemy (Click on map)"
   - Click near a platform to place enemy

4. **Test your game:**
   - Click "Production Mode" button
   - Use WASD or Arrow keys to move
   - Space to jump
   - Verify player can move and jump on platforms

5. **Save the game:**
   - Click "Save Current Scene" button
   - You should see "Scene Saved!" notification

---

## Step 4: Publish Your Game

1. **Open publish modal:**
   - Click your username (top-right)
   - Select "📤 Publish Game"

2. **Configure publishing:**
   - Status should show "Not Published"
   - Leave slug blank (will auto-generate) or enter custom: `my-game`
   - Select "Public" visibility
   - Click "Publish Game"

3. **Copy the URL:**
   - Modal will show: `http://localhost:3000/play/testuser/my-first-game`
   - Click "📋 Copy URL" button
   - Keep this URL for Step 6

**Expected result:**
- Success message appears
- URL preview shows your game URL
- Status changes to "Published"

---

## Step 5: Browse the Gallery

1. **Open gallery:**
   - Navigate to: `http://localhost:3000/gallery.html`

2. **Verify your game appears:**
   - You should see "My First Game" card
   - Shows author: "Test User"
   - Shows 0 views, 0 plays (for now)
   - Click on the card to play (will test in Step 6)

**Troubleshooting:**
- If game doesn't appear, verify it's published with "public" visibility
- Check "Sort by: Newest First" is selected
- Refresh the page

---

## Step 6: Play Your Published Game

1. **Navigate to your game URL:**
   - Use the URL from Step 4: `http://localhost:3000/play/testuser/my-first-game`
   - OR click on your game in the gallery

2. **Wait for loading:**
   - You should see "Loading Game..." with spinner
   - Game title "My First Game" should appear in header
   - Author "by Test User" should be visible

3. **Play the game:**
   - Canvas should display your game
   - Use WASD or Arrow keys to move
   - Space to jump
   - Your platforms and enemies should be visible
   - Game should play identically to production mode in editor

4. **Try fullscreen:**
   - Click "⛶ Fullscreen" button
   - Game should go fullscreen
   - Press ESC to exit fullscreen

**Expected behavior:**
- Game loads within 2-3 seconds
- All game elements render correctly
- Player controls work
- No console errors

---

## Step 7: Test Private Game Sharing

1. **Create another game:**
   - Go back to editor: `http://localhost:3000/index.html`
   - Create new game: "Secret Game"
   - Add some platforms
   - Save the scene

2. **Publish as private:**
   - Click username → "📤 Publish Game"
   - Select "Private" visibility
   - Click "Publish Game"

3. **Copy the share link:**
   - Note: Two URLs appear:
     - Regular URL: `http://localhost:3000/play/testuser/secret-game`
     - Share Link: `http://localhost:3000/play/testuser/secret-game?token=abc123...`
   - Copy the share link (with token)

4. **Test access:**
   - Open regular URL (without token) in incognito window:
     - Should show error: "Game not found"
   - Open share link (with token):
     - Should load and play successfully

**This proves private games are secure!**

---

## Step 8: Verify Analytics

1. **Play your game multiple times:**
   - Play "My First Game" 2-3 times
   - Each play should increment counters

2. **Check the gallery:**
   - Refresh `gallery.html`
   - Your game should show updated play count

3. **Check publish modal:**
   - Open editor
   - Click username → "📤 Publish Game"
   - Views and Plays should be updated

---

## Step 9: Test Unpublishing

1. **Unpublish a game:**
   - In publish modal, click "Unpublish" button
   - Confirm the action

2. **Verify it's hidden:**
   - Check gallery - game should no longer appear
   - Try accessing play URL directly:
     - Should show "Game Not Found" error

3. **Re-publish:**
   - Open publish modal again
   - Click "Publish Game"
   - Game reappears in gallery

---

## Step 10: Create a Second User

1. **Logout:**
   - Click username → "🚪 Logout"

2. **Create new account:**
   - Go to `signup.html`
   - Email: `user2@example.com`
   - Username: `seconduser`
   - Display Name: `Second User`

3. **Create and publish game:**
   - Repeat Steps 3-4 with a different game

4. **Verify gallery:**
   - Gallery should now show games from both users
   - Each game shows correct author

---

## Success Criteria

✅ Server starts without errors
✅ User registration works
✅ Login/logout works
✅ Game creation and saving works
✅ Publishing modal works
✅ Public games appear in gallery
✅ Published games are playable
✅ Private games require token
✅ Analytics track views/plays
✅ Multiple users can coexist
✅ Unpublishing hides games

---

## Common Issues and Solutions

### Issue: "Firebase Admin SDK initialization failed"
**Solution:**
- Check `.env` file has Firebase credentials
- Verify `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)
- Restart server after updating `.env`

### Issue: "Username taken" during signup
**Solution:**
- Try a different username
- Usernames must be unique
- Check MongoDB for existing usernames

### Issue: Game doesn't load in player
**Solution:**
- Open browser console (F12)
- Check for JavaScript errors
- Verify game is published
- Check network tab for API failures

### Issue: Gallery shows no games
**Solution:**
- Verify at least one game is published with "public" visibility
- Check MongoDB for published games
- Verify API endpoint: `http://localhost:3000/api/games/public/gallery`

### Issue: "Game Not Found" when playing
**Solution:**
- Verify game is published
- Check URL format: `/play/:username/:slug`
- For private games, ensure token is included
- Check game slug matches URL

---

## What to Test Next

1. **Edge Cases:**
   - Very long game names
   - Special characters in display names
   - Duplicate slug attempts
   - Unpublish → Edit → Re-publish

2. **Browser Compatibility:**
   - Test in Chrome, Firefox, Safari
   - Test on mobile devices
   - Test fullscreen on different browsers

3. **Performance:**
   - Create game with many platforms/enemies
   - Test loading time
   - Test game performance in player

4. **Security:**
   - Try accessing another user's games
   - Try publishing without authentication
   - Try accessing private game without token

---

## Getting Help

If you encounter any issues:

1. **Check the documentation:**
   - `COMPLETE_IMPLEMENTATION.md` - Full system overview
   - `IMPLEMENTATION_PROGRESS.md` - Technical details
   - `SETUP_GUIDE.md` - Setup instructions

2. **Check the console:**
   - Browser console (F12) for frontend errors
   - Server terminal for backend errors

3. **Common log messages:**
   - `✅ Firebase Admin SDK initialized successfully` - Good!
   - `✅ Connected to MongoDB Atlas` - Good!
   - `⚠ Firebase initialization skipped` - Check Firebase config
   - `❌ Error:` - Read error message for details

---

## Next Steps

Once everything is working:

1. **Customize the styling** - Edit CSS files to match your brand
2. **Add more features** - User profiles, ratings, categories
3. **Optimize for production** - Minify, bundle, CDN
4. **Deploy** - Host on Heroku, Vercel, or your preferred platform

Congratulations! Your multi-user platform game portal is fully functional! 🎉
