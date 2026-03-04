import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';
import { useRetryMutation } from '../../hooks/useRetryMutation';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import type { Id } from '../../../convex/_generated/dataModel';

export default function ScoringInterface() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedHole, setSelectedHole] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [lastSubmittedScore, setLastSubmittedScore] = useState<{
    hole: number;
    score: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    tournamentId && user ? {
      tournamentId: tournamentId as Id<'tournaments'>,
    } : 'skip'
  );
  
  const playerScores = useQuery(
    api.scores.getPlayerScores,
    tournamentId && user ? {
      tournamentId: tournamentId as Id<'tournaments'>,
      playerId: user._id as Id<'users'>,
    } : 'skip'
  );

  const { mutate: submitScoreMutation, isRetrying, retryCount } = useRetryMutation(
    api.scores.submitScore,
    {
      maxRetries: 3,
      onError: (_error, attempt) => {
        if (attempt < 3) {
          showError(`Retrying... (Attempt ${attempt + 1}/3)`);
        }
      },
      onSuccess: () => {
        showSuccess('Score submitted successfully!');
      },
    }
  );

  // Move early return after all hooks
  useEffect(() => {
    if (!tournamentId || !user) {
      navigate('/player');
    }
  }, [tournamentId, user, navigate]);

  // Don't render if no user or tournamentId
  if (!tournamentId || !user) {
    return null;
  }

  if (tournamentDetails === undefined || playerScores === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-green-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  const holesConfig = tournamentDetails.holesConfig;
  const scoredHoles = new Set(playerScores.map((s) => s.holeNumber));

  // Find current player's start hole
  const participant = tournamentDetails.flights
    ?.flatMap((f: any) => f.participants || [])
    .find((p: any) => p._id === user._id);
  const startHole = participant?.startHole || tournamentDetails.startHole;

  // Calculate next hole to play
  const totalHoles = holesConfig.length;
  const holesCompleted = playerScores.length;
  const currentHole =
    holesCompleted < totalHoles
      ? ((startHole + holesCompleted - 1) % totalHoles) + 1
      : null;

  const handleNumberPad = (digit: string) => {
    if (scoreInput.length < 2) {
      setScoreInput(scoreInput + digit);
    }
  };

  const handleClear = () => {
    setScoreInput('');
  };

  const handleUndo = () => {
    if (lastSubmittedScore) {
      setLastSubmittedScore(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedHole || !scoreInput || !user) return;

    const strokes = parseInt(scoreInput);
    if (strokes <= 0) {
      showError('Score must be a positive number');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitScoreMutation({
        tournamentId: tournamentId as Id<'tournaments'>,
        playerId: user._id as Id<'users'>,
        holeNumber: selectedHole,
        strokes,
      });

      setLastSubmittedScore({ hole: selectedHole, score: strokes });
      setScoreInput('');
      setSelectedHole(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-green-50 to-white page-transition">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/player')}
            className="flex items-center gap-2 text-grass-green-700 hover:text-grass-green-800 font-medium transition-colors min-h-[44px] min-w-[44px]"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/player/tournament/${tournamentId}/scorecard`)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Scorecard
            </button>
            <button
              onClick={() => navigate(`/player/tournament/${tournamentId}/leaderboard`)}
              className="px-4 py-2 bg-grass-green-600 text-white rounded-lg font-medium hover:bg-grass-green-700 transition-colors min-h-[44px]"
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* Tournament Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {tournamentDetails.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                {tournamentDetails.gameMode === 'strokePlay'
                  ? 'Stroke Play'
                  : tournamentDetails.gameMode === 'stableford'
                  ? 'Stableford'
                  : 'System 36'}
              </span>
              <span>•</span>
              <span>{tournamentDetails.courseType}</span>
              <span>•</span>
              <span>
                {holesCompleted}/{totalHoles} holes
              </span>
            </div>
          </div>

          {/* Current Hole Indicator */}
          {currentHole && (
            <div className="bg-grass-green-50 border-2 border-grass-green-500 rounded-lg p-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grass-green-700 font-medium">Current Hole</p>
                  <p className="text-3xl font-bold text-grass-green-800">Hole {currentHole}</p>
                </div>
                <button
                  onClick={() => setSelectedHole(currentHole)}
                  className="px-6 py-3 bg-grass-green-600 text-white font-semibold rounded-lg hover:bg-grass-green-700 transition-all hover:scale-105 active:scale-95 min-h-[44px]"
                >
                  Score Now
                </button>
              </div>
            </div>
          )}

          {/* Last Submitted Score */}
          {lastSubmittedScore && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between score-submit-feedback">
              <div>
                <p className="text-sm text-blue-700">Last submitted</p>
                <p className="text-lg font-semibold text-blue-800">
                  Hole {lastSubmittedScore.hole}: {lastSubmittedScore.score} strokes
                </p>
              </div>
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                Undo
              </button>
            </div>
          )}

          {/* Retry Indicator */}
          {isRetrying && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-pulse">
              <p className="text-sm text-yellow-800">
                Retrying submission... (Attempt {retryCount + 1}/3)
              </p>
            </div>
          )}

          {/* Hole Selection */}
          {selectedHole && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-scale-in">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Scoring Hole {selectedHole}
                </h3>
                {holesConfig
                  .filter((h) => h.holeNumber === selectedHole)
                  .map((hole) => (
                    <div key={hole.holeNumber} className="text-sm text-gray-600">
                      <span>Par {hole.par}</span>
                      <span className="mx-2">•</span>
                      <span>Index {hole.index}</span>
                    </div>
                  ))}
              </div>

              {/* Score Display */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Strokes</p>
                  <p className="text-5xl font-bold text-gray-800">
                    {scoreInput || '0'}
                  </p>
                </div>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberPad(num.toString())}
                    className="h-16 bg-white border-2 border-gray-300 rounded-lg text-2xl font-semibold text-gray-800 hover:bg-grass-green-50 hover:border-grass-green-500 active:bg-grass-green-100 transition-all active:scale-95 min-h-[44px] min-w-[44px]"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleClear}
                  className="h-14 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors min-h-[44px]"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!scoreInput || parseInt(scoreInput) <= 0 || isSubmitting}
                  className="h-14 bg-grass-green-600 text-white font-semibold rounded-lg hover:bg-grass-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 min-h-[44px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedHole(null);
                  setScoreInput('');
                }}
                className="w-full mt-3 h-12 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Hole Grid */}
          {!selectedHole && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Hole</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {holesConfig.map((hole) => {
                  const isScored = scoredHoles.has(hole.holeNumber);
                  const isCurrent = hole.holeNumber === currentHole;

                  return (
                    <button
                      key={hole.holeNumber}
                      onClick={() => !isScored && setSelectedHole(hole.holeNumber)}
                      disabled={isScored}
                      className={`h-20 rounded-lg font-semibold transition-all min-h-[44px] min-w-[44px] ${
                        isCurrent
                          ? 'bg-grass-green-600 text-white border-2 border-grass-green-700 ring-2 ring-grass-green-200'
                          : isScored
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-300 text-gray-800 hover:border-grass-green-500 hover:bg-grass-green-50 active:scale-95'
                      }`}
                    >
                      <div className="text-lg">{hole.holeNumber}</div>
                      <div className="text-xs">Par {hole.par}</div>
                      {isScored && <div className="text-xs">✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
