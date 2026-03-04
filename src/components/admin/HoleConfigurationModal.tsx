import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Save, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HoleConfig {
  holeNumber: number;
  par: number;
  index: number;
  courseSection: 'front9' | 'back9';
  distances: { teeBoxName: string; distance: number }[];
}

interface HoleConfigurationModalProps {
  courseId: Id<"courses">;
  onClose: () => void;
}

export const HoleConfigurationModal: React.FC<HoleConfigurationModalProps> = ({
  courseId,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const courseWithHoles = useQuery(api.courses.getWithHoles, { courseId });
  const bulkUpsertHoles = useMutation(api.courses.bulkUpsertHoles);

  const [holes, setHoles] = useState<HoleConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (courseWithHoles) {
      if (courseWithHoles.holes.length > 0) {
        // Load existing holes
        setHoles(courseWithHoles.holes.map(h => ({
          holeNumber: h.holeNumber,
          par: h.par,
          index: h.index,
          courseSection: h.courseSection,
          distances: h.distances || courseWithHoles.teeBoxes.map(tb => ({
            teeBoxName: tb.name,
            distance: 0,
          })),
        })));
      } else {
        // Initialize empty holes
        const initialHoles: HoleConfig[] = [];
        for (let i = 1; i <= courseWithHoles.totalHoles; i++) {
          initialHoles.push({
            holeNumber: i,
            par: 4,
            index: i,
            courseSection: i <= 9 ? 'front9' : 'back9',
            distances: courseWithHoles.teeBoxes.map(tb => ({
              teeBoxName: tb.name,
              distance: 0,
            })),
          });
        }
        setHoles(initialHoles);
      }
    }
  }, [courseWithHoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('User not authenticated');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await bulkUpsertHoles({ 
        courseId, 
        holes,
        userId: currentUser._id,
      });
      alert('Konfigurasi holes berhasil disimpan!');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to save hole configurations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateHole = (holeNumber: number, field: keyof HoleConfig, value: any) => {
    setHoles(holes.map(h => 
      h.holeNumber === holeNumber ? { ...h, [field]: value } : h
    ));
  };

  const updateDistance = (holeNumber: number, teeBoxName: string, distance: number) => {
    setHoles(holes.map(h => {
      if (h.holeNumber === holeNumber) {
        return {
          ...h,
          distances: h.distances.map(d =>
            d.teeBoxName === teeBoxName ? { ...d, distance } : d
          ),
        };
      }
      return h;
    }));
  };

  const exportToCSV = () => {
    if (!courseWithHoles) return;

    const headers = ['Hole', 'Par', 'Index', 'Section', ...courseWithHoles.teeBoxes.map(tb => `${tb.name} (m)`)];
    const rows = holes.map(h => [
      h.holeNumber,
      h.par,
      h.index,
      h.courseSection,
      ...h.distances.map(d => d.distance),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseWithHoles.name.replace(/\s+/g, '_')}_holes_config.csv`;
    a.click();
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedHoles: HoleConfig[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const holeNumber = parseInt(values[0]);
          const par = parseInt(values[1]);
          const index = parseInt(values[2]);
          const courseSection = values[3] as 'front9' | 'back9';
          
          const distances = [];
          for (let j = 4; j < values.length; j++) {
            const teeBoxName = headers[j].replace(' (m)', '').trim();
            distances.push({
              teeBoxName,
              distance: parseInt(values[j]) || 0,
            });
          }
          
          importedHoles.push({
            holeNumber,
            par,
            index,
            courseSection,
            distances,
          });
        }
        
        setHoles(importedHoles);
        alert('Data berhasil diimport!');
      } catch (error) {
        alert('Error importing CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  if (!courseWithHoles) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Loading..." size="xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Configure Holes - ${courseWithHoles.name}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Import/Export Actions */}
        <div className="flex gap-3 justify-end">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/60 border border-gray-700/60 rounded-lg hover:bg-gray-700/60 transition-colors">
              <Upload className="w-4 h-4" />
              Import CSV
            </span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="border-gray-700/60 text-gray-300 hover:bg-gray-800/60"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Holes Table */}
        <div className="overflow-x-auto border border-gray-800/60 rounded-lg">
          <table className="min-w-full divide-y divide-gray-800/60">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-900/60 z-10">
                  Hole
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Par
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Section
                </th>
                {courseWithHoles.teeBoxes.map((teeBox) => (
                  <th
                    key={teeBox.name}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: teeBox.color }}
                  >
                    {teeBox.name} (m)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a]/60 divide-y divide-gray-800/60">
              {holes.map((hole) => (
                <tr key={hole.holeNumber} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-[#1a1a1a]/60">
                    {hole.holeNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      min="3"
                      max="6"
                      value={hole.par}
                      onChange={(e) => updateHole(hole.holeNumber, 'par', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm bg-gray-900/60 border border-gray-800/60 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      min="1"
                      max={courseWithHoles.totalHoles}
                      value={hole.index}
                      onChange={(e) => updateHole(hole.holeNumber, 'index', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm bg-gray-900/60 border border-gray-800/60 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={hole.courseSection}
                      onChange={(e) => updateHole(hole.holeNumber, 'courseSection', e.target.value)}
                      className="px-2 py-1 text-sm bg-gray-900/60 border border-gray-800/60 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                    >
                      <option value="front9">Front 9</option>
                      <option value="back9">Back 9</option>
                    </select>
                  </td>
                  {courseWithHoles.teeBoxes.map((teeBox) => {
                    const distance = hole.distances.find(d => d.teeBoxName === teeBox.name);
                    return (
                      <td key={teeBox.name} className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={distance?.distance || 0}
                          onChange={(e) => updateDistance(hole.holeNumber, teeBox.name, Number(e.target.value))}
                          className="w-20 px-2 py-1 text-sm bg-gray-900/60 border border-gray-800/60 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-800/60 font-semibold">
                <td className="px-4 py-3 text-sm text-white sticky left-0 bg-gray-800/60">
                  Total
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {holes.reduce((sum, h) => sum + h.par, 0)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                {courseWithHoles.teeBoxes.map((teeBox) => (
                  <td key={teeBox.name} className="px-4 py-3 text-sm text-white">
                    {holes.reduce((sum, h) => {
                      const dist = h.distances.find(d => d.teeBoxName === teeBox.name);
                      return sum + (dist?.distance || 0);
                    }, 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-6 border-t border-gray-800/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-700/60 text-gray-300 hover:bg-gray-800/60"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white border-red-900/40"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
