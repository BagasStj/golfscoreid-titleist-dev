import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ChevronRight,
  Target,
  Award,
  Flag,
  Search,
} from 'lucide-react';

const TournamentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const tournaments = useQuery(
    api.tournaments.getPlayerTournaments,
    user ? { playerId: user._id } : 'skip'
  );

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Show tournament if: tournament is completed OR player has finished their scoring
  const completedTournaments = tournaments?.filter(
    t => t.status === 'completed' || t.scoringFinished === true
  ) || [];

  // Filter by search query
  const filteredTournaments = completedTournaments.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCourseTypeLabel = (courseType: string) => {
    switch (courseType) {
      case '18holes': return '18 Hole';
      case 'F9': return 'Front 9';
      case 'B9': return 'Back 9';
      default: return courseType;
    }
  };

  const getGameModeLabel = (gameMode: string) => {
    switch (gameMode) {
      case 'strokePlay': return 'Stroke Play';
      case 'system36': return 'System 36';
      case 'stableford': return 'Stableford';
      case 'peoria': return 'Peoria';
      default: return gameMode;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex flex-col">
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 shadow-2xl border-b border-gray-800/60 bg-gradient-to-b from-[#1f1f1f] to-[#141414]">
        <div className="flex items-center px-4 pt-4 pb-3">
          <button
            onClick={() => navigate('/player?tab=profile')}
            className="text-white hover:bg-white/10 rounded-full p-2 transition-all mr-3 flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">Riwayat Turnamen</h2>
            <p className="text-gray-400 text-sm">
              {tournaments === undefined
                ? 'Memuat...'
                : `${completedTournaments.length} turnamen${completedTournaments.length !== 1 ? '' : ''} selesai`}
            </p>
          </div>
          {/* Summary badge */}
          {completedTournaments.length > 0 && (
            <div className="flex-shrink-0 bg-red-600/20 border border-red-600/40 rounded-lg px-3 py-1.5 text-center">
              <p className="text-red-400 font-bold text-lg leading-none">{completedTournaments.length}</p>
              <p className="text-red-400/70 text-[10px]">Selesai</p>
            </div>
          )}
        </div>

        {/* Search bar */}
        {completedTournaments.length > 0 && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari nama turnamen atau lokasi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-gray-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-3 pb-8">
          {tournaments === undefined ? (
            /* Loading state */
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-400 mt-4 text-sm">Memuat data turnamen...</p>
            </div>
          ) : completedTournaments.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-300 text-lg font-semibold mb-2">Belum Ada Riwayat</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Turnamen yang telah selesai akan muncul di sini. Ikuti turnamen dan selesaikan permainan!
              </p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            /* No search results */
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-base font-semibold">Tidak ditemukan</p>
              <p className="text-gray-500 text-sm mt-1">Coba kata kunci yang berbeda</p>
            </div>
          ) : (
            /* Tournament list */
            <div className="space-y-3">
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament._id}
                  tournament={tournament}
                  formatDate={formatDate}
                  getCourseTypeLabel={getCourseTypeLabel}
                  getGameModeLabel={getGameModeLabel}
                  onClick={() => navigate(`/player/tournament/${tournament._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TournamentCard: React.FC<{
  tournament: any;
  formatDate: (ts: number) => string;
  getCourseTypeLabel: (ct: string) => string;
  getGameModeLabel: (gm: string) => string;
  onClick: () => void;
}> = ({ tournament, formatDate, getCourseTypeLabel, getGameModeLabel, onClick }) => {
  const getRankLabel = (rank: number) => {
    if (rank === 1) return { label: '🥇 Juara 1', color: 'from-yellow-500 to-yellow-600 border-yellow-500/40' };
    if (rank === 2) return { label: '🥈 Juara 2', color: 'from-gray-400 to-gray-500 border-gray-400/40' };
    if (rank === 3) return { label: '🥉 Juara 3', color: 'from-amber-600 to-amber-700 border-amber-600/40' };
    return { label: `# ${rank}`, color: 'from-blue-600 to-blue-700 border-blue-600/40' };
  };

  const rankInfo = tournament.playerRank ? getRankLabel(tournament.playerRank) : null;

  // Status label: differentiate between player-finished vs tournament-completed
  const statusLabel = tournament.status === 'completed'
    ? { text: '🏁 Turnamen Selesai', cls: 'bg-green-900/40 text-green-300 border-green-700/50' }
    : { text: '✅ Skor Selesai', cls: 'bg-blue-900/40 text-blue-300 border-blue-700/50' };

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-b from-[#242424] to-[#181818] rounded-2xl border border-gray-800/60 hover:border-red-500/40 transition-all text-left overflow-hidden shadow-lg active:scale-[0.99]"
    >
      {/* Banner image if available */}
      {tournament.bannerUrl && (
        <div className="relative w-full h-28 overflow-hidden">
          <img
            src={tournament.bannerUrl}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/40 to-transparent" />
          {/* Rank badge on banner */}
          {rankInfo && (
            <div className={`absolute top-3 right-3 bg-gradient-to-r ${rankInfo.color} border text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>
              {rankInfo.label}
            </div>
          )}
          {/* Status badge on banner */}
          <div className={`absolute top-3 left-3 backdrop-blur-sm border text-xs font-semibold px-2.5 py-1 rounded-full ${statusLabel.cls}`}>
            {statusLabel.text}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Top row: title + status/rank */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">
              {tournament.name}
            </h4>
            {tournament.location && (
              <div className="flex items-center text-gray-400 text-xs">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-red-500" />
                <span className="truncate">{tournament.location}</span>
              </div>
            )}
          </div>
          {/* Status / rank badge — only show if no banner (already shown on banner) */}
          {!tournament.bannerUrl && (
            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusLabel.cls}`}>
                {statusLabel.text}
              </span>
              {rankInfo && (
                <span className={`bg-gradient-to-r ${rankInfo.color} border text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
                  {rankInfo.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Calendar className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span>{formatDate(tournament.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Users className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span>{tournament.participantCount ?? 0} Peserta</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span>{getCourseTypeLabel(tournament.courseType)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Target className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span>{getGameModeLabel(tournament.gameMode)}</span>
          </div>
        </div>

        {/* Player score summary if available */}
        {tournament.playerHolesPlayed > 0 && (
          <div className="mb-3 bg-white/5 border border-gray-700/40 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-gray-400 text-xs">Total Skor Kamu</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-sm">{tournament.playerTotalStrokes} strokes</span>
              <span className="text-gray-500 text-xs">{tournament.playerHolesPlayed} hole</span>
            </div>
          </div>
        )}

        {/* Prize info if available */}
        {tournament.prize && (
          <div className="mb-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <span className="text-yellow-300 text-xs font-medium truncate">{tournament.prize}</span>
          </div>
        )}

        {/* Footer row: tee box info + chevron */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-800/60">
          <div className="flex items-center gap-2 flex-wrap">
            {tournament.maleTeeBox && (
              <span className="text-xs text-gray-500">
                Pria: <span className="text-gray-300 font-medium">{tournament.maleTeeBox}</span>
              </span>
            )}
            {tournament.femaleTeeBox && (
              <span className="text-xs text-gray-500">
                Wanita: <span className="text-gray-300 font-medium">{tournament.femaleTeeBox}</span>
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
        </div>
      </div>
    </button>
  );
};

export default TournamentHistoryPage;
