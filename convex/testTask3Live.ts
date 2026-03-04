import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Test Task 3 Live - Creates persistent test data for manual query testing
 * Run this to create test data, then test queries manually
 */

export const setupTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];

    try {
      results.push("=== Setting Up Test Data for Task 3 ===\n");

      // Create admin
      const admin = await ctx.db.insert("users", {
        name: "Live Test Admin",
        email: "liveadmin@test.com",
        role: "admin",
      });

      // Create players
      const alice = await ctx.db.insert("users", {
        name: "Alice Johnson",
        email: "alice.j@test.com",
        role: "player",
      });

      const bob = await ctx.db.insert("users", {
        name: "Bob Smith",
        email: "bob.s@test.com",
        role: "player",
      });

      const charlie = await ctx.db.insert("users", {
        name: "Charlie Brown",
        email: "charlie.b@test.com",
        role: "player",
      });

      results.push("✓ Created users: Admin, Alice, Bob, Charlie");

      // Create tournament
      const tournamentId = await ctx.db.insert("tournaments", {
        name: "Live Test Tournament",
        description: "Tournament for testing leaderboard and monitoring",
        date: Date.now() + 86400000, // Tomorrow
        location: "Test Golf Course",
        startHole: 1,
        courseType: "F9",
        gameMode: "strokePlay",
        scoringDisplay: "stroke",
        hiddenHoles: [3, 5, 7],
        createdBy: admin,
        createdAt: Date.now(),
        status: "active",
      });

      results.push(`✓ Created tournament: ${tournamentId}`);
      results.push(`  Hidden holes: 3, 5, 7`);

      // Create a default flight
      const flightId = await ctx.db.insert("tournament_flights", {
        tournamentId,
        flightName: "Test Flight",
        flightNumber: 1,
        startHole: 1,
        createdAt: Date.now(),
      });

      // Register players
      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: alice,
        startHole: 1,
        registeredAt: Date.now(),
      });

      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: bob,
        startHole: 1,
        registeredAt: Date.now(),
      });

      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: charlie,
        startHole: 4,
        registeredAt: Date.now(),
      });

      results.push("✓ Registered 3 players");

      // Submit scores
      // Alice: 5 holes (4,3,5,4,3) = 19 total, hidden (3,5) = 8
      const aliceScores = [
        { hole: 1, strokes: 4 },
        { hole: 2, strokes: 3 },
        { hole: 3, strokes: 5 },
        { hole: 4, strokes: 4 },
        { hole: 5, strokes: 3 },
      ];

      for (const score of aliceScores) {
        await ctx.db.insert("scores", {
          tournamentId,
          playerId: alice,
          holeNumber: score.hole,
          strokes: score.strokes,
          submittedAt: Date.now() - (5 - score.hole) * 1000,
        });
      }

      // Bob: 6 holes (3,4,4,5,4,3) = 23 total, hidden (3,5,7) = 11
      const bobScores = [
        { hole: 1, strokes: 3 },
        { hole: 2, strokes: 4 },
        { hole: 3, strokes: 4 },
        { hole: 4, strokes: 5 },
        { hole: 5, strokes: 4 },
        { hole: 6, strokes: 3 },
      ];

      for (const score of bobScores) {
        await ctx.db.insert("scores", {
          tournamentId,
          playerId: bob,
          holeNumber: score.hole,
          strokes: score.strokes,
          submittedAt: Date.now() - (6 - score.hole) * 1000,
        });
      }

      // Charlie: 3 holes starting from 4 (4,3,5) = 12 total, hidden (5,7) = 8
      const charlieScores = [
        { hole: 4, strokes: 4 },
        { hole: 5, strokes: 3 },
        { hole: 6, strokes: 5 },
      ];

      for (const score of charlieScores) {
        await ctx.db.insert("scores", {
          tournamentId,
          playerId: charlie,
          holeNumber: score.hole,
          strokes: score.strokes,
          submittedAt: Date.now() - (6 - score.hole) * 1000,
        });
      }

      results.push("✓ Submitted scores for all players");
      results.push("\nScore Summary:");
      results.push("  Alice: 19 strokes (5 holes), hidden: 8 strokes");
      results.push("  Bob: 23 strokes (6 holes), hidden: 11 strokes");
      results.push("  Charlie: 12 strokes (3 holes), hidden: 8 strokes");

      results.push("\n=== Test Data Created Successfully ===");
      results.push("\nNow you can test the queries:");
      results.push(`\n1. Test Leaderboard:`);
      results.push(`   npx convex run leaderboard:getLeaderboard --args '{"tournamentId":"${tournamentId}"}'`);
      results.push(`\n2. Test Live Monitoring:`);
      results.push(`   npx convex run monitoring:getLiveMonitoring --args '{"tournamentId":"${tournamentId}"}'`);
      results.push(`\n3. Cleanup when done:`);
      results.push(`   npx convex run testTask3Live:cleanupTestData --args '{"tournamentId":"${tournamentId}"}'`);

      return { 
        success: true, 
        results,
        tournamentId: tournamentId.toString(),
      };

    } catch (error: any) {
      results.push(`\n❌ Error: ${error.message}`);
      return { success: false, results, error: error.message };
    }
  },
});

export const cleanupTestData = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const results: string[] = [];

    try {
      results.push("=== Cleaning Up Test Data ===");

      // Delete scores
      const scores = await ctx.db
        .query("scores")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
        .collect();

      for (const score of scores) {
        await ctx.db.delete(score._id);
      }
      results.push(`✓ Deleted ${scores.length} scores`);

      // Delete participants
      const participants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
        .collect();

      const playerIds: Id<"users">[] = [];
      for (const p of participants) {
        playerIds.push(p.playerId);
        await ctx.db.delete(p._id);
      }
      results.push(`✓ Deleted ${participants.length} participants`);

      // Get tournament to find admin
      const tournament = await ctx.db.get(args.tournamentId);
      const adminId = tournament?.createdBy;

      // Delete tournament
      await ctx.db.delete(args.tournamentId);
      results.push("✓ Deleted tournament");

      // Delete users
      for (const playerId of playerIds) {
        await ctx.db.delete(playerId);
      }
      if (adminId) {
        await ctx.db.delete(adminId);
      }
      results.push(`✓ Deleted ${playerIds.length + 1} users`);

      results.push("\n=== Cleanup Complete ===");
      return { success: true, results };

    } catch (error: any) {
      results.push(`\n❌ Error: ${error.message}`);
      return { success: false, results, error: error.message };
    }
  },
});
