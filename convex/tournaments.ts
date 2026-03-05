import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTournament = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    date: v.number(),
    courseId: v.optional(v.id("courses")),
    location: v.string(),
    startHole: v.number(),
    courseType: v.union(v.literal("18holes"), v.literal("F9"), v.literal("B9")),
    gameMode: v.union(v.literal("strokePlay"), v.literal("system36"), v.literal("stableford"), v.literal("peoria")),
    scoringDisplay: v.union(v.literal("over"), v.literal("stroke")),
    specialScoringHoles: v.optional(v.array(v.number())),
    schedule: v.optional(v.string()),
    maleTeeBox: v.optional(v.union(v.literal("Blue"), v.literal("White"), v.literal("Gold"), v.literal("Black"))),
    femaleTeeBox: v.optional(v.union(v.literal("Red"), v.literal("White"), v.literal("Gold"))),
    bannerUrl: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
    maxParticipants: v.optional(v.number()),
    registrationFee: v.optional(v.string()),
    prize: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized");

    const tournamentId = await ctx.db.insert("tournaments", {
      name: args.name,
      description: args.description,
      date: args.date,
      courseId: args.courseId,
      location: args.location,
      startHole: args.startHole,
      courseType: args.courseType,
      gameMode: args.gameMode,
      scoringDisplay: args.scoringDisplay,
      hiddenHoles: [],
      specialScoringHoles: args.specialScoringHoles || [],
      schedule: args.schedule,
      maleTeeBox: args.maleTeeBox,
      femaleTeeBox: args.femaleTeeBox,
      bannerUrl: args.bannerUrl,
      bannerStorageId: args.bannerStorageId,
      maxParticipants: args.maxParticipants,
      registrationFee: args.registrationFee,
      prize: args.prize,
      contactPerson: args.contactPerson,
      createdBy: user._id,
      createdAt: Date.now(),
      status: "upcoming",
    });

    return { success: true, tournamentId };
  },
});

export const getTournaments = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    }
    if (!user) return [];

    if (user.role === "admin") {
      const tournaments = await ctx.db.query("tournaments").collect();
      const tournamentsWithCounts = await Promise.all(
        tournaments.map(async (tournament) => {
          const participations = await ctx.db.query("tournament_participants")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id)).collect();
          
          // Get banner URL from storage if bannerStorageId exists
          let bannerUrl = tournament.bannerUrl;
          if (tournament.bannerStorageId) {
            const url = await ctx.storage.getUrl(tournament.bannerStorageId);
            if (url) bannerUrl = url;
          }
          
          return { 
            ...tournament, 
            participantCount: participations.length,
            bannerUrl
          };
        })
      );
      return tournamentsWithCounts;
    } else {
      const participations = await ctx.db.query("tournament_participants")
        .withIndex("by_player", (q) => q.eq("playerId", user._id)).collect();
      const tournamentIds = participations.map((p) => p.tournamentId);
      const tournaments = await Promise.all(
        tournamentIds.map(async (id) => {
          const tournament = await ctx.db.get(id);
          if (!tournament) return null;
          
          // Get banner URL from storage if bannerStorageId exists
          let bannerUrl = tournament.bannerUrl;
          if (tournament.bannerStorageId) {
            const url = await ctx.storage.getUrl(tournament.bannerStorageId);
            if (url) bannerUrl = url;
          }
          
          // Get participant count
          const participations = await ctx.db.query("tournament_participants")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", id)).collect();
          
          return {
            ...tournament,
            bannerUrl,
            participantCount: participations.length
          };
        })
      );
      return tournaments.filter((t) => t !== null);
    }
  },
});

// Get all tournaments without any filter (for public tournament list)
export const getAllTournaments = query({
  args: {},
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("tournaments").collect();
    const tournamentsWithCounts = await Promise.all(
      tournaments.map(async (tournament) => {
        const participations = await ctx.db.query("tournament_participants")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id)).collect();
        
        // Get banner URL from storage if bannerStorageId exists
        let bannerUrl = tournament.bannerUrl;
        if (tournament.bannerStorageId) {
          const url = await ctx.storage.getUrl(tournament.bannerStorageId);
          if (url) bannerUrl = url;
        }
        
        return { 
          ...tournament, 
          participantCount: participations.length,
          bannerUrl // Override with fresh URL from storage
        };
      })
    );
    return tournamentsWithCounts;
  },
});

