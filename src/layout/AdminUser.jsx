// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import { usersApi } from "../api/api.js";
import "../css/AdminUser.css";

function AdminUser() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [highlightedUser, setHighlightedUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch users on mount or when page changes
    useEffect(() => {
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (!adminAccessToken) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/admin");
        } else {
            fetchUsers(adminAccessToken, page);
        }
    }, [navigate, page]);

    const fetchUsers = async (token, page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.get("/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size: 20 },
            });
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || "유저 데이터를 가져오는 데 실패했습니다.");
            console.error("유저 데이터 가져오기 에러:", err.response || err.message);
        } finally {
            setLoading(false);
        }
    };

    const searchUserByEmail = async () => {
        if (!searchEmail.trim()) {
            setError("이메일을 입력하세요.");
            return;
        }

        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (!adminAccessToken) {
            alert("관리자 인증이 필요합니다.");
            navigate("/");
            return;
        }

        setIsSearching(true);
        setError(null);
        try {
            const response = await usersApi.post(
                "/admin/users/email",
                { email: searchEmail },
                { headers: { Authorization: `Bearer ${adminAccessToken}` } }
            );
            setUsers([response.data]);
            setTotalPages(1);
            setPage(0);
            setHighlightedUser(response.data.id);
        } catch (err) {
            setError(err.response?.data?.message || "이메일 검색에 실패했습니다.");
            console.error("이메일 검색 에러:", err.response || err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const resetSearch = () => {
        setSearchEmail("");
        setHighlightedUser(null);
        setError(null);
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (adminAccessToken) {
            fetchUsers(adminAccessToken, page);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            setHighlightedUser(null);
            setError(null);
        }
    };

    const toggleUserStatus = async (userId, isActive) => {
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (!adminAccessToken) {
            alert("관리자 인증이 필요합니다.");
            navigate("/");
            return;
        }

        setError(null);
        try {
            const endpoint = isActive
                ? `/admin/users/deactivate/${userId}`
                : `/admin/users/activate/${userId}`;
            await usersApi.put(endpoint, null, {
                headers: { Authorization: `Bearer ${adminAccessToken}` },
            });
            alert(`유저가 성공적으로 ${isActive ? "비활성화" : "활성화"}되었습니다.`);
            resetSearch();
        } catch (err) {
            setError(err.response?.data?.message || "상태 변경 실패. 다시 시도해주세요.");
            console.error("유저 상태 변경 에러:", err.response || err.message);
        }
    };

    const goToCommunityPage = () => {
        if (selectedUser) {
            navigate(`/admin/community/posts?userId=${selectedUser.id}`);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                {error && <p className="error-message">{error}</p>}

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="이메일로 검색"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isSearching && searchUserByEmail()}
                    />
                    <button
                        className="search-button"
                        onClick={searchUserByEmail}
                        disabled={isSearching}
                    >
                        {isSearching ? "검색 중..." : "검색"}
                    </button>
                    <button className="reset-button" onClick={resetSearch} disabled={loading}>
                        전체 보기
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>데이터를 불러오는 중...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            {users.length > 0 ? (
                                <table className="custom-table">
                                    <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>닉네임</th>
                                        <th>성별</th>
                                        <th>이메일</th>
                                        <th>가입일</th>
                                        <th>상태</th>
                                        <th>버튼</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={
                                                highlightedUser === user.id ? "highlighted-row" : ""
                                            }
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <td>{user.name}</td>
                                            <td>{user.nickname}</td>
                                            <td>{user.gender === "FEMALE" ? "여성" : "남성"}</td>
                                            <td>{user.email}</td>
                                            <td>{new Date(user.createDate).toLocaleDateString()}</td>
                                            <td>
                                                    <span
                                                        className={`status-badge ${
                                                            user.deleteDate ? "inactive" : "active"
                                                        }`}
                                                    >
                                                        {user.deleteDate ? "비활성화" : "활성화"}
                                                    </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`toggle-status-button ${
                                                        user.deleteDate ? "activate" : "deactivate"
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleUserStatus(user.id, !user.deleteDate);
                                                    }}
                                                >
                                                    {user.deleteDate ? "활성화" : "비활성화"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-results">검색 결과가 없습니다.</p>
                            )}
                        </div>

                        <div className="pagination">
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                            >
                                이전
                            </button>
                            <span className="pagination-info">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page + 1 >= totalPages}
                            >
                                다음
                            </button>
                        </div>
                    </>
                )}

                {selectedUser && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>유저 상세 정보</h2>
                            <button className="close-button" onClick={closeModal}>
                                닫기
                            </button>
                            <div className="user-details">
                                <p><strong>이름:</strong> {selectedUser.name}</p>
                                <p><strong>닉네임:</strong> {selectedUser.nickname}</p>
                                <p><strong>성별:</strong> {selectedUser.gender === "FEMALE" ? "여성" : "남성"}</p>
                                <p><strong>이메일:</strong> {selectedUser.email}</p>
                                <p><strong>가입일:</strong> {new Date(selectedUser.createDate).toLocaleDateString()}</p>
                                <p>
                                    <strong>상태:</strong>{" "}
                                    {selectedUser.deleteDate ? "비활성화" : "활성화"}
                                </p>
                                <button className="manage-posts-button" onClick={goToCommunityPage}>
                                    게시글 관리
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUser;