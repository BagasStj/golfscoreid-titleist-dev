import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import { X, Calendar, Users, Trophy, MapPin, Target, Eye, EyeOff } from 'lucide-react';

interface TournamentDetailsModalProps {
  tournamentId: Id<'tournaments'>;
  onClose: () => void;
}

export default function TournamentDetailsModal({
  tournamentId,
  onClose,
}: TournamentDetailsModalProps) {
  const { user } = useAuth();
  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    user ? { tournamentId, userId: user._id } : 'skip'
  );

  if (!tournamentDetails) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-4xl w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800/60 rounded w-1/3"></div>
            <div className="h-24 bg-gray-800/60 rounded"></div>
            <div className="h-24 bg-gray-800/60 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const tournamentDate = new Date(tournamentDetails.date);
  const statusColors = {
    upcoming: 'bg-blue-900/60 text-blue-400 border-blue-800/40',
    active: 'bg-green-900/60 text-green-400 border-green-800/40',
    completed: 'bg-gray-800/60 text-gray-400 border-gray-700/40',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 p-6 text-white border-b border-red-900/40">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{tournamentDetails.name}</h2>
              </div>
              <p className="text-gray-300 text-sm">{tournamentDetails.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors border border-red-800/40"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tournament Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900/60 rounded-lg flex items-center justify-center border border-blue-800/40">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tanggal Tournament</p>
                  <p className="font-semibold text-white">
                    {tournamentDate.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-900/60 rounded-lg flex items-center justify-center border border-purple-800/40">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border capitalize ${
                      statusColors[tournamentDetails.status as keyof typeof statusColors]
                    }`}
                  >
                    {tournamentDetails.status === 'upcoming' ? 'Akan Datang' : 
                     tournamentDetails.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Type */}
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-900/60 rounded-lg flex items-center justify-center border border-green-800/40">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipe Course</p>
                  <p className="font-semibold text-white">{tournamentDetails.courseType}</p>
                </div>
              </div>
            </div>

            {/* Game Mode */}
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-900/60 rounded-lg flex items-center justify-center border border-yellow-800/40">
                  <Target className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Mode Permainan</p>
                  <p className="font-semibold text-white capitalize">{tournamentDetails.gameMode}</p>
                </div>
              </div>
            </div>

            {/* Male Tee Box */}
            {tournamentDetails.maleTeeBox && (
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900/60 rounded-lg flex items-center justify-center border border-blue-800/40">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tee Box Laki-laki</p>
                    <p className="font-semibold text-white">{tournamentDetails.maleTeeBox} Tee</p>
                  </div>
                </div>
              </div>
            )}

            {/* Female Tee Box */}
            {tournamentDetails.femaleTeeBox && (
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-900/60 rounded-lg flex items-center justify-center border border-pink-800/40">
                    <Target className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tee Box Perempuan</p>
                    <p className="font-semibold text-white">{tournamentDetails.femaleTeeBox} Tee</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Section */}
          {tournamentDetails.schedule && (
            <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 rounded-lg p-4 border border-blue-900/40">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Susunan Acara / Schedule
              </h3>
              <div className="bg-[#1a1a1a]/60 rounded-lg p-4 border border-blue-800/40">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                  {tournamentDetails.schedule}
                </pre>
              </div>
            </div>
          )}

          {/* Special Features */}
          {((tournamentDetails.specialScoringHoles && tournamentDetails.specialScoringHoles.length > 0) || 
            (tournamentDetails.hiddenHoles && tournamentDetails.hiddenHoles.length > 0)) && (
            <div className="bg-gradient-to-br from-purple-950/40 to-blue-950/40 rounded-lg p-4 border border-purple-900/40">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Fitur Khusus
              </h3>
              <div className="space-y-2">
                {tournamentDetails.specialScoringHoles && tournamentDetails.specialScoringHoles.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Hole Skor Spesial</p>
                      <p className="text-sm text-gray-400">
                        Hole: {tournamentDetails.specialScoringHoles.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {tournamentDetails.hiddenHoles && tournamentDetails.hiddenHoles.length > 0 && (
                  <div className="flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Hole Tersembunyi</p>
                      <p className="text-sm text-gray-400">
                        Hole: {tournamentDetails.hiddenHoles.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Pemain Terdaftar ({tournamentDetails.flights?.reduce((sum: number, f: any) => sum + (f.participants?.length || 0), 0) || 0})
              </h3>
            </div>

            {tournamentDetails.flights && tournamentDetails.flights.some((f: any) => f.participants?.length > 0) ? (
              <div className="space-y-4">
                {tournamentDetails.flights.map((flight: any) => (
                  flight.participants && flight.participants.length > 0 && (
                    <div key={flight._id}>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">{flight.flightName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {flight.participants.map((participant: any) => (
                          <div
                            key={participant._id}
                            className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-green-800/60 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-white">{participant.name}</p>
                                <p className="text-sm text-gray-400">{participant.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Hole Awal</p>
                                <p className="text-lg font-bold text-green-500">{participant.startHole}</p>
                              </div>
                            </div>
                            {participant.handicap !== undefined && (
                              <div className="mt-2 pt-2 border-t border-gray-800/60">
                                <p className="text-xs text-gray-500">
                                  Handicap: <span className="font-semibold text-gray-300">{participant.handicap}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-900/60 rounded-lg border border-gray-800/60">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Belum ada pemain terdaftar</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/60 bg-gray-900/60">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] border border-red-900/40"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
