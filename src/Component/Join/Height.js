import React, { useState, useContext } from 'react';
import { StepContext } from './Join';
import '../../style/Join/Height.css';

function Height({ onNext, onPrev }) {
    const { currentStep, totalSteps } = useContext(StepContext);

    const [height, setHeight] = useState(170);
    const MIN_HEIGHT = 100;
    const MAX_HEIGHT = 220;

    const heights = Array.from(
        { length: MAX_HEIGHT - MIN_HEIGHT + 1 },
        (_, i) => MIN_HEIGHT + i
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setHeight('');
            return;
        }
        const num = Number(value);
        if (!isNaN(num)) setHeight(num);
    };

    const handleSelectHeight = (h) => {
        setHeight(h);
    };

    const handleNextClick = () => {
        if (onNext) onNext({ height });
    };

    return (
        <div className="height-container">
            <div className="height-header">
                <div className="height-back-btn" onClick={onPrev}>
                    &larr;
                </div>
                <div className="height-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`height-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="height-content">
                <div className="height-title">키 입력</div>

                <div className="height-input-wrapper">
                    <input
                        type="number"
                        className="height-input"
                        value={height}
                        onChange={handleInputChange}
                    />
                    <span className="height-unit">cm</span>
                </div>

                <div className="height-list">
                    {heights.map((h) => (
                        <div
                            key={h}
                            className={`height-list-item ${h === height ? 'selected' : ''}`}
                            onClick={() => handleSelectHeight(h)}
                        >
                            {h}
                        </div>
                    ))}
                </div>
            </div>

            <div className="height-next-btn" onClick={handleNextClick}>
                다음
            </div>
        </div>
    );
}

export default Height;