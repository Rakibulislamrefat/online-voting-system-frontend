import { useState, useContext } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('create'); // create, voters, elections

    // Create Election State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [constituencies, setConstituencies] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [candidates, setCandidates] = useState([{ name: '', symbol: '' }]);
    const [msg, setMsg] = useState('');

    // Data State
    const [voters, setVoters] = useState([]);
    const [pendingVoters, setPendingVoters] = useState([]);
    const [elections, setElections] = useState([]);

    const fetchVoters = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/voters', config);
            setVoters(data);
            const { data: pending } = await axios.get('http://localhost:5000/api/admin/voters/pending', config);
            setPendingVoters(pending);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchElections = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/elections');
            setElections(data);
        } catch (error) {
            console.error(error);
        }
    };

    const approveVoter = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/voters/${id}/approve`, {}, config);
            fetchVoters(); // Refresh
            alert('Voter Approved');
        } catch (error) {
            alert('Failed to approve');
        }
    };

    // Load data on tab switch
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'voters') fetchVoters();
        if (tab === 'elections') fetchElections();
    };

    const handleCandidateChange = (index, field, value) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const addCandidate = () => {
        setCandidates([...candidates, { name: '', symbol: '' }]);
    };

    const removeCandidate = (index) => {
        const newCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(newCandidates);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const constituencyList = constituencies.split(',').map(c => c.trim()).filter(c => c !== '');
            await axios.post('http://localhost:5000/api/elections', {
                title, description, candidates, constituencies: constituencyList, startTime, endTime,
            }, config);
            setMsg('Election Created Successfully!');
            setTitle(''); setDescription(''); setConstituencies(''); setStartTime(''); setEndTime('');
            setCandidates([{ name: '', symbol: '' }]);
        } catch (error) {
            console.error(error);
            setMsg('Failed to create election');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50"><Navbar /><div className="container mx-auto p-6 text-center text-red-600 font-bold">Access Denied. Admin Only.</div></div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="space-x-4">
                        <button onClick={() => handleTabChange('create')} className={`px-4 py-2 rounded ${activeTab === 'create' ? 'bg-brand-green text-white' : 'bg-white text-gray-700'}`}>Create Election</button>
                        <button onClick={() => handleTabChange('voters')} className={`px-4 py-2 rounded ${activeTab === 'voters' ? 'bg-brand-green text-white' : 'bg-white text-gray-700'}`}>Manage Voters ({pendingVoters.length})</button>
                        <button onClick={() => handleTabChange('elections')} className={`px-4 py-2 rounded ${activeTab === 'elections' ? 'bg-brand-green text-white' : 'bg-white text-gray-700'}`}>Election List</button>
                    </div>
                </div>

                {activeTab === 'create' && (
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Create New Election</h2>
                        {msg && <div className={`p-3 rounded mb-4 text-center ${msg.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Title</label><input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                            <div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Description</label><textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea></div>
                            <div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Constituencies</label><input type="text" placeholder="Dhaka-1, Chittagong-2 (Empty for National)" className="w-full p-2 border rounded" value={constituencies} onChange={(e) => setConstituencies(e.target.value)} /></div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="block text-gray-700 font-bold mb-2">Start Time</label><input type="datetime-local" className="w-full p-2 border rounded" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></div>
                                <div><label className="block text-gray-700 font-bold mb-2">End Time</label><input type="datetime-local" className="w-full p-2 border rounded" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></div>
                            </div>
                            <div className="mb-6"><label className="block text-gray-700 font-bold mb-2">Candidates</label>
                                {candidates.map((candidate, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input type="text" placeholder="Name" className="flex-1 p-2 border rounded" value={candidate.name} onChange={(e) => handleCandidateChange(index, 'name', e.target.value)} required />
                                        <input type="text" placeholder="Symbol (Optional)" className="flex-1 p-2 border rounded" value={candidate.symbol} onChange={(e) => handleCandidateChange(index, 'symbol', e.target.value)} />
                                        {candidates.length > 1 && <button type="button" onClick={() => removeCandidate(index)} className="bg-red-500 text-white px-3 rounded">X</button>}
                                    </div>
                                ))}
                                <button type="button" onClick={addCandidate} className="text-brand-green font-bold">+ Add Candidate</button>
                            </div>
                            <button type="submit" className="w-full bg-brand-green text-white py-3 rounded font-bold hover:bg-green-700 transition">Create Election</button>
                        </form>
                    </div>
                )}

                {activeTab === 'voters' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Pending Approvals</h2>
                        <table className="min-w-full bg-white mb-8">
                            <thead><tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal"><th className="py-3 px-6 text-left">Name</th><th className="py-3 px-6 text-left">NID</th><th className="py-3 px-6 text-left">Constituency</th><th className="py-3 px-6 text-center">Action</th></tr></thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {pendingVoters.map(voter => (
                                    <tr key={voter._id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{voter.name}</td>
                                        <td className="py-3 px-6 text-left">{voter.nid}</td>
                                        <td className="py-3 px-6 text-left">{voter.constituency}</td>
                                        <td className="py-3 px-6 text-center"><button onClick={() => approveVoter(voter._id)} className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600">Approve</button></td>
                                    </tr>
                                ))}
                                {pendingVoters.length === 0 && <tr><td colSpan="4" className="text-center py-4">No pending voters</td></tr>}
                            </tbody>
                        </table>

                        <h2 className="text-2xl font-bold mb-4">All Voters</h2>
                        <table className="min-w-full bg-white">
                            <thead><tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal"><th className="py-3 px-6 text-left">Name</th><th className="py-3 px-6 text-left">Email</th><th className="py-3 px-6 text-left">NID</th><th className="py-3 px-6 text-left">Status</th></tr></thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {voters.map(voter => (
                                    <tr key={voter._id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left">{voter.name}</td>
                                        <td className="py-3 px-6 text-left">{voter.email}</td>
                                        <td className="py-3 px-6 text-left">{voter.nid}</td>
                                        <td className="py-3 px-6 text-left"><span className={`py-1 px-3 rounded-full text-xs ${voter.isVerified ? 'bg-green-200 text-green-600' : 'bg-yellow-200 text-yellow-600'}`}>{voter.isVerified ? 'Verified' : 'Pending'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'elections' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Election List</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {elections.map(election => (
                                <div key={election._id} className="border rounded p-4 shadow-sm hover:shadow-md transition">
                                    <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                                    <div className="mt-2 text-sm">
                                        <p><strong>Status:</strong> <span className="uppercase font-semibold text-brand-green">{election.phase}</span></p>
                                        <p><strong>Candidates:</strong> {election.candidates.length}</p>
                                        <p><strong>Start:</strong> {new Date(election.startTime).toLocaleString()}</p>
                                        <p><strong>End:</strong> {new Date(election.endTime).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
