class NicknameScene extends Phaser.Scene {
  constructor() {
    super('NicknameScene');
  }

  preload() {
    this.load.image('nickname_bg', 'assets/nicknamebg.png');

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css';
    document.head.appendChild(fontLink);
  }

  create() {
    this.add.image(800, 450, 'nickname_bg').setDisplaySize(1600, 900);

    // 카드
    this.add.rectangle(800, 450, 820, 279, 0xF8F2FC)
      .setOrigin(0.5)
      .setDepth(1);

    // 질문 텍스트 배경
    this.add.rectangle(800, 330, 381, 72, 0xB593CC)
      .setOrigin(0.5)
      .setDepth(2);

    // 텍스트 표시
    const question = this.add.text(800, 330, '당신의 이름은?', {
      fontFamily: 'Pretendard',
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    // 입력창
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '이름을 입력하세요';
    Object.assign(input.style, {
      position: 'absolute',
      left: '50%',
      top: '470px',
      transform: 'translateX(-50%)',
      width: '489px',
      height: '60px',
      fontSize: '20px',
      padding: '16px 24px',
      border: '4px solid #B593CC',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      outline: 'none',
      zIndex: '10',
      fontFamily: 'Pretendard'
    });
    document.body.appendChild(input);

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const nickname = input.value.trim();
        if (!nickname) {
          alert('이름을 입력하세요.');
          return;
        }

        window.userInfo = {
          nickname,
          userId: crypto.randomUUID(),
          roomId: null,
          character: null 
        };

        input.remove();
        this.scene.start('CharacterSelectScene');
      }
    });
  }

  shutdown() {
    const input = document.querySelector('input');
    if (input) input.remove();
  }
}

export default NicknameScene;