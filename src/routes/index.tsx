import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';

// Lazy load components for code splitting
const LoginSelectionPage = lazy(() => import('../components/auth/LoginSelectionPage'));
const AdminLoginPage = lazy(() => import('../components/auth/AdminLoginPage'));
const PlayerLoginPage = lazy(() => import('../components/auth/PlayerLoginPage'));
const PlayerRegistrationPage = lazy(() => import('../components/auth/PlayerRegistrationPage'));
const ForgotPasswordPage = lazy(() => import('../components/auth/ForgotPasswordPage'));
const ProtectedRoute = lazy(() => import('../components/auth/ProtectedRoute'));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const MobileLayout = lazy(() => import('../components/player/mobile/MobileLayout'));
const TournamentDetail = lazy(() => import('../components/player/TournamentDetail'));
const NewsDetailMobile = lazy(() => import('../components/player/mobile/NewsDetail'));
const EditProfilePage = lazy(() => import('../components/player/mobile/EditProfilePage'));
const PlayerStatisticsPage = lazy(() => import('../components/player/mobile/PlayerStatisticsPage'));
const TournamentHistoryPage = lazy(() => import('../components/player/mobile/TournamentHistoryPage'));
const SettingsPage = lazy(() => import('../components/player/mobile/SettingsPage'));
const FAQPage = lazy(() => import('../components/player/mobile/FAQPage'));
const TeaserPage = lazy(() => import('../components/player/mobile/TeaserPage'));
const LandingPage = lazy(() => import('../components/player/mobile/LandingPage'));
const FlightScoringOverview = lazy(() => import('../components/player/FlightScoringOverview'));
const ModernScoringInterface = lazy(() => import('../components/player/ModernScoringInterface'));
const PlayerLeaderboard = lazy(() => import('../components/player/PlayerLeaderboard'));
const PlayerScorecard = lazy(() => import('../components/player/PlayerScorecard'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-grass-green-50 to-white flex items-center justify-center">
    <div className="w-full max-w-4xl px-4">
      <LoadingSkeleton variant="card" count={2} />
    </div>
  </div>
);

// Wrapper for lazy loaded routes with suspense
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyRoute>
        <LoginSelectionPage />
      </LazyRoute>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <LazyRoute>
        <AdminLoginPage />
      </LazyRoute>
    ),
  },
  {
    path: '/player/login',
    element: (
      <LazyRoute>
        <PlayerLoginPage />
      </LazyRoute>
    ),
  },
  {
    path: '/player/register',
    element: (
      <LazyRoute>
        <PlayerRegistrationPage />
      </LazyRoute>
    ),
  },
  {
    path: '/player/forgot-password',
    element: (
      <LazyRoute>
        <ForgotPasswordPage />
      </LazyRoute>
    ),
  },
  {
    path: '/',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <Navigate to="/player" replace />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <LazyRoute>
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <MobileLayout />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/tournament/:id',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <TournamentDetail />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/mobile/news/:id',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <NewsDetailMobile />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/profile/edit',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/profile/statistics',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <PlayerStatisticsPage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/profile/history',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <TournamentHistoryPage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/profile/settings',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/profile/faq',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <FAQPage />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/teaser',
    element: (
      <LazyRoute>
        <TeaserPage />
      </LazyRoute>
    ),
  },
  {
    path: '/player/landing',
    element: (
      <LazyRoute>
        <LandingPage />
      </LazyRoute>
    ),
  },
  {
    path: '/player/flight-scoring/:id',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <FlightScoringOverview />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/scoring/:id',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <ModernScoringInterface />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/tournament/:tournamentId/leaderboard',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <PlayerLeaderboard />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '/player/tournament/:tournamentId/scorecard',
    element: (
      <LazyRoute>
        <ProtectedRoute>
          <PlayerScorecard />
        </ProtectedRoute>
      </LazyRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
