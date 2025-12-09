import { useState, useEffect } from 'react';
import { swipeAPI } from '../services/api';
import socketService from '../services/socket';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import type { DiscoverUser } from '../types';

export default function Discover() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: newUsers } = await swipeAPI.getDiscoverUsers(20);
      setUsers(newUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    const swipeType = direction === 'right' ? 'like' : 'pass';

    try {
      const response = await swipeAPI.swipe({
        targetUserId: currentUser.id,
        swipeType
      });

      if (response.isMatch && response.matchId) {
        setMatchedUser(currentUser);
        setMatchId(response.matchId);
        setShowMatchModal(true);

        // Notify the other user via socket
        socketService.emitNewMatch(response.matchId, currentUser.id);
      }

      // Move to next user
      setCurrentIndex(prev => prev + 1);

      // Load more users if running low
      if (currentIndex >= users.length - 3) {
        loadUsers();
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const currentUser = users[currentIndex];

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-druk-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Finding matches for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600">Find your match in Bhutan</p>
        </div>

        {currentUser ? (
          <SwipeCard user={currentUser} onSwipe={handleSwipe} />
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No More Profiles</h2>
            <p className="text-gray-600 mb-6">
              You've seen all available matches for now. Check back later for new people!
            </p>
            <button
              onClick={loadUsers}
              className="bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedUser && matchId && (
        <MatchModal
          user={matchedUser}
          matchId={matchId}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  );
}
