class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.gameRunning = true;
        this.score = 0;

        // Create player
        this.player = new Player(this, 400, 300);

        // Create graphics layers
        this.flashlightGraphics = this.add.graphics();
        this.flashlightGraphics.setDepth(5);

        this.bulletGraphics = this.add.graphics();
        this.bulletGraphics.setDepth(8);

        // Game objects
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];

        // Spawn initial enemies
        this.spawnEnemy();
        this.spawnEnemy();

        this.spawnCounter = 0;
        this.spawnRate = 150;

        // Input
        this.keys = this.input.keyboard.addKeys({
            W: 'W',
            A: 'A',
            S: 'S',
            D: 'D',
            F: 'F'
        });

        let fPressed = false;
        this.keys.F.on('down', () => {
            if (!fPressed) {
                this.player.toggleFlashlight();
                fPressed = true;
            }
        });
        this.keys.F.on('up', () => {
            fPressed = false;
        });

        // Mouse tracking
        this.input.on('pointermove', (pointer) => {
            this.player.mouseX = pointer.x;
            this.player.mouseY = pointer.y;
            this.player.angle = Math.atan2(pointer.y - this.player.y, pointer.x - this.player.x);
        });

        this.input.on('pointerdown', () => {
            const shotPos = this.player.shoot(this.bullets);
            if (shotPos) {
                this.enemies.forEach(enemy => enemy.onShotHeard(shotPos));
            }
        });

        // UI
        this.uiText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0).setDepth(100);

        this.flashlightText = this.add.text(10, 70, '', {
            fontSize: '12px',
            fill: '#4ecdc4',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 8 }
        }).setScrollFactor(0).setDepth(100);

        this.instructionsText = this.add.text(790, 10, 'WASD-Move\nMouse-Aim\nClick-Shoot\nF-Light', {
            fontSize: '11px',
            fill: '#aaa',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 8 },
            align: 'right'
        }).setScrollFactor(0).setOrigin(1, 0).setDepth(100);
    }

    update() {
        if (!this.gameRunning) return;

        // Update player
        this.player.update(this.keys);

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
            enemy.shoot(this.enemyBullets, this.player);
        });

        // Update and draw bullets
        this.bulletGraphics.clear();
        this.bulletGraphics.fillStyle(0xffd93d);

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * (1/60);
            b.y += b.vy * (1/60);
            b.life--;

            if (b.life <= 0 || b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
                this.bullets.splice(i, 1);
            } else {
                this.bulletGraphics.fillCircle(b.x, b.y, 3);

                // Check collision with enemies
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const e = this.enemies[j];
                    const dx = b.x - e.x;
                    const dy = b.y - e.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 10) {
                        e.health--;
                        this.bullets.splice(i, 1);
                        this.score += 10;
                        if (e.health <= 0) {
                            this.score += 40;
                        }
                        break;
                    }
                }
            }
        }

        // Update and draw enemy bullets
        this.bulletGraphics.fillStyle(0xff6b6b);
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            b.x += b.vx * (1/60);
            b.y += b.vy * (1/60);
            b.life--;

            if (b.life <= 0 || b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
                this.enemyBullets.splice(i, 1);
            } else {
                this.bulletGraphics.fillCircle(b.x, b.y, 2);

                // Check collision with player
                const dx = b.x - this.player.x;
                const dy = b.y - this.player.y;
                if (Math.sqrt(dx * dx + dy * dy) < 8) {
                    this.player.health -= 8;
                    this.enemyBullets.splice(i, 1);
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }

        // Check enemy collisions with player
        this.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 15) {
                this.player.health -= 0.2;
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(e => {
            if (e.health <= 0) {
                e.graphics.destroy();
                return false;
            }
            return true;
        });

        // Spawn enemies
        this.spawnCounter++;
        if (this.spawnCounter > this.spawnRate) {
            this.spawnEnemy();
            this.spawnCounter = 0;
        }

        // Draw flashlight
        Flashlight.draw(this, this.player, this.flashlightGraphics);

        // Update UI
        this.uiText.setText(
            `❤️ Health: ${Math.ceil(this.player.health)}\n⭐ Score: ${this.score}\n🔫 Ammo: ${Math.ceil(this.player.ammo)}/${this.player.maxAmmo}`
        );
        this.flashlightText.setText(this.player.flashlightOn ? '💡 Flashlight: ON (F)' : '💡 Flashlight: OFF (F)');
    }

    spawnEnemy() {
        const edges = [
            { x: Phaser.Math.Between(0, 800), y: -20 },
            { x: 820, y: Phaser.Math.Between(0, 600) },
            { x: Phaser.Math.Between(0, 800), y: 620 },
            { x: -20, y: Phaser.Math.Between(0, 600) }
        ];
        const spawn = Phaser.Utils.Array.GetRandom(edges);
        this.enemies.push(new Enemy(this, spawn.x, spawn.y));
    }

    gameOver() {
        this.gameRunning = false;
        const gameOverText = this.add.text(400, 300, `GAME OVER\nScore: ${this.score}\n\nClick to Restart`, {
            fontSize: '32px',
            fill: '#ffd93d',
            backgroundColor: '#000000dd',
            padding: { x: 30, y: 30 },
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
}
