# Email Notification Setup Guide

## Overview
This guide explains how to set up email notifications for the Golf Score application using Gmail SMTP.

## Gmail Configuration

### 1. Enable App Password for Gmail

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to "App passwords" section
5. Generate a new app password for "Mail"
6. Save the generated password (you'll need it for configuration)

### Email Credentials
- **Email**: titleistteam@gmail.com
- **App Password**: agtdtxhcagkmvjoc

## Production Implementation

### Option 1: Using External Email Service (Recommended)

For production, it's recommended to use a dedicated email service like:
- **SendGrid** (Free tier: 100 emails/day)
- **AWS SES** (Very cheap, reliable)
- **Mailgun** (Good for transactional emails)
- **Postmark** (Excellent deliverability)

### Option 2: Using Nodemailer with Gmail (Current Setup)

To implement actual email sending, you need to:

1. **Install nodemailer** (if using Node.js backend):
   ```bash
   npm install nodemailer
   ```

2. **Update `convex/emailActions.ts`** with actual implementation:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'titleistteam@gmail.com',
        pass: 'agtdtxhcagkmvjoc', // App password
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: '"Golf Score Team" <titleistteam@gmail.com>',
      to: args.to,
      subject: args.subject,
      html: args.html,
    });

    return { 
      success: true, 
      messageId: info.messageId 
    };
  },
});
```

### Option 3: Using Serverless Function

Create a separate serverless function (Vercel, Netlify, AWS Lambda) to handle email sending:

1. **Create API endpoint** (e.g., `/api/send-email`)
2. **Update `convex/emailActions.ts`** to call this endpoint:

```typescript
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch('https://your-domain.com/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_SECRET}`,
      },
      body: JSON.stringify({
        from: 'titleistteam@gmail.com',
        to: args.to,
        subject: args.subject,
        html: args.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, messageId: result.messageId };
  },
});
```

## Email Template

The email template includes:
- Professional header with logo
- Personalized greeting
- Custom message content
- Tournament details (if applicable)
- Professional footer

### Logo Setup

1. Upload `full-color-mark.png` to your public hosting
2. Update the logo URL in `convex/emailNotifications.ts`:
   ```typescript
   const logoUrl = "https://your-domain.com/full-color-mark.png";
   ```

## Testing

### Development Testing
The current implementation logs email details to console without actually sending.

### Production Testing
1. Test with a small group first
2. Check spam folders
3. Verify email formatting across different clients (Gmail, Outlook, etc.)
4. Monitor delivery rates

## Email Limits

### Gmail SMTP Limits
- **Free Gmail**: 500 emails/day
- **Google Workspace**: 2,000 emails/day

### Recommendations
- For more than 500 emails/day, use a dedicated email service
- Implement rate limiting
- Add retry logic for failed sends
- Monitor bounce rates

## Security Best Practices

1. **Never commit credentials** to version control
2. Use environment variables for sensitive data
3. Implement rate limiting to prevent abuse
4. Add email validation
5. Log all email activities
6. Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**
   - Verify app password is correct
   - Ensure 2-Step Verification is enabled

2. **"Daily sending quota exceeded"**
   - Wait 24 hours or upgrade to Google Workspace
   - Consider using a dedicated email service

3. **Emails going to spam**
   - Set up SPF, DKIM, and DMARC records
   - Use a dedicated email service with good reputation
   - Avoid spam trigger words

4. **Slow sending**
   - Implement batch sending
   - Use background jobs
   - Consider async processing

## Monitoring

Track these metrics:
- Emails sent successfully
- Failed sends
- Bounce rate
- Open rate (if tracking enabled)
- Spam complaints

## Support

For issues or questions:
- Check Convex logs
- Review email_logs table in database
- Contact support team
