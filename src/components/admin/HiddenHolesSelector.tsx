import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { CourseType } from '../../types';

interface HiddenHolesSelectorProps {
  tournamentId: Id<'tournaments'>;
  onSuccess?: () => void;
}

export default function HiddenHolesSelector({ tournamentId, onSuccess }: HiddenHolesSelectorProps) {
  const tournamentDetails = useQuery(api.tournaments.getTournamentDetails, { tournamentId });
  const setHiddenHoles = useMutation(api.hiddenHoles.setHiddenHoles);

  const [selectedHoles, setSelectedHoles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize selected holes from tournament data
  useEffect(() => {
    if (tournamentDetails?.hiddenHoles) {
      setSelectedHoles(tournamentDetails.hiddenHoles);
    }
  }, [tournamentDetails?.hiddenHoles]);

  if (tournamentDetails === undefined) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const courseType: CourseType = tournamentDetails.courseType as CourseType;

  // Determine hole range based on course type
  const getHoleRange = (): number[] => {
    if (courseType === 'F9') {
      return Array.from({ length: 9 }, (_, i) => i + 1);
    } else if (courseType === 'B9') {
      return Array.from({ length: 9 }, (_, i) => i + 10);
    } else {
      return Array.from({ length: 18 }, (_, i) => i + 1);
    }
  };

  const holes = getHoleRange();

  const toggleHole = (holeNumber: number) => {
    if (selectedHoles.includes(holeNumber)) {
      setSelectedHoles(selectedHoles.filter((h) => h !== holeNumber));
    } else {
      setSelectedHoles([...selectedHoles, holeNumber].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    setSelectedHoles([...holes]);
  };

  const clearAll = () => {
    setSelectedHoles([]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await setHiddenHoles({
        tournamentId,
        hiddenHoles: selectedHoles,
      });

      if (result.success) {
        setSuccessMessage(
          selectedHoles.length > 0
            ? `Successfully set ${selectedHoles.length} hidden hole(s)`
            : 'Hidden holes cleared'
        );

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set hidden holes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Hidden Holes Selection</h2>
        <p className="text-sm text-gray-600">
          Select holes for the hidden ranking system. Players won't see which holes are selected.
        </p>
      </div>

      {/* Course Type Info */}
      <div className="mb-4 p-3 bg-grass-green-50 border border-grass-green-200 rounded-lg">
        <p className="text-sm text-grass-green-800">
          <span className="font-medium">Course Type:</span>{' '}
          {courseType === '18holes' ? '18 Holes' : courseType === 'F9' ? 'Front 9' : 'Back 9'}
        </p>
        <p className="text-sm text-grass-green-800">
          <span className="font-medium">Available Holes:</span> {holes[0]} - {holes[holes.length - 1]}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Hole Selection Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {holes.map((holeNumber) => {
            const isSelected = selectedHoles.includes(holeNumber);
            return (
              <button
                key={holeNumber}
                type="button"
                onClick={() => toggleHole(holeNumber)}
                className={`aspect-square flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                  isSelected
                    ? 'bg-grass-green-600 text-white hover:bg-grass-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {holeNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Count */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Selected:</span> {selectedHoles.length} hole(s)
          {selectedHoles.length > 0 && (
            <span className="ml-2 text-gray-500">
              ({selectedHoles.join(', ')})
            </span>
          )}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="mb-4 bg-grass-green-50 border border-grass-green-200 rounded-lg p-4">
          <p className="text-sm text-grass-green-800">{successMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-grass-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-grass-green-700 focus:outline-none focus:ring-2 focus:ring-grass-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Saving...' : 'Save Hidden Holes'}
      </button>
    </div>
  );
}
