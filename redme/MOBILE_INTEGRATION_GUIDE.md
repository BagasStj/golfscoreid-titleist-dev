# Mobile Player Interface Integration Guide

## Overview
This guide explains how to integrate the flight management and news system with the mobile player interface.

## Step 1: Update TournamentList Component

Replace the dummy data in `src/components/player/mobile/TournamentList.tsx`:

```typescript
// Add at the top
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';

// Inside component
const { user } = useAuth();
const tournaments = useQuery(
  user ? api.tournaments.getTournaments : undefined,
  user ? { userId: user._id } : 'skip'
);

// Map tournaments to display format
const displayTournaments = tournaments?.map(t => ({
  id: t._id,
  title: t.name,
  date: new Date(t.date).toISOString().split('T')[0],
  location: t.location,
  image: t.bannerUrl || '/banner/image-1.png', // Fallback to default
  participants: 0, // Get from participant count query
  maxParticipants: t.maxParticipants || 60,
  status: t.status,
})) || [];
```

## Step 2: Update TournamentDetail Component

Replace dummy data in `src/components/player/mobile/TournamentDetail.tsx`:

```typescript
// Add at the top
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

// Inside component
const tournament = useQuery(
  id ? api.tournaments.getTournamentDetails : undefined,
  id ? { tournamentId: id as Id<'tournaments'> } : 'skip'
);

const participantCount = useQuery(
  id ? api.tournaments.getTournamentParticipantCount : undefined,
  id ? { tournamentId: id as Id<'tournaments'> } : 'skip'
);

// Use real data
const tournamentData = tournament ? {
  id: tournament._id,
  title: tournament.name,
  date: new Date(tournament.date).toISOString().split('T')[0],
  location: tournament.location,
  image: tournament.bannerUrl || '/full-color-logo.png',
  participants: participantCount || 0,
  maxParticipants: tournament.maxParticipants || 60,
  status: tournament.status,
  description: tournament.description,
  prize: tournament.prize || 'TBA',
  registrationFee: tournament.registrationFee || 'TBA',
  contactPerson: tournament.contactPerson || 'TBA',
} : null;
```

## Step 3: Update NewsFeed Component

Replace dummy data in `src/components/player/mobile/NewsFeed.tsx`:

```typescript
// Add at the top
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';

// Inside component
const { user } = useAuth();
const news = useQuery(
  api.news.getPublishedNews,
  user ? { userId: user._id, limit: 20 } : { limit: 20 }
);

// Map news to display format
const displayNews = news?.map(n => ({
  id: n._id,
  title: n.title,
  excerpt: n.excerpt,
  image: n.imageUrl || '/full-color-logo.png',
  date: new Date(n.publishedAt).toISOString().split('T')[0],
  category: n.category,
  content: n.content, // For detail view
})) || [];
```

## Step 4: Add Flight-Based Leaderboard

Create a new query to get flight-specific leaderboard:

```typescript
// In convex/leaderboard.ts
export const getFlightLeaderboard = query({
  args: {
    tournamentId: v.id("tournaments"),
    flightId: v.id("tournament_flights"),
  },
  handler: async (ctx, args) => {
    // Get players in this flight
    const participants = await ctx.db
      .query("tournament_participants")
      .withIndex("by_flight", (q) => q.eq("flightId", args.flightId))
      .collect();

    const playerIds = participants.map(p => p.playerId);

    // Get scores only for these players
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const flightScores = scores.filter(s => playerIds.includes(s.playerId));

    // Calculate leaderboard for flight players only
    // ... rest of leaderboard logic
  },
});
```

## Step 5: Update Player Dashboard

Show flight information in player dashboard:

```typescript
// In PlayerDashboard or MyTournaments
const playerFlight = useQuery(
  user && selectedTournament ? api.flights.getPlayerFlight : undefined,
  user && selectedTournament ? {
    tournamentId: selectedTournament,
    playerId: user._id,
  } : 'skip'
);

// Display flight info
{playerFlight && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 className="font-semibold text-blue-900">Your Flight</h4>
    <p className="text-blue-700">{playerFlight.flightName}</p>
    {playerFlight.startTime && (
      <p className="text-sm text-blue-600">Start Time: {playerFlight.startTime}</p>
    )}
    <p className="text-sm text-blue-600">Start Hole: {playerFlight.startHole}</p>
  </div>
)}
```

## Step 6: Filter Scoring Interface by Flight

Update scoring interface to show only flight players:

