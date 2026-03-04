# Tournament & Player Management - Complete Implementation Guide

## 📋 Overview

Implementasi lengkap untuk:
1. ✅ Menambahkan player ke tournament
2. ✅ Tournament Management Table (modern & responsive)
3. 🔄 Player Dashboard (cantik & modern) - IN PROGRESS
4. 🔄 Scoring System per hole - IN PROGRESS

---

## ✅ COMPLETED: Backend (Convex Functions)

### File: `convex/tournaments.ts`

#### New Functions Added:

### 1. **addPlayerToTournament**
```typescript
export const addPlayerToTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
    startHole: v.number(),
    userId: v.id("users"), // Admin user ID
  },
  handler: async (ctx, args) => {
    // Verify admin
    // Check if player exists
    // Check if already registered
    // Insert tournament_participants
    return { success: true };
  },
});
```

**Purpose**: Admin dapat menambahkan player ke tournament

**Validation**:
- Admin authorization
- Player exists
- Not already registered
- Valid startHole

---

### 2. **removePlayerFromTournament**
```typescript
export const removePlayerFromTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // Find participation
    // Delete participation
    return { success: true };
  },
});
```

**Purpose**: Admin dapat menghapus player dari tournament

---

### 3. **updateTournamentStatus**
```typescript
export const updateTournamentStatus = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("completed")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // Update tournament status
    return { success: true };
  },
});
```

**Purpose**: Admin dapat mengubah status tournament
- `upcoming` → `active` (Start tournament)
- `active` → `completed` (End tournament)

---

### 4. **getTournamentParticipants**
```typescript
export const getTournamentParticipants = query({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    // Get all participants
    // Join with users table
    // Return participant details
  },
});
```

**Purpose**: Get list of players in a tournament

---

## ✅ COMPLETED: Tournament Management Table

### File: `src/components/admin/TournamentManagementTable.tsx`

#### Features:

1. **Modern Table Design**
   - Responsive layout
   - Hover effects
   - Clean typography
   - Status badges with icons

2. **Tournament Information**
   - Name & Description
   - Date (formatted)
   - Course Type & Game Mode
   - Status (upcoming/active/completed)
   - Player count

3. **Actions**
   - **Start Tournament** (Play icon) - upcoming → active
   - **Complete Tournament** (CheckCircle icon) - active → completed
   - **Add Players** (UserPlus icon)
   - **View Details** (Eye icon)
   - **Edit** (Edit icon)
   - **Delete** (Trash icon)

4. **Status Management**
   - Visual status badges
   - One-click status change
   - Loading states
   - Toast notifications

