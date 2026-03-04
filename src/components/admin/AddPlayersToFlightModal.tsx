import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';
import type { Id } from '../../../convex/_generated/dataModel';
import { X, Search, UserPlus, Check } from 'lucide-react';

interface AddPlayersToFlightModalProps {
  tournamentId: Id<'tournaments'>;
  flightId: Id<'tournament_flights'>;
  onClose: () => void;
}

export default function AddPlayersToFlightModal({
  tournamentId,
  flightId,
  onClose,
}: AddPlayersToFlightModalProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const allPlayers = useQuery(api.users.listAllPlayers);
  const participants = useQuery(api.tournaments.getTournamentParticipants, { tournamentId });
  const flight = useQuery(api.flights.getFlightWithPlayers, { flightId });
  const addPlayer = useMutation(api.flights.addPlayerToFlight);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<Id<'users'>>>(new Set());
  const [startHoles, setStartHoles] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all player IDs that are already registered in ANY flight of this tournament
  const registeredPlayerIds = new Set(
    participants?.map((p) => p._id) || []
  );

  // Filter out players who are already registered in any flight of this tournament
  const availablePlayers = allPlayers?.filter(
    (player) => !registeredPlayerIds.has(player._id)
  );

  // Filter by search query
  const filteredPlayers = availablePlayers?.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlayer = (playerId: Id<'users'>) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
      const newStartHoles = { ...startHoles };
      delete newStartHoles[playerId];
      setStartHoles(newStartHoles);
    } else {
      newSelected.add(playerId);
      setStartHoles({ ...startHoles, [playerId]: flight?.startHole || 1 });
    }
    setSelectedPlayers(newSelected);
  };

  const setStartHole = (playerId: Id<'users'>, hole: number) => {
    setStartHoles({ ...startHoles, [playerId]: hole });
  };

  const handleAddPlayers = async () => {
    if (!user || selectedPlayers.size === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const playerId of selectedPlayers) {
        try {
          await addPlayer({
            flightId,
            playerId,
            startHole: startHoles[playerId] || flight?.startHole || 1,
            userId: user._id,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add player ${playerId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully added ${successCount} player(s) to flight`);
      }
      if (errorCount > 0) {
        showError(`Failed to add ${errorCount} player(s)`);
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      showError('Failed to add players');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!allPlayers || !participants || !flight) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-2xl w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800/60 rounded w-1/3"></div>
            <div className="h-12 bg-gray-800/60 rounded"></div>
            <div className="h-12 bg-gray-800/60 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/60">
          <div>
            <h2 className="text-2xl font-semibold text-white">Add Players to {flight.flightName}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select players and set their starting holes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors border border-gray-800/60"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
            />
          </div>
          {selectedPlayers.size > 0 && (
            <div className="mt-3 text-sm text-green-400 font-medium">
              {selectedPlayers.size} player(s) selected
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPlayers && filteredPlayers.length > 0 ? (
            <div className="space-y-3">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.has(player._id);
                return (
                  <div
                    key={player._id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-950/40'
                        : 'border-gray-800/60 hover:border-gray-700/60 bg-gray-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => togglePlayer(player._id)}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-700 hover:border-green-500'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{player.name}</h4>
                            <p className="text-sm text-gray-400">{player.email}</p>
                          </div>
                          {player.handicap !== undefined && (
                            <span className="text-sm text-gray-400">
                              Handicap: <span className="font-semibold text-gray-300">{player.handicap}</span>
                            </span>
                          )}
                        </div>

                        {/* Start Hole Selector */}
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-300">
                              Start Hole:
                            </label>
                            <select
                              value={startHoles[player._id] || flight.startHole}
                              onChange={(e) => setStartHole(player._id, parseInt(e.target.value))}
                              className="px-3 py-1 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white text-sm"
                            >
                              {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => (
                                <option key={hole} value={hole}>
                                  Hole {hole}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                {searchQuery ? 'No players found matching your search' : 'No available players'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/60 bg-gray-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-300 hover:bg-gray-800/60 rounded-lg font-medium transition-colors border border-gray-800/60"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPlayers}
            disabled={selectedPlayers.size === 0 || isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-green-900 via-green-800 to-green-900 hover:from-green-800 hover:via-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_rgba(0,100,0,0.4)] border border-green-900/40"
          >
            {isSubmitting
              ? 'Adding Players...'
              : `Add ${selectedPlayers.size} Player${selectedPlayers.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
