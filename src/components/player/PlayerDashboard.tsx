import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  LogOut, 
  Shield,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Card, Button, StatCard } from '../ui';

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const tournaments = useQuery(
    api.tournaments.getTournaments,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const handleSelectTournament = (tournamentId: Id<'tournaments'>) => {
    navigate(`/player/tournament/${tournamentId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/player/login');
  };

  if (tournaments === undefined) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-secondary-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-6xl mb-4">⛳</div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">No Tournaments</h2>
          <p className="text-secondary-600">
            You are not registered in any tournaments yet. Contact your tournament admin to get
            registered.
          </p>
        </Card>
      </div>
    );
  }

  // Calculate player stats (mock data for now)
  const playerStats = {
    tournamentsPlayed: tournaments.length,
    bestScore: -3,
    averageScore: +2,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary-700">GolfScore ID</h1>
            <p className="text-sm text-secondary-600 mt-1">Player Dashboard</p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
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
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Welcome Header with Golf Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            {/* Decorative golf ball pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" fill="currentColor"/>
                <circle cx="70" cy="70" r="5" fill="white"/>
                <circle cx="100" cy="65" r="5" fill="white"/>
                <circle cx="130" cy="70" r="5" fill="white"/>
                <circle cx="65" cy="100" r="5" fill="white"/>
                <circle cx="95" cy="95" r="5" fill="white"/>
                <circle cx="125" cy="95" r="5" fill="white"/>
                <circle cx="135" cy="100" r="5" fill="white"/>
                <circle cx="70" cy="125" r="5" fill="white"/>
                <circle cx="100" cy="125" r="5" fill="white"/>
                <circle cx="130" cy="125" r="5" fill="white"/>
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {currentUser?.name}!
              </h2>
              <p className="text-primary-100">
                Ready to hit the course? Select a tournament to start scoring.
              </p>
            </div>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Tournaments Played"
              value={playerStats.tournamentsPlayed}
              icon={Trophy}
              color="primary"
            />
            <StatCard
              label="Best Score"
              value={playerStats.bestScore > 0 ? `+${playerStats.bestScore}` : playerStats.bestScore}
              icon={Target}
              color="success"
            />
            <StatCard
              label="Average Score"
              value={playerStats.averageScore > 0 ? `+${playerStats.averageScore}` : playerStats.averageScore}
              icon={TrendingUp}
              color="accent"
            />
          </div>

          {/* Tournament Cards */}
          <div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">Your Tournaments</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tournaments.map((tournament) => {
                const tournamentDate = new Date(tournament.date);
                const isToday = tournamentDate.toDateString() === new Date().toDateString();

                return (
                  <Card
                    key={tournament._id}
                    variant="default"
                    padding="lg"
                    hoverable
                    clickable
                    onClick={() => handleSelectTournament(tournament._id)}
                    className="cursor-pointer group"
                  >
                    {/* Tournament Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {tournament.name}
                        </h4>
                        <p className="text-sm text-secondary-600 line-clamp-2">{tournament.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                          tournament.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : tournament.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-secondary-200 text-secondary-800'
                        }`}
                      >
                        {tournament.status}
                      </span>
                    </div>

                    {/* Tournament Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <Calendar className="w-4 h-4" />
                        <span>{tournamentDate.toLocaleDateString()}</span>
                        {isToday && (
                          <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <MapPin className="w-4 h-4" />
                        <span>{tournament.courseType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <Target className="w-4 h-4" />
                        <span>
                          {tournament.gameMode === 'strokePlay'
                            ? 'Stroke Play'
                            : tournament.gameMode === 'stableford'
                            ? 'Stableford'
                            : 'System 36'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                      <span className="text-sm text-secondary-600 font-medium">Enter Tournament</span>
                      <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
