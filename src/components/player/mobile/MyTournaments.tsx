import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';

const MyTournaments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');

  // Fetch player's tournaments
  const myTournaments = useQuery(
    api.tournaments.getTournaments, 
    user ? { userId: user._id } : 'skip'
  );

  // Get banner images for fallback
  const bannerImages = ['/banner/image-1.png', '/banner/image-2.png', '/banner/image-3.png'];

  // Filter tournaments based on selected filter
  const filteredTournaments = (myTournaments || []).filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  // Calculate stats
  const upcomingCount = (myTournaments || []).filter(t => t.status === 'upcoming').length;
  const activeCount = (myTournaments || []).filter(t => t.status === 'active').length;
  const completedCount = (myTournaments || []).filter(t => t.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Registered';
      case 'active': return 'Playing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  // Loading state
  if (!myTournaments) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header Stats */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-5 shadow-xl border border-gray-800">
        <h2 className="text-white font-bold text-xl mb-4">My Tournaments</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-white font-bold text-3xl">{upcomingCount}</div>
            <div className="text-gray-400 text-xs mt-1">Registered</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-3xl">{activeCount}</div>
            <div className="text-gray-400 text-xs mt-1">Playing</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-3xl">{completedCount}</div>
            <div className="text-gray-400 text-xs mt-1">Completed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Registered' },
          { key: 'active', label: 'Playing' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
    //       style={{    "paddingLeft": "0.80rem",
    // "paddingRight": "1.25rem"}}
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-lg ${
              filter === tab.key
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                : 'bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="space-y-4">
        {filteredTournaments.map((tournament, index) => {
          // Use banner from database, fallback to default images
          const bannerImage = tournament.bannerUrl || bannerImages[index % bannerImages.length];
          const participantCount = tournament.participantCount || 0;
          const maxParticipants = tournament.maxParticipants || 100;
          
          return (
            <div
              key={tournament._id}
              onClick={() => navigate(`/player/tournament/${tournament._id}`)}
              className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 hover:border-gray-700 hover:shadow-2xl transition-all cursor-pointer"
            >
              {/* Tournament Banner Image */}
              <div className="relative h-36 overflow-hidden">
                {tournament.bannerUrl ? (
                  <img
                    src={bannerImage}
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default banner if image fails to load
                      e.currentTarget.src = bannerImages[index % bannerImages.length];
                    }}
                  />
                ) : (
                  <img
                    src={bannerImage}
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 ${getStatusColor(tournament.status)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm`}>
                  {getStatusText(tournament.status)}
                </div>
                
                {/* Tournament Title on Image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{tournament.name}</h3>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="p-4 space-y-3">
                {/* Date and Location */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(tournament.date).toLocaleDateString('id-ID', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {tournament.location}
                  </div>
                </div>

                {/* Tournament Details */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-4 text-xs">
                    {/* Participants */}
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-bold text-white">{participantCount}</span>
                      <span className="mx-0.5">/</span>
                      <span>{maxParticipants}</span>
                    </div>
                    
                    {/* Course Type */}
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="font-semibold">
                        {tournament.courseType === '18holes' ? '18H' : tournament.courseType === 'F9' ? 'F9' : 'B9'}
                      </span>
                    </div>
                    
                    {/* Game Mode */}
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-semibold capitalize">
                        {tournament.gameMode === 'strokePlay' ? 'Stroke' : tournament.gameMode === 'system36' ? 'S36' : 'Stableford'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2">
                    {tournament.status === 'active' ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Continue Playing</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏌️</div>
          <div className="text-gray-400 text-lg font-semibold">No tournaments yet</div>
          <div className="text-gray-500 text-sm mt-2">Register for a tournament to start playing</div>
        </div>
      )}
    </div>
  );
};

export default MyTournaments;
