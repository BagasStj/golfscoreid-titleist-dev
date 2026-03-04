# Mobile Player Integration - Dokumentasi

## Overview
Integrasi lengkap komponen mobile player dengan database Convex untuk menampilkan data real-time dari backend.

## Komponen yang Diintegrasikan

### 1. TournamentList.tsx
**Fitur:**
- Menampilkan **SEMUA tournament** yang ada di database (tanpa filter user)
- Filter berdasarkan pencarian (nama/lokasi)
- Filter berdasarkan tanggal
- Statistik tournament (Total, Upcoming, Active)
- Banner image untuk setiap tournament
- Jumlah peserta real-time

**API yang Digunakan:**
- `api.tournaments.getAllTournaments` - Mengambil **SEMUA** tournament tanpa filter

**Data yang Ditampilkan:**
- Nama tournament
- Tanggal tournament
- Lokasi
- Status (upcoming/active/completed)
- Jumlah peserta / max peserta
- Banner image

**Catatan Penting:**
- Menu Tournament menampilkan **SEMUA** tournament yang ada di database
- Tidak ada filter berdasarkan user atau participation
- Semua player dapat melihat semua tournament yang tersedia

---

### 2. MyTournaments.tsx
**Fitur:**
- Menampilkan tournament yang diikuti oleh player
- Filter berdasarkan status (All, Upcoming, Active, Completed)
- Statistik personal (Terdaftar, Bermain, Selesai)
- Navigasi ke scoring interface untuk tournament aktif

**API yang Digunakan:**
- `api.tournaments.getTournaments` - Mengambil tournament player

**Data yang Ditampilkan:**
- Nama tournament
- Tanggal tournament
- Lokasi
- Status tournament
- Action button (Lihat Detail / Lanjutkan Bermain)

---

### 3. TournamentDetail.tsx
**Fitur:**
- Detail lengkap tournament
- Informasi lapangan (course type, game mode, tee box)
- Susunan acara (schedule)
- Informasi peserta
- Hadiah dan biaya registrasi
- Contact person

**API yang Digunakan:**
- `api.tournaments.getTournamentDetails` - Mengambil detail tournament lengkap

**Data yang Ditampilkan:**
- Nama dan deskripsi tournament
- Tanggal dan lokasi
- Status tournament
- Jumlah peserta
- Informasi lapangan (18 holes/F9/B9)
- Mode permainan (strokePlay/system36/stableford)
- Start hole
- Tee box (male/female)
- Schedule/agenda
- Hadiah dan biaya registrasi
- Contact person

---

### 4. NewsFeed.tsx
**Fitur:**
- Menampilkan berita dan update terbaru
- Filter berdasarkan target audience
- Kategori berita (Tournament, Tips, Berita, Announcement)
- Image upload untuk berita

**API yang Digunakan:**
- `api.news.getPublishedNews` - Mengambil berita yang sudah dipublish

**Data yang Ditampilkan:**
- Judul berita
- Excerpt/ringkasan
- Kategori
- Tanggal publish
- Image berita (jika ada)

---

### 5. MyProfile.tsx
**Fitur:**
- Profil player
- Statistik personal (tournaments, best score, avg score, handicap)
- Pencapaian terbaru
- Menu navigasi (Edit Profile, Riwayat, Statistik, Pengaturan, Bantuan)
- Logout functionality

**API yang Digunakan:**
- `api.tournaments.getTournaments` - Untuk statistik tournament
- `api.scores.getPlayerScores` - Untuk kalkulasi best score dan average
- `useAuth()` - Untuk data user dan logout

**Data yang Ditampilkan:**
- Nama player
- Email
- Total tournaments
- Best score (terendah)
- Average score
- Handicap
- Pencapaian terbaru dari completed tournaments

---

## API Convex yang Digunakan

### Tournament APIs
- `api.tournaments.getAllTournaments` - **SEMUA** tournament (tanpa filter) - digunakan di TournamentList
- `api.tournaments.getTournaments` - Tournament yang diikuti player - digunakan di MyTournaments
- `api.tournaments.getTournamentDetails` - Detail tournament lengkap

### News API
- `api.news.getPublishedNews` - Berita yang sudah dipublish

### Scores API
- `api.scores.getPlayerScores` - Score player untuk kalkulasi statistik

### Auth
- `useAuth()` - User authentication dan data user

---

## Struktur Data

### Tournament Object
```typescript
{
  _id: Id<"tournaments">,
  name: string,
  description: string,
  date: number, // timestamp
  location: string,
  status: 'upcoming' | 'active' | 'completed',
  courseType: '18holes' | 'F9' | 'B9',
  gameMode: 'strokePlay' | 'system36' | 'stableford',
  startHole: number,
  maleTeeBox?: 'Blue' | 'White' | 'Gold' | 'Black',
  femaleTeeBox?: 'Red' | 'White' | 'Gold',
  bannerUrl?: string,
  maxParticipants?: number,
  registrationFee?: string,
  prize?: string,
  contactPerson?: string,
  schedule?: string,
  participantCount?: number // calculated
}
```

### News Object
```typescript
{
  _id: Id<"news">,
  title: string,
  excerpt: string,
  content: string,
  category: 'Tournament' | 'Tips' | 'Berita' | 'Announcement',
  imageUrl?: string,
  publishedAt: number,
  isPublished: boolean,
  targetAudience: 'all' | 'players' | 'admins' | 'specific'
}
```

### User Object
```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  role: 'admin' | 'player',
  handicap?: number
}
```

---

## Loading States
Semua komponen memiliki loading state yang menampilkan spinner dan pesan loading saat data sedang diambil dari database.

## Error Handling
- Jika data tidak tersedia, komponen menampilkan pesan "Tidak ada data"
- Jika query gagal, Convex akan throw error yang bisa di-handle di level aplikasi

## Navigation Flow
1. **TournamentList** → **TournamentDetail** (klik tournament card)
2. **MyTournaments** → **TournamentDetail** (untuk upcoming/completed)
3. **MyTournaments** → **ScoringInterface** (untuk active tournament)
4. **TournamentDetail** → **ScoringInterface** (tombol "Mulai Bermain" untuk active tournament)

---

## Styling
Semua komponen menggunakan:
- Dark theme dengan gradient background
- Red accent color (#DC2626 - #B91C1C)
- Glassmorphism effect
- Responsive design untuk mobile
- Smooth transitions dan hover effects

---

## Future Enhancements
1. Pull-to-refresh functionality
2. Offline mode dengan caching
3. Push notifications untuk tournament updates
4. Real-time leaderboard updates
5. Social features (comments, likes)
6. Player statistics dashboard
7. Tournament registration flow
8. Payment integration

---

## Testing
Untuk testing komponen mobile:
1. Login sebagai player
2. Navigasi ke mobile layout
3. Test semua tab (Tournament, My Tournaments, News, Profile)
4. Verifikasi data ditampilkan dengan benar
5. Test filter dan search functionality
6. Test navigation antar halaman

---

## Dependencies
- React
- React Router DOM
- Convex (untuk database queries)
- AuthContext (untuk user authentication)

---

Dibuat: 10 Februari 2026
Update Terakhir: 10 Februari 2026
