import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Activity, RefreshCw, Star, Download, Maximize2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LiveMonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');
  const [isFullView, setIsFullView] = useState(false);

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

  // Helper function to count completed holes
  const countCompletedHoles = (playerScorecard: any[]) => {
    return playerScorecard.filter(s => s.strokes !== null && s.strokes !== undefined).length;
  };

  // Helper function to calculate total over/under par
  const calculateTotalOver = (playerScorecard: any[], holesMap: Map<number, any>) => {
    let totalOver = 0;
    for (const score of playerScorecard) {
      if (score.strokes !== null && score.strokes !== undefined) {
        const holeData = holesMap.get(score.holeNumber);
        if (holeData) {
          totalOver += score.strokes - holeData.par;
        }
      }
    }
    return totalOver;
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (!monitoringData || !selectedTournament) return;

    const exportData = monitoringData.players.map(player => {
      const completedHoles = countCompletedHoles(player.scorecard);
      const totalOver = calculateTotalOver(player.scorecard, holesMap);
      
      const row: any = {
        'Nama Pemain': player.playerName,
      };

      // Add individual hole scores
      if (activeTab === 'all') {
        if (is18Holes) {
          for (let i = 1; i <= 18; i++) {
            const score = getScoreForHole(player.scorecard, i);
            row[`Hole ${i}`] = score !== null ? score : '-';
          }
        } else {
          const holeRange = selectedTournament.courseType === 'F9' 
            ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
            : [10, 11, 12, 13, 14, 15, 16, 17, 18];
          holeRange.forEach(hole => {
            const score = getScoreForHole(player.scorecard, hole);
            row[`Hole ${hole}`] = score !== null ? score : '-';
          });
        }
      } else if (activeTab === 'special' && hasSpecialHoles) {
        specialHoles.forEach(hole => {
          const score = getScoreForHole(player.scorecard, hole);
          row[`Hole ${hole} (Special)`] = score !== null ? score : '-';
        });
      }

      // Add summary columns at the end
      row['Hole Selesai'] = completedHoles;
      row['Total Stroke'] = player.totalScore || 0;
      row['Total Over/Under'] = totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Monitoring');

    const fileName = `${selectedTournament.name}_Live_Monitoring_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper function to get score color
  const getScoreColor = (strokes: number, par: number) => {
    if (strokes < par) return 'bg-green-400 text-black font-bold'; // Birdie or better - bright green with black text
    if (strokes === par) return 'bg-gray-300 text-black'; // Par - light gray with black text
    if (strokes === par + 1) return 'bg-yellow-300 text-black'; // Bogey - bright yellow with black text
    return 'bg-red-400 text-black'; // Double bogey or worse - bright red with black text
  };

  return (
    <div className={`space-y-6 ${isFullView ? 'fixed inset-0 z-50 bg-[#1a1a1a] overflow-auto p-6' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-xl shadow-[0_8px_24px_rgba(139,0,0,0.4)] p-6 text-white border border-red-900/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Monitoring Langsung</h2>
            <p className="text-gray-300 text-lg">{selectedTournament.name}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {selectedTournament.courseType === '18holes' ? '18 Hole' : selectedTournament.courseType === 'F9' ? '9 Hole Depan' : '9 Hole Belakang'}
              </span>
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-sm text-gray-300">
                {monitoringData.players.length} Pemain
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={() => setIsFullView(!isFullView)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md"
              >
                <Maximize2 className="w-4 h-4" />
                {isFullView ? 'Tutup' : 'Full View'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Toggle for Special Holes */}
      {hasSpecialHoles && (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Tampilan Scorecard</h3>
              <p className="text-sm text-gray-400">
                {activeTab === 'all' 
                  ? 'Menampilkan semua hole' 
                  : `Menampilkan hole spesial saja (${specialHoles.length} hole)`}
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
                Semua Hole
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
                Hole Spesial
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
              <h3 className="text-lg font-bold text-white">Scorecard Langsung</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Update Otomatis</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-gray-700/60">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-gray-700/60">
                  Pemain
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
                    <th className="px-3 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      TOTAL
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      OVER
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      SELESAI
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
                    <th className="px-3 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      TOTAL
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      OVER
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-gray-700/60 min-w-[60px]">
                      SELESAI
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
                  <td colSpan={is18Holes ? 25 : 14} className="px-4 py-12 text-center text-gray-400">
                    Belum ada pemain terdaftar
                  </td>
                </tr>
              ) : (
                monitoringData.players.map((player, playerIndex) => {
                  const completedHoles = countCompletedHoles(player.scorecard);
                  const totalOver = calculateTotalOver(player.scorecard, holesMap);
                  
                  return (
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
                          Mulai: Hole {player.startHole} • Saat Ini: Hole {player.currentHole}
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
                        
                        <td className="px-3 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-gray-800/60 text-lg">
                          {totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-gray-800/60 text-lg">
                          {completedHoles}/18
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
                        <td className="px-3 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-gray-800/60 text-lg">
                          {totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-gray-800/60 text-lg">
                          {completedHoles}/9
                        </td>
                      </>
                    )}
                  </tr>
                  );
                })
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
              <h3 className="text-lg font-bold text-white">Scorecard Hole Spesial</h3>
              <span className="ml-2 px-2 py-1 bg-amber-700/60 text-amber-200 text-xs font-bold rounded-full border border-amber-600/40">
                {specialHoles.length} Hole
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Update Otomatis</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/80 border-b-2 border-amber-900/40">
                <th className="sticky left-0 z-10 bg-gray-800/80 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-amber-900/40">
                  Pemain
                </th>
                {specialHoles.map(hole => (
                  <th key={hole} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[50px] bg-amber-950/20">
                    <div className="flex flex-col items-center">
                      <Star className="w-3 h-3 text-amber-400 mb-1" />
                      <span>{hole}</span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 min-w-[60px]">
                  TOTAL
                </th>
                <th className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-amber-900/40 min-w-[60px]">
                  OVER
                </th>
                <th className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-amber-900/40 min-w-[60px]">
                  SELESAI
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
                  <td colSpan={specialHoles.length + 5} className="px-4 py-12 text-center text-gray-400">
                    Belum ada pemain terdaftar
                  </td>
                </tr>
              ) : (
                monitoringData.players.map((player, playerIndex) => {
                  const specialCompletedHoles = specialHoles.filter(hole => 
                    getScoreForHole(player.scorecard, hole) !== null
                  ).length;
                  
                  // Calculate over/under for special holes only
                  let specialTotalOver = 0;
                  for (const hole of specialHoles) {
                    const score = getScoreForHole(player.scorecard, hole);
                    if (score !== null) {
                      const holeData = holesMap.get(hole);
                      if (holeData) {
                        specialTotalOver += score - holeData.par;
                      }
                    }
                  }
                  
                  return (
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
                          Mulai: Hole {player.startHole} • Saat Ini: Hole {player.currentHole}
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
                    
                    <td className="px-3 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 text-lg">
                      {calculateSpecialTotal(player.scorecard, specialHoles) || '-'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-amber-900/40 text-lg">
                      {specialTotalOver > 0 ? `+${specialTotalOver}` : specialTotalOver === 0 ? 'E' : specialTotalOver}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-amber-900/40 text-lg">
                      {specialCompletedHoles}/{specialHoles.length}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Legend */}
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4">
        <h4 className="font-semibold text-white mb-3">Legenda Skor</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 border border-green-500 rounded flex items-center justify-center font-bold text-black">
              3
            </div>
            <span className="text-gray-400">Eagle</span>
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
            <span className="text-gray-400"> Bogey+</span>
          </div>
        </div>
      </div>

      {/* Live Update Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Update real-time aktif
        </p>
      </div>
    </div>
  );
}
