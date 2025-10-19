# Platform RPG Game - Deployment Guide

Complete guide for deploying your Platform RPG game to DigitalOcean App Platform with custom domain support.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Hosting Requirements](#hosting-requirements)
4. [Step 1: GitHub Setup](#step-1-github-setup)
5. [Step 2: MongoDB Atlas Configuration](#step-2-mongodb-atlas-configuration)
6. [Step 3: Firebase Configuration](#step-3-firebase-configuration)
7. [Step 4: DigitalOcean App Platform Setup](#step-4-digitalocean-app-platform-setup)
8. [Step 5: Custom Domain Setup](#step-5-custom-domain-setup)
9. [Post-Deployment Testing](#post-deployment-testing)
10. [Troubleshooting](#troubleshooting)
11. [Cost Breakdown](#cost-breakdown)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ GitHub account and repository with your code
- ✅ MongoDB Atlas account with database created
- ✅ Firebase project with Authentication enabled
- ✅ Domain name purchased (for custom domain)
- ✅ DigitalOcean account (sign up at [digitalocean.com](https://digitalocean.com))

---

## Pre-Deployment Checklist

### Required Environment Variables

You'll need these values ready:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/platformGameDB

# Firebase Authentication
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Where to Find These Values

**MongoDB Atlas:**
- Log in to [MongoDB Atlas](https://cloud.mongodb.com)
- Go to Database → Connect → Connect your application
- Copy the connection string

**Firebase:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Go to Project Settings → Service Accounts
- Click "Generate New Private Key"
- Download the JSON file
- Extract: `project_id`, `client_email`, `private_key`

---

## Hosting Requirements

### Server Requirements
- **Node.js**: v16 or higher
- **RAM**: 512MB minimum (1GB recommended)
- **Storage**: 1GB minimum
- **Bandwidth**: Moderate (compression reduces by ~70%)

### What's Included in Your App
- ✅ Express.js server
- ✅ Gzip/Deflate compression (automatic)
- ✅ MongoDB Atlas connection
- ✅ Firebase Authentication
- ✅ Health check endpoint (`/api/health`)
- ✅ CORS enabled
- ✅ Static file serving

---

## Step 1: GitHub Setup

### 1.1 Initialize Git Repository (if not done)

```bash
cd C:\Trunk\platformgame
git init
```

### 1.2 Create .gitignore (already exists)

Verify these are in `.gitignore`:
```
node_modules/
.env
*-firebase-adminsdk-*.json
*.log
```

### 1.3 Commit Your Code

```bash
git add .
git commit -m "Prepare for deployment"
```

### 1.4 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "+" → "New repository"
3. Name it (e.g., "platformgame")
4. **DO NOT** initialize with README (you already have code)
5. Click "Create repository"

### 1.5 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/platformgame.git
git branch -M main
git push -u origin main
```

**✅ Checkpoint:** Your code should now be visible on GitHub.

---

## Step 2: MongoDB Atlas Configuration

### 2.1 Whitelist DigitalOcean IPs

Since DigitalOcean uses dynamic IPs, you have two options:

**Option A: Allow All IPs (Easier)**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Add IP: `0.0.0.0/0`
5. Click "Confirm"

**Option B: Whitelist Specific IPs (More Secure)**
- Wait until after deployment
- Get your app's outbound IP from DigitalOcean
- Add it to Network Access

### 2.2 Get Connection String

1. MongoDB Atlas → Database → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<database>` with `platformGameDB`

**Example:**
```
mongodb+srv://gameAdmin:MySecurePassword123@cluster0.abc123.mongodb.net/platformGameDB?retryWrites=true&w=majority
```

**✅ Checkpoint:** Test connection locally by updating `.env` and running `npm start`

---

## Step 3: Firebase Configuration

### 3.1 Enable Authentication

1. Firebase Console → Authentication
2. Click "Get Started"
3. Enable sign-in methods you want (Email/Password, Google, etc.)

### 3.2 Add Authorized Domains

After deployment, you'll need to add your production domain:

1. Firebase Console → Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Add your custom domain (e.g., `yourgame.com`)
4. Also add the DigitalOcean app URL (e.g., `yourapp.ondigitalocean.app`)

**Note:** Do this AFTER deployment when you have your URLs.

### 3.3 Get Service Account Credentials

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Click "Generate Key" (downloads JSON file)
4. Open the JSON file and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**⚠️ Important:** Keep this JSON file secure! Don't commit it to Git.

**✅ Checkpoint:** You should have all three Firebase values ready.

---

## Step 4: DigitalOcean App Platform Setup

### 4.1 Create DigitalOcean Account

1. Go to [DigitalOcean.com](https://digitalocean.com)
2. Sign up (you may get $200 credit for 60 days)
3. Verify your email

### 4.2 Create New App

1. Go to **Apps** in the sidebar
2. Click "Create App"
3. Choose "GitHub" as source
4. Click "Manage Access" and authorize DigitalOcean
5. Select your repository: `YOUR_USERNAME/platformgame`
6. Select branch: `main`
7. Check "Autodeploy" (app rebuilds on every push)
8. Click "Next"

### 4.3 Configure Resources

**App Name:**
- Enter a name (e.g., `platform-rpg-game`)
- This becomes your URL: `platform-rpg-game.ondigitalocean.app`

**Environment Settings:**
- **Type**: Web Service
- **Instance Type**: Basic ($5/month)
- **Instance Size**: $5/mo (512MB RAM, 1 vCPU)

**Build Settings:**
- **Build Command**: `npm install`
- **Run Command**: `npm start`
- **HTTP Port**: 3000 (or leave blank, auto-detected)

Click "Next"

### 4.4 Add Environment Variables

Click "Edit" next to your web service → Environment Variables:

Add these variables:

| Key | Value | Encrypt? |
|-----|-------|----------|
| `MONGODB_URI` | Your connection string | ✅ Yes |
| `FIREBASE_PROJECT_ID` | Your project ID | ❌ No |
| `FIREBASE_CLIENT_EMAIL` | Your service account email | ❌ No |
| `FIREBASE_PRIVATE_KEY` | Your private key | ✅ Yes |
| `PORT` | 3000 | ❌ No |

**⚠️ Important - Private Key Formatting:**

Your `FIREBASE_PRIVATE_KEY` should include the full key with newlines:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
...
-----END PRIVATE KEY-----
```

**If it's on multiple lines in the JSON**, copy it exactly as is (with `\n` characters).

**Tip:** Test locally first with these exact values in your `.env` file.

Click "Save"

### 4.5 Review and Create

1. Review all settings
2. Monthly cost should show ~$5-12
3. Click "Create Resources"

### 4.6 Wait for Deployment

- Initial build takes 2-5 minutes
- Watch the build logs for errors
- Status will change from "Building" → "Deploying" → "Running"

**✅ Checkpoint:** App should be accessible at `https://yourapp.ondigitalocean.app`

### 4.7 Test the Deployment

Visit these URLs:

- **Health Check**: `https://yourapp.ondigitalocean.app/api/health`
  - Should return: `{"status":"ok","database":"connected",...}`

- **Editor**: `https://yourapp.ondigitalocean.app/index.html`
  - Should load the game editor

- **Gallery**: `https://yourapp.ondigitalocean.app/gallery.html`
  - Should load the game gallery

**🚨 If anything fails, check the [Troubleshooting](#troubleshooting) section.**

---

## Step 5: Custom Domain Setup

### 5.1 Purchase Domain

Buy a domain from any registrar:
- **Namecheap** (recommended, affordable)
- **GoDaddy**
- **Google Domains**
- **Cloudflare**

**Example:** `awesomeplatformgame.com` (~$10-15/year)

### 5.2 Add Domain to DigitalOcean App

1. Go to your App → Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Click "Add Domain"
5. DigitalOcean will provide DNS records to configure

### 5.3 Configure DNS Records

You'll see instructions like this:

**For Root Domain (`yourdomain.com`):**
```
Type: A
Name: @
Value: 143.198.XXX.XXX  (DigitalOcean IP)
TTL: 3600
```

**For WWW Subdomain (`www.yourdomain.com`):**
```
Type: CNAME
Name: www
Value: yourapp.ondigitalocean.app
TTL: 3600
```

### 5.4 Update DNS at Your Registrar

**Example: Namecheap**
1. Log in to Namecheap
2. Go to Domain List → Manage
3. Go to "Advanced DNS" tab
4. Add the A record:
   - Type: A Record
   - Host: @
   - Value: [IP from DigitalOcean]
   - TTL: Automatic
5. Add the CNAME record:
   - Type: CNAME Record
   - Host: www
   - Value: yourapp.ondigitalocean.app
   - TTL: Automatic
6. Save changes

**Example: GoDaddy**
1. Log in to GoDaddy
2. Go to My Products → Domains
3. Click DNS next to your domain
4. Add Records (same as above)

### 5.5 Wait for DNS Propagation

- DNS changes take **15 minutes to 48 hours**
- Usually works within **1-2 hours**
- Test with: [whatsmydns.net](https://whatsmydns.net)

### 5.6 Enable SSL Certificate (Automatic)

DigitalOcean automatically provisions a free SSL certificate:
- Happens automatically after DNS is configured
- Takes ~5-10 minutes
- Your site will be accessible via `https://yourdomain.com`

**✅ Checkpoint:** Your game should be live at `https://yourdomain.com`!

---

## Post-Deployment Testing

### Test All Core Features

1. **Authentication**
   - ✅ Sign up new user
   - ✅ Log in
   - ✅ Log out

2. **Game Editor**
   - ✅ Create new game
   - ✅ Edit game (add platforms, props)
   - ✅ Save game
   - ✅ Load saved game

3. **Publishing**
   - ✅ Publish game
   - ✅ Access published game via URL
   - ✅ View in gallery

4. **Game Sessions**
   - ✅ Create new game session
   - ✅ Save progress
   - ✅ Load session
   - ✅ Multiple save slots work

5. **API Endpoints**
   - ✅ `/api/health` returns OK
   - ✅ `/api/games` returns games list
   - ✅ `/api/users` authenticates properly

### Verify Performance

1. **Check Compression**
   - Open browser DevTools → Network tab
   - Look for `Content-Encoding: gzip` in headers
   - File sizes should be ~70% smaller

2. **Check Load Times**
   - Initial page load: < 3 seconds
   - Subsequent loads: < 1 second (cached)

3. **Check Database**
   - Games save properly
   - Sessions persist
   - No errors in logs

---

## Troubleshooting

### Build Fails

**Error:** `npm install` fails
- **Fix:** Check `package.json` is valid
- **Fix:** Ensure all dependencies are listed

**Error:** `Cannot find module 'xyz'`
- **Fix:** Run `npm install xyz --save` locally
- **Fix:** Commit and push updated `package.json`

### App Crashes on Start

**Error:** `MongoDB connection error`
- **Fix:** Check `MONGODB_URI` is correct
- **Fix:** Verify MongoDB Atlas network access allows DigitalOcean IPs

**Error:** `Firebase initialization failed`
- **Fix:** Check Firebase environment variables
- **Fix:** Ensure `FIREBASE_PRIVATE_KEY` includes `\n` newline characters
- **Fix:** Test locally with same values

### Database Connection Issues

**Error:** `MongoNetworkError`
- **Fix:** Add `0.0.0.0/0` to MongoDB Atlas IP whitelist
- **Fix:** Check connection string format

### Authentication Not Working

**Error:** Users can't log in on production
- **Fix:** Add your domain to Firebase authorized domains
- **Fix:** Update Firebase config in `js/auth/firebaseConfig.js` if using hardcoded domain

### Custom Domain Not Working

**Error:** Domain doesn't load
- **Fix:** Wait longer (DNS can take up to 48 hours)
- **Fix:** Check DNS records are correct at [whatsmydns.net](https://whatsmydns.net)
- **Fix:** Ensure A record points to correct IP
- **Fix:** Ensure CNAME record is set correctly

**Error:** SSL certificate pending
- **Fix:** Wait 5-10 minutes after DNS propagates
- **Fix:** Verify domain ownership in DigitalOcean

### App Running Slow

**Fix:** Upgrade instance size:
- Go to App → Settings → Resources
- Change from $5/mo to $12/mo (1GB RAM)

**Fix:** Check MongoDB Atlas performance:
- Upgrade to M10 tier if using M0 (free tier)

### Viewing Logs

**DigitalOcean:**
- Go to your App → Runtime Logs
- Filter by component (Build, Deploy, Runtime)
- Search for errors

**MongoDB Atlas:**
- Go to Clusters → Metrics
- Check for connection errors

---

## Cost Breakdown

### Monthly Costs

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **DigitalOcean App** | Basic (512MB RAM) | $5/mo | Can scale to $12/mo for 1GB RAM |
| **MongoDB Atlas** | M0 Free Tier | $0/mo | Limited to 512MB storage |
| | M10 Shared | $9/mo | For production (2GB RAM, 10GB storage) |
| **Firebase** | Spark (Free) | $0/mo | Up to 10K monthly active users |
| | Blaze (Pay-as-you-go) | ~$0-5/mo | For scaling beyond free tier |
| **Domain** | Annual | ~$12/year | ($1/mo) - Varies by registrar |
| **SSL Certificate** | Let's Encrypt | $0/mo | Automatic via DigitalOcean |

**Total Minimum:** $5-6/month
**Total Recommended:** $15-20/month (for production scale)

### Cost Optimization Tips

1. **Start with free/cheap tiers**
   - MongoDB M0 (free)
   - Firebase Spark (free)
   - DigitalOcean $5 plan

2. **Scale up as needed**
   - Upgrade MongoDB when storage fills
   - Upgrade DigitalOcean if RAM is insufficient
   - Enable Firebase Blaze if you exceed limits

3. **Monitor usage**
   - DigitalOcean: Check metrics dashboard
   - MongoDB: Monitor storage and connections
   - Firebase: Check usage in console

---

## Continuous Deployment

Your app is configured for **automatic deployments**:

1. Make changes locally
2. Commit: `git commit -m "Update feature"`
3. Push: `git push origin main`
4. DigitalOcean automatically rebuilds and deploys (2-5 minutes)

### Rollback to Previous Version

If a deployment breaks something:

1. Go to App → Activity
2. Find the last working deployment
3. Click "..." → "Rollback to this deployment"

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use encrypted variables for secrets in DigitalOcean
- ✅ Rotate Firebase keys periodically

### MongoDB
- ⚠️ Using `0.0.0.0/0` whitelist is convenient but less secure
- ✅ For production, whitelist only your app's IP
- ✅ Use strong passwords (20+ characters)

### Firebase
- ✅ Enable authentication rate limiting
- ✅ Set up Firebase App Check for bot protection
- ✅ Review Firebase security rules regularly

### CORS
- Your app currently allows all origins
- For production, consider restricting:
  ```javascript
  app.use(cors({
    origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
  }));
  ```

---

## Monitoring & Maintenance

### Health Checks
- DigitalOcean automatically monitors `/` endpoint
- You have `/api/health` for manual checks
- Set up uptime monitoring: [UptimeRobot](https://uptimerobot.com) (free)

### Logs
- **Application logs**: DigitalOcean App → Runtime Logs
- **Database logs**: MongoDB Atlas → Activity Feed
- **Authentication logs**: Firebase Console → Authentication → Usage

### Backups
- **MongoDB**: Atlas automatically backs up (M10+ tiers)
- **Code**: Backed up in GitHub
- **User data**: Consider periodic exports

---

## Next Steps

After deployment:

1. ✅ Test all features thoroughly
2. ✅ Update Firebase authorized domains
3. ✅ Monitor logs for first 24 hours
4. ✅ Set up uptime monitoring
5. ✅ Share your game URL with players!
6. ✅ Consider enabling MongoDB backups (M10+ tier)
7. ✅ Set up error tracking (Sentry, LogRocket)

---

## Support & Resources

- **DigitalOcean Docs**: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **DNS Checker**: [whatsmydns.net](https://whatsmydns.net)
- **SSL Checker**: [ssllabs.com/ssltest](https://ssllabs.com/ssltest)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Test production build locally
npm start

# Deploy to GitHub
git add .
git commit -m "Your message"
git push origin main

# Check MongoDB connection
# Visit: https://yourapp.ondigitalocean.app/api/health

# View app logs (DigitalOcean CLI)
doctl apps logs YOUR_APP_ID --type run
```

---

**🎉 Congratulations!** You're ready to deploy your Platform RPG game to production with a custom domain!

For questions or issues, refer to the troubleshooting section or check the support resources above.
