// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';  // useNavigate 훅 import
import '../css/NoExistUrl.css';

function NoExistUrl() {
    const navigate = useNavigate();  // useNavigate 훅을 사용하여 네비게이션 기능 활성화

    const handleGoBack = () => {
        navigate(-1);  // -1은 이전 페이지로 돌아가는 기능입니다.
    };

    return (
        <div className="no-exist-url-container">
            <h1 className="no-exist-url-message">존재하지 않는 URL입니다.</h1>
            <p className="no-exist-url-description">잘못된 접근입니다. 다시 돌아가세요.</p>
            <button onClick={handleGoBack} className="go-back-button">
                뒤로 가기
            </button>
        </div>
    );
}

export default NoExistUrl;
