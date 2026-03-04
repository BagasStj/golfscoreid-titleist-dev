import { mutation } from "./_generated/server";

// Migration to clean up old club set fields that are no longer in the schema
export const cleanupOldClubFields = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    let updatedCount = 0;
    const oldFields = [
      'titleistDrivers',
      'titleistFairways', 
      'titleistHybrids',
      'titleistUtilityIrons',
      'titleistIrons',
      'titleistWedges',
      'titleistPutters',
      'otherDrivers',
      'otherFairways',
      'otherHybrids',
      'otherIrons',
      'otherWedges',
      'otherPutters'
    ];

    for (const user of allUsers) {
      const userData = user as any;
      let hasOldFields = false;

      // Check if user has any old fields
      for (const field of oldFields) {
        if (userData[field] !== undefined) {
          hasOldFields = true;
          break;
        }
      }

      if (hasOldFields) {
        // Create a clean update object with only valid fields
        const cleanData: any = {
          name: user.name,
          email: user.email,
          role: user.role,
        };

        // Copy over valid optional fields
        if (user.username !== undefined) cleanData.username = user.username;
        if (user.password !== undefined) cleanData.password = user.password;
        if (user.handicap !== undefined) cleanData.handicap = user.handicap;
        if (user.phone !== undefined) cleanData.phone = user.phone;
        if (user.nickname !== undefined) cleanData.nickname = user.nickname;
        if (user.gender !== undefined) cleanData.gender = user.gender;
        if (user.workLocation !== undefined) cleanData.workLocation = user.workLocation;
        if (user.shirtSize !== undefined) cleanData.shirtSize = user.shirtSize;
        if (user.gloveSize !== undefined) cleanData.gloveSize = user.gloveSize;
        if (user.profilePhotoUrl !== undefined) cleanData.profilePhotoUrl = user.profilePhotoUrl;
        if (user.profilePhotoStorageId !== undefined) cleanData.profilePhotoStorageId = user.profilePhotoStorageId;
        
        // Copy over new club set fields
        if (user.drivers !== undefined) cleanData.drivers = user.drivers;
        if (user.fairways !== undefined) cleanData.fairways = user.fairways;
        if (user.hybrids !== undefined) cleanData.hybrids = user.hybrids;
        if (user.irons !== undefined) cleanData.irons = user.irons;
        if (user.wedges !== undefined) cleanData.wedges = user.wedges;
        if (user.putters !== undefined) cleanData.putters = user.putters;

        // Replace the entire document with clean data
        await ctx.db.replace(user._id, cleanData);
        updatedCount++;
      }
    }

    return {
      success: true,
      message: `Cleaned up ${updatedCount} user records`,
      totalUsers: allUsers.length,
    };
  },
});
