import { mutation } from "./_generated/server";

// Seed test users for development
export const seedTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if users already exist
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return { 
        success: true, 
        message: "Users already exist",
        count: existingUsers.length 
      };
    }

    // Create admin user
    const adminId = await ctx.db.insert("users", {
      email: "admin@golfscore.id",
      name: "Admin User",
      role: "admin",
    });

    // Create test players
    const player1Id = await ctx.db.insert("users", {
      email: "player1@golfscore.id",
      name: "Player One",
      role: "player",
      handicap: 12,
    });

    const player2Id = await ctx.db.insert("users", {
      email: "player2@golfscore.id",
      name: "Player Two",
      role: "player",
      handicap: 18,
    });

    const player3Id = await ctx.db.insert("users", {
      email: "player3@golfscore.id",
      name: "Player Three",
      role: "player",
      handicap: 8,
    });

    return {
      success: true,
      message: "Test users created successfully",
      users: {
        admin: adminId,
        players: [player1Id, player2Id, player3Id],
      },
    };
  },
});
