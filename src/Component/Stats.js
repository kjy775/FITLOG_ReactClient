import React,{ useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import '../style/stats.css';

function Stats() {

    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

    const getWeekDates = () => {
    const today = new Date();

    // 이번 주 월요일
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

    const formatDate = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}일`;
    };
    

    // 1. 조회 기간 필터 ('week' | 'month')
    const [period, setPeriod] = useState('week');

    // 2. 더미 데이터 (실제 데이터 수집 전 UI 확인용)
    const statsData = {
        summary: {
            weightChange: -1.2, // 체중 변화 (kg)
            currentWeight: 68.5,
            totalCaloriesBurned: 2450, // 총 소비 칼로리 (kcal)
            avgCaloriesConsumed: 1850, // 일평균 섭취 칼로리 (kcal)
        },
        weights: [
            { id: 1, date: '2026-08-20', weight: 68.5 },
            { id: 2, date: '2026-08-18', weight: 68.9 },
            { id: 3, date: '2026-08-15', weight: 69.2 },
            { id: 4, date: '2026-08-13', weight: 69.7 },
        ],
        meals: [
            { id: 1, date: '2026-08-20', type: '점심', name: '닭가슴살 샐러드 & 현미밥', calories: 520 },
            { id: 2, date: '2026-08-20', type: '아침', name: '사과 1개 & 바나나 셰이크', calories: 310 },
            { id: 3, date: '2026-08-19', type: '저녁', name: '연어 스테이크', calories: 650 },
        ],
        workouts: [
            { id: 1, date: '2026-08-20', type: '유산소', name: '야외 러닝 5km', duration: '35분', calories: 380 },
            { id: 2, date: '2026-08-19', type: '근력', name: '하체 루틴 (스쿼트 외)', duration: '50분', calories: 420 },
            { id: 3, date: '2026-08-17', type: '유산소', name: '실내 자전거', duration: '40분', calories: 290 },
        ]
    };

  return (
    <div className='stats'>
        <div className='calendar'>
            <div style={{fontSize:'28px'}}>
                {formatDate(selectedDate)}
            </div>

            <div className='week-days' style={{fontSize:'20px'}}>
                {weekDays.map((day, idx) => (
                    <span key={idx}>{day}</span>
                ))}
            </div>

            <div className='month-dates' style={{fontSize:'20px'}}>

            <button
                className="week-btn"
                onClick={() => setWeekOffset(weekOffset - 1)}
            >
                ‹
            </button>
            <div className="date-list">
                        {dateList.map((date, idx) => (
                            <button
                                key={idx}
                                className={`date-btn ${
                                    selectedDate.toDateString() === date.toDateString()
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                    </div>
            <button
                className="week-btn"
                onClick={() => setWeekOffset(weekOffset + 1)}>›
            </button>
            </div>
        </div>
        
        {/* 상단 헤더 및 기간 필터 */}
            <div className='stats-header'>
                <h2>📊 건강 통계 요약</h2>
                <div className='period-toggle'>
                    <button 
                        className={`period-btn ${period === 'week' ? 'active' : ''}`}
                        onClick={() => setPeriod('week')}
                    >
                        주간
                    </button>
                    <button 
                        className={`period-btn ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        월간
                    </button>
                </div>
            </div>

            {/* 1. 핵심 수치 요약 카드 (Overview) */}
            <div className='stats-summary-grid'>
                <div className='summary-card weight-card'>
                    <span className='card-label'>현재 체중</span>
                    <strong className='card-value'>{statsData.summary.currentWeight} <small>kg</small></strong>
                    <span className={`card-sub ${statsData.summary.weightChange <= 0 ? 'down' : 'up'}`}>
                        {statsData.summary.weightChange <= 0 ? '▼' : '▲'} {Math.abs(statsData.summary.weightChange)}kg (지난주 대비)
                    </span>
                </div>

                <div className='summary-card burn-card'>
                    <span className='card-label'>총 운동 소비</span>
                    <strong className='card-value'>{statsData.summary.totalCaloriesBurned.toLocaleString()} <small>kcal</small></strong>
                    <span className='card-sub neutral'>목표 달성률 85%</span>
                </div>

                <div className='summary-card consume-card'>
                    <span className='card-label'>일평균 식사 섭취</span>
                    <strong className='card-value'>{statsData.summary.avgCaloriesConsumed.toLocaleString()} <small>kcal</small></strong>
                    <span className='card-sub neutral'>적정 범위 유치 중</span>
                </div>
            </div>

            {/* 2. 세부 통합 기록 리스트 */}
            <div className='stats-sections'>
                
                {/* 체중 변동 기록 */}
                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>⚖️ 최근 체중 기록</h3>
                    </div>
                    <ul className='stats-list'>
                        {statsData.weights.map((item) => (
                            <li key={item.id} className='stats-item'>
                                <span className='item-date'>{item.date}</span>
                                <span className='item-main weight-highlight'>{item.weight} kg</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 식사 기록 */}
                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>🥗 최근 식사 기록</h3>
                    </div>
                    <ul className='stats-list'>
                        {statsData.meals.map((item) => (
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
                </section>

                {/* 운동 기록 */}
                <section className='stats-section'>
                    <div className='section-title'>
                        <h3>🏃‍♂️ 최근 운동 기록</h3>
                    </div>
                    <ul className='stats-list'>
                        {statsData.workouts.map((item) => (
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
                </section>

            </div>
    </div>
  )
}

export default Stats