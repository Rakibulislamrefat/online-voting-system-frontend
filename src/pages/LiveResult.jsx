import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const LiveResult = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [msg, setMsg] = useState('');

    // Socket connection
    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('update_results', (data) => {
            if (data.electionId === id) {
                setElection(prev => ({
                    ...prev,
                    candidates: data.candidates
                }));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    // Fetch initial data
    useEffect(() => {
        const fetchElection = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/elections/${id}`);
                setElection(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchElection();
    }, [id]);

    const handleVote = async (candidateId) => {
        if (!user) {
            setMsg('Please login to vote.');
            return;
        }
        setMsg('');
        setVoting(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/elections/vote', {
                electionId: id,
                candidateId,
            }, config);

            setMsg('Vote cast successfully!');
        } catch (error) {
            setMsg(error.response?.data?.message || 'Voting failed');
        }
        setVoting(false);
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!election) return <div className="text-center mt-10">Election not found</div>;

    const COLORS = ['#006a4e', '#f42a41', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-6">

                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
                    <p className="text-gray-600 mb-4">{election.description}</p>
                    {msg && <div className={`p-3 rounded mb-4 text-center ${msg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Voting Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Ballot Paper</h2>
                        <div className="space-y-4">
                            {election.candidates.map((candidate) => (
                                <div key={candidate._id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
                                            {candidate.symbol ? <img src={candidate.symbol} alt={candidate.name} className="w-full h-full rounded-full object-cover" /> : candidate.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{candidate.name}</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleVote(candidate._id)}
                                        disabled={voting || election.status !== 'active'}
                                        className={`px-6 py-2 rounded text-white font-bold transition ${election.status !== 'active' ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-green hover:bg-green-700'}`}
                                    >
                                        {voting ? '...' : 'VOTE'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Chart Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-6 border-b pb-2">
                            <h2 className="text-2xl font-bold">Live Results</h2>
                            <span className="flex items-center gap-2 text-red-600 animate-pulse font-bold">
                                <span className="w-3 h-3 rounded-full bg-red-600"></span> LIVE
                            </span>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={election.candidates}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8">
                                        {election.candidates.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LiveResult;
