import StartScene from './StartScene.js';
import NicknameScene from './NicknameScene.js';
import CharacterSelectScene from './CharacterSelectScene.js';
import WorldMapScene from './WorldMapScene.js';
import MainScene from './mainScene.js';
import BridgeScene from './BridgeScene.js'; // 추가된 부분

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
  scene: [
    StartScene,           // 시작 화면
    NicknameScene,        // 닉네임 입력
    CharacterSelectScene, // 캐릭터 선택
    WorldMapScene,        // 월드맵 선택
    MainScene,            // 교실/문화공간
    BridgeScene           // 브리지 씬
  ]
};

const game = new Phaser.Game(config);