import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/api.js';
import '../css/AdminSignIn.css'; // 스타일 파일 추가

function AdminSignIn() {
    const [adminCode, setAdminCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const navigate = useNavigate();

    const handleSignUp = async () => {
        await usersApi.post(`/admin/super/signup`,{
            adminCode: "cch5565",
            password: "password123!",
            name: "CCH",
            role: "SUPER_ADMIN"
        })
    }

    const handleAdminLogin = () => {
        if (!adminCode || !password) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }
        console.log(adminCode);
        console.log(password);
        setIsLoading(true); // 로딩 시작
        usersApi
            .post('/admin/login', { adminCode, password })
            .then((response) => {
                if (response.status === 200) {
                    const { accessToken, refreshToken } = response.data;

                    localStorage.setItem('adminAccessToken', accessToken.token);
                    localStorage.setItem('adminRefreshToken', refreshToken.token);

                    alert('관리자 로그인 성공!');
                    navigate('/admin/main');
                }
            })
            .catch((error) => {
                console.error('관리자 로그인 실패:', error);
                alert(error.response?.data?.message || '로그인에 실패했습니다.');
            })
            .finally(() => {
                setIsLoading(false); // 로딩 종료
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAdminLogin();
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-box">
                <h2>관리자 로그인</h2>
                <div className="input-container">
                    <label>아이디</label>
                    <input
                        type="text"
                        placeholder="아이디를 입력하세요"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="input-container">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button className="login-button" onClick={handleAdminLogin} disabled={isLoading}>
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>
                <button className="login-button" onClick={handleSignUp} disabled={isLoading}>
                    {isLoading ? '회원가입 중...' : '회원가입'}
                </button>
            </div>
        </div>
    );
}

export default AdminSignIn;