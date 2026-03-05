# Scoring Flow - Visual Guide

## Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Flight Scoring Overview                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Tournament Name                                     │    │
│  │ Flight Name                                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Course Info: 18 Holes, Par 72                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────┬─────────────────┐                     │
│  │  Kartu Skor ✓   │  Papan Peringkat│                     │
│  └─────────────────┴─────────────────┘                     │
│                                                              │
│  Legend: Eagle | Birdie | Par | Bogey | Double+            │
│  Hole saat ini: #1                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Scorecard Table                                     │    │
│  │ ┌──────┬───┬───┬───┬───┬───┬───┬───┬───┬───┐     │    │
│  │ │Player│ 1*│ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │ Par  │ 4 │ 5 │ 3 │ 4 │ 4 │ 5 │ 3 │ 4 │ 4 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │John  │ - │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ │(kamu)│   │   │   │   │   │   │   │   │   │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │Mike  │ - │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ └──────┴───┴───┴───┴───┴───┴───┴───┴───┴───┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [🎯 Input Skor]                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Click "Input Skor"
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Modern Scoring Interface                        │
│                                                              │
│  [← Back]                    Progress: 0/18 holes           │
│  ════════════════════════════════════════════════           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  HOLE: 1                              PAR: 4       │    │
│  │  Index 1                         [Prev] [Next →]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           YOUR STROKES                              │    │
│  │                 4                                   │    │
│  │                                                     │    │
│  │  [-]  ═══════●═══════  [+]                         │    │
│  │                                                     │    │
│  │  [Eagle][Birdie][Par][Bogey][Double]               │    │
│  │                                                     │    │
│  │  [✓ Submit Score]                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Submit Score
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Flight Scoring Overview                     │
│                                                              │
│  Legend: Eagle | Birdie | Par | Bogey | Double+            │
│  Hole saat ini: #1                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Scorecard Table                                     │    │
│  │ ┌──────┬───┬───┬───┬───┬───┬───┬───┬───┬───┐     │    │
│  │ │Player│ 1*│ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │ Par  │ 4 │ 5 │ 3 │ 4 │ 4 │ 5 │ 3 │ 4 │ 4 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │John  │ 4 │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ │(kamu)│🔵 │   │   │   │   │   │   │   │   │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │Mike  │ - │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ └──────┴───┴───┴───┴───┴───┴───┴───┴───┴───┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [✏️ Edit Score]                                    │    │
│  │  [⏸️ Menunggu 1 pemain lainnya] (DISABLED)         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mike scores...
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Flight Scoring Overview                     │
│                                                              │
│  Legend: Eagle | Birdie | Par | Bogey | Double+            │
│  Hole saat ini: #1                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Scorecard Table                                     │    │
│  │ ┌──────┬───┬───┬───┬───┬───┬───┬───┬───┬───┐     │    │
│  │ │Player│ 1*│ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │ Par  │ 4 │ 5 │ 3 │ 4 │ 4 │ 5 │ 3 │ 4 │ 4 │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │John  │ 4 │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ │(kamu)│🔵 │   │   │   │   │   │   │   │   │     │    │
│  │ ├──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤     │    │
│  │ │Mike  │ 5 │ - │ - │ - │ - │ - │ - │ - │ - │     │    │
│  │ │      │🟤 │   │   │   │   │   │   │   │   │     │    │
│  │ └──────┴───┴───┴───┴───┴───┴───┴───┴───┴───┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [✏️ Edit Score]                                    │    │
│  │  [✅ Lanjut ke Hole Berikutnya] (ENABLED)          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Click "Lanjut ke Hole Berikutnya"
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Modern Scoring Interface                        │
│                                                              │
│  [← Back]                    Progress: 1/18 holes           │
│  ████════════════════════════════════════════               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  HOLE: 2                              PAR: 5       │    │
│  │  Index 2                         [← Prev] [Next →] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ... (Scoring interface for Hole 2)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Button States

### State 1: Current Hole Not Scored
```
┌────────────────────────────────────────┐
│  [🎯 Input Skor]                       │  ← Red button
└────────────────────────────────────────┘
```

### State 2: Current Hole Scored, Waiting for Others
```
┌────────────────────────────────────────┐
│  [✏️ Edit Score]                       │  ← Blue button
│  [⏸️ Menunggu 2 pemain lainnya]       │  ← Gray (disabled)
└────────────────────────────────────────┘
```

### State 3: All Players Scored Current Hole
```
┌────────────────────────────────────────┐
│  [✏️ Edit Score]                       │  ← Blue button
│  [✅ Lanjut ke Hole Berikutnya]       │  ← Green button
└────────────────────────────────────────┘
```

### State 4: All Holes Completed
```
┌────────────────────────────────────────┐
│  [✏️ Edit Score]                       │  ← Blue button
│  [✅ Lanjut ke Hole Berikutnya]       │  ← Green button
│  [🏁 Selesaikan Pertandingan]         │  ← Gray button
└────────────────────────────────────────┘
```

## Visual Indicators

### Current Hole Highlighting
- Header column: Red background with ring
- Score cells: Light red tinted background
- Legend: "Hole saat ini: #X" in red

### Score Colors
- 🟡 Eagle (Par -2): Yellow with ring
- 🔴 Birdie (Par -1): Red with ring
- 🔵 Par: Blue
- 🟤 Bogey (Par +1): Gray
- ⚫ Double+ (Par +2): Dark gray
- ⚪ Not scored: Light gray with dash

### Player Highlighting
- Current user row: Red tinted background
- Current user badge: Red gradient
- Other players badge: Gray gradient
- "(kamu)" label next to current user name

## User Journey

1. **Open Scorecard** → See current hole highlighted
2. **Click "Input Skor"** → Navigate to scoring interface
3. **Input Score** → Submit and return to scorecard
4. **Wait for Others** → Button shows waiting count
5. **All Scored** → Button becomes enabled
6. **Continue** → Move to next hole
7. **Repeat** → Until all holes completed
8. **Finish** → Complete tournament

## Key Benefits

✅ Clear visual feedback on current hole
✅ Can't skip holes accidentally
✅ Fair play - all players score together
✅ Easy to edit scores if needed
✅ Smooth navigation flow
✅ Real-time status updates
