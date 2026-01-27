const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: GameScene,
    render: {
        pixelArt: false,
        antialias: true
    }
};

const game = new Phaser.Game(config);
