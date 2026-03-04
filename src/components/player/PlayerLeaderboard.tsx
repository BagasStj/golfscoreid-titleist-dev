import { useQuery } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';

export default function PlayerLeaderboard() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const leaderboardData = useQuery(
    api.leaderboard.getLeaderboard,
    tournamentId && user ? {
      tournamentId: tournamentId as Id<'tournaments'>,
    } : 'skip'
  );
  
  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    tournamentId && user ? {
      tournamentId: tournamentId as Id<'tournaments'>,
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

  if (leaderboardData === undefined || tournamentDetails === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black" style={{ backgroundColor: '#0f0f0f' }}>
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

  const { allHolesRanking, gameMode } = leaderboardData;
  const isPointsBased = gameMode !== 'strokePlay';

  // Find current player's entry
  const currentPlayerEntry = allHolesRanking.find(
    (entry) => entry.playerId === user._id
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black page-transition" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Navigation */}
        {/* <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/player/tournament/${tournamentId}`)}
            className="flex items-center gap-2 text-white hover:text-red-500 font-medium transition-colors min-h-[44px]"
          >
            <span className="text-xl">←</span>
            <span>Back to Scoring</span>
          </button>
          <button
            onClick={() => navigate(`/player/tournament/${tournamentId}/scorecard`)}
            className="px-4 py-2 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black border border-gray-800 text-white rounded-lg font-medium hover:border-gray-700 transition-colors min-h-[44px]"
          >
            Scorecard
          </button>
        </div> */}

        <div className="space-y-6 animate-fade-in">
          {/* Tournament Header */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 p-4" style={{ backgroundColor: '#1a1a1a' }}>
            <h2 className="text-xl font-bold text-white mb-1">
              {tournamentDetails.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                {gameMode === 'strokePlay'
                  ? 'Stroke Play'
                  : gameMode === 'stableford'
                  ? 'Stableford'
                  : 'System 36'}
              </span>
              <span>•</span>
              <span>{isPointsBased ? 'Points (Higher is Better)' : 'Strokes (Lower is Better)'}</span>
            </div>
          </div>

          {/* Current Player Position */}
          {currentPlayerEntry && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-2 border-red-600 rounded-xl p-4 animate-scale-in shadow-xl">
              <p className="text-sm text-red-400 font-medium mb-2">Your Position</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold">{currentPlayerEntry.rank}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {currentPlayerEntry.playerName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentPlayerEntry.holesCompleted} holes completed
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-bold text-white">
                    {currentPlayerEntry.totalScore}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isPointsBased ? 'points' : 'strokes'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="bg-gradient-to-r from-red-900/20 to-transparent border-b border-gray-800 px-4 py-3">
              <h3 className="text-lg font-semibold text-white">
                Tournament Leaderboard
              </h3>
            </div>

            {allHolesRanking.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No scores submitted yet
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {allHolesRanking.map((entry, index) => {
                  const isCurrentPlayer = entry.playerId === user._id;
                  const isTopThree = entry.rank <= 3;

                  const rankColors = {
                    1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    2: 'bg-gray-100 text-gray-800 border-gray-300',
                    3: 'bg-orange-100 text-orange-800 border-orange-300',
                  };

                  return (
                    <div
                      key={entry.playerId}
                      className={`p-4 transition-all leaderboard-update ${
                        isCurrentPlayer
                          ? 'bg-gradient-to-r from-red-900/20 to-transparent border-l-4 border-red-600'
                          : isTopThree
                          ? 'bg-yellow-900/10'
                          : 'hover:bg-gray-800/30'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Rank Badge */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                              isTopThree
                                ? rankColors[entry.rank as keyof typeof rankColors]
                                : 'bg-gray-800 text-white border-gray-700'
                            }`}
                          >
                            {entry.rank}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold truncate ${
                                isCurrentPlayer ? 'text-white' : 'text-gray-200'
                              }`}
                            >
                              {entry.playerName}
                              {isCurrentPlayer && (
                                <span className="ml-2 text-xs bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded shadow-lg">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-400">
                              {entry.holesCompleted} holes
                            </p>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right ml-4">
                          <p
                            className={`text-2xl font-bold ${
                              isCurrentPlayer ? 'text-white' : 'text-gray-200'
                            }`}
                          >
                            {entry.totalScore}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isPointsBased ? 'pts' : 'strokes'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Update Indicator */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
              Live updates enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
