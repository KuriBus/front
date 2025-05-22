import MainScene from './mainScene.js';
import LoginScene from './loginScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  dom: {
    createContainer: true
  },
  scene: [LoginScene, MainScene]
};

const game = new Phaser.Game(config);