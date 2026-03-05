import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const TournamentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const allTournaments = useQuery(api.tournaments.getAllTournaments);

  const totalTournaments = allTournaments?.length || 0;
  const upcomingCount =
    allTournaments?.filter((t) => t.status === "upcoming").length || 0;
  const activeCount =
    allTournaments?.filter((t) => t.status === "active").length || 0;

  const filteredTournaments = (allTournaments || []).filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Akan Datang",
          bg: "bg-blue-500/20",
          border: "border-blue-500/40",
          text: "text-blue-300",
          dot: "bg-blue-400",
        };
      case "active":
        return {
          label: "Berlangsung",
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/40",
          text: "text-emerald-300",
          dot: "bg-emerald-400",
        };
      case "completed":
        return {
          label: "Selesai",
          bg: "bg-gray-500/20",
          border: "border-gray-500/40",
          text: "text-gray-400",
          dot: "bg-gray-500",
        };
      default:
        return {
          label: status,
          bg: "bg-gray-500/20",
          border: "border-gray-500/40",
          text: "text-gray-400",
          dot: "bg-gray-500",
        };
    }
  };

  if (!allTournaments) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-red-900/40 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/ttiltlist-landing.png"
              alt="logo"
              className="w-7 h-7 object-contain opacity-60"
            />
          </div>
        </div>
        <p className="text-gray-500 text-sm tracking-widest uppercase">
          Memuat turnamen...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-8 space-y-5 relative">
      {/* Background Image - Responsive & More Visible */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/background-player.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
     

      {/* ── Stats ── */}
      <div className="relative z-10">
        {/* Container with red border all around */}
        <div className="bg-gradient-to-b from-[#1c1c1c] to-[#0e0e0e] rounded-2xl border-2 border-red-900/60 p-1 overflow-hidden">
          {/* Content */}
          <div className="grid grid-cols-3 divide-x divide-red-900/30">
            {[
              {
                label: "TOTAL",
                value: totalTournaments,
                color: "#78B9B5",
              },
              {
                label: "AKAN DATANG",
                value: upcomingCount,
                color: "#EBD5AB",
              },
              { 
                label: "AKTIF", 
                value: activeCount, 
                color: "#AE445A" 
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative overflow-hidden p-3"
              >
                <div className="text-center space-y-2">
                  {/* Value */}
                  <div
                    className="font-black text-4xl leading-none"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-gray-400 text-[10px] font-bold tracking-[0.15em] uppercase">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative group z-10">
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"
          style={{ background: "linear-gradient(90deg, #c9a84c20, #7f1d1d20)" }}
        />
        <div
          className="relative flex items-center rounded-xl border border-white/8 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #181818, #111111)" }}
        >
          <div className="pl-4 pr-2 flex-shrink-0">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari turnamen"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm py-3.5 pr-4 focus:outline-none placeholder-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="pr-4 text-gray-600 hover:text-gray-300 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="flex items-center gap-3 relative z-10">
        <div
          className="h-px flex-1"
          style={{
            background: "linear-gradient(90deg, #c9a84c40, transparent)",
          }}
        />
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: "#c9a84c" }}
        >
          {filteredTournaments.length} Turnamen
        </span>
        <div
          className="h-px flex-1"
          style={{
            background: "linear-gradient(90deg, transparent, #c9a84c40)",
          }}
        />
      </div>

      {/* ── Tournament Cards ── */}
      <div className="space-y-3.5 relative z-10">
        {filteredTournaments.map((tournament, index) => {
          const statusCfg = getStatusConfig(tournament.status);

          return (
            <div
              key={tournament._id}
              onClick={() => navigate(`/player/tournament/${tournament._id}`, { 
                state: { fromHome: true } 
              })}
              className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(145deg, #1c1c1c 0%, #141414 60%, #0e0e0e 100%)",
              }}
            >
              {/* outer border with gold glow on hover */}
              <div className="absolute inset-0 rounded-2xl   transition-colors duration-300" />

              {/* top shimmer */}
              <div
                className="absolute top-0 left-6 right-6 h-px opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #c9a84c, transparent)",
                }}
              />

              {/* left gold accent bar */}
              <div
                className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, #c9a84c, transparent)",
                }}
              />

              {/* subtle index number watermark */}
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[64px] font-black leading-none select-none pointer-events-none"
                style={{ color: "rgba(255,255,255,0.025)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="relative p-4 pl-5">
                <div className="flex items-center gap-4">
                  {/* Logo container */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        background:
                          "radial-gradient(circle, #c9a84c, transparent)",
                      }}
                    />
                    <div
                      className="relative w-[52px] h-[52px] rounded-xl flex items-center justify-center overflow-hidden"
                    >
                      {tournament.bannerUrl ? (
                        <img
                          src={tournament.bannerUrl}
                          alt={tournament.name}
                          className="w-18 h-18 object-contain p-1"
                        />
                      ) : (
                        <img
                          src="/ttiltlist-landing.png"
                          alt="Titleist"
                          className="w-9 h-9 object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${tournament.status === "active" ? "animate-pulse" : ""}`}
                        />
                        {statusCfg.label}
                      </div>
                    </div>

                    {/* Tournament name */}
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 pr-8 mb-2">
                      {tournament.name}
                    </h3>

                    {/* Date row */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "#c9a84c" }}
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
                      <span className="text-gray-400 text-[11px] tracking-wide">
                        {new Date(tournament.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Arrow chevron */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center border-yellow-700/50 transition-colors duration-300"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-600 group-hover:text-yellow-600/80 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Bottom divider with gold gradient */}
                <div
                  className="mt-3.5 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, #c9a84c20, transparent 70%)",
                  }}
                />

               
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {filteredTournaments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 relative z-10">
          <div className="relative w-20 h-20">
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-xl"
              style={{
                background: "radial-gradient(circle, #c9a84c, transparent)",
              }}
            />
            <div
              className="relative w-20 h-20 rounded-full border border-yellow-700/20 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1a1208, #0d0d0d)",
              }}
            >
              <img
                src="/ttiltlist-landing.png"
                alt="logo"
                className="w-10 h-10 object-contain opacity-40"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-semibold text-sm">
              {searchQuery ? "Tidak ada turnamen ditemukan" : "Belum Ada Turnamen Tersedia"}
            </p>
            {searchQuery && (
              <p className="text-gray-700 text-xs mt-1">
                Coba ubah kata kunci pencarian Anda
              </p>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-5 py-2 rounded-full border border-yellow-700/30 text-xs font-semibold tracking-wider uppercase transition-colors hover:border-yellow-600/50"
              style={{ color: "#c9a84c", background: "rgba(201,168,76,0.05)" }}
            >
              Reset Pencarian
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