```typescript
// In ScoringInterface or ModernScoringInterface
const flight = useQuery(
  user && tournamentId ? api.flights.getPlayerFlight : undefined,
  user && tournamentId ? {
    tournamentId,
    playerId: user._id,
  } : 'skip'
);

const flightPlayers = useQuery(
  flight ? api.flights.getFlightWithPlayers : undefined,
  flight ? { flightId: flight._id } : 'skip'
);

// Show only flight players in leaderboard
const visiblePlayers = flightPlayers?.players || [];
```

## Step 7: Add News Detail View

Create a news detail modal or page:

```typescript
// NewsDetailModal.tsx
interface NewsDetailModalProps {
  newsId: Id<'news'>;
  onClose: () => void;
}

export default function NewsDetailModal({ newsId, onClose }: NewsDetailModalProps) {
  const news = useQuery(api.news.getNewsById, { newsId });

  if (!news) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {news.imageUrl && (
          <img src={news.imageUrl} alt={news.title} className="w-full h-64 object-cover" />
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{news.title}</h2>
          <p className="text-gray-600 text-sm mb-4">
            {new Date(news.publishedAt).toLocaleDateString('id-ID')}
          </p>
          <div className="prose max-w-none">
            {news.content}
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Step 8: Add Tournament Registration

Allow players to register for tournaments:

```typescript
// In convex/tournaments.ts
export const registerForTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    flightId: v.id("tournament_flights"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "player") {
      throw new Error("Only players can register");
    }

    // Check if already registered
    const existing = await ctx.db
      .query("tournament_participants")
      .withIndex("by_tournament_and_player", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("playerId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already registered");
    }

    // Get flight details
    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Register player
    await ctx.db.insert("tournament_participants", {
      tournamentId: args.tournamentId,
      flightId: args.flightId,
      playerId: args.userId,
      startHole: flight.startHole,
      registeredAt: Date.now(),
    });

    return { success: true };
  },
});
```

## Step 9: Add Flight Selection for Registration

When registering, show available flights:

```typescript
// In TournamentDetail
const availableFlights = useQuery(
  id ? api.flights.getTournamentFlights : undefined,
  id ? { tournamentId: id as Id<'tournaments'> } : 'skip'
);

// Show flight selection
<div className="space-y-2">
  <h4 className="font-semibold">Select Flight</h4>
  {availableFlights?.map(flight => (
    <button
      key={flight._id}
      onClick={() => handleRegister(flight._id)}
      className="w-full p-4 border rounded-lg text-left hover:border-green-500"
    >
      <div className="font-semibold">{flight.flightName}</div>
      {flight.startTime && (
        <div className="text-sm text-gray-600">Start: {flight.startTime}</div>
      )}
    </button>
  ))}
</div>
```

## Step 10: Add Real-time Updates

Use Convex's real-time features to update data automatically:

```typescript
// All useQuery hooks automatically update when data changes
// No additional code needed - Convex handles real-time updates

// Example: News feed updates automatically when admin publishes new news
const news = useQuery(api.news.getPublishedNews, { userId: user?._id });
// This will automatically re-render when new news is published
```

## Testing Checklist

- [ ] Tournament list shows real tournaments with banners
- [ ] Tournament detail shows all information correctly
- [ ] News feed displays published news
- [ ] Players can see their flight information
- [ ] Leaderboard shows only flight players
- [ ] Scoring interface shows only flight players
- [ ] Players can register for tournaments
- [ ] Real-time updates work correctly
- [ ] Images display correctly (or fallback to defaults)
- [ ] Date formatting is correct for Indonesian locale

## Common Issues & Solutions

### Issue: Images not displaying
**Solution**: Implement Convex storage upload or use external image URLs

### Issue: Player sees all players instead of flight
**Solution**: Ensure flight filtering is applied in leaderboard queries

### Issue: News not showing
**Solution**: Check `isPublished` status and `targetAudience` filtering

### Issue: Tournament dates showing incorrectly
**Solution**: Use proper timezone conversion and Indonesian locale formatting

## Performance Optimization

1. **Pagination**: Add pagination to news feed and tournament list
2. **Caching**: Convex automatically caches queries
3. **Lazy Loading**: Load tournament details only when needed
4. **Image Optimization**: Use optimized image sizes for mobile

## Security Considerations

1. Players can only see their own flight's data
2. News is filtered by target audience
3. Tournament registration requires authentication
4. All mutations verify user roles

## Next Features to Implement

1. Push notifications for news
2. Tournament reminders
3. Flight chat/messaging
4. Photo gallery for tournaments
5. Player statistics across tournaments
6. Tournament history
7. Favorite tournaments
8. Share tournament details
