# Leaderboard Admin - Detailed Scorecard Implementation

## Overview
LeaderboardAdmin sekarang menampilkan detailed scorecard dengan hole-by-hole breakdown, mirip dengan Live Monitoring Dashboard.

## Fitur Utama

### 1. Tournament Selector
- Menampilkan daftar semua tournament yang tersedia
- User dapat memilih tournament untuk melihat leaderboard-nya
- Menampilkan status tournament (active, upcoming, completed)

### 2. Detailed Scorecard Table - All Holes
Menampilkan tabel lengkap dengan:
- **Rank & Player Info**: Rank badge dengan medal icons untuk top 3
- **Hole-by-Hole Scores**: Score untuk setiap hole dengan color coding:
  - 🟢 **Hijau**: Birdie atau lebih baik (under par)
  - ⚪ **Abu-abu**: Par
  - 🟡 **Kuning**: Bogey (+1)
  - 🔴 **Merah**: Double bogey atau lebih buruk (+2+)
- **OUT/IN Totals**: Untuk 18 holes, menampilkan total front 9 dan back 9
- **Total Score**: Total keseluruhan
- **PAR Row**: Baris referensi par untuk setiap hole

### 3. Special Holes Scorecard
Jika tournament memiliki special scoring holes:
- **Tab Toggle**: Switch antara "All Holes" dan "Special Holes"
- **Special Holes Table**: Menampilkan hanya holes yang ditandai sebagai special
- **Amber Theme**: Menggunakan warna amber untuk membedakan dari all holes
- **Star Icons**: Menandai special holes dengan icon bintang
- **Special Total**: Total score hanya untuk special holes

### 4. Visual Features
- **Sticky Column**: Kolom player tetap terlihat saat scroll horizontal
- **Responsive Design**: Horizontal scroll untuk tabel besar
- **Live Update Indicator**: Menunjukkan data auto-refresh
- **Score Legend**: Panduan warna score di bagian bawah
- **Top 3 Highlighting**: Background highlight untuk top 3 players

### 5. Debug & Error Handling
- Debug console logs untuk troubleshooting
- Empty state dengan informasi status tournament
- Loading states dengan skeleton screens
- Error handling dengan pesan yang jelas

## Backend Changes

### New Query: `getDetailedLeaderboard`
```typescript
// Returns detailed player data with scorecard
{
  tournament: Tournament,
  holesConfig: HoleConfig[],
  players: [{
    playerId: Id<"users">,
    playerName: string,
    totalScore: number,
    holesCompleted: number,
    rank: number,
    scorecard: [{
      holeNumber: number,
      par: number,
      strokes: number | null
    }]
  }],
  gameMode: GameMode,
  courseType: CourseType
}
```

### Debug Query: `debugTournamentData`
Untuk troubleshooting, mengembalikan:
- Tournament info
- Participants count & list
- Scores count & list
- Holes config count

## Usage

### Admin Dashboard
```typescript
<LeaderboardAdmin tournamentId={selectedTournamentId} />
```

### Standalone
```typescript
<LeaderboardAdmin />
// Will show tournament selector first
```

## Color Coding Logic

```typescript
const getScoreColor = (strokes: number | null, par: number) => {
  if (strokes === null) return '';
  if (strokes < par) return 'bg-green-100 text-green-800 font-bold'; // Birdie+
  if (strokes === par) return 'bg-gray-100 text-gray-800';           // Par
  if (strokes === par + 1) return 'bg-yellow-100 text-yellow-800';   // Bogey
  return 'bg-red-100 text-red-800';                                   // Double+
};
```

## Special Holes Feature

Special holes adalah fitur untuk membuat leaderboard terpisah berdasarkan hole-hole tertentu yang dipilih admin saat membuat tournament. Ini berguna untuk:
- Kompetisi khusus pada hole-hole tertentu
- Hadiah tambahan untuk performa di hole spesifik
- Analisis performa pada hole-hole sulit

## Technical Details

### State Management
- `selectedTournamentId`: Tournament yang sedang ditampilkan
- `activeTab`: 'all' atau 'special' untuk toggle view

### Data Flow
1. User memilih tournament dari selector
2. Query `getDetailedLeaderboard` dipanggil dengan tournamentId
3. Data di-render dalam tabel dengan color coding
4. Auto-refresh melalui Convex real-time updates

### Performance
- Sticky positioning untuk kolom player
- Efficient rendering dengan proper keys
- Minimal re-renders dengan proper state management

## Future Enhancements
- Export to PDF/Excel
- Print-friendly view
- Filter by player
- Sort by different columns
- Historical comparison
- Statistics summary
