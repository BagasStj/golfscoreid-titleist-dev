import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Calendar,
  Users,
  Play,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useToast } from '../shared/ToastContainer';
import ConfirmDialog from '../shared/ConfirmDialog';
import TournamentDetailsModal from './TournamentDetailsModal';
import EditTournamentModal from './EditTournamentModal';

interface TournamentManagementTableProps {
  onAddPlayers?: (tournamentId: Id<'tournaments'>) => void;
}

// Component to fetch participant count for a single tournament
function TournamentParticipantCount({ tournamentId }: { tournamentId: Id<'tournaments'> }) {
  const count = useQuery(api.tournaments.getTournamentParticipantCount, { tournamentId });
  return <span className="font-medium">{count ?? 0}</span>;
}

// Component to fetch confirmation summary
function TournamentConfirmationSummary({ tournamentId, maxParticipants }: { tournamentId: Id<'tournaments'>, maxParticipants?: number }) {
  const summary = useQuery(api.tournaments.getTournamentConfirmationSummary, { tournamentId });
  
  if (!summary) {
    return <span className="text-gray-500 text-sm">Memuat...</span>;
  }

  const { confirmed, paid } = summary;
  const total = maxParticipants || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-blue-300 font-semibold text-sm">{confirmed}</span>
      </div>
      <span className="text-gray-500">/</span>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-green-300 font-semibold text-sm">{paid}</span>
      </div>
      {total > 0 && (
        <>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400 font-semibold text-sm">{total}</span>
        </>
      )}
    </div>
  );
}

// Component to fetch course name
function CourseName({ courseId }: { courseId: Id<'courses'> | undefined }) {
  const course = useQuery(
    api.courses.getCourse, 
    courseId ? { courseId } : 'skip'
  );
  return <span className="text-sm text-gray-400">{course?.name ?? 'Tidak ada course'}</span>;
}

