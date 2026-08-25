import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/stats.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ---------------------------------------------------------------
// 공통 유틸
// ---------------------------------------------------------------
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// 주어진 날짜가 속한 주(일~토)의 시작일(일요일)을 반환
const getWeekStart = (baseDate, weekOffset) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getWeekDates = (weekStart) =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

const toYmdString = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const weekRangeLabel = (weekDates) => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getMonth() + 1}.${start.getDate()} ~ ${end.getMonth() + 1}.${end.getDate()}`;
};

const chartLabel = (date) => `${weekdays[date.getDay()]}`;

const baseChartOptions = (tooltipUnit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) =>
                    context.raw !== null && context.raw !== undefined
                        ? `${context.raw}${tooltipUnit}`
                        : '기록 없음'
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#888888', font: { size: 12 } }
        },
        y: {
            grid: { color: '#f0f0f0' },
            ticks: { color: '#888888', font: { size: 12 } }
        }
    }
});

// 주간 이동 네비게이션 (모든 섹션 공통 UI)
function WeekNav({ weekDates, weekOffset, setWeekOffset }) {
    return (
        <div className="stats-week-nav">
            <button
                type="button"
                className="stats-week-btn"
                onClick={() => setWeekOffset((prev) => prev - 1)}
            >
                ‹
            </button>
            <div className="stats-week-range">{weekRangeLabel(weekDates)}</div>
            <button
                type="button"
                className="stats-week-btn"
                onClick={() => setWeekOffset((prev) => prev + 1)}
            >
                ›
            </button>
        </div>
    );
}

// ---------------------------------------------------------------
// 1. 체중 통계 (기존 Weight2.js의 주간 라인차트 로직 재사용)
// ---------------------------------------------------------------
function WeightStatsSection() {
    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await axios.get(`/api/weightlog/getWeightLog/${loginUser.num}`);
            const logs = res.data?.weightLog || [];

            const mapped = weekDates.map((date) => {
                const log = logs.find((item) => toYmdString(item.indate) === toYmdString(date));
                return {
                    label: chartLabel(date),
                    value: log ? log.weight : null
                };
            });
            setWeeklyData(mapped);
        } catch (err) {
            console.error('체중 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                label: '체중(kg)',
                data: weeklyData.map((d) => d.value),
                borderColor: '#20D793',
                backgroundColor: 'rgba(32, 215, 147, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#20D793',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true,
                spanGaps: true
            }
        ]
    };

    return (
        
        
        <div className="stats-section">
            <div className="stats-section-title">체중 변화</div>
            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
            <div className="stats-chart-wrapper">
                <Line data={chartData} options={baseChartOptions(' kg')} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------
// 2. 식사 통계 (foodLog를 날짜별로 합산해 일별 섭취 칼로리 막대그래프)
// ---------------------------------------------------------------
function MealStatsSection() {
    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await axios.get('/api/foodLog/foodLogList', {
                params: { mnum: loginUser.num }
            });
            const logs = res.data?.foodLogList || [];

            const mapped = weekDates.map((date) => {
                const dayLogs = logs.filter(
                    (log) => toYmdString(log.indate) === toYmdString(date)
                );
                const totalKcal = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
                return {
                    label: chartLabel(date),
                    value: dayLogs.length > 0 ? Math.round(totalKcal) : null
                };
            });
            setWeeklyData(mapped);
        } catch (err) {
            console.error('식사 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                label: '섭취 칼로리(kcal)',
                data: weeklyData.map((d) => d.value),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderRadius: 6,
                maxBarThickness: 28
            }
        ]
    };

    return (
        <div className="stats-section">
            <div className="stats-section-title">섭취 칼로리</div>
            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
            <div className="stats-chart-wrapper">
                <Bar data={chartData} options={baseChartOptions(' kcal')} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------
// 3. 운동 통계 (exerciseLog를 날짜별로 합산해 일별 운동시간 막대그래프)
// ---------------------------------------------------------------
function ExerciseStatsSection() {
    const loginUser = useSelector((state) => state.user);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);

    const weekStart = getWeekStart(new Date(), weekOffset);
    const weekDates = getWeekDates(weekStart);

    const fetchData = useCallback(async () => {
        if (!loginUser?.num) return;
        try {
            const res = await axios.get('/api/exerciselog/exercisesLogList', {
                params: { mnum: loginUser.num }
            });
            const logs = res.data?.exerciseLogList || [];

            const mapped = weekDates.map((date) => {
                const dayLogs = logs.filter(
                    (log) => toYmdString(log.indate) === toYmdString(date)
                );
                const totalTime = dayLogs.reduce((sum, log) => sum + (log.exerciseTime || 0), 0);
                return {
                    label: chartLabel(date),
                    value: dayLogs.length > 0 ? totalTime : null
                };
            });
            setWeeklyData(mapped);
        } catch (err) {
            console.error('운동 통계 조회 실패:', err);
            setWeeklyData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.num, weekOffset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = {
        labels: weeklyData.map((d) => d.label),
        datasets: [
            {
                label: '운동시간(분)',
                data: weeklyData.map((d) => d.value),
                backgroundColor: 'rgba(94, 129, 244, 0.75)',
                borderRadius: 6,
                maxBarThickness: 28
            }
        ]
    };

    return (
        <div className="stats-section">
            <div className="stats-section-title">운동 시간</div>
            <WeekNav weekDates={weekDates} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
            <div className="stats-chart-wrapper">
                <Bar data={chartData} options={baseChartOptions(' 분')} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------
// Stats 메인 페이지
// ---------------------------------------------------------------
function Stats() {
    return (
        
        <div className="stats-container">
            <div className="stats-page-title">통계</div>
            <WeightStatsSection />
            <MealStatsSection />
            <ExerciseStatsSection />
        </div>
    );
}

export default Stats;
