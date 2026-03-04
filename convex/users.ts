import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";

// Login with username/email/name/nickname and password
export const login = mutation({
  args: {
    identifier: v.string(), // Can be email, username, name, or nickname
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate input
    if (!args.identifier || !args.password) {
      throw new Error("Invalid credentials");
    }

    // Normalize identifier to lowercase for comparison
    const normalizedIdentifier = args.identifier.toLowerCase();

    // Find user by email
    const userByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedIdentifier))
      .first();

    if (userByEmail) {
      // Verify password using bcrypt (synchronous version for Convex)
      const isPasswordValid = bcrypt.compareSync(
        args.password,
        userByEmail.password || "",
      );

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Verify user has a valid role
      if (
        !userByEmail.role ||
        (userByEmail.role !== "admin" && userByEmail.role !== "player")
      ) {
        throw new Error("Invalid user role. Please contact administrator.");
      }

      // Return user data (without password)
      return {
        success: true,
        user: {
          _id: userByEmail._id,
          email: userByEmail.email,
          username: userByEmail.username,
          name: userByEmail.name,
          role: userByEmail.role,
          handicap: userByEmail.handicap,
          phone: userByEmail.phone,
          nickname: userByEmail.nickname,
          dateOfBirth: userByEmail.dateOfBirth,
          gender: userByEmail.gender,
          workLocation: userByEmail.workLocation,
          shirtSize: userByEmail.shirtSize,
          gloveSize: userByEmail.gloveSize,
          profilePhotoUrl: userByEmail.profilePhotoUrl,
          drivers: userByEmail.drivers,
          fairways: userByEmail.fairways,
          hybrids: userByEmail.hybrids,
          irons: userByEmail.irons,
          wedges: userByEmail.wedges,
          putters: userByEmail.putters,
          golfBalls: userByEmail.golfBalls,
        },
      };
    }

    // Find user by username, name, or nickname (case-insensitive)
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(
      (u) =>
        u.username?.toLowerCase() === normalizedIdentifier ||
        u.name?.toLowerCase() === normalizedIdentifier ||
        u.nickname?.toLowerCase() === normalizedIdentifier,
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password using bcrypt (synchronous version for Convex)
    const isPasswordValid = bcrypt.compareSync(
      args.password,
      user.password || "",
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Verify user has a valid role
    if (!user.role || (user.role !== "admin" && user.role !== "player")) {
      throw new Error("Invalid user role. Please contact administrator.");
    }

    // Return user data (without password)
    return {
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        handicap: user.handicap,
        phone: user.phone,
        nickname: user.nickname,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        workLocation: user.workLocation,
        shirtSize: user.shirtSize,
        gloveSize: user.gloveSize,
        profilePhotoUrl: user.profilePhotoUrl,
        drivers: user.drivers,
        fairways: user.fairways,
        hybrids: user.hybrids,
        irons: user.irons,
        wedges: user.wedges,
        putters: user.putters,
        golfBalls: user.golfBalls,
      },
    };
  },
});

