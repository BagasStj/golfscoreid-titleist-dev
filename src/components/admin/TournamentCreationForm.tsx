import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../shared/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import { X, Image as ImageIcon } from 'lucide-react';
import type { CourseType, GameMode, ScoringDisplay } from '../../types';
import type { Id } from '../../../convex/_generated/dataModel';

interface TournamentCreationFormProps {
  onSuccess?: (tournamentId: string) => void;
  onCancel?: () => void;
}

export default function TournamentCreationForm({ onSuccess, onCancel }: TournamentCreationFormProps) {
  const createTournament = useMutation(api.tournaments.createTournament);
  const generateUploadUrl = useMutation(api.tournaments.generateUploadUrl);
  const courses = useQuery(api.courses.list, { includeInactive: false }); // Only active courses
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    courseId: '' as Id<"courses"> | '',
    location: '', // Will be auto-filled from course
    prize: '',
    registrationFee: '',
    contactPerson: '',
    maxParticipants: 60,
    startHole: 1,
    courseType: '18holes' as CourseType,
    gameMode: 'strokePlay' as GameMode,
    scoringDisplay: 'stroke' as ScoringDisplay,
    specialScoringHoles: [] as number[],
    schedule: '',
    maleTeeBox: 'Blue' as 'Blue' | 'White' | 'Gold' | 'Black',
    femaleTeeBox: 'Red' as 'Red' | 'White' | 'Gold',
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string | number | number[]) => {
    switch (name) {
      case 'name':
        return !value || (typeof value === 'string' && !value.trim())
          ? 'Tournament name is required'
          : '';
      case 'courseId':
        return !value || (typeof value === 'string' && !value.trim())
          ? 'Course selection is required'
          : '';
      case 'date':
        return !value ? 'Date is required' : '';
      case 'time':
        return !value ? 'Time is required' : '';
      case 'startHole':
        return typeof value === 'number' && (value < 1 || value > 18)
          ? 'Start hole must be between 1 and 18'
          : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only validate specific fields
    ['name', 'courseId', 'date', 'time', 'startHole'].forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors({ ...errors, [name]: error });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      setBannerFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      showError('You must be logged in to create a tournament');
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload banner if provided
      let bannerStorageId: any; // Convex storage ID type
      if (bannerFile) {
        const uploadUrl = await generateUploadUrl();
        const uploadResult = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': bannerFile.type },
          body: bannerFile,
        });
        
        if (!uploadResult.ok) {
          throw new Error('Failed to upload banner');
        }
        
        const { storageId } = await uploadResult.json();
        bannerStorageId = storageId;
      }

      // Combine date and time into timestamp
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const timestamp = dateTime.getTime();

      const result = await createTournament({
        name: formData.name,
        description: formData.description,
        date: timestamp,
        courseId: formData.courseId || undefined,
        location: formData.location,
        prize: formData.prize || undefined,
        registrationFee: formData.registrationFee || undefined,
        contactPerson: formData.contactPerson || undefined,
        maxParticipants: formData.maxParticipants || undefined,
        bannerStorageId: bannerStorageId,
        startHole: formData.startHole,
        courseType: formData.courseType,
        gameMode: formData.gameMode,
        scoringDisplay: formData.scoringDisplay,
        specialScoringHoles: formData.specialScoringHoles.length > 0 ? formData.specialScoringHoles : undefined,
        schedule: formData.schedule || undefined,
        maleTeeBox: formData.maleTeeBox,
        femaleTeeBox: formData.femaleTeeBox,
        userId: user._id,
      });

      if (result.success && result.tournamentId) {
        showSuccess('Tournament created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          date: '',
          time: '',
          courseId: '',
          location: '',
          prize: '',
          registrationFee: '',
          contactPerson: '',
          maxParticipants: 60,
          startHole: 1,
          courseType: '18holes',
          gameMode: 'strokePlay',
          scoringDisplay: 'stroke',
          specialScoringHoles: [],
          schedule: '',
          maleTeeBox: 'Blue',
          femaleTeeBox: 'Red',
        });
        setBannerFile(null);
        setBannerPreview(null);
        setTouched({});
        setErrors({});
        
        if (onSuccess) {
          onSuccess(result.tournamentId);
        }
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 animate-fade-in">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Create New Tournament</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors border border-gray-700/40"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tournament Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Tournament Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => handleBlur('name')}
            className={`w-full px-4 py-2 border rounded-lg bg-[#1a1a1a]/60 text-white focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] placeholder-gray-600 ${
              touched.name && errors.name ? 'border-red-500' : 'border-gray-800/60'
            }`}
            placeholder="Enter tournament name"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-400 animate-fade-in text-left">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors placeholder-gray-600"
            placeholder="Enter tournament description"
          />
        </div>

        {/* Course Selection */}
        <div>
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Golf Course *
          </label>
          <select
            id="courseId"
            value={formData.courseId}
            onChange={(e) => {
              const selectedCourse = courses?.find(c => c._id === e.target.value);
              setFormData({ 
                ...formData, 
                courseId: e.target.value as Id<"courses">,
                location: selectedCourse ? `${selectedCourse.name} - ${selectedCourse.location}` : '',
              });
            }}
            onBlur={() => handleBlur('courseId')}
            className={`w-full px-4 py-2 border rounded-lg bg-[#1a1a1a]/60 text-white focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] ${
              touched.courseId && errors.courseId ? 'border-red-500' : 'border-gray-800/60'
            }`}
          >
            <option value="">-- Pilih Lapangan Golf --</option>
            {courses?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} - {course.location} ({course.totalHoles} holes)
              </option>
            ))}
          </select>
          {touched.courseId && errors.courseId && (
            <p className="mt-1 text-sm text-red-400 animate-fade-in text-left">{errors.courseId}</p>
          )}
          {!courses || courses.length === 0 ? (
            <p className="mt-1 text-sm text-amber-400 text-left">
              ⚠️ Belum ada course. Silakan buat course terlebih dahulu di menu Course Management.
            </p>
          ) : null}
        </div>

        {/* Location (Auto-filled, read-only) */}
        {formData.location && (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Location (Auto-filled from course)
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              readOnly
              className="w-full px-4 py-2 border border-gray-800/60 rounded-lg bg-gray-900/60 text-gray-400 cursor-not-allowed min-h-[44px]"
            />
          </div>
        )}

        {/* Schedule/Susunan Acara */}
        <div>
          <label htmlFor="schedule" className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Susunan Acara / Schedule (Optional)
          </label>
          <textarea
            id="schedule"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors placeholder-gray-600"
            placeholder="Contoh:&#10;07:00 - Registration&#10;08:00 - Opening Ceremony&#10;08:30 - Shotgun Start&#10;14:00 - Lunch&#10;16:00 - Prize Giving"
          />
          <p className="mt-1 text-xs text-gray-400 text-left">
            Masukkan jadwal acara tournament (opsional)
          </p>
        </div>

        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Tournament Banner (Optional)
          </label>
          <div className="space-y-3">
            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-800/60"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg border border-red-800/40"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-800/60 bg-[#1a1a1a]/40 rounded-lg p-8 text-center cursor-pointer hover:border-red-800 hover:bg-[#2e2e2e]/40 transition-colors"
              >
                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-300 mb-1">Click to upload banner image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              onBlur={() => handleBlur('date')}
              className={`w-full px-4 py-2 border rounded-lg bg-[#1a1a1a]/60 text-white focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] ${
                touched.date && errors.date ? 'border-red-500' : 'border-gray-800/60'
              }`}
            />
            {touched.date && errors.date && (
              <p className="mt-1 text-sm text-red-400 animate-fade-in text-left">{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Time *
            </label>
            <input
              type="time"
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              onBlur={() => handleBlur('time')}
              className={`w-full px-4 py-2 border rounded-lg bg-[#1a1a1a]/60 text-white focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] ${
                touched.time && errors.time ? 'border-red-500' : 'border-gray-800/60'
              }`}
            />
            {touched.time && errors.time && (
              <p className="mt-1 text-sm text-red-400 animate-fade-in text-left">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Prize, Registration Fee, Contact Person */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prize" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Prize (Optional)
            </label>
            <input
              type="text"
              id="prize"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] placeholder-gray-600"
              placeholder="e.g., Rp 50.000.000"
            />
          </div>

          <div>
            <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Registration Fee (Optional)
            </label>
            <input
              type="text"
              id="registrationFee"
              value={formData.registrationFee}
              onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] placeholder-gray-600"
              placeholder="e.g., Rp 500.000"
            />
          </div>

          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Contact Person (Optional)
            </label>
            <input
              type="text"
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] placeholder-gray-600"
              placeholder="e.g., John - 08123456789"
            />
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Max Participants (Optional)
          </label>
          <input
            type="number"
            id="maxParticipants"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 60 })}
            className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            min="1"
          />
        </div>

        {/* Start Hole & Course Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startHole" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Start Hole *
            </label>
            <input
              type="number"
              id="startHole"
              min="1"
              max="18"
              value={formData.startHole}
              onChange={(e) => setFormData({ ...formData, startHole: parseInt(e.target.value) || 1 })}
              onBlur={() => handleBlur('startHole')}
              className={`w-full px-4 py-2 border rounded-lg bg-[#1a1a1a]/60 text-white focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px] ${
                touched.startHole && errors.startHole ? 'border-red-500' : 'border-gray-800/60'
              }`}
            />
            {touched.startHole && errors.startHole && (
              <p className="mt-1 text-sm text-red-400 animate-fade-in text-left">{errors.startHole}</p>
            )}
          </div>

          <div>
            <label htmlFor="courseType" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Course Type *
            </label>
            <select
              id="courseType"
              value={formData.courseType}
              onChange={(e) => setFormData({ ...formData, courseType: e.target.value as CourseType, specialScoringHoles: [] })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            >
              <option value="18holes">18 Holes</option>
              <option value="F9">Front 9 (F9)</option>
              <option value="B9">Back 9 (B9)</option>
            </select>
          </div>
        </div>

        {/* Tee Box Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="maleTeeBox" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Tee Box Laki-laki (Male) *
            </label>
            <select
              id="maleTeeBox"
              value={formData.maleTeeBox}
              onChange={(e) => setFormData({ ...formData, maleTeeBox: e.target.value as 'Blue' | 'White' | 'Gold' | 'Black' })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            >
              <option value="Blue">Blue Tee</option>
              <option value="White">White Tee</option>
              <option value="Gold">Gold Tee</option>
              <option value="Black">Black Tee</option>
            </select>
            <p className="mt-1 text-xs text-gray-400 text-left">
              Pilih tee box untuk pemain laki-laki
            </p>
          </div>

          <div>
            <label htmlFor="femaleTeeBox" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Tee Box Perempuan (Female) *
            </label>
            <select
              id="femaleTeeBox"
              value={formData.femaleTeeBox}
              onChange={(e) => setFormData({ ...formData, femaleTeeBox: e.target.value as 'Red' | 'White' | 'Gold' })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            >
              <option value="Red">Red Tee</option>
              <option value="White">White Tee</option>
              <option value="Gold">Gold Tee</option>
            </select>
            <p className="mt-1 text-xs text-gray-400 text-left">
              Pilih tee box untuk pemain perempuan
            </p>
          </div>
        </div>

        {/* Game Mode & Scoring Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gameMode" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Game Mode *
            </label>
            <select
              id="gameMode"
              value={formData.gameMode}
              onChange={(e) => setFormData({ ...formData, gameMode: e.target.value as GameMode })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            >
              <option value="strokePlay">Stroke Play</option>
              <option value="stableford">Stableford</option>
              <option value="system36">System 36</option>
            </select>
          </div>

          <div>
            <label htmlFor="scoringDisplay" className="block text-sm font-medium text-gray-300 mb-2 text-left">
              Scoring Display *
            </label>
            <select
              id="scoringDisplay"
              value={formData.scoringDisplay}
              onChange={(e) => setFormData({ ...formData, scoringDisplay: e.target.value as ScoringDisplay })}
              className="w-full px-4 py-2 border border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-lg focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-colors min-h-[44px]"
            >
              <option value="stroke">Stroke</option>
              <option value="over">Over/Under Par</option>
            </select>
          </div>
        </div>

        {/* Special Scoring Holes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
            Special Scoring Holes (Optional)
          </label>
          <p className="text-sm text-gray-400 mb-3 text-left">
            Select holes for special leaderboard. Tournament will have 2 leaderboards: overall and special holes only.
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
            {(() => {
              const holes: number[] = [];
              if (formData.courseType === '18holes') {
                for (let i = 1; i <= 18; i++) holes.push(i);
              } else if (formData.courseType === 'F9') {
                for (let i = 1; i <= 9; i++) holes.push(i);
              } else if (formData.courseType === 'B9') {
                for (let i = 10; i <= 18; i++) holes.push(i);
              }
              return holes.map((hole) => {
                const isSelected = formData.specialScoringHoles.includes(hole);
                return (
                  <button
                    key={hole}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          specialScoringHoles: formData.specialScoringHoles.filter((h) => h !== hole),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          specialScoringHoles: [...formData.specialScoringHoles, hole].sort((a, b) => a - b),
                        });
                      }
                    }}
                    className={`px-3 py-2 rounded-lg font-bold transition-all min-h-[44px] text-base ${
                      isSelected
                        ? 'bg-green-500 text-white hover:bg-green-600 border-2 border-green-600 shadow-lg'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-2 border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {hole}
                  </button>
                );
              });
            })()}
          </div>
          {formData.specialScoringHoles.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-sm text-green-800 font-semibold text-left">
                <strong>Selected holes:</strong> {formData.specialScoringHoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-bold text-lg focus:outline-none focus:ring-4 focus:ring-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(139,0,0,0.5)] min-h-[52px] border border-red-900/40"
        >
          {isSubmitting ? 'Creating Tournament...' : 'Create Tournament'}
        </button>
      </form>
    </div>
  );
}
