class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('school_bg', 'assets/classroom.png');
  }

  create() {
    const { roomId, nickname, userId } = window.userInfo || {
      roomId: 1,
      nickname: '사용자',
      userId: 0
    };

    // 배경 이미지
    this.add.image(800, 450, 'school_bg')
      .setDisplaySize(1600, 900)
      .setDepth(0);

    // 상단 교실 이름 UI (모서리 둥글기는 제거)
    this.add.rectangle(800, 50, 300, 60, 0xB593CC)
      .setDepth(5)
      .setStrokeStyle(2, 0xffffff); // setRadius 제거

    this.add.text(800, 50, '교실 1', {
      fontSize: '32px',
      fontFamily: 'Pretendard',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(6);

    // 채팅창 배경
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
        }
      }
    });

    // 채팅 로그
    this.chatLogs = [];
    this.chatLogMaxHeight = 200; // 채팅창 최대 높이 (반투명 박스 높이 기준)
    this.chatLogBottomY = 820;

    this.addChatLog = (text) => {
      const log = this.add.text(40, 0, text, {
        font: '16px Pretendard',
        fill: '#ffffff',
        wordWrap: { width: 500, useAdvancedWrap: true }
      }).setScrollFactor(0).setDepth(5);

      this.chatLogs.push(log);

      // 높이 재계산
      let totalHeight = 0;
      let y = this.chatLogBottomY;
      for (let i = this.chatLogs.length - 1; i >= 0; i--) {
        const l = this.chatLogs[i];
        y -= l.height + 4;
        totalHeight += l.height + 4;
        l.setY(y);
      }

      // 채팅 영역 초과 시 오래된 로그 제거
      while (totalHeight > this.chatLogMaxHeight && this.chatLogs.length > 0) {
        const removed = this.chatLogs.shift();
        totalHeight -= removed.height + 4;
        removed.destroy();

        // 다시 위치 정렬
        y = this.chatLogBottomY;
        for (let i = this.chatLogs.length - 1; i >= 0; i--) {
          const l = this.chatLogs[i];
          y -= l.height + 4;
          l.setY(y);
        }
      }   
    };


    // 플레이어 (초록 원)
    const canvas = this.textures.createCanvas('tempPlayer', 50, 50);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(25, 25, 25, 0, Math.PI * 2);
    ctx.fill();
    canvas.refresh();

    this.player = this.physics.add.sprite(800, 450, 'tempPlayer');
    this.player.setOrigin(0.5, 0.5);

    // 키보드 입력
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
  }
}

export default MainScene;