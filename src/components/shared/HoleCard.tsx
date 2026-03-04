import { useState } from 'react';

interface HoleCardProps {
  holeNumber: number;
  par: number;
  index: number;
  score?: number;
  onScoreChange?: (score: number) => void;
  isEditable?: boolean;
  isCurrentHole?: boolean;
}

export default function HoleCard({
  holeNumber,
  par,
  index,
  score,
  onScoreChange,
  isEditable = false,
  isCurrentHole = false,
}: HoleCardProps) {
  const [inputValue, setInputValue] = useState(score?.toString() || '');

  const handleSubmit = () => {
    const numValue = parseInt(inputValue);
    if (numValue > 0 && onScoreChange) {
      onScoreChange(numValue);
      setInputValue('');
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        isCurrentHole
          ? 'border-grass-green-500 shadow-lg ring-2 ring-grass-green-200'
          : 'border-gray-200 hover:border-grass-green-300'
      }`}
    >
      {/* Hole Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              isCurrentHole
                ? 'bg-grass-green-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {holeNumber}
          </div>
          <div className="text-sm">
            <div className="text-gray-500">Par {par}</div>
            <div className="text-gray-400 text-xs">Index {index}</div>
          </div>
        </div>

        {/* Score Display or Input */}
        {!isEditable && score !== undefined && (
          <div className="text-3xl font-bold text-grass-green-700">{score}</div>
        )}
      </div>

      {/* Editable Input */}
      {isEditable && (
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Strokes"
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-grass-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue || parseInt(inputValue) <= 0}
            className="px-6 py-3 bg-grass-green-600 text-white font-medium rounded-lg hover:bg-grass-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
