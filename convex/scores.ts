import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { classifyScore, calculateStablefordPoints, calculateSystem36Points } from "./calculations";

// Submit Score
export const submitScore = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
    holeNumber: v.number(),
    strokes: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate positive integer
    if (!Number.isInteger(args.strokes) || args.strokes <= 0) {
      throw new Error("Validation Error: Strokes must be a positive integer");
    }

    // Verify tournament exists
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Verify player exists
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check for duplicate hole score
    const existingScore = await ctx.db
      .query("scores")
      .withIndex("by_tournament_player_hole", (q) =>
        q
          .eq("tournamentId", args.tournamentId)
          .eq("playerId", args.playerId)
          .eq("holeNumber", args.holeNumber)
      )
      .first();

    if (existingScore) {
      throw new Error("Duplicate Error: Score already exists for this hole. Use updateScore to modify.");
    }

    // Insert score
    const scoreId = await ctx.db.insert("scores", {
      tournamentId: args.tournamentId,
      playerId: args.playerId,
      holeNumber: args.holeNumber,
      strokes: args.strokes,
      submittedAt: Date.now(),
    });

    return { success: true, scoreId };
  },
});

// Update Score
export const updateScore = mutation({
  args: {
    scoreId: v.id("scores"),
    playerId: v.id("users"), // Add playerId for authorization
    newStrokes: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate positive integer
    if (!Number.isInteger(args.newStrokes) || args.newStrokes <= 0) {
      throw new Error("Validation Error: Strokes must be a positive integer");
    }

    // Get the score
    const score = await ctx.db.get(args.scoreId);
    if (!score) {
      throw new Error("Score not found");
    }

    // Authorization: Player can only update own scores
    if (score.playerId !== args.playerId) {
      throw new Error("Authorization Error: You can only update your own scores");
    }

    // Update the score
    await ctx.db.patch(args.scoreId, {
      strokes: args.newStrokes,
      submittedAt: Date.now(), // Update timestamp
    });

    return { success: true };
  },
});

// Get Player Scores
export const getPlayerScores = query({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all scores for this player in this tournament
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_tournament_and_player", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("playerId", args.playerId)
      )
      .collect();

    // Get holes config
    const holesConfig = await ctx.db.query("holes_config").collect();
    const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

    // Get tournament to determine game mode
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Enrich scores with hole config and classification
    const enrichedScores = scores.map((score) => {
      const holeConfig = holesMap.get(score.holeNumber);
      if (!holeConfig) {
        return {
          ...score,
          par: 0,
          index: 0,
          classification: "Unknown",
          strokesVsPar: 0,
          points: 0,
        };
      }

      const classification = classifyScore(score.strokes, holeConfig.par);
      const points = calculatePoints(score.strokes, holeConfig.par, tournament.gameMode);

      return {
        ...score,
        par: holeConfig.par,
        index: holeConfig.index,
        classification: classification.name,
        strokesVsPar: classification.strokesVsPar,
        color: classification.color,
        points,
      };
    });

    // Sort by hole number
    enrichedScores.sort((a, b) => a.holeNumber - b.holeNumber);

    return enrichedScores;
  },
});

// Helper: Calculate Points based on game mode
function calculatePoints(strokes: number, par: number, gameMode: string): number {
  if (gameMode === "stableford") {
    return calculateStablefordPoints(strokes, par);
  } else if (gameMode === "system36") {
    return calculateSystem36Points(strokes, par);
  }
  // Stroke play doesn't use points
  return 0;
}
