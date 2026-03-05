import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Id } from '../../../convex/_generated/dataModel';
import { ChevronLeft } from 'lucide-react';

const FlightScoringOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'scorecard' | 'leaderboard'>('scorecard');
  const [scoringMode, setScoringMode] = useState<'stroke' | 'over'>('stroke');
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  const [currentHole, setCurrentHole] = useState<number>(1);

  // Fetch tournament details
  const tournament = useQuery(
    api.tournaments.getTournamentDetails,
    id ? { tournamentId: id as Id<'tournaments'> } : 'skip'
  );

  // Fetch course details if courseId exists
  const course = useQuery(
    api.courses.getCourse,
    tournament?.courseId ? { courseId: tournament.courseId } : 'skip'
  );

  // Fetch player's flight
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    id && user ? { tournamentId: id as Id<'tournaments'>, playerId: user._id } : 'skip'
  );

  // Fetch flight details with participants
  const flightDetails = useQuery(
    api.flights.getFlightDetails,
    playerFlight ? { flightId: playerFlight._id } : 'skip'
  );

  // Fetch scores for all players in flight
  const flightParticipants = flightDetails?.participants || [];

  // Get current hole based on flight (first hole where not all players scored)
  const currentHoleFromFlight = useQuery(
    api.scores.getCurrentHoleForFlight,
    flightParticipants.length > 0 && id ? {
      tournamentId: id as Id<'tournaments'>,
      playerIds: flightParticipants.map(p => p._id)
    } : 'skip'
  );

  // Update current hole when flight data changes, but only if not manually set
  useEffect(() => {
    if (currentHoleFromFlight !== undefined && currentHoleFromFlight !== null) {
      // Check if we have a saved current hole in localStorage
      const savedHole = localStorage.getItem(`currentHole_${id}`);
      if (savedHole) {
        setCurrentHole(parseInt(savedHole));
      } else {
        // First time, use the calculated current hole
        setCurrentHole(currentHoleFromFlight);
        localStorage.setItem(`currentHole_${id}`, currentHoleFromFlight.toString());
      }
    }
  }, [currentHoleFromFlight, id]);

  if (!tournament || !playerFlight || !flightDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Memuat data flight...</p>
        </div>
      </div>
    );
  }

  const holesConfig = tournament.holesConfig || [];
  const courseName = course?.name || tournament.location || 'Lapangan Golf';

  const handleFinishTournament = () => {
    // Check if all scores are complete by checking participantScores in ScorecardTable
    // For now, just show alert - the actual check will be done in the table component
    setShowIncompleteAlert(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div>
            {/* Back Button */}
            <div className="mb-3">
              <button
                onClick={() => navigate('/player/my-tournaments')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white transition-colors active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-semibold">Kembali ke My Tournament</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 p-4" style={{ backgroundColor: '#1a1a1a' }}>
              <h1 className="text-white font-bold text-lg">{tournament.name}</h1>
              <p className="text-gray-400 text-sm">{flightDetails.flightName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Information */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
        <div className="bg-gradient-to-br from-[#2e2e2e] via-[#171718] to-black rounded-xl border border-gray-800 p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base truncate " style={{"textAlign":"left"}}>{courseName}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">{holesConfig.length} Hole</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">Par {holesConfig.reduce((sum, hole) => sum + hole.par, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex space-x-2 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg p-1.5 border border-gray-800">
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${
              activeTab === 'scorecard'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kartu Skor
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Papan Peringkat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-4 space-y-3">
        {activeTab === 'scorecard' ? (
          <>
            <ScorecardTable
              tournament={tournament}
              flightParticipants={flightParticipants}
              holesConfig={holesConfig}
              currentUserId={user?._id}
              scoringMode={scoringMode}
              setScoringMode={setScoringMode}
              currentHole={currentHole}
              setCurrentHole={setCurrentHole}
            />
            {/* Action Buttons - Outside Table - Only show for active tournaments */}
            {user && flightParticipants.some(p => p._id === user._id) && tournament.status === 'active' && (
              <ActionButtons
                tournament={tournament}
                flightParticipants={flightParticipants}
                currentHole={currentHole}
                userId={user._id}
                tournamentId={id as Id<'tournaments'>}
                navigate={navigate}
                handleFinishTournament={handleFinishTournament}
              />
            )}
          </>
        ) : (
          <LeaderboardView
            tournament={tournament}
            flightParticipants={flightParticipants}
            holesConfig={holesConfig}
          />
        )}
      </div>

      {/* Incomplete Alert Dialog */}
      {showIncompleteAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-2xl border border-gray-800 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white">
                Skor Belum Lengkap
              </h3>

              {/* Message */}
              <p className="text-gray-400 text-sm leading-relaxed">
                Silakan selesaikan terlebih dahulu proses pengisian skor sebelum menyelesaikan pertandingan.
              </p>

              {/* Button */}
              <button
                onClick={() => setShowIncompleteAlert(false)}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<{
  tournament: any;
  flightParticipants: any[];
  currentHole: number;
  userId: Id<'users'>;
  tournamentId: Id<'tournaments'>;
  navigate: any;
  handleFinishTournament: () => void;
}> = ({ tournament, flightParticipants, currentHole, userId, tournamentId, navigate, handleFinishTournament }) => {
  // Use getFlightScores to fetch all scores at once
  const flightScoresData = useQuery(
    api.scores.getFlightScores,
    flightParticipants.length > 0 ? {
      tournamentId: tournament._id,
      playerIds: flightParticipants.map(p => p._id)
    } : 'skip'
  );

  // Transform the data to match our expected format
  const participantScores = flightParticipants.map(participant => {
    const playerData = flightScoresData?.find(ps => ps.playerId === participant._id);
    return {
      participant,
      scores: playerData?.scores || []
    };
  });

  // Check if current user has scored current hole
  const userScoresData = participantScores.find(ps => ps.participant._id === userId);
  const userHasScored = userScoresData?.scores?.some(s => s.holeNumber === currentHole) || false;

  // Check if all players have scored current hole
  const playersWhoScored = participantScores.filter(ps => 
    ps.scores?.some(s => s.holeNumber === currentHole)
  );
  const allPlayersScored = playersWhoScored.length === flightParticipants.length;
  const waitingCount = flightParticipants.length - playersWhoScored.length;

  // Check if all holes are completed by current user
  const holesConfig = tournament.holesConfig || [];
  const allHolesCompleted = userScoresData?.scores?.length === holesConfig.length;

  return (
    <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-3 space-y-2">
      {userHasScored ? (
        <>
          <button
            onClick={() => navigate(`/player/scoring/${tournamentId}?playerId=${userId}&hole=${currentHole}`)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-base">Edit Score</span>
          </button>
          <button
            onClick={() => {
              if (allPlayersScored) {
                // Update localStorage to next hole
                const currentHoleIndex = holesConfig.findIndex((h: any) => h.holeNumber === currentHole);
                if (currentHoleIndex < holesConfig.length - 1) {
                  const nextHole = holesConfig[currentHoleIndex + 1];
                  localStorage.setItem(`currentHole_${tournamentId}`, nextHole.holeNumber.toString());
                }
                // Reload page to update current hole
                window.location.reload();
              }
            }}
            disabled={!allPlayersScored}
            className={`w-full font-semibold py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
              allPlayersScored
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg cursor-pointer'
                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {allPlayersScored 
                ? 'Simpan & Lanjut ke Hole Berikutnya' 
                : `Menunggu ${waitingCount} pemain lainnya`}
            </span>
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate(`/player/scoring/${tournamentId}?playerId=${userId}&hole=${currentHole}`)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-base">Input Skor</span>
        </button>
      )}
      
      {allHolesCompleted && (
        <button
          onClick={handleFinishTournament}
          className="w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black hover:from-gray-800 hover:via-[#171718] hover:to-black text-white font-semibold py-3 px-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Selesaikan Pertandingan</span>
        </button>
      )}
    </div>
  );
};

// Scorecard Table Component - Single Table for All Players
const ScorecardTable: React.FC<{
  tournament: any;
  flightParticipants: any[];
  holesConfig: any[];
  currentUserId?: Id<'users'>;
  scoringMode: 'stroke' | 'over';
  setScoringMode: (mode: 'stroke' | 'over') => void;
  currentHole: number;
  setCurrentHole: (hole: number) => void;
}> = ({ tournament, flightParticipants, holesConfig, currentUserId, scoringMode, setScoringMode, currentHole }) => {
  // Fetch scores for all participants
  const participantScores = flightParticipants.map((participant) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const scores = useQuery(
      api.scores.getPlayerScores,
      { tournamentId: tournament._id, playerId: participant._id }
    );
    return { participant, scores };
  });

  const totalPar = holesConfig.reduce((sum, hole) => sum + hole.par, 0);

  return (
    <div className="space-y-3">
      {/* Scoring Mode Toggle */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-semibold text-sm">Sistem Penilaian:</span>
          <div className="flex space-x-1.5 bg-gray-900/50 rounded-lg p-0.5">
            <button
              onClick={() => setScoringMode('stroke')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                scoringMode === 'stroke'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pukulan
            </button>
            <button
              onClick={() => setScoringMode('over')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                scoringMode === 'over'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Over/Under
            </button>
          </div>
        </div>
      </div>

      {/* Legend - Above Table */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-nowrap items-center justify-center gap-2 text-[10px] overflow-x-auto">
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-yellow-500 ring-1 ring-yellow-400"></div>
              <span className="text-gray-300 font-medium">Eagle</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-red-500 ring-1 ring-red-400"></div>
              <span className="text-gray-300 font-medium">Birdie</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-300 font-medium">Par</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-gray-600"></div>
              <span className="text-gray-300 font-medium">Bogey</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-gray-700"></div>
              <span className="text-gray-300 font-medium">Double+</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gray-400">
              Hole saat ini: <span className="text-red-500 font-bold">#{currentHole}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* Header Row 1 - Hole Numbers */}
              <tr className="border-b border-gray-800 bg-gradient-to-r from-red-900/20 to-red-800/10">
                <th className="sticky left-0 z-20 bg-gradient-to-r from-[#2e2e2e] to-gray-900 text-left text-white font-bold py-2 px-2 border-r border-gray-800 min-w-[110px]">
                  Pemain
                </th>
                {holesConfig.map((hole) => (
                  <th 
                    key={hole.holeNumber} 
                    className={`text-center text-white font-bold py-2 px-1.5 min-w-[32px] ${
                      hole.holeNumber === currentHole ? 'bg-red-600/30 ring-2 ring-red-500' : ''
                    }`}
                  >
                    {hole.holeNumber}
                  </th>
                ))}
                <th className="text-center text-white font-bold py-2 px-2 border-l-2 border-red-600 min-w-[45px]">
                  Tot
                </th>
                <th className="text-center text-white font-bold py-2 px-2 border-l border-gray-800 min-w-[45px]">
                  +/-
                </th>
              </tr>
              {/* Header Row 2 - Par */}
              <tr className="border-b-2 border-gray-700 bg-gray-900/50">
                <td className="sticky left-0 z-20 bg-gray-900 text-gray-300 font-semibold py-1.5 px-2 border-r border-gray-800">
                  Par
                </td>
                {holesConfig.map((hole) => (
                  <td key={hole.holeNumber} className="text-center text-gray-300 font-semibold py-1.5 px-1.5">
                    {hole.par}
                  </td>
                ))}
                <td className="text-center text-gray-300 font-bold py-1.5 px-2 border-l-2 border-red-600">
                  {totalPar}
                </td>
                <td className="text-center text-gray-400 py-1.5 px-2 border-l border-gray-800">
                  0
                </td>
              </tr>
            </thead>
            <tbody>
              {participantScores
                .map(({ participant, scores }) => {
                  const scoresMap = new Map(
                    (scores || []).map((score) => [score.holeNumber, score])
                  );
                  
                  const totalStrokes = (scores || []).reduce((sum, score) => sum + score.strokes, 0);
                  const scoreToPar = totalStrokes - totalPar;
                  const holesPlayed = (scores || []).length;
                  const isCurrentUser = participant._id === currentUserId;

                  return {
                    participant,
                    scores,
                    scoresMap,
                    totalStrokes,
                    scoreToPar,
                    holesPlayed,
                    isCurrentUser
                  };
                })
                .sort((a, b) => {
                  // Players with no holes played go to bottom
                  if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0;
                  if (a.holesPlayed === 0) return 1;
                  if (b.holesPlayed === 0) return -1;
                  // Sort by total strokes (ascending - lowest score first)
                  return a.totalStrokes - b.totalStrokes;
                })
                .map(({ participant, scoresMap, totalStrokes, scoreToPar, isCurrentUser }, index) => {
                return (
                  <tr
                    key={participant._id}
                    className={`border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${
                      isCurrentUser ? 'bg-red-900/10' : ''
                    }`}
                  >
                    {/* Player Name with Number */}
                    <td className={`sticky left-0 z-20 ${
                      isCurrentUser ? 'bg-red-900' : 'bg-gradient-to-r from-[#2e2e2e] to-gray-900'
                    } py-2 px-2 border-r border-gray-800`}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full ${
                          isCurrentUser ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-800'
                        } flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-bold text-[10px]">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-xs truncate">
                            {participant.name}
                            {isCurrentUser && <span className="ml-1 text-red-500 text-[10px]">(kamu)</span>}
                          </div>
                          {/* <div className="text-gray-400 text-[10px]">
                            HCP {participant.handicap || 0} • {holesPlayed}/{holesConfig.length}
                          </div> */}
                        </div>
                      </div>
                    </td>
                    
                    {/* Score Cells */}
                    {holesConfig.map((hole) => {
                      const score = scoresMap.get(hole.holeNumber);
                      const strokes = score?.strokes;
                      const par = hole.par;
                      const isCurrentHole = hole.holeNumber === currentHole;
                      
                      let bgColor = 'bg-gray-800/50';
                      let textColor = 'text-gray-500';
                      let borderColor = '';
                      let displayValue = '-';
                      
                      if (strokes) {
                        const diff = strokes - par;
                        
                        // Display value based on mode
                        if (scoringMode === 'over') {
                          if (diff === 0) {
                            displayValue = '0';
                          } else if (diff > 0) {
                            displayValue = `+${diff}`;
                          } else {
                            displayValue = `${diff}`;
                          }
                        } else {
                          displayValue = strokes.toString();
                        }
                        
                        // Color coding
                        if (strokes === par - 2) {
                          // Eagle
                          bgColor = 'bg-yellow-500';
                          textColor = 'text-black';
                          borderColor = 'ring-1 ring-yellow-400';
                        } else if (strokes === par - 1) {
                          // Birdie
                          bgColor = 'bg-red-500';
                          textColor = 'text-white';
                          borderColor = 'ring-1 ring-red-400';
                        } else if (strokes === par) {
                          // Par
                          bgColor = 'bg-blue-500';
                          textColor = 'text-white';
                        } else if (strokes === par + 1) {
                          // Bogey
                          bgColor = 'bg-gray-600';
                          textColor = 'text-white';
                        } else if (strokes >= par + 2) {
                          // Double Bogey+
                          bgColor = 'bg-gray-700';
                          textColor = 'text-white';
                        }
                      }
                      
                      return (
                        <td 
                          key={hole.holeNumber} 
                          className={`text-center py-2 px-1.5 ${
                            isCurrentHole ? 'bg-red-600/10' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full ${bgColor} ${textColor} ${borderColor} flex items-center justify-center mx-auto font-bold text-xs`}>
                            {displayValue}
                          </div>
                        </td>
                      );
                    })}
                    
                    {/* Total */}
                    <td className="text-center py-2 px-2 border-l-2 border-red-600">
                      <div className="text-white font-bold text-sm">{totalStrokes || 0}</div>
                    </td>
                    
                    {/* Score to Par */}
                    <td className="text-center py-2 px-2 border-l border-gray-800">
                      <div className={`font-bold text-sm ${
                        scoreToPar > 0 ? 'text-red-400' : scoreToPar < 0 ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar === 0 ? '0' : scoreToPar}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Leaderboard View Component
const LeaderboardView: React.FC<{
  tournament: any;
  flightParticipants: any[];
  holesConfig: any[];
}> = ({ tournament, flightParticipants, holesConfig }) => {
  // Fetch scores for all participants using individual queries
  const participantScores = flightParticipants.map((participant) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const scores = useQuery(
      api.scores.getPlayerScores,
      { tournamentId: tournament._id, playerId: participant._id }
    );
    return { participant, scores };
  });

  // Calculate standings
  const participantsWithScores = participantScores.map(({ participant, scores }) => {
    const totalStrokes = (scores || []).reduce((sum, score) => sum + score.strokes, 0);
    const totalPar = holesConfig.reduce((sum, hole) => sum + hole.par, 0);
    const scoreToPar = totalStrokes - totalPar;
    const holesPlayed = (scores || []).length;

    return {
      ...participant,
      totalStrokes,
      scoreToPar,
      holesPlayed,
    };
  });

  // Sort by total strokes (ascending)
  const sortedParticipants = [...participantsWithScores].sort((a, b) => {
    if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0;
    if (a.holesPlayed === 0) return 1;
    if (b.holesPlayed === 0) return -1;
    return a.totalStrokes - b.totalStrokes;
  });

  return (
    <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 overflow-hidden shadow-xl">
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-white font-bold text-base">Papan Peringkat Flight</h2>
        <p className="text-gray-400 text-sm mt-1">Posisi saat ini</p>
      </div>
      <div className="divide-y divide-gray-800">
        {sortedParticipants.map((participant, index) => (
          <div key={participant._id} className="p-3 hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 text-center">
                <div className={`text-xl font-bold ${
                  index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base">{participant.name}</h3>
                <p className="text-gray-400 text-sm">HCP: {participant.handicap || 0}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">{participant.totalStrokes || 0}</div>
                <div className={`text-sm font-semibold ${
                  participant.scoreToPar > 0 ? 'text-red-400' : participant.scoreToPar < 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {participant.scoreToPar > 0 ? `+${participant.scoreToPar}` : participant.scoreToPar === 0 ? '0' : participant.scoreToPar}
                </div>
                <div className="text-xs text-gray-500">{participant.holesPlayed}/{holesConfig.length} hole</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightScoringOverview;