// Register new user
export const register = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("player"))),
    handicap: v.optional(v.number()),
    phone: v.optional(v.string()),
    nickname: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    workLocation: v.optional(v.string()),
    shirtSize: v.optional(
      v.union(
        v.literal("S"),
        v.literal("M"),
        v.literal("L"),
        v.literal("XL"),
        v.literal("2XL"),
        v.literal("3XL"),
      ),
    ),
    gloveSize: v.optional(
      v.union(
        v.literal("S"),
        v.literal("M"),
        v.literal("L"),
        v.literal("XL"),
        v.literal("22"),
        v.literal("23"),
        v.literal("24"),
        v.literal("25"),
        v.literal("26"),
      ),
    ),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    drivers: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    fairways: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    hybrids: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    irons: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    wedges: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    putters: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
    golfBalls: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          model: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Debug: Log received data
    console.log("📥 Register mutation received:");
    console.log("dateOfBirth:", args.dateOfBirth);
    console.log("golfBalls:", args.golfBalls);

    // Normalize email and nickname to lowercase
    const normalizedEmail = args.email.toLowerCase();
    const normalizedNickname = args.nickname?.toLowerCase();

    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Check if nickname already exists (case-insensitive) - nickname must be unique
    if (normalizedNickname) {
      const allUsers = await ctx.db.query("users").collect();
      const existingNickname = allUsers.find(
        (u) => u.nickname?.toLowerCase() === normalizedNickname
      );

      if (existingNickname) {
        throw new Error("Nickname already taken");
      }
    }

    // Get profile photo URL if storage ID provided
    let profilePhotoUrl: string | undefined;
    if (args.profilePhotoStorageId) {
      const url = await ctx.storage.getUrl(args.profilePhotoStorageId);
      profilePhotoUrl = url ?? undefined;
    }

    // Hash password using bcrypt (synchronous version for Convex)
    const hashedPassword = bcrypt.hashSync(args.password, 10);

    // Create new user with normalized values
    const userId = await ctx.db.insert("users", {
      email: normalizedEmail,
      username: args.username, // Username tidak perlu lowercase karena bisa duplikat
      password: hashedPassword,
      name: args.name,
      role: args.role || "player",
      handicap: args.handicap,
      phone: args.phone,
      nickname: normalizedNickname,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      workLocation: args.workLocation,
      shirtSize: args.shirtSize,
      gloveSize: args.gloveSize,
      profilePhotoStorageId: args.profilePhotoStorageId,
      profilePhotoUrl: profilePhotoUrl,
      drivers: args.drivers,
      fairways: args.fairways,
      hybrids: args.hybrids,
      irons: args.irons,
      wedges: args.wedges,
      putters: args.putters,
      golfBalls: args.golfBalls,
    });

    console.log("✅ User created with ID:", userId);
    console.log("Saved dateOfBirth:", args.dateOfBirth);
    console.log("Saved golfBalls:", args.golfBalls);

    return {
      success: true,
      user: {
        _id: userId,
        email: args.email,
        username: args.username,
        name: args.name,
        role: args.role || "player",
        handicap: args.handicap,
        phone: args.phone,
        gender: args.gender,
        dateOfBirth: args.dateOfBirth,
        workLocation: args.workLocation,
        shirtSize: args.shirtSize,
        gloveSize: args.gloveSize,
        profilePhotoUrl: profilePhotoUrl,
      },
    };
  },
});

// Create or update user (called after authentication)
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("player"))),
    handicap: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        ...(args.role && { role: args.role }),
        ...(args.handicap !== undefined && { handicap: args.handicap }),
      });
      return { success: true, userId: existingUser._id, isNew: false };
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        role: args.role || "player",
        handicap: args.handicap,
      });
      return { success: true, userId, isNew: true };
    }
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    return user;
  },
});

// Get all players (for admin to register to tournaments)
export const getAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all players");
    }

    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((u) => u.role === "player");
  },
});

// Get all players without auth (for localStorage-based auth system)
export const listAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    // Get all users with role 'player'
    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter((u) => u.role === "player")
      .map((player) => ({
        _id: player._id,
        _creationTime: player._creationTime,
        name: player.name,
        email: player.email,
        username: player.username,
        role: player.role,
        handicap: player.handicap,
        phone: player.phone,
        nickname: player.nickname,
        dateOfBirth: player.dateOfBirth,
        gender: player.gender,
        workLocation: player.workLocation,
        shirtSize: player.shirtSize,
        gloveSize: player.gloveSize,
        drivers: player.drivers,
        fairways: player.fairways,
        hybrids: player.hybrids,
        irons: player.irons,
        wedges: player.wedges,
        putters: player.putters,
        golfBalls: player.golfBalls,
      }));
  },
});

// Get all users (for admin management)
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      handicap: user.handicap,
    }));
  },
});

// Create a test admin user (for development only)
export const createTestAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return {
        success: true,
        userId: existingUser._id,
        message: "User already exists",
      };
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "admin",
    });

    return { success: true, userId, message: "Admin user created" };
  },
});

// Create a test player user (for development only)
export const createTestPlayer = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    handicap: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return {
        success: true,
        userId: existingUser._id,
        message: "User already exists",
      };
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "player",
      handicap: args.handicap,
    });

    return { success: true, userId, message: "Player user created" };
  },
});

