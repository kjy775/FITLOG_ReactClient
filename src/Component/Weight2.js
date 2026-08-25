import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/main.css';
import '../style/weight2.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Weight2() {
    const loginUser = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);

    const [weight, setWeight] = useState('');
    const [savedWeight, setSavedWeight] = useState(null);
    const [weeklyWeightData, setWeeklyWeightData] = useState([]);

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

    // 선택된 주(weekOffset 기준)의 월~일 Date 객체 배열 생성
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

    const formatDate = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}일`;
    };

    // Date 객체나 문자열을 YYYY-MM-DD 포맷으로 변환
    const toYmdString = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    // 1. 선택한 날짜에 저장된 체중 조회 및 차트 데이터 매핑
    const fetchWeightLogData = async () => {
        if (!loginUser?.num) return;

        try {
            const response = await axios.get(`/api/weightlog/getWeightLog/${loginUser.num}`, {
                headers: getAuthHeader() || {}
            });

            const logs = response.data?.weightLog;

            if (logs && Array.isArray(logs) && logs.length > 0) {
                // [선택한 날짜 데이터 매핑]
                const targetDateStr = toYmdString(selectedDate);
                const matchedLog = logs.find((log) => {
                    const logDateStr = toYmdString(log.indate);
                    return logDateStr === targetDateStr;
                });

                if (matchedLog) {
                    setWeight(String(matchedLog.weight));
                    setSavedWeight(matchedLog.weight);
                } else {
                    setWeight('');
                    setSavedWeight(null);
                }

                // [주간 차트 데이터 생성]
                // 현재 달력에 보이는 월~일(dateList) 각각에 해당하는 체중 기록 검색 후 세팅
                const chartDataMapped = dateList.map((dateObj, idx) => {
                    const dateYmd = toYmdString(dateObj);
                    const log = logs.find((item) => toYmdString(item.indate) === dateYmd);

                    return {
                        // 차트 X축 라벨 예: '월(05/20)' 또는 '월'
                        label: `${weekDays[idx]} (${dateObj.getMonth() + 1}/${dateObj.getDate()})`,
                        // 데이터가 없으면 null (차트 선 끊김 처리) 또는 0
                        weight: log ? log.weight : null
                    };
                });

                setWeeklyWeightData(chartDataMapped);
            } else {
                setWeight('');
                setSavedWeight(null);
                setWeeklyWeightData([]);
            }
        } catch (error) {
            console.error('체중 기록 조회 실패:', error);
            setWeight('');
            setSavedWeight(null);
            setWeeklyWeightData([]);
        }
    };

    // 선택된 날짜, 주간 이동(weekOffset), 유저 정보 변경 시 데이터 새로고침
    useEffect(() => {
        fetchWeightLogData();
    }, [loginUser?.num, selectedDate, weekOffset]);

    // 2. 체중 저장 함수
    const handleSubmit = async () => {
        if (!weight) {
            alert('체중을 입력해주세요!');
            return;
        }

        if (!loginUser?.num) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const payload = {
            weight: parseFloat(weight),
            indate: selectedDate,
            member: { num: loginUser?.num }
        };

        try {
            await axios.post('/api/weightlog/writeWeightLog', payload, {
                headers: getAuthHeader() || {}
            });

            alert('저장되었습니다!');
            // 저장 성공 후 재조회해서 입력창과 차트에 즉시 반영
            await fetchWeightLogData();
        } catch (error) {
            console.error('체중 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    // ChartJS에 전달할 데이터 세팅
    const chartData = {
        labels: weeklyWeightData.map((item) => item.label),
        datasets: [
            {
                label: '체중(kg)',
                data: weeklyWeightData.map((item) => item.weight),
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
                spanGaps: true // 데이터가 없는 날짜가 있더라도 선을 연결해서 그려줌
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => context.raw ? `${context.raw} kg` : '기록 없음'
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
    };

    //

    return (
        <div className='weight2-container'>
            <div className='calendar'>
                <div style={{ fontSize: '28px' }}>{formatDate(selectedDate)}</div>

                <div className='week-days' style={{ fontSize: '20px' }}>
                    {weekDays.map((day, idx) => (
                        <span key={idx}>{day}</span>
                    ))}
                </div>

                <div className='month-dates' style={{ fontSize: '20px' }}>
                    <button
                        type='button'
                        className='week-btn'
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                    >
                        ‹
                    </button>
                    <div className='date-list'>
                        {dateList.map((date, idx) => (
                            <button
                                type='button'
                                key={idx}
                                className={`date-btn ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''
                                    }`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                    </div>
                    <button
                        type='button'
                        className='week-btn'
                        onClick={() => setWeekOffset((prev) => prev + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className='weight-weight'>
                <div className='weight-title'>오늘의 체중</div>

                {savedWeight === null ? (
                    <div className='weight-input-container'>

                        <input
                            type='number'
                            className='weight-input'
                            placeholder='체중을 입력하세요'
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            step='0.1'
                        />
                        <span className='weight-unit'>kg</span>


                        <button
                            type='button'
                            className='weight-submit-btn'
                            onClick={handleSubmit}
                        >
                            저장
                        </button>
                    </div>
                ) : (
                    <div className="weight-display">
                        <div className="weight-display-value">
                            <span className="weight-display-number">{savedWeight}</span>
                            <span className="weight-display-unit">kg</span>
                        </div>

                        <div className="weight-display-badge">오늘 기록 완료</div>
                    </div>
                )}
            </div>

            <div className='weight-graph'>
                <div className='graph-title'>체중 변화</div>
                <div className='chart-wrapper'>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}

export default Weight2;