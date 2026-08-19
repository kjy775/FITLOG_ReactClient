import React, { useState, useContext } from 'react';
import { StepContext } from './Join';
import '../../style/Join/WeightLogin.css';

function WeightLogin({ onNext, onPrev, isLast = false, isSaving = false }) {
    const { currentStep, totalSteps } = useContext(StepContext);

    const [weight, setWeight] = useState(50);
    const MIN_WEIGHT = 30;
    const MAX_WEIGHT = 200;

    const weights = Array.from(
        { length: MAX_WEIGHT - MIN_WEIGHT + 1 },
        (_, i) => MIN_WEIGHT + i
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setWeight('');
            return;
        }
        const num = Number(value);
        if (!isNaN(num)) setWeight(num);
    };

    const handleSelectWeight = (w) => {
        setWeight(w);
    };

    const handleNextClick = () => {
        if (isSaving) return;
        if (weight === '' || weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
            alert(`체중은 ${MIN_WEIGHT}~${MAX_WEIGHT}kg 사이로 입력해주세요.`);
            return;
        }
        if (onNext) onNext({ weight });
    };
    return (
        <div className="weight-container">
            <div className="weight-header">
                <div className="weight-back-btn" onClick={onPrev}>
                    &larr;
                </div>
                <div className="weight-dots">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`weight-dot ${index + 1 === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="weight-content">
                <div className="weight-title">체중 입력</div>

                <div className="weight-input-wrapper">
                    <input
                        type="number"
                        className="weight-input"
                        value={weight}
                        onChange={handleInputChange}
                    />
                    <span className="weight-unit">kg</span>
                </div>

                <div className="weight-list">
                    {weights.map((w) => (
                        <div
                            key={w}
                            className={`weight-list-item ${w === weight ? 'selected' : ''}`}
                            onClick={() => handleSelectWeight(w)}
                        >
                            {w}
                        </div>
                    ))}
                </div>
            </div>

            <div
                className={`weight-next-btn ${isSaving ? 'loading' : ''}`}
                onClick={handleNextClick}
            >
                {isLast ? (isSaving ? '저장 중...' : '완료') : '다음'}
            </div>
        </div>
    );
}

export default WeightLogin;