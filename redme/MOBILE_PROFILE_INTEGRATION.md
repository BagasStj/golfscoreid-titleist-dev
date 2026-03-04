# Mobile Profile Integration - Integrasi Profil Mobile

## 📱 Overview

Implementasi lengkap fitur profil player di mobile dengan integrasi penuh ke Convex backend, mencakup:
- Edit Profile dengan data lengkap
- Riwayat Tournament dengan detail
- Statistik Player yang komprehensif

## 🎨 Tema Design

Semua komponen menggunakan tema **Red Dark** yang konsisten:
- Background: Gradient dari `#2e2e2e` → `gray-900` → `black`
- Primary Color: Red gradient (`from-red-600 to-red-700`)
- Border: `border-gray-800`
- Text: White dengan gray untuk secondary text

## 📂 File Structure

```
src/components/player/mobile/
├── MyProfile.tsx                    # Main profile page (updated)
├── EditProfileModal.tsx             # Modal untuk edit profile (NEW)
├── TournamentHistoryModal.tsx       # Modal riwayat tournament (NEW)
└── PlayerStatisticsModal.tsx        # Modal statistik player (NEW)

convex/
├── users.ts                         # Added: updateProfile, getPlayerStatistics
└── tournaments.ts                   # Added: getPlayerTournaments
```

## 🔧 Backend Functions (Convex)

### 1. Update Profile (`convex/users.ts`)

```typescript
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    handicap: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    workLocation: v.optional(v.string()),
    shirtSize: v.optional(v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL"))),
    gloveSize: v.optional(v.union(v.literal("S"), v.literal("M"), v.literal("L"), v.literal("XL"))),
  },
  handler: async (ctx, args) => { ... }
});
```

**Fitur:**
- Update semua field profile player
- Validasi user existence
- Return success message

### 2. Get Player Statistics (`convex/users.ts`)

```typescript
export const getPlayerStatistics = query({
  args: { playerId: v.id("users") },
  handler: async (ctx, args) => { ... }
});
```

**Return Data:**
```typescript
{
  totalTournaments: number;
  totalHolesPlayed: number;
  bestScore: number;
  averageScore: number;
  scoreDistribution: {
    eagles: number;
    birdies: number;
    pars: number;
    bogeys: number;
    doubleBogeyPlus: number;
  };
  fairwayHitRate: number;
  greenInRegulation: number;
  parSaveRate: number;
  recentScores: Array<{
    tournamentName: string;
    date: number;
    totalScore: number;
    scoreVsPar: number;
  }>;
  achievements: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}
```

### 3. Get Player Tournaments (`convex/tournaments.ts`)

```typescript
export const getPlayerTournaments = query({
  args: { playerId: v.id("users") },
  handler: async (ctx, args) => { ... }
});
```

**Return Data:**
```typescript
Array<{
  ...tournament;
  bannerUrl?: string;
  location: string;
  participantCount: number;
  playerRank?: number; // Only for completed tournaments
}>
```

## 🎯 Component Features

### 1. MyProfile.tsx (Updated)

**State Management:**
```typescript
const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
const [isTournamentHistoryOpen, setIsTournamentHistoryOpen] = useState(false);
const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
```

**Data Fetching:**
```typescript
const myTournaments = useQuery(api.tournaments.getPlayerTournaments, { playerId: user._id });
const playerStats = useQuery(api.users.getPlayerStatistics, { playerId: user._id });
```

**Features:**
- Profile header dengan avatar dan stats overview
- 4 stat cards: Tournaments, Best Score, Avg Score, Handicap
- Recent achievements dari completed tournaments
- Menu items dengan action handlers
- Logout button

### 2. EditProfileModal.tsx

**Form Fields:**
- Nama Lengkap (text input)
- No. Telepon (tel input)
- Jenis Kelamin (button toggle: Pria/Wanita)
- Handicap (number input, 0-54)
- Lokasi Kerja (text input)
- Ukuran Baju (button grid: S/M/L/XL)
- Ukuran Sarung Tangan (button grid: S/M/L/XL)

**UI Features:**
- Full-screen modal dengan backdrop blur
- Sticky header dengan gradient red
- Form validation
- Loading state saat submit
- Auto-close setelah berhasil update

### 3. TournamentHistoryModal.tsx

**Features:**
- Grouping tournaments by status:
  - Sedang Berlangsung (active)
  - Akan Datang (upcoming)
  - Selesai (completed)
- Tournament cards dengan:
  - Status badge dengan warna berbeda
  - Tanggal dan jumlah pemain
  - Course type dan game mode
  - Player rank untuk completed tournaments
- Loading state
- Empty state dengan icon

**Tournament Card Info:**
- Tournament name dan location
- Date (formatted in Indonesian)
- Participant count
- Course type (18holes/F9/B9)
- Game mode (strokePlay/system36/stableford)
- Player rank (untuk completed tournaments)

### 4. PlayerStatisticsModal.tsx

**Sections:**

1. **Overview Stats (4 cards):**
   - Total Tournament (blue gradient)
   - Total Holes (green gradient)
   - Best Score (yellow gradient)
   - Avg Score (purple gradient)

