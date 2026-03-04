import { Info } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

interface AddPlayersModalProps {
  tournamentId: Id<'tournaments'>;
  onClose: () => void;
}

export default function AddPlayersModal({ onClose }: AddPlayersModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-red-900/40 max-w-md w-full p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Use Flight Management
            </h3>
            <p className="text-gray-300 mb-4">
              Player registration is now managed through Flight Management. 
              Please use the Flight Management tab to add players to this tournament.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-2 px-4 rounded-lg transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] border border-red-900/40"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
