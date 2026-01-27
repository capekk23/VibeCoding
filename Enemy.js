class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.health = 1;
        this.speed = 80;
        this.vx = 0;
        this.vy = 0;
        
        // AI
        this.state = 'patrol'; // patrol, chase, investigate
        this.patrolTimer = Phaser.Math.Between(100, 300);
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.seePlayerDistance = 200;
        this.lastHeardShotPos = null;
        this.lastHeardShotTime = 0;
        this.investigateRadius = 80;
        
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(10);
    }

    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // Check if player is visible (in flashlight cone)
        let canSeePlayer = false;
        if (player.flashlightOn && distToPlayer < this.seePlayerDistance) {
            const angleToEnemy = Math.atan2(dy, dx);
            const playerAngle = player.angle;
            const angleDiff = Math.abs(playerAngle - angleToEnemy);
            const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
            canSeePlayer = normalizedDiff < player.flashlightAngle;
        }

        // Behavior
        if (canSeePlayer) {
            this.state = 'chase';
            this.lastHeardShotPos = null;
        } else if (this.lastHeardShotPos && Date.now() - this.lastHeardShotTime < 3000) {
            this.state = 'investigate';
        } else {
            this.state = 'patrol';
            this.lastHeardShotPos = null;
        }

        // Movement based on state
        if (this.state === 'chase') {
            this.vx = (dx / distToPlayer) * this.speed;
            this.vy = (dy / distToPlayer) * this.speed;
        } else if (this.state === 'investigate') {
            const investigateDist = Math.sqrt(
                Math.pow(this.lastHeardShotPos.x - this.x, 2) +
                Math.pow(this.lastHeardShotPos.y - this.y, 2)
            );
            if (investigateDist > 5) {
                const invDx = this.lastHeardShotPos.x - this.x;
                const invDy = this.lastHeardShotPos.y - this.y;
                this.vx = (invDx / investigateDist) * this.speed * 0.8;
                this.vy = (invDy / investigateDist) * this.speed * 0.8;
            } else {
                this.vx *= 0.8;
                this.vy *= 0.8;
            }
        } else {
            // Patrol - random walk
            this.patrolTimer--;
            if (this.patrolTimer <= 0) {
                this.patrolAngle = Math.random() * Math.PI * 2;
                this.patrolTimer = Phaser.Math.Between(100, 300);
            }
            this.vx = Math.cos(this.patrolAngle) * this.speed;
            this.vy = Math.sin(this.patrolAngle) * this.speed;
        }

        // Apply movement
        this.x += this.vx * (1/60);
        this.y += this.vy * (1/60);

        // Bounds
        if (this.x < 10) { this.x = 10; this.patrolAngle = Math.PI - this.patrolAngle; }
        if (this.x > 790) { this.x = 790; this.patrolAngle = Math.PI - this.patrolAngle; }
        if (this.y < 10) { this.y = 10; this.patrolAngle = -this.patrolAngle; }
        if (this.y > 590) { this.y = 590; this.patrolAngle = -this.patrolAngle; }

        this.draw(player, canSeePlayer);
    }

    draw(player, canSeePlayer) {
        this.graphics.clear();
        
        // Draw enemy
        if (this.state === 'chase') {
            this.graphics.fillStyle(0xff6b6b);
        } else if (this.state === 'investigate') {
            this.graphics.fillStyle(0xffaa00);
        } else {
            this.graphics.fillStyle(0x9b59b6);
        }
        
        this.graphics.fillCircle(this.x, this.y, 7);
        
        // Eyes
        this.graphics.fillStyle(0xffffff);
        this.graphics.fillCircle(this.x - 3, this.y - 2, 1.5);
        this.graphics.fillCircle(this.x + 3, this.y - 2, 1.5);
        
        if (canSeePlayer) {
            this.graphics.fillStyle(0x000000);
            this.graphics.fillCircle(this.x - 3, this.y - 2, 0.8);
            this.graphics.fillCircle(this.x + 3, this.y - 2, 0.8);
        }
    }

    onShotHeard(pos) {
        const dist = Math.sqrt(Math.pow(pos.x - this.x, 2) + Math.pow(pos.y - this.y, 2));
        if (dist < 300) {
            this.lastHeardShotPos = pos;
            this.lastHeardShotTime = Date.now();
        }
    }

    shoot(enemyBullets, player) {
        if (this.state !== 'chase') return;
        
        if (Phaser.Math.Between(0, 100) < 3) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            enemyBullets.push({
                x: this.x,
                y: this.y,
                vx: (dx / dist) * 250,
                vy: (dy / dist) * 250,
                life: 80
            });
        }
    }
}
