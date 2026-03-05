# Fitur Scoring Player Lain

## Deskripsi
Fitur ini memungkinkan player untuk menginput skor player lain yang berada dalam flight yang sama. Player dapat memilih siapa yang akan diinput skornya langsung dari halaman scoring interface.

## Cara Kerja

### 1. Akses Halaman Scoring
- Buka halaman Flight Scoring Overview (`/player/flight-scoring/:id`)
- Klik tombol "Input Skor Saya" untuk membuka halaman scoring
- Atau akses langsung melalui detail tournament

### 2. Memilih Player
- Di halaman scoring, terdapat tombol selector player di bagian atas (di bawah header)
- Tombol menampilkan nama player yang sedang diinput skornya
- Klik tombol tersebut untuk membuka modal pemilihan player
- Modal menampilkan semua player dalam flight yang sama
- Player yang sedang dipilih ditandai dengan checkmark biru
- Player yang sedang login ditandai dengan label "(Anda)"

### 3. Input Skor
- Setelah memilih player, halaman akan reset ke hole pertama
- Label "YOUR STROKES" akan berubah menjadi "[NAMA PLAYER]'S STROKES" jika menginput untuk player lain
- Proses input skor sama seperti biasa
- Skor akan tersimpan untuk player yang dipilih

### 4. Ganti Player
- Kapan saja bisa klik tombol selector player untuk mengganti player yang akan diinput
- Saat mengganti player, halaman akan reset ke hole pertama
- Skor yang sudah diinput untuk player sebelumnya tetap tersimpan

## Perubahan dari Versi Sebelumnya

### Yang Dihapus:
- Kolom "Aksi" dengan tombol "Input" di tabel Flight Scoring Overview
- Dialog konfirmasi saat akan input skor player lain
- Navigasi langsung dari tabel ke halaman scoring

### Yang Ditambahkan:
- Player selector button di halaman scoring
- Modal pemilihan player dengan daftar semua player dalam flight
- Visual indicator untuk player yang sedang dipilih
- Auto-reset ke hole pertama saat ganti player

## Authorization & Security

### Backend Authorization
- Player hanya bisa menginput/update skor untuk player yang berada dalam flight yang sama
- Sistem akan memeriksa apakah kedua player (yang menginput dan yang diinput) berada dalam flight yang sama
- Jika tidak dalam flight yang sama, akan muncul error: "Authorization Error: You can only input scores for players in your flight"

### Frontend
- Hanya menampilkan player yang berada dalam flight yang sama
- Player selector hanya menampilkan participant dari flight yang sama dengan user yang login

## File yang Dimodifikasi

### Frontend
1. `src/components/player/ModernScoringInterface.tsx`
   - Menambahkan state `showPlayerSelector` untuk modal pemilihan player
   - Menambahkan state `targetPlayerId` yang bisa diubah
   - Menambahkan query `playerFlight` dan `flightDetails` untuk mendapatkan daftar player dalam flight
   - Menambahkan player selector button di header
   - Menambahkan modal pemilihan player dengan daftar semua participant
   - Menambahkan fungsi `handlePlayerChange` untuk mengganti player yang dipilih
   - Auto-reset ke hole pertama saat ganti player

2. `src/components/player/FlightScoringOverview.tsx`
   - Menghapus kolom "Aksi" dari tabel scorecard
   - Menghapus tombol "Input" untuk setiap player
   - Menghapus dialog konfirmasi
   - Menghapus fungsi `handleInputScoreClick` dan `handleConfirmInputScore`
   - Menghapus state `selectedPlayer` dan `showConfirmDialog`

### Backend
1. `convex/scores.ts`
   - Menambahkan mutation `submitScoreForPlayer`: Submit skor untuk player lain
   - Menambahkan mutation `updateScoreForPlayer`: Update skor player lain
   - Kedua mutation memiliki authorization check untuk memastikan player dalam flight yang sama

2. `convex/users.ts`
   - Menambahkan query `getUser`: Mendapatkan informasi user berdasarkan ID

## API Reference

### submitScoreForPlayer
```typescript
{
  tournamentId: Id<"tournaments">,
  scoringUserId: Id<"users">,      // User yang menginput skor
  targetPlayerId: Id<"users">,     // Player yang skornya diinput
  holeNumber: number,
  strokes: number,
}
```

### updateScoreForPlayer
```typescript
{
  scoreId: Id<"scores">,
  scoringUserId: Id<"users">,      // User yang mengupdate skor
  targetPlayerId: Id<"users">,     // Player yang skornya diupdate
  newStrokes: number,
}
```

### getUser
```typescript
{
  userId: Id<"users">
}
```

## Testing

### Test Case 1: Memilih dan Input Skor Player Lain
1. Login sebagai Player A
2. Buka tournament yang aktif
3. Klik "Input Skor Saya"
4. Klik tombol player selector di atas
5. Pilih Player B dari modal
6. Verifikasi label berubah menjadi "PLAYER B'S STROKES"
7. Input skor untuk Player B
8. Verifikasi skor tersimpan untuk Player B

### Test Case 2: Ganti Player di Tengah Input
1. Login sebagai Player A
2. Buka halaman scoring
3. Input beberapa hole untuk diri sendiri
4. Klik player selector dan pilih Player B
5. Verifikasi halaman reset ke hole pertama
6. Input skor untuk Player B
7. Klik player selector lagi dan pilih Player A
8. Verifikasi skor Player A yang sudah diinput sebelumnya masih ada

### Test Case 3: Coba Akses dengan playerId dari Flight Berbeda
1. Login sebagai Player A
2. Coba akses URL scoring dengan playerId dari player di flight berbeda
3. Verifikasi muncul error authorization saat submit skor

## UI/UX Improvements

### Keuntungan Desain Baru:
1. Lebih intuitif - player bisa langsung melihat dan memilih siapa yang akan diinput
2. Tidak perlu bolak-balik antara overview dan scoring page
3. Lebih cepat - tidak ada dialog konfirmasi yang mengganggu
4. Visual yang lebih baik - modal dengan daftar player yang jelas
5. Lebih fleksibel - bisa ganti player kapan saja tanpa keluar dari halaman scoring

### Visual Indicators:
- Player yang sedang dipilih: Checkmark biru + background biru
- Player yang sedang login: Label "(Anda)" berwarna biru
- Player selector button: Background biru dengan border, menampilkan nama player yang sedang dipilih

## Catatan Penting
- Fitur ini memerlukan kepercayaan antar player dalam satu flight
- Skor yang diinput akan langsung tersimpan dan mempengaruhi leaderboard
- Player dapat mengedit skor yang sudah diinput (baik skor sendiri maupun skor player lain dalam flight yang sama)
- Saat mengganti player, halaman akan reset ke hole pertama untuk menghindari kebingungan
- Modal player selector hanya menampilkan player dalam flight yang sama
