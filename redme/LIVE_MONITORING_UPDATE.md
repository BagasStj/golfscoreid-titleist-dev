# Live Monitoring Dashboard Update

## Overview
Live Monitoring Dashboard telah diperbarui untuk menampilkan tournament yang sedang active secara otomatis dan menampilkan 2 mode leaderboard real-time.

## Fitur Baru

### 1. Auto-Select Active Tournament
- Dashboard otomatis menampilkan tournament pertama yang berstatus "active"
- Tidak perlu lagi memilih tournament secara manual
- Jika tidak ada tournament active, akan menampilkan pesan "No Active Tournament"

### 2. Dual Leaderboard Mode
Dashboard sekarang menampilkan 2 mode leaderboard:

#### Mode 1: All Holes Leaderboard
- Menampilkan ranking berdasarkan semua holes yang dimainkan
- Menghitung total score/points dari semua holes
- Default view saat membuka dashboard

#### Mode 2: Special Holes Leaderboard
- Menampilkan ranking berdasarkan special scoring holes saja
- Hanya muncul jika tournament memiliki special holes yang dikonfigurasi
- Menghitung score/points hanya dari holes yang ditandai sebagai special

### 3. Real-time Updates
- Leaderboard update secara real-time menggunakan Convex reactive queries
- Menampilkan progress setiap player (holes completed, current hole)
- Progress bar visual untuk setiap player
- Live indicator dengan animasi pulse

## UI/UX Improvements

### Header Section
- Gradient background dengan informasi tournament
- Menampilkan course type, game mode, dan jumlah players
- Live indicator dengan animasi

### View Mode Toggle
- Toggle button untuk switch antara "All Holes" dan "Special Holes"
- Hanya muncul jika tournament memiliki special holes
- Smooth transition saat switch mode

### Leaderboard Display
- Ranking dengan badge berwarna (Gold, Silver, Bronze untuk top 3)
- Emoji medal untuk top 3 players
- Player name, holes completed, dan current hole
- Score display sesuai game mode (strokes atau points)
- Progress bar untuk setiap player
- Gradient background untuk top 3 positions

## Technical Changes

### Frontend (`src/components/admin/LiveMonitoringDashboard.tsx`)
```typescript
// Tidak lagi menerima tournamentId sebagai prop
export default function LiveMonitoringDashboard()

// Auto-fetch active tournaments
const activeTournaments = tournaments?.filter((t) => t.status === 'active') || [];
const selectedTournament = activeTournaments[0];

// Dual mode state
const [viewMode, setViewMode] = useState<'all' | 'special'>('all');

// Conditional leaderboard data
const currentLeaderboard = viewMode === 'all' 
  ? leaderboardData.allHolesRanking 
  : leaderboardData.hiddenHolesRanking || [];
```

### Backend (`convex/leaderboard.ts`)
```typescript
// Renamed function untuk clarity
calculateSpecialHolesRanking() // Previously calculateHiddenHolesRanking()

// Updated query to use specialScoringHoles
if (tournament.specialScoringHoles && tournament.specialScoringHoles.length > 0) {
  hiddenHolesRanking = await calculateSpecialHolesRanking(
    ctx,
    args.tournamentId,
    tournament.specialScoringHoles,
    tournament.gameMode as GameMode
  );
}
```

### AdminDashboard Integration
```typescript
// Simplified - no need to check for selectedTournamentId
case 'monitoring':
  return <LiveMonitoringDashboard />;
```

## Game Mode Support

### Stroke Play
- Lower score is better
- Display: "X strokes"
- Sorting: Ascending

### Stableford
- Higher points is better
- Display: "X pts"
- Sorting: Descending

### System 36
- Higher points is better
- Display: "X pts"
- Sorting: Descending

## Responsive Design
- Mobile-friendly layout
- Responsive grid for leaderboard entries
- Touch-friendly toggle buttons
- Optimized for all screen sizes

## Usage

### Admin View
1. Navigate to "Live Monitoring" dari sidebar
2. Dashboard otomatis menampilkan active tournament
3. Jika ada special holes, toggle button akan muncul
4. Switch antara "All Holes" dan "Special Holes" untuk melihat ranking berbeda
5. Monitor progress setiap player secara real-time

### Data Flow
```
Active Tournament → Leaderboard Query → Monitoring Query
                 ↓
         All Holes Ranking
                 ↓
    Special Holes Ranking (if configured)
                 ↓
         Real-time Display
```

## Benefits
1. **Simplified UX**: Tidak perlu select tournament manual
2. **Dual Insights**: Lihat ranking dari 2 perspektif berbeda
3. **Real-time**: Update otomatis tanpa refresh
4. **Visual Feedback**: Progress bars dan live indicators
5. **Flexible**: Support semua game modes (Stroke Play, Stableford, System 36)

## Future Enhancements
- Multi-tournament monitoring (split screen)
- Player detail modal on click
- Export leaderboard to PDF/Excel
- Push notifications untuk score updates
- Historical comparison charts
