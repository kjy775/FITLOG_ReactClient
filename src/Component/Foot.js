import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Foot.css';

function Foot({ setActivate }) {
    const navigate = useNavigate();
    const loginUser = useSelector((state) => state.user);
    const BREAKPOINT = 900;
    const handleStatsClick = () => {
        console.log('현재 width:', window.innerWidth);
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/stats');
    };

    const handleContactClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/qna');
    };

    const handleLogoClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/');
    };

    const handleCommunityClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
        navigate('/community');
    };

    const handleProfileClick = () => {
        if (window.innerWidth <= BREAKPOINT) {
            setActivate(false);
        }
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


            {!loginUser.num ?
                <div className="footer-profile-btn"
                    onClick={handleProfileClick}>👤
                </div> : <div className="footer-profile-btn"
                    onClick={handleProfileClick}><img alt="" class="community-post-avatar-img" src={`http://localhost:8070/member/${loginUser.profileImg}`} /></div>}

        </div>
    );
}

export default Foot;