// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import "../css/AdminToss.css";
import { tosspaymentsApi } from "../api/api.js";
import AdminSidebar from "./AdminSidebar.jsx";
import { useNavigate } from "react-router-dom";

function AdminToss() {
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(15);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [errorPayments, setErrorPayments] = useState(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();

    // 기본 날짜를 설정하는 함수
    const getDefaultDates = () => {
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);

        const formatDate = (date) => date.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식 반환
        return {
            defaultStartDate: formatDate(lastMonth),
            defaultEndDate: formatDate(today),
        };
    };

    useEffect(() => {
        const { defaultStartDate, defaultEndDate } = getDefaultDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);

        // 초기 결제 데이터 로딩
        fetchPayments(0, 15, defaultStartDate, defaultEndDate);
    }, []);

    // 결제 데이터를 가져오는 함수
    const fetchPayments = async (currentPage = 0, pageSize = 15, start = startDate, end = endDate) => {
        if (!start || !end) {
            setErrorPayments("시작 날짜와 끝 날짜를 설정해 주세요.");
            return;
        }
        if (new Date(start) > new Date(end)) {
            setErrorPayments("시작 날짜는 끝 날짜보다 앞서야 합니다.");
            return;
        }

        setLoadingPayments(true);
        setErrorPayments(null);

        try {
            const response = await tosspaymentsApi.get("/between", {
                params: { start, end, page: currentPage, size: pageSize },
            });

            setPayments(response.data.content);
            setPage(currentPage);
            setSize(pageSize);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
            setErrorPayments("결제 데이터를 가져오는 데 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoadingPayments(false);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchPayments(newPage, size, startDate, endDate);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/admin/toss/mypayments?userId=${userId}`);
    };

    return (
        <div className="layout">
            <AdminSidebar className="sidebar" />
            <div className="content">
                <div className="admin-toss-card full-width-card">
                    <h1 className="admin-toss-title">결제 내역 조회</h1>
                    <div className="date-inputs">
                        <label className="label-margin">
                            시작 날짜:{" "}
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </label>
                        <label className="label-margin">
                            끝 날짜:{" "}
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </label>
                        <button
                            className="pagination-button"
                            onClick={() => fetchPayments(0, size, startDate, endDate)}
                        >
                            조회하기
                        </button>
                    </div>

                    {loadingPayments && <p>결제 데이터를 불러오는 중입니다...</p>}
                    {errorPayments && <p className="admin-toss-error">{errorPayments}</p>}

                    {!loadingPayments && !errorPayments && (
                        <>
                            <table className="admin-toss-table">
                                <thead>
                                <tr>
                                    <th>순번</th>
                                    <th>사용자 ID</th>
                                    <th>주문 ID</th>
                                    <th>결제 키</th>
                                    <th>요청 시간</th>
                                    <th>결제 방법</th>
                                    <th>금액</th>
                                    <th>결제 여부</th>
                                </tr>
                                </thead>
                                <tbody>
                                {payments.map((payment, index) => (
                                    <tr key={payment.id}>
                                        <td>{page * size + index + 1}</td>
                                        <td
                                            onClick={() => handleUserClick(payment.userId)}
                                            style={{
                                                cursor: "pointer",
                                                color: "blue",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            {payment.userId}
                                        </td>
                                        <td>{payment.orderId}</td>
                                        <td>{payment.paymentKey}</td>
                                        <td>{new Date(payment.requestedAt).toLocaleString()}</td>
                                        <td>{payment.method}</td>
                                        <td>{payment.amount.toLocaleString()} 원</td>
                                        <td>{payment.isCanceled ? "취소됨" : "완료"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className="pagination-button"
                                >
                                    이전
                                </button>
                                <span className="pagination-info">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page + 1 === totalPages}
                                    className="pagination-button"
                                >
                                    다음
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminToss;