export const getTournamentDetails = query({
  args: { tournamentId: v.id("tournaments"), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    // Get banner URL from storage if bannerStorageId exists
    let bannerUrl = tournament.bannerUrl;
    if (tournament.bannerStorageId) {
      const url = await ctx.storage.getUrl(tournament.bannerStorageId);
      if (url) bannerUrl = url;
    }

    const flights = await ctx.db.query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();

    const flightsWithParticipants = await Promise.all(
      flights.map(async (flight) => {
        const participations = await ctx.db.query("tournament_participants")
          .withIndex("by_flight", (q) => q.eq("flightId", flight._id)).collect();
        const participants = await Promise.all(
          participations.map(async (p) => {
            const player = await ctx.db.get(p.playerId);
            return player ? { ...player, startHole: p.startHole } : null;
          })
        );
        return { ...flight, participants: participants.filter((p) => p !== null) };
      })
    );

    let holesConfig = await ctx.db.query("holes_config").collect();
    if (tournament.courseType === "F9") {
      holesConfig = holesConfig.filter((h) => h.holeNumber >= 1 && h.holeNumber <= 9);
    } else if (tournament.courseType === "B9") {
      holesConfig = holesConfig.filter((h) => h.holeNumber >= 10 && h.holeNumber <= 18);
    }

    return { ...tournament, bannerUrl, flights: flightsWithParticipants, holesConfig };
  },
});

export const updateTournamentStatus = mutation({
  args: { tournamentId: v.id("tournaments"), status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("completed")), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.patch(args.tournamentId, { status: args.status });
    return { success: true };
  },
});

export const getTournamentParticipants = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const participations = await ctx.db.query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();
    const participants = await Promise.all(
      participations.map(async (p) => {
        const player = await ctx.db.get(p.playerId);
        const flight = p.flightId ? await ctx.db.get(p.flightId) : null;
        return player ? {
          ...player, startHole: p.startHole, registeredAt: p.registeredAt,
          participationId: p._id, flightId: p.flightId, flightName: flight?.flightName || "No Flight"
        } : null;
      })
    );
    return participants.filter((p) => p !== null);
  },
});

export const getTournamentParticipantCount = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const participations = await ctx.db.query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();
    return participations.length;
  },
});

export const deleteTournament = mutation({
  args: { tournamentId: v.id("tournaments"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") throw new Error("Unauthorized");
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const participations = await ctx.db.query("tournament_participants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();
    for (const p of participations) await ctx.db.delete(p._id);

    const flights = await ctx.db.query("tournament_flights")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();
    for (const f of flights) await ctx.db.delete(f._id);

    const scores = await ctx.db.query("scores")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId)).collect();
    for (const s of scores) await ctx.db.delete(s._id);

    await ctx.db.delete(args.tournamentId);
    return { success: true };
  },
});

export const updateTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"), name: v.optional(v.string()), description: v.optional(v.string()),
    date: v.optional(v.number()), location: v.optional(v.string()), startHole: v.optional(v.number()),
    courseType: v.optional(v.union(v.literal("18holes"), v.literal("F9"), v.literal("B9"))),
    gameMode: v.optional(v.union(v.literal("strokePlay"), v.literal("system36"), v.literal("stableford"))),
    scoringDisplay: v.optional(v.union(v.literal("over"), v.literal("stroke"))),
    specialScoringHoles: v.optional(v.array(v.number())),
    schedule: v.optional(v.string()),
    maleTeeBox: v.optional(v.union(v.literal("Blue"), v.literal("White"), v.literal("Gold"), v.literal("Black"))),
    femaleTeeBox: v.optional(v.union(v.literal("Red"), v.literal("White"), v.literal("Gold"))),
    bannerUrl: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")), maxParticipants: v.optional(v.number()),
    registrationFee: v.optional(v.string()), prize: v.optional(v.string()),
    contactPerson: v.optional(v.string()), userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.userId);
    if (!admin || admin.role !== "admin") throw new Error("Unauthorized");
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.location !== undefined) updates.location = args.location;
    if (args.startHole !== undefined) updates.startHole = args.startHole;
    if (args.courseType !== undefined) updates.courseType = args.courseType;
    if (args.gameMode !== undefined) updates.gameMode = args.gameMode;
    if (args.scoringDisplay !== undefined) updates.scoringDisplay = args.scoringDisplay;
    if (args.specialScoringHoles !== undefined) updates.specialScoringHoles = args.specialScoringHoles;
    if (args.schedule !== undefined) updates.schedule = args.schedule;
    if (args.maleTeeBox !== undefined) updates.maleTeeBox = args.maleTeeBox;
    if (args.femaleTeeBox !== undefined) updates.femaleTeeBox = args.femaleTeeBox;
    if (args.bannerUrl !== undefined) updates.bannerUrl = args.bannerUrl;
    if (args.bannerStorageId !== undefined) updates.bannerStorageId = args.bannerStorageId;
    if (args.maxParticipants !== undefined) updates.maxParticipants = args.maxParticipants;
    if (args.registrationFee !== undefined) updates.registrationFee = args.registrationFee;
    if (args.prize !== undefined) updates.prize = args.prize;
    if (args.contactPerson !== undefined) updates.contactPerson = args.contactPerson;

    await ctx.db.patch(args.tournamentId, updates);
    return { success: true };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getTournamentBannerUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get player tournaments with detailed information
