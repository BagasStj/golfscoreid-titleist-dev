# Live Monitoring Scorecard Format

## Overview
Live Monitoring Dashboard menampilkan scorecard dalam format tradisional golf dengan 2 mode tampilan:
1. **All Holes Scorecard**: Menampilkan semua holes (18 holes dengan OUT/IN atau 9 holes)
2. **Special Holes Scorecard**: Menampilkan hanya holes yang ditandai sebagai special scoring holes

## Tab Toggle
Jika tournament memiliki special holes yang dikonfigurasi, akan muncul toggle button untuk switch antara:
- **All Holes**: Scorecard lengkap semua holes
- **Special Holes**: Scorecard hanya special holes dengan highlight khusus

## Format Scorecard

### 1. All Holes Scorecard (18 Holes Layout)
```
┌─────────┬───┬───┬───┬───┬───┬───┬───┬───┬───┬─────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
│ Player  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ OUT │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │ IN │ TOTAL │
├─────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼─────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───────┤
│ PAR     │ 4 │ 4 │ 3 │ 5 │ 4 │ 4 │ 3 │ 4 │ 5 │ 36  │ 4  │ 5  │ 4  │ 3  │ 4  │ 4  │ 5  │ 3  │ 4  │ 36 │  72   │
├─────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼─────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼───────┤
│ John    │ 4 │ 5 │ 3 │ 5 │ 4 │ 3 │ 4 │ 4 │ 6 │ 38  │ 4  │ 5  │ 5  │ 3  │ 4  │ 4  │ 5  │ 2  │ 4  │ 36 │  74   │
│ Smith   │   │   │   │   │   │   │   │   │   │     │    │    │    │    │    │    │    │    │    │    │       │
│         │ Start: Hole 1 • Current: Hole 18                                                                    │
└─────────┴───┴───┴───┴───┴───┴───┴───┴───┴───┴─────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

### 9 Holes Layout (F9 or B9)
```
┌─────────┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───────┐
│ Player  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ TOTAL │
├─────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───────┤
│ PAR     │ 4 │ 4 │ 3 │ 5 │ 4 │ 4 │ 3 │ 4 │ 5 │  36   │
├─────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───────┤
│ John    │ 4 │ 5 │ 3 │ 5 │ 4 │ 3 │ 4 │ 4 │ 6 │  38   │
└─────────┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───────┘
```

### 2. Special Holes Scorecard
Menampilkan hanya holes yang dipilih sebagai special scoring holes:
```
┌─────────┬────┬────┬────┬────┬────┬───────┐
│ Player  │ ⭐3│ ⭐7│ ⭐12│ ⭐15│ ⭐18│ TOTAL │
├─────────┼────┼────┼────┼────┼────┼───────┤
│ PAR     │ 3  │ 3  │ 4  │ 4  │ 4  │  18   │
├─────────┼────┼────┼────┼────┼────┼───────┤
│ John    │ 3  │ 4  │ 5  │ 4  │ 4  │  20   │
└─────────┴────┴────┴────┴────┴────┴───────┘
```

**Features:**
- Star icon (⭐) pada setiap hole number
- Amber/gold color scheme untuk highlight
- Hanya menampilkan holes yang dipilih
- Total score dari special holes saja
- Sticky player column
- Color-coded scores sama seperti all holes

## Features

### 1. Dual Scorecard Mode
- **All Holes Mode**: Complete scorecard dengan semua holes
- **Special Holes Mode**: Filtered scorecard hanya special holes
- **Tab Toggle**: Easy switch antara kedua mode
- **Conditional Display**: Special holes tab hanya muncul jika dikonfigurasi

### 2. Table Structure
- **Header Row**: Hole numbers (1-9, OUT, 10-18, IN, TOTAL)
- **Par Row**: Par values for each hole with totals
- **Player Rows**: Each player's scores with real-time updates

### 2. Column Layout (18 Holes)
- **Player Column**: Sticky left column with player name and status
- **Holes 1-9**: Front nine scores
- **OUT Column**: Total for holes 1-9 (highlighted in green)
- **Holes 10-18**: Back nine scores
- **IN Column**: Total for holes 10-18 (highlighted in green)
- **TOTAL Column**: Grand total (highlighted in blue)

### 3. Score Color Coding
Scores are color-coded based on performance relative to par:

| Score Type | Color | Description |
|------------|-------|-------------|
| Birdie or Better | Green (bg-green-100) | Score < Par |
| Par | Gray (bg-gray-100) | Score = Par |
| Bogey | Yellow (bg-yellow-100) | Score = Par + 1 |
| Double Bogey+ | Red (bg-red-100) | Score > Par + 1 |

### 4. Player Information
Each player row shows:
- **Player Name**: Bold, prominent display
- **Start Hole**: Which hole the player started from
- **Current Hole**: Which hole the player is currently playing
- **Scores**: Color-coded scores for each hole
- **Totals**: OUT, IN, and TOTAL scores

### 5. Real-time Updates
- Scores update automatically using Convex reactive queries
- Live indicator with pulse animation
- Auto-refresh icon in header
- No manual refresh needed

## UI Components

### Header Section
```typescript
- Tournament name and details
- Course type (18 Holes, Front 9, Back 9)
- Game mode (Stroke Play, Stableford, System 36)
- Live indicator with animation
- Player count
```

### Scorecard Table
```typescript
- Responsive horizontal scroll
- Sticky player name column
- Color-coded scores
- Bold totals
- Alternating row colors for readability
```

### Legend
```typescript
- Visual guide for score colors
- Shows example scores with colors
- Helps users understand the color coding
```

## Technical Implementation

### Data Structure
```typescript
interface PlayerStatus {
  playerId: Id<"users">;
  playerName: string;
  startHole: number;
  currentHole: number;
  holesCompleted: number;
  totalScore: number;
  scorecard: Array<{
    holeNumber: number;
    strokes: number;
    par: number;
    index: number;
    submittedAt: number;
  }>;
}
```

### Helper Functions
```typescript
// Get score for a specific hole
getScoreForHole(playerScorecard, holeNumber)

