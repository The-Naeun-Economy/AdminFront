// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../api/api.js"; // API 인스턴스 가져오기
import { logoutHandler } from "./logoutHandler.jsx"; // 공통 로그아웃 함수

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [tokenRemainingTime, setTokenRemainingTime] = useState(null);

    const sidebarStyle = {
        width: "250px",
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "200vh",
    };

    const buttonStyle = {
        margin: "10px 0",
        padding: "10px 15px",
        width: "100%",
        fontSize: "16px",
        color: "white",
        backgroundColor: "#34495e",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        textAlign: "center",
    };

    const tokenTimeStyle = {
        marginTop: "20px",
        fontSize: "14px",
        color: "#fff",
        backgroundColor: "#34495e",
        padding: "10px",
        borderRadius: "5px",
        textAlign: "center",
        width: "100%",
    };

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error("JWT 디코딩 실패:", err);
            return null;
        }
    };

    const formatRemainingTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs]
            .map((unit) => (unit < 10 ? `0${unit}` : unit))
            .join(":");
    };

    const updateTokenRemainingTime = () => {
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (!adminAccessToken) {
            setTokenRemainingTime(null);
            return;
        }

        const decodedToken = decodeJWT(adminAccessToken);
        if (decodedToken?.exp) {
            const now = Math.floor(Date.now() / 1000);
            const remainingTime = decodedToken.exp - now;
            setTokenRemainingTime(Math.max(remainingTime, 0));
        }
    };

    const extendToken = async () => {
        const adminRefreshToken = localStorage.getItem("adminRefreshToken");
        if (!adminRefreshToken) {
            alert("로그인이 필요합니다.");
            navigate("/");
            return;
        }

        try {
            const response = await usersApi.post("/admin/refresh-token", null, {
                headers: { Authorization: `Bearer ${adminRefreshToken}` },
            });

            const accessToken = response.data.accessToken?.token;
            const refreshToken = response.data.refreshToken?.token;

            if (accessToken && refreshToken) {
                localStorage.setItem("adminAccessToken", accessToken);
                localStorage.setItem("adminRefreshToken", refreshToken);

                alert("토큰이 성공적으로 연장되었습니다!");
                updateTokenRemainingTime();
            } else {
                throw new Error("토큰 정보가 응답에 없습니다.");
            }
        } catch (err) {
            console.error("토큰 연장 실패:", err.response?.data || err.message);
            alert("토큰 연장에 실패했습니다. 다시 로그인해주세요.");
            logoutHandler(navigate, "로그인 만료로 로그아웃되었습니다.");
        }
    };

    useEffect(() => {
        updateTokenRemainingTime();
        const interval = setInterval(() => {
            updateTokenRemainingTime();

            // 만료 시 로그아웃 처리
            if (tokenRemainingTime === 0) {
                logoutHandler(navigate, "토큰이 만료되어 로그아웃되었습니다.");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [tokenRemainingTime, navigate]);

    return (
        <div style={sidebarStyle}>
            <h2 style={{marginBottom: "20px", fontSize: "18px", fontWeight: "bold", color: "white"}}>관리자 메뉴</h2>
            <button style={buttonStyle} onClick={() => navigate("/admin/super")}>
                슈퍼 관리자 페이지
            </button>
            <button style={buttonStyle} onClick={() => navigate("/admin/main")}>
                유저 통계
            </button>
            <button style={buttonStyle} onClick={() => navigate("/admin/user")}>
                유저 관리
            </button>
            <button style={buttonStyle} onClick={() => navigate("/admin/toss")}>
                토스 페이
            </button>
            <button style={buttonStyle} onClick={extendToken}>
                토큰 연장
            </button>
            <button style={buttonStyle} onClick={() => logoutHandler(navigate, "관리자 로그아웃 완료")}>
                로그아웃
            </button>
            {tokenRemainingTime !== null && (
                <div style={tokenTimeStyle}>
                    남은 토큰 시간: {formatRemainingTime(tokenRemainingTime)}
                </div>
            )}
        </div>
    );
};

export default AdminSidebar;