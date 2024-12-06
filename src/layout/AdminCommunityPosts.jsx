// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {usersApi, postsApi, commentsApi} from "../api/api.js";
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
    const [comments, setComments] = useState([]); // 댓글 데이터
    const [loadingComments, setLoadingComments] = useState(false); // 댓글 로딩 상태
    const [commentError, setCommentError] = useState(null); // 댓글 조회 에러

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
            setPosts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "게시글 데이터를 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments(true);
        setCommentError(null);
        try {
            const response = await commentsApi.get(`/${postId}/comments/users/me`, {
                headers: { Authorization: `Bearer ${apiToken}` },
            });
            setComments(response.data);
        } catch (err) {
            setCommentError(err.response?.data?.message || "댓글 데이터를 가져오는 데 실패했습니다.");
        } finally {
            setLoadingComments(false);
        }
    };

    const deleteComment = async (commentId) => {
        if (!selectedPost) {
            alert("게시글 정보가 없습니다.");
            return;
        }

        const confirmDelete = window.confirm("이 댓글을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await commentsApi.delete(`/${selectedPost}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${apiToken}` },
            });

            alert("댓글이 성공적으로 삭제되었습니다.");
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
        } catch (err) {
            alert(err.response?.data?.message || "댓글 삭제 중 오류가 발생했습니다.");
        }
    };



    const deletePost = async (postId) => {
        const confirmDelete = window.confirm("이 게시글을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await postsApi.delete(`/${postId}`, {
                headers: { Authorization: `Bearer ${apiToken}` },
            });

            alert("게시글이 성공적으로 삭제되었습니다.");
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (err) {
            alert(err.response?.data?.message || "게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const openCommentsModal = (postId) => {
        fetchComments(postId);
        setSelectedPost(postId);
    };

    const closeCommentsModal = () => {
        setComments([]);
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
                                    <th>댓글 관리</th>
                                    <th>삭제</th>
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
                                        </td>
                                        <td>{post.category}</td>
                                        <td>{post.userNickname}</td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="comments-button"
                                                onClick={() => openCommentsModal(post.id)}
                                            >
                                                댓글 보기
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="delete-button"
                                                onClick={() => deletePost(post.id)}
                                            >
                                                삭제
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
                    <div className="modal-overlay" onClick={closeCommentsModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>댓글 관리</h2>
                            {loadingComments ? (
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <p>댓글을 불러오는 중...</p>
                                </div>
                            ) : commentError ? (
                                <p className="error-message">{commentError}</p>
                            ) : comments.length > 0 ? (
                                    <ul className="comments-list">
                                        {comments.map((comment) => (
                                            <li key={comment.id} className="comment-item">
                                                <p><strong>작성자:</strong> {comment.authorName}</p>
                                                <p>{comment.content}</p>
                                                <p><strong>작성일:</strong> {new Date(comment.createdAt).toLocaleString()}
                                                </p>
                                                <button
                                                    className="delete-comment-button"
                                                    onClick={() => deleteComment(comment.id)}
                                                >
                                                    삭제
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                            ) : (
                                    <p className="no-results">댓글이 없습니다.</p>
                                )}

                                <button className="close-button" onClick={closeCommentsModal}>
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
