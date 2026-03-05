import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (players and admins)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("player")),
    handicap: v.optional(v.number()),
    // Additional player profile fields
    phone: v.optional(v.string()),
    nickname: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    workLocation: v.optional(v.string()),
    shirtSize: v.optional(v.union(
      v.literal("S"), 
      v.literal("M"), 
      v.literal("L"), 
      v.literal("XL"),
      v.literal("2XL"),
      v.literal("3XL")
    )),
    gloveSize: v.optional(v.union(
      v.literal("S"),
      v.literal("M"),
      v.literal("L"),
      v.literal("XL"),
      v.literal("22"), 
      v.literal("23"), 
      v.literal("24"), 
      v.literal("25"),
      v.literal("26")
    )),
    profilePhotoUrl: v.optional(v.string()),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    // Club Sets - New structure: each category can have multiple clubs from both brands
    drivers: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    fairways: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    hybrids: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    utilityIrons: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    irons: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    wedges: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    putters: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
    golfBalls: v.optional(v.array(v.object({
      brand: v.string(),
      model: v.string(),
    }))),
  }).index("by_email", ["email"]),

  // Tournaments table
  tournaments: defineTable({
    name: v.string(),
    description: v.string(),
    date: v.number(), // timestamp
    courseId: v.optional(v.id("courses")), // Link to course
    location: v.optional(v.string()), // Optional for backward compatibility
    startHole: v.number(),
    courseType: v.union(
      v.literal("18holes"),
      v.literal("F9"),
      v.literal("B9")
    ),
    gameMode: v.union(
      v.literal("strokePlay"),
      v.literal("system36"),
      v.literal("stableford"),
      v.literal("peoria")
    ),
    scoringDisplay: v.union(v.literal("over"), v.literal("stroke")),
    hiddenHoles: v.array(v.number()),
    specialScoringHoles: v.optional(v.array(v.number())), // Holes with special scoring/leaderboard
    // Schedule/Agenda
    schedule: v.optional(v.string()), // Susunan acara tournament
    // Tee Box Selection
    maleTeeBox: v.optional(v.union(
      v.literal("Blue"),
      v.literal("White"),
      v.literal("Gold"),
      v.literal("Black")
    )),
    femaleTeeBox: v.optional(v.union(
      v.literal("Red"),
      v.literal("White"),
      v.literal("Gold")
    )),
    bannerUrl: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
    maxParticipants: v.optional(v.number()),
    registrationFee: v.optional(v.string()),
    prize: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    ),
  })
    .index("by_status", ["status"])
    .index("by_created_by", ["createdBy"]),

  // Tournament Flights table - grouping players in tournaments
  tournament_flights: defineTable({
    tournamentId: v.id("tournaments"),
    flightName: v.string(), // e.g., "Flight A", "Flight 1"
    flightNumber: v.number(),
    startTime: v.optional(v.string()), // e.g., "08:00"
    startHole: v.number(),
    createdAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_tournament_and_number", ["tournamentId", "flightNumber"]),

  // Tournament participants table (now linked to flights)
  tournament_participants: defineTable({
    tournamentId: v.id("tournaments"),
    flightId: v.optional(v.id("tournament_flights")), // Optional for backward compatibility
    playerId: v.id("users"),
    startHole: v.number(),
    registeredAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_flight", ["flightId"])
    .index("by_player", ["playerId"])
    .index("by_tournament_and_player", ["tournamentId", "playerId"])
    .index("by_flight_and_player", ["flightId", "playerId"]),

  // Scores table
  scores: defineTable({
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
    holeNumber: v.number(),
    strokes: v.number(),
    submittedAt: v.number(),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_player", ["playerId"])
    .index("by_tournament_and_player", ["tournamentId", "playerId"])
    .index("by_tournament_player_hole", ["tournamentId", "playerId", "holeNumber"]),

  // Pending Scores - waiting for approval
  pending_scores: defineTable({
    tournamentId: v.id("tournaments"),
    targetPlayerId: v.id("users"), // Player whose score is being recorded
    scoringUserId: v.id("users"), // Player who is recording the score
    holeNumber: v.number(),
    strokes: v.number(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_tournament", ["tournamentId"])
    .index("by_target_player", ["targetPlayerId"])
    .index("by_target_player_and_status", ["targetPlayerId", "status"])
    .index("by_tournament_and_target", ["tournamentId", "targetPlayerId"])
    .index("by_tournament_target_hole", ["tournamentId", "targetPlayerId", "holeNumber"]),

  // Golf Courses table
  courses: defineTable({
    name: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    totalHoles: v.number(), // 9 or 18
    // Tee Box configurations
    teeBoxes: v.array(v.object({
      name: v.string(), // "Black", "Blue", "White", "Gold", "Red"
      color: v.string(), // Color code for UI
      rating: v.optional(v.number()),
      slope: v.optional(v.number()),
    })),
    createdAt: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
  })
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"]),

  // Holes configuration table (now linked to courses)
  holes_config: defineTable({
    courseId: v.optional(v.id("courses")), // Optional for backward compatibility
    holeNumber: v.number(),
    par: v.number(),
    index: v.number(), // Handicap index
    courseSection: v.union(v.literal("front9"), v.literal("back9")),
    // Distance from each tee box
    distances: v.optional(v.array(v.object({
      teeBoxName: v.string(), // "Black", "Blue", "White", etc.
      distance: v.number(), // in meters or yards
    }))),
  })
    .index("by_course", ["courseId"])
    .index("by_course_and_hole", ["courseId", "holeNumber"]),

  // News/Notifications table
  news: defineTable({
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("Tournament"),
      v.literal("Tips"),
      v.literal("Berita"),
      v.literal("Announcement")
    ),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    publishedAt: v.number(),
    createdBy: v.id("users"),
    isPublished: v.boolean(),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("players"),
      v.literal("admins"),
      v.literal("specific")
    ),
    specificPlayerIds: v.optional(v.array(v.id("users"))),
    // Tournament invitation fields
    tournamentId: v.optional(v.id("tournaments")),
  })
    .index("by_published", ["isPublished", "publishedAt"])
    .index("by_category", ["category"])
    .index("by_created_by", ["createdBy"])
    .index("by_tournament", ["tournamentId"]),

  // News confirmation tracking
  news_confirmations: defineTable({
    newsId: v.id("news"),
    playerId: v.id("users"),
    confirmedAt: v.number(),
    isPaid: v.boolean(),
    paidAt: v.optional(v.number()),
  })
    .index("by_news", ["newsId"])
    .index("by_player", ["playerId"])
    .index("by_news_and_player", ["newsId", "playerId"]),

  // Email notification logs
  email_logs: defineTable({
    newsId: v.id("news"),
    sentBy: v.id("users"),
    recipients: v.array(v.id("users")),
    subject: v.string(),
    content: v.string(),
    sentAt: v.number(),
    results: v.array(v.object({
      success: v.boolean(),
      email: v.string(),
    })),
  })
    .index("by_news", ["newsId"])
    .index("by_sent_by", ["sentBy"]),

  // Information Management table (Fact Sheet, Tee Sheet, Activity, Contact)
  information: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("factsheet"),
      v.literal("teesheet"),
      v.literal("activity"),
      v.literal("contact")
    ),
    // File storage
    fileUrl: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()), // "pdf", "jpg", "png"
    // Contact specific fields
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPosition: v.optional(v.string()),
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isPublished: v.boolean(),
    order: v.optional(v.number()), // For sorting
  })
    .index("by_type", ["type", "isPublished"])
    .index("by_created_by", ["createdBy"])
    .index("by_published", ["isPublished", "createdAt"]),
});
