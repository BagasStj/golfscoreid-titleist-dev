import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../../contexts/AuthContext";
import {
  User,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Trophy,
  Star,
  TrendingUp,
  Phone,
  MapPin,
  Shirt,
  Hand,
  Zap,
} from "lucide-react";

const MyProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch player's tournaments for stats
  const myTournaments = useQuery(
    api.tournaments.getPlayerTournaments,
    user ? { playerId: user._id } : "skip",
  );

  // Fetch player statistics
  const playerStats = useQuery(
    api.users.getPlayerStatistics,
    user ? { playerId: user._id } : "skip",
  );

  const handleLogout = async () => {
    await logout();
    navigate("/player/login");
  };

  // Calculate stats from playerStats
  const totalTournaments = myTournaments?.length || 0;
  const bestScore = playerStats?.bestScore || 0;
  const avgScore = playerStats?.averageScore || 0;

  const stats = [
    {
      label: "Turnamen",
      value: totalTournaments.toString(),
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    },
    {
      label: "Skor Terbaik",
      value: bestScore > 0 ? bestScore.toString() : "-",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
    },
    {
      label: "Rata-rata",
      value: avgScore > 0 ? avgScore.toFixed(1) : "-",
      icon: <TrendingUp className="w-6 h-6 text-yellow-500" />,
    },
  ];

  const menuItems = [
    {
      icon: <User className="w-6 h-6" />,
      label: "Edit Profil",
      action: () => navigate("/player/profile/edit"),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: "Riwayat Turnamen",
      action: () => navigate("/player/profile/history"),
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: "Statistik Saya",
      action: () => navigate("/player/profile/statistics"),
    },
    // {
    //   icon: <Settings className="w-6 h-6" />,
    //   label: "Pengaturan",
    //   action: () => navigate("/player/profile/settings"),
    // },
    // {
    //   icon: <HelpCircle className="w-6 h-6" />,
    //   label: "Bantuan & FAQ",
    //   action: () => navigate("/player/profile/faq"),
    // },
  ];

  // Get initials from name (first letter of first 2 words)
  const getInitials = (name: string) => {
    if (!name) return "P";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  // Get recent achievements from completed tournaments
  const recentAchievements = (myTournaments || [])
    .filter((t) => t.status === "completed")
    .slice(0, 2)
    .map((t) => ({
      title: "Turnamen Selesai",
      tournament: t.name,
      date: new Date(t.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    }));

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5 relative">
      {/* Background Image - Responsive & More Visible */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(/background-player.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-6 shadow-xl border border-gray-800 relative z-10">
        <div className="flex items-center space-x-4 mb-5">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl">
            {getInitials(user?.name || "")}
          </div>
          <div className="flex-1" style={{ textAlign: "left" }}>
            <h2 className="text-white font-bold text-2xl">
              {user?.name || "Player"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {user?.email || "player@example.com"}
            </p>
            {(user as any)?.phone && (
              <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {(user as any).phone}
              </p>
            )}
            {(user as any)?.workLocation && (
              <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {(user as any).workLocation}
              </p>
            )}
            <div className="flex items-center mt-2 space-x-2">
              {(user as any)?.gender && (
                <span className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  {(user as any).gender === "male" ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="10" cy="14" r="6" />
                        <line x1="16" y1="8" x2="22" y2="2" />
                        <line x1="22" y1="8" x2="16" y2="8" />
                        <line x1="22" y1="2" x2="22" y2="8" />
                      </svg>
                      Pria
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="6" />
                        <line x1="12" y1="14" x2="12" y2="22" />
                        <line x1="8" y1="18" x2="16" y2="18" />
                      </svg>
                      Wanita
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {((user as any)?.shirtSize || (user as any)?.gloveSize) && (
          <div className="flex items-center space-x-4 mb-5 pt-4 border-t border-gray-800">
            {(user as any)?.shirtSize && (
              <div className="flex items-center space-x-2">
                <Shirt className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Baju:</span>
                <span className="text-white font-semibold">
                  {(user as any).shirtSize}
                </span>
              </div>
            )}
            {(user as any)?.gloveSize && (
              <div className="flex items-center space-x-2">
                <Hand className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Sarung Tangan:</span>
                <span className="text-white font-semibold">
                  {(user as any).gloveSize}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Club Set Details */}
        {((user as any)?.drivers?.length > 0 ||
          (user as any)?.fairways?.length > 0 ||
          (user as any)?.hybrids?.length > 0 ||
          (user as any)?.utilityIrons?.length > 0 ||
          (user as any)?.irons?.length > 0 ||
          (user as any)?.wedges?.length > 0 ||
          (user as any)?.putters?.length > 0 ||
          (user as any)?.golfBalls?.length > 0) && (
          <div className="space-y-3 mb-5 pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold">
                Club Sets
              </span>
            </div>

            <div className="bg-black/20 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="text-left text-gray-400 font-semibold px-3 py-2 text-xs">
                      Kategori
                    </th>
                    <th className="text-left text-gray-400 font-semibold px-3 py-2 text-xs">
                      Brand
                    </th>
                    <th className="text-left text-gray-400 font-semibold px-3 py-2 text-xs">
                      Model
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Drivers */}
                  {(user as any)?.drivers &&
                    (user as any).drivers.length > 0 &&
                    (user as any).drivers
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`driver-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Driver" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Fairways */}
                  {(user as any)?.fairways &&
                    (user as any).fairways.length > 0 &&
                    (user as any).fairways
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`fairway-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Fairway" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Hybrids */}
                  {(user as any)?.hybrids &&
                    (user as any).hybrids.length > 0 &&
                    (user as any).hybrids
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`hybrid-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Hybrid" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Utility Irons */}
                  {(user as any)?.utilityIrons &&
                    (user as any).utilityIrons.length > 0 &&
                    (user as any).utilityIrons
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`utility-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Utility Iron" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Irons */}
                  {(user as any)?.irons &&
                    (user as any).irons.length > 0 &&
                    (user as any).irons
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`iron-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Iron" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Wedges */}
                  {(user as any)?.wedges &&
                    (user as any).wedges.length > 0 &&
                    (user as any).wedges
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`wedge-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Wedge" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Putters */}
                  {(user as any)?.putters &&
                    (user as any).putters.length > 0 &&
                    (user as any).putters
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`putter-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Putter" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}

                  {/* Golf Balls */}
                  {(user as any)?.golfBalls &&
                    (user as any).golfBalls.length > 0 &&
                    (user as any).golfBalls
                      .filter(
                        (club: any) => club.model && club.model.trim() !== "",
                      )
                      .map((club: any, idx: number) => (
                        <tr
                          key={`ball-${idx}`}
                          className="border-t border-gray-800/50"
                        >
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {idx === 0 ? "Golf Ball" : ""}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`${
                                club.brand === "Titleist"
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-blue-900/30 text-blue-300"
                              } text-xs px-2 py-1 rounded font-medium`}
                            >
                              {club.brand}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-xs">
                            {club.model}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-800">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {/* <div className="flex justify-center mb-1">{stat.icon}</div> */}
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-5 shadow-xl border border-gray-800 relative z-10">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            Pencapaian Terbaru
          </h3>
          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-white font-semibold">
                      {achievement.title}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {achievement.tournament}
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 text-xs">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl shadow-xl border border-gray-800 overflow-hidden relative z-10">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center justify-between p-5 hover:bg-black/30 transition-all border-b border-gray-800 last:border-b-0"
          >
            <div className="flex items-center space-x-4">
              <div className="text-red-500">{item.icon}</div>
              <span className="text-white font-semibold">{item.label}</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 relative z-10"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>

      {/* App Version */}
      <div className="text-center text-gray-600 text-xs pb-4 relative z-10">
        Versi 1.0.0
      </div>
    </div>
  );
};

export default MyProfile;
