# My Tournaments - Accepted Player View

## Ringkasan Perubahan

Memodifikasi halaman MyTournaments agar player dengan status "accepted" (paidStatus === "paid") dapat melihat semua tournament yang berlangsung, dengan tampilan yang berbeda tergantung apakah mereka sudah terdaftar dan memiliki flight atau belum.

## Logika Tampilan

### 1. Player BELUM Accepted (`paidStatus !== "paid"`)
- **Tampilan**: Halaman kosong dengan pesan "Belum ada turnamen"
- **Alasan**: Player yang belum accepted tidak berhak melihat tournament apapun

### 2. Player SUDAH Accepted (`paidStatus === "paid"`)

#### A. Tournament yang Player Sudah Terdaftar DAN Punya Flight
- **Tampilan**: FULL DETAIL (seperti existing)
  - Header tournament dengan status badge
  - Info tournament (tanggal, lokasi, course type)
  - Quick info (tampilan skor, total par)
  - Informasi Flight Anda (flight name, start time, start hole, members)
  - Semua Peserta Turnamen (tabel lengkap)
  - Action buttons (Mulai/Lanjutkan Scoring)

#### B. Tournament yang Player Belum Terdaftar ATAU Belum Punya Flight
- **Tampilan**: SIMPLIFIED VIEW (versi sederhana)
  - Header tournament dengan status badge
  - Info tournament (tanggal, lokasi, course type)
  - Quick info (tampilan skor, total par)
  - **TIDAK ADA**: Flight info, participant list, action buttons

## File yang Dimodifikasi

### 1. `src/components/player/mobile/MyTournaments.tsx`

**Perubahan Utama:**

```typescript
const MyTournaments: React.FC = () => {
  const { user } = useAuth();
  
  // Get player data to check paidStatus
  const playerData = useQuery(
    api.users.getPlayerById,
    user ? { playerId: user._id } : "skip",
  );

  // Get player's registered tournaments
  const myTournaments = useQuery(
    api.tournaments.getTournaments,
    user ? { userId: user._id } : "skip",
  );

  // Get all active tournaments if player is accepted
  const allActiveTournaments = useQuery(
    api.tournaments.getAllActiveTournaments,
    playerData?.paidStatus === "paid" ? {} : "skip",
  );

  // If player is not accepted, show nothing
  if (playerData.paidStatus !== "paid") {
    return <EmptyState />;
  }

  // Merge registered tournaments with all active tournaments
  let tournamentsToShow = [];
  if (allActiveTournaments) {
    const registeredIds = new Set(myTournaments.map(t => t._id));
    const additionalTournaments = allActiveTournaments.filter(
      t => !registeredIds.has(t._id)
    );
    tournamentsToShow = [...myTournaments, ...additionalTournaments];
  }

  return (
    <div>
      {tournamentsToShow.map((tournament) => {
        const isRegistered = myTournaments.some(t => t._id === tournament._id);
        return (
          <TournamentCard
            key={tournament._id}
            tournament={tournament}
            userId={user?._id}
            navigate={navigate}
            isRegistered={isRegistered}
          />
        );
      })}
    </div>
  );
};
```

**TournamentCard Component:**

```typescript
const TournamentCard: React.FC<{
  tournament: any;
  userId?: Id<"users">;
  navigate: any;
  isRegistered: boolean;
}> = ({ tournament, userId, navigate, isRegistered }) => {
  // Fetch player's flight (only if registered)
  const playerFlight = useQuery(
    api.flights.getPlayerFlight,
    userId && isRegistered ? { tournamentId: tournament._id, playerId: userId } : "skip",
  );

  // Fetch all flights (only if registered and has flight)
  const allFlights = useQuery(
    api.flights.getTournamentFlightsWithParticipants,
    isRegistered && playerFlight ? { tournamentId: tournament._id } : "skip",
  );

  // Determine view type
  const showSimplifiedView = !isRegistered || !playerFlight;

  if (showSimplifiedView) {
    return <SimplifiedTournamentView tournament={tournament} />;
  }

  return <FullTournamentView tournament={tournament} playerFlight={playerFlight} allFlights={allFlights} />;
};
```

### 2. `convex/tournaments.ts`

**Query Baru: `getAllActiveTournaments`**

```typescript
export const getAllActiveTournaments = query({
  args: {},
  handler: async (ctx) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const tournamentsWithDetails = await Promise.all(
      tournaments.map(async (tournament) => {
        const participations = await ctx.db
          .query("tournament_participants")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
          .collect();
        
        // Get banner URL from storage if bannerStorageId exists
        let bannerUrl = tournament.bannerUrl;
        if (tournament.bannerStorageId) {
          const url = await ctx.storage.getUrl(tournament.bannerStorageId);
          if (url) bannerUrl = url;
        }
        
        return { 
          ...tournament, 
          participantCount: participations.length,
          bannerUrl
        };
      })
    );
    return tournamentsWithDetails;
  },
});
```

