import { useState } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trophy, 
  Users, 
  Activity, 
  Award,
  LogOut,
  TrendingUp,
  Menu,
  ChevronRight,
  Newspaper,
  Plane,
  MapPin
} from 'lucide-react';
import TournamentManagement from './TournamentManagement';
import PlayerManagement from './PlayerManagement';
import LiveMonitoringDashboard from './LiveMonitoringDashboard';
import LeaderboardAdmin from './LeaderboardAdmin';
import NewsManagement from './NewsManagement';
import FlightManagement from './FlightManagement';
import { CourseManagement } from './CourseManagement';

type AdminView = 'dashboard' | 'tournaments' | 'players' | 'monitoring' | 'leaderboard' | 'news' | 'flights' | 'courses';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, logout, isLoading: authLoading } = useAuth();
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    currentUser ? { userId: currentUser._id } : 'skip'
  );
  const allPlayers = useQuery(api.users.listAllPlayers);

  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedTournamentId, setSelectedTournamentId] = useState<Id<'tournaments'> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black flex items-center justify-center">
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You must be an admin to access this area.</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeTournaments = tournaments?.filter(t => t.status === 'active').length || 0;
  const upcomingTournaments = tournaments?.filter(t => t.status === 'upcoming').length || 0;
  const totalTournaments = tournaments?.length || 0;
  const totalPlayers = allPlayers?.length || 0;

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: Activity, color: 'primary' },
    { id: 'tournaments' as AdminView, label: 'Tournaments', icon: Trophy, color: 'success' },
    { id: 'courses' as AdminView, label: 'Course Management', icon: MapPin, color: 'emerald' },
    { id: 'flights' as AdminView, label: 'Flight Management', icon: Plane, color: 'info' },
    { id: 'players' as AdminView, label: 'Players', icon: Users, color: 'accent' },
    { id: 'monitoring' as AdminView, label: 'Live Monitoring', icon: TrendingUp, color: 'warning' },
    { id: 'leaderboard' as AdminView, label: 'Leaderboard', icon: Award, color: 'secondary' },
    { id: 'news' as AdminView, label: 'News', icon: Newspaper, color: 'info' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-900/60 via-red-800/60 to-red-900/60 rounded-xl p-4 lg:p-5 text-white shadow-[0_8px_24px_rgba(139,0,0,0.4)] border border-red-900/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold mb-0.5">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-gray-300 text-sm">
              Here's your tournament overview today
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-12 h-12 bg-red-950/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-900/30">
              <Activity className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - All in one row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Tournaments */}
        <div className="bg-gradient-to-br from-red-900/40 to-red-950/40 backdrop-blur-sm rounded-xl p-4 border border-red-900/30 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">Total Tournaments</p>
              <p className="text-3xl font-bold text-white">{totalTournaments}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/30">
              <Trophy className="w-6 h-6 text-red-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Active Tournaments */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 backdrop-blur-sm rounded-xl p-4 border border-green-900/30 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">Active Tournaments</p>
              <p className="text-3xl font-bold text-white">{activeTournaments}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-950/40 border border-green-900/30">
              <Activity className="w-6 h-6 text-green-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-sm rounded-xl p-4 border border-blue-900/30 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-white">{upcomingTournaments}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/30">
              <TrendingUp className="w-6 h-6 text-blue-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Total Players */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">Total Players</p>
              <p className="text-3xl font-bold text-white">{totalPlayers}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-950/40 border border-gray-800/30">
              <Users className="w-6 h-6 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Different card designs */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-red-700 rounded-full"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {/* Tournaments Card - Red Style */}
          <button
            onClick={() => setCurrentView('tournaments')}
            className="group relative overflow-hidden bg-gradient-to-br from-red-900/60 to-red-800/60 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/40 hover:-translate-y-1 border border-red-900/40"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-950/40 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all border border-red-900/30">
                <Trophy className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-sm">Tournaments</h3>
                <p className="text-gray-400 text-xs">Manage events</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>

          {/* Players Card - Dark Style */}
          <button
            onClick={() => setCurrentView('players')}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/40 hover:-translate-y-1 border border-gray-700/40"
          >
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-950/40 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all border border-gray-700/30">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-sm">Players</h3>
                <p className="text-gray-400 text-xs">Manage members</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>

          {/* Live Monitoring Card - Dark Red Style */}
          <button
            onClick={() => setCurrentView('monitoring')}
            className="group relative overflow-hidden bg-gradient-to-br from-red-950/60 to-black/60 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/40 hover:-translate-y-1 border border-red-900/30"
          >
            <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mt-8"></div>
            <div className="absolute bottom-0 right-0 w-14 h-14 bg-white/5 rounded-full -mr-7 -mb-7"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-950/40 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all border border-red-900/30">
                <TrendingUp className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-sm">Live Monitoring</h3>
                <p className="text-gray-400 text-xs">Real-time data</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>

          {/* Leaderboard Card - Dark Style */}
          <button
            onClick={() => setCurrentView('leaderboard')}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 to-black/60 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/40 hover:-translate-y-1 border border-gray-800/40"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-950/40 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all border border-gray-800/30">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-white text-sm">Leaderboard</h3>
                <p className="text-gray-400 text-xs">View rankings</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Tournaments */}
      {tournaments && tournaments.length > 0 && (
        <div className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-red-900/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-red-700 rounded-full"></span>
              Recent Tournaments
            </h2>
            <button
              onClick={() => setCurrentView('tournaments')}
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {tournaments.slice(0, 5).map((tournament) => (
              <div
                key={tournament._id}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/60 to-gray-800/60 hover:from-red-900/40 hover:to-red-800/40 rounded-xl border border-gray-800/60 hover:border-red-900/60 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => {
                  setSelectedTournamentId(tournament._id);
                  setCurrentView('monitoring');
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-red-950/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-red-900/30">
                    <Trophy className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{tournament.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(tournament.date).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {tournament.courseType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'active'
                        ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                        : tournament.status === 'upcoming'
                        ? 'bg-blue-900/40 text-blue-400 border border-blue-800/40'
                        : 'bg-gray-800/40 text-gray-400 border border-gray-700/40'
                    }`}
                  >
                    {tournament.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();

      case 'tournaments':
        return <TournamentManagement onSelectTournament={setSelectedTournamentId} />;

      case 'courses':
        return <CourseManagement />;

      case 'flights':
        return <FlightManagement onClose={() => setCurrentView('dashboard')} />;

      case 'players':
        return <PlayerManagement />;

      case 'monitoring':
        return <LiveMonitoringDashboard />;

      case 'leaderboard':
        return <LeaderboardAdmin tournamentId={selectedTournamentId} />;

      case 'news':
        return <NewsManagement />;

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile/tablet, shown only when button clicked */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#2e2e2e] via-[#1a1a1a] to-black border-r border-red-900/40 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo & Brand */}
        {/* <div className="h-16 flex items-center justify-between px-6 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-app.png" 
              alt="GolfScore ID Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold text-white">GolfScore ID</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div> */}

        {/* User Profile */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-900/40 to-red-950/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border border-red-900/30">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-900/60 to-red-800/60 text-white shadow-lg border border-red-800/50'
                    : 'text-gray-400 hover:bg-red-900/20 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-red-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-red-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-red-900/30">
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-white rounded-xl font-medium transition-colors border border-red-900/40"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>



      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-14 bg-gradient-to-r from-[#2e2e2e] to-[#1a1a1a] border-b border-red-900/30 sticky top-0 z-20 flex items-center px-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors mr-3"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="flex-1">
            <h2 className="text-base lg:text-lg font-bold text-white">
              {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">
              {currentView === 'dashboard' && 'Overview of your tournaments'}
              {currentView === 'tournaments' && 'Manage all tournaments'}
              {currentView === 'courses' && 'Manage golf courses and hole configurations'}
              {currentView === 'flights' && 'Manage tournament flights and player assignments'}
              {currentView === 'players' && 'Manage player registrations'}
              {currentView === 'monitoring' && 'Real-time tournament monitoring'}
              {currentView === 'leaderboard' && 'View tournament standings'}
              {currentView === 'news' && 'Manage news and announcements'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-900/40 to-red-950/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md border border-red-900/30">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
