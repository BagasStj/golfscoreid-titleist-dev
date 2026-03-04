import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';
import type { Id } from '../../../convex/_generated/dataModel';
import { X, Save } from 'lucide-react';

interface EditTournamentModalProps {
  tournamentId: Id<'tournaments'>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTournamentModal({
  tournamentId,
  onClose,
  onSuccess,
}: EditTournamentModalProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    user ? { tournamentId, userId: user._id } : 'skip'
  );
  const updateTournament = useMutation(api.tournaments.updateTournament);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    courseType: '18holes' as '18holes' | 'F9' | 'B9',
    gameMode: 'strokePlay' as 'strokePlay' | 'system36' | 'stableford',
    scoringDisplay: 'over' as 'over' | 'stroke',
    specialScoringHoles: [] as number[],
    schedule: '',
    maleTeeBox: 'Blue' as 'Blue' | 'White' | 'Gold' | 'Black',
    femaleTeeBox: 'Red' as 'Red' | 'White' | 'Gold',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tournamentDetails) {
      const date = new Date(tournamentDetails.date);
      setFormData({
        name: tournamentDetails.name,
        description: tournamentDetails.description,
        date: date.toISOString().split('T')[0],
        courseType: tournamentDetails.courseType,
        gameMode: tournamentDetails.gameMode,
        scoringDisplay: tournamentDetails.scoringDisplay,
        specialScoringHoles: tournamentDetails.specialScoringHoles || [],
        schedule: tournamentDetails.schedule || '',
        maleTeeBox: tournamentDetails.maleTeeBox || 'Blue',
        femaleTeeBox: tournamentDetails.femaleTeeBox || 'Red',
      });
    }
  }, [tournamentDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateTournament({
        tournamentId,
        name: formData.name,
        description: formData.description,
        date: new Date(formData.date).getTime(),
        courseType: formData.courseType,
        gameMode: formData.gameMode,
        scoringDisplay: formData.scoringDisplay,
        specialScoringHoles: formData.specialScoringHoles,
        schedule: formData.schedule || undefined,
        maleTeeBox: formData.maleTeeBox,
        femaleTeeBox: formData.femaleTeeBox,
        userId: user._id,
      });

      showSuccess('Tournament updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpecialHole = (hole: number) => {
    setFormData((prev) => ({
      ...prev,
      specialScoringHoles: prev.specialScoringHoles.includes(hole)
        ? prev.specialScoringHoles.filter((h) => h !== hole)
        : [...prev.specialScoringHoles, hole].sort((a, b) => a - b),
    }));
  };

  const getAvailableHoles = () => {
    if (formData.courseType === 'F9') return Array.from({ length: 9 }, (_, i) => i + 1);
    if (formData.courseType === 'B9') return Array.from({ length: 9 }, (_, i) => i + 10);
    return Array.from({ length: 18 }, (_, i) => i + 1);
  };

  if (!tournamentDetails) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-2xl w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800/60 rounded w-1/3"></div>
            <div className="h-12 bg-gray-800/60 rounded"></div>
            <div className="h-12 bg-gray-800/60 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 p-6 text-white border-b border-red-900/40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Tournament</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors border border-red-800/40"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tournament Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 resize-none"
              required
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Susunan Acara / Schedule (Optional)
            </label>
            <textarea
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 resize-none"
              placeholder="Contoh:&#10;07:00 - Registration&#10;08:00 - Opening Ceremony&#10;08:30 - Shotgun Start&#10;14:00 - Lunch&#10;16:00 - Prize Giving"
            />
            <p className="text-xs text-gray-400 mt-1">
              Masukkan jadwal acara tournament (opsional)
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tournament Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Course Type & Game Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Course Type *
              </label>
              <select
                value={formData.courseType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseType: e.target.value as any,
                    specialScoringHoles: [],
                  })
                }
                className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                <option value="18holes">18 Holes</option>
                <option value="F9">Front 9</option>
                <option value="B9">Back 9</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Game Mode *
              </label>
              <select
                value={formData.gameMode}
                onChange={(e) => setFormData({ ...formData, gameMode: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                <option value="strokePlay">Stroke Play</option>
                <option value="system36">System 36</option>
                <option value="stableford">Stableford</option>
              </select>
            </div>
          </div>

          {/* Tee Box Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tee Box Laki-laki (Male) *
              </label>
              <select
                value={formData.maleTeeBox}
                onChange={(e) => setFormData({ ...formData, maleTeeBox: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                <option value="Blue">Blue Tee</option>
                <option value="White">White Tee</option>
                <option value="Gold">Gold Tee</option>
                <option value="Black">Black Tee</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Pilih tee box untuk pemain laki-laki
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tee Box Perempuan (Female) *
              </label>
              <select
                value={formData.femaleTeeBox}
                onChange={(e) => setFormData({ ...formData, femaleTeeBox: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              >
                <option value="Red">Red Tee</option>
                <option value="White">White Tee</option>
                <option value="Gold">Gold Tee</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Pilih tee box untuk pemain perempuan
              </p>
            </div>
          </div>

          {/* Special Scoring Holes */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Special Scoring Holes (Optional)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {getAvailableHoles().map((hole) => (
                <button
                  key={hole}
                  type="button"
                  onClick={() => toggleSpecialHole(hole)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    formData.specialScoringHoles.includes(hole)
                      ? 'bg-purple-600 text-white shadow-md border border-purple-500'
                      : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/60'
                  }`}
                >
                  {hole}
                </button>
              ))}
            </div>
            {formData.specialScoringHoles.length > 0 && (
              <p className="text-sm text-purple-400 mt-2">
                Selected: {formData.specialScoringHoles.join(', ')}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/60 bg-gray-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-gray-300 hover:bg-gray-800/60 rounded-lg font-medium transition-colors disabled:opacity-50 border border-gray-800/60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] border border-red-900/40 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
