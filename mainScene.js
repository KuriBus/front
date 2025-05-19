class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // 배경/에셋 미사용
    // this.load.image('room1_bg', 'assets/room1_bg.png');
    // this.load.image('room2_bg', 'assets/room2_bg.png');
    // this.load.image('chat_bg', 'assets/chat_bg.png');
  }

  create() {
    const { roomId, nickname, userId } = window.userInfo;

    // 채팅 로그용 반투명 배경
    const chatBg = this.add.graphics();
    chatBg.fillStyle(0x000000, 0.5);
    chatBg.fillRoundedRect(20, 640, 300, 180, 10);
    chatBg.setScrollFactor(0);
    chatBg.setDepth(1);

    this.chatLogs = [];
    this.chatLogStartY = 660;

    // 로그 출력 함수
    const addChatLog = (text) => {
      const log = this.add.text(40, this.chatLogStartY, text, {
        font: '14px Arial',
        fill: '#ffffff'
      }).setScrollFactor(0).setDepth(2);

      this.chatLogs.push(log);
      this.chatLogStartY += 20;

      if (this.chatLogs.length > 8) {
        const old = this.chatLogs.shift();
        old.destroy();
        this.chatLogs.forEach((l, i) => l.y = 660 + i * 20);
        this.chatLogStartY = 660 + this.chatLogs.length * 20;
      }
    };

    // 초록 원 텍스처 생성
    const canvas = this.textures.createCanvas('tempPlayer', 50, 50);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(25, 25, 25, 0, Math.PI * 2);
    ctx.fill();
    canvas.refresh();

    const player = this.physics.add.sprite(800, 450, 'tempPlayer');
    player.setOrigin(0.5, 0.5);
    player.setDisplaySize(50, 50);
    player.setCollideWorldBounds(true);

    const nicknameText = this.add.text(player.x, player.y - 40, nickname, {
      font: '16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const cursors = this.input.keyboard.createCursorKeys();
    const input = document.getElementById('chat-input');
    input.style.display = 'block';

    // 채팅 입력 처리
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        const content = input.value.trim();
        input.value = '';

        try {
          await fetch('http://localhost:8080/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId, nickname, content })
          });
        } catch (err) {
          console.warn('서버 없음 (무시 가능)');
        }

        // 말풍선 표시 (내용만)
        const bubble = this.add.text(player.x, player.y - 80, content, {
          font: '16px Arial',
          fill: '#ffff00',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.time.delayedCall(3000, () => bubble.destroy());

        // 로그에 닉네임 포함 출력
        addChatLog(`${nickname}: ${content}`);
      }
    });

    // update
    this.update = () => {
      const speed = 200;
      player.setVelocity(0);

      if (cursors.left.isDown) player.setVelocityX(-speed);
      else if (cursors.right.isDown) player.setVelocityX(speed);
      if (cursors.up.isDown) player.setVelocityY(-speed);
      else if (cursors.down.isDown) player.setVelocityY(speed);

      nicknameText.setPosition(player.x, player.y - 40);
    };
  }
}