# Panduan Registrasi Player

## Fitur yang Ditambahkan

### 1. Halaman Registrasi Player (`/player/register`)
Halaman registrasi lengkap dengan fitur:

#### Field Wajib:
- ✅ Nama Lengkap
- ✅ Email
- ✅ Username
- ✅ Password (minimal 6 karakter)
- ✅ Konfirmasi Password

#### Field Opsional:
- 📸 Upload Foto Profile (maksimal 5MB)
- 📱 No. Telepon
- 👤 Jenis Kelamin (Laki-laki/Perempuan)
- 📍 Lokasi Kerja
- 👕 Ukuran Baju (S, M, L, XL) dengan panduan ukuran
- 🧤 Ukuran Glove (S, M, L, XL) dengan panduan ukuran

### 2. Panduan Ukuran
Modal informasi untuk ukuran baju dan glove:

**Ukuran Baju:**
- S: Lingkar Dada 86-91 cm, Panjang 68-70 cm
- M: Lingkar Dada 91-96 cm, Panjang 70-72 cm
- L: Lingkar Dada 96-101 cm, Panjang 72-74 cm
- XL: Lingkar Dada 101-106 cm, Panjang 74-76 cm

**Ukuran Glove:**
- S: Lingkar Tangan 17-19 cm (Tangan kecil)
- M: Lingkar Tangan 19-21 cm (Tangan sedang)
- L: Lingkar Tangan 21-23 cm (Tangan besar)
- XL: Lingkar Tangan 23-25 cm (Tangan sangat besar)

### 3. Upload Foto Profile
- Mendukung format gambar (JPG, PNG, dll)
- Maksimal ukuran file 5MB
- Preview foto sebelum upload
- Terintegrasi dengan Convex Storage

### 4. Validasi Form
- Email format validation
- Password minimal 6 karakter
- Password confirmation matching
- Username dan email uniqueness check
- File size dan type validation

### 5. Error Handling
Error messages yang informatif:
- Email sudah terdaftar
- Username sudah digunakan
- Format email tidak valid
- Password tidak cocok
- Ukuran file terlalu besar
- Network error

## Perubahan Database (Convex)

### Schema Update (`convex/schema.ts`)
Menambahkan field baru di tabel `users`:
```typescript
phone: v.optional(v.string())
gender: v.optional(v.union(v.literal("male"), v.literal("female")))
workLocation: v.optional(v.string())
shirtSize: v.optional(v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")))
gloveSize: v.optional(v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL")))
profilePhotoUrl: v.optional(v.string())
profilePhotoStorageId: v.optional(v.id("_storage"))
```

### Mutations Update (`convex/users.ts`)
1. **`register`** - Update untuk menerima field baru
2. **`generateUploadUrl`** - Mutation baru untuk generate URL upload foto

## Routing

### Route Baru:
- `/player/register` - Halaman registrasi player

### Update Link:
- PlayerLoginPage: Link "Tidak punya akun? Registrasi" mengarah ke `/player/register`
- PlayerRegistrationPage: Link "Sudah punya akun? Login di sini" mengarah ke `/player/login`

## User Flow

1. **Player mengakses halaman login** (`/player/login`)
2. **Klik "Registrasi"** di bagian bawah form
3. **Mengisi form registrasi** dengan data lengkap
4. **Upload foto profile** (opsional)
5. **Klik panduan ukuran** untuk melihat size guide (opsional)
6. **Submit form**
7. **Redirect ke login** dengan success message
8. **Login dengan akun baru**

## Testing

### Test Registrasi:
1. Buka `/player/register`
2. Isi semua field wajib
3. Upload foto profile
4. Pilih ukuran baju dan glove
5. Klik "Daftar Sekarang"
6. Verifikasi redirect ke login dengan success message

### Test Validasi:
- Coba submit tanpa mengisi field wajib
- Coba password kurang dari 6 karakter
- Coba password tidak cocok
- Coba email format salah
- Coba upload file > 5MB
- Coba upload file bukan gambar

### Test Panduan Ukuran:
- Klik "Panduan" di field Ukuran Baju
- Verifikasi modal muncul dengan informasi ukuran
- Klik "Panduan" di field Ukuran Glove
- Verifikasi modal muncul dengan informasi ukuran

## Design

### Tema:
- Dark theme dengan gradient merah (konsisten dengan PlayerLoginPage)
- Background: Gradient dari `#2e2e2e` ke black
- Accent color: Red (`#8B0000` - `#DC143C`)
- Border: Red-900 dengan opacity

### Responsive:
- Mobile-first design
- Breakpoint: sm (640px)
- Grid layout untuk field berpasangan
- Touch-friendly button sizes

### Animasi:
- Fade-in untuk page load
- Smooth transitions untuk hover states
- Progress bar untuk upload
- Shimmer effect pada button

## File yang Dibuat/Dimodifikasi

### Dibuat:
1. `src/components/auth/PlayerRegistrationPage.tsx` - Komponen halaman registrasi

### Dimodifikasi:
1. `convex/schema.ts` - Menambahkan field profile player
2. `convex/users.ts` - Update mutation register dan tambah generateUploadUrl
3. `src/components/auth/PlayerLoginPage.tsx` - Update link ke registrasi
4. `src/routes/index.tsx` - Menambahkan route `/player/register`

## Catatan Penting

1. **Password Security**: Saat ini password disimpan plain text. Untuk production, gunakan hashing (bcrypt, argon2)
2. **File Upload**: Menggunakan Convex Storage untuk menyimpan foto profile
3. **Validation**: Client-side validation sudah ada, tapi server-side validation di Convex juga penting
4. **Success Message**: Ditampilkan di halaman login setelah registrasi berhasil
