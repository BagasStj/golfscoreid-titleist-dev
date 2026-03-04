import { mutation } from "./_generated/server";

// Test all backend functionality
export const testAllFunctions = mutation({
  args: {},
  handler: async (ctx) => {
    const results: any = {
      success: true,
      tests: [],
    };

    try {
      // Test 1: Check holes config
      const holesConfig = await ctx.db.query("holes_config").collect();
      results.tests.push({
        name: "Holes Config",
        passed: holesConfig.length === 18,
        count: holesConfig.length,
      });

      // Test 2: Check users
      const users = await ctx.db.query("users").collect();
      const admins = users.filter((u) => u.role === "admin");
      const players = users.filter((u) => u.role === "player");
      results.tests.push({
        name: "Users",
        passed: users.length > 0,
        total: users.length,
        admins: admins.length,
        players: players.length,
      });

      // Test 3: Create a test tournament
      if (admins.length > 0) {
        const tournamentId = await ctx.db.insert("tournaments", {
          name: "Test Tournament",
          description: "Test tournament for backend validation",
          date: Date.now() + 86400000, // Tomorrow
          location: "Test Golf Course",
          startHole: 1,
          courseType: "18holes",
          gameMode: "strokePlay",
          scoringDisplay: "stroke",
          hiddenHoles: [5, 10, 15],
          createdBy: admins[0]._id,
          createdAt: Date.now(),
          status: "upcoming",
        });

        results.tests.push({
          name: "Create Tournament",
          passed: true,
          tournamentId,
        });

        // Create a default flight for testing
        const flightId = await ctx.db.insert("tournament_flights", {
          tournamentId,
          flightName: "Test Flight",
          flightNumber: 1,
          startHole: 1,
          createdAt: Date.now(),
        });

        // Test 4: Register players to tournament
        if (players.length > 0) {
          let registered = 0;
          for (let i = 0; i < Math.min(players.length, 3); i++) {
            await ctx.db.insert("tournament_participants", {
              tournamentId,
              flightId,
              playerId: players[i]._id,
              startHole: 1 + i,
              registeredAt: Date.now(),
            });
            registered++;
          }

          results.tests.push({
            name: "Register Players",
            passed: registered > 0,
            registered,
          });

          // Test 5: Submit test scores
          if (registered > 0) {
            await ctx.db.insert("scores", {
              tournamentId,
              playerId: players[0]._id,
              holeNumber: 1,
              strokes: 4,
              submittedAt: Date.now(),
            });

            results.tests.push({
              name: "Submit Score",
              passed: true,
            });
          }
        }

        // Clean up test data
        await ctx.db.delete(tournamentId);
        await ctx.db.delete(flightId);
        const participants = await ctx.db
          .query("tournament_participants")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
          .collect();
        for (const p of participants) {
          await ctx.db.delete(p._id);
        }
        const scores = await ctx.db
          .query("scores")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
          .collect();
        for (const s of scores) {
          await ctx.db.delete(s._id);
        }

        results.tests.push({
          name: "Cleanup",
          passed: true,
        });
      }

      results.summary = {
        total: results.tests.length,
        passed: results.tests.filter((t: any) => t.passed).length,
      };

      return results;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        tests: results.tests,
      };
    }
  },
});