### 3. `convex/users.ts`

**Query yang Digunakan: `getPlayerById`** (sudah dibuat sebelumnya)

## Cara Kerja

1. Player login dan masuk ke halaman MyTournaments
2. System mengecek `paidStatus` player:
   - Jika `!== "paid"` → Tampilkan halaman kosong
   - Jika `=== "paid"` → Lanjut ke step 3
3. System mengambil:
   - Tournament yang player sudah terdaftar (`getTournaments`)
   - Semua tournament active (`getAllActiveTournaments`)
4. System merge kedua list (hindari duplikat)
5. Untuk setiap tournament, system cek:
   - Apakah player terdaftar? (`isRegistered`)
   - Apakah player punya flight? (`playerFlight`)
6. Tampilkan card sesuai kondisi:
   - Registered + Has Flight → Full View
   - Not Registered OR No Flight → Simplified View

## Simplified View vs Full View

### Simplified View
```
┌─────────────────────────────────┐
│ Tournament Name        [Status] │
│ Description                     │
├─────────────────────────────────┤
│ 📅 Date                         │
│ 📍 Location                     │
│ 🎯 Course Type                  │
├─────────────────────────────────┤
│ Info Turnamen                   │
│ Tampilan Skor: Stroke           │
│ Total Par: 72                   │
└─────────────────────────────────┘
```

### Full View
```
┌─────────────────────────────────┐
│ Tournament Name        [Status] │
│ Description                     │
├─────────────────────────────────┤
│ 📅 Date                         │
│ 📍 Location                     │
│ 🎯 Course Type                  │
├─────────────────────────────────┤
│ Info Turnamen                   │
│ Tampilan Skor: Stroke           │
│ Total Par: 72                   │
├─────────────────────────────────┤
│ 👥 Informasi Flight Anda        │
│ Flight A - #1                   │
│ Start Time: 08:00               │
│ Start Hole: 1                   │
│ Members: Player 1, Player 2...  │
├─────────────────────────────────┤
│ 👥 Semua Peserta Turnamen       │
│ [Table with all participants]   │
├─────────────────────────────────┤
│ [Mulai/Lanjutkan Scoring]       │
└─────────────────────────────────┘
```

## Testing

### Test Case 1: Player Belum Accepted
1. Login sebagai player dengan `paidStatus !== "paid"`
2. Buka halaman MyTournaments
3. **Expected**: Halaman kosong dengan pesan "Belum ada turnamen"

### Test Case 2: Player Accepted - Belum Terdaftar
1. Login sebagai player dengan `paidStatus === "paid"`
2. Player belum terdaftar di tournament manapun
3. Buka halaman MyTournaments
4. **Expected**: Tampil semua active tournament dengan simplified view

### Test Case 3: Player Accepted - Terdaftar Tapi Belum Punya Flight
1. Login sebagai player dengan `paidStatus === "paid"`
2. Player sudah terdaftar di tournament tapi belum di-assign ke flight
3. Buka halaman MyTournaments
4. **Expected**: Tournament tersebut tampil dengan simplified view

### Test Case 4: Player Accepted - Terdaftar Dan Punya Flight
1. Login sebagai player dengan `paidStatus === "paid"`
2. Player sudah terdaftar di tournament dan sudah di-assign ke flight
3. Buka halaman MyTournaments
4. **Expected**: Tournament tersebut tampil dengan full view (flight info, participant list, action buttons)

### Test Case 5: Player Accepted - Mixed Tournaments
1. Login sebagai player dengan `paidStatus === "paid"`
2. Player terdaftar di Tournament A (punya flight)
3. Player terdaftar di Tournament B (belum punya flight)
4. Ada Tournament C yang active (player belum terdaftar)
5. Buka halaman MyTournaments
6. **Expected**:
   - Tournament A: Full view
   - Tournament B: Simplified view
   - Tournament C: Simplified view

## Catatan Penting

- Query `getAllActiveTournaments` hanya dipanggil jika player sudah accepted
- Simplified view tidak menampilkan flight info dan participant list untuk menghindari kebingungan
- Player yang belum accepted tidak akan melihat tournament apapun
- Tournament yang ditampilkan hanya yang berstatus "active"
- Merge tournament list menghindari duplikat dengan menggunakan Set untuk tracking ID
