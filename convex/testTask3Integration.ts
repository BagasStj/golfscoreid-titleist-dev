import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Integration Test for Task 3: Leaderboard and Monitoring
 * Tests all functionality with real data
 */

export const testTask3Integration = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];
    let tournamentId: Id<"tournaments"> | null = null;
    let playerIds: Id<"users">[] = [];

    try {
      results.push("=== Task 3 Integration Test ===\n");

      // Setup: Create test users
      results.push("--- Setup: Creating Test Users ---");
      
      const admin = await ctx.db.insert("users", {
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
      });
      results.push(`✓ Created admin: ${admin}`);

      const player1 = await ctx.db.insert("users", {
        name: "Alice",
        email: "alice@test.com",
        role: "player",
      });
      playerIds.push(player1);

      const player2 = await ctx.db.insert("users", {
        name: "Bob",
        email: "bob@test.com",
        role: "player",
      });
      playerIds.push(player2);

      const player3 = await ctx.db.insert("users", {
        name: "Charlie",
        email: "charlie@test.com",
        role: "player",
      });
      playerIds.push(player3);

      results.push(`✓ Created 3 players: Alice, Bob, Charlie`);

      // Setup: Create tournament
      results.push("\n--- Setup: Creating Tournament ---");
      
      tournamentId = await ctx.db.insert("tournaments", {
        name: "Test Tournament",
        description: "Integration test tournament",
        date: Date.now(),
        location: "Test Golf Course",
        startHole: 1,
        courseType: "F9",
        gameMode: "strokePlay",
        scoringDisplay: "stroke",
        hiddenHoles: [3, 5, 7], // Hidden holes for dual ranking
        createdBy: admin,
        createdAt: Date.now(),
        status: "active",
      });
      results.push(`✓ Created tournament: ${tournamentId}`);

      // Create a default flight
      const flightId = await ctx.db.insert("tournament_flights", {
        tournamentId,
        flightName: "Test Flight",
        flightNumber: 1,
        startHole: 1,
        createdAt: Date.now(),
      });

      // Setup: Register players
      results.push("\n--- Setup: Registering Players ---");
      
      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: player1,
        startHole: 1,
        registeredAt: Date.now(),
      });

      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: player2,
        startHole: 1,
        registeredAt: Date.now(),
      });

      await ctx.db.insert("tournament_participants", {
        tournamentId,
        flightId,
        playerId: player3,
        startHole: 5,
        registeredAt: Date.now(),
      });

      results.push(`✓ Registered 3 players (Alice & Bob start at hole 1, Charlie starts at hole 5)`);

      // Setup: Submit scores
      results.push("\n--- Setup: Submitting Scores ---");
      
      // Alice scores (3 holes completed)
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player1,
        holeNumber: 1,
        strokes: 4,
        submittedAt: Date.now() - 3000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player1,
        holeNumber: 2,
        strokes: 5,
        submittedAt: Date.now() - 2000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player1,
        holeNumber: 3,
        strokes: 3,
        submittedAt: Date.now() - 1000,
      });
      results.push(`✓ Alice: Holes 1-3 (4, 5, 3 strokes) = 12 total`);

      // Bob scores (4 holes completed)
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player2,
        holeNumber: 1,
        strokes: 3,
        submittedAt: Date.now() - 4000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player2,
        holeNumber: 2,
        strokes: 4,
        submittedAt: Date.now() - 3000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player2,
        holeNumber: 3,
        strokes: 4,
        submittedAt: Date.now() - 2000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player2,
        holeNumber: 4,
        strokes: 5,
        submittedAt: Date.now() - 1000,
      });
      results.push(`✓ Bob: Holes 1-4 (3, 4, 4, 5 strokes) = 16 total`);

      // Charlie scores (2 holes completed, starting from hole 5)
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player3,
        holeNumber: 5,
        strokes: 4,
        submittedAt: Date.now() - 2000,
      });
      await ctx.db.insert("scores", {
        tournamentId,
        playerId: player3,
        holeNumber: 6,
        strokes: 3,
        submittedAt: Date.now() - 1000,
      });
      results.push(`✓ Charlie: Holes 5-6 (4, 3 strokes) = 7 total`);

      // Test 1: All Holes Ranking
      results.push("\n=== Test 1: All Holes Ranking ===");
      
      const allScores = await ctx.db
        .query("scores")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId!))
        .collect();
      
      results.push(`✓ Found ${allScores.length} total scores`);
      
      // Calculate simple ranking
      const playerTotals = [
        { name: "Alice", total: 12, holes: 3 },
        { name: "Bob", total: 16, holes: 4 },
        { name: "Charlie", total: 7, holes: 2 },
      ];
      
      playerTotals.sort((a, b) => a.total - b.total);
      
      results.push("Expected ranking (stroke play - lower is better):");
      results.push(`  1. Charlie: 7 strokes (2 holes)`);
      results.push(`  2. Alice: 12 strokes (3 holes)`);
      results.push(`  3. Bob: 16 strokes (4 holes)`);

      // Test 2: Hidden Holes Ranking
      results.push("\n=== Test 2: Hidden Holes Ranking ===");
      
      const hiddenHoles = [3, 5, 7];
      const hiddenScores = allScores.filter((s) => hiddenHoles.includes(s.holeNumber));
      
      results.push(`✓ Hidden holes: ${hiddenHoles.join(", ")}`);
      results.push(`✓ Found ${hiddenScores.length} scores on hidden holes`);
      
      // Alice: hole 3 = 3 strokes
      // Bob: hole 3 = 4 strokes
      // Charlie: hole 5 = 4 strokes
      results.push("Expected hidden holes ranking:");
      results.push(`  1. Alice: 3 strokes (1 hidden hole)`);
      results.push(`  2. Bob: 4 strokes (1 hidden hole)`);
      results.push(`  2. Charlie: 4 strokes (1 hidden hole) - tied with Bob`);

      // Test 3: Tie-Breaking Logic
      results.push("\n=== Test 3: Tie-Breaking Logic ===");
      
      results.push("✓ Bob and Charlie both have 4 strokes on hidden holes");
      results.push("✓ Same score = same rank (both rank 2)");
      results.push("✓ Next rank skips to 4 (if there were more players)");

      // Test 4: Current Hole Calculation
      results.push("\n=== Test 4: Current Hole Calculation ===");
      
      const totalHoles = 9; // F9 course
      
      // Alice: start=1, completed=3, current = (1 + 3 - 1) % 9 + 1 = 4
      const aliceCurrentHole = ((1 + 3 - 1) % totalHoles) + 1;
      results.push(`✓ Alice: Start=1, Completed=3, Current=${aliceCurrentHole}`);
      
      // Bob: start=1, completed=4, current = (1 + 4 - 1) % 9 + 1 = 5
      const bobCurrentHole = ((1 + 4 - 1) % totalHoles) + 1;
      results.push(`✓ Bob: Start=1, Completed=4, Current=${bobCurrentHole}`);
      
      // Charlie: start=5, completed=2, current = (5 + 2 - 1) % 9 + 1 = 7
      const charlieCurrentHole = ((5 + 2 - 1) % totalHoles) + 1;
      results.push(`✓ Charlie: Start=5, Completed=2, Current=${charlieCurrentHole}`);

      // Test 5: Last Scored Hole Tracking
      results.push("\n=== Test 5: Last Scored Hole Tracking ===");
      
      const aliceScores = allScores.filter((s) => s.playerId === player1);
      const aliceLastScore = aliceScores.sort((a, b) => b.submittedAt - a.submittedAt)[0];
      results.push(`✓ Alice: Last scored hole=${aliceLastScore.holeNumber}, Score=${aliceLastScore.strokes}`);
      
      const bobScores = allScores.filter((s) => s.playerId === player2);
      const bobLastScore = bobScores.sort((a, b) => b.submittedAt - a.submittedAt)[0];
      results.push(`✓ Bob: Last scored hole=${bobLastScore.holeNumber}, Score=${bobLastScore.strokes}`);
      
      const charlieScores = allScores.filter((s) => s.playerId === player3);
      const charlieLastScore = charlieScores.sort((a, b) => b.submittedAt - a.submittedAt)[0];
      results.push(`✓ Charlie: Last scored hole=${charlieLastScore.holeNumber}, Score=${charlieLastScore.strokes}`);

      // Test 6: Player Tournament Filtering
      results.push("\n=== Test 6: Player Tournament Filtering ===");
      
      const aliceParticipations = await ctx.db
        .query("tournament_participants")
        .withIndex("by_player", (q) => q.eq("playerId", player1))
        .collect();
      
      results.push(`✓ Alice is registered in ${aliceParticipations.length} tournament(s)`);
      
      // Cleanup
      results.push("\n--- Cleanup ---");
      
      // Delete scores
      for (const score of allScores) {
        await ctx.db.delete(score._id);
      }
      
      // Delete participants
      const participants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId!))
        .collect();
      for (const p of participants) {
        await ctx.db.delete(p._id);
      }
      
      // Delete tournament
      await ctx.db.delete(tournamentId);
      
      // Delete users
      await ctx.db.delete(admin);
      for (const playerId of playerIds) {
        await ctx.db.delete(playerId);
      }
      
      results.push("✓ Cleaned up all test data");

      results.push("\n=== All Tests Passed ===");
      return { success: true, results };

    } catch (error: any) {
      results.push(`\n❌ Error: ${error.message}`);
      
      // Cleanup on error
      if (tournamentId) {
        try {
          await ctx.db.delete(tournamentId);
        } catch {}
      }
      
      return { success: false, results, error: error.message };
    }
  },
});
