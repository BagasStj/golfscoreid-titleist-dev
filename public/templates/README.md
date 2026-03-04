# Flight Upload Template - Panduan Penggunaan

## 📋 Cara Menggunakan Template

### 1. Download Template
- Download file `flight-upload-template.csv` atau gunakan tombol "Download Template" di aplikasi
- Buka file dengan Microsoft Excel, Google Sheets, atau aplikasi spreadsheet lainnya

### 2. Format Kolom

| Kolom            | Wajib? | Format      | Contoh                    | Keterangan                           |
|------------------|--------|-------------|---------------------------|--------------------------------------|
| Flight Name      | ✅ Ya  | Text        | Flight A                  | Nama flight (bebas)                  |
| Flight Number    | ✅ Ya  | Angka       | 1                         | Nomor urut flight (unique)           |
| Start Time       | ❌ Tidak| HH:MM      | 08:00                     | Waktu mulai (opsional)               |
| Start Hole       | ✅ Ya  | Angka 1-18  | 1                         | Hole mulai                           |
| Player Name      | ✅ Ya  | Text        | John Doe                  | Nama lengkap pemain                  |
| Player Email     | ✅ Ya  | Email       | john.doe@example.com      | Email pemain (harus unique)          |
| Player Handicap  | ❌ Tidak| Angka      | 12                        | Handicap pemain (opsional)           |

### 3. Aturan Penting

#### ✅ DO (Lakukan):
- Gunakan email yang valid dan unique untuk setiap pemain
- Pastikan Flight Number tidak duplikat dalam satu tournament
- Start Hole harus antara 1-18
- Satu flight bisa punya banyak pemain (multiple rows dengan Flight Name & Number yang sama)
- Gunakan format waktu HH:MM (contoh: 08:00, 14:30)

#### ❌ DON'T (Jangan):
- Jangan kosongkan kolom yang wajib diisi
- Jangan gunakan email yang sama untuk pemain berbeda
- Jangan gunakan Flight Number yang sama untuk flight berbeda
- Jangan merge cells di Excel
- Jangan ubah nama kolom header

### 4. Contoh Data

#### Contoh 1: Tournament dengan 3 Flights
```
Flight Name | Flight Number | Start Time | Start Hole | Player Name      | Player Email              | Player Handicap
------------|---------------|------------|------------|------------------|---------------------------|----------------
Flight A    | 1             | 08:00      | 1          | John Doe         | john.doe@example.com      | 12
Flight A    | 1             | 08:00      | 1          | Jane Smith       | jane.smith@example.com    | 15
Flight A    | 1             | 08:00      | 1          | Bob Wilson       | bob.wilson@example.com    | 8
Flight A    | 1             | 08:00      | 1          | Alice Brown      | alice.brown@example.com   | 20
Flight B    | 2             | 08:10      | 1          | Charlie Davis    | charlie.davis@example.com | 10
Flight B    | 2             | 08:10      | 1          | Diana Evans      | diana.evans@example.com   | 18
Flight B    | 2             | 08:10      | 1          | Frank Miller     | frank.miller@example.com  | 14
Flight B    | 2             | 08:10      | 1          | Grace Taylor     | grace.taylor@example.com  | 22
Flight C    | 3             | 08:20      | 10         | Henry Anderson   | henry.anderson@example.com| 16
Flight C    | 3             | 08:20      | 10         | Ivy Thomas       | ivy.thomas@example.com    | 11
Flight C    | 3             | 08:20      | 10         | Jack Martinez    | jack.martinez@example.com | 9
Flight C    | 3             | 08:20      | 10         | Kelly Garcia     | kelly.garcia@example.com  | 25
```

#### Contoh 2: Shotgun Start (Semua flight mulai bersamaan)
```
Flight Name | Flight Number | Start Time | Start Hole | Player Name    | Player Email           | Player Handicap
------------|---------------|------------|------------|----------------|------------------------|----------------
Flight 1    | 1             | 08:00      | 1          | Player 1       | player1@example.com    | 10
Flight 1    | 1             | 08:00      | 1          | Player 2       | player2@example.com    | 12
Flight 2    | 2             | 08:00      | 4          | Player 3       | player3@example.com    | 15
Flight 2    | 2             | 08:00      | 4          | Player 4       | player4@example.com    | 8
Flight 3    | 3             | 08:00      | 7          | Player 5       | player5@example.com    | 18
Flight 3    | 3             | 08:00      | 7          | Player 6       | player6@example.com    | 14
```

### 5. Langkah Upload

1. **Isi Data**: Lengkapi semua data sesuai format di atas
2. **Save File**: Simpan file Excel (.xlsx atau .xls)
3. **Buka Aplikasi**: Login sebagai admin
4. **Flight Management**: Buka menu Flight Management
5. **Pilih Tournament**: Pilih tournament yang akan diisi flights
6. **Excel Upload**: Klik tombol "Excel Upload"
7. **Select File**: Pilih file Excel yang sudah diisi
8. **Preview**: Review data yang akan diupload
9. **Upload**: Klik "Upload Flights" untuk proses

### 6. Troubleshooting

#### Error: "Invalid email format"
**Solusi**: Pastikan email menggunakan format yang benar (contoh@domain.com)

#### Error: "Flight number already exists"
**Solusi**: Gunakan nomor flight yang berbeda atau hapus flight yang sudah ada

#### Error: "Player already registered"
**Solusi**: Pemain sudah terdaftar di tournament ini, hapus dari Excel atau dari tournament

#### Error: "Start Hole must be between 1 and 18"
**Solusi**: Pastikan start hole antara 1-18

#### Error: "Failed to parse Excel file"
**Solusi**: 
- Download template baru
- Copy data Anda ke template baru
- Pastikan tidak ada merged cells
- Save sebagai .xlsx atau .xls

### 7. Tips & Best Practices

✅ **Persiapan Data**
- Siapkan data pemain terlebih dahulu (nama, email, handicap)
- Tentukan pembagian flight sebelum input
- Pastikan email semua pemain sudah benar

✅ **Input Data**
- Gunakan copy-paste untuk data yang sama (Flight Name, Number, Time, Hole)
- Double check email tidak ada typo
- Verify handicap sesuai data resmi

✅ **Sebelum Upload**
- Review semua data sekali lagi
- Check tidak ada baris kosong di tengah data
- Pastikan jumlah pemain per flight sesuai rencana

✅ **Setelah Upload**
- Verify di Flight Management semua flight sudah muncul
- Check jumlah pemain per flight sudah benar
- Test login salah satu pemain untuk memastikan

### 8. Keuntungan Upload Excel

✅ **Efisien**: Upload puluhan pemain sekaligus dalam hitungan detik
✅ **Akurat**: Mengurangi kesalahan input manual
✅ **Cepat**: Tidak perlu input satu-satu
✅ **Otomatis**: System otomatis create/update player data
✅ **Validasi**: Error langsung terdeteksi sebelum upload

### 9. Support

Jika mengalami kesulitan:
1. Baca panduan ini dengan teliti
2. Download template baru dan coba lagi
3. Check contoh data di atas
4. Hubungi admin support

---

**Happy Uploading! ⛳️🏌️**
