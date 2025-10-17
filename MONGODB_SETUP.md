# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for your Platform RPG Game and enable multi-game management.

## Features

With MongoDB Atlas integration, you can:
- **Create multiple games** - Manage different game projects/levels
- **Switch between games** - Easily switch which game you're editing
- **Cloud storage** - Your game data is stored in MongoDB Atlas
- **Duplicate games** - Create copies of existing games
- **Offline fallback** - localStorage backup when server is unavailable

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create an Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required)

### 1.2 Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select your preferred **Cloud Provider & Region** (choose closest to you)
4. Name your cluster (e.g., `PlatformGameCluster`)
5. Click **"Create Cluster"** (takes 3-5 minutes to provision)

### 1.3 Create Database User

1. On the left sidebar, go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter username: `gameAdmin` (or your choice)
5. Click **"Autogenerate Secure Password"**
6. **IMPORTANT**: Copy and save this password!
7. Set privileges to **"Read and write to any database"**
8. Click **"Add User"**

### 1.4 Configure Network Access

1. On the left sidebar, go to **Security → Network Access**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere" (0.0.0.0/0)**
   - ⚠️ For production, restrict to specific IPs
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go back to **Database** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username (e.g., `gameAdmin`)
7. Replace `<password>` with the password you saved earlier

---

## Step 2: Configure Your Project

### 2.1 Install Dependencies

Open a terminal in your project directory and run:

```bash
npm install
```

This installs:
- `express` - Web server
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `body-parser` - Request body parsing

### 2.2 Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace `YOUR_PASSWORD` and other placeholders with your actual connection string:

```env
MONGODB_URI=mongodb+srv://gameAdmin:YOUR_ACTUAL_PASSWORD@cluster.xxxxx.mongodb.net/platformGameDB?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

**Example:**
```env
MONGODB_URI=mongodb+srv://gameAdmin:aB3$xY9p@platformgamecluster.abc123.mongodb.net/platformGameDB?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

---

## Step 3: Start the Server

### 3.1 Run the Server

In your terminal, run:

```bash
npm start
```

You should see:
```
✓ Connected to MongoDB Atlas
✓ Database: platformGameDB
✓ Server running on http://localhost:3000
✓ API available at http://localhost:3000/api
✓ Game available at http://localhost:3000/index.html
```

### 3.2 Access Your Game

Open your browser and navigate to:
```
http://localhost:3000/index.html
```

---

## Step 4: Migrate Existing Data (Optional)

If you have existing game data in localStorage, you can migrate it to MongoDB.

### Option A: Migration Script (Recommended)

1. In browser console (F12), run:
   ```javascript
   console.log(JSON.stringify(localStorage.getItem('platformGame_gameData')));
   ```

2. Copy the output

3. In terminal, run:
   ```bash
   npm run migrate
   ```

4. Follow the prompts and paste your game data

### Option B: Manual Migration

1. Click **"Select Game"** button in the game
2. Click **"Create New Game"**
3. Enter a name and description
4. Check **"Copy current game data to new game"**
5. Click **"Create"**

---

## Using Multi-Game Management

### Creating a New Game

1. Click **"Select Game"** button (🎮 icon)
2. Click **"Create New Game"**
3. Enter game name and optionally description
4. Choose whether to copy current game data
5. Click **"Create"**

### Switching Between Games

1. Click **"Select Game"** button
2. Click **"Select"** on the game you want to edit
3. Confirm the switch
4. The page will reload with the selected game

### Duplicating a Game

1. Click **"Select Game"** button
2. Find the game you want to duplicate
3. Click **"Copy"** button
4. A new copy will be created (named "Game Name (Copy)")

### Deleting a Game

1. Click **"Select Game"** button
2. Find the game you want to delete
3. Click **"Delete"** button
4. Confirm deletion
5. ⚠️ You cannot delete the currently active game

---

## API Endpoints

The server provides the following REST API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/:id` | Get specific game |
| POST | `/api/games` | Create new game |
| PUT | `/api/games/:id` | Update game metadata |
| PATCH | `/api/games/:id` | Save game data (auto-save) |
| DELETE | `/api/games/:id` | Delete game |
| POST | `/api/games/:id/duplicate` | Duplicate game |
| GET | `/api/health` | Health check |

---

## Troubleshooting

### "Cannot connect to server"

**Solution:**
1. Make sure the server is running (`npm start`)
2. Check that MongoDB Atlas IP whitelist is configured
3. Verify your connection string in `.env`

### "Authentication failed"

**Solution:**
1. Check username and password in `.env`
2. Make sure password doesn't have special characters that need URL encoding
3. Recreate database user in MongoDB Atlas if needed

### Game data not saving

**Solution:**
1. Check browser console for errors
2. Verify server is running and connected to MongoDB
3. Check that a game is selected (use Select Game button)
4. localStorage fallback should still work offline

### Port 3000 already in use

**Solution:**
1. Change PORT in `.env` to a different number (e.g., 3001)
2. Update the frontend to use the new port

---

## Advanced Configuration

### Storage Mode

You can switch between storage modes in `js/gameData/gameDataStorage.js`:

```javascript
this.storageMode = 'mongodb'; // or 'localStorage'
this.useLocalStorageFallback = true; // Enable fallback
```

### Auto-Save Interval

Adjust auto-save frequency in `js/gameData/gameDataStorage.js`:

```javascript
this.autoSaveInterval = 60000; // 60 seconds
```

---

## Production Deployment

For deploying to production:

1. **Restrict IP Access** in MongoDB Atlas
2. **Set NODE_ENV** to `production` in `.env`
3. **Use environment variables** for sensitive data
4. **Enable HTTPS** for secure communication
5. **Add authentication** if needed for multi-user support

---

## Support

For issues or questions:
1. Check MongoDB Atlas logs in the Atlas dashboard
2. Check server console output for error messages
3. Check browser console for frontend errors
4. Verify all dependencies are installed (`npm install`)

---

## File Structure

```
platformgame/
├── server.js                 # Express server
├── package.json              # Dependencies
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example             # Example environment file
├── models/
│   └── Game.js              # MongoDB schema
├── routes/
│   └── games.js             # API routes
├── js/
│   ├── api/
│   │   └── apiClient.js     # Frontend API client
│   ├── ui/
│   │   └── gameSelector.js  # Game selection UI
│   └── gameData/
│       ├── gameDataStorage.js   # Storage layer (updated)
│       └── gameDataSystem.js    # Data management (updated)
├── css/
│   └── game-selector.css    # Game selector styles
└── scripts/
    └── migrateToMongoDB.js  # Migration utility
```

Happy game developing! 🎮
