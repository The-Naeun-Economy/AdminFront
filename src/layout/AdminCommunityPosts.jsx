// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usersApi, postsApi } from "../api/api.js";
import AdminSidebar from "./AdminSidebar.jsx";
import "../css/AdminCommunityPosts.css";

function AdminCommunityPosts() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");
    const [posts, setPosts] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiToken, setApiToken] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [deletingPostId, setDeletingPostId] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError("유효하지 않은 사용자 ID입니다.");
            return;
        }

        fetchUserTokenAndDetails(userId);
    }, [userId]);

    const fetchUserTokenAndDetails = async (userId) => {
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
            setUserDetails(response.data);
            setApiToken(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "유저 정보를 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (apiToken) {
            fetchUserPostsWithToken(apiToken);
        }
    }, [apiToken]);

    const fetchUserPostsWithToken = async (token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await postsApi.get(`/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data)
            setPosts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "게시글 데이터를 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId) => {
        const confirmDelete = window.confirm("이 게시글을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        setDeletingPostId(postId);
        try {
            await postsApi.delete(`/${postId}`, {
                headers: { Authorization: `Bearer ${apiToken}` },
            });

            alert("게시글이 성공적으로 삭제되었습니다.");
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (err) {
            alert(err.response?.data?.message || "게시글 삭제 중 오류가 발생했습니다.");
        } finally {
            setDeletingPostId(null);
        }
    };

    const openModal = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                {error && <p className="error-message">{error}</p>}

                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>데이터를 불러오는 중...</p>
                    </div>
                )}

                {!loading && userDetails && (
                    <div className="user-details-container">
                        <h2>게시글 관리</h2>
                    </div>
                )}

                {!loading && (
                    <div className="table-container">
                        {posts.length > 0 ? (
                            <table className="custom-table">
                                <thead>
                                <tr>
                                    <th>제목</th>
                                    <th>내용</th>
                                    <th>카테고리</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                    <th>조회수</th>
                                    <th>좋아요</th>
                                    <th>댓글 수</th>
                                    <th>버튼</th>
                                </tr>
                                </thead>
                                <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.title}</td>
                                        <td>
                                            {post.content.length > 20
                                                ? `${post.content.slice(0, 20)}...`
                                                : post.content}
                                            {post.content.length > 20 && (
                                                <button
                                                    className="view-more-button"
                                                    onClick={() => openModal(post)}
                                                >
                                                    더보기
                                                </button>
                                            )}
                                        </td>
                                        <td>{post.category}</td>
                                        <td>{post.userNickname}</td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>{post.viewCount}</td>
                                        <td>{post.likesCount}</td>
                                        <td>{post.commentsCount}</td>
                                        <td>
                                            <button
                                                className={`delete-button ${
                                                    deletingPostId === post.id ? "deleting" : ""
                                                }`}
                                                onClick={() => deletePost(post.id)}
                                                disabled={deletingPostId === post.id}
                                            >
                                                {deletingPostId === post.id ? "삭제 중..." : "삭제"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-results">게시글이 없습니다.</p>
                        )}
                    </div>
                )}

                {selectedPost && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>게시글 상세 내용</h2>
                            <p><strong>제목:</strong> {selectedPost.title}</p>
                            <p><strong>내용:</strong> {selectedPost.content}</p>
                            <p><strong>카테고리:</strong> {selectedPost.category}</p>
                            <p><strong>작성자:</strong> {selectedPost.userNickname}</p>
                            <p><strong>작성일:</strong> {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                            <button className="close-button" onClick={closeModal}>
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCommunityPosts;