class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene');
  }

  preload() {
    this.load.image('character_bg', 'assets/nicknamebg.png');
    this.load.image('boy1', 'assets/boy1.png');
    this.load.image('girl1', 'assets/girl1.png');
  }

  create() {
    this.add.image(800, 450, 'character_bg').setDisplaySize(1600, 900);

    // 타이틀
    this.add.rectangle(800, 120, 496, 72, 0xB593CC).setOrigin(0.5).setDepth(1);
    this.add.text(800, 120, '캐릭터를 선택해주세요', {
      fontFamily: 'Pretendard',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    // 캐릭터 이미지
    const boy = this.add.image(550, 500, 'boy1')
      .setDisplaySize(240, 300)
      .setInteractive({ useHandCursor: true })
      .setDepth(3);

    const girl = this.add.image(1050, 500, 'girl1')
      .setDisplaySize(240, 300)
      .setInteractive({ useHandCursor: true })
      .setDepth(3);

    boy.on('pointerdown', () => this.selectCharacter('boy1'));
    girl.on('pointerdown', () => this.selectCharacter('girl1'));
  }

  selectCharacter(character) {
    if (!window.userInfo) window.userInfo = {};
    window.userInfo.character = character;

    this.scene.start('WorldMapScene');
    this.scene.stop();
  }
}

export default CharacterSelectScene;