import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Award, Trophy, Medal, TrendingUp, Calendar, Star } from 'lucide-react';
import { Card, Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

interface LeaderboardAdminProps {
  tournamentId?: Id<'tournaments'> | null;
}

export default function LeaderboardAdmin({ tournamentId: initialTournamentId }: LeaderboardAdminProps) {
  const { user: currentUser } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState<Id<'tournaments'> | null>(
    initialTournamentId || null
  );
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');

  // Get all tournaments for selection
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  // Get detailed leaderboard data with scorecards
  const detailedData = useQuery(
    api.leaderboard.getDetailedLeaderboard,
    selectedTournamentId ? { tournamentId: selectedTournamentId } : 'skip'
  );

  // Debug query to check data
  const debugData = useQuery(
    api.leaderboard.debugTournamentData,
    selectedTournamentId ? { tournamentId: selectedTournamentId } : 'skip'
  );

  // Log debug data
  if (debugData) {
    console.log('🔍 Debug Tournament Data:', {
      tournament: debugData.tournament?.name,
      participants: debugData.participantsCount,
      scores: debugData.scoresCount,
      holesConfig: debugData.holesConfigCount,
      details: debugData
    });
  }

  // Helper functions
  const getScoreColor = (strokes: number | null, par: number) => {
    if (strokes === null) return '';
    if (strokes < par) return 'bg-green-400 text-black font-bold';
    if (strokes === par) return 'bg-gray-300 text-black';
    if (strokes === par + 1) return 'bg-yellow-300 text-black';
    return 'bg-red-400 text-black';
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/50';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/50';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/50';
      default:
        return 'bg-secondary-100 text-secondary-700';
    }
  };

  const calculateNineTotal = (scorecard: any[], startHole: number, endHole: number) => {
    let total = 0;
    let count = 0;
    for (const hole of scorecard) {
      if (hole.holeNumber >= startHole && hole.holeNumber <= endHole && hole.strokes !== null) {
        total += hole.strokes;
        count++;
      }
    }
    return count > 0 ? total : null;
  };

  const calculateSpecialTotal = (scorecard: any[], specialHolesList: number[]) => {
    let total = 0;
    let count = 0;
    for (const hole of scorecard) {
      if (specialHolesList.includes(hole.holeNumber) && hole.strokes !== null) {
        total += hole.strokes;
        count++;
      }
    }
    return count > 0 ? total : null;
  };

  // Tournament selector
  if (!selectedTournamentId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-xl p-6 text-white shadow-[0_8px_24px_rgba(139,0,0,0.4)] border border-red-900/40">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Tournament Leaderboard</h2>
              <p className="text-gray-300 text-sm mt-1">
                Select a tournament to view its leaderboard
              </p>
            </div>
          </div>
        </div>

        {/* Tournament List */}
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          {!tournaments || tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Tournaments Available
              </h3>
              <p className="text-gray-400">
                Create a tournament first to view leaderboards
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Tournament
              </h3>
              {tournaments.map((tournament) => (
                <button
                  key={tournament._id}
                  onClick={() => setSelectedTournamentId(tournament._id)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-800/60 hover:border-red-800 hover:bg-red-950/20 transition-all group bg-[#1a1a1a]/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-red-500" />
                        <h4 className="font-semibold text-white group-hover:text-red-400">
                          {tournament.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(tournament.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          tournament.status === 'active'
                            ? 'bg-green-900/60 text-green-400 border border-green-800/40'
                            : tournament.status === 'upcoming'
                            ? 'bg-blue-900/60 text-blue-400 border border-blue-800/40'
                            : 'bg-gray-800/60 text-gray-400 border border-gray-700/40'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-red-500 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get selected tournament details
  const selectedTournament = tournaments?.find(t => t._id === selectedTournamentId);

  // Loading state
  if (detailedData === undefined) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedTournamentId(null)}
          className="flex items-center gap-2"
        >
          ← Back to Tournaments
        </Button>
        
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary-200 rounded-2xl"></div>
          <div className="h-64 bg-secondary-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (!detailedData) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedTournamentId(null)}
          className="flex items-center gap-2"
        >
          ← Back to Tournaments
        </Button>
        
        <Card variant="default" padding="lg">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Unable to Load Leaderboard
            </h3>
            <p className="text-secondary-600">
              There was an error loading the leaderboard data.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const { players, holesConfig, gameMode, courseType, tournament } = detailedData;
  const isPointsBased = gameMode !== 'strokePlay';
  const is18Holes = courseType === '18holes';
  const hasSpecialHoles = tournament.specialScoringHoles && tournament.specialScoringHoles.length > 0;
  const specialHoles = tournament.specialScoringHoles || [];

  // Create holes map
  const holesMap = new Map(holesConfig.map(h => [h.holeNumber, h]));

  // Show empty state if no data
  if (players.length === 0 && debugData) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedTournamentId(null)}
          className="flex items-center gap-2"
        >
          ← Back to Tournaments
        </Button>

        <Card variant="default" padding="lg">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No Leaderboard Data Yet
            </h3>
            <p className="text-secondary-600 mb-4">
              {debugData.scoresCount === 0 
                ? 'No scores have been submitted yet.'
                : debugData.participantsCount === 0
                ? 'No players registered in this tournament.'
                : 'Leaderboard data is being calculated.'}
            </p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
              <p className="font-semibold text-blue-900 mb-3">Tournament Status:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-secondary-600 mb-1">Players Registered</p>
                  <p className="text-2xl font-bold text-secondary-900">{debugData.participantsCount}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-secondary-600 mb-1">Scores Submitted</p>
                  <p className="text-2xl font-bold text-secondary-900">{debugData.scoresCount}</p>
                </div>
              </div>
              
              {debugData.participantsCount > 0 && debugData.scoresCount === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Tip:</strong> Players need to submit their scores through the Player Dashboard for the leaderboard to show data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Tournament Info */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setSelectedTournamentId(null)}
          className="flex items-center gap-2"
        >
          ← Back to Tournaments
        </Button>
        {selectedTournament && (
          <div className="text-right">
            <h3 className="font-semibold text-secondary-900">{selectedTournament.name}</h3>
            <p className="text-sm text-secondary-600">
              {new Date(selectedTournament.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-900/60 rounded-xl flex items-center justify-center border border-red-800/40">
              <Trophy className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Game Mode</p>
              <p className="text-lg font-bold text-white">
                {gameMode === 'strokePlay' ? 'Stroke Play' : gameMode === 'stableford' ? 'Stableford' : 'System 36'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-900/60 rounded-xl flex items-center justify-center border border-green-800/40">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Scoring System</p>
              <p className="text-lg font-bold text-white">
                {isPointsBased ? 'Points Based' : 'Stroke Based'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/60 rounded-xl flex items-center justify-center border border-blue-800/40">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Players</p>
              <p className="text-lg font-bold text-white">
                {players.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Toggle for Special Holes */}
      {hasSpecialHoles && (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Scorecard View</h3>
              <p className="text-sm text-gray-400">
                {activeTab === 'all' 
                  ? 'Showing all holes scorecard' 
                  : `Showing special holes only (${specialHoles.length} holes)`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-red-900/60 text-white shadow-md border border-red-900/40'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/40'
                }`}
              >
                <Trophy className="w-4 h-4" />
                All Holes
              </button>
              <button
                onClick={() => setActiveTab('special')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'special'
                    ? 'bg-red-900/60 text-white shadow-md border border-red-900/40'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/40'
                }`}
              >
                <Star className="w-4 h-4" />
                Special Holes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Scorecard Table - All Holes */}
      {activeTab === 'all' && (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 px-6 py-4 border-b border-red-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Trophy className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">Detailed Leaderboard</h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Complete scorecard with hole-by-hole breakdown
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-2 text-white text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Live</span>
            </div> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-gray-700/60">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-gray-700/60 min-w-[150px]">
                  Rank / Player
                </th>
                {is18Holes ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
                      <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                        {hole}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-700/60 min-w-[50px]">
                      OUT
                    </th>
                    {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => (
                      <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                        {hole}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-700/60 min-w-[50px]">
                      IN
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      TOTAL
                    </th>
                  </>
                ) : (
                  <>
                    {(courseType === 'F9' 
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
                      : [10, 11, 12, 13, 14, 15, 16, 17, 18]
                    ).map(hole => (
                      <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                        {hole}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      TOTAL
                    </th>
                  </>
                )}
              </tr>

              {/* Par Row */}
              <tr className="bg-gray-900/60 border-b-2 border-gray-700/60">
                <td className="sticky left-0 z-10 bg-gray-900/60 px-4 py-2 font-semibold text-gray-300 border-r-2 border-gray-700/60">
                  PAR
                </td>
                {is18Holes ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => {
                      const holeData = holesMap.get(hole);
                      return (
                        <td key={hole} className="px-3 py-2 text-center font-semibold text-gray-300">
                          {holeData?.par || '-'}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-700/60">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((sum, h) => sum + (holesMap.get(h)?.par || 0), 0)}
                    </td>
                    {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => {
                      const holeData = holesMap.get(hole);
                      return (
                        <td key={hole} className="px-3 py-2 text-center font-semibold text-gray-300">
                          {holeData?.par || '-'}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-700/60">
                      {[10, 11, 12, 13, 14, 15, 16, 17, 18].reduce((sum, h) => sum + (holesMap.get(h)?.par || 0), 0)}
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60">
                      {holesConfig.reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </>
                ) : (
                  <>
                    {(courseType === 'F9' 
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
                      : [10, 11, 12, 13, 14, 15, 16, 17, 18]
                    ).map(hole => {
                      const holeData = holesMap.get(hole);
                      return (
                        <td key={hole} className="px-3 py-2 text-center font-semibold text-gray-300">
                          {holeData?.par || '-'}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60">
                      {holesConfig.reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {players.map((player, playerIndex) => {
                const isTopThree = player.rank <= 3;
                const isEven = playerIndex % 2 === 0;

                return (
                  <tr
                    key={player.playerId}
                    className={`border-b border-gray-800/60 hover:bg-red-950/20 transition-all ${
                      isTopThree ? 'bg-red-950/30' : isEven ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 border-r-2 border-gray-800/60">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${getRankBadgeColor(player.rank)}`}
                        >
                          {player.rank}
                        </span>
                        {getMedalIcon(player.rank)}
                        <div>
                          <div className="font-semibold text-white">{player.playerName}</div>
                          <div className="text-xs text-gray-400">
                            {player.holesCompleted}/{holesConfig.length} holes
                          </div>
                        </div>
                      </div>
                    </td>

                    {is18Holes ? (
                      <>
                        {/* Front 9 */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(holeNum => {
                          const holeScore = player.scorecard.find(s => s.holeNumber === holeNum);
                          const par = holesMap.get(holeNum)?.par || 0;
                          return (
                            <td
                              key={holeNum}
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                holeScore?.strokes ? getScoreColor(holeScore.strokes, par) : 'text-white'
                              }`}
                            >
                              {holeScore?.strokes || '-'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-800/60">
                          {calculateNineTotal(player.scorecard, 1, 9) || '-'}
                        </td>

                        {/* Back 9 */}
                        {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(holeNum => {
                          const holeScore = player.scorecard.find(s => s.holeNumber === holeNum);
                          const par = holesMap.get(holeNum)?.par || 0;
                          return (
                            <td
                              key={holeNum}
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                holeScore?.strokes ? getScoreColor(holeScore.strokes, par) : 'text-white'
                              }`}
                            >
                              {holeScore?.strokes || '-'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-800/60">
                          {calculateNineTotal(player.scorecard, 10, 18) || '-'}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        {(courseType === 'F9' 
                          ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
                          : [10, 11, 12, 13, 14, 15, 16, 17, 18]
                        ).map(holeNum => {
                          const holeScore = player.scorecard.find(s => s.holeNumber === holeNum);
                          const par = holesMap.get(holeNum)?.par || 0;
                          return (
                            <td
                              key={holeNum}
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                holeScore?.strokes ? getScoreColor(holeScore.strokes, par) : 'text-white'
                              }`}
                            >
                              {holeScore?.strokes || '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Detailed Scorecard Table - Special Holes Only */}
      {activeTab === 'special' && hasSpecialHoles && (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/60 to-amber-800/60 px-6 py-4 border-b border-amber-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Star className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">Special Holes Leaderboard</h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Scorecard for {specialHoles.length} special scoring holes
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-2 text-white text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Live</span>
            </div> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-amber-900/40">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-amber-900/40 min-w-[150px]">
                  Rank / Player
                </th>
                {specialHoles.map(hole => (
                  <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[50px] bg-amber-950/20">
                    <div className="flex flex-col items-center">
                      <Star className="w-3 h-3 text-amber-400 mb-1" />
                      <span>{hole}</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 min-w-[60px]">
                  TOTAL
                </th>
              </tr>

              {/* Par Row */}
              <tr className="bg-gray-900/60 border-b-2 border-amber-900/40">
                <td className="sticky left-0 z-10 bg-gray-900/60 px-4 py-2 font-semibold text-gray-300 border-r-2 border-amber-900/40">
                  PAR
                </td>
                {specialHoles.map(hole => {
                  const holeData = holesMap.get(hole);
                  return (
                    <td key={hole} className="px-3 py-2 text-center font-semibold text-gray-300 bg-amber-950/20">
                      {holeData?.par || '-'}
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40">
                  {specialHoles.reduce((sum, h) => sum + (holesMap.get(h)?.par || 0), 0)}
                </td>
              </tr>
            </thead>

            <tbody>
              {players.map((player, playerIndex) => {
                const isTopThree = player.rank <= 3;
                const isEven = playerIndex % 2 === 0;

                return (
                  <tr
                    key={player.playerId}
                    className={`border-b border-gray-800/60 hover:bg-amber-950/20 transition-all ${
                      isTopThree ? 'bg-amber-950/30' : isEven ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 border-r-2 border-amber-900/40">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${getRankBadgeColor(player.rank)}`}
                        >
                          {player.rank}
                        </span>
                        {getMedalIcon(player.rank)}
                        <div>
                          <div className="font-semibold text-white">{player.playerName}</div>
                          <div className="text-xs text-gray-400">
                            {player.scorecard.filter(s => specialHoles.includes(s.holeNumber) && s.strokes !== null).length}/{specialHoles.length} holes
                          </div>
                        </div>
                      </div>
                    </td>

                    {specialHoles.map(holeNum => {
                      const holeScore = player.scorecard.find(s => s.holeNumber === holeNum);
                      const par = holesMap.get(holeNum)?.par || 0;
                      return (
                        <td
                          key={holeNum}
                          className={`px-3 py-3 text-center font-bold text-lg ${
                            holeScore?.strokes ? getScoreColor(holeScore.strokes, par) : 'text-white'
                          }`}
                        >
                          {holeScore?.strokes || '-'}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 text-lg">
                      {calculateSpecialTotal(player.scorecard, specialHoles) || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Legend */}
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4">
        <h4 className="font-semibold text-white mb-3">Score Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 border border-green-500 rounded flex items-center justify-center font-bold text-black">
              3
            </div>
            <span className="text-gray-400">Birdie or Better</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 border border-gray-400 rounded flex items-center justify-center font-semibold text-black">
              4
            </div>
            <span className="text-gray-400">Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-300 border border-yellow-400 rounded flex items-center justify-center font-semibold text-black">
              5
            </div>
            <span className="text-gray-400">Bogey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-400 border border-red-500 rounded flex items-center justify-center font-semibold text-black">
              6
            </div>
            <span className="text-gray-400">Double Bogey+</span>
          </div>
        </div>
      </div>

      {/* Live Update Indicator */}
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-green-900/30 p-4">
        <div className="flex items-center justify-center gap-2 text-green-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium">Live updates enabled - Refreshing automatically</span>
        </div>
      </div>
    </div>
  );
}
