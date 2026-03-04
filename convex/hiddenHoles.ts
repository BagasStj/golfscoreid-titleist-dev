import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Set Hidden Holes for Tournament
export const setHiddenHoles = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    hiddenHoles: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can set hidden holes");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Validate hidden holes based on course type
    let maxHole = 18;
    let minHole = 1;
    
    if (tournament.courseType === "F9") {
      maxHole = 9;
      minHole = 1;
    } else if (tournament.courseType === "B9") {
      maxHole = 18;
      minHole = 10;
    }

    // Validate all holes are within range
    for (const hole of args.hiddenHoles) {
      if (hole < minHole || hole > maxHole) {
        throw new Error(
          `Invalid hole number ${hole} for course type ${tournament.courseType}`
        );
      }
    }

    // Update tournament with hidden holes
    await ctx.db.patch(args.tournamentId, {
      hiddenHoles: args.hiddenHoles,
    });

    return { success: true };
  },
});
