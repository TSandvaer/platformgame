/**
 * Publishing System
 * Handles game publishing, unpublishing, and share link generation
 */

class PublishingSystem {
  constructor() {
    this.currentGame = null;
    this.publishModal = null;
    this.initialize();
  }

  initialize() {
    // Create publish modal if it doesn't exist
    this.createPublishModal();

    // Expose globally for user menu
    window.publishingSystem = this;
  }

  createPublishModal() {
    const modalHTML = `
      <div id="publishModal" class="modal no-theme" style="display: none;">
        <div class="modal-content no-theme" style="width: 600px; max-height: 90vh; overflow-y: auto;">
          <div class="modal-header">
            <h3>📤 Publish Your Game</h3>
            <button class="modal-close" id="closePublishModal">&times;</button>
          </div>
          <div class="modal-body">

            <!-- Current Status -->
            <div class="section">
              <h4>Current Status</h4>
              <div class="property-row">
                <span class="property-label">Status:</span>
                <span id="publishStatus" style="font-weight: bold; color: #ff9800;">Not Published</span>
              </div>
              <div id="publishedInfo" style="display: none;">
                <div class="property-row">
                  <span class="property-label">Published:</span>
                  <span id="publishedDate" style="color: #888;"></span>
                </div>
                <div class="property-row">
                  <span class="property-label">Views:</span>
                  <span id="gameViews" style="color: #4CAF50;">0</span>
                  <span class="property-label" style="margin-left: 20px;">Plays:</span>
                  <span id="gamePlays" style="color: #4CAF50;">0</span>
                </div>
              </div>
            </div>

            <!-- Game Information -->
            <div class="section">
              <h4>Game Information</h4>
              <div class="property-row">
                <span class="property-label">Game Name:</span>
                <span id="publishGameName" style="font-weight: bold; color: #4CAF50;"></span>
              </div>
              <div class="property-row">
                <span class="property-label">URL Slug:</span>
                <input type="text" id="publishSlug" placeholder="auto-generated-from-name"
                       style="width: 300px;" pattern="[a-z0-9-]+" title="Lowercase letters, numbers, and hyphens only">
                <small style="display: block; margin-top: 5px; color: #888;">
                  Leave blank to auto-generate from game name
                </small>
              </div>
            </div>

            <!-- Visibility Settings -->
            <div class="section">
              <h4>Visibility</h4>
              <div class="property-row">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                  <input type="radio" name="visibility" value="public" checked>
                  <div>
                    <strong>Public</strong>
                    <div style="font-size: 12px; color: #888;">Anyone can find and play your game in the gallery</div>
                  </div>
                </label>
              </div>
              <div class="property-row" style="margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                  <input type="radio" name="visibility" value="private">
                  <div>
                    <strong>Private</strong>
                    <div style="font-size: 12px; color: #888;">Only people with the share link can play</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- URL Preview -->
            <div class="section" id="urlPreviewSection" style="display: none;">
              <h4>Game URL</h4>
              <div style="background-color: #333; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Your game will be available at:</div>
                <div id="gameUrlPreview" style="color: #4CAF50; font-family: monospace; font-size: 14px; word-break: break-all;"></div>
                <button class="btn small" id="copyUrlBtn" style="margin-top: 10px;">📋 Copy URL</button>
              </div>

              <div id="shareTokenSection" style="display: none; margin-top: 15px;">
                <div style="background-color: #2a2a2a; padding: 15px; border-radius: 6px; border: 1px solid #ff9800;">
                  <div style="font-size: 12px; color: #ff9800; margin-bottom: 5px;">🔒 Private Share Link:</div>
                  <div id="shareUrlPreview" style="color: #4CAF50; font-family: monospace; font-size: 12px; word-break: break-all;"></div>
                  <button class="btn small" id="copyShareUrlBtn" style="margin-top: 10px;">📋 Copy Share Link</button>
                </div>
              </div>
            </div>

            <!-- Error Messages -->
            <div id="publishErrorMessage" class="error-message" style="display: none; margin-top: 10px;"></div>

          </div>

          <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 15px; border-top: 1px solid #444;">
            <button class="btn" id="publishBtn">
              <span id="publishBtnText">Publish Game</span>
              <span id="publishBtnSpinner" style="display: none;">Publishing...</span>
            </button>
            <button class="btn danger" id="unpublishBtn" style="display: none;">Unpublish</button>
            <button class="btn small" id="cancelPublishBtn">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get references
    this.publishModal = document.getElementById('publishModal');

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close modal
    document.getElementById('closePublishModal')?.addEventListener('click', () => this.closePublishModal());
    document.getElementById('cancelPublishBtn')?.addEventListener('click', () => this.closePublishModal());

    // Publish button
    document.getElementById('publishBtn')?.addEventListener('click', () => this.publishGame());

    // Unpublish button
    document.getElementById('unpublishBtn')?.addEventListener('click', () => this.unpublishGame());

    // Copy URL buttons
    document.getElementById('copyUrlBtn')?.addEventListener('click', () => this.copyToClipboard('url'));
    document.getElementById('copyShareUrlBtn')?.addEventListener('click', () => this.copyToClipboard('shareUrl'));

    // Slug input validation
    const slugInput = document.getElementById('publishSlug');
    slugInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    });
  }

  async openPublishModal() {
    // Check if user is authenticated
    if (!authSystem.isAuthenticated()) {
      alert('Please login to publish games');
      // Show auth modal if available
      if (window.authModal) {
        window.authModal.show();
      }
      return;
    }

    // Get current game
    const gameId = apiClient.getCurrentGameId();
    if (!gameId) {
      alert('Please select a game first');
      if (window.gameSelector) {
        window.gameSelector.open();
      }
      return;
    }

    try {
      // Load game data
      const response = await apiClient.getGame(gameId);
      this.currentGame = response.game;

      console.log('📖 openPublishModal: Loaded game from server:', this.currentGame);
      console.log('📖 openPublishModal: game.isPublished (TOP LEVEL):', this.currentGame.isPublished);
      console.log('📖 openPublishModal: game.slug (TOP LEVEL):', this.currentGame.slug);

      // Populate modal
      this.populateModal();

      // Show modal
      this.publishModal.style.display = 'block';
    } catch (error) {
      console.error('Error loading game for publishing:', error);
      alert('Failed to load game data. Please try again.');
    }
  }

  populateModal() {
    const game = this.currentGame;
    const user = authSystem.getCurrentUser();

    console.log('🔍 populateModal: Checking game data...');
    console.log('🔍 populateModal: game (top-level):', game);
    console.log('🔍 populateModal: game.isPublished (TOP LEVEL):', game.isPublished);
    console.log('🔍 populateModal: game.slug (TOP LEVEL):', game.slug);
    console.log('🔍 populateModal: game.visibility:', game.visibility);

    // Game name
    document.getElementById('publishGameName').textContent = game.name;

    // Slug (pre-fill if exists) - FIXED: slug is at top level, not in gameData
    document.getElementById('publishSlug').value = game.slug || '';

    // Status - FIXED: isPublished is at top level, not in gameData
    const isPublished = game.isPublished || false;
    console.log('🔍 populateModal: isPublished value (after check):', isPublished);
    document.getElementById('publishStatus').textContent = isPublished ? 'Published' : 'Not Published';
    document.getElementById('publishStatus').style.color = isPublished ? '#4CAF50' : '#ff9800';

    // Show/hide elements based on publish status
    if (isPublished) {
      document.getElementById('publishedInfo').style.display = 'block';
      document.getElementById('unpublishBtn').style.display = 'block';
      document.getElementById('publishBtn').style.display = 'none';

      // Published date
      const pubDate = new Date(game.updatedAt);
      document.getElementById('publishedDate').textContent = pubDate.toLocaleDateString();

      // Stats - FIXED: stats are at top level
      document.getElementById('gameViews').textContent = game.stats?.views || 0;
      document.getElementById('gamePlays').textContent = game.stats?.playCount || 0;

      // Show URL - FIXED: slug is at top level
      this.showUrlPreview(user.userData.username, game.slug);
    } else {
      document.getElementById('publishedInfo').style.display = 'none';
      document.getElementById('unpublishBtn').style.display = 'none';
      document.getElementById('publishBtn').style.display = 'block';
      document.getElementById('urlPreviewSection').style.display = 'none';
    }
  }

  showUrlPreview(username, slug) {
    const visibility = document.querySelector('input[name="visibility"]:checked').value;
    const baseUrl = window.location.origin;
    const playUrl = `${baseUrl}/play/${username}/${slug}`;

    document.getElementById('gameUrlPreview').textContent = playUrl;
    document.getElementById('urlPreviewSection').style.display = 'block';

    // Show share token section if private - FIXED: shareToken is at top level
    if (visibility === 'private' && this.currentGame.shareToken) {
      const shareUrl = `${playUrl}?token=${this.currentGame.shareToken}`;
      document.getElementById('shareUrlPreview').textContent = shareUrl;
      document.getElementById('shareTokenSection').style.display = 'block';
    } else {
      document.getElementById('shareTokenSection').style.display = 'none';
    }
  }

  async publishGame() {
    const publishBtn = document.getElementById('publishBtn');
    const publishBtnText = document.getElementById('publishBtnText');
    const publishBtnSpinner = document.getElementById('publishBtnSpinner');
    const errorMessage = document.getElementById('publishErrorMessage');

    // Get values
    const slug = document.getElementById('publishSlug').value.trim() || null;
    const visibility = document.querySelector('input[name="visibility"]:checked').value;

    // Show loading
    publishBtn.disabled = true;
    publishBtnText.style.display = 'none';
    publishBtnSpinner.style.display = 'inline';
    errorMessage.style.display = 'none';

    try {
      // First, sync current game data from localStorage to MongoDB
      // This ensures all latest settings (HUD, player, GUI, character) are published
      if (window.game && window.game.gameDataSystem) {
        console.log('📤 Publishing: Collecting current game data from localStorage...');
        const currentGameData = window.game.gameDataSystem.collectCurrentGameData();
        console.log('📤 Publishing: Game data collected:', currentGameData);
        console.log('📤 Publishing: HUD settings being saved:', currentGameData.gameSettings?.hud);
        await apiClient.saveGameData(this.currentGame.id, currentGameData);
        console.log('✅ Publishing: Game data saved to MongoDB successfully');
      } else {
        console.warn('⚠️ Publishing: Game system not available, publishing without data sync');
      }

      // Then publish the game
      const result = await apiClient.publishGame(this.currentGame.id, visibility, slug);

      console.log('Game published successfully:', result);
      console.log('📤 Publishing: result.game:', result.game);
      console.log('📤 Publishing: result.game.isPublished:', result.game?.isPublished);
      console.log('📤 Publishing: result.game.slug:', result.game?.slug);

      // Use the publish response data directly
      this.currentGame.isPublished = result.game.isPublished;
      this.currentGame.slug = result.game.slug;
      this.currentGame.visibility = result.game.visibility;
      this.currentGame.shareToken = result.game.shareToken;
      this.currentGame.playUrl = result.game.playUrl;
      this.currentGame.stats = result.game.stats;

      console.log('📤 Publishing: Updated currentGame with publish data');
      console.log('📤 Publishing: currentGame.isPublished:', this.currentGame.isPublished);
      console.log('📤 Publishing: currentGame.slug:', this.currentGame.slug);

      // Show success message
      const user = authSystem.getCurrentUser();
      this.showUrlPreview(user.userData.username, result.game.slug);

      // Update UI
      this.populateModal();

      // Show success feedback
      alert(`✅ Game published successfully!\n\nYour game is now available at:\n${result.game.playUrl}`);

    } catch (error) {
      console.error('Publishing error:', error);
      errorMessage.textContent = error.message || 'Failed to publish game. Please try again.';
      errorMessage.style.display = 'block';
    } finally {
      // Reset button
      publishBtn.disabled = false;
      publishBtnText.style.display = 'inline';
      publishBtnSpinner.style.display = 'none';
    }
  }

  async unpublishGame() {
    if (!confirm('Are you sure you want to unpublish this game? It will no longer be accessible to players.')) {
      return;
    }

    try {
      await apiClient.unpublishGame(this.currentGame.id);

      // Update current game data - isPublished is at top level
      this.currentGame.isPublished = false;
      this.currentGame.slug = null;
      this.currentGame.visibility = null;
      this.currentGame.shareToken = null;

      // Update UI
      this.populateModal();

      alert('Game unpublished successfully');
    } catch (error) {
      console.error('Unpublish error:', error);
      alert('Failed to unpublish game. Please try again.');
    }
  }

  copyToClipboard(type) {
    let text = '';
    if (type === 'url') {
      text = document.getElementById('gameUrlPreview').textContent;
    } else if (type === 'shareUrl') {
      text = document.getElementById('shareUrlPreview').textContent;
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  }

  closePublishModal() {
    this.publishModal.style.display = 'none';
  }
}

// Initialize publishing system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PublishingSystem();
  });
} else {
  new PublishingSystem();
}
