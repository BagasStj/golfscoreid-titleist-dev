import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TeeBox {
  name: string;
  color: string;
  rating?: number;
  slope?: number;
}

interface CourseFormModalProps {
  courseId?: Id<"courses">;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TEE_BOXES: TeeBox[] = [
  { name: 'Black', color: '#000000' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Gold', color: '#F59E0B' },
  { name: 'Red', color: '#EF4444' },
];

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  courseId,
  onClose,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const course = useQuery(
    api.courses.getById,
    courseId ? { courseId } : 'skip'
  );
  
  const createCourse = useMutation(api.courses.create);
  const updateCourse = useMutation(api.courses.update);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    totalHoles: 18,
  });

  const [teeBoxes, setTeeBoxes] = useState<TeeBox[]>(DEFAULT_TEE_BOXES);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        location: course.location,
        description: course.description || '',
        totalHoles: course.totalHoles,
      });
      setTeeBoxes(course.teeBoxes);
      setIsActive(course.isActive);
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('User not authenticated');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (courseId) {
        await updateCourse({
          courseId,
          ...formData,
          description: formData.description || undefined,
          teeBoxes,
          isActive,
          userId: currentUser._id,
        });
      } else {
        await createCourse({
          ...formData,
          description: formData.description || undefined,
          teeBoxes,
          userId: currentUser._id,
        });
      }
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeeBox = () => {
    setTeeBoxes([...teeBoxes, { name: '', color: '#000000' }]);
  };

  const removeTeeBox = (index: number) => {
    setTeeBoxes(teeBoxes.filter((_, i) => i !== index));
  };

  const updateTeeBox = (index: number, field: keyof TeeBox, value: any) => {
    const updated = [...teeBoxes];
    updated[index] = { ...updated[index], [field]: value };
    setTeeBoxes(updated);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={courseId ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Informasi Dasar</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Lapangan *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Pondok Indah Golf Course"
              required
              className="w-full px-3 py-2 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Lokasi *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Jakarta Selatan"
              required
              className="w-full px-3 py-2 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi singkat tentang lapangan..."
              className="w-full px-3 py-2 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Holes *
            </label>
            <select
              value={formData.totalHoles}
              onChange={(e) => setFormData({ ...formData, totalHoles: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
              required
            >
              <option value={9}>9 Holes</option>
              <option value={18}>18 Holes</option>
            </select>
          </div>

          {courseId && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-700 rounded focus:ring-red-500 bg-gray-800"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                Lapangan Aktif
              </label>
            </div>
          )}
        </div>

        {/* Tee Boxes Configuration */}
        <div className="space-y-4 border-t border-gray-800/60 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">Tee Boxes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTeeBox}
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Tee Box
            </Button>
          </div>

          <div className="space-y-3">
            {teeBoxes.map((teeBox, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-900/60 rounded-lg border border-gray-800/60">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Nama *
                    </label>
                    <input
                      type="text"
                      value={teeBox.name}
                      onChange={(e) => updateTeeBox(index, 'name', e.target.value)}
                      placeholder="e.g., Black"
                      required
                      className="w-full px-2 py-1.5 text-sm bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Warna *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={teeBox.color}
                        onChange={(e) => updateTeeBox(index, 'color', e.target.value)}
                        className="w-12 h-9 rounded border border-gray-700 cursor-pointer bg-gray-800"
                      />
                      <input
                        type="text"
                        value={teeBox.color}
                        onChange={(e) => updateTeeBox(index, 'color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 px-2 py-1.5 text-sm bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Rating (optional)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={teeBox.rating || ''}
                      onChange={(e) => updateTeeBox(index, 'rating', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g., 72.5"
                      className="w-full px-2 py-1.5 text-sm bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Slope (optional)
                    </label>
                    <input
                      type="number"
                      value={teeBox.slope || ''}
                      onChange={(e) => updateTeeBox(index, 'slope', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g., 130"
                      className="w-full px-2 py-1.5 text-sm bg-[#1a1a1a]/60 border border-gray-800/60 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTeeBox(index)}
                  className="text-red-400 hover:bg-red-950/40 mt-6 border-red-900/40"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
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
            disabled={isSubmitting || teeBoxes.length === 0}
            className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white border-red-900/40"
          >
            {isSubmitting ? 'Menyimpan...' : courseId ? 'Update' : 'Buat Lapangan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