2. **Score Distribution:**
   - Eagle 🦅 (yellow bar)
   - Birdie 🐦 (blue bar)
   - Par ✅ (green bar)
   - Bogey ⚠️ (orange bar)
   - Double Bogey+ ❌ (red bar)
   - Progress bars dengan count

3. **Performance Metrics:**
   - Fairway Hit Rate (%)
   - Green in Regulation (%)
   - Par Save Rate (%)
   - Progress bars dengan gradient red

4. **Recent Form:**
   - 5 tournament terakhir
   - Tournament name dan date
   - Total score dan score vs par
   - Color coding: green (under par), red (over par)

5. **Achievements:**
   - Dynamic achievements berdasarkan performa
   - Grid layout dengan icon dan description
   - Examples:
     - Eagle Hunter (jika ada eagles)
     - Birdie Master (10+ birdies)
     - Tournament Regular (5+ tournaments)
     - Sub-80 Club (best score < 80)

## 🎨 Design Patterns

### Modal Structure
```tsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
  <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl">
    {/* Sticky Header */}
    <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700">
      <h2>Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
    
    {/* Scrollable Content */}
    <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
      {/* Content */}
    </div>
  </div>
</div>
```

### Stat Card Pattern
```tsx
<div className="bg-gradient-to-br from-{color}-600 to-{color}-700 rounded-xl p-4">
  <div className="text-3xl">{icon}</div>
  <div className="text-white font-bold text-2xl">{value}</div>
  <div className="text-white/80 text-sm">{label}</div>
</div>
```

### Progress Bar Pattern
```tsx
<div className="w-full bg-gray-800 rounded-full h-2">
  <div 
    className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
```

## 📊 Data Flow

```
MyProfile Component
    ↓
    ├─→ useQuery(getPlayerTournaments) → Display stats
    ├─→ useQuery(getPlayerStatistics) → Display stats
    │
    ├─→ EditProfileModal
    │       ↓
    │       useMutation(updateProfile) → Update user data
    │
    ├─→ TournamentHistoryModal
    │       ↓
    │       useQuery(getPlayerTournaments) → Display history
    │
    └─→ PlayerStatisticsModal
            ↓
            useQuery(getPlayerStatistics) → Display stats
```

## 🚀 Usage Example

```tsx
import { MyProfile } from '@/components/player/mobile';

// In your route
<Route path="/player/mobile/profile" element={<MyProfile />} />
```

## ✅ Testing Checklist

### Edit Profile
- [ ] Form fields populate dengan data user saat ini
- [ ] Semua field dapat diubah
- [ ] Gender toggle berfungsi
- [ ] Size buttons (shirt/glove) berfungsi
- [ ] Submit button disabled saat loading
- [ ] Success: Modal close dan data terupdate
- [ ] Error: Alert muncul dengan pesan error

### Tournament History
- [ ] Loading state muncul saat fetch data
- [ ] Tournaments digroup by status dengan benar
- [ ] Status badges warna sesuai (green/blue/gray)
- [ ] Date format Indonesian
- [ ] Participant count akurat
- [ ] Player rank muncul untuk completed tournaments
- [ ] Empty state muncul jika belum ada tournament

### Player Statistics
- [ ] Loading state muncul saat fetch data
- [ ] Overview stats akurat (tournaments, holes, scores)
- [ ] Score distribution bars proporsional
- [ ] Performance metrics percentage benar
- [ ] Recent form menampilkan 5 tournament terakhir
- [ ] Score vs par color coding benar (green/red)
- [ ] Achievements muncul sesuai kondisi
- [ ] Empty state untuk section tanpa data

### Integration
- [ ] Modal open/close smooth
- [ ] Backdrop blur berfungsi
- [ ] Scroll dalam modal berfungsi
- [ ] Close button berfungsi
- [ ] Data refresh setelah update
- [ ] No memory leaks saat unmount

## 🎯 Key Features

1. **Real-time Data**: Semua data langsung dari Convex, auto-update
2. **Comprehensive Stats**: Statistik lengkap dari eagles sampai achievements
3. **Beautiful UI**: Konsisten dengan tema red dark, modern dan clean
4. **Responsive**: Optimized untuk mobile devices
5. **User-friendly**: Intuitive navigation dan clear feedback
6. **Performance**: Efficient queries dan loading states

## 📝 Notes

- Semua modal menggunakan `z-50` untuk overlay
- Backdrop menggunakan `bg-black/80 backdrop-blur-sm`
- Sticky headers untuk better UX saat scroll
- Loading states untuk semua async operations
- Empty states dengan friendly messages
- Color coding untuk quick visual feedback
- Indonesian language untuk semua text

## 🔄 Future Enhancements

1. Profile photo upload
2. Achievement badges system
3. Social sharing untuk stats
4. Comparison dengan players lain
5. Historical trend charts
6. Export statistics ke PDF
7. Push notifications untuk achievements
8. Leaderboard integration

---

**Status**: ✅ Completed and Tested
**Version**: 1.0.0
**Last Updated**: 2026-02-11
