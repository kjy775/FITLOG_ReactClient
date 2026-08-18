import React, { useState, useContext } from 'react';
import { StepContext } from './Join';
import '../../style/Join/Birthday.css';

function Birthday({
    initialMonth = 1,
    initialDay = 1,
    onNext,
    onPrev
}) {
    const { currentStep, totalSteps } = useContext(StepContext)
    const [month, setMonth] = useState(initialMonth);
    const [day, setDay] = useState(initialDay);

    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [isDayOpen, setIsDayOpen] = useState(false);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const getDaysInMonth = (m) => {
        if (m === 2) return 29;
        if ([4, 6, 9, 11].includes(m)) return 30;
        return 31;
    };

    const days = Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1);

    const handleSelectMonth = (m) => {
        setMonth(m);
        setIsMonthOpen(false);

        const maxDays = getDaysInMonth(m);
        if (day > maxDays) setDay(maxDays);
    };

    const handleSelectDay = (d) => {
        setDay(d);
        setIsDayOpen(false);
    };

    const handleNextClick = () => {
        if (onNext) onNext({ month, day });
    };

    return (
        <div className="birthday-container">
            <div className="birthday-header">
                <div className="birthday-back-btn" onClick={onPrev}>
                    &larr;
                </div>
                <div className="birthday-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`birthday-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="birthday-content">
                <div className="birthday-title">생일 입력</div>

                <div className="birthday-select-group">
                    <div className="birthday-select-wrapper">
                        <div className="birthday-custom-select">
                            <div
                                className={`birthday-select-trigger ${isMonthOpen ? 'open' : ''}`}
                                onClick={() => {
                                    setIsMonthOpen(!isMonthOpen);
                                    setIsDayOpen(false);
                                }}
                            >
                                <span>{month}</span>
                                <span className="arrow">▼</span>
                            </div>

                            {isMonthOpen && (
                                <div className="birthday-select-options">
                                    {months.map((m) => (
                                        <div
                                            key={m}
                                            className={`birthday-option-item ${m === month ? 'selected' : ''}`}
                                            onClick={() => handleSelectMonth(m)}
                                        >
                                            {m}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="birthday-label">월</span>
                    </div>

                    <div className="birthday-select-wrapper">
                        <div className="birthday-custom-select">
                            <div
                                className={`birthday-select-trigger ${isDayOpen ? 'open' : ''}`}
                                onClick={() => {
                                    setIsDayOpen(!isDayOpen);
                                    setIsMonthOpen(false);
                                }}
                            >
                                <span>{day}</span>
                                <span className="arrow">▼</span>
                            </div>

                            {isDayOpen && (
                                <div className="birthday-select-options">
                                    {days.map((d) => (
                                        <div
                                            key={d}
                                            className={`birthday-option-item ${d === day ? 'selected' : ''}`}
                                            onClick={() => handleSelectDay(d)}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="birthday-label">일</span>
                    </div>
                </div>
            </div>

            <div className="birthday-footer">
                <div className="birthday-next-btn" onClick={handleNextClick}>
                    다음
                </div>
            </div>
        </div>
    );
}

export default Birthday;