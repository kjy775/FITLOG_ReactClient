import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/qna/qna.css';

function Qna() {
    // 상단 메뉴 관리 ('faq' | 'history' | 'ask')
    const [topTab, setTopTab] = useState('faq');

    // 1:1 문의하기 폼 상태 관리
    const [askForm, setAskForm] = useState({ title: '', content: '' });
    const navigate = useNavigate();

    // 1:1 문의 입력 변경 핸들러
    const handleAskChange = (e) => {
        const { name, value } = e.target;
        setAskForm((prev) => ({ ...prev, [name]: value }));
    };

    // 1:1 문의 제출 핸들러
    const handleAskSubmit = (e) => {
        e.preventDefault();
        if (!askForm.title.trim() || !askForm.content.trim()) {
            alert('제목과 내용을 모두 입력해 주세요.');
            return;
        }
        alert('문의가 접수되었습니다.');
        setAskForm({ title: '', content: '' });
        setTopTab('history'); // 제출 후 문의내역 탭으로 이동
    };

    return (
        <div className='Qna'>
            {/* 상단 통합 메뉴 영역 */}
            <div className='Qna-top-menu'>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'faq' ? 'active' : ''}`}
                    onClick={() => setTopTab('faq')}
                >
                    자주묻는 질문
                </button>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'history' ? 'active' : ''}`}
                    onClick={() => setTopTab('history')}
                >
                    문의내역
                </button>
                <button 
                    type='button' 
                    className={`top-tab-btn ${topTab === 'ask' ? 'active' : ''}`}
                    onClick={() => setTopTab('ask')}
                >
                    문의하기
                </button>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className='Qna-content'>
                {/* 1. 자주묻는 질문 */}
                {topTab === 'faq' && (
                    <div className='Qna-view'>
                        <div className='tab-content'>
                            <h3>❓ 자주묻는 질문 (FAQ)</h3>
                            <p>이용자들이 자주 묻는 질문 모음입니다.</p>
                        </div>

                        
                    </div>
                )}

                {/* 2. 문의내역 */}
                {topTab === 'history' && (
                    <div className='tab-content'>
                        <h3>📋 나의 문의내역</h3>
                        <p>이전에 작성했던 1:1 문의 내역 및 답변을 확인하는 공간입니다.</p>
                    </div>
                )}

                {/* 3. 문의하기 (글쓰기 화면) */}
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