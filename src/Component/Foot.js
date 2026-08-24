import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Foot.css';

function Foot() {
    const navigate = useNavigate();
    const loginUser = useSelector((state) => state.user);

    const handleStatsClick = () => {
        navigate('/stats');
    };

    const handleContactClick = () => {
        navigate('/qna');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleCommunityClick = () => {
        navigate('/community');
    };

    const handleProfileClick = () => {
        if (!loginUser || !loginUser.id) navigate('/login');
        else if (loginUser.role_names?.includes('admin')) navigate('/admin');
        else navigate('/mypage');
    };

    return (
        <div className="footer-container">
            <div className="footer-menu-item" onClick={handleStatsClick}>
                통계
            </div>

            <div className="footer-menu-item" onClick={handleContactClick}>
                문의하기
            </div>

            <div className="footer-logo" onClick={handleLogoClick}>
                <img
                    src="/img/fitlog-logo.png"
                    alt="FITLOG"
                    className="footer-logo-img"
                />
            </div>

            <div className="footer-menu-item" onClick={handleCommunityClick}>
                커뮤니티
            </div>

            <div className="footer-profile-btn" onClick={handleProfileClick}>
                👤
            </div>
        </div>
    );
}

export default Foot;