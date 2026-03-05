import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import TournamentList from "./TournamentList";
import MyTournaments from "./MyTournaments";
import NewsFeed from "./NewsFeed";
import MyProfile from "./MyProfile";
import PendingScoreApprovals from "../PendingScoreApprovals";

const MobileLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as
    | "home"
    | "my-tournaments"
    | "information"
    | "profile"
    | null;
  const [activeTab, setActiveTab] = useState<
    "home" | "my-tournaments" | "information" | "profile"
  >(tabParam || "home");
  const { user } = useAuth();

  // Get initials from name (first letter of first 2 words)
  const getInitials = (name: string) => {
    if (!name) return "P";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (
      tabParam &&
      ["home", "my-tournaments", "information", "profile"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Update URL when tab changes
  const handleTabChange = (
    tab: "home" | "my-tournaments" | "information" | "profile",
  ) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <TournamentList />;
      case "my-tournaments":
        return <MyTournaments />;
      case "information":
        return <NewsFeed />;
      case "profile":
        return <MyProfile />;
      default:
        return <TournamentList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#171718] to-black pb-20 relative overflow-hidden">
      {/* Elegant background decorations - matching login page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dark red gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#000000]/95 via-[#151515f2] to-black/95 backdrop-blur-xl shadow-2xl border-b border-red-900/40">
        <div className="h-1 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {/* <img src="/full-color-mark.png" alt="Logo" className="h-9 w-9" /> */}
            <img src="/ttiltlist-landing.png" alt="Logo" className="h-9 w-9" />
            <span className="text-white font-bold text-xl tracking-tight">
              Team Titleist Invitational
            </span>
          </div>

          {/* Profile Button */}
          <button
            style={{
              backgroundImage:
                "linear-gradient(rgb(33 32 32), rgb(26 26 26), rgb(2 2 2))",
            }}
            onClick={() => handleTabChange("profile")}
            className="flex items-center space-x-2  hover:bg-gray-800/50 rounded-full px-3 py-2 transition-all border border-gray-800/50"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {getInitials(user?.name || "")}
            </div>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="pt-20 relative z-10">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#2e2e2e]/95 via-[#212121] to-black/95 backdrop-blur-xl shadow-2xl border-t border-red-900/40 z-50">
        <div className="h-1 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>
        <div className="flex items-center justify-around py-3 px-2">
          <button
            onClick={() => handleTabChange("home")}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "home"
                ? "text-white bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/50"
                : "text-gray-500 hover:text-white hover:bg-gray-900/50"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-semibold">Beranda</span>
          </button>

          <button
            onClick={() => handleTabChange("my-tournaments")}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "my-tournaments"
                ? "text-white bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/50"
                : "text-gray-500 hover:text-white hover:bg-gray-900/50"
            }`}
          >
            <svg
              className="w-6 h-6"
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
            <span className="text-xs font-semibold">Turnamen Saya</span>
          </button>

          <button
            onClick={() => handleTabChange("information")}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "information"
                ? "text-white bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/50"
                : "text-gray-500 hover:text-white hover:bg-gray-900/50"
            }`}
          >
            <svg
              className="w-6 h-6"
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
            <span className="text-xs font-semibold">Informasi</span>
          </button>

          <button
            onClick={() => handleTabChange("profile")}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "text-white bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/50"
                : "text-gray-500 hover:text-white hover:bg-gray-900/50"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-semibold">Profil</span>
          </button>
        </div>
      </nav>

      {/* Pending Score Approvals - Global */}
      <PendingScoreApprovals />
    </div>
  );
};

export default MobileLayout;
