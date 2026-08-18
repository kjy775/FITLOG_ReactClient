import React,{ useState } from 'react';
import '../style/main.css';
import { useNavigate  } from 'react-router-dom';
import '../style/weight.css';

function Weight() {

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

    

    
  return (
    
    <div className='kg-container'>
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
            
        </div>
        <div className='weight-memo'>

        </div>
        <div className='weight-graph'>
            
        </div>


        
    </div>
  )
}

export default Weight