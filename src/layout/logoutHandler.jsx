export const logoutHandler = (navigate, message = "로그아웃 되었습니다.") => {
    // 토큰 삭제
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");

    // 로그아웃 메시지
    alert(message);

    // 리다이렉트
    window.location.href = "http://localhost:5173";
};
