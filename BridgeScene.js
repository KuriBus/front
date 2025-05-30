class BridgeScene extends Phaser.Scene {
  constructor() {
    super('BridgeScene');
  }

  init(data) {
    if (data && data.userInfo) {
      window.userInfo = data.userInfo;
    }
    this.roomId = window.userInfo?.roomId || 4;
    this.character = window.userInfo?.character || 'boy1';
    this.nickname = window.userInfo?.nickname || '사용자';
  }

  preload() {
    const characterList = ['boy1', 'boy2', 'boy3', 'girl1', 'girl2', 'girl3'];
    characterList.forEach(key => {
      if (!this.textures.exists(key)) {
        this.load.image(key, `assets/${key}.png`);
      }
    });

    const bgMap = {
      4: 'bridge1',
      5: 'bridge2',
      6: 'bridge3'
    };
    const bgKey = bgMap[this.roomId] || 'bridge1';
    const uniqueBgKey = `bg${this.roomId}`;

    if (!this.textures.exists(uniqueBgKey)) {
      this.load.image(uniqueBgKey, `assets/${bgKey}.png`);
    }

    this.bgKeyToUse = uniqueBgKey;
  }

  create() {
    this.add.image(800, 450, this.bgKeyToUse).setDisplaySize(1600, 900).setDepth(0);

    const title = this.roomId === 4 ? '통로 1' : this.roomId === 5 ? '통로 2' : this.roomId === 6 ? '통로 3' : '알 수 없는 방';
    this.add.rectangle(800, 50, 300, 60, 0xB593CC).setDepth(5).setStrokeStyle(2, 0xffffff);
    this.add.text(800, 50, title, {
      fontSize: '32px',
      fontFamily: 'Pretendard',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(6);

    this.add.rectangle(300, 750, 590, 250, 0x000000, 0.4).setDepth(2);

    this.chatLogContainer = this.add.dom(300, 730).createFromHTML(`
      <div style="position: relative;">
        <style>
          #chat-log-box::-webkit-scrollbar {
            width: 6px;
          }
          #chat-log-box::-webkit-scrollbar-track {
            background: transparent;
          }
          #chat-log-box::-webkit-scrollbar-thumb {
            background-color: #B593CC;
            border-radius: 3px;
          }
        </style>
        <div id="chat-log-box" style="
          width: 534px;
          height: 180px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0);
          color: white;
          font-size: 16px;
          font-family: Pretendard, sans-serif;
          padding-right: 10px;
          padding-left: 10px;
          padding-top: 10px;
          box-sizing: border-box;
          border-radius: 8px;
          scrollbar-width: thin;
          scrollbar-color: #B593CC transparent;
        "></div>
      </div>
    `).setOrigin(0.5).setDepth(6);

    this.chatInput = this.add.dom(300, 850).createFromHTML(`
      <div style="width: 534px; height: 58px; background: #fff; border: 3px solid #B593CC; border-radius: 12px; display: flex; align-items: center; padding: 0 25px; gap: 13px;">
        <input id="chat-message" type="text" placeholder="메시지를 입력하세요" style="flex: 1; border: none; outline: none; font-size: 16px;" />
        <button id="send-btn" style="width: 68px; height: 58px; background: #B593CC; border-radius: 12px; border: none; color: #fff; font-weight: bold;">→</button>
      </div>
    `).setOrigin(0.5).setDepth(10);

    const chatInputField = this.chatInput.getChildByID('chat-message');
    chatInputField.addEventListener('focus', () => this.input.keyboard.enabled = false);
    chatInputField.addEventListener('blur', () => this.input.keyboard.enabled = true);
    chatInputField.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        document.getElementById('send-btn').click();
        chatInputField.blur();
      }
    });

    this.chatInput.addListener('click');
    this.chatInput.on('click', (event) => {
      if (event.target.id === 'send-btn') {
        const inputEl = document.getElementById('chat-message');
        const message = inputEl.value.trim();
        if (message) {
          this.addChatLog(`${this.nickname}: ${message}`);
          inputEl.value = '';

          const maxWidth = 220;
          const padding = 20;

          const msgText = this.add.text(0, 0, message, {
            font: '14px Pretendard',
            color: '#000000',
            wordWrap: { width: maxWidth, useAdvancedWrap: true },
            align: 'center'
          }).setOrigin(0.5);

          this.time.delayedCall(0, () => {
            if (this.activeBubble) this.activeBubble.destroy();

            const bubbleWidth = Math.min(msgText.width + padding, maxWidth + padding);
            const bubbleHeight = msgText.height + 30;
            const tailSize = 12;

            const bubbleRect = this.add.graphics();
            bubbleRect.fillStyle(0xffffff, 1);
            bubbleRect.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);

            const tail = this.add.graphics();
            tail.fillStyle(0xffffff, 1);
            tail.beginPath();
            tail.moveTo(-tailSize, 0);
            tail.lineTo(0, tailSize);
            tail.lineTo(tailSize, 0);
            tail.closePath();
            tail.fillPath();
            tail.setPosition(0, bubbleHeight / 2);

            msgText.setPosition(0, 0);

            const bubble = this.add.container(this.player.x, this.player.y - 120, [
              bubbleRect, tail, msgText
            ]);
            bubble.setDepth(6);
            this.activeBubble = bubble;

            this.time.delayedCall(3000, () => {
              if (this.activeBubble === bubble) {
                bubble.destroy();
                this.activeBubble = null;
              }
            });
          });
        }
      }
    });

    this.addChatLog = (text) => {
      const chatBox = document.getElementById('chat-log-box');
      const p = document.createElement('p');
      p.textContent = text;
      p.style.margin = '0 0 6px 0';
      chatBox.appendChild(p);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    const spriteKey = this.character;
    this.player = this.physics.add.sprite(800, 450, spriteKey);
    this.player.setOrigin(0.5);
    this.player.setCollideWorldBounds(true);

    const standardHeight = 180;
    const texture = this.textures.get(spriteKey).getSourceImage();
    const scale = standardHeight / texture.height;
    this.player.setScale(scale);

    this.nicknameText = this.add.text(this.player.x, this.player.y + 78, this.nickname, {
      font: '14px Pretendard',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 200 }
    }).setOrigin(0.5).setDepth(6);

    const textWidth = this.nicknameText.width + 20;
    const textHeight = this.nicknameText.height + 10;

    this.nicknameBg = this.add.rectangle(this.player.x, this.player.y + 78, textWidth, textHeight, 0x000000, 0.4)
      .setOrigin(0.5).setDepth(5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.createPortals(this.roomId);
    this.zKey = this.input.keyboard.addKey('Z');
  }

  createPortals(roomId) {
    const portalConfig = {
      4: [
        { x: 100, y: 450, target: { scene: 'MainScene', roomId: 1 } },
        { x: 1500, y: 450, target: { scene: 'MainScene', roomId: 3 } }
      ],
      5: [
        { x: 100, y: 450, target: { scene: 'MainScene', roomId: 1 } },
        { x: 1500, y: 450, target: { scene: 'MainScene', roomId: 2 } }
      ],
      6: [
        { x: 100, y: 450, target: { scene: 'MainScene', roomId: 2 } },
        { x: 1500, y: 450, target: { scene: 'MainScene', roomId: 3 } }
      ]
    };

    this.portals = this.physics.add.staticGroup();
    portalConfig[roomId].forEach(portal => {
      const p = this.add.circle(portal.x, portal.y, 30, 0xFF00FF, 0.3).setDepth(4);
      this.portals.add(p);
      p.target = portal.target;
    });

    this.physics.add.overlap(this.player, this.portals, (player, portal) => {
      this.activePortal = portal.target;
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    if (this.activeBubble) {
      this.activeBubble.setPosition(this.player.x, this.player.y - 120);
    }

    if (this.nicknameText && this.nicknameBg) {
      const y = this.player.y + 78;
      this.nicknameText.setPosition(this.player.x, y);
      this.nicknameBg.setPosition(this.player.x, y);

      const newWidth = this.nicknameText.width + 20;
      const newHeight = this.nicknameText.height + 10;
      this.nicknameBg.width = newWidth;
      this.nicknameBg.height = newHeight;
    }

    if (this.activePortal && Phaser.Input.Keyboard.JustDown(this.zKey)) {
      window.userInfo.roomId = this.activePortal.roomId;
      this.scene.start(this.activePortal.scene, { userInfo: window.userInfo });
      this.activePortal = null;
    }
  }
}

export default BridgeScene;