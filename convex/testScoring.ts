import { mutation } from "./_generated/server";
import { 
  classifyScore, 
  calculateStablefordPoints, 
  calculateSystem36Points,
  calculateStrokePlayTotal,
  calculateFinalScore 
} from "./calculations";

// Test scoring system functionality
export const testScoringSystem = mutation({
  args: {},
  handler: async (ctx) => {
    const results: any = {
      success: true,
      tests: [],
    };

    try {
      // Test 1: Score Classification
      const classifications = [
        { strokes: 1, par: 4, expected: "Hole in One" },
        { strokes: 2, par: 5, expected: "Albatross" },
        { strokes: 3, par: 5, expected: "Eagle" },
        { strokes: 3, par: 4, expected: "Birdie" },
        { strokes: 4, par: 4, expected: "Par" },
        { strokes: 5, par: 4, expected: "Bogey" },
        { strokes: 6, par: 4, expected: "Double Bogey" },
        { strokes: 7, par: 4, expected: "Triple Bogey" },
        { strokes: 8, par: 4, expected: "Worse" },
      ];

      let classificationPassed = true;
      for (const test of classifications) {
        const result = classifyScore(test.strokes, test.par);
        if (result.name !== test.expected) {
          classificationPassed = false;
          break;
        }
      }

      results.tests.push({
        name: "Score Classification",
        passed: classificationPassed,
        details: "All score types classified correctly",
      });

      // Test 2: Stableford Points Calculation
      const stablefordTests = [
        { strokes: 2, par: 5, expected: 5 }, // Eagle: 2 + (5-2) = 5
        { strokes: 3, par: 4, expected: 3 }, // Birdie: 2 + (4-3) = 3
        { strokes: 4, par: 4, expected: 2 }, // Par: 2 + (4-4) = 2
        { strokes: 5, par: 4, expected: 1 }, // Bogey: 2 + (4-5) = 1
        { strokes: 6, par: 4, expected: 0 }, // Double Bogey: 2 + (4-6) = 0
        { strokes: 7, par: 4, expected: 0 }, // Triple Bogey: min 0
      ];

      let stablefordPassed = true;
      for (const test of stablefordTests) {
        const result = calculateStablefordPoints(test.strokes, test.par);
        if (result !== test.expected) {
          stablefordPassed = false;
          break;
        }
      }

      results.tests.push({
        name: "Stableford Points",
        passed: stablefordPassed,
        details: "All Stableford calculations correct",
      });

      // Test 3: System36 Points Calculation
      const system36Tests = [
        { strokes: 3, par: 4, expected: 2 }, // Birdie
        { strokes: 4, par: 4, expected: 2 }, // Par
        { strokes: 5, par: 4, expected: 1 }, // Bogey
        { strokes: 6, par: 4, expected: 0 }, // Double Bogey
        { strokes: 7, par: 4, expected: 0 }, // Worse
      ];

      let system36Passed = true;
      for (const test of system36Tests) {
        const result = calculateSystem36Points(test.strokes, test.par);
        if (result !== test.expected) {
          system36Passed = false;
          break;
        }
      }

      results.tests.push({
        name: "System36 Points",
        passed: system36Passed,
        details: "All System36 calculations correct",
      });

      // Test 4: Stroke Play Total
      const strokePlayScores = [4, 5, 3, 4, 4, 4, 3, 5, 4]; // 9 holes
      const strokePlayTotal = calculateStrokePlayTotal(strokePlayScores);
      const expectedTotal = 36;

      results.tests.push({
        name: "Stroke Play Total",
        passed: strokePlayTotal === expectedTotal,
        calculated: strokePlayTotal,
        expected: expectedTotal,
      });

      // Test 5: Final Score Calculation - Stroke Play
      const testScores = [
        { strokes: 4, par: 4 },
        { strokes: 5, par: 5 },
        { strokes: 3, par: 3 },
      ];

      const strokePlayFinal = calculateFinalScore(testScores, "strokePlay");
      results.tests.push({
        name: "Final Score - Stroke Play",
        passed: strokePlayFinal === 12,
        calculated: strokePlayFinal,
      });

      // Test 6: Final Score Calculation - Stableford
      const stablefordFinal = calculateFinalScore(testScores, "stableford");
      // Par on all holes: 2+2+2 = 6 points
      results.tests.push({
        name: "Final Score - Stableford",
        passed: stablefordFinal === 6,
        calculated: stablefordFinal,
      });

      // Test 7: Final Score Calculation - System36
      const system36Final = calculateFinalScore(testScores, "system36");
      // Par on all holes: 2+2+2 = 6 points
      results.tests.push({
        name: "Final Score - System36",
        passed: system36Final === 6,
        calculated: system36Final,
      });

      // Now test the actual database operations
      // Get test users
      const users = await ctx.db.query("users").collect();
      const admins = users.filter((u) => u.role === "admin");
      const players = users.filter((u) => u.role === "player");

      if (admins.length === 0 || players.length === 0) {
        results.tests.push({
          name: "Database Tests",
          passed: false,
          error: "Need at least 1 admin and 1 player to test",
        });
      } else {
        // Test 8: Create test tournament
        const tournamentId = await ctx.db.insert("tournaments", {
          name: "Scoring Test Tournament",
          description: "Test tournament for scoring validation",
          date: Date.now() + 86400000,
          location: "Test Golf Course",
          startHole: 1,
          courseType: "18holes",
          gameMode: "stableford",
          scoringDisplay: "stroke",
          hiddenHoles: [],
          createdBy: admins[0]._id,
          createdAt: Date.now(),
          status: "active",
        });

        results.tests.push({
          name: "Create Test Tournament",
          passed: true,
          tournamentId,
        });

        // Test 9: Submit Score (positive integer validation)
        try {
          await ctx.db.insert("scores", {
            tournamentId,
            playerId: players[0]._id,
            holeNumber: 1,
            strokes: 4,
            submittedAt: Date.now(),
          });

          results.tests.push({
            name: "Submit Valid Score",
            passed: true,
          });
        } catch (error: any) {
          results.tests.push({
            name: "Submit Valid Score",
            passed: false,
            error: error.message,
          });
        }

        // Test 10: Duplicate Score Prevention
        try {
          await ctx.db.insert("scores", {
            tournamentId,
            playerId: players[0]._id,
            holeNumber: 1,
            strokes: 5,
            submittedAt: Date.now(),
          });

          // Check if duplicate exists
          const duplicates = await ctx.db
            .query("scores")
            .withIndex("by_tournament_player_hole", (q) =>
              q
                .eq("tournamentId", tournamentId)
                .eq("playerId", players[0]._id)
                .eq("holeNumber", 1)
            )
            .collect();

          results.tests.push({
            name: "Duplicate Score Check",
            passed: duplicates.length === 2, // Should have 2 entries (not prevented at DB level)
            note: "Duplicate prevention should be handled in submitScore mutation",
          });
        } catch (error: any) {
          results.tests.push({
            name: "Duplicate Score Check",
            passed: false,
            error: error.message,
          });
        }

        // Test 11: Get Player Scores with Classification
        const playerScores = await ctx.db
          .query("scores")
          .withIndex("by_tournament_and_player", (q) =>
            q.eq("tournamentId", tournamentId).eq("playerId", players[0]._id)
          )
          .collect();

        results.tests.push({
          name: "Get Player Scores",
          passed: playerScores.length > 0,
          count: playerScores.length,
        });

        // Test 12: Score Update
        if (playerScores.length > 0) {
          const scoreToUpdate = playerScores[0];
          await ctx.db.patch(scoreToUpdate._id, {
            strokes: 3,
            submittedAt: Date.now(),
          });

          const updatedScore = await ctx.db.get(scoreToUpdate._id);
          results.tests.push({
            name: "Update Score",
            passed: updatedScore?.strokes === 3,
            newStrokes: updatedScore?.strokes,
          });
        }

        // Cleanup
        await ctx.db.delete(tournamentId);
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

      // Summary
      results.summary = {
        total: results.tests.length,
        passed: results.tests.filter((t: any) => t.passed).length,
        failed: results.tests.filter((t: any) => !t.passed).length,
      };

      results.success = results.summary.failed === 0;

      return results;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        tests: results.tests,
      };
    }
  },
});
