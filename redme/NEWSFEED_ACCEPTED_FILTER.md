# NewsFeed Tournament Information Filter

## Ringkasan Perubahan

Menambahkan filter pada komponen NewsFeed agar hanya player dengan status "accepted" (paidStatus === "paid") yang dapat melihat informasi kategori tournament.

## Logika Filter

### Informasi General
- Ditampilkan untuk **SEMUA player** tanpa memandang status

### Informasi Tournament
- Ditampilkan hanya untuk player dengan **paidStatus === "paid"** (accepted)
- Tidak bergantung pada apakah player terdaftar di tournament tertentu
- Semua informasi tournament yang dipublish akan ditampilkan untuk player yang sudah accepted

## File yang Dimodifikasi

### 1. `convex/information.ts`

**Query `getPublishedInformationForPlayer` dimodifikasi:**

```typescript
export const getPublishedInformationForPlayer = query({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get player data to check paidStatus
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      return [];
    }

    // Get all published information
    const allInformation = await ctx.db
      .query("information")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();

    // Filter information based on category and player's paidStatus
    const filteredInformation = allInformation.filter((info) => {
      // Show all general information to everyone
      if (info.category === "general") {
        return true;
      }
      // Show tournament information only if player has paidStatus === "paid" (accepted)
      if (info.category === "tournament") {
        return player.paidStatus === "paid";
      }
      return false;
    });

    // Refresh file URLs and add tournament name
    const informationWithDetails = await Promise.all(
      filteredInformation.map(async (info) => {
        let fileUrl = info.fileUrl;
        if (info.fileStorageId) {
          const url = await ctx.storage.getUrl(info.fileStorageId);
          if (url) fileUrl = url;
        }

        let tournamentName: string | undefined;
        if (info.tournamentId) {
          const tournament = await ctx.db.get(info.tournamentId);
          tournamentName = tournament?.name;
        }

        return {
          ...info,
          fileUrl,
          tournamentName,
        };
      }),
    );

    return informationWithDetails.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return b.createdAt - a.createdAt;
    });
  },
});
```

**Perubahan utama:**
- Menghapus logika pengecekan tournament_participants
- Filter tournament information hanya berdasarkan `player.paidStatus === "paid"`
- Lebih sederhana dan langsung

### 2. `convex/users.ts`

**Query baru `getPlayerById` ditambahkan:**

```typescript
export const getPlayerById = query({
  args: {
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      return null;
    }

    // Refresh profile photo URL if exists
    let profilePhotoUrl = player.profilePhotoUrl;
    if (player.profilePhotoStorageId) {
      const url = await ctx.storage.getUrl(player.profilePhotoStorageId);
      if (url) profilePhotoUrl = url;
    }

    // Return player data without password
    return {
      _id: player._id,
      name: player.name,
      email: player.email,
      // ... all other fields
      paymentStatus: player.paymentStatus,
      paidStatus: player.paidStatus,
      paidAt: player.paidAt,
    };
  },
});
```

### 3. `src/components/player/mobile/NewsFeed.tsx`

**Perubahan minimal:**
- Filtering dilakukan di backend, frontend hanya menampilkan data yang diterima
- Menambahkan debug logging untuk troubleshooting

## Cara Kerja

1. Player login dan masuk ke halaman NewsFeed
2. Backend query `getPublishedInformationForPlayer` dipanggil dengan playerId
3. Backend mengambil data player dan mengecek `paidStatus`
4. Backend memfilter informasi:
   - **General**: Semua player bisa lihat
   - **Tournament**: Hanya jika `player.paidStatus === "paid"`
5. Frontend menampilkan hasil filter dari backend

## Status Player

- **Invited/Unpaid** (`paidStatus !== "paid"`) → Hanya bisa melihat informasi general
- **Accepted/Paid** (`paidStatus === "paid"`) → Bisa melihat informasi general DAN tournament

## Testing

### Test Case 1: Player Unpaid
1. Login sebagai player dengan `paidStatus !== "paid"`
2. Buka halaman NewsFeed/Information
3. **Expected**: Hanya informasi general yang muncul

### Test Case 2: Player Accepted
1. Login sebagai player dengan `paidStatus === "paid"`
2. Buka halaman NewsFeed/Information
3. **Expected**: Informasi general DAN tournament muncul

### Test Case 3: Ubah Status Player
1. Login sebagai player unpaid
2. Verifikasi hanya informasi general yang muncul
3. Admin mengubah status player menjadi paid
4. Refresh halaman NewsFeed
5. **Expected**: Informasi tournament sekarang muncul

## Catatan Penting

- Filter ini berlaku untuk SEMUA informasi tournament yang dipublish
- Tidak ada pengecekan apakah player terdaftar di tournament tertentu
- Player yang sudah accepted bisa melihat informasi dari semua tournament
- Informasi general tetap ditampilkan untuk semua player tanpa memandang status
