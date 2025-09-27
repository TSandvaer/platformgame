class HUDSystem {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;

        // HUD positioning and sizing
        this.position = { x: 20, y: 20 };
        this.width = 220;
        this.height = 80;
        this.cornerRadius = 8;

        // Bar settings
        this.barWidth = 140;
        this.barHeight = 16;
        this.barSpacing = 25;
        this.barOffsetX = 65;
        this.barOffsetY = 35;

        // Gear icon settings
        this.gearSize = 16;
        this.gearPosition = { x: 8, y: 8 };

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

        // Draw HUD background with rounded corners
        this.drawRoundedRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height,
            this.cornerRadius,
            this.colors.background,
            this.colors.border
        );

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
        // Draw label
        this.ctx.fillStyle = this.colors.text;
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

        // Draw coin count text
        this.ctx.fillStyle = this.colors.text;
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
}