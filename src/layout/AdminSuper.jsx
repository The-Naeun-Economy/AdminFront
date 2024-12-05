// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {redirect, useNavigate} from 'react-router-dom'; // useNavigate 추가
import AdminSidebar from './AdminSidebar.jsx';
import { usersApi } from '../api/api.js';
import '../css/AdminSuper.css';

function AdminSuper() {
    const navigate = useNavigate(); // navigate 초기화
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [isEditingAdmin, setIsEditingAdmin] = useState(false);
    const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        adminCode: '',
        password: '',
        name: '',
        role: 'ADMIN',
    });
    const [editAdmin, setEditAdmin] = useState({
        adminId: null,
        adminCode: '',
        name: '',
        role: 'ADMIN',
    });
    const [deleteAdminId, setDeleteAdminId] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [error, setError] = useState('');

    const getRoleLabel = (role) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return '슈퍼 관리자';
            case 'ADMIN':
                return '관리자';
            default:
                return '알 수 없음';
        }
    };

    // 관리자 목록 가져오기
    const fetchAdmins = async () => {
        const token = localStorage.getItem('adminAccessToken'); // 토큰 가져오기
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/');
            return;
        }

        try {
            const response = await usersApi.get('/admin/super/info', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAdmins(response.data); // 성공 시 관리자 목록 설정
        } catch (error) {
            console.error('관리자 목록 가져오기 실패:', error.response?.data || error.message);
            alert('슈퍼 관리자가 아닙니다.');
            redirect("/");
        }
    };

    // 관리자 추가 요청
    const addAdmin = async () => {
        setError('');
        if (!newAdmin.adminCode || !newAdmin.password || !newAdmin.name) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        try {
            const response = await usersApi.post('/admin/super/signup', newAdmin, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
                },
            });
            alert(`관리자 ${response.data.name}이 성공적으로 추가되었습니다!`);
            setNewAdmin({ adminCode: '', password: '', name: '', role: 'ADMIN' });
            setIsAddingAdmin(false);
            fetchAdmins(); // 관리자 목록 갱신
        } catch (error) {
            console.error('관리자 추가 실패:', error.response?.data || error.message);
            setError('관리자 추가에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 관리자 수정 요청
    const updateAdmin = async () => {
        setError('');
        const token = localStorage.getItem('adminAccessToken'); // 토큰 가져오기
        if (!token) {
            alert('인증 토큰이 없습니다. 다시 로그인하세요.');
            return;
        }

        if (!editAdmin.adminId || !editAdmin.name || !editAdmin.role) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        try {
            const response = await usersApi.put('/admin/super/update', editAdmin, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert(`관리자 ${response.data.name}이 성공적으로 수정되었습니다!`);
            setIsEditingAdmin(false);
            fetchAdmins(); // 관리자 목록 갱신
        } catch (error) {
            console.error('관리자 수정 실패:', error.response?.data || error.message);
            setError('관리자 수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 관리자 삭제 요청
    const deleteAdmin = async () => {
        const token = localStorage.getItem('adminAccessToken'); // 토큰 가져오기
        if (!token) {
            alert('인증 토큰이 없습니다. 다시 로그인하세요.');
            return;
        }

        try {
            await usersApi.delete('/admin/super/delete', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { adminId: deleteAdminId },
            });
            alert('관리자가 성공적으로 삭제되었습니다.');
            setIsDeletingAdmin(false);
            fetchAdmins(); // 관리자 목록 갱신
        } catch (error) {
            console.error('관리자 삭제 실패:', error.response?.data || error.message);
            alert('관리자 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminAccessToken');
        if (!token) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/admin/login-xXx');
        } else {
            fetchAdmins();
        }
    }, [navigate]);

    return (
        <div className="layout">
            <AdminSidebar />
            <div className="content">
                <h2>슈퍼 관리자 페이지</h2>
                <p>이곳은 슈퍼 관리자를 위한 대시보드입니다.</p>

                <div>
                    <button className="button button-primary" onClick={() => setIsAddingAdmin(true)}>
                        관리자 추가
                    </button>
                </div>

                {/* 관리자 목록 테이블 */}
                <div>
                    <h2>관리자 목록</h2>
                    {admins.length > 0 ? (
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>이름</th>
                                <th>아이디</th>
                                <th>권한</th>
                                <th>버튼</th>
                            </tr>
                            </thead>
                            <tbody>
                            {admins.map((admin, index) => (
                                <tr key={admin.id}>
                                    <td>{index + 1}</td>
                                    <td>{admin.name}</td>
                                    <td>{admin.adminCode}</td>
                                    <td>{getRoleLabel(admin.role)}</td>
                                    <td>
                                        <button
                                            className="button button-primary"
                                            onClick={() => {
                                                setEditAdmin({
                                                    adminId: admin.id,
                                                    adminCode: admin.adminCode,
                                                    name: admin.name,
                                                    role: admin.role,
                                                });
                                                setIsEditingAdmin(true);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="button button-danger"
                                            onClick={() => {
                                                setDeleteAdminId(admin.id);
                                                setIsDeletingAdmin(true);
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>관리자 데이터가 없습니다.</p>
                    )}
                </div>

                {/* 관리자 추가 모달 */}
                {isAddingAdmin && (
                    <>
                        <div className="modal-overlay" onClick={() => setIsAddingAdmin(false)} />
                        <div className="modal">
                            <h2>관리자 추가</h2>
                            {error && <p className="error-message">{error}</p>}
                            <input
                                type="text"
                                placeholder="아이디 (adminCode)"
                                value={newAdmin.adminCode}
                                onChange={(e) => setNewAdmin({ ...newAdmin, adminCode: e.target.value })}
                                className="input"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호 (Password)"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                className="input"
                            />
                            <input
                                type="text"
                                placeholder="이름 (Name)"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                className="input"
                            />
                            <select
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                className="select"
                            >
                                <option value="ADMIN">관리자</option>
                                <option value="SUPER_ADMIN">슈퍼 관리자</option>
                            </select>
                            <button className="button button-primary" onClick={addAdmin}>
                                추가
                            </button>
                            <button className="button button-danger" onClick={() => setIsAddingAdmin(false)}>
                                취소
                            </button>
                        </div>
                    </>
                )}

                {/* 관리자 수정 모달 */}
                {isEditingAdmin && (
                    <>
                        <div className="modal-overlay" onClick={() => setIsEditingAdmin(false)} />
                        <div className="modal">
                            <h2>관리자 수정</h2>
                            {error && <p className="error-message">{error}</p>}
                            <input
                                type="text"
                                placeholder="아이디 (adminCode)"
                                value={editAdmin.adminCode}
                                onChange={(e) => setEditAdmin({ ...editAdmin, adminCode: e.target.value })}
                                className="input"
                            />
                            <input
                                type="text"
                                placeholder="이름 (Name)"
                                value={editAdmin.name}
                                onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                                className="input"
                            />
                            <select
                                value={editAdmin.role}
                                onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                                className="select"
                            >
                                <option value="ADMIN">관리자</option>
                                <option value="SUPER_ADMIN">슈퍼 관리자</option>
                            </select>
                            <button className="button button-primary" onClick={updateAdmin}>
                                수정
                            </button>
                            <button className="button button-danger" onClick={() => setIsEditingAdmin(false)}>
                                취소
                            </button>
                        </div>
                    </>
                )}

                {/* 관리자 삭제 확인 모달 */}
                {isDeletingAdmin && (
                    <>
                        <div className="modal-overlay" onClick={() => setIsDeletingAdmin(false)} />
                        <div className="modal">
                            <h2>관리자 삭제</h2>
                            <p>정말로 이 관리자를 삭제하시겠습니까?</p>
                            <button className="button button-danger" onClick={deleteAdmin}>
                                삭제
                            </button>
                            <button
                                className="button button-primary"
                                onClick={() => setIsDeletingAdmin(false)}
                            >
                                취소
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminSuper;
