import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { loginAction, logoutAction } from '../store/userSlice';
import '../style/MyPage.css';

function MyPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const loginUser = useSelector((state) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    // 수정용 입력 상태
    const [name, setName] = useState(loginUser.name || '');
    const [phone, setPhone] = useState(loginUser.phone || '');
    const [height, setHeight] = useState(loginUser.height || '');
    const [weight, setWeight] = useState(loginUser.weight || '');
    const [zipNum, setZipNum] = useState(loginUser.zipNum || '');
    const [add1, setAdd1] = useState(loginUser.add1 || '');
    const [add2, setAdd2] = useState(loginUser.add2 || '');
    const [add3, setAdd3] = useState(loginUser.add3 || '');

    const [profileImg, setProfileImg] = useState(loginUser.profileImg || null);
    const [preview, setPreview] = useState(
        loginUser.profileImg
            ? `http://localhost:8070/image/${encodeURIComponent(loginUser.profileImg)}`
            : null
    );

    const handleImageClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(
                '/api/member/fileupload',
                formData
            );
            setProfileImg(res.data.filename);
        } catch (err) {
            console.error(err);
            alert('이미지 업로드에 실패했습니다.');
        }
    };

    // 다음 우편번호 검색
    const handleAddressSearch = () => {
        if (!window.daum) {
            alert('우편번호 서비스를 불러오지 못했습니다.');
            return;
        }
        new window.daum.Postcode({
            oncomplete: (data) => {
                setZipNum(data.zonecode);
                setAdd1(data.roadAddress);
                setAdd3(data.buildingName || '');
            },
        }).open();
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        // 원래 값으로 되돌리기
        setName(loginUser.name || '');
        setPhone(loginUser.phone || '');
        setHeight(loginUser.height || '');
        setWeight(loginUser.weight || '');
        setZipNum(loginUser.zipNum || '');
        setAdd1(loginUser.add1 || '');
        setAdd2(loginUser.add2 || '');
        setAdd3(loginUser.add3 || '');
        setProfileImg(loginUser.profileImg || null);
        setPreview(
            loginUser.profileImg
                ? `http://localhost:8070/image/${encodeURIComponent(loginUser.profileImg)}`
                : null
        );
        setIsEditing(false);
    };

    const handleSaveClick = async () => {
        if (!name) return alert('닉네임을 입력해주세요.');
        if (!phone) return alert('핸드폰 번호를 입력해주세요.');

        const member = {
            num: loginUser.num,
            id: loginUser.id,
            pass: loginUser.pass,
            name,
            phone,
            height,
            weight,
            zipNum,
            add1,
            add2,
            add3,
            profileImg,
            birth: loginUser.birth,
            gender: loginUser.gender,
            provider: loginUser.provider,
        };

        try {
            const res = await axios.post(
                '/api/member/updateMember',
                member
            );
            if (res.data.msg === 'OK') {
                cookies.set('user', JSON.stringify(member), { path: '/' });
                dispatch(loginAction(member));
                setPreview(
                    profileImg
                        ? `http://localhost:8070/image/${encodeURIComponent(profileImg)}`
                        : null
                );
                setIsEditing(false);
                alert('수정되었습니다');
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 연결에 실패했습니다.');
        }
    };

    const handleLogout = () => {
        if (!window.confirm('로그아웃 하시겠습니까?')) return;
        cookies.remove('user', { path: '/' });
        dispatch(logoutAction());
        navigate('/');
    };

    const handleWithdraw = async () => {
        if (!window.confirm('정말 탈퇴하시겠습니까? 되돌릴 수 없습니다.')) return;

        try {
            const res = await axios.delete(
                '/api/member/deleteMember',
                { params: { id: loginUser.id } }
            );
            if (res.data.msg === 'OK') {
                cookies.remove('user', { path: '/' });
                dispatch(logoutAction());
                alert('탈퇴 처리되었습니다.');
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            alert('탈퇴 처리에 실패했습니다.');
        }
    };

    return (
        <div className="mypage-container">
            {/* 프로필 */}
            <div className="mypage-profile-card">
                <div
                    className={`mypage-avatar ${isEditing ? 'editable' : ''}`}
                    onClick={handleImageClick}
                >
                    {preview ? (
                        <img src={preview} alt="profile" className="mypage-avatar-img" />
                    ) : (
                        <div className="mypage-avatar-placeholder" />
                    )}
                    {isEditing && <div className="mypage-camera-btn">📷</div>}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {isEditing ? (
                    <input
                        type="text"
                        className="mypage-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="닉네임"
                    />
                ) : (
                    <div className="mypage-name">{loginUser.name}</div>
                )}
                <div className="mypage-id">@{loginUser.id}</div>
            </div>

            {/* 신체 정보 요약 */}
            <div className="mypage-stats-card">
                <div className="mypage-stat-item">
                    <div className="mypage-stat-label">키</div>
                    {isEditing ? (
                        <input
                            type="number"
                            className="mypage-stat-input"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    ) : (
                        <div className="mypage-stat-value">
                            {loginUser.height || '-'}
                            <span className="mypage-stat-unit">cm</span>
                        </div>
                    )}
                </div>
                <div className="mypage-stat-divider" />
                <div className="mypage-stat-item">
                    <div className="mypage-stat-label">체중</div>
                    {isEditing ? (
                        <input
                            type="number"
                            className="mypage-stat-input"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    ) : (
                        <div className="mypage-stat-value">
                            {loginUser.weight || '-'}
                            <span className="mypage-stat-unit">kg</span>
                        </div>
                    )}
                </div>
                <div className="mypage-stat-divider" />
                <div className="mypage-stat-item">
                    <div className="mypage-stat-label">생년월일</div>
                    <div className="mypage-stat-value small">
                        {loginUser.birth || '-'}
                    </div>
                </div>
            </div>

            {/* 상세 정보 */}
            <div className="mypage-section">
                <div className="mypage-section-title">내 정보</div>

                <div className="mypage-field">
                    <label className="mypage-label">핸드폰 번호</label>
                    {isEditing ? (
                        <input
                            type="tel"
                            className="mypage-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="010-0000-0000"
                        />
                    ) : (
                        <div className="mypage-value">{loginUser.phone || '-'}</div>
                    )}
                </div>

                <div className="mypage-field">
                    <label className="mypage-label">주소</label>
                    {isEditing ? (
                        <div className="mypage-address-group">
                            <div className="mypage-zip-row">
                                <input
                                    type="text"
                                    className="mypage-input mypage-zip-input"
                                    value={zipNum}
                                    placeholder="우편번호"
                                    readOnly
                                />
                                <button
                                    type="button"
                                    className="mypage-zip-btn"
                                    onClick={handleAddressSearch}
                                >
                                    주소 검색
                                </button>
                            </div>
                            <input
                                type="text"
                                className="mypage-input"
                                value={add1}
                                placeholder="도로명 주소"
                                readOnly
                            />
                            <input
                                type="text"
                                className="mypage-input"
                                value={add2}
                                onChange={(e) => setAdd2(e.target.value)}
                                placeholder="상세 주소"
                            />
                            <input
                                type="text"
                                className="mypage-input"
                                value={add3}
                                onChange={(e) => setAdd3(e.target.value)}
                                placeholder="건물 이름"
                            />
                        </div>
                    ) : (
                        <div className="mypage-value">
                            {loginUser.add1
                                ? `[${loginUser.zipNum}] ${loginUser.add1} ${loginUser.add2 || ''}`
                                : '등록된 주소가 없습니다'}
                        </div>
                    )}
                </div>
            </div>

            {/* 버튼 */}
            {isEditing ? (
                <div className="mypage-btn-row">
                    <div className="mypage-cancel-btn" onClick={handleCancelClick}>
                        취소
                    </div>
                    <div className="mypage-save-btn" onClick={handleSaveClick}>
                        저장
                    </div>
                </div>
            ) : (
                <div className="mypage-edit-btn" onClick={handleEditClick}>
                    정보 수정
                </div>
            )}

            {/* 계정 관리 */}
            <div className="mypage-account-menu">
                <div className="mypage-account-item" onClick={handleLogout}>
                    로그아웃
                </div>
                <div
                    className="mypage-account-item withdraw"
                    onClick={handleWithdraw}
                >
                    회원 탈퇴
                </div>
            </div>
        </div>
    );
}

export default MyPage;