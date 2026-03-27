import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Activity, RefreshCw, Star, Download, Maximize2, Edit2, Save, X, Search } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import type { Id } from '../../../convex/_generated/dataModel';

export default function LiveMonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'special'>('all');
  const [isFullView, setIsFullView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const [editingScore, setEditingScore] = useState<{
    scoreId: Id<"scores">;
    playerId: Id<"users">;
    holeNumber: number;
    currentStrokes: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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

  // Mutation
  const adminUpdateScore = useMutation(api.scores.adminUpdateScore);

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
  
  // Search filter
  const filteredPlayers = monitoringData.players.filter((p: any) => 
    p.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create holes map for easy lookup
  const holesMap = new Map(holes.map(h => [h.holeNumber, h]));

  // Helper function to get score for a hole
  const getScoreForHole = (playerScorecard: any[], holeNumber: number) => {
    const score = playerScorecard.find(s => s.holeNumber === holeNumber);
    return score ? score.strokes : null;
  };

  // Helper function to get score object (including scoreId)
  const getScoreObjectForHole = (playerScorecard: any[], holeNumber: number) => {
    return playerScorecard.find(s => s.holeNumber === holeNumber);
  };

  // Handle edit score
  const handleEditScore = (playerId: Id<"users">, holeNumber: number, playerScorecard: any[]) => {
    const scoreObj = getScoreObjectForHole(playerScorecard, holeNumber);
    if (scoreObj && scoreObj.scoreId) {
      setEditingScore({
        scoreId: scoreObj.scoreId,
        playerId,
        holeNumber,
        currentStrokes: scoreObj.strokes,
      });
      setEditValue(scoreObj.strokes.toString());
    }
  };

  // Handle save edited score
  const handleSaveScore = async () => {
    if (!editingScore || !user) return;

    const newStrokes = parseInt(editValue);
    if (isNaN(newStrokes) || newStrokes <= 0) {
      alert('Stroke harus berupa angka positif');
      return;
    }

    try {
      await adminUpdateScore({
        scoreId: editingScore.scoreId,
        userId: user._id,
        newStrokes,
      });
      
      // Reset editing state
      setEditingScore(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating score:', error);
      alert(error instanceof Error ? error.message : 'Gagal memperbarui score');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingScore(null);
    setEditValue('');
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

    const exportData = filteredPlayers.map((player: any) => {
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
      row['Total Over/Under'] = completedHoles === 0 ? 0 : (totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver);

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Default styles for all cells (font size, borders)
    const defaultStyle = {
      font: { name: "Arial", sz: 11 },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      }
    };

    // Apply alignment styles
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
    // Column 0 is 'Nama Pemain'
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!worksheet[cellRef]) continue;

        // Base cell styles
        worksheet[cellRef].s = { ...defaultStyle };

        // Headers row (R === 0)
        if (R === 0) {
          worksheet[cellRef].s.font.bold = true;
          worksheet[cellRef].s.alignment = { horizontal: "center", vertical: "center" };
          worksheet[cellRef].s.fill = { fgColor: { rgb: "E0E0E0" } };
        } else {
          // Body rows (R > 0)
          // Column 0 (A) is Nama Pemain - left aligned
          if (C === 0) {
            worksheet[cellRef].s.alignment = { horizontal: "left", vertical: "center" };
          } else {
            // Other columns - center aligned
            worksheet[cellRef].s.alignment = { horizontal: "center", vertical: "center" };
          }
        }
      }
    }

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Pemain
    ];
    // Set other columns width based on header
    for (let C = 1; C <= range.e.c; ++C) {
      colWidths[C] = { wch: 15 };
    }
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Monitoring');

    const fileName = `${selectedTournament.name}_Live_Monitoring_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper function to get score color
  const getScoreColor = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (diff <= -2) return 'bg-[#fbbf24] text-black font-bold'; // Eagle or better
    if (diff === -1) return 'bg-[#22c55e] text-black font-bold'; // Birdie
    if (diff === 0) return 'bg-white text-black'; // Par
    if (diff === 1) return 'bg-[#DE1A58] text-white font-bold'; // Bogey
    return 'bg-[#CF0F0F] text-white font-bold'; // Double bogey or worse
  };

  return (
    <div className={`space-y-6 w-full ${isFullView ? 'fixed inset-0 z-50 bg-[#1a1a1a] overflow-auto p-6 min-w-full' : ''}`} style={!isFullView ? { minWidth: 0, overflowX: 'hidden' } : {}}>
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
                {filteredPlayers.length} Pemain
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

      {/* Search Bar */}
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4 flex items-center gap-3">
        <div className="bg-red-900/30 p-2 rounded-lg border border-red-800/40">
          <Search className="w-5 h-5 text-red-400" />
        </div>
        <input 
          type="text"
          placeholder="Cari berdasarkan nama pemain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium"
        />
      </div>

      {/* Scorecard Table - All Holes */}
      {activeTab === 'all' && (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 px-6 py-4 border-b border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Scorecard Langsung</h3>
              <span className="ml-2 px-2 py-1 bg-blue-900/40 text-blue-300 text-xs font-semibold rounded-full border border-blue-800/40">
                Hover untuk edit
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Update Otomatis</span>
            </div>
          </div>
        </div>

        <div 
          className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 relative"
          onScroll={handleScroll}
        >
          <table className="w-full text-sm min-w-max">
            <thead className="sticky top-0 z-20 shadow-md">
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/90 backdrop-blur-sm border-b-2 border-gray-700/60">
                <th className="sticky left-0 z-30 bg-gray-800/95 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-gray-700/60">
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
              <tr className="bg-gray-900/90 backdrop-blur-sm border-b-2 border-gray-700/60">
                <td className="sticky left-0 z-30 bg-gray-900/95 px-4 py-2 font-semibold text-gray-300 border-r-2 border-gray-700/60">
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

            <tbody className="divide-y divide-gray-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={is18Holes ? 25 : 14} className="px-4 py-12 text-center text-gray-400">
                    Belum ada pemain yang cocok
                  </td>
                </tr>
              ) : (
                (() => {
                  const ITEM_HEIGHT = 65; // Estimated row height
                  const CONTAINER_HEIGHT = 600;
                  const OVERSCAN = 10;
                  
                  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
                  const endIndex = Math.min(filteredPlayers.length - 1, Math.floor((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN);
                  
                  const paddingTop = Math.max(0, startIndex * ITEM_HEIGHT);
                  const paddingBottom = Math.max(0, (filteredPlayers.length - 1 - endIndex) * ITEM_HEIGHT);
                  
                  const visibleItems = filteredPlayers.slice(startIndex, endIndex + 1);

                  const visibleItemsMap = visibleItems.map((player: any, playerIndex: number) => {
                        const absoluteIndex = startIndex + playerIndex;
                        const completedHoles = countCompletedHoles(player.scorecard);
                        const totalOver = calculateTotalOver(player.scorecard, holesMap);
                        
                        return (
                          <tr 
                            key={player.playerId}
                            style={{ height: `${ITEM_HEIGHT}px` }}
                            className={`border-b border-gray-800/60 hover:bg-red-950/20 ${
                              absoluteIndex % 2 === 0 ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
                            }`}
                          >
                            <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-semibold text-white border-r-2 border-gray-800/60" title={player.playerName}>
                      <div>
                        <div className="font-bold">{player.playerName}</div>
                        {/* <div className="text-xs text-gray-400 mt-1">
                          Mulai: Hole {player.startHole} • Saat Ini: Hole {player.currentHole}
                        </div> */}
                      </div>
                    </td>
                    
                    {is18Holes ? (
                      <>
                        {/* Front 9 Scores */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => {
                          const score = getScoreForHole(player.scorecard, hole);
                          const par = holesMap.get(hole)?.par || 0;
                          const isEditing = editingScore?.playerId === player.playerId && editingScore?.holeNumber === hole;
                          
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-2xl relative group ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-12 px-1 py-1 bg-gray-900 border border-blue-500 text-white text-center rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveScore();
                                      if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveScore}
                                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                    title="Simpan"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                    title="Batal"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span>{score !== null ? score : '-'}</span>
                                  {score !== null && (
                                    <button
                                      onClick={() => handleEditScore(player.playerId, hole, player.scorecard)}
                                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-opacity"
                                      title="Edit Score"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
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
                          const isEditing = editingScore?.playerId === player.playerId && editingScore?.holeNumber === hole;
                          
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-lg relative group ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-12 px-1 py-1 bg-gray-900 border border-blue-500 text-white text-center rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveScore();
                                      if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveScore}
                                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                    title="Simpan"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                    title="Batal"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span>{score !== null ? score : '-'}</span>
                                  {score !== null && (
                                    <button
                                      onClick={() => handleEditScore(player.playerId, hole, player.scorecard)}
                                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-opacity"
                                      title="Edit Score"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
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
                          {completedHoles === 0 ? 0 : (totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver)}
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
                          const isEditing = editingScore?.playerId === player.playerId && editingScore?.holeNumber === hole;
                          
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-3 text-center font-bold text-lg relative group ${
                                score !== null ? getScoreColor(score, par) : 'text-white'
                              }`}
                            >
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-12 px-1 py-1 bg-gray-900 border border-blue-500 text-white text-center rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveScore();
                                      if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                  />
                                  <button
                                    onClick={handleSaveScore}
                                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                    title="Simpan"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                    title="Batal"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span>{score !== null ? score : '-'}</span>
                                  {score !== null && (
                                    <button
                                      onClick={() => handleEditScore(player.playerId, hole, player.scorecard)}
                                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-opacity"
                                      title="Edit Score"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-bold text-blue-400 bg-blue-950/40 border-l-2 border-gray-800/60 text-lg">
                          {player.totalScore || '-'}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-gray-800/60 text-lg">
                          {completedHoles === 0 ? 0 : (totalOver > 0 ? `+${totalOver}` : totalOver === 0 ? 'E' : totalOver)}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-gray-800/60 text-lg">
                          {completedHoles}/9
                        </td>
                      </>
                    )}
                  </tr>
                  );
                });

                return [
                  paddingTop > 0 ? <tr key="all-pad-top" style={{ height: `${paddingTop}px` }}><td colSpan={is18Holes ? 25 : 14} aria-hidden="true" /></tr> : null,
                  ...visibleItemsMap,
                  paddingBottom > 0 ? <tr key="all-pad-bot" style={{ height: `${paddingBottom}px` }}><td colSpan={is18Holes ? 25 : 14} aria-hidden="true" /></tr> : null
                ];
              })()
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
              <span className="ml-2 px-2 py-1 bg-blue-900/40 text-blue-300 text-xs font-semibold rounded-full border border-blue-800/40">
                Hover untuk edit
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Update Otomatis</span>
            </div>
          </div>
        </div>

        <div 
          className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-gray-900 relative"
          onScroll={handleScroll}
        >
          <table className="w-full text-sm min-w-max">
            <thead className="sticky top-0 z-20 shadow-md">
              {/* Hole Numbers Row */}
              <tr className="bg-gray-800/90 backdrop-blur-sm border-b-2 border-amber-900/40">
                <th className="sticky left-0 z-30 bg-gray-800/95 px-4 py-3 text-left font-bold text-gray-300 border-r-2 border-amber-900/40">
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
              <tr className="bg-gray-900/90 backdrop-blur-sm border-b-2 border-amber-900/40">
                <td className="sticky left-0 z-30 bg-gray-900/95 px-4 py-2 font-semibold text-gray-300 border-r-2 border-amber-900/40">
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

            <tbody className="divide-y divide-gray-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={specialHoles.length + 5} className="px-4 py-12 text-center text-gray-400">
                    Belum ada pemain yang cocok
                  </td>
                </tr>
              ) : (
                (() => {
                  const ITEM_HEIGHT = 65; // Estimated row height
                  const CONTAINER_HEIGHT = 600;
                  const OVERSCAN = 10;
                  
                  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
                  const endIndex = Math.min(filteredPlayers.length - 1, Math.floor((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN);
                  
                  const paddingTop = Math.max(0, startIndex * ITEM_HEIGHT);
                  const paddingBottom = Math.max(0, (filteredPlayers.length - 1 - endIndex) * ITEM_HEIGHT);
                  
                  const visibleItems = filteredPlayers.slice(startIndex, endIndex + 1);

                  const visibleItemsMap = visibleItems.map((player: any, playerIndex: number) => {
                        const absoluteIndex = startIndex + playerIndex;
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
                            style={{ height: `${ITEM_HEIGHT}px` }}
                            className={`border-b border-gray-800/60 hover:bg-amber-950/20 ${
                              absoluteIndex % 2 === 0 ? 'bg-[#1a1a1a]/60' : 'bg-[#2e2e2e]/40'
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
                      const isEditing = editingScore?.playerId === player.playerId && editingScore?.holeNumber === hole;
                      
                      return (
                        <td 
                          key={hole} 
                          className={`px-3 py-3 text-center font-bold text-lg relative group ${
                            score !== null ? getScoreColor(score, par) : 'text-white'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-12 px-1 py-1 bg-gray-900 border border-blue-500 text-white text-center rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveScore();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />
                              <button
                                onClick={handleSaveScore}
                                className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                title="Simpan"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                title="Batal"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-4xl">{score !== null ? score : '-'}</span>
                              {score !== null && (
                                <button
                                  onClick={() => handleEditScore(player.playerId, hole, player.scorecard)}
                                  className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-opacity"
                                  title="Edit Score"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="px-3 py-3 text-center font-bold text-amber-400 bg-amber-950/40 border-l-2 border-amber-900/40 text-2xl">
                      {calculateSpecialTotal(player.scorecard, specialHoles) || '-'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-purple-400 bg-purple-950/40 border-l-2 border-amber-900/40 text-lg">
                      {specialCompletedHoles === 0 ? 0 : (specialTotalOver > 0 ? `+${specialTotalOver}` : specialTotalOver === 0 ? 'E' : specialTotalOver)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-400 bg-orange-950/40 border-l-2 border-amber-900/40 text-lg">
                      {specialCompletedHoles}/{specialHoles.length}
                    </td>
                  </tr>
                        );
                      });

                  return [
                    paddingTop > 0 ? <tr key="spec-pad-top" style={{ height: `${paddingTop}px` }}><td colSpan={specialHoles.length + 5} aria-hidden="true" /></tr> : null,
                    ...visibleItemsMap,
                    paddingBottom > 0 ? <tr key="spec-pad-bot" style={{ height: `${paddingBottom}px` }}><td colSpan={specialHoles.length + 5} aria-hidden="true" /></tr> : null
                  ];
                })()
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
            <div className="w-8 h-8 bg-[#fbbf24] border border-amber-500 rounded flex items-center justify-center font-bold text-black">
              
            </div>
            <span className="text-gray-400">Eagle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] border border-green-600 rounded flex items-center justify-center font-bold text-black">
              
            </div>
            <span className="text-gray-400">Birdie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border border-gray-400 rounded flex items-center justify-center font-semibold text-black">
              
            </div>
            <span className="text-gray-400">Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#DE1A58] border border-pink-600 rounded flex items-center justify-center font-semibold text-white">
              
            </div>
            <span className="text-gray-400">Bogey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#CF0F0F] border border-red-700 rounded flex items-center justify-center font-semibold text-white">
              
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
