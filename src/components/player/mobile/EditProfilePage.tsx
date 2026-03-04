import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import ClubSetsSelector from '../../shared/ClubSetsSelector';

interface ClubEntry {
  brand: 'Titleist' | 'Other';
  model: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    nickname: (user as any)?.nickname || '',
    handicap: user?.handicap || 0,
    gender: (user as any)?.gender || 'male',
    workLocation: (user as any)?.workLocation || '',
    shirtSize: (user as any)?.shirtSize || 'M',
    gloveSize: (user as any)?.gloveSize || 'M',
    drivers: Array.isArray((user as any)?.drivers) ? (user as any).drivers : [] as ClubEntry[],
    fairways: Array.isArray((user as any)?.fairways) ? (user as any).fairways : [] as ClubEntry[],
    hybrids: Array.isArray((user as any)?.hybrids) ? (user as any).hybrids : [] as ClubEntry[],
    utilityIrons: Array.isArray((user as any)?.utilityIrons) ? (user as any).utilityIrons : [] as ClubEntry[],
    irons: Array.isArray((user as any)?.irons) ? (user as any).irons : [] as ClubEntry[],
    wedges: Array.isArray((user as any)?.wedges) ? (user as any).wedges : [] as ClubEntry[],
    putters: Array.isArray((user as any)?.putters) ? (user as any).putters : [] as ClubEntry[],
  });

  // Update form data when user data changes
  React.useEffect(() => {
    if (user) {
      const userData = user as any;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: userData?.phone || '',
        nickname: userData?.nickname || '',
        handicap: user.handicap || 0,
        gender: userData?.gender || 'male',
        workLocation: userData?.workLocation || '',
        shirtSize: userData?.shirtSize || 'M',
        gloveSize: userData?.gloveSize || 'M',
        drivers: Array.isArray(userData?.drivers) ? userData.drivers : [],
        fairways: Array.isArray(userData?.fairways) ? userData.fairways : [],
        hybrids: Array.isArray(userData?.hybrids) ? userData.hybrids : [],
        utilityIrons: Array.isArray(userData?.utilityIrons) ? userData.utilityIrons : [],
        irons: Array.isArray(userData?.irons) ? userData.irons : [],
        wedges: Array.isArray(userData?.wedges) ? userData.wedges : [],
        putters: Array.isArray(userData?.putters) ? userData.putters : [],
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const updateProfile = useMutation(api.users.updateProfile);
  const updatePlayer = useMutation(api.users.updatePlayer);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update profile fields (phone, nickname, handicap, gender, workLocation, shirtSize, gloveSize, clubSets)
      await updateProfile({
        userId: user._id,
        name: formData.name,
        phone: formData.phone || undefined,
        nickname: formData.nickname || undefined,
        handicap: formData.handicap,
        gender: formData.gender as "male" | "female",
        workLocation: formData.workLocation || undefined,
        shirtSize: formData.shirtSize as "S" | "M" | "L" | "XL",
        gloveSize: formData.gloveSize as "S" | "M" | "L" | "XL",
        drivers: formData.drivers.length > 0 ? formData.drivers : undefined,
        fairways: formData.fairways.length > 0 ? formData.fairways : undefined,
        hybrids: formData.hybrids.length > 0 ? formData.hybrids : undefined,
        utilityIrons: formData.utilityIrons.length > 0 ? formData.utilityIrons : undefined,
        irons: formData.irons.length > 0 ? formData.irons : undefined,
        wedges: formData.wedges.length > 0 ? formData.wedges : undefined,
        putters: formData.putters.length > 0 ? formData.putters : undefined,
      });

      // Update email separately if changed
      if (formData.email !== user.email) {
        await updatePlayer({
          playerId: user._id,
          email: formData.email,
        });
      }
      
      // Update user in AuthContext for realtime refresh
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nickname: formData.nickname,
        handicap: formData.handicap,
        gender: formData.gender as "male" | "female",
        workLocation: formData.workLocation,
        shirtSize: formData.shirtSize as "S" | "M" | "L" | "XL",
        gloveSize: formData.gloveSize as "S" | "M" | "L" | "XL",
      });
      
      // Show success notification
      showNotification('success', 'Profile updated successfully!');
      
      // Navigate back to profile after delay
      setTimeout(() => {
        navigate('/player?tab=profile');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showNotification('error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex flex-col">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slideDown">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
              toastType === 'success'
                ? 'bg-gradient-to-r from-green-900/95 to-green-800/95 border-green-500/50'
                : 'bg-gradient-to-r from-gray-900/95 to-gray-800/95 border-red-500/50'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            )}
            <p className="text-white font-semibold text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0  shadow-2xl border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate('/player?tab=profile')}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white font-bold text-xl">Edit Profile</h2>
        </div>
      </div>

      {/* Form with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-8">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Nickname</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Your nickname"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                formData.gender === 'male'
                  ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                  : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                formData.gender === 'female'
                  ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                  : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Handicap */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Handicap</label>
          <input
            type="number"
            value={formData.handicap}
            onChange={(e) => setFormData({ ...formData, handicap: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            min="0"
            max="54"
          />
        </div>

        {/* Work Location */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Work Location</label>
          <input
            type="text"
            value={formData.workLocation}
            onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Jakarta, Indonesia"
          />
        </div>

        {/* Shirt Size */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Shirt Size</label>
          <div className="grid grid-cols-4 gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFormData({ ...formData, shirtSize: size as any })}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  formData.shirtSize === size
                    ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                    : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Glove Size */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Glove Size</label>
          <div className="grid grid-cols-4 gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFormData({ ...formData, gloveSize: size as any })}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  formData.gloveSize === size
                    ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                    : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Club Sets Selector */}
        <div className="md:col-span-2">
          <ClubSetsSelector
            drivers={formData.drivers}
            fairways={formData.fairways}
            hybrids={formData.hybrids}
            utilityIrons={formData.utilityIrons}
            irons={formData.irons}
            wedges={formData.wedges}
            putters={formData.putters}
            onChange={(category, clubs) => {
              setFormData({ ...formData, [category]: clubs });
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        </form>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
          border-radius: 10px;
          border: 2px solid #1a1a1a;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EditProfilePage;
