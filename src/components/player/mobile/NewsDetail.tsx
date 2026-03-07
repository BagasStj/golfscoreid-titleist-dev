import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { useAuth } from '../../../contexts/AuthContext';
import { X, Download, Image as ImageIcon } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch news details
  const news = useQuery(
    api.news.getNewsById,
    id ? { newsId: id as Id<"news"> } : 'skip'
  );

  // Fetch tournament details if news has tournamentId
  const tournament = useQuery(
    api.tournaments.getTournamentDetails,
    news?.tournamentId ? { tournamentId: news.tournamentId } : 'skip'
  );

  // Fetch player's confirmation status
  const confirmation = useQuery(
    api.news.getPlayerConfirmation,
    id && user ? { newsId: id as Id<"news">, playerId: user._id } : 'skip'
  );

  // Mutation for confirming attendance
  const confirmAttendance = useMutation(api.news.confirmNewsAttendance);

  const handleConfirmAttendance = async () => {
    if (!user || !id) return;
    
    try {
      await confirmAttendance({
        newsId: id as Id<"news">,
        playerId: user._id,
      });
      setShowConfirmModal(false);
      alert('Attendance confirmed successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to confirm attendance');
    }
  };

  // Loading state
  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading news...</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tournament': return 'bg-blue-500';
      case 'Tips': return 'bg-green-500';
      case 'Berita': return 'bg-purple-500';
      case 'Announcement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tournament':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'Tips':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'Berita':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'Announcement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black shadow-2xl border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-800 rounded-xl p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-xl ml-3">News Detail</h1>
        </div>
      </div>

      <div className="pt-16 pb-6">
        {/* News Image */}
        {news.imageUrl ? (
          <div 
            className="relative h-64 overflow-hidden cursor-pointer group"
            onClick={() => setPreviewImage(news.imageUrl!)}
          >
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Tap untuk memperbesar
              </div>
            </div>
            <div className={`absolute top-4 left-4 ${getCategoryColor(news.category)} text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center`}>
              {getCategoryIcon(news.category)}
              <span className="ml-2">{news.category}</span>
            </div>
          </div>
        ) : (
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <img
              src="/full-color-logo.png"
              alt={news.title}
              className="h-32 w-auto object-contain opacity-90"
            />
            <div className={`absolute top-4 left-4 ${getCategoryColor(news.category)} text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center`}>
              {getCategoryIcon(news.category)}
              <span className="ml-2">{news.category}</span>
            </div>
          </div>
        )}

        {/* News Content */}
        <div className="px-4 py-5 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-white font-bold text-2xl leading-tight mb-3">{news.title}</h2>
            
            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(news.publishedAt).toLocaleDateString('id-ID', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {news.creatorName}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl p-5 border border-gray-800 shadow-lg">
            <p className="text-gray-300 text-base leading-relaxed font-medium italic">
              {news.excerpt}
            </p>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl p-5 border border-gray-800 shadow-lg">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                {news.content}
              </div>
            </div>
          </div>

          {/* Tournament Information */}
          {tournament && (
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl p-5 border border-gray-800 shadow-lg">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Tournament Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Tournament Name</p>
                    <p className="text-white font-semibold">{tournament.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Date & Time</p>
                    <p className="text-white font-semibold">
                      {new Date(tournament.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white font-semibold">{tournament.location}</p>
                  </div>
                </div>

                {tournament.registrationFee && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Registration Fee</p>
                      <p className="text-white font-semibold">{tournament.registrationFee}</p>
                    </div>
                  </div>
                )}

                {tournament.maxParticipants && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Max Participants</p>
                      <p className="text-white font-semibold">{tournament.maxParticipants} players</p>
                    </div>
                  </div>
                )}

                {tournament.contactPerson && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-sm">Contact Person</p>
                      <p className="text-white font-semibold">{tournament.contactPerson}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation Status or Button */}
              <div className="mt-5 pt-5 border-t border-gray-800">
                {confirmation ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-green-900/40 border border-green-800/40 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-700/40 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-300 font-bold">Attendance Confirmed</p>
                          <p className="text-green-400 text-sm">
                            Confirmed on {new Date(confirmation.confirmedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between rounded-xl p-4 border ${
                      confirmation.isPaid 
                        ? 'bg-green-900/40 border-green-800/40' 
                        : 'bg-yellow-900/40 border-yellow-800/40'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          confirmation.isPaid ? 'bg-green-700/40' : 'bg-yellow-700/40'
                        }`}>
                          <svg className={`w-6 h-6 ${confirmation.isPaid ? 'text-green-300' : 'text-yellow-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-bold ${confirmation.isPaid ? 'text-green-300' : 'text-yellow-300'}`}>
                            {confirmation.isPaid ? 'Payment Confirmed' : 'Payment Pending'}
                          </p>
                          <p className={`text-sm ${confirmation.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                            {confirmation.isPaid 
                              ? `Paid on ${new Date(confirmation.paidAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                              : 'Please complete your payment'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm Attendance
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl p-5 border border-gray-800 shadow-lg">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share News
            </h3>
            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black hover:from-gray-800 hover:via-[#171718] hover:to-black text-white font-semibold py-4 rounded-xl border border-gray-800 transition-all"
          >
            Back to News List
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl max-w-md w-full border-2 border-red-900/40 shadow-2xl">
            <div className="p-6 space-y-5">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-red-900/60 to-red-800/60 rounded-2xl flex items-center justify-center mx-auto border border-red-800/40">
                <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Confirm Your Attendance</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  By confirming, you agree to participate in this tournament. Please ensure you have read all the tournament details and are available on the scheduled date.
                </p>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-yellow-300 font-semibold text-sm mb-2">Important Reminders:</p>
                    <ul className="text-yellow-400 text-xs space-y-1 list-disc list-inside">
                      <li>Please complete your payment after confirmation</li>
                      <li>Payment confirmation will be verified by admin</li>
                      <li>Ensure you arrive on time on the tournament date</li>
                      <li>Contact the organizer if you need to cancel</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 font-semibold py-3 rounded-xl transition-all border border-gray-700/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAttendance}
                  className="flex-1 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Dialog Style */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black/80 backdrop-blur-sm py-2"
          onClick={() => setPreviewImage(null)}
        >
          {/* Area transparan di atas (klik untuk tutup) */}
          <div className="shrink-0 h-[calc(env(safe-area-inset-top,0px)+60px)]" />

          {/* Dialog Card — mengisi sisa ruang di antara header dan bottom nav */}
          <div
            className="flex flex-col flex-1 min-h-0 mx-3 rounded-2xl bg-gradient-to-b from-[#2e2e2e] via-[#1a1a1b] to-[#111112] border border-gray-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center border border-red-800/40 shrink-0">
                  <ImageIcon className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-white font-semibold text-sm truncate">
                  {news.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="ml-3 shrink-0 w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                aria-label="Tutup"
                style={{ touchAction: "manipulation" }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Dialog Content — flex-1 + min-h-0 mengisi seluruh sisa ruang */}
            <div className="flex-1 min-h-0 overflow-auto bg-black/60">
              <div className="flex items-center justify-center w-full h-full p-4">
                <img
                  src={previewImage}
                  alt={news.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-t border-gray-700 shrink-0"
              style={{
                paddingBottom:
                  "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white py-2.5 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Tutup
              </button>
              <a
                href={previewImage}
                download
                className="flex-1 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 active:scale-95 text-white py-2.5 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 border border-red-900/40 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>

          {/* Area transparan di bawah (klik untuk tutup) */}
          <div className="shrink-0 h-[calc(env(safe-area-inset-bottom,0px)+72px)]" />
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
