import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed holes configuration data for a specific course
// This should be run once to populate the holes_config table for a course
export const seedHolesConfig = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Check if already seeded for this course
    const existing = await ctx.db
      .query("holes_config")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .first();
    
    if (existing) {
      return { success: true, message: "Holes config already seeded for this course" };
    }

    // Get course to check tee boxes
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Standard 18-hole golf course configuration
    // Par values and Index (difficulty) for each hole
    const holesData = [
      // Front 9
      { holeNumber: 1, par: 4, index: 7, courseSection: "front9" as const },
      { holeNumber: 2, par: 5, index: 3, courseSection: "front9" as const },
      { holeNumber: 3, par: 3, index: 15, courseSection: "front9" as const },
      { holeNumber: 4, par: 4, index: 5, courseSection: "front9" as const },
      { holeNumber: 5, par: 4, index: 11, courseSection: "front9" as const },
      { holeNumber: 6, par: 4, index: 9, courseSection: "front9" as const },
      { holeNumber: 7, par: 3, index: 17, courseSection: "front9" as const },
      { holeNumber: 8, par: 5, index: 1, courseSection: "front9" as const },
      { holeNumber: 9, par: 4, index: 13, courseSection: "front9" as const },
      // Back 9
      { holeNumber: 10, par: 4, index: 8, courseSection: "back9" as const },
      { holeNumber: 11, par: 5, index: 4, courseSection: "back9" as const },
      { holeNumber: 12, par: 3, index: 16, courseSection: "back9" as const },
      { holeNumber: 13, par: 4, index: 6, courseSection: "back9" as const },
      { holeNumber: 14, par: 4, index: 12, courseSection: "back9" as const },
      { holeNumber: 15, par: 4, index: 10, courseSection: "back9" as const },
      { holeNumber: 16, par: 3, index: 18, courseSection: "back9" as const },
      { holeNumber: 17, par: 5, index: 2, courseSection: "back9" as const },
      { holeNumber: 18, par: 4, index: 14, courseSection: "back9" as const },
    ];

    // Default distances for each tee box (in meters)
    const defaultDistances: Record<string, number[]> = {
      Black: [380, 520, 180, 400, 360, 390, 170, 540, 410, 385, 530, 175, 395, 370, 385, 165, 550, 420],
      Blue: [360, 500, 170, 380, 340, 370, 160, 520, 390, 365, 510, 165, 375, 350, 365, 155, 530, 400],
      White: [340, 480, 160, 360, 320, 350, 150, 500, 370, 345, 490, 155, 355, 330, 345, 145, 510, 380],
      Gold: [320, 450, 150, 340, 300, 330, 140, 470, 350, 325, 460, 145, 335, 310, 325, 135, 480, 360],
      Red: [280, 400, 140, 300, 280, 290, 130, 420, 310, 285, 410, 135, 295, 270, 285, 125, 430, 320],
    };

    // Insert all holes with distances
    for (const hole of holesData) {
      const distances = course.teeBoxes.map(teeBox => ({
        teeBoxName: teeBox.name,
        distance: defaultDistances[teeBox.name]?.[hole.holeNumber - 1] || 0,
      }));

      await ctx.db.insert("holes_config", {
        courseId: args.courseId,
        ...hole,
        distances,
      });
    }

    return { 
      success: true, 
      message: `Successfully seeded 18 holes configuration for course ${course.name}` 
    };
  },
});
