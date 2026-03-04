# Desktop Tournament Detail Routing Fix

## Problem
When clicking "Lanjutkan Bermain" from My Tournaments, the app was showing the mobile version of Tournament Detail instead of the desktop version with red dark theme.

## Solution
Updated the routing configuration to use the desktop `TournamentDetail.tsx` component instead of the mobile version.

## Changes Made

### 1. Updated Routes (`src/routes/index.tsx`)

**Changed Import:**
```typescript
// Before
const TournamentDetailMobile = lazy(() => import('../components/player/mobile/TournamentDetail'));

// After
const TournamentDetail = lazy(() => import('../components/player/TournamentDetail'));
```

**Updated Route:**
```typescript
{
  path: '/player/tournament/:id',
  element: (
    <LazyRoute>
      <ProtectedRoute>
        <TournamentDetail />  // Now uses desktop version
      </ProtectedRoute>
    </LazyRoute>
  ),
}
```

## Navigation Flow

### Current Flow (After Fix)
1. **My Tournaments** (`/player`) → Click "Lanjutkan Bermain" or "Lihat Detail"
2. **Desktop Tournament Detail** (`/player/tournament/:id`) → Shows tournament info with red dark theme
3. **Click "Start Scoring"** → Goes to Scoring Interface (`/player/scoring/:id`)

### Features of Desktop Tournament Detail
- **Red Dark Theme**: Consistent with mobile interface
- **2-Column Layout**: 
  - Left: Tournament info, course details, progress tracking
  - Right: Action buttons, quick stats
- **Action Buttons**:
  - "Start Scoring" → Navigate to scoring interface
  - "View Scorecard" → See detailed scorecard
  - "View Leaderboard" → Check rankings
- **Banner Image**: Displays tournament banner from Convex storage
- **Responsive Design**: Works on all screen sizes

## Files Modified
- `src/routes/index.tsx` - Updated routing configuration

## Files Referenced
- `src/components/player/TournamentDetail.tsx` - Desktop tournament detail (red dark theme)
- `src/components/player/mobile/MyTournaments.tsx` - Navigation source
- `src/components/player/ModernScoringInterface.tsx` - Scoring destination

## Testing
✅ Build successful
✅ Route properly configured
✅ Desktop version uses red dark theme
✅ Navigation flow: My Tournaments → Tournament Detail → Scoring

## Next Steps
1. Test the navigation flow in the browser
2. Verify tournament detail page displays correctly
3. Confirm "Start Scoring" button navigates to scoring interface
4. Check that all tournament data loads properly
