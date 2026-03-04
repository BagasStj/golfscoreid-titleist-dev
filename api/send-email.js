// Serverless Function for Email Sending using Nodemailer
// Deploy this to Vercel, Netlify, or any serverless platform

const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const GMAIL_USER = 'titleistteam@gmail.com';
const GMAIL_APP_PASSWORD = 'agtdtxhcagkmvjoc';

// API Secret for authentication
const API_SECRET = process.env.EMAIL_API_SECRET || 'golf-score-email-secret-2024';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API secret
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { to, subject, html, from, auth } = req.body;

    // Validate input
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Use provided auth or default Gmail credentials
    const emailAuth = auth || {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    };

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: emailAuth,
    });

    // Send email
    const info = await transporter.sendMail({
      from: from || `"Golf Score Team" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email',
    });
  }
};
