import React, { useState } from 'react';
import '../style/Community.css';

function Community() {
    const [activeTab, setActiveTab] = useState('all');
    const [posts, setPosts] = useState([]);
    const [isWriteOpen, setIsWriteOpen] = useState(false);

    const [inputContent, setInputContent] = useState('');
    const [inputImage, setInputImage] = useState(null);

    const TABS = [
        { key: 'all', label: '전체보기' },
        { key: 'following', label: '팔로잉' },
        { key: 'mine', label: '내 게시글' },
    ];



    const formatTimeAgo = (indate) => {
        const diff = Date.now() - new Date(indate).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return '방금 전';
        if (min < 60) return `${min}분 전`;
        const hour = Math.floor(min / 60);
        if (hour < 24) return `${hour}시간 전`;
        return `${Math.floor(hour / 24)}일 전`;
    };

    const handleTabClick = (key) => {
        setActiveTab(key);
        // TODO: 탭별로 서버에서 게시글 GET 요청
    };

    const handleWriteClick = () => {
        setInputContent('');
        setInputImage(null);
        setIsWriteOpen(true);
    };

    const handleWriteClose = () => {
        setIsWriteOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setInputImage(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleWriteSave = () => {
        if (!inputImage) return;
        // TODO: 서버 연동 - POST /post { image, content }
        setIsWriteOpen(false);
    };

    const handleLikeClick = (num) => {
        // TODO: 서버 연동 - 좋아요 토글
        setPosts((prev) =>
            prev.map((p) =>
                p.num === num
                    ? {
                        ...p,
                        isLiked: !p.isLiked,
                        likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
                    }
                    : p
            )
        );
    };

    const handleCommentClick = (num) => {
        // TODO: 댓글 화면/모달 연결
    };

    return (
        <div className="community-container">
            {/* 탭 */}
            <div className="community-tabs">
                {TABS.map((tab) => (
                    <div
                        key={tab.key}
                        className={`community-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.key)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* 피드 */}
            <div className="community-feed">
                {posts.length === 0 ? (
                    <div className="community-empty">
                        <div className="community-empty-icon">📝</div>
                        <div className="community-empty-text">
                            아직 게시글이 없어요
                        </div>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div className="community-post" key={post.num}>
                            {/* 작성자 */}
                            <div className="community-post-header">
                                <div className="community-post-avatar">
                                    {post.profileImg ? (
                                        <img
                                            src={post.profileImg}
                                            alt=""
                                            className="community-post-avatar-img"
                                        />
                                    ) : (
                                        <div className="community-post-avatar-placeholder" />
                                    )}
                                </div>
                                <div className="community-post-writer">
                                    <div className="community-post-name">
                                        {post.name}
                                    </div>
                                    <div className="community-post-time">
                                        {formatTimeAgo(post.indate)}
                                    </div>
                                </div>
                            </div>

                            {/* 사진 */}
                            <div className="community-post-image">
                                <img src={post.image} alt="" />
                            </div>

                            {/* 액션 */}
                            <div className="community-post-actions">
                                <div
                                    className={`community-post-action ${post.isLiked ? 'liked' : ''}`}
                                    onClick={() => handleLikeClick(post.num)}
                                >
                                    <span className="community-post-action-icon">
                                        {post.isLiked ? '♥' : '♡'}
                                    </span>
                                    <span>{post.likeCount}</span>
                                </div>
                                <div
                                    className="community-post-action"
                                    onClick={() => handleCommentClick(post.num)}
                                >
                                    <span className="community-post-action-icon">
                                        💬
                                    </span>
                                    <span>{post.commentCount}</span>
                                </div>
                            </div>

                            {/* 내용 */}
                            {post.content && (
                                <div className="community-post-content">
                                    {post.content}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* 글쓰기 버튼 */}
            <div className="community-write-btn" onClick={handleWriteClick}>
                ✏️
            </div>

            {/* 글쓰기 모달 */}
            {isWriteOpen && (
                <div className="community-modal-overlay" onClick={handleWriteClose}>
                    <div
                        className="community-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="community-modal-title">새 게시글</div>

                        <label className="community-modal-photo">
                            {inputImage ? (
                                <img
                                    src={inputImage}
                                    alt=""
                                    className="community-modal-preview"
                                />
                            ) : (
                                <>
                                    <div className="community-modal-photo-icon">
                                        📷
                                    </div>
                                    <div className="community-modal-photo-text">
                                        사진 선택 (필수)
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <textarea
                            className="community-modal-textarea"
                            placeholder="내용을 입력해주세요"
                            value={inputContent}
                            onChange={(e) => setInputContent(e.target.value)}
                        />

                        <div className="community-modal-actions">
                            <div
                                className="community-modal-cancel-btn"
                                onClick={handleWriteClose}
                            >
                                취소
                            </div>
                            <div
                                className="community-modal-save-btn"
                                onClick={handleWriteSave}
                            >
                                게시
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Community;