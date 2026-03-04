# Flight Scoring Overview - Halaman Scoring dengan Scorecard 18 Holes

## Deskripsi
Halaman baru yang menampilkan overview scoring untuk semua pemain dalam 1 flight yang sama. Halaman ini muncul sebelum input scoring individual, menampilkan scorecard lengkap 18 holes untuk setiap pemain, leaderboard flight, dan akses untuk input score.

## Fitur Utama

### 1. **Scorecard View - Single Table Format**
- **1 Tabel Besar** untuk semua pemain dalam flight
- Layout seperti scorecard golf tradisional
- Struktur tabel:
  - **Header Row 1**: Nomor hole (1-18) + Total + +/- + Action
  - **Header Row 2**: Par untuk setiap hole
  - **Player Rows**: Setiap pemain dengan score mereka
- Visual coding untuk score dengan warna bulat:
  - **Eagle (Par -2)**: Kuning dengan ring
  - **Birdie (Par -1)**: Merah dengan ring
  - **Par**: Biru
  - **Bogey (Par +1)**: Abu-abu gelap
  - **Double Bogey+ (Par +2)**: Abu-abu
  - **Belum main**: Tanda "-" abu-abu
- Kolom sticky:
  - **Player column** (kiri): Sticky untuk scroll horizontal
  - **Action column** (kanan): Sticky untuk akses mudah
- Total strokes dan score to par di setiap row
- Progress holes yang sudah dimainkan
- Highlight untuk pemain yang sedang login (background merah muda)
- Tombol "Input Score" hanya untuk pemain sendiri
- Legend warna di bawah tabel

### 2. **Leaderboard View**
- Ranking pemain dalam flight berdasarkan total strokes
- Menampilkan:
  - Posisi (1st = emas, 2nd = silver, 3rd = perunggu)
  - Nama pemain dan handicap
  - Total strokes
  - Score to par (warna: hijau untuk under par, merah untuk over par)
  - Progress holes yang sudah dimainkan
- Sorting otomatis berdasarkan performa

### 3. **Navigation Flow**
```
My Tournaments 
  → Tournament Detail 
    → Flight Scoring Overview (BARU!)
      → Input Scoring (per pemain)
```

## Struktur Data

### Flight Information
- Flight name dan nomor
- Start time dan start hole
- Daftar semua pemain dalam flight

### Player Scorecard
- 18 holes dengan par untuk setiap hole
- Score yang sudah diinput untuk setiap hole
- Total strokes dan score to par
- Jumlah holes yang sudah dimainkan

## Tema dan Desain

### Red Dark Theme
- Background: `from-[#1a1a1a] via-[#0f0f0f] to-black`
- Cards: `from-[#2e2e2e] via-[#171718] to-black`
- Primary button: `from-red-600 to-red-700`
- Border: `border-gray-800`
- Accent: Red untuk highlight dan icons

### Responsive Design
- Horizontal scroll untuk scorecard table (18 holes)
- Optimized untuk mobile dan desktop
- Touch-friendly buttons dan interactions

## Komponen

### File: `src/components/player/FlightScoringOverview.tsx`

#### Main Component
```typescript
FlightScoringOverview
- Fetch tournament details
- Fetch player's flight
- Fetch flight participants
- Tab switching (Scorecard / Leaderboard)
```

#### Sub Components
1. **ScorecardView**: Container untuk semua player scorecard cards
2. **PlayerScorecardCard**: Individual scorecard untuk setiap pemain
3. **LeaderboardView**: Ranking dan standings

## Queries Convex

### 1. Get Tournament Details
```typescript
api.tournaments.getTournamentDetails
- Input: tournamentId
- Output: Tournament info + holesConfig
```

### 2. Get Player Flight
```typescript
api.flights.getPlayerFlight
- Input: tournamentId, playerId
- Output: Flight info untuk pemain
```

### 3. Get Flight Details
```typescript
api.flights.getFlightDetails
- Input: flightId
- Output: Flight info + participants list
```

### 4. Get Player Scores
```typescript
api.scores.getPlayerScores
- Input: tournamentId, playerId
- Output: Array of scores dengan enrichment (par, classification, etc)
```

