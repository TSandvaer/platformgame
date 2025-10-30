/**
 * Handles all modal-related UI interactions
 */
class ModalUIHandler extends UIHandler {
    constructor(game) {
        super(game);
        this._confirmationKeyHandler = null;
        this._mouseDownTarget = null; // Track where mousedown started for proper click-outside detection
    }

    /**
     * Initialize modal UI event listeners
     */
    initialize() {
        this.setupGameSettingsModal();
    }

    /**
     * Set up Game Settings modal event listeners
     */
    setupGameSettingsModal() {
        // Open Game Settings modal
        const gameSettingsBtn = this.getElementById('gameSettingsBtn');
        if (gameSettingsBtn) {
            gameSettingsBtn.addEventListener('click', () => {
                const modal = this.getElementById('gameSettingsModal');
                if (modal) {
                    modal.style.display = 'flex';
                    // Refresh inventory items list when modal opens
                    if (this.game.uiEventHandler && this.game.uiEventHandler.refreshInventoryItemsList) {
                        this.game.uiEventHandler.refreshInventoryItemsList();
                    }
                    // Refresh character selection when modal opens
                    if (this.game.uiEventHandler && this.game.uiEventHandler.loadCharacterValues) {
                        this.game.uiEventHandler.loadCharacterValues();
                    }
                    // Load game info when modal opens
                    if (this.game.uiEventHandler && this.game.uiEventHandler.loadGameInfo) {
                        this.game.uiEventHandler.loadGameInfo();
                    }
                }
            });
        }

        // Close Game Settings modal
        const closeBtn = this.getElementById('closeGameSettingsModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeGameSettingsModal();
            });
        }

        // Click outside to close - track mousedown and mouseup to prevent closing during text selection drag
        const modal = this.getElementById('gameSettingsModal');
        if (modal) {
            modal.addEventListener('mousedown', (e) => {
                this._mouseDownTarget = e.target;
            });

            modal.addEventListener('mouseup', (e) => {
                // Only close if both mousedown and mouseup happened on the modal overlay
                if (e.target === modal && this._mouseDownTarget === modal) {
                    this.closeGameSettingsModal();
                }
                this._mouseDownTarget = null;
            });
        }
    }

    /**
     * Show a confirmation modal with OK/Cancel buttons
     * @param {string} message - The message to display
     * @param {Function} onConfirm - Callback when OK is clicked
     * @param {Function} onCancel - Optional callback when Cancel is clicked
     */
    showConfirmationModal(message, onConfirm, onCancel = null) {
        const modal = document.getElementById('confirmationModal');
        const messageEl = document.getElementById('confirmationModalMessage');
        const okBtn = document.getElementById('confirmationModalOK');
        const cancelBtn = document.getElementById('confirmationModalCancel');

        if (!modal || !messageEl || !okBtn || !cancelBtn) return;

        // Set message
        messageEl.textContent = message;

        // Remove old event listeners by cloning and replacing
        const newOkBtn = okBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Add new event listeners
        newOkBtn.addEventListener('click', () => {
            this.closeConfirmationModal();
            if (onConfirm) onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            this.closeConfirmationModal();
            if (onCancel) onCancel();
        });

        // Keyboard navigation handler
        const keyHandler = (e) => {
            if (e.key === 'Tab' || e.key === 'ArrowRight') {
                e.preventDefault();
                // Move focus between OK and Cancel
                if (document.activeElement === newOkBtn) {
                    newCancelBtn.focus();
                } else {
                    newOkBtn.focus();
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                // Move focus between Cancel and OK
                if (document.activeElement === newCancelBtn) {
                    newOkBtn.focus();
                } else {
                    newCancelBtn.focus();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // Trigger the focused button
                if (document.activeElement === newOkBtn) {
                    this.closeConfirmationModal();
                    if (onConfirm) onConfirm();
                } else if (document.activeElement === newCancelBtn) {
                    this.closeConfirmationModal();
                    if (onCancel) onCancel();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeConfirmationModal();
                if (onCancel) onCancel();
            }
        };

        // Store key handler for cleanup
        this._confirmationKeyHandler = keyHandler;
        document.addEventListener('keydown', keyHandler);

        // Close on click outside - track mousedown and mouseup to prevent closing during text selection drag
        modal.onmousedown = (e) => {
            this._mouseDownTarget = e.target;
        };

        modal.onmouseup = (e) => {
            // Only close if both mousedown and mouseup happened on the modal overlay
            if (e.target === modal && this._mouseDownTarget === modal) {
                this.closeConfirmationModal();
                if (onCancel) onCancel();
            }
            this._mouseDownTarget = null;
        };

        // Show modal
        modal.style.display = 'flex';

        // Focus OK button after a short delay to ensure modal is visible
        setTimeout(() => {
            newOkBtn.focus();
        }, 50);
    }

    /**
     * Close the confirmation modal
     */
    closeConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.style.display = 'none';
            modal.onmousedown = null; // Remove mousedown handler
            modal.onmouseup = null; // Remove mouseup handler
        }

        // Remove keyboard event listener
        if (this._confirmationKeyHandler) {
            document.removeEventListener('keydown', this._confirmationKeyHandler);
            this._confirmationKeyHandler = null;
        }

        // Reset mousedown tracker
        this._mouseDownTarget = null;
    }

    /**
     * Close the game settings modal
     */
    closeGameSettingsModal() {
        const modal = document.getElementById('gameSettingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}