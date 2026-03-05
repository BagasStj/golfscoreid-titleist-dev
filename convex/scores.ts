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

// Get Scores for Multiple Players (for flight scoring overview)
export const getFlightScores = query({
  args: {
    tournamentId: v.id("tournaments"),
    playerIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get all scores for all players in this tournament
    const allScores = await ctx.db
      .query("scores")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Filter to only include scores for the specified players
    const playerIdsSet = new Set(args.playerIds);
    const filteredScores = allScores.filter(score => playerIdsSet.has(score.playerId));

    // Group scores by player
    const scoresByPlayer = new Map<string, typeof filteredScores>();
    for (const score of filteredScores) {
      const playerId = score.playerId;
      if (!scoresByPlayer.has(playerId)) {
        scoresByPlayer.set(playerId, []);
      }
      scoresByPlayer.get(playerId)!.push(score);
    }

    // Return as array of player scores
    return args.playerIds.map(playerId => ({
      playerId,
      scores: scoresByPlayer.get(playerId) || []
    }));
  },
});

// Submit Score for Another Player (within same flight) - Creates Pending Score
export const submitScoreForPlayer = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    scoringUserId: v.id("users"), // User who is inputting the score
    targetPlayerId: v.id("users"), // Player whose score is being recorded
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

    // Verify both users exist
    const scoringUser = await ctx.db.get(args.scoringUserId);
    const targetPlayer = await ctx.db.get(args.targetPlayerId);
    if (!scoringUser || !targetPlayer) {
      throw new Error("User not found");
    }

    // If scoring for self, submit directly without approval
    if (args.scoringUserId === args.targetPlayerId) {
      // Check for duplicate hole score
      const existingScore = await ctx.db
        .query("scores")
        .withIndex("by_tournament_player_hole", (q) =>
          q
            .eq("tournamentId", args.tournamentId)
            .eq("playerId", args.targetPlayerId)
            .eq("holeNumber", args.holeNumber)
        )
        .first();

      if (existingScore) {
        throw new Error("Duplicate Error: Score already exists for this hole. Use updateScore to modify.");
      }

      // Insert score directly
      const scoreId = await ctx.db.insert("scores", {
        tournamentId: args.tournamentId,
        playerId: args.targetPlayerId,
        holeNumber: args.holeNumber,
        strokes: args.strokes,
        submittedAt: Date.now(),
      });

      return { success: true, scoreId, requiresApproval: false };
    }

    // Authorization: Check if both users are in the same flight
    const allFlights = await ctx.db
      .query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    let scoringUserFlightId = null;
    let targetPlayerFlightId = null;

    // Check each flight's participants
    for (const flight of allFlights) {
      const flightParticipants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_flight", (q) => q.eq("flightId", flight._id))
        .collect();
      
      const participantIds = flightParticipants.map(p => p.playerId);
      
      if (participantIds.includes(args.scoringUserId)) {
        scoringUserFlightId = flight._id;
      }
      if (participantIds.includes(args.targetPlayerId)) {
        targetPlayerFlightId = flight._id;
      }
    }

    // Check if both users are in the same flight
    if (!scoringUserFlightId || !targetPlayerFlightId || scoringUserFlightId !== targetPlayerFlightId) {
      throw new Error("Authorization Error: You can only input scores for players in your flight");
    }

    // Check for existing pending score for this hole
    const existingPending = await ctx.db
      .query("pending_scores")
      .withIndex("by_tournament_target_hole", (q) =>
        q
          .eq("tournamentId", args.tournamentId)
          .eq("targetPlayerId", args.targetPlayerId)
          .eq("holeNumber", args.holeNumber)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingPending) {
      throw new Error("A pending score already exists for this hole. Please wait for approval.");
    }

    // Check if score already exists (approved)
    const existingScore = await ctx.db
      .query("scores")
      .withIndex("by_tournament_player_hole", (q) =>
        q
          .eq("tournamentId", args.tournamentId)
          .eq("playerId", args.targetPlayerId)
          .eq("holeNumber", args.holeNumber)
      )
      .first();

    if (existingScore) {
      throw new Error("Score already exists for this hole.");
    }

    // Create pending score
    const pendingScoreId = await ctx.db.insert("pending_scores", {
      tournamentId: args.tournamentId,
      targetPlayerId: args.targetPlayerId,
      scoringUserId: args.scoringUserId,
      holeNumber: args.holeNumber,
      strokes: args.strokes,
      status: "pending",
      submittedAt: Date.now(),
    });

    return { success: true, pendingScoreId, requiresApproval: true };
  },
});

