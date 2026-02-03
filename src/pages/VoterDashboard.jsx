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
                            className="relative px-10 py-4 rounded-2xl text-base font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white shadow-2xl hover:shadow-yellow-500/50 transform hover:-translate-y-2 hover:scale-110 active:scale-95"
                        >
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            {/* Glassmorphism shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Button content */}
                            <span className="relative flex items-center gap-2 font-extrabold tracking-wide justify-center">
                                <span className="text-xl">🔄</span>
                                <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">RE-LOGIN NOW</span>
                            </span>

                            {/* Bottom glow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent blur-sm"></div>
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
                                                <div key={candidate._id} className={`group relative flex justify-between items-center p-5 rounded-2xl transition-all duration-500 overflow-hidden ${hasVoted ? 'bg-gradient-to-br from-gray-50 to-gray-100 opacity-70 border-2 border-gray-200' : 'bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 hover:from-purple-100/50 hover:to-pink-100/50 border-2 border-purple-200/50 hover:border-purple-400 shadow-lg hover:shadow-2xl hover:shadow-purple-300/30 transform hover:-translate-y-1'}`}>
                                                    {/* Decorative background gradient */}
                                                    {!hasVoted && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                                                    )}

                                                    <div className="relative flex items-center gap-5">
                                                        {/* Candidate Avatar/Initial - Enhanced */}
                                                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg transition-all duration-300 ${hasVoted ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white group-hover:scale-110 group-hover:rotate-3'}`}>
                                                            {candidate.name[0]}
                                                            {!hasVoted && (
                                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
                                                            )}
                                                        </div>

                                                        {/* Symbol Image - Ultra Premium */}
                                                        {candidate.symbolImage && (
                                                            <div className={`relative w-24 h-24 transition-all duration-500 ${hasVoted ? '' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                                                                {/* Outer glow ring */}
                                                                {!hasVoted && (
                                                                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl opacity-75 blur-lg group-hover:opacity-100 animate-pulse"></div>
                                                                )}

                                                                {/* Main frame container */}
                                                                <div className={`relative w-full h-full rounded-3xl p-0.5 transition-all duration-300 ${hasVoted ? 'bg-gray-300' : 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600'}`}>
                                                                    {/* Inner white background */}
                                                                    <div className={`relative w-full h-full rounded-3xl p-3 flex items-center justify-center overflow-hidden ${hasVoted ? 'bg-gray-100' : 'bg-white'}`}>
                                                                        {/* Animated background pattern */}
                                                                        {!hasVoted && (
                                                                            <>
                                                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-yellow-100/50"></div>
                                                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]"></div>
                                                                            </>
                                                                        )}

                                                                        {/* Symbol image */}
                                                                        <img
                                                                            src={candidate.symbolImage}
                                                                            alt={candidate.symbol}
                                                                            className={`relative z-10 max-w-full max-h-full object-contain transition-all duration-300 ${hasVoted ? 'opacity-60' : 'drop-shadow-2xl group-hover:scale-110'}`}
                                                                        />

                                                                        {/* Shine effect overlay */}
                                                                        {!hasVoted && (
                                                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Corner accents */}
                                                                {!hasVoted && (
                                                                    <>
                                                                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50"></div>
                                                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-600 rounded-full shadow-lg shadow-purple-600/50"></div>
                                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex-1">
                                                            <div className="font-black text-xl text-gray-900 mb-1 tracking-tight">{candidate.name}</div>
                                                            {candidate.symbol && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                                                        {candidate.symbol}
                                                                    </span>
                                                                    <span className="text-purple-600 text-xs font-semibold">Official Symbol</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="relative flex items-center gap-3">
                                                        <button
                                                            onClick={() => !hasVoted && handleVote(election._id, candidate._id)}
                                                            disabled={hasVoted}
                                                            className={`relative px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-500 overflow-hidden group/btn ${hasVoted
                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed hidden'
                                                                : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-2 hover:scale-110 active:scale-95'
                                                                }`}
                                                        >
                                                            {/* Animated gradient overlay */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

                                                            {/* Glassmorphism shine effect */}
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                                                            {/* Button content */}
                                                            <span className="relative flex items-center gap-2 font-extrabold tracking-wide">
                                                                <span className="text-lg">🗳️</span>
                                                                <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">VOTE NOW</span>
                                                                <span className="text-yellow-300">✨</span>
                                                            </span>

                                                            {/* Bottom glow */}
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-sm"></div>
                                                        </button>
                                                        {hasVoted && <span className="text-green-600 font-bold text-2xl animate-bounce drop-shadow-lg">✓</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-t text-center">
                                        <button
                                            onClick={() => navigate(`/election/${election._id}`)}
                                            className="relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                                        >
                                            {/* Animated gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                            {/* Glassmorphism shine */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            {/* Button content */}
                                            <span className="relative flex items-center gap-2 font-extrabold tracking-wide">
                                                <span className="text-base">📊</span>
                                                <span>View Live Analytics</span>
                                                <span className="text-yellow-300">→</span>
                                            </span>
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
