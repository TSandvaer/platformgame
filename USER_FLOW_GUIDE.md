# User Flow Guide

## How Login and Authentication Works

### First Time Users

1. **Sign Up** (`/signup.html`)
   - Create your account with email, password, username, and display name
   - After successful signup, you are **automatically logged in**
   - You will be redirected to the editor

2. **Using the Editor**
   - You'll see your display name in the top-right corner
   - Click your name to access:
     - 📤 Publish Game
     - 🎮 My Games
     - 👤 Profile
     - 🚪 Logout

### Returning Users

1. **If You're Already Logged In**
   - If you visit `/login.html` or `/signup.html` while logged in
   - You'll see: "You are already logged in. Redirecting..."
   - You'll be automatically redirected to the editor
   - **This is normal behavior!** You don't need to login again

2. **If You've Logged Out**
   - Click the "Login / Sign Up" button in the editor
   - OR navigate to `/login.html`
   - Enter your email and password
   - You'll be redirected to the editor

### Common Scenarios

#### "The login page keeps disappearing!"
**This happens because you're already logged in!**
- After signing up, you don't need to login again
- The page detects you're authenticated and redirects you to the editor
- Look for your name in the top-right corner of the editor - if it's there, you're logged in!

#### "I want to logout"
- Click your name (top-right corner)
- Select "🚪 Logout"
- You'll be logged out and redirected to the login page

#### "I want to switch accounts"
- Logout first (see above)
- Then login with different credentials

### Session Persistence

Your login session is persistent, which means:
- You stay logged in even after closing the browser
- You stay logged in across page refreshes
- You only need to login again after explicitly logging out
- Or if your session expires (after ~1 hour of inactivity)

### Visual Indicators

**When Logged In:**
- Top-right shows: `[Your Name] ▼`
- Click to see the user menu
- "Login / Sign Up" button is hidden

**When Logged Out:**
- Top-right shows: `Login / Sign Up` button
- User menu is hidden
- Games will still work in local mode (without cloud saving)

### Troubleshooting

**Problem:** Can't enter credentials, page redirects immediately
**Solution:** You're already logged in! Go to the editor (index.html) and check the top-right corner.

**Problem:** Want to create a new account
**Solution:** Logout first, then go to signup.html

**Problem:** Forgot password
**Solution:** Firebase password reset feature can be added (currently not implemented)

---

## Quick Reference

| Action | URL | When to Use |
|--------|-----|-------------|
| Sign Up | `/signup.html` | First time creating an account |
| Login | `/login.html` | When logged out and want to access your games |
| Editor | `/index.html` | Main game editor (can use without login) |
| Gallery | `/gallery.html` | Browse published games |
| Play Game | `/play/:username/:slug` | Play a specific published game |

---

## Development Note

The login/signup pages are designed to:
1. Check if you're already authenticated when they load
2. If yes, show a message and redirect (1 second delay)
3. If no, show the login/signup form

This prevents confusion and unnecessary login attempts when you're already authenticated.
