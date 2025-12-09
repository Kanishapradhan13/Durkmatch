import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DZONGKHAGS, ZODIAC_SIGNS, COMMON_INTERESTS } from '../utils/constants';
import PhotoUpload from '../components/PhotoUpload';
import type { RegisterData } from '../types';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    age: 25,
    gender: 'male',
    dzongkhag: 'Thimphu',
    bio: '',
    interests: [],
    education: '',
    occupation: '',
    preferred_language: 'English',
    zodiac_sign: '',
    preferred_gender: 'both',
    min_age: 18,
    max_age: 100,
    preferred_dzongkhags: [],
    profile_photos: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: number) => {
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }
    if (step === 2) {
      if (!formData.profile_photos || formData.profile_photos.length === 0) {
        setError('Please add at least one photo');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/discover');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-druk-yellow via-druk-orange to-druk-red p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join DrukMatch</h1>
          <p className="text-gray-600">Create your profile - Step {step} of 3</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-sm ${step >= 1 ? 'text-druk-orange font-semibold' : 'text-gray-400'}`}>Basic Info</span>
            <span className={`text-sm ${step >= 2 ? 'text-druk-orange font-semibold' : 'text-gray-400'}`}>About You</span>
            <span className={`text-sm ${step >= 3 ? 'text-druk-orange font-semibold' : 'text-gray-400'}`}>Preferences</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-druk-orange to-druk-red rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with a number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={(e) => handleNumberChange('age', parseInt(e.target.value))}
                    min={18}
                    max={100}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dzongkhag *</label>
                <select
                  name="dzongkhag"
                  value={formData.dzongkhag}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                >
                  {DZONGKHAGS.map(dz => (
                    <option key={dz} value={dz}>{dz}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photos *</label>
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
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell others about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio?.length || 0}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g., Royal University of Bhutan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zodiac Sign</label>
                <select
                  name="zodiac_sign"
                  value={formData.zodiac_sign}
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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I'm looking for</label>
                <select
                  name="preferred_gender"
                  value={formData.preferred_gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                >
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="both">Everyone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range: {formData.min_age} - {formData.max_age}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Age</label>
                    <input
                      type="number"
                      name="min_age"
                      value={formData.min_age}
                      onChange={(e) => handleNumberChange('min_age', parseInt(e.target.value))}
                      min={18}
                      max={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Age</label>
                    <input
                      type="number"
                      name="max_age"
                      value={formData.max_age}
                      onChange={(e) => handleNumberChange('max_age', parseInt(e.target.value))}
                      min={18}
                      max={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-druk-orange focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Dzongkha">Dzongkha</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-druk-orange to-druk-red text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-druk-orange font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
