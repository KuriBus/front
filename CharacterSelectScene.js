import { api } from './api.js';

class CharacterSelectScene extends Phaser.Scene {
    constructor() { super('CharacterSelectScene'); }
    preload() {
        this.load.image('character_bg', 'assets/nicknamebg.png');
        this.load.image('boy1', 'assets/boy1.png'); this.load.image('boy2', 'assets/boy2.png'); this.load.image('boy3', 'assets/boy3.png');
        this.load.image('girl1', 'assets/girl1.png'); this.load.image('girl2', 'assets/girl2.png'); this.load.image('girl3', 'assets/girl3.png');
    }

    create() {
        const nickname = window.userInfo?.nickname;
        if (!nickname) {
            alert('사용자 정보를 불러올 수 없습니다. 로그인 화면으로 돌아갑니다.');
            this.scene.start('LoginScene');
            return;
        }

        const characterKeyToBodytype = { 'boy1': 1, 'boy2': 2, 'boy3': 3, 'girl1': 4, 'girl2': 5, 'girl3': 6 };

        const saveCustomization = async (characterKey) => {
            const bodyType = characterKeyToBodytype[characterKey];
            try {
                const response = await api.post('/api/customization/update', { 
                    nickname: nickname, 
                    bodyType: bodyType 
                });

                if (response.ok) {
                    console.log("커스터마이징 저장 완료!");
                    window.userInfo.character = characterKey;
                    this.scene.start('WorldMapScene');
                } else {
                    const errorData = await response.json();
                    alert(`커스터마이징 저장 실패: ${errorData.message}`);
                }
            } catch (error) {
                console.error("저장 중 오류:", error);
                alert("커스터마이징 저장 중 오류가 발생했습니다.");
            }
        };

        this.add.image(800, 450, 'character_bg').setDisplaySize(1600, 900);
        this.add.rectangle(800, 100, 496, 72, 0xB593CC).setOrigin(0.5).setDepth(1);
        this.add.text(800, 100, '캐릭터를 선택해주세요', { fontFamily: 'Pretendard', fontSize: '32px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setDepth(2);
        
        const startX = 400; const gapX = 400; const startY = 450;
        const characters = [
            { key: 'boy1', x: startX, y: startY - 130 }, { key: 'boy2', x: startX + gapX, y: startY - 130 }, { key: 'boy3', x: startX + gapX * 2, y: startY - 130 },
            { key: 'girl1', x: startX, y: startY + 130 }, { key: 'girl2', x: startX + gapX, y: startY + 130 }, { key: 'girl3', x: startX + gapX * 2, y: startY + 130 },
        ];
        characters.forEach(({ key, x, y }) => {
            const sprite = this.add.image(x, y, key).setDisplaySize(150, 187.5).setInteractive({ useHandCursor: true }).setDepth(3);
            sprite.on('pointerdown', () => saveCustomization(key));
        });
    }
}
export default CharacterSelectScene;