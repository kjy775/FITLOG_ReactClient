import React, { useState } from 'react';
import axios from 'axios';
import '../style/Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!id.trim()) {
            alert('아이디를 입력해주세요.');
            return;
        }

        if (!pass.trim()) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        const loginData = {
            id, pass
        };

        console.log('로그인 요청:', loginData);

        try {
            const response = await axios.post('/api/member/loginLocal', loginData);
            if (response.data.msg === 'OK') {
                alert('로그인되었습니다.');
                navigate('/main')
            } else {
                alert('아이디 또는 비밀번호가 틀렸습니다.');
            }
        } catch (error) {
            console.error('로그인 실패:', error);

            if (error.response) {
                console.error('서버 에러:', error.response.data);
            }

            alert('로그인에 실패했습니다.');
        }
    };

    const handleKakaoLogin = () => {
        window.location.href = '/api/member/kakaostart';
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-title">로그인</div>

                <div className="login-field">
                    <label className="login-field-label">아이디</label>
                    <input
                        type="text"
                        className="login-input"
                        placeholder="아이디를 입력해주세요"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                <div className="login-field">
                    <label className="login-field-label">비밀번호</label>
                    <input
                        type="password"
                        className="login-input"
                        placeholder="비밀번호를 입력해주세요"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleLogin();
                            }
                        }}
                    />
                </div>

                <button
                    type="button"
                    className="login-btn"
                    onClick={handleLogin}
                >
                    로그인
                </button>

                <button
                    type="button"
                    className="kakao-login-btn"
                    onClick={handleKakaoLogin}
                >
                    <span className="kakao-icon"></span>
                    카카오 로그인
                </button>

                <div className="login-bottom-menu">
                    <span
                        className="login-find-link"
                        onClick={() => alert('아이디/비밀번호 찾기')}
                    >
                        아이디/비밀번호 찾기
                    </span>
                    <span className="login-find-divider">|</span>
                    <span
                        className="login-find-link"
                        onClick={() => {
                            window.location.href = '/join';
                        }}
                    >
                        회원가입
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Login;