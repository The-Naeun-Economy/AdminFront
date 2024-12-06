import axios from 'axios';

export const usersApi = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // user
    headers: {
        'Content-Type': 'application/json', // 기본 Content-Type 설정
    }
});

usersApi.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("adminAccessToken");
    const refreshToken = localStorage.getItem("adminRefreshToken");

    // 특정 URL에만 refreshToken을 사용
    if (config.url === "/admin/refresh-token" && refreshToken) {
        config.headers.Authorization = `Bearer ${refreshToken}`;
    } else if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export const postsApi = axios.create({
    baseURL: 'http://localhost:9000/api/v1/posts', // spring 서버 url
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json', // 기본 Content-Type 설정
    }
});