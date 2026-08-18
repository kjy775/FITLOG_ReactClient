import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Foot.css';

function Foot({ isLoggedIn }) {
    const navigate = useNavigate();

    const handleStatsClick = () => {
        navigate('/stats');
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleCommunityClick = () => {
        navigate('/community');
    };

    const handleProfileClick = () => {
        if (isLoggedIn) {
            navigate('/mypage');
        } else {
            navigate('/login');
        }
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
                로고
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