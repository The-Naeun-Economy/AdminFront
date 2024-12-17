import './App.css';
import { Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import AdminMain from "./layout/AdminMain.jsx";
import AdminSuper from "./layout/AdminSuper.jsx";
import AdminUser from "./layout/AdminUser.jsx";
import AdminSignIn from "./layout/AdminSignIn.jsx";
import AdminCommunityPosts from "./layout/AdminCommunityPosts.jsx";
import AdminToss from "./layout/AdminToss.jsx";
import AdminTossMyPayMents from "./layout/AdminTossMyPayMents.jsx";
import AdminUserState from "./layout/AdminUserState.jsx";
import AdminSuggestions from "./layout/AdminSuggestions.jsx";
import NoExistUrl from "./layout/NoExistUrl.jsx";


function App() {
    return (
        <RecoilRoot>
            <Routes>
                {/* 명시된 라우트 */}
                <Route path="/admin" element={<AdminSignIn />} />
                <Route path="/admin/super" element={<AdminSuper />} />
                <Route path="/admin/main" element={<AdminMain />} />
                <Route path="/admin/user/state" element={<AdminUserState />} />
                <Route path="/admin/user" element={<AdminUser />} />
                <Route path="/admin/suggestions" element={<AdminSuggestions />} />
                <Route path="/admin/toss" element={<AdminToss />} />
                <Route path="/admin/community/posts" element={<AdminCommunityPosts />} />
                <Route path="/admin/toss/mypayments" element={<AdminTossMyPayMents />} />
                {/* 잘못된 URL 접근 시 리다이렉트 */}
                <Route path="*" element={<NoExistUrl/>} />
            </Routes>
        </RecoilRoot>
    );
}

export default App;