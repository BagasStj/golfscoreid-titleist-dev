import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PlayerLayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'scoring' | 'scorecard' | 'leaderboard';
  onNavigate: (view: 'dashboard' | 'scoring' | 'scorecard' | 'leaderboard') => void;
}

export default function PlayerLayout({
  children,
  currentView,
  onNavigate,
}: PlayerLayoutProps) {
  const { user: currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Please Log In</h2>
          <p className="text-gray-600">You must be logged in to access this area.</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Home', icon: '🏠' },
    { id: 'scoring' as const, label: 'Score', icon: '⛳' },
    { id: 'scorecard' as const, label: 'Card', icon: '📋' },
    { id: 'leaderboard' as const, label: 'Board', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-grass-green-700">GolfScore ID</h1>
              <p className="text-xs text-gray-500">{currentUser.name}</p>
            </div>
            <div className="w-8 h-8 bg-grass-green-100 rounded-full flex items-center justify-center text-grass-green-800 font-semibold text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                currentView === item.id
                  ? 'text-grass-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
