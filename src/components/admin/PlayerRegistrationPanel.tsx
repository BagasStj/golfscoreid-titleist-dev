import { Info } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

interface PlayerRegistrationPanelProps {
  tournamentId: Id<'tournaments'>;
  onSuccess?: () => void;
}

export default function PlayerRegistrationPanel({ }: PlayerRegistrationPanelProps) {
  return (
    <div className="bg-blue-950/40 border-2 border-blue-900/40 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            Player Registration via Flight Management
          </h3>
          <p className="text-blue-200 mb-4">
            Player registration is now managed through the Flight Management system. 
            This allows better organization of players into groups (flights) with specific start times and holes.
          </p>
          <div className="space-y-2 text-sm text-blue-300">
            <p><strong>To add players to this tournament:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Tournament Management</li>
              <li>Select this tournament</li>
              <li>Click on "Flight Management" tab</li>
              <li>Create flights for the tournament</li>
              <li>Add players to each flight</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
