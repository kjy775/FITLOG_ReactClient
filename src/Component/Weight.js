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
    const [memo, setMemo] = useState('');
    const [savedMemo, setSavedMemo] = useState(null);
    
    

    const [weeklyWeightData, setWeeklyWeightData] = useState([]);

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

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

    const toYmdString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    // 1. 선택한 날짜의 상세 기록 조회
    const fetchTargetDateData = async (date) => {
        const headers = getAuthHeader();
        const dateStr = toYmdString(date);

        try {
            const response = await axios.get('/api/weight/detail', {
                params: { date: dateStr },
                headers: headers || {}
            });

            if (response.data) {
                setWeight(response.data.weight ? String(response.data.weight) : '');
                setMemo(response.data.memo || '');
            } else {
                setWeight('');
                setMemo('');
            }
        } catch (error) {
            console.error('해당 일자 기록 조회 실패:', error);
            setWeight('');
            setMemo('');
        }
    };

    // 2. 주간 체중 데이터 조회 (차트용)
    const fetchWeeklyChartData = async () => {
        // const headers = getAuthHeader();
        // const startDate = toYmdString(dateList[0]);
        // const endDate = toYmdString(dateList[6]);

        // try {
        //     const response = await axios.get('/api/weight/weekly', {
        //         params: { startDate, endDate },
        //         headers: headers || {}
        //     });
        //     setWeeklyWeightData(response.data || []);
        // } catch (error) {
        //     console.error('주간 차트 데이터 조회 실패:', error);
        // }
    };

    useEffect(() => {
        fetchTargetDateData(selectedDate);
        }, [selectedDate]);

        useEffect(() => {
            fetchWeeklyChartData();
        }, [weekOffset]);

        // 3. 체중 및 메모 저장
        const handleSubmit = async () => {
    if (!weight) {
        alert('체중을 입력해주세요!');
        return;
    }
    const payload = {
        weight: parseFloat(weight),
        member: { num: loginUser?.num },
    };
        try {
            await axios.post('/api/weightlog/writeWeightLog', payload, {
                headers: getAuthHeader() || {}
            });

            setSavedWeight(parseFloat(weight));
            alert('저장되었습니다!');
            const res = await axios.get(`/api/weightlog/getWeightLog/${loginUser?.num}`)
            console.log(res.data.weightLog)
        } catch (error) {
            console.error('체중 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

        

    const chartData = {
        labels: weeklyWeightData.map((item) => item.date),
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
                fill: true
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
                    label: (context) => `${context.raw} kg`
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
                        className='week-btn'
                        onClick={() => setWeekOffset((prev) => prev + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className='weight-weight'>
                <div className='weight-title'>오늘의 체중</div>
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
                    <button type='button' className='weight-submit-btn' onClick={handleSubmit}>
                        저장
                    </button>
                </div>

                {savedWeight !== null && (
                    <div className='weight-saved-display'>
                        <span>현재 저장된 체중</span>
                        <strong>{savedWeight} kg</strong>
                    </div>
                )}
            </div>

            <div className='weight-memo'>
            <div className='memo-title'>한 줄 메모</div>
            <div className='memo-input-wrapper'>
                <input
                    type='text'
                    className='memo-input'
                    placeholder='오늘의 느낌이나 특이사항을 남겨보세요'
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    maxLength={50}
                />
                <button type='button' className='submit-btn' onClick={handleSubmit}>
                    저장
                </button>
            </div>

            {savedMemo && (
                <div className='memo-saved-display'>
                    <span>저장된 메모</span>
                    <p>{savedMemo}</p>
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