export const getPlayerTournaments = query({
  args: { playerId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all tournament participations for this player
    const participations = await ctx.db
      .query("tournament_participants")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    // Get tournament details for each participation
    const tournaments = await Promise.all(
      participations.map(async (participation) => {
        const tournament = await ctx.db.get(participation.tournamentId);
        if (!tournament) return null;

        // Get banner URL from storage if bannerStorageId exists
        let bannerUrl = tournament.bannerUrl;
        if (tournament.bannerStorageId) {
          const url = await ctx.storage.getUrl(tournament.bannerStorageId);
          if (url) bannerUrl = url;
        }

        // Get course information if courseId exists
        let location = tournament.location;
        if (tournament.courseId) {
          const course = await ctx.db.get(tournament.courseId);
          if (course) {
            location = course.location;
          }
        }

        // Get participant count
        const allParticipations = await ctx.db
          .query("tournament_participants")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .collect();

        // Get player's scores for this tournament
        const playerScores = await ctx.db
          .query("scores")
          .withIndex("by_tournament_and_player", (q) =>
            q.eq("tournamentId", tournament._id).eq("playerId", args.playerId)
          )
          .collect();

        // Calculate player's rank if tournament is completed
        let playerRank: number | undefined;
        if (tournament.status === "completed" && playerScores.length > 0) {
          // Get all players' total scores
          const allPlayerScores = new Map<string, number>();
          
          for (const p of allParticipations) {
            const scores = await ctx.db
              .query("scores")
              .withIndex("by_tournament_and_player", (q) =>
                q.eq("tournamentId", tournament._id).eq("playerId", p.playerId)
              )
              .collect();
            
            const totalScore = scores.reduce((sum, s) => sum + s.strokes, 0);
            allPlayerScores.set(p.playerId, totalScore);
          }

          // Sort players by score (ascending for stroke play)
          const sortedPlayers = Array.from(allPlayerScores.entries())
            .sort((a, b) => a[1] - b[1]);

          // Find player's rank
          const playerIndex = sortedPlayers.findIndex(([id]) => id === args.playerId);
          if (playerIndex !== -1) {
            playerRank = playerIndex + 1;
          }
        }

        return {
          ...tournament,
          bannerUrl,
          location,
          participantCount: allParticipations.length,
          playerRank,
        };
      })
    );

    // Filter out null values and sort by date (newest first)
    return tournaments
      .filter((t) => t !== null)
      .sort((a, b) => b!.date - a!.date);
  },
});

// Get tournament confirmation summary from news
export const getTournamentConfirmationSummary = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    // Find news related to this tournament
    const newsItems = await ctx.db
      .query("news")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    let totalConfirmed = 0;
    let totalPaid = 0;

    // Get confirmations for each news item
    for (const news of newsItems) {
      const confirmations = await ctx.db
        .query("news_confirmations")
        .withIndex("by_news", (q) => q.eq("newsId", news._id))
        .collect();

      totalConfirmed += confirmations.length;
      totalPaid += confirmations.filter((c) => c.isPaid).length;
    }

    return {
      confirmed: totalConfirmed,
      paid: totalPaid,
    };
  },
});

// Check if user is registered in tournament
export const checkUserRegistration = query({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const participation = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament_and_player", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("playerId", args.userId)
      )
      .first();

    return {
      isRegistered: !!participation,
      participationId: participation?._id,
    };
  },
});
