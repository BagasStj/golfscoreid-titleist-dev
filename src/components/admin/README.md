# Admin Dashboard Components

This directory contains all admin-facing components for the GolfScore ID Tournament App. These components provide a complete admin interface for managing tournaments, registering players, configuring hidden holes, and monitoring live tournament progress.

## Components Overview

### 1. TournamentCreationForm.tsx
**Purpose**: Form for creating new tournaments with all configuration options.

**Features**:
- Tournament name and description input
- Date and time selection
- Start hole configuration (1-18)
- Course type selection (18 holes, F9, B9)
- Game mode selection (Stroke Play, Stableford, System36)
- Scoring display mode (Stroke, Over/Under Par)
- Form validation with error display
- Loading states during submission

**Props**:
- `onSuccess?: (tournamentId: string) => void` - Callback when tournament is created

**Convex Integration**:
- Uses `api.tournaments.createTournament` mutation

### 2. PlayerRegistrationPanel.tsx
**Purpose**: Interface for registering multiple players to a tournament.

**Features**:
- Multi-select dropdown for available players
- Individual start hole assignment per player
- Bulk player registration
- Display of already registered players
- Duplicate registration prevention
- Success/error feedback

**Props**:
- `tournamentId: Id<'tournaments'>` - Tournament to register players to
- `onSuccess?: () => void` - Callback after successful registration

**Convex Integration**:
- Uses `api.users.getAllPlayers` query
- Uses `api.tournaments.getTournamentDetails` query
- Uses `api.players.registerPlayers` mutation

### 3. HiddenHolesSelector.tsx
**Purpose**: UI for selecting hidden holes for the dual ranking system.

**Features**:
- Visual checkbox grid for hole selection
- Course type-aware hole range (validates based on 18/F9/B9)
- Select All / Clear All quick actions
- Real-time selected count display
- Validation based on course type
- Hidden from player views (admin only)

**Props**:
- `tournamentId: Id<'tournaments'>` - Tournament to configure
- `onSuccess?: () => void` - Callback after successful save

**Convex Integration**:
- Uses `api.tournaments.getTournamentDetails` query
- Uses `api.hiddenHoles.setHiddenHoles` mutation

### 4. LiveMonitoringDashboard.tsx
**Purpose**: Real-time monitoring of all players' scoring progress.

**Features**:
- Grid/card view of all players
- Current hole display (calculated from start hole + completed holes)
- Progress tracking (holes completed / total holes)
- Last scored hole and score display
- Total score tracking
- Expandable scorecard view per player
- Real-time updates via Convex subscriptions
- Progress bar visualization

**Props**:
- `tournamentId: Id<'tournaments'>` - Tournament to monitor

**Convex Integration**:
- Uses `api.monitoring.getLiveMonitoring` query (real-time)

**Calculations**:
- Current hole: `(startHole + completedHoles - 1) % totalHoles + 1`
- Progress percentage: `(holesCompleted / totalHoles) * 100`

### 5. LeaderboardAdmin.tsx
**Purpose**: Admin view of tournament rankings with dual ranking system.

**Features**:
- All holes ranking display
- Hidden holes ranking display (when configured)
- Side-by-side dual ranking view
- Top 3 players highlighted with medal colors
- Game mode-aware sorting (ascending for stroke play, descending for points)
- Real-time updates via Convex subscriptions
- Responsive table layout

**Props**:
- `tournamentId: Id<'tournaments'>` - Tournament to display leaderboard for

**Convex Integration**:
- Uses `api.leaderboard.getLeaderboard` query (real-time)

**Display Logic**:
- Stroke Play: Lower score is better (ascending sort)
- Stableford/System36: Higher points is better (descending sort)
- Tie-breaking: Same score = same rank, next rank skips

### 6. AdminLayout.tsx
**Purpose**: Navigation sidebar and layout container for admin interface.

**Features**:
- Collapsible sidebar navigation
- User info display
- Tournament selector dropdown
- Navigation items with icons
- Disabled state for tournament-dependent views
- Role-based access control (admin only)
- Responsive layout

**Props**:
- `children?: React.ReactNode` - Content to render in main area

