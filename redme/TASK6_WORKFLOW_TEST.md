# Task 6 Workflow Testing Guide

## Prerequisites

Before testing, ensure:
1. Convex backend is running (`npx convex dev`)
2. Frontend dev server is running (`npm run dev`)
3. Test users are seeded in the database

## Test 1: Admin Complete Workflow

### Step 1: Login as Admin
1. Navigate to `http://localhost:5173/login`
2. Enter admin credentials:
   - Name: "Admin User"
   - Email: "admin@golfscore.id"
3. Click "Login"
4. **Expected**: Redirect to `/admin` dashboard

### Step 2: Create Tournament
1. Click "Create Tournament" tab
2. Fill in tournament details:
   - Name: "Test Tournament"
   - Description: "Testing routing and auth"
   - Date: Today's date
   - Course Type: "18holes"
   - Game Mode: "strokePlay"
   - Start Hole: 1
3. Click "Create Tournament"
4. **Expected**: Tournament created, redirect to "Register Players" tab

### Step 3: Register Players
1. Select tournament from dropdown (if not auto-selected)
2. Select multiple players from the list
3. Assign start holes
4. Click "Register Players"
5. **Expected**: Players registered successfully

### Step 4: Set Hidden Holes
1. Click "Hidden Holes" tab
2. Select 3-5 holes as hidden
3. Click "Save Hidden Holes"
4. **Expected**: Hidden holes saved successfully

### Step 5: Monitor Live Scoring
1. Click "Live Monitoring" tab
2. **Expected**: See all registered players with status
3. Verify real-time updates when players submit scores

### Step 6: View Leaderboard
1. Click "Leaderboard" tab
2. **Expected**: See both all-holes and hidden-holes rankings
3. Verify rankings update in real-time

### Step 7: Switch to Player View
1. Click "Player View" button in header
2. **Expected**: Navigate to `/player` dashboard
3. Verify admin can see their tournaments

### Step 8: Logout
1. Click "Logout" button
2. **Expected**: Redirect to `/login`

## Test 2: Player Complete Workflow

### Step 1: Login as Player
1. Navigate to `http://localhost:5173/login`
2. Enter player credentials:
   - Name: "Player One"
   - Email: "player1@golfscore.id"
3. Click "Login"
4. **Expected**: Redirect to `/player` dashboard

### Step 2: View Tournaments
1. **Expected**: See list of tournaments player is registered in
2. Verify tournament cards show:
   - Tournament name and description
   - Date (with "Today" badge if applicable)
   - Course type and game mode
   - Status badge

### Step 3: Enter Tournament
1. Click on a tournament card
2. **Expected**: Navigate to `/player/tournament/:id/scoring`
3. Verify URL contains tournament ID

### Step 4: Submit Scores
1. Verify current hole is highlighted
2. Click "Score Now" or select a hole
3. Enter score using number pad
4. Click "Submit Score"
5. **Expected**: Score submitted, hole marked as completed
6. Repeat for 2-3 more holes

### Step 5: View Scorecard
1. Click "Scorecard" button
2. **Expected**: Navigate to `/player/tournament/:id/scorecard`
3. Verify scorecard shows:
   - Completed holes with scores
   - Score classifications (Eagle, Birdie, Par, etc.)
   - Running total
   - Remaining holes
   - Current hole highlighted

### Step 6: View Leaderboard
1. Click "Leaderboard" button
2. **Expected**: Navigate to `/player/tournament/:id/leaderboard`
3. Verify leaderboard shows:
   - All players ranked
   - Current player highlighted
   - Real-time updates
   - Only all-holes ranking (hidden ranking not visible)

### Step 7: Return to Scoring
1. Click "Back to Scoring" button
2. **Expected**: Navigate back to `/player/tournament/:id/scoring`
3. Verify scoring state is preserved

### Step 8: Return to Dashboard
1. Click "Back" button
2. **Expected**: Navigate to `/player` dashboard
3. Verify can select another tournament

### Step 9: Logout
1. Click "Logout" button
2. **Expected**: Redirect to `/login`

## Test 3: Deep Linking

### Test 3.1: Direct Tournament Access (Authenticated)
1. Login as player
2. Copy tournament scoring URL (e.g., `/player/tournament/abc123/scoring`)
3. Open new tab
4. Paste URL
5. **Expected**: Direct access to tournament scoring page