export default function TournamentManagementTable({
  onAddPlayers,
}: TournamentManagementTableProps) {
  const { user } = useAuth();
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    user ? { userId: user._id } : 'skip'
  );
  const updateStatus = useMutation(api.tournaments.updateTournamentStatus);
  const deleteTournament = useMutation(api.tournaments.deleteTournament);
  const { showSuccess, showError } = useToast();

  const [loadingStatus, setLoadingStatus] = useState<Id<'tournaments'> | null>(null);
  
  // Confirmation dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tournamentId: Id<'tournaments'> | null;
    tournamentName: string;
  }>({ isOpen: false, tournamentId: null, tournamentName: '' });
  
  const [statusConfirm, setStatusConfirm] = useState<{
    isOpen: boolean;
    tournamentId: Id<'tournaments'> | null;
    newStatus: 'upcoming' | 'active' | 'completed' | null;
    tournamentName: string;
  }>({ isOpen: false, tournamentId: null, newStatus: null, tournamentName: '' });

  // Modals
  const [detailsModal, setDetailsModal] = useState<Id<'tournaments'> | null>(null);
  const [editModal, setEditModal] = useState<Id<'tournaments'> | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (
    tournamentId: Id<'tournaments'>,
    newStatus: 'upcoming' | 'active' | 'completed',
    tournamentName: string
  ) => {
    setStatusConfirm({
      isOpen: true,
      tournamentId,
      newStatus,
      tournamentName,
    });
  };

  const confirmStatusChange = async () => {
    if (!user || !statusConfirm.tournamentId || !statusConfirm.newStatus) return;

    setLoadingStatus(statusConfirm.tournamentId);
    try {
      await updateStatus({
        tournamentId: statusConfirm.tournamentId,
        status: statusConfirm.newStatus,
        userId: user._id,
      });
      showSuccess(`Status tournament diperbarui menjadi ${statusConfirm.newStatus === 'upcoming' ? 'Akan Datang' : statusConfirm.newStatus === 'active' ? 'Aktif' : 'Selesai'}`);
      setStatusConfirm({ isOpen: false, tournamentId: null, newStatus: null, tournamentName: '' });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Gagal memperbarui status');
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleDelete = (tournamentId: Id<'tournaments'>, tournamentName: string) => {
    setDeleteConfirm({
      isOpen: true,
      tournamentId,
      tournamentName,
    });
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirm.tournamentId) return;

    setIsDeleting(true);
    try {
      await deleteTournament({
        tournamentId: deleteConfirm.tournamentId,
        userId: user._id,
      });
      showSuccess('Tournament berhasil dihapus');
      setDeleteConfirm({ isOpen: false, tournamentId: null, tournamentName: '' });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Gagal menghapus tournament');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Akan Datang';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  if (tournaments === undefined) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-800/60 rounded"></div>
          <div className="h-12 bg-gray-800/60 rounded"></div>
          <div className="h-12 bg-gray-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Tournament</h3>
        <p className="text-gray-400">Buat tournament pertama Anda untuk memulai!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 px-6 py-5">
        <h3 className="text-xl font-bold text-white">Semua Tournament</h3>
        <p className="text-sm text-gray-400 mt-1">Kelola dan monitor tournament Anda</p>
      </div>

      {/* Table Header */}
      <div className="bg-gray-800/60 rounded-lg px-6 py-3 border border-gray-700/60">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
          <div className="col-span-2">Tournament</div>
          <div className="col-span-2">Tanggal</div>
          <div className="col-span-1">Course</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Pemain</div>
          <div className="col-span-2">Konfirmasi/Bayar/Kuota</div>
          <div className="col-span-2 text-right">Aksi</div>
        </div>
      </div>

      {/* Tournament Cards */}
      <div className="space-y-3">
        {tournaments.map((tournament) => {
          const tournamentDate = new Date(tournament.date);
          const isLoading = loadingStatus === tournament._id;

          return (
            <div
              key={tournament._id}
              className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all duration-200 hover:border-red-800"
            >
              <div className="px-6 py-5">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Tournament Name */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0 shadow-md border border-red-800/40 overflow-hidden">
                        {tournament.bannerUrl ? (
                          <img 
                            src={tournament.bannerUrl} 
                            alt={tournament.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">🏆</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 aligh-left">
                        <h4 className="font-bold text-white text-base truncate">
                          {tournament.name}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          {tournament.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="text-sm leading-tight">
                        <div className="font-semibold text-white">
                          {tournamentDate.toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="col-span-1">
                    <div className="text-sm">
                      <div className="font-semibold text-white">{tournament.courseType}</div>
                      <CourseName courseId={tournament.courseId} />
                      <div className="text-xs text-gray-500 capitalize mt-0.5">{tournament.gameMode}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusBadge(
                        tournament.status
                      )}`}
                    >
                      {getStatusIcon(tournament.status)}
                      <span>{getStatusText(tournament.status)}</span>
                    </span>
                  </div>

                  {/* Players Count */}
                  <div className="col-span-1">
                    <button
                      onClick={() => onAddPlayers?.(tournament._id)}
                      className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors group"
                    >
                      <Users className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-red-500">
                          <TournamentParticipantCount tournamentId={tournament._id} />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Confirmation Summary */}
                  <div className="col-span-2">
                    <TournamentConfirmationSummary 
                      tournamentId={tournament._id} 
                      maxParticipants={tournament.maxParticipants}
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Status Actions */}
                      {tournament.status === 'upcoming' && (
                        <button
                          onClick={() => handleStatusChange(tournament._id, 'active', tournament.name)}
                          disabled={isLoading}
                          className="p-2.5 text-green-500 hover:bg-green-950/40 rounded-lg transition-all disabled:opacity-50 hover:scale-110 border border-green-900/30"
                          title="Mulai Tournament"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {tournament.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(tournament._id, 'completed', tournament.name)}
                          disabled={isLoading}
                          className="p-2.5 text-blue-500 hover:bg-blue-950/40 rounded-lg transition-all disabled:opacity-50 hover:scale-110 border border-blue-900/30"
                          title="Selesaikan Tournament"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => setDetailsModal(tournament._id)}
                        className="p-2.5 text-blue-500 hover:bg-blue-950/40 rounded-lg transition-all hover:scale-110 border border-blue-900/30"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditModal(tournament._id)}
                        className="p-2.5 text-gray-400 hover:bg-gray-800/40 rounded-lg transition-all hover:scale-110 border border-gray-700/30"
                        title="Edit Tournament"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(tournament._id, tournament.name)}
                        className="p-2.5 text-red-500 hover:bg-red-950/40 rounded-lg transition-all hover:scale-110 border border-red-900/30"
                        title="Hapus Tournament"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, tournamentId: null, tournamentName: '' })}
        onConfirm={confirmDelete}
        title="Hapus Tournament"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm.tournamentName}"? Ini akan menghapus tournament secara permanen beserta semua data terkait termasuk peserta dan skor. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Tournament"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ isOpen: false, tournamentId: null, newStatus: null, tournamentName: '' })}
        onConfirm={confirmStatusChange}
        title={`${statusConfirm.newStatus === 'active' ? 'Mulai' : 'Selesaikan'} Tournament`}
        message={`Apakah Anda yakin ingin ${statusConfirm.newStatus === 'active' ? 'memulai' : 'menyelesaikan'} "${statusConfirm.tournamentName}"? ${
          statusConfirm.newStatus === 'active'
            ? 'Pemain akan dapat mengirimkan skor setelah tournament aktif.'
            : 'Menyelesaikan tournament akan memfinalisasi semua skor dan peringkat.'
        }`}
        confirmText={statusConfirm.newStatus === 'active' ? 'Mulai Tournament' : 'Selesaikan Tournament'}
        cancelText="Batal"
        variant={statusConfirm.newStatus === 'active' ? 'success' : 'info'}
        isLoading={loadingStatus !== null}
      />

      {/* Modals */}
      {detailsModal && (
        <TournamentDetailsModal
          tournamentId={detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}

      {editModal && (
        <EditTournamentModal
          tournamentId={editModal}
          onClose={() => setEditModal(null)}
          onSuccess={() => {
            setEditModal(null);
          }}
        />
      )}
    </div>
  );
}
