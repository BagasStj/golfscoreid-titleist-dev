import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate upload URL for files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create Information
export const createInformation = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("factsheet"),
      v.literal("teesheet"),
      v.literal("activity"),
      v.literal("contact")
    ),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPosition: v.optional(v.string()),
    isPublished: v.boolean(),
    order: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create information");
    }

    let fileUrl: string | undefined;
    if (args.fileStorageId) {
      fileUrl = await ctx.storage.getUrl(args.fileStorageId) || undefined;
    }

    const informationId = await ctx.db.insert("information", {
      title: args.title,
      description: args.description,
      type: args.type,
      fileUrl,
      fileStorageId: args.fileStorageId,
      fileType: args.fileType,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      contactEmail: args.contactEmail,
      contactPosition: args.contactPosition,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: args.isPublished,
      order: args.order,
    });

    return informationId;
  },
});

// Update Information
export const updateInformation = mutation({
  args: {
    informationId: v.id("information"),
    title: v.string(),
    description: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPosition: v.optional(v.string()),
    isPublished: v.boolean(),
    order: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update information");
    }

    const existing = await ctx.db.get(args.informationId);
    if (!existing) {
      throw new Error("Information not found");
    }

    let fileUrl = existing.fileUrl;
    if (args.fileStorageId) {
      fileUrl = await ctx.storage.getUrl(args.fileStorageId) || undefined;
    }

    await ctx.db.patch(args.informationId, {
      title: args.title,
      description: args.description,
      fileUrl,
      fileStorageId: args.fileStorageId || existing.fileStorageId,
      fileType: args.fileType || existing.fileType,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      contactEmail: args.contactEmail,
      contactPosition: args.contactPosition,
      updatedAt: Date.now(),
      isPublished: args.isPublished,
      order: args.order,
    });

    return { success: true };
  },
});

// Delete Information
export const deleteInformation = mutation({
  args: {
    informationId: v.id("information"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete information");
    }

    const information = await ctx.db.get(args.informationId);
    if (!information) {
      throw new Error("Information not found");
    }

    // Delete file from storage if exists
    if (information.fileStorageId) {
      await ctx.storage.delete(information.fileStorageId);
    }

    await ctx.db.delete(args.informationId);
    return { success: true };
  },
});

// Toggle Published Status
export const togglePublished = mutation({
  args: {
    informationId: v.id("information"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can toggle published status");
    }

    const information = await ctx.db.get(args.informationId);
    if (!information) {
      throw new Error("Information not found");
    }

    await ctx.db.patch(args.informationId, {
      isPublished: !information.isPublished,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get All Information (Admin)
export const getAllInformation = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all information");
    }

    const information = await ctx.db
      .query("information")
      .order("desc")
      .collect();

    // Get creator names
    const informationWithCreator = await Promise.all(
      information.map(async (info) => {
        const creator = await ctx.db.get(info.createdBy);
        
        // Refresh file URL if storage ID exists
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        return {
          ...info,
          fileUrl,
          creatorName: creator?.name || "Unknown",
        };
      })
    );

    return informationWithCreator;
  },
});

// Get Published Information (Player)
export const getPublishedInformation = query({
  args: {},
  handler: async (ctx) => {
    const information = await ctx.db
      .query("information")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();

    // Refresh file URLs
    const informationWithUrls = await Promise.all(
      information.map(async (info) => {
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        return {
          ...info,
          fileUrl,
        };
      })
    );

    // Sort by order if specified, otherwise by createdAt
    return informationWithUrls.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

// Get Information by Type
export const getInformationByType = query({
  args: {
    type: v.union(
      v.literal("factsheet"),
      v.literal("teesheet"),
      v.literal("activity"),
      v.literal("contact")
    ),
  },
  handler: async (ctx, args) => {
    const information = await ctx.db
      .query("information")
      .withIndex("by_type", (q) => q.eq("type", args.type).eq("isPublished", true))
      .order("desc")
      .collect();

    // Refresh file URLs
    const informationWithUrls = await Promise.all(
      information.map(async (info) => {
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        return {
          ...info,
          fileUrl,
        };
      })
    );

    return informationWithUrls;
  },
});
