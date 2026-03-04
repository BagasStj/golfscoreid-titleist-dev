# 🎯 Panduan Login - GolfScore ID

## 📖 Ringkasan

Halaman login telah didesain ulang dengan tampilan modern dan sistem autentikasi menggunakan username/email & password yang terhubung dengan Convex backend.

## 🚀 Cara Menggunakan

### 1️⃣ Setup Awal (Hanya Sekali)

Pastikan Convex sudah berjalan:
```bash
cd golfscore-app
npx convex dev
```

Buat user test di terminal baru:
```bash
npx convex run seedUsersWithPassword:seedTestUsers
```

### 2️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Buka browser ke: `http://localhost:5173`

### 3️⃣ Login

Gunakan salah satu akun berikut:

**👨‍💼 Admin:**
- Username: `admin`
- Password: `admin123`

**⛳ Player:**
- Username: `player1`
- Password: `player123`

> 💡 Tip: Anda bisa login menggunakan username ATAU email!

## ✨ Fitur-Fitur

### 🎨 Tampilan
- ✅ Background gradient modern (hijau emerald)
- ✅ Logo aplikasi di header
- ✅ Desain card dengan efek blur
- ✅ Animasi smooth dan transisi halus
- ✅ Responsive untuk mobile dan desktop
- ✅ Icon untuk setiap input field

### 🔐 Keamanan
- ✅ Login dengan username atau email
- ✅ Password tersembunyi (bisa ditampilkan dengan tombol mata)
- ✅ Session management otomatis
- ✅ Redirect otomatis sesuai role (admin/player)
- ✅ Logout berfungsi di semua halaman

### 💫 User Experience
- ✅ Loading spinner saat proses login
- ✅ Pesan error yang jelas dan informatif
- ✅ Validasi form otomatis
- ✅ Session tersimpan (tidak perlu login ulang)

## 📱 Tampilan Login

```
┌─────────────────────────────────────┐
│   ┌───────────────────────────┐     │
│   │     [Logo GolfScore]      │     │
│   │    GolfScore ID           │     │
│   │ Tournament Scoring System │     │
│   └───────────────────────────┘     │
│                                     │
│   Username atau Email               │
│   ┌─────────────────────────────┐   │
│   │ 👤 [Input field]            │   │
│   └─────────────────────────────┘   │
│                                     │
│   Password                          │
│   ┌─────────────────────────────┐   │
│   │ 🔒 [Input field]        👁️  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │        [LOGIN]              │   │
│   └─────────────────────────────┘   │
│                                     │
│   Belum punya akun? Hubungi Admin   │
└─────────────────────────────────────┘
```

## 👥 Daftar Akun Test

| Role | Username | Email | Password | Handicap |
|------|----------|-------|----------|----------|
| Admin | admin | admin@golfscore.id | admin123 | - |
| Player | player1 | player1@golfscore.id | player123 | 12 |
| Player | player2 | player2@golfscore.id | player123 | 18 |
| Player | player3 | player3@golfscore.id | player123 | 8 |

## 🎨 Kustomisasi

### Ganti Logo
1. Siapkan logo Anda (format PNG, ukuran 64x64px atau lebih)
2. Replace file: `golfscore-app/public/logo-app.png`
3. Refresh browser

### Ganti Warna Tema
Edit file `LoginPage.tsx`, cari baris:
```tsx
className="bg-gradient-to-r from-emerald-600 to-green-600"
```

Ganti dengan warna pilihan Anda:
```tsx
// Biru
className="bg-gradient-to-r from-blue-600 to-indigo-600"

// Ungu
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Merah
className="bg-gradient-to-r from-red-600 to-orange-600"
```

## 🔧 Troubleshooting

### ❌ Error: "Invalid credentials"
**Solusi:**
1. Pastikan username/password benar
2. Jalankan seed command: `npx convex run seedUsersWithPassword:seedTestUsers`
3. Cek console browser untuk error detail

### ❌ Logo tidak muncul
**Solusi:**
1. Cek file ada di: `golfscore-app/public/logo-app.png`
2. Clear cache browser (Ctrl+Shift+R)
3. Pastikan path benar di LoginPage.tsx: `/logo-app.png`

### ❌ Convex tidak terhubung
**Solusi:**
1. Pastikan `npx convex dev` sedang berjalan
2. Cek file `.env.local` ada dan berisi `VITE_CONVEX_URL`
3. Restart dev server

### ❌ Tidak redirect setelah login
**Solusi:**
1. Buka browser console, cek error
2. Pastikan routes sudah dikonfigurasi di `src/routes/index.tsx`
3. Clear localStorage: `localStorage.clear()` di console

### ❌ Session hilang setelah refresh
**Solusi:**
1. Cek localStorage di browser DevTools
2. Pastikan key `golfscore_user` ada
3. Jangan gunakan incognito/private mode

## 📚 Dokumentasi Teknis

Untuk dokumentasi teknis lengkap, lihat:
- [LOGIN_SETUP.md](./LOGIN_SETUP.md) - Setup detail
- [SETUP_LOGIN.md](./SETUP_LOGIN.md) - Quick start
- [LOGIN_REDESIGN_SUMMARY.md](./LOGIN_REDESIGN_SUMMARY.md) - Summary perubahan

## ⚠️ Catatan Keamanan

**PENTING:** Implementasi saat ini untuk development/testing saja!

Untuk production, wajib implementasi:
- ✅ Hash password (gunakan bcrypt atau argon2)
- ✅ HTTPS only
- ✅ Rate limiting (batasi percobaan login)
- ✅ JWT atau session token yang aman
- ✅ CSRF protection
- ✅ 2FA (Two-Factor Authentication)
- ✅ Password reset via email
- ✅ Account lockout setelah gagal login berkali-kali

## 🎯 Fitur Mendatang

Fitur yang bisa ditambahkan:
- [ ] Halaman registrasi
- [ ] Lupa password
- [ ] Verifikasi email
- [ ] 2FA dengan Google Authenticator
- [ ] Login dengan Google/Facebook
- [ ] Remember me checkbox
- [ ] Password strength indicator
- [ ] Captcha untuk keamanan

## 💡 Tips Penggunaan

1. **Login Cepat:** Gunakan username saja (lebih pendek dari email)
2. **Lihat Password:** Klik icon mata untuk melihat password yang diketik
3. **Auto-Redirect:** Setelah login, otomatis diarahkan ke dashboard sesuai role
4. **Logout:** Tombol logout ada di pojok kanan atas setiap dashboard
5. **Session Persistent:** Tidak perlu login ulang setelah refresh page

## 🎉 Selesai!

Halaman login modern Anda sudah siap digunakan! 

Login sekarang dan mulai gunakan GolfScore ID Tournament Scoring System.

---

**Dibuat dengan ❤️ untuk GolfScore ID**
