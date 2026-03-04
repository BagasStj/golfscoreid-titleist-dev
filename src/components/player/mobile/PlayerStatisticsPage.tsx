import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Star, 
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';

const PlayerStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const playerStats = useQuery(
    api.users.getPlayerStatistics,
    user ? { playerId: user._id } : 'skip'
  );

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex items-center justify-center">
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-8 border border-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex items-center justify-center">
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-8 border border-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 text-center">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const stats = playerStats;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex flex-col">
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0  shadow-2xl border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate('/player?tab=profile')}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-white font-bold text-xl">My Statistics</h2>
            <p className="text-red-100 text-sm">Overall performance</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-5 pb-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Total Tournament"
            value={stats.totalTournaments}
            color="from-blue-600 to-blue-700"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Total Holes"
            value={stats.totalHolesPlayed}
            color="from-green-600 to-green-700"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Best Score"
            value={stats.bestScore > 0 ? stats.bestScore : '-'}
            color="from-yellow-600 to-yellow-700"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Avg Score"
            value={stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '-'}
            color="from-purple-600 to-purple-700"
          />
        </div>

        {/* Score Distribution */}
        <div className="bg-black/30 rounded-xl p-5 border border-gray-800">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-red-500" />
            Score Distribution
          </h3>
          <div className="space-y-3">
            <ScoreDistributionBar
              label="Eagle"
              count={stats.scoreDistribution.eagles}
              color="bg-yellow-500"
              symbol="🦅"
            />
            <ScoreDistributionBar
              label="Birdie"
              count={stats.scoreDistribution.birdies}
              color="bg-blue-500"
              symbol="🐦"
            />
            <ScoreDistributionBar
              label="Par"
              count={stats.scoreDistribution.pars}
              color="bg-green-500"
              symbol="✓"
            />
            <ScoreDistributionBar
              label="Bogey"
              count={stats.scoreDistribution.bogeys}
              color="bg-orange-500"
              symbol="△"
            />
            <ScoreDistributionBar
              label="Double Bogey+"
              count={stats.scoreDistribution.doubleBogeyPlus}
              color="bg-red-500"
              symbol="✕"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-black/30 rounded-xl p-5 border border-gray-800">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-red-500" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <MetricRow
              label="Fairway Hit Rate"
              value={`${stats.fairwayHitRate}%`}
              progress={stats.fairwayHitRate}
            />
            <MetricRow
              label="Green in Regulation"
              value={`${stats.greenInRegulation}%`}
              progress={stats.greenInRegulation}
            />
            <MetricRow
              label="Par Save Rate"
              value={`${stats.parSaveRate}%`}
              progress={stats.parSaveRate}
            />
          </div>
        </div>

        {/* Recent Form */}
        <div className="bg-black/30 rounded-xl p-5 border border-gray-800">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-red-500" />
            Recent Form (Last 5 Tournaments)
          </h3>
          {stats.recentScores.length > 0 ? (
            <div className="space-y-3">
              {stats.recentScores.map((score: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-gray-700">
                  <div>
                    <div className="text-white font-semibold text-sm">{score.tournamentName}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(score.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">{score.totalScore}</div>
                    <div className={`text-xs font-semibold ${score.scoreVsPar >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {score.scoreVsPar > 0 ? '+' : ''}{score.scoreVsPar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No performance data yet</p>
          )}
        </div>

        {/* Achievements */}
        {stats.achievements && stats.achievements.length > 0 && (
          <div className="bg-black/30 rounded-xl p-5 border border-gray-800">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-red-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements.map((achievement: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 rounded-xl p-4 border border-yellow-600/30 text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-white font-semibold text-sm">{achievement.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg`}>
    <div className="text-white mb-2">{icon}</div>
    <div className="text-white font-bold text-2xl">{value}</div>
    <div className="text-white/80 text-sm mt-1">{label}</div>
  </div>
);

const ScoreDistributionBar: React.FC<{ label: string; count: number; color: string; symbol: string }> = ({
  label,
  count,
  color,
  symbol,
}) => {
  const maxCount = 100; // For percentage calculation
  const percentage = Math.min((count / maxCount) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-lg ${
            label === 'Eagle' ? 'text-yellow-500' :
            label === 'Birdie' ? 'text-blue-500' :
            label === 'Par' ? 'text-green-500' :
            label === 'Bogey' ? 'text-orange-500' :
            'text-red-500'
          }`}>{symbol}</span>
          <span className="text-white font-semibold text-sm">{label}</span>
        </div>
        <span className="text-gray-400 text-sm font-bold">{count}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string; progress: number }> = ({ label, value, progress }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-white font-semibold text-sm">{label}</span>
      <span className="text-red-400 font-bold">{value}</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default PlayerStatisticsPage;
