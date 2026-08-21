import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../../style/qna/qna.css';

function Qna() {

    const loginUser = useSelector((state) => state.user);

    const [topTab, setTopTab] = useState('faq');
    const [askForm, setAskForm] = useState({ title: '', content: '' });
    const [historyList, setHistoryList] = useState([]);
    
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [adminInput, setAdminInput] = useState('');
    const [editingAnswerId, setEditingAnswerId] = useState(null);

    const [faqList, setFaqList] = useState([]);
    const [expandedFaqId, setExpandedFaqId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    // 인증 헤더 생성 유틸리티
    const getAuthConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
    }, []);

    // 탭 변경 핸들러
    const handleTabChange = (tab) => {
        const token = localStorage.getItem('token');
        if ((tab === 'ask' || tab === 'history') && !token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }
        setTopTab(tab);
    };

    // [FAQ 목록 조회 API]
    const fetchFaqList = useCallback(async (page) => {
        try {
            const response = await axios.get('/api/qna/faqs', {
                params: { page: page - 1, size: itemsPerPage }
            });
            
            if (response.data && response.data.content !== undefined) {
                setFaqList(response.data.content);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setFaqList(Array.isArray(response.data) ? response.data : []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('FAQ 로딩 실패:', error);
            alert('FAQ 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }, [itemsPerPage]);

    // [문의내역 목록 조회 API]
    const fetchHistoryList = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('/api/qna/history', config);
            setHistoryList(Array.isArray(response.data) ? response.data : response.data.content || []);
        } catch (error) {
            console.error('문의내역 로딩 실패:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert('인증 세션이 만료되었습니다. 다시 로그인해 주세요.');
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [getAuthConfig, navigate]);

    // Tab 및 Page 변경 시 API 호출 Effect
    useEffect(() => {
        if (topTab === 'faq') {
            fetchFaqList(currentPage);
        } else if (topTab === 'history') {
            fetchHistoryList();
        }
    }, [topTab, currentPage, fetchFaqList, fetchHistoryList]);

    const toggleFaq = (id) => setExpandedFaqId((prev) => (prev === id ? null : id));
    
    const toggleHistory = (id) => {
        setExpandedHistoryId((prev) => (prev === id ? null : id));
        setEditingAnswerId(null);
        setAdminInput('');
    };

    const handleAskChange = (e) => {
        const { name, value } = e.target;
        setAskForm((prev) => ({ ...prev, [name]: value }));
    };

    // [1:1 문의 접수 제출 API]
    const handleAskSubmit = async (e) => {
        e.preventDefault();

        const config = getAuthConfig();
        if (!loginUser) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (!askForm.title.trim() || !askForm.content.trim()) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }

        try {
            await axios.post(
                '/api/qna/ask',
                { title: askForm.title, question: askForm.content },
                config
            );

            alert('문의가 접수되었습니다.');
            setAskForm({ title: '', content: '' });
            setTopTab('history');
        } catch (error) {
            console.error('문의 등록 실패:', error);
            alert('문의 등록 처리 중 오류가 발생했습니다.');
        }
    };

    // [관리자 답변 등록 및 수정 API]
    const handleAdminAnswerSubmit = async (id) => {
        if (!adminInput.trim()) {
            alert('답변 내용을 입력해 주세요.');
            return;
        }

        const config = getAuthConfig();
        if (!config) return;

        try {
            await axios.post(
                `/api/qna/history/${id}/answer`,
                { answer: adminInput },
                config
            );

            alert('답변이 등록되었습니다.');
            setAdminInput('');
            setEditingAnswerId(null);
            fetchHistoryList();
        } catch (error) {
            console.error('답변 저장 실패:', error);
            alert('답변 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className='Qna'>
            {/* 상단 탭 메뉴 */}
            <div className='Qna-top-menu'>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'faq' ? 'active' : ''}`}
                    onClick={() => handleTabChange('faq')}
                >
                    자주묻는 질문
                </button>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'history' ? 'active' : ''}`}
                    onClick={() => handleTabChange('history')}
                >
                    문의내역
                </button>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'ask' ? 'active' : ''}`}
                    onClick={() => handleTabChange('ask')}
                >
                    문의하기
                </button>
            </div>

            {/* 본문 콘텐츠 */}
            <div className='Qna-content'>
                {/* 1. FAQ 탭 */}
                {topTab === 'faq' && (
                    <div className='Qna-view'>
                        <div className='tab-content'>
                            <h3>❓ 자주묻는 질문 (FAQ)</h3>
                            <p className='faq-sub-desc'>궁금하신 내용을 클릭하시면 상세 답변을 확인하실 수 있습니다.</p>

                            <div className='faq-list'>
                                {faqList.map((item) => (
                                    <div key={item.id} className='faq-item'>
                                        <div className='faq-header' onClick={() => toggleFaq(item.id)}>
                                            <div className='faq-title-area'>
                                                <span className='faq-q-badge'>Q</span>
                                                <span className='faq-title'>{item.title}</span>
                                            </div>
                                            <div className='faq-meta'>
                                                <span className='faq-date'>{item.date || item.createdAt}</span>
                                                <span className='faq-views'>조회 {item.views || 0}</span>
                                            </div>
                                        </div>
                                        {expandedFaqId === item.id && (
                                            <div className='faq-body'>
                                                <span className='faq-a-badge'>A</span>
                                                <p>{item.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className='pagination'>
                                    <button 
                                        type='button' 
                                        className='page-nav-btn' 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type='button'
                                            className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        type='button' 
                                        className='page-nav-btn' 
                                        disabled={currentPage === totalPages} 
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. 문의 내역 탭 */}
                {topTab === 'history' && (
                    <div className='tab-content history-container'>
                        <h3>📋 나의 문의내역</h3>
                        {historyList.length === 0 ? (
                            <p className='no-data'>작성한 문의 내역이 없습니다.</p>
                        ) : (
                            <div className='history-list'>
                                {historyList.map((item) => (
                                    <div key={item.id} className='history-item'>
                                        <div className='history-header' onClick={() => toggleHistory(item.id)}>
                                            <div className='history-info'>
                                                <span className={`status-tag ${item.status}`}>
                                                    {item.status === 'completed' || item.answer ? '답변완료' : '답변대기'}
                                                </span>
                                                <span className='history-title'>{item.title}</span>
                                            </div>
                                            <span className='history-date'>{item.createdAt}</span>
                                        </div>

                                        {expandedHistoryId === item.id && (
                                            <div className='history-detail'>
                                                <div className='question-box'>
                                                    <strong>Q. 문의내용</strong>
                                                    <p>{item.question}</p>
                                                </div>

                                                <div className='answer-box'>
                                                    <strong>A. 답변내용</strong>
                                                    
                                                    {item.answer && editingAnswerId !== item.id ? (
                                                        <div className='completed-answer'>
                                                            <p>{item.answer}</p>
                                                            <button 
                                                                type='button' 
                                                                className='admin-edit-btn'
                                                                onClick={() => {
                                                                    setEditingAnswerId(item.id);
                                                                    setAdminInput(item.answer);
                                                                }}
                                                            >
                                                                답변 수정하기
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className='admin-reply-box'>
                                                            <textarea
                                                                rows='4'
                                                                placeholder='[관리자 전용] 답변 작성란입니다.'
                                                                value={adminInput}
                                                                onChange={(e) => setAdminInput(e.target.value)}
                                                            />
                                                            <div className='admin-btn-group'>
                                                                {editingAnswerId === item.id && (
                                                                    <button 
                                                                        type='button' 
                                                                        className='cancel-btn'
                                                                        onClick={() => {
                                                                            setEditingAnswerId(null);
                                                                            setAdminInput('');
                                                                        }}
                                                                    >
                                                                        취소
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    type='button' 
                                                                    className='save-answer-btn'
                                                                    onClick={() => handleAdminAnswerSubmit(item.id)}
                                                                >
                                                                    {item.answer ? '수정 완료' : '답변 등록하기'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. 문의하기 탭 */}
                {topTab === 'ask' && (
                    <div className='tab-content ask-form-container'>
                        <h3>✍️ 1:1 문의하기</h3>
                        <form onSubmit={handleAskSubmit} className='ask-form'>
                            <div className='form-group'>
                                <label htmlFor='ask-title'>제목</label>
                                <input 
                                    type='text' 
                                    id='ask-title' 
                                    name='title'
                                    placeholder='문의 제목을 입력해 주세요'
                                    value={askForm.title}
                                    onChange={handleAskChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='ask-content'>문의 내용</label>
                                <textarea 
                                    id='ask-content' 
                                    name='content'
                                    rows='6'
                                    placeholder='궁금하신 점이나 불편사항을 상세히 남겨주시면 빠르게 답변드리겠습니다.'
                                    value={askForm.content}
                                    onChange={handleAskChange}
                                />
                            </div>
                            <button type='submit' className='submit-ask-btn'>
                                문의 접수하기
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Qna;