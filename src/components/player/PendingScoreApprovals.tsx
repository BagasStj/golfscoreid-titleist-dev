import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRetryMutation } from '../../hooks/useRetryMutation';
import { useToast } from '../shared/ToastContainer';
import type { Id } from '../../../convex/_generated/dataModel';
import { Check, X, User, Flag } from 'lucide-react';

export default function PendingScoreApprovals() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const pendingScores = useQuery(
    api.scores.getPendingScores,
    user ? { playerId: user._id as Id<'users'> } : 'skip'
  );

  const { mutate: approveMutation } = useRetryMutation(
    api.scores.approvePendingScore,
    {
      maxRetries: 3,
      onSuccess: () => {
        showSuccess('Skor disetujui! ✅', 1500);
      },
      onError: (error) => {
        showError(error.message || 'Gagal menyetujui skor');
      },
    }
  );

  const { mutate: rejectMutation } = useRetryMutation(
    api.scores.rejectPendingScore,
    {
      maxRetries: 3,
      onSuccess: () => {
        showSuccess('Skor ditolak', 1500);
      },
      onError: (error) => {
        showError(error.message || 'Gagal menolak skor');
      },
    }
  );

  const handleApprove = async (pendingScoreId: Id<'pending_scores'>) => {
    if (!user) return;
    await approveMutation({
      pendingScoreId,
      approvingUserId: user._id as Id<'users'>,
    });
  };

  const handleReject = async (pendingScoreId: Id<'pending_scores'>) => {
    if (!user) return;
    await rejectMutation({
      pendingScoreId,
      rejectingUserId: user._id as Id<'users'>,
    });
  };

  if (!pendingScores || pendingScores.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-2xl border border-gray-800 max-w-md w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Persetujuan Skor</h3>
              <p className="text-xs text-gray-400">
                {pendingScores.length} skor menunggu persetujuan
              </p>
            </div>
          </div>
        </div>

        {/* Pending Scores List */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          <div className="p-4 space-y-3">
            {pendingScores.map((score) => (
              <div
                key={score._id}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700 rounded-xl p-4 space-y-3"
              >
                {/* Score Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Diinput oleh:</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {score.scoringUserName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Tournament:</span>
                    <span className="text-sm font-semibold text-white">
                      {score.tournamentName}
                    </span>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-400">Hole</p>
                        <p className="text-2xl font-black text-white">
                          {score.holeNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Par</p>
                        <p className="text-xl font-bold text-gray-300">
                          {score.par}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Strokes</p>
                        <p className="text-2xl font-black text-blue-400">
                          {score.strokes}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-xs font-bold ${
                          score.strokes < score.par
                            ? 'text-green-400'
                            : score.strokes > score.par
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {score.strokes === score.par
                          ? 'Par'
                          : score.strokes < score.par
                          ? `${score.par - score.strokes} Under Par`
                          : `${score.strokes - score.par} Over Par`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(score._id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(score._id)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Setuju
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
