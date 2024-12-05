import './App.css';
import {Route, Routes, Navigate} from "react-router-dom";
import {RecoilRoot} from "recoil";
import AdminMain from "./layout/AdminMain.jsx";
import AdminSuper from "./layout/AdminSuper.jsx";
import AdminUser from "./layout/AdminUser.jsx";
import AdminSignIn from "./layout/AdminSignIn.jsx";

function App() {

    return (
        <RecoilRoot>
            <Routes>
                {/* 명시된 라우트 */}
                <Route path="/" element={<AdminSignIn/>}/>
                <Route path="/admin/super" element={<AdminSuper/>}/>
                <Route path="/admin/main" element={<AdminMain/>}/>
                <Route path="/admin/user" element={<AdminUser/>}/>

                {/* 잘못된 URL 접근 시 리다이렉트 */}
                <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
        </RecoilRoot>
    );
}

export default App;