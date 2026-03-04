# Course Management Guide

## Overview
Fitur Course Management memungkinkan admin untuk mengelola berbagai lapangan golf dengan konfigurasi masing-masing, termasuk holes, tee boxes, jarak, par, dan handicap index.

## Fitur Utama

### 1. **Manajemen Lapangan Golf**
- Tambah lapangan golf baru
- Edit informasi lapangan
- Aktifkan/nonaktifkan lapangan
- Hapus lapangan (jika tidak digunakan dalam tournament)

### 2. **Konfigurasi Tee Boxes**
- Tambah multiple tee boxes per lapangan
- Kustomisasi nama dan warna tee box
- Set rating dan slope untuk setiap tee box
- Default tee boxes: Black, Blue, White, Gold, Red

### 3. **Konfigurasi Holes**
- Set par untuk setiap hole (3-6)
- Set handicap index (1-18)
- Tentukan section (Front 9 / Back 9)
- Set jarak dari setiap tee box (dalam meter)
- Bulk configuration untuk semua holes

### 4. **Import/Export**
- Export konfigurasi holes ke CSV
- Import konfigurasi dari CSV
- Template CSV untuk kemudahan setup

## Cara Menggunakan

### Menambah Lapangan Baru

1. **Buka Course Management**
   - Login sebagai admin
   - Klik menu "Course Management" di sidebar

2. **Klik "Tambah Lapangan"**
   - Isi informasi dasar:
     - Nama Lapangan (required)
     - Lokasi (required)
     - Deskripsi (optional)
     - Total Holes (9 atau 18)

3. **Konfigurasi Tee Boxes**
   - Default tee boxes sudah tersedia
   - Tambah/hapus tee box sesuai kebutuhan
   - Set nama, warna, rating, dan slope
   - Minimal 1 tee box harus ada

4. **Simpan Lapangan**
   - Klik "Buat Lapangan"
   - Lapangan akan tersimpan dengan status Active

### Konfigurasi Holes

1. **Buka Hole Configuration**
   - Dari Course Management, klik "Configure Holes" pada lapangan yang ingin dikonfigurasi

2. **Isi Data Holes**
   - Tabel akan menampilkan semua holes (1-18 atau 1-9)
   - Untuk setiap hole, isi:
     - **Par**: 3, 4, 5, atau 6
     - **Index**: Handicap index (1-18)
     - **Section**: Front 9 atau Back 9
     - **Distances**: Jarak dari setiap tee box (dalam meter)

3. **Gunakan Import/Export**
   - **Export CSV**: Download konfigurasi saat ini
   - **Import CSV**: Upload file CSV dengan format yang benar

4. **Simpan Konfigurasi**
   - Klik "Simpan Konfigurasi"
   - Semua holes akan tersimpan sekaligus

### Format CSV untuk Import

```csv
Hole,Par,Index,Section,Black (m),Blue (m),White (m),Gold (m),Red (m)
1,4,5,front9,380,360,340,320,280
2,5,3,front9,520,500,480,450,400
3,3,17,front9,180,170,160,150,140
...
```

**Catatan:**
- Header harus sesuai dengan tee boxes yang ada di lapangan
- Section: `front9` atau `back9`
- Semua nilai harus valid (angka)

### Mengedit Lapangan

1. Klik icon **Edit** (pensil) pada card lapangan
2. Update informasi yang diperlukan
3. Bisa mengubah status Active/Inactive
4. Klik "Update" untuk menyimpan

### Menghapus Lapangan

1. Klik icon **Trash** pada card lapangan
2. Konfirmasi penghapusan
3. **Catatan**: Lapangan yang sudah digunakan dalam tournament tidak dapat dihapus

## Integrasi dengan Tournament

### Menggunakan Course di Tournament

Setelah course dikonfigurasi, admin dapat:

1. **Pilih Course saat membuat Tournament**
   - Field `courseId` akan tersedia di Tournament Creation Form
   - Pilih dari daftar course yang aktif

