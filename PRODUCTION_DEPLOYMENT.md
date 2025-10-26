# Production Deployment Guide

## Overview

Your game now has **automatic builds and deployment** configured! When you push to GitHub, the build process creates an optimized production bundle.

## What's Different in Production?

### Development (Local)
- ❌ 90+ separate JavaScript files
- ❌ Unminified code
- ❌ No optimization
- ✅ Easy debugging with source files

### Production (DigitalOcean)
- ✅ 1 bundled JavaScript file
- ✅ Minified & compressed (60-80% smaller!)
- ✅ Tree-shaking (removes unused code)
- ✅ Optimized asset loading
- ✅ Much faster load times!

---

## Deployment Options

You have **three deployment options** for DigitalOcean:

### Option 1: DigitalOcean App Platform ⭐ RECOMMENDED

**Easiest setup, automatic deployments!**

#### Setup Steps:

1. **Create App on DigitalOcean**
   - Go to DigitalOcean Dashboard → Apps
   - Click "Create App"
   - Connect your GitHub repository
   - Select branch: `master` or `main`

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Run Command: npm start
   ```

3. **Set Environment Variables**
   - Add all variables from your `.env` file:
     - `MONGODB_URI`
     - `NODE_ENV=production`
     - `PORT=8080` (or whatever App Platform assigns)
     - Firebase credentials
     - etc.

4. **Deploy!**
   - Click "Deploy"
   - App Platform will automatically:
     - Install dependencies (`npm install`)
     - Run build (`npm run build`)
     - Start server (`npm start`)
     - Serve from `dist/` folder

**Continuous Deployment:**
- Every push to `master`/`main` triggers auto-deploy
- No GitHub Actions needed (App Platform handles it)
- Automatic HTTPS, scaling, monitoring

---

### Option 2: Droplet with SSH Deployment

**More control, requires manual setup**

#### Prerequisites on Droplet:

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/platformgame
sudo chown -R $USER:$USER /var/www/platformgame
```

#### Configure GitHub Actions:

1. **Add GitHub Secrets** (Settings → Secrets → Actions):
   ```
   DROPLET_HOST = your-droplet-ip
   DROPLET_USERNAME = your-ssh-username
   DROPLET_SSH_KEY = your-private-ssh-key
   ```

2. **Enable SSH deployment in `.github/workflows/deploy.yml`**:
   - Uncomment "OPTION B" section in the workflow file
   - The workflow will:
     - Build the project
     - Copy files to droplet via SCP
     - Restart app with PM2

3. **First-time setup on Droplet**:
   ```bash
   cd /var/www/platformgame

   # Create .env file
   nano .env
   # Add your environment variables

   # Start with PM2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup  # Follow instructions to enable startup
   ```

**Continuous Deployment:**
- Push to `master`/`main` → GitHub Actions builds → Deploys to Droplet → PM2 restarts

---

### Option 3: Manual Deployment

**For testing or custom setups**

#### Build locally and deploy:

```bash
# 1. Build the project
npm run build

# 2. Upload to server (using scp, rsync, or FTP)
scp -r dist/ user@server:/var/www/platformgame/
scp server.js package.json user@server:/var/www/platformgame/
scp -r routes/ models/ middleware/ config/ user@server:/var/www/platformgame/

# 3. SSH into server and restart
ssh user@server
cd /var/www/platformgame
npm install --production
NODE_ENV=production npm start
# OR with PM2:
pm2 restart platformgame
```

---

## Environment Variables

### Required in Production:

Create a `.env` file on your production server:

```env
# Environment
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Other configs
# Add any other environment variables your app needs
```

---

## Using PM2 (Process Manager)

PM2 keeps your app running, restarts on crashes, and provides monitoring.

### Basic Commands:

```bash
# Start app
pm2 start ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs platformgame

# Restart
pm2 restart platformgame

# Stop
pm2 stop platformgame

# Delete
pm2 delete platformgame

# Monitor in real-time
pm2 monit

# Save current process list
pm2 save

# Set up auto-start on server reboot
pm2 startup
```

### PM2 Configuration

Edit `ecosystem.config.js` to customize:
- Memory limits
- Number of instances
- Log file locations
- Auto-restart behavior

---

## Build Scripts Reference

```bash
# Development (local)
npm start                 # Start server (development mode)
npm run dev              # Start with nodemon (auto-restart)

# Building
npm run build            # Production build (minified)
npm run build:dev        # Development build (with source maps)
npm run build:watch      # Watch mode (rebuild on changes)

# Type checking
npm run type-check       # Check TypeScript types

# Testing build locally
NODE_ENV=production npm start  # Run server in production mode
```

---

## Verifying Production Build

### 1. Test Build Locally

