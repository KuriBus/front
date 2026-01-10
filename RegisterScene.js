import { api } from './api.js';

class RegisterScene extends Phaser.Scene {
    constructor() {
        super('RegisterScene');
    }

    preload() {
        this.load.image('nickname_bg', 'assets/nicknamebg.png');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'nickname_bg').setDisplaySize(gameWidth, gameHeight);
        this.add.rectangle(gameWidth / 2, gameHeight / 2, 820, 480, 0xF8F2FC).setOrigin(0.5).setDepth(1);
        this.add.text(gameWidth / 2, gameHeight / 2 - 200, '회원가입', {
            fontFamily: 'Pretendard', fontSize: '32px', color: '#B593CC', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);
        
        const inputStyle = `width: 400px; height: 50px; font-size: 18px; padding: 10px; border: 3px solid #B593CC; border-radius: 12px; background-color: #ffffff; outline: none; font-family: Pretendard;`;
        const buttonStyle = `width: 426px; height: 60px; font-size: 20px; font-family: Pretendard; border-radius: 12px; border: none; color: white; cursor: pointer; font-weight: bold;`;

        const formHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <input type="text" id="usernameInput" placeholder="아이디" style="${inputStyle}">
                <input type="text" id="nicknameInput" placeholder="닉네임" style="${inputStyle}">
                <input type="password" id="passwordInput" placeholder="비밀번호" style="${inputStyle}">
                <button id="registerButton" style="${buttonStyle} background-color: #B593CC;">가입하기</button>
                <button id="backButton" style="${buttonStyle} background-color: #A0A0A0; margin-top: 10px;">뒤로가기</button>
            </div>
        `;
        
        const formElement = this.add.dom(gameWidth / 2, gameHeight / 2 + 20).createFromHTML(formHTML);

        const usernameInput = formElement.getChildByID('usernameInput');
        const nicknameInput = formElement.getChildByID('nicknameInput');
        const passwordInput = formElement.getChildByID('passwordInput');
        const registerButton = formElement.getChildByID('registerButton');
        const backButton = formElement.getChildByID('backButton');

        const handleRegister = async () => {
            const username = usernameInput.value.trim();
            const nickname = nicknameInput.value.trim();
            const password = passwordInput.value.trim();
            if (!username || !nickname || !password) return alert('모든 필드를 입력해주세요.');

            try {
                const response = await api.post('/api/users/signup', { username, nickname, password });
                if (response.ok) {
                    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
                    this.scene.start('LoginScene');
                } else {
                    const errorData = await response.json();
                    alert(`회원가입 실패: ${errorData.message}`);
                }
            } catch (error) {
                console.error("회원가입 오류:", error);
                alert("회원가입 중 오류가 발생했습니다.");
            }
        };

        registerButton.addEventListener('click', handleRegister);
        passwordInput.addEventListener('keydown', e => e.key === 'Enter' && handleRegister());
        backButton.addEventListener('click', () => this.scene.start('LoginScene'));
    }
}

export default RegisterScene;