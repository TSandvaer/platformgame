/**
 * Handles all platform-related UI interactions
 */
class PlatformUIHandler extends UIHandler {
    constructor(game, modalHandler) {
        super(game);
        this.modalHandler = modalHandler;
    }

    /**
     * Initialize platform UI event listeners
     */
    initialize() {
        this.setupPlatformEditorListeners();
        this.setupPlatformZOrderListeners();
    }

    /**
     * Set up all platform editor event listeners
     */
    setupPlatformEditorListeners() {
        // Add platform button
        this.addListener('addPlatform', 'click', () => {
            this.game.platformSystem.togglePlatformPlacement();
        });

        // Update platform button
        this.addListener('updatePlatform', 'click', () => {
            this.game.platformSystem.updateSelectedPlatform();
        });

        // Delete platform button
        this.addListener('deletePlatform', 'click', () => {
            const selectedPlatform = this.game.platformSystem.selectedPlatform;
            if (selectedPlatform) {
                this.modalHandler.showConfirmationModal(
                    'Delete this platform? This cannot be undone.',
                    () => {
                        // On confirm
                        this.game.platformSystem.deleteSelectedPlatform();
                    }
                );
            }
        });

        // Draw platform movement zone button
        this.addListener('drawPlatformMovementZone', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.startMovementZoneDrawingMode(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Clear platform movement zone button
        this.addListener('clearPlatformMovementZone', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.clearMovementZone(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Stop/start platform movement button
        this.addListener('stopStartPlatformMovement', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.toggleMovementPause(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Reset platform position button
        this.addListener('resetPlatformPosition', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.manager.resetToOriginalPosition(this.game.platformSystem.selectedPlatform);
            } else {
                alert('Please select a platform first');
            }
        });

        // Platform positioning controls
        this.addListener('platformPositioning', 'change', () => {
            this.game.platformSystem.updateSelectedPlatform();
        });

        // Viewport controls (also platform-related)
        this.addListener('applyViewport', 'click', () => {
            this.game.applyViewportSettings();
        });

        this.addListener('resetViewport', 'click', () => {
            this.game.resetViewportSettings();
        });

        this.addListener('viewportModeSelect', 'change', () => {
            this.game.applyViewportSettings();
        });
    }

    /**
     * Set up platform z-order controls (send to back/bring to front)
     */
    setupPlatformZOrderListeners() {
        // Send platform to background button
        this.addListener('sendPlatformToBackground', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.data.moveToBack(this.game.platformSystem.selectedPlatform);
            }
        });

        // Bring platform to front button
        this.addListener('bringPlatformToFront', 'click', () => {
            if (this.game.platformSystem.selectedPlatform) {
                this.game.platformSystem.data.moveToFront(this.game.platformSystem.selectedPlatform);
            }
        });
    }
}