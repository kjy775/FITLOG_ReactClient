import React, { useState, useEffect, useCallback } from 'react';
import '../style/payhistory.css';
import jaxios from '../util/JWTUtil';
import { useSelector } from 'react-redux';

function PayHistory() {
    const loginUser = useSelector((state) => state.user);

    const [payList, setPayList] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
    }, []);

    // ==========================================
    // 일수 -> 상품명 변환
    // ==========================================
    const getPlanName = (days) => {
        switch (Number(days)) {
            case 30:
                return '월 정기구독';
            case 180:
                return '6개월 구독';
            case 365:
                return '년 정기구독';
            default:
                return days ? `${days}일 이용권` : '-';
        }
    };

    // ==========================================
    // 날짜 포맷
    // ==========================================
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ko-KR');
    };

    // ==========================================
    // 결제 내역 조회
    // ==========================================
    const fetchPayHistory = useCallback(async () => {
        if (!loginUser?.num) {
            setLoading(false);
            return;
        }

        const config = getAuthConfig();
        setLoading(true);

        try {
            const response = await jaxios.get(`/api/payment/getHistory/${loginUser.num}`, config);
            setPayList(response.data.list || []);
        } catch (error) {
            console.error('결제 내역 조회 실패:', error);
            setPayList([]);
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig, loginUser?.num]);

    useEffect(() => {
        fetchPayHistory();
    }, [fetchPayHistory]);

    // ==========================================
    // 렌더링
    // ==========================================
    return (
        <div className="payhistory-container">

            {/* 헤더 */}
            <div className="payhistory-header">
                <h2>결제 내역</h2>
            </div>

            {/* 리스트 */}
            <div className="payhistory-list">
                {loading ? (
                    <div className="payhistory-empty">불러오는 중...</div>
                ) : payList.length > 0 ? (
                    payList.map((item) => (
                        <div key={item.num} className="payhistory-card">

                            <div className="payhistory-card-top">
                                <span className="payhistory-plan">{getPlanName(item.days)}</span>
                                {item.price != null && (
                                    <span className="payhistory-price">
                                        {Number(item.price).toLocaleString()}원
                                    </span>
                                )}
                            </div>

                            <div className="payhistory-card-body">
                                <div className="payhistory-row">
                                    <span>결제일</span>
                                    <strong>{formatDate(item.payDate)}</strong>
                                </div>

                                <div className="payhistory-row">
                                    <span>만료일</span>
                                    <strong>{formatDate(item.expireDate)}</strong>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="payhistory-empty">결제 내역이 없습니다.</div>
                )}
            </div>

        </div>
    );
}

export default PayHistory;