// Update Score for Another Player (within same flight)
export const updateScoreForPlayer = mutation({
  args: {
    scoreId: v.id("scores"),
    scoringUserId: v.id("users"), // User who is updating the score
    targetPlayerId: v.id("users"), // Player whose score is being updated
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

    // Verify the score belongs to the target player
    if (score.playerId !== args.targetPlayerId) {
      throw new Error("Score does not belong to the specified player");
    }

    // Authorization: Check if both users are in the same flight
    const allFlights = await ctx.db
      .query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", score.tournamentId))
      .collect();

    let scoringUserFlightId = null;
    let targetPlayerFlightId = null;

    // Check each flight's participants
    for (const flight of allFlights) {
      const flightParticipants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_flight", (q) => q.eq("flightId", flight._id))
        .collect();
      
      const participantIds = flightParticipants.map(p => p.playerId);
      
      if (participantIds.includes(args.scoringUserId)) {
        scoringUserFlightId = flight._id;
      }
      if (participantIds.includes(args.targetPlayerId)) {
        targetPlayerFlightId = flight._id;
      }
    }

    // Allow if:
    // 1. Same user (updating their own score)
    // 2. Both users are in the same flight
    if (args.scoringUserId !== args.targetPlayerId) {
      if (!scoringUserFlightId || !targetPlayerFlightId || scoringUserFlightId !== targetPlayerFlightId) {
        throw new Error("Authorization Error: You can only update scores for players in your flight");
      }
    }

    // Update the score
    await ctx.db.patch(args.scoreId, {
      strokes: args.newStrokes,
      submittedAt: Date.now(), // Update timestamp
    });

    return { success: true };
  },
});

// Get Pending Scores for a Player
export const getPendingScores = query({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pendingScores = await ctx.db
      .query("pending_scores")
      .withIndex("by_target_player_and_status", (q) =>
        q.eq("targetPlayerId", args.playerId).eq("status", "pending")
      )
      .collect();

    // Enrich with tournament and scoring user info
    const enrichedScores = await Promise.all(
      pendingScores.map(async (score) => {
        const scoringUser = await ctx.db.get(score.scoringUserId);
        
        // Get tournament details with holesConfig
        const tournament = await ctx.db.get(score.tournamentId);
        if (!tournament) {
          return {
            ...score,
            tournamentName: "Unknown",
            scoringUserName: scoringUser?.name || "Unknown",
            par: 0,
          };
        }

        // Get holes config
        let holesConfig = await ctx.db.query("holes_config").collect();
        if (tournament.courseType === "F9") {
          holesConfig = holesConfig.filter((h) => h.holeNumber >= 1 && h.holeNumber <= 9);
        } else if (tournament.courseType === "B9") {
          holesConfig = holesConfig.filter((h) => h.holeNumber >= 10 && h.holeNumber <= 18);
        }
        
        const holeConfig = holesConfig.find((h) => h.holeNumber === score.holeNumber);

        return {
          ...score,
          tournamentName: tournament.name,
          scoringUserName: scoringUser?.name || "Unknown",
          par: holeConfig?.par || 0,
        };
      })
    );

    return enrichedScores;
  },
});

// Approve Pending Score
export const approvePendingScore = mutation({
  args: {
    pendingScoreId: v.id("pending_scores"),
    approvingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pendingScore = await ctx.db.get(args.pendingScoreId);
    if (!pendingScore) {
      throw new Error("Pending score not found");
    }

    // Verify the approving user is the target player
    if (pendingScore.targetPlayerId !== args.approvingUserId) {
      throw new Error("Authorization Error: You can only approve your own scores");
    }

    // Verify status is still pending
    if (pendingScore.status !== "pending") {
      throw new Error("This score has already been processed");
    }

    // Check if score already exists (in case it was added by another method)
    const existingScore = await ctx.db
      .query("scores")
      .withIndex("by_tournament_player_hole", (q) =>
        q
          .eq("tournamentId", pendingScore.tournamentId)
          .eq("playerId", pendingScore.targetPlayerId)
          .eq("holeNumber", pendingScore.holeNumber)
      )
      .first();

    if (existingScore) {
      // Update pending score status to approved but don't create duplicate
      await ctx.db.patch(args.pendingScoreId, {
        status: "approved",
        respondedAt: Date.now(),
      });
      return { success: true, message: "Score already exists" };
    }

    // Create the actual score
    const scoreId = await ctx.db.insert("scores", {
      tournamentId: pendingScore.tournamentId,
      playerId: pendingScore.targetPlayerId,
      holeNumber: pendingScore.holeNumber,
      strokes: pendingScore.strokes,
      submittedAt: Date.now(),
    });

    // Update pending score status
    await ctx.db.patch(args.pendingScoreId, {
      status: "approved",
      respondedAt: Date.now(),
    });

    return { success: true, scoreId };
  },
});

// Reject Pending Score
export const rejectPendingScore = mutation({
  args: {
    pendingScoreId: v.id("pending_scores"),
    rejectingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pendingScore = await ctx.db.get(args.pendingScoreId);
    if (!pendingScore) {
      throw new Error("Pending score not found");
    }

    // Verify the rejecting user is the target player
    if (pendingScore.targetPlayerId !== args.rejectingUserId) {
      throw new Error("Authorization Error: You can only reject your own scores");
    }

    // Verify status is still pending
    if (pendingScore.status !== "pending") {
      throw new Error("This score has already been processed");
    }

    // Update pending score status
    await ctx.db.patch(args.pendingScoreId, {
      status: "rejected",
      respondedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get Pending Score Status (for the scoring user to check)
export const getPendingScoreStatus = query({
  args: {
    pendingScoreId: v.id("pending_scores"),
  },
  handler: async (ctx, args) => {
    const pendingScore = await ctx.db.get(args.pendingScoreId);
    if (!pendingScore) {
      return null;
    }

    const targetPlayer = await ctx.db.get(pendingScore.targetPlayerId);
    
    return {
      ...pendingScore,
      targetPlayerName: targetPlayer?.name,
    };
  },
});
