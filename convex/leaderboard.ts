import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { calculateStablefordPoints, calculateSystem36Points } from "./calculations";

export type LeaderboardEntry = {
  rank: number;
  playerId: Id<"users">;
  playerName: string;
  totalScore: number;
  totalPoints?: number;
  holesCompleted: number;
  lastUpdated: number;
};

export type GameMode = "strokePlay" | "system36" | "stableford";

/**
 * Calculate ranking for all holes
 * Aggregates all scores and sorts by game mode rules
 */
async function calculateAllHolesRanking(
  ctx: QueryCtx,
  tournamentId: Id<"tournaments">,
  gameMode: GameMode,
  courseType: string
): Promise<LeaderboardEntry[]> {
  // Get all scores for this tournament
  const allScores = await ctx.db
    .query("scores")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();

  // Get holes config to determine par values
  let holesConfig = await ctx.db.query("holes_config").collect();
  
  // Filter holes based on course type
  if (courseType === "F9") {
    holesConfig = holesConfig.filter((h) => h.holeNumber >= 1 && h.holeNumber <= 9);
  } else if (courseType === "B9") {
    holesConfig = holesConfig.filter((h) => h.holeNumber >= 10 && h.holeNumber <= 18);
  }
  
  const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

  // Get all participants
  const participants = await ctx.db
    .query("tournament_participants")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();

  // Group scores by player
  const playerScoresMap = new Map<Id<"users">, typeof allScores>();
  for (const score of allScores) {
    if (!playerScoresMap.has(score.playerId)) {
      playerScoresMap.set(score.playerId, []);
    }
    playerScoresMap.get(score.playerId)!.push(score);
  }

  // Calculate totals for each player
  const entries: LeaderboardEntry[] = [];
  
  for (const participant of participants) {
    const player = await ctx.db.get(participant.playerId);
    if (!player) continue;

    const playerScores = playerScoresMap.get(participant.playerId) || [];
    const holesCompleted = playerScores.length;
    
    let totalScore = 0;
    let totalPoints = 0;
    let lastUpdated = 0;

    for (const score of playerScores) {
      const holeConfig = holesMap.get(score.holeNumber);
      if (!holeConfig) continue;

      if (gameMode === "strokePlay") {
        totalScore += score.strokes;
      } else if (gameMode === "stableford") {
        totalPoints += calculateStablefordPoints(score.strokes, holeConfig.par);
      } else if (gameMode === "system36") {
        totalPoints += calculateSystem36Points(score.strokes, holeConfig.par);
      }

      if (score.submittedAt > lastUpdated) {
        lastUpdated = score.submittedAt;
      }
    }

    entries.push({
      rank: 0, // Will be assigned after sorting
      playerId: participant.playerId,
      playerName: player.name,
      totalScore: gameMode === "strokePlay" ? totalScore : totalPoints,
      totalPoints: gameMode !== "strokePlay" ? totalPoints : undefined,
      holesCompleted,
      lastUpdated: lastUpdated || participant.registeredAt,
    });
  }

  // Sort by game mode rules
  if (gameMode === "strokePlay") {
    // Stroke play: ascending (lower is better)
    entries.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return a.totalScore - b.totalScore;
      }
      // Tie-breaker: more holes completed is better
      return b.holesCompleted - a.holesCompleted;
    });
  } else {
    // Points-based modes: descending (higher is better)
    entries.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Tie-breaker: more holes completed is better
      return b.holesCompleted - a.holesCompleted;
    });
  }

  // Assign ranks with tie-breaking logic
  // Same score = same rank, next rank skips
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalScore !== entries[i - 1].totalScore) {
      currentRank = i + 1;
    }
    entries[i].rank = currentRank;
  }

  return entries;
}

/**
 * Calculate ranking for special scoring holes only
 * Filters to special holes, aggregates, and sorts
 */
async function calculateSpecialHolesRanking(
  ctx: QueryCtx,
  tournamentId: Id<"tournaments">,
  specialHoles: number[],
  gameMode: GameMode
): Promise<LeaderboardEntry[]> {
  // Get all scores for this tournament
  const allScores = await ctx.db
    .query("scores")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();

  // Filter to only special holes
  const specialScores = allScores.filter((score) => 
    specialHoles.includes(score.holeNumber)
  );

  // Get holes config for par values
  const holesConfig = await ctx.db.query("holes_config").collect();
  const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

  // Get all participants
  const participants = await ctx.db
    .query("tournament_participants")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();

  // Group scores by player
  const playerScoresMap = new Map<Id<"users">, typeof specialScores>();
  for (const score of specialScores) {
    if (!playerScoresMap.has(score.playerId)) {
      playerScoresMap.set(score.playerId, []);
    }
    playerScoresMap.get(score.playerId)!.push(score);
  }

  // Calculate totals for each player (only special holes)
  const entries: LeaderboardEntry[] = [];
  
  for (const participant of participants) {
    const player = await ctx.db.get(participant.playerId);
    if (!player) continue;

    const playerScores = playerScoresMap.get(participant.playerId) || [];
    const holesCompleted = playerScores.length;
    
    let totalScore = 0;
    let totalPoints = 0;
    let lastUpdated = 0;

    for (const score of playerScores) {
      const holeConfig = holesMap.get(score.holeNumber);
      if (!holeConfig) continue;

      if (gameMode === "strokePlay") {
        totalScore += score.strokes;
      } else if (gameMode === "stableford") {
        totalPoints += calculateStablefordPoints(score.strokes, holeConfig.par);
      } else if (gameMode === "system36") {
        totalPoints += calculateSystem36Points(score.strokes, holeConfig.par);
      }

      if (score.submittedAt > lastUpdated) {
        lastUpdated = score.submittedAt;
      }
    }

    entries.push({
      rank: 0, // Will be assigned after sorting
      playerId: participant.playerId,
      playerName: player.name,
      totalScore: gameMode === "strokePlay" ? totalScore : totalPoints,
      totalPoints: gameMode !== "strokePlay" ? totalPoints : undefined,
      holesCompleted,
      lastUpdated: lastUpdated || participant.registeredAt,
    });
  }

  // Sort by game mode rules
  if (gameMode === "strokePlay") {
    // Stroke play: ascending (lower is better)
    entries.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return a.totalScore - b.totalScore;
      }
      return b.holesCompleted - a.holesCompleted;
    });
  } else {
    // Points-based modes: descending (higher is better)
    entries.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.holesCompleted - a.holesCompleted;
    });
  }

  // Assign ranks with tie-breaking logic
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalScore !== entries[i - 1].totalScore) {
      currentRank = i + 1;
    }
    entries[i].rank = currentRank;
  }

  return entries;
}

