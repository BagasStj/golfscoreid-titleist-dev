import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    category: v.union(v.literal("general"), v.literal("tournament")),
    tournamentId: v.optional(v.id("tournaments")),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
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

    // Validate tournament category
    if (args.category === "tournament" && !args.tournamentId) {
      throw new Error("Tournament ID is required for tournament category");
    }

    let fileUrl: string | undefined;
    if (args.fileStorageId) {
      fileUrl = (await ctx.storage.getUrl(args.fileStorageId)) || undefined;
    }

    const informationId = await ctx.db.insert("information", {
      title: args.title,
      description: args.description,
      category: args.category,
      tournamentId: args.tournamentId,
      fileUrl,
      fileStorageId: args.fileStorageId,
      fileType: args.fileType,
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
    category: v.optional(v.union(v.literal("general"), v.literal("tournament"))),
    tournamentId: v.optional(v.id("tournaments")),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
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

    // Validate tournament category
    if (args.category === "tournament" && !args.tournamentId) {
      throw new Error("Tournament ID is required for tournament category");
    }

    let fileUrl = existing.fileUrl;
    if (args.fileStorageId) {
      // Hapus file lama dari storage jika ada file baru yang diupload
      if (
        existing.fileStorageId &&
        existing.fileStorageId !== args.fileStorageId
      ) {
        try {
          await ctx.storage.delete(existing.fileStorageId);
        } catch (e) {
          // File mungkin sudah tidak ada, lanjut saja
          console.warn("Could not delete old file from storage:", e);
        }
      }
      fileUrl = (await ctx.storage.getUrl(args.fileStorageId)) || undefined;
    }

    await ctx.db.patch(args.informationId, {
      title: args.title,
      description: args.description,
      category: args.category || existing.category,
      tournamentId: args.tournamentId !== undefined ? args.tournamentId : existing.tournamentId,
      fileUrl,
      fileStorageId: args.fileStorageId || existing.fileStorageId,
      fileType: args.fileType || existing.fileType,
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

    // Get creator names and tournament names
    const informationWithDetails = await Promise.all(
      information.map(async (info) => {
        const creator = await ctx.db.get(info.createdBy);

        // Refresh file URL if storage ID exists
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        // Get tournament name if tournamentId exists
        let tournamentName: string | undefined;
        if (info.tournamentId) {
          const tournament = await ctx.db.get(info.tournamentId);
          tournamentName = tournament?.name;
        }

        return {
          ...info,
          fileUrl,
          creatorName: creator?.name || "Unknown",
          tournamentName,
        };
      }),
    );

    return informationWithDetails;
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
      }),
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

// Get Published Information for Player (filtered by category and player's tournaments)
export const getPublishedInformationForPlayer = query({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all published information
    const allInformation = await ctx.db
      .query("information")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();

    // Get player's tournaments
    const playerTournaments = await ctx.db
      .query("tournament_participants")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    const playerTournamentIds = new Set(
      playerTournaments.map((p) => p.tournamentId)
    );

    // Filter information based on category
    const filteredInformation = allInformation.filter((info) => {
      // Show all general information
      if (info.category === "general") {
        return true;
      }
      // Show tournament information only if player is registered in that tournament
      if (info.category === "tournament" && info.tournamentId) {
        return playerTournamentIds.has(info.tournamentId);
      }
      return false;
    });

    // Refresh file URLs and add tournament name
    const informationWithDetails = await Promise.all(
      filteredInformation.map(async (info) => {
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        let tournamentName: string | undefined;
        if (info.tournamentId) {
          const tournament = await ctx.db.get(info.tournamentId);
          tournamentName = tournament?.name;
        }

        return {
          ...info,
          fileUrl,
          tournamentName,
        };
      }),
    );

    // Sort by order if specified, otherwise by createdAt
    return informationWithDetails.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

// Get Information by Category
export const getInformationByCategory = query({
  args: {
    category: v.union(v.literal("general"), v.literal("tournament")),
    tournamentId: v.optional(v.id("tournaments")),
  },
  handler: async (ctx, args) => {
    let information;
    
    if (args.category === "tournament" && args.tournamentId) {
      information = await ctx.db
        .query("information")
        .withIndex("by_tournament", (q) =>
          q.eq("tournamentId", args.tournamentId).eq("isPublished", true),
        )
        .order("desc")
        .collect();
    } else {
      information = await ctx.db
        .query("information")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category).eq("isPublished", true),
        )
        .order("desc")
        .collect();
    }

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
      }),
    );

    return informationWithUrls;
  },
});

// Get All Tournaments (for dropdown selection)
export const getAllTournaments = query({
  args: {},
  handler: async (ctx) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .order("desc")
      .collect();

    return tournaments.map((t) => ({
      _id: t._id,
      name: t.name,
      date: t.date,
      status: t.status,
    }));
  },
});
