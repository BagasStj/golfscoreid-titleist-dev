import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import FlightPlayersView from './FlightPlayersView';
import { ArrowLeft, Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/ToastContainer';

interface TournamentFlightManagementProps {
  tournamentId: Id<'tournaments'>;
  onBack?: () => void;
}

export default function TournamentFlightManagement({
  tournamentId,
  onBack,
}: TournamentFlightManagementProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const tournament = useQuery(api.tournaments.getTournamentDetails, { tournamentId });
  const flights = useQuery(api.flights.getTournamentFlights, { tournamentId });
  
  const [selectedFlightId, setSelectedFlightId] = useState<Id<'tournament_flights'> | null>(null);
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [flightName, setFlightName] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [startHole, setStartHole] = useState('1');

  // Mutations
  const createFlight = useMutation(api.flights.createFlight);
  const deleteFlight = useMutation(api.flights.deleteFlight);

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createFlight({
        tournamentId,
        flightName,
        flightNumber: parseInt(flightNumber),
        startTime: startTime || undefined,
        startHole: parseInt(startHole),
        userId: user._id,
      });
      
      showSuccess('Flight created successfully!');
      
      // Reset form
      setFlightName('');
      setFlightNumber('');
      setStartTime('');
      setStartHole('1');
      setShowAddFlight(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create flight');
    }
  };

  const handleDeleteFlight = async (flightId: Id<'tournament_flights'>) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this flight?')) return;

    try {
      await deleteFlight({ flightId, userId: user._id });
      showSuccess('Flight deleted successfully!');
      if (selectedFlightId === flightId) {
        setSelectedFlightId(null);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete flight');
    }
  };

  if (!tournament || !flights) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-secondary-500">Loading tournament...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-secondary-900">{tournament.name}</h2>
            <p className="text-secondary-600 mt-1">Manage flights and assign players</p>
          </div>
          <button
            onClick={() => setShowAddFlight(!showAddFlight)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Flight
          </button>
        </div>

        {/* Add Flight Form */}
        {showAddFlight && (
          <form onSubmit={handleCreateFlight} className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <h3 className="font-semibold text-secondary-900 mb-4">Create New Flight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Flight Name *
                </label>
                <input
                  type="text"
                  value={flightName}
                  onChange={(e) => setFlightName(e.target.value)}
                  placeholder="e.g., Flight A"
                  required
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Flight Number *
                </label>
                <input
                  type="number"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="1"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Start Time (Optional)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Start Hole *
                </label>
                <input
                  type="number"
                  value={startHole}
                  onChange={(e) => setStartHole(e.target.value)}
                  required
                  min="1"
                  max="18"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Create Flight
              </button>
              <button
                type="button"
                onClick={() => setShowAddFlight(false)}
                className="px-6 py-2 bg-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Flights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flights List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Flights ({flights.length})</h3>
          
          {flights.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-secondary-300 p-8 text-center">
              <p className="text-secondary-600 mb-2">No flights created yet</p>
              <p className="text-sm text-secondary-500">Click "Add Flight" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flights.map((flight) => (
                <div
                  key={flight._id}
                  onClick={() => setSelectedFlightId(flight._id)}
                  className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    selectedFlightId === flight._id
                      ? 'border-primary-500 shadow-lg'
                      : 'border-secondary-200 hover:border-secondary-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-secondary-900 text-lg">{flight.flightName}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-secondary-600">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">#{flight.flightNumber}</span>
                        </span>
                        {flight.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {flight.startTime}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          Hole {flight.startHole}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {flight.participantCount} player{flight.participantCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFlight(flight._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete flight"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flight Players View */}
        <div>
          {selectedFlightId ? (
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <FlightPlayersView
                flightId={selectedFlightId}
                tournamentId={tournamentId}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-secondary-300 p-8 text-center h-full flex items-center justify-center">
              <div>
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-secondary-400" />
                </div>
                <p className="text-secondary-600 mb-1">Select a flight</p>
                <p className="text-sm text-secondary-500">Click on a flight to manage its players</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
