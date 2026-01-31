import { Link } from 'react-router-dom';

const ElectionCard = ({ election }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition border-l-4 border-brand-green">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
            <p className="text-gray-600 mb-4">{election.description}</p>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Status: <span className={`font-semibold ${election.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{election.status.toUpperCase()}</span></span>
                <span>Candidates: {election.candidates.length}</span>
            </div>

            <Link
                to={`/election/${election._id}`}
                className="block text-center bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
            >
                View Details & Vote
            </Link>
        </div>
    );
};

export default ElectionCard;
