# Tournament Creation Form - Special Scoring Holes Update

## ✅ Implementasi Selesai

### Fitur Baru: Special Scoring Holes
Tournament sekarang mendukung pemilihan hole-hole khusus untuk penilaian terpisah. Ini memungkinkan tournament memiliki **2 leaderboard**:
1. **Overall Leaderboard** - Semua hole
2. **Special Holes Leaderboard** - Hanya hole yang dipilih

---

## 📋 Perubahan File

### 1. **convex/schema.ts**
```typescript
tournaments: defineTable({
  // ... existing fields
  specialScoringHoles: v.optional(v.array(v.number())),
})
```
- Menambah field `specialScoringHoles` (optional array of numbers)

### 2. **convex/tournaments.ts**
```typescript
export const createTournament = mutation({
  args: {
    // ... existing args
    specialScoringHoles: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    // Validasi hole numbers berdasarkan course type
    if (args.specialScoringHoles && args.specialScoringHoles.length > 0) {
      const maxHole = args.courseType === "18holes" ? 18 : 9;
      const minHole = args.courseType === "B9" ? 10 : 1;
      
      for (const hole of args.specialScoringHoles) {
        if (hole < minHole || hole > (args.courseType === "B9" ? 18 : maxHole)) {
          throw new Error(`Invalid hole number ${hole} for course type ${args.courseType}`);
        }
      }
    }
    
    // Insert dengan specialScoringHoles
    await ctx.db.insert("tournaments", {
      // ... existing fields
      specialScoringHoles: args.specialScoringHoles || [],
    });
  },
});
```
- Menambah parameter `specialScoringHoles` di mutation
- Validasi hole numbers sesuai course type
- Menyimpan ke database

### 3. **src/types/index.ts**
```typescript
export interface Tournament {
  // ... existing fields
  specialScoringHoles?: number[];
}
```
- Update interface Tournament dengan field baru

### 4. **src/components/admin/TournamentCreationForm.tsx**

#### State Management:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  specialScoringHoles: [] as number[],
});
```

#### UI Component - Multiple Select Holes:
- Grid layout dengan button untuk setiap hole
- Dinamis berdasarkan course type:
  - **18holes**: Tampilkan hole 1-18
  - **F9**: Tampilkan hole 1-9
  - **B9**: Tampilkan hole 10-18
- Visual feedback:
  - Selected: Hijau (bg-grass-green-600)
  - Unselected: Abu-abu (bg-gray-100)
- Summary box menampilkan hole yang dipilih
- Auto-sort hole numbers

#### Submit Handler:
```typescript
const result = await createTournament({
  // ... existing fields
  specialScoringHoles: formData.specialScoringHoles.length > 0 
    ? formData.specialScoringHoles 
    : undefined,
});
```

---

## 🎯 Cara Penggunaan

### Admin - Membuat Tournament:

1. **Buka Admin Dashboard** → Tournament Management → Create Tournament

2. **Isi Form Basic Info:**
   - Tournament Name *
   - Description
   - Date & Time *
   - Start Hole *

3. **Pilih Configuration:**
   - Course Type (18holes/F9/B9) *
   - Game Mode (Stroke Play/Stableford/System 36) *
   - Scoring Display (Stroke/Over) *

4. **Pilih Special Scoring Holes (Optional):**
   - Klik nomor hole untuk select/unselect
   - Hole yang dipilih akan berubah hijau
   - Summary box akan menampilkan hole yang dipilih
   - Bisa pilih multiple holes

5. **Submit** → Tournament created!

---

## 💡 Use Cases

### 1. Par 3 Challenge
```
Special Holes: 3, 7, 12, 16
Leaderboard khusus untuk performa di par 3
```

### 2. Back 9 Pressure
```
Special Holes: 10, 11, 12, 13, 14, 15, 16, 17, 18
Leaderboard khusus untuk back 9
```

### 3. Signature Holes
```
Special Holes: 5, 9, 13, 18
Leaderboard khusus untuk hole paling menantang
```

### 4. Front 9 Only
```
Special Holes: 1, 2, 3, 4, 5, 6, 7, 8, 9
Leaderboard khusus untuk front 9
```

---

## ✅ Validasi

### Course Type Validation:
- **18holes**: Hanya bisa pilih hole 1-18
- **F9**: Hanya bisa pilih hole 1-9
- **B9**: Hanya bisa pilih hole 10-18

### Backend Validation:
```typescript
// Convex akan throw error jika hole number invalid
throw new Error(`Invalid hole number ${hole} for course type ${courseType}`);
```

### Frontend Validation:
- UI hanya menampilkan hole yang valid untuk course type
- Tidak mungkin pilih hole yang invalid

---

## 🔄 Next Steps (Future Enhancement)

Untuk mengimplementasikan dual leaderboard display:

### 1. Update Leaderboard Queries (convex/leaderboard.ts)
```typescript
// Query untuk overall leaderboard (existing)
export const getLeaderboard = query({ ... });

// Query baru untuk special holes leaderboard
export const getSpecialHolesLeaderboard = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament?.specialScoringHoles?.length) return null;
    
    // Calculate leaderboard hanya dari special holes
    // ...
  },
});
```

### 2. Update LeaderboardAdmin.tsx
```typescript
// Tampilkan 2 tabs atau 2 sections jika ada special holes
{tournament.specialScoringHoles?.length > 0 && (
  <>
    <OverallLeaderboard />
    <SpecialHolesLeaderboard holes={tournament.specialScoringHoles} />
  </>
)}
```

### 3. Update PlayerLeaderboard.tsx
- Similar dengan LeaderboardAdmin
- Player juga bisa lihat 2 leaderboard

---

## 📊 Testing Checklist

- [x] Schema updated dan deployed
- [x] Convex mutation accepts specialScoringHoles
- [x] Validation works untuk invalid holes
- [x] UI menampilkan hole selector
- [x] UI dinamis berdasarkan course type
- [x] Selected holes tersimpan di state
- [x] Form submit dengan special holes
- [x] Form reset setelah submit
- [ ] Dual leaderboard display (future)
- [ ] Special holes leaderboard calculation (future)

---

## 🎉 Status

**✅ SELESAI - Tournament Creation Form sudah support Special Scoring Holes**

Tournament sekarang bisa dibuat dengan:
- Semua konfigurasi existing (name, date, course type, game mode, dll)
- **PLUS** pilihan hole-hole khusus untuk penilaian terpisah
- Validasi lengkap di frontend dan backend
- UI yang user-friendly dengan visual feedback

**Ready untuk production!** 🚀
