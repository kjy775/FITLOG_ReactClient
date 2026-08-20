import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/Community.css';

function Community() {
    const loginUser = useSelector((state) => state.user);

    const [activeTab, setActiveTab] = useState('all');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 글쓰기
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [inputContent, setInputContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const imageInputRef = useRef(null);

    // 댓글
    const [openReplyNum, setOpenReplyNum] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');

    // 좋아요 (게시글별 개수/내가 눌렀는지)
    const [likeMap, setLikeMap] = useState({});

    // 점 메뉴 / 팔로우
    const [openMenuNum, setOpenMenuNum] = useState(null);
    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);

    // 게시글 수정
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editPost, setEditPost] = useState(null);
    const [editContent, setEditContent] = useState('');

    // 신고
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportPostNum, setReportPostNum] = useState(null);
    const [reportContent, setReportContent] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const TABS = [
        { key: 'all', label: '전체보기' },
        { key: 'following', label: '팔로잉' },
        { key: 'mine', label: '내 게시글' },
    ];

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const formatTimeAgo = (indate) => {
        const diff = Date.now() - new Date(indate).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return '방금 전';
        if (min < 60) return `${min}분 전`;
        const hour = Math.floor(min / 60);
        if (hour < 24) return `${hour}시간 전`;
        return `${Math.floor(hour / 24)}일 전`;
    };

    // 탭별 빈 화면 문구
    const getEmptyText = () => {
        if (activeTab === 'following') {
            return followings.length === 0
                ? '아직 팔로우한 사람이 없습니다'
                : '팔로우한 사람의 게시글이 없어요';
        }
        if (activeTab === 'mine') return '아직 작성한 게시글이 없어요';
        return '아직 게시글이 없어요';
    };

    const getEmptyIcon = () => {
        if (activeTab === 'following' && followings.length === 0) return '👥';
        return '📝';
    };

    // 게시글별 좋아요 목록 조회 → 개수와 내 좋아요 여부 계산
    const fetchLikes = useCallback(
        async (postList) => {
            const map = {};

            await Promise.all(
                postList.map(async (post) => {
                    try {
                        const res = await axios.get(
                            '/api/community/getLikeList',
                            { params: { num: post.num } }
                        );
                        const likeList = res.data.likeList || [];
                        map[post.num] = {
                            count: likeList.length,
                            isLiked: likeList.some(
                                (like) => like.member?.num === loginUser.num
                            ),
                        };
                    } catch (err) {
                        map[post.num] = { count: 0, isLiked: false };
                    }
                })
            );

            setLikeMap(map);
        },
        [loginUser.num]
    );

    // 탭별 게시글 조회
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            let res;
            if (activeTab === 'all') {
                res = await axios.get('/api/community/getPostList');
            } else if (activeTab === 'following') {
                res = await axios.get('/api/community/followingPost', {
                    params: { mnum: loginUser.num },
                });
            } else {
                res = await axios.get('/api/community/userPost', {
                    params: { mnum: loginUser.num },
                });
            }

            const postList = res.data.postList || [];
            setPosts(postList);
            fetchLikes(postList);
        } catch (err) {
            console.error(err);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, loginUser.num, fetchLikes]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // 팔로워 / 팔로잉 목록
    const fetchFollowInfo = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const [followingRes, followerRes] = await Promise.all([
                axios.get('/api/member/getFollowings', {
                    params: { ffrom: loginUser.num },
                }),
                axios.get('/api/member/getFollowers', {
                    params: { fto: loginUser.num },
                }),
            ]);
            setFollowings(followingRes.data.followings || []);
            setFollowers(followerRes.data.followers || []);
        } catch (err) {
            console.error(err);
            setFollowings([]);
            setFollowers([]);
        }
    }, [loginUser.num]);

    useEffect(() => {
        fetchFollowInfo();
    }, [fetchFollowInfo]);

    const handleTabClick = (key) => {
        if (key === activeTab) return;
        setActiveTab(key);
        setOpenReplyNum(null);
        setOpenMenuNum(null);
    };

    // 글쓰기
    const handleWriteClick = () => {
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }
        setInputContent('');
        setImageFile(null);
        setImagePreview(null);
        setIsWriteOpen(true);
    };

    const handleWriteClose = () => {
        setIsWriteOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleWriteSave = async () => {
        if (isSaving) return;
        if (!imageFile) {
            alert('사진을 선택해주세요.');
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const uploadRes = await axios.post(
                '/api/community/fileupload',
                formData
            );
            const filename = uploadRes.data.filename;

            if (!filename) {
                alert('사진 업로드에 실패했습니다.');
                return;
            }

            const community = {
                member: { num: loginUser.num },
                content: inputContent,
                image: filename,
            };

            const res = await axios.post('/api/community/writePost', community);

            if (res.data.postid) {
                setIsWriteOpen(false);
                fetchPosts();
            } else {
                alert('게시글 작성에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // 좋아요
    const handleLikeClick = async (post) => {
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const res = await axios.post('/api/community/addLike', {
                member: { num: loginUser.num },
                community: { num: post.num },
            });

            if (res.data.msg === 'OK') {
                // 서버 기준으로 다시 조회해서 정확한 상태 반영
                const likeRes = await axios.get('/api/community/getLikeList', {
                    params: { num: post.num },
                });
                const likeList = likeRes.data.likeList || [];

                setLikeMap((prev) => ({
                    ...prev,
                    [post.num]: {
                        count: likeList.length,
                        isLiked: likeList.some(
                            (like) => like.member?.num === loginUser.num
                        ),
                    },
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 댓글
    const fetchReplies = async (cnum) => {
        try {
            const res = await axios.get('/api/community/getReplyList', {
                params: { num: cnum },
            });
            setReplies(res.data.replyList || []);
        } catch (err) {
            console.error(err);
            setReplies([]);
        }
    };

    const handleCommentClick = async (num) => {
        if (openReplyNum === num) {
            setOpenReplyNum(null);
            return;
        }

        setOpenReplyNum(num);
        setReplyContent('');
        fetchReplies(num);
    };

    const handleReplySubmit = async (cnum) => {
        if (!replyContent.trim()) return;

        try {
            await axios.post('/api/community/writeReply', {
                member: { num: loginUser.num },
                community: { num: cnum },
                content: replyContent,
            });

            setReplyContent('');
            fetchReplies(cnum);
        } catch (err) {
            console.error(err);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleReplyDelete = async (replyNum, cnum) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`/api/community/deleteReply/${replyNum}`);
            fetchReplies(cnum);
        } catch (err) {
            console.error(err);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    // 점 메뉴
    const handleMenuClick = (num) => {
        setOpenMenuNum(openMenuNum === num ? null : num);
    };

    // 게시글 수정
    const handleEditClick = (post) => {
        setEditPost(post);
        setEditContent(post.content || '');
        setIsEditOpen(true);
        setOpenMenuNum(null);
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            const res = await axios.post('/api/community/updatePost', {
                num: editPost.num,
                content: editContent,
            });

            if (res.data.msg === 'OK') {
                setIsEditOpen(false);
                fetchPosts();
            } else {
                alert('게시글 수정에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('게시글 수정에 실패했습니다.');
        }
    };

    // 게시글 삭제
    const handleDeleteClick = async (num) => {
        setOpenMenuNum(null);
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`/api/community/deletePost/${num}`);
            if (openReplyNum === num) setOpenReplyNum(null);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert('게시글 삭제에 실패했습니다.');
        }
    };

    // 팔로우 / 팔로우 취소
    const handleFollowClick = async (targetNum) => {
        setOpenMenuNum(null);
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await axios.post('/api/member/follow', {
                ffrom: loginUser.num,
                fto: targetNum,
            });
            fetchFollowInfo();
            if (activeTab === 'following') fetchPosts();
        } catch (err) {
            console.error(err);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    // 신고
    const handleReportClick = (postNum) => {
        setOpenMenuNum(null);
        if (!loginUser?.num) {
            alert('로그인이 필요합니다.');
            return;
        }
        setReportPostNum(postNum);
        setReportContent('');
        setIsReportOpen(true);
    };

    const handleReportSubmit = async () => {
        if (isReporting) return;
        if (!reportContent.trim()) {
            alert('신고 내용을 입력해주세요.');
            return;
        }

        setIsReporting(true);

        try {
            const res = await axios.post('/api/community/report', {
                member: { num: loginUser.num },
                community: { num: reportPostNum },
                content: reportContent,
            });

            if (res.data.msg === 'OK') {
                setIsReportOpen(false);
                alert('신고가 접수되었습니다.');
            } else {
                alert('신고에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('신고에 실패했습니다.');
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="community-container">
            {/* 팔로워 / 팔로잉 */}
            <div className="community-follow-card">
                <div className="community-follow-item">
                    <div className="community-follow-count">
                        {followers.length}
                    </div>
                    <div className="community-follow-label">팔로워</div>
                </div>
                <div className="community-follow-divider" />
                <div className="community-follow-item">
                    <div className="community-follow-count">
                        {followings.length}
                    </div>
                    <div className="community-follow-label">팔로잉</div>
                </div>
            </div>

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
            <div
                className="community-feed"
                onClick={() => setOpenMenuNum(null)}
            >
                {isLoading ? (
                    <div className="community-empty">
                        <div className="community-empty-text">불러오는 중...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="community-empty">
                        <div className="community-empty-icon">
                            {getEmptyIcon()}
                        </div>
                        <div className="community-empty-text">
                            {getEmptyText()}
                        </div>
                    </div>
                ) : (
                    posts.map((post) => {
                        const like = likeMap[post.num] || {
                            count: 0,
                            isLiked: false,
                        };
                        const isMine =
                            Number(post.member?.num) === Number(loginUser.num);
                        const isFollowing = followings.some(
                            (f) => Number(f.fto) === Number(post.member?.num)
                        );

                        return (
                            <div className="community-post" key={post.num}>
                                {/* 작성자 */}
                                <div className="community-post-header">
                                    <div className="community-post-avatar">
                                        {post.member?.profileImg ? (
                                            <img
                                                src={`/api/member/${encodeURIComponent(post.member.profileImg)}`}
                                                alt=""
                                                className="community-post-avatar-img"
                                            />
                                        ) : (
                                            <div className="community-post-avatar-placeholder" />
                                        )}
                                    </div>
                                    <div className="community-post-writer">
                                        <div className="community-post-name">
                                            {post.member?.name}
                                        </div>
                                        <div className="community-post-time">
                                            {formatTimeAgo(post.indate)}
                                        </div>
                                    </div>

                                    <div
                                        className="community-post-menu-wrap"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div
                                            className="community-post-report"
                                            onClick={() => handleMenuClick(post.num)}
                                        >
                                            ⋯
                                        </div>

                                        {openMenuNum === post.num && (
                                            <div className="community-post-menu">
                                                {isMine ? (
                                                    <>
                                                        <div
                                                            className="community-post-menu-item"
                                                            onClick={() => handleEditClick(post)}
                                                        >
                                                            게시글 수정
                                                        </div>
                                                        <div
                                                            className="community-post-menu-item danger"
                                                            onClick={() => handleDeleteClick(post.num)}
                                                        >
                                                            게시글 삭제
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div
                                                            className="community-post-menu-item"
                                                            onClick={() => handleFollowClick(post.member?.num)}
                                                        >
                                                            {isFollowing ? '팔로우 취소' : '팔로우'}
                                                        </div>
                                                        <div
                                                            className="community-post-menu-item danger"
                                                            onClick={() => handleReportClick(post.num)}
                                                        >
                                                            게시글 신고
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 사진 */}
                                <div className="community-post-image">
                                    <img
                                        src={`/api/community/${encodeURIComponent(post.image)}`}
                                        alt=""
                                    />
                                </div>

                                {/* 액션 */}
                                <div className="community-post-actions">
                                    <div
                                        className={`community-post-action ${like.isLiked ? 'liked' : ''}`}
                                        onClick={() => handleLikeClick(post)}
                                    >
                                        <span className="community-post-action-icon">
                                            {like.isLiked ? '♥' : '♡'}
                                        </span>
                                        <span>{like.count}</span>
                                    </div>
                                    <div
                                        className="community-post-action"
                                        onClick={() => handleCommentClick(post.num)}
                                    >
                                        <span className="community-post-action-icon">
                                            💬
                                        </span>
                                    </div>
                                </div>

                                {/* 내용 */}
                                {post.content && (
                                    <div className="community-post-content">
                                        {post.content}
                                    </div>
                                )}

                                {/* 댓글 */}
                                {openReplyNum === post.num && (
                                    <div className="community-reply-section">
                                        <div className="community-reply-list">
                                            {replies.length === 0 ? (
                                                <div className="community-reply-empty">
                                                    첫 댓글을 남겨보세요
                                                </div>
                                            ) : (
                                                replies.map((reply) => (
                                                    <div
                                                        className="community-reply-item"
                                                        key={reply.num}
                                                    >
                                                        <div className="community-reply-main">
                                                            <span className="community-reply-name">
                                                                {reply.member?.name}
                                                            </span>
                                                            <span className="community-reply-content">
                                                                {reply.content}
                                                            </span>
                                                        </div>
                                                        {Number(reply.member?.num) === Number(loginUser.num) && (
                                                            <span
                                                                className="community-reply-delete"
                                                                onClick={() => handleReplyDelete(reply.num, post.num)}
                                                            >
                                                                ✕
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="community-reply-input-row">
                                            <input
                                                type="text"
                                                className="community-reply-input"
                                                placeholder="댓글 달기..."
                                                value={replyContent}
                                                onChange={(e) =>
                                                    setReplyContent(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleReplySubmit(post.num);
                                                    }
                                                }}
                                            />
                                            <span
                                                className="community-reply-submit"
                                                onClick={() =>
                                                    handleReplySubmit(post.num)
                                                }
                                            >
                                                게시
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
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

                        <div
                            className="community-modal-photo"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
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
                        </div>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            ref={imageInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />

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
                                className={`community-modal-save-btn ${isSaving ? 'loading' : ''}`}
                                onClick={handleWriteSave}
                            >
                                {isSaving ? '게시 중...' : '게시'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 게시글 수정 모달 */}
            {isEditOpen && (
                <div
                    className="community-modal-overlay"
                    onClick={() => setIsEditOpen(false)}
                >
                    <div
                        className="community-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="community-modal-title">게시글 수정</div>

                        <textarea
                            className="community-modal-textarea"
                            placeholder="내용을 입력해주세요"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />

                        <div className="community-modal-actions">
                            <div
                                className="community-modal-cancel-btn"
                                onClick={() => setIsEditOpen(false)}
                            >
                                취소
                            </div>
                            <div
                                className="community-modal-save-btn"
                                onClick={handleEditSave}
                            >
                                수정
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 신고 모달 */}
            {isReportOpen && (
                <div
                    className="community-modal-overlay"
                    onClick={() => setIsReportOpen(false)}
                >
                    <div
                        className="community-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="community-modal-title">게시글 신고</div>
                        <div className="community-modal-desc">
                            신고 사유를 작성해주세요
                        </div>

                        <textarea
                            className="community-modal-textarea"
                            placeholder="예) 욕설, 스팸, 부적절한 사진 등"
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                        />

                        <div className="community-modal-actions">
                            <div
                                className="community-modal-cancel-btn"
                                onClick={() => setIsReportOpen(false)}
                            >
                                취소
                            </div>
                            <div
                                className={`community-modal-save-btn ${isReporting ? 'loading' : ''}`}
                                onClick={handleReportSubmit}
                            >
                                {isReporting ? '접수 중...' : '신고'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Community;