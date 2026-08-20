import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/qna/qna.css';

function Qna() {
    // 현재 선택된 탭 관리 ('all' | 'follow' | 'my')
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    // 글작성 페이지 이동 핸들러
    const handleWriteClick = () => {
        navigate('/write'); // 글작성 페이지 경로로 수정 가능
    };

    return (
        <div className='Qna'>
            {/* 탭 메뉴 영역 */}
            <div className='Qna-tabs'>
                <div 
                    className={`Qna-all ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    전체
                </div>

                <div 
                    className={`Qna-follow ${activeTab === 'follow' ? 'active' : ''}`}
                    onClick={() => setActiveTab('follow')}
                >
                    팔로잉
                </div>

                <div 
                    className={`Qna-my ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my')}
                >
                    내 글
                </div>
            </div>

            {/* 탭 전환에 따라 게시글이 노출되는 영역 */}
            <div className='Qna-view'>
                {activeTab === 'all' && (
                    <div className='tab-content'>
                        <h3>🌐 전체 게시물</h3>
                        <p>모든 유저의 게시물이 노출되는 공간입니다.</p>
                    </div>
                )}

                {activeTab === 'follow' && (
                    <div className='tab-content'>
                        <h3>👥 팔로우 게시물</h3>
                        <p>내가 팔로우한 유저들의 게시물만 노출됩니다.</p>
                    </div>
                )}

                {activeTab === 'my' && (
                    <div className='tab-content'>
                        <h3>✏️ 내 게시물</h3>
                        <p>내가 작성한 게시물 목록입니다.</p>
                    </div>
                )}

                <button 
                type='button' 
                className='write-btn' 
                onClick={handleWriteClick}
                aria-label='게시물 작성'
            >
                +
            </button>
            </div>
        </div>
    );
}

export default Qna;