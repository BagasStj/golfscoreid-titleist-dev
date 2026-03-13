# Free Hole Scoring Improvement

## Overview
Improved the FlightScoringOverview component to allow players to input scores for any hole freely, with validation to ensure all players in a flight are on the same hole before proceeding, and a proper approval system to lock holes after approval.

## Key Changes

### 1. Free Hole Selection
- **Before**: Players had to follow a sequential hole order based on flight progress
- **After**: Players can click any hole number in the table header to input score for that hole
- Current hole is now determined by the last hole the player scored (if not yet approved)
- Initial state: `currentHole` is `null` when player hasn't scored any holes yet or when last scored hole is approved

### 2. Clickable Hole Headers
- Hole numbers in the table header are now clickable
- Clicking a hole number navigates to the scoring interface for that specific hole
- Visual feedback:
  - Hover effect on unscored holes (clickable)
  - Blue hover for scored but not approved holes (can edit)
  - Green background with checkmark for approved holes (locked)
  - Tooltip shows status: "Klik untuk input skor", "Klik untuk edit skor", or "Skor sudah disetujui (locked)"

### 3. Approval System
- **New Feature**: Proper hole approval system using localStorage
- When all players in a flight score the same hole, the "Setujui & Lanjutkan" button becomes enabled
- Clicking it:
  1. Marks that hole as "approved" in localStorage
  2. Locks the hole from further editing
  3. Reloads the page
  4. Sets `currentHole` to `null` (ready for next hole)
- Approved holes show a green checkmark icon in the header
- Approved holes cannot be clicked or edited

### 4. Hole Synchronization Validation
- **Validation**: Before accepting scores and moving forward, the system checks if all players in the flight are on the same hole
- If players are on different holes:
  - "Setujui & Lanjutkan" button is disabled
  - Clicking it shows an alert dialog explaining the mismatch
  - Lists which players are on which holes
  - Message: "Semua pemain dalam flight harus mengisi skor di hole yang sama sebelum dapat melanjutkan"

### 5. User Experience Improvements

#### Initial State (No Scores Yet)
- Shows: "Klik nomor hole untuk mulai" in the legend
- Displays info box: "Klik nomor hole di tabel untuk mulai input skor"
- All hole headers are clickable

#### After Scoring (Not Yet Approved)
- Shows: "Hole terakhir Anda: #X" in the legend
- "Edit Score Hole X" button to modify the last scored hole
- "Setujui & Lanjutkan" button (enabled only when all players on same hole)
- Can still click the hole header to edit

#### After Approval
- Shows: "Klik nomor hole untuk mulai" (ready for next hole)
- Approved hole shows green background with checkmark
- Cannot click or edit approved holes
- Can click any other unscored hole to continue

#### Hole Mismatch Alert
- Red warning icon
- Title: "Hole Tidak Sama"
- Details showing:
  - User's current hole
  - List of other players and their holes
  - Clear explanation of the requirement

## Technical Implementation

### State Management
```typescript
const [currentHole, setCurrentHole] = useState<number | null>(null);
const [showHoleMismatchAlert, setShowHoleMismatchAlert] = useState(false);
const [holeMismatchDetails, setHoleMismatchDetails] = useState<{
  userHole: number;
  otherPlayers: Array<{ name: string; hole: number }>;
} | null>(null);
```

### LocalStorage Keys
```typescript
// Approved holes per tournament per user
const approvedHolesKey = `approvedHoles_${tournamentId}_${userId}`;
// Stores array of approved hole numbers: [1, 2, 3, ...]
```

### Current Hole Determination
```typescript
useEffect(() => {
  if (currentUserScores !== undefined && id && user) {
    // Get approved holes from localStorage
    const approvedHolesKey = `approvedHoles_${id}_${user._id}`;
    const approvedHoles: number[] = JSON.parse(localStorage.getItem(approvedHolesKey) || '[]');
    
    if (currentUserScores.length > 0) {
      // Find the last hole the user scored
      const sortedScores = [...currentUserScores].sort((a, b) => b.holeNumber - a.holeNumber);
      const lastScoredHole = sortedScores[0].holeNumber;
      
      // If last scored hole is approved, set current hole to null (ready for next hole)
      if (approvedHoles.includes(lastScoredHole)) {
        setCurrentHole(null);
      } else {
        // Last scored hole not yet approved, show it as current
        setCurrentHole(lastScoredHole);
      }
    } else {
      // User hasn't scored any holes yet, set to null
      setCurrentHole(null);
    }
  }
}, [currentUserScores, id, user]);
```

### Approval Logic
```typescript
onClick={() => {
  if (!allOnSameHole) {
    // Show mismatch alert
    setShowHoleMismatchAlert(true);
    setHoleMismatchDetails({...});
  } else if (allPlayersScored && userLastHole !== null) {
    // Mark hole as approved
    const approvedHolesKey = `approvedHoles_${tournamentId}_${userId}`;
    const approvedHoles = JSON.parse(localStorage.getItem(approvedHolesKey) || '[]');
    
    if (!approvedHoles.includes(userLastHole)) {
      approvedHoles.push(userLastHole);
      localStorage.setItem(approvedHolesKey, JSON.stringify(approvedHoles));
    }
    
    // Reload to update the view
    window.location.reload();
  }
}}
```

