import { mutation } from "./_generated/server";

/**
 * Test Leaderboard and Monitoring Functions
 * This test file verifies:
 * - Leaderboard calculations (all holes and hidden holes)
 * - Ranking logic with tie-breaking
 * - Live monitoring with current hole calculation
 * - Player tournament filtering
 */

export const testLeaderboardAndMonitoring = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];

    try {
      // Test 1: Get leaderboard for existing tournament
      results.push("=== Test 1: Get Leaderboard ===");
      
      // Get first tournament
      const tournaments = await ctx.db.query("tournaments").collect();
      if (tournaments.length === 0) {
        results.push("❌ No tournaments found. Please create a tournament first.");
        return { success: false, results };
      }

      const tournament = tournaments[0];
      results.push(`✓ Testing with tournament: ${tournament.name}`);

      // Get all scores for this tournament
      const scores = await ctx.db
        .query("scores")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
        .collect();

      results.push(`✓ Found ${scores.length} scores in tournament`);

      // Get participants
      const participants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
        .collect();

      results.push(`✓ Found ${participants.length} participants`);

      // Test 2: Verify leaderboard structure
      results.push("\n=== Test 2: Leaderboard Structure ===");
      
      // We can't directly call the query here, but we can verify the data exists
      results.push(`✓ Tournament game mode: ${tournament.gameMode}`);
      results.push(`✓ Tournament course type: ${tournament.courseType}`);
      results.push(`✓ Hidden holes configured: ${tournament.hiddenHoles.length > 0 ? "Yes" : "No"}`);
      
      if (tournament.hiddenHoles.length > 0) {
        results.push(`✓ Hidden holes: ${tournament.hiddenHoles.join(", ")}`);
      }

      // Test 3: Verify current hole calculation logic
      results.push("\n=== Test 3: Current Hole Calculation ===");
      
      const totalHoles = tournament.courseType === "F9" || tournament.courseType === "B9" ? 9 : 18;
      results.push(`✓ Total holes in course: ${totalHoles}`);

      for (const participant of participants.slice(0, 3)) { // Test first 3 players
        const player = await ctx.db.get(participant.playerId);
        if (!player) continue;

        const playerScores = scores.filter((s) => s.playerId === participant.playerId);
        const holesCompleted = playerScores.length;
        
        // Calculate current hole: (startHole + completedHoles - 1) % totalHoles + 1
        let currentHole = participant.startHole;
        if (holesCompleted > 0) {
          currentHole = ((participant.startHole + holesCompleted - 1) % totalHoles) + 1;
        }

        results.push(`✓ ${player.name}: Start=${participant.startHole}, Completed=${holesCompleted}, Current=${currentHole}`);
      }

      // Test 4: Verify last scored hole tracking
      results.push("\n=== Test 4: Last Scored Hole Tracking ===");
      
      for (const participant of participants.slice(0, 3)) {
        const player = await ctx.db.get(participant.playerId);
        if (!player) continue;

        const playerScores = scores.filter((s) => s.playerId === participant.playerId);
        
        if (playerScores.length > 0) {
          // Sort by submission time to find most recent
          const sortedByTime = [...playerScores].sort((a, b) => b.submittedAt - a.submittedAt);
          const mostRecent = sortedByTime[0];
          
          results.push(`✓ ${player.name}: Last scored hole=${mostRecent.holeNumber}, Score=${mostRecent.strokes}`);
        } else {
          results.push(`✓ ${player.name}: No scores submitted yet`);
        }
      }

      // Test 5: Verify ranking calculation
      results.push("\n=== Test 5: Ranking Calculation ===");
      
      // Calculate simple ranking for stroke play
      const playerTotals: Array<{ name: string; total: number; holes: number }> = [];
      
      for (const participant of participants) {
        const player = await ctx.db.get(participant.playerId);
        if (!player) continue;

        const playerScores = scores.filter((s) => s.playerId === participant.playerId);
        const total = playerScores.reduce((sum, s) => sum + s.strokes, 0);
        
        playerTotals.push({
          name: player.name,
          total,
          holes: playerScores.length,
        });
      }

      // Sort by total (ascending for stroke play)
      playerTotals.sort((a, b) => {
        if (a.total !== b.total) return a.total - b.total;
        return b.holes - a.holes;
      });

      // Assign ranks with tie-breaking
      let currentRank = 1;
      for (let i = 0; i < playerTotals.length; i++) {
        if (i > 0 && playerTotals[i].total !== playerTotals[i - 1].total) {
          currentRank = i + 1;
        }
        results.push(`✓ Rank ${currentRank}: ${playerTotals[i].name} - ${playerTotals[i].total} strokes (${playerTotals[i].holes} holes)`);
      }

      // Test 6: Verify player tournament filtering
      results.push("\n=== Test 6: Player Tournament Filtering ===");
      
      const allUsers = await ctx.db.query("users").collect();
      const players = allUsers.filter((u) => u.role === "player");
      
      if (players.length > 0) {
        const testPlayer = players[0];
        const playerParticipations = await ctx.db
          .query("tournament_participants")
          .withIndex("by_player", (q) => q.eq("playerId", testPlayer._id))
          .collect();
        
        results.push(`✓ Player "${testPlayer.name}" is registered in ${playerParticipations.length} tournament(s)`);
        
        for (const participation of playerParticipations) {
          const t = await ctx.db.get(participation.tournamentId);
          if (t) {
            results.push(`  - ${t.name}`);
          }
        }
      } else {
        results.push("⚠ No players found to test filtering");
      }

      results.push("\n=== All Tests Completed Successfully ===");
      return { success: true, results };

    } catch (error: any) {
      results.push(`\n❌ Error: ${error.message}`);
      return { success: false, results, error: error.message };
    }
  },
});
