// import MainScene from './mainScene.js';
// import LoginScene from './loginScene.js';

// const config = {
//   type: Phaser.AUTO,
//   width: 1600,
//   height: 900,
//   parent: 'game-container',
//   physics: {
//     default: 'arcade',
//     arcade: { debug: false }
//   },
//   dom: {
//     createContainer: true
//   },
//   scene: [LoginScene, MainScene]
// };

// const game = new Phaser.Game(config);
import StartScene from './StartScene.js';
import NicknameScene from './NicknameScene.js';
import WorldMapScene from './WorldMapScene.js';
import MainScene from './mainScene.js';

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
  scene: [StartScene, NicknameScene, WorldMapScene, MainScene]
};

const game = new Phaser.Game(config);
