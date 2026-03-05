import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '../../contexts/AuthContext';

type InformationType = 'factsheet' | 'teesheet' | 'activity' | 'contact';

const InformationManagement: React.FC = () => {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Id<"information"> | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<InformationType>('factsheet');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [order, setOrder] = useState('');
  
  // Contact fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{ url: string; type: string; title: string } | null>(null);

  // Queries
  const allInformation = useQuery(api.information.getAllInformation, user ? { userId: user._id } : "skip");

  // Mutations
  const createInformation = useMutation(api.information.createInformation);
  const updateInformation = useMutation(api.information.updateInformation);
  const deleteInformation = useMutation(api.information.deleteInformation);
  const togglePublished = useMutation(api.information.togglePublished);
  const generateUploadUrl = useMutation(api.information.generateUploadUrl);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('factsheet');
    setFile(null);
    setFilePreview(null);
    setIsPublished(false);
    setOrder('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactPosition('');
    setEditingInfo(null);
    setShowDialog(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type based on information type
      const validTypes = type === 'activity' 
        ? ['image/png']
        : ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert(type === 'activity' 
          ? 'Silakan pilih file PNG untuk activity'
          : 'Silakan pilih file PDF, JPG, atau PNG');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Ukuran file harus kurang dari 10MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // For PDF, just set a flag that we have a PDF
        setFilePreview('PDF_FILE');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate contact type
    if (type === 'contact' && (!contactName || !contactPhone || !contactEmail)) {
      alert('Please fill in all contact fields');
      return;
    }

    // Validate file for non-contact types
    if (type !== 'contact' && !file && !editingInfo) {
      alert('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      let fileStorageId: Id<"_storage"> | undefined;
      let fileType: string | undefined;

      // Upload file if new file is selected
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error('Failed to upload file');
        }

        const { storageId } = await result.json();
        fileStorageId = storageId;
        fileType = file.type.includes('pdf') ? 'pdf' : file.type.split('/')[1];
      } else if (editingInfo) {
        // Keep existing file when editing
        const existingInfo = allInformation?.find(i => i._id === editingInfo);
        if (existingInfo?.fileStorageId) {
          fileStorageId = existingInfo.fileStorageId;
          fileType = existingInfo.fileType;
        }
      }

      if (editingInfo) {
        await updateInformation({
          informationId: editingInfo,
          title,
          description: description || undefined,
          fileStorageId,
          fileType,
          contactName: type === 'contact' ? contactName : undefined,
          contactPhone: type === 'contact' ? contactPhone : undefined,
          contactEmail: type === 'contact' ? contactEmail : undefined,
          contactPosition: type === 'contact' ? contactPosition : undefined,
          isPublished,
          order: order ? parseInt(order) : undefined,
          userId: user._id,
        });
      } else {
        await createInformation({
          title,
          description: description || undefined,
          type,
          fileStorageId,
          fileType,
          contactName: type === 'contact' ? contactName : undefined,
          contactPhone: type === 'contact' ? contactPhone : undefined,
          contactEmail: type === 'contact' ? contactEmail : undefined,
          contactPosition: type === 'contact' ? contactPosition : undefined,
          isPublished,
          order: order ? parseInt(order) : undefined,
          userId: user._id,
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving information:', error);
      alert(error instanceof Error ? error.message : 'Failed to save information');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (info: any) => {
    setTitle(info.title);
    setDescription(info.description || '');
    setType(info.type);
    setIsPublished(info.isPublished);
    setOrder(info.order?.toString() || '');
    setContactName(info.contactName || '');
    setContactPhone(info.contactPhone || '');
    setContactEmail(info.contactEmail || '');
    setContactPosition(info.contactPosition || '');
    setFilePreview(info.fileUrl || null);
    setEditingInfo(info._id);
    setShowDialog(true);
  };

  const handleDelete = async (infoId: Id<"information">) => {
    if (!user) return;
    if (!confirm('Apakah Anda yakin ingin menghapus informasi ini?')) return;

    try {
      await deleteInformation({ informationId: infoId, userId: user._id });
    } catch (error) {
      console.error('Error deleting information:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus informasi');
    }
  };

  const handleTogglePublished = async (infoId: Id<"information">) => {
    if (!user) return;
    try {
      await togglePublished({ informationId: infoId, userId: user._id });
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert(error instanceof Error ? error.message : 'Gagal mengubah status');
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'factsheet': return 'Fact Sheet';
      case 'teesheet': return 'Tee Sheet';
      case 'activity': return 'Activity';
      case 'contact': return 'Contact';
      default: return t;
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'factsheet': return 'bg-blue-500';
      case 'teesheet': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      case 'contact': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-red-700 rounded-full"></span>
          Manajemen Informasi
        </h2>
        <p className="text-gray-400 mt-1">Kelola Fact Sheet, Tee Sheet, Activity, dan Contact</p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(139,0,0,0.5)] flex items-center gap-2 border border-red-900/40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Informasi
        </button>
      </div>

      {/* Dialog Form */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl border-2 border-red-900/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 border-b border-red-900/40 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {editingInfo ? 'Edit Informasi' : 'Tambah Informasi Baru'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Judul *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                    placeholder="Masukkan judul"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tipe *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InformationType)}
                    disabled={!!editingInfo}
                    className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all disabled:opacity-50"
                  >
                    <option value="factsheet">Fact Sheet</option>
                    <option value="teesheet">Tee Sheet</option>
                    <option value="activity">Activity</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all resize-none placeholder-gray-600"
                  placeholder="Deskripsi singkat"
                />
              </div>

              {/* File Upload for non-contact types */}
              {type !== 'contact' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    File {type === 'activity' ? '(PNG only)' : '(PDF, JPG, PNG)'} *
                  </label>
                  
                  {(filePreview || file) ? (
                    <div className="relative">
                      {filePreview === 'PDF_FILE' || (filePreview && (filePreview.includes('.pdf') || file?.type === 'application/pdf')) ? (
                        <div className="w-full h-64 bg-gray-900/60 rounded-xl border-2 border-gray-800/60 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-white font-semibold mb-1">PDF File</p>
                            {file && <p className="text-gray-400 text-sm">{file.name}</p>}
                          </div>
                        </div>
                      ) : filePreview && filePreview.startsWith('data:') ? (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="w-full h-64 object-contain rounded-xl border-2 border-gray-800/60 bg-gray-900/40"
                        />
                      ) : filePreview ? (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="w-full h-64 object-contain rounded-xl border-2 border-gray-800/60 bg-gray-900/40"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-colors border border-red-800/40"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-800/60 bg-[#1a1a1a]/40 rounded-xl p-8 text-center hover:border-red-800 transition-colors">
                      <input
                        type="file"
                        accept={type === 'activity' ? 'image/png' : 'application/pdf,image/jpeg,image/jpg,image/png'}
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-red-900/40 rounded-2xl flex items-center justify-center mb-3 border border-red-800/40">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <span className="text-white font-medium mb-1">Klik untuk upload file</span>
                        <span className="text-gray-400 text-sm">
                          {type === 'activity' ? 'PNG maksimal 10MB' : 'PDF, JPG, PNG maksimal 10MB'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Fields */}
              {type === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Nama Kontak *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required={type === 'contact'}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Posisi</label>
                    <input
                      type="text"
                      value={contactPosition}
                      onChange={(e) => setContactPosition(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="Jabatan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">No. Telepon *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required={type === 'contact'}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required={type === 'contact'}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Urutan (Optional)</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <label className="flex items-center px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 rounded-xl cursor-pointer hover:bg-[#2e2e2e]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 text-red-800 bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-red-900/50"
                    />
                    <span className="ml-3 text-white font-medium">Published</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-red-900/40">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-800/60 hover:to-red-900/60 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-800/40"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingInfo ? 'Update Informasi' : 'Simpan Informasi'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 border-2 border-gray-700/60 hover:bg-gray-800/60 text-gray-300 py-3 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Information List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allInformation?.map((info) => (
          <div
            key={info._id}
            className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-red-900/30 hover:border-red-800 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all flex flex-col"
          >
            {/* Preview */}
            {info.type !== 'contact' && info.fileUrl && (
              <div 
                className="w-full h-48 overflow-hidden bg-gray-900/60 cursor-pointer group relative"
                onClick={() => setPreviewDialog({ url: info.fileUrl!, type: info.fileType || 'image', title: info.title })}
              >
                {info.fileType === 'pdf' ? (
                  <>
                    <iframe
                      src={`${info.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full pointer-events-none"
                      title={info.title}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img 
                      src={info.fileUrl} 
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`${getTypeColor(info.type)} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                  {getTypeLabel(info.type)}
                </span>
                <span className={`${info.isPublished ? 'bg-green-900/60 border border-green-800/40' : 'bg-gray-800/60 border border-gray-700/40'} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                  {info.isPublished ? 'Published' : 'Draft'}
                </span>
                {info.order !== undefined && (
                  <span className="bg-blue-900/60 border border-blue-800/40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                    #{info.order}
                  </span>
                )}
              </div>
              
              <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">{info.title}</h3>
              {info.description && (
                <p className="text-gray-400 text-sm mb-3 leading-relaxed line-clamp-2 flex-1">{info.description}</p>
              )}
              
              {/* Contact Info */}
              {info.type === 'contact' && (
                <div className="space-y-2 mb-3 text-sm">
                  <div className="text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {info.contactName}
                  </div>
                  {info.contactPosition && (
                    <div className="text-gray-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {info.contactPosition}
                    </div>
                  )}
                  <div className="text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {info.contactPhone}
                  </div>
                  <div className="text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {info.contactEmail}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(info.createdAt).toLocaleDateString('id-ID')}
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {info.creatorName}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-800/60">
                <button
                  onClick={() => handleTogglePublished(info._id)}
                  className={`flex-1 p-2 rounded-lg transition-colors border flex items-center justify-center gap-1 ${
                    info.isPublished 
                      ? 'hover:bg-gray-800/40 text-gray-400 border-gray-700/30' 
                      : 'hover:bg-green-950/40 text-green-500 border-green-900/30'
                  }`}
                  title={info.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {info.isPublished ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <span className="text-xs">Unpublish</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs">Publish</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(info)}
                  className="flex-1 p-2 hover:bg-yellow-950/40 text-yellow-500 rounded-lg transition-colors border border-yellow-900/30 flex items-center justify-center gap-1"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(info._id)}
                  className="flex-1 p-2 hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-900/30 flex items-center justify-center gap-1"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs">Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {allInformation?.length === 0 && (
          <div className="col-span-full bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border-2 border-red-900/30 p-12 text-center">
            <div className="w-20 h-20 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/40">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Belum ada informasi</h3>
            <p className="text-sm text-gray-400">Klik "Tambah Informasi" untuk menambahkan informasi baru</p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {previewDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl border-2 border-red-900/30 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 border-b border-red-900/40 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {previewDialog.title}
              </h3>
              <button
                onClick={() => setPreviewDialog(null)}
                className="p-2 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-900/40 p-4">
              {previewDialog.type === 'pdf' ? (
                <iframe
                  src={previewDialog.url}
                  className="w-full h-full min-h-[600px] rounded-lg"
                  title={previewDialog.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewDialog.url}
                    alt={previewDialog.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#2e2e2e]/80 to-[#1a1a1a]/80 px-6 py-4 border-t border-red-900/40 flex items-center justify-between">
              <a
                href={previewDialog.url}
                download
                className="bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-800/60 hover:to-red-900/60 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border border-red-800/40"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <button
                onClick={() => setPreviewDialog(null)}
                className="px-6 border-2 border-gray-700/60 hover:bg-gray-800/60 text-gray-300 py-2 rounded-lg font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformationManagement;
