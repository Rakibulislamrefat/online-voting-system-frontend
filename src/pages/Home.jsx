import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white min-h-[500px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="text-center p-8 max-w-4xl relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                        The Future of Democracy in <br /> <span className="text-brand-red text-red-400">Bangladesh</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-2xl mx-auto">
                        A secure, transparent, and decentralized electronic voting platform designed for the modern era.
                    </p>
                    <div className="flex justify-center flex-wrap gap-4">
                        <Link to="/register" className="bg-brand-red bg-red-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Register as Voter
                        </Link>
                        <Link to="/login" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-green-800 transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-20 container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">Participating in the election process has never been easier or more secure. Follow these three simple steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300 text-center group">
                        <div className="w-16 h-16 bg-green-100 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-green group-hover:text-white transition">
                            <span className="text-2xl font-bold">1</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Create Account</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Register using your National ID (NID). Your application will be verified by our administrative team to ensure election integrity.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300 text-center group">
                        <div className="w-16 h-16 bg-red-100 text-brand-red text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 group-hover:text-white transition">
                            <span className="text-2xl font-bold">2</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Cast Your Vote</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Log in on election day. Access your specialized dashboard to view candidates for your constituency and vote securely.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300 text-center group">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                            <span className="text-2xl font-bold">3</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Real-time Monitor</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Watch the election unfold in real-time. Results are updated instantly as votes are cast across the nation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-100 py-16 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Ready to make your voice heard?</h3>
                <Link to="/register" className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition shadow-md">
                    Register Now
                </Link>
            </div>

            <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <p className="mb-2">&copy; {new Date().getFullYear()} Bangladesh Election Commission. All rights reserved.</p>
                    <p className="text-sm">Secure. Transparent. Democratic.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
