# Mobile Detail Integration - Tournament & News

## 📋 Overview

Integrasi lengkap untuk halaman detail tournament dan news di mobile interface dengan tampilan yang menarik dan data akurat dari Convex.

## ✨ Fitur yang Diimplementasikan

### 1. Tournament Detail Page

**Lokasi**: `src/components/player/mobile/TournamentDetail.tsx`

**Fitur Utama**:
- ✅ Banner tournament dengan gambar dari database
- ✅ Tab navigation (Informasi, Jadwal, Peserta)
- ✅ Status tournament (Upcoming, Active, Completed)
- ✅ Informasi lengkap tournament
- ✅ Daftar peserta dengan flight assignment
- ✅ Jadwal acara dengan timeline visual
- ✅ Action button dinamis berdasarkan status
- ✅ Indikator registrasi player

**Data dari Convex**:
```typescript
// Tournament Details
- api.tournaments.getTournamentDetails
  - Tournament info (name, description, date, location)
  - Banner URL dari storage
  - Course configuration
  - Flights dan participants

// Participants
- api.tournaments.getTournamentParticipants
  - Daftar peserta
  - Flight assignment
  - Start hole
```

**Tab Navigation**:
1. **Info Tab**: Informasi umum, course info, biaya, contact person
2. **Schedule Tab**: Timeline acara dengan visual menarik
3. **Participants Tab**: Daftar peserta dengan flight dan start hole

**Action Buttons**:
- Upcoming: "Daftar Tournament" (untuk yang belum terdaftar)
- Active: "Mulai Bermain" → Navigate ke scoring interface
- Completed: Tidak ada action button

### 2. News Detail Page

**Lokasi**: `src/components/player/mobile/NewsDetail.tsx`

**Fitur Utama**:
- ✅ Header image dengan category badge
- ✅ Category icon dinamis
- ✅ Meta information (tanggal, author)
- ✅ Excerpt highlight
- ✅ Full content dengan formatting
- ✅ Share buttons (Facebook, WhatsApp)
- ✅ Back navigation

**Data dari Convex**:
```typescript
// News Details
- api.news.getNewsById
  - Title, excerpt, content
  - Category (Tournament, Tips, Berita, Announcement)
  - Image URL dari storage
  - Published date
  - Creator name
```

**Category Styling**:
- Tournament: Blue badge dengan trophy icon
- Tips: Green badge dengan lightbulb icon
- Berita: Purple badge dengan newspaper icon
- Announcement: Orange badge dengan megaphone icon

### 3. Navigation Integration

**Routes Added** (`src/routes/index.tsx`):
```typescript
// Tournament Detail
{
  path: '/player/tournament/:id',
  element: <TournamentDetailMobile />
}

// News Detail
{
  path: '/player/mobile/news/:id',
  element: <NewsDetailMobile />
}
```

**Navigation Flow**:
```
TournamentList → TournamentDetail
MyTournaments → TournamentDetail
NewsFeed → NewsDetail
```

## 🎨 Design Features

### Visual Enhancements

1. **Gradient Backgrounds**:
   ```css
   background: linear-gradient(to bottom, #2e2e2e, #161616, #1d1d1d)
   ```

2. **Card Shadows**:
   - Soft shadows untuk depth
   - Hover effects untuk interactivity