### Test 3.2: Direct Tournament Access (Unauthenticated)
1. Logout
2. Paste tournament URL in browser
3. **Expected**: Redirect to `/login`
4. Login
5. **Expected**: Redirect to player dashboard (not back to tournament)

### Test 3.3: Admin Route Access (Player)
1. Login as player
2. Navigate to `/admin` directly
3. **Expected**: Redirect to `/player` dashboard

### Test 3.4: Admin Route Access (Admin)
1. Login as admin
2. Navigate to `/admin` directly
3. **Expected**: Access granted to admin dashboard

## Test 4: Navigation Flow

### Test 4.1: Player Navigation
1. Login as player
2. Dashboard → Tournament → Scoring
3. Scoring → Scorecard → Leaderboard
4. Leaderboard → Scoring → Dashboard
5. **Expected**: All navigation works smoothly

### Test 4.2: Admin Navigation
1. Login as admin
2. Dashboard → Create → Register → Hidden → Monitoring → Leaderboard
3. **Expected**: All tabs accessible
4. Select different tournament from dropdown
5. **Expected**: Views update for selected tournament

### Test 4.3: Cross-Role Navigation (Admin)
1. Login as admin
2. Admin Dashboard → Player View
3. **Expected**: Navigate to player dashboard
4. Verify admin can access player features
5. **Expected**: Can return to admin dashboard

## Test 5: Authentication State

### Test 5.1: Page Refresh (Authenticated)
1. Login as player
2. Navigate to tournament scoring
3. Refresh page (F5)
4. **Expected**: Stay on same page, authentication preserved

### Test 5.2: Page Refresh (Unauthenticated)
1. Logout
2. Navigate to any protected route
3. **Expected**: Redirect to login

### Test 5.3: Multiple Tabs
1. Login in Tab 1
2. Open Tab 2
3. **Expected**: Tab 2 shows authenticated state
4. Logout in Tab 1
5. **Expected**: Tab 2 updates to show logged out state

## Test 6: Loading States

### Test 6.1: Initial Load
1. Clear browser cache
2. Navigate to `/player`
3. **Expected**: See loading spinner briefly
4. **Expected**: Redirect to login or show dashboard

### Test 6.2: Route Transitions
1. Login as player
2. Navigate between routes
3. **Expected**: Smooth transitions without flicker
4. **Expected**: Loading states for data fetching

## Test 7: Error Handling

### Test 7.1: Invalid Route
1. Navigate to `/invalid-route`
2. **Expected**: Redirect to `/` (then to `/player` or `/login`)

### Test 7.2: Invalid Tournament ID
1. Login as player
2. Navigate to `/player/tournament/invalid-id/scoring`
3. **Expected**: Graceful error handling or redirect

### Test 7.3: Network Error
1. Stop Convex backend
2. Try to login
3. **Expected**: Error message displayed
4. Restart backend
5. Try again
6. **Expected**: Login works

## Test 8: Responsive Design

### Test 8.1: Mobile View
1. Open browser dev tools
2. Switch to mobile viewport (375x667)
3. Test all workflows
4. **Expected**: All features work on mobile
5. **Expected**: Touch-friendly buttons
6. **Expected**: Proper layout on small screen

### Test 8.2: Tablet View
1. Switch to tablet viewport (768x1024)
2. Test admin dashboard
3. **Expected**: Optimal layout for tablet
4. **Expected**: All features accessible

### Test 8.3: Desktop View
1. Switch to desktop viewport (1920x1080)
2. Test all features
3. **Expected**: Full desktop layout
4. **Expected**: Proper spacing and sizing

## Success Criteria

All tests should pass with:
- ✅ Correct navigation between routes
- ✅ Proper authentication checks
- ✅ Role-based access control working
- ✅ Deep linking functional
- ✅ Loading states displayed
- ✅ No console errors
- ✅ Responsive design working
- ✅ Real-time updates functioning
- ✅ Smooth user experience

## Known Issues

1. TypeScript build errors in Convex backend (from previous tasks)
   - Does not affect runtime functionality
   - Should be fixed in future tasks

2. Logout functionality is simplified
   - Currently just redirects to login
   - Real implementation would clear Convex auth session
   - Works for development/testing purposes

## Notes

- All routes support browser back/forward buttons
- Authentication state persists across page refreshes
- Real-time updates work via Convex subscriptions
- No manual polling required
- All components are responsive by default
