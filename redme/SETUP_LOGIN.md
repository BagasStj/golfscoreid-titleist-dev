# 🎯 Setup Login - Quick Start Guide

## 📋 Prerequisites

Pastikan Convex sudah running:
```bash
cd golfscore-app
npx convex dev
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Seed Test Users

Buka Convex Dashboard atau jalankan di terminal baru:

```bash
npx convex run seedUsersWithPassword:seedTestUsers
```

Output yang diharapkan:
```json
{
  "message": "Test users created successfully",
  "users": [
    { "username": "admin", "password": "admin123", "role": "admin" },
    { "username": "player1", "password": "player123", "role": "player" },
    { "username": "player2", "password": "player123", "role": "player" },
    { "username": "player3", "password": "player123", "role": "player" }
  ]
}
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test Login

Buka browser ke `http://localhost:5173` dan login dengan:

**Admin:**
- Username: `admin`
- Password: `admin123`

**Player:**
- Username: `player1`
- Password: `player123`

## ✨ Features

- 🎨 Modern UI dengan gradient background
- 🖼️ Logo aplikasi terintegrasi
- 👁️ Show/hide password toggle
- 🔐 Username atau Email login
- 📱 Responsive design
- ⚡ Fast & smooth animations
- 🎯 Role-based redirect (admin/player)

## 🎨 Preview

Login page includes:
- Gradient background (emerald to green)
- Logo in white rounded container
- Username/Email input with user icon
- Password input with lock icon & toggle visibility
- Smooth hover effects & animations
- Error handling with styled alerts
- Loading state with spinner

## 📝 Test Accounts

| Role | Username | Email | Password | Handicap |
|------|----------|-------|----------|----------|
| Admin | admin | admin@golfscore.id | admin123 | - |
| Player | player1 | player1@golfscore.id | player123 | 12 |
| Player | player2 | player2@golfscore.id | player123 | 18 |
| Player | player3 | player3@golfscore.id | player123 | 8 |

## 🔧 Customization

### Change Logo
Replace `golfscore-app/public/logo-app.png` with your logo.

### Change Theme Colors
Edit `LoginPage.tsx`:
```tsx
// Current gradient
from-emerald-600 to-green-600

// Change to blue
from-blue-600 to-indigo-600

// Change to purple
from-purple-600 to-pink-600
```

## 🐛 Troubleshooting

### "Invalid credentials" error
✅ Run seed command first: `npx convex run seedUsersWithPassword:seedTestUsers`

### Logo not showing
✅ Check file exists: `golfscore-app/public/logo-app.png`

### Convex not connected
✅ Make sure `npx convex dev` is running

### Page not redirecting after login
✅ Check browser console for errors
✅ Verify routes are configured in `src/routes/index.tsx`

## 📚 Documentation

For detailed technical documentation, see [LOGIN_SETUP.md](./LOGIN_SETUP.md)

## ⚠️ Security Note

Current implementation is for **development/testing only**!

For production:
- ✅ Hash passwords (bcrypt/argon2)
- ✅ Use HTTPS
- ✅ Implement rate limiting
- ✅ Add JWT/session tokens
- ✅ Add 2FA
- ✅ Implement password reset

## 🎉 Done!

Your modern login page is ready! Login and start using the GolfScore ID Tournament System.
