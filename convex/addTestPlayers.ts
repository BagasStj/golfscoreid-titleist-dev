import { mutation } from "./_generated/server";

// Add more test players
export const addMorePlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPlayers = await ctx.db.query("users").collect();
    const playerCount = existingPlayers.filter((u) => u.role === "player").length;

    if (playerCount >= 3) {
      return {
        success: true,
        message: "Already have enough players",
        playerCount,
      };
    }

    // Add more players
    const newPlayers = [];
    
    for (let i = playerCount + 1; i <= 3; i++) {
      const playerId = await ctx.db.insert("users", {
        email: `player${i}@golfscore.id`,
        name: `Player ${i}`,
        role: "player",
        handicap: 10 + i,
      });
      newPlayers.push(playerId);
    }

    return {
      success: true,
      message: `Added ${newPlayers.length} new players`,
      newPlayers,
    };
  },
});
