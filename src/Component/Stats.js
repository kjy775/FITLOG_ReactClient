import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/stats.css';

function Stats() {
    const navigate = useNavigate();
    const loginUser = useSelector((state) => state.user);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState({
        weightChange: 0,
        currentWeight: 0,
        totalCaloriesBurned: 0,
        avgCaloriesConsumed: 0,
    });

    // ⚖️ 기록 상태 관리
    const [weightsList, setWeightsList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [workoutsList, setWorkoutsList] = useState([]);

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

    // 1. 공통 유틸리티 함수 (중복 선언 제거)
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return dateInput;
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const toYmdString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getWeekDates = () => {
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = day === 0 ? -6 : 1 - day;

        monday.setDate(monday.getDate() + diff + weekOffset * 7);

        return Array.from({ length: 7 }, (_, idx) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + idx);
            return date;
        });
    };

    const dateList = getWeekDates();

    // 2. 통합 데이터 불러오기
    const fetchStatsData = async () => {
        const userId = loginUser?.num || localStorage.getItem('userId') || 1;
        const targetDateStr = toYmdString(selectedDate);
        const headers = getAuthHeader() || {};

        try {
            setLoading(true);

            // [요청 1] 통계 요약 데이터 조회
            const summaryRes = await axios.get('/api/statistics/summary', {
                params: {
                    id: userId,
                    period: period,
                    date: targetDateStr
                },
                headers
            });

            if (summaryRes.data) {
                if (summaryRes.data.summary) {
                    setSummary(summaryRes.data.summary);
                }
                if (summaryRes.data.meals) setMealsList(summaryRes.data.meals);
                if (summaryRes.data.workouts) setWorkoutsList(summaryRes.data.workouts);
            }

            // [요청 2] 체중 전체 Log 조회 (Weight2 방식과 통일)
            if (loginUser?.num) {
                const weightRes = await axios.get(`/api/weightlog/getWeightLog/${loginUser.num}`, { headers });
                const logs = weightRes.data?.weightLog;

                if (logs && Array.isArray(logs)) {
                    const sortedLogs = [...logs].sort((a, b) => new Date(b.indate) - new Date(a.indate));
                    setWeightsList(sortedLogs);
                } else {
                    setWeightsList([]);
                }
            }
        } catch (error) {
            console.error('통계 데이터 불러오기 실패:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatsData();
    }, [selectedDate, weekOffset, period, loginUser?.num]);

    if (loading) {
        return <div className='loading'>통계 데이터를 불러오는 중...</div>;
    }

    return (
        <div className='stats'>
            <div className='calendar'>
                <div style={{ fontSize: '28px' }}>
                    {formatDate(selectedDate)}
                </div>

                <div className='week-days' style={{ fontSize: '20px' }}>
                    {weekDays.map((day, idx) => (
                        <span key={idx}>{day}</span>
                    ))}
                </div>

                <div className='month-dates' style={{ fontSize: '20px' }}>
                    <button
                        type='button'
                        className="week-btn"
                        onClick={() => setWeekOffset(weekOffset - 1)}
                    >
                        ‹
                    </button>
                    <div className="date-list">
                        {dateList.map((date, idx) => (
                            <button
                                key={idx}
                                type='button'
                                className={`date-btn ${
                                    selectedDate.toDateString() === date.toDateString() ? 'active' : ''
                                }`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                    </div>
                    <button
                        type='button'
                        className="week-btn"
                        onClick={() => setWeekOffset(weekOffset + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className='stats-header'>
                <h2>📊 건강 통계 요약</h2>
                <div className='period-toggle'>
                    <button
                        type='button'
                        className={`period-btn ${period === 'week' ? 'active' : ''}`}
                        onClick={() => setPeriod('week')}
                    >
                        주간
                    </button>
                    <button
                        type='button'
                        className={`period-btn ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        월간
                    </button>
                </div>
            </div>

            <div className='stats-summary-grid'>
                <div className='summary-card weight-card'>
                    <span className='card-label'>현재 체중</span>
                    <strong className='card-value'>{summary.currentWeight} <small>kg</small></strong>
                    <span className={`card-sub ${summary.weightChange <= 0 ? 'down' : 'up'}`}>
                        {summary.weightChange <= 0 ? '▼' : '▲'} {Math.abs(summary.weightChange)}kg ({period === 'week' ? '지난주' : '지난달'} 대비)
                    </span>
                </div>

                <div className='summary-card burn-card'>
                    <span className='card-label'>총 운동 소비</span>
                    <strong className='card-value'>{(summary.totalCaloriesBurned || 0).toLocaleString()} <small>kcal</small></strong>
                    <span className='card-sub neutral'>목표 달성률 85%</span>
                </div>

                <div className='summary-card consume-card'>
                    <span className='card-label'>일평균 식사 섭취</span>
                    <strong className='card-value'>{(summary.avgCaloriesConsumed || 0).toLocaleString()} <small>kcal</small></strong>
                    <span className='card-sub neutral'>적정 범위 유지 중</span>
                </div>
            </div>

            <div className='stats-sections'>
                {/* ⚖️ 최근 체중 기록 섹션 */}
                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>⚖️ 최근 체중 기록</h3>
                    </div>
                    {weightsList.length === 0 ? (
                        <p className='no-data'>기록된 체중 데이터가 없습니다.</p>
                    ) : (
                        <ul className='stats-list'>
                            {weightsList.map((item, index) => (
                                <li key={item.num || item.id || index} className='stats-item'>
                                    <span className='item-date'>
                                        {formatDate(item.indate)}
                                    </span>
                                    <span className='item-main weight-highlight'>{item.weight} kg</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>🥗 최근 식사 기록</h3>
                    </div>
                    {mealsList.length === 0 ? (
                        <p className='no-data'>기록된 식사 데이터가 없습니다.</p>
                    ) : (
                        <ul className='stats-list'>
                            {mealsList.map((item) => (
                                <li key={item.id} className='stats-item'>
                                    <div className='item-info'>
                                        <span className='badge meal-badge'>{item.type}</span>
                                        <span className='item-title'>{item.name}</span>
                                    </div>
                                    <div className='item-side'>
                                        <span className='item-sub'>{item.date}</span>
                                        <span className='item-value'>{item.calories} kcal</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>🏃‍♂️ 최근 운동 기록</h3>
                    </div>
                    {workoutsList.length === 0 ? (
                        <p className='no-data'>기록된 운동 데이터가 없습니다.</p>
                    ) : (
                        <ul className='stats-list'>
                            {workoutsList.map((item) => (
                                <li key={item.id} className='stats-item'>
                                    <div className='item-info'>
                                        <span className='badge workout-badge'>{item.type}</span>
                                        <div className='item-text'>
                                            <span className='item-title'>{item.name}</span>
                                            <span className='item-desc'>{item.duration}</span>
                                        </div>
                                    </div>
                                    <div className='item-side'>
                                        <span className='item-sub'>{item.date}</span>
                                        <span className='item-value burn-text'>-{item.calories} kcal</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Stats;