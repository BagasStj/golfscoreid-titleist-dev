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
  Save
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
      alert(error instanceof Error ? error.message : 'Failed to create flight');
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
      alert(error instanceof Error ? error.message : 'Failed to update flight');
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
    if (!confirm('Are you sure you want to delete this flight?')) return;

    try {
      await deleteFlight({ flightId, userId: user._id });
      if (selectedFlight === flightId) {
        setSelectedFlight(null);
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete flight');
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFlight || !selectedPlayerId) return;

    try {
      await addPlayerToFlight({
        flightId: selectedFlight,
        playerId: selectedPlayerId,
        startHole: parseInt(playerStartHole),
        userId: user._id,
      });
      
      // Reset form
      setSelectedPlayerId(null);
      setPlayerStartHole('1');
      setShowAddPlayer(false);
    } catch (error) {
      console.error('Error adding player:', error);
      alert(error instanceof Error ? error.message : 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (participationId: Id<"tournament_participants">) => {
    if (!user) return;
    if (!confirm('Remove this player from the flight?')) return;

    try {
      await removePlayerFromFlight({ participationId, userId: user._id });
    } catch (error) {
      console.error('Error removing player:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove player');
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
      alert(error instanceof Error ? error.message : 'Failed to move player');
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
          Flight Management
        </h2>
        <p className="text-gray-400 mt-1">
          {selectedTournament 
            ? `Managing flights for ${selectedTournamentData?.name}`
            : 'Select a tournament to manage flights'}
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
                          <span className="text-gray-500 text-xs">Click to manage flights</span>
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
                <h3 className="text-lg font-semibold text-white mb-2">No Tournaments Available</h3>
                <p className="text-sm text-gray-400">Create a tournament first to manage flights</p>
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
              Back to Tournaments
            </button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                icon={Upload}
                onClick={() => setShowExcelUpload(true)}
              >
                Excel Upload
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => setShowAddFlightModal(true)}
              >
                Add Flight
              </Button>
            </div>
          </div>

          {/* Flights Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-red-500" />
              Flights ({flights?.length || 0})
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
                            title="Delete Flight"
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
                          <span>Start from Hole {flight.startHole}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-white">
                            {flight.participantCount} Player{flight.participantCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {selectedFlight === flight._id && (
                        <div className="pt-2">
                          <div className="bg-red-950/40 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg text-center border border-red-900/30">
                            Selected - View details below
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
                  <h3 className="text-lg font-semibold text-white mb-2">No Flights Yet</h3>
                  <p className="text-sm text-gray-400 mb-4">Create your first flight for this tournament</p>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Plus}
                    onClick={() => setShowAddFlightModal(true)}
                  >
                    Create First Flight
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
                      Players in {flightDetails.flightName}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {flightDetails.participants.length} player{flightDetails.participants.length !== 1 ? 's' : ''} registered
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Plus}
                    onClick={() => setShowAddPlayer(!showAddPlayer)}
                  >
                    {showAddPlayer ? 'Cancel' : 'Add Player'}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {flightDetails.participants.map((player: any) => (
                      <div
                        key={player._id}
                        className="bg-gray-900/60 rounded-xl border-2 border-gray-800/60 hover:border-red-900/40 hover:shadow-md transition-all p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-900/60 to-red-950/60 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md border border-red-900/30">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{player.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span>HCP: {player.handicap || 'N/A'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  Hole {player.startHole}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {availableFlightsForMove.length > 0 && (
                              <button
                                onClick={() => {
                                  setMovingPlayerId(player.participationId);
                                  setTargetFlightId(null);
                                }}
                                className="p-2 hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors border border-blue-900/30"
                                title="Move to another flight"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleRemovePlayer(player.participationId)}
                              className="p-2 hover:bg-red-900/30 text-red-500 rounded-lg transition-colors border border-red-900/30"
                              title="Remove from flight"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Move Player Modal */}
                        {movingPlayerId === player.participationId && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Move to Flight:</label>
                            <div className="flex gap-2">
                              <select
                                value={targetFlightId || ''}
                                onChange={(e) => setTargetFlightId(e.target.value as Id<"tournament_flights">)}
                                className="flex-1 px-3 py-2 bg-gray-900/60 border border-gray-700/60 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800"
                              >
                                <option value="">-- Select Flight --</option>
                                {availableFlightsForMove.map((f) => (
                                  <option key={f._id} value={f._id}>
                                    {f.flightName} (Flight #{f.flightNumber})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={handleMovePlayer}
                                disabled={!targetFlightId}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                              >
                                Move
                              </button>
                              <button
                                onClick={() => {
                                  setMovingPlayerId(null);
                                  setTargetFlightId(null);
                                }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-900/40 rounded-xl border-2 border-dashed border-gray-800/60">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-white mb-1">No Players Yet</h4>
                    <p className="text-xs text-gray-400">Click "Add Player" to add players to this flight</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  <h3 className="text-xl font-bold">Create New Flight</h3>
                  <p className="text-sm text-red-100">Add a new flight to {selectedTournamentData?.name}</p>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Flight Name *</label>
                  <input
                    type="text"
                    value={flightName}
                    onChange={(e) => setFlightName(e.target.value)}
                    placeholder="e.g., Flight A"
                    required
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Flight Number *</label>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Start Hole *</label>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Start Time (Optional)</label>
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
                  Create Flight
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowAddFlightModal(false)}
                >
                  Cancel
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
                  <p className="text-sm text-blue-100">Update flight information</p>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Flight Name *</label>
                  <input
                    type="text"
                    value={flightName}
                    onChange={(e) => setFlightName(e.target.value)}
                    placeholder="e.g., Flight A"
                    required
                    className="w-full px-4 py-3 bg-gray-900/60 border-2 border-gray-700/60 text-white rounded-xl focus:ring-2 focus:ring-blue-900/50 focus:border-blue-800 transition-all placeholder:text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-sm text-blue-300">
                    <strong>Note:</strong> Flight number cannot be changed. Current: Flight #{editingFlight.flightNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Start Hole *</label>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Start Time (Optional)</label>
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
                  Update Flight
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
                  Cancel
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
