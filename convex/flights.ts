import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create Flight
export const createFlight = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    flightName: v.string(),
    flightNumber: v.number(),
    startTime: v.optional(v.string()),
    startHole: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create flights");
    }

    // Check if tournament exists
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check for duplicate flight number
    const existing = await ctx.db
      .query("tournament_flights")
      .withIndex("by_tournament_and_number", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("flightNumber", args.flightNumber)
      )
      .first();

    if (existing) {
      throw new Error(`Flight number ${args.flightNumber} already exists`);
    }

    const flightId = await ctx.db.insert("tournament_flights", {
      tournamentId: args.tournamentId,
      flightName: args.flightName,
      flightNumber: args.flightNumber,
      startTime: args.startTime,
      startHole: args.startHole,
      createdAt: Date.now(),
    });

    return { success: true, flightId };
  },
});

// Get Flights by Tournament
export const getFlightsByTournament = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const flights = await ctx.db
      .query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Sort by flight number
    flights.sort((a, b) => a.flightNumber - b.flightNumber);

    // Get participant count for each flight
    const flightsWithCounts = await Promise.all(
      flights.map(async (flight) => {
        const participants = await ctx.db
          .query("tournament_participants")
          .withIndex("by_flight", (q) => q.eq("flightId", flight._id))
          .collect();

        return {
          ...flight,
          participantCount: participants.length,
        };
      })
    );

    return flightsWithCounts;
  },
});

// Get Flight Details with Participants
export const getFlightDetails = query({
  args: {
    flightId: v.id("tournament_flights"),
  },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Get participants
    const participations = await ctx.db
      .query("tournament_participants")
      .withIndex("by_flight", (q) => q.eq("flightId", args.flightId))
      .collect();

    const participants = await Promise.all(
      participations.map(async (p) => {
        const player = await ctx.db.get(p.playerId);
        return player
          ? {
              ...player,
              startHole: p.startHole,
              registeredAt: p.registeredAt,
              participationId: p._id,
            }
          : null;
      })
    );

    return {
      ...flight,
      participants: participants.filter((p) => p !== null),
    };
  },
});

// Get Flight with Players (alias for compatibility)
export const getFlightWithPlayers = getFlightDetails;

// Get Tournament Flights (alias for compatibility)
export const getTournamentFlights = getFlightsByTournament;

// Add Player to Flight
export const addPlayerToFlight = mutation({
  args: {
    flightId: v.id("tournament_flights"),
    playerId: v.id("users"),
    startHole: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can add players to flights");
    }

    // Check if flight exists
    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Check if player exists
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if player is already in this tournament
    const existingInTournament = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament_and_player", (q) =>
        q.eq("tournamentId", flight.tournamentId).eq("playerId", args.playerId)
      )
      .first();

    if (existingInTournament) {
      throw new Error("Player already registered in this tournament");
    }

    // Add player to flight
    const participationId = await ctx.db.insert("tournament_participants", {
      tournamentId: flight.tournamentId,
      flightId: args.flightId,
      playerId: args.playerId,
      startHole: args.startHole,
      registeredAt: Date.now(),
    });

    return { success: true, participationId };
  },
});

// Remove Player from Flight
export const removePlayerFromFlight = mutation({
  args: {
    participationId: v.id("tournament_participants"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can remove players from flights");
    }

    const participation = await ctx.db.get(args.participationId);
    if (!participation) {
      throw new Error("Participation not found");
    }

    await ctx.db.delete(args.participationId);
    return { success: true };
  },
});

// Update Player Start Hole
export const updatePlayerStartHole = mutation({
  args: {
    participationId: v.id("tournament_participants"),
    startHole: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update player start hole");
    }

    // Validate start hole
    if (args.startHole < 1 || args.startHole > 18) {
      throw new Error("Start hole must be between 1 and 18");
    }

    const participation = await ctx.db.get(args.participationId);
    if (!participation) {
      throw new Error("Participation not found");
    }

    await ctx.db.patch(args.participationId, {
      startHole: args.startHole,
    });

    return { success: true };
  },
});

