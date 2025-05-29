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
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    this.add.image(gameWidth / 2, gameHeight / 2, 'nickname_bg').setDisplaySize(gameWidth, gameHeight);

    // 카드
    this.add.rectangle(gameWidth / 2, gameHeight / 2, 820, 279, 0xF8F2FC)
      .setOrigin(0.5)
      .setDepth(1);

    // 질문 텍스트 배경
    this.add.rectangle(gameWidth / 2, gameHeight / 2 - 120, 381, 72, 0xB593CC)
      .setOrigin(0.5)
      .setDepth(2);

    // 텍스트 표시
    this.add.text(gameWidth / 2, gameHeight / 2 - 120, '당신의 이름은?', {
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

    // 반응형 중앙 정렬
    Object.assign(input.style, {
      position: 'fixed',
      left: '50%',
      top: 'calc(50% + 20px)', // 카드 중앙보다 조금 아래
      transform: 'translate(-50%, -50%)',
      width: '489px',
      height: '60px',
      fontSize: '20px',
      padding: '16px 24px',
      border: '4px solid #B593CC',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      outline: 'none',
      zIndex: '10',
      fontFamily: 'Pretendard',
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