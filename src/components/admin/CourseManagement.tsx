import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Plus, Edit2, Trash2, MapPin, Settings } from 'lucide-react';
import { CourseFormModal } from './CourseFormModal';
import { HoleConfigurationModal } from './HoleConfigurationModal';
import { useAuth } from '../../contexts/AuthContext';

export const CourseManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Id<"courses"> | null>(null);
  const [configuringHoles, setConfiguringHoles] = useState<Id<"courses"> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<"courses"> | null>(null);

  const courses = useQuery(api.courses.list, { includeInactive: true });
  const deleteCourse = useMutation(api.courses.remove);

  const handleDelete = async (courseId: Id<"courses">) => {
    if (!currentUser) {
      alert('User not authenticated');
      return;
    }
    
    try {
      await deleteCourse({ courseId, userId: currentUser._id });
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Migration Helper - Show if needed */}
      {/* {showMigrationHelper && (
        <div className="relative">
          <MigrationHelper />
          <button
            onClick={() => setShowMigrationHelper(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            title="Hide this message"
          >
            ✕
          </button>
        </div>
      )} */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Course Management</h2>
          <p className="text-gray-400 mt-1">Kelola lapangan golf dan konfigurasi holes</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Lapangan
        </Button>
      </div>

      {/* Courses Grid */}
      {courses === undefined ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 text-center">
          <div className="py-12">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Belum Ada Lapangan
            </h3>
            <p className="text-gray-400 mb-6">
              Mulai dengan menambahkan lapangan golf pertama Anda
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Lapangan
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all">
              <div className="p-6">
                {/* Course Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {course.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {course.location}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.isActive
                        ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                        : 'bg-gray-800/40 text-gray-400 border border-gray-700/40'
                    }`}
                  >
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Course Info */}
                <div className="space-y-2 mb-4">
                  {course.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Holes:</span>
                    <span className="font-semibold text-white">
                      {course.totalHoles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tee Boxes:</span>
                    <span className="font-semibold text-white">
                      {course.teeBoxes.length}
                    </span>
                  </div>
                </div>

                {/* Tee Boxes */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Available Tee Boxes:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.teeBoxes.map((teeBox, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: teeBox.color + '20',
                          color: teeBox.color,
                          border: `1px solid ${teeBox.color}`,
                        }}
                      >
                        {teeBox.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-800/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfiguringHoles(course._id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Holes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse(course._id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(course._id)}
                    className="text-red-500 hover:bg-red-900/20 border-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CourseFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <CourseFormModal
          courseId={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => setEditingCourse(null)}
        />
      )}

      {/* Hole Configuration Modal */}
      {configuringHoles && (
        <HoleConfigurationModal
          courseId={configuringHoles}
          onClose={() => setConfiguringHoles(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Hapus Lapangan"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus lapangan ini? Semua konfigurasi holes akan ikut terhapus.
            </p>
            <p className="text-sm text-red-600">
              Note: Lapangan yang sudah digunakan dalam tournament tidak dapat dihapus.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Batal
              </Button>
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
