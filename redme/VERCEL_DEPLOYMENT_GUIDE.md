# Panduan Deploy ke Vercel dengan Convex

## Error yang Muncul
```
Uncaught Error: No address provided to ConvexReactClient
```

Error ini terjadi karena environment variable `VITE_CONVEX_URL` tidak tersedia di production.

## Solusi 1: Tambahkan Environment Variable di Vercel (Cepat)

### Langkah-langkah:

1. **Buka Vercel Dashboard**
   - Login ke https://vercel.com
   - Pilih project Anda

2. **Tambah Environment Variable**
   - Klik tab **Settings**
   - Pilih **Environment Variables** di sidebar
   - Klik **Add New**

3. **Isi Variable**
   ```
   Name: VITE_CONVEX_URL
   Value: https://original-moose-298.convex.cloud
   ```
   - Centang semua environment: **Production**, **Preview**, **Development**
   - Klik **Save**

4. **Redeploy**
   - Pergi ke tab **Deployments**
   - Klik titik tiga (...) pada deployment terakhir
   - Pilih **Redeploy**
   - Atau push commit baru ke repository

## Solusi 2: Setup Convex Production (Recommended)

Untuk production yang lebih proper, gunakan Convex production deployment:

### 1. Deploy Convex ke Production

```bash
cd golfscore-app
npx convex deploy
```

Perintah ini akan:
- Membuat production deployment di Convex
- Generate URL production baru
- Update `.env.local` dengan URL production

### 2. Copy URL Production

Setelah deploy, Anda akan mendapat URL seperti:
```
https://your-project-name-123.convex.cloud
```

### 3. Tambahkan ke Vercel

Tambahkan URL production ini ke Vercel Environment Variables:
```
Name: VITE_CONVEX_URL
Value: https://your-project-name-123.convex.cloud
```

### 4. Update Build Settings di Vercel (Opsional)

Jika perlu, pastikan build settings di Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Solusi 3: Gunakan .env.production

Buat file `.env.production` di root project:

```bash
# .env.production
VITE_CONVEX_URL=https://original-moose-298.convex.cloud
```

Lalu commit file ini ke repository. Vite akan otomatis menggunakan file ini saat build production.

## Verifikasi

Setelah setup, verifikasi dengan:

1. **Check di Browser Console**
   ```javascript
   console.log(import.meta.env.VITE_CONVEX_URL)
   ```
   Harus menampilkan URL Convex

2. **Test Koneksi**
   - Buka aplikasi
   - Coba login atau akses data
   - Tidak ada error "No address provided"

## Troubleshooting

### Error masih muncul setelah redeploy?

1. **Clear Vercel Cache**
   - Di Vercel dashboard, pilih deployment
   - Klik "Redeploy" dengan opsi "Clear cache and redeploy"

2. **Check Environment Variable**
   - Pastikan variable name EXACT: `VITE_CONVEX_URL` (case-sensitive)
   - Pastikan tidak ada spasi di awal/akhir value
   - Pastikan dicentang untuk Production environment

3. **Check Build Logs**
   - Lihat build logs di Vercel
   - Cari baris yang menunjukkan environment variables loaded

### Convex tidak connect?

1. **Check Convex Dashboard**
   - Login ke https://dashboard.convex.dev
   - Pastikan deployment masih aktif
   - Check usage/quota

2. **Test URL Langsung**
   - Buka URL Convex di browser
   - Harus menampilkan halaman Convex

## Rekomendasi

Untuk production yang stabil:

1. ✅ Gunakan `npx convex deploy` untuk production deployment
2. ✅ Simpan production URL di Vercel Environment Variables
3. ✅ Gunakan development URL (`convex dev`) hanya untuk local development
4. ✅ Jangan commit `.env.local` ke git (sudah ada di .gitignore)
5. ✅ Buat `.env.production` untuk production URL (optional)

## Perintah Berguna

```bash
# Local development
npx convex dev

# Deploy ke production
npx convex deploy

# Check deployment info
npx convex deployment info

# List all deployments
npx convex deployments
```

## Kontak Support

Jika masih ada masalah:
- Convex Discord: https://convex.dev/community
- Convex Docs: https://docs.convex.dev/production/hosting
- Vercel Support: https://vercel.com/support
