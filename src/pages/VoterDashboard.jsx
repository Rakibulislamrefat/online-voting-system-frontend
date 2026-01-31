import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add useNavigate
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const VoterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        if (user) {
            fetchElections();
        }
    }, [user]);

    const fetchElections = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/elections');
            // Filter elections:
            // 1. Must be active (phase === 'ongoing')
            // 2. Must be irrelevant to the user (National OR matches constituency)
            // Note: Since backend currently returns all, we filter here. 
            // Better to filter in backend for scalability, but fine for MVP.

            const relevantElections = data.filter(election => {
                const isActive = election.phase === 'ongoing';
                const isNational = !election.constituencies || election.constituencies.length === 0;
                const isLocal = election.constituencies && election.constituencies.includes(user.constituency);
                return isActive && (isNational || isLocal);
            });

            setElections(relevantElections);
        } catch (error) {
            console.error(error);
        }
    };

    const handleVote = async (electionId, candidateId) => {
        // Confirmation
        if (!window.confirm("Are you sure you want to vote for this candidate?")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/elections/vote', {
                electionId,
                candidateId
            }, config);

            setMsg('Vote Cast Successfully!');
            alert('Vote Cast Successfully! Redirecting to results...');
            navigate(`/election/${electionId}`); // Redirect to Live Result
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Voting Failed';
            setMsg(errorMsg);
            alert(errorMsg);
        }
    };

    if (!user) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-6">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">Voter Dashboard</h1>
                    <p className="text-gray-600 mb-6">Welcome, <span className="font-semibold">{user.name}</span>. Your Constituency: <span className="font-semibold text-brand-green">{user.constituency}</span></p>

                    {msg && <div className={`p-3 rounded mb-4 text-center ${msg.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Active Elections</h2>

                    {elections.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No active elections found for your constituency.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {elections.map(election => (
                                <div key={election._id} className="border rounded-xl p-6 shadow-sm hover:shadow-md transition bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{election.description}</p>

                                    <div className="space-y-3">
                                        <p className="font-bold text-gray-700">Candidates:</p>
                                        {election.candidates.map(candidate => (
                                            <div key={candidate._id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                <div className="flex items-center gap-2">
                                                    {candidate.symbol && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">{candidate.symbol[0]}</div>}
                                                    <span className="font-medium">{candidate.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleVote(election._id, candidate._id)}
                                                    className="bg-brand-green text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                                >
                                                    Vote
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t text-sm text-center">
                                        <button onClick={() => navigate(`/election/${election._id}`)} className="text-brand-green font-semibold hover:underline">View Live Results</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoterDashboard;
