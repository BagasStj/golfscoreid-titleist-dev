import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Email sending function using Gmail SMTP
export const sendPaymentNotification = mutation({
  args: {
    newsId: v.id("news"),
    playerIds: v.array(v.id("users")),
    subject: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify user is admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get news details
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    // Get tournament details if exists
    let tournament = null;
    if (news.tournamentId) {
      tournament = await ctx.db.get(news.tournamentId);
    }

    // Get selected players
    const players = await Promise.all(
      args.playerIds.map(async (playerId) => {
        const player = await ctx.db.get(playerId);
        return player;
      })
    );

    const validPlayers = players.filter((p) => p !== null);

    if (validPlayers.length === 0) {
      throw new Error("No valid players selected");
    }

    // Team Titleist logo from external URL
    const teamTitleistLogoUrl = "https://www.titleist.com/teamtitleist/cfs-file.ashx/__key/communityserver-discussions-components-files/9/4705.TT2.jpg";

    // Send emails to each player
    const emailResults = await Promise.all(
      validPlayers.map(async (player) => {
        if (!player) return { success: false, email: "unknown" };

        try {
          // Create HTML email content
          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%); padding: 30px; text-align: center;">
              <img src="${teamTitleistLogoUrl}" alt="Team Titleist Logo" style="width: 120px; height: auto; border-radius: 12px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Payment Notification</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Dear <strong>${player.name}</strong>,
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #8B0000; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h2 style="color: #8B0000; margin: 0 0 15px 0; font-size: 20px;">${args.subject}</h2>
                <div style="color: #555555; font-size: 15px; line-height: 1.8;">
                  ${args.content.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              ${tournament ? `
              <div style="background-color: #fff8e1; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">🏆</span> Tournament Details
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; width: 120px;"><strong>Tournament:</strong></td>
                    <td style="color: #333; font-size: 14px;">${tournament.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;"><strong>Date:</strong></td>
                    <td style="color: #333; font-size: 14px;">${new Date(tournament.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;"><strong>Location:</strong></td>
                    <td style="color: #333; font-size: 14px;">${tournament.location}</td>
                  </tr>
                </table>
              </div>
              ` : ''}
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions or concerns, please don't hesitate to contact us.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2e2e2e; padding: 25px 30px; text-align: center;">
              <p style="color: #cccccc; font-size: 13px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Team Titleist. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          // Schedule email sending via action
          await ctx.scheduler.runAfter(0, api.emailActions.sendEmail, {
            to: player.email,
            subject: args.subject,
            html: htmlContent,
          });

          return { success: true, email: player.email };
        } catch (error) {
          console.error(`Failed to send email to ${player.email}:`, error);
          return { success: false, email: player.email };
        }
      })
    );

    // Log the notification
    await ctx.db.insert("email_logs", {
      newsId: args.newsId,
      sentBy: args.userId,
      recipients: validPlayers.map((p) => p!._id),
      subject: args.subject,
      content: args.content,
      sentAt: Date.now(),
      results: emailResults,
    });

    return {
      success: true,
      sent: emailResults.filter((r) => r.success).length,
      failed: emailResults.filter((r) => !r.success).length,
      results: emailResults,
    };
  },
});
