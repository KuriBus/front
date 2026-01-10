import StartScene from './StartScene.js';
import LoginScene from './LoginScene.js';
import RegisterScene from './RegisterScene.js';
import CharacterSelectScene from './CharacterSelectScene.js';
import WorldMapScene from './WorldMapScene.js';
import MainScene from './mainScene.js';
import BridgeScene from './BridgeScene.js';

import { Client } from 'https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.1/+esm';
import { getToken } from './api.js';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  dom: {
    createContainer: true,
  },
  scene: [
    StartScene,
    LoginScene,
    RegisterScene,
    CharacterSelectScene,
    WorldMapScene,
    MainScene,
    BridgeScene,
  ],
};

const game = new Phaser.Game(config);

// WebSocket URL
const WS_URL = 'https://kuriverse.shop/ws';

// SockJS 소켓 생성
// const socket = new SockJS(WS_URL);

// STOMP 클라이언트 생성 및 인증 토큰 포함
const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  connectHeaders: {
    Authorization: `Bearer ${getToken()}`, 
  },
  reconnectDelay: 5000,
  debug: (str) => console.log('[STOMP]', str),
});

stompClient.onConnect = () => {
  console.log("STOMP WebSocket 연결 성공");
};

stompClient.onStompError = (frame) => {
  console.error("STOMP 오류:", frame.headers['message']);
};

stompClient.activate();

// export { stompClient, socket };
export { stompClient };