// Update player
export const updatePlayer = mutation({
  args: {
    playerId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    handicap: v.optional(v.number()),
    phone: v.optional(v.string()),
    nickname: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    workLocation: v.optional(v.string()),
    shirtSize: v.optional(
      v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")),
    ),
    gloveSize: v.optional(
      v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")),
    ),
    drivers: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    fairways: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    hybrids: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    utilityIrons: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    irons: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    wedges: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    putters: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { playerId, ...updates } = args;

    // Check if player exists
    const player = await ctx.db.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== player.email) {
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingEmail) {
        throw new Error("Email already registered");
      }
    }

    // Check if username is being changed and if it's already taken
    if (updates.username && updates.username !== player.username) {
      const existingUsername = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("username"), updates.username!))
        .first();

      if (existingUsername) {
        throw new Error("Username already taken");
      }
    }

    // Update player
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.password !== undefined) updateData.password = updates.password;
    if (updates.handicap !== undefined) updateData.handicap = updates.handicap;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.nickname !== undefined) updateData.nickname = updates.nickname;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.workLocation !== undefined)
      updateData.workLocation = updates.workLocation;
    if (updates.shirtSize !== undefined)
      updateData.shirtSize = updates.shirtSize;
    if (updates.gloveSize !== undefined)
      updateData.gloveSize = updates.gloveSize;
    if (updates.drivers !== undefined) updateData.drivers = updates.drivers;
    if (updates.fairways !== undefined) updateData.fairways = updates.fairways;
    if (updates.hybrids !== undefined) updateData.hybrids = updates.hybrids;

    if (updates.irons !== undefined) updateData.irons = updates.irons;
    if (updates.wedges !== undefined) updateData.wedges = updates.wedges;
    if (updates.putters !== undefined) updateData.putters = updates.putters;

    await ctx.db.patch(playerId, updateData);

    return { success: true, message: "Player updated successfully" };
  },
});

// Delete player
export const deletePlayer = mutation({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if player exists
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if player is registered in any tournaments
    const playerInTournaments = await ctx.db
      .query("tournament_participants")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    if (playerInTournaments.length > 0) {
      throw new Error(
        "Cannot delete player who is registered in tournaments. Please remove them from tournaments first.",
      );
    }

    // Delete player
    await ctx.db.delete(args.playerId);

    return { success: true, message: "Player deleted successfully" };
  },
});

// Generate upload URL for profile photo
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    nickname: v.optional(v.string()),
    handicap: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    workLocation: v.optional(v.string()),
    shirtSize: v.optional(
      v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")),
    ),
    gloveSize: v.optional(
      v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")),
    ),
    drivers: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    fairways: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    hybrids: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    utilityIrons: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    irons: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    wedges: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
    putters: v.optional(
      v.array(
        v.object({
          brand: v.union(v.literal("Titleist"), v.literal("Other")),
          model: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.nickname !== undefined) updateData.nickname = updates.nickname;
    if (updates.handicap !== undefined) updateData.handicap = updates.handicap;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.workLocation !== undefined)
      updateData.workLocation = updates.workLocation;
    if (updates.shirtSize !== undefined)
      updateData.shirtSize = updates.shirtSize;
    if (updates.gloveSize !== undefined)
      updateData.gloveSize = updates.gloveSize;
    if (updates.drivers !== undefined) updateData.drivers = updates.drivers;
    if (updates.fairways !== undefined) updateData.fairways = updates.fairways;
    if (updates.hybrids !== undefined) updateData.hybrids = updates.hybrids;

    if (updates.irons !== undefined) updateData.irons = updates.irons;
    if (updates.wedges !== undefined) updateData.wedges = updates.wedges;
    if (updates.putters !== undefined) updateData.putters = updates.putters;

    await ctx.db.patch(userId, updateData);

    return { success: true, message: "Profile updated successfully" };
  },
});

