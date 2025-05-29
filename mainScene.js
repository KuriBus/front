class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    const { roomId, character } = window.userInfo || { roomId: 1, character: 'boy1' };
    const characterList = ['boy1', 'boy2', 'boy3', 'girl1', 'girl2', 'girl3'];
    characterList.forEach(key => this.load.image(key, `assets/${key}.png`));

    const bgMap = {
      1: 'classroom',
      2: 'cultureland',
      3: 'park'
    };
    this.load.image('bg', `assets/${bgMap[roomId] || 'classroom'}.png`);
  }

  create() {
    const { roomId, nickname, character } = window.userInfo || {
      roomId: 1,
      nickname: '사용자',
      character: 'boy1'
    };

    this.add.image(800, 450, 'bg').setDisplaySize(1600, 900).setDepth(0);

    const title = roomId === 1 ? '교실 1' : roomId === 2 ? '문화공간' : '공원';
    this.add.rectangle(800, 50, 300, 60, 0xB593CC).setDepth(5).setStrokeStyle(2, 0xffffff);
    this.add.text(800, 50, title, {
      fontSize: '32px',
      fontFamily: 'Pretendard',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(6);

    this.add.rectangle(300, 750, 580, 200, 0x000000, 0.4).setDepth(2);

    this.chatInput = this.add.dom(300, 850).createFromHTML(`
      <div style="width: 534px; height: 58px; background: #fff; border: 3px solid #B593CC; border-radius: 12px; display: flex; align-items: center; padding: 0 25px; gap: 13px;">
        <input id="chat-message" type="text" placeholder="메시지를 입력하세요" style="flex: 1; border: none; outline: none; font-size: 16px;" />
        <button id="send-btn" style="width: 68px; height: 58px; background: #B593CC; border-radius: 12px; border: none; color: #fff; font-weight: bold;">→</button>
      </div>
    `).setOrigin(0.5).setDepth(10);

    const chatInputField = this.chatInput.getChildByID('chat-message');
    chatInputField.addEventListener('focus', () => {
      this.input.keyboard.enabled = false;
    });
    chatInputField.addEventListener('blur', () => {
      this.input.keyboard.enabled = true;
    });
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
          this.addChatLog(`${nickname}: ${message}`);
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
            if (this.activeBubble) {
              this.activeBubble.destroy();
            }

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

    this.chatLogs = [];
    this.chatLogMaxHeight = 200;
    this.chatLogBottomY = 820;

    this.addChatLog = (text) => {
      const log = this.add.text(40, 0, text, {
        font: '16px Pretendard',
        fill: '#ffffff',
        wordWrap: { width: 500, useAdvancedWrap: true }
      }).setScrollFactor(0).setDepth(5);

      this.chatLogs.push(log);

      let totalHeight = 0;
      let y = this.chatLogBottomY;
      for (let i = this.chatLogs.length - 1; i >= 0; i--) {
        const l = this.chatLogs[i];
        y -= l.height + 4;
        totalHeight += l.height + 4;
        l.setY(y);
      }

      while (totalHeight > this.chatLogMaxHeight && this.chatLogs.length > 0) {
        const removed = this.chatLogs.shift();
        totalHeight -= removed.height + 4;
        removed.destroy();

        y = this.chatLogBottomY;
        for (let i = this.chatLogs.length - 1; i >= 0; i--) {
          const l = this.chatLogs[i];
          y -= l.height + 4;
          l.setY(y);
        }
      }
    };

    const spriteKey = character || 'boy1';
    this.player = this.physics.add.sprite(800, 450, spriteKey);
    this.player.setOrigin(0.5);
    this.player.setCollideWorldBounds(true);

    const standardHeight = 180;
    const texture = this.textures.get(spriteKey).getSourceImage();
    const scale = standardHeight / texture.height;
    this.player.setScale(scale);

    this.nicknameText = this.add.text(this.player.x, this.player.y + 78, nickname, {
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
  }
}

export default MainScene;