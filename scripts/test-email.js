// Test script for email sending
// Run with: node scripts/test-email.js

const nodemailer = require('nodemailer');

const GMAIL_USER = 'titleistteam@gmail.com';
const GMAIL_APP_PASSWORD = 'agtdtxhcagkmvjoc';

async function testEmail() {
  console.log('Testing email sending...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified\n');

    // Test email
    const testEmail = {
      from: `"Golf Score Team" <${GMAIL_USER}>`,
      to: 'alvinmasykur.am@gmail.com', // Change to your test email
      subject: 'Test Email - Golf Score Payment Notification',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Test Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                This is a test email from Golf Score application.
              </p>
              <div style="background-color: #f8f9fa; border-left: 4px solid #8B0000; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h2 style="color: #8B0000; margin: 0 0 15px 0; font-size: 20px;">Email System Working!</h2>
                <p style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0;">
                  If you receive this email, it means the email system is configured correctly and working as expected.
                </p>
              </div>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Timestamp: ${new Date().toISOString()}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2e2e2e; padding: 25px 30px; text-align: center;">
              <p style="color: #cccccc; font-size: 13px; margin: 0;">
                © ${new Date().getFullYear()} Golf Score. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    console.log('Sending test email...');
    console.log('To:', testEmail.to);
    console.log('Subject:', testEmail.subject);
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('\n✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('\n✗ Error sending email:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. Gmail credentials are correct');
      console.error('2. App password is valid');
      console.error('3. 2-Step Verification is enabled');
    }
  }
}

testEmail();
