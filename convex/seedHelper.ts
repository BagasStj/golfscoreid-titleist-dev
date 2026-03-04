import { mutation } from "./_generated/server";

/**
 * Helper function to seed all test data
 * Run this once to set up test environment
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      users: null as any,
      message: "",
    };

    // 1. Seed users
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "admin"))
      .first();

    if (!existingAdmin) {
      // Create admin user
      await ctx.db.insert("users", {
        email: "admin@golfscore.id",
        username: "admin",
        password: "admin123",
        name: "Admin User",
        role: "admin",
      });

      // Create test players
      await ctx.db.insert("users", {
        email: "player1@golfscore.id",
        username: "player1",
        password: "player123",
        name: "John Doe",
        role: "player",
        handicap: 12,
      });

      await ctx.db.insert("users", {
        email: "player2@golfscore.id",
        username: "player2",
        password: "player123",
        name: "Jane Smith",
        role: "player",
        handicap: 18,
      });

      await ctx.db.insert("users", {
        email: "player3@golfscore.id",
        username: "player3",
        password: "player123",
        name: "Bob Wilson",
        role: "player",
        handicap: 8,
      });

      results.users = {
        admin: { username: "admin", password: "admin123" },
        players: [
          { username: "player1", password: "player123" },
          { username: "player2", password: "player123" },
          { username: "player3", password: "player123" },
        ],
      };
      results.message = "✅ Test users created successfully!";
    } else {
      results.message = "ℹ️ Test users already exist";
    }

    return results;
  },
});

/**
 * Check if test users exist
 */
export const checkTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "admin"))
      .first();

    const player1 = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "player1"))
      .first();

    return {
      adminExists: !!admin,
      player1Exists: !!player1,
      message: admin && player1 
        ? "✅ Test users are ready!" 
        : "❌ Test users not found. Run seedAll to create them.",
      credentials: {
        admin: { username: "admin", password: "admin123" },
        player: { username: "player1", password: "player123" },
      },
    };
  },
});

/**
 * Reset all test users (delete and recreate)
 */
export const resetTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing test users
    const testUsernames = ["admin", "player1", "player2", "player3"];
    
    for (const username of testUsernames) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("username"), username))
        .first();
      
      if (user) {
        await ctx.db.delete(user._id);
      }
    }

    // Recreate users
    await ctx.db.insert("users", {
      email: "admin@golfscore.id",
      username: "admin",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    });

    await ctx.db.insert("users", {
      email: "player1@golfscore.id",
      username: "player1",
      password: "player123",
      name: "John Doe",
      role: "player",
      handicap: 12,
    });

    await ctx.db.insert("users", {
      email: "player2@golfscore.id",
      username: "player2",
      password: "player123",
      name: "Jane Smith",
      role: "player",
      handicap: 18,
    });

    await ctx.db.insert("users", {
      email: "player3@golfscore.id",
      username: "player3",
      password: "player123",
      name: "Bob Wilson",
      role: "player",
      handicap: 8,
    });

    return {
      message: "✅ Test users reset successfully!",
      credentials: {
        admin: { username: "admin", password: "admin123" },
        players: [
          { username: "player1", password: "player123" },
          { username: "player2", password: "player123" },
          { username: "player3", password: "player123" },
        ],
      },
    };
  },
});
