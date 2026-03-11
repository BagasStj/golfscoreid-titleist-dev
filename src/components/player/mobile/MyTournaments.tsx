import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../../contexts/AuthContext";
import { Calendar, MapPin, Target, Users, Play, Trophy } from "lucide-react";
import { statusConfig } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

const MyTournaments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch player data to check paidStatus
  const playerData = useQuery(
    api.users.getPlayerById,
    user ? { playerId: user._id } : "skip",
  );

  // Fetch player's tournaments (tournaments where player is registered)
  const myTournaments = useQuery(
    api.tournaments.getTournaments,
    user ? { userId: user._id } : "skip",
  );

  // Fetch all active tournaments if player is accepted
  const allActiveTournaments = useQuery(
    api.tournaments.getAllActiveTournaments,
    playerData?.paidStatus === "paid" ? {} : "skip",
  );

  // Loading state
  if (!myTournaments || !playerData) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Memuat turnamen...</p>
        </div>
      </div>
    );
  }

  // If player is not accepted, show nothing
  if (playerData.paidStatus !== "paid") {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800/60">
            <Trophy className="w-10 h-10 text-gray-600" />
          </div>
          <div className="text-gray-400 text-lg font-semibold">
            Belum ada turnamen
          </div>
        </div>
      </div>
    );
  }

  // Player is accepted, show all active tournaments
  let tournamentsToShow = [];
  
  if (allActiveTournaments) {
    // Merge registered tournaments with all active tournaments (avoid duplicates)
    const registeredIds = new Set(myTournaments.map(t => t._id));
    const additionalTournaments = allActiveTournaments.filter(
      t => !registeredIds.has(t._id)
    );
    tournamentsToShow = [...myTournaments, ...additionalTournaments];
  } else {
    tournamentsToShow = myTournaments;
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Tournament List */}
      {tournamentsToShow.map((tournament) => {
        // Check if player is registered in this tournament
        const isRegistered = myTournaments.some(t => t._id === tournament._id);
        
        return (
          <TournamentCard
            key={tournament._id}
            tournament={tournament}
            userId={user?._id}
            navigate={navigate}
            isRegistered={isRegistered}
          />
        );
      })}

      {tournamentsToShow.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800/60">
            <Trophy className="w-10 h-10 text-gray-600" />
          </div>
          <div className="text-gray-400 text-lg font-semibold">
            Belum ada turnamen
          </div>
         
        </div>
      )}
    </div>
  );
};