// Get player statistics
export const getPlayerStatistics = query({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all tournaments the player participated in
    const participations = await ctx.db
      .query("tournament_participants")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    const totalTournaments = participations.length;

    // Get all scores for this player
    const allScores = await ctx.db
      .query("scores")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    const totalHolesPlayed = allScores.length;

    // Get holes config for par information
    const holesConfig = await ctx.db.query("holes_config").collect();
    const holesMap = new Map(holesConfig.map((h) => [h.holeNumber, h]));

    // Calculate statistics
    let totalStrokes = 0;
    let bestScore = Infinity;
    let eagles = 0;
    let birdies = 0;
    let pars = 0;
    let bogeys = 0;
    let doubleBogeyPlus = 0;

    // Group scores by tournament for best score calculation
    const scoresByTournament = new Map<string, number>();

    for (const score of allScores) {
      totalStrokes += score.strokes;

      // Track tournament total
      const tournamentKey = score.tournamentId;
      scoresByTournament.set(
        tournamentKey,
        (scoresByTournament.get(tournamentKey) || 0) + score.strokes,
      );

      // Calculate score classification
      const holeConfig = holesMap.get(score.holeNumber);
      if (holeConfig) {
        const diff = score.strokes - holeConfig.par;
        if (diff <= -2) eagles++;
        else if (diff === -1) birdies++;
        else if (diff === 0) pars++;
        else if (diff === 1) bogeys++;
        else if (diff >= 2) doubleBogeyPlus++;
      }
    }

    // Find best score (lowest total in any tournament)
    if (scoresByTournament.size > 0) {
      bestScore = Math.min(...Array.from(scoresByTournament.values()));
    } else {
      bestScore = 0;
    }

    const averageScore =
      totalHolesPlayed > 0 ? totalStrokes / totalHolesPlayed : 0;

    // Calculate performance metrics (simplified)
    const totalScores = allScores.length;
    const fairwayHitRate =
      totalScores > 0
        ? Math.round(((pars + birdies + eagles) / totalScores) * 100)
        : 0;
    const greenInRegulation =
      totalScores > 0
        ? Math.round(((pars + birdies + eagles) / totalScores) * 80)
        : 0;
    const parSaveRate =
      totalScores > 0 ? Math.round((pars / totalScores) * 100) : 0;

    // Get recent tournament scores (last 5)
    const recentTournaments = await Promise.all(
      participations
        .slice(-5)
        .reverse()
        .map(async (participation) => {
          const tournament = await ctx.db.get(participation.tournamentId);
          if (!tournament) return null;

          const tournamentScores = allScores.filter(
            (s) => s.tournamentId === participation.tournamentId,
          );

          const totalScore = tournamentScores.reduce(
            (sum, s) => sum + s.strokes,
            0,
          );
          const totalPar = tournamentScores.reduce((sum, s) => {
            const hole = holesMap.get(s.holeNumber);
            return sum + (hole?.par || 0);
          }, 0);

          return {
            tournamentName: tournament.name,
            date: tournament.date,
            totalScore,
            scoreVsPar: totalScore - totalPar,
          };
        }),
    );

    const recentScores = recentTournaments.filter((t) => t !== null);

    // Generate achievements based on performance
    const achievements = [];
    if (eagles > 0) {
      achievements.push({
        icon: "🦅",
        title: "Eagle Hunter",
        description: `${eagles} Eagles`,
      });
    }
    if (birdies >= 10) {
      achievements.push({
        icon: "🐦",
        title: "Birdie Master",
        description: `${birdies} Birdies`,
      });
    }
    if (totalTournaments >= 5) {
      achievements.push({
        icon: "🏆",
        title: "Tournament Regular",
        description: `${totalTournaments} Tournaments`,
      });
    }
    if (bestScore > 0 && bestScore < 80) {
      achievements.push({
        icon: "⭐",
        title: "Sub-80 Club",
        description: `Best: ${bestScore}`,
      });
    }

    return {
      totalTournaments,
      totalHolesPlayed,
      bestScore: bestScore === Infinity ? 0 : bestScore,
      averageScore,
      scoreDistribution: {
        eagles,
        birdies,
        pars,
        bogeys,
        doubleBogeyPlus,
      },
      fairwayHitRate,
      greenInRegulation,
      parSaveRate,
      recentScores,
      achievements,
    };
  },
});

// Forgot password - validate email and reset password
export const resetPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate input
    if (!args.email || !args.newPassword) {
      throw new Error("Email dan password baru harus diisi");
    }

    // Validate password length (minimum 3 characters)
    if (args.newPassword.length < 3) {
      throw new Error("Password minimal 3 karakter");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Email tidak terdaftar");
    }

    // Hash new password using bcrypt
    const hashedPassword = bcrypt.hashSync(args.newPassword, 10);

    // Update user password
    await ctx.db.patch(user._id, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: "Password berhasil direset",
    };
  },
});


// Validate email for forgot password
export const validateEmailForReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate input
    if (!args.email) {
      throw new Error("Email harus diisi");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Email tidak terdaftar");
    }

    return {
      success: true,
      message: "Email valid",
    };
  },
});