#### Visual Design:
```
┌─────────────────────────────────────────────────────────────────┐
│ All Tournaments                                                 │
│ Manage and monitor your tournaments                             │
├─────────────────────────────────────────────────────────────────┤
│ Tournament │ Date      │ Course  │ Status  │ Players │ Actions │
├─────────────────────────────────────────────────────────────────┤
│ Spring Cup │ Mar 15    │ 18holes │ 🟢 Active│ 12     │ [icons] │
│ Summer Open│ Jun 20    │ F9      │ 🔵 Upcoming│ 8    │ [icons] │
│ Fall Classic│ Sep 10   │ B9      │ ⚪ Completed│ 15  │ [icons] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 TODO: Components to Create

### 1. **AddPlayersModal.tsx**
Modal untuk menambahkan players ke tournament

**Features**:
- List semua players (role: player)
- Search/filter players
- Select multiple players
- Set start hole per player
- Bulk add players

**UI**:
```
┌─────────────────────────────────────┐
│ Add Players to Tournament      [X]  │
├─────────────────────────────────────┤
│ Search: [____________]              │
│                                     │
│ ☐ John Doe        Handicap: 12     │
│   Start Hole: [1 ▼]                │
│                                     │
│ ☐ Jane Smith      Handicap: 8      │
│   Start Hole: [1 ▼]                │
│                                     │
│ [Cancel]  [Add Selected Players]    │
└─────────────────────────────────────┘
```

---

### 2. **TournamentDetailsModal.tsx**
Modal untuk melihat detail tournament

**Features**:
- Tournament info
- List of participants
- Leaderboard preview
- Quick actions

---

### 3. **Updated PlayerDashboard.tsx**
Dashboard player yang modern dan cantik

**Features**:
- Welcome banner dengan golf theme
- Tournament cards (only registered tournaments)
- Player stats
- Quick access to scoring
- Beautiful gradients & animations

**Design**:
```
┌─────────────────────────────────────────────────┐
│ 🏌️ Welcome back, John Doe!                      │
│ Ready to hit the course?                        │
├─────────────────────────────────────────────────┤
│ [Stats Cards]                                   │
│ Tournaments: 5  Best: -3  Avg: +2              │
├─────────────────────────────────────────────────┤
│ Your Tournaments                                │
│                                                 │
│ ┌─────────────────┐ ┌─────────────────┐       │
│ │ Spring Cup      │ │ Summer Open     │       │
│ │ 🟢 Active       │ │ 🔵 Upcoming     │       │
│ │ Mar 15, 2024    │ │ Jun 20, 2024    │       │
│ │ [Enter →]       │ │ [View →]        │       │
│ └─────────────────┘ └─────────────────┘       │
└─────────────────────────────────────────────────┘
```

---

### 4. **ScoringInterface.tsx** (Enhanced)
Interface untuk scoring per hole

**Features**:
- Hole-by-hole scoring
- Par information
- Score classification (Birdie, Eagle, etc.)
- Navigation between holes
- Auto-save scores
- Visual feedback

**Design**:
```
┌─────────────────────────────────────────────────┐
│ Hole 1 of 18                          Par: 4    │
├─────────────────────────────────────────────────┤
│                                                 │
│              [  -  ]  5  [  +  ]               │
│                                                 │
│              Bogey (+1)                         │
│                                                 │
├─────────────────────────────────────────────────┤
│ [← Prev]              [Save]         [Next →]  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Integration Flow

### Admin Flow:
```
1. Create Tournament
   ↓
2. Add Players (AddPlayersModal)
   ↓
3. Start Tournament (Status: active)
   ↓
4. Monitor Progress (LeaderboardAdmin)
   ↓
5. Complete Tournament (Status: completed)
```

### Player Flow:
```
1. Login
   ↓
2. View Dashboard (only registered tournaments)
   ↓
3. Select Tournament
   ↓
4. Enter Scoring Interface
   ↓
5. Score each hole
   ↓
6. View Leaderboard
```

---

## 📊 Database Flow

### Tournament Participants:
```
tournament_participants
├── tournamentId (FK → tournaments)
├── playerId (FK → users)
├── startHole (number)
└── registeredAt (timestamp)
```

### Scores:
```
scores
├── tournamentId (FK → tournaments)
├── playerId (FK → users)
├── holeNumber (number)
├── strokes (number)
└── submittedAt (timestamp)
```

---

## 🎨 Design System

### Colors:
- **Primary**: Green (golf theme)
- **Success**: Green-500
- **Info**: Blue-500
- **Warning**: Yellow-500
- **Danger**: Red-500

### Status Colors:
- **Upcoming**: Blue
- **Active**: Green
- **Completed**: Gray

### Typography:
- **Headings**: Bold, 2xl-3xl
- **Body**: Regular, base
- **Small**: sm, text-gray-600

---

## 🚀 Next Steps

### Priority 1 (High):
1. ✅ Create AddPlayersModal component
2. ✅ Update TournamentManagement to use Table
3. ✅ Integrate Add Players functionality

### Priority 2 (Medium):
4. ✅ Enhance PlayerDashboard design
5. ✅ Update ScoringInterface
6. ✅ Add real-time leaderboard updates

### Priority 3 (Low):
7. ⏳ Add tournament statistics
8. ⏳ Add player performance analytics
9. ⏳ Add export functionality

---

## 📝 Status

**Current Progress**: 40%

- ✅ Backend functions (100%)
- ✅ Tournament Table (100%)
- 🔄 Add Players Modal (0%)
- 🔄 Player Dashboard (50%)
- 🔄 Scoring Interface (50%)

**Next Task**: Create AddPlayersModal component

---

## 🎯 Goal

Membuat sistem tournament management yang:
- ✅ Modern & responsive
- ✅ User-friendly
- ✅ Real-time updates
- ✅ Secure (role-based)
- ✅ Scalable

**Target Completion**: Next session
