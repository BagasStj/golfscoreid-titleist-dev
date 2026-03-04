import { Plus, X } from 'lucide-react';

interface ClubEntry {
  brand: 'Titleist' | 'Other';
  model: string;
}

interface ClubSetsSelectorProps {
  drivers?: ClubEntry[];
  fairways?: ClubEntry[];
  hybrids?: ClubEntry[];
  utilityIrons?: ClubEntry[];
  irons?: ClubEntry[];
  wedges?: ClubEntry[];
  putters?: ClubEntry[];
  onChange: (category: string, clubs: ClubEntry[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  drivers: 'Drivers',
  fairways: 'Fairways',
  hybrids: 'Hybrids',
  utilityIrons: 'Utility Irons',
  irons: 'Irons',
  wedges: 'Wedges',
  putters: 'Putters',
};

export default function ClubSetsSelector({
  drivers = [],
  fairways = [],
  hybrids = [],
  utilityIrons = [],
  irons = [],
  wedges = [],
  putters = [],
  onChange,
}: ClubSetsSelectorProps) {
  const categories = {
    drivers,
    fairways,
    hybrids,
    utilityIrons,
    irons,
    wedges,
    putters,
  };

  // Ensure each category has at least 1 Titleist and 1 Other entry (default entries)
  const ensureDefaultEntries = (category: string) => {
    const currentClubs = categories[category as keyof typeof categories];
    const titleistClubs = currentClubs.filter(club => club.brand === 'Titleist');
    const otherClubs = currentClubs.filter(club => club.brand === 'Other');
    
    const updatedClubs = [...currentClubs];
    
    // Add default Titleist if none exists
    if (titleistClubs.length === 0) {
      updatedClubs.push({ brand: 'Titleist', model: '' });
    }
    
    // Add default Other if none exists
    if (otherClubs.length === 0) {
      updatedClubs.push({ brand: 'Other', model: '' });
    }
    
    if (updatedClubs.length !== currentClubs.length) {
      onChange(category, updatedClubs);
    }
  };

  const handleAddInput = (category: string, brand: 'Titleist' | 'Other') => {
    const currentClubs = categories[category as keyof typeof categories];
    const newClubs = [...currentClubs, { brand, model: '' }];
    onChange(category, newClubs);
  };

  const handleRemoveInput = (category: string, index: number, brand: 'Titleist' | 'Other') => {
    const currentClubs = categories[category as keyof typeof categories];
    const brandClubs = currentClubs.filter(club => club.brand === brand);
    
    // Always keep at least 1 entry of each brand (default entry cannot be deleted)
    if (brandClubs.length <= 1) {
      return;
    }
    
    const newClubs = currentClubs.filter((_, i) => i !== index);
    onChange(category, newClubs);
  };

  const handleModelChange = (category: string, index: number, model: string) => {
    const currentClubs = categories[category as keyof typeof categories];
    const newClubs = [...currentClubs];
    newClubs[index] = { ...newClubs[index], model };
    onChange(category, newClubs);
  };

   

  const renderClubInputs = (category: string, brand: 'Titleist' | 'Other') => {
    const allClubs = categories[category as keyof typeof categories];
    const brandClubs = allClubs.filter(club => club.brand === brand);
    
    // Ensure at least 1 default entry
    if (brandClubs.length === 0) {
      ensureDefaultEntries(category);
      return null;
    }

    return brandClubs.map((club, brandIndex) => {
      const actualIndex = allClubs.findIndex((c, i) => 
        c.brand === brand && allClubs.slice(0, i + 1).filter(x => x.brand === brand).length === brandIndex + 1
      );
      
      // First entry is always the default and cannot be deleted
      const isDefaultEntry = brandIndex === 0;

      return (
        <div key={actualIndex} className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={club.model}
              onChange={(e) => handleModelChange(category, actualIndex, e.target.value)}
              placeholder={`Enter ${brand} model...`}
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a]/60 border-2 border-gray-800/60 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
            />
            
            {!isDefaultEntry && (
              <button
                type="button" style={{    "justifyContent": "center", "alignItems": "center", "display": "flex"}}
                onClick={() => handleRemoveInput(category, actualIndex, brand)}
                className="p-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors border border-red-900/40"
                title="Remove this entry"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {isDefaultEntry && (
              <div className="w-[42px]"></div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-1 bg-red-700 rounded-full"></div>
        <h3 className="text-lg font-bold text-white">Club Sets</h3>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        // Ensure default entries on render
        ensureDefaultEntries(category);
        
        return (
          <div key={category} className="bg-[#1a1a1a]/40 border-2 border-gray-800/60 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-4 text-sm">{label}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Titleist Column */}
              <div className="bg-[#0a0a0a]/60 border border-gray-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-red-400 font-semibold text-sm">Titleist</span>
                  <button style={{    "justifyContent": "center", "alignItems": "center", "display": "flex"}}
                    type="button"
                    onClick={() => handleAddInput(category, 'Titleist')}
                    className="p-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors border border-red-900/40"
                    title="Add Titleist club"
                  >
                    <Plus className="w-4 h-4"  />
                  </button>
                </div>
                <div className="space-y-2">
                  {renderClubInputs(category, 'Titleist')}
                </div>
              </div>

              {/* Other Column */}
              <div className="bg-[#0a0a0a]/60 border border-gray-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-400 font-semibold text-sm">Other</span>
                  <button style={{    "justifyContent": "center", "alignItems": "center", "display": "flex"}}
                    type="button"
                    onClick={() => handleAddInput(category, 'Other')}
                    className="p-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors border border-blue-900/40"
                    title="Add other brand club"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {renderClubInputs(category, 'Other')}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
