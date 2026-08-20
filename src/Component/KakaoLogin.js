import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { loginAction } from '../store/userSlice';

function KakaoLogin() {
    const { num } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();

    useEffect(() => {
        if (!num) {
            alert('잘못된 접근입니다.');
            navigate('/login');
            return;
        }

        axios
            .get('http://localhost:8070/member/getMemberByNum', {
                params: { num: Number(num) },
            })
            .then((res) => {
                const member = res.data.loginUser;

                if (!member) {
                    alert('회원 정보를 찾을 수 없습니다.');
                    navigate('/login');
                    return;
                }

                // 가입 중간에 이탈한 회원 → 추가정보 입력으로
                if (!member.gender) {
                    navigate(`/savekakaoinfo/${member.num}`);
                    return;
                }

                cookies.set('user', JSON.stringify(member), { path: '/' });
                dispatch(loginAction(member));
                alert(`${member.name}님, 환영합니다!`);
                navigate('/');
            })
            .catch((err) => {
                console.error(err);
                alert('서버 연결에 실패했습니다.');
                navigate('/login');
            });
    }, [num]);

    return null;
}

export default KakaoLogin;