/**
 * Get Leaderboard
 * Returns both rankings: all holes and special holes (if configured)
 */
export const getLeaderboard = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Calculate all holes ranking
    const allHolesRanking = await calculateAllHolesRanking(
      ctx,
      args.tournamentId,
      tournament.gameMode as GameMode,
      tournament.courseType
    );

    // Calculate special holes ranking if configured
    let hiddenHolesRanking: LeaderboardEntry[] | null = null;
    if (tournament.specialScoringHoles && tournament.specialScoringHoles.length > 0) {
      hiddenHolesRanking = await calculateSpecialHolesRanking(
        ctx,
        args.tournamentId,
        tournament.specialScoringHoles,
        tournament.gameMode as GameMode
      );
    }

    return {
      allHolesRanking,
      hiddenHolesRanking,
      gameMode: tournament.gameMode,
      courseType: tournament.courseType,
    };
  },
});

/**
 * Get detailed leaderboard with hole-by-hole scores
 */
export const getDetailedLeaderboard = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get all scores for this tournament
    const allScores = await ctx.db
      .query("scores")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get holes config
    let holesConfig = await ctx.db.query("holes_config").collect();
    
    // Filter holes based on course type
    if (tournament.courseType === "F9") {
      holesConfig = holesConfig.filter((h) => h.holeNumber >= 1 && h.holeNumber <= 9);
    } else if (tournament.courseType === "B9") {
      holesConfig = holesConfig.filter((h) => h.holeNumber >= 10 && h.holeNumber <= 18);
    }
    
    const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

    // Get all participants
    const participants = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Group scores by player
    const playerScoresMap = new Map<string, typeof allScores>();
    for (const score of allScores) {
      if (!playerScoresMap.has(score.playerId)) {
        playerScoresMap.set(score.playerId, []);
      }
      playerScoresMap.get(score.playerId)!.push(score);
    }

    // Build detailed player data
    const playersData = [];
    
    for (const participant of participants) {
      const player = await ctx.db.get(participant.playerId);
      if (!player) continue;

      const playerScores = playerScoresMap.get(participant.playerId) || [];
      const holesCompleted = playerScores.length;
      
      // Create scorecard array
      const scorecard = holesConfig.map(holeConfig => {
        const score = playerScores.find(s => s.holeNumber === holeConfig.holeNumber);
        return {
          holeNumber: holeConfig.holeNumber,
          par: holeConfig.par,
          strokes: score?.strokes || null,
        };
      });

      let totalScore = 0;
      let totalPoints = 0;

      for (const score of playerScores) {
        const holeConfig = holesMap.get(score.holeNumber);
        if (!holeConfig) continue;

        if (tournament.gameMode === "strokePlay") {
          totalScore += score.strokes;
        } else if (tournament.gameMode === "stableford") {
          totalPoints += calculateStablefordPoints(score.strokes, holeConfig.par);
        } else if (tournament.gameMode === "system36") {
          totalPoints += calculateSystem36Points(score.strokes, holeConfig.par);
        }
      }

      playersData.push({
        playerId: participant.playerId,
        playerName: player.name,
        totalScore: tournament.gameMode === "strokePlay" ? totalScore : totalPoints,
        holesCompleted,
        scorecard,
        rank: 0, // Will be assigned after sorting
      });
    }

    // Sort players
    if (tournament.gameMode === "strokePlay") {
      playersData.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
        return b.holesCompleted - a.holesCompleted;
      });
    } else {
      playersData.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
        return b.holesCompleted - a.holesCompleted;
      });
    }

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < playersData.length; i++) {
      if (i > 0 && playersData[i].totalScore !== playersData[i - 1].totalScore) {
        currentRank = i + 1;
      }
      playersData[i].rank = currentRank;
    }

    return {
      tournament,
      holesConfig,
      players: playersData,
      gameMode: tournament.gameMode,
      courseType: tournament.courseType,
    };
  },
});

/**
 * Debug query to check tournament data
 */
export const debugTournamentData = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    
    const participants = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const holesConfig = await ctx.db.query("holes_config").collect();
    
    return {
      tournament,
      participantsCount: participants.length,
      participants,
      scoresCount: scores.length,
      scores,
      holesConfigCount: holesConfig.length,
    };
  },
});
