import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '../../contexts/AuthContext';

const NewsManagement: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<Id<"news"> | null>(null);
  const [viewingNewsDetail, setViewingNewsDetail] = useState<Id<"news"> | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Tournament' | 'Tips' | 'Berita' | 'Announcement'>('Berita');
  const [targetAudience, setTargetAudience] = useState<'all' | 'players' | 'admins' | 'specific'>('all');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Id<"users">[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<Id<"tournaments"> | undefined>(undefined);
  const [isPublished, setIsPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const allNews = useQuery(api.news.getAllNews, user ? { userId: user._id } : "skip");
  const allPlayers = useQuery(api.users.listAllPlayers);
  const allTournaments = useQuery(api.tournaments.getTournaments, user ? { userId: user._id } : "skip");

  // Mutations
  const createNews = useMutation(api.news.createNews);
  const updateNews = useMutation(api.news.updateNews);
  const deleteNews = useMutation(api.news.deleteNews);
  const togglePublished = useMutation(api.news.toggleNewsPublished);
  const generateUploadUrl = useMutation(api.news.generateUploadUrl);

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Berita');
    setTargetAudience('all');
    setSelectedPlayerIds([]);
    setSelectedTournamentId(undefined);
    setIsPublished(false);
    setImageFile(null);
    setImagePreview(null);
    setEditingNews(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate specific players selection
    if (targetAudience === 'specific' && selectedPlayerIds.length === 0) {
      alert('Please select at least one player for specific audience');
      return;
    }

    setIsUploading(true);

    try {
      let imageStorageId: Id<"_storage"> | undefined;

      // Upload image if new file is selected
      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!result.ok) {
          throw new Error('Failed to upload image');
        }

        const { storageId } = await result.json();
        imageStorageId = storageId;
      } else if (editingNews) {
        // Keep existing image storage ID when editing
        const existingNews = allNews?.find(n => n._id === editingNews);
        if (existingNews?.imageStorageId) {
          imageStorageId = existingNews.imageStorageId;
        }
      }

      if (editingNews) {
        await updateNews({
          newsId: editingNews,
          title,
          excerpt,
          content,
          category,
          targetAudience,
          specificPlayerIds: targetAudience === 'specific' ? selectedPlayerIds : undefined,
          tournamentId: selectedTournamentId,
          isPublished,
          imageStorageId,
          userId: user._id,
        });
      } else {
        await createNews({
          title,
          excerpt,
          content,
          category,
          targetAudience,
          specificPlayerIds: targetAudience === 'specific' ? selectedPlayerIds : undefined,
          tournamentId: selectedTournamentId,
          isPublished,
          imageStorageId,
          userId: user._id,
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      alert(error instanceof Error ? error.message : 'Failed to save news');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (news: any) => {
    setTitle(news.title);
    setExcerpt(news.excerpt);
    setContent(news.content);
    setCategory(news.category);
    setTargetAudience(news.targetAudience);
    setSelectedPlayerIds(news.specificPlayerIds || []);
    setSelectedTournamentId(news.tournamentId);
    setIsPublished(news.isPublished);
    setImagePreview(news.imageUrl || null);
    setEditingNews(news._id);
    setShowForm(true);
  };

  const handleDelete = async (newsId: Id<"news">) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      await deleteNews({ newsId, userId: user._id });
    } catch (error) {
      console.error('Error deleting news:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete news');
    }
  };

  const handleTogglePublished = async (newsId: Id<"news">) => {
    if (!user) return;
    try {
      await togglePublished({ newsId, userId: user._id });
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tournament': return 'bg-blue-500';
      case 'Tips': return 'bg-green-500';
      case 'Berita': return 'bg-purple-500';
      case 'Announcement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-red-900 rounded-full"></span>
          News Management
        </h2>
        <p className="text-gray-400 mt-1">Create and manage news for players</p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(139,0,0,0.5)] flex items-center gap-2 border border-red-900/40"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create News
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border-2 border-red-900/30 overflow-hidden">
          <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 border-b border-red-900/40">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editingNews ? 'Edit News' : 'Create New News'}
            </h3>
          </div>
          
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                placeholder="Enter news title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Excerpt (Short Description) *</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all resize-none placeholder-gray-600"
                placeholder="Brief summary of the news"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all resize-none placeholder-gray-600"
                placeholder="Full news content"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">News Image</label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-800/60"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
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
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="news-image-upload"
                  />
                  <label 
                    htmlFor="news-image-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-red-900/40 rounded-2xl flex items-center justify-center mb-3 border border-red-800/40">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium mb-1">Click to upload image</span>
                    <span className="text-gray-400 text-sm">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
                >
                  <option value="Tournament">Tournament</option>
                  <option value="Tips">Tips</option>
                  <option value="Berita">Berita</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => {
                    setTargetAudience(e.target.value as any);
                    if (e.target.value !== 'specific') {
                      setSelectedPlayerIds([]);
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
                >
                  <option value="all">All Users</option>
                  <option value="players">All Players</option>
                  <option value="specific">Specific Players</option>
                  <option value="admins">Admins Only</option>
                </select>
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

            {/* Tournament Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Related Tournament (Optional)
              </label>
              <select
                value={selectedTournamentId || ''}
                onChange={(e) => setSelectedTournamentId(e.target.value ? e.target.value as Id<"tournaments"> : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
              >
                <option value="">No Tournament</option>
                {allTournaments?.filter(t => t.status !== 'completed').map((tournament) => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.name} - {new Date(tournament.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} ({tournament.status})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a tournament to send invitation. Only upcoming and active tournaments are shown.
              </p>
            </div>

            {/* Player Selection for Specific Audience */}
            {targetAudience === 'specific' && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Select Players ({selectedPlayerIds.length} selected)
                </label>
                <div className="border-2 border-gray-800/60 bg-[#1a1a1a]/60 rounded-xl max-h-60 overflow-y-auto">
                  {allPlayers?.map((player) => (
                    <label
                      key={player._id}
                      className="flex items-center px-4 py-3 hover:bg-red-950/20 cursor-pointer border-b border-gray-800/60 last:border-b-0 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.includes(player._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayerIds([...selectedPlayerIds, player._id]);
                          } else {
                            setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player._id));
                          }
                        }}
                        className="w-5 h-5 text-red-800 bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-red-900/50"
                      />
                      <div className="flex-1 ml-3">
                        <span className="text-white font-medium">{player.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({player.email})</span>
                      </div>
                    </label>
                  ))}
                  {allPlayers?.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No players available
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    {editingNews ? 'Update News' : 'Create News'}
                  </>
                )}
              </button>
              {editingNews && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 border-2 border-gray-700/60 hover:bg-gray-800/60 text-gray-300 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>
        </div>
      )}

      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allNews?.map((news) => (
          <div
            key={news._id}
            className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-red-900/30 hover:border-red-800 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all flex flex-col"
          >
            {/* Image Preview */}
            {news.imageUrl && (
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`${getCategoryColor(news.category)} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                  {news.category}
                </span>
                <span className={`${news.isPublished ? 'bg-green-900/60 border border-green-800/40' : 'bg-gray-800/60 border border-gray-700/40'} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                  {news.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">{news.title}</h3>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed line-clamp-3 flex-1">{news.excerpt}</p>
              
              <div className="space-y-2 mb-4">
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(news.publishedAt).toLocaleDateString('id-ID')}
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {news.creatorName}
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {news.targetAudience === 'specific' 
                    ? `${news.specificPlayerIds?.length || 0} specific player(s)` 
                    : news.targetAudience}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-800/60">
                <button
                  onClick={() => handleTogglePublished(news._id)}
                  className="flex-1 p-2 hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-900/30 flex items-center justify-center gap-1"
                  title={news.isPublished ? 'Unpublish' : 'Publish'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                {news.tournamentId && (
                  <button
                    onClick={() => setViewingNewsDetail(news._id)}
                    className="flex-1 p-2 hover:bg-blue-950/40 text-blue-500 rounded-lg transition-colors border border-blue-900/30 flex items-center justify-center gap-1"
                    title="View Confirmations"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleEdit(news)}
                  className="flex-1 p-2 hover:bg-yellow-950/40 text-yellow-500 rounded-lg transition-colors border border-yellow-900/30 flex items-center justify-center gap-1"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(news._id)}
                  className="flex-1 p-2 hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-900/30 flex items-center justify-center gap-1"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {allNews?.length === 0 && (
          <div className="col-span-full bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border-2 border-red-900/30 p-12 text-center">
            <div className="w-20 h-20 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/40">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No news created yet</h3>
            <p className="text-sm text-gray-400">Click "Create News" to add your first news article</p>
          </div>
        )}
      </div>

      {/* News Detail Modal for Confirmations */}
      {viewingNewsDetail && (
        <NewsDetailModal
          newsId={viewingNewsDetail}
          onClose={() => setViewingNewsDetail(null)}
        />
      )}
    </div>
  );
};

// News Detail Modal Component
const NewsDetailModal: React.FC<{ newsId: Id<"news">; onClose: () => void }> = ({ newsId, onClose }) => {
  const { user } = useAuth();
  const news = useQuery(api.news.getNewsById, { newsId });
  const allNews = useQuery(api.news.getAllNews, user ? { userId: user._id } : "skip");
  const allPlayers = useQuery(api.users.listAllPlayers);
  const confirmations = useQuery(api.news.getNewsConfirmations, user ? { newsId, userId: user._id } : "skip");
  const markAsPaid = useMutation(api.news.markPlayerAsPaid);
  const unmarkAsPaid = useMutation(api.news.unmarkPlayerAsPaid);
  const sendPaymentNotification = useMutation(api.emailNotifications.sendPaymentNotification);
  const [processingId, setProcessingId] = useState<Id<"news_confirmations"> | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'paid'>('all');
  const [activeTab, setActiveTab] = useState<'invited' | 'payment'>('invited');
  
  // Payment notification form states
  const [emailSubject, setEmailSubject] = useState('Payment Reminder - Tournament Registration');
  const [emailContent, setEmailContent] = useState('');
  const [selectedEmailPlayers, setSelectedEmailPlayers] = useState<Id<"users">[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleTogglePaid = async (confirmationId: Id<"news_confirmations">, currentStatus: boolean) => {
    if (!user) return;
    setProcessingId(confirmationId);
    try {
      if (currentStatus) {
        await unmarkAsPaid({ confirmationId, userId: user._id });
      } else {
        await markAsPaid({ confirmationId, userId: user._id });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update payment status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendPaymentNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedEmailPlayers.length === 0) {
      alert('Please select at least one player');
      return;
    }

    if (!emailSubject.trim() || !emailContent.trim()) {
      alert('Please fill in subject and content');
      return;
    }

    setIsSendingEmail(true);
    try {
      const result = await sendPaymentNotification({
        newsId,
        playerIds: selectedEmailPlayers,
        subject: emailSubject,
        content: emailContent,
        userId: user._id,
      });

      alert(`Email sent successfully!\nSent: ${result.sent}\nFailed: ${result.failed}`);
      
      // Reset form
      setEmailSubject('Payment Reminder - Tournament Registration');
      setEmailContent('');
      setSelectedEmailPlayers([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert(error instanceof Error ? error.message : 'Failed to send emails');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const toggleAllConfirmedPlayers = () => {
    const confirmedPlayerIds = confirmations?.map(c => c.playerId) || [];
    if (selectedEmailPlayers.length === confirmedPlayerIds.length) {
      setSelectedEmailPlayers([]);
    } else {
      setSelectedEmailPlayers(confirmedPlayerIds);
    }
  };

  if (!news || !confirmations || !allNews || !allPlayers) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 rounded-2xl p-8 max-w-4xl w-full border-2 border-red-900/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get tournament info from allNews
  const newsItem = allNews.find(n => n._id === newsId);
  const tournament = newsItem?.tournament;
  const maxParticipants = tournament?.maxParticipants || 0;

  // Get all invited players
  const invitedPlayerIds = news.targetAudience === 'specific' 
    ? news.specificPlayerIds || []
    : news.targetAudience === 'players'
    ? allPlayers.filter(p => p.role === 'player').map(p => p._id)
    : allPlayers.map(p => p._id);

  const invitedPlayers = allPlayers.filter(p => invitedPlayerIds.includes(p._id));

  // Create a map of confirmations by playerId
  const confirmationMap = new Map(confirmations.map(c => [c.playerId, c]));

  // Build player list with confirmation status
  const playerList = invitedPlayers.map(player => {
    const confirmation = confirmationMap.get(player._id);
    return {
      player,
      confirmation,
      isConfirmed: !!confirmation,
      isPaid: confirmation?.isPaid || false,
    };
  });

  // Filter players based on selected filter
  const filteredPlayers = playerList.filter(item => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'confirmed') return item.isConfirmed;
    if (filterStatus === 'paid') return item.isPaid;
    return true;
  });

  const confirmedCount = confirmations.length;
  const paidCount = confirmations.filter(c => c.isPaid).length;
  const invitedCount = invitedPlayers.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 rounded-2xl max-w-5xl w-full border-2 border-red-900/30 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 px-6 py-4 border-b border-red-900/40 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              News Invitation Details
            </h3>
            <p className="text-gray-300 text-sm mt-1">{news.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-800/40 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-800/60 pb-2">
            <button
              onClick={() => setActiveTab('invited')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'invited'
                  ? 'bg-gradient-to-r from-red-900/60 to-red-800/60 text-white border-b-2 border-red-500'
                  : 'bg-gray-800/40 text-gray-400 hover:bg-gray-700/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Invited Players
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'payment'
                  ? 'bg-gradient-to-r from-red-900/60 to-red-800/60 text-white border-b-2 border-red-500'
                  : 'bg-gray-800/40 text-gray-400 hover:bg-gray-700/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Payment Notification
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'invited' ? (
            <>
              {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-5 border border-purple-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Invited</p>
                  <p className="text-white text-3xl font-bold mt-1">{invitedCount}</p>
                </div>
                <div className="w-14 h-14 bg-purple-700/40 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-5 border border-blue-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Confirmed</p>
                  <p className="text-white text-3xl font-bold mt-1">{confirmedCount}</p>
                </div>
                <div className="w-14 h-14 bg-blue-700/40 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl p-5 border border-green-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Paid</p>
                  <p className="text-white text-3xl font-bold mt-1">{paidCount}</p>
                </div>
                <div className="w-14 h-14 bg-green-700/40 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 rounded-xl p-5 border border-orange-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Available Slots</p>
                  <p className="text-white text-3xl font-bold mt-1">
                    {maxParticipants > 0 ? `${paidCount}/${maxParticipants}` : 'Unlimited'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-700/40 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Info */}
          {tournament && (
            <div className="bg-gradient-to-b from-[#2e2e2e]/60 to-[#1a1a1a]/60 rounded-xl p-5 border border-gray-800/60">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Tournament Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="text-white font-semibold">{tournament.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-white font-semibold">
                    {new Date(tournament.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-white font-semibold">{tournament.location}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    tournament.status === 'upcoming' ? 'bg-blue-900/60 text-blue-300' :
                    tournament.status === 'active' ? 'bg-green-900/60 text-green-300' :
                    'bg-gray-800/60 text-gray-300'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Player List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Invited Players ({filteredPlayers.length})
              </h4>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-red-900/60 text-red-300 border border-red-800/40'
                      : 'bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:bg-gray-700/60'
                  }`}
                >
                  All ({invitedCount})
                </button>
                <button
                  onClick={() => setFilterStatus('confirmed')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'confirmed'
                      ? 'bg-blue-900/60 text-blue-300 border border-blue-800/40'
                      : 'bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:bg-gray-700/60'
                  }`}
                >
                  Confirmed ({confirmedCount})
                </button>
                <button
                  onClick={() => setFilterStatus('paid')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'paid'
                      ? 'bg-green-900/60 text-green-300 border border-green-800/40'
                      : 'bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:bg-gray-700/60'
                  }`}
                >
                  Paid ({paidCount})
                </button>
              </div>
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="bg-gradient-to-b from-[#2e2e2e]/60 to-[#1a1a1a]/60 rounded-xl p-8 text-center border border-gray-800/60">
                <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-400">
                  {filterStatus === 'all' && 'No players invited'}
                  {filterStatus === 'confirmed' && 'No confirmations yet'}
                  {filterStatus === 'paid' && 'No payments yet'}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-[#2e2e2e]/60 to-[#1a1a1a]/60 rounded-xl border border-gray-800/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 border-b border-gray-700/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Player</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Confirmed At</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Payment</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredPlayers.map((item) => (
                        <tr key={item.player._id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-900/60 to-red-800/60 rounded-full flex items-center justify-center border border-red-800/40">
                                <span className="text-white font-bold text-sm">
                                  {item.player.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white font-medium">{item.player.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm">{item.player.email}</td>
                          <td className="px-4 py-3 text-center">
                            {item.isConfirmed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-900/60 text-green-300 border border-green-800/40">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Confirmed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-800/60 text-gray-400 border border-gray-700/40">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400 text-sm">
                            {item.confirmation ? (
                              new Date(item.confirmation.confirmedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.isPaid ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-900/60 text-green-300 border border-green-800/40">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Paid
                              </span>
                            ) : item.isConfirmed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/60 text-yellow-300 border border-yellow-800/40">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.confirmation ? (
                              <button
                                onClick={() => handleTogglePaid(item.confirmation!._id, item.isPaid)}
                                disabled={processingId === item.confirmation._id}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                  item.isPaid
                                    ? 'bg-red-900/60 hover:bg-red-800/60 text-red-300 border border-red-800/40'
                                    : 'bg-green-900/60 hover:bg-green-800/60 text-green-300 border border-green-800/40'
                                }`}
                              >
                                {processingId === item.confirmation._id ? 'Processing...' : item.isPaid ? 'Mark Unpaid' : 'Mark as Paid'}
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs">Not confirmed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-800/60">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-gray-700/60 hover:to-gray-600/60 text-white rounded-xl font-semibold transition-all border border-gray-700/40"
            >
              Close
            </button>
          </div>
            </>
          ) : (
            /* Payment Notification Tab */
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#2e2e2e]/60 to-[#1a1a1a]/60 rounded-xl p-6 border border-gray-800/60">
                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Payment Notification Email
                </h4>

                <form onSubmit={handleSendPaymentNotification} className="space-y-5">
                  {/* Email Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email Subject *</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="Enter email subject"
                    />
                  </div>

                  {/* Email Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email Content *</label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      required
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all resize-none placeholder-gray-600"
                      placeholder="Enter your payment notification message here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This message will be sent to selected players who have confirmed their participation.
                    </p>
                  </div>

                  {/* Player Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-300">
                        Select Players ({selectedEmailPlayers.length} selected)
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllConfirmedPlayers}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold"
                      >
                        {selectedEmailPlayers.length === confirmations?.length ? 'Deselect All' : 'Select All Confirmed'}
                      </button>
                    </div>
                    
                    {confirmations && confirmations.length > 0 ? (
                      <div className="border-2 border-gray-800/60 bg-[#1a1a1a]/60 rounded-xl max-h-80 overflow-y-auto">
                        {confirmations.map((confirmation) => {
                          const player = allPlayers?.find(p => p._id === confirmation.playerId);
                          if (!player) return null;

                          return (
                            <label
                              key={confirmation._id}
                              className="flex items-center px-4 py-3 hover:bg-red-950/20 cursor-pointer border-b border-gray-800/60 last:border-b-0 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmailPlayers.includes(player._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEmailPlayers([...selectedEmailPlayers, player._id]);
                                  } else {
                                    setSelectedEmailPlayers(selectedEmailPlayers.filter(id => id !== player._id));
                                  }
                                }}
                                className="w-5 h-5 text-red-800 bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-red-900/50"
                              />
                              <div className="flex-1 ml-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-red-900/60 to-red-800/60 rounded-full flex items-center justify-center border border-red-800/40">
                                    <span className="text-white font-bold text-sm">
                                      {player.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white font-medium block">{player.name}</span>
                                    <span className="text-gray-400 text-xs">{player.email}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-900/60 text-green-300 border border-green-800/40">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Confirmed
                                </span>
                                {confirmation.isPaid && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-800/40">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Paid
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-b from-[#2e2e2e]/60 to-[#1a1a1a]/60 rounded-xl p-8 text-center border border-gray-800/60">
                        <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-400">No confirmed players yet</p>
                        <p className="text-gray-500 text-sm mt-1">Players need to confirm their participation first</p>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-300">
                        <p className="font-semibold mb-1">Email Information</p>
                        <p className="text-blue-200/80">
                          Emails will be sent from: <span className="font-mono">titleistteam@gmail.com</span>
                        </p>
                        <p className="text-blue-200/80 mt-1">
                          The email will include tournament details and your custom message with a professional design.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-800/60">
                    <button
                      type="submit"
                      disabled={isSendingEmail || selectedEmailPlayers.length === 0}
                      className="flex-1 bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-800/60 hover:to-red-900/60 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-800/40"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Emails...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email to {selectedEmailPlayers.length} Player{selectedEmailPlayers.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-800/60">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-gray-700/60 hover:to-gray-600/60 text-white rounded-xl font-semibold transition-all border border-gray-700/40"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsManagement;
 