// Calculate total for 9 holes
calculateNineTotal(playerScorecard, startHole, endHole)

// Get color class based on score vs par
getScoreColor(strokes, par)
```

### Responsive Design
- Horizontal scroll for mobile devices
- Sticky player name column
- Minimum column widths for readability
- Touch-friendly interface

## Special Holes Scorecard

### Purpose
Special holes scorecard memungkinkan admin untuk fokus pada holes tertentu yang memiliki scoring khusus atau kompetisi terpisah dalam tournament yang sama.

### Visual Design
- **Amber/Gold Theme**: Berbeda dari all holes (green/blue) untuk membedakan
- **Star Icons**: Setiap hole number memiliki star icon (⭐)
- **Highlighted Header**: Amber gradient background
- **Badge**: Menampilkan jumlah special holes

### Use Cases
1. **Nearest to Pin**: Holes par 3 untuk kompetisi nearest to pin
2. **Longest Drive**: Holes par 5 untuk kompetisi longest drive
3. **Challenge Holes**: Holes paling sulit untuk kompetisi terpisah
4. **Sponsor Holes**: Holes yang disponsori dengan hadiah khusus
5. **Side Competition**: Kompetisi tambahan dalam tournament utama

### Calculation
- Total score dihitung hanya dari special holes yang dipilih
- Par total juga hanya dari special holes
- Color coding tetap sama (birdie/par/bogey/double bogey)
- Real-time updates sama seperti all holes

### Example Configuration
Jika tournament memiliki special holes: [3, 7, 12, 15, 18]
- Scorecard akan menampilkan 5 kolom holes + 1 kolom total
- Par total = sum of par dari 5 holes tersebut
- Player score = sum of strokes dari 5 holes tersebut

## Course Type Support

### 18 Holes
- Shows all 18 holes in one table
- OUT total (holes 1-9)
- IN total (holes 10-18)
- Grand TOTAL

### Front 9 (F9)
- Shows holes 1-9 only
- Single TOTAL column

### Back 9 (B9)
- Shows holes 10-18 only
- Single TOTAL column

## Visual Hierarchy

### Colors
- **Green**: OUT/IN totals, positive scores
- **Blue**: Grand TOTAL
- **Yellow**: Par row background
- **Gray**: Table structure, borders
- **Score Colors**: Performance-based (green/gray/yellow/red)

### Typography
- **Bold**: Player names, totals, hole numbers
- **Semibold**: Scores, par values
- **Regular**: Labels, descriptions

### Borders
- **2px borders**: Major sections (player column, OUT, IN, TOTAL)
- **1px borders**: Regular cell divisions
- **Bottom borders**: Row separators

## Benefits

1. **Traditional Format**: Familiar to golfers
2. **Easy Scanning**: Quick visual comparison of scores
3. **Color Coding**: Instant performance feedback
4. **Real-time**: Live updates without refresh
5. **Comprehensive**: All information in one view
6. **Responsive**: Works on all screen sizes

## Usage

### Admin View
1. Navigate to "Live Monitoring"
2. Scorecard automatically displays active tournament
3. View all players' scores in real-time
4. Monitor progress with color-coded scores
5. See current hole for each player

### Data Flow
```
Active Tournament → Monitoring Query → Holes Config
                 ↓
         Player Scorecards
                 ↓
    Format into Table Layout
                 ↓
         Real-time Display
```

## Future Enhancements
- Export scorecard to PDF
- Print-friendly view
- Hole-by-hole statistics
- Player comparison view
- Historical round comparison
- Mobile-optimized vertical layout
