class PlatformRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDevelopmentMode = true;
        this.showDashboard = true;

        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
        this.canvas.height = window.innerHeight;

        this.player = {
            x: 100,
            y: 400,
            width: 40,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            jumpPower: -15,
            onGround: false,
            color: '#FF6B6B'
        };

        this.gravity = 0.8;
        this.friction = 0.8;

        this.platforms = [
            { x: 0, y: 550, width: 300, height: 50, color: '#4ECDC4' },
            { x: 400, y: 450, width: 200, height: 20, color: '#4ECDC4' },
            { x: 700, y: 350, width: 150, height: 20, color: '#4ECDC4' },
            { x: 950, y: 250, width: 200, height: 20, color: '#4ECDC4' },
            { x: 1200, y: 400, width: 300, height: 50, color: '#4ECDC4' }
        ];

        this.camera = {
            x: 0,
            y: 0
        };

        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;

        this.scenes = [
            {
                id: 1,
                name: 'Tutorial',
                description: 'Starting scene with basic platforms',
                platforms: [...this.platforms]
            }
        ];

        this.gameData = {
            characters: [
                { name: 'Hero', description: 'Main player character' }
            ],
            classes: [
                { name: 'Warrior', description: 'Melee combat specialist' }
            ],
            weapons: [
                { name: 'Iron Sword', description: 'Basic melee weapon', damage: 10 }
            ],
            items: [
                { name: 'Health Potion', description: 'Restores 50 HP', effect: 'heal', value: 50 }
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.gameLoop();
        this.updateUI();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left + this.camera.x;
            this.mouseY = e.clientY - rect.top + this.camera.y;

            if (this.isDevelopmentMode) {
                document.getElementById('coordinates').textContent =
                    `X: ${Math.round(this.mouseX)}, Y: ${Math.round(this.mouseY)}`;
            }
        });

        document.getElementById('devModeBtn').addEventListener('click', () => {
            this.setDevelopmentMode(true);
        });

        document.getElementById('productionBtn').addEventListener('click', () => {
            this.setDevelopmentMode(false);
        });

        document.getElementById('toggleDashboardBtn').addEventListener('click', () => {
            this.toggleDashboard();
        });

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
            this.canvas.height = window.innerHeight;
        });
    }

    setDevelopmentMode(isDev) {
        this.isDevelopmentMode = isDev;
        document.getElementById('currentMode').textContent = isDev ? 'Development' : 'Production';
        document.getElementById('coordinates').style.display = isDev ? 'block' : 'none';
    }

    toggleDashboard() {
        this.showDashboard = !this.showDashboard;
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.toggle('hidden', !this.showDashboard);
        this.canvas.width = window.innerWidth - (this.showDashboard ? 300 : 0);
    }

    handleInput() {
        if (this.isDevelopmentMode) {
            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.x -= this.player.speed;
            }
            if (this.keys['arrowright'] || this.keys['d']) {
                this.player.x += this.player.speed;
            }
            if (this.keys['arrowup'] || this.keys['w']) {
                this.player.y -= this.player.speed;
            }
            if (this.keys['arrowdown'] || this.keys['s']) {
                this.player.y += this.player.speed;
            }
        } else {
            if (this.keys['arrowleft'] || this.keys['a']) {
                this.player.velocityX = -this.player.speed;
            } else if (this.keys['arrowright'] || this.keys['d']) {
                this.player.velocityX = this.player.speed;
            } else {
                this.player.velocityX *= this.friction;
            }

            if ((this.keys['arrowup'] || this.keys['w'] || this.keys[' ']) && this.player.onGround) {
                this.player.velocityY = this.player.jumpPower;
                this.player.onGround = false;
            }
        }
    }

    updatePhysics() {
        if (!this.isDevelopmentMode) {
            this.player.velocityY += this.gravity;

            this.player.x += this.player.velocityX;
            this.player.y += this.player.velocityY;

            this.player.onGround = false;

            this.platforms.forEach(platform => {
                if (this.checkCollision(this.player, platform)) {
                    if (this.player.velocityY > 0 && this.player.y < platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                    }
                }
            });

            if (this.player.y > this.canvas.height) {
                this.player.x = 100;
                this.player.y = 400;
                this.player.velocityX = 0;
                this.player.velocityY = 0;
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2;
        this.camera.x = Math.max(0, targetX);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.platforms.forEach(platform => {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            if (this.isDevelopmentMode) {
                this.ctx.strokeStyle = '#333';
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        });

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        if (this.isDevelopmentMode) {
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }

        this.ctx.restore();

        if (this.isDevelopmentMode) {
            this.renderDevInfo();
        }
    }

    renderDevInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 100, 200, 80);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Player X: ${Math.round(this.player.x)}`, 20, this.canvas.height - 80);
        this.ctx.fillText(`Player Y: ${Math.round(this.player.y)}`, 20, this.canvas.height - 65);
        this.ctx.fillText(`Camera X: ${Math.round(this.camera.x)}`, 20, this.canvas.height - 50);
        this.ctx.fillText(`On Ground: ${this.player.onGround}`, 20, this.canvas.height - 35);
        this.ctx.fillText(`Velocity Y: ${Math.round(this.player.velocityY)}`, 20, this.canvas.height - 20);
    }

    updateUI() {
        document.getElementById('scenesList').innerHTML = this.scenes.map(scene =>
            `<div class="item">
                <div class="item-name">${scene.name}</div>
                <div class="item-details">${scene.description}</div>
            </div>`
        ).join('');

        document.getElementById('charactersList').innerHTML = this.gameData.characters.map(char =>
            `<div class="item">
                <div class="item-name">${char.name}</div>
                <div class="item-details">${char.description}</div>
            </div>`
        ).join('');

        document.getElementById('classesList').innerHTML = this.gameData.classes.map(cls =>
            `<div class="item">
                <div class="item-name">${cls.name}</div>
                <div class="item-details">${cls.description}</div>
            </div>`
        ).join('');

        document.getElementById('weaponsList').innerHTML = this.gameData.weapons.map(weapon =>
            `<div class="item">
                <div class="item-name">${weapon.name}</div>
                <div class="item-details">${weapon.description}</div>
            </div>`
        ).join('');

        document.getElementById('itemsList').innerHTML = this.gameData.items.map(item =>
            `<div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">${item.description}</div>
            </div>`
        ).join('');
    }

    gameLoop() {
        this.handleInput();
        this.updatePhysics();
        this.updateCamera();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

const game = new PlatformRPG();