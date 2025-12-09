import { useState } from 'react';
import type { DiscoverUser } from '../types';

interface SwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const photos = user.profile_photos && user.profile_photos.length > 0
    ? user.profile_photos
    : ['https://via.placeholder.com/400x600?text=No+Photo'];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Photo Section */}
        <div className="relative h-[500px] bg-gray-200">
          <img
            src={photos[currentPhotoIndex]}
            alt={user.name}
            className="w-full h-full object-cover"
          />

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Photo Indicators */}
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all ${
                      index === currentPhotoIndex ? 'w-8 bg-white' : 'w-6 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition"
          >
            <svg className="w-6 h-6 text-druk-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-1">{user.name}, {user.age}</h2>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{user.dzongkhag}</span>
              {user.occupation && (
                <>
                  <span>•</span>
                  <span>{user.occupation}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info Panel */}
        {showInfo && (
          <div className="p-6 max-h-64 overflow-y-auto">
            {user.bio && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            {user.interests && user.interests.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-druk-yellow/20 text-druk-orange rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.education && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-gray-700">{user.education}</p>
              </div>
            )}

            {user.zodiac_sign && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Zodiac Sign</h3>
                <p className="text-gray-700">{user.zodiac_sign}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swipe Buttons */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          onClick={() => onSwipe('left')}
          className="bg-white hover:bg-red-50 text-red-500 rounded-full p-6 shadow-lg hover:shadow-xl transform hover:scale-110 transition"
          aria-label="Pass"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={() => onSwipe('right')}
          className="bg-gradient-to-r from-druk-orange to-druk-red hover:shadow-2xl text-white rounded-full p-8 shadow-xl transform hover:scale-110 transition"
          aria-label="Like"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Swipe Hints */}
      <div className="text-center mt-4 text-gray-500 text-sm">
        <p>Press ✕ to pass or ♥ to like</p>
      </div>
    </div>
  );
}
