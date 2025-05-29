class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    const { roomId, character } = window.userInfo || { roomId: 1, character: 'boy1' };

    // 캐릭터 이미지 로드
    this.load.image('boy1', 'assets/boy1.png');
    this.load.image('girl1', 'assets/girl1.png');

    // 배경 로드
    if (roomId === 1) {
      this.load.image('bg', 'assets/classroom.png');
    } else if (roomId === 2) {
      this.load.image('bg', 'assets/cultureland.png');
    } else if (roomId === 3) {
      this.load.image('bg', 'assets/park.png');
    }
  }

  create() {
    const { roomId, nickname, character } = window.userInfo || {
      roomId: 1,
      nickname: '사용자',
      character: 'boy1'
    };

    this.add.image(800, 450, 'bg').setDisplaySize(1600, 900).setDepth(0);

    const title =
      roomId === 1 ? '교실 1' :
      roomId === 2 ? '문화공간' :
      '공원';

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

    this.chatInput.addListener('click');
    this.chatInput.on('click', (event) => {
      if (event.target.id === 'send-btn') {
        const inputEl = document.getElementById('chat-message');
        const message = inputEl.value.trim();
        if (message) {
          this.addChatLog(`${nickname}: ${message}`);
          inputEl.value = '';

          const bubbleWidth = 220;
          const bubbleHeight = 90;
          const tailSize = 12;

          const bubbleRect = this.add.graphics();
          bubbleRect.fillStyle(0xffffff, 1);
          bubbleRect.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);

          const tail = this.add.graphics();
          tail.fillStyle(0xffffff, 1);
          tail.beginPath();
          tail.moveTo(bubbleWidth / 2 - tailSize, bubbleHeight);
          tail.lineTo(bubbleWidth / 2, bubbleHeight + tailSize);
          tail.lineTo(bubbleWidth / 2 + tailSize, bubbleHeight);
          tail.closePath();
          tail.fillPath();

          const msgText = this.add.text(bubbleWidth / 2, bubbleHeight / 2, message, {
            font: '14px Pretendard',
            color: '#000000',
            align: 'center',
            wordWrap: { width: bubbleWidth - 20 }
          }).setOrigin(0.5);

          const bubble = this.add.container(this.player.x - bubbleWidth / 2, this.player.y - 150, [
            bubbleRect, tail, msgText
          ]);
          bubble.setDepth(6);
          this.time.delayedCall(3000, () => bubble.destroy());
          this.activeBubble = bubble;
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

    // 플레이어
    this.player = this.physics.add.sprite(800, 450, character || 'boy1');
    this.player.setDisplaySize(100, 120);
    this.player.setCollideWorldBounds(true);
    this.player.setOrigin(0.5);

    this.nicknameBg = this.add.rectangle(this.player.x, this.player.y + 78, 100, 22, 0x000000, 0.4)
      .setOrigin(0.5).setDepth(5);
    this.nicknameText = this.add.text(this.player.x, this.player.y + 78, nickname, {
      font: '14px Pretendard',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(6);

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
      this.activeBubble.setPosition(this.player.x - 110, this.player.y - 150);
    }

    if (this.nicknameText && this.nicknameBg) {
      const y = this.player.y + 78;
      this.nicknameText.setPosition(this.player.x, y);
      this.nicknameBg.setPosition(this.player.x, y);
    }
  }
}

export default MainScene;