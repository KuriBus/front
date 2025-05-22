class LoginScene extends Phaser.Scene {
  constructor() {
    super('LoginScene');
  }

  preload() {
    // this.load.image('login_bg', 'assets/login_bg.png');
  }

  create() {
    // this.add.image(800, 450, 'login_bg');

    // DOM 입력 필드 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '닉네임 입력';
    input.style.position = 'absolute';
    input.style.top = '300px';
    input.style.left = '700px';
    input.style.fontSize = '24px';
    input.style.zIndex = 10;
    document.body.appendChild(input);

    const rooms = [1, 2];
    rooms.forEach((roomId, i) => {
      const btn = this.add.text(700, 400 + i * 50, `Room ${roomId}`, {
        font: '24px Arial',
        backgroundColor: '#444',
        color: '#fff',
        padding: { x: 10, y: 5 }
      }).setInteractive();

      btn.on('pointerdown', () => {
        const nickname = input.value.trim();
        if (!nickname) {
          alert('닉네임을 입력하세요!');
          return;
        }

        // 전역 유저 정보 저장
        window.userInfo = {
          userId: crypto.randomUUID(),
          nickname,
          roomId
        };

        // DOM input 제거
        input.remove();

        // 씬 전환 및 정리
        this.scene.start('MainScene');
        this.scene.stop('LoginScene'); // 이전 씬 완전 종료
      });
    });
  }

  // 씬 종료 시 DOM 정리 보장
  shutdown() {
    const existingInput = document.querySelector('input');
    if (existingInput) {
      existingInput.remove();
    }
  }
}

export default LoginScene;