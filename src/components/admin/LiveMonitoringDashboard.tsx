import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Activity, RefreshCw, Star } from 'lucide-react';

export default function LiveMonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');

  // Get active tournaments
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    user ? { userId: user._id } : 'skip'
  );

  // Filter only active tournaments
  const activeTournaments = tournaments?.filter((t) => t.status === 'active') || [];
  const selectedTournament = activeTournaments[0];

  // Get monitoring data
  const monitoringData = useQuery(
    api.monitoring.getLiveMonitoring,
    selectedTournament && user ? { tournamentId: selectedTournament._id, userId: user._id } : 'skip'
  );

  // Get holes config
  const holesConfig = useQuery(api.tournaments.getTournamentDetails, 
    selectedTournament && user ? { tournamentId: selectedTournament._id, userId: user._id } : 'skip'
  );

  if (tournaments === undefined || !selectedTournament) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-8">
        <div className="text-center">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Tournament</h3>
          <p className="text-gray-400">Start a tournament to see live monitoring</p>
        </div>
      </div>
    );
  }

  if (!monitoringData || !holesConfig) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800/60 rounded w-1/3"></div>
          <div className="h-64 bg-gray-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const holes = holesConfig.holesConfig || [];
  const is18Holes = selectedTournament.courseType === '18holes';
  const hasSpecialHoles = selectedTournament.specialScoringHoles && selectedTournament.specialScoringHoles.length > 0;
  const specialHoles = selectedTournament.specialScoringHoles || [];
  
  // Create holes map for easy lookup
  const holesMap = new Map(holes.map(h => [h.holeNumber, h]));

  // Helper function to get score for a hole
  const getScoreForHole = (playerScorecard: any[], holeNumber: number) => {
    const score = playerScorecard.find(s => s.holeNumber === holeNumber);
    return score ? score.strokes : null;
  };

  // Helper function to calculate total for 9 holes
  const calculateNineTotal = (playerScorecard: any[], startHole: number, endHole: number) => {
    let total = 0;
    for (let i = startHole; i <= endHole; i++) {
      const score = getScoreForHole(playerScorecard, i);
      if (score !== null) total += score;
    }
    return total;
  };

  // Helper function to calculate total for special holes
  const calculateSpecialTotal = (playerScorecard: any[], specialHolesList: number[]) => {
    let total = 0;
    for (const hole of specialHolesList) {
      const score = getScoreForHole(playerScorecard, hole);
      if (score !== null) total += score;
    }
    return total;
  };

  // Helper function to get score color
  const getScoreColor = (strokes: number, par: number) => {
    if (strokes < par) return 'bg-green-400 text-black font-bold'; // Birdie or better - bright green with black text
    if (strokes === par) return 'bg-gray-300 text-black'; // Par - light gray with black text
    if (strokes === par + 1) return 'bg-yellow-300 text-black'; // Bogey - bright yellow with black text
    return 'bg-red-400 text-black'; // Double bogey or worse - bright red with black text
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-xl shadow-[0_8px_24px_rgba(139,0,0,0.4)] p-6 text-white border border-red-900/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Monitoring</h2>
            <p className="text-gray-300 text-lg">{selectedTournament.name}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {selectedTournament.courseType === '18holes' ? '18 Holes' : selectedTournament.courseType === 'F9' ? 'Front 9' : 'Back 9'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {selectedTournament.gameMode === 'strokePlay' ? 'Stroke Play' : selectedTournament.gameMode === 'stableford' ? 'Stableford' : 'System 36'}
              </span>
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-sm text-gray-300">
              {monitoringData.players.length} Players
            </div>
          </div>
        </div>
      </div>

      {/* Tab Toggle for Special Holes */}
      {hasSpecialHoles && (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4">
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

      {/* Scorecard Table - All Holes */}
      {activeTab === 'all' && (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 px-6 py-4 border-b border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Live Scorecard</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auto-updating</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-gray-700/60">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-gray-700/60">
                  Player
                </th>
                {is18Holes ? (
                  <>
                    {/* Front 9 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
                      <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                        {hole}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-700/60 min-w-[50px]">
                      OUT
                    </th>
                    {/* Back 9 */}
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
                    {selectedTournament.courseType === 'F9' 
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
                          <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                            {hole}
                          </th>
                        ))
                      : [10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => (
                          <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[40px]">
                            {hole}
                          </th>
                        ))
                    }
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
                    {/* Front 9 Par */}
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
                    {/* Back 9 Par */}
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
                      {holes.reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </>
                ) : (
                  <>
                    {(selectedTournament.courseType === 'F9' 
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
                      {holes.reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {monitoringData.players.length === 0 ? (
                <tr>
                  <td colSpan={is18Holes ? 22 : 11} className="px-4 py-12 text-center text-gray-400">
                    No players registered yet
                  </td>
                </tr>
              ) : (
                monitoringData.players.map((player, playerIndex) => (
                  <tr 
                    key={player.playerId}
                    className={`border-b border-gray-800/60 hover:bg-red-950/20 ${
                      playerIndex % 2 === 0 ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-semibold text-white border-r-2 border-gray-800/60">
                      <div>
                        <div className="font-bold">{player.playerName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Start: Hole {player.startHole} • Current: Hole {player.currentHole}
                        </div>
                      </div>
                    </td>
                    
                    {is18Holes ? (
                      <>
                        {/* Front 9 Scores */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => {
                          const score = getScoreForHole(player.scorecard, hole);
                          const par = holesMap.get(hole)?.par || 0;
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {score !== null ? score : '-'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-bold text-green-400 bg-green-950/40 border-x-2 border-gray-800/60">
                          {calculateNineTotal(player.scorecard, 1, 9) || '-'}
                        </td>
                        
                        {/* Back 9 Scores */}
                        {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => {
                          const score = getScoreForHole(player.scorecard, hole);
                          const par = holesMap.get(hole)?.par || 0;
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {score !== null ? score : '-'}
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
                        {(selectedTournament.courseType === 'F9' 
                          ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
                          : [10, 11, 12, 13, 14, 15, 16, 17, 18]
                        ).map(hole => {
                          const score = getScoreForHole(player.scorecard, hole);
                          const par = holesMap.get(hole)?.par || 0;
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-lg ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {score !== null ? score : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Scorecard Table - Special Holes Only */}
      {activeTab === 'special' && hasSpecialHoles && (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/60 to-amber-800/60 px-6 py-4 border-b border-amber-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Special Holes Scorecard</h3>
              <span className="ml-2 px-2 py-1 bg-amber-700/60 text-amber-200 text-xs font-bold rounded-full border border-amber-600/40">
                {specialHoles.length} Holes
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auto-updating</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-amber-900/40">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-amber-900/40">
                  Player
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
              {monitoringData.players.length === 0 ? (
                <tr>
                  <td colSpan={specialHoles.length + 2} className="px-4 py-12 text-center text-gray-400">
                    No players registered yet
                  </td>
                </tr>
              ) : (
                monitoringData.players.map((player, playerIndex) => (
                  <tr 
                    key={player.playerId}
                    className={`border-b border-gray-800/60 hover:bg-amber-950/20 ${
                      playerIndex % 2 === 0 ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-semibold text-white border-r-2 border-amber-900/40">
                      <div>
                        <div className="font-bold">{player.playerName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Start: Hole {player.startHole} • Current: Hole {player.currentHole}
                        </div>
                      </div>
                    </td>
                    
                    {specialHoles.map(hole => {
                      const score = getScoreForHole(player.scorecard, hole);
                      const par = holesMap.get(hole)?.par || 0;
                      return (
                        <td 
                          key={hole} 
                          className={`px-3 py-3 text-center font-bold text-lg ${
                            score !== null ? getScoreColor(score, par) : 'text-white'
                          }`}
                        >
                          {score !== null ? score : '-'}
                        </td>
                      );
                    })}
                    
                    <td className="px-4 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 text-lg">
                      {calculateSpecialTotal(player.scorecard, specialHoles) || '-'}
                    </td>
                  </tr>
                ))
              )}
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
            <div className="w-8 h-8 bg-green-100 border border-green-200 rounded flex items-center justify-center font-bold text-green-800">
              3
            </div>
            <span className="text-gray-400">Birdie or Better</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center font-semibold text-gray-800">
              4
            </div>
            <span className="text-gray-400">Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 border border-yellow-200 rounded flex items-center justify-center font-semibold text-yellow-800">
              5
            </div>
            <span className="text-gray-400">Bogey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 border border-red-200 rounded flex items-center justify-center font-semibold text-red-800">
              6
            </div>
            <span className="text-gray-400">Double Bogey+</span>
          </div>
        </div>
      </div>

      {/* Live Update Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Real-time updates enabled
        </p>
      </div>
    </div>
  );
}
