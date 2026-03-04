import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all courses
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { includeInactive = false } = args;
    
    let courses;
    if (includeInactive) {
      courses = await ctx.db.query("courses").collect();
    } else {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    
    return courses.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Query: Get course by ID
export const getById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Alias for getById
export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Query: Get course with holes configuration
export const getWithHoles = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    
    const holes = await ctx.db
      .query("holes_config")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    return {
      ...course,
      holes: holes.sort((a, b) => a.holeNumber - b.holeNumber),
    };
  },
});

// Mutation: Create new course
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    totalHoles: v.number(),
    teeBoxes: v.array(v.object({
      name: v.string(),
      color: v.string(),
      rating: v.optional(v.number()),
      slope: v.optional(v.number()),
    })),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    const courseId = await ctx.db.insert("courses", {
      name: args.name,
      location: args.location,
      description: args.description,
      totalHoles: args.totalHoles,
      teeBoxes: args.teeBoxes,
      createdAt: Date.now(),
      createdBy: user._id,
      isActive: true,
    });

    return courseId;
  },
});

// Mutation: Update course
export const update = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    totalHoles: v.optional(v.number()),
    teeBoxes: v.optional(v.array(v.object({
      name: v.string(),
      color: v.string(),
      rating: v.optional(v.number()),
      slope: v.optional(v.number()),
    }))),
    isActive: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    const { courseId, userId, ...updates } = args;
    await ctx.db.patch(courseId, updates);
    
    return courseId;
  },
});

// Mutation: Delete course
export const remove = mutation({
  args: { 
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    // Check if course is used in any tournament
    const tournaments = await ctx.db
      .query("tournaments")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    if (tournaments.length > 0) {
      throw new Error("Cannot delete course that is used in tournaments");
    }

    // Delete all holes configuration for this course
    const holes = await ctx.db
      .query("holes_config")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const hole of holes) {
      await ctx.db.delete(hole._id);
    }

    // Delete the course
    await ctx.db.delete(args.courseId);
  },
});

// Mutation: Add or update hole configuration
export const upsertHole = mutation({
  args: {
    courseId: v.id("courses"),
    holeNumber: v.number(),
    par: v.number(),
    index: v.number(),
    courseSection: v.union(v.literal("front9"), v.literal("back9")),
    distances: v.array(v.object({
      teeBoxName: v.string(),
      distance: v.number(),
    })),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    // Check if hole already exists
    const existingHole = await ctx.db
      .query("holes_config")
      .withIndex("by_course_and_hole", (q) => 
        q.eq("courseId", args.courseId).eq("holeNumber", args.holeNumber)
      )
      .first();

    if (existingHole) {
      // Update existing hole
      await ctx.db.patch(existingHole._id, {
        par: args.par,
        index: args.index,
        courseSection: args.courseSection,
        distances: args.distances,
      });
      return existingHole._id;
    } else {
      // Create new hole
      return await ctx.db.insert("holes_config", {
        courseId: args.courseId,
        holeNumber: args.holeNumber,
        par: args.par,
        index: args.index,
        courseSection: args.courseSection,
        distances: args.distances,
      });
    }
  },
});

// Mutation: Bulk upsert holes (for easier setup)
export const bulkUpsertHoles = mutation({
  args: {
    courseId: v.id("courses"),
    holes: v.array(v.object({
      holeNumber: v.number(),
      par: v.number(),
      index: v.number(),
      courseSection: v.union(v.literal("front9"), v.literal("back9")),
      distances: v.array(v.object({
        teeBoxName: v.string(),
        distance: v.number(),
      })),
    })),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    const results = [];
    for (const hole of args.holes) {
      const existingHole = await ctx.db
        .query("holes_config")
        .withIndex("by_course_and_hole", (q) => 
          q.eq("courseId", args.courseId).eq("holeNumber", hole.holeNumber)
        )
        .first();

      if (existingHole) {
        await ctx.db.patch(existingHole._id, {
          par: hole.par,
          index: hole.index,
          courseSection: hole.courseSection,
          distances: hole.distances,
        });
        results.push(existingHole._id);
      } else {
        const id = await ctx.db.insert("holes_config", {
          courseId: args.courseId,
          ...hole,
        });
        results.push(id);
      }
    }

    return results;
  },
});

// Mutation: Delete hole configuration
export const deleteHole = mutation({
  args: {
    holeId: v.id("holes_config"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args.holeId);
  },
});
