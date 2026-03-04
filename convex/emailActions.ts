import { action } from "./_generated/server";
import { v } from "convex/values";

// Declare global process for environment variables
declare const process: { env: Record<string, string | undefined> };

// Gmail SMTP credentials
const GMAIL_USER = "titleistteam@gmail.com";
const GMAIL_APP_PASSWORD = "agtdtxhcagkmvjoc";

// This action sends emails using Gmail SMTP via a third-party API
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log("=== EMAIL SEND REQUEST ===");
    console.log("To:", args.to);
    console.log("Subject:", args.subject);
    console.log("HTML Length:", args.html.length);
    
    try {
      // Using Gmail SMTP via a relay service (smtp2go, mailgun, etc.)
      // For this implementation, we'll use a simple SMTP relay API
      
      // Option 1: Using SMTP2GO API (Free tier: 1000 emails/month)
      const smtp2goApiKey = process.env.SMTP2GO_API_KEY;
      
      if (smtp2goApiKey) {
        const response = await fetch('https://api.smtp2go.com/v3/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: smtp2goApiKey,
            to: [args.to],
            sender: GMAIL_USER,
            subject: args.subject,
            html_body: args.html,
          }),
        });

        const result = await response.json();
        
        if (result.data && result.data.succeeded > 0) {
          console.log("Email sent successfully via SMTP2GO");
          return { success: true, messageId: result.data.email_id };
        } else {
          throw new Error(result.data?.error || 'Failed to send email');
        }
      }
      
      // Option 2: Using Brevo (formerly Sendinblue) API (Free tier: 300 emails/day)
      const brevoApiKey = process.env.BREVO_API_KEY;
      
      if (brevoApiKey) {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: "Team Titleist",
              email: GMAIL_USER,
            },
            to: [{ email: args.to }],
            subject: args.subject,
            htmlContent: args.html,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Email sent successfully via Brevo");
          return { success: true, messageId: result.messageId };
        } else {
          const error = await response.text();
          throw new Error(`Brevo API error: ${error}`);
        }
      }
      
      // Option 3: Using Resend API (Free tier: 100 emails/day, 3000/month)
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Team Titleist <onboarding@resend.dev>',
            to: [args.to],
            subject: args.subject,
            html: args.html,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Email sent successfully via Resend");
          return { success: true, messageId: result.id };
        } else {
          const error = await response.text();
          throw new Error(`Resend API error: ${error}`);
        }
      }
      
      // Option 4: Direct Gmail SMTP using a relay service
      // Using EmailJS or similar service that accepts direct SMTP credentials
      const emailJsServiceId = process.env.EMAILJS_SERVICE_ID;
      const emailJsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
      const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
      
      if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: emailJsServiceId,
            template_id: emailJsTemplateId,
            user_id: emailJsPublicKey,
            template_params: {
              to_email: args.to,
              subject: args.subject,
              html_content: args.html,
            },
          }),
        });

        if (response.ok) {
          console.log("Email sent successfully via EmailJS");
          return { success: true, messageId: `emailjs-${Date.now()}` };
        }
      }
      
      // Fallback: Using a simple SMTP relay endpoint
      // You can deploy this as a Vercel/Netlify function
      const customSmtpEndpoint = process.env.CUSTOM_SMTP_ENDPOINT;
      
      if (customSmtpEndpoint) {
        const response = await fetch(customSmtpEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CUSTOM_SMTP_SECRET || 'default-secret'}`,
          },
          body: JSON.stringify({
            from: GMAIL_USER,
            to: args.to,
            subject: args.subject,
            html: args.html,
            auth: {
              user: GMAIL_USER,
              pass: GMAIL_APP_PASSWORD,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Email sent successfully via custom SMTP endpoint");
          return { success: true, messageId: result.messageId };
        } else {
          const error = await response.text();
          throw new Error(`Custom SMTP error: ${error}`);
        }
      }
      
      // If no API key is configured, throw error
      throw new Error(
        'No email service configured. Please set one of: SMTP2GO_API_KEY, BREVO_API_KEY, RESEND_API_KEY, EMAILJS_SERVICE_ID, or CUSTOM_SMTP_ENDPOINT in your environment variables.'
      );
      
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});