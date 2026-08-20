import React,{ useState } from 'react';
import '../style/main.css';
import { useNavigate  } from 'react-router-dom';
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
    } 
    from 'chart.js';
    import { Line } from 'react-chartjs-2';

//npm install chart.js react-chartjs-2 그래프 사용 설치필요

function Weight2() {

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

    const [weight, setWeight] = useState('');
    const [memo, setMemo] = useState('');
    

    // DB로 데이터 전송하는 함수
    const handleSubmit = async () => {
        if (!weight) {
            alert('체중을 입력해주세요!');
            return;
        }

        const payload = {
            date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
            weight: parseFloat(weight),
            memo: memo
        };

        console.log('DB로 보낼 데이터:', payload);

        try {
            // TODO: 실제 백엔드 API 주소로 수정 필요
            // const response = await fetch('/api/weight', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload),
            // });

            alert('성공적으로 저장되었습니다!');
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    

    // Chart.js 등록 (필수)
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

    // ★ 임시 일자별 체중 데이터 (추후 DB/API 연결)
    const weightData = [
        { date: '8/13', weight: 70.2 },
        { date: '8/14', weight: 69.8 },
        { date: '8/15', weight: 69.5 },
        { date: '8/16', weight: 69.9 },
        { date: '8/17', weight: 69.1 },
        { date: '8/18', weight: 68.8 },
        { date: '8/19', weight: 68.5 },
    ];

    const chartData = {
        labels: weightData.map(item => item.date), // X축: 일자
        datasets: [
            {
                label: '체중(kg)',
                data: weightData.map(item => item.weight), // Y축: 체중값
                borderColor: '#20D793', // 선 색상 (민트 포인트)
                backgroundColor: 'rgba(32, 215, 147, 0.1)', // 선 아래 채우기 색상
                borderWidth: 3,
                pointBackgroundColor: '#20D793',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3, // 곡선 정도
                fill: true, // 하단 색상 채우기
            },
        ],
    };

    // 차트 옵션 설정
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // 부모 컨테이너 크기에 맞춤
        plugins: {
            legend: {
                display: false, // 범례 숨김 (깔끔하게)
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} kg`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false, // X축 세로 격자선 제거
                },
                ticks: {
                    color: '#888888',
                    font: { size: 12 }
                }
            },
            y: {
                grid: {
                    color: '#f0f0f0', // Y축 가로 격자선 연하게
                },
                ticks: {
                    color: '#888888',
                    font: { size: 12 }
                }
            }
        }
    };
    

    
  return (
    
    <div className='weight2-container'>
         {/* 하단부분 상시고정  */}
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
        {/* 상단부분 상시고정 */ }
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
                {/* ★ 체중 저장 버튼 추가 */}
                <button type='button' className='weight-submit-btn' onClick={handleSubmit}>
                    저장
                </button>
            </div>
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
        </div>
        <div className='weight-graph'>
            <div className='graph-title'>체중 변화</div>
            <div className='chart-wrapper'>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>

    </div>
  )
}

export default Weight2