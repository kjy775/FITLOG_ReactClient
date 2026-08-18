import React, { createContext, useState } from 'react';
import Gender from './Gender';
import Birth from './Birth';
import Birthday from './Birthday';
import Height from './Height';
import Weight from './Weight';
import MyInfo from './MyInfo';

export const StepContext = createContext();
const TOTAL_STEPS = 6;

function Join() {
  const [process, setProcess] = useState(1);

  const handleNext = () => setProcess((prev) => prev + 1);
  const handlePrev = () => setProcess((prev) => prev - 1);

  return (
    <StepContext.Provider value={{ currentStep: process, totalSteps: TOTAL_STEPS }}>
      {process === 1 && <Gender onNext={handleNext} />}
      {process === 2 && <Birth onNext={handleNext} onPrev={handlePrev} />}
      {process === 3 && <Birthday onNext={handleNext} onPrev={handlePrev} />}
      {process === 4 && <Height onNext={handleNext} onPrev={handlePrev} />}
      {process === 5 && <Weight onNext={handleNext} onPrev={handlePrev} />}
      {process === 6 && <MyInfo onPrev={handlePrev} />}
    </StepContext.Provider>
  );
}

export default Join;