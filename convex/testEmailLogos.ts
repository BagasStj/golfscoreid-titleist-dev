// // Test file to verify email logo URLs
// // Run this to check if logo URLs are correctly formed

// import { query } from "./_generated/server";

// export const testLogoUrls = query({
//   args: {},
//   handler: async (_ctx) => {
//     // Note: Replace with your actual Convex site URL
//     const convexSiteUrl = "https://your-convex-site.convex.cloud";
    
//     const titleistLogoUrl = `${convexSiteUrl}/api/storage/kg214kbdbje0j3brgfsvjnqfwn821eyt`;
//     const teamTitleistLogoUrl = `${convexSiteUrl}/api/storage/kg2ev220hzge3wfx64192mmybh81t410`;
    
//     return {
//       convexSiteUrl,
//       logos: {
//         titleist: {
//           id: "kg214kbdbje0j3brgfsvjnqfwn821eyt",
//           url: titleistLogoUrl,
//         },
//         teamTitleist: {
//           id: "kg2ev220hzge3wfx64192mmybh81t410",
//           url: teamTitleistLogoUrl,
//         },
//       },
//       testInstructions: [
//         "1. Copy the URLs above",
//         "2. Open them in a browser to verify they load correctly",
//         "3. If they don't load, check your Convex file storage",
//         "4. Make sure the files are uploaded and have public access",
//       ],
//     };
//   },
// });
