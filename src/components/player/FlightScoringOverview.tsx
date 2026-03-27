import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChevronLeft, Info } from "lucide-react";

const FlightScoringOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"scorecard" | "leaderboard">(
    "scorecard",
  );
  const [scoringMode, setScoringMode] = useState<"stroke" | "over">("stroke");
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  const [currentHole, setCurrentHole] = useState<number | null>(null);
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false);
  const [showHoleMismatchAlert, setShowHoleMismatchAlert] = useState(false);
  const [holeMismatchDetails, setHoleMismatchDetails] = useState<{
    userHole: number;
    otherPlayers: Array<{ name: string; hole: number }>;
  } | null>(null);
  const [tournamentFinished, setTournamentFinished] = useState(false);
  const [showWaitingApprovalAlert, setShowWaitingApprovalAlert] = useState(false);
  const [waitingApprovalPlayers, setWaitingApprovalPlayers] = useState<Array<{ name: string; hole: number }>>([]);
  const [showPendingHoleAlert, setShowPendingHoleAlert] = useState(false);

  // Fetch tournament details
  const tournament = useQuery(
    api.tournaments.getTournamentDetails,
    id ? { tournamentId: id as Id<"tournaments"> } : "skip",
  );

  // Fetch player's flight
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    id && user
      ? { tournamentId: id as Id<"tournaments">, playerId: user._id }
      : "skip",
  );

  // Fetch flight details with participants
  const flightDetails = useQuery(
    api.flights.getFlightDetails,
    playerFlight ? { flightId: playerFlight._id } : "skip",
  );

  // Fetch scores for all players in flight
  const flightParticipants = flightDetails?.participants || [];

  // Fetch current user's scores to check if they have started scoring
  const currentUserScores = useQuery(
    api.scores.getPlayerScores,
    user && id
      ? {
        tournamentId: id as Id<"tournaments">,
        playerId: user._id,
      }
      : "skip",
  );

  const finishScoringMutation = useMutation(api.flights.finishScoring);

  // Determine current hole based on user's last scored hole and approved holes
  useEffect(() => {
    if (currentUserScores !== undefined && id && user && flightParticipants.length > 0) {
      // Get approved holes from DB instead of localStorage
      const currentPlayer = flightParticipants.find((p: any) => p._id === user._id);
      const approvedHoles: number[] = currentPlayer?.approvedHoles || [];
      const startHole: number = currentPlayer?.startHole || 1;

      if (currentUserScores.length > 0) {
        // Find the last hole the user scored (most recently submitted)
        const sortedScores = [...currentUserScores].sort(
          (a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)
        );
        const lastScoredHole = sortedScores[0].holeNumber;

        // If last scored hole is approved, set current hole to null (ready for next hole)
        if (approvedHoles.includes(lastScoredHole)) {
          setCurrentHole(null);
        } else {
          // Last scored hole not yet approved, show it as current
          setCurrentHole(lastScoredHole);
        }
      } else {
        // User hasn't scored any holes yet, set to start hole
        setCurrentHole(startHole);
      }
    }
  }, [currentUserScores, id, user, flightParticipants]);

  // Show disclaimer dialog on first visit - only if player hasn't scored yet
  useEffect(() => {
    const disclaimerKey = `scoringDisclaimer_${id}_${user?._id}`;
    const hasSeenDisclaimer = localStorage.getItem(disclaimerKey);

    // Only show if:
    // 1. User hasn't seen the disclaimer before
    // 2. Tournament and flight data are loaded
    // 3. User has NO scores yet (first time scoring)
    if (
      !hasSeenDisclaimer &&
      tournament &&
      playerFlight &&
      user &&
      currentUserScores !== undefined &&
      currentUserScores.length === 0
    ) {
      setShowDisclaimerDialog(true);
    }
  }, [id, tournament, playerFlight, user, currentUserScores]);

  // Listen for custom event to show disclaimer dialog
  useEffect(() => {
    const handleShowDisclaimer = () => {
      setShowDisclaimerDialog(true);
    };

    window.addEventListener('showDisclaimerDialog', handleShowDisclaimer);

    return () => {
      window.removeEventListener('showDisclaimerDialog', handleShowDisclaimer);
    };
  }, []);

  // Check if tournament is finished from localStorage or convex
  useEffect(() => {
    if (id && user && flightDetails) {
      // Find current user's participation
      const currentPlayerParticipation = flightDetails.participants.find(
        (p: any) => p._id === user._id
      );

      const isFinishedFromConvex = currentPlayerParticipation?.scoringFinished === true;

      const finishedKey = `tournamentFinished_${id}_${user._id}`;
      const isFinishedFromLocal = localStorage.getItem(finishedKey) === 'true';

      setTournamentFinished(isFinishedFromConvex || isFinishedFromLocal);
    }
  }, [id, user, flightDetails]);

  // Debug: Check for duplicate hole numbers - must be before conditional return
  useEffect(() => {
    if (tournament?.holesConfig && tournament.holesConfig.length > 0) {
      const holeNumbers = tournament.holesConfig.map((h: any) => h.holeNumber);
      const uniqueHoleNumbers = new Set(holeNumbers);
      if (holeNumbers.length !== uniqueHoleNumbers.size) {
        console.error('⚠️ Duplicate hole numbers detected in holesConfig:', tournament.holesConfig);
        console.error('Hole numbers:', holeNumbers);
      }
    }
  }, [tournament?.holesConfig]);

  // Deduplicate holesConfig to ensure unique hole numbers - must be before conditional return
  const uniqueHolesConfig = React.useMemo(() => {
    if (!tournament?.holesConfig) return [];

    const seen = new Set<number>();
    return tournament.holesConfig.filter((hole: any) => {
      if (seen.has(hole.holeNumber)) {
        console.warn(`Duplicate hole number ${hole.holeNumber} found in main component, skipping...`);
        return false;
      }
      seen.add(hole.holeNumber);
      return true;
    });
  }, [tournament?.holesConfig]);

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

  // const holesConfig = tournament.holesConfig || [];

  const handleFinishTournament = async () => {
    if (!user || !id) return;

    // Get user's scores
    const userScores = currentUserScores || [];
    const holesConfig = uniqueHolesConfig || [];

    // Check if all holes are scored
    const allHolesScored = userScores.length === holesConfig.length;

    if (!allHolesScored) {
      setShowIncompleteAlert(true);
      return;
    }

    try {
      // Mark as finished in Convex
      await finishScoringMutation({
        tournamentId: id as Id<"tournaments">,
        playerId: user._id,
      });

      // Mark tournament as finished in localStorage
      const finishedKey = `tournamentFinished_${id}_${user._id}`;
      localStorage.setItem(finishedKey, 'true');

      // Update state to hide buttons
      setTournamentFinished(true);
    } catch (error) {
      console.error("Failed to finish scoring:", error);
      // Fallback
      const finishedKey = `tournamentFinished_${id}_${user._id}`;
      localStorage.setItem(finishedKey, 'true');
      setTournamentFinished(true);
    }
  };

  const handleAcceptDisclaimer = () => {
    const disclaimerKey = `scoringDisclaimer_${id}_${user?._id}`;
    localStorage.setItem(disclaimerKey, "true");
    setShowDisclaimerDialog(false);
  };

  const handleCloseDisclaimer = () => {
    setShowDisclaimerDialog(false);
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
                onClick={() => navigate("/player?tab=my-tournaments")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white transition-colors active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  Kembali ke My Tournament
                </span>
              </button>
            </div>

            {/*<div
              className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 p-4"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <h1 className="text-white font-bold text-lg">
                {tournament.name}
              </h1>
              <p className="text-gray-400 text-sm">
                {flightDetails.flightName}
              </p>
            </div>*/}
          </div>
        </div>
      </div>

      {/* Course Information */}
      {/*<div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
        <div className="bg-gradient-to-br from-[#2e2e2e] via-[#171718] to-black rounded-xl border border-gray-800 p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-white font-bold text-base truncate "
                style={{ textAlign: "left" }}
              >
                {courseName}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1.5">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">
                    {holesConfig.length} Hole
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm font-medium">
                    Par {holesConfig.reduce((sum, hole) => sum + hole.par, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>*/}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex space-x-2 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg p-1.5 border border-gray-800">
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === "scorecard"
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
              }`}
          >
            Scorecard
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === "leaderboard"
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
              }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-4 space-y-3">
        {/* Tournament Finished Message */}
        {tournamentFinished && (
          <div className="bg-gradient-to-r from-green-900/40 to-green-800/40 border-2 border-green-600 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base">Pertandingan Selesai! 🎉</h3>
                <p className="text-green-200 text-sm">Anda telah menyelesaikan semua hole. Scorecard di bawah adalah hasil final Anda.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scorecard" ? (
          <>
            <ScorecardTable
              tournament={tournament}
              flightParticipants={flightParticipants}
              holesConfig={uniqueHolesConfig}
              currentUserId={user?._id}
              scoringMode={scoringMode}
              setScoringMode={setScoringMode}
              currentHole={currentHole}
              setCurrentHole={setCurrentHole}
              onShowWaitingApprovalAlert={(players) => {
                setWaitingApprovalPlayers(players);
                setShowWaitingApprovalAlert(true);
              }}
              onShowPendingHoleAlert={() => setShowPendingHoleAlert(true)}
              onHoleClick={(holeNumber) => {
                // Navigate to scoring interface for the clicked hole
                if (user) {
                  navigate(
                    `/player/scoring/${id}?playerId=${user._id}&hole=${holeNumber}`,
                  );
                }
              }}
            />
            {/* Action Buttons - Outside Table - Only show for active tournaments and not finished */}
            {user &&
              flightParticipants.some((p) => p._id === user._id) &&
              tournament.status === "active" &&
              !tournamentFinished && (
                <ActionButtons
                  tournament={tournament}
                  flightParticipants={flightParticipants}
                  currentHole={currentHole}
                  userId={user._id}
                  tournamentId={id as Id<"tournaments">}
                  navigate={navigate}
                  handleFinishTournament={handleFinishTournament}
                  setShowHoleMismatchAlert={setShowHoleMismatchAlert}
                  setHoleMismatchDetails={setHoleMismatchDetails}
                  setShowWaitingApprovalAlert={setShowWaitingApprovalAlert}
                  setWaitingApprovalPlayers={setWaitingApprovalPlayers}
                />
              )}
          </>
        ) : (
          <LeaderboardView
            tournament={tournament}
            flightParticipants={flightParticipants}
            holesConfig={uniqueHolesConfig}
          />
        )}
      </div>

      {/* Disclaimer Dialog */}
      {showDisclaimerDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-t-2xl sm:rounded-2xl shadow-2xl border-2 border-blue-900/40 w-full sm:max-w-lg max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
            {/* Close Button - sticky at top */}
            <div className="flex justify-end p-4 pb-0 flex-shrink-0">
              <button
                onClick={handleCloseDisclaimer}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="px-6 pb-2 overflow-y-auto flex-1 space-y-5">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-900/60 to-blue-800/60 rounded-2xl flex items-center justify-center mx-auto border border-blue-800/40 shadow-lg">
                <svg
                  className="w-8 h-8 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Penting untuk Diperhatikan
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sebelum memulai pencatatan skor, mohon perhatikan hal-hal berikut:
                </p>
              </div>

              {/* Important Points */}
              <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-700/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm font-semibold mb-1">
                      Skor yang Telah Disetujui Bersifat Final
                    </p>
                    <p className="text-blue-300/80 text-xs leading-relaxed">
                      Setelah skor diinput dan disetujui oleh seluruh anggota flight, skor tidak dapat diubah.
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-700/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm font-semibold mb-1">
                      Integritas dan Sportivitas
                    </p>
                    <p className="text-blue-300/80 text-xs leading-relaxed">
                      Pencatatan skor yang akurat mencerminkan nilai-nilai sportivitas dan fair play dalam permainan golf.
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-700/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm font-semibold mb-1">
                      Skor Tidak Dapat Diubah Setelah Lanjut
                    </p>
                    <p className="text-blue-300/80 text-xs leading-relaxed">
                      Setelah menekan tombol "Setujui & Lanjutkan”, skor pada hole sebelumnya tidak dapat diubah. Pastikan semua skor sudah benar sebelum melanjutkan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-700/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-yellow-200 text-sm font-semibold mb-1">
                      ⁠Hole Harus Sama untuk Semua Pemain dalam Flight
                    </p>
                    <p className="text-yellow-300/80 text-xs leading-relaxed">
                      Semua pemain dalam satu flight wajib mengisi skor pada hole yang sama sebelum dapat melanjutkan. Tombol "Setujui & Lanjutkan" hanya aktif jika semua pemain telah mengisi hole yang sama.
                    </p>
                    <div className="mt-2.5 p-2 bg-red-900/20 border-l-2 border-red-500 rounded-r-lg">
                      <p className="text-red-200/90 text-xs leading-relaxed">
                        <span className="font-bold">⚠️ Peringatan:</span> Jika terlanjur mengisi skor pada hole yang berbeda, pemain yang salah input harus menghapus skor tersebut dan menginput ulang pada hole yang sama dengan pemain lainnya.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button - sticky at bottom */}
            <div className="px-6 py-4 flex-shrink-0 border-t border-gray-800/60">
              <button
                onClick={handleAcceptDisclaimer}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Saya Mengerti dan Setuju</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hole Mismatch Alert Dialog */}
      {showHoleMismatchAlert && holeMismatchDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-2xl border border-gray-800 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-500"
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
                Hole Tidak Sama
              </h3>

              {/* Message */}
              <div className="text-left bg-red-900/20 border border-red-800/40 rounded-xl p-4 space-y-2">
                <p className="text-red-200 text-sm">
                  Anda mengisi skor di <span className="font-bold">Hole {holeMismatchDetails.userHole}</span>, tetapi pemain lain mengisi di hole yang berbeda:
                </p>
                <ul className="text-red-300/80 text-xs space-y-1 ml-4">
                  {holeMismatchDetails.otherPlayers.map((player, idx) => (
                    <li key={idx}>
                      • {player.name}: Hole {player.hole}
                    </li>
                  ))}
                </ul>
                <p className="text-red-200 text-sm mt-3">
                  Semua pemain dalam flight harus mengisi skor di hole yang sama sebelum dapat melanjutkan.
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  setShowHoleMismatchAlert(false);
                  setHoleMismatchDetails(null);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

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
                Belum Bisa Selesai
              </h3>

              {/* Message */}
              <p className="text-gray-400 text-sm leading-relaxed">
                Pastikan semua hole sudah diisi skornya sebelum menyelesaikan pertandingan.
              </p>

              {/* Info */}
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3">
                <p className="text-yellow-200 text-xs">
                  Cek kembali scorecard Anda dan pastikan tidak ada hole yang masih kosong (-).
                </p>
              </div>

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

      {/* Waiting Approval Alert Dialog */}
      {showWaitingApprovalAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-2xl border border-yellow-800/60 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white">
                Tunggu Persetujuan Dulu ✋
              </h3>

              {/* Message */}
              <p className="text-gray-400 text-sm leading-relaxed">
                Semua pemain dalam flight harus menyetujui skor hole sebelumnya sebelum Anda bisa melanjutkan ke hole berikutnya.
              </p>

              {/* Players list */}
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-4 text-left space-y-2">
                <p className="text-yellow-300 text-xs font-semibold mb-2">
                  Pemain yang belum menyetujui skor Hole {waitingApprovalPlayers.length > 0 ? waitingApprovalPlayers[0].hole : ""}:
                </p>
                {waitingApprovalPlayers.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-yellow-700/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-yellow-200 text-sm font-semibold">{player.name}</span>
                    <span className="text-yellow-400/70 text-xs">belum menyetujui Hole {player.hole}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-500 text-xs">
                Minta pemain tersebut untuk membuka aplikasi dan menekan tombol <span className="text-green-400 font-semibold">"Setujui &amp; Lanjutkan"</span>.
              </p>

              {/* Button */}
              <button
                onClick={() => {
                  setShowWaitingApprovalAlert(false);
                  setWaitingApprovalPlayers([]);
                }}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Oke, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Hole Alert Dialog */}
      {showPendingHoleAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-2xl border border-yellow-800/60 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
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
                Belum Bisa Pindah Hole
              </h3>

              {/* Message */}
              <p className="text-gray-400 text-sm leading-relaxed">
                Selesaikan persetujuan hole saat ini terlebih dahulu sebelum mengisi hole lain.
              </p>

              {/* Button */}
              <button
                onClick={() => setShowPendingHoleAlert(false)}
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
  currentHole: number | null;
  userId: Id<"users">;
  tournamentId: Id<"tournaments">;
  navigate: any;
  handleFinishTournament: () => void;
  setShowHoleMismatchAlert: (show: boolean) => void;
  setHoleMismatchDetails: (details: any) => void;
  setShowWaitingApprovalAlert: (show: boolean) => void;
  setWaitingApprovalPlayers: (players: any) => void;
}> = ({
  tournament,
  flightParticipants,
  currentHole,
  userId,
  tournamentId,
  navigate,
  handleFinishTournament,
  setShowHoleMismatchAlert,
  setHoleMismatchDetails,
  setShowWaitingApprovalAlert,
  setWaitingApprovalPlayers,
}) => {
    // Use getFlightScores to fetch all scores at once
    const flightScoresData = useQuery(
      api.scores.getFlightScores,
      flightParticipants.length > 0
        ? {
          tournamentId: tournament._id,
          playerIds: flightParticipants.map((p) => p._id),
        }
        : "skip",
    );

    const approveHoleMutation = useMutation(api.flights.approveHole);

    // Transform the data to match our expected format
    const participantScores = flightParticipants.map((participant) => {
      const playerData = flightScoresData?.find(
        (ps) => ps.playerId === participant._id,
      );
      return {
        participant,
        scores: playerData?.scores || [],
      };
    });

    // Check if current user has scored current hole
    const userScoresData = participantScores.find(
      (ps) => ps.participant._id === userId,
    );

    // Get the last hole each player scored (by submission time, not hole number)
    // This handles wrap-around: e.g. player starts at hole 3, goes to 18, then fills hole 1 & 2
    const playerLastHoles = participantScores.map((ps) => {
      const sortedScores = [...(ps.scores || [])].sort(
        (a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0) // Most recently submitted first
      );
      return {
        participant: ps.participant,
        lastHole: sortedScores.length > 0 ? sortedScores[0].holeNumber : null,
      };
    });

    // Check if all players are on the same hole
    const userLastHole = playerLastHoles.find(p => p.participant._id === userId)?.lastHole;
    const allOnSameHole = playerLastHoles.every(p => p.lastHole === userLastHole);

    // Get players who are on different holes
    const playersOnDifferentHoles = playerLastHoles.filter(
      p => p.participant._id !== userId && p.lastHole !== userLastHole
    );

    const userHasScored = currentHole !== null && !!userScoresData?.scores?.some((s: any) => s.holeNumber === currentHole);
    const allPlayersScored = allOnSameHole && playerLastHoles.every(p => p.lastHole !== null);
    const waitingCount = playerLastHoles.filter(p => p.lastHole === null).length;

    // Check if current hole is approved
    const currentUserParticipant = flightParticipants.find(p => p._id === userId);
    const approvedHoles: number[] = currentUserParticipant?.approvedHoles || [];
    const isCurrentHoleApproved = currentHole !== null && approvedHoles.includes(currentHole);

    // Check if all holes are completed by current user
    const holesConfig = tournament.holesConfig || [];
    const allHolesCompleted =
      userScoresData?.scores?.length === holesConfig.length;

    // Check if there are any unapproved holes (if "Setujui & Lanjutkan" button is showing)
    const hasUnapprovedHoles = userHasScored && !isCurrentHoleApproved;

    // The most recently approved hole by the current user
    const userLastApprovedHole =
      approvedHoles.length > 0 ? Math.max(...approvedHoles) : null;

    // Players who have scored the same hole but not yet approved it
    const playersNotYetApproved = flightParticipants
      .filter(p => p._id !== userId)
      .filter(p => {
        if (userLastApprovedHole === null) return false;
        const theirScores =
          participantScores.find(ps => ps.participant._id === p._id)?.scores || [];
        const theirApprovedHoles: number[] = p.approvedHoles || [];
        const hasScored = theirScores.some((s: any) => s.holeNumber === userLastApprovedHole);
        const hasApproved = theirApprovedHoles.includes(userLastApprovedHole);
        // Block if they scored this hole but haven't approved yet
        return hasScored && !hasApproved;
      })
      .map(p => ({ name: p.name, hole: userLastApprovedHole as number }));

    return (
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-3 space-y-2">
        {/* Info Penting Scoring */}
        <div className="bg-gradient-to-br from-gray-800/30 to-black/40 border border-gray-700/50 border-l-[3px] border-l-yellow-400 rounded-lg p-3.5 mb-2">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-[20px] h-[20px] rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold font-serif mb-0.5 ml-0.5">i</span>
            </div>
            <span className="text-[#facc15] font-bold text-[15px] tracking-wide">Informasi Penting Scoring</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed text-left">
            Seluruh pemain wajib mengisi <span className="font-bold text-white">skor pada hole yang sama</span> sebelum lanjut. Jika ada <span className="font-bold text-white">kesalahan input</span> di hole berbeda, pemain harus hapus dan <span className="font-bold text-white">input ulang</span> ke hole yang sama.
          </p>
        </div>

        {userHasScored && !isCurrentHoleApproved ? (
          <>
            <button
              onClick={() => {
                if (currentHole !== null) {
                  navigate(
                    `/player/scoring/${tournamentId}?playerId=${userId}&hole=${currentHole}`,
                  );
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-base">Edit Score Hole {currentHole}</span>
            </button>
            <div className="relative w-full group">
              <button
                onClick={() => {
                  if (!allOnSameHole) {
                    // Show alert about hole mismatch
                    setShowHoleMismatchAlert(true);
                    setHoleMismatchDetails({
                      userHole: userLastHole || 0,
                      otherPlayers: playersOnDifferentHoles.map(p => ({
                        name: p.participant.name,
                        hole: p.lastHole || 0,
                      })),
                    });
                  } else if (allPlayersScored && userLastHole !== null) {
                    // All players on same hole — save approval globally via db
                    approveHoleMutation({
                      tournamentId: tournamentId,
                      playerId: userId,
                      holeNumber: userLastHole!,
                    });
                  }
                }}
                disabled={!allPlayersScored || waitingCount > 0}
                className={`w-full font-semibold py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${allPlayersScored && waitingCount === 0
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg cursor-pointer"
                  : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                  }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  {waitingCount > 0
                    ? `Menunggu ${waitingCount} pemain lainnya`
                    : allPlayersScored
                      ? "Setujui & Lanjutkan"
                      : "Menunggu pemain lain"}
                </span>
              </button>
              {/* Tooltip — only shown when button is disabled */}
              {(!allPlayersScored || waitingCount > 0) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-yellow-700/60 text-yellow-300 text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <span>⚠️ Pastikan hole yang terisi sama dengan pemain lain</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
                </div>
              )}
            </div>

            <button
              onClick={() => {
                // Trigger parent component to show disclaimer dialog
                const event = new CustomEvent('showDisclaimerDialog');
                window.dispatchEvent(event);
              }}
              className="w-full bg-transparent hover:bg-blue-900/10 text-blue-400 hover:text-blue-300 font-semibold py-3 px-4 rounded-lg border border-blue-500/30 hover:border-blue-400/60 transition-all flex items-center justify-center gap-2"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Petunjuk Pengisian Skor</span>
            </button>

          </>

        ) : (
          <>
            {/* Show Input Score button that opens a hole selector */}
            <button
              onClick={() => {
                // Guard: if there are players who haven't approved yet, block and show alert
                if (playersNotYetApproved.length > 0) {
                  setWaitingApprovalPlayers(playersNotYetApproved);
                  setShowWaitingApprovalAlert(true);
                  return;
                }

                if (currentHole !== null) {
                  navigate(
                    `/player/scoring/${tournamentId}?playerId=${userId}&hole=${currentHole}`,
                  );
                  return;
                }

                const holesConfig: any[] = tournament.holesConfig || [];

                const userScoresData = participantScores.find(
                  (ps) => ps.participant._id === userId,
                );

                const userScores: any[] = userScoresData?.scores || [];

                // Build a set of all scored hole numbers
                const scoredHoles = new Set(userScores.map((s: any) => s.holeNumber));

                // Sort holesConfig by holeNumber ascending (canonical order)
                const sortedHoles = [...holesConfig].sort(
                  (a, b) => a.holeNumber - b.holeNumber
                );

                let targetHole: any = null;

                if (userScores.length > 0) {
                  // Find the most recently submitted hole (by submittedAt timestamp)
                  const lastSubmittedScore = [...userScores].sort(
                    (a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)
                  )[0];
                  const lastSubmittedHoleNumber = lastSubmittedScore.holeNumber;

                  // Find the index of lastSubmittedHole in sortedHoles
                  const lastIndex = sortedHoles.findIndex(
                    (h) => h.holeNumber === lastSubmittedHoleNumber
                  );

                  // Search for the next UNSCORED hole AFTER the last submitted hole
                  for (let i = lastIndex + 1; i < sortedHoles.length; i++) {
                    if (!scoredHoles.has(sortedHoles[i].holeNumber)) {
                      targetHole = sortedHoles[i];
                      break;
                    }
                  }
                }

                // Fallback: first hole in config not yet scored (also handles wrap-around)
                if (!targetHole) {
                  targetHole = sortedHoles.find((h) => !scoredHoles.has(h.holeNumber));
                }

                // Last fallback: last hole in config
                if (!targetHole) {
                  targetHole = sortedHoles[sortedHoles.length - 1];
                }

                if (targetHole) {
                  navigate(
                    `/player/scoring/${tournamentId}?playerId=${userId}&hole=${targetHole.holeNumber}`,
                  );
                }
              }}
              className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
                playersNotYetApproved.length > 0
                  ? "bg-gray-800 text-gray-400 border border-gray-700"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-base">Input Skor</span>
            </button>

            {/* Information Button */}
            <button
              onClick={() => {
                // Trigger parent component to show disclaimer dialog
                const event = new CustomEvent('showDisclaimerDialog');
                window.dispatchEvent(event);
              }}
              className="w-full bg-transparent hover:bg-blue-900/10 text-blue-400 hover:text-blue-300 font-semibold py-3 px-4 rounded-lg border border-blue-500/30 hover:border-blue-400/60 transition-all flex items-center justify-center gap-2"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Petunjuk Pengisian Skor</span>
            </button>
          </>
        )}

        {allHolesCompleted && (
          <button
            onClick={handleFinishTournament}
            disabled={hasUnapprovedHoles}
            className={`w-full font-semibold py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 shadow-lg ${hasUnapprovedHoles
              ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 cursor-pointer"
              }`}
            title={
              hasUnapprovedHoles
                ? "Setujui hole terakhir terlebih dahulu sebelum menyelesaikan pertandingan"
                : "Selesaikan pertandingan"
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {hasUnapprovedHoles
                ? "Setujui hole terakhir dulu"
                : "Selesaikan Pertandingan"}
            </span>
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
  currentUserId?: Id<"users">;
  scoringMode: "stroke" | "over";
  setScoringMode: (mode: "stroke" | "over") => void;
  currentHole: number | null;
  setCurrentHole: (hole: number | null) => void;
  onHoleClick?: (holeNumber: number) => void;
  onShowWaitingApprovalAlert?: (players: any) => void;
  onShowPendingHoleAlert?: () => void;
}> = ({
  tournament,
  flightParticipants,
  holesConfig,
  currentUserId,
  scoringMode,
  setScoringMode,
  currentHole,
  onHoleClick,
  onShowWaitingApprovalAlert,
  onShowPendingHoleAlert,
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    // Keep the latest scroll position in memory so we can restore it after every re-render
    const savedScrollRef = React.useRef<number>(
      parseInt(sessionStorage.getItem(`scorecardScroll_${tournament._id}`) || '0', 10)
    );

    // Restore scroll after EVERY render (layout effect runs synchronously after DOM mutations)
    // This prevents Convex data updates from silently resetting scrollLeft to 0
    React.useLayoutEffect(() => {
      if (scrollContainerRef.current && savedScrollRef.current > 0) {
        scrollContainerRef.current.scrollLeft = savedScrollRef.current;
      }
    });

    // On initial mount (e.g. returning from ModernScoringInterface), the browser may not have
    // computed the table's full scroll width yet inside useLayoutEffect.
    // A deferred restore ensures scrollLeft actually sticks after the browser finishes layout.
    React.useEffect(() => {
      if (savedScrollRef.current > 0) {
        const el = scrollContainerRef.current;
        if (el) {
          // Immediate attempt (table is likely already wide)
          el.scrollLeft = savedScrollRef.current;
          // Deferred attempt as safety net in case layout wasn't ready
          const raf = requestAnimationFrame(() => {
            el.scrollLeft = savedScrollRef.current;
          });
          return () => cancelAnimationFrame(raf);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const newScroll = e.currentTarget.scrollLeft;
      savedScrollRef.current = newScroll;
      sessionStorage.setItem(
        `scorecardScroll_${tournament._id}`,
        newScroll.toString()
      );
    };

    // Save scroll position explicitly right before navigating away from this page.
    // This is critical because onScroll only fires during scrolling — not on click-to-navigate.
    // Without this, the saved value in sessionStorage may be stale (or 0) when the component remounts.
    const saveScrollBeforeLeave = () => {
      if (scrollContainerRef.current) {
        const current = scrollContainerRef.current.scrollLeft;
        savedScrollRef.current = current;
        sessionStorage.setItem(`scorecardScroll_${tournament._id}`, current.toString());
      }
    };

    // Fetch scores for ALL participants sekaligus — tidak pakai hook di dalam .map()
    const flightScoresData = useQuery(
      api.scores.getFlightScores,
      flightParticipants.length > 0
        ? {
          tournamentId: tournament._id,
          playerIds: flightParticipants.map((p) => p._id),
        }
        : "skip",
    );

    const participantScores = flightParticipants.map((participant) => {
      const playerData = flightScoresData?.find(
        (ps) => ps.playerId === participant._id,
      );
      return { participant, scores: playerData?.scores || [] };
    });

    const totalPar = holesConfig.reduce((sum, hole) => sum + hole.par, 0);

    // Check if current user is waiting for approval on currentHole
    const currentUserParticipant = flightParticipants.find((p: any) => p._id === currentUserId);
    const currentUserScoresData = participantScores.find((ps: any) => ps.participant._id === currentUserId);
    const userApprovedHoles: number[] = currentUserParticipant?.approvedHoles || [];

    const isWaitingForApproval = currentHole !== null &&
      !!currentUserScoresData?.scores?.some((s: any) => s.holeNumber === currentHole) &&
      !userApprovedHoles.includes(currentHole);

    // Compute playersNotYetApproved for navigating to new unscored holes
    const userLastApprovedHole = userApprovedHoles.length > 0 ? Math.max(...userApprovedHoles) : null;
    const playersNotYetApproved = flightParticipants
      .filter((p: any) => p._id !== currentUserId)
      .filter((p: any) => {
        if (userLastApprovedHole === null) return false;
        const theirScores =
          participantScores.find((ps: any) => ps.participant._id === p._id)?.scores || [];
        const theirApprovedHoles: number[] = p.approvedHoles || [];
        const hasScored = theirScores.some((s: any) => s.holeNumber === userLastApprovedHole);
        const hasApproved = theirApprovedHoles.includes(userLastApprovedHole);
        return hasScored && !hasApproved;
      })
      .map((p: any) => ({ name: p.name, hole: userLastApprovedHole as number }));

    return (
      <div className="space-y-3">
        {/* Scoring Mode Toggle */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-semibold text-sm">
              Sistem Penilaian:
            </span>
            <div className="flex space-x-1.5 bg-gray-900/50 rounded-lg p-0.5">
              <button
                onClick={() => setScoringMode("stroke")}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${scoringMode === "stroke"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Stroke
              </button>
              <button
                onClick={() => setScoringMode("over")}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${scoringMode === "over"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Over
              </button>
            </div>
          </div>
        </div>

        {/* Legend - Above Table */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 p-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-nowrap items-center justify-center gap-2 text-[10px] overflow-x-auto">
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-[#fbbf24] ring-1 ring-amber-500"></div>
                <span className="text-gray-300 font-medium">Eagle</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-[#22c55e] ring-1 ring-green-600"></div>
                <span className="text-gray-300 font-medium">Birdie</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-white"></div>
                <span className="text-gray-300 font-medium">Par</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-[#DE1A58]"></div>
                <span className="text-gray-300 font-medium">Bogey</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-[#CF0F0F]"></div>
                <span className="text-gray-300 font-medium">Double+</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-gray-400">
                {currentHole !== null ? (
                  <>
                    Hole terakhir Anda:{" "}
                    <span className="text-red-500 font-bold">#{currentHole}</span>
                  </>
                ) : (
                  <span className="text-blue-400">Klik nomor hole untuk mulai</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Scorecard Table */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 overflow-hidden shadow-xl">
          <div
            className="overflow-x-auto"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <table className="w-full text-xs">
              <thead>
                {/* Header Row 1 - Hole Numbers */}
                <tr className="border-b border-gray-800 bg-gradient-to-r from-red-900/20 to-red-800/10">
                  <th className="sticky left-0 z-20 bg-gradient-to-r from-[#2e2e2e] to-gray-900 text-left text-white font-bold py-2 px-2 border-r border-gray-800 min-w-[110px]">
                    Pemain
                  </th>
                  {holesConfig.map((hole) => {
                    // Check if current user has scored this hole
                    const userScoresData = participantScores.find(
                      (ps) => ps.participant._id === currentUserId,
                    );
                    const userHasScoredThisHole = userScoresData?.scores?.some(
                      (s) => s.holeNumber === hole.holeNumber
                    );

                    // Check if this hole is approved
                    const currentUserParticipant = flightParticipants.find(p => p._id === currentUserId);
                    const approvedHoles: number[] = currentUserParticipant?.approvedHoles || [];
                    const isApproved = approvedHoles.includes(hole.holeNumber);

                    return (
                      <th
                        key={hole.holeNumber}
                        onClick={() => {
                          // Prevent clicking other holes if waiting for approval on current hole
                          if (isWaitingForApproval && hole.holeNumber !== currentHole) {
                            if (onShowPendingHoleAlert) {
                              onShowPendingHoleAlert();
                            } else {
                              alert("Selesaikan persetujuan hole saat ini terlebih dahulu sebelum mengisi hole lain.");
                            }
                            return;
                          }

                          // If it's a new hole to score, check playersNotYetApproved
                          if (!userHasScoredThisHole && playersNotYetApproved.length > 0) {
                            onShowWaitingApprovalAlert?.(playersNotYetApproved);
                            return;
                          }

                          // Only allow clicking if user hasn't scored this hole yet OR hole is not approved
                          if ((!userHasScoredThisHole || !isApproved) && onHoleClick) {
                            // Save scroll BEFORE navigating away so it can be restored on return
                            saveScrollBeforeLeave();
                            onHoleClick(hole.holeNumber);
                          }
                        }}
                        className={`text-center text-white font-bold text-[14px] py-2 px-1.5 min-w-[32px] ${hole.holeNumber === currentHole
                          ? "bg-red-600/30 ring-2 ring-red-500"
                          : ""
                          } ${isApproved
                            ? "bg-green-900/30 cursor-not-allowed opacity-60"
                            : isWaitingForApproval && hole.holeNumber !== currentHole
                              ? "cursor-not-allowed opacity-50"
                              : !userHasScoredThisHole && onHoleClick
                                ? "cursor-pointer hover:bg-red-600/20 transition-colors"
                                : userHasScoredThisHole && !isApproved
                                  ? "cursor-pointer hover:bg-blue-600/20 transition-colors"
                                  : ""
                          }`}
                        title={
                          isApproved
                            ? "Skor sudah disetujui (locked)"
                            : isWaitingForApproval && hole.holeNumber !== currentHole
                              ? "Menunggu persetujuan hole saat ini"
                              : userHasScoredThisHole
                                ? "Klik untuk edit skor"
                                : "Klik untuk input skor"
                        }
                      >
                        {hole.holeNumber}
                        {isApproved && (
                          <svg
                            className="w-3 h-3 inline-block ml-0.5 text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </th>
                    );
                  })}
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
                    <td
                      key={hole.holeNumber}
                      className="text-center text-gray-300 font-semibold text-[14px] py-1.5 px-1.5"
                    >
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
                      (scores || []).map((score) => [score.holeNumber, score]),
                    );

                    const totalStrokes = (scores || []).reduce(
                      (sum, score) => sum + score.strokes,
                      0,
                    );
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
                      isCurrentUser,
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
                  .map(
                    (
                      {
                        participant,
                        scoresMap,
                        totalStrokes,
                        scoreToPar,
                        isCurrentUser,
                      },
                      index,
                    ) => {
                      return (
                        <tr
                          key={participant._id}
                          className={`border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${isCurrentUser ? "bg-red-900/10" : ""
                            }`}
                        >
                          {/* Player Name with Number */}
                          <td
                            className={`sticky left-0 z-20 ${isCurrentUser
                              ? "bg-red-900"
                              : "bg-gradient-to-r from-[#2e2e2e] to-gray-900"
                              } py-2 px-2 border-r border-gray-800`}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-6 h-6 rounded-full ${isCurrentUser
                                  ? "bg-gradient-to-br from-red-600 to-red-700"
                                  : "bg-gradient-to-br from-gray-700 to-gray-800"
                                  } flex items-center justify-center flex-shrink-0`}
                              >
                                <span className="text-white font-bold text-[10px]">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-semibold text-xs truncate">
                                  {participant.name}

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

                            let bgColor = "bg-gray-800/50";
                            let textColor = "text-gray-500";
                            let borderColor = "";
                            let displayValue = "-";

                            if (strokes) {
                              const diff = strokes - par;

                              // Display value based on mode
                              if (scoringMode === "over") {
                                if (diff === 0) {
                                  displayValue = "0";
                                } else if (diff > 0) {
                                  displayValue = `+${diff}`;
                                } else {
                                  displayValue = `${diff}`;
                                }
                              } else {
                                displayValue = strokes.toString();
                              }

                              // Color coding
                              if (strokes <= par - 2) {
                                // Eagle or better
                                bgColor = "bg-[#fbbf24]";
                                textColor = "text-black";
                                borderColor = "ring-1 ring-amber-500";
                              } else if (strokes === par - 1) {
                                // Birdie
                                bgColor = "bg-[#22c55e]";
                                textColor = "text-black";
                                borderColor = "ring-1 ring-green-600";
                              } else if (strokes === par) {
                                // Par
                                bgColor = "bg-white";
                                textColor = "text-black";
                              } else if (strokes === par + 1) {
                                // Bogey
                                bgColor = "bg-[#DE1A58]";
                                textColor = "text-white";
                              } else if (strokes >= par + 2) {
                                // Double Bogey+
                                bgColor = "bg-[#CF0F0F]";
                                textColor = "text-white";
                              }
                            }

                            return (
                              <td
                                key={hole.holeNumber}
                                className={`text-center py-2 px-1.5 ${isCurrentHole ? "bg-red-600/10" : ""
                                  }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full ${bgColor} ${textColor} ${borderColor} flex items-center justify-center mx-auto font-bold text-[16px]`}
                                >
                                  {displayValue}
                                </div>
                              </td>
                            );
                          })}

                          {/* Total */}
                          <td className="text-center py-2 px-2 border-l-2 border-red-600">
                            <div className="text-white font-bold text-sm">
                              {totalStrokes || 0}
                            </div>
                          </td>

                          {/* Score to Par */}
                          <td className="text-center py-2 px-2 border-l border-gray-800">
                            <div
                              className={`font-bold text-sm ${scoreToPar > 0
                                ? "text-red-400"
                                : scoreToPar < 0
                                  ? "text-green-400"
                                  : "text-gray-400"
                                }`}
                            >
                              {scoreToPar > 0
                                ? `+${scoreToPar}`
                                : scoreToPar === 0
                                  ? "0"
                                  : scoreToPar}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

// Leaderboard View Component - Shows ALL participants from ALL flights in tournament
const LeaderboardView: React.FC<{
  tournament: any;
  flightParticipants: any[];
  holesConfig: any[];
}> = ({ tournament, holesConfig }) => {
  // Fetch ALL flights with participants for this tournament
  const allFlights = useQuery(
    api.flights.getTournamentFlightsWithParticipants,
    tournament ? { tournamentId: tournament._id } : "skip",
  );

  // Collect all participants from all flights
  const allParticipants = React.useMemo(() => {
    if (!allFlights) return [];

    const participants: any[] = [];
    allFlights.forEach((flight) => {
      if (flight.participants) {
        flight.participants.forEach((participant) => {
          // Add flight info to participant
          participants.push({
            ...participant,
            flightName: flight.flightName,
            flightNumber: flight.flightNumber,
          });
        });
      }
    });

    return participants;
  }, [allFlights]);

  // Fetch scores untuk semua participant sekaligus — tidak pakai hook di dalam .map()
  const allParticipantIds = React.useMemo(
    () => allParticipants.map((p) => p._id),
    [allParticipants],
  );

  const allFlightScoresData = useQuery(
    api.scores.getFlightScores,
    allParticipantIds.length > 0
      ? { tournamentId: tournament._id, playerIds: allParticipantIds }
      : "skip",
  );

  const participantScores = allParticipants.map((participant) => {
    const playerData = allFlightScoresData?.find(
      (ps) => ps.playerId === participant._id,
    );
    return { participant, scores: playerData?.scores || [] };
  });

  // Calculate standings
  const participantsWithScores = participantScores.map(
    ({ participant, scores }) => {
      const totalStrokes = (scores || []).reduce(
        (sum, score) => sum + score.strokes,
        0,
      );
      const totalPar = holesConfig.reduce((sum, hole) => sum + hole.par, 0);
      const holesPlayed = (scores || []).length;

      // Calculate scoreToPar only if player has played at least one hole
      const scoreToPar = holesPlayed > 0 ? totalStrokes - totalPar : 0;

      return {
        ...participant,
        totalStrokes,
        scoreToPar,
        holesPlayed,
      };
    },
  );

  // Sort by name alphabetically (A-Z)
  const sortedParticipants = [...participantsWithScores].sort((a, b) => {
    return a.name.localeCompare(b.name, "id", { sensitivity: "base" });
  });

  const totalHoles = holesConfig.length;

  const [scrollTop, setScrollTop] = React.useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-lg border border-gray-800 overflow-hidden shadow-xl">
      {/* Table Container with virtualized scrollable content */}
      <div 
        className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 relative"
        onScroll={handleScroll}
      >
        <table className="w-full text-xs min-w-[340px]">
          <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b-2 border-gray-700 z-10 shadow-sm">
            <tr>
              <th className="text-left text-gray-300 font-semibold py-2 px-3 min-w-[140px]">
                Nama Pemain
              </th>
              <th className="text-center text-gray-300 font-semibold py-2 px-2 min-w-[60px]">
                Total
                <br />
                Stroke
              </th>
              <th className="text-center text-gray-300 font-semibold py-2 px-2 min-w-[60px]">
                Over/
                <br />
                Under
              </th>
              <th className="text-center text-gray-300 font-semibold py-2 px-2 min-w-[70px]">
                Hole
                <br />
                Selesai
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(() => {
              const ITEM_HEIGHT = 65; // estimated standard row height for leaderboard
              const CONTAINER_HEIGHT = 600; // max-height of our container
              const OVERSCAN = 10; // how many extra rows to render above and below view for buffer

              const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
              const endIndex = Math.min(sortedParticipants.length - 1, Math.floor((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN);
              
              const paddingTop = Math.max(0, startIndex * ITEM_HEIGHT);
              const paddingBottom = Math.max(0, (sortedParticipants.length - 1 - endIndex) * ITEM_HEIGHT);
              
              const visibleItems = sortedParticipants.slice(startIndex, endIndex + 1);

              return (
                <>
                  {paddingTop > 0 && (
                    <tr style={{ height: `${paddingTop}px` }}>
                      <td colSpan={4} aria-hidden="true" />
                    </tr>
                  )}
                  {visibleItems.map((participant) => (
                    <tr
                      key={participant._id}
                      className="hover:bg-gray-900/50 transition-colors"
                      style={{ height: `${ITEM_HEIGHT}px` }}
                    >
                      {/* Player Name */}
                      <td className="py-3 px-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate">
                        {participant.name}
                      </div>
                      <div className="text-gray-400 text-[10px] flex items-center gap-1">
                        <span className="text-blue-400">
                          {participant.flightName}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Total Strokes */}
                <td className="text-center py-3 px-2">
                  <div
                    className={`font-bold text-lg ${participant.holesPlayed === 0
                      ? "text-gray-500"
                      : "text-white"
                      }`}
                  >
                    {participant.holesPlayed === 0
                      ? "-"
                      : participant.totalStrokes}
                  </div>
                </td>

                {/* Score to Par (Over/Under) */}
                <td className="text-center py-3 px-2">
                  {participant.holesPlayed === 0 ? (
                    <div className="text-gray-500 font-bold text-base">-</div>
                  ) : (
                    <div
                      className={`font-bold text-base ${participant.scoreToPar > 0
                        ? "text-red-400"
                        : participant.scoreToPar < 0
                          ? "text-green-400"
                          : "text-gray-400"
                        }`}
                    >
                      {participant.scoreToPar > 0
                        ? `+${participant.scoreToPar}`
                        : participant.scoreToPar === 0
                          ? "E"
                          : participant.scoreToPar}
                    </div>
                  )}
                </td>

                {/* Holes Completed */}
                <td className="text-center py-3 px-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`font-bold text-base ${participant.holesPlayed === 0
                        ? "text-gray-500"
                        : "text-white"
                        }`}
                    >
                      {participant.holesPlayed}/{totalHoles}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full max-w-[50px] h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${participant.holesPlayed === 0
                          ? "bg-gray-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                        style={{
                          width: `${participant.holesPlayed === 0 ? 0 : (participant.holesPlayed / totalHoles) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          {paddingBottom > 0 && (
            <tr style={{ height: `${paddingBottom}px` }}>
              <td colSpan={4} aria-hidden="true" />
            </tr>
          )}
        </>
      );
    })()}
  </tbody>
</table>
</div>

      {/* Summary Footer */}
      <div className="bg-gray-900/50 border-t-2 border-gray-700 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Total Peserta:</span>
          <span className="text-white font-bold">
            {sortedParticipants.length} pemain dari {allFlights?.length || 0}{" "}
            flight
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlightScoringOverview;
