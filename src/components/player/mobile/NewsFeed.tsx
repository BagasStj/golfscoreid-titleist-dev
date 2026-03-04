import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const news = useQuery(api.news.getPublishedNews, user ? { userId: user._id } : {});

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tournament': return 'bg-blue-500';
      case 'Tips': return 'bg-green-500';
      case 'Berita': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-5 shadow-xl border border-gray-800">
        <h2 className="text-white font-bold text-xl mb-1">News Feed</h2>
        <p className="text-gray-400 text-sm">Latest news and updates about golf</p>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {!news ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-8 text-center border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">No News Yet</h3>
            <p className="text-gray-400 text-sm">News will appear here</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/player/mobile/news/${item._id}`)}
              className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 hover:border-gray-700 hover:shadow-2xl transition-all cursor-pointer active:scale-[0.98]"
            >
              {/* News Image */}
              {item.imageUrl ? (
                <div className="relative h-44 overflow-hidden border-b border-gray-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 left-3 ${getCategoryColor(item.category)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
                    {item.category}
                  </div>
                </div>
              ) : (
                <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-gray-800">
                  <img
                    src="/full-color-logo.png"
                    alt={item.title}
                    className="h-24 w-auto object-contain opacity-90"
                  />
                  <div className={`absolute top-3 left-3 ${getCategoryColor(item.category)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
                    {item.category}
                  </div>
                </div>
              )}

              {/* News Content */}
              <div className="p-5 space-y-3">
                <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.excerpt}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center text-gray-500 text-xs">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.publishedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-red-500 text-sm font-semibold">
                    Read More →
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
