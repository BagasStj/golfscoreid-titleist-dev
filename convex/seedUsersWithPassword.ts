import { mutation } from "./_generated/server";

// Seed users with password for testing
export const seedTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if users already exist
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "admin"))
      .first();

    if (existingAdmin) {
      return { message: "Test users already exist" };
    }

    // Create admin user
    await ctx.db.insert("users", {
      email: "admin@golfscore.id",
      username: "admin",
      password: "$2b$10$T3m.FzIozY5dBOHinwAFxOjj3U/TOu2mzvR0XkATu1Xx9oUj8uupW", // In production, this should be hashed
      name: "Admin User",
      role: "admin",
    });

    // Create test players
    await ctx.db.insert("users", {
      email: "player1@golfscore.id",
      username: "player1",
      password: "$2b$10$T3m.FzIozY5dBOHinwAFxOjj3U/TOu2mzvR0XkATu1Xx9oUj8uupW",
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
      message: "Test users created successfully",
      users: [
        { username: "admin", password: "$2b$10$T3m.FzIozY5dBOHinwAFxOjj3U/TOu2mzvR0XkATu1Xx9oUj8uupW", role: "admin" },
        { username: "player1", password: "$2b$10$T3m.FzIozY5dBOHinwAFxOjj3U/TOu2mzvR0XkATu1Xx9oUj8uupW", role: "player" },
        { username: "player2", password: "player123", role: "player" },
        { username: "player3", password: "player123", role: "player" },
      ],
    };
  },
});
