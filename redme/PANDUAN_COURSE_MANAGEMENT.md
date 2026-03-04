# Panduan Course Management - GolfScore ID

## 📖 Pengenalan

Course Management adalah fitur untuk mengelola lapangan golf dengan konfigurasi lengkap termasuk holes, tee boxes, jarak, par, dan handicap index. Setiap lapangan dapat memiliki pengaturan yang berbeda dan dapat digunakan berulang kali untuk berbagai tournament.

## 🎯 Manfaat

- **Efisiensi**: Setup sekali, gunakan berkali-kali
- **Konsistensi**: Data lapangan yang sama untuk semua tournament
- **Fleksibilitas**: Support multiple courses dengan konfigurasi berbeda
- **Kemudahan**: Import/Export CSV untuk bulk configuration

## 📋 Langkah-langkah Penggunaan

### 1️⃣ Membuka Course Management

1. Login sebagai **Admin**
2. Klik menu **"Course Management"** di sidebar
3. Anda akan melihat daftar semua lapangan golf yang sudah dibuat

### 2️⃣ Menambah Lapangan Baru

#### Langkah A: Klik Tombol "Tambah Lapangan"
- Tombol hijau di pojok kanan atas
- Icon: ➕ Plus

#### Langkah B: Isi Informasi Dasar

**Field yang Wajib Diisi:**
- **Nama Lapangan**: Contoh: "Pondok Indah Golf Course"
- **Lokasi**: Contoh: "Jakarta Selatan"
- **Total Holes**: Pilih 9 atau 18 holes

**Field Optional:**
- **Deskripsi**: Deskripsi singkat tentang lapangan

#### Langkah C: Konfigurasi Tee Boxes

**Default Tee Boxes** (sudah tersedia):
- 🖤 **Black** - Paling jauh
- 🔵 **Blue** - Jauh
- ⚪ **White** - Sedang
- 🟡 **Gold** - Dekat
- 🔴 **Red** - Paling dekat (biasanya untuk ladies)

**Untuk Setiap Tee Box, Anda Bisa Set:**
- **Nama**: Nama tee box (contoh: "Black", "Championship")
- **Warna**: Pilih warna dengan color picker
- **Rating**: Course rating (optional, contoh: 72.5)
- **Slope**: Slope rating (optional, contoh: 130)

**Menambah/Menghapus Tee Box:**
- Klik **"Tambah Tee Box"** untuk menambah
- Klik icon **❌** untuk menghapus
- Minimal harus ada 1 tee box

#### Langkah D: Simpan Lapangan
- Klik tombol **"Buat Lapangan"**
- Lapangan akan tersimpan dengan status **Active**

### 3️⃣ Konfigurasi Holes

Setelah lapangan dibuat, Anda perlu mengkonfigurasi setiap hole.

#### Langkah A: Buka Hole Configuration
1. Dari halaman Course Management
2. Cari lapangan yang ingin dikonfigurasi
3. Klik tombol **"Configure Holes"** (icon ⚙️)

#### Langkah B: Isi Data Holes

Anda akan melihat tabel dengan kolom:

| Hole | Par | Index | Section | Black (m) | Blue (m) | White (m) | Gold (m) | Red (m) |
|------|-----|-------|---------|-----------|----------|----------|----------|---------|
| 1    | 4   | 7     | Front 9 | 380       | 360      | 340      | 320      | 280     |
| 2    | 5   | 3     | Front 9 | 520       | 500      | 480      | 450      | 400     |
| ...  | ... | ...   | ...     | ...       | ...      | ...      | ...      | ...     |

**Penjelasan Kolom:**

1. **Hole**: Nomor hole (1-18 atau 1-9)
2. **Par**: Jumlah pukulan standar (3, 4, 5, atau 6)
3. **Index**: Handicap index (1-18, 1 = paling sulit)
4. **Section**: Front 9 atau Back 9
5. **Distances**: Jarak dari setiap tee box dalam meter

