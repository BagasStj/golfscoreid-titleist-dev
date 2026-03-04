import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type PlayerStatus = {
  playerId: Id<"users">;
  playerName: string;
  startHole: number;
  currentHole: number;
  lastScoredHole: number | null;
  lastScore: number | null;
  holesCompleted: number;
  totalScore: number;
  scorecard: Array<{
    holeNumber: number;
    strokes: number;
    par: number;
    index: number;
    submittedAt: number;
  }>;
};

/**
 * Get Live Monitoring
 * Returns all players with current status
 */
export const getLiveMonitoring = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get user from userId or auth
    let user;
    
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", identity.email!))
          .first();
      }
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can access live monitoring");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get all participants
    const participants = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Get holes config
    const holesConfig = await ctx.db.query("holes_config").collect();
    const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

    // Determine total holes based on course type
    let totalHoles = 18;
    if (tournament.courseType === "F9" || tournament.courseType === "B9") {
      totalHoles = 9;
    }

    // Build player status for each participant
    const playerStatuses: PlayerStatus[] = [];

    for (const participant of participants) {
      const player = await ctx.db.get(participant.playerId);
      if (!player) continue;

      // Get all scores for this player
      const scores = await ctx.db
        .query("scores")
        .withIndex("by_tournament_and_player", (q) =>
          q.eq("tournamentId", args.tournamentId).eq("playerId", participant.playerId)
        )
        .collect();

      // Sort scores by hole number
      scores.sort((a, b) => a.holeNumber - b.holeNumber);

      const holesCompleted = scores.length;

      // Calculate current hole: (startHole + completedHoles - 1) % totalHoles + 1
      let currentHole = participant.startHole;
      if (holesCompleted > 0) {
        currentHole = ((participant.startHole + holesCompleted - 1) % totalHoles) + 1;
      }

      // Get last scored hole and last score
      let lastScoredHole: number | null = null;
      let lastScore: number | null = null;

      if (scores.length > 0) {
        // Find the most recently submitted score
        const sortedByTime = [...scores].sort((a, b) => b.submittedAt - a.submittedAt);
        const mostRecent = sortedByTime[0];
        lastScoredHole = mostRecent.holeNumber;
        lastScore = mostRecent.strokes;
      }

      // Calculate total score (sum of strokes)
      const totalScore = scores.reduce((sum, score) => sum + score.strokes, 0);

      // Build complete scorecard with hole config
      const scorecard = scores.map((score) => {
        const holeConfig = holesMap.get(score.holeNumber);
        return {
          holeNumber: score.holeNumber,
          strokes: score.strokes,
          par: holeConfig?.par || 0,
          index: holeConfig?.index || 0,
          submittedAt: score.submittedAt,
        };
      });

      playerStatuses.push({
        playerId: participant.playerId,
        playerName: player.name,
        startHole: participant.startHole,
        currentHole,
        lastScoredHole,
        lastScore,
        holesCompleted,
        totalScore,
        scorecard,
      });
    }

    // Sort by player name for consistent display
    playerStatuses.sort((a, b) => a.playerName.localeCompare(b.playerName));

    return {
      tournament: {
        id: tournament._id,
        name: tournament.name,
        courseType: tournament.courseType,
        gameMode: tournament.gameMode,
      },
      totalHoles,
      players: playerStatuses,
    };
  },
});
