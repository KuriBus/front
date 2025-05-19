const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [LoginScene, MainScene]
};

const game = new Phaser.Game(config);