**Tips Mengisi:**
- Par 3: Biasanya 130-200 meter
- Par 4: Biasanya 300-450 meter
- Par 5: Biasanya 450-600 meter
- Jarak Black > Blue > White > Gold > Red

#### Langkah C: Gunakan Import/Export (Optional)

**Export CSV:**
1. Klik tombol **"Export CSV"**
2. File akan terdownload
3. Gunakan sebagai template atau backup

**Import CSV:**
1. Siapkan file CSV dengan format yang benar
2. Klik tombol **"Import CSV"**
3. Pilih file CSV
4. Data akan otomatis terisi

**Format CSV:**
```csv
Hole,Par,Index,Section,Black (m),Blue (m),White (m),Gold (m),Red (m)
1,4,7,front9,380,360,340,320,280
2,5,3,front9,520,500,480,450,400
3,3,15,front9,180,170,160,150,140
...
```

#### Langkah D: Simpan Konfigurasi
- Klik tombol **"Simpan Konfigurasi"**
- Semua holes akan tersimpan sekaligus
- Anda akan melihat konfirmasi sukses

### 4️⃣ Mengedit Lapangan

1. Dari halaman Course Management
2. Klik icon **✏️ Edit** pada card lapangan
3. Update informasi yang diperlukan
4. Bisa mengubah:
   - Nama dan lokasi
   - Deskripsi
   - Total holes
   - Tee boxes
   - Status Active/Inactive
5. Klik **"Update"** untuk menyimpan

### 5️⃣ Menghapus Lapangan

1. Klik icon **🗑️ Trash** pada card lapangan
2. Konfirmasi penghapusan
3. **⚠️ PENTING**: Lapangan yang sudah digunakan dalam tournament **TIDAK DAPAT DIHAPUS**
4. Solusi: Set lapangan menjadi **Inactive** instead

### 6️⃣ Menggunakan Course di Tournament

Setelah course dikonfigurasi, Anda dapat menggunakannya saat membuat tournament:

1. Buka **Tournament Management**
2. Klik **"Create Tournament"**
3. Di form tournament, pilih **Course** dari dropdown
4. Holes configuration akan otomatis diambil dari course
5. Pilih tee box untuk male/female sesuai yang tersedia
6. Selesai! Tidak perlu setup holes manual lagi

## 💡 Tips & Best Practices

### 1. Penamaan yang Jelas
```
✅ BAIK:
- Nama: "Pondok Indah Golf Course"
- Lokasi: "Jakarta Selatan"

❌ KURANG BAIK:
- Nama: "PI"
- Lokasi: "JKT"
```

### 2. Validasi Data
- Total par untuk 18 holes biasanya 72 (bisa 70-74)
- Total par untuk 9 holes biasanya 36 (bisa 35-37)
- Jarak harus logis: Black > Blue > White > Gold > Red
- Handicap index harus unique (tidak boleh ada yang sama)

### 3. Backup Configuration
- Export CSV secara berkala
- Simpan file CSV sebagai backup
- Gunakan untuk duplicate course setup

### 4. Testing
- Test dengan membuat tournament dummy
- Verifikasi semua holes muncul dengan benar
- Check jarak dan par sudah sesuai

## 🔍 Contoh Konfigurasi

### Contoh 1: Standard 18 Holes Course

**Informasi Dasar:**
- Nama: "Jagorawi Golf & Country Club"
- Lokasi: "Bogor, Jawa Barat"
- Total Holes: 18
- Tee Boxes: Black, Blue, White, Red

**Front 9 (Par 36):**
| Hole | Par | Index | Black | Blue | White | Red |
|------|-----|-------|-------|------|-------|-----|
| 1    | 4   | 7     | 380   | 360  | 340   | 280 |
| 2    | 5   | 3     | 520   | 500  | 480   | 400 |
| 3    | 3   | 15    | 180   | 170  | 160   | 140 |
| 4    | 4   | 5     | 400   | 380  | 360   | 300 |
| 5    | 4   | 11    | 360   | 340  | 320   | 280 |
| 6    | 4   | 9     | 390   | 370  | 350   | 290 |
| 7    | 3   | 17    | 170   | 160  | 150   | 130 |
| 8    | 5   | 1     | 540   | 520  | 500   | 420 |
| 9    | 4   | 13    | 410   | 390  | 370   | 310 |

