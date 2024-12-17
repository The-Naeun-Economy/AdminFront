// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import '../css/AdminUserState.css';
import { usersApi } from '../api/api.js';

function AdminSuggestions() {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = async (page = 0) => {
        setIsLoading(true);
        setError(null);

        const adminAccessToken = localStorage.getItem('adminAccessToken');
        if (!adminAccessToken) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/admin');
            return;
        }

        try {
            const response = await usersApi.get(`/admin/users/suggestions?page=${page}`, {
                headers: { Authorization: `Bearer ${adminAccessToken}` },
            });

            const data = response.data;
            setSuggestions(data.content);
            setCurrentPage(data.number);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('건의사항을 가져오는 데 실패했습니다:', err);
            setError('데이터를 가져오는 데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePrevPage = () => {
        if (currentPage > 0) {
            fetchSuggestions(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            fetchSuggestions(currentPage + 1);
        }
    };

    return (
        <div className="layout">
            <AdminSidebar className="sidebar" />
            <div className="content">
                {error && <p className="admin-toss-error">{error}</p>}

                <div className="admin-toss-card">
                    <h2 className="admin-toss-title">건의사항 목록</h2>
                    {isLoading ? (
                        <p className="admin-toss-loading">로딩 중...</p>
                    ) : suggestions.length > 0 ? (
                        <table className="admin-toss-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>이름</th>
                                <th>내용</th>
                                <th>작성 시간</th>
                            </tr>
                            </thead>
                            <tbody>
                            {suggestions.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.content}</td>
                                    <td>{new Date(new Date(item.createdAt).getTime() + 9 * 60 * 60 * 1000).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>데이터가 없습니다.</p>
                    )}

                    <div className="pagination">
                        <button className="pagination-button" onClick={handlePrevPage} disabled={currentPage === 0}>이전</button>
                        <span className="pagination-info">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button className="pagination-button" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSuggestions;