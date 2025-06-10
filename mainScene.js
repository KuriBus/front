import { stompClient } from './game.js';

const SERVER_URL = 'https://kuriverse.com'; 

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.currentDirection = null;
    this.moveInterval = null;
    this.otherPlayers = new Map();
    this.bodytypeMap = new Map(); 
    this.activeBubble = null;
    this.activePortal = null;
    this.chatInputField = null;
    this.customizationSub = null;
    this.positionsSub = null;
  }
  
  init(data) {
    if (data && data.userInfo) {
      window.userInfo = data.userInfo;
    }
    this.roomId = window.userInfo?.roomId || 1;
    this.character = window.userInfo?.character || 'boy1';
    this.nickname = window.userInfo?.nickname || '사용자';
  }

  preload() {
    const characterList = ['boy1', 'boy2', 'boy3', 'girl1', 'girl2', 'girl3'];
    characterList.forEach(key => {
      if (!this.textures.exists(key)) this.load.image(key, `assets/${key}.png`);
    });

    const bgMap = { 1: 'classroom', 2: 'park', 3: 'cultureland' };
    const bgKey = bgMap[this.roomId] || 'classroom';
    if (!this.textures.exists(bgKey)) {
        this.load.image(bgKey, `assets/${bgKey}.png`);
    }
    this.bgKeyToUse = bgKey;
  }

  create() {
    this.input.keyboard.enabled = true;
    this.otherPlayers.clear();
    this.bodytypeMap.clear();
    
    this.roomNameMap = { 1: "교실", 2: "공원", 3: "문화공간" };
    this.currentRoomName = this.roomNameMap[this.roomId] || "교실";

    this.events.on('shutdown', this.shutdown, this);
    
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.input.keyboard.on('keyup', this.handleKeyUp, this);

    this.initWebSocket(this.roomId, this.nickname);

    this.add.image(800, 450, this.bgKeyToUse).setDisplaySize(1600, 900).setDepth(0);
    const titleText = this.currentRoomName || '알 수 없는 곳';
    this.add.rectangle(800, 50, 300, 60, 0xB593CC).setDepth(5).setStrokeStyle(2, 0xffffff);
    this.add.text(800, 50, titleText, { fontSize: '32px', fontFamily: 'Pretendard', color: '#ffffff' }).setOrigin(0.5).setDepth(6);
    this.add.rectangle(300, 750, 580, 200, 0x000000, 0.4).setDepth(2);

    this.chatLogContainer = this.add.dom(300, 730).createFromHTML(`
      <div style="position: relative;">
        <style>
          #chat-log-box::-webkit-scrollbar { width: 6px; }
          #chat-log-box::-webkit-scrollbar-track { background: transparent; }
          #chat-log-box::-webkit-scrollbar-thumb { background-color: #B593CC; border-radius: 3px; }
        </style>
        <div id="chat-log-box" style="width: 534px; height: 180px; overflow-y: auto; background: rgba(0,0,0,0); color: white; font-size: 16px; font-family: Pretendard, sans-serif; padding: 10px; box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #B593CC transparent;"></div>
      </div>
    `).setOrigin(0.5).setDepth(6);
    
    this.chatInput = this.add.dom(300, 850).createFromHTML('<div style="width: 534px; height: 58px; background: #fff; border: 3px solid #B593CC; border-radius: 12px; display: flex; align-items: center; padding: 0 25px; gap: 13px;"><input id="chat-message" type="text" placeholder="메시지를 입력하세요" style="flex: 1; border: none; outline: none; font-size: 16px;" /><button id="send-btn" style="width: 68px; height: 58px; background: #B593CC; border-radius: 12px; border: none; color: #fff; font-weight: bold;">→</button></div>').setOrigin(0.5).setDepth(10);
    
    this.chatInput.on('create', (dom) => {
        this.chatInputField = dom.getChildByID('chat-message');
        const sendButton = dom.getChildByID('send-btn');
        const sendMessage = () => {
            const message = this.chatInputField.value.trim();
            if (message) { 
                this.addChatLog(`${this.nickname}: ${message}`); 
                this.chatInputField.value = '';
                this.createBubble(message);
            }
            this.chatInputField.blur();
        };

        this.chatInputField.addEventListener('focus', () => this.input.keyboard.enabled = false);
        this.chatInputField.addEventListener('blur', () => this.input.keyboard.enabled = true);
        this.chatInputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendMessage();
        });
        sendButton.addEventListener('click', sendMessage);
    });

    this.addChatLog = (text) => {
        const chatBox = this.chatLogContainer.getChildByID('chat-log-box');
        if (chatBox) { 
            const p = document.createElement('p'); p.textContent = text; p.style.margin = '0 0 6px 0'; 
            chatBox.appendChild(p); chatBox.scrollTop = chatBox.scrollHeight; 
        }
    };
    
    this.player = this.physics.add.sprite(800, 450, this.character).setDisplaySize(100, 120).setCollideWorldBounds(true).setOrigin(0.5);
    this.nicknameBg = this.add.rectangle(this.player.x, this.player.y + 78, 100, 22, 0x000000, 0.4).setOrigin(0.5).setDepth(5);
    this.nicknameText = this.add.text(this.player.x, this.player.y + 78, this.nickname, { font: '14px Pretendard', fill: '#ffffff' }).setOrigin(0.5).setDepth(6);

    this.zKey = this.input.keyboard.addKey('Z');
    this.createPortals(this.roomId);

    window.addEventListener('beforeunload', () => {
        if (stompClient.active) {
            this.leaveRoom(this.roomId, this.nickname);
            stompClient.deactivate();
        }
    });
  }

  createBubble(message) {
    if (this.activeBubble) this.activeBubble.destroy();
    const maxWidth = 220;
    const padding = 20;
    const msgText = this.add.text(0, 0, message, { font: '14px Pretendard', color: '#000000', wordWrap: { width: maxWidth, useAdvancedWrap: true }, align: 'center' }).setOrigin(0.5);
    const bubbleWidth = Math.min(msgText.width + padding, maxWidth + padding);
    const bubbleHeight = msgText.height + 30;
    const bubbleRect = this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);
    const tail = this.add.graphics().fillStyle(0xffffff, 1).slice(0, bubbleHeight / 2, 12, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), true).fillPath();
    const bubble = this.add.container(this.player.x, this.player.y - 120, [bubbleRect, tail, msgText]).setDepth(6);
    this.activeBubble = bubble;
    this.time.delayedCall(3000, () => {
        if (this.activeBubble === bubble) { bubble.destroy(); this.activeBubble = null; }
    });
  }

  async joinRoom(roomId, nickname) {
    try {
      await fetch(`${SERVER_URL}/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      console.log('방 입장 성공');
    } catch (e) {
      console.error('방 입장 오류:', e);
    }
  }

  async leaveRoom(roomId, nickname) {
    try {
        await fetch(`${SERVER_URL}/api/rooms/${roomId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: nickname })
        });
        console.log("방 퇴장 완료");
    } catch (error) {
        console.error("퇴장 오류:", error);
    }
  }
  
  async getAllCustomizations() {
    try {
      const response = await fetch(`${SERVER_URL}/api/customization/all`); 
      if (!response.ok) {
        throw new Error(`전체 외형 정보 로딩 실패: ${response.status}`);
      }
      const allCustoms = await response.json();
      allCustoms.forEach(custom => {
        const bodytype = custom.bodytype || custom.bodyType;
        this.bodytypeMap.set(custom.nickname, bodytype);
      });
    } catch (e) {
      console.error('전체 외형 정보 로딩 중 오류:', e);
    }
  }

  async initWebSocket(roomId, nickname) {
    await this.joinRoom(roomId, nickname);
    await this.getAllCustomizations();
    
    if (stompClient.active) {
      this.setupSubscriptions();
      stompClient.publish({ destination: "/app/move", body: JSON.stringify({ nickname, direction: "init", roomId }) });
    } else {
      stompClient.onConnect = () => {
        this.setupSubscriptions();
        stompClient.publish({ destination: "/app/move", body: JSON.stringify({ nickname, direction: "init", roomId }) });
      };
    }
  }

  setupSubscriptions() {
    const bodytypeToCharacter = { 1: 'boy1', 2: 'boy2', 3: 'boy3', 4: 'girl1', 5: 'girl2', 6: 'girl3' };
    
    this.customizationSub = stompClient.subscribe('/topic/customization', (message) => {
      const data = JSON.parse(message.body);
      const bodytype = data.bodytype || data.bodyType;
      this.bodytypeMap.set(data.nickname, bodytype);
      if (this.otherPlayers.has(data.nickname)) {
        const player = this.otherPlayers.get(data.nickname);
        const charKey = bodytypeToCharacter[bodytype] || 'boy1';
        player.sprite.setTexture(charKey);
      }
    });
    
    this.positionsSub = stompClient.subscribe('/topic/positions', (message) => {
      const positions = JSON.parse(message.body);
      const usersInSameRoom = positions.filter(pos => pos.roomName === this.currentRoomName);
      const receivedNicknames = new Set(usersInSameRoom.map(p => p.nickname));
      const myData = positions.find(pos => pos.nickname === this.nickname);
      if (myData && this.player) {
          const SCALE = 40; this.player.setPosition(myData.x * SCALE, myData.y * SCALE);
      }
      usersInSameRoom.forEach(pos => {
        if (pos.nickname === this.nickname) return;
        const SCALE = 40; const targetX = pos.x * SCALE; const targetY = pos.y * SCALE;
        if (!this.otherPlayers.has(pos.nickname)) {
          const bodytype = this.bodytypeMap.get(pos.nickname);
          const charKey = bodytypeToCharacter[bodytype] || 'boy1';
          const otherSprite = this.physics.add.sprite(targetX, targetY, charKey).setDisplaySize(100, 120);
          const nicknameBg = this.add.rectangle(targetX, targetY + 78, 100, 22, 0x000000, 0.4).setOrigin(0.5).setDepth(5);
          const nicknameText = this.add.text(targetX, targetY + 78, pos.nickname, { font: '14px Pretendard', fill: '#ffffff' }).setOrigin(0.5).setDepth(6);
          this.otherPlayers.set(pos.nickname, { sprite: otherSprite, nicknameBg, nicknameText });
        } else {
          const playerObj = this.otherPlayers.get(pos.nickname);
          playerObj.sprite.setPosition(targetX, targetY);
        }
      });
      this.otherPlayers.forEach((playerData, nick) => {
        if (!receivedNicknames.has(nick)) {
          playerData.sprite.destroy(); playerData.nicknameBg.destroy(); playerData.nicknameText.destroy();
          this.otherPlayers.delete(nick); this.bodytypeMap.delete(nick);
        }
      });
    });
  }

  createPortals(roomId) {
    const portalConfig = {
      1: [{ x: 100, y: 450, target: { scene: 'BridgeScene', roomId: 5 } }, { x: 1500, y: 450, target: { scene: 'BridgeScene', roomId: 4 } }],
      2: [{ x: 100, y: 450, target: { scene: 'BridgeScene', roomId: 6 } }, { x: 1500, y: 450, target: { scene: 'BridgeScene', roomId: 5 } }],
      3: [{ x: 100, y: 450, target: { scene: 'BridgeScene', roomId: 4 } }, { x: 1500, y: 450, target: { scene: 'BridgeScene', roomId: 6 } }]
    };
    if (!portalConfig[roomId]) return;

    this.portals = this.physics.add.staticGroup();
    portalConfig[roomId].forEach(portalInfo => {
        const p = this.add.circle(portalInfo.x, portalInfo.y, 30, 0xFF00FF, 0.3).setDepth(4);
        this.portals.add(p);
        p.setData('target', portalInfo.target);
    });
  }

  update() {
    if (!this.player) return;

    this.activePortal = null;
    this.physics.world.overlap(this.player, this.portals, (player, portal) => {
        this.activePortal = portal.getData('target');
    }, null, this);

    if (this.activeBubble) this.activeBubble.setPosition(this.player.x, this.player.y - 120);
    
    if (this.nicknameText && this.nicknameBg) {
      this.nicknameText.setPosition(this.player.x, this.player.y + 78);
      this.nicknameBg.setPosition(this.player.x, this.player.y + 78);
    }
    this.otherPlayers.forEach(playerObj => {
      const { sprite, nicknameBg, nicknameText } = playerObj;
      nicknameBg.setPosition(sprite.x, sprite.y + 78);
      nicknameText.setPosition(sprite.x, sprite.y + 78);
    });

    if (this.activePortal && Phaser.Input.Keyboard.JustDown(this.zKey)) {
        this.input.keyboard.enabled = false; 
        this.leaveRoom(this.roomId, this.nickname).finally(() => {
            window.userInfo.roomId = this.activePortal.roomId;
            this.scene.start(this.activePortal.scene, { userInfo: window.userInfo });
        });
        this.activePortal = null;
    }
  }
  
  handleKeyDown(event) {
    if (!this.input.keyboard.enabled) return;
    const keyMap = { ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd' };
    const dir = keyMap[event.key] || (['w', 'a', 's', 'd'].includes(event.key.toLowerCase()) ? event.key.toLowerCase() : null);
    if (dir && dir !== this.currentDirection) {
      this.currentDirection = dir;
      if (this.moveInterval) clearInterval(this.moveInterval);
      const payload = { nickname: this.nickname, direction: dir, roomId: this.roomId };
      stompClient.publish({ destination: "/app/move", body: JSON.stringify(payload) });
      this.moveInterval = setInterval(() => {
        stompClient.publish({ destination: "/app/move", body: JSON.stringify(payload) });
      }, 100);
    }
  }

  handleKeyUp(event) {
    if (!this.input.keyboard.enabled) return;
    const dirKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (dirKeys.includes(event.key)) {
      if (this.moveInterval) clearInterval(this.moveInterval);
      this.moveInterval = null; 
      this.currentDirection = null;
      stompClient.publish({ destination: "/app/move", body: JSON.stringify({ nickname: this.nickname, direction: "stop", roomId: this.roomId }) });
    }
  }
  
  shutdown() {
    console.log(`MainScene shutdown: Cleaning up...`);
    this.input.keyboard.off('keydown', this.handleKeyDown, this);
    this.input.keyboard.off('keyup', this.handleKeyUp, this);
    if (this.customizationSub) this.customizationSub.unsubscribe();
    if (this.positionsSub) this.positionsSub.unsubscribe();
    if (this.moveInterval) clearInterval(this.moveInterval);
  }
}

export default MainScene;
