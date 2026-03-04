# Login Troubleshooting Guide

## Masalah yang Anda Alami

### 1. Admin Login → "Access Denied"
### 2. Player Login → "No Tournament"

## Root Cause Analysis

### Kemungkinan Penyebab:

#### A. Test Users Belum Di-Seed ⚠️
**Symptom**: Login gagal dengan "Invalid credentials"
**Solution**: Jalankan seed function

#### B. User Role Tidak Sesuai ⚠️
**Symptom**: Login berhasil tapi muncul "Access Denied"
**Cause**: User yang login bukan admin tapi mencoba akses admin area
**Solution**: Pastikan login dengan credentials yang benar

#### C. Convex Backend Tidak Berjalan ⚠️
**Symptom**: Network error atau timeout
**Solution**: Start Convex dev server

#### D. Player Dashboard Kosong (Normal) ✅
**Symptom**: "No Tournament" di player dashboard
**Cause**: Belum ada tournament yang dibuat
**Solution**: Login sebagai admin dan buat tournament dulu

## Step-by-Step Fix

### Step 1: Pastikan Convex Backend Berjalan

```bash
# Terminal 1
cd golfscore-app
npx convex dev
```

**Expected Output**:
```
✓ Convex functions ready!
✓ Watching for file changes...
```

### Step 2: Seed Test Users

**Option A: Via Convex Dashboard (Recommended)**

1. Buka browser ke URL yang muncul di terminal (biasanya `http://localhost:3000`)
2. Klik tab "Functions"
3. Cari function `seedHelper:seedAll`
4. Klik "Run" (tanpa arguments)
5. Lihat response:
   ```json
   {
     "message": "✅ Test users created successfully!",
     "users": {
       "admin": { "username": "admin", "password": "admin123" },
       "players": [...]
     }
   }
   ```

**Option B: Via Convex CLI**

```bash
npx convex run seedHelper:seedAll
```

### Step 3: Verify Users Created

Run function `seedHelper:checkTestUsers`:

**Expected Response**:
```json
{
  "adminExists": true,
  "player1Exists": true,
  "message": "✅ Test users are ready!",
  "credentials": {
    "admin": { "username": "admin", "password": "admin123" },
    "player": { "username": "player1", "password": "player123" }
  }
}
```

### Step 4: Start Frontend

```bash
# Terminal 2
cd golfscore-app
npm run dev
```

### Step 5: Test Login dengan Console Debug

#### Test Admin Login:

1. Buka `http://localhost:5174/login`
2. Klik "Admin Portal"
3. **Buka Browser Console** (F12)
4. Login dengan:
   - Username: `admin`
   - Password: `admin123`
5. **Check Console Output**:
   ```
   🔐 Admin Login Success
     User: {_id: "...", email: "admin@golfscore.id", ...}
     Role: "admin"
     Name: "Admin User"
   ✅ Navigating to /admin
   
   🛡️ ProtectedRoute Check
     Path: /admin
     User: Admin User
     Role: admin
     Requires Admin: true
     Access: ✅ Granted
   ```

#### Test Player Login:

1. Buka `http://localhost:5174/login`
2. Klik "Player Login"
3. **Buka Browser Console** (F12)
4. Login dengan:
   - Username: `player1`
   - Password: `player123`
5. **Check Console Output**:
   ```
   🔐 Player Login Success
     User: {_id: "...", email: "player1@golfscore.id", ...}
     Role: "player"
     Name: "John Doe"
   ✅ Navigating to /player
   
   🛡️ ProtectedRoute Check
     Path: /player
     User: John Doe
     Role: player
     Requires Admin: false
     Access: ✅ Granted
   ```

## Expected Behavior After Fix

### ✅ Admin Login Success:
- Console shows: `🔐 Admin Login Success`
- Role: `admin`
- Redirect to `/admin`
- See Admin Dashboard with:
  - Tournament stats
  - Create Tournament button
  - Register Players button
  - Monitoring button

### ✅ Player Login Success:
- Console shows: `🔐 Player Login Success`
- Role: `player`
- Redirect to `/player`
- See Player Dashboard with:
  - **If no tournaments**: "No tournaments available" (THIS IS NORMAL!)
  - **If tournaments exist**: List of tournaments

## Creating First Tournament (Admin)

Setelah admin login berhasil:

1. Klik "Create Tournament"
2. Isi form:
   - Name: "Test Tournament"
   - Date: (pilih tanggal)
   - Course: "Test Golf Course"
   - Format: Pilih salah satu
3. Submit
4. Tournament akan muncul di dashboard

## Registering Players to Tournament (Admin)

1. Di Admin Dashboard
2. Klik "Register Players"
3. Pilih tournament
4. Pilih players (player1, player2, player3)
5. Submit

## Testing Player Flow

Setelah tournament dibuat dan player di-register:

1. Logout dari admin
2. Login sebagai player1
3. **Expected**: Melihat tournament list
4. Klik tournament
5. Bisa submit scores

## Common Error Messages & Solutions

### ❌ "Access Denied"
**Cause**: User role tidak sesuai dengan halaman yang diakses
**Solution**: 
- Admin trying to access player area → Use admin login
- Player trying to access admin area → Use player login
- Check console for role mismatch

### ❌ "Invalid Credentials"
**Cause**: Username/password salah atau user belum di-seed
**Solution**:
- Run `seedHelper:seedAll`
- Check username/password (case-sensitive)
- Verify in Convex dashboard: Data → users table

### ❌ "No tournaments available"
**Cause**: Belum ada tournament (NORMAL untuk player baru)
**Solution**:
- Login sebagai admin
- Create tournament
- Register players to tournament

### ❌ Network Error
**Cause**: Convex backend tidak berjalan
**Solution**:
- Check terminal running `npx convex dev`
- Restart Convex: Ctrl+C, then `npx convex dev`
- Check `.env.local` has correct `VITE_CONVEX_URL`

## Debug Checklist

- [ ] Convex dev server running (`npx convex dev`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Test users seeded (`seedHelper:seedAll`)
- [ ] Browser console open (F12)
- [ ] Using correct credentials:
  - Admin: `admin` / `admin123`
  - Player: `player1` / `player123`
- [ ] Check console logs for role and navigation
- [ ] For player: Tournament created by admin first

## Reset Everything

Jika masih bermasalah, reset semua:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Reset test users
npx convex run seedHelper:resetTestUsers

# 3. Restart Convex
npx convex dev

# 4. Restart Frontend (in another terminal)
npm run dev

# 5. Clear browser cache and localStorage
# Browser Console:
localStorage.clear()
location.reload()
```

## Contact Points

Jika masih ada masalah setelah mengikuti guide ini:

1. **Check Console Logs**: Lihat output di browser console
2. **Check Convex Logs**: Lihat terminal yang menjalankan `npx convex dev`
3. **Verify Data**: Buka Convex Dashboard → Data → users table
4. **Screenshot**: Ambil screenshot error dan console logs

## Quick Reference

### Test Credentials
```
Admin:
  URL: http://localhost:5174/admin/login
  Username: admin
  Password: admin123

Player:
  URL: http://localhost:5174/player/login
  Username: player1
  Password: player123
```

### Seed Commands
```bash
# Seed all test data
npx convex run seedHelper:seedAll

# Check if users exist
npx convex run seedHelper:checkTestUsers

# Reset users
npx convex run seedHelper:resetTestUsers
```

### Dev Commands
```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Frontend
npm run dev
```
