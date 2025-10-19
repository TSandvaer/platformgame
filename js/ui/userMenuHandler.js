/**
 * User Menu Handler
 * Manages the user menu UI and interactions
 */

class UserMenuHandler {
  constructor() {
    this.userMenu = document.getElementById('userMenu');
    this.loginBtn = document.getElementById('loginBtn');
    this.userMenuBtn = document.getElementById('userMenuBtn');
    this.userMenuDropdown = document.getElementById('userMenuDropdown');
    this.userDisplayName = document.getElementById('userDisplayName');

    this.isDropdownOpen = false;

    this.initialize();
  }

  initialize() {
    // Subscribe to auth state changes
    authSystem.onAuthStateChange((user) => {
      this.updateUI(user);
    });

    // User menu button click
    this.userMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Login button click - handled by onclick in HTML to show auth modal
    // (no handler needed here)

    // Menu item clicks
    document.getElementById('publishGameMenuItem')?.addEventListener('click', () => {
      this.closeDropdown();
      this.openPublishModal();
    });

    document.getElementById('myGamesMenuItem')?.addEventListener('click', () => {
      this.closeDropdown();
      if (window.gameSelector) {
        window.gameSelector.open();
      }
    });

    document.getElementById('profileMenuItem')?.addEventListener('click', () => {
      this.closeDropdown();
      this.openProfileModal();
    });

    document.getElementById('logoutMenuItem')?.addEventListener('click', async () => {
      this.closeDropdown();
      await this.logout();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isDropdownOpen && !this.userMenu.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  updateUI(user) {
    if (user) {
      // User is logged in
      this.userMenu.style.display = 'block';
      this.loginBtn.style.display = 'none';
      this.userDisplayName.textContent = user.userData.displayName || user.userData.username;
    } else {
      // User is not logged in
      this.userMenu.style.display = 'none';
      this.loginBtn.style.display = 'block';
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.userMenuDropdown.classList.toggle('show', this.isDropdownOpen);
    this.userMenuBtn.classList.toggle('active', this.isDropdownOpen);
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    this.userMenuDropdown.classList.remove('show');
    this.userMenuBtn.classList.remove('active');
  }

  async logout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await authSystem.logout();
        // No redirect - auth state change handler in index.html will show the auth modal
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  }

  openPublishModal() {
    // This will be implemented when we add the publishing modal
    if (window.publishingSystem) {
      window.publishingSystem.openPublishModal();
    } else {
      alert('Publishing feature coming soon! Make sure you have a game selected first.');
    }
  }

  openProfileModal() {
    const user = authSystem.getCurrentUser();
    if (!user) return;

    alert(`Profile Page Coming Soon!\n\nUsername: ${user.userData.username}\nEmail: ${user.userData.email}\nGames Created: ${user.userData.stats.gamesCreated}`);
  }
}

// Initialize user menu handler when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.userMenuHandler = new UserMenuHandler();
  });
} else {
  window.userMenuHandler = new UserMenuHandler();
}
