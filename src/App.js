import { Routes, Route, useLocation } from 'react-router-dom';
import Join from './Component/Join/Join';
import Login from './Component/Login';
import Exercise from './Component/Exercise';
import Head from './Component/Head';
import Foot from './Component/Foot';
import Meal from './Component/Meal';
import './App.css';

const HIDE_HEADER_FOOTER_PATHS = ['/login', '/join'];
const NO_BACKGROUND_PATHS = ['/login', '/join'];

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
                    <Route path="/join" element={<Join />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/exercise" element={<Exercise />} />
                    <Route path="/Meal" element={<Meal />} />
                </Routes>
            </div>
            {!shouldHideHeaderFooter && <Foot />}
        </div>
    );
}

export default App;