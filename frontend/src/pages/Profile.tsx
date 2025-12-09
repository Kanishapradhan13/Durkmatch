import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import { DZONGKHAGS, ZODIAC_SIGNS, COMMON_INTERESTS } from '../utils/constants';
import PhotoUpload from '../components/PhotoUpload';
import type { User } from '../types';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({ ...prev, profile_photos: photos }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { user: updatedUser } = await userAPI.updateProfile(formData);
      updateUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your DrukMatch profile</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-druk-yellow via-druk-orange to-druk-red p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
                <p className="text-white/90">{user.email}</p>
                <p className="text-white/90">{user.dzongkhag}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {!editing ? (
              <>
                {/* View Mode */}
                <div className="space-y-6">
                  {/* Photos */}
                  {user.profile_photos && user.profile_photos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Photos</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {user.profile_photos.map((photo, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-druk-orange text-white text-xs py-1 px-2 text-center">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-700">{user.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Personal Info</h3>
                      <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Gender:</span> {user.gender}</p>
                        <p><span className="font-medium">Age:</span> {user.age}</p>
                        <p><span className="font-medium">Location:</span> {user.dzongkhag}</p>
                        {user.zodiac_sign && (
                          <p><span className="font-medium">Zodiac:</span> {user.zodiac_sign}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
                      <div className="space-y-2 text-gray-700">
                        {user.education && (
                          <p><span className="font-medium">Education:</span> {user.education}</p>
                        )}
                        {user.occupation && (
                          <p><span className="font-medium">Occupation:</span> {user.occupation}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.interests && user.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-druk-yellow/20 text-druk-orange rounded-full text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><span className="font-medium">Looking for:</span> {user.preferred_gender}</p>
                      <p><span className="font-medium">Age range:</span> {user.min_age} - {user.max_age}</p>
                      <p><span className="font-medium">Language:</span> {user.preferred_language}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="mt-8 w-full bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photos</label>
                    <PhotoUpload
                      photos={formData.profile_photos || []}
                      onPhotosChange={handlePhotosChange}
                      maxPhotos={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleChange}
                        min={18}
                        max={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dzongkhag</label>
                      <select
                        name="dzongkhag"
                        value={formData.dzongkhag || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      >
                        {DZONGKHAGS.map(dz => (
                          <option key={dz} value={dz}>{dz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                      <input
                        type="text"
                        name="education"
                        value={formData.education || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zodiac Sign</label>
                    <select
                      name="zodiac_sign"
                      value={formData.zodiac_sign || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                    >
                      <option value="">Select zodiac sign</option>
                      {ZODIAC_SIGNS.map(sign => (
                        <option key={sign} value={sign}>{sign}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_INTERESTS.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            formData.interests?.includes(interest)
                              ? 'bg-druk-orange text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                      <select
                        name="preferred_gender"
                        value={formData.preferred_gender || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      >
                        <option value="male">Men</option>
                        <option value="female">Women</option>
                        <option value="both">Everyone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                      <select
                        name="preferred_language"
                        value={formData.preferred_language || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      >
                        <option value="English">English</option>
                        <option value="Dzongkha">Dzongkha</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Age</label>
                      <input
                        type="number"
                        name="min_age"
                        value={formData.min_age || ''}
                        onChange={handleChange}
                        min={18}
                        max={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Age</label>
                      <input
                        type="number"
                        name="max_age"
                        value={formData.max_age || ''}
                        onChange={handleChange}
                        min={18}
                        max={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(user);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
