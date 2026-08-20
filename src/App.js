import { Routes, Route, useLocation } from 'react-router-dom';
import Join from './Component/Join/Join';
import Login from './Component/Login';
import Exercise from './Component/Exercise';
import Head from './Component/Head';
import Foot from './Component/Foot';
import Meal from './Component/Meal';
import Main from './Component/Main'
import Weight2 from './Component/Weight2'
import Community from './Component/Community';
import MyPage from './Component/MyPage';
import Qna from './Component/qna/Qna'
import Write from './Component/qna/Write'
import KakaoLogin from './Component/KakaoLogin';
import './App.css';

const HIDE_HEADER_FOOTER_PATHS = ['/login', '/join', '/savekakaoinfo'];

const NO_BACKGROUND_PATHS = ['/login', '/join', '/savekakaoinfo'];

function App() {
    const location = useLocation();

    const shouldHideHeaderFooter = HIDE_HEADER_FOOTER_PATHS.some((path) =>
        location.pathname.startsWith(path)
    );
    const shouldHideBackground = NO_BACKGROUND_PATHS.some((path) =>
        location.pathname.startsWith(path)
    );

    return (
        <div className={`App ${shouldHideBackground ? 'App--no-bg' : ''}`}>
            {!shouldHideHeaderFooter && <Head />}
            <div className="App-content">
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path="/join" element={<Join />} />
                    <Route path="/savekakaoinfo/:num" element={<Join mode="kakao" />} />
                    <Route path="/kakaologin/:num" element={<KakaoLogin />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/exercise" element={<Exercise />} />
                    <Route path="/weight" element={<Weight2 />} />
                    <Route path="/meal" element={<Meal />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/qna" element={<Qna />} />
                    <Route path="/write" element={<Write />} />
                </Routes>
            </div>
            {!shouldHideHeaderFooter && <Foot />}
        </div>
    );
}

export default App;