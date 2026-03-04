// Example Serverless Function for Email Sending
// This can be deployed to Vercel, Netlify, or AWS Lambda

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'titleistteam@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'agtdtxhcagkmvjoc',
  },
};

// API Secret for authentication
const API_SECRET = process.env.EMAIL_API_SECRET || 'your-secret-key-here';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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
    const { to, subject, html } = req.body;

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

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Send email
    const info = await transporter.sendMail({
      from: '"Golf Score Team" <titleistteam@gmail.com>',
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}

// Alternative implementation using SendGrid
/*
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { to, subject, html } = req.body;

    const msg = {
      to,
      from: 'titleistteam@gmail.com',
      subject,
      html,
    };

    const result = await sgMail.send(msg);

    return res.status(200).json({
      success: true,
      messageId: result[0].headers['x-message-id'],
    });

  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}
*/
