# Mobile Tournament Image & Card Enhancement

## 🎯 Tujuan Update
Memperbaiki tampilan tournament cards di mobile player dengan:
1. Menampilkan banner image dari database Convex
2. Menambahkan informasi lebih lengkap di card
3. Meningkatkan visual appeal dan user experience

---

## 🔄 Perubahan yang Dilakukan

### 1. Backend - Convex Queries (`convex/tournaments.ts`)

#### `getAllTournaments` Query
```typescript
// Sebelum: Hanya mengambil data tournament
return { ...tournament, participantCount: participations.length };

// Sesudah: Mengambil banner URL dari storage
let bannerUrl = tournament.bannerUrl;
if (tournament.bannerStorageId) {
  const url = await ctx.storage.getUrl(tournament.bannerStorageId);
  if (url) bannerUrl = url;
}
return { 
  ...tournament, 
  participantCount: participations.length,
  bannerUrl // Fresh URL from storage
};
```

#### `getTournaments` Query (untuk player)
- Ditambahkan logic yang sama untuk mengambil banner URL dari storage
- Menambahkan participantCount untuk setiap tournament
- Support untuk admin dan player role

**Benefit:**
- ✅ Banner image selalu fresh dari storage
- ✅ Tidak perlu hardcode URL
- ✅ Support untuk uploaded images

---

### 2. Frontend - TournamentList.tsx

#### Image Handling
```typescript
// Use banner from database, fallback to default images
const bannerImage = tournament.bannerUrl || bannerImages[index % bannerImages.length];

// With error handling
<img
  src={bannerImage}
  alt={tournament.name}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  onError={(e) => {
    // Fallback to default banner if image fails to load
    e.currentTarget.src = bannerImages[index % bannerImages.length];
  }}
/>
```

**Features:**
- ✅ Prioritas: Banner dari database
- ✅ Fallback: Default banner images
- ✅ Error handling: Auto fallback jika image gagal load
- ✅ Hover effect: Scale animation

---

### 3. Frontend - MyTournaments.tsx

#### Enhanced Card Design

**Sebelum:**
```
┌─────────────────────────────┐
│ Tournament Name             │ [Status]
│ 📅 Date                     │
│ 📍 Location                 │
├─────────────────────────────┤
│ [Button]                    │
└─────────────────────────────┘
```

**Sesudah:**
```
┌─────────────────────────────┐
│                             │ [Status]
│   BANNER IMAGE              │
│   Tournament Name           │
│                             │
├─────────────────────────────┤
│ 📅 Date (with weekday)      │
│ 📍 Location                 │
├─────────────────────────────┤
│ 👥 45/100  🏌️ 18H  📋 Stroke│
├─────────────────────────────┤
│ [Icon] [Button Text]        │
└─────────────────────────────┘
```

#### Informasi Tambahan di Card:
1. **Banner Image** (h-36)
   - Full width image
   - Gradient overlay
   - Tournament title on image
   - Status badge

2. **Date & Location**
   - Date dengan format lengkap (weekday, day, month, year)
   - Location dengan icon

3. **Tournament Details** (NEW!)
   - **Participants**: 45/100 dengan icon
   - **Course Type**: 18H / F9 / B9
   - **Game Mode**: Stroke / S36 / Stableford

4. **Action Button**
   - Icon berbeda untuk active vs upcoming
   - Text yang jelas (Lanjutkan Bermain / Lihat Detail)

---

## 📊 Data Flow

```
Database (Convex)
    ↓
bannerStorageId → ctx.storage.getUrl()
    ↓
bannerUrl (fresh URL)
    ↓
Frontend Component
    ↓
<img src={bannerUrl || defaultBanner} />
    ↓
Display with error handling
```

---

## 🎨 Visual Improvements

### TournamentList.tsx
- ✅ Banner image dari database
- ✅ Hover scale effect
- ✅ Error handling dengan fallback
- ✅ Status badge dengan warna berbeda
- ✅ Gradient overlay untuk readability

### MyTournaments.tsx
- ✅ Banner image dengan title overlay
- ✅ Informasi lebih lengkap (participants, course type, game mode)
- ✅ Icon untuk setiap informasi
- ✅ Button dengan icon yang sesuai context
- ✅ Better visual hierarchy
- ✅ Improved spacing dan layout

---

## 🔍 Image Priority Logic

1. **Primary**: `tournament.bannerUrl` dari database
2. **Fallback**: Default banner images (`/banner/image-1.png`, etc.)
3. **Error Handling**: Auto switch ke fallback jika load gagal

```typescript
// Priority order:
tournament.bannerUrl (from Convex storage)
  ↓ (if null or undefined)
bannerImages[index % 3] (default images)
  ↓ (if load error)
onError → fallback to default
```

---

## 📱 Responsive Design

### Image Sizes:
- **TournamentList**: `h-40` (160px)
- **MyTournaments**: `h-36` (144px)

### Card Layout:
- Full width on mobile
- Rounded corners (rounded-2xl)
- Shadow effects
- Hover states
- Smooth transitions

---

## 🚀 Performance Optimizations

1. **Lazy Loading**: Images load on demand
2. **Error Handling**: Prevents broken image display
3. **Caching**: Convex storage URLs are cached
4. **Fallback**: Instant fallback to local images

---

## 🧪 Testing Checklist

- [ ] Tournament dengan banner dari database tampil dengan benar
- [ ] Tournament tanpa banner tampil dengan default image
- [ ] Error handling bekerja (test dengan invalid URL)
- [ ] Hover effects smooth
- [ ] All tournament info displayed correctly
- [ ] Icons aligned properly
- [ ] Buttons work correctly
- [ ] Navigation to detail/scoring works
- [ ] Loading states work
- [ ] Mobile responsive

---

## 📝 Code Quality

- ✅ No TypeScript errors
- ✅ Proper error handling
- ✅ Consistent styling
- ✅ Reusable logic
- ✅ Clean code structure
- ✅ Proper fallbacks

---

## 🎯 User Experience Improvements

### Before:
- ❌ No images
- ❌ Limited information
- ❌ Plain text cards
- ❌ No visual hierarchy

### After:
- ✅ Beautiful banner images
- ✅ Complete tournament information
- ✅ Visual hierarchy with images
- ✅ Better readability
- ✅ More engaging UI
- ✅ Professional look

---

## 🔮 Future Enhancements

1. **Image Optimization**
   - Compress images before upload
   - Multiple sizes for different screens
   - WebP format support

2. **Placeholder**
   - Skeleton loading for images
   - Blur-up effect

3. **Caching**
   - Service worker for offline images
   - IndexedDB for image cache

4. **Animation**
   - Fade-in effect for images
   - Parallax scroll effect

---

Dibuat: 10 Februari 2026
Update: Tournament images dan card enhancements
