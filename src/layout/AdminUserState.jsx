// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminSidebar from './AdminSidebar.jsx';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    PointElement,
    LineElement
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import '../css/AdminUserState.css'; // 새로 정리한 CSS
import { usersApi } from '../api/api.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    PointElement,
    LineElement
);

// 오늘 로그인 수 컴포넌트
const TodayLogins = ({ todayCount, isLoading }) => (
    <div className="card">
        <h2>오늘 로그인 수</h2>
        {isLoading ? '로딩 중...' : (todayCount !== null ? `${todayCount}명` : '데이터가 없습니다.')}
    </div>
);

TodayLogins.propTypes = {
    todayCount: PropTypes.number,
    isLoading: PropTypes.bool,
};

// 주간 로그인 라인 차트 컴포넌트
const WeeklyLoginsChart = ({ weeklyData, isLoading }) => {
    const lineData = weeklyData?.map(item => ({ x: item.date, y: item.count })) || [];
    const lineChartData = {
        datasets: [
            {
                label: '최근 7일 로그인 추이',
                data: lineData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.2
            },
        ],
    };
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: { unit: 'day' },
                title: { display: true, text: '날짜' },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: '로그인 수' },
            },
        },
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const date = context.parsed.x;
                        const count = context.parsed.y;
                        return `날짜: ${new Date(date).toLocaleDateString()} - 로그인 수: ${count}`;
                    },
                },
            },
        },
    };

    return (
        <div className="card chart-card">
            <h2>주간 로그인 추이</h2>
            {isLoading ? (
                <p>로딩 중...</p>
            ) : (weeklyData && weeklyData.length > 0) ? (
                <div className="chart-container">
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
            ) : (
                <p>데이터가 없습니다.</p>
            )}
        </div>
    );
};

WeeklyLoginsChart.propTypes = {
    weeklyData: PropTypes.arrayOf(
        PropTypes.shape({
            count: PropTypes.number,
            date: PropTypes.string,
        })
    ),
    isLoading: PropTypes.bool,
};

// AdminMain 컴포넌트
function AdminUserState() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [todayLogins, setTodayLogins] = useState(null);
    const [weeklyLogins, setWeeklyLogins] = useState([]);

    const apiCall = async (url, token, errorMessage) => {
        try {
            const response = await usersApi.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            console.error(errorMessage, err);
            throw new Error(errorMessage);
        }
    };

    // 초기 데이터 불러오기: 오늘 로그인 수, 주간 로그인 수
    const initializePage = async (token) => {
        setIsLoading(true);
        try {
            const [
                todayData,
                weeklyData
            ] = await Promise.all([
                apiCall('/admin/users/activate/day/count', token, '오늘 로그인한 유저 수를 가져오는 데 실패했습니다.'),
                apiCall('/admin/users/activate/week/count', token, '주간 로그인 유저 수를 가져오는 데 실패했습니다.'),
            ]);

            setTodayLogins(todayData.count ?? null);
            setWeeklyLogins(weeklyData);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const adminAccessToken = localStorage.getItem('adminAccessToken');
        if (!adminAccessToken) {
            alert('관리자 로그인이 필요합니다.');
            navigate('/admin');
        } else {
            initializePage(adminAccessToken);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="layout">
            <AdminSidebar className="sidebar" />
            <div className="content">
                {error && <p className="error-message">{error}</p>}
                <div className="stats-container">
                    <TodayLogins todayCount={todayLogins} isLoading={isLoading} />
                </div>
                <WeeklyLoginsChart weeklyData={weeklyLogins} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default AdminUserState;
