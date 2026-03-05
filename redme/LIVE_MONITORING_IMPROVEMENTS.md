# Peningkatan Live Monitoring Dashboard

## Perubahan yang Dilakukan

### 1. Bahasa Indonesia
- Semua teks UI telah diubah ke Bahasa Indonesia
- Label, header, dan pesan telah diterjemahkan

### 2. Kolom Tambahan

#### Total Stroke
- Menampilkan total pukulan pemain
- Kolom dengan background biru (TOTAL)

#### Total Over/Under Par
- Menampilkan selisih skor dengan par
- Format: `+3` (over par), `E` (even/par), `-2` (under par)
- Kolom dengan background ungu (OVER)

#### Jumlah Hole Complete
- Menampilkan jumlah hole yang sudah diselesaikan
- Format: `5/18` atau `3/9` tergantung jenis course
- Kolom dengan background orange (SELESAI)

### 3. Export ke Excel
- Tombol "Export Excel" di header dashboard
- Export data mencakup:
  - Nama pemain
  - Hole mulai dan saat ini
  - Hole selesai
  - Total stroke
  - Total over/under
  - Skor per hole (sesuai tab aktif)
- File Excel otomatis dinamai dengan format: `{TournamentName}_Live_Monitoring_{Date}.xlsx`

### 4. Full View Mode
- Tombol "Full View" untuk tampilan layar penuh
- Mode full screen dengan overlay z-50
- Tombol "Tutup" untuk keluar dari full view
- Berguna untuk presentasi atau monitoring di layar besar

### 5. Fitur Tambahan pada Special Holes Tab
- Kolom Total Over/Under untuk hole spesial saja
- Kolom Hole Selesai untuk hole spesial
- Perhitungan terpisah untuk statistik hole spesial

## Cara Penggunaan

### Export Excel
1. Buka Live Monitoring Dashboard
2. Pilih tab yang ingin di-export (All Holes atau Special Holes)
3. Klik tombol "Export Excel" di kanan atas
4. File akan otomatis terdownload

### Full View
1. Klik tombol "Full View" di kanan atas
2. Dashboard akan tampil dalam mode layar penuh
3. Klik "Tutup" untuk kembali ke tampilan normal

### Membaca Statistik
- **TOTAL**: Total pukulan yang sudah dilakukan
- **OVER**: Selisih dengan par (+3 = 3 over par, E = even par, -2 = 2 under par)
- **SELESAI**: Jumlah hole yang sudah diselesaikan dari total hole

## Teknologi
- Library: `xlsx` untuk export Excel
- React hooks: `useState` untuk state management
- Lucide icons: `Download`, `Maximize2` untuk UI icons
