#!/bin/bash

# Email Setup Script for Golf Score App
# This script helps you setup email sending quickly

echo "========================================="
echo "Golf Score - Email Setup Wizard"
echo "========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js is installed"
echo ""

# Menu
echo "Choose email service:"
echo "1. Brevo (Sendinblue) - FREE 300 emails/day (RECOMMENDED)"
echo "2. Resend - FREE 100 emails/day"
echo "3. Deploy Serverless Function to Vercel"
echo "4. Test Email Locally"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Setting up Brevo..."
        echo ""
        echo "Steps:"
        echo "1. Go to https://www.brevo.com/"
        echo "2. Sign up for free account"
        echo "3. Go to Settings → SMTP & API → API Keys"
        echo "4. Create new API key"
        echo ""
        read -p "Enter your Brevo API key: " brevo_key
        
        echo ""
        echo "Add this to Convex Dashboard:"
        echo "https://dashboard.convex.dev"
        echo ""
        echo "Environment Variable:"
        echo "BREVO_API_KEY=$brevo_key"
        echo ""
        echo "✓ Setup complete! Test by sending an email from the app."
        ;;
        
    2)
        echo ""
        echo "Setting up Resend..."
        echo ""
        echo "Steps:"
        echo "1. Go to https://resend.com/"
        echo "2. Sign up with GitHub"
        echo "3. Go to API Keys"
        echo "4. Create API Key"
        echo ""
        read -p "Enter your Resend API key: " resend_key
        
        echo ""
        echo "Add this to Convex Dashboard:"
        echo "https://dashboard.convex.dev"
        echo ""
        echo "Environment Variable:"
        echo "RESEND_API_KEY=$resend_key"
        echo ""
        echo "✓ Setup complete! Test by sending an email from the app."
        ;;
        
    3)
        echo ""
        echo "Deploying to Vercel..."
        echo ""
        
        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Install dependencies
        echo "Installing dependencies..."
        cd api
        npm install
        cd ..
        
        # Deploy
        echo "Deploying..."
        vercel --prod
        
        echo ""
        echo "✓ Deployment complete!"
        echo ""
        echo "Add these to Convex Dashboard:"
        echo "https://dashboard.convex.dev"
        echo ""
        echo "Environment Variables:"
        echo "CUSTOM_SMTP_ENDPOINT=https://your-vercel-url.vercel.app/api/send-email"
        echo "CUSTOM_SMTP_SECRET=golf-score-email-secret-2024"
        ;;
        
    4)
        echo ""
        echo "Testing email locally..."
        echo ""
        
        # Install dependencies
        cd scripts
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        
        # Run test
        echo "Sending test email..."
        npm test
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Go to Convex Dashboard and add environment variables"
echo "2. Test email sending from the app"
echo "3. Check email logs in Convex database"
echo ""
echo "For more help, see: DEPLOYMENT_EMAIL_GUIDE.md"