```bash
# Build the project
npm run build

# Check dist/ folder
ls -la dist/

# Start server in production mode
NODE_ENV=production npm start

# Open http://localhost:3000
# Game should load from bundled files
```

### 2. Check Server Logs

Look for this when server starts:

```
============================================================
🚀 Platform RPG Server - PRODUCTION MODE
============================================================
✓ Server running on http://localhost:3000
✓ Static files served from: dist/ (webpack build)
```

### 3. Browser Network Tab

Open DevTools → Network tab:
- Should see `bundle.[hash].js` (1 file, ~200-500KB)
- NOT 90+ individual .js files
- Assets loaded from `/sprites/`, `/backgrounds/`, etc.

---

## Troubleshooting

### Build fails on GitHub Actions

**Check the Actions tab** on GitHub to see error logs.

Common issues:
- Missing dependencies → Check `package.json`
- TypeScript errors → Run `npm run type-check` locally
- Out of memory → May need larger GitHub runner

### Server serves wrong files

**Check environment variable:**
```bash
echo $NODE_ENV
# Should output: production
```

**Verify static directory:**
```bash
cd /var/www/platformgame
ls -la dist/  # Should exist with bundle files
```

### Assets (sprites, backgrounds) not loading

**Ensure dist/ contains all assets:**
```bash
ls -la dist/sprites/
ls -la dist/backgrounds/
ls -la dist/css/
```

Webpack copies these automatically (configured in `webpack.config.js`).

### MongoDB connection fails

**Check environment variables:**
```bash
pm2 env platformgame  # Shows all env vars
```

Make sure `MONGODB_URI` is set correctly.

### Socket.io not working

**Check CORS configuration** in `server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: 'https://your-actual-domain.com',  // Update this!
    methods: ['GET', 'POST']
  }
});
```

---

## Performance Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web-based dashboard (optional)
pm2 install pm2-server-monit
```

### DigitalOcean Monitoring

- CPU usage
- Memory usage
- Bandwidth
- Response times

Access via DigitalOcean Dashboard → Droplet → Graphs

---

## Security Checklist

- ✅ `dist/` not in git (built on CI server)
- ✅ `.env` not in git (secrets protected)
- ✅ NODE_ENV=production in production
- ✅ Dependencies up to date (`npm audit`)
- ✅ CORS configured for your domain
- ✅ HTTPS enabled (via DigitalOcean proxy)
- ✅ Rate limiting (add if needed)
- ✅ Firewall rules configured

---

## Rollback Strategy

### If deployment breaks:

**Option 1: Rollback via Git**
```bash
# Revert to previous commit
git revert HEAD
git push

# GitHub Actions will deploy previous version
```

**Option 2: Manual rollback on server**
```bash
ssh user@server
cd /var/www/platformgame
git pull origin main
git checkout <previous-commit-hash>
npm run build
pm2 restart platformgame
```

**Option 3: Keep backup**
```bash
# Before deploying, backup current version
ssh user@server
cd /var/www
tar -czf platformgame-backup-$(date +%Y%m%d).tar.gz platformgame/

# Restore if needed
tar -xzf platformgame-backup-YYYYMMDD.tar.gz
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes (or fix warnings)
- [ ] Environment variables configured on server
- [ ] MongoDB accessible from production server
- [ ] Firebase credentials configured
- [ ] CORS settings updated for production domain
- [ ] SSL/HTTPS enabled
- [ ] Backup of current production version taken
- [ ] PM2 configured and tested
- [ ] Monitoring set up
- [ ] Tested build locally with `NODE_ENV=production npm start`

---

## Quick Reference

### Development Workflow

```bash
# Day-to-day development
npm start                    # Develop normally
# Edit JS files, no build needed
# Open index.html or http://localhost:3000
```

### Deployment Workflow

```bash
# When ready to deploy
git add .
git commit -m "Your changes"
git push origin master

# GitHub Actions automatically:
# 1. npm install
# 2. npm run build
# 3. Deploy to DigitalOcean
# 4. Restart server
```

### Monitoring

```bash
# Check if app is running
pm2 status

# View logs
pm2 logs platformgame --lines 100

# Check server health
curl http://your-server.com/api/health
```

---

## Summary

✅ **Server updated** - Detects production/development automatically
✅ **GitHub Actions** - Builds and deploys on push
✅ **PM2 config** - Process management in production
✅ **Webpack optimized** - Single bundle, 60-80% smaller files
✅ **Automatic deployment** - Push to GitHub → Live in minutes

**Your game now has professional-grade deployment! 🚀**

For questions or issues, check:
- GitHub Actions logs (Actions tab on GitHub)
- Server logs (`pm2 logs platformgame`)
- DigitalOcean monitoring dashboard
