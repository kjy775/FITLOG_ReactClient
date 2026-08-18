import React, { useState } from 'react';
import '../style/Exercise.css';

function ExerciseLog() {
    const today = new Date();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const [selectedDate] = useState(today);
    const [logs, setLogs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputWeight, setInputWeight] = useState('');
    const [inputExerciseTime, setInputExerciseTime] = useState('');

    const totalExerciseTime = logs.reduce(
        (sum, log) => sum + (log.exercises_time || 0),
        0
    );
    const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;

    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = weekdays[date.getDay()];
        return `${month}월 ${day}일 (${weekday})`;
    };

    const formatIndate = (indate) => {
        const d = new Date(indate);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const handleAddClick = () => {
        setInputWeight('');
        setInputExerciseTime('');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalSave = () => {
        if (!inputWeight || !inputExerciseTime) return;

        // TODO: 실제로는 서버에 POST 요청 → num, indate는 서버가 생성해서 응답으로 내려줌
        const newLog = {
            num: Date.now(), // 임시 key, 실제로는 서버 응답의 num으로 대체
            weight: Number(inputWeight),
            exercises_time: Number(inputExerciseTime),
            indate: new Date().toISOString(),
        };

        setLogs((prev) => [...prev, newLog]);
        setIsModalOpen(false);
    };

    const handleDeleteClick = (num) => {
        setLogs((prev) => prev.filter((log) => log.num !== num));
    };

    return (
        <div className="exlog-container">
            {/* 날짜 헤더 - 최상단 고정 */}
            <div className="exlog-date-header">
                {formatDate(selectedDate)}
            </div>

            {/* 요약 카드 */}
            <div className="exlog-summary-card">
                {logs.length === 0 ? (
                    <div className="exlog-summary-empty">
                        오늘은 아직 운동 기록이 없어요
                    </div>
                ) : (
                    <div className="exlog-summary-stats">
                        <div className="exlog-summary-item">
                            <div className="exlog-summary-label">총 운동시간</div>
                            <div className="exlog-summary-value">
                                {totalExerciseTime}
                                <span className="exlog-summary-unit">분</span>
                            </div>
                        </div>
                        <div className="exlog-summary-divider" />
                        <div className="exlog-summary-item">
                            <div className="exlog-summary-label">최근 몸무게</div>
                            <div className="exlog-summary-value">
                                {latestWeight}
                                <span className="exlog-summary-unit">kg</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 추가 버튼 */}
            <div className="exlog-add-row">
                <div className="exlog-add-btn" onClick={handleAddClick}>
                    + 운동 기록 추가
                </div>
            </div>

            {/* 운동 기록 목록 */}
            <div className="exlog-list">
                {logs.length === 0 ? (
                    <div className="exlog-list-empty">등록된 기록이 없어요</div>
                ) : (
                    logs.map((log) => (
                        <div className="exlog-item" key={log.num}>
                            <div className="exlog-item-main">
                                <div className="exlog-item-name">
                                    운동 {log.exercises_time}분
                                </div>
                                <div className="exlog-item-meta">
                                    몸무게 {log.weight}kg · {formatIndate(log.indate)}
                                </div>
                            </div>
                            <div
                                className="exlog-item-delete"
                                onClick={() => handleDeleteClick(log.num)}
                            >
                                ✕
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 운동 기록 추가 모달 */}
            {isModalOpen && (
                <div className="exlog-modal-overlay" onClick={handleModalClose}>
                    <div
                        className="exlog-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="exlog-modal-title">운동 기록 추가</div>

                        <div className="exlog-modal-field">
                            <label className="exlog-modal-label">몸무게 (kg)</label>
                            <input
                                type="number"
                                className="exlog-modal-input"
                                placeholder="예: 65.5"
                                value={inputWeight}
                                onChange={(e) => setInputWeight(e.target.value)}
                            />
                        </div>

                        <div className="exlog-modal-field">
                            <label className="exlog-modal-label">운동 시간 (분)</label>
                            <input
                                type="number"
                                className="exlog-modal-input"
                                placeholder="예: 30"
                                value={inputExerciseTime}
                                onChange={(e) => setInputExerciseTime(e.target.value)}
                            />
                        </div>

                        <div className="exlog-modal-actions">
                            <div
                                className="exlog-modal-cancel-btn"
                                onClick={handleModalClose}
                            >
                                취소
                            </div>
                            <div
                                className="exlog-modal-save-btn"
                                onClick={handleModalSave}
                            >
                                저장
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExerciseLog;