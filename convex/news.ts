import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate Upload URL for News Image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create News
export const createNews = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("Tournament"),
      v.literal("Tips"),
      v.literal("Berita"),
      v.literal("Announcement")
    ),
    imageStorageId: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("players"),
      v.literal("admins"),
      v.literal("specific")
    ),
    specificPlayerIds: v.optional(v.array(v.id("users"))),
    tournamentId: v.optional(v.id("tournaments")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create news");
    }

    // Get image URL from storage if imageStorageId exists
    let imageUrl: string | undefined;
    if (args.imageStorageId) {
      imageUrl = await ctx.storage.getUrl(args.imageStorageId) ?? undefined;
    }

    const newsId = await ctx.db.insert("news", {
      title: args.title,
      excerpt: args.excerpt,
      content: args.content,
      category: args.category,
      imageUrl,
      imageStorageId: args.imageStorageId,
      publishedAt: Date.now(),
      createdBy: args.userId,
      isPublished: args.isPublished,
      targetAudience: args.targetAudience,
      specificPlayerIds: args.specificPlayerIds,
      tournamentId: args.tournamentId,
    });

    return { success: true, newsId };
  },
});

// Get All News (Admin)
export const getAllNews = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all news");
    }

    const news = await ctx.db.query("news").collect();
    
    // Sort by publishedAt descending
    news.sort((a, b) => b.publishedAt - a.publishedAt);

    // Get creator info, image URLs, and tournament info
    const newsWithCreator = await Promise.all(
      news.map(async (item) => {
        const creator = await ctx.db.get(item.createdBy);
        let imageUrl = item.imageUrl;
        
        // Get fresh image URL from storage if imageStorageId exists
        if (item.imageStorageId) {
          const url = await ctx.storage.getUrl(item.imageStorageId);
          if (url) imageUrl = url;
        }

        // Get tournament info if tournamentId exists
        let tournament = null;
        if (item.tournamentId) {
          tournament = await ctx.db.get(item.tournamentId);
        }
        
        return {
          ...item,
          imageUrl,
          creatorName: creator?.name || "Unknown",
          tournament,
        };
      })
    );

    return newsWithCreator;
  },
});

// Get Published News (Players)
export const getPublishedNews = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get user role
    let userRole = "player";
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        userRole = user.role;
      }
    }

    // Get published news
    const allNews = await ctx.db
      .query("news")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Filter by target audience
    const filteredNews = allNews.filter((item) => {
      if (item.targetAudience === "all") return true;
      if (item.targetAudience === "players" && userRole === "player") return true;
      if (item.targetAudience === "admins" && userRole === "admin") return true;
      if (item.targetAudience === "specific" && args.userId) {
        return item.specificPlayerIds?.includes(args.userId);
      }
      return false;
    });

    // Get image URLs from storage
    const newsWithImages = await Promise.all(
      filteredNews.map(async (item) => {
        let imageUrl = item.imageUrl;
        
        // Get fresh image URL from storage if imageStorageId exists
        if (item.imageStorageId) {
          const url = await ctx.storage.getUrl(item.imageStorageId);
          if (url) imageUrl = url;
        }
        
        return {
          ...item,
          imageUrl,
        };
      })
    );

    // Sort by publishedAt descending
    newsWithImages.sort((a, b) => b.publishedAt - a.publishedAt);

    return newsWithImages;
  },
});

// Get News by ID
export const getNewsById = query({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    const creator = await ctx.db.get(news.createdBy);
    return {
      ...news,
      creatorName: creator?.name || "Unknown",
    };
  },
});

// Update News
export const updateNews = mutation({
  args: {
    newsId: v.id("news"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("Tournament"),
        v.literal("Tips"),
        v.literal("Berita"),
        v.literal("Announcement")
      )
    ),
    imageStorageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
    targetAudience: v.optional(
      v.union(
        v.literal("all"),
        v.literal("players"),
        v.literal("admins"),
        v.literal("specific")
      )
    ),
    specificPlayerIds: v.optional(v.array(v.id("users"))),
    tournamentId: v.optional(v.id("tournaments")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update news");
    }

    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.content !== undefined) updates.content = args.content;
    if (args.category !== undefined) updates.category = args.category;
    if (args.imageStorageId !== undefined) {
      updates.imageStorageId = args.imageStorageId;
      // Get fresh image URL from storage
      if (args.imageStorageId) {
        const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
        if (imageUrl) updates.imageUrl = imageUrl;
      } else {
        updates.imageUrl = undefined;
      }
    }
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.targetAudience !== undefined) updates.targetAudience = args.targetAudience;
    if (args.specificPlayerIds !== undefined) updates.specificPlayerIds = args.specificPlayerIds;
    if (args.tournamentId !== undefined) updates.tournamentId = args.tournamentId;

    await ctx.db.patch(args.newsId, updates);
    return { success: true };
  },
});

// Delete News
export const deleteNews = mutation({
  args: {
    newsId: v.id("news"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete news");
    }

    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    await ctx.db.delete(args.newsId);
    return { success: true };
  },
});

// Toggle News Published Status
export const toggleNewsPublished = mutation({
  args: {
    newsId: v.id("news"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can toggle news status");
    }

    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    await ctx.db.patch(args.newsId, {
      isPublished: !news.isPublished,
    });

    return { success: true, isPublished: !news.isPublished };
  },
});

// Player confirms attendance for tournament news
export const confirmNewsAttendance = mutation({
  args: {
    newsId: v.id("news"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already confirmed
    const existing = await ctx.db
      .query("news_confirmations")
      .withIndex("by_news_and_player", (q) =>
        q.eq("newsId", args.newsId).eq("playerId", args.playerId)
      )
      .first();

    if (existing) {
      throw new Error("You have already confirmed attendance for this event");
    }

    // Create confirmation
    await ctx.db.insert("news_confirmations", {
      newsId: args.newsId,
      playerId: args.playerId,
      confirmedAt: Date.now(),
      isPaid: false,
    });

    return { success: true };
  },
});

// Get confirmation status for a player
export const getPlayerConfirmation = query({
  args: {
    newsId: v.id("news"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const confirmation = await ctx.db
      .query("news_confirmations")
      .withIndex("by_news_and_player", (q) =>
        q.eq("newsId", args.newsId).eq("playerId", args.playerId)
      )
      .first();

    return confirmation;
  },
});

// Get all confirmations for a news (Admin only)
export const getNewsConfirmations = query({
  args: {
    newsId: v.id("news"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view confirmations");
    }

    const confirmations = await ctx.db
      .query("news_confirmations")
      .withIndex("by_news", (q) => q.eq("newsId", args.newsId))
      .collect();

    // Get player details for each confirmation
    const confirmationsWithPlayers = await Promise.all(
      confirmations.map(async (confirmation) => {
        const player = await ctx.db.get(confirmation.playerId);
        return {
          ...confirmation,
          player,
        };
      })
    );

    return confirmationsWithPlayers;
  },
});

// Admin marks player as paid
export const markPlayerAsPaid = mutation({
  args: {
    confirmationId: v.id("news_confirmations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can mark payment status");
    }

    const confirmation = await ctx.db.get(args.confirmationId);
    if (!confirmation) {
      throw new Error("Confirmation not found");
    }

    await ctx.db.patch(args.confirmationId, {
      isPaid: true,
      paidAt: Date.now(),
    });

    return { success: true };
  },
});

// Admin unmarks player as paid
export const unmarkPlayerAsPaid = mutation({
  args: {
    confirmationId: v.id("news_confirmations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can mark payment status");
    }

    const confirmation = await ctx.db.get(args.confirmationId);
    if (!confirmation) {
      throw new Error("Confirmation not found");
    }

    await ctx.db.patch(args.confirmationId, {
      isPaid: false,
      paidAt: undefined,
    });

    return { success: true };
  },
});

// Get confirmation summary for a news
export const getNewsConfirmationSummary = query({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const confirmations = await ctx.db
      .query("news_confirmations")
      .withIndex("by_news", (q) => q.eq("newsId", args.newsId))
      .collect();

    const confirmed = confirmations.length;
    const paid = confirmations.filter((c) => c.isPaid).length;

    return {
      confirmed,
      paid,
    };
  },
});
