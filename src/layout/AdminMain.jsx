// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import PropTypes from "prop-types"; // PropTypes 가져오기
import AdminSidebar from "./AdminSidebar.jsx";
import {Bar, Pie} from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import "../css/AdminMain.css";
import {usersApi} from "../api/api.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsOverview = ({totalUsers, isLoading}) => (
    <div className="stats-overview">
        <h2>총 유저 수</h2>
        {isLoading ? <p>로딩 중...</p> : <p>{totalUsers ? `총 ${totalUsers}명` : "데이터가 없습니다."}</p>}
    </div>
);

StatsOverview.propTypes = {
    totalUsers: PropTypes.number,
    isLoading: PropTypes.bool,
};

const GenderStats = ({genderData, isLoading}) => {
    const pieChartData = genderData && (() => {
        const total = genderData.reduce((sum, [, count]) => sum + count, 0);
        return {
            labels: genderData.map(([gender, count]) => `${gender === "MALE" ? "남성" : "여성"} (${((count / total) * 100).toFixed(1)}%)`),
            datasets: [{
                data: genderData.map(([, count]) => count),
                backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
                borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
            }],
        };
    })();

    return (
        <div className="gender-stats">
            <h2 className="gender-title">성별 유저 비율</h2>
            {isLoading ? (
                <p>로딩 중...</p>
            ) : genderData ? (
                <div className="gender-chart-wrapper">
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "bottom",
                                },
                            },
                        }}
                    />
                </div>
            ) : (
                <p>데이터가 없습니다.</p>
            )}
        </div>
    );
};

GenderStats.propTypes = {
    genderData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))).isRequired,
    isLoading: PropTypes.bool,
};

const BillingStats = ({billingData, isLoading}) => {
    const pieChartData = billingData && (() => {
        const total = billingData.reduce((sum, [, count]) => sum + count, 0);
        return {
            labels: billingData.map(([status, count]) => `${status ? "유료 회원" : "무료 회원"} (${((count / total) * 100).toFixed(1)}%)`),
            datasets: [{
                data: billingData.map(([, count]) => count),
                backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
                borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
            }],
        };
    })();

    return (
        <div className="billing-stats">
            <h2 className="billing-title">결제 유저 비율</h2>
            {isLoading ? (
                <p>로딩 중...</p>
            ) : billingData ? (
                <div className="billing-chart-wrapper">
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "bottom",
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}명`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            ) : (
                <p>데이터가 없습니다.</p>
            )}
        </div>
    );
};

BillingStats.propTypes = {
    billingData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.number]))).isRequired,
    isLoading: PropTypes.bool,
};

function AdminMain() {
    const navigate = useNavigate();

    const [state, setState] = useState({
        totalUsers: null,
        availableYears: [],
        monthlyData: [],
        selectedYear: new Date().getFullYear().toString(),
        isLoading: false,
        error: null,
        genderData: null,
        billingData: null,
    });

    const updateState = (updates) => setState((prevState) => ({...prevState, ...updates}));

    const apiCall = async (url, token, errorMessage) => {
        try {
            const response = await usersApi.get(url, {
                headers: {Authorization: `Bearer ${token}`},
            });
            return response.data;
        } catch (err) {
            console.error(errorMessage, err);
            throw new Error(errorMessage);
        }
    };

    const initializePage = async (token) => {
        try {
            updateState({isLoading: true});
            const [totalUsersData, yearsData, monthlyDataForYear, genderData, billingData] = await Promise.all([
                apiCall("/admin/users/count", token, "총 유저 수를 가져오는 데 실패했습니다."),
                apiCall("/admin/users/month", token, "연도 데이터를 가져오는 데 실패했습니다."),
                fetchMonthlyData(token, state.selectedYear),
                apiCall("/admin/users/gender/count", token, "성별 데이터를 가져오는 데 실패했습니다."),
                apiCall("/admin/users/billing/count", token, "청구 데이터를 가져오는 데 실패했습니다."),
            ]);

            updateState({
                totalUsers: totalUsersData.totalCount,
                availableYears: Object.keys(yearsData)
                    .map((key) => key.split("-")[0])
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .sort(),
                monthlyData: monthlyDataForYear,
                genderData,
                billingData,
                isLoading: false,
            });
        } catch (err) {
            updateState({error: err.message, isLoading: false});
        }
    };

    const fetchMonthlyData = async (token, year) => {
        const monthlyDataResponse = await apiCall("/admin/users/month", token, "월별 데이터를 가져오는 데 실패했습니다.");
        return Array.from({length: 12}, (_, i) => {
            const month = String(i + 1).padStart(2, "0");
            return monthlyDataResponse[`${year}-${month}`] || 0;
        });
    };

    useEffect(() => {
        const adminAccessToken = localStorage.getItem("adminAccessToken");
        if (!adminAccessToken) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/admin");
        } else {
            initializePage(adminAccessToken);
        }
    }, []);

    const barChartData = {
        labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
        datasets: [
            {
                label: `${state.selectedYear} 월별 유저 가입 수`,
                data: state.monthlyData,
                backgroundColor: "rgb(132,186,241)",
                hoverBackgroundColor:"rgb(114,160,207)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="layout">
            <AdminSidebar className="sidebar"/>
            <div className="content">
                {state.error && <p className="error-message">{state.error}</p>}
                <StatsOverview totalUsers={state.totalUsers} isLoading={state.isLoading}/>
                <div className="yearly-stats">
                    <h2>연도별 유저 통계</h2>
                    <div className="year-buttons">
                        {state.availableYears.map((year) => (
                            <button
                                key={year}
                                className={`button ${state.selectedYear === year ? "active" : ""}`}
                                onClick={async () => {
                                    const token = localStorage.getItem("adminAccessToken");
                                    const monthlyData = await fetchMonthlyData(token, year);
                                    updateState({selectedYear: year, monthlyData});
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="monthly-stats">
                    <h2>{state.selectedYear} 월별 유저 가입 수</h2>
                    <Bar data={barChartData}/>
                </div>
                <div className="stats-row">
                    <GenderStats genderData={state.genderData} isLoading={state.isLoading}/>
                    <BillingStats billingData={state.billingData} isLoading={state.isLoading}/>
                </div>
            </div>
        </div>
    );
}

export default AdminMain;