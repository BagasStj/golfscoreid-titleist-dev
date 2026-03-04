import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration script to add courseId to existing holes_config records
 * This should be run once to migrate old data to new schema
 */
export const migrateHolesConfigToCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can run migrations");
    }

    // Get the course to verify it exists
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Find all holes_config without courseId
    const allHoles = await ctx.db.query("holes_config").collect();
    const holesToMigrate = allHoles.filter((hole: any) => !hole.courseId);

    if (holesToMigrate.length === 0) {
      return {
        success: true,
        message: "No holes to migrate",
        migratedCount: 0,
      };
    }

    let migratedCount = 0;
    for (const hole of holesToMigrate) {
      // Add courseId and distances if not present
      const distances = (hole as any).distances || course.teeBoxes.map(tb => ({
        teeBoxName: tb.name,
        distance: 0, // Default distance, admin can update later
      }));

      await ctx.db.patch(hole._id, {
        courseId: args.courseId,
        distances,
      } as any);
      
      migratedCount++;
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} holes to course: ${course.name}`,
      migratedCount,
    };
  },
});

/**
 * Delete all old holes_config records that don't have courseId
 * WARNING: This will permanently delete data!
 */
export const deleteOldHolesConfig = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can delete holes config");
    }

    // Find all holes_config without courseId
    const allHoles = await ctx.db.query("holes_config").collect();
    const holesToDelete = allHoles.filter((hole: any) => !hole.courseId);

    if (holesToDelete.length === 0) {
      return {
        success: true,
        message: "No old holes to delete",
        deletedCount: 0,
      };
    }

    let deletedCount = 0;
    for (const hole of holesToDelete) {
      await ctx.db.delete(hole._id);
      deletedCount++;
    }

    return {
      success: true,
      message: `Successfully deleted ${deletedCount} old holes config records`,
      deletedCount,
    };
  },
});
