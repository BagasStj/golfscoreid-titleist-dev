# 🚀 Cara Deploy ke Vercel - Panduan Singkat

## ❌ Error yang Muncul

```
Uncaught Error: No address provided to ConvexReactClient
```

## ✅ Solusi Tercepat (3 Langkah)

### Langkah 1: Tambah Environment Variable di Vercel

1. Buka **Vercel Dashboard** → Pilih project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variable baru:

```
Name:  VITE_CONVEX_URL
Value: https://original-moose-298.convex.cloud
```

4. **PENTING**: Centang **Production**, **Preview**, dan **Development**
5. Klik **Save**

### Langkah 2: Redeploy

**Opsi A - Dari Vercel Dashboard:**
- Pergi ke tab **Deployments**
- Klik menu (...) pada deployment terakhir
- Pilih **Redeploy**

**Opsi B - Push ke Git:**
```bash
git add .
git commit -m "Add production env"
git push
```

### Langkah 3: Verifikasi

Buka aplikasi Anda di browser, seharusnya sudah tidak ada error lagi!

---

## 📋 Checklist Deployment

Pastikan sudah:
- ✅ File `.env.production` sudah dibuat (sudah ada di project)
- ✅ Environment variable `VITE_CONVEX_URL` sudah ditambahkan di Vercel
- ✅ Sudah redeploy setelah menambah environment variable
- ✅ Build berhasil tanpa error TypeScript

---

## 🔧 Troubleshooting

### Masih error setelah redeploy?

**1. Clear Cache dan Redeploy**
- Di Vercel, pilih deployment
- Klik **Redeploy** → Centang **"Clear cache and redeploy"**

**2. Periksa Environment Variable**
- Pastikan nama variable PERSIS: `VITE_CONVEX_URL` (huruf besar/kecil harus sama)
- Pastikan tidak ada spasi di awal atau akhir value
- Pastikan URL lengkap: `https://original-moose-298.convex.cloud`

**3. Periksa Build Logs**
- Buka tab **Deployments** di Vercel
- Klik deployment terakhir
- Lihat **Build Logs** untuk error

### Aplikasi tidak bisa connect ke Convex?

**1. Test URL Convex**
- Buka https://original-moose-298.convex.cloud di browser
- Harus menampilkan halaman Convex (bukan error 404)

**2. Jalankan Convex Dev (untuk local)**
```bash
cd golfscore-app
npx convex dev
```

---

## 🎯 Untuk Production yang Lebih Baik

Jika ingin setup production yang proper:

### 1. Deploy Convex ke Production

```bash
cd golfscore-app
npx convex deploy
```

Ini akan membuat production deployment terpisah dari development.

### 2. Update Environment Variable

Setelah `convex deploy`, Anda akan dapat URL production baru. Update di Vercel:

```
VITE_CONVEX_URL=https://your-new-production-url.convex.cloud
```

### 3. Update .env.production

Edit file `.env.production` dengan URL production yang baru.

---

## 📝 Catatan Penting

- **Development**: Gunakan `npx convex dev` dan URL development
- **Production**: Gunakan `npx convex deploy` dan URL production
- **Jangan commit** file `.env.local` (untuk development saja)
- **Commit** file `.env.production` (untuk production)

---

## 🆘 Butuh Bantuan?

Jika masih ada masalah, cek:
- Build logs di Vercel
- Browser console untuk error detail
- Convex dashboard untuk status deployment

Atau hubungi:
- Convex Discord: https://convex.dev/community
- Vercel Support: https://vercel.com/support
