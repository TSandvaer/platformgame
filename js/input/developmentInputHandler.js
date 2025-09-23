class DevelopmentInputHandler {
    constructor(game) {
        this.game = game;
    }

    handleKeyDown(e) {
        // Only handle keys in development mode
        if (!this.game.isDevelopmentMode) return;

        // Handle Copy (Ctrl+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            if (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0) {
                if (this.game.propSystem.data.copySelectedProps()) {
                    // Show visual feedback
                    this.game.showCopyPasteFeedback('Copied!', this.game.propSystem.selectedProp);
                    console.log('Props copied to clipboard');
                }
            }
        }

        // Handle Paste (Ctrl+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            if (this.game.propSystem.data.clipboard && this.game.propSystem.data.clipboard.length > 0) {
                // Use current mouse position (already in world coordinates)
                const pastedProps = this.game.propSystem.data.pasteProps(this.game.mouseX, this.game.mouseY);
                if (pastedProps.length > 0) {
                    this.game.propSystem.updatePropList();
                    this.game.propSystem.updatePropProperties();
                    // Show visual feedback at paste location
                    this.game.showCopyPasteFeedback('Pasted!', pastedProps[0]);
                    console.log(`Pasted ${pastedProps.length} prop(s)`);
                }
            }
        }

        // Handle Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Prevent default browser behavior

            if (this.game.platformSystem.selectedPlatform) {
                // Delete selected platform
                this.game.platformSystem.deleteSelectedPlatform();
            } else if (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0) {
                // Delete all selected props (handles both single and multiple selection)
                this.game.propSystem.deleteSelectedProps();
            }
        }

        // Handle arrow keys for nudging selected props
        if (this.game.propSystem.selectedProp || (this.game.propSystem.selectedProps && this.game.propSystem.selectedProps.length > 0)) {
            let nudgeX = 0;
            let nudgeY = 0;

            switch(e.key) {
                case 'ArrowLeft':
                    nudgeX = -1;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    nudgeX = 1;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    nudgeY = -1;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    nudgeY = 1;
                    e.preventDefault();
                    break;
            }

            if (nudgeX !== 0 || nudgeY !== 0) {
                // Check if Shift is held for larger movement (10px)
                const moveAmount = e.shiftKey ? 10 : 1;
                nudgeX *= moveAmount;
                nudgeY *= moveAmount;

                // Move selected props
                if (this.game.propSystem.selectedProps.length > 0) {
                    // Expand selection to include all group members
                    const expandedSelection = this.game.propSystem.data.expandSelectionToFullGroups(this.game.propSystem.selectedProps);

                    // Multi-selection nudge for all props in groups
                    expandedSelection.forEach(prop => {
                        prop.x += nudgeX;
                        prop.y += nudgeY;
                        // Update relative position if needed
                        if (prop.positioning === 'screen-relative' && this.game.viewport) {
                            this.game.propSystem.updateRelativePosition(
                                prop,
                                prop.x,
                                prop.y,
                                this.game.viewport.designWidth,
                                this.game.viewport.designHeight
                            );
                        }
                    });
                } else if (this.game.propSystem.selectedProp) {
                    // Single prop nudge - but check if it's grouped
                    const propsToMove = this.game.propSystem.selectedProp.groupId ?
                        this.game.propSystem.data.getPropsInSameGroup(this.game.propSystem.selectedProp) :
                        [this.game.propSystem.selectedProp];

                    propsToMove.forEach(prop => {
                        prop.x += nudgeX;
                        prop.y += nudgeY;
                        // Update relative position if needed
                        if (prop.positioning === 'screen-relative' && this.game.viewport) {
                            this.game.propSystem.updateRelativePosition(
                                prop,
                                prop.x,
                                prop.y,
                                this.game.viewport.designWidth,
                                this.game.viewport.designHeight
                            );
                        }
                    });
                }

                // Update the properties panel if visible
                this.game.propSystem.updatePropProperties();
            }
        }
    }
}