import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { swipeAPI } from '../services/api';
import type { Match } from '../types';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const { matches: matchesData } = await swipeAPI.getMatches();
      setMatches(matchesData);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId: number) => {
    navigate(`/chat/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-druk-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-gray-600">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Matches Yet</h2>
            <p className="text-gray-600 mb-6">
              Keep swiping to find your match!
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.match_id}
                onClick={() => handleMatchClick(match.match_id)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-xl"
              >
                <div className="relative h-64">
                  <img
                    src={match.profile_photos?.[0] || 'https://via.placeholder.com/300x400'}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                  {match.unread_count > 0 && (
                    <div className="absolute top-4 right-4 bg-druk-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {match.unread_count}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white text-xl font-bold">
                      {match.name}, {match.age}
                    </h3>
                    <div className="flex items-center gap-1 text-white text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{match.dzongkhag}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {match.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{match.bio}</p>
                  )}

                  {match.interests && match.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {match.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-druk-yellow/20 text-druk-orange rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                      {match.interests.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{match.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <button className="w-full bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition">
                    {match.unread_count > 0 ? 'View Messages' : 'Send Message'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
