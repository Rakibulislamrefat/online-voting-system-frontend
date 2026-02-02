import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add useNavigate
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const VoterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [elections, setElections] = useState([]);
    const [votedElections, setVotedElections] = useState([]); // Track IDs of voted elections
    const [msg, setMsg] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        if (user) {
            fetchElections();
            fetchVotingHistory();
        }
    }, [user]);

    const fetchVotingHistory = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/elections/history', config);
            setVotedElections(data);
        } catch (error) {
            console.error("Error fetching voting history", error);
        }
    };

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
            fetchVotingHistory(); // Refresh history to update UI
            navigate(`/election/${electionId}`); // Redirect to Live Result
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Voting Failed';
            setMsg(errorMsg);
            alert(errorMsg);
        }
    };

    if (!user) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div>;

    if (!user.constituency) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className="container mx-auto p-6 flex justify-center items-center h-[80vh]">
                    <div className="bg-white border-l-4 border-yellow-500 shadow-xl rounded-xl p-8 max-w-lg text-center">
                        <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                        <h2 className="font-bold text-2xl mb-2 text-gray-800">Action Required</h2>
                        <p className="text-gray-600 mb-6">
                            Your constituency information is missing. This usually happens after an account confirmation. Please log in again to sync your data.
                        </p>
                        <button
                            onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/login'; }}
                            className="bg-yellow-500 text-white px-8 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-lg"
                        >
                            Re-Login Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculations for stats
    const activeCount = elections.length;
    const votedCount = elections.filter(e => votedElections.includes(e._id)).length;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Navbar />
            <div className="container mx-auto p-6">

                {/* Header Profile Section */}
                <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                        <img src="/bd_ballot_box.png" alt="National Election 2026" className="w-48 h-48 object-contain opacity-80 drop-shadow-lg" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
                            <p className="text-green-100 opacity-90">NID: {user.nid} | Email: {user.email}</p>
                            <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-semibold border border-white/20">
                                🇧🇩 National Election 2026
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                            <span className="block text-sm uppercase tracking-wider opacity-80">Your Constituency</span>
                            <span className="text-2xl font-bold">{user.constituency}</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-500 flex items-center justify-between hover:shadow-lg transition">
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Active Elections</p>
                            <h3 className="text-3xl font-bold text-gray-800">{activeCount}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl font-bold">🗳️</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500 flex items-center justify-between hover:shadow-lg transition">
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Votes Cast</p>
                            <h3 className="text-3xl font-bold text-gray-800">{votedElections.length}</h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl font-bold">✅</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-purple-500 flex items-center justify-between hover:shadow-lg transition">
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Participation Rate</p>
                            <h3 className="text-3xl font-bold text-gray-800">{activeCount > 0 ? Math.round((votedCount / activeCount) * 100) : 0}%</h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600 text-xl font-bold">📈</div>
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 rounded-lg mb-8 flex items-center justify-center space-x-2 shadow-sm ${msg.includes('Success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        <span className="text-xl">{msg.includes('Success') ? '🎉' : '⚠️'}</span>
                        <span className="font-medium">{msg}</span>
                    </div>
                )}

                <div className="mb-6 flex justify-between items-end border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">🗳️ Active Elections</h2>
                    <span className="text-sm text-gray-500">Voting Area: {user.constituency}</span>
                </div>

                {elections.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-gray-300 text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Elections</h3>
                        <p className="text-gray-500">There are currently no ongoing elections for your constituency.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {elections.map(election => {
                            const hasVoted = votedElections.includes(election._id);
                            return (
                                <div key={election._id} className={`flex flex-col rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden bg-white border ${hasVoted ? 'border-green-200 ring-2 ring-green-50' : 'border-gray-200'}`}>
                                    <div className={`p-6 ${hasVoted ? 'bg-green-50/50' : 'bg-gray-50'} border-b flex justify-between items-start`}>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{election.title}</h3>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${hasVoted ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {hasVoted ? 'Vote Cast' : 'Voting Open'}
                                            </span>
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            <p>End: {new Date(election.endTime).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow">
                                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{election.description}</p>

                                        <div className="space-y-3">
                                            <p className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-3">Candidates</p>
                                            {election.candidates.map(candidate => (
                                                <div key={candidate._id} className={`flex justify-between items-center p-3 rounded-lg border transition ${hasVoted ? 'bg-gray-50 opacity-70' : 'bg-white hover:border-green-400'}`}>
                                                    <div className="flex items-center gap-4">
                                                        {/* Candidate Avatar/Initial */}
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm border ${hasVoted ? 'bg-gray-200 text-gray-500' : 'bg-white text-gray-700'}`}>
                                                            {candidate.name[0]}
                                                        </div>

                                                        {/* Symbol Image */}
                                                        {candidate.symbolImage && (
                                                            <div className="w-14 h-14 rounded-lg bg-gray-50 border p-1 flex items-center justify-center shadow-sm">
                                                                <img src={candidate.symbolImage} alt={candidate.symbol} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                        )}

                                                        <div>
                                                            <div className="font-bold text-gray-800 text-lg">{candidate.name}</div>
                                                            {candidate.symbol && (
                                                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border">Symbol: {candidate.symbol}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => !hasVoted && handleVote(election._id, candidate._id)}
                                                            disabled={hasVoted}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${hasVoted
                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed hidden'
                                                                : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-md transform hover:-translate-y-0.5'
                                                                }`}
                                                        >
                                                            Vote
                                                        </button>
                                                        {hasVoted && <span className="text-green-600 font-bold text-sm">✓</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-t text-center">
                                        <button onClick={() => navigate(`/election/${election._id}`)} className="text-brand-green font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                                            <span>📊</span> View Live Analytics
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
                }
            </div>
        </div>
    );
};

export default VoterDashboard;
