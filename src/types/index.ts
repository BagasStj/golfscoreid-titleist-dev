import type { Id } from "../../convex/_generated/dataModel";

// Enums and Union Types
export type CourseType = "18holes" | "F9" | "B9";
export type GameMode = "strokePlay" | "system36" | "stableford" | "peoria" ;
export type ScoringDisplay = "over" | "stroke";
export type TournamentStatus = "upcoming" | "active" | "completed";
export type UserRole = "admin" | "player";
export type CourseSection = "front9" | "back9";

export type ScoreClassificationName =
  | "Hole in One"
  | "Albatross"
  | "Eagle"
  | "Birdie"
  | "Par"
  | "Bogey"
  | "Double Bogey"
  | "Triple Bogey"
  | "Worse";

// Core Interfaces
export interface Tournament {
  _id: Id<"tournaments">;
  name: string;
  description: string;
  date: number;
  startHole: number;
  courseType: CourseType;
  gameMode: GameMode;
  scoringDisplay: ScoringDisplay;
  hiddenHoles: number[];
  specialScoringHoles?: number[]; // Holes with special scoring/leaderboard
  status: TournamentStatus;
  createdBy: Id<"users">;
  createdAt: number;
  bannerUrl?: string;
  bannerStorageId?: Id<"_storage">;
}

export interface Player {
  _id: Id<"users">;
  name: string;
  email: string;
  role: UserRole;
  handicap?: number;
}

export interface TournamentParticipant {
  _id: Id<"tournament_participants">;
  tournamentId: Id<"tournaments">;
  playerId: Id<"users">;
  startHole: number;
  registeredAt: number;
}

export interface Score {
  _id: Id<"scores">;
  tournamentId: Id<"tournaments">;
  playerId: Id<"users">;
  holeNumber: number;
  strokes: number;
  submittedAt: number;
}

export interface HoleConfig {
  _id: Id<"holes_config">;
  holeNumber: number;
  par: number;
  index: number;
  courseSection: CourseSection;
}

export interface ScoreClassification {
  name: ScoreClassificationName;
  strokesVsPar: number;
  color: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: Id<"users">;
  playerName: string;
  totalScore: number;
  totalPoints?: number;
  holesCompleted: number;
  lastUpdated: number;
}

export interface PlayerStatus {
  playerId: Id<"users">;
  playerName: string;
  startHole: number;
  currentHole: number;
  lastScoredHole: number;
  lastScore: number;
  holesCompleted: number;
  totalScore: number;
}

// Input Types for Mutations
export interface TournamentConfig {
  name: string;
  description: string;
  date: number;
  startHole: number;
  courseType: CourseType;
  gameMode: GameMode;
  scoringDisplay: ScoringDisplay;
}

export interface PlayerRegistration {
  playerId: Id<"users">;
  startHole: number;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TournamentDetails extends Tournament {
  participants: Array<Player & { startHole: number }>;
  holesConfig: HoleConfig[];
}
