import { useState } from "react";
import { TrendingUp, Award } from "lucide-react";
import LiveMonitoringDashboard from "./LiveMonitoringDashboard";
import LeaderboardAdmin from "./LeaderboardAdmin";

type ScoringTab = "live-scoring" | "leaderboard";

export default function ScoringAndLeaderboard() {
  const [activeTab, setActiveTab] = useState<ScoringTab>("live-scoring");

  const tabs: { id: ScoringTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "live-scoring",
      label: "Live Scoring",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <div className="flex gap-2 bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 border border-red-900/30 rounded-xl p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-lg shadow-red-900/40 border border-red-700/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "live-scoring" && <LiveMonitoringDashboard />}
        {activeTab === "leaderboard" && <LeaderboardAdmin />}
      </div>
    </div>
  );
}
