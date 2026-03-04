@echo off
REM Email Setup Script for Golf Score App (Windows)
REM This script helps you setup email sending quickly

echo =========================================
echo Golf Score - Email Setup Wizard
echo =========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo √ Node.js is installed
echo.

REM Menu
echo Choose email service:
echo 1. Brevo (Sendinblue) - FREE 300 emails/day (RECOMMENDED)
echo 2. Resend - FREE 100 emails/day
echo 3. Deploy Serverless Function to Vercel
echo 4. Test Email Locally
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto brevo
if "%choice%"=="2" goto resend
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto test
goto invalid

:brevo
echo.
echo Setting up Brevo...
echo.
echo Steps:
echo 1. Go to https://www.brevo.com/
echo 2. Sign up for free account
echo 3. Go to Settings - SMTP ^& API - API Keys
echo 4. Create new API key
echo.
set /p brevo_key="Enter your Brevo API key: "

echo.
echo Add this to Convex Dashboard:
echo https://dashboard.convex.dev
echo.
echo Environment Variable:
echo BREVO_API_KEY=%brevo_key%
echo.
echo √ Setup complete! Test by sending an email from the app.
goto end

:resend
echo.
echo Setting up Resend...
echo.
echo Steps:
echo 1. Go to https://resend.com/
echo 2. Sign up with GitHub
echo 3. Go to API Keys
echo 4. Create API Key
echo.
set /p resend_key="Enter your Resend API key: "

echo.
echo Add this to Convex Dashboard:
echo https://dashboard.convex.dev
echo.
echo Environment Variable:
echo RESEND_API_KEY=%resend_key%
echo.
echo √ Setup complete! Test by sending an email from the app.
goto end

:vercel
echo.
echo Deploying to Vercel...
echo.

REM Check if vercel is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
)

REM Install dependencies
echo Installing dependencies...
cd api
call npm install
cd ..

REM Deploy
echo Deploying...
call vercel --prod

echo.
echo √ Deployment complete!
echo.
echo Add these to Convex Dashboard:
echo https://dashboard.convex.dev
echo.
echo Environment Variables:
echo CUSTOM_SMTP_ENDPOINT=https://your-vercel-url.vercel.app/api/send-email
echo CUSTOM_SMTP_SECRET=golf-score-email-secret-2024
goto end

:test
echo.
echo Testing email locally...
echo.

REM Install dependencies
cd scripts
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Run test
echo Sending test email...
call npm test
cd ..
goto end

:invalid
echo Invalid choice. Exiting.
pause
exit /b 1

:end
echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Go to Convex Dashboard and add environment variables
echo 2. Test email sending from the app
echo 3. Check email logs in Convex database
echo.
echo For more help, see: DEPLOYMENT_EMAIL_GUIDE.md
echo.
pause
