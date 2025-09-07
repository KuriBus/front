import { api, setToken, getToken } from './api.js';

class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.formElement = null;
    }

    preload() {
        this.load.image('nickname_bg', 'assets/nicknamebg.png');
    }

    create() {
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'nickname_bg').setDisplaySize(gameWidth, gameHeight);
        this.add.rectangle(gameWidth / 2, gameHeight / 2, 820, 380, 0xf8fcfc).setOrigin(0.5).setDepth(1);
        this.add.text(gameWidth / 2, gameHeight / 2 - 140, '로그인', {
            fontFamily: 'Pretendard',
            fontSize: '32px',
            color: '#B593CC',
            fontWeight: 'bold',
        }).setOrigin(0.5).setDepth(2);

        const inputStyle = `width: 400px; height: 50px; font-size: 18px; padding: 10px; border: 3px solid #b593cc; border-radius: 12px; background-color: #fff; outline: none; font-family: Pretendard;`;
        const buttonStyle = `width: 426px; height: 60px; font-size: 20px; font-family: Pretendard; border-radius: 12px; border: none; color: white; cursor: pointer; font-weight: bold;`;
        const formHTML = `<div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <input id="usernameInput" type="text" placeholder="아이디" style="${inputStyle}">
            <input id="passwordInput" type="password" placeholder="비밀번호" style="${inputStyle}">
            <button id="loginButton" style="${buttonStyle} background-color: #b593cc;">로그인</button>
            <button id="registerButton" style="${buttonStyle} background-color: #a0a0a0; margin-top: 10px;">회원가입</button>
        </div>`;

        this.formElement = this.add.dom(gameWidth / 2, gameHeight / 2).createFromHTML(formHTML);

        const usernameInput = this.formElement.getChildByID('usernameInput');
        const passwordInput = this.formElement.getChildByID('passwordInput');
        const loginButton = this.formElement.getChildByID('loginButton');
        const registerButton = this.formElement.getChildByID('registerButton');

        const SERVER_URL = 'https://kuriverse.shop';

        const fetchNickname = async (username) => {
            try {
                console.log('[닉네임조회] username:', username);
                const res = await fetch(`${SERVER_URL}/api/users/nickname?username=${encodeURIComponent(username)}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('[닉네임조회] response.ok:', res.ok, 'status:', res.status);
                const textData = await res.text();
                console.log('[닉네임조회] raw 응답:', textData);
                let data = {};
                try {
                    data = JSON.parse(textData);
                } catch {}
                if (res.ok) {
                    if (data.data && typeof data.data === 'object' && data.data.nickname) {
                        console.log('[닉네임조회] 구조형 닉네임:', data.data.nickname);
                        return data.data.nickname;
                    }
                    if (typeof data.data === 'string') {
                        console.log('[닉네임조회] 문자형 닉네임:', data.data);
                        return data.data;
                    }
                }
                return null;
            } catch (e) {
                console.warn('닉네임 조회 실패:', e);
                return null;
            }
        };

        const handleLogin = async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            if (!username || !password) {
                alert('아이디와 비밀번호를 모두 입력해주세요.');
                return;
            }
            try {
                console.log('[로그인] username:', username, 'password:', password);
                const loginResponse = await api.post('/api/users/login', { username, password });
                const loginData = await loginResponse.json();
                console.log('[로그인] 서버 응답:', loginData);

                if (loginResponse.ok && loginData.data?.accessToken) {
                    setToken(loginData.data.accessToken);
                    console.log('%c[성공] Access Token 저장 완료!', 'color: green; font-weight: bold');
                    const nickname = await fetchNickname(username);
                    console.log('[로그인] 받은 닉네임:', nickname);
                    if (!nickname) {
                        alert('닉네임을 받아오지 못했습니다. 관리자에게 문의하세요.');
                        return;
                    }
                    window.userInfo = { ...loginData.data, nickname };
                    console.log('[userInfo 저장]', window.userInfo);
                    this.scene.start(window.userInfo.character ? 'WorldMapScene' : 'CharacterSelectScene');
                } else {
                    alert(`로그인 실패: ${loginData.message || '서버 응답 오류'}`);
                }
            } catch (error) {
                console.error('로그인 처리 중 오류:', error);
                alert('로그인 처리 중 오류가 발생했습니다.');
            }
        };

        loginButton.addEventListener('click', handleLogin);
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
        registerButton.addEventListener('click', () => {
            this.scene.start('RegisterScene');
        });
    }

    shutdown() {
        if (this.formElement) {
            this.formElement.destroy();
            this.formElement = null;
        }
    }
}

export default LoginScene;