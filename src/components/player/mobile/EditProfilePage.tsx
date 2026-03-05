import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import ClubSetsSelectorSimple from '../../shared/ClubSetsSelectorSimple';

interface ClubEntry {
  brand: string;
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
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    dateOfBirth: (user as any)?.dateOfBirth || '',
    gender: (user as any)?.gender || 'male',
    shirtSize: (user as any)?.shirtSize || 'M',
    gloveSize: (user as any)?.gloveSize || '24',
    drivers: Array.isArray((user as any)?.drivers) ? (user as any).drivers : [] as ClubEntry[],
    fairways: Array.isArray((user as any)?.fairways) ? (user as any).fairways : [] as ClubEntry[],
    hybrids: Array.isArray((user as any)?.hybrids) ? (user as any).hybrids : [] as ClubEntry[],
    irons: Array.isArray((user as any)?.irons) ? (user as any).irons : [] as ClubEntry[],
    wedges: Array.isArray((user as any)?.wedges) ? (user as any).wedges : [] as ClubEntry[],
    putters: Array.isArray((user as any)?.putters) ? (user as any).putters : [] as ClubEntry[],
    golfBalls: Array.isArray((user as any)?.golfBalls) ? (user as any).golfBalls : [] as ClubEntry[],
  });

  // Update form data when user data changes
  React.useEffect(() => {
    if (user) {
      const userData = user as any;
      
      // Parse dateOfBirth if exists
      let birthDay = '';
      let birthMonth = '';
      let birthYear = '';
      
      if (userData?.dateOfBirth) {
        const date = new Date(userData.dateOfBirth);
        birthDay = date.getDate().toString();
        birthMonth = (date.getMonth() + 1).toString();
        birthYear = date.getFullYear().toString();
      }
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: userData?.phone || '',
        nickname: userData?.nickname || '',
        birthDay,
        birthMonth,
        birthYear,
        dateOfBirth: userData?.dateOfBirth || '',
        gender: userData?.gender || 'male',
        shirtSize: userData?.shirtSize || 'M',
        gloveSize: userData?.gloveSize || '24',
        drivers: Array.isArray(userData?.drivers) ? userData.drivers : [],
        fairways: Array.isArray(userData?.fairways) ? userData.fairways : [],
        hybrids: Array.isArray(userData?.hybrids) ? userData.hybrids : [],
        irons: Array.isArray(userData?.irons) ? userData.irons : [],
        wedges: Array.isArray(userData?.wedges) ? userData.wedges : [],
        putters: Array.isArray(userData?.putters) ? userData.putters : [],
        golfBalls: Array.isArray(userData?.golfBalls) ? userData.golfBalls : [],
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Update dateOfBirth when day, month, or year changes
      if (
        name === "birthDay" ||
        name === "birthMonth" ||
        name === "birthYear"
      ) {
        const day = name === "birthDay" ? value : prev.birthDay;
        const month = name === "birthMonth" ? value : prev.birthMonth;
        const year = name === "birthYear" ? value : prev.birthYear;

        if (day && month && year) {
          newData.dateOfBirth = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Helper function to check if club entry is valid
      const hasValidClub = (clubs: ClubEntry[]) => {
        return clubs.length > 0 && clubs[0].brand && clubs[0].model;
      };

      // Prepare club sets data
      const clubSetsData = {
        drivers: hasValidClub(formData.drivers) ? formData.drivers : undefined,
        fairways: hasValidClub(formData.fairways) ? formData.fairways : undefined,
        hybrids: hasValidClub(formData.hybrids) ? formData.hybrids : undefined,
        irons: hasValidClub(formData.irons) ? formData.irons : undefined,
        wedges: hasValidClub(formData.wedges) ? formData.wedges : undefined,
        putters: hasValidClub(formData.putters) ? formData.putters : undefined,
        golfBalls: hasValidClub(formData.golfBalls) ? formData.golfBalls : undefined,
      };

      // Update profile fields
      await updateProfile({
        userId: user._id,
        name: formData.name,
        phone: formData.phone || undefined,
        nickname: formData.nickname || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender as "male" | "female",
        shirtSize: formData.shirtSize as any,
        gloveSize: formData.gloveSize as any,
        ...clubSetsData,
      });

      // Update email separately if changed
      if (formData.email !== user.email) {
        await updatePlayer({
          playerId: user._id,
          email: formData.email,
        });
      }
      
      // Update user in AuthContext for realtime refresh (including club sets)
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nickname: formData.nickname,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as "male" | "female",
        shirtSize: formData.shirtSize as "S" | "M" | "L" | "XL" | "2XL" | "3XL",
        gloveSize: formData.gloveSize as "22" | "23" | "24" | "25" | "26",
        drivers: clubSetsData.drivers,
        fairways: clubSetsData.fairways,
        hybrids: clubSetsData.hybrids,
        irons: clubSetsData.irons,
        wedges: clubSetsData.wedges,
        putters: clubSetsData.putters,
        golfBalls: clubSetsData.golfBalls,
      });
      
      // Show success notification
      showNotification('success', 'Profil berhasil diperbarui!');
      
      // Navigate back to profile after delay
      setTimeout(() => {
        navigate('/player?tab=profile');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showNotification('error', error.message || 'Gagal memperbarui profil');
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
          <h2 className="text-white font-bold text-xl">Edit Profil</h2>
        </div>
      </div>

      {/* Form with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-8">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Masukkan nama lengkap Anda"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="email@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Nomor Telepon</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Nama Alias
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Nama yang ingin tercetak dalam merchandise
          </p>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            className="w-full bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="...."
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <Calendar className="h-4 w-4 text-red-700" />
            <span>Tanggal Lahir</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Day */}
            <div>
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-sm text-white bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a]">
                  Tanggal
                </option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(
                  (day) => (
                    <option
                      key={day}
                      value={day}
                      className="bg-[#1a1a1a]"
                    >
                      {day}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Month */}
            <div>
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-sm text-white bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a]">
                  Bulan
                </option>
                <option value="1" className="bg-[#1a1a1a]">
                  Januari
                </option>
                <option value="2" className="bg-[#1a1a1a]">
                  Februari
                </option>
                <option value="3" className="bg-[#1a1a1a]">
                  Maret
                </option>
                <option value="4" className="bg-[#1a1a1a]">
                  April
                </option>
                <option value="5" className="bg-[#1a1a1a]">
                  Mei
                </option>
                <option value="6" className="bg-[#1a1a1a]">
                  Juni
                </option>
                <option value="7" className="bg-[#1a1a1a]">
                  Juli
                </option>
                <option value="8" className="bg-[#1a1a1a]">
                  Agustus
                </option>
                <option value="9" className="bg-[#1a1a1a]">
                  September
                </option>
                <option value="10" className="bg-[#1a1a1a]">
                  Oktober
                </option>
                <option value="11" className="bg-[#1a1a1a]">
                  November
                </option>
                <option value="12" className="bg-[#1a1a1a]">
                  Desember
                </option>
              </select>
            </div>

            {/* Year */}
            <div>
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-sm text-white bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a]">
                  Tahun
                </option>
                {Array.from(
                  { length: 100 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-[#1a1a1a]"
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formData.birthDay &&
            formData.birthMonth &&
            formData.birthYear && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Tanggal lahir: {formData.birthDay}{" "}
                {
                  [
                    "",
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ][parseInt(formData.birthMonth)]
                }{" "}
                {formData.birthYear}
              </p>
            )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Jenis Kelamin</label>
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
              Pria
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
              Wanita
            </button>
          </div>
        </div>

        {/* Shirt Size & Glove Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Ukuran Baju
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, shirtSize: size })}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                    formData.shirtSize === size
                      ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700 shadow-lg'
                      : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Ukuran Sarung Tangan
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['22', '23', '24', '25', '26'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, gloveSize: size })}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                    formData.gloveSize === size
                      ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700 shadow-lg'
                      : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Club Sets Selector */}
        <div className="md:col-span-2">
          <ClubSetsSelectorSimple
            drivers={formData.drivers}
            fairways={formData.fairways}
            hybrids={formData.hybrids}
            irons={formData.irons}
            wedges={formData.wedges}
            putters={formData.putters}
            golfBalls={formData.golfBalls}
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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
