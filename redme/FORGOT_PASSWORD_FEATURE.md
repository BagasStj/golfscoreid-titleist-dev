# Fitur Lupa Password

## Deskripsi
Fitur lupa password memungkinkan pemain untuk mereset password mereka jika lupa. Sistem akan memvalidasi email yang terdaftar di database dan memungkinkan pengguna untuk membuat password baru.

## Alur Kerja

### 1. Halaman Login
- Pengguna dapat mengklik link "Lupa Kata Sandi?" di halaman login pemain
- Link akan mengarahkan ke `/player/forgot-password`

### 2. Validasi Email
- Pengguna memasukkan email yang terdaftar
- Sistem memvalidasi format email
- Sistem memvalidasi email terdaftar di database melalui mutation `validateEmailForReset`
- Jika email tidak terdaftar, akan muncul error: "Email tidak terdaftar dalam sistem"
- Jika email valid dan terdaftar, pengguna akan diarahkan ke step berikutnya

### 3. Reset Password
- Pengguna memasukkan password baru (minimal 3 karakter)
- Pengguna mengkonfirmasi password baru
- Sistem memvalidasi:
  - Email terdaftar di database
  - Password minimal 3 karakter
  - Password dan konfirmasi password cocok
- Jika validasi berhasil, password akan di-hash menggunakan bcrypt dan disimpan ke database

### 4. Redirect ke Login
- Setelah berhasil reset password, pengguna akan diarahkan ke halaman login
- Pesan sukses akan ditampilkan
- Pengguna dapat login dengan password baru

## File yang Dibuat/Dimodifikasi

### Backend (Convex)
- `convex/users.ts` - Menambahkan 2 mutations:
  - `validateEmailForReset` - Validasi email terdaftar di database
  - `resetPassword` - Hash password baru dengan bcrypt dan update ke database

### Frontend
- `src/components/auth/ForgotPasswordPage.tsx` - Komponen halaman lupa password
  - Form validasi email
  - Form input password baru
  - Validasi dan error handling
  - Success message dan redirect

- `src/routes/index.tsx` - Menambahkan route `/player/forgot-password`

- `src/components/auth/PlayerLoginPage.tsx` - Menambahkan link "Lupa Kata Sandi?"

## Keamanan
- Email divalidasi terlebih dahulu di backend sebelum user bisa input password baru
- Password di-hash menggunakan bcrypt dengan salt rounds 10
- Validasi email dilakukan di backend untuk mencegah enumerasi user
- Password minimal 3 karakter (sesuai requirement sistem)
- Dua step validation: email validation → password reset

## UI/UX
- Desain konsisten dengan halaman login dan registrasi
- Dark theme dengan gradient merah
- Animasi smooth untuk transisi
- Error handling yang jelas dan informatif
- Loading state untuk feedback visual

## Testing
Untuk menguji fitur:
1. Buka halaman login pemain: `/player/login`
2. Klik "Lupa Kata Sandi?"
3. Masukkan email yang terdaftar
4. Klik "Lanjutkan"
5. Masukkan password baru dan konfirmasi
6. Klik "Reset Password"
7. Verifikasi redirect ke login dengan pesan sukses
8. Login dengan password baru

## Error Handling
- Email tidak terdaftar: "Email tidak terdaftar dalam sistem"
- Format email tidak valid: "Format email tidak valid"
- Password terlalu pendek: "Password minimal 3 karakter"
- Password tidak cocok: "Password tidak cocok"
- Network error: "Masalah koneksi. Coba lagi."
