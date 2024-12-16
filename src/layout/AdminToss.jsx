// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import "../css/AdminToss.css";
import { tosspaymentsApi } from "../api/api.js";
import AdminSidebar from "./AdminSidebar.jsx";
import { useNavigate } from "react-router-dom"; // useNavigate 사용

function AdminToss() {
    const [payments, setPayments] = useState([]); // 결제 데이터
    const [page, setPage] = useState(0); // 현재 페이지
    const [size, setSize] = useState(20); // 페이지당 아이템 수
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 메시지
    const navigate = useNavigate(); // useNavigate 훅

    // 결제 데이터 가져오기 함수
    const fetchPayments = async (currentPage = 0, pageSize = 20) => {
        setLoading(true);
        setError(null);

        try {
            const response = await tosspaymentsApi.get("", {
                params: {
                    page: currentPage,
                    size: pageSize,
                },
            });

            setPayments(response.data.content); // 페이징된 데이터의 content
            setPage(currentPage);
            setSize(pageSize);
            setTotalPages(response.data.totalPages); // 전체 페이지 수
        } catch (err) {
            console.error(err);
            setError("결제 데이터를 가져오는 데 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchPayments();
    }, []);

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchPayments(newPage, size);
        }
    };

    // 사용자 ID 클릭 시 상세 결제 내역 페이지로 이동
    const handleUserClick = (userId) => {
        navigate(`/admin/toss/mypayments?userId=${userId}`);
    };

    return (
        <div className="layout">
            <AdminSidebar className="sidebar" />

            <div className="content">
                <div className="admin-toss-card full-width-card">
                    <h1 className="admin-toss-title">결제 내역</h1>
                    {loading && <p className="admin-toss-loading">결제 데이터를 불러오는 중입니다...</p>}
                    {error && <p className="admin-toss-error">{error}</p>}

                    {!loading && !error && (
                        <>
                            <table className="admin-toss-table">
                                <thead>
                                <tr>
                                    <th>순번</th> {/* 순차적 번호 열 */}
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
                                        <td>{page * size + index + 1}</td> {/* 순번 계산 */}
                                        <td
                                            onClick={() => handleUserClick(payment.userId)}
                                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                                        >
                                            {payment.userId}
                                        </td>
                                        <td>{payment.orderId}</td>
                                        <td>{payment.paymentKey}</td>
                                        <td>{new Date(payment.requestedAt).toLocaleString()}</td>
                                        <td>{payment.method}</td>
                                        <td>{payment.amount}</td>
                                        <td>{payment.isCanceled ? "취소됨" : "완료"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* 페이지네이션 */}
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