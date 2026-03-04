# Next Steps - Flight & News Integration

## ✅ Completed

### Backend (Convex)
- ✅ Updated schema with flights and news tables
- ✅ Created `convex/flights.ts` with all flight management functions
- ✅ Created `convex/news.ts` with all news management functions
- ✅ Updated `convex/tournaments.ts` to support new fields and flights

### Frontend (Admin)
- ✅ Created `FlightManagement.tsx` component
- ✅ Created `NewsManagement.tsx` component
- ✅ Updated `TournamentCreationForm.tsx` with new fields (location, prize, etc.)
- ✅ Updated `AdminDashboard.tsx` to include News navigation

## 🔨 TODO - Critical Integration Tasks

### 1. Update AddPlayersModal Component
**File**: `src/components/admin/AddPlayersModal.tsx`

**Changes Needed**:
```typescript
// Add flight selection
const [selectedFlight, setSelectedFlight] = useState<Id<"tournament_flights"> | null>(null);

// Query flights
const flights = useQuery(api.flights.getFlightsByTournament, { tournamentId });

// Add dropdown in form
<select 
  value={selectedFlight || ''} 
  onChange={(e) => setSelectedFlight(e.target.value as Id<"tournament_flights">)}
>
  <option value="">Select Flight</option>
  {flights?.map(flight => (
    <option key={flight._id} value={flight._id}>
      {flight.flightName} - {flight.participantCount} players
    </option>
  ))}
</select>

// Update mutation call
await addPlayerToFlight({
  flightId: selectedFlight!,
  playerId: player._id,
  startHole: startHole,
  userId: user._id
});
```

### 2. Update TournamentManagement Component
**File**: `src/components/admin/TournamentManagement.tsx`

**Changes Needed**:
```typescript
// Add state for flight management modal
const [showFlightManagement, setShowFlightManagement] = useState(false);
const [selectedTournamentForFlights, setSelectedTournamentForFlights] = useState<Id<"tournaments"> | null>(null);

// Add button in tournament actions
<button onClick={() => {
  setSelectedTournamentForFlights(tournament._id);
  setShowFlightManagement(true);
}}>
  Manage Flights
</button>

// Add modal
{showFlightManagement && selectedTournamentForFlights && (
  <FlightManagement 
    tournamentId={selectedTournamentForFlights}
    onClose={() => {
      setShowFlightManagement(false);
      setSelectedTournamentForFlights(null);
    }}
  />
)}
```

### 3. Update Scoring Interface (Player)
**File**: `src/components/player/ModernScoringInterface.tsx`

**Changes Needed**:
```typescript
// Get player's flight
const playerFlight = useQuery(
  api.flights.getPlayerFlight,
  tournamentId && user ? { tournamentId, playerId: user._id } : "skip"
);

// Get flight details with participants
const flightDetails = useQuery(
  api.flights.getFlightDetails,
  playerFlight ? { flightId: playerFlight._id } : "skip"
);

// Filter players to show only flight members
const flightPlayers = flightDetails?.participants || [];

// Update UI to show "Your Flight: Flight A"
<div className="text-gray-400 text-sm">
  Your Flight: {playerFlight?.flightName}
</div>
```

### 4. Update Player Leaderboard
**File**: `src/components/player/PlayerLeaderboard.tsx`

**Changes Needed**:
```typescript
// Add flight filter
const playerFlight = useQuery(
  api.flights.getPlayerFlight,
  tournamentId && user ? { tournamentId, playerId: user._id } : "skip"
);

// Filter leaderboard by flight
const flightLeaderboard = leaderboard?.filter(entry => {
  // Check if player is in same flight
  return entry.flightId === playerFlight?._id;
});

// Add tab for "My Flight" vs "Overall"
<div className="flex gap-2 mb-4">
  <button onClick={() => setView('flight')}>My Flight</button>
  <button onClick={() => setView('overall')}>Overall</button>
</div>
```

### 5. Add Banner Upload to Tournament Form
**File**: `src/components/admin/TournamentCreationForm.tsx`

**Changes Needed**:
```typescript
// Add state
const [bannerFile, setBannerFile] = useState<File | null>(null);
const [bannerPreview, setBannerPreview] = useState<string | null>(null);

// Add mutation
const generateUploadUrl = useMutation(api.tournaments.generateUploadUrl);

// Add file input
<div>
  <label>Tournament Banner</label>
  <input 
    type="file" 
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
    }}
  />
  {bannerPreview && (
    <img src={bannerPreview} alt="Preview" className="mt-2 h-32 rounded" />
  )}
</div>

// Upload before creating tournament
if (bannerFile) {
  const uploadUrl = await generateUploadUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": bannerFile.type },
    body: bannerFile,
  });
  const { storageId } = await result.json();
  
  // Add to tournament creation
  bannerStorageId: storageId
}
```

### 6. Update Mobile Tournament List
**File**: `src/components/player/mobile/TournamentList.tsx`

