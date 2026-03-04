# Player Mobile Components

Mobile-optimized components for golf tournament players to view tournaments, submit scores, and track their performance.

## Components

### PlayerLayout
Mobile-optimized layout with bottom navigation.

**Props:**
- `children: ReactNode` - Content to render
- `currentView: 'dashboard' | 'scoring' | 'scorecard' | 'leaderboard'` - Current active view
- `onNavigate: (view) => void` - Navigation handler

**Features:**
- Sticky top header with user info
- Fixed bottom navigation bar
- Touch-friendly navigation buttons
- Responsive padding for content area

### PlayerDashboard
Landing page showing all tournaments the player is registered in.

**Props:**
- `onSelectTournament: (tournamentId) => void` - Tournament selection handler

**Features:**
- Large, tap-friendly tournament cards
- Tournament status indicators (upcoming, active, completed)
- Date highlighting for today's tournaments
- Game mode and course type display
- Empty state for no tournaments

### ScoringInterface
Main interface for submitting scores hole-by-hole.

**Props:**
- `tournamentId: Id<'tournaments'>` - Tournament ID
- `playerId: Id<'users'>` - Player ID

**Features:**
- Current hole indicator with quick score button
- Number pad for score input (1-9)
- Hole selection grid showing Par and completion status
- Visual feedback for current hole
- Last submitted score with undo option
- Real-time validation (positive integers only)
- Progress tracking (holes completed / total)

**Scoring Flow:**
1. Player sees current hole highlighted
2. Taps "Score Now" or selects hole from grid
3. Uses number pad to enter strokes
4. Submits score
5. Confirmation shown with undo option
6. Automatically moves to next hole

### PlayerScorecard
View of player's completed and remaining holes.

**Props:**
- `tournamentId: Id<'tournaments'>` - Tournament ID
- `playerId: Id<'users'>` - Player ID

**Features:**
- Progress summary (completed holes, total score/points, current hole)
- Completed holes list with score classifications
- Color-coded badges (birdie, par, bogey, etc.)
- Remaining holes grid
- Running total calculation
- Completion celebration message
- Points display for Stableford/System36

### PlayerLeaderboard
Real-time tournament leaderboard (all-holes ranking only).

**Props:**
- `tournamentId: Id<'tournaments'>` - Tournament ID
- `playerId: Id<'users'>` - Player ID

**Features:**
- Current player position highlighted
- Top 3 players with special badges (gold, silver, bronze)
- Real-time updates via Convex subscriptions
- Holes completed indicator
- Score/points display based on game mode
- "You" badge for current player
- Live update indicator

**Note:** Hidden holes ranking is NOT shown to players (admin only).

## Shared Components

### HoleCard
Reusable card for displaying hole information.

**Props:**
- `holeNumber: number` - Hole number (1-18)
- `par: number` - Par value (3-5)
- `index: number` - Difficulty index (1-18)
- `score?: number` - Optional score value
- `onScoreChange?: (score) => void` - Score change handler
- `isEditable?: boolean` - Enable score input
- `isCurrentHole?: boolean` - Highlight as current hole

**Features:**
- Hole number badge
- Par and Index labels
- Optional score input with validation
- Current hole highlighting
- Responsive design

### ScoreClassificationBadge
Color-coded badge for score classification.

**Props:**
- `score: number` - Strokes taken
- `par: number` - Par value
- `showLabel?: boolean` - Show full label or just +/- number

**Classifications:**
- Hole in One: Purple
- Albatross (-3 or better): Purple
- Eagle (-2): Blue
- Birdie (-1): Green
- Par (0): Yellow
- Bogey (+1): Orange
- Double Bogey (+2): Red
- Triple Bogey (+3): Dark Red
- Worse (+4 or more): Gray

## Usage Example

```tsx
import { useState } from 'react';
import {
  PlayerLayout,
  PlayerDashboard,
  ScoringInterface,
  PlayerScorecard,
  PlayerLeaderboard,
} from './components/player';

function PlayerApp() {
  const [view, setView] = useState<'dashboard' | 'scoring' | 'scorecard' | 'leaderboard'>('dashboard');
  const [selectedTournament, setSelectedTournament] = useState<Id<'tournaments'> | null>(null);
  const currentUser = useQuery(api.users.getCurrentUser);

  const renderView = () => {
    if (!selectedTournament) {
      return <PlayerDashboard onSelectTournament={setSelectedTournament} />;
    }

    switch (view) {
      case 'scoring':
        return <ScoringInterface tournamentId={selectedTournament} playerId={currentUser!._id} />;
      case 'scorecard':
        return <PlayerScorecard tournamentId={selectedTournament} playerId={currentUser!._id} />;
      case 'leaderboard':
        return <PlayerLeaderboard tournamentId={selectedTournament} playerId={currentUser!._id} />;
      default:
        return <PlayerDashboard onSelectTournament={setSelectedTournament} />;
    }
  };

  return (
    <PlayerLayout currentView={view} onNavigate={setView}>
      {renderView()}
    </PlayerLayout>
  );
}
```

## Design Principles

1. **Mobile-First**: All components optimized for mobile screens
2. **Touch-Friendly**: Large tap targets (minimum 44x44px)
3. **Real-Time**: Automatic updates via Convex subscriptions
4. **Visual Feedback**: Clear indicators for current state and actions
5. **Minimal Input**: Number pad and quick actions reduce typing
6. **Progressive Disclosure**: Show relevant information at each step
7. **Accessibility**: Color-coded with text labels for clarity

## Styling

All components use Tailwind CSS with the custom grass green theme:
- Primary: `grass-green-600` (#059669)
- Light: `grass-green-50` (#f0fdf4)
- Dark: `grass-green-800` (#065f46)

## Real-Time Features

All player components use Convex's reactive queries for real-time updates:
- Leaderboard updates when any player submits a score
- Scorecard updates when player submits a score
- Tournament list updates when admin creates tournaments
- No manual refresh needed - updates propagate within 2 seconds

## Navigation Flow

```
PlayerDashboard (Home)
    ↓ Select Tournament
    ├─→ ScoringInterface (Score)
    ├─→ PlayerScorecard (Card)
    └─→ PlayerLeaderboard (Board)
```

Bottom navigation allows switching between views while in a tournament.
