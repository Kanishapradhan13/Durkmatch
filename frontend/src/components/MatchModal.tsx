import { useNavigate } from 'react-router-dom';
import type { DiscoverUser } from '../types';

interface MatchModalProps {
  user: DiscoverUser;
  matchId: number;
  onClose: () => void;
}

export default function MatchModal({ user, matchId, onClose }: MatchModalProps) {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center transform animate-scaleIn">
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">It's a Match!</h2>

        <p className="text-gray-600 mb-6">
          You and {user.name} liked each other
        </p>

        <div className="mb-6">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-druk-orange shadow-lg">
            <img
              src={user.profile_photos?.[0] || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            {user.name}, {user.age}
          </h3>
          <p className="text-gray-600">{user.dzongkhag}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            Send Message
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
