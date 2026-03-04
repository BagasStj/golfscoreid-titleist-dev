import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Database, Trash2 } from 'lucide-react';

export const MigrationHelper: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const courses = useQuery(api.courses.list, { includeInactive: true });
  const migrateHoles = useMutation(api.migrateHolesConfig.migrateHolesConfigToCourse);
  const deleteOldHoles = useMutation(api.migrateHolesConfig.deleteOldHolesConfig);

  const handleMigrate = async () => {
    if (!selectedCourseId) {
      alert('Please select a course first');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await migrateHoles({ courseId: selectedCourseId });
      setResult(`✅ ${response.message}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete all old holes_config records that don\'t have a courseId. Are you sure?')) {
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await deleteOldHoles({});
      setResult(`✅ ${response.message}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Database Migration Required
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Your database contains old holes_config records without courseId. 
            You need to migrate them to a course or delete them.
          </p>

          <div className="space-y-4">
            {/* Migration Option */}
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Option 1: Migrate to Course</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Assign existing holes configuration to a course. This preserves your data.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Course:
                  </label>
                  <select
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value as Id<"courses">)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  >
                    <option value="">-- Select a course --</option>
                    {courses?.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.location})
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  onClick={handleMigrate}
                  disabled={!selectedCourseId || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Migrating...' : 'Migrate to Selected Course'}
                </Button>
              </div>
            </div>

            {/* Delete Option */}
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-gray-900">Option 2: Delete Old Data</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                ⚠️ Permanently delete old holes_config records. This cannot be undone!
              </p>
              
              <Button
                onClick={handleDelete}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Deleting...' : 'Delete Old Records'}
              </Button>
            </div>

            {/* Result Message */}
            {result && (
              <div className={`p-4 rounded-lg ${
                result.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">{result}</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> After migration or deletion, this warning will disappear. 
              You can then create new courses and configure holes properly.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