**Back 9 (Par 36):**
| Hole | Par | Index | Black | Blue | White | Red |
|------|-----|-------|-------|------|-------|-----|
| 10   | 4   | 8     | 385   | 365  | 345   | 285 |
| 11   | 5   | 4     | 530   | 510  | 490   | 410 |
| 12   | 3   | 16    | 175   | 165  | 155   | 135 |
| 13   | 4   | 6     | 395   | 375  | 355   | 295 |
| 14   | 4   | 12    | 370   | 350  | 330   | 270 |
| 15   | 4   | 10    | 385   | 365  | 345   | 285 |
| 16   | 3   | 18    | 165   | 155  | 145   | 125 |
| 17   | 5   | 2     | 550   | 530  | 510   | 430 |
| 18   | 4   | 14    | 420   | 400  | 380   | 320 |

**Total Par: 72**

### Contoh 2: Executive 9 Holes Course

**Informasi Dasar:**
- Nama: "Senayan Golf Driving Range"
- Lokasi: "Jakarta Pusat"
- Total Holes: 9
- Tee Boxes: White, Red

**9 Holes (Par 35):**
| Hole | Par | Index | White | Red |
|------|-----|-------|-------|-----|
| 1    | 4   | 3     | 340   | 280 |
| 2    | 4   | 5     | 360   | 300 |
| 3    | 3   | 9     | 160   | 140 |
| 4    | 5   | 1     | 480   | 400 |
| 5    | 4   | 7     | 350   | 290 |
| 6    | 3   | 8     | 150   | 130 |
| 7    | 4   | 4     | 370   | 310 |
| 8    | 4   | 6     | 330   | 270 |
| 9    | 4   | 2     | 380   | 320 |

**Total Par: 35**

## ❓ Troubleshooting

### Problem: Course tidak bisa dihapus
**Penyebab**: Course sudah digunakan dalam tournament

**Solusi**:
1. Set course menjadi **Inactive** instead
2. Atau hapus tournament yang menggunakan course tersebut terlebih dahulu

### Problem: Import CSV gagal
**Penyebab**: Format CSV tidak sesuai

**Solusi**:
1. Download template dengan **Export CSV** dari course yang sudah ada
2. Pastikan header sesuai dengan tee boxes yang ada
3. Cek format data:
   - Hole: angka (1-18)
   - Par: angka (3-6)
   - Index: angka (1-18)
   - Section: "front9" atau "back9"
   - Distances: angka (dalam meter)

### Problem: Holes tidak tersimpan
**Penyebab**: Validasi gagal atau koneksi error

**Solusi**:
1. Cek semua field sudah diisi
2. Pastikan par antara 3-6
3. Pastikan index antara 1-totalHoles
4. Cek koneksi internet
5. Refresh halaman dan coba lagi

### Problem: Tee box tidak muncul di tournament
**Penyebab**: Course belum dipilih atau tee box tidak aktif

**Solusi**:
1. Pastikan course sudah dipilih di tournament form
2. Cek course masih dalam status **Active**
3. Verifikasi tee boxes sudah dikonfigurasi dengan benar

## 📞 Bantuan

Jika mengalami kesulitan:
1. Cek dokumentasi lengkap di `COURSE_MANAGEMENT_GUIDE.md`
2. Lihat implementation details di `COURSE_MANAGEMENT_IMPLEMENTATION.md`
3. Hubungi admin system untuk bantuan teknis

## 🎉 Selamat!

Anda sekarang sudah bisa mengelola lapangan golf dengan lengkap. Fitur ini akan sangat membantu dalam:
- Menghemat waktu setup tournament
- Menjaga konsistensi data
- Mengelola multiple courses dengan mudah
- Reuse configuration untuk tournament yang berbeda

Selamat menggunakan GolfScore ID! ⛳
