# Flight Management & News System Implementation

## Overview
Implemented comprehensive flight management system and news/notification management for the golf tournament application. This allows admins to organize players into flights and send news/announcements to players.

## Database Schema Changes

### 1. Updated `tournaments` table
Added new fields:
- `location`: string (required) - Tournament location
- `prize`: string (optional) - Prize information
- `registrationFee`: string (optional) - Registration fee
- `contactPerson`: string (optional) - Contact information
- `maxParticipants`: number (optional) - Maximum number of participants
- `bannerUrl`: string (optional) - Tournament banner image URL
- `bannerStorageId`: Id<"_storage"> (optional) - Banner storage reference

### 2. New `tournament_flights` table
Manages flight groupings within tournaments:
- `tournamentId`: Id<"tournaments"> - Reference to tournament
- `flightName`: string - Flight name (e.g., "Flight A", "Morning Group")
- `flightNumber`: number - Flight number for ordering
- `startTime`: string (optional) - Start time (e.g., "08:00")
- `startHole`: number - Starting hole for this flight
- `createdAt`: number - Creation timestamp

Indexes:
- `by_tournament`: [tournamentId]
- `by_tournament_and_number`: [tournamentId, flightNumber]

### 3. Updated `tournament_participants` table
Now linked to flights:
- Added `flightId`: Id<"tournament_flights"> - Reference to flight
- Existing fields: `tournamentId`, `playerId`, `startHole`, `registeredAt`

New indexes:
- `by_flight`: [flightId]
- `by_flight_and_player`: [flightId, playerId]

### 4. New `news` table
Manages news and announcements:
- `title`: string - News title
- `excerpt`: string - Brief summary
- `content`: string - Full content
- `category`: "Tournament" | "Tips" | "Berita" | "Announcement"
- `imageUrl`: string (optional) - News image URL
- `imageStorageId`: Id<"_storage"> (optional) - Image storage reference
- `publishedAt`: number - Publication timestamp
- `createdBy`: Id<"users"> - Admin who created the news
- `isPublished`: boolean - Publication status
- `targetAudience`: "all" | "players" | "admins" - Target audience

Indexes:
- `by_published`: [isPublished, publishedAt]
- `by_category`: [category]
- `by_created_by`: [createdBy]

## Convex Functions

### Flight Management (`convex/flights.ts`)

#### Mutations:
- `createFlight`: Create a new flight in a tournament
- `updateFlight`: Update flight details
- `deleteFlight`: Delete a flight (only if no players)
- `addPlayerToFlight`: Add a player to a specific flight
- `removePlayerFromFlight`: Remove a player from a flight

#### Queries:
- `getTournamentFlights`: Get all flights for a tournament
- `getFlightWithPlayers`: Get flight details with player list
- `getPlayerFlight`: Get the flight a player is in for a tournament

### News Management (`convex/news.ts`)

#### Mutations:
- `createNews`: Create new news/announcement
- `updateNews`: Update existing news
- `deleteNews`: Delete news
- `togglePublishStatus`: Toggle published/draft status

#### Queries:
- `getAllNews`: Get all news (admin only)
- `getPublishedNews`: Get published news for players
- `getNewsByCategory`: Filter news by category
- `getNewsById`: Get single news item

### Updated Tournament Functions (`convex/tournaments.ts`)
- Updated `createTournament` to include new fields (location, prize, etc.)
- Updated `updateTournament` to support new fields

## Admin Components

### 1. FlightManagement.tsx
Main component for managing flights:
- Create new flights
- Edit flight details (name, start time, start hole)
- Delete flights
- View all flights in a tournament
- Visual flight cards with details

### 2. FlightPlayersView.tsx
Component for managing players within a flight:
- View all players in a flight
- Add players to flight
- Remove players from flight
- Display player details (name, email, handicap, start hole)

### 3. AddPlayersToFlightModal.tsx
Modal for adding players to a specific flight:
- Search players by name or email
- Multi-select players
- Set individual start holes for each player
- Shows player handicap information
- Prevents duplicate registrations

### 4. TournamentFlightManagement.tsx
Comprehensive tournament flight management page:
- Combines flight management and player management
- Quick flight selection
- Integrated view of flights and their players

