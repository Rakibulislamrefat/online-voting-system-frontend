import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nid, setNid] = useState('');
    const [dob, setDob] = useState('');
    const [constituency, setConstituency] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, nid, dob, constituency);
            alert('Registration Successful! Please wait for Admin Approval.');
            navigate('/login');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-brand-green">Register Voter</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">NID Number</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={nid}
                            onChange={(e) => setNid(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Date of Birth</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Constituency</label>
                        <select
                            className="w-full p-2 border rounded focus:outline-none focus:border-brand-green"
                            value={constituency}
                            onChange={(e) => setConstituency(e.target.value)}
                            required
                        >
                            <option value="">Select Constituency</option>
                            <option value="Dhaka-1">Dhaka-1</option>
                            <option value="Dhaka-2">Dhaka-2</option>
                            <option value="Chittagong-1">Chittagong-1</option>
                            <option value="Sylhet-1">Sylhet-1</option>
                        </select>
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
                    <button type="submit" className="w-full bg-brand-green text-white py-2 rounded hover:bg-green-700 transition">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