**Navigation Items**:
- Tournaments (always available)
- Create Tournament (always available)
- Register Players (requires tournament selection)
- Hidden Holes (requires tournament selection)
- Live Monitoring (requires tournament selection)
- Leaderboard (requires tournament selection)

### 7. AdminDashboard.tsx
**Purpose**: Complete integrated admin dashboard with all components.

**Features**:
- Top navigation bar with user info
- Horizontal tab navigation
- Tournament selector
- View switching between all admin functions
- Integrated workflow (create → register → configure → monitor)
- Role-based access control

**Usage**:
```tsx
import AdminDashboard from './components/admin/AdminDashboard';

// In your app
<AdminDashboard />
```

## Convex Queries and Mutations Used

### Queries (Real-time)
- `api.users.getCurrentUser` - Get authenticated user
- `api.users.getAllPlayers` - Get all players for registration
- `api.tournaments.getTournaments` - Get all tournaments
- `api.tournaments.getTournamentDetails` - Get tournament with participants
- `api.monitoring.getLiveMonitoring` - Get live player status
- `api.leaderboard.getLeaderboard` - Get dual rankings

### Mutations
- `api.tournaments.createTournament` - Create new tournament
- `api.players.registerPlayers` - Register players to tournament
- `api.hiddenHoles.setHiddenHoles` - Set hidden holes configuration

## Styling

All components use:
- **Tailwind CSS** for styling
- **Grass Green Theme** (`grass-green-50` to `grass-green-950`)
- **Responsive Design** (mobile-first approach)
- **Card-based Layouts** for content organization
- **Smooth Transitions** for interactive elements

### Color Scheme
- Primary: Grass Green (`grass-green-600`, `grass-green-700`)
- Success: Grass Green shades
- Error: Red shades (`red-50`, `red-600`, `red-800`)
- Warning: Amber shades (`amber-50`, `amber-700`)
- Neutral: Gray shades

## Real-time Updates

All components that display live data use Convex's reactive queries:
- **LiveMonitoringDashboard**: Updates when players submit scores
- **LeaderboardAdmin**: Updates when rankings change
- **PlayerRegistrationPanel**: Updates when players are registered

No manual refresh or polling required - Convex handles real-time subscriptions automatically.

## Error Handling

All components implement:
- Form validation with inline error messages
- API error handling with user-friendly messages
- Loading states during async operations
- Disabled states for invalid actions
- Success feedback after operations

## Requirements Validation

These components satisfy the following requirements from the design document:

- **Requirement 1.1**: Tournament creation with all settings
- **Requirement 2.2**: Bulk player registration
- **Requirement 2.3**: Start hole assignment per player
- **Requirement 3.1**: Hidden holes selection with validation
- **Requirement 3.2**: Hidden holes storage and retrieval
- **Requirement 7.4**: Dual ranking display
- **Requirement 8.1**: Real-time leaderboard display
- **Requirement 8.3**: Complete player information in leaderboard
- **Requirements 13.1-13.6**: Complete live monitoring functionality

## Usage Example

```tsx
import { AdminDashboard } from './components/admin';

function App() {
  return <AdminDashboard />;
}
```

Or use individual components:

```tsx
import { 
  TournamentCreationForm,
  PlayerRegistrationPanel,
  LiveMonitoringDashboard 
} from './components/admin';

function CustomAdminView() {
  const [tournamentId, setTournamentId] = useState<Id<'tournaments'> | null>(null);

  return (
    <div>
      <TournamentCreationForm onSuccess={setTournamentId} />
      {tournamentId && (
        <>
          <PlayerRegistrationPanel tournamentId={tournamentId} />
          <LiveMonitoringDashboard tournamentId={tournamentId} />
        </>
      )}
    </div>
  );
}
```

## Testing

To test the admin components:

1. Ensure you have an admin user in the database
2. Login as admin
3. Navigate to the admin dashboard
4. Test the complete workflow:
   - Create a tournament
   - Register players
   - Set hidden holes
   - Monitor live progress
   - View leaderboard

## Future Enhancements

Potential improvements for future tasks:
- Export leaderboard to CSV/PDF
- Tournament status management (activate/complete)
- Player search and filtering
- Bulk operations (delete, update)
- Tournament templates
- Historical data views
- Analytics and statistics
