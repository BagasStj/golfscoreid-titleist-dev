import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { 
  Users, 
  Plus, 
  Eye, 
  Trash2, 
  Search,
  Mail,
  Award,
  UserCheck,
  Save,
  X,
  AlertCircle,
  Download,
  Phone,
  Calendar,
  Shirt,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '../ui';
import { ConfirmDialog } from '../shared';
import ClubSetsSelector from '../shared/ClubSetsSelector';
import { useToast } from '../shared/ToastContainer';
import * as XLSX from 'xlsx';

interface ClubEntry {
  brand: 'Titleist' | 'Other';
  model: string;
}

interface PlayerFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  handicap: number;
  phone: string;
  nickname: string;
  gender: 'male' | 'female' | '';
  workLocation: string;
  shirtSize: 'S' | 'M' | 'L' | 'XL' | '';
  gloveSize: 'S' | 'M' | 'L' | 'XL' | '';
  drivers: ClubEntry[];
  fairways: ClubEntry[];
  hybrids: ClubEntry[];
  utilityIrons: ClubEntry[];
  irons: ClubEntry[];
  wedges: ClubEntry[];
  putters: ClubEntry[];
  golfBalls: ClubEntry[];
}

export default function PlayerManagement() {
  const players = useQuery(api.users.listAllPlayers);
  const registerUser = useMutation(api.users.register);
  const updatePlayer = useMutation(api.users.updatePlayer);
  const deletePlayer = useMutation(api.users.deletePlayer);
  const updatePaymentStatus = useMutation(api.users.updatePaymentStatus);
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<Id<'users'>>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'detail'>('create');
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<'users'> | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: Id<'users'>; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    handicap: 0,
    phone: '',
    nickname: '',
    gender: '',
    workLocation: '',
    shirtSize: '',
    gloveSize: '',
    drivers: [],
    fairways: [],
    hybrids: [],
    utilityIrons: [],
    irons: [],
    wedges: [],
    putters: [],
    golfBalls: [],
  });

  const filteredPlayers = players?.filter(player => {
    // Search filter
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Payment filter
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'paid' && (player as any).paymentStatus === 'paid') ||
      (paymentFilter === 'unpaid' && ((player as any).paymentStatus === 'unpaid' || !(player as any).paymentStatus));
    
    return matchesSearch && matchesPayment;
  }).sort((a, b) => {
    // Sort by _creationTime descending (newest first)
    return (b._creationTime || 0) - (a._creationTime || 0);
  });

  // Calculate payment statistics
  const totalPlayers = players?.length || 0;
  const paidPlayers = players?.filter(p => (p as any).paymentStatus === 'paid').length || 0;
  const unpaidPlayers = players?.filter(p => (p as any).paymentStatus === 'unpaid' || !(p as any).paymentStatus).length || 0;

  // Pagination calculations
  const totalPages = Math.ceil((filteredPlayers?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlayers = filteredPlayers?.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle payment filter change
  const handlePaymentFilterChange = (filter: 'all' | 'paid' | 'unpaid') => {
    setPaymentFilter(filter);
    setCurrentPage(1);
    setSelectedPlayerIds(new Set()); // Clear selection when filter changes
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (playerId: Id<'users'>) => {
    const newSelection = new Set(selectedPlayerIds);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayerIds(newSelection);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedPlayerIds.size === paginatedPlayers?.length) {
      setSelectedPlayerIds(new Set());
    } else {
      const allIds = new Set(paginatedPlayers?.map(p => p._id) || []);
      setSelectedPlayerIds(allIds);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (selectedPlayerIds.size === 0) {
      showToast('Pilih minimal satu pemain', 'warning');
      return;
    }

    try {
      await updatePaymentStatus({
        playerIds: Array.from(selectedPlayerIds),
        paymentStatus: 'paid',
      });
      setSelectedPlayerIds(new Set());
      showToast(`${selectedPlayerIds.size} pemain berhasil ditandai sebagai PAID`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  // Handle mark as unpaid
  const handleMarkAsUnpaid = async () => {
    if (selectedPlayerIds.size === 0) {
      showToast('Pilih minimal satu pemain', 'warning');
      return;
    }

    try {
      await updatePaymentStatus({
        playerIds: Array.from(selectedPlayerIds),
        paymentStatus: 'unpaid',
      });
      setSelectedPlayerIds(new Set());
      showToast(`${selectedPlayerIds.size} pemain berhasil ditandai sebagai UNPAID`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      name: '', 
      email: '', 
      username: '', 
      password: '', 
      handicap: 0,
      phone: '',
      nickname: '',
      gender: '',
      workLocation: '',
      shirtSize: '',
      gloveSize: '',
      drivers: [],
      fairways: [],
      hybrids: [],
      utilityIrons: [],
      irons: [],
      wedges: [],
      putters: [],
      golfBalls: [],
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenDetailModal = (player: any) => {
    setModalMode('detail');
    setSelectedPlayerId(player._id);
    
    setFormData({
      name: player.name,
      email: player.email,
      username: player.username || '',
      password: '',
      handicap: player.handicap || 0,
      phone: player.phone || '',
      nickname: player.nickname || '',
      gender: player.gender || '',
      workLocation: player.workLocation || '',
      shirtSize: player.shirtSize || '',
      gloveSize: player.gloveSize || '',
      drivers: Array.isArray(player.drivers) ? player.drivers : [],
      fairways: Array.isArray(player.fairways) ? player.fairways : [],
      hybrids: Array.isArray(player.hybrids) ? player.hybrids : [],
      utilityIrons: Array.isArray(player.utilityIrons) ? player.utilityIrons : [],
      irons: Array.isArray(player.irons) ? player.irons : [],
      wedges: Array.isArray(player.wedges) ? player.wedges : [],
      putters: Array.isArray(player.putters) ? player.putters : [],
      golfBalls: Array.isArray(player.golfBalls) ? player.golfBalls : [],
    });
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayerId(null);
    setFormData({ 
      name: '', 
      email: '', 
      username: '', 
      password: '', 
      handicap: 0,
      phone: '',
      nickname: '',
      gender: '',
      workLocation: '',
      shirtSize: '',
      gloveSize: '',
      drivers: [],
      fairways: [],
      hybrids: [],
      utilityIrons: [],
      irons: [],
      wedges: [],
      putters: [],
      golfBalls: [],
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (modalMode === 'create') {
        await registerUser({
          ...formData,
          role: 'player',
          phone: formData.phone || undefined,
          nickname: formData.nickname || undefined,
          gender: formData.gender || undefined,
          workLocation: formData.workLocation || undefined,
          shirtSize: formData.shirtSize || undefined,
          gloveSize: formData.gloveSize || undefined,
          drivers: formData.drivers.length > 0 ? formData.drivers : undefined,
          fairways: formData.fairways.length > 0 ? formData.fairways : undefined,
          hybrids: formData.hybrids.length > 0 ? formData.hybrids : undefined,
          irons: formData.irons.length > 0 ? formData.irons : undefined,
          wedges: formData.wedges.length > 0 ? formData.wedges : undefined,
          putters: formData.putters.length > 0 ? formData.putters : undefined,
          golfBalls: formData.golfBalls.length > 0 ? formData.golfBalls : undefined,
        } as any);
      } else if (selectedPlayerId) {
        const updateData: any = {
          playerId: selectedPlayerId,
          name: formData.name,
          email: formData.email,
          username: formData.username,
          handicap: formData.handicap,
          phone: formData.phone || undefined,
          nickname: formData.nickname || undefined,
          gender: formData.gender || undefined,
          workLocation: formData.workLocation || undefined,
          shirtSize: formData.shirtSize || undefined,
          gloveSize: formData.gloveSize || undefined,
          drivers: formData.drivers.length > 0 ? formData.drivers : undefined,
          fairways: formData.fairways.length > 0 ? formData.fairways : undefined,
          hybrids: formData.hybrids.length > 0 ? formData.hybrids : undefined,
          irons: formData.irons.length > 0 ? formData.irons : undefined,
          wedges: formData.wedges.length > 0 ? formData.wedges : undefined,
          putters: formData.putters.length > 0 ? formData.putters : undefined,
        };
        
        // Only include password if it's been changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updatePlayer(updateData);
      }
      handleCloseModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (player: any) => {
    setPlayerToDelete({ id: player._id, name: player.name });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    try {
      await deletePlayer({ playerId: playerToDelete.id });
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
      showToast('Pemain berhasil dihapus', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleExportExcel = () => {
    if (!players || players.length === 0) {
      showToast('Tidak ada data pemain untuk diekspor', 'warning');
      return;
    }

    // Use filtered and sorted players for export
    const playersToExport = filteredPlayers || players;

    // Prepare data for export
    const exportData = playersToExport.map((player, index) => ({
      'No': index + 1,
      'Nama Lengkap': player.name || '',
      'Email': player.email || '',
      'Username': player.username || '',
      'Nomor Telepon': player.phone || '',
      'Nama Alias': player.nickname || '',
      'Tanggal Lahir': (player as any).dateOfBirth || '',
      'Jenis Kelamin': player.gender === 'male' ? 'Pria' : player.gender === 'female' ? 'Wanita' : '',
      'Ukuran Baju': player.shirtSize || '',
      'Ukuran Sarung Tangan': player.gloveSize || '',
      'Status Pembayaran': (player as any).paymentStatus === 'paid' ? 'PAID' : 'UNPAID',
      'Tanggal Bayar': (player as any).paidAt ? new Date((player as any).paidAt).toLocaleDateString('id-ID') : '',
      'Driver Brand': player.drivers?.[0]?.brand || '',
      'Driver Model': player.drivers?.[0]?.model || '',
      'Fairway Brand': player.fairways?.[0]?.brand || '',
      'Fairway Model': player.fairways?.[0]?.model || '',
      'Hybrid Brand': player.hybrids?.[0]?.brand || '',
      'Hybrid Model': player.hybrids?.[0]?.model || '',
      'Iron Brand': player.irons?.[0]?.brand || '',
      'Iron Model': player.irons?.[0]?.model || '',
      'Wedge Brand': player.wedges?.[0]?.brand || '',
      'Wedge Model': player.wedges?.[0]?.model || '',
      'Putter Brand': player.putters?.[0]?.brand || '',
      'Putter Model': player.putters?.[0]?.model || '',
      'Golf Ball Brand': (player as any).golfBalls?.[0]?.brand || '',
      'Golf Ball Model': (player as any).golfBalls?.[0]?.model || '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Lengkap
      { wch: 30 }, // Email
      { wch: 15 }, // Username
      { wch: 15 }, // Nomor Telepon
      { wch: 20 }, // Nama Alias
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // Jenis Kelamin
      { wch: 12 }, // Ukuran Baju
      { wch: 20 }, // Ukuran Sarung Tangan
      { wch: 18 }, // Status Pembayaran
      { wch: 15 }, // Tanggal Bayar
      { wch: 15 }, // Driver Brand
      { wch: 20 }, // Driver Model
      { wch: 15 }, // Fairway Brand
      { wch: 20 }, // Fairway Model
      { wch: 15 }, // Hybrid Brand
      { wch: 20 }, // Hybrid Model
      { wch: 15 }, // Iron Brand
      { wch: 20 }, // Iron Model
      { wch: 15 }, // Wedge Brand
      { wch: 20 }, // Wedge Model
      { wch: 15 }, // Putter Brand
      { wch: 20 }, // Putter Model
      { wch: 15 }, // Golf Ball Brand
      { wch: 20 }, // Golf Ball Model
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Players_Data_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    // Show success toast
    showToast(`Data ${playersToExport.length} pemain berhasil diekspor ke ${filename}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-red-700 rounded-full"></span>
          Manajemen Pemain
        </h2>
        <p className="text-gray-400 mt-1">Kelola akun dan registrasi pemain</p>
      </div>

      {/* Stats Summary and Search Bar - Combined */}
      <div className="bg-gradient-to-br from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Stats Summary - Left */}
          <div className="grid grid-cols-3 gap-3 lg:flex lg:items-center lg:gap-3 lg:min-w-[600px] lg:pr-4 lg:border-r lg:border-gray-700/60">
            {/* Total Players */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 bg-gray-900/40 lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center border border-red-900/40 shadow-lg flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-white">{totalPlayers}</div>
                <div className="text-xs text-gray-400 whitespace-nowrap">Total Pemain</div>
              </div>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden lg:block w-px h-12 bg-gray-700/60"></div>

            {/* Paid Players */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 bg-gray-900/40 lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-900/60 to-green-950/60 rounded-xl flex items-center justify-center border border-green-900/40 shadow-lg flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">{paidPlayers}</div>
                <div className="text-xs text-gray-400 whitespace-nowrap">Sudah Bayar</div>
              </div>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden lg:block w-px h-12 bg-gray-700/60"></div>

            {/* Unpaid Players */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 bg-gray-900/40 lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-900/60 to-orange-950/60 rounded-xl flex items-center justify-center border border-orange-900/40 shadow-lg flex-shrink-0">
                <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-orange-400">{unpaidPlayers}</div>
                <div className="text-xs text-gray-400 whitespace-nowrap">Belum Bayar</div>
              </div>
            </div>
          </div>

          {/* Search Bar - Center (Flexible) */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Cari pemain berdasarkan nama, email, atau username..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 rounded-lg transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Export Button - Right */}
          <Button
            variant="outline"
            size="lg"
            icon={Download}
            onClick={handleExportExcel}
            className="whitespace-nowrap shadow-md lg:min-w-[160px]"
          >
            Export Excel
          </Button>
        </div>

        {/* Payment Filter Tabs */}
        <div className="mt-4 pt-4 border-t border-gray-700/60">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-400 mr-2">Filter Status Pembayaran:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePaymentFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  paymentFilter === 'all'
                    ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                    : 'bg-gray-900/60 text-gray-400 border-2 border-gray-700/60 hover:border-gray-600'
                }`}
              >
                Semua ({totalPlayers})
              </button>
              <button
                onClick={() => handlePaymentFilterChange('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  paymentFilter === 'paid'
                    ? 'bg-gradient-to-r from-green-900 to-green-800 text-white border-2 border-green-700'
                    : 'bg-gray-900/60 text-gray-400 border-2 border-gray-700/60 hover:border-gray-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Paid ({paidPlayers})
              </button>
              <button
                onClick={() => handlePaymentFilterChange('unpaid')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  paymentFilter === 'unpaid'
                    ? 'bg-gradient-to-r from-orange-900 to-orange-800 text-white border-2 border-orange-700'
                    : 'bg-gray-900/60 text-gray-400 border-2 border-gray-700/60 hover:border-gray-600'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Unpaid ({unpaidPlayers})
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && filteredPlayers && (
          <div className="mt-3 pt-3 border-t border-gray-700/60">
            <p className="text-sm text-gray-400">
              Ditemukan <span className="font-semibold text-red-400">{filteredPlayers.length}</span> pemain dari pencarian "<span className="text-white">{searchQuery}</span>"
            </p>
          </div>
        )}
      </div>

      {/* Payment Action Bar - Always Visible */}
      <div className={`backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border p-4 transition-all ${
        selectedPlayerIds.size > 0 
          ? 'bg-gradient-to-r from-blue-900/60 to-blue-800/60 border-blue-900/40' 
          : 'bg-gradient-to-r from-gray-900/60 to-gray-800/60 border-gray-800/40'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedPlayerIds.size > 0 ? 'bg-white/20' : 'bg-gray-700/40'
            }`}>
              <UserCheck className={`w-5 h-5 ${selectedPlayerIds.size > 0 ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              {selectedPlayerIds.size > 0 ? (
                <>
                  <div className="text-white font-semibold">{selectedPlayerIds.size} Pemain Dipilih</div>
                  <div className="text-xs text-blue-200">Pilih aksi untuk pemain yang dipilih</div>
                </>
              ) : (
                <>
                  <div className="text-gray-300 font-semibold">Payment Action Bar</div>
                  <div className="text-xs text-gray-400">Pilih pemain terlebih dahulu untuk mengubah status pembayaran</div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedPlayerIds.size > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedPlayerIds(new Set())}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Batal
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={CheckCircle2}
                  onClick={handleMarkAsPaid}
                  className="!bg-green-600 hover:!bg-green-700 !border-green-700 !text-white shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
                >
                  Status PAID
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={XCircle}
                  onClick={handleMarkAsUnpaid}
                  className="!bg-red-600 hover:!bg-orange-700 !border-orange-700 !text-white shadow-[0_4px_12px_rgba(249,115,22,0.4)]"
                >
                  Status UNPAID
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Tidak ada pemain yang dipilih</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Players Table */}
      {players === undefined ? (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-800/60 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredPlayers && filteredPlayers.length === 0 ? (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 text-center">
          <div className="py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery ? 'Pemain tidak ditemukan' : 'Belum ada pemain'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Coba sesuaikan kriteria pencarian Anda'
                : 'Mulai dengan menambahkan pemain pertama'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="lg"
                icon={Plus}
                onClick={handleOpenCreateModal}
              >
                Tambah Pemain Pertama
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white border-b border-red-900/40">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.size === paginatedPlayers?.length && paginatedPlayers?.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Pemain</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Telepon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nama Alias</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal Lahir</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Gender</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Ukuran</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status Bayar</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {paginatedPlayers?.map((player, index) => (
                  <tr 
                    key={player._id}
                    onClick={() => handleCheckboxToggle(player._id)}
                    className={`transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-800/40'
                    } ${
                      selectedPlayerIds.has(player._id) 
                        ? 'bg-blue-900/30 hover:bg-blue-900/40' 
                        : 'hover:bg-red-900/20'
                    }`}
                  >
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.has(player._id)}
                        onChange={() => handleCheckboxToggle(player._id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0 border border-red-900/30">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{player.name}</div>
                          <div className="text-xs text-gray-400">@{player.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{player.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{player.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{player.nickname || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{(player as any).dateOfBirth || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        player.gender === 'male' 
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' 
                          : player.gender === 'female'
                          ? 'bg-pink-950/40 text-pink-400 border border-pink-900/30'
                          : 'bg-gray-950/40 text-gray-400 border border-gray-900/30'
                      }`}>
                        {player.gender === 'male' ? 'Pria' : player.gender === 'female' ? 'Wanita' : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <Shirt className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-gray-300">{player.shirtSize || '-'}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs text-gray-500">Glove:</span>
                          <span className="text-xs text-gray-300">{player.gloveSize || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(player as any).paymentStatus === 'paid' ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-950/40 text-green-400 border border-green-900/30">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            PAID
                          </span>
                          {(player as any).paidAt && (
                            <span className="text-xs text-gray-500">
                              {new Date((player as any).paidAt).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-950/40 text-orange-400 border border-orange-900/30">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          UNPAID
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetailModal(player)}
                          className="p-2 hover:bg-blue-900/30 text-blue-400 rounded-lg transition-colors border border-blue-900/30"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(player)}
                          className="p-2 hover:bg-red-900/50 text-red-500 rounded-lg transition-colors border border-red-900/40"
                          title="Hapus Pemain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPlayers && filteredPlayers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Menampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Menampilkan {startIndex + 1} sampai {Math.min(endIndex, filteredPlayers.length)} dari {filteredPlayers.length} pemain
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-lg hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-red-900/60 text-white border border-red-900/40'
                              : 'bg-gray-900/60 border-2 border-gray-700/60 text-gray-300 hover:bg-gray-800/60'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-lg hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-red-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-red-800/40">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {modalMode === 'create' ? 'Tambah Pemain Baru' : 'Detail Pemain'}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {modalMode === 'create' 
                      ? 'Buat akun pemain baru' 
                      : 'Informasi lengkap pemain'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors border border-red-800/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-950/40 border-2 border-red-900/40 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-300 mb-1">Error</h4>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {modalMode === 'detail' ? (
                // Detail View (Read-only)
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-red-500" />
                      Informasi Pribadi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Nama Lengkap</label>
                        <p className="text-white font-semibold">{formData.name}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                        <p className="text-white font-semibold">{formData.email}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Username</label>
                        <p className="text-white font-semibold">@{formData.username}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Nomor Telepon</label>
                        <p className="text-white font-semibold">{formData.phone || '-'}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Nama Alias</label>
                        <p className="text-white font-semibold">{formData.nickname || '-'}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Jenis Kelamin</label>
                        <p className="text-white font-semibold">
                          {formData.gender === 'male' ? 'Pria' : formData.gender === 'female' ? 'Wanita' : '-'}
                        </p>
                      </div>
                     
                     
                    </div>
                  </div>

                  {/* Size Information */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Shirt className="w-5 h-5 text-red-500" />
                      Ukuran
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Ukuran Baju</label>
                        <p className="text-white font-semibold text-2xl">{formData.shirtSize || '-'}</p>
                      </div>
                      <div className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                        <label className="text-xs text-gray-500 mb-1 block">Ukuran Sarung Tangan</label>
                        <p className="text-white font-semibold text-2xl">{formData.gloveSize || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Club Sets */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-red-500" />
                      Club Sets
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Driver', data: formData.drivers },
                        { label: 'Fairway', data: formData.fairways },
                        { label: 'Hybrid', data: formData.hybrids },
                        { label: 'Iron', data: formData.irons },
                        { label: 'Wedge', data: formData.wedges },
                        { label: 'Putter', data: formData.putters },
                        { label: 'Golf Ball', data: formData.golfBalls },
                      ].map(({ label, data }) => (
                        <div key={label} className="bg-[#1a1a1a]/60 border-2 border-gray-800/60 rounded-xl p-4">
                          <label className="text-xs text-gray-500 mb-2 block">{label}</label>
                          {data && data.length > 0 ? (
                            <div className="space-y-1">
                              {data.map((club, idx) => (
                                <p key={idx} className="text-white font-semibold">
                                  {club.brand} - {club.model}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">-</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Create Form
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe"
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Password {modalMode === 'create' ? '*' : '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required={modalMode === 'create'}
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

              
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="Nickname"
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        formData.gender === 'male'
                          ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                          : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        formData.gender === 'female'
                          ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                          : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    placeholder="City/Office"
                    className="w-full px-4 py-3 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Shirt Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirtSize: size as any })}
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${
                          formData.shirtSize === size
                            ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                            : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Glove Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, gloveSize: size as any })}
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${
                          formData.gloveSize === size
                            ? 'bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700'
                            : 'bg-[#1a1a1a]/60 text-gray-400 border-2 border-gray-800/60 hover:border-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Club Sets Selector */}
              <div className="md:col-span-2">
                <ClubSetsSelector
                  drivers={formData.drivers}
                  fairways={formData.fairways}
                  hybrids={formData.hybrids}
                  utilityIrons={formData.utilityIrons}
                  irons={formData.irons}
                  wedges={formData.wedges}
                  putters={formData.putters}
                  onChange={(category, clubs) => {
                    setFormData({
                      ...formData,
                      [category]: clubs
                    });
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-800/60">
                {modalMode === 'create' ? (
                  <>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      icon={Save}
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Buat Pemain'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg" 
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={handleCloseModal}
                    fullWidth
                  >
                    Tutup
                  </Button>
                )}
              </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setPlayerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Pemain"
        message={`Apakah Anda yakin ingin menghapus ${playerToDelete?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}
