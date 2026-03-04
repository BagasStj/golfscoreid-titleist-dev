import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from 'lucide-react';

const TournamentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  // Filter only completed tournaments
  const completedTournaments = tournaments?.filter(t => t.status === 'completed') || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex flex-col">
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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
      <div className="flex-shrink-0  shadow-2xl border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate('/player?tab=profile')}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-white font-bold text-xl">Tournament History</h2>
            <p className="text-red-100 text-sm">
              {completedTournaments.length} completed tournaments
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-4 pb-8">
          {!tournaments ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading data...</p>
            </div>
          ) : completedTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-semibold">No tournament history yet</p>
              <p className="text-gray-500 text-sm mt-2">Completed tournaments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament._id} 
                  tournament={tournament} 
                  formatDate={formatDate}
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

const TournamentCard: React.FC<any> = ({ tournament, formatDate, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-red-500/50 transition-all text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-1">{tournament.name}</h4>
          <div className="flex items-center text-gray-400 text-sm mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            {tournament.location || 'Lokasi tidak tersedia'}
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
          COMPLETED
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-800">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2 text-red-500" />
          {formatDate(tournament.date)}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Users className="w-4 h-4 mr-2 text-red-500" />
          {tournament.participantCount || 0} Pemain
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex items-center space-x-4 text-xs">
          <span className="text-gray-400">
            <span className="text-red-400 font-semibold">{tournament.courseType}</span>
          </span>
          <span className="text-gray-400">
            <span className="text-red-400 font-semibold">
              {tournament.gameMode === 'strokePlay' ? 'Stroke Play' : 
               tournament.gameMode === 'stableford' ? 'Stableford' : 'System 36'}
            </span>
          </span>
        </div>
        {tournament.playerRank && (
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              #{tournament.playerRank}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default TournamentHistoryPage;
