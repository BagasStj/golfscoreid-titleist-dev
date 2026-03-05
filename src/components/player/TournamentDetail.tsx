import { useQuery } from "convex/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Calendar,
  MapPin,
  Target,
  Users,
  ChevronLeft,
  UserPlus,
} from "lucide-react";
import { statusConfig } from "@/lib/utils";

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // Check if user came from home/beranda (TournamentList)
  const isFromHome = location.state?.fromHome === true;
  // Check if user came from My Tournaments
  const isFromMyTournaments = location.state?.fromMyTournaments === true;

  // Redirect if no id or user
  useEffect(() => {
    if (!id || !user) {
      navigate("/player");
    }
  }, [id, user, navigate]);

  const tournamentDetails = useQuery(
    api.tournaments.getTournamentDetails,
    id && user
      ? {
          tournamentId: id as Id<"tournaments">,
          userId: user._id,
        }
      : "skip",
  );

  // Fetch tournament participants to check if user is registered
  const participants = useQuery(
    api.tournaments.getTournamentParticipants,
    id ? { tournamentId: id as Id<"tournaments"> } : "skip",
  );

  // Check if user is registered - participants returns player objects with _id being the player's user ID
  const isRegistered = useMemo(() => {
    if (!participants || !user) {
      return false;
    }

    const registered = participants.some((p) => p._id === user._id);
    return registered;
  }, [participants, user]);

  // Fetch player scores only if user is registered
  const playerScores = useQuery(
    api.scores.getPlayerScores,
    id && user && isRegistered
      ? {
          tournamentId: id as Id<"tournaments">,
          playerId: user._id as Id<"users">,
        }
      : "skip",
  );

  // Fetch player's flight info if registered
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    id && user && isRegistered
      ? {
          tournamentId: id as Id<"tournaments">,
          playerId: user._id as Id<"users">,
        }
      : "skip",
  );

  // Debug logging
  useEffect(() => {
    console.log("🔍 Desktop Tournament Detail - Registration Check:", {
      tournamentId: id,
      tournamentName: tournamentDetails?.name,
      tournamentStatus: tournamentDetails?.status,
      userId: user?._id,
      userName: user?.name,
      participantCount: participants?.length,
      participantIds: participants?.map((p) => ({ id: p._id, name: p.name })),
      isRegistered,
      showButtons:
        isRegistered &&
        (tournamentDetails?.status === "active" ||
          tournamentDetails?.status === "completed"),
    });
  }, [id, tournamentDetails, user, participants, isRegistered]);

  if (!id || !user) {
    return null;
  }

  // const tournamentId = id;

  // Show loading only if tournament details is still loading
  // Don't wait for playerScores if user is not registered
  if (tournamentDetails === undefined || participants === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading tournament...</p>
        </div>
      </div>
    );
  }

  // Only wait for playerScores if user is registered
  if (isRegistered && playerScores === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading your scores...</p>
        </div>
      </div>
    );
  }

  const tournament = tournamentDetails;
  const holesConfig = tournament.holesConfig;
  const totalHoles = holesConfig.length;
  // const holesCompleted = playerScores?.length || 0;

  // Calculate total score - only if playerScores exists
  // const totalStrokes =
  //   playerScores?.reduce((sum, score) => sum + score.strokes, 0) || 0;
  // const totalPar =
  //   playerScores?.reduce((sum, score) => {
  //     const hole = holesConfig.find((h) => h.holeNumber === score.holeNumber);
  //     return sum + (hole?.par || 0);
  //   }, 0) || 0;

  const tournamentDate = new Date(tournament.date);

  // Determine if tournament is upcoming, active, or completed
  const isUpcoming = tournament.status === "upcoming";
  const isActive = tournament.status === "active";
  const st = statusConfig(tournament.status);

  // Handle Join Tournament button click
  const handleJoinTournament = () => {
    if (!isRegistered) {
      // Show alert dialog if user is not registered
      setShowAlertDialog(true);
    }
  };

  // Handle back button - go to appropriate page based on where user came from
  const handleBack = () => {
    // Always navigate to the correct page explicitly, not using browser history
    if (isFromHome) {
      // If came from home/beranda, go back to home tab
      navigate("/player?tab=home");
    } else if (isFromMyTournaments) {
      // If came from my tournaments, go to my tournaments tab
      navigate("/player?tab=my-tournaments");
    } else if (isRegistered) {
      // If user is registered (default fallback), go to my tournaments tab
      navigate("/player?tab=my-tournaments");
    } else {
      // Default: go to home
      navigate("/player?tab=home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black">
      <div className="container mx-auto px-3 py-3 max-w-6xl">
        {/* ── top bar ── */}
        <div className="space-y-2">
          {/* row 1: back + status */}
          <div className="flex items-center justify-between gap-3">
            {/* back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white transition-colors active:scale-95 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {isFromHome 
                  ? "Kembali ke Beranda" 
                  : isFromMyTournaments 
                    ? "Kembali ke Tournament Saya"
                    : isRegistered 
                      ? "Kembali ke Tournament Saya" 
                      : "Kembali"}
              </span>
            </button>

            {/* status pill */}
            <div
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold"
              style={{
                background: st.bg,
                borderColor: st.border,
                color: st.text,
              }}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "animate-pulse" : ""}`}
                style={{ background: st.dot }}
              />
              {st.label}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-4">
          <div className="flex-1 mb-2"></div>

          <div
            className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 p-4"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <h1 className="text-xl font-bold text-white">{tournament.name}</h1>
            <p className="text-gray-400 text-base mt-0.5">
              {tournament.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column - Tournament Info & Progress */}
          <div className="lg:col-span-2 space-y-3">
            {/* Tournament Info Card */}
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span className="text-base font-medium text-white">
                      {tournamentDate.toLocaleDateString("id-ID", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {/* <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tournament.status)} text-white shadow-lg`}>
                    {getStatusText(tournament.status)}
                  </span> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-gray-800">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div style={{ textAlign: "left" }}>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-semibold text-white">
                        {tournament.location}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="flex items-start gap-2">
                      <Target className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Course Type</p>
                        <p className="text-sm font-semibold text-white">
                          {tournament.courseType}
                        </p>
                      </div>
                    </div>
                    {/* <div className="flex items-start gap-2">
                      <Flag className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Game Mode</p>
                        <p className="text-sm font-semibold text-white">
                          {tournament.gameMode === 'strokePlay'
                            ? 'Stroke Play'
                            : tournament.gameMode === 'stableford'
                              ? 'Stableford'
                              : 'System 36'}
                        </p>
                      </div>
                    </div> */}
                    {/* <div className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">Start Hole</p>
                        <p className="text-sm font-semibold text-white">Hole {tournament.startHole}</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card - Only show if registered and tournament is active */}
            {/* {isRegistered && isActive && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">
                      Your Progress
                    </h3>
                    <span className="text-2xl font-bold text-red-500">
                      {holesCompleted}/{totalHoles}
                    </span>
                  </div>

                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {holesCompleted > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Total Strokes
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {totalStrokes}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Score to Par
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            scoreToPar < 0
                              ? "text-green-500"
                              : scoreToPar > 0
                                ? "text-red-500"
                                : "text-white"
                          }`}
                        >
                          {scoreToPar > 0 ? "+" : ""}
                          {scoreToPar}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Holes Left
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {totalHoles - holesCompleted}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {/* Recent Holes - Only show if registered, active, and has scores */}
            {/* {isRegistered && isActive && holesCompleted > 0 && playerScores && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <h3 className="text-base font-bold text-white mb-2">
                  Recent Holes
                </h3>
                <div className="space-y-2">
                  {playerScores
                    .slice(-5)
                    .reverse()
                    .map((score) => {
                      const hole = holesConfig.find(
                        (h) => h.holeNumber === score.holeNumber,
                      );
                      const scoreToPar = score.strokes - (hole?.par || 0);

                      return (
                        <div
                          key={score._id}
                          className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg flex items-center justify-center font-bold text-base shadow-lg">
                              {score.holeNumber}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Hole {score.holeNumber}
                              </p>
                              <p className="text-xs text-gray-400">
                                Par {hole?.par}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">
                              {score.strokes}
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                scoreToPar < 0
                                  ? "text-green-500"
                                  : scoreToPar > 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                              }`}
                            >
                              {scoreToPar > 0 ? "+" : ""}
                              {scoreToPar}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )} */}

            {/* Upcoming Tournament Message */}
            {isUpcoming && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-6 border border-gray-800 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Tournament Belum Dimulai
                </h3>
                <p className="text-gray-400">
                  Tournament ini akan dimulai pada tanggal yang telah
                  ditentukan. Silakan kembali lagi nanti.
                </p>
              </div>
            )}

            {/* Completed Tournament Summary - Only show if registered */}
            {/* {isRegistered && isCompleted && holesCompleted > 0 && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <h3 className="text-base font-bold text-white mb-2">
                  Final Score
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">
                      Total Strokes
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {totalStrokes}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Score to Par</p>
                    <p
                      className={`text-2xl font-bold ${
                        scoreToPar < 0
                          ? "text-green-500"
                          : scoreToPar > 0
                            ? "text-red-500"
                            : "text-white"
                      }`}
                    >
                      {scoreToPar > 0 ? "+" : ""}
                      {scoreToPar}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Holes Played</p>
                    <p className="text-2xl font-bold text-white">
                      {holesCompleted}/{totalHoles}
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Right Column - Action Buttons */}
          <div className="space-y-2">
            {/* Join Tournament Button - Only show if from home and not registered */}
            {isFromHome && !isRegistered && (
              <button
                onClick={handleJoinTournament}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-base">Join Tournament</span>
              </button>
            )}

            {/* Show Start Scoring button only for registered users in active tournaments */}
            {/* {isRegistered && isActive && (
              <button
                onClick={() =>
                  navigate(`/player/flight-scoring/${tournamentId}`)
                }
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span className="text-base">Start Scoring</span>
              </button>
            )} */}

            {/* Show Table Scoring button only for registered users in completed tournaments */}
            {/* {isRegistered && isCompleted && (
              <button
                onClick={() =>
                  navigate(`/player/flight-scoring/${tournamentId}`)
                }
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Table className="w-5 h-5" />
                <span className="text-base">Table Scoring</span>
              </button>
            )} */}

            {/* Show View Scorecard button only for registered users in active and completed tournaments */}
            {/* {isRegistered && !isUpcoming && (
              <button
                onClick={() =>
                  navigate(`/player/tournament/${tournamentId}/scorecard`)
                }
                className="w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black hover:from-gray-800 hover:via-[#171718] hover:to-black text-white font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-base">View Scorecard</span>
              </button>
            )} */}

            {/* Show Leaderboard button only for registered users in active and completed tournaments */}
            {/* {isRegistered && !isUpcoming && (
              <button
                onClick={() =>
                  navigate(`/player/tournament/${tournamentId}/leaderboard`)
                }
                className="w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black hover:from-gray-800 hover:via-[#171718] hover:to-black text-white font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span className="text-base">Leaderboard</span>
              </button>
            )} */}

            {/* Quick Info */}
            <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
              <h3 className="text-base font-bold text-white mb-2">
                Tournament Info
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Scoring Display</span>
                  <span className="text-white font-semibold capitalize">
                    {tournament.scoringDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-400">Total Holes</span>
                  <span className="text-white font-semibold">{totalHoles}</span>
                </div>
              </div>
            </div>

            {/* Your Flight Info - Only show if registered */}
            {isRegistered && playerFlight && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Your Flight Information
                </h3>

                <div className="space-y-3">
                  {/* Flight Header */}
                  <div className="bg-gradient-to-r from-blue-900/40 to-blue-950/40 rounded-xl p-3 border border-blue-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white font-bold text-base">
                          {playerFlight.flightName}
                        </h4>
                        <p className="text-blue-400 text-sm font-semibold">
                          Flight #{playerFlight.flightNumber}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {playerFlight.flightNumber}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {playerFlight.startTime && (
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500">Start Time</p>
                            <p className="font-semibold">
                              {playerFlight.startTime}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* <div className="flex items-center text-gray-300">
                        <Flag className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Start Hole</p>
                          <p className="font-semibold">Hole {playerFlight.startHole}</p>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Flight Members */}
                  <div>
                    <h5 className="text-gray-400 text-sm font-semibold mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-1.5" />
                      Flight Members ({playerFlight.members?.length || 0})
                    </h5>
                    <div className="space-y-2">
                      {playerFlight.members &&
                      playerFlight.members.length > 0 ? (
                        playerFlight.members.map((member: any) => (
                          <div
                            key={member._id}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                              member._id === user?._id
                                ? "bg-blue-900/40 border-2 border-blue-700/60 shadow-lg"
                                : "bg-gray-900/40 border border-gray-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                                  member._id === user?._id
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700"
                                    : "bg-gradient-to-br from-gray-600 to-gray-700"
                                }`}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white text-sm font-bold flex items-center gap-2">
                                  {member.name}
                                  {member._id === user?._id && (
                                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  Handicap: {member.handicap || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Start</p>
                              <p className="text-white text-base font-bold">
                                H{member.startHole}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                          <p className="text-gray-500 text-sm">
                            No members yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Flight Assigned Message */}
            {isRegistered && playerFlight === null && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <div className="text-center py-4">
                  <svg
                    className="w-12 h-12 text-gray-600 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h4 className="text-white font-semibold mb-1">
                    No Flight Assigned
                  </h4>
                  <p className="text-gray-400 text-sm">
                    You haven't been assigned to a flight yet
                  </p>
                </div>
              </div>
            )}

            {/* Tournament Schedule */}
            {/* {tournament.schedule && (
              <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-3 border border-gray-800">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-500" />
                  Susunan Acara
                </h3>
                <div className="space-y-2">
                  {tournament.schedule
                    .split("\n")
                    .filter((line: string) => line.trim())
                    .map((line: string, index: number) => {
                      const parts = line.split(" - ");
                      const time = parts[0] || `${7 + index}:00`;
                      const activity = parts[1] || line;
                      const description = parts[2] || "";

                      return (
                        <div
                          key={index}
                          className="relative bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-red-500 text-xs font-bold mb-1">
                                {time}
                              </div>
                              <div className="text-white font-semibold text-sm mb-0.5">
                                {activity}
                              </div>
                              {description && (
                                <div className="text-gray-400 text-xs leading-relaxed">
                                  {description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      {showAlertDialog && (
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
                Belum Terdaftar
              </h3>

              {/* Message */}
              <p className="text-gray-400 text-sm leading-relaxed">
                Mohon maaf, saat ini Anda belum terdaftar sebagai peserta pada turnamen ini.
              </p>

              {/* Button */}
              <button
                onClick={() => {
                  setShowAlertDialog(false);
                  navigate("/player");
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
