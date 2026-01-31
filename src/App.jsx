import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import LiveResult from './pages/LiveResult';
import VoterDashboard from './pages/VoterDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/election/:id" element={<LiveResult />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<VoterDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
