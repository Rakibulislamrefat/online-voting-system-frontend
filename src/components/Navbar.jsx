import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-brand-green p-4 text-white shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-brand-red"></div>
                    BD Voting
                </Link>

                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="font-medium hover:text-gray-200">
                                Hello, {user.name}
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="hover:text-gray-200">Admin Dashboard</Link>
                            )}
                            {user.role === 'voter' && (
                                <Link to="/dashboard" className="hover:text-gray-200">Vote Now</Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-brand-red px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-gray-200">Login</Link>
                            <Link to="/register" className="bg-white text-brand-green px-4 py-2 rounded font-bold hover:bg-gray-100 transition">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
