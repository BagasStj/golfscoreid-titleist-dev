# Migration Guide - Holes Config to Course System

## Problem

Setelah update schema untuk Course Management, database Anda mungkin memiliki data lama di tabel `holes_config` yang tidak memiliki field `courseId`. Ini akan menyebabkan error:

```
Schema validation failed.
Document with ID "..." in table "holes_config" does not match the schema: 
Object is missing the required field `courseId`.
```

## Solution

Ada 2 cara untuk mengatasi masalah ini:

### Option 1: Migrate Data ke Course (Recommended)

Cara ini akan mempertahankan data lama Anda dengan mengassign-nya ke sebuah course.

#### Langkah-langkah:

1. **Login sebagai Admin**
   - Buka aplikasi dan login dengan akun admin

2. **Buka Course Management**
   - Klik menu "Course Management" di sidebar admin

3. **Lihat Migration Helper**
   - Anda akan melihat warning box kuning di bagian atas
   - Box ini berisi 2 opsi: Migrate atau Delete

4. **Buat Course Baru (jika belum ada)**
   - Klik "Tambah Lapangan"
   - Isi informasi course:
     - Nama: e.g., "Default Golf Course"
     - Lokasi: e.g., "Jakarta"
     - Total Holes: 18
     - Tee Boxes: gunakan default atau customize
   - Klik "Buat Lapangan"

5. **Migrate Data**
   - Di Migration Helper, pilih course yang baru dibuat
   - Klik "Migrate to Selected Course"
   - Tunggu proses selesai
   - Anda akan melihat pesan sukses

6. **Verifikasi**
   - Klik "Configure Holes" pada course tersebut
   - Pastikan data holes sudah ada
   - Update distances jika diperlukan

### Option 2: Delete Old Data

⚠️ **WARNING**: Cara ini akan menghapus data lama secara permanen!

Gunakan opsi ini jika:
- Data lama tidak penting
- Anda ingin mulai fresh
- Data lama sudah tidak relevan

#### Langkah-langkah:

1. **Login sebagai Admin**
2. **Buka Course Management**
3. **Di Migration Helper, klik "Delete Old Records"**
4. **Konfirmasi penghapusan**
5. **Data lama akan terhapus**

Setelah itu, Anda bisa membuat course baru dan konfigurasi holes dari awal.

## Technical Details

### Schema Changes

#### Before (Old Schema)
```typescript
holes_config: defineTable({
  holeNumber: v.number(),
  par: v.number(),
  index: v.number(),
  courseSection: v.union(v.literal("front9"), v.literal("back9")),
})
```

#### After (New Schema)
```typescript
holes_config: defineTable({
  courseId: v.optional(v.id("courses")), // Now optional for backward compatibility
  holeNumber: v.number(),
  par: v.number(),
  index: v.number(),
  courseSection: v.union(v.literal("front9"), v.literal("back9")),
  distances: v.optional(v.array(v.object({
    teeBoxName: v.string(),
    distance: v.number(),
  }))),
})
```

### Migration Functions

#### `migrateHolesConfigToCourse`
```typescript
// Migrate old holes to a specific course
await ctx.mutation(api.migrateHolesConfig.migrateHolesConfigToCourse, {
  courseId: "your-course-id"
});
```

#### `deleteOldHolesConfig`
```typescript
// Delete all old holes without courseId
await ctx.mutation(api.migrateHolesConfig.deleteOldHolesConfig, {});
```

## FAQ

### Q: Apakah saya harus migrate sekarang?
**A:** Ya, sebaiknya segera. Data lama tanpa `courseId` tidak akan bisa digunakan dalam sistem baru.

### Q: Apakah data akan hilang saat migrate?
**A:** Tidak, data akan dipertahankan dan di-assign ke course yang Anda pilih.

### Q: Bagaimana jika saya punya multiple courses?
**A:** Anda perlu membuat course baru untuk setiap lapangan yang berbeda. Data lama hanya bisa di-migrate ke satu course.

### Q: Apakah bisa migrate sebagian data?
**A:** Tidak, migration akan memproses semua data lama sekaligus. Jika Anda butuh split data, gunakan option delete dan setup manual.

### Q: Bagaimana jika migration gagal?
**A:** Cek error message yang muncul. Kemungkinan:
- Course tidak ditemukan: pastikan course ID valid
- Permission denied: pastikan Anda login sebagai admin
- Network error: cek koneksi internet

### Q: Apakah bisa undo migration?
**A:** Tidak ada undo otomatis. Tapi Anda bisa:
1. Delete course yang salah
2. Buat course baru
3. Setup holes manual atau import CSV

### Q: Setelah migrate, apakah warning akan hilang?
**A:** Ya, setelah semua data lama ter-migrate atau terhapus, warning akan hilang otomatis.

## Best Practices

1. **Backup Data**
   - Export holes configuration ke CSV sebelum migrate
   - Simpan file CSV sebagai backup

2. **Test di Development**
   - Jika memungkinkan, test migration di development environment dulu
   - Verifikasi hasilnya sebelum apply di production

3. **Dokumentasi**
   - Catat course mana yang digunakan untuk migration
   - Dokumentasikan perubahan yang dilakukan

4. **Verifikasi Post-Migration**
   - Cek semua holes configuration
   - Update distances jika diperlukan
   - Test tournament creation dengan course baru

## Support

Jika Anda mengalami masalah:

1. **Check Console**
   - Buka browser console (F12)
   - Lihat error messages

2. **Check Convex Dashboard**
   - Login ke Convex dashboard
   - Cek data di tabel `holes_config` dan `courses`

3. **Manual Fix**
   - Jika perlu, Anda bisa edit data langsung di Convex dashboard
   - Pastikan setiap record di `holes_config` memiliki `courseId`

## Migration Script (Advanced)

Jika Anda prefer menggunakan script langsung:

```typescript
// Run in Convex dashboard or via CLI

// 1. Create a course first
const courseId = await ctx.mutation(api.courses.create, {
  name: "Default Golf Course",
  location: "Jakarta",
  totalHoles: 18,
  teeBoxes: [
    { name: "Black", color: "#000000" },
    { name: "Blue", color: "#3B82F6" },
    { name: "White", color: "#FFFFFF" },
    { name: "Gold", color: "#F59E0B" },
    { name: "Red", color: "#EF4444" },
  ],
});

// 2. Migrate holes to the course
await ctx.mutation(api.migrateHolesConfig.migrateHolesConfigToCourse, {
  courseId: courseId,
});
```

## Conclusion

Migration ini diperlukan untuk mendukung fitur Course Management yang baru. Dengan sistem baru, Anda bisa:

- Mengelola multiple courses
- Konfigurasi tee boxes yang fleksibel
- Setup distances per tee box
- Reuse configuration untuk multiple tournaments

Ikuti langkah-langkah di atas untuk migrate data Anda dengan aman.
