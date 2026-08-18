import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContext } from './Join';
import '../../style/Join/MyInfo.css';

function MyInfo({ user, onPrev }) {
    const { currentStep, totalSteps } = useContext(StepContext);
    const navigate = useNavigate();

    const [profileImg, setProfileImg] = useState(user?.profileImg || null);
    const fileInputRef = useRef(null);

    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [passConfirm, setPassConfirm] = useState('');
    const [phone, setPhone] = useState('');

    const [formError, setFormError] = useState('');

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setProfileImg(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleDuplicateCheck = () => {
        // TODO: 아이디 중복확인 API 연동
    };

    const handleNextClick = () => {
        if (!name) {
            setFormError('닉네임을 입력해주세요');
            return;
        }
        if (!id) {
            setFormError('아이디를 입력해주세요');
            return;
        }
        if (!pass) {
            setFormError('비밀번호를 입력해주세요');
            return;
        }
        if (!passConfirm) {
            setFormError('비밀번호 확인을 입력해주세요');
            return;
        }
        if (pass !== passConfirm) {
            setFormError('비밀번호가 일치하지 않습니다');
            return;
        }
        if (!phone) {
            setFormError('핸드폰 번호를 입력해주세요');
            return;
        }

        setFormError('');
        // TODO: 회원가입 API 연동 (아이디 중복 등은 서버 응답으로 처리)
        navigate('/login');
    };

    return (
        <div className="myinfo-container">
            <div className="myinfo-header">
                <div className="myinfo-back-btn" onClick={onPrev}>
                    &larr;
                </div>
                <div className="myinfo-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`myinfo-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="myinfo-content">
                <div className="myinfo-section-title">내 정보</div>

                <div className="myinfo-avatar-wrapper">
                    <div className="myinfo-avatar">
                        {profileImg ? (
                            <img src={profileImg} alt="profile" className="myinfo-avatar-img" />
                        ) : (
                            <div className="myinfo-avatar-placeholder" />
                        )}
                        <div className="myinfo-camera-btn" onClick={handleImageClick}>
                            📷
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="myinfo-form">
                    <div className="myinfo-field">
                        <label className="myinfo-field-label">닉네임</label>
                        <input
                            type="text"
                            className="myinfo-input"
                            placeholder="닉네임을 입력해주세요"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">아이디</label>
                        <div className="myinfo-input-group">
                            <input
                                type="text"
                                className="myinfo-input"
                                placeholder="아이디를 입력해주세요"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                            />
                            <button
                                type="button"
                                className="myinfo-check-btn"
                                onClick={handleDuplicateCheck}
                            >
                                중복확인
                            </button>
                        </div>
                    </div>

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">비밀번호</label>
                        <input
                            type="password"
                            className="myinfo-input"
                            placeholder="비밀번호를 입력해주세요"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                    </div>

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">비밀번호 확인</label>
                        <input
                            type="password"
                            className="myinfo-input"
                            placeholder="비밀번호를 다시 입력해주세요"
                            value={passConfirm}
                            onChange={(e) => setPassConfirm(e.target.value)}
                        />
                    </div>
                    {passConfirm.length > 0 && pass !== passConfirm && (
                        <div className="myinfo-check-message error">
                            비밀번호가 일치하지 않습니다
                        </div>
                    )}

                    <div className="myinfo-field">
                        <label className="myinfo-field-label">핸드폰 번호</label>
                        <input
                            type="tel"
                            className="myinfo-input"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>


                </div>

                {formError && (
                    <div className="myinfo-form-error">{formError}</div>
                )}
            </div>

            <div className="myinfo-next-btn" onClick={handleNextClick}>
                가입 완료
            </div>
        </div>
    );
}

export default MyInfo;