# Login Setup Guide

## Overview
Halaman login telah didesain ulang dengan tampilan modern dan sistem autentikasi menggunakan username/email & password.

## Features
- ✅ Login dengan username atau email
- ✅ Password authentication
- ✅ Show/hide password toggle
- ✅ Modern UI dengan gradient background
- ✅ Logo aplikasi terintegrasi
- ✅ Responsive design
- ✅ Loading states & error handling
- ✅ Session management dengan localStorage

## Test Users

Untuk testing, gunakan kredensial berikut:

### Admin Account
- **Username**: `admin`
- **Email**: `admin@golfscore.id`
- **Password**: `admin123`
- **Role**: Admin

### Player Accounts

**Player 1:**
- **Username**: `player1`
- **Email**: `player1@golfscore.id`
- **Password**: `player123`
- **Handicap**: 12

**Player 2:**
- **Username**: `player2`
- **Email**: `player2@golfscore.id`
- **Password**: `player123`
- **Handicap**: 18

**Player 3:**
- **Username**: `player3`
- **Email**: `player3@golfscore.id`
- **Password**: `player123`
- **Handicap**: 8

## Setup Instructions

### 1. Seed Test Users

Jalankan fungsi seed untuk membuat test users:

```bash
# Di Convex dashboard atau menggunakan CLI
npx convex run seedUsersWithPassword:seedTestUsers
```

### 2. Start Development Server

```bash
cd golfscore-app
npm run dev
```

### 3. Test Login

1. Buka browser ke `http://localhost:5173`
2. Masukkan username atau email (contoh: `admin` atau `admin@golfscore.id`)
3. Masukkan password (contoh: `admin123`)
4. Klik tombol "Login"
5. Anda akan diarahkan ke dashboard sesuai role (admin/player)

## Technical Details

### Authentication Flow

1. User memasukkan username/email dan password
2. Frontend mengirim request ke `api.users.login` mutation
3. Backend memvalidasi kredensial:
   - Mencari user berdasarkan email atau username
   - Membandingkan password (dalam production harus di-hash)
4. Jika valid, return user data (tanpa password)
5. Frontend menyimpan user data di localStorage
6. AuthContext mengelola state autentikasi
7. User diarahkan ke dashboard sesuai role

### Files Modified

- `golfscore-app/src/components/auth/LoginPage.tsx` - UI login page
- `golfscore-app/src/contexts/AuthContext.tsx` - Auth state management
- `golfscore-app/convex/users.ts` - Login & register mutations
- `golfscore-app/convex/schema.ts` - Added username & password fields
- `golfscore-app/src/index.css` - Added background pattern styles

### Security Notes

⚠️ **IMPORTANT**: Implementasi saat ini untuk development/testing saja!

Untuk production, pastikan:
1. Hash password menggunakan bcrypt atau argon2
2. Implementasi rate limiting untuk prevent brute force
3. Gunakan HTTPS
4. Implementasi JWT atau session tokens yang aman
5. Add password strength requirements
6. Implementasi forgot password flow
7. Add 2FA (Two-Factor Authentication)

## Customization

### Change Logo
Replace file di `golfscore-app/public/logo-app.png` dengan logo Anda.

### Change Colors
Edit gradient colors di `LoginPage.tsx`:
```tsx
// Current: emerald/green gradient
className="bg-gradient-to-r from-emerald-600 to-green-600"

// Example: blue gradient
className="bg-gradient-to-r from-blue-600 to-indigo-600"
```

### Add Registration Page
Uncomment dan implementasi fungsi `register` di `convex/users.ts` untuk membuat halaman registrasi.

## Troubleshooting

### Error: "Invalid credentials"
- Pastikan username/email dan password benar
- Cek apakah test users sudah di-seed
- Periksa console untuk error details

### Logo tidak muncul
- Pastikan file `logo-app.png` ada di folder `public/`
- Cek path di LoginPage.tsx: `/logo-app.png`
- Clear browser cache

### Redirect tidak bekerja
- Pastikan routes sudah dikonfigurasi di `src/routes/index.tsx`
- Cek AuthContext apakah user data tersimpan
- Periksa localStorage di browser DevTools

## Next Steps

1. ✅ Implementasi password hashing
2. ✅ Add registration page
3. ✅ Implementasi forgot password
4. ✅ Add email verification
5. ✅ Implementasi 2FA
6. ✅ Add session timeout
7. ✅ Implementasi refresh tokens
