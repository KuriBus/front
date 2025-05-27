class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    const { roomId } = window.userInfo || { roomId: 1 };
    this.load.image('boy1', 'assets/boy1.png');

    // roomId에 따라 배경 다르게 불러오기
    if (roomId === 1) {
      this.load.image('bg', 'assets/classroom.png');
    } else if (roomId === 2) {
      this.load.image('bg', 'assets/cultureland.png');
    }
  }

  create() {
    const { roomId, nickname, userId } = window.userInfo || {
      roomId: 1,
      nickname: '사용자',
      userId: 0
    };

    // 배경
    this.add.image(800, 450, 'bg').setDisplaySize(1600, 900).setDepth(0);

    // 타이틀
    const titleText = roomId === 1 ? '교실 1' : '문화공간';
    this.add.rectangle(800, 50, 300, 60, 0xB593CC).setDepth(5).setStrokeStyle(2, 0xffffff);
    this.add.text(800, 50, titleText, {
      fontSize: '32px',
      fontFamily: 'Pretendard',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(6);

    // 채팅 박스
    this.add.rectangle(300, 750, 580, 200, 0x000000, 0.4).setDepth(2);

    // 채팅 입력창 DOM
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

          // 말풍선 생성
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
    this.player = this.physics.add.sprite(800, 450, 'boy1');
    this.player.setDisplaySize(100, 120);
    this.player.setCollideWorldBounds(true);
    this.player.setOrigin(0.5);

    // 닉네임
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

    // 말풍선 위치
    if (this.activeBubble) {
      this.activeBubble.setPosition(this.player.x - 110, this.player.y - 150);
    }

    // 닉네임 위치
    if (this.nicknameText && this.nicknameBg) {
      const y = this.player.y + 78;
      this.nicknameText.setPosition(this.player.x, y);
      this.nicknameBg.setPosition(this.player.x, y);
    }
  }
}

export default MainScene;