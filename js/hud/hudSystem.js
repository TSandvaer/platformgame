class HUDSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;

        // Base HUD dimensions (at 1080p design resolution)
        // Position HUD below buttons in production mode, or with offset in dev mode
        this.basePosition = { x: 20, y: 60 };  // Moved down from y:20 to y:60 to avoid buttons
        this.baseWidth = 280;  // Increased to accommodate belt slots
        this.baseHeight = 160;  // Increased to accommodate belt (was 80)
        this.baseCornerRadius = 8;

        // Manual overrides (for drag/resize) - stored in unscaled values
        this.manualPosition = null;  // Will be set when user drags
        this.manualSize = null;      // Will be set when user resizes

        // Base bar settings
        this.baseBarWidth = 140;
        this.baseBarHeight = 16;
        this.baseBarSpacing = 25;
        this.baseBarOffsetX = 85;  // Increased from 65 to 85 for more left padding
        this.baseBarOffsetY = 35;

        // Actual scaled dimensions (will be calculated)
        this.position = { x: this.basePosition.x, y: this.basePosition.y };
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.cornerRadius = this.baseCornerRadius;
        this.barWidth = this.baseBarWidth;
        this.barHeight = this.baseBarHeight;
        this.barSpacing = this.baseBarSpacing;
        this.barOffsetX = this.baseBarOffsetX;
        this.barOffsetY = this.baseBarOffsetY;

        // Base gear icon settings
        this.baseGearSize = 16;
        this.baseGearPosition = { x: 15, y: 8 };  // Increased from x: 8 to x: 15

        // Actual scaled gear settings
        this.gearSize = this.baseGearSize;
        this.gearPosition = { x: this.baseGearPosition.x, y: this.baseGearPosition.y };

        // UI Scale factor (will be calculated based on viewport)
        this.uiScale = 1.0;
        this.minScale = 0.5;  // Minimum UI scale
        this.maxScale = 1.5;  // Maximum UI scale

        // Player stats (will be connected to player system later)
        this.playerStats = {
            health: { current: 100, max: 100 },
            stamina: { current: 100, max: 100 },
            coins: 0
        };

        // Base coin display settings
        this.baseCoinIconSize = 16;
        this.coinIconSize = this.baseCoinIconSize;
        this.coinIcon = null;
        this.loadCoinIcon();

        // Base belt display settings
        this.baseBeltSlotSize = 32;  // Smaller slots
        this.baseBeltSlotSpacing = 8;
        this.baseBeltOffsetX = 85;  // Align with health/stamina bars
        this.baseBeltOffsetY = 100;  // Position below coin counter

        // Actual scaled belt settings
        this.beltSlotSize = this.baseBeltSlotSize;
        this.beltSlotSpacing = this.baseBeltSlotSpacing;
        this.beltOffsetX = this.baseBeltOffsetX;
        this.beltOffsetY = this.baseBeltOffsetY;
        this.beltSpriteCache = {};  // Cache for belt item sprites

        // Fantasy Wooden GUI theme assets
        this.stoneBackground = null;
        this.parchmentBackground = null;
        this.loadWoodenGUIAssets();

        // Colors
        this.colors = {
            background: 'rgba(40, 40, 40, 0.9)',
            border: '#ffffff',
            health: '#ff4444',
            healthBg: '#441111',
            stamina: '#ffdd44',
            staminaBg: '#443311',
            text: '#ffffff',
            gear: '#cccccc'
        };

        // Gear icon click detection
        this.isGearHovered = false;
        this.setupGearClickHandler();

        // Development mode drag and resize
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isHovered = false;
        this.baseResizeHandleSize = 12;
        this.resizeHandle = { x: 0, y: 0, size: this.baseResizeHandleSize }; // Size of resize handle
        this.setupDragAndResize();

        // Load saved settings from gameData
        this.loadSettings();
    }

    loadCoinIcon() {
        const coinImg = new Image();
        coinImg.onload = () => {
            this.coinIcon = coinImg;
        };
        coinImg.onerror = () => {
            console.error('💰 Failed to load coin icon for HUD');
        };
        coinImg.src = '/sprites/Coins/gold/gold.png';
    }

    loadWoodenGUIAssets() {
        // Load stone background
        const stoneImg = new Image();
        stoneImg.onload = () => {
            this.stoneBackground = stoneImg;
        };
        stoneImg.onerror = () => {
            console.error('🏰 Failed to load stone background for HUD');
        };
        stoneImg.src = '/GUI/graphics/Fantasy Wooden GUI/PNG/UI board Small  stone.png';

        // Load parchment background
        const parchmentImg = new Image();
        parchmentImg.onload = () => {
            this.parchmentBackground = parchmentImg;
        };
        parchmentImg.onerror = () => {
            console.error('📜 Failed to load parchment background for HUD');
        };
        parchmentImg.src = '/GUI/graphics/Fantasy Wooden GUI/PNG/UI board Small  parchment.png';
    }

    calculateUIScale() {
        // Get the current viewport scale from the game's viewport system
        let baseScale = 1.0;

        if (this.game.viewportSystem && this.game.viewportSystem.viewport) {
            // Use the viewport's uniform scale factor
            baseScale = this.game.viewportSystem.viewport.scale;
        } else {
            // Fallback: calculate based on canvas size vs design resolution
            const designHeight = 1080;  // Design resolution height
            baseScale = this.canvas.height / designHeight;
        }

        // Apply min/max limits to the UI scale
        this.uiScale = Math.max(this.minScale, Math.min(this.maxScale, baseScale));

        // Update all scaled dimensions
        // Use manual position if set, otherwise use base position
        if (this.manualPosition) {
            this.position.x = this.manualPosition.x * this.uiScale;
            this.position.y = this.manualPosition.y * this.uiScale;
        } else {
            this.position.x = this.basePosition.x * this.uiScale;
            this.position.y = this.basePosition.y * this.uiScale;
        }

        // Use manual size if set, otherwise use base size
        if (this.manualSize) {
            this.width = this.manualSize.width * this.uiScale;
            this.height = this.manualSize.height * this.uiScale;
        } else {
            this.width = this.baseWidth * this.uiScale;
            this.height = this.baseHeight * this.uiScale;
        }

        this.cornerRadius = this.baseCornerRadius * this.uiScale;

        // Scale bar dimensions
        this.barWidth = this.baseBarWidth * this.uiScale;
        this.barHeight = this.baseBarHeight * this.uiScale;
        this.barSpacing = this.baseBarSpacing * this.uiScale;
        this.barOffsetX = this.baseBarOffsetX * this.uiScale;
        this.barOffsetY = this.baseBarOffsetY * this.uiScale;

        // Scale gear icon
        this.gearSize = this.baseGearSize * this.uiScale;
        this.gearPosition.x = this.baseGearPosition.x * this.uiScale;
        this.gearPosition.y = this.baseGearPosition.y * this.uiScale;

        // Scale coin icon
        this.coinIconSize = this.baseCoinIconSize * this.uiScale;

        // Scale belt dimensions
        this.beltSlotSize = this.baseBeltSlotSize * this.uiScale;
        this.beltSlotSpacing = this.baseBeltSlotSpacing * this.uiScale;
        this.beltOffsetX = this.baseBeltOffsetX * this.uiScale;
        this.beltOffsetY = this.baseBeltOffsetY * this.uiScale;

        // Update resize handle size
        if (this.resizeHandle) {
            this.resizeHandle.size = this.baseResizeHandleSize * this.uiScale;
        }
    }

    setupGearClickHandler() {
        // Add mouse move listener for gear hover detection
        this.game.canvas.addEventListener('mousemove', (e) => {
            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const gearX = this.position.x + this.gearPosition.x;
            const gearY = this.position.y + this.gearPosition.y;

            this.isGearHovered = mouseX >= gearX && mouseX <= gearX + this.gearSize &&
                               mouseY >= gearY && mouseY <= gearY + this.gearSize;
        });

        // Add click listener for gear settings
        this.game.canvas.addEventListener('click', (e) => {
            if (!this.isGearHovered) return;

            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const gearX = this.position.x + this.gearPosition.x;
            const gearY = this.position.y + this.gearPosition.y;

            if (mouseX >= gearX && mouseX <= gearX + this.gearSize &&
                mouseY >= gearY && mouseY <= gearY + this.gearSize) {
                this.openGameSettings();
            }
        });
    }

    openGameSettings() {
        // For now, just show an alert - can be replaced with actual settings panel
        alert('Game Settings\n\n(Settings panel to be implemented)');
    }

    setupDragAndResize() {
        // Mouse move handler for hover and drag/resize
        this.game.canvas.addEventListener('mousemove', (e) => {
            if (!this.game.isDevelopmentMode) return;

            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Update resize handle position
            this.resizeHandle.x = this.position.x + this.width - this.resizeHandle.size;
            this.resizeHandle.y = this.position.y + this.height - this.resizeHandle.size;

            // Check if hovering over HUD or resize handle
            const isOverHUD = this.isPointInHUD(mouseX, mouseY);
            const isOverResizeHandle = this.isPointInResizeHandle(mouseX, mouseY);

            // Update hover state
            this.isHovered = isOverHUD || isOverResizeHandle;

            // Set cursor style
            if (this.isDragging) {
                this.game.canvas.style.cursor = 'grabbing';
            } else if (this.isResizing) {
                this.game.canvas.style.cursor = 'nw-resize';
            } else if (isOverResizeHandle) {
                this.game.canvas.style.cursor = 'nw-resize';
            } else if (isOverHUD) {
                this.game.canvas.style.cursor = 'grab';
            } else {
                this.game.canvas.style.cursor = 'default';
            }

            // Handle dragging
            if (this.isDragging) {
                this.position.x = mouseX - this.dragOffset.x;
                this.position.y = mouseY - this.dragOffset.y;

                // Keep HUD within canvas bounds
                this.position.x = Math.max(0, Math.min(this.position.x, this.game.canvas.width - this.width));
                this.position.y = Math.max(0, Math.min(this.position.y, this.game.canvas.height - this.height));

                // Store the unscaled manual position
                this.manualPosition = {
                    x: this.position.x / this.uiScale,
                    y: this.position.y / this.uiScale
                };
            }

            // Handle resizing
            if (this.isResizing) {
                const newWidth = mouseX - this.position.x;
                const newHeight = mouseY - this.position.y;

                // Set minimum and maximum sizes
                this.width = Math.max(150 * this.uiScale, Math.min(400 * this.uiScale, newWidth));
                this.height = Math.max(60 * this.uiScale, Math.min(200 * this.uiScale, newHeight));

                // Store the unscaled manual size
                this.manualSize = {
                    width: this.width / this.uiScale,
                    height: this.height / this.uiScale
                };
            }
        });

        // Mouse down handler
        this.game.canvas.addEventListener('mousedown', (e) => {
            if (!this.game.isDevelopmentMode) return;

            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Check if clicking on resize handle
            if (this.isPointInResizeHandle(mouseX, mouseY)) {
                this.isResizing = true;
                e.preventDefault();
                return;
            }

            // Check if clicking on HUD for dragging
            if (this.isPointInHUD(mouseX, mouseY)) {
                this.isDragging = true;
                this.dragOffset.x = mouseX - this.position.x;
                this.dragOffset.y = mouseY - this.position.y;
                e.preventDefault();
            }
        });

        // Mouse up handler
        this.game.canvas.addEventListener('mouseup', (e) => {
            if (!this.game.isDevelopmentMode) return;

            // Save settings if we were dragging or resizing
            if (this.isDragging || this.isResizing) {
                this.saveSettings();
            }

            this.isDragging = false;
            this.isResizing = false;
            this.game.canvas.style.cursor = 'default';
        });
    }

    isPointInHUD(x, y) {
        return x >= this.position.x && x <= this.position.x + this.width &&
               y >= this.position.y && y <= this.position.y + this.height;
    }

    isPointInResizeHandle(x, y) {
        return x >= this.resizeHandle.x && x <= this.resizeHandle.x + this.resizeHandle.size &&
               y >= this.resizeHandle.y && y <= this.resizeHandle.y + this.resizeHandle.size;
    }

    updatePlayerStats(health, maxHealth, stamina, maxStamina) {
        this.playerStats.health.current = Math.max(0, Math.min(health, maxHealth));
        this.playerStats.health.max = maxHealth;
        this.playerStats.stamina.current = Math.max(0, Math.min(stamina, maxStamina));
        this.playerStats.stamina.max = maxStamina;
    }

    updateCoinCount(coinCount) {
        this.playerStats.coins = Math.max(0, coinCount);
    }

    render() {
        // Recalculate UI scale based on current viewport
        this.calculateUIScale();

        this.ctx.save();

        // Draw HUD background based on current theme
        this.drawHUDBackground();

        // Draw gear icon
        this.drawGearIcon();

        // Draw health bar
        this.drawStatusBar(
            'Health',
            this.position.x + this.barOffsetX,
            this.position.y + this.barOffsetY,
            this.playerStats.health.current,
            this.playerStats.health.max,
            this.colors.health,
            this.colors.healthBg
        );

        // Draw stamina bar
        this.drawStatusBar(
            'Stamina',
            this.position.x + this.barOffsetX,
            this.position.y + this.barOffsetY + this.barSpacing,
            this.playerStats.stamina.current,
            this.playerStats.stamina.max,
            this.colors.stamina,
            this.colors.staminaBg
        );

        // Draw coin counter
        this.drawCoinCounter();

        // Draw belt (integrated into HUD) - always visible for HUD sizing
        this.drawBeltInHUD();

        // Development mode visual feedback
        if (this.game.isDevelopmentMode) {
            this.renderDevelopmentOverlay();
        }

        this.ctx.restore();
    }

    drawRoundedRect(x, y, width, height, radius, fillColor, strokeColor) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();

        // Fill background
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawStatusBar(label, x, y, current, max, fillColor, bgColor) {
        // Draw label with theme-appropriate color
        const currentTheme = this.getCurrentTheme();
        const textColor = currentTheme === 'fantasy-wooden' ? '#4A2C17' : this.colors.text;
        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${Math.round(12 * this.uiScale)}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x - (55 * this.uiScale), y + this.barHeight / 2);

        // Draw background bar
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(x, y, this.barWidth, this.barHeight);

        // Draw border around bar
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.barWidth, this.barHeight);

        // Draw filled portion
        const fillWidth = Math.max(0, (current / max) * this.barWidth);
        if (fillWidth > 0) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, fillWidth, this.barHeight);
        }

        // Draw value text
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = `${Math.round(10 * this.uiScale)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(current)}/${max}`, x + this.barWidth / 2, y + this.barHeight / 2);
    }

    drawCoinCounter() {
        const coinY = this.position.y + this.barOffsetY + (this.barSpacing * 2);
        const iconX = this.position.x + this.barOffsetX - (55 * this.uiScale);
        const textX = iconX + this.coinIconSize + (5 * this.uiScale);

        // Draw coin icon if loaded
        if (this.coinIcon) {
            this.ctx.drawImage(
                this.coinIcon,
                iconX,
                coinY,
                this.coinIconSize,
                this.coinIconSize
            );
        }

        // Draw coin count text with theme-appropriate color
        const currentTheme = this.getCurrentTheme();
        const textColor = currentTheme === 'fantasy-wooden' ? '#4A2C17' : this.colors.text;
        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${Math.round(12 * this.uiScale)}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.playerStats.coins}`, textX, coinY + this.coinIconSize / 2);
    }

    drawBeltInHUD() {
        // Get player belt data
        const playerBelt = this.game.playerSystem?.data?.belt || [null, null, null, null];

        // Get theme-appropriate colors
        const currentTheme = this.getCurrentTheme();
        const labelColor = currentTheme === 'fantasy-wooden' ? '#8B6914' : '#FFD700';

        // Draw each belt slot
        for (let i = 0; i < 4; i++) {
            const slotX = this.position.x + this.beltOffsetX + (i * (this.beltSlotSize + this.beltSlotSpacing));
            const slotY = this.position.y + this.beltOffsetY;
            const item = playerBelt[i];

            // Draw slot background (only if empty)
            if (!item) {
                this.ctx.fillStyle = 'rgba(68, 68, 68, 0.6)';
                this.ctx.fillRect(slotX, slotY, this.beltSlotSize, this.beltSlotSize);
            }

            // Draw slot border
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(slotX, slotY, this.beltSlotSize, this.beltSlotSize);

            // Draw slot number
            this.ctx.fillStyle = labelColor;
            this.ctx.font = `bold ${Math.round(9 * this.uiScale)}px Arial`;  // Smaller font for smaller slots
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(String(i + 1), slotX + (3 * this.uiScale), slotY + (2 * this.uiScale));

            // Draw item if present
            if (item) {
                let spriteDrawn = false;

                // Try to draw sprite from multiple sources
                if (item.sprite) {
                    // Calculate aspect ratio preserving dimensions
                    const maxSize = 22 * this.uiScale;  // Adjusted for smaller slots
                    const aspectRatio = item.sprite.width / item.sprite.height;
                    let drawWidth = maxSize;
                    let drawHeight = maxSize;

                    if (aspectRatio > 1) {
                        drawHeight = maxSize / aspectRatio;
                    } else {
                        drawWidth = maxSize * aspectRatio;
                    }

                    // Center the sprite in the slot
                    const drawX = slotX + (this.beltSlotSize - drawWidth) / 2;
                    const drawY = slotY + (this.beltSlotSize - drawHeight) / 2;

                    // Try the inventory system's loaded spritesheet
                    if (this.game.inventoryItemsData?.spritesheet?.complete) {
                        const spritesheet = this.game.inventoryItemsData.spritesheet;
                        this.ctx.imageSmoothingEnabled = false;
                        try {
                            this.ctx.drawImage(
                                spritesheet,
                                item.sprite.x, item.sprite.y,
                                item.sprite.width, item.sprite.height,
                                drawX, drawY, drawWidth, drawHeight
                            );
                            spriteDrawn = true;
                        } catch (e) {
                            console.warn('Failed to draw belt item sprite:', e);
                        }
                        this.ctx.imageSmoothingEnabled = true;
                    }
                }

                if (!spriteDrawn) {
                    // Fallback colored icon based on item type
                    const color = item.id === 'healthPotion' ? '#FF4444' :
                                 item.id === 'staminaPotion' ? '#FFD700' :
                                 item.id === 'manaPotion' ? '#4444FF' : '#4CAF50';
                    this.ctx.fillStyle = color;
                    const iconPadding = 6 * this.uiScale;  // Adjusted for smaller slots
                    const iconSize = 20 * this.uiScale;  // Adjusted for smaller slots
                    this.ctx.fillRect(slotX + iconPadding, slotY + iconPadding, iconSize, iconSize);

                    // Add potion bottle shape
                    this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    const bottleNeckX = slotX + (13 * this.uiScale);  // Adjusted for smaller slots
                    const bottleNeckY = slotY + (5 * this.uiScale);  // Adjusted for smaller slots
                    const bottleNeckWidth = 6 * this.uiScale;  // Adjusted for smaller slots
                    const bottleNeckHeight = 4 * this.uiScale;  // Adjusted for smaller slots
                    this.ctx.fillRect(bottleNeckX, bottleNeckY, bottleNeckWidth, bottleNeckHeight);
                }

                // Draw item quantity if > 1
                if (item.quantity > 1) {
                    // Background for better readability
                    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    const qtyText = String(item.quantity);
                    this.ctx.font = `bold ${Math.round(8 * this.uiScale)}px Arial`;  // Smaller font for smaller slots
                    const textWidth = this.ctx.measureText(qtyText).width;
                    const padding = 2 * this.uiScale;
                    const boxHeight = 10 * this.uiScale;
                    this.ctx.fillRect(
                        slotX + this.beltSlotSize - textWidth - (padding * 1.5),
                        slotY + this.beltSlotSize - (boxHeight + padding/2),
                        textWidth + padding,
                        boxHeight
                    );

                    // Quantity text
                    this.ctx.fillStyle = 'white';
                    this.ctx.textAlign = 'right';
                    this.ctx.textBaseline = 'bottom';
                    this.ctx.fillText(qtyText, slotX + this.beltSlotSize - (2 * this.uiScale), slotY + this.beltSlotSize - (2 * this.uiScale));
                }
            }
        }
    }

    drawGearIcon() {
        const centerX = this.position.x + this.gearPosition.x + this.gearSize / 2;
        const centerY = this.position.y + this.gearPosition.y + this.gearSize / 2;
        const radius = this.gearSize / 3;
        const innerRadius = radius * 0.6;
        const teeth = 8;

        this.ctx.fillStyle = this.isGearHovered ? '#ffffff' : this.colors.gear;
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        // Draw gear teeth
        for (let i = 0; i < teeth; i++) {
            const angle1 = (i * 2 * Math.PI) / teeth;
            const angle2 = ((i + 0.3) * 2 * Math.PI) / teeth;
            const angle3 = ((i + 0.7) * 2 * Math.PI) / teeth;
            const angle4 = ((i + 1) * 2 * Math.PI) / teeth;

            // Outer edge of tooth
            const x1 = centerX + Math.cos(angle1) * radius;
            const y1 = centerY + Math.sin(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * (radius * 1.3);
            const y2 = centerY + Math.sin(angle2) * (radius * 1.3);
            const x3 = centerX + Math.cos(angle3) * (radius * 1.3);
            const y3 = centerY + Math.sin(angle3) * (radius * 1.3);
            const x4 = centerX + Math.cos(angle4) * radius;
            const y4 = centerY + Math.sin(angle4) * radius;

            if (i === 0) {
                this.ctx.moveTo(x1, y1);
            } else {
                this.ctx.lineTo(x1, y1);
            }
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.lineTo(x4, y4);
        }

        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw center hole
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fill();
        this.ctx.stroke();
    }

    getCurrentTheme() {
        // Check if game data system exists and has GUI settings
        if (this.game.gameDataSystem && this.game.gameDataSystem.gameData && this.game.gameDataSystem.gameData.GUISettings) {
            return this.game.gameDataSystem.gameData.GUISettings.theme || 'none';
        }
        return 'none';
    }

    drawHUDBackground() {
        const currentTheme = this.getCurrentTheme();

        if (currentTheme === 'fantasy-wooden' && this.stoneBackground && this.parchmentBackground) {
            this.drawWoodenHUDBackground();
        } else {
            // Draw default HUD background with rounded corners
            this.drawRoundedRect(
                this.position.x,
                this.position.y,
                this.width,
                this.height,
                this.cornerRadius,
                this.colors.background,
                this.colors.border
            );
        }
    }

    drawWoodenHUDBackground() {
        const stoneMargin = 8;

        // Draw stone background
        this.ctx.drawImage(
            this.stoneBackground,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        // Draw parchment overlay with margin for stone to show
        this.ctx.drawImage(
            this.parchmentBackground,
            this.position.x + stoneMargin,
            this.position.y + stoneMargin,
            this.width - (stoneMargin * 2),
            this.height - (stoneMargin * 2)
        );
    }

    renderDevelopmentOverlay() {
        // Update resize handle position
        this.resizeHandle.x = this.position.x + this.width - this.resizeHandle.size;
        this.resizeHandle.y = this.position.y + this.height - this.resizeHandle.size;

        // Draw hover outline when hovered or being dragged/resized
        if (this.isHovered || this.isDragging || this.isResizing) {
            this.ctx.save();
            this.ctx.strokeStyle = this.isDragging || this.isResizing ? '#00ff00' : '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                this.position.x - 2,
                this.position.y - 2,
                this.width + 4,
                this.height + 4
            );
            this.ctx.restore();
        }

        // Draw resize handle
        this.ctx.save();
        this.ctx.fillStyle = this.isResizing ? '#00ff00' : (this.isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.5)');
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;

        // Draw resize handle as a small square with diagonal lines
        this.ctx.fillRect(
            this.resizeHandle.x,
            this.resizeHandle.y,
            this.resizeHandle.size,
            this.resizeHandle.size
        );
        this.ctx.strokeRect(
            this.resizeHandle.x,
            this.resizeHandle.y,
            this.resizeHandle.size,
            this.resizeHandle.size
        );

        // Draw diagonal lines in resize handle
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        // First diagonal line
        this.ctx.moveTo(this.resizeHandle.x + 2, this.resizeHandle.y + this.resizeHandle.size - 2);
        this.ctx.lineTo(this.resizeHandle.x + this.resizeHandle.size - 2, this.resizeHandle.y + 2);
        // Second diagonal line
        this.ctx.moveTo(this.resizeHandle.x + 5, this.resizeHandle.y + this.resizeHandle.size - 2);
        this.ctx.lineTo(this.resizeHandle.x + this.resizeHandle.size - 2, this.resizeHandle.y + 5);
        this.ctx.stroke();

        this.ctx.restore();
    }

    // Save current HUD settings to gameData
    saveSettings() {
        if (this.game.gameDataSystem) {
            // Create the HUD settings object - save unscaled values
            const hudSettings = {
                position: this.manualPosition || {
                    x: this.position.x / this.uiScale,
                    y: this.position.y / this.uiScale
                },
                width: this.manualSize ? this.manualSize.width : (this.width / this.uiScale),
                height: this.manualSize ? this.manualSize.height : (this.height / this.uiScale)
            };

            // Use targeted update that only saves gameSettings, not full game data
            this.game.gameDataSystem.updateGameSettings({
                hud: hudSettings
            });
        }
    }

    // Load HUD settings from gameData
    loadSettings() {
        console.log('📊 HUD loadSettings() called');
        let hudSettings = null;

        // Try to get settings from gameDataSystem first
        if (this.game.gameDataSystem && this.game.gameDataSystem.gameData.gameSettings?.hud) {
            hudSettings = this.game.gameDataSystem.gameData.gameSettings.hud;
            console.log('📊 HUD: Found settings from gameDataSystem:', hudSettings);
        } else {
            console.log('📊 HUD: gameDataSystem not available or no HUD settings, checking localStorage...');
            console.log('   - gameDataSystem exists:', !!this.game.gameDataSystem);
            if (this.game.gameDataSystem) {
                console.log('   - gameData:', this.game.gameDataSystem.gameData);
                console.log('   - gameSettings:', this.game.gameDataSystem.gameData?.gameSettings);
            }

            // If gameDataSystem isn't ready, load directly from localStorage
            try {
                const dataStr = localStorage.getItem('platformGame_gameData');
                if (dataStr) {
                    const gameData = JSON.parse(dataStr);
                    if (gameData.gameSettings?.hud) {
                        hudSettings = gameData.gameSettings.hud;
                        console.log('📊 HUD: Found settings from localStorage:', hudSettings);
                    } else {
                        console.log('📊 HUD: No HUD settings in localStorage');
                    }
                } else {
                    console.log('📊 HUD: No data in localStorage');
                }
            } catch (error) {
                console.error('Error loading HUD settings from localStorage:', error);
            }
        }

        // Apply the settings if found - these are unscaled values
        if (hudSettings) {
            console.log('✅ HUD: Applying settings:', hudSettings);
            if (hudSettings.position) {
                // Store as manual position (unscaled values)
                this.manualPosition = {
                    x: hudSettings.position.x,
                    y: hudSettings.position.y
                };
                console.log('   - manualPosition set to:', this.manualPosition);
            }
            if (hudSettings.width && hudSettings.height) {
                // Store as manual size (unscaled values)
                this.manualSize = {
                    width: hudSettings.width,
                    height: hudSettings.height
                };
                console.log('   - manualSize set to:', this.manualSize);
            }
        } else {
            console.warn('⚠️ HUD: No settings found - using defaults');
        }
    }

    // Method to connect with player system
    connectToPlayer(playerSystem) {
        // This will be called to sync with actual player stats
        if (playerSystem && playerSystem.data) {
            const player = playerSystem.data;
            // For now, assume player has health and stamina properties
            // These can be added to PlayerData later
            this.updatePlayerStats(
                player.health || 100,
                player.maxHealth || 100,
                player.stamina || 100,
                player.maxStamina || 100
            );
        }
    }

    // Method to hide/show HUD (for development mode vs production)
    setVisible(visible) {
        this.visible = visible;
    }

    get isVisible() {
        return this.visible !== false; // Default to true
    }
}