import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "../../../contexts/AuthContext";

/* ─────────────────────────────── helpers ─────────────────────────────── */

const GOLD = "#c9a84c";

const statusConfig = (status: string) => {
  switch (status) {
    case "upcoming":
      return {
        label: "Akan Datang",
        bg: "bg-blue-500/15",
        border: "border-blue-500/30",
        text: "text-blue-300",
        dot: "bg-blue-400",
      };
    case "active":
      return {
        label: "Berlangsung",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/30",
        text: "text-emerald-300",
        dot: "bg-emerald-400",
      };
    case "completed":
      return {
        label: "Selesai",
        bg: "bg-gray-500/15",
        border: "border-gray-500/30",
        text: "text-gray-400",
        dot: "bg-gray-500",
      };
    default:
      return {
        label: status,
        bg: "bg-gray-500/15",
        border: "border-gray-500/30",
        text: "text-gray-400",
        dot: "bg-gray-500",
      };
  }
};

const GoldLine = ({ className = "" }: { className?: string }) => (
  <div
    className={`h-px ${className}`}
    style={{
      background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
    }}
  />
);

/* ─────────────────────────────── component ───────────────────────────── */

const TournamentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "jadwal" | "peserta">(
    "info",
  );

  /* ── queries ── */
  const tournament = useQuery(
    api.tournaments.getTournamentDetails,
    id ? { tournamentId: id as Id<"tournaments"> } : "skip",
  );
  const participants = useQuery(
    api.tournaments.getTournamentParticipants,
    id ? { tournamentId: id as Id<"tournaments"> } : "skip",
  );
  const isRegistered = React.useMemo(() => {
    if (!participants || !user) return false;
    return participants.some((p) => p._id === user._id);
  }, [participants, user]);

  const playerScores = useQuery(
    api.scores.getPlayerScores,
    id && user && isRegistered
      ? {
          tournamentId: id as Id<"tournaments">,
          playerId: user._id as Id<"users">,
        }
      : "skip",
  );
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    id && user && isRegistered
      ? {
          tournamentId: id as Id<"tournaments">,
          playerId: user._id as Id<"users">,
        }
      : "skip",
  );

  /* ── loading ── */
  if (!tournament || !participants) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(160deg,#0f0f0f,#060606)" }}
      >
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-red-900/30 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/ttiltlist-landing.png"
              alt=""
              className="w-7 h-7 object-contain opacity-60"
            />
          </div>
        </div>
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          Memuat turnamen...
        </p>
      </div>
    );
  }
  if (isRegistered && playerScores === undefined) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(160deg,#0f0f0f,#060606)" }}
      >
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-900/30 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/ttiltlist-landing.png"
              alt=""
              className="w-7 h-7 object-contain opacity-60"
            />
          </div>
        </div>
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          Memuat skor Anda...
        </p>
      </div>
    );
  }

  /* ── derived data ── */
  const participantCount = participants.length;
  const maxParticipants = tournament.maxParticipants || 100;
  const holesConfig = tournament.holesConfig || [];
  const totalHoles = holesConfig.length;
  const holesCompleted = playerScores?.length || 0;
  const progress = totalHoles > 0 ? (holesCompleted / totalHoles) * 100 : 0;
  const totalStrokes = playerScores?.reduce((s, sc) => s + sc.strokes, 0) || 0;
  const totalPar =
    playerScores?.reduce((s, sc) => {
      const h = holesConfig.find((h) => h.holeNumber === sc.holeNumber);
      return s + (h?.par || 0);
    }, 0) || 0;
  const scoreToPar = totalStrokes - totalPar;

  const scheduleItems = tournament.schedule
    ? tournament.schedule
        .split("\n")
        .filter((l: string) => l.trim())
        .map((line: string, i: number) => {
          const parts = line.split(" - ");
          return {
            time: parts[0] || `${7 + i}:00`,
            activity: parts[1] || line,
            description: parts[2] || "",
          };
        })
    : [
        {
          time: "06:00 – 07:00",
          activity: "Registrasi Peserta",
          description: "Check-in dan verifikasi peserta turnamen",
        },
        {
          time: "07:00 – 07:30",
          activity: "Briefing & Pembukaan",
          description: "Penjelasan aturan dan sambutan panitia",
        },
        {
          time: "07:30 – 08:00",
          activity: "Warming Up",
          description: "Pemanasan di driving range",
        },
        {
          time: "08:00 – 13:00",
          activity: "Babak Pertama",
          description: "Permainan 18 holes",
        },
      ];

  const st = statusConfig(tournament.status);

  const cardBg = "linear-gradient(150deg,#1c1c1c 0%,#141414 60%,#0e0e0e 100%)";

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div
      className="min-h-screen pb-36"
      style={{ background: "linear-gradient(160deg,#101010,#070707)" }}
    >
      {/* ── sticky topbar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
        style={{
          background: "linear-gradient(180deg,#111111ee,#111111cc,transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 transition-colors hover:border-yellow-700/40 active:scale-95"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] tracking-[0.25em] uppercase font-semibold"
            style={{ color: GOLD }}
          >
            Detail Turnamen
          </p>
          <h1 className="text-white font-bold text-sm leading-tight truncate">
            {tournament.name}
          </h1>
        </div>

        {/* status pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold ${st.bg} ${st.border} ${st.text}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${st.dot} ${tournament.status === "active" ? "animate-pulse" : ""}`}
          />
          {st.label}
        </div>
      </div>

      {/* ── hero card ── */}
      <div className="pt-16 px-4 mt-2">
        <div
          className="relative rounded-3xl overflow-hidden border border-white/6"
          style={{ background: cardBg }}
        >
          {/* gold shimmer top */}
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{
              background: `linear-gradient(90deg,transparent,${GOLD}80,transparent)`,
            }}
          />
          {/* ambient glow */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle,${GOLD},transparent)`,
            }}
          />

          <div className="relative p-5 flex items-center gap-4">
            {/* logo box */}
            <div className="flex-shrink-0 relative">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-20"
                style={{
                  background: `radial-gradient(circle,${GOLD},transparent)`,
                }}
              />
              <div
                className="relative w-16 h-16 rounded-2xl border flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#1f1608,#0d0d0d)",
                  borderColor: `${GOLD}30`,
                }}
              >
                <img
                  src="/ttiltlist-landing.png"
                  alt="Titleist"
                  className="w-11 h-11 object-contain"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1"
                style={{ color: GOLD }}
              >
                Team Titleist Invitational
              </p>
              <h2 className="text-white font-extrabold text-base leading-tight mb-2">
                {tournament.name}
              </h2>
              {isRegistered && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Anda Terdaftar
                </div>
              )}
            </div>
          </div>

          {/* quick stats strip */}
          <GoldLine />
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[
              {
                icon: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
                label: "Tanggal",
                value: new Date(tournament.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
              {
                icon: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                label: "Peserta",
                value: `${participantCount} / ${maxParticipants}`,
              },
              {
                icon: (
                  <svg
                    className="w-3.5 h-3.5"
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
                ),
                label: "Holes",
                value:
                  tournament.courseType === "18holes"
                    ? "18 Holes"
                    : tournament.courseType === "F9"
                      ? "Front 9"
                      : "Back 9",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 py-3 px-2"
              >
                <span style={{ color: GOLD }}>{s.icon}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                  {s.label}
                </span>
                <span className="text-white text-[11px] font-bold text-center leading-tight">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
          {/* gold shimmer bottom */}
          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg,${GOLD}30,transparent 70%)`,
            }}
          />
        </div>
      </div>

      {/* ── tabs ── */}
      <div className="sticky top-14 z-40 px-4 mt-4">
        <div
          className="flex rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#181818,#111111)" }}
        >
          {(
            [
              { key: "info", label: "Informasi" },
              { key: "jadwal", label: "Jadwal" },
              { key: "peserta", label: `Peserta (${participantCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all relative ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {activeTab === tab.key && (
                <div
                  className="absolute inset-0 rounded-xl mx-1 my-1"
                  style={{
                    background: "linear-gradient(135deg,#2a1f08,#1a1208)",
                    border: `1px solid ${GOLD}30`,
                  }}
                />
              )}
              <span
                className="relative"
                style={{ color: activeTab === tab.key ? GOLD : undefined }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════ TAB: INFO ══════════════════ */}
      {activeTab === "info" && (
        <div className="px-4 mt-4 space-y-4">
          {/* progress if registered + active */}
          {isRegistered && tournament.status === "active" && (
            <div
              className="relative overflow-hidden rounded-2xl border border-white/6"
              style={{ background: cardBg }}
            >
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                  background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
                }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm">Progres Anda</h3>
                  <span className="text-xs font-bold" style={{ color: GOLD }}>
                    {holesCompleted} / {totalHoles} Holes
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg,#7f1d1d,${GOLD})`,
                    }}
                  />
                </div>
                {holesCompleted > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                    {[
                      {
                        label: "Total Strok",
                        value: totalStrokes.toString(),
                        color: "text-white",
                      },
                      {
                        label: "Score to Par",
                        value: `${scoreToPar > 0 ? "+" : ""}${scoreToPar}`,
                        color:
                          scoreToPar < 0
                            ? "text-emerald-400"
                            : scoreToPar > 0
                              ? "text-red-400"
                              : "text-white",
                      },
                      {
                        label: "Sisa Holes",
                        value: (totalHoles - holesCompleted).toString(),
                        color: "text-white",
                      },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                          {s.label}
                        </p>
                        <p className={`text-xl font-extrabold ${s.color}`}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* flight info */}
          {isRegistered && playerFlight && (
            <div
              className="relative overflow-hidden rounded-2xl border border-blue-500/20"
              style={{ background: cardBg }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Info Flight Anda
                  </h3>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-extrabold text-sm">
                    {playerFlight.flightNumber}
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 mb-4 border border-blue-500/15"
                  style={{ background: "rgba(59,130,246,0.07)" }}
                >
                  <p className="text-white font-bold text-sm mb-1">
                    {playerFlight.flightName}
                  </p>
                  <p className="text-blue-400 text-xs">
                    Flight #{playerFlight.flightNumber}
                  </p>
                  {(playerFlight.startTime || playerFlight.startHole) && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-blue-500/15">
                      {playerFlight.startTime && (
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                            Jam Mulai
                          </p>
                          <p className="text-white font-bold text-xs mt-0.5">
                            {playerFlight.startTime}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                          Start Hole
                        </p>
                        <p className="text-white font-bold text-xs mt-0.5">
                          Hole {playerFlight.startHole}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
                  Anggota Flight ({playerFlight.members?.length || 0})
                </p>
                <div className="space-y-2">
                  {playerFlight.members?.map((m: any) => (
                    <div
                      key={m._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        m._id === user?._id
                          ? "border-blue-500/40 bg-blue-500/10"
                          : "border-white/5 bg-white/2"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                          m._id === user?._id ? "bg-blue-600" : "bg-white/10"
                        }`}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-xs font-bold truncate">
                            {m.name}
                          </p>
                          {m._id === user?._id && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-[10px]">
                          HCP: {m.handicap || "N/A"}
                        </p>
                      </div>
                      {m.startHole && (
                        <div className="text-right">
                          <p className="text-[9px] text-gray-500">Start</p>
                          <p className="text-white font-bold text-xs">
                            H{m.startHole}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isRegistered && playerFlight === null && (
            <div
              className="relative rounded-2xl border border-white/6 p-6 text-center"
              style={{ background: cardBg }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-600"
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
              </div>
              <p className="text-white text-sm font-semibold">
                Belum Ada Flight
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Anda belum ditempatkan dalam flight
              </p>
            </div>
          )}

          {/* recent holes */}
          {isRegistered &&
            tournament.status === "active" &&
            holesCompleted > 0 &&
            playerScores && (
              <div
                className="relative overflow-hidden rounded-2xl border border-white/6"
                style={{ background: cardBg }}
              >
                <div
                  className="absolute top-0 left-6 right-6 h-px"
                  style={{
                    background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
                  }}
                />
                <div className="p-5">
                  <h3 className="text-white font-bold text-sm mb-3">
                    Hole Terbaru
                  </h3>
                  <div className="space-y-2">
                    {playerScores
                      .slice(-5)
                      .reverse()
                      .map((score) => {
                        const hole = holesConfig.find(
                          (h: any) => h.holeNumber === score.holeNumber,
                        );
                        const diff = score.strokes - (hole?.par || 0);
                        return (
                          <div
                            key={score._id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/2"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#7f1d1d,#991b1b)",
                              }}
                            >
                              {score.holeNumber}
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-xs font-semibold">
                                Hole {score.holeNumber}
                              </p>
                              <p className="text-gray-500 text-[10px]">
                                Par {hole?.par || "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-extrabold text-base">
                                {score.strokes}
                              </p>
                              <p
                                className={`text-[10px] font-bold ${diff < 0 ? "text-emerald-400" : diff > 0 ? "text-red-400" : "text-gray-400"}`}
                              >
                                {diff > 0 ? "+" : ""}
                                {diff}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

          {/* description */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/6"
            style={{ background: cardBg }}
          >
            <div
              className="absolute top-0 left-6 right-6 h-px"
              style={{
                background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
              }}
            />
            <div className="p-5">
              <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <span style={{ color: GOLD }}>
                  <svg
                    className="w-4 h-4"
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
                </span>
                Tentang Turnamen
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {tournament.description || "Tidak ada deskripsi tersedia."}
              </p>
            </div>
          </div>

          {/* info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
                label: "Tanggal",
                value: new Date(tournament.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
              {
                icon: (
                  <svg
                    className="w-4 h-4"
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
                  </svg>
                ),
                label: "Lokasi",
                value: tournament.location || "-",
              },
              {
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                label: "Kapasitas",
                value: `${participantCount} / ${maxParticipants} Peserta`,
              },
              ...(tournament.prize
                ? [
                    {
                      icon: (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ),
                      label: "Hadiah",
                      value: tournament.prize,
                    },
                  ]
                : []),
            ].map((item, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-white/6 p-4"
                style={{ background: cardBg }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg,${GOLD}30,transparent)`,
                  }}
                />
                <span style={{ color: GOLD }}>{item.icon}</span>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-2 mb-1">
                  {item.label}
                </p>
                <p className="text-white font-bold text-xs leading-snug">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* fee & contact */}
          {(tournament.registrationFee || tournament.contactPerson) && (
            <div
              className="relative overflow-hidden rounded-2xl border border-white/6"
              style={{ background: cardBg }}
            >
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                  background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
                }}
              />
              <div className="p-5 space-y-4">
                {tournament.registrationFee && (
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                      Biaya Registrasi
                    </p>
                    <p
                      className="text-white font-extrabold text-lg"
                      style={{ color: GOLD }}
                    >
                      {tournament.registrationFee}
                    </p>
                  </div>
                )}
                {tournament.contactPerson && (
                  <div
                    className={
                      tournament.registrationFee
                        ? "pt-4 border-t border-white/5"
                        : ""
                    }
                  >
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                      Contact Person
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {tournament.contactPerson}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* course info */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/6"
            style={{ background: cardBg }}
          >
            <div
              className="absolute top-0 left-6 right-6 h-px"
              style={{
                background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
              }}
            />
            <div className="p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <span style={{ color: GOLD }}>
                  <svg
                    className="w-4 h-4"
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
                </span>
                Informasi Lapangan
              </h3>
              <div className="space-y-0">
                {[
                  {
                    label: "Tipe Lapangan",
                    value:
                      tournament.courseType === "18holes"
                        ? "18 Holes"
                        : tournament.courseType === "F9"
                          ? "Front 9"
                          : "Back 9",
                  },
                  { label: "Mode Permainan", value: tournament.gameMode },
                  {
                    label: "Start Hole",
                    value: `Hole ${tournament.startHole}`,
                  },
                  ...(tournament.maleTeeBox
                    ? [{ label: "Male Tee Box", value: tournament.maleTeeBox }]
                    : []),
                  ...(tournament.femaleTeeBox
                    ? [
                        {
                          label: "Female Tee Box",
                          value: tournament.femaleTeeBox,
                        },
                      ]
                    : []),
                ].map((row, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}
                  >
                    <span className="text-gray-500 text-xs">{row.label}</span>
                    <span className="text-white text-xs font-bold capitalize">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: JADWAL ══════════════════ */}
      {activeTab === "jadwal" && (
        <div className="px-4 mt-4 space-y-0">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/6"
            style={{ background: cardBg }}
          >
            <div
              className="absolute top-0 left-6 right-6 h-px"
              style={{
                background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
              }}
            />
            <div className="p-5">
              <h3 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
                <span style={{ color: GOLD }}>
                  <svg
                    className="w-4 h-4"
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
                </span>
                Rundown Acara
              </h3>

              <div className="relative">
                {/* vertical line */}
                <div
                  className="absolute left-4 top-4 bottom-4 w-px"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${GOLD}40, transparent)`,
                  }}
                />

                <div className="space-y-5">
                  {scheduleItems.map(
                    (
                      item: {
                        time: string;
                        activity: string;
                        description: string;
                      },
                      index: number,
                    ) => (
                      <div key={index} className="flex items-start gap-4 pl-1">
                        {/* dot */}
                        <div className="flex-shrink-0 relative z-10 mt-0.5">
                          <div
                            className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white font-extrabold text-[10px]"
                            style={{
                              background:
                                "linear-gradient(135deg,#7f1d1d,#991b1b)",
                              borderColor: `${GOLD}30`,
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{
                                color: GOLD,
                                background: `${GOLD}15`,
                                borderColor: `${GOLD}30`,
                              }}
                            >
                              {item.time}
                            </span>
                          </div>
                          <p className="text-white font-bold text-xs">
                            {item.activity}
                          </p>
                          {item.description && (
                            <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: PESERTA ══════════════════ */}
      {activeTab === "peserta" && (
        <div className="px-4 mt-4">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/6"
            style={{ background: cardBg }}
          >
            <div
              className="absolute top-0 left-6 right-6 h-px"
              style={{
                background: `linear-gradient(90deg,transparent,${GOLD}60,transparent)`,
              }}
            />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span style={{ color: GOLD }}>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  Daftar Peserta
                </h3>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    color: GOLD,
                    background: `${GOLD}15`,
                    borderColor: `${GOLD}30`,
                  }}
                >
                  {participantCount} / {maxParticipants}
                </span>
              </div>

              {/* capacity bar */}
              <div className="h-1.5 rounded-full overflow-hidden bg-white/5 mb-5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((participantCount / maxParticipants) * 100, 100)}%`,
                    background: `linear-gradient(90deg,#7f1d1d,${GOLD})`,
                  }}
                />
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-7 h-7 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-semibold">
                    Belum Ada Peserta
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Jadilah yang pertama mendaftar!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((p, index) => (
                    <div
                      key={p._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        p._id === user?._id
                          ? "border-yellow-700/40 bg-yellow-900/10"
                          : "border-white/5 bg-white/2"
                      }`}
                    >
                      {/* rank */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-extrabold"
                        style={
                          index < 3
                            ? {
                                background: `linear-gradient(135deg,#7f1d1d,${GOLD}80)`,
                                color: "#fff",
                              }
                            : {
                                background: "rgba(255,255,255,0.06)",
                                color: "#9ca3af",
                              }
                        }
                      >
                        {index + 1}
                      </div>
                      {/* avatar letter */}
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                        style={{
                          background:
                            p._id === user?._id
                              ? `linear-gradient(135deg,#7f1d1d,${GOLD}60)`
                              : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-xs font-bold truncate">
                            {p.name}
                          </p>
                          {p._id === user?._id && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-bold border"
                              style={{
                                color: GOLD,
                                background: `${GOLD}15`,
                                borderColor: `${GOLD}30`,
                              }}
                            >
                              Anda
                            </span>
                          )}
                        </div>
                        {p.flightName && (
                          <p className="text-gray-500 text-[10px] mt-0.5">
                            {p.flightName}
                          </p>
                        )}
                      </div>
                      {p.startHole && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-[9px] text-gray-500 uppercase">
                            Start
                          </p>
                          <p className="text-white font-bold text-xs">
                            H{p.startHole}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ FIXED BOTTOM CTA ══════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(0deg,#080808 60%,transparent)" }}
      >
        {/* NOT registered + upcoming → Join button */}
        {tournament.status === "upcoming" && !isRegistered && (
          <button
            className="relative w-full overflow-hidden rounded-2xl py-4 font-extrabold text-sm tracking-wide transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, #7f1d1d, ${GOLD}cc, #7f1d1d)`,
              backgroundSize: "200% 100%",
              color: "#fff",
            }}
          >
            {/* shimmer sweep */}
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",
              }}
            />
            <svg
              className="w-5 h-5 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span className="relative z-10">Daftar Turnamen</span>
          </button>
        )}

        {/* Registered + active → scoring + view buttons */}
        {isRegistered && (
          <div className="space-y-2.5">
            {tournament.status === "active" && (
              <button
                onClick={() => navigate(`/player/scoring/${tournament._id}`)}
                className="relative w-full overflow-hidden rounded-2xl py-4 font-extrabold text-sm tracking-wide active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg,#064e3b,#047857,#065f46)`,
                  color: "#fff",
                }}
              >
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
                  }}
                />
                <svg
                  className="w-5 h-5 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="relative z-10">Mulai Scoring</span>
              </button>
            )}
            {(tournament.status === "active" ||
              tournament.status === "completed") && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    navigate(`/player/tournament/${tournament._id}/scorecard`)
                  }
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-xs font-bold text-white transition-colors active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg,#1c1c1c,#111)",
                    borderColor: `${GOLD}25`,
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: GOLD }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Scorecard
                </button>
                <button
                  onClick={() =>
                    navigate(`/player/tournament/${tournament._id}/leaderboard`)
                  }
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-xs font-bold text-white transition-colors active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg,#1c1c1c,#111)",
                    borderColor: `${GOLD}25`,
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: GOLD }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Leaderboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentDetail;
