import React, { useState, useContext } from 'react';
import { StepContext } from './Join';
import '../../style/Join/Birth.css';

function Birth({ onNext, onPrev }) {
    const { currentStep, totalSteps } = useContext(StepContext);
    const [birthYear, setBirthYear] = useState(2000);
    const [isOpen, setIsOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 1950 + 1 },
        (_, i) => currentYear - i
    );

    const handleSelectYear = (year) => {
        setBirthYear(year);
        setIsOpen(false);
    };
    const handleNextClick = () => {
        if (onNext) onNext();
    };

    return (
        <div className="birth-container">
            <div className="birth-header">
                <div className="birth-back-btn" onClick={onPrev}>
                    &larr;
                </div>
                <div className="birth-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`birth-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="birth-content">
                <div className="birth-title">출생연도</div>

                <div className="birth-select-wrapper">
                    <div className="birth-custom-select">
                        <div
                            className={`birth-select-trigger ${isOpen ? 'open' : ''}`}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <span>{birthYear}</span>
                            <span className="arrow">▼</span>
                        </div>

                        {isOpen && (
                            <div className="birth-select-options">
                                {years.map((year) => (
                                    <div
                                        key={year}
                                        className={`birth-option-item ${year === birthYear ? 'selected' : ''}`}
                                        onClick={() => handleSelectYear(year)}
                                    >
                                        {year}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="birth-year-label">년</span>
                </div>
            </div>

            <div className="birth-footer">
                <div className="birth-next-btn" onClick={handleNextClick}>
                    다음
                </div>
            </div>
        </div>
    );
}

export default Birth;   