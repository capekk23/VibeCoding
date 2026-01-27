class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.flashlightOn = true;
        this.flashlightRange = 220;
        this.flashlightAngle = 0.6; // cone width in radians
        this.mouseX = x;
        this.mouseY = y;
        this.angle = 0;
        this.speed = 150;
        
        // Weapon
        this.lastShotTime = 0;
        this.shotCooldown = 100; // ms between shots
        
        this.graphics = scene.add.graphics();
        this.drawPlayer();
    }

    drawPlayer() {
        this.graphics.clear();
        this.graphics.fillStyle(0x4ecdc4);
        this.graphics.fillCircle(this.x, this.y, 8);
        
        // Draw direction indicator
        this.graphics.lineStyle(2, 0xffd93d);
        const gunLength = 12;
        this.graphics.lineBetween(
            this.x,
            this.y,
            this.x + Math.cos(this.angle) * gunLength,
            this.y + Math.sin(this.angle) * gunLength
        );
    }

    update(keys) {
        // Movement
        let vx = 0, vy = 0;
        if (keys.W.isDown) vy = -this.speed;
        if (keys.S.isDown) vy = this.speed;
        if (keys.A.isDown) vx = -this.speed;
        if (keys.D.isDown) vx = this.speed;

        // Move
        this.x += vx * (1/60);
        this.y += vy * (1/60);

        // Bounds
        this.x = Phaser.Math.Clamp(this.x, 10, 790);
        this.y = Phaser.Math.Clamp(this.y, 10, 590);

        // Ammo regen
        if (this.ammo < this.maxAmmo) {
            this.ammo = Math.min(this.maxAmmo, this.ammo + 0.08);
        }

        this.drawPlayer();
    }

    shoot(bullets) {
        if (this.ammo <= 0) return;
        
        const now = Date.now();
        if (now - this.lastShotTime < this.shotCooldown) return;
        
        this.lastShotTime = now;
        this.ammo--;

        const speed = 350;
        bullets.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(this.angle) * speed,
            vy: Math.sin(this.angle) * speed,
            life: 100
        });

        // Report shot location to enemies
        return { x: this.x, y: this.y };
    }

    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;
    }
}