### 5. NewsManagement.tsx
Complete news management interface:
- Create/edit/delete news
- Toggle publish status
- Category selection (Tournament, Tips, Berita, Announcement)
- Target audience selection (all, players, admins)
- Rich content editing
- Visual category badges
- Publication status indicators

### 6. Updated TournamentCreationForm.tsx
Enhanced with new fields:
- Location (required)
- Prize (optional)
- Registration Fee (optional)
- Contact Person (optional)
- Max Participants (optional)
- All fields properly validated

## Key Features

### Flight System Benefits:
1. **Organized Play**: Players grouped into manageable flights
2. **Flexible Scheduling**: Each flight can have different start times
3. **Isolated Scoring**: Players only see scores from their flight
4. **Better Management**: Admins can manage players by flight groups
5. **Scalability**: Support for unlimited flights per tournament

### News System Benefits:
1. **Player Communication**: Send announcements to all players
2. **Targeted Messages**: Send to specific audiences (players/admins)
3. **Categorization**: Organize news by type
4. **Draft System**: Create and review before publishing
5. **Rich Content**: Support for images and detailed content

## Workflow

### Creating a Tournament with Flights:
1. Admin creates tournament with all details (location, prize, etc.)
2. Admin creates flights (e.g., "Flight A", "Flight B")
3. Admin adds players to each flight
4. Players can only view their flight's leaderboard
5. Admin can monitor all flights from Live Monitoring

### Managing News:
1. Admin creates news with title, excerpt, and content
2. Select category and target audience
3. Save as draft or publish immediately
4. Players see published news in their mobile app
5. Admin can edit or unpublish anytime

## Mobile Player Integration

The mobile player interface will display:
- Tournament list with banners and details
- Tournament details page with location, prize, schedule
- News feed with categorized news
- Flight-specific leaderboards

## Next Steps

To complete the implementation:

1. **Add Image Upload**:
   - Implement banner upload for tournaments
   - Implement image upload for news
   - Use Convex storage for images

2. **Update Mobile Components**:
   - Connect TournamentList to real data
   - Connect TournamentDetail to real data
   - Connect NewsFeed to real data
   - Add flight-based leaderboard filtering

3. **Add Flight-Based Scoring**:
   - Update scoring interface to show only flight players
   - Update leaderboard to filter by flight
   - Add flight information to player dashboard

4. **Testing**:
   - Test flight creation and player assignment
   - Test news creation and publishing
   - Test player view restrictions
   - Test tournament creation with all new fields

## Files Created/Modified

### Created:
- `convex/flights.ts` - Flight management functions
- `convex/news.ts` - News management functions
- `src/components/admin/FlightManagement.tsx`
- `src/components/admin/FlightPlayersView.tsx`
- `src/components/admin/AddPlayersToFlightModal.tsx`
- `src/components/admin/TournamentFlightManagement.tsx`
- `src/components/admin/NewsManagement.tsx`

### Modified:
- `convex/schema.ts` - Added new tables and fields
- `convex/tournaments.ts` - Updated tournament functions
- `src/components/admin/TournamentCreationForm.tsx` - Added new fields
- `src/components/admin/index.ts` - Exported new components
- `src/components/admin/AdminDashboard.tsx` - Already includes News menu

## Usage Instructions

### For Admins:

1. **Create Tournament**:
   - Go to Tournaments → Create New Tournament
   - Fill in all details including location, prize, etc.
   - Create tournament

2. **Setup Flights**:
   - Select tournament
   - Go to Flight Management
   - Create flights (e.g., "Flight A", "Flight B", "Flight C")
   - Set start times and start holes for each flight

3. **Add Players to Flights**:
   - Select a flight
   - Click "Add Players"
   - Search and select players
   - Set start holes if different from flight default
   - Add players

4. **Manage News**:
   - Go to News Management
   - Click "Create News"
   - Fill in title, excerpt, and content
   - Select category and target audience
   - Publish or save as draft

### For Players:
- View tournaments with banners and details
- See only their flight's leaderboard
- Receive news and announcements
- View tournament schedule and information

## Technical Notes

- All flight operations require admin authentication
- Players cannot see other flights' scores
- News can be targeted to specific audiences
- Tournament banners support image storage
- Flight system is fully integrated with existing scoring