### Clickable Hole Headers with Approval Check
```typescript
// Check if this hole is approved
const approvedHolesKey = currentUserId && tournamentId 
  ? `approvedHoles_${tournamentId}_${currentUserId}` 
  : null;
const approvedHoles: number[] = approvedHolesKey 
  ? JSON.parse(localStorage.getItem(approvedHolesKey) || '[]')
  : [];
const isApproved = approvedHoles.includes(hole.holeNumber);

<th
  onClick={() => {
    // Only allow clicking if hole is not approved
    if ((!userHasScoredThisHole || !isApproved) && onHoleClick) {
      onHoleClick(hole.holeNumber);
    }
  }}
  className={`... ${
    isApproved
      ? "bg-green-900/30 cursor-not-allowed opacity-60"
      : !userHasScoredThisHole
      ? "cursor-pointer hover:bg-red-600/20"
      : "cursor-pointer hover:bg-blue-600/20"
  }`}
  title={
    isApproved
      ? "Skor sudah disetujui (locked)"
      : userHasScoredThisHole
      ? "Klik untuk edit skor"
      : "Klik untuk input skor"
  }
>
  {hole.holeNumber}
  {isApproved && (
    <svg className="w-3 h-3 inline-block ml-0.5 text-green-400">
      {/* Checkmark icon */}
    </svg>
  )}
</th>
```

## User Flow

### Scenario 1: Starting Fresh
1. Player opens FlightScoringOverview
2. Sees "Klik nomor hole untuk mulai"
3. Clicks any hole number (e.g., Hole 5)
4. Navigates to scoring interface for Hole 5
5. Inputs score and submits
6. Returns to overview, now shows "Hole terakhir Anda: #5"

### Scenario 2: All Players on Same Hole → Approval
1. Player A scores Hole 3
2. Player B scores Hole 3
3. Player C scores Hole 3
4. All players see "Setujui & Lanjutkan" button enabled
5. Any player clicks it → Hole 3 is marked as approved (locked)
6. Page reloads, Hole 3 shows green checkmark
7. Players can now click any other hole to continue

### Scenario 3: Players on Different Holes
1. Player A scores Hole 3
2. Player B scores Hole 5
3. Player A tries to click "Setujui & Lanjutkan"
4. Alert shows: "Player B: Hole 5" (mismatch)
5. Players must coordinate to be on the same hole

### Scenario 4: Editing Before Approval
1. Player scores Hole 8
2. Realizes mistake, clicks Hole 8 header again
3. Can edit the score (not yet approved)
4. After all players score Hole 8 and approve
5. Hole 8 becomes locked (green checkmark)
6. Cannot edit anymore

## Benefits

1. **Flexibility**: Players can score holes in any order
2. **Better UX**: Clear visual feedback on hole status (unscored, scored, approved)
3. **Data Integrity**: Approval system ensures scores are locked after consensus
4. **Transparency**: Clear messaging about hole status and mismatches
5. **Edit Before Approval**: Players can fix mistakes before approval
6. **Visual Indicators**: Green checkmarks show which holes are locked

## Future Enhancements

1. Add real-time notifications when other players score
2. Show which holes each player has scored in the table
3. Add ability to skip holes (mark as not played)
4. Implement hole-by-hole approval instead of all-at-once
5. Add admin override to unlock approved holes if needed


## Approved Hole Protection

### Overview
Holes that have been approved (locked) cannot be edited or deleted. This ensures score integrity after all players in a flight have agreed on the scores.

### Implementation

**FlightScoringOverview - Hide Edit Button for Approved Holes:**
```typescript
// Check if current hole is approved
const approvedHolesKey = `approvedHoles_${tournamentId}_${userId}`;
const approvedHoles: number[] = JSON.parse(localStorage.getItem(approvedHolesKey) || '[]');
const isCurrentHoleApproved = currentHole !== null && approvedHoles.includes(currentHole);

// Only show Edit button if hole is not approved
{userHasScored && !isCurrentHoleApproved ? (
  <button>Edit Score Hole {currentHole}</button>
) : (
  <button>Input Skor</button>
)}
```

**ModernScoringInterface - Block Access to Approved Holes:**
```typescript
// Check if hole is approved
const approvedHolesKey = id && user ? `approvedHoles_${id}_${user._id}` : null;
const approvedHoles: number[] = approvedHolesKey 
  ? JSON.parse(localStorage.getItem(approvedHolesKey) || '[]')
  : [];
const isHoleApproved = currentHole ? approvedHoles.includes(currentHole.holeNumber) : false;

// Show locked message if hole is approved
if (isHoleApproved) {
  return <LockedHoleMessage />;
}
```

### Locked Hole UI
When a user tries to access an approved hole:
- Green checkmark icon
- Title: "Hole Terkunci 🔒"
- Message: "Skor untuk Hole X sudah disetujui dan tidak dapat diubah lagi"
- Shows current score in a green info box
- "Kembali ke Scorecard" button

### User Flow - Approved Hole Protection

1. Player scores Hole 10
2. All players in flight score Hole 10
3. Player clicks "Setujui & Lanjutkan"
4. Hole 10 is marked as approved (green checkmark)
5. Player tries to click Hole 10 header → Nothing happens (cursor: not-allowed)
6. "Edit Score Hole 10" button is hidden
7. If player somehow navigates to `/player/scoring/{id}?hole=10`:
   - Shows "Hole Terkunci" message
   - Cannot edit, update, or delete
   - Must go back to scorecard

### Benefits
1. **Data Integrity**: Approved scores cannot be changed
2. **Clear Visual Feedback**: Green checkmark shows locked status
3. **Multiple Protection Layers**: 
   - UI prevents clicking locked holes
   - Edit button hidden for approved holes
   - Scoring interface blocks access
4. **User-Friendly**: Clear message explains why hole is locked
