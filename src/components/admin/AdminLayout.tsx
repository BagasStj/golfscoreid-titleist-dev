import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

type AdminView = 'tournaments' | 'create' | 'register' | 'hidden' | 'monitoring' | 'leaderboard';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const [currentView, setCurrentView] = useState<AdminView>('tournaments');
  const [selectedTournamentId, setSelectedTournamentId] = useState<Id<'tournaments'> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be an admin to access this area.</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'tournaments' as AdminView, label: 'Tournaments', icon: '🏆' },
    { id: 'create' as AdminView, label: 'Create Tournament', icon: '➕' },
    { id: 'register' as AdminView, label: 'Register Players', icon: '👥', requiresTournament: true },
    { id: 'hidden' as AdminView, label: 'Hidden Holes', icon: '🔒', requiresTournament: true },
    { id: 'monitoring' as AdminView, label: 'Live Monitoring', icon: '📊', requiresTournament: true },
    { id: 'leaderboard' as AdminView, label: 'Leaderboard', icon: '🏅', requiresTournament: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-grass-green-700">GolfScore ID</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
            <div className="w-8 h-8 bg-grass-green-100 rounded-full flex items-center justify-center text-grass-green-800 font-semibold text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
            lg:mt-0 mt-[57px]
          `}
        >
          <div className="h-full flex flex-col overflow-y-auto">

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isDisabled = item.requiresTournament && !selectedTournamentId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!isDisabled) {
                      setCurrentView(item.id);
                      setIsSidebarOpen(false); // Close sidebar on mobile after selection
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-grass-green-100 text-grass-green-800'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tournament Selector */}
          {tournaments && tournaments.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Active Tournament
              </label>
              <select
                value={selectedTournamentId || ''}
                onChange={(e) => setSelectedTournamentId(e.target.value as Id<'tournaments'>)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-grass-green-500 focus:border-transparent"
              >
                <option value="">Select tournament...</option>
                {tournaments.map((tournament) => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children || (
            <div className="space-y-6">
              {/* View-specific content would be rendered here */}
              {currentView === 'tournaments' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tournaments</h2>
                  {tournaments === undefined ? (
                    <p className="text-gray-500">Loading tournaments...</p>
                  ) : tournaments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-4">No tournaments created yet</p>
                      <button
                        onClick={() => setCurrentView('create')}
                        className="px-6 py-2 bg-grass-green-600 text-white rounded-lg hover:bg-grass-green-700 transition-colors"
                      >
                        Create Your First Tournament
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tournaments.map((tournament) => (
                        <div
                          key={tournament._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {tournament.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>
                                  {new Date(tournament.date).toLocaleDateString()}
                                </span>
                                <span>{tournament.courseType}</span>
                                <span>{tournament.gameMode}</span>
                                <span
                                  className={`px-2 py-1 rounded ${
                                    tournament.status === 'active'
                                      ? 'bg-grass-green-100 text-grass-green-800'
                                      : tournament.status === 'upcoming'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {tournament.status}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedTournamentId(tournament._id);
                                setCurrentView('monitoring');
                              }}
                              className="px-4 py-2 bg-grass-green-600 text-white text-sm rounded-lg hover:bg-grass-green-700 transition-colors"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentView !== 'tournaments' && !selectedTournamentId && currentView !== 'create' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">Please select a tournament from the sidebar</p>
                </div>
              )}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
