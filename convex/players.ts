import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Register Players to Tournament
export const registerPlayers = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    flightId: v.id("tournament_flights"), // Now required - players must be assigned to a flight
    players: v.array(
      v.object({
        playerId: v.id("users"),
        startHole: v.number(),
      })
    ),
    userId: v.id("users"), // Admin user ID
  },
  handler: async (ctx, args) => {
    // Get admin user
    const user = await ctx.db.get(args.userId);

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can register players");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Verify flight exists and belongs to tournament
    const flight = await ctx.db.get(args.flightId);
    if (!flight || flight.tournamentId !== args.tournamentId) {
      throw new Error("Flight not found or does not belong to this tournament");
    }

    let registered = 0;
    const errors: string[] = [];

    for (const playerReg of args.players) {
      // Check if player exists
      const player = await ctx.db.get(playerReg.playerId);
      if (!player) {
        errors.push(`Player ${playerReg.playerId} not found`);
        continue;
      }

      // Check for duplicate registration
      const existing = await ctx.db
        .query("tournament_participants")
        .withIndex("by_tournament_and_player", (q) =>
          q.eq("tournamentId", args.tournamentId).eq("playerId", playerReg.playerId)
        )
        .first();

      if (existing) {
        errors.push(`Player ${player.name} already registered`);
        continue;
      }

      // Register player
      await ctx.db.insert("tournament_participants", {
        tournamentId: args.tournamentId,
        flightId: args.flightId,
        playerId: playerReg.playerId,
        startHole: playerReg.startHole,
        registeredAt: Date.now(),
      });

      registered++;
    }

    return {
      success: true,
      registered,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});
