# Sistem Persetujuan Scoring Player Lain

## Deskripsi
Sistem ini menambahkan mekanisme approval/persetujuan real-time ketika seorang player menginput skor untuk player lain. Skor tidak langsung masuk ke database, tetapi menunggu persetujuan dari player yang skornya diinput.

## Flow Sistem

### 1. Player A Menginput Skor untuk Player B
1. Player A memilih Player B dari player selector
2. Player A menginput skor untuk hole tertentu
3. Player A klik "Submit Score"
4. Sistem membuat pending score (status: "pending")
5. Dialog "Menunggu Persetujuan" muncul di layar Player A
6. Dialog menampilkan:
   - Nama player yang menunggu persetujuan
   - Hole number
   - Strokes yang diinput
   - Animasi loading
   - Tombol "Tutup" untuk menutup dialog (tidak membatalkan pending score)

### 2. Player B Menerima Notifikasi
1. Di layar Player B, otomatis muncul dialog "Persetujuan Skor"
2. Dialog menampilkan:
   - Nama player yang menginput (Player A)
   - Tournament name
   - Hole number, Par, dan Strokes
   - Perbandingan dengan par (Under/Over/Par)
   - Tombol "Tolak" (merah)
   - Tombol "Setuju" (hijau)

### 3. Player B Menyetujui Skor
1. Player B klik tombol "Setuju"
2. Sistem:
   - Mengubah status pending score menjadi "approved"
   - Membuat entry baru di table scores
   - Menghapus pending score dari daftar
3. Di layar Player A:
   - Dialog waiting otomatis tertutup
   - Muncul notifikasi sukses: "[Nama Player B] menyetujui skor! ✅"
   - Otomatis pindah ke hole berikutnya
4. Di layar Player B:
   - Dialog approval tertutup
   - Muncul notifikasi: "Skor disetujui! ✅"

### 4. Player B Menolak Skor
1. Player B klik tombol "Tolak"
2. Sistem:
   - Mengubah status pending score menjadi "rejected"
   - Tidak membuat entry di table scores
3. Di layar Player A:
   - Dialog waiting otomatis tertutup
   - Muncul notifikasi error: "[Nama Player B] menolak skor"
   - Tetap di hole yang sama, bisa input ulang
4. Di layar Player B:
   - Dialog approval tertutup
   - Muncul notifikasi: "Skor ditolak"

## Komponen

### 1. Schema Changes (convex/schema.ts)
```typescript
pending_scores: defineTable({
  tournamentId: v.id("tournaments"),
  targetPlayerId: v.id("users"),      // Player yang skornya diinput
  scoringUserId: v.id("users"),       // Player yang menginput
  holeNumber: v.number(),
  strokes: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
  respondedAt: v.optional(v.number()),
})
```

### 2. Backend Mutations (convex/scores.ts)

#### submitScoreForPlayer
- Membuat pending score jika scoring untuk player lain
- Langsung submit jika scoring untuk diri sendiri
- Return: `{ success, pendingScoreId?, requiresApproval }`

#### getPendingScores
- Query untuk mendapatkan semua pending scores untuk seorang player
- Enriched dengan tournament name, scoring user name, dan par

#### approvePendingScore
- Approve pending score dan membuat entry di table scores
- Authorization: Hanya target player yang bisa approve

#### rejectPendingScore
- Reject pending score
- Authorization: Hanya target player yang bisa reject

#### getPendingScoreStatus
- Query untuk monitoring status pending score
- Digunakan oleh scoring user untuk menunggu approval

### 3. Frontend Components

#### PendingScoreApprovals.tsx
- Komponen global yang muncul otomatis ketika ada pending scores
- Menampilkan semua pending scores dalam bentuk cards
- Setiap card memiliki tombol Setuju dan Tolak
- Ditambahkan ke MobileLayout agar muncul di semua halaman

#### ModernScoringInterface.tsx - Waiting Dialog
- Dialog yang muncul setelah submit score untuk player lain
- Menampilkan animasi loading
- Real-time monitoring status pending score
- Auto-close ketika approved/rejected

## Real-time Updates

Sistem menggunakan Convex's reactive queries untuk real-time updates:

