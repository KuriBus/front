class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene');
  }

  preload() {
    this.load.image('character_bg', 'assets/nicknamebg.png');
    this.load.image('boy1', 'assets/boy1.png');
    this.load.image('boy2', 'assets/boy2.png');
    this.load.image('boy3', 'assets/boy3.png');
    this.load.image('girl1', 'assets/girl1.png');
    this.load.image('girl2', 'assets/girl2.png');
    this.load.image('girl3', 'assets/girl3.png');
  }

  create() {
    this.add.image(800, 450, 'character_bg').setDisplaySize(1600, 900);

    // 타이틀
    this.add.rectangle(800, 100, 496, 72, 0xB593CC).setOrigin(0.5).setDepth(1);
    this.add.text(800, 100, '캐릭터를 선택해주세요', {
      fontFamily: 'Pretendard',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    // 더 넓은 간격을 위한 설정
    const startX = 300;
    const gapX = 500;

    const characters = [
      { key: 'boy1', x: startX + 0 * gapX, y: 320 },
      { key: 'boy2', x: startX + 1 * gapX, y: 320 },
      { key: 'boy3', x: startX + 2 * gapX, y: 320 },
      { key: 'girl1', x: startX + 0 * gapX, y: 580 },
      { key: 'girl2', x: startX + 1 * gapX, y: 580 },
      { key: 'girl3', x: startX + 2 * gapX, y: 580 },
    ];

    characters.forEach(({ key, x, y }) => {
      const sprite = this.add.image(x, y, key)
        .setDisplaySize(200, 250)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      sprite.on('pointerdown', () => this.selectCharacter(key));
    });
  }

  selectCharacter(character) {
    if (!window.userInfo) window.userInfo = {};
    window.userInfo.character = character;

    this.scene.start('WorldMapScene');
    this.scene.stop();
  }
}

export default CharacterSelectScene;