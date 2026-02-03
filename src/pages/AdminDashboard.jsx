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
    const [candidates, setCandidates] = useState([{ name: '', symbol: '', symbolImage: '' }]);
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
        setCandidates([...candidates, { name: '', symbol: '', symbolImage: '' }]);
    };

    const removeCandidate = (index) => {
        const newCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(newCandidates);
    };

    const [editId, setEditId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const constituencyList = constituencies.split(',').map(c => c.trim()).filter(c => c !== '');

            const payload = {
                title, description, constituencies: constituencyList, startTime, endTime
            };
            if (!editId) payload.candidates = candidates; // Only send candidates on create

            if (editId) {
                await axios.put(`http://localhost:5000/api/elections/${editId}`, payload, config);
                setMsg('Election Updated Successfully!');
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/elections', payload, config);
                setMsg('Election Created Successfully!');
            }

            setTitle(''); setDescription(''); setConstituencies(''); setStartTime(''); setEndTime('');
            setCandidates([{ name: '', symbol: '' }]);
            fetchElections(); // Refresh list if needed (though we are on create tab)
        } catch (error) {
            console.error(error);
            setMsg('Failed to save election');
        }
    };

    const handleEdit = (election) => {
        setEditId(election._id);
        setTitle(election.title);
        setDescription(election.description);
        setConstituencies(election.constituencies ? election.constituencies.join(', ') : '');
        setStartTime(election.startTime); // Date format might need adjustment
        setEndTime(election.endTime);
        setCandidates(election.candidates); // Display candidates but maybe disable editing them?
        setActiveTab('create');
        setMsg('');
    };

    // Stats calculation
    const totalVoters = voters.length;
    const pendingCount = pendingVoters.length;
    const activeElectionsCount = elections.filter(e => e.phase === 'ongoing').length;

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 text-center">
                    <div className="text-red-500 text-5xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
                    <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
                    <button onClick={() => window.location.href = '/'} className="relative mt-6 px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-xl hover:shadow-2xl hover:shadow-gray-700/50 transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative font-extrabold">🏠 Go Home</span>
                    </button>
                </div>
            </div>
        )
    }

    const updateStatus = async (id, phase) => {
        if (!window.confirm(`Are you sure you want to verify this election as ${phase}?`)) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/elections/${id}/status`, { phase }, config);
            fetchElections();
            alert(`Election ${phase} successfully`);
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
            <Navbar />

            <div className="flex flex-1 container mx-auto p-6 gap-6">
                {/* Sidebar Navigation */}
                <aside className="w-1/4 hidden md:block">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-8 border-b pb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">AD</div>
                            <div>
                                <h3 className="font-bold text-gray-800">{user.name}</h3>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Administrator</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button onClick={() => handleTabChange('create')} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}>
                                <span>➕</span> Create Election
                            </button>
                            <button onClick={() => handleTabChange('elections')} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'elections' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}>
                                <span>🗳️</span> Manage Elections
                            </button>
                            <button onClick={() => handleTabChange('voters')} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center justify-between ${activeTab === 'voters' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}>
                                <div className="flex items-center gap-3"><span>👥</span> Manage Voters</div>
                                {pendingCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
                            </button>
                        </nav>

                        <div className="mt-8 pt-6 border-t">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Total Voters</span>
                                    <span className="font-bold text-gray-800">{totalVoters}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Active Elections</span>
                                    <span className="font-bold text-green-600">{activeElectionsCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="w-full md:w-3/4">

                    {/* Top Mobile Nav (visible only on small screens) */}
                    <div className="md:hidden mb-6 flex overflow-x-auto gap-2 pb-2">
                        <button onClick={() => handleTabChange('create')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'create' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' : 'bg-white shadow text-gray-700 hover:shadow-md hover:scale-102'}`}>✨ Create Election</button>
                        <button onClick={() => handleTabChange('elections')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'elections' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' : 'bg-white shadow text-gray-700 hover:shadow-md hover:scale-102'}`}>🗳️ Manage Elections</button>
                        <button onClick={() => handleTabChange('voters')} className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'voters' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' : 'bg-white shadow text-gray-700 hover:shadow-md hover:scale-102'}`}>👥 Voters ({pendingCount})</button>
                    </div>

                    {/* Dynamic Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px]">

                        {activeTab === 'create' && (
                            <div className="max-w-3xl mx-auto">
                                <div className="flex justify-between items-center mb-8 border-b pb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">{editId ? 'Edit Election Details' : 'Launch New Election'}</h2>
                                    {editId && <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">Safe Edit Mode</span>}
                                </div>
                                {msg && (
                                    <div className={`p-4 rounded-xl mb-6 text-center shadow-sm flex items-center justify-center gap-2 ${msg.includes('Success') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                        <span className="text-xl">{msg.includes('Success') ? '✅' : '⛔'}</span> {msg}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wider">Election Heading</label>
                                            <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50 focus:bg-white" placeholder="e.g. National Parliamentary Election 2026" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wider">Description</label>
                                            <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50 focus:bg-white" placeholder="Brief details about the election..." value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wider">Constituencies</label>
                                            <input type="text" placeholder="Separate by comma (Dhaka-1, Chittagong-2). Leave empty for National." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50 focus:bg-white" value={constituencies} onChange={(e) => setConstituencies(e.target.value)} />
                                            <p className="text-xs text-gray-400 mt-1">If empty, this election will be visible to ALL voters.</p>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wider">Start Date & Time</label>
                                            <input type="date" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50 focus:bg-white" value={startTime ? startTime.substring(0, 10) : ''} onChange={(e) => setStartTime(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wider">End Date & Time</label>
                                            <input type="date" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-gray-50 focus:bg-white" value={endTime ? endTime.substring(0, 10) : ''} onChange={(e) => setEndTime(e.target.value)} required />
                                        </div>
                                    </div>

                                    {!editId && (
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <label className="block text-gray-700 font-bold mb-4 text-sm uppercase tracking-wider">Registered Candidates</label>
                                            {candidates.map((candidate, index) => (
                                                <div key={index} className="mb-4 bg-white p-4 rounded-lg border shadow-sm">
                                                    <div className="flex gap-4 mb-2">
                                                        <input type="text" placeholder="Candidate Name" className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm" value={candidate.name} onChange={(e) => handleCandidateChange(index, 'name', e.target.value)} required />
                                                        {candidates.length > 1 && <button type="button" onClick={() => removeCandidate(index)} className="relative px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden group bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                                                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                            <span className="relative">🗑️ Remove</span>
                                                        </button>}
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <input type="text" placeholder="Symbol Name (e.g. Boat)" className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm" value={candidate.symbol} onChange={(e) => handleCandidateChange(index, 'symbol', e.target.value)} />
                                                        <input type="text" placeholder="Symbol Image URL (https://...)" className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-sm" value={candidate.symbolImage} onChange={(e) => handleCandidateChange(index, 'symbolImage', e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addCandidate} className="relative mt-2 px-5 py-3 rounded-xl font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-2 border-indigo-300 hover:border-indigo-500 shadow-sm hover:shadow-md transform hover:scale-105">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                <span className="relative flex items-center gap-2">➕ Add Another Candidate</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t flex gap-4">
                                        {editId && <button type="button" onClick={() => { setEditId(null); setTitle(''); setDescription(''); setConstituencies(''); setCandidates([]); }} className="relative flex-1 py-4 rounded-xl font-bold transition-all duration-300 overflow-hidden group bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 shadow-md hover:shadow-lg transform hover:scale-105">
                                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            <span className="relative">❌ Cancel Editing</span>
                                        </button>}
                                        <button type="submit" className="relative flex-1 py-4 rounded-2xl font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-2 hover:scale-105 active:scale-95">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <span className="relative flex items-center gap-2 font-extrabold justify-center">
                                                <span className="text-xl">{editId ? '💾' : '🚀'}</span>
                                                <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">{editId ? 'UPDATE ELECTION' : 'PUBLISH ELECTION'}</span>
                                                <span className="text-yellow-300">✨</span>
                                            </span>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-sm"></div>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'voters' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-xl">⏳</span> Pending Verification
                                </h2>
                                <div className="overflow-x-auto mb-12 rounded-xl border border-gray-200 shadow-sm">
                                    <table className="min-w-full bg-white">
                                        <thead><tr className="bg-orange-50 text-orange-800 font-bold text-sm uppercase tracking-wider"><th className="py-4 px-6 text-left">Name</th><th className="py-4 px-6 text-left">NID Number</th><th className="py-4 px-6 text-left">Constituency</th><th className="py-4 px-6 text-center">Action</th></tr></thead>
                                        <tbody className="text-gray-600 text-sm">
                                            {pendingVoters.map(voter => (
                                                <tr key={voter._id} className="border-b border-gray-100 hover:bg-orange-50/30 transition">
                                                    <td className="py-4 px-6 font-medium text-gray-800">{voter.name}</td>
                                                    <td className="py-4 px-6">{voter.nid}</td>
                                                    <td className="py-4 px-6">{voter.constituency}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button onClick={() => approveVoter(voter._id)} className="relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-500 overflow-hidden group bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-110 active:scale-95">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                            <span className="relative">✓ Approve</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {pendingVoters.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400 italic">No pending voter applications</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-xl">👥</span> Total Voter Database
                                </h2>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="min-w-full bg-white">
                                        <thead><tr className="bg-gray-50 text-gray-600 font-bold text-sm uppercase tracking-wider"><th className="py-4 px-6 text-left">Name</th><th className="py-4 px-6 text-left">Email</th><th className="py-4 px-6 text-left">NID</th><th className="py-4 px-6 text-left">Status</th></tr></thead>
                                        <tbody className="text-gray-600 text-sm">
                                            {voters.map(voter => (
                                                <tr key={voter._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                    <td className="py-4 px-6 font-medium text-gray-800">{voter.name}</td>
                                                    <td className="py-4 px-6">{voter.email}</td>
                                                    <td className="py-4 px-6 font-mono text-xs">{voter.nid}</td>
                                                    <td className="py-4 px-6"><span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-bold ${voter.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{voter.isVerified ? '● Verified' : '○ Pending'}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'elections' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-between">
                                    <span>🗳️ Election Management</span>
                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{elections.length} Total</span>
                                </h2>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {elections.map(election => (
                                        <div key={election._id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition duration-300 relative overflow-hidden group">
                                            <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full opacity-20 ${election.phase === 'ongoing' ? 'bg-green-500' : election.phase === 'ended' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-2 inline-block ${election.phase === 'ongoing' ? 'bg-green-100 text-green-700' : election.phase === 'ended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {election.phase}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                                                </div>
                                                <button onClick={() => handleEdit(election)} className="relative p-3 rounded-xl transition-all duration-300 overflow-hidden group bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95" title="Edit Election">
                                                    <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                    <span className="relative text-lg">✏️</span>
                                                </button>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">{election.description}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-gray-400 text-xs uppercase">Candidates</p>
                                                    <p className="font-bold text-gray-700 text-lg">{election.candidates.length}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-400 text-xs uppercase">Time Remaining</p>
                                                    <p className="font-bold text-gray-700">{election.phase === 'ongoing' ? 'Active Now' : 'Ended'}</p>
                                                </div>
                                                <div className="col-span-2 border-t pt-2 mt-2">
                                                    <p className="text-xs">Schedule: {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 relative z-10">
                                                {election.phase === 'scheduled' && (
                                                    <button onClick={() => updateStatus(election._id, 'ongoing')} className="relative flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                        <span className="relative flex items-center gap-2 justify-center"><span>▶️</span> Start Election Now</span>
                                                    </button>
                                                )}
                                                {election.phase === 'ongoing' && (
                                                    <button onClick={() => updateStatus(election._id, 'ended')} className="relative flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-500 overflow-hidden group bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/50 transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                        <span className="relative flex items-center gap-2 justify-center"><span>⏹️</span> Stop Election</span>
                                                    </button>
                                                )}
                                                {election.phase === 'ended' && (
                                                    <button className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 px-4 py-3 rounded-xl text-sm font-bold cursor-not-allowed shadow-inner">📦 Archived</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
