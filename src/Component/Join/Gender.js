import React, { useState, useContext } from 'react';
import { StepContext } from './Join';
import '../../style/Join/Gender.css';

function Gender({ onNext, onPrev }) {
  const { currentStep, totalSteps } = useContext(StepContext)
  const [gender, setGender] = useState('male');

  const handleNextClick = () => {
    if (onNext) onNext();
  };

  return (
    <div className="gender-container">
      {/* 상단 */}
      <div className="gender-header">
        <div className="gender-back-btn" onClick={onPrev}>
          &larr;
        </div>
        <div className="gender-dots">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`gender-dot ${index + 1 === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* 중앙 */}
      <div className="gender-content">
        <div className="gender-title">성별</div>
        <div className="gender-options">
          <div
            className={`gender-option ${gender === 'male' ? 'active' : ''}`}
            onClick={() => setGender('male')}
          >
            남성
          </div>
          <div
            className={`gender-option ${gender === 'female' ? 'active' : ''}`}
            onClick={() => setGender('female')}
          >
            여성
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="gender-footer">
        <div className="gender-next-btn" onClick={handleNextClick}>
          다음
        </div>
      </div>
    </div>
  );
}

export default Gender;