import { useState } from 'react';
import type { Id } from '../../../convex/_generated/dataModel';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '../ui';
import TournamentCreationForm from './TournamentCreationForm';
import TournamentManagementTable from './TournamentManagementTable';
import AddPlayersModal from './AddPlayersModal';

interface TournamentManagementProps {
  onSelectTournament: (tournamentId: Id<'tournaments'>) => void;
}

export default function TournamentManagement({ onSelectTournament }: TournamentManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTournamentForPlayers, setSelectedTournamentForPlayers] = useState<Id<'tournaments'> | null>(null);

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <TournamentCreationForm
          onSuccess={(tournamentId) => {
            setShowCreateForm(false);
            onSelectTournament(tournamentId as Id<'tournaments'>);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-red-500" />
            Manajemen Tournament
          </h2>
          <p className="text-gray-400 mt-1">Buat dan kelola tournament golf Anda</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowCreateForm(true)}
        >
          Buat Tournament
        </Button>
      </div>

      {/* Tournament Table */}
      <TournamentManagementTable
        onAddPlayers={(tournamentId) => {
          setSelectedTournamentForPlayers(tournamentId);
        }}
      />

      {/* Add Players Modal */}
      {selectedTournamentForPlayers && (
        <AddPlayersModal
          tournamentId={selectedTournamentForPlayers}
          onClose={() => setSelectedTournamentForPlayers(null)}
        />
      )}
    </div>
  );
}
