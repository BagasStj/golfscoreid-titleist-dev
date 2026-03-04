interface ClubEntry {
  brand: string;
  model: string;
}

interface ClubSetsSelectorSimpleProps {
  drivers?: ClubEntry[];
  fairways?: ClubEntry[];
  hybrids?: ClubEntry[];
  irons?: ClubEntry[];
  wedges?: ClubEntry[];
  putters?: ClubEntry[];
  golfBalls?: ClubEntry[];
  onChange: (category: string, clubs: ClubEntry[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  drivers: 'Driver',
  fairways: 'Fairway',
  hybrids: 'Hybrid',
  irons: 'Iron',
  wedges: 'Wedge',
  putters: 'Putter',
  golfBalls: 'Golf Ball',
};

export default function ClubSetsSelectorSimple({
  drivers = [],
  fairways = [],
  hybrids = [],
  irons = [],
  wedges = [],
  putters = [],
  golfBalls = [],
  onChange,
}: ClubSetsSelectorSimpleProps) {
  const categories = {
    drivers,
    fairways,
    hybrids,
    irons,
    wedges,
    putters,
    golfBalls,
  };

  const handleBrandChange = (category: string, brand: string) => {
    const currentClubs = categories[category as keyof typeof categories];
    const model = currentClubs[0]?.model || '';
    onChange(category, [{ brand, model }]);
  };

  const handleModelChange = (category: string, model: string) => {
    const currentClubs = categories[category as keyof typeof categories];
    const brand = currentClubs[0]?.brand || '';
    onChange(category, [{ brand, model }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-1 bg-red-700 rounded-full"></div>
        <h3 className="text-lg font-bold text-white">Club Sets</h3>
        <span className="text-red-500 text-sm">*</span>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const currentClub = categories[category as keyof typeof categories][0] || { brand: '', model: '' };
        
        return (
          <div key={category} className="bg-[#1a1a1a]/40 border-2 border-gray-800/60 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">{label}</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Brand Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Brand</label>
                <input
                  type="text"
                  value={currentClub.brand}
                  onChange={(e) => handleBrandChange(category, e.target.value)}
                  placeholder="Enter brand"
                  required
                  className="w-full px-3 py-2.5 bg-[#181919b3] border-2 border-[#2d2d2d] text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all text-sm hover:border-gray-700"
                />
              </div>

              {/* Model Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  {category === 'golfBalls' ? 'Type' : 'Model'}
                </label>
                <input
                  type="text"
                  value={currentClub.model}
                  onChange={(e) => handleModelChange(category, e.target.value)}
                  placeholder={category === 'golfBalls' ? 'Enter type' : 'Enter model'}
                  required
                  className="w-full px-3 py-2.5 bg-[#181919b3] border-2 border-[#2d2d2d] text-white placeholder-gray-600 rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all text-sm hover:border-gray-700"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