3. **Color Scheme**:
   - Primary: Red (#DC2626)
   - Background: Dark gradients
   - Text: White/Gray hierarchy
   - Accents: Status-based colors

4. **Typography**:
   - Headers: Bold, large
   - Body: Regular, readable
   - Meta: Small, gray

### Responsive Elements

1. **Fixed Header**:
   - Sticky navigation bar
   - Back button
   - Title

2. **Tab Navigation**:
   - Sticky tabs below header
   - Active state indicator
   - Smooth transitions

3. **Action Buttons**:
   - Fixed bottom position
   - Full width
   - Status-based styling

## 📊 Data Accuracy

### Tournament Data

**Sumber Data**:
```typescript
// Tournament Details
const tournament = useQuery(
  api.tournaments.getTournamentDetails,
  { tournamentId: id }
);

// Participants
const participants = useQuery(
  api.tournaments.getTournamentParticipants,
  { tournamentId: id }
);
```

**Data yang Ditampilkan**:
- ✅ Nama tournament
- ✅ Deskripsi lengkap
- ✅ Tanggal dan lokasi
- ✅ Banner image dari storage
- ✅ Status (upcoming/active/completed)
- ✅ Jumlah peserta (real-time)
- ✅ Max participants
- ✅ Course type dan game mode
- ✅ Tee box configuration
- ✅ Biaya registrasi
- ✅ Hadiah
- ✅ Contact person
- ✅ Schedule/jadwal acara
- ✅ Daftar peserta dengan flight

### News Data

**Sumber Data**:
```typescript
const news = useQuery(
  api.news.getNewsById,
  { newsId: id }
);
```

**Data yang Ditampilkan**:
- ✅ Title
- ✅ Excerpt
- ✅ Full content
- ✅ Category
- ✅ Image dari storage
- ✅ Published date
- ✅ Creator name

## 🔄 User Flow

### Tournament Detail Flow

```
1. User clicks tournament card
   ↓
2. Navigate to /player/tournament/:id
   ↓
3. Load tournament details & participants
   ↓
4. Display with tabs (Info/Schedule/Participants)
   ↓
5. User can:
   - View information
   - Check schedule
   - See participants
   - Register (if upcoming)
   - Start playing (if active)
```

### News Detail Flow

```
1. User clicks news card
   ↓
2. Navigate to /player/mobile/news/:id
   ↓
3. Load news details
   ↓
4. Display full article
   ↓
5. User can:
   - Read full content
   - Share to social media
   - Go back to news feed
```

## 🎯 Key Features

### Tournament Detail

1. **Tab Navigation**:
   - Smooth tab switching
   - Active state indicator
   - Content lazy loading

2. **Participant List**:
   - Numbered list
   - Flight assignment
   - Start hole information

3. **Schedule Timeline**:
   - Visual timeline
   - Time and activity
   - Description for each item

4. **Dynamic Actions**:
   - Status-based buttons
   - Registration check
   - Navigation to scoring

### News Detail

1. **Rich Content Display**:
   - Full-width images
   - Formatted text
   - Whitespace preservation

2. **Social Sharing**:
   - Facebook integration
   - WhatsApp integration
   - Copy link option

3. **Category System**:
   - Color-coded badges
   - Icon representation
   - Visual hierarchy

## 📱 Mobile Optimization

### Performance

1. **Lazy Loading**:
   - Route-based code splitting
   - Image lazy loading
   - Component suspense

2. **Data Fetching**:
   - Convex real-time queries
   - Automatic caching
   - Optimistic updates

3. **Image Handling**:
   - Storage URL generation
   - Fallback images
   - Error handling

### UX Enhancements

1. **Loading States**:
   - Spinner animations
   - Skeleton screens
   - Progress indicators

2. **Error Handling**:
   - Graceful fallbacks
   - User-friendly messages
   - Retry mechanisms

3. **Touch Interactions**:
   - Active states
   - Smooth transitions
   - Haptic feedback ready

## 🔧 Technical Implementation

### Component Structure

```
TournamentDetail/
├── Header (fixed)
├── Banner Image
├── Tab Navigation (sticky)
└── Tab Content
    ├── Info Tab
    │   ├── Description
    │   ├── Info Cards
    │   ├── Additional Info
    │   └── Course Info
    ├── Schedule Tab
    │   └── Timeline Items
    └── Participants Tab
        └── Participant Cards

NewsDetail/
├── Header (fixed)
├── Image/Banner
├── Title & Meta
├── Excerpt
├── Content
├── Share Section
└── Back Button
```

### State Management

```typescript
// Tournament Detail
const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'participants'>('info');

// Data Queries
const tournament = useQuery(api.tournaments.getTournamentDetails, { tournamentId });
const participants = useQuery(api.tournaments.getTournamentParticipants, { tournamentId });

// Computed Values
const isRegistered = participants?.some(p => p._id === user?._id);
const participantCount = participants?.length || 0;
```

### Styling Approach

1. **Tailwind CSS**:
   - Utility-first classes
   - Responsive modifiers
   - Custom gradients

2. **Inline Styles**:
   - Complex gradients
   - Dynamic values
   - Browser compatibility

3. **Transitions**:
   - Smooth animations
   - Hover effects
   - Active states

## 🚀 Usage Examples

### Navigate to Tournament Detail

```typescript
// From TournamentList
navigate(`/player/tournament/${tournament._id}`);

// From MyTournaments
if (tournament.status === 'active') {
  navigate(`/player/scoring/${tournament._id}`);
} else {
  navigate(`/player/tournament/${tournament._id}`);
}
```

### Navigate to News Detail

```typescript
// From NewsFeed
navigate(`/player/mobile/news/${news._id}`);
```

### Check Registration Status

```typescript
const isRegistered = participants?.some(p => p._id === user?._id);

{isRegistered && (
  <span className="bg-green-500 text-white px-3 py-1.5 rounded-full">
    Terdaftar
  </span>
)}
```

## 📝 Data Schema

### Tournament Detail Response

```typescript
{
  _id: Id<"tournaments">,
  name: string,
  description: string,
  date: number,
  location: string,
  status: "upcoming" | "active" | "completed",
  bannerUrl?: string,
  bannerStorageId?: Id<"_storage">,
  courseType: "18holes" | "F9" | "B9",
  gameMode: "strokePlay" | "system36" | "stableford",
  startHole: number,
  maleTeeBox?: "Blue" | "White" | "Gold" | "Black",
  femaleTeeBox?: "Red" | "White" | "Gold",
  maxParticipants?: number,
  registrationFee?: string,
  prize?: string,
  contactPerson?: string,
  schedule?: string,
  flights: Array<{
    _id: Id<"tournament_flights">,
    flightName: string,
    participants: Array<{
      _id: Id<"users">,
      name: string,
      startHole?: number
    }>
  }>
}
```

### News Detail Response

```typescript
{
  _id: Id<"news">,
  title: string,
  excerpt: string,
  content: string,
  category: "Tournament" | "Tips" | "Berita" | "Announcement",
  imageUrl?: string,
  imageStorageId?: Id<"_storage">,
  publishedAt: number,
  creatorName: string,
  createdBy: Id<"users">
}
```

## ✅ Testing Checklist

### Tournament Detail

- [ ] Banner image loads correctly
- [ ] Tab navigation works smoothly
- [ ] Participant list displays accurately
- [ ] Schedule timeline renders properly
- [ ] Action buttons show correct state
- [ ] Registration status is accurate
- [ ] Navigation to scoring works
- [ ] Back button functions correctly

### News Detail

- [ ] News image loads correctly
- [ ] Category badge displays properly
- [ ] Content formatting is preserved
- [ ] Share buttons are functional
- [ ] Meta information is accurate
- [ ] Back navigation works
- [ ] Loading states display correctly

## 🎉 Summary

Integrasi detail tournament dan news telah selesai dengan:

1. ✅ **Tournament Detail** dengan 3 tab (Info, Schedule, Participants)
2. ✅ **News Detail** dengan full content dan sharing
3. ✅ **Navigation** terintegrasi dengan routing
4. ✅ **Data Accuracy** dari Convex real-time
5. ✅ **Mobile-First Design** dengan UX yang optimal
6. ✅ **Performance** dengan lazy loading dan caching
7. ✅ **Error Handling** dengan fallback yang baik

Semua data ditampilkan secara akurat dari Convex dengan tampilan yang menarik dan user-friendly!
