// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/AdminToss.css";
import { tosspaymentsApi, usersApi } from "../api/api.js"; // usersApi 추가
import AdminSidebar from "./AdminSidebar.jsx";

function AdminTossMyPayments() {
    const [payments, setPayments] = useState([]); // 결제 데이터
    const [page, setPage] = useState(0); // 현재 페이지
    const [size, setSize] = useState(10); // 페이지당 아이템 수
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 메시지
    const [apiToken, setApiToken] = useState(""); // 사용자 API 토큰
    const location = useLocation();

    // URL에서 userId 가져오기
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");

    // 사용자 정보와 토큰 가져오기
    const fetchUserToken = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const adminAccessToken = localStorage.getItem("adminAccessToken");
            if (!adminAccessToken) {
                alert("관리자 로그인이 필요합니다.");
                return;
            }

            const response = await usersApi.get(`/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${adminAccessToken}` },
            });
            setApiToken(response.data.token); // 사용자 토큰 저장
        } catch (err) {
            setError(err.response?.data?.message || "유저 정보를 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 사용자 결제 데이터 가져오기 함수
    const fetchUserPayments = async (currentPage = 0, pageSize = 10) => {
        if (!apiToken) {
            setError("유효한 사용자 토큰이 없습니다.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await tosspaymentsApi.get(`/mypayments`, {
                headers: { Authorization: `Bearer ${apiToken}` },
                params: { page: currentPage, size: pageSize },
            });

            setPayments(response.data.content); // 페이징된 데이터의 content 저장
            setPage(currentPage);
            setSize(pageSize);
            setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
        } catch (err) {
            setError(err.response?.data?.message || "결제 데이터를 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        if (userId) {
            fetchUserToken(userId);
        }
    }, [userId]);

    // 사용자 토큰이 설정되면 결제 데이터 요청
    useEffect(() => {
        if (apiToken) {
            fetchUserPayments();
        }
    }, [apiToken]);

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchUserPayments(newPage, size);
        }
    };

    return (
        <div className="layout">
            <AdminSidebar className="sidebar" />

            <div className="content">
                <div className="admin-toss-card full-width-card">
                    <h1 className="admin-toss-title">사용자 {userId}의 결제 내역</h1>
                    {loading && <p className="admin-toss-loading">결제 데이터를 불러오는 중입니다...</p>}
                    {error && <p className="admin-toss-error">{error}</p>}

                    {!loading && !error && payments.length > 0 && (
                        <table className="admin-toss-table">
                            <thead>
                            <tr>
                                <th>결제 ID</th>
                                <th>주문 ID</th>
                                <th>결제 키</th>
                                <th>요청 시간</th>
                                <th>결제 방법</th>
                                <th>금액</th>
                                <th>결제 여부</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
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
                    )}

                    {!loading && !error && payments.length === 0 && (
                        <p className="admin-toss-no-data">결제 내역이 없습니다.</p>
                    )}

                    {/* 페이지네이션 */}
                    {!loading && !error && totalPages > 1 && (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminTossMyPayments;
