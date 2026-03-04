# Login Testing Guide

## Prerequisites

### 1. Start Convex Backend

```bash
# Di terminal pertama
cd golfscore-app
npx convex dev
```

Tunggu sampai muncul:
```
✓ Convex functions ready!
```

### 2. Seed Test Users

Buka Convex Dashboard di browser (URL akan muncul di terminal), lalu:

**Option A: Via Convex Dashboard**
1. Buka `http://localhost:3000` (atau URL yang muncul)
2. Klik tab "Functions"
3. Cari function `seedUsersWithPassword:seedTestUsers`
4. Klik "Run" tanpa arguments
5. Lihat response: "Test users created successfully"

**Option B: Via Code**
Tambahkan di `golfscore-app/src/main.tsx` (temporary):

```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Di component atau useEffect
const seedUsers = useMutation(api.seedUsersWithPassword.seedTestUsers);
await seedUsers();
```

### 3. Start Frontend

```bash
# Di terminal kedua
cd golfscore-app
npm run dev
```

## Test Credentials

Setelah seed berhasil, gunakan credentials ini:

### Admin Login
```
URL: http://localhost:5174/admin/login
Username: admin
Password: admin123
```

### Player Login
```
URL: http://localhost:5174/player/login

Player 1:
Username: player1
Password: player123

Player 2:
Username: player2
Password: player123

Player 3:
Username: player3
Password: player123
```

## Testing Flow

### 1. Test Admin Login

1. Buka `http://localhost:5174/login`
2. Klik "Admin Portal"
3. Login dengan:
   - Username: `admin`
   - Password: `admin123`
4. **Expected**: Redirect ke `/admin` (Admin Dashboard)
5. **Check Console**: Lihat log untuk debug

### 2. Test Player Login

1. Buka `http://localhost:5174/login`
2. Klik "Player Login"
3. Login dengan:
   - Username: `player1`
   - Password: `player123`
4. **Expected**: Redirect ke `/player` (Player Dashboard)
5. **Check Console**: Lihat log untuk debug

## Debugging

### Console Logs

Saya sudah menambahkan console.log di:

1. **PlayerLoginPage.tsx**:
   ```
   Player login result: {...}
   User role: player
   Calling login with user: {...}
   Navigating to /player
   ```

2. **AdminLoginPage.tsx**:
   ```
   Admin login result: {...}
   User role: admin
   Calling login with user: {...}
   Navigating to /admin
   ```

3. **ProtectedRoute.tsx**:
   ```
   ProtectedRoute - user: {...}
   ProtectedRoute - requireAdmin: true/false
   ProtectedRoute - location: /admin or /player
   ```

### Common Issues

#### Issue 1: "Access Denied" untuk Admin
**Cause**: User role bukan 'admin'
**Solution**: 
- Check console log: `User role: ???`
- Pastikan seed users sudah dijalankan
- Pastikan login dengan username `admin`

#### Issue 2: "No Tournament" untuk Player
**Cause**: Belum ada tournament yang dibuat
**Solution**:
- Login sebagai admin dulu
- Buat tournament baru
- Lalu login sebagai player

#### Issue 3: "Invalid Credentials"
**Cause**: User belum di-seed atau password salah
**Solution**:
- Jalankan seed function lagi
- Pastikan username dan password benar (case-sensitive)

#### Issue 4: Network Error
**Cause**: Convex backend tidak berjalan
**Solution**:
- Pastikan `npx convex dev` berjalan
- Check terminal untuk error
- Pastikan `.env.local` memiliki `VITE_CONVEX_URL`

## Expected Behavior

### After Admin Login:
- ✅ Redirect ke `/admin`
- ✅ Melihat Admin Dashboard
- ✅ Bisa create tournament
- ✅ Bisa register players
- ✅ Bisa monitoring

### After Player Login:
- ✅ Redirect ke `/player`
- ✅ Melihat Player Dashboard
- ✅ Jika ada tournament: Bisa lihat tournament list
- ✅ Jika belum ada tournament: Melihat "No tournaments available"

## Next Steps

1. **Create Tournament** (as admin):
   - Login sebagai admin
   - Klik "Create Tournament"
   - Isi form dan submit

2. **Register Player to Tournament** (as admin):
   - Di Admin Dashboard
   - Klik "Register Players"
   - Pilih tournament dan players

3. **Test Player Flow**:
   - Login sebagai player
   - Pilih tournament
   - Submit scores
   - View leaderboard

## Troubleshooting Commands

```bash
# Check if Convex is running
curl http://localhost:3000

# Check Convex logs
# (lihat di terminal yang menjalankan npx convex dev)

# Restart everything
# Terminal 1: Ctrl+C, then npx convex dev
# Terminal 2: Ctrl+C, then npm run dev
```

## Environment Check

Pastikan file `.env.local` ada dan berisi:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
# atau untuk local dev:
VITE_CONVEX_URL=http://localhost:3000
```
