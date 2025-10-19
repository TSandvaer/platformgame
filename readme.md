# Platform RPG Game

A full-featured platform RPG game with a comprehensive editor, MongoDB backend, Firebase authentication, and multi-user support.

## Features

### Game Editor
- **Visual Scene Editor** - Create and edit game levels with a drag-and-drop interface
- **Multi-layer System** - Platforms, props, enemies, NPCs, and lootables
- **Character System** - Multiple playable characters (Soldier, Dwarf Warrior, Wizard, Archer)
- **Inventory System** - Full inventory management with drag-and-drop
- **Physics Engine** - Platform physics with gravity, jumping, and collisions
- **Enemy AI** - Intelligent enemies with patrol zones and attack behaviors
- **Scene Management** - Multiple scenes with transitions
- **Save System** - Multiple save slots per player per game

### Player Experience
- **Published Games** - Share your games with unique URLs
- **Game Sessions** - Multiple save slots per game with character locking
- **Authentication** - Firebase-based user accounts
- **Progress Tracking** - Auto-save every 30 seconds
- **Gallery** - Browse and play published games

## Technology Stack

- **Frontend**: HTML5 Canvas, JavaScript (ES6+), CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **Optimization**: Server-side Gzip/Deflate compression

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project (for authentication)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd platformgame
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/platformGameDB
   PORT=3000
   ```

4. **Configure Firebase**

   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Download your Firebase Admin SDK JSON file
   - Place it in the project root
   - Update `config/firebase.js` with your credentials

---

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon (auto-restart on file changes):
- **Editor**: `http://localhost:3000/index.html`
- **Gallery**: `http://localhost:3000/gallery.html`
- **API**: `http://localhost:3000/api`

### Production Mode

```bash
npm start
```

Starts the server with production optimizations:
- **Gzip/Deflate compression** (60-70% file size reduction)
- **Automatic compression** for all text files (HTML, CSS, JS)
- **Cache headers** for optimal browser caching

---

## Performance Optimization

The server automatically compresses all responses using **gzip/deflate**:

### Compression Benefits
- ✅ **60-70% file size reduction** for text files
- ✅ **Faster page loads** (especially on slower connections)
- ✅ **Lower bandwidth usage** (saves hosting costs)
- ✅ **No build step required** (works with existing code)
- ✅ **Transparent to browsers** (automatic decompression)

### What Gets Compressed
- All HTML files
- All JavaScript files
- All CSS files
- JSON API responses
- SVG images

### Performance Metrics

| File Type | Original Size | Compressed Size | Reduction |
|-----------|--------------|-----------------|-----------|
| JavaScript | ~2.5 MB | ~700 KB | 72% |
| HTML | ~200 KB | ~50 KB | 75% |
| CSS | ~100 KB | ~25 KB | 75% |
| JSON | Variable | Variable | 60-70% |

**Total bandwidth savings: ~65-70% on average**

---

## Project Structure

```
platformgame/
├── js/                     # Game engine source code
│   ├── auth/              # Authentication system
│   ├── player/            # Player system & controls
│   ├── enemy/             # Enemy AI & behavior
│   ├── platforms/         # Platform system
│   ├── props/             # Props & obstacles
│   ├── scenes/            # Scene management
│   ├── ui/                # UI components
│   └── gameEditor/        # Editor-specific code
├── css/                    # Stylesheets
├── routes/                 # Express API routes
├── models/                 # MongoDB models
├── config/                 # Configuration files
├── server.js              # Express server with compression
├── package.json           # Dependencies & scripts
└── .env                   # Environment variables (not in git)
```

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run migrate` | Run database migrations |
| `npm run cleanup` | Cleanup duplicate database entries |

---

## API Endpoints

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game by ID
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game
- `GET /api/games/play/:username/:slug` - Get published game

### Users
- `POST /api/users` - Create user
- `GET /api/users/:firebaseUid` - Get user profile
- `PUT /api/users/:firebaseUid` - Update user profile

### Sessions
- `GET /api/sessions/:gameId` - List user's game sessions
- `POST /api/sessions/:gameId` - Create new session
- `GET /api/sessions/:gameId/:sessionId` - Load session
- `PUT /api/sessions/:gameId/:sessionId` - Save session progress
- `DELETE /api/sessions/:gameId/:sessionId` - Delete session

---

## Deployment

### Deployment Checklist

1. ✅ Install production dependencies: `npm install --production`
2. ✅ Configure MongoDB connection string in `.env`
3. ✅ Configure Firebase credentials
4. ✅ Set `PORT` environment variable (default: 3000)
5. ✅ Start server: `npm start`

### Recommended Hosting Platforms

- **Heroku** - Easy deployment with Git
- **DigitalOcean** - Full control with droplets
- **AWS EC2** - Scalable cloud hosting
- **Render** - Modern deployment platform
- **Railway** - Simple deploy from GitHub

### Environment Variables for Production

```env
MONGODB_URI=<your-mongodb-atlas-uri>
PORT=3000
```

### Compression Notes

- Compression is **always enabled** by default
- Works automatically with all major browsers
- No configuration needed
- To disable for specific requests, send `x-no-compression` header

---

## Troubleshooting

### Server Issues

**Server won't start**
- Check MongoDB connection string in `.env`
- Ensure port 3000 is not in use
- Verify Firebase credentials are configured

**Slow performance**
- Check browser network tab to verify compression is working
- Look for `Content-Encoding: gzip` in response headers
- Ensure server has adequate resources

### Database Issues

**MongoDB connection failed**
- Verify connection string format
- Check MongoDB Atlas whitelist (allow your IP)
- Ensure database user has correct permissions

**Firebase authentication not working**
- Verify Firebase Admin SDK JSON file is in project root
- Check Firebase project settings
- Ensure Firebase Auth is enabled in console

---

## Future Enhancements

Potential optimizations for future releases:

### Code Optimization
- Convert to ES modules for better tree-shaking
- Implement build system (Vite/Webpack) for bundling
- Add code splitting for lazy loading

### Performance
- Implement CDN for static assets
- Add service worker for offline support
- Enable HTTP/2 server push

### Features
- Multiplayer support
- Cloud save sync
- Achievement system
- Level editor improvements

---

## License

ISC

---

## Support

For issues or questions:
1. Check this README
2. Review the `.env.example` configuration
3. Check console logs for errors
4. Review MongoDB Atlas connection
5. Verify Firebase configuration
6. Check browser network tab for compression headers