**Changes Needed**:
```typescript
// Replace dummy data with real data
const tournaments = useQuery(
  api.tournaments.getTournaments,
  user ? { userId: user._id } : "skip"
);

// Get banner URL
const getBannerUrl = (tournament: any) => {
  if (tournament.bannerStorageId) {
    return useQuery(api.tournaments.getTournamentBannerUrl, {
      storageId: tournament.bannerStorageId
    });
  }
  return tournament.bannerUrl || '/banner/image-1.png';
};

// Update image src
<img src={getBannerUrl(tournament)} alt={tournament.name} />
```

### 7. Update Mobile News Feed
**File**: `src/components/player/mobile/NewsFeed.tsx`

**Changes Needed**:
```typescript
// Replace dummy data with real data
const news = useQuery(
  api.news.getPublishedNews,
  user ? { userId: user._id } : "skip"
);

// Map news data
{news?.map((item) => (
  <div key={item._id}>
    <h3>{item.title}</h3>
    <p>{item.excerpt}</p>
    <span>{new Date(item.publishedAt).toLocaleDateString('id-ID')}</span>
  </div>
))}
```

## 🔄 Migration Required

### Create Migration Script
**File**: `convex/migrations/addDefaultFlights.ts`

```typescript
import { mutation } from "./_generated/server";

export const addDefaultFlights = mutation({
  handler: async (ctx) => {
    console.log("Starting migration: Adding default flights...");
    
    const tournaments = await ctx.db.query("tournaments").collect();
    let migratedCount = 0;
    
    for (const tournament of tournaments) {
      // Check if flights already exist
      const existingFlights = await ctx.db
        .query("tournament_flights")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
        .collect();
      
      if (existingFlights.length > 0) {
        console.log(`Tournament ${tournament.name} already has flights, skipping...`);
        continue;
      }
      
      // Create default flight
      const flightId = await ctx.db.insert("tournament_flights", {
        tournamentId: tournament._id,
        flightName: "Flight 1",
        flightNumber: 1,
        startHole: tournament.startHole,
        createdAt: Date.now(),
      });
      
      // Update all participants to use this flight
      const participants = await ctx.db
        .query("tournament_participants")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
        .collect();
      
      for (const participant of participants) {
        await ctx.db.patch(participant._id, { flightId });
      }
      
      migratedCount++;
      console.log(`Migrated tournament: ${tournament.name} with ${participants.length} participants`);
    }
    
    console.log(`Migration complete! Migrated ${migratedCount} tournaments.`);
    return { success: true, migratedCount };
  },
});
```

**Run Migration**:
```bash
# In Convex dashboard, run:
npx convex run migrations/addDefaultFlights
```

## 🧪 Testing Checklist

### Admin Testing
- [ ] Create tournament with all new fields
- [ ] Upload tournament banner
- [ ] Create multiple flights for tournament
- [ ] Add players to different flights
- [ ] View flight details
- [ ] Delete empty flight
- [ ] Create news article
- [ ] Toggle news published status
- [ ] Edit and delete news

### Player Testing
- [ ] View tournament list with banners
- [ ] View tournament details with all info
- [ ] View news feed
- [ ] See only players in same flight during scoring
- [ ] View flight-based leaderboard
- [ ] View overall leaderboard

## 📋 Deployment Steps

1. **Push Schema Changes**
   ```bash
   npx convex dev
   # Wait for schema to sync
   ```

2. **Run Migration**
   ```bash
   npx convex run migrations/addDefaultFlights
   ```

3. **Test Admin Functions**
   - Create new tournament
   - Create flights
   - Add players to flights
   - Create news

4. **Test Player Functions**
   - View tournaments
   - View news
   - Test scoring with flight filtering

5. **Deploy to Production**
   ```bash
   npx convex deploy
   npm run build
   # Deploy to Vercel
   ```

## 🐛 Potential Issues & Solutions

### Issue 1: TypeScript Errors
**Problem**: Type mismatches after schema update
**Solution**: Regenerate Convex types
```bash
npx convex dev
# Types will auto-regenerate
```

### Issue 2: Existing Participants Error
**Problem**: Old participants don't have flightId
**Solution**: Run migration script first

### Issue 3: Banner Not Showing
**Problem**: Storage URL not loading
**Solution**: Check Convex storage permissions and URL generation

### Issue 4: News Not Filtering
**Problem**: All news showing to all users
**Solution**: Verify targetAudience logic in query

## 📚 Documentation Updates Needed

- [ ] Update API documentation with new endpoints
- [ ] Add flight management guide for admins
- [ ] Add news management guide for admins
- [ ] Update player guide with flight information
- [ ] Add troubleshooting section

## 🎯 Priority Order

1. **HIGH PRIORITY** (Do First)
   - Run migration script
   - Update AddPlayersModal with flight selection
   - Update TournamentManagement with flight management button
   - Test basic flight creation and player assignment

2. **MEDIUM PRIORITY** (Do Next)
   - Add banner upload to tournament form
   - Update mobile tournament list with real data
   - Update mobile news feed with real data
   - Update scoring interface with flight filtering

3. **LOW PRIORITY** (Nice to Have)
   - Add image upload for news
   - Add flight statistics
   - Add flight chat feature
   - Add push notifications for news

---

**Start with HIGH PRIORITY tasks to get the core functionality working!**
