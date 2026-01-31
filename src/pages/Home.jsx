import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-green-50 to-red-50">
                <div className="text-center p-8 max-w-2xl">
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-6 tracking-tight">
                        <span className="text-brand-green">Bangladesh</span> Live Voting System
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Secure, Transparent, and Real-time E-Voting Platform.
                        <br />Register now to cast your vote from anywhere.
                    </p>
                    <div className="space-x-4">
                        <Link to="/register" className="bg-brand-green text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg hover:bg-green-700 transition transform hover:-translate-y-1">
                            Get Started
                        </Link>
                        <Link to="/login" className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold text-lg border hover:shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-1">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
            <footer className="bg-gray-800 text-gray-400 py-6 text-center">
                &copy; {new Date().getFullYear()} Bangladesh Election Commission (Demo). All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
