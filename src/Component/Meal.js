import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../style/Meal.css';
import { useSelector } from 'react-redux';

function Meal() {
    const today = new Date();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const loginUser = useSelector((state) => state.user);
    const [selectedDate, setSelectedDate] = useState(today);
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [logs, setLogs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetFood, setTargetFood] = useState('');
    const [inputRows, setInputRows] = useState([{ menu: '', amount: '' }]);

    // 사진 분석 관련
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeMessage, setAnalyzeMessage] = useState('');
    const photoInputRef = useRef(null);

    const FOOD_TYPES = ['아침', '점심', '저녁', '기타'];
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ];

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
        // TODO: 해당 날짜 기록 GET 요청
    };

    const dateLogs = logs.filter((log) => isSameDate(log.indate, selectedDate));

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
        setPhotoFile(null);
        setPhotoPreview(null);
        setIsAnalyzing(false);
        setAnalyzeMessage('');
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

    // 사진 선택
    const handlePhotoClick = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }

        setPhotoFile(file);
        setAnalyzeMessage('');

        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handlePhotoRemove = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setAnalyzeMessage('');
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    // 사진 분석 요청 (Spring → FastAPI)
    const handleAnalyzeClick = async () => {
        if (!photoFile || isAnalyzing) return;

        setIsAnalyzing(true);
        setAnalyzeMessage('');

        const formData = new FormData();
        formData.append('image', photoFile);

        try {
            const res = await axios.post('/api/ai/findFood', formData);

            const foods = res.data.foods || [];

            if (foods.length === 0) {
                setAnalyzeMessage('음식을 인식하지 못했어요. 직접 입력해주세요.');
                return;
            }

            // 인식된 음식 이름을 메뉴칸에 채우고, 양은 비워둠
            setInputRows(
                foods.map((foodName) => ({ menu: foodName, amount: '' }))
            );
            setAnalyzeMessage(
                `${foods.length}개의 음식을 찾았어요. 섭취량을 입력해주세요.`
            );
        } catch (err) {
            console.error(err);
            setAnalyzeMessage('사진 분석에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleModalSave = async () => {
        const validRows = inputRows.filter((row) => row.menu && row.amount);
        if (validRows.length === 0) return;

        // TODO: POST /food_log — validRows를 selectedDate 기준으로 전송
        for (const row of validRows) {
            await axios.post("/api/foodLog/addFoodLog", {
                menu: row.menu,
                amount: row.amount,
                selectedDate: selectedDate
            }, {params:{mnum: loginUser.num}});
        }
        
        setIsModalOpen(false);
    };

    const handleDeleteClick = (num) => {
        // TODO: DELETE /food_log/{num}
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

                        {/* 사진 영역 */}
                        {photoPreview ? (
                            <div className="meallog-modal-photo-selected">
                                <div className="meallog-modal-photo-preview-box">
                                    <img
                                        src={photoPreview}
                                        alt="food"
                                        className="meallog-modal-photo-preview"
                                    />
                                    <div
                                        className="meallog-modal-photo-remove"
                                        onClick={handlePhotoRemove}
                                    >
                                        ✕
                                    </div>
                                </div>
                                <div
                                    className={`meallog-modal-analyze-btn ${isAnalyzing ? 'loading' : ''}`}
                                    onClick={handleAnalyzeClick}
                                >
                                    {isAnalyzing ? '분석 중...' : '사진 분석하기'}
                                </div>
                            </div>
                        ) : (
                            <div
                                className="meallog-modal-photo"
                                onClick={handlePhotoClick}
                            >
                                <div className="meallog-modal-photo-icon">📷</div>
                                <div className="meallog-modal-photo-text">
                                    사진으로 음식 추가하기
                                </div>
                                <div className="meallog-modal-photo-hint">
                                    jpg, jpeg, png, webp
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            ref={photoInputRef}
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />

                        {analyzeMessage && (
                            <div className="meallog-modal-analyze-message">
                                {analyzeMessage}
                            </div>
                        )}

                        <div className="meallog-modal-divider">
                            <span>메뉴 / 섭취량</span>
                        </div>

                        {/* 메뉴 입력 */}
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
                                            type="text"
                                            inputMode="numeric"
                                            className="meallog-modal-input meallog-modal-amount-input"
                                            placeholder="0"
                                            value={row.amount}
                                            onChange={(e) =>
                                                handleRowChange(
                                                    index,
                                                    'amount',
                                                    e.target.value.replace(/[^0-9]/g, '')
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