## Routes

### New Route
```typescript
{
  path: '/player/flight-scoring/:id',
  element: <FlightScoringOverview />
}
```

### Updated Navigation
- **TournamentDetail.tsx**: Button "Start Scoring" → `/player/flight-scoring/:id`
- **FlightScoringOverview.tsx**: Button "Input Score" → `/player/scoring/:id?playerId=xxx`

## User Experience

### Flow untuk Pemain
1. Buka "My Tournaments"
2. Klik tournament yang sedang aktif
3. Klik "Start Scoring" di Tournament Detail
4. **Melihat Flight Scoring Overview**:
   - Tab "Scorecard": Lihat scorecard semua pemain di flight
   - Tab "Leaderboard": Lihat ranking sementara
5. Klik "Input Score" pada card sendiri
6. Masuk ke halaman input scoring individual

### Keuntungan
- **Transparansi**: Pemain bisa lihat progress teman seflight
- **Kompetisi**: Leaderboard real-time dalam flight
- **Context**: Tahu posisi sebelum input score
- **Verifikasi**: Bisa cek scorecard sebelum input

## Visual Elements

### Scorecard Table - Single Table Format
```
┌──────────────┬────┬────┬────┬─────┬────┬───────┬──────┬──────────┐
│ Player       │ 1  │ 2  │ 3  │ ... │ 18 │ Total │ +/-  │ Action   │
├──────────────┼────┼────┼────┼─────┼────┼───────┼──────┼──────────┤
│ Par          │ 4  │ 3  │ 5  │ ... │ 4  │  72   │  E   │          │
├──────────────┼────┼────┼────┼─────┼────┼───────┼──────┼──────────┤
│ John Doe     │ 🔴4│ 🔵3│ 🟡4│ ... │ -  │  68   │ -4   │ [Input]  │
│ HCP: 12      │    │    │    │     │    │       │      │          │
├──────────────┼────┼────┼────┼─────┼────┼───────┼──────┼──────────┤
│ Jane Smith   │ 🔵4│ ⚫4│ 🔵5│ ... │ -  │  74   │ +2   │          │
│ HCP: 18      │    │    │    │     │    │       │      │          │
└──────────────┴────┴────┴────┴─────┴────┴───────┴──────┴──────────┘
```

### Table Features
- **Horizontal Scroll**: Untuk melihat semua 18 holes
- **Sticky Columns**: 
  - Player name (kiri) tetap terlihat saat scroll
  - Action button (kanan) tetap terlihat saat scroll
- **Color-coded Scores**: Bulat berwarna untuk setiap score
- **Current User Highlight**: Background merah muda untuk row pemain yang login

### Color Coding
- 🟡 Eagle (Par -2)
- 🔴 Birdie (Par -1)
- 🔵 Par (Even)
- ⚫ Bogey (Par +1)
- ⚫ Double+ (Par +2)

## Testing Checklist

- [ ] Flight data loading correctly
- [ ] Scorecard menampilkan 18 holes dengan benar
- [ ] Score colors sesuai dengan classification
- [ ] Leaderboard sorting benar
- [ ] Navigation ke input scoring berfungsi
- [ ] Highlight untuk current user
- [ ] Tab switching smooth
- [ ] Responsive di mobile dan desktop
- [ ] Real-time update ketika ada score baru

## Files Modified

1. **Created**: `src/components/player/FlightScoringOverview.tsx`
2. **Modified**: `src/routes/index.tsx` - Added new route
3. **Modified**: `src/components/player/TournamentDetail.tsx` - Updated navigation

## Next Steps

1. Test dengan data real di browser
2. Verify semua queries berfungsi
3. Test dengan multiple players dalam flight
4. Verify real-time updates
5. Test responsive design di berbagai device
6. Add loading states dan error handling jika diperlukan

## Notes

- Scorecard menggunakan horizontal scroll untuk 18 holes
- Leaderboard otomatis sort berdasarkan total strokes
- Pemain yang belum main akan muncul di bawah leaderboard
- Current user selalu di-highlight dengan border merah
- Button "Input Score" hanya muncul untuk pemain sendiri
