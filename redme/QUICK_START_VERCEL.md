# ⚡ Quick Start - Deploy ke Vercel

## 🎯 Masalah: Error "No address provided to ConvexReactClient"

## ✅ Solusi (2 Menit)

### 1️⃣ Buka Vercel Dashboard

```
https://vercel.com → Pilih Project Anda → Settings → Environment Variables
```

### 2️⃣ Tambah Variable Ini

| Field | Value |
|-------|-------|
| **Name** | `VITE_CONVEX_URL` |
| **Value** | `https://original-moose-298.convex.cloud` |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

### 3️⃣ Redeploy

**Cara 1 - Push ke Git:**
```bash
git push
```

**Cara 2 - Manual di Vercel:**
```
Deployments → ... → Redeploy
```

### 4️⃣ Selesai! ✨

Buka aplikasi Anda, error sudah hilang!

---

## 📸 Screenshot Panduan

### Langkah 1: Buka Environment Variables
```
Vercel Dashboard
  └─ Your Project
      └─ Settings (tab)
          └─ Environment Variables (sidebar)
              └─ Add New (button)
```

### Langkah 2: Isi Form
```
┌─────────────────────────────────────────┐
│ Name                                    │
│ VITE_CONVEX_URL                        │
├─────────────────────────────────────────┤
│ Value                                   │
│ https://original-moose-298.convex.cloud│
├─────────────────────────────────────────┤
│ Environments                            │
│ ☑ Production                           │
│ ☑ Preview                              │
│ ☑ Development                          │
└─────────────────────────────────────────┘
         [Save]
```

---

## ⚠️ Checklist Sebelum Deploy

- [ ] Build berhasil tanpa error (`npm run build`)
- [ ] File `.env.production` sudah ada
- [ ] Environment variable sudah ditambah di Vercel
- [ ] Sudah redeploy setelah tambah variable

---

## 🔍 Verifikasi

Setelah deploy, buka browser console (F12):

```javascript
// Harus menampilkan URL Convex
console.log(import.meta.env.VITE_CONVEX_URL)
// Output: https://original-moose-298.convex.cloud
```

---

## 🆘 Masih Error?

### Error: "No address provided"
→ Environment variable belum ditambahkan atau salah nama

### Error: "Failed to connect"
→ URL Convex salah atau deployment Convex tidak aktif

### Error: Build failed
→ Lihat build logs di Vercel untuk detail error

---

## 📚 Dokumentasi Lengkap

- **Bahasa Indonesia**: `CARA_DEPLOY_VERCEL.md`
- **English**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Convex Docs**: https://docs.convex.dev/production/hosting

---

## 💡 Tips

1. **Development**: Gunakan `npx convex dev` untuk local
2. **Production**: Gunakan `npx convex deploy` untuk production proper
3. **Environment**: Pisahkan development dan production URL
4. **Security**: Jangan commit `.env.local` (sudah di .gitignore)

---

**Selamat! Aplikasi Anda siap di production! 🎉**
