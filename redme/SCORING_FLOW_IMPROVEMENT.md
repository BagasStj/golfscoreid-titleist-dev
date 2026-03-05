# Scoring Flow Improvement

## Overview
Implemented an improved scoring flow that guides players through hole-by-hole scoring with better visual feedback and approval system. The current hole is determined by the first hole where NOT ALL players in the flight have scored.

## Flow Description

### 1. Flight Scoring Overview (`FlightScoringOverview.tsx`)
- Displays scorecard for all players in the flight
- Shows current hole being scored with visual highlighting
- **Current hole = first hole where not all players have scored**
- Provides action buttons based on scoring status

### 2. Scoring Interface (`ModernScoringInterface.tsx`)
- Modern interface for inputting scores
- Quick score buttons (Eagle, Birdie, Par, Bogey, Double)
- Stroke counter with slider
- Automatically navigates back to scorecard after submission
- Can accept `hole` parameter in URL to jump to specific hole

### 3. Action Button Logic

#### When Current User Has NOT Scored Current Hole:
- Shows "Input Skor" button (red)
- Clicking navigates to scoring interface for current hole
- Example: Hole 1, Bob and dev1 scored, Jane hasn't → Jane sees "Input Skor"

#### When Current User HAS Scored Current Hole:
- Shows "Edit Score" button (blue)
- Shows "Save & Lanjut ke Hole Berikutnya" button
  - **DISABLED** if not all players in flight have scored current hole
  - Shows count of waiting players (e.g., "Menunggu 1 pemain lainnya")
  - **ENABLED** (green) when all players have scored
- Example: Hole 1, Bob and dev1 scored, Jane hasn't → Bob sees "Edit Score" + disabled "Save" button

#### When All Players Scored Current Hole:
- "Save & Lanjut ke Hole Berikutnya" becomes ENABLED (green)
- Clicking advances to next hole that needs scoring
- Current hole automatically updates to next incomplete hole

#### When All Holes Completed:
- Shows "Selesaikan Pertandingan" button
- Allows player to finish the tournament

## Key Features

### Current Hole Logic
**IMPORTANT:** Current hole is determined by the FIRST hole where NOT ALL players have scored.

Example with 3 players (Bob, dev1, Jane):
- Hole 1: Bob ✓, dev1 ✓, Jane ✗ → **Current Hole = 1**
- Hole 2: Bob ✓, dev1 ✗, Jane ✗ → Current Hole stays 1 (not all scored hole 1)
- After Jane scores hole 1 → **Current Hole = 2** (first incomplete hole)

This ensures:
- All players stay synchronized
- No one can skip ahead
- Fair play for all participants

### Visual Indicators
1. **Current Hole Highlighting**
   - Header column for current hole has red background
   - Score cells for current hole have red tinted background
   - Legend shows "Hole saat ini: #X"

2. **Score Color Coding**
   - Eagle: Yellow with ring
   - Birdie: Red with ring
   - Par: Blue
   - Bogey: Gray
   - Double Bogey+: Dark gray

3. **Player Ranking**
   - Players sorted by total strokes (lowest first)
   - Current user highlighted with red background
   - Position number shown in badge

### Approval System
- Players must wait for all flight members to score current hole
- "Lanjut ke Hole Berikutnya" button disabled until all scores submitted
- Shows count of players still pending

### Auto-Navigation
- After submitting score, automatically returns to scorecard
- Current hole automatically advances to next unscored hole
- Smooth transition with success toast

## Technical Implementation

### State Management
```typescript
const [currentHole, setCurrentHole] = useState<number>(1);
```

### Current Hole Detection
```typescript
// Find first hole where not all players have scored
for (const hole of tournament.holesConfig) {
  const playersWhoScored = allParticipantScores.filter(ps => 
    ps.scores?.some(s => s.holeNumber === hole.holeNumber)
  ).length;
  
  if (playersWhoScored < flightParticipants.length) {
    setCurrentHole(hole.holeNumber);
    return; // This is the current hole
  }
}
```

### All Players Scored Check
```typescript
const playersWhoScored = participantScores.filter(ps => 
  ps.scores?.some(s => s.holeNumber === currentHole)
);
const allPlayersScored = playersWhoScored.length === flightParticipants.length;
const waitingCount = flightParticipants.length - playersWhoScored.length;
```

## User Experience Flow

### Scenario: 3 Players (Bob, dev1, Jane) - Hole 1

**Initial State:**
- Current Hole: 1
- Bob: not scored
- dev1: not scored  
- Jane: not scored

**Step 1: Bob scores hole 1**
- Bob clicks "Input Skor" → scores 4 → returns to scorecard
- Bob now sees: "Edit Score" + "Menunggu 2 pemain lainnya" (disabled)
- Current Hole: still 1 (dev1 and Jane haven't scored)

**Step 2: dev1 scores hole 1**
- dev1 clicks "Input Skor" → scores 4 → returns to scorecard
- dev1 now sees: "Edit Score" + "Menunggu 1 pemain lainnya" (disabled)
- Bob's button updates to: "Menunggu 1 pemain lainnya" (disabled)
- Current Hole: still 1 (Jane hasn't scored)

**Step 3: Jane scores hole 1**
- Jane clicks "Input Skor" → scores dash → returns to scorecard
- ALL players now see: "Edit Score" + "Save & Lanjut ke Hole Berikutnya" (ENABLED, green)
- Current Hole: still 1 (but all scored, can proceed)

**Step 4: Any player clicks "Save & Lanjut ke Hole Berikutnya"**
- Navigates to scoring interface for hole 2
- Current Hole: updates to 2
- Process repeats for hole 2

### Scenario: Player Tries to Skip Ahead

**Situation:**
- Current Hole: 1 (Jane hasn't scored)
- Bob already scored hole 1
- Bob tries to score hole 2

**Result:**
- Bob can only edit hole 1 or wait
- "Save" button is disabled
- Cannot proceed to hole 2 until Jane scores hole 1
- System enforces sequential, synchronized scoring

## Benefits

1. **Clear Visual Feedback**
   - Players always know which hole they're on
   - Easy to see who has scored and who hasn't

2. **Prevents Confusion**
   - Can't skip holes accidentally
   - Must complete current hole before moving on

3. **Fair Play**
   - All players must score together
   - No one can rush ahead

4. **Better UX**
   - Smooth navigation flow
   - Clear button states
   - Helpful status messages

## Files Modified

1. `src/components/player/FlightScoringOverview.tsx`
   - Added currentHole state
   - Added ActionButtons component
   - Added current hole detection logic
   - Added visual highlighting for current hole

2. `src/components/player/ModernScoringInterface.tsx`
   - Changed navigation to return to scorecard after submission
   - Removed auto-advance to next hole

## Future Enhancements

1. Add push notifications when all players have scored
2. Add ability to score multiple holes at once (batch scoring)
3. Add hole-by-hole statistics and insights
4. Add live scoring updates (real-time)
