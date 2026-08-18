import React, { useState } from 'react';
import '../style/Meal.css';

function Meal() {
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

    // food_log 레코드 목록
    // { num, mnum, food, menu, amount, indate, nutrition: { name, kcal, carb, protein, fat } }
    // nutrition은 서버에서 조인해서 내려주는 값 (100g 기준)
    const [logs, setLogs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetFood, setTargetFood] = useState('');

    // 모달에서 한 번에 여러 개 입력할 수 있도록 배열로 관리
    const [inputRows, setInputRows] = useState([{ menu: '', amount: '' }]);

    const FOOD_TYPES = ['아침', '점심', '저녁', '기타'];

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

    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = weekdays[date.getDay()];
        return `${month}월 ${day}일 (${weekday})`;
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

    // 선택한 날짜의 기록만 필터링
    const dateLogs = logs.filter((log) => isSameDate(log.indate, selectedDate));

    // nutrition은 100g 기준 값이라고 가정하고 실제 섭취량(g)으로 환산
    const calcNutrition = (log) => {
        const n = log.nutrition || {};
        const ratio = (log.amount || 0) / 100;
        return {
            kcal: (n.kcal || 0) * ratio,
            carb: (n.carb || 0) * ratio,
            protein: (n.protein || 0) * ratio,
            fat: (n.fat || 0) * ratio,
        };
    };

    const totals = dateLogs.reduce(
        (acc, log) => {
            const n = calcNutrition(log);
            return {
                kcal: acc.kcal + n.kcal,
                carb: acc.carb + n.carb,
                protein: acc.protein + n.protein,
                fat: acc.fat + n.fat,
            };
        },
        { kcal: 0, carb: 0, protein: 0, fat: 0 }
    );

    const totalMacro = totals.carb + totals.protein + totals.fat;
    const getPercent = (value) =>
        totalMacro > 0 ? Math.round((value / totalMacro) * 100) : 0;

    const getLogsByFood = (food) => dateLogs.filter((log) => log.food === food);

    const getFoodKcal = (food) =>
        getLogsByFood(food).reduce((sum, log) => sum + calcNutrition(log).kcal, 0);

    const handleAddClick = (food) => {
        setTargetFood(food);
        setInputRows([{ menu: '', amount: '' }]);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleRowChange = (index, field, value) => {
        setInputRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleAddRow = () => {
        setInputRows((prev) => [...prev, { menu: '', amount: '' }]);
    };

    const handleRemoveRow = (index) => {
        setInputRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePhotoClick = () => {
        // TODO: 사진으로 음식 인식 기능 연동
    };

    const handleModalSave = () => {
        const validRows = inputRows.filter((row) => row.menu && row.amount);
        if (validRows.length === 0) return;

        // TODO: 서버 연동
        // POST /food_log — validRows를 selectedDate 기준으로 한 번에 전송
        // → 응답으로 num, indate, 조인된 nutrition 정보를 받아서 목록에 반영
        setIsModalOpen(false);
    };

    const handleDeleteClick = (num) => {
        // TODO: DELETE /food_log/{num} 요청 후 목록에서 제거
        setLogs((prev) => prev.filter((log) => log.num !== num));
    };

    return (
        <div className="meallog-container">
            {/* 주간 날짜 선택 */}
            <div className="meallog-week-wrapper">
                <div className="meallog-week-nav">
                    <div className="meallog-week-nav-btn" onClick={handlePrevWeek}>
                        &larr;
                    </div>
                    <div className="meallog-week-range">{weekRangeLabel()}</div>
                    <div className="meallog-week-nav-btn" onClick={handleNextWeek}>
                        &rarr;
                    </div>
                </div>

                <div className="meallog-week">
                    {weekDates.map((date) => {
                        const isSelected = isSameDate(date, selectedDate);
                        const isToday = isSameDate(date, today);
                        return (
                            <div
                                key={toDateKey(date)}
                                className={`meallog-week-day ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDateClick(date)}
                            >
                                <div className="meallog-week-weekday">
                                    {weekdays[date.getDay()]}
                                </div>
                                <div className="meallog-week-date">
                                    {date.getDate()}
                                </div>
                                {isToday && <div className="meallog-week-today-dot" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 날짜 헤더 */}
            <div className="meallog-date-header">{formatDate(selectedDate)}</div>

            {/* 섭취 칼로리 */}
            <div className="meallog-calorie-card">
                <div className="meallog-calorie-label">섭취한 칼로리</div>
                <div className="meallog-calorie-value">
                    {Math.round(totals.kcal)}
                    <span className="meallog-calorie-unit">kcal</span>
                </div>
            </div>

            {/* 탄단지 */}
            <div className="meallog-macro-card">
                <div className="meallog-macro-title">탄단지</div>
                <div className="meallog-macro-row">
                    <div className="meallog-macro-item">
                        <div className="meallog-macro-name">탄수화물</div>
                        <div className="meallog-macro-gram">
                            {Math.round(totals.carb)}g
                        </div>
                        <div className="meallog-macro-percent">
                            {getPercent(totals.carb)}%
                        </div>
                    </div>
                    <div className="meallog-macro-item">
                        <div className="meallog-macro-name">단백질</div>
                        <div className="meallog-macro-gram">
                            {Math.round(totals.protein)}g
                        </div>
                        <div className="meallog-macro-percent">
                            {getPercent(totals.protein)}%
                        </div>
                    </div>
                    <div className="meallog-macro-item">
                        <div className="meallog-macro-name">지방</div>
                        <div className="meallog-macro-gram">
                            {Math.round(totals.fat)}g
                        </div>
                        <div className="meallog-macro-percent">
                            {getPercent(totals.fat)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 끼니별 섹션 */}
            {FOOD_TYPES.map((food) => (
                <div className="meallog-section" key={food}>
                    <div className="meallog-section-header">
                        <div className="meallog-section-label">{food}</div>
                        <div className="meallog-section-right">
                            <span className="meallog-section-cal">
                                {Math.round(getFoodKcal(food))}kcal
                            </span>
                            <span
                                className="meallog-section-add"
                                onClick={() => handleAddClick(food)}
                            >
                                +
                            </span>
                        </div>
                    </div>

                    <div className="meallog-food-list">
                        {getLogsByFood(food).length === 0 ? (
                            <div className="meallog-food-empty">
                                기록된 음식이 없어요
                            </div>
                        ) : (
                            getLogsByFood(food).map((log) => {
                                const n = calcNutrition(log);
                                return (
                                    <div className="meallog-food-item" key={log.num}>
                                        <div className="meallog-food-main">
                                            <div className="meallog-food-name">
                                                {log.nutrition?.name}
                                            </div>
                                            <div className="meallog-food-meta">
                                                {log.amount}g · 탄{' '}
                                                {Math.round(n.carb)}g · 단{' '}
                                                {Math.round(n.protein)}g · 지{' '}
                                                {Math.round(n.fat)}g
                                            </div>
                                        </div>
                                        <div className="meallog-food-right">
                                            <span className="meallog-food-cal">
                                                {Math.round(n.kcal)}kcal
                                            </span>
                                            <span
                                                className="meallog-food-delete"
                                                onClick={() =>
                                                    handleDeleteClick(log.num)
                                                }
                                            >
                                                ✕
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}

            {/* 음식 추가 모달 */}
            {isModalOpen && (
                <div className="meallog-modal-overlay" onClick={handleModalClose}>
                    <div
                        className="meallog-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="meallog-modal-title">
                            {targetFood} 기록 추가
                        </div>

                        {/* 사진으로 추가 (UI만) */}
                        <div
                            className="meallog-modal-photo"
                            onClick={handlePhotoClick}
                        >
                            <div className="meallog-modal-photo-icon">📷</div>
                            <div className="meallog-modal-photo-text">
                                사진으로 음식 추가하기
                            </div>
                        </div>

                        <div className="meallog-modal-divider">
                            <span>또는 직접 입력</span>
                        </div>

                        {/* 메뉴 입력 (여러 개) */}
                        <div className="meallog-modal-rows">
                            {inputRows.map((row, index) => (
                                <div className="meallog-modal-row" key={index}>
                                    <input
                                        type="text"
                                        className="meallog-modal-input meallog-modal-menu-input"
                                        placeholder="메뉴"
                                        value={row.menu}
                                        onChange={(e) =>
                                            handleRowChange(
                                                index,
                                                'menu',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <div className="meallog-modal-amount-wrapper">
                                        <input
                                            type="number"
                                            className="meallog-modal-input meallog-modal-amount-input"
                                            placeholder="0"
                                            value={row.amount}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'amount',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span className="meallog-modal-unit">g</span>
                                    </div>
                                    {inputRows.length > 1 && (
                                        <span
                                            className="meallog-modal-row-delete"
                                            onClick={() => handleRemoveRow(index)}
                                        >
                                            ✕
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div
                            className="meallog-modal-add-row-btn"
                            onClick={handleAddRow}
                        >
                            + 메뉴 추가
                        </div>

                        <div className="meallog-modal-actions">
                            <div
                                className="meallog-modal-cancel-btn"
                                onClick={handleModalClose}
                            >
                                취소
                            </div>
                            <div
                                className="meallog-modal-save-btn"
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

export default Meal;