1. **Di Player A (Scoring User)**:
   - Query `getPendingScoreStatus` dengan `pendingScoreId`
   - useEffect watching `pendingScoreStatus.status`
   - Auto-update UI ketika status berubah

2. **Di Player B (Target Player)**:
   - Query `getPendingScores` dengan `playerId`
   - Komponen `PendingScoreApprovals` auto-render ketika ada pending scores
   - Auto-hide ketika semua pending scores sudah diproses

## Authorization & Security

### Backend Authorization
1. **Submit Pending Score**:
   - Verify both users exist
   - Check if both users in same flight
   - Prevent duplicate pending scores for same hole

2. **Approve/Reject**:
   - Only target player can approve/reject their own scores
   - Verify pending score status is still "pending"
   - Prevent duplicate scores in main scores table

### Frontend
- Pending approvals hanya muncul untuk target player
- Waiting dialog hanya muncul untuk scoring user
- Real-time sync memastikan UI selalu up-to-date

## Edge Cases Handling

### 1. Duplicate Pending Scores
- Sistem mencegah multiple pending scores untuk hole yang sama
- Error message: "A pending score already exists for this hole"

### 2. Score Already Exists
- Ketika approve, sistem check apakah score sudah ada
- Jika sudah ada, update status tapi tidak create duplicate

### 3. Network Issues
- useRetryMutation dengan 3x retry
- Exponential backoff untuk retry
- Error handling dengan toast notifications

### 4. Player Offline
- Pending score tetap tersimpan di database
- Akan muncul ketika player online kembali
- No timeout - pending score tetap ada sampai diproses

### 5. Multiple Pending Scores
- Player bisa memiliki multiple pending scores dari berbagai holes
- Semua ditampilkan dalam satu dialog
- Bisa approve/reject satu per satu

## Testing Scenarios

### Test Case 1: Happy Path - Approval
1. Player A input skor untuk Player B
2. Verify pending score created
3. Verify waiting dialog muncul di Player A
4. Verify approval dialog muncul di Player B
5. Player B approve
6. Verify score masuk ke database
7. Verify waiting dialog tertutup di Player A
8. Verify success notification di kedua player

### Test Case 2: Rejection Path
1. Player A input skor untuk Player B
2. Player B reject
3. Verify score tidak masuk ke database
4. Verify error notification di Player A
5. Verify Player A bisa input ulang

### Test Case 3: Multiple Pending Scores
1. Player A input skor hole 1 untuk Player B
2. Player A input skor hole 2 untuk Player B
3. Verify kedua pending scores muncul di Player B
4. Player B approve hole 1, reject hole 2
5. Verify hanya hole 1 yang masuk ke database

### Test Case 4: Self Scoring
1. Player A input skor untuk diri sendiri
2. Verify langsung masuk ke database (no approval)
3. Verify no waiting dialog
4. Verify no approval dialog

### Test Case 5: Offline/Online
1. Player B offline
2. Player A input skor untuk Player B
3. Pending score tersimpan
4. Player B online kembali
5. Verify approval dialog muncul
6. Player B bisa approve/reject

## UI/UX Considerations

### Visual Design
- **Waiting Dialog**: Blue theme dengan animasi pulse
- **Approval Dialog**: Gradient background dengan clear CTAs
- **Notifications**: Toast dengan emoji untuk feedback
- **Loading States**: Animated dots dan spinning icons

### User Feedback
- Immediate feedback untuk setiap action
- Clear status indicators
- Descriptive error messages
- Success confirmations

### Accessibility
- Clear button labels
- Color-coded actions (green=approve, red=reject)
- Readable text sizes
- Touch-friendly button sizes

## Performance Considerations

1. **Query Optimization**:
   - Indexed queries untuk fast lookups
   - Filtered queries untuk pending status only

2. **Real-time Efficiency**:
   - Only query when needed (conditional queries)
   - Auto-cleanup of processed pending scores

3. **Network Efficiency**:
   - Batch operations where possible
   - Retry logic untuk failed requests

## Future Enhancements

1. **Push Notifications**: Native push untuk approval requests
2. **Timeout System**: Auto-reject after X minutes
3. **Bulk Approval**: Approve multiple scores at once
4. **History**: View approved/rejected scores history
5. **Comments**: Add notes when rejecting scores
6. **Undo**: Undo approval within time window
