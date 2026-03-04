// Test Resend API Key
// Run with: node scripts/test-resend.js

const RESEND_API_KEY = 're_3t6s1obF_5e4FjQQKmj3D8EgaqB3rE5sb';

async function testResend() {
  console.log('Testing Resend API...\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Golf Score Team <onboarding@resend.dev>',
        to: ['alvinmasykur.am@gmail.com'],
        subject: 'Test Email from Golf Score App',
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🏌️ Golf Score</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Payment Notification System</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #8B0000; margin: 0 0 20px 0; font-size: 24px;">Test Email Successful! ✅</h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                This is a test email from Golf Score application using Resend API.
              </p>
              <div style="background-color: #f8f9fa; border-left: 4px solid #8B0000; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 18px;">Email System Status</h3>
                <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>✅ Resend API: Connected</li>
                  <li>✅ Email Template: Working</li>
                  <li>✅ Delivery: Successful</li>
                </ul>
              </div>
              <div style="background-color: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="color: #2e7d32; font-size: 14px; margin: 0;">
                  <strong>✓ Your email system is ready to use!</strong><br>
                  You can now send payment notifications to players.
                </p>
              </div>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                <strong>Test Details:</strong><br>
                Timestamp: ${new Date().toISOString()}<br>
                Service: Resend API<br>
                Status: Active
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2e2e2e; padding: 25px 30px; text-align: center;">
              <p style="color: #cccccc; font-size: 13px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Golf Score. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                This is a test email from your Golf Score application.
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
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS! Email sent via Resend');
      console.log('Message ID:', result.id);
      console.log('\nCheck your inbox at: alvinmasykur.am@gmail.com');
      console.log('\nNext steps:');
      console.log('1. Add RESEND_API_KEY to Convex Dashboard');
      console.log('2. Test from the application');
      console.log('3. Monitor email logs');
    } else {
      const error = await response.text();
      console.error('❌ ERROR:', error);
      
      try {
        const errorJson = JSON.parse(error);
        console.error('\nError details:', errorJson);
      } catch (e) {
        // Error is not JSON
      }
    }

  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
  }
}

testResend();