// Separate component for each tournament card
const TournamentCard: React.FC<{
  tournament: any;
  userId?: Id<"users">;
  navigate: any;
  isRegistered: boolean;
}> = ({ tournament, userId, navigate, isRegistered }) => {
  // Fetch tournament details including holesConfig
  const tournamentDetails = useQuery(api.tournaments.getTournamentDetails, {
    tournamentId: tournament._id,
    userId,
  });

  // Fetch player scores
  const playerScores = useQuery(
    api.scores.getPlayerScores,
    userId
      ? {
          tournamentId: tournament._id,
          playerId: userId,
        }
      : "skip",
  );

  // Fetch player's flight info (only if registered)
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    userId && isRegistered
      ? {
          tournamentId: tournament._id,
          playerId: userId,
        }
      : "skip",
  );

  // Fetch all flights in tournament (only if registered and has flight)
  const allFlights = useQuery(
    api.flights.getTournamentFlightsWithParticipants,
    isRegistered && playerFlight ? { tournamentId: tournament._id } : "skip",
  );

  if (!tournamentDetails) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl p-4 border border-gray-800">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const tournamentDate = new Date(tournament.date);
  const st = statusConfig(tournament.status);
  const holesConfig = tournamentDetails.holesConfig || [];
  const totalPar = holesConfig.reduce((sum, hole) => sum + (hole.par || 0), 0);
  const holesCompleted = playerScores?.length || 0;
  const hasStartedScoring = holesCompleted > 0;

  // Check if tournament date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tournamentDateOnly = new Date(tournament.date);
  tournamentDateOnly.setHours(0, 0, 0, 0);
  const isTournamentToday = tournamentDateOnly.getTime() === today.getTime();

  // Determine if should show simplified view
  const showSimplifiedView = !isRegistered || !playerFlight;

  // SIMPLIFIED VIEW - For players who are accepted but not registered or don't have flight
  if (showSimplifiedView) {
    return (
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-bold text-lg flex-1">
              {tournament.name}
            </h3>
            <div
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ml-2"
              style={{
                background: st.bg,
                borderColor: st.border,
                color: st.text,
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tournament.status === "active" ? "animate-pulse" : ""}`}
                style={{ background: st.dot }}
              />
              {st.label}
            </div>
          </div>
          <p className="text-gray-400 text-sm">{tournament.description}</p>
        </div>

        {/* Tournament Info Card */}
        <div className="p-4 space-y-3 border-b border-gray-800">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm">
              {tournamentDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm">{tournament.location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Target className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm">{tournament.courseType}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="p-4 space-y-2">
          <h4 className="text-white font-semibold text-sm mb-2">Info Turnamen</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Tampilan Skor</span>
              <span className="text-white font-semibold capitalize">
                {tournament.scoringDisplay}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Total Par</span>
              <span className="text-white font-semibold">{totalPar}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FULL VIEW - For players who are registered and have flight
  return (
    <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl shadow-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-lg flex-1">
            {tournament.name}
          </h3>
          <div
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ml-2"
            style={{
              background: st.bg,
              borderColor: st.border,
              color: st.text,
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tournament.status === "active" ? "animate-pulse" : ""}`}
              style={{ background: st.dot }}
            />
            {st.label}
          </div>
        </div>
        <p className="text-gray-400 text-sm">{tournament.description}</p>
      </div>

      {/* Tournament Info Card */}
      <div className="p-4 space-y-3 border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm">
            {tournamentDate.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm">{tournament.location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Target className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm">{tournament.courseType}</span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-4 space-y-2 border-b border-gray-800">
        <h4 className="text-white font-semibold text-sm mb-2">Info Turnamen</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Tampilan Skor</span>
            <span className="text-white font-semibold capitalize">
              {tournament.scoringDisplay}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Total Par</span>
            <span className="text-white font-semibold">{totalPar}</span>
          </div>
        </div>
      </div>

      {/* Your Flight Info */}
      {playerFlight && (
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Informasi Flight Anda
          </h4>

          <div className="bg-gradient-to-r from-blue-900/40 to-blue-950/40 rounded-lg p-3 border border-blue-800/40 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h5 className="text-white font-bold text-sm">
                  {playerFlight.flightName}
                </h5>
                <p className="text-blue-400 text-xs font-semibold">
                  Flight #{playerFlight.flightNumber}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {playerFlight.flightNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {playerFlight.startTime && (
                <div className="flex items-center text-gray-300 text-xs">
                  <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-gray-500">Waktu Mulai</p>
                    <p className="font-semibold">{playerFlight.startTime}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center text-gray-300 text-xs">
                <svg
                  className="w-3 h-3 mr-1.5 text-blue-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
                <div>
                  <p className="text-[10px] text-gray-500">Start Hole</p>
                  <p className="font-semibold">Hole {playerFlight.startHole}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Members */}
          <div className="space-y-2">
            <p className="text-gray-400 text-xs font-semibold">
              Anggota Flight ({playerFlight.members?.length || 0})
            </p>
            <div className="space-y-1.5">
              {playerFlight.members && playerFlight.members.length > 0 ? (
                playerFlight.members.slice(0, 3).map((member: any) => (
                  <div
                    key={member._id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      member._id === userId
                        ? "bg-blue-900/40 border border-blue-700/60"
                        : "bg-gray-900/40 border border-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                          member._id === userId
                            ? "bg-gradient-to-br from-blue-600 to-blue-700"
                            : "bg-gradient-to-br from-gray-600 to-gray-700"
                        }`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold flex items-center gap-1">
                          {member.name}
                          {member._id === userId && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                              Anda
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 bg-gray-900/40 rounded-lg border border-gray-800/60">
                  <p className="text-gray-500 text-xs">Belum ada anggota</p>
                </div>
              )}
              {playerFlight.members && playerFlight.members.length > 3 && (
                <p className="text-gray-500 text-xs text-center">
                  +{playerFlight.members.length - 3} anggota lainnya
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Flight Assigned */}
      {playerFlight === null && (
        <div className="p-4 border-b border-gray-800">
          <div className="text-center py-3 bg-gray-900/40 rounded-lg border border-gray-800/60">
            <p className="text-gray-500 text-xs">Belum ditugaskan ke flight</p>
          </div>
        </div>
      )}

      {/* All Tournament Participants */}
      {allFlights && allFlights.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            Semua Peserta Turnamen
          </h4>

          {/* Table Container with scrollable content */}
          <div className="bg-gray-900/40 rounded-lg border border-gray-800/60 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-800/90 backdrop-blur-sm z-10">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-300 font-semibold">
                      Nama Pemain
                    </th>
                    <th className="text-center py-2 px-3 text-gray-300 font-semibold">
                      Flight
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {allFlights
                    .flatMap((flight) => {
                      // Filter only paid participants
                      const paidParticipants =
                        flight.participants?.filter(
                          (p: any) =>
                            p.paymentStatus === "invited" && p.paidStatus === "paid",
                        ) || [];

                      // Map participants with flight info
                      return paidParticipants.map((participant: any) => ({
                        ...participant,
                        flightName: flight.flightName,
                        flightNumber: flight.flightNumber,
                      }));
                    })
                    .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name
                    .map((participant: any, index: number) => (
                      <tr
                        key={`${participant._id}-${index}`}
                        className={`hover:bg-gray-800/40 transition-colors ${
                          participant._id === userId
                            ? "bg-green-900/30"
                            : index % 2 === 0
                              ? "bg-gray-900/20"
                              : "bg-transparent"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 ${
                                participant._id === userId
                                  ? "bg-gradient-to-br from-green-600 to-green-700"
                                  : "bg-gradient-to-br from-gray-600 to-gray-700"
                              }`}
                            >
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-white font-semibold truncate">
                                {participant.name}
                              </span>
                              {participant._id === userId && (
                                <span className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                                  Anda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-gray-300 font-semibold text-center">
                              {participant.flightName}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Participants Summary - Only Paid */}
          <div className="mt-3 bg-gradient-to-r from-green-900/40 to-green-950/40 rounded-lg p-2.5 border border-green-800/40">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs font-semibold">
                Total Peserta
              </span>
              <span className="text-green-400 text-sm font-bold">
                {allFlights.reduce((total, flight) => {
                  const paidCount =
                    flight.participants?.filter(
                      (p: any) =>
                        p.paymentStatus === "invited" &&
                        p.paidStatus === "paid",
                    ).length || 0;
                  return total + paidCount;
                }, 0)}{" "}
                pemain
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        {/* Scoring Button - Only for active tournaments and if tournament date is today */}
        {tournament.status === "active" && isTournamentToday && (
          <button
            onClick={() => navigate(`/player/flight-scoring/${tournament._id}`)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            <span>
              {hasStartedScoring ? "Lanjutkan Scoring" : "Mulai Scoring"}
            </span>
          </button>
        )}

        {/* Message if tournament is active but not today */}
        {tournament.status === "active" && !isTournamentToday && (
          <div className="w-full bg-gray-900/40 border border-gray-800/60 text-gray-400 font-semibold py-3 px-4 rounded-xl text-center">
            <p className="text-sm">Scoring akan tersedia pada hari turnamen</p>
          </div>
        )}

        {/* View Details Button */}
        {/* <button
          onClick={() => navigate(`/player/tournament/${tournament._id}`, {
            state: { fromMyTournaments: true }
          })}
          className="w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black hover:from-gray-800 hover:via-[#171718] hover:to-black text-white font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Lihat Detail</span>
        </button> */}
      </div>
    </div>
  );
};

export default MyTournaments;
