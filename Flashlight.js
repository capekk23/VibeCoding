class Flashlight {
    static draw(scene, player, graphics) {
        if (!player.flashlightOn) return;

        graphics.clear();
        graphics.fillStyle(0xfffa96, 0.08);
        graphics.lineStyle(2, 0xfffa96, 0.3);

        const range = player.flashlightRange;
        const angle1 = player.angle - player.flashlightAngle;
        const angle2 = player.angle + player.flashlightAngle;

        graphics.beginPath();
        graphics.arc(player.x, player.y, range, angle1, angle2, false);
        graphics.lineTo(player.x, player.y);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }

    static isEnemyVisible(player, enemy) {
        if (!player.flashlightOn) return false;

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > player.flashlightRange) return false;

        const angleToEnemy = Math.atan2(dy, dx);
        const angleDiff = Math.abs(player.angle - angleToEnemy);
        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

        return normalizedDiff < player.flashlightAngle;
    }
}
