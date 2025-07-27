import { api, setToken } from './api.js';

class LoginScene extends Phaser.Scene {
    constructor() { super('LoginScene'); this.formElement = null; }
    preload() { this.load.image('nickname_bg', 'assets/nicknamebg.png'); }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'nickname_bg').setDisplaySize(gameWidth, gameHeight);
        this.add.rectangle(gameWidth / 2, gameHeight / 2, 820, 380, 0xF8F2FC).setOrigin(0.5).setDepth(1);
        this.add.text(gameWidth / 2, gameHeight / 2 - 140, '로그인', { fontFamily: 'Pretendard', fontSize: '32px', color: '#B593CC', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);

        const inputStyle = `width: 400px; height: 50px; font-size: 18px; padding: 10px; border: 3px solid #B593CC; border-radius: 12px; background-color: #ffffff; outline: none; font-family: Pretendard;`;
        const buttonStyle = `width: 426px; height: 60px; font-size: 20px; font-family: Pretendard; border-radius: 12px; border: none; color: white; cursor: pointer; font-weight: bold;`;
        const formHTML = `<div style="display: flex; flex-direction: column; align-items: center; gap: 15px;"><input type="text" id="usernameInput" placeholder="아이디" style="${inputStyle}"><input type="password" id="passwordInput" placeholder="비밀번호" style="${inputStyle}"><button id="loginButton" style="${buttonStyle} background-color: #B593CC;">로그인</button><button id="registerButton" style="${buttonStyle} background-color: #A0A0A0; margin-top: 10px;">회원가입</button></div>`;
        this.formElement = this.add.dom(gameWidth / 2, gameHeight / 2).createFromHTML(formHTML);

        const usernameInput = this.formElement.getChildByID('usernameInput');
        const passwordInput = this.formElement.getChildByID('passwordInput');
        const loginButton = this.formElement.getChildByID('loginButton');
        const registerButton = this.formElement.getChildByID('registerButton');

        const handleLogin = async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            if (!username || !password) return alert('아이디와 비밀번호를 모두 입력해주세요.');

            try {
                const loginResponse = await api.post('/api/users/login', { username, password });
                const loginData = await loginResponse.json();

                if (loginResponse.ok && loginData.data?.accessToken) {
                    setToken(loginData.data.accessToken);
                    console.log('%c[성공] Access Token 저장 완료!', 'color: green; font-weight: bold;');
                    
                    window.userInfo = loginData.data;
                    this.scene.start(window.userInfo.character ? 'WorldMapScene' : 'CharacterSelectScene');
                } else {
                    alert(`로그인 실패: ${loginData.message || '서버로부터 올바른 데이터를 받지 못했습니다.'}`);
                }
            } catch (error) {
                console.error("로그인 처리 중 오류:", error);
                alert("로그인 처리 중 오류가 발생했습니다.");
            }
        };

        loginButton.addEventListener('click', handleLogin);
        passwordInput.addEventListener('keydown', e => e.key === 'Enter' && handleLogin());
        registerButton.addEventListener('click', () => this.scene.start('RegisterScene'));
    }

    shutdown() { if (this.formElement) { this.formElement.destroy(); this.formElement = null; } }
}
export default LoginScene;