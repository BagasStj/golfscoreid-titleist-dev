import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '../../contexts/AuthContext';
import FlightExcelUpload from './FlightExcelUpload';
import { 
  Plane, 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  MapPin, 
  Upload, 
  X, 
  ChevronRight,
  Calendar,
  Trophy,
  Save,
  Search,
  UserPlus
} from 'lucide-react';
import { Button } from '../ui';

interface FlightManagementProps {
  onClose?: () => void;
}

const FlightManagement: React.FC<FlightManagementProps> = () => {
  const { user } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<Id<"tournaments"> | null>(null);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [showEditFlightModal, setShowEditFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<any>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Id<"tournament_flights"> | null>(null);
  const [flightName, setFlightName] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [startHole, setStartHole] = useState('1');
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<"users"> | null>(null);
  const [playerStartHole, setPlayerStartHole] = useState('1');
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [movingPlayerId, setMovingPlayerId] = useState<Id<"tournament_participants"> | null>(null);
  const [targetFlightId, setTargetFlightId] = useState<Id<"tournament_flights"> | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<Id<"users">>>(new Set());
  const [searchPlayerQuery, setSearchPlayerQuery] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<Id<"tournament_participants"> | null>(null);
  const [editingStartHole, setEditingStartHole] = useState('');

  // Queries
  const tournaments = useQuery(api.tournaments.getTournaments, user ? { userId: user._id } : "skip");
  const upcomingTournaments = tournaments?.filter((t: any) => t.status === 'upcoming' || t.status === 'active');
  const allPlayers = useQuery(api.users.listAllPlayers);
  
  const flights = useQuery(
    api.flights.getFlightsByTournament,
    selectedTournament ? { tournamentId: selectedTournament } : "skip"
  );
  const flightDetails = useQuery(
    api.flights.getFlightDetails,
    selectedFlight ? { flightId: selectedFlight } : "skip"
  );
  
  // Get all participants in the selected tournament (across all flights)
  const tournamentParticipants = useQuery(
    api.tournaments.getTournamentParticipants,
    selectedTournament ? { tournamentId: selectedTournament } : "skip"
  );

  // Mutations
  const createFlight = useMutation(api.flights.createFlight);
  const updateFlight = useMutation(api.flights.updateFlight);
  const deleteFlight = useMutation(api.flights.deleteFlight);
  const addPlayerToFlight = useMutation(api.flights.addPlayerToFlight);
  const removePlayerFromFlight = useMutation(api.flights.removePlayerFromFlight);
  const movePlayerToFlight = useMutation(api.flights.movePlayerToFlight);
  const updatePlayerStartHole = useMutation(api.flights.updatePlayerStartHole);

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTournament) return;

    try {
      await createFlight({
        tournamentId: selectedTournament,
        flightName,
        flightNumber: parseInt(flightNumber),
        startTime: startTime || undefined,
        startHole: parseInt(startHole),
        userId: user._id,
      });
      
      // Reset form
      setFlightName('');
      setFlightNumber('');
      setStartTime('');
      setStartHole('1');
      setShowAddFlightModal(false);
    } catch (error) {
      console.error('Error creating flight:', error);
      alert(error instanceof Error ? error.message : 'Gagal membuat flight');
    }
  };

  const handleEditFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingFlight) return;

    try {
      await updateFlight({
        flightId: editingFlight._id,
        flightName,
        startTime: startTime || undefined,
        startHole: parseInt(startHole),
        userId: user._id,
      });
      
      // Reset form
      setFlightName('');
      setStartTime('');
      setStartHole('1');
      setEditingFlight(null);
      setShowEditFlightModal(false);
    } catch (error) {
      console.error('Error updating flight:', error);
      alert(error instanceof Error ? error.message : 'Gagal memperbarui flight');
    }
  };

  const openEditFlightModal = (flight: any) => {
    setEditingFlight(flight);
    setFlightName(flight.flightName);
    setStartTime(flight.startTime || '');
    setStartHole(flight.startHole.toString());
    setShowEditFlightModal(true);
  };

  const handleDeleteFlight = async (flightId: Id<"tournament_flights">) => {
    if (!user) return;
    if (!confirm('Apakah Anda yakin ingin menghapus flight ini?')) return;

    try {
      await deleteFlight({ flightId, userId: user._id });
      if (selectedFlight === flightId) {
        setSelectedFlight(null);
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus flight');
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFlight || selectedPlayerIds.size === 0) return;

    try {
      // Add all selected players
      for (const playerId of selectedPlayerIds) {
        await addPlayerToFlight({
          flightId: selectedFlight,
          playerId: playerId,
          startHole: parseInt(playerStartHole),
          userId: user._id,
        });
      }
      
      // Reset form
      setSelectedPlayerIds(new Set());
      setPlayerStartHole('1');
      setSearchPlayerQuery('');
      setShowAddPlayer(false);
    } catch (error) {
      console.error('Error adding players:', error);
      alert(error instanceof Error ? error.message : 'Gagal menambahkan pemain');
    }
  };

  const togglePlayerSelection = (playerId: Id<"users">) => {
    const newSelection = new Set(selectedPlayerIds);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayerIds(newSelection);
  };

  const selectAllPlayers = () => {
    if (filteredAvailablePlayers.length === selectedPlayerIds.size) {
      setSelectedPlayerIds(new Set());
    } else {
      setSelectedPlayerIds(new Set(filteredAvailablePlayers.map(p => p._id)));
    }
  };

  const handleSavePlayerEdit = async (participationId: Id<"tournament_participants">) => {
    if (!user || !editingStartHole) return;

    try {
      await updatePlayerStartHole({
        participationId,
        startHole: parseInt(editingStartHole),
        userId: user._id,
      });
      
      // Reset edit state
      setEditingPlayerId(null);
      setEditingStartHole('');
    } catch (error) {
      console.error('Error updating player start hole:', error);
      alert(error instanceof Error ? error.message : 'Gagal memperbarui hole awal');
    }
  };

  const handleRemovePlayer = async (participationId: Id<"tournament_participants">) => {
    if (!user) return;
    if (!confirm('Hapus pemain ini dari flight?')) return;

    try {
      await removePlayerFromFlight({ participationId, userId: user._id });
    } catch (error) {
      console.error('Error removing player:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus pemain');
    }
  };

  const handleMovePlayer = async () => {
    if (!user || !movingPlayerId || !targetFlightId) return;

    try {
      await movePlayerToFlight({
        participationId: movingPlayerId,
        newFlightId: targetFlightId,
        userId: user._id,
      });
      
      // Reset state
      setMovingPlayerId(null);
      setTargetFlightId(null);
    } catch (error) {
      console.error('Error moving player:', error);
      alert(error instanceof Error ? error.message : 'Gagal memindahkan pemain');
    }
  };

  const handleBackToTournaments = () => {
    setSelectedTournament(null);
    setSelectedFlight(null);
    setShowAddPlayer(false);
  };

  // Get available players (not in any flight of this tournament yet)
  const registeredPlayerIds = new Set(
    tournamentParticipants?.map((p: any) => p._id) || []
  );
  const availablePlayers = allPlayers?.filter(p => !registeredPlayerIds.has(p._id));

  // Filter available players by search query
  const filteredAvailablePlayers = availablePlayers?.filter(player => 
    player.name.toLowerCase().includes(searchPlayerQuery.toLowerCase()) ||
    player.email.toLowerCase().includes(searchPlayerQuery.toLowerCase())
  ) || [];

  // Get available flights for moving players (exclude current flight)
  const availableFlightsForMove = flights?.filter(f => f._id !== selectedFlight) || [];

  // Get selected tournament details
  const selectedTournamentData = tournaments?.find((t: any) => t._id === selectedTournament);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-red-700 rounded-full"></span>
          Manajemen Flight
        </h2>
        <p className="text-gray-400 mt-1">
          {selectedTournament 
            ? `Mengelola flight untuk ${selectedTournamentData?.name}`
            : 'Pilih turnamen untuk mengelola flight'}
        </p>
      </div>

      {/* Tournament List View */}
      {!selectedTournament && (
        <div className="space-y-4">
          {upcomingTournaments && upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.map((tournament: any) => (
                <div
                  key={tournament._id}
                  className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border-2 border-gray-800/60 hover:border-red-900/60 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all cursor-pointer group p-6"
                  onClick={() => setSelectedTournament(tournament._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center text-white shadow-lg border border-red-900/30">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                            {tournament.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                              tournament.status === 'active' 
                                ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                                : 'bg-blue-900/40 text-blue-400 border border-blue-800/40'
                            }`}>
                              {tournament.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>
                            {new Date(tournament.startDate).toLocaleDateString('id-ID')} - {new Date(tournament.endDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-red-500" />
                          <span className="text-gray-500 text-xs">Klik untuk mengelola flight</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center justify-center w-10 h-10 bg-red-950/40 rounded-lg group-hover:bg-red-900/60 transition-colors border border-red-900/30">
                      <ChevronRight className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 text-center">
              <div className="py-16">
                <div className="w-20 h-20 bg-gray-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800/60">
                  <Trophy className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tidak Ada Turnamen Tersedia</h3>
                <p className="text-sm text-gray-400">Buat turnamen terlebih dahulu untuk mengelola flight</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flight Management View */}
      {selectedTournament && (
        <div className="space-y-6">
          {/* Back Button and Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToTournaments}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 font-semibold transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Kembali ke Turnamen
            </button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                icon={Upload}
                onClick={() => setShowExcelUpload(true)}
              >
                Upload Excel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => setShowAddFlightModal(true)}
              >
                Tambah Flight
              </Button>
            </div>
          </div>

          {/* Flights Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-red-500" />
              Daftar Flight ({flights?.length || 0})
            </h3>

            {flights && flights.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {flights.map((flight) => (
                  <div
                    key={flight._id}
                    className={`bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all cursor-pointer p-6 ${
                      selectedFlight === flight._id
                        ? 'border-2 border-red-900/60 bg-red-950/20 shadow-[0_12px_32px_rgba(139,0,0,0.4)] ring-2 ring-red-900/30'
                        : 'border-2 border-gray-800/60 hover:border-red-900/40 hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedFlight(flight._id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md border border-red-900/30">
                            {flight.flightNumber}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{flight.flightName}</h4>
                            <p className="text-xs text-gray-500">Flight #{flight.flightNumber}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditFlightModal(flight);
                            }}
                            className="p-2 hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors border border-blue-900/30"
                            title="Edit Flight"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFlight(flight._id);
                            }}
                            className="p-2 hover:bg-red-900/30 text-red-500 rounded-lg transition-colors border border-red-900/30"
                            title="Hapus Flight"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-800/60">
                        {flight.startTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span>{flight.startTime}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>Mulai dari Hole {flight.startHole}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-white">
                            {flight.participantCount} Pemain
                          </span>
                        </div>
                      </div>

                      {selectedFlight === flight._id && (
                        <div className="pt-2">
                          <div className="bg-red-950/40 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg text-center border border-red-900/30">
                            Terpilih - Lihat detail di bawah
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 text-center">
                <div className="py-12">
                  <div className="w-16 h-16 bg-gray-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800/60">
                    <Plane className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Flight</h3>
                  <p className="text-sm text-gray-400 mb-4">Buat flight pertama untuk turnamen ini</p>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Plus}
                    onClick={() => setShowAddFlightModal(true)}
                  >
                    Buat Flight Pertama
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Flight Details Section */}
          {selectedFlight && flightDetails && (
            <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border-2 border-red-900/40 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-500" />
                      Pemain di {flightDetails.flightName}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {flightDetails.participants.length} pemain terdaftar
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={UserPlus}
                    onClick={() => setShowAddPlayer(!showAddPlayer)}
                  >
                    {showAddPlayer ? 'Batal' : 'Tambah Pemain'}
                  </Button>
                </div>

                {/* Add Player Form */}
                {showAddPlayer && (
                  <div className="bg-gray-900/60 rounded-xl border-2 border-green-900/40 p-6">
                    <form onSubmit={handleAddPlayer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Select Player *</label>
                          <select
                            value={selectedPlayerId || ''}
                            onChange={(e) => setSelectedPlayerId(e.target.value as Id<"users">)}
                            required
                            className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-green-900/50 focus:border-green-800 transition-all"
                          >
                            <option value="">-- Select Player --</option>
                            {availablePlayers?.map((player) => (
                              <option key={player._id} value={player._id}>
                                {player.name} ({player.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Start Hole *</label>
                          <input
                            type="number"
                            value={playerStartHole}
                            onChange={(e) => setPlayerStartHole(e.target.value)}
                            required
                            min="1"
                            max="18"
                            className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-green-900/50 focus:border-green-800 transition-all"
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="primary" size="lg" fullWidth>
                        Add Player to Flight
                      </Button>
                    </form>
                  </div>
                )}

                {/* Players List */}
                {flightDetails.participants.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800/60">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Nama
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Nickname
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              No. Telepon
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Hole Awal
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {flightDetails.participants.map((player: any) => (
                            <React.Fragment key={player._id}>
                              <tr className="hover:bg-gray-900/40 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md border border-red-900/30 flex-shrink-0">
                                      {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-white">{player.name}</h4>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-300">
                                    {player.nickname || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-300">
                                    {player.email}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-300">
                                    {player.phone || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {editingPlayerId === player.participationId ? (
                                    <input
                                      type="number"
                                      value={editingStartHole}
                                      onChange={(e) => setEditingStartHole(e.target.value)}
                                      min="1"
                                      max="18"
                                      className="w-20 px-3 py-1.5 bg-gray-900/60 border border-gray-700/60 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800 text-center"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                                      <span className="text-sm font-semibold text-white">
                                        {player.startHole}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {editingPlayerId === player.participationId ? (
                                      <>
                                        <button
                                          onClick={() => handleSavePlayerEdit(player.participationId)}
                                          className="p-2 hover:bg-green-900/30 text-green-500 rounded-lg transition-colors border border-green-900/30"
                                          title="Simpan"
                                        >
                                          <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingPlayerId(null);
                                            setEditingStartHole('');
                                          }}
                                          className="p-2 hover:bg-gray-700/30 text-gray-400 rounded-lg transition-colors border border-gray-700/30"
                                          title="Batal"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingPlayerId(player.participationId);
                                            setEditingStartHole(player.startHole.toString());
                                          }}
                                          className="p-2 hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors border border-blue-900/30"
                                          title="Edit Hole Awal"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        {availableFlightsForMove.length > 0 && (
                                          <button
                                            onClick={() => {
                                              setMovingPlayerId(player.participationId);
                                              setTargetFlightId(null);
                                            }}
                                            className="p-2 hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors border border-blue-900/30"
                                            title="Pindah ke flight lain"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleRemovePlayer(player.participationId)}
                                          className="p-2 hover:bg-red-900/30 text-red-500 rounded-lg transition-colors border border-red-900/30"
                                          title="Hapus dari flight"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Move Player Row */}
                              {movingPlayerId === player.participationId && (
                                <tr>
                                  <td colSpan={6} className="py-3 px-4 bg-gray-900/60">
                                    <div className="flex items-center gap-3">
                                      <label className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                                        Pindah ke Flight:
                                      </label>
                                      <select
                                        value={targetFlightId || ''}
                                        onChange={(e) => setTargetFlightId(e.target.value as Id<"tournament_flights">)}
                                        className="flex-1 px-3 py-2 bg-gray-900/60 border border-gray-700/60 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800"
                                      >
                                        <option value="">-- Pilih Flight --</option>
                                        {availableFlightsForMove.map((f) => (
                                          <option key={f._id} value={f._id}>
                                            {f.flightName} (Flight #{f.flightNumber})
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={handleMovePlayer}
                                        disabled={!targetFlightId}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                                      >
                                        Pindah
                                      </button>
                                      <button
                                        onClick={() => {
                                          setMovingPlayerId(null);
                                          setTargetFlightId(null);
                                        }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-900/40 rounded-xl border-2 border-dashed border-gray-800/60">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-white mb-1">Belum Ada Pemain</h4>
                    <p className="text-xs text-gray-400">Klik "Tambah Pemain" untuk menambahkan pemain ke flight ini</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && selectedFlight && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] to-[#1a1a1a] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-green-900/40">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-900/80 to-green-950/80 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-green-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Tambah Pemain ke Flight</h3>
                  <p className="text-sm text-green-100">Pilih pemain yang ingin ditambahkan ke {flightDetails?.flightName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setSelectedPlayerIds(new Set());
                  setSearchPlayerQuery('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddPlayer} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* Start Hole Input */}
                <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Hole Awal untuk Semua Pemain Terpilih *
                  </label>
                  <input
                    type="number"
                    value={playerStartHole}
                    onChange={(e) => setPlayerStartHole(e.target.value)}
                    required
                    min="1"
                    max="18"
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-green-900/50 focus:border-green-800 transition-all"
                    placeholder="Contoh: 1"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Semua pemain yang dipilih akan dimulai dari hole yang sama
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchPlayerQuery}
                    onChange={(e) => setSearchPlayerQuery(e.target.value)}
                    placeholder="Cari pemain berdasarkan nama atau email..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-green-900/50 focus:border-green-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                {/* Selection Summary */}
                <div className="flex items-center justify-between bg-gray-900/60 rounded-xl p-3 border border-gray-800/60">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-white font-semibold">
                      {selectedPlayerIds.size} pemain dipilih
                    </span>
                    <span className="text-gray-400">
                      dari {filteredAvailablePlayers.length} tersedia
                    </span>
                  </div>
                  {filteredAvailablePlayers.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAllPlayers}
                      className="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors"
                    >
                      {selectedPlayerIds.size === filteredAvailablePlayers.length ? 'Batalkan Semua' : 'Pilih Semua'}
                    </button>
                  )}
                </div>

                {/* Players List */}
                {filteredAvailablePlayers.length > 0 ? (
                  <div className="space-y-2 pr-2">
                    {filteredAvailablePlayers.map((player) => {
                      const isSelected = selectedPlayerIds.has(player._id);
                      return (
                        <label
                          key={player._id}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-green-900/30 border-green-800/60 shadow-md'
                              : 'bg-gray-900/40 border-gray-800/60 hover:border-green-900/40 hover:bg-gray-900/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePlayerSelection(player._id)}
                            className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-2 focus:ring-green-900/50 focus:ring-offset-0 bg-gray-800 cursor-pointer"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md border ${
                              isSelected
                                ? 'bg-gradient-to-br from-green-900/60 to-green-950/60 border-green-900/30'
                                : 'bg-gradient-to-br from-gray-700/60 to-gray-800/60 border-gray-700/30'
                            }`}>
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white">{player.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span>{player.email}</span>
                                {player.handicap !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span>HCP: {player.handicap}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-900/40 rounded-xl border-2 border-dashed border-gray-800/60">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {searchPlayerQuery ? 'Tidak Ada Pemain Ditemukan' : 'Tidak Ada Pemain Tersedia'}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {searchPlayerQuery 
                        ? 'Coba ubah kata kunci pencarian Anda' 
                        : 'Semua pemain sudah terdaftar di flight lain'}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 bg-gradient-to-t from-[#1a1a1a] to-[#1a1a1a]/95 px-6 py-4 border-t border-green-900/40">
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    icon={UserPlus} 
                    fullWidth
                    disabled={selectedPlayerIds.size === 0}
                  >
                    Tambahkan {selectedPlayerIds.size > 0 ? `${selectedPlayerIds.size} Pemain` : 'Pemain'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      setShowAddPlayer(false);
                      setSelectedPlayerIds(new Set());
                      setSearchPlayerQuery('');
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Flight Modal */}
      {showAddFlightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] to-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-900/40">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-900/80 to-red-950/80 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-red-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Buat Flight Baru</h3>
                  <p className="text-sm text-red-100">Tambahkan flight baru ke {selectedTournamentData?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddFlightModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateFlight} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nama Flight *</label>
                  <input
                    type="text"
                    value={flightName}
                    onChange={(e) => setFlightName(e.target.value)}
                    placeholder="contoh: Flight A"
                    required
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nomor Flight *</label>
                  <input
                    type="number"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="1"
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Hole Awal *</label>
                  <input
                    type="number"
                    value={startHole}
                    onChange={(e) => setStartHole(e.target.value)}
                    required
                    min="1"
                    max="18"
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Waktu Mulai (Opsional)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-red-900/40">
                <Button type="submit" variant="primary" size="lg" icon={Save} fullWidth>
                  Buat Flight
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowAddFlightModal(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showExcelUpload && selectedTournament && user && (
        <FlightExcelUpload
          tournamentId={selectedTournament}
          userId={user._id}
          onClose={() => setShowExcelUpload(false)}
          onSuccess={() => {
            setShowExcelUpload(false);
          }}
        />
      )}

      {/* Edit Flight Modal */}
      {showEditFlightModal && editingFlight && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] to-[#1a1a1a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-900/40">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-900/80 to-blue-950/80 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-blue-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Edit Flight</h3>
                  <p className="text-sm text-blue-100">Perbarui informasi flight</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditFlightModal(false);
                  setEditingFlight(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditFlight} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nama Flight *</label>
                  <input
                    type="text"
                    value={flightName}
                    onChange={(e) => setFlightName(e.target.value)}
                    placeholder="contoh: Flight A"
                    required
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-sm text-blue-300">
                    <strong>Catatan:</strong> Nomor flight tidak dapat diubah. Saat ini: Flight #{editingFlight.flightNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Hole Awal *</label>
                  <input
                    type="number"
                    value={startHole}
                    onChange={(e) => setStartHole(e.target.value)}
                    required
                    min="1"
                    max="18"
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Waktu Mulai (Opsional)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-blue-900/40">
                <Button type="submit" variant="primary" size="lg" icon={Save} fullWidth>
                  Perbarui Flight
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setShowEditFlightModal(false);
                    setEditingFlight(null);
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightManagement;
