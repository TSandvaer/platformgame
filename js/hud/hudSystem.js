class HUDSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;

        // HUD positioning and sizing
        this.position = { x: 20, y: 20 };
        this.width = 240;  // Increased from 220 to 240 to accommodate extra padding
        this.height = 80;
        this.cornerRadius = 8;

        // Bar settings
        this.barWidth = 140;
        this.barHeight = 16;
        this.barSpacing = 25;
        this.barOffsetX = 85;  // Increased from 65 to 85 for more left padding
        this.barOffsetY = 35;

        // Gear icon settings
        this.gearSize = 16;
        this.gearPosition = { x: 15, y: 8 };  // Increased from x: 8 to x: 15

        // Player stats (will be connected to player system later)
        this.playerStats = {
            health: { current: 100, max: 100 },
            stamina: { current: 100, max: 100 },
            coins: 0
        };

        // Coin display settings
        this.coinIconSize = 16;
        this.coinIcon = null;
        this.loadCoinIcon();

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
        this.resizeHandle = { x: 0, y: 0, size: 12 }; // Size of resize handle
        this.setupDragAndResize();

        // Load saved settings from gameData
        this.loadSettings();
    }

    loadCoinIcon() {
        const coinImg = new Image();
        coinImg.onload = () => {
            this.coinIcon = coinImg;
            console.log('💰 Coin icon loaded for HUD');
        };
        coinImg.onerror = () => {
            console.error('💰 Failed to load coin icon for HUD');
        };
        coinImg.src = 'sprites/Coins/gold/gold.png';
    }

    loadWoodenGUIAssets() {
        // Load stone background
        const stoneImg = new Image();
        stoneImg.onload = () => {
            this.stoneBackground = stoneImg;
            console.log('🏰 Stone background loaded for HUD');
        };
        stoneImg.onerror = () => {
            console.error('🏰 Failed to load stone background for HUD');
        };
        stoneImg.src = 'GUI/graphics/Fantasy Wooden GUI/PNG/UI board Small  stone.png';

        // Load parchment background
        const parchmentImg = new Image();
        parchmentImg.onload = () => {
            this.parchmentBackground = parchmentImg;
            console.log('📜 Parchment background loaded for HUD');
        };
        parchmentImg.onerror = () => {
            console.error('📜 Failed to load parchment background for HUD');
        };
        parchmentImg.src = 'GUI/graphics/Fantasy Wooden GUI/PNG/UI board Small  parchment.png';
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
        console.log('🎮 Game settings requested');
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
            }

            // Handle resizing
            if (this.isResizing) {
                const newWidth = mouseX - this.position.x;
                const newHeight = mouseY - this.position.y;

                // Set minimum and maximum sizes
                this.width = Math.max(150, Math.min(400, newWidth));
                this.height = Math.max(60, Math.min(200, newHeight));
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

        // Draw belt in production mode
        if (!this.game.isDevelopmentMode) {
            this.drawBelt();
        }

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
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x - 55, y + this.barHeight / 2);

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
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(current)}/${max}`, x + this.barWidth / 2, y + this.barHeight / 2);
    }

    drawCoinCounter() {
        const coinY = this.position.y + this.barOffsetY + (this.barSpacing * 2);
        const iconX = this.position.x + this.barOffsetX - 55;
        const textX = iconX + this.coinIconSize + 5;

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
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.playerStats.coins}`, textX, coinY + this.coinIconSize / 2);
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
            // Create the HUD settings object
            const hudSettings = {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                width: this.width,
                height: this.height
            };

            // Use targeted update that only saves gameSettings, not full game data
            this.game.gameDataSystem.updateGameSettings({
                hud: hudSettings
            });
        }
    }

    // Load HUD settings from gameData
    loadSettings() {
        let hudSettings = null;

        // Try to get settings from gameDataSystem first
        if (this.game.gameDataSystem && this.game.gameDataSystem.gameData.gameSettings?.hud) {
            hudSettings = this.game.gameDataSystem.gameData.gameSettings.hud;
        } else {
            // If gameDataSystem isn't ready, load directly from localStorage
            try {
                const dataStr = localStorage.getItem('platformGame_gameData');
                if (dataStr) {
                    const gameData = JSON.parse(dataStr);
                    if (gameData.gameSettings?.hud) {
                        hudSettings = gameData.gameSettings.hud;
                    }
                }
            } catch (error) {
                console.error('Error loading HUD settings from localStorage:', error);
            }
        }

        // Apply the settings if found
        if (hudSettings) {
            if (hudSettings.position) {
                this.position.x = hudSettings.position.x;
                this.position.y = hudSettings.position.y;
            }
            if (hudSettings.width) this.width = hudSettings.width;
            if (hudSettings.height) this.height = hudSettings.height;
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

    drawBelt() {
        // Belt position - bottom left corner
        const beltX = 20;
        const beltY = this.canvas.height - 100;
        const slotSize = 50;
        const slotSpacing = 8;
        const slotBorderWidth = 2;

        // Draw belt background
        this.ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;

        const totalWidth = (slotSize * 4) + (slotSpacing * 3) + 20;
        this.drawRoundedRect(beltX - 10, beltY - 10, totalWidth, slotSize + 20, 8,
                           'rgba(30, 30, 30, 0.8)', '#FFD700');

        // Get player belt data
        const playerBelt = this.game.playerSystem?.data?.belt || [null, null, null, null];

        // Draw each belt slot
        for (let i = 0; i < 4; i++) {
            const slotX = beltX + (i * (slotSize + slotSpacing));
            const item = playerBelt[i];

            // Draw slot background (only if empty)
            if (!item) {
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(slotX, beltY, slotSize, slotSize);
            }

            // Draw slot border
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = slotBorderWidth;
            this.ctx.strokeRect(slotX, beltY, slotSize, slotSize);

            // Draw slot number
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(String(i + 1), slotX + 4, beltY + 2);

            // Draw item if present
            if (item) {
                let spriteDrawn = false;

                // Try to draw sprite from multiple sources
                if (item.sprite) {
                    // Calculate aspect ratio preserving dimensions
                    const maxSize = 32;
                    const aspectRatio = item.sprite.width / item.sprite.height;
                    let drawWidth = maxSize;
                    let drawHeight = maxSize;

                    if (aspectRatio > 1) {
                        // Wider than tall
                        drawHeight = maxSize / aspectRatio;
                    } else {
                        // Taller than wide
                        drawWidth = maxSize * aspectRatio;
                    }

                    // Center the sprite in the slot
                    const drawX = slotX + (slotSize - drawWidth) / 2;
                    const drawY = beltY + (slotSize - drawHeight) / 2;

                    // First try the inventory system's loaded spritesheet
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
                    // If that fails, try to load the sprite directly
                    else if (item.sprite.src) {
                        const img = new Image();
                        img.onload = () => {
                            // Store for future use
                            if (!this.beltSpriteCache) this.beltSpriteCache = {};
                            this.beltSpriteCache[item.id] = img;
                        };
                        img.src = item.sprite.src;

                        // Check if we have it cached
                        if (this.beltSpriteCache && this.beltSpriteCache[item.id]) {
                            const cachedImg = this.beltSpriteCache[item.id];
                            this.ctx.imageSmoothingEnabled = false;
                            this.ctx.drawImage(
                                cachedImg,
                                item.sprite.x, item.sprite.y,
                                item.sprite.width, item.sprite.height,
                                drawX, drawY, drawWidth, drawHeight
                            );
                            this.ctx.imageSmoothingEnabled = true;
                            spriteDrawn = true;
                        }
                    }
                }

                if (!spriteDrawn) {
                    // Fallback colored icon based on item type
                    const color = item.id === 'healthPotion' ? '#FF4444' :
                                 item.id === 'staminaPotion' ? '#FFD700' :
                                 item.id === 'manaPotion' ? '#4444FF' : '#4CAF50';
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(slotX + 10, beltY + 10, 30, 30);

                    // Add potion bottle shape
                    this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    this.ctx.fillRect(slotX + 20, beltY + 8, 10, 6);
                    this.ctx.fillRect(slotX + 22, beltY + 6, 6, 4);
                }

                // Draw item quantity if > 1
                if (item.quantity > 1) {
                    // Background for better readability
                    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    const qtyText = String(item.quantity);
                    this.ctx.font = 'bold 12px Arial';
                    const textWidth = this.ctx.measureText(qtyText).width;
                    this.ctx.fillRect(slotX + slotSize - textWidth - 6, beltY + slotSize - 16, textWidth + 4, 14);

                    // Quantity text
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.textAlign = 'right';
                    this.ctx.textBaseline = 'bottom';
                    this.ctx.fillText(qtyText, slotX + slotSize - 4, beltY + slotSize - 4);
                }

                // Draw item name below (smaller)
                this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
                this.ctx.font = '9px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                const name = item.name || item.id;
                if (name) {
                    const displayName = name.length > 8 ? name.substring(0, 7) + '..' : name;
                    this.ctx.fillText(displayName, slotX + slotSize/2, beltY + slotSize - 2);
                }
            }
        }

        // Draw belt label
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('QUICK BELT', beltX, beltY - 15);
    }
}