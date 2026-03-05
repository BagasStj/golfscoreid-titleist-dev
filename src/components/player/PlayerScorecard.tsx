import { useQuery } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import ScoreClassificationBadge from '../shared/ScoreClassificationBadge';
import { ChevronLeft } from 'lucide-react';

export default function PlayerScorecard() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-800 rounded"></div>
                <div className="h-16 bg-gray-800 rounded"></div>
                <div className="h-16 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const holesConfig = tournamentDetails.holesConfig;
  const totalHoles = holesConfig.length;
  const holesCompleted = playerScores.length;

  // Calculate running total
  let runningTotal = 0;
  let runningPoints = 0;
  const isPointsBased = tournamentDetails.gameMode !== 'strokePlay';

  playerScores.forEach((score) => {
    runningTotal += score.strokes;
    if (isPointsBased && score.points !== undefined) {
      runningPoints += score.points;
    }
  });

  // Find current player's start hole
  const participant = tournamentDetails.flights
    ?.flatMap((f: any) => f.participants || [])
    .find((p: any) => p._id === user._id);
  const startHole = participant?.startHole || tournamentDetails.startHole;

  // Calculate current hole
  const currentHole =
    holesCompleted < totalHoles
      ? ((startHole + holesCompleted - 1) % totalHoles) + 1
      : null;

  // Separate completed and remaining holes
  const scoredHoleNumbers = new Set(playerScores.map((s) => s.holeNumber));
  const remainingHoles = holesConfig.filter(
    (h) => !scoredHoleNumbers.has(h.holeNumber)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(`/player/tournament/${tournamentId}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white transition-colors active:scale-95"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Kembali ke Detail Tournament</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Tournament Header */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 p-4" style={{ backgroundColor: '#1a1a1a' }}>
            <h2 className="text-xl font-bold text-white mb-1">
              {tournamentDetails.name}
            </h2>
            <p className="text-sm text-gray-400">Your Scorecard</p>
          </div>

          {/* Progress Summary */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black border border-gray-800 rounded-xl p-4 shadow-xl" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {holesCompleted}/{totalHoles}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  {isPointsBased ? 'Points' : 'Strokes'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {isPointsBased ? runningPoints : runningTotal}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Current</p>
                <p className="text-2xl font-bold text-white">
                  {currentHole ? `#${currentHole}` : 'Done'}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Holes */}
          {playerScores.length > 0 && (
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="bg-gradient-to-r from-red-900/20 to-transparent border-b border-gray-800 px-4 py-3">
                <h3 className="text-lg font-semibold text-white">
                  Completed Holes
                </h3>
              </div>
              <div className="divide-y divide-gray-800">
                {playerScores.map((score) => (
                  <div
                    key={score._id}
                    className={`p-4 transition-colors ${
                      score.holeNumber === currentHole ? 'bg-red-900/20' : 'hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                            score.holeNumber === currentHole
                              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
                              : 'bg-gray-800 text-white border border-gray-700'
                          }`}
                        >
                          {score.holeNumber}
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">
                            Par {score.par} • Index {score.index}
                          </div>
                          <div className="mt-1">
                            <ScoreClassificationBadge
                              score={score.strokes}
                              par={score.par}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {score.strokes}
                        </div>
                        {isPointsBased && score.points !== undefined && (
                          <div className="text-sm text-red-400 font-medium">
                            {score.points} pts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining Holes */}
          {remainingHoles.length > 0 && (
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-3">
                <h3 className="text-lg font-semibold text-white">
                  Remaining Holes ({remainingHoles.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {remainingHoles.map((hole) => {
                    const isCurrent = hole.holeNumber === currentHole;
                    return (
                      <div
                        key={hole.holeNumber}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isCurrent
                            ? 'border-red-500 bg-red-900/20 shadow-lg'
                            : 'border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        <div
                          className={`text-lg font-bold ${
                            isCurrent ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {hole.holeNumber}
                        </div>
                        <div className="text-xs text-gray-400">Par {hole.par}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {holesCompleted === totalHoles && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-2 border-red-600 rounded-xl p-6 text-center shadow-xl">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white mb-1">
                Round Complete!
              </h3>
              <p className="text-gray-300">
                You've completed all {totalHoles} holes. Check the leaderboard to see your
                ranking!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
