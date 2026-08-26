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

// mode: 'local' → 일반 회원가입 / 'kakao' → 카카오 추가정보 입력
// 두 모드 모두 6스텝(MyInfo까지), 마지막 저장 방식만 다름
function Join({ mode = 'local' }) {
  const TOTAL_STEPS = 6;

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

      const payload = {
        num: Number(num),
        gender: data.gender,
        birth: birth,                  // 'YYYY-MM-DD'
        height: String(data.height),   // 서버 컬럼이 String
        weight: String(data.weight),
        name: data.name,               // MyInfo 닉네임
        phone: data.phone,             // MyInfo 핸드폰
      };

      // 사진을 새로 올렸을 때만 전송 (안 올렸으면 카카오 프로필 사진 유지)
      if (data.profileImg) payload.profileImg = data.profileImg;

      const res = await axios.post('/api/member/kakaoinfoUpdate', payload);

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
    setProcess((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (process === 1) return navigate('/login');
    setProcess((prev) => prev - 1);
  };

  return (
    <StepContext.Provider
      value={{ currentStep: process, totalSteps: TOTAL_STEPS, mode }}
    >
      {process === 1 && <Gender onNext={handleNext} onPrev={handlePrev} />}
      {process === 2 && <Birth onNext={handleNext} onPrev={handlePrev} />}
      {process === 3 && <Birthday onNext={handleNext} onPrev={handlePrev} />}
      {process === 4 && <Height onNext={handleNext} onPrev={handlePrev} />}
      {process === 5 && <WeightLogin onNext={handleNext} onPrev={handlePrev} />}
      {process === 6 && (
        <MyInfo
          joinData={joinData}
          onPrev={handlePrev}
          mode={mode}
          onSubmit={submitKakaoInfo}
          isSaving={isSaving}
        />
      )}
    </StepContext.Provider>
  );
}

export default Join;