2. **Automatic Hole Configuration**
   - Holes configuration akan otomatis diambil dari course yang dipilih
   - Tidak perlu setup holes manual lagi

3. **Tee Box Selection**
   - Pilih tee box untuk male/female berdasarkan yang tersedia di course
   - Jarak akan otomatis disesuaikan

## Database Schema

### Courses Table
```typescript
{
  _id: Id<"courses">,
  name: string,
  location: string,
  description?: string,
  totalHoles: number, // 9 or 18
  teeBoxes: Array<{
    name: string,
    color: string,
    rating?: number,
    slope?: number,
  }>,
  createdAt: number,
  createdBy: Id<"users">,
  isActive: boolean,
}
```

### Holes Config Table
```typescript
{
  _id: Id<"holes_config">,
  courseId: Id<"courses">,
  holeNumber: number,
  par: number,
  index: number,
  courseSection: "front9" | "back9",
  distances: Array<{
    teeBoxName: string,
    distance: number,
  }>,
}
```

## API Functions

### Queries
- `courses.list({ includeInactive?: boolean })` - Get all courses
- `courses.getById({ courseId })` - Get course by ID
- `courses.getWithHoles({ courseId })` - Get course with holes configuration

### Mutations
- `courses.create({ name, location, description?, totalHoles, teeBoxes })` - Create new course
- `courses.update({ courseId, ...updates })` - Update course
- `courses.remove({ courseId })` - Delete course
- `courses.upsertHole({ courseId, holeNumber, par, index, courseSection, distances })` - Add/update single hole
- `courses.bulkUpsertHoles({ courseId, holes })` - Bulk add/update holes
- `courses.deleteHole({ holeId })` - Delete hole configuration

## Best Practices

1. **Setup Course Sebelum Tournament**
   - Buat dan konfigurasi course terlebih dahulu
   - Pastikan semua holes sudah dikonfigurasi dengan benar
   - Test dengan membuat tournament dummy

2. **Gunakan Naming Convention**
   - Nama course yang jelas: "Pondok Indah Golf Course"
   - Lokasi yang spesifik: "Jakarta Selatan"
   - Tee box names yang standard: Black, Blue, White, Gold, Red

3. **Backup Configuration**
   - Export CSV secara berkala
   - Simpan file CSV sebagai backup
   - Gunakan untuk duplicate course setup

4. **Validasi Data**
   - Pastikan total par masuk akal (72 untuk 18 holes, 36 untuk 9 holes)
   - Jarak tee box harus logis (Black > Blue > White > Gold > Red)
   - Handicap index harus unique (1-18)

## Troubleshooting

### Course tidak bisa dihapus
**Penyebab**: Course sudah digunakan dalam tournament
**Solusi**: Set course menjadi inactive instead of delete

### Import CSV gagal
**Penyebab**: Format CSV tidak sesuai
**Solusi**: 
- Download template dengan Export CSV
- Pastikan header sesuai dengan tee boxes
- Cek format data (angka, section name)

### Holes tidak tersimpan
**Penyebab**: Validasi gagal atau koneksi error
**Solusi**:
- Cek semua field sudah diisi
- Pastikan par antara 3-6
- Pastikan index antara 1-totalHoles
- Cek koneksi internet

## Future Enhancements

1. **Course Images**
   - Upload foto lapangan
   - Foto setiap hole
   - Course layout map

2. **Advanced Statistics**
   - Average scores per hole
   - Difficulty rating
   - Historical data

3. **Weather Integration**
   - Current weather at course location
   - Wind direction per hole
   - Temperature and humidity

4. **Course Conditions**
   - Green speed
   - Fairway conditions
   - Rough height

## Support

Untuk bantuan lebih lanjut:
- Hubungi admin system
- Lihat dokumentasi API di `convex/courses.ts`
- Check console untuk error messages
