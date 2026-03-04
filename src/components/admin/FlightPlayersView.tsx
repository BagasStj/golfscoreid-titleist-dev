import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';
import type { Id } from '../../../convex/_generated/dataModel';
import { UserPlus, Trash2, Users } from 'lucide-react';
import AddPlayersToFlightModal from './AddPlayersToFlightModal';

interface FlightPlayersViewProps {
  flightId: Id<'tournament_flights'>;
  tournamentId: Id<'tournaments'>;
}

export default function FlightPlayersView({ flightId, tournamentId }: FlightPlayersViewProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const flight = useQuery(api.flights.getFlightWithPlayers, { flightId });
  const removePlayer = useMutation(api.flights.removePlayerFromFlight);
  
  const [showAddModal, setShowAddModal] = useState(false);

  const handleRemovePlayer = async (participationId: Id<'tournament_participants'>) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to remove this player from the flight?')) {
      return;
    }

    try {
      await removePlayer({
        participationId,
        userId: user._id,
      });

      showSuccess('Player removed from flight');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to remove player');
    }
  };

  if (!flight) {
    return <div className="animate-pulse">Loading flight details...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-white">{flight.flightName} - Players</h4>
          <p className="text-sm text-gray-400">
            {flight.participants.length} player{flight.participants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900 via-green-800 to-green-900 hover:from-green-800 hover:via-green-700 hover:to-green-800 text-white rounded-lg transition-all text-sm shadow-[0_4px_12px_rgba(0,100,0,0.4)] border border-green-900/40"
        >
          <UserPlus size={18} />
          Add Players
        </button>
      </div>

      {/* Players List */}
      {flight.participants.length === 0 ? (
        <div className="text-center py-8 bg-gray-900/60 rounded-lg border-2 border-dashed border-gray-800/60">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No players in this flight yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {flight.participants.map((player: any) => (
            <div
              key={player._id}
              className="flex items-center justify-between p-3 bg-gray-900/60 border border-gray-800/60 rounded-lg hover:border-gray-700/60 transition-colors"
            >
              <div className="flex-1">
                <h5 className="font-semibold text-white">{player.name}</h5>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                  <span>{player.email}</span>
                  {player.handicap !== undefined && (
                    <span>Handicap: {player.handicap}</span>
                  )}
                  <span>Start Hole: {player.startHole}</span>
                </div>
              </div>
              <button
                onClick={() => handleRemovePlayer(player.participationId)}
                className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors border border-red-900/40"
                title="Remove player"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Players Modal */}
      {showAddModal && (
        <AddPlayersToFlightModal
          tournamentId={tournamentId}
          flightId={flightId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
