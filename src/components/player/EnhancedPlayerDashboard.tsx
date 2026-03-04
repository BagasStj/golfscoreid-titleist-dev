import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Trophy,
  LogOut,
  Shield,
  Calendar,
  MapPin,
  ArrowRight,
  Play,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, Button } from '../ui';

export default function EnhancedPlayerDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const handleSelectTournament = (tournamentId: Id<'tournaments'>) => {
    navigate(`/player/tournament/${tournamentId}/scoring`);
  };

  const handleLogout = () => {
    logout();
    navigate('/player/login');
  };

  if (tournaments === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-6xl mb-4">⛳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tournaments Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't been registered in any tournaments yet. Contact your tournament admin to get started!
          </p>
          <Button variant="ghost" size="md" icon={LogOut} onClick={handleLogout}>
            Logout
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate player stats
  const activeTournaments = tournaments.filter((t) => t.status === 'active').length;
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming').length;
  const completedTournaments = tournaments.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                GolfScore ID
              </h1>
              <p className="text-sm text-gray-600">Player Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                icon={Shield}
                onClick={() => navigate('/admin')}
              >
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 p-8 mb-8 shadow-xl">
          {/* Golf Ball Pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="250" height="250" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" fill="currentColor" />
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const radius = 40 + (i % 3) * 20;
                const x = 100 + radius * Math.cos(angle);
                const y = 100 + radius * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="5" fill="white" />;
              })}
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <span className="text-green-100 text-sm font-medium">Welcome Back!</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Hello, {currentUser?.name}! 👋
            </h2>
            <p className="text-green-100 text-lg max-w-2xl">
              Ready to hit the course? Select a tournament below to start scoring your round.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <Play className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{activeTournaments}</div>
            <p className="text-xs text-gray-500 mt-1">Tournaments in progress</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Upcoming</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{upcomingTournaments}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled tournaments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{completedTournaments}</div>
            <p className="text-xs text-gray-500 mt-1">Finished tournaments</p>
          </div>
        </div>

        {/* Tournaments Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Tournaments</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              const tournamentDate = new Date(tournament.date);
              const isToday = tournamentDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={tournament._id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleSelectTournament(tournament._id)}
                >
                  {/* Status Bar */}
                  <div
                    className={`h-2 ${
                      tournament.status === 'active'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : tournament.status === 'upcoming'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                  ></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                          {tournament.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {tournament.description || 'No description'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                          tournament.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : tournament.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tournament.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          {tournamentDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {isToday && (
                          <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{tournament.courseType}</span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{tournament.gameMode}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">
                        {tournament.status === 'active'
                          ? 'Enter Scoring'
                          : tournament.status === 'upcoming'
                          ? 'View Details'
                          : 'View Results'}
                      </span>
                      <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
