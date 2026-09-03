import React, { useEffect, useState } from 'react'
import axios from 'axios';

function PaymentSuccess() {
    
    const [status, setStatus] = useState("confirming"); // confirming | success | fail

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get("paymentKey");
        const orderId = params.get("orderId");
        const amount = params.get("amount");

        async function confirmPayment() {
            try {
                const res = await axios.post("/api/confirm", {paymentKey, orderId, amount: Number(amount),})

                if (res.data.msg != "ok") {
                    throw new Error(await res.text());
                }

                setStatus("success");
            } catch (err) {
                console.error("결제 승인 실패", err);
                setStatus("fail");
            }
        }

        if (paymentKey && orderId && amount) {
            confirmPayment();
        } else {
            setStatus("fail");
        }
    }, []);

    if (status === "confirming") return <div>결제 승인 중입니다...</div>;
    if (status === "success"){
        alert("결제가 완료되었습니다 🎉")
        // 되돌아가기
        window.opener.location.href = "/";
        window.close();
    } 
    return <div>결제 승인에 실패했습니다. 다시 시도해주세요.</div>;
}

export default PaymentSuccess