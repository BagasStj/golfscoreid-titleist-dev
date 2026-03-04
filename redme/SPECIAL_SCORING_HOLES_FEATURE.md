# Special Scoring Holes Feature

## Overview
Tournament sekarang mendukung **Special Scoring Holes** - fitur yang memungkinkan tournament memiliki 2 leaderboard:
1. **Overall Leaderboard** - Penilaian dari semua hole
2. **Special Holes Leaderboard** - Penilaian hanya dari hole-hole tertentu yang dipilih

## Implementasi

### 1. Database Schema (convex/schema.ts)
```typescript
tournaments: defineTable({
  // ... fields lainnya
  specialScoringHoles: v.optional(v.array(v.number())), // Holes dengan penilaian khusus
})
```

### 2. Convex Mutation (convex/tournaments.ts)
- `createTournament` sekarang menerima parameter `specialScoringHoles` (optional)
- Validasi hole numbers berdasarkan course type:
  - 18holes: 1-18
  - F9: 1-9
  - B9: 10-18

### 3. TypeScript Types (src/types/index.ts)
```typescript
export interface Tournament {
  // ... fields lainnya
  specialScoringHoles?: number[];
}
```

### 4. UI Component (TournamentCreationForm.tsx)
- Multiple select dengan button grid untuk memilih hole
- Dinamis berdasarkan course type yang dipilih
- Visual feedback untuk hole yang dipilih (hijau)
- Summary box menampilkan hole yang dipilih

## Cara Penggunaan

### Membuat Tournament dengan Special Scoring Holes:

1. Isi form tournament seperti biasa
2. Pilih **Course Type** (18holes, F9, atau B9)
3. Di bagian **Special Scoring Holes**:
   - Klik nomor hole yang ingin dijadikan special scoring
   - Hole yang dipilih akan berubah warna menjadi hijau
   - Klik lagi untuk unselect
4. Selected holes akan ditampilkan di summary box biru
5. Submit form

### Contoh Use Case:

**Scenario 1: Par 3 Challenge**
- Pilih semua hole par 3 (misalnya: 3, 7, 12, 16)
- Tournament akan memiliki leaderboard khusus untuk performa di par 3

**Scenario 2: Back 9 Pressure**
- Pilih hole 10-18
- Leaderboard khusus untuk performa di back 9

**Scenario 3: Signature Holes**
- Pilih hole-hole signature course (misalnya: 5, 9, 13, 18)
- Leaderboard khusus untuk hole-hole paling menantang

## Validasi

- Hole numbers divalidasi berdasarkan course type
- 18holes: hanya bisa pilih 1-18
- F9: hanya bisa pilih 1-9
- B9: hanya bisa pilih 10-18
- Special scoring holes bersifat optional (boleh kosong)

## Next Steps

Untuk mengimplementasikan dual leaderboard, perlu update:
1. `convex/leaderboard.ts` - Tambah query untuk special holes leaderboard
2. `LeaderboardAdmin.tsx` - Tampilkan 2 leaderboard jika ada special holes
3. `PlayerLeaderboard.tsx` - Tampilkan 2 leaderboard untuk player view

## Status
✅ Database schema updated
✅ Convex mutation updated dengan validasi
✅ TypeScript types updated
✅ UI component dengan multiple select
✅ Form validation
✅ Visual feedback dan summary
