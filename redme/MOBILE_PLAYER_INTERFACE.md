# Mobile Player Interface

## Overview
Tampilan mobile baru untuk player dengan tema red dark yang responsive dan modern, mengikuti desain dari halaman login/registration.

## Struktur Komponen

### 1. MobileLayout (Main Container)
- **Location**: `src/components/player/mobile/MobileLayout.tsx`
- **Features**:
  - Fixed header dengan logo dan profile button
  - Bottom navigation dengan 4 menu utama
  - Responsive container untuk konten

### 2. Tournament List (Default Page)
- **Location**: `src/components/player/mobile/TournamentList.tsx`
- **Features**:
  - Stats cards (Total Tournaments, Registered, Completed)
  - Search bar untuk mencari tournament
  - Date filter untuk filter berdasarkan tanggal
  - List tournament dengan card design yang menarik
  - Informasi: judul, tanggal, lokasi, jumlah peserta
  - Status badge (Upcoming, Ongoing, Completed)

### 3. Tournament Detail
- **Location**: `src/components/player/mobile/TournamentDetail.tsx`
- **Features**:
  - Banner tournament
  - Informasi lengkap tournament
  - Info cards (Tanggal, Lokasi, Peserta, Hadiah)
  - Biaya registrasi dan contact person
  - Timeline susunan acara dengan visual menarik
  - Button untuk daftar tournament

### 4. My Tournaments
- **Location**: `src/components/player/mobile/MyTournaments.tsx`
- **Features**:
  - Stats header (Terdaftar, Bermain, Selesai)
  - Filter tabs (Semua, Terdaftar, Bermain, Selesai)
  - List tournament yang diikuti
  - Score dan ranking untuk tournament yang selesai
  - Quick action buttons

### 5. News Feed
- **Location**: `src/components/player/mobile/NewsFeed.tsx`
- **Features**:
  - Header dengan deskripsi
  - List berita dengan gambar
  - Category badges (Tournament, Tips, Berita)
  - Tanggal publikasi
  - Load more button

### 6. My Profile
- **Location**: `src/components/player/mobile/MyProfile.tsx`
- **Features**:
  - Profile header dengan avatar
  - Stats grid (Tournaments, Best Score, Avg Score, Handicap)
  - Achievements section
  - Menu items (Edit Profile, Riwayat, Statistik, Pengaturan, Bantuan)
  - Logout button
  - App version info

## Bottom Navigation Menu

1. **Tournament** - Daftar semua tournament yang tersedia
2. **My Tournaments** - Tournament yang diikuti player
3. **News Feed** - Berita dan update terbaru
4. **My Profile** - Profil dan pengaturan player

## Routing

- `/player` - Mobile Layout (default: Tournament List)
- `/player/tournament/:id` - Tournament Detail
- `/player/scoring/:id` - Scoring Interface (existing)

## Design Theme

- **Primary Color**: Red (#7f1d1d, #991b1b, #b91c1c)
- **Background**: Dark gradient (gray-900, red-950)
- **Text**: White, red-200, red-300, red-400
- **Borders**: red-700, red-800, red-900
- **Shadows**: Soft shadows untuk depth

## Mobile Optimizations

- Touch-friendly tap targets (min 44px)
- Smooth scrolling dengan `-webkit-overflow-scrolling: touch`
- Prevent pull-to-refresh dengan `overscroll-behavior`
- Fixed header dan bottom navigation
- Responsive grid layouts
- Optimized images

## Data Flow

Saat ini menggunakan dummy data. Untuk integrasi dengan backend:
1. Replace dummy data dengan Convex queries
2. Add loading states
3. Add error handling
4. Implement real-time updates

## Next Steps

1. Integrate dengan Convex backend
2. Add real tournament data
3. Implement tournament registration
4. Add news feed CMS
5. Implement profile editing
6. Add push notifications
7. Implement offline support
