import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const { login, loginAdmin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isAdmin) {
                await loginAdmin(email, password);
                navigate('/admin');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-brand-green">{isAdmin ? 'Admin Login' : 'Voter Login'}</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="adminCheck"
                            className="mr-2"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                        />
                        <label htmlFor="adminCheck" className="text-gray-700 select-none cursor-pointer">Login as Admin</label>
                    </div>

                    <button type="submit" className="w-full bg-brand-green text-white py-2 rounded hover:bg-green-700 transition">
                        {isAdmin ? 'Login as Admin' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
