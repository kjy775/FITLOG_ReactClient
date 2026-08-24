import React, { useState } from 'react';
import '../style/Exercise.css';

function ExerciseLog() {
    const today = new Date();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const [selectedDate, setSelectedDate] = useState(today);
    // 현재 보고 있는 주의 시작일(일요일)
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [logs, setLogs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputWeight, setInputWeight] = useState('');
    const [inputExerciseTime, setInputExerciseTime] = useState('');

    // 현재 주의 7일 (일 ~ 토)
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const toDateKey = (date) => {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const isSameDate = (a, b) => toDateKey(a) === toDateKey(b);

    const filteredLogs = logs.filter((log) =>
        isSameDate(log.indate, selectedDate)
    );

    const totalExerciseTime = filteredLogs.reduce(
        (sum, log) => sum + (log.exercises_time || 0),
        0
    );
    const latestWeight =
        filteredLogs.length > 0
            ? filteredLogs[filteredLogs.length - 1].weight
            : null;

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

    // 주 범위 라벨 (예: 8월 17일 ~ 8월 23일)
    const weekRangeLabel = () => {
        const start = weekDates[0];
        const end = weekDates[6];
        return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
    };

    const handlePrevWeek = () => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() - 7);
        setWeekStart(d);
    };

    const handleNextWeek = () => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + 7);
        setWeekStart(d);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        // TODO: 서버 연동 시 여기서 해당 날짜 기록 GET 요청
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
            num: Date.now(),
            weight: Number(inputWeight),
            exercises_time: Number(inputExerciseTime),
            indate: new Date(selectedDate).toISOString(),
        };

        setLogs((prev) => [...prev, newLog]);
        setIsModalOpen(false);
    };

    const handleDeleteClick = (num) => {
        setLogs((prev) => prev.filter((log) => log.num !== num));
    };

    return (
        <div className="exlog-container">
            {/* 주간 날짜 선택 */}
            <div className="exlog-week-wrapper">
                <div className="exlog-week-nav">
                    <div className="exlog-week-nav-btn" onClick={handlePrevWeek}>
                        &larr;
                    </div>
                    <div className="exlog-week-range">{weekRangeLabel()}</div>
                    <div className="exlog-week-nav-btn" onClick={handleNextWeek}>
                        &rarr;
                    </div>
                </div>

                <div className="exlog-week">
                    {weekDates.map((date) => {
                        const isSelected = isSameDate(date, selectedDate);
                        const isToday = isSameDate(date, today);
                        return (
                            <div
                                key={toDateKey(date)}
                                className={`exlog-week-day ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDateClick(date)}
                            >
                                <div className="exlog-week-weekday">
                                    {weekdays[date.getDay()]}
                                </div>
                                <div className="exlog-week-date">
                                    {date.getDate()}
                                </div>
                                {isToday && <div className="exlog-week-today-dot" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 날짜 헤더 */}
            <div className="exlog-date-header">
                {formatDate(selectedDate)}
            </div>

            {/* 요약 카드 */}
            <div className="exlog-summary-card">
                {filteredLogs.length === 0 ? (
                    <div className="exlog-summary-empty">
                        운동 기록이 없어요
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
                {filteredLogs.length === 0 ? (
                    <div className="exlog-list-empty">등록된 기록이 없어요</div>
                ) : (
                    filteredLogs.map((log) => (
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