// Update Flight
export const updateFlight = mutation({
  args: {
    flightId: v.id("tournament_flights"),
    flightName: v.optional(v.string()),
    startTime: v.optional(v.string()),
    startHole: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update flights");
    }

    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    const updates: any = {};
    if (args.flightName !== undefined) updates.flightName = args.flightName;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.startHole !== undefined) updates.startHole = args.startHole;

    await ctx.db.patch(args.flightId, updates);
    return { success: true };
  },
});

// Delete Flight
export const deleteFlight = mutation({
  args: {
    flightId: v.id("tournament_flights"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete flights");
    }

    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Check if flight has participants
    const participants = await ctx.db
      .query("tournament_participants")
      .withIndex("by_flight", (q) => q.eq("flightId", args.flightId))
      .collect();

    if (participants.length > 0) {
      throw new Error("Cannot delete flight with participants. Remove all players first.");
    }

    await ctx.db.delete(args.flightId);
    return { success: true };
  },
});

// Get Player's Flight in Tournament with all flight members
export const getPlayerFlight = query({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participation = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament_and_player", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("playerId", args.playerId)
      )
      .first();

    if (!participation || !participation.flightId) {
      return null;
    }

    const flight = await ctx.db.get(participation.flightId);
    if (!flight) return null;

    // Get all players in this flight
    const flightParticipations = await ctx.db
      .query("tournament_participants")
      .withIndex("by_flight", (q) => q.eq("flightId", participation.flightId))
      .collect();

    const flightMembers = await Promise.all(
      flightParticipations.map(async (p) => {
        const player = await ctx.db.get(p.playerId);
        return player
          ? {
              ...player,
              startHole: p.startHole,
              registeredAt: p.registeredAt,
              participationId: p._id,
            }
          : null;
      })
    );

    return {
      ...flight,
      members: flightMembers.filter((m) => m !== null),
    };
  },
});

// Move Player to Different Flight
export const movePlayerToFlight = mutation({
  args: {
    participationId: v.id("tournament_participants"),
    newFlightId: v.id("tournament_flights"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can move players between flights");
    }

    const participation = await ctx.db.get(args.participationId);
    if (!participation) {
      throw new Error("Participation not found");
    }

    const newFlight = await ctx.db.get(args.newFlightId);
    if (!newFlight) {
      throw new Error("Target flight not found");
    }

    // Verify the new flight belongs to the same tournament
    if (newFlight.tournamentId !== participation.tournamentId) {
      throw new Error("Cannot move player to a flight in a different tournament");
    }

    // Update the participation record
    await ctx.db.patch(args.participationId, {
      flightId: args.newFlightId,
      startHole: newFlight.startHole, // Update start hole to match new flight
    });

    return { success: true };
  },
});

// Get or Create Player (for Excel upload)
export const getOrCreatePlayer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    handicap: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if player exists by email
    const existingPlayer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingPlayer) {
      // Update handicap if provided and different
      if (args.handicap !== undefined && existingPlayer.handicap !== args.handicap) {
        await ctx.db.patch(existingPlayer._id, { handicap: args.handicap });
      }
      return { success: true, playerId: existingPlayer._id };
    }

    // Create new player
    const playerId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "player",
      handicap: args.handicap || 0,
    });

    return { success: true, playerId };
  },
});

// Get Tournament Flights with All Participants
export const getTournamentFlightsWithParticipants = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const flights = await ctx.db
      .query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Sort by flight number
    flights.sort((a, b) => a.flightNumber - b.flightNumber);

    // Get participants for each flight
    const flightsWithParticipants = await Promise.all(
      flights.map(async (flight) => {
        const participations = await ctx.db
          .query("tournament_participants")
          .withIndex("by_flight", (q) => q.eq("flightId", flight._id))
          .collect();

        const participants = await Promise.all(
          participations.map(async (p) => {
            const player = await ctx.db.get(p.playerId);
            return player
              ? {
                  ...player,
                  startHole: p.startHole,
                  registeredAt: p.registeredAt,
                  participationId: p._id,
                }
              : null;
          })
        );

        return {
          ...flight,
          participants: participants.filter((p) => p !== null),
          participantCount: participants.filter((p) => p !== null).length,
        };
      })
    );

    return flightsWithParticipants;
  },
});
