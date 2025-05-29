class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  preload() {
    this.load.image('world_bg', 'assets/worldbg.png'); // 배경 이미지 로드
  }

  create() {
    // 배경
    this.add.image(800, 450, 'world_bg').setDisplaySize(1600, 900);

    // 버튼 생성 함수
    const createRoomButton = (text, x, y, roomId) => {
      const btn = this.add.rectangle(x, y, 287, 72, 0xF8F2FC)
        .setStrokeStyle(2, 0xB593CC)
        .setInteractive()
        .setDepth(2);

      this.add.text(x, y, text, {
        font: '28px Pretendard',
        color: '#B593CC'
      }).setOrigin(0.5).setDepth(3);

      btn.on('pointerdown', () => {
        window.userInfo.roomId = roomId;
        this.scene.start('MainScene');
      });
    };

    // 방 버튼들
    createRoomButton('교실', 1250, 410, 1);
    createRoomButton('문화공간', 550, 280, 2);
    createRoomButton('공원', 500, 700, 3); // 공원 추가
  }
}

export default WorldMapScene;