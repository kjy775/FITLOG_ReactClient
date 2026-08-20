import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { loginAction } from '../../store/userSlice';
import Gender from './Gender';
import Birth from './Birth';
import Birthday from './Birthday';
import Height from './Height';
import WeightLogin from './WeightLogin';
import MyInfo from './MyInfo';

export const StepContext = createContext();

// mode: 'local' → 6스텝(MyInfo까지) / 'kakao' → 5스텝(WeightLogin에서 종료)
function Join({ mode = 'local' }) {
  const TOTAL_STEPS = mode === 'kakao' ? 5 : 6;

  const [process, setProcess] = useState(1);
  const [joinData, setJoinData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { num } = useParams();   // 카카오 콜백: /savekakaoinfo/:num
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  useEffect(() => {
    if (mode === 'kakao' && !num) {
      alert('잘못된 접근입니다.');
      navigate('/login');
    }
  }, [mode, num, navigate]);

  // 카카오 추가정보 저장 (회원은 콜백에서 이미 생성됨 → update)
  const submitKakaoInfo = async (data) => {
    if (isSaving) return;
    setIsSaving(true);

    try {

      const pad = (n) => String(n).padStart(2, '0');
      const birth = `${data.birthYear}-${pad(data.month)}-${pad(data.day)}`;
      const res = await axios.post(
        'http://localhost:8070/member/kakaoinfoUpdate',
        {
          num: Number(num),
          gender: data.gender,
          birth: birth,             // 'YYYY-MM-DD'
          height: String(data.height),   // 서버 컬럼이 String
          weight: String(data.weight),
        }
      );

      if (res.data.msg === 'OK') {
        cookies.set('user', JSON.stringify(res.data.loginUser), { path: '/' });
        dispatch(loginAction(res.data.loginUser));
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = (data) => {
    const merged = data ? { ...joinData, ...data } : joinData;
    if (data) setJoinData(merged);

    // 카카오는 마지막 스텝에서 넘기지 않고 바로 저장
    if (mode === 'kakao' && process === TOTAL_STEPS) {
      submitKakaoInfo(merged);
      return;
    }

    setProcess((prev) => prev + 1);
  };

  const handlePrev = () => setProcess((prev) => prev - 1);

  return (
    <StepContext.Provider
      value={{ currentStep: process, totalSteps: TOTAL_STEPS, mode }}
    >
      {process === 1 && <Gender onNext={handleNext} />}
      {process === 2 && <Birth onNext={handleNext} onPrev={handlePrev} />}
      {process === 3 && <Birthday onNext={handleNext} onPrev={handlePrev} />}
      {process === 4 && <Height onNext={handleNext} onPrev={handlePrev} />}
      {process === 5 && (
        <WeightLogin
          onNext={handleNext}
          onPrev={handlePrev}
          isLast={mode === 'kakao'}
          isSaving={isSaving}
        />
      )}
      {process === 6 && <MyInfo joinData={joinData} onPrev={handlePrev} />}
    </StepContext.Provider>
  );
}

export default Join;