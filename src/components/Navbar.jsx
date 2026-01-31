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
                    {/* Bangladesh Flag Logo */}
                    <svg title="Bangladesh Flag" className="w-10 h-6 border border-green-800 shadow-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12">
                        <rect width="20" height="12" fill="#006a4e" />
                        <circle cx="9" cy="6" r="4" fill="#f42a41" />
                    </svg>
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
