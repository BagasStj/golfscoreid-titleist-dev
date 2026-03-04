# Backend API Reference

## Overview

All backend functions are in the `convex/` directory. They are automatically deployed and type-safe.

## Authentication

Most functions require authentication via Convex Auth. Use `ctx.auth.getUserIdentity()` to get current user.

## Queries (Read Operations)

### users.getCurrentUser

Get the currently authenticated user.

**Returns:** `User | null`

```typescript
const user = useQuery(api.users.getCurrentUser);
```

### users.getAllPlayers

Get all players (admin only).

**Returns:** `User[]`

```typescript
const players = useQuery(api.users.getAllPlayers);
```

### tournaments.getTournaments

Get tournaments based on user role.
- Admin: all tournaments
- Player: only registered tournaments

**Returns:** `Tournament[]`

```typescript
const tournaments = useQuery(api.tournaments.getTournaments);
```

### tournaments.getTournamentDetails

Get full tournament details including participants and holes config.

**Args:**
- `tournamentId: Id<"tournaments">`

**Returns:** `TournamentDetails`

**Note:** Hides `hiddenHoles` from players.

```typescript
const details = useQuery(api.tournaments.getTournamentDetails, {
  tournamentId: "jh71tk14sr1twddwdkzh057md18006js"
});
```

## Mutations (Write Operations)

### users.createOrUpdateUser

Create or update a user.

**Args:**
- `email: string`
- `name: string`
- `role?: "admin" | "player"`
- `handicap?: number`

**Returns:** `{ success: boolean, userId: Id<"users">, isNew: boolean }`

```typescript
const result = useMutation(api.users.createOrUpdateUser);
await result({
  email: "player@example.com",
  name: "John Doe",
  role: "player",
  handicap: 12
});
```

### tournaments.createTournament

Create a new tournament (admin only).

**Args:**
- `name: string`
- `description: string`
- `date: number` (timestamp)
- `startHole: number` (1-18)
- `courseType: "18holes" | "F9" | "B9"`
- `gameMode: "strokePlay" | "system36" | "stableford"`
- `scoringDisplay: "over" | "stroke"`

**Returns:** `{ success: boolean, tournamentId: Id<"tournaments"> }`

```typescript
const create = useMutation(api.tournaments.createTournament);
await create({
  name: "Weekend Tournament",
  description: "Friendly competition",
  date: Date.now() + 86400000,
  startHole: 1,
  courseType: "18holes",
  gameMode: "strokePlay",
  scoringDisplay: "stroke"
});
```

### players.registerPlayers

Register multiple players to a tournament (admin only).

**Args:**
- `tournamentId: Id<"tournaments">`
- `players: Array<{ playerId: Id<"users">, startHole: number }>`

**Returns:** `{ success: boolean, registered: number, errors?: string[] }`

**Features:**
- Validates player existence
- Prevents duplicate registration
- Bulk registration support

```typescript
const register = useMutation(api.players.registerPlayers);
await register({
  tournamentId: "jh71tk14sr1twddwdkzh057md18006js",
  players: [
    { playerId: "jn78gwwhnhd6p087vq59sffav5801yt3", startHole: 1 },
    { playerId: "jn78gwwhnhd6p087vq59sffav5801yt4", startHole: 10 }
  ]
});
```

### hiddenHoles.setHiddenHoles

Set hidden holes for a tournament (admin only).

**Args:**
- `tournamentId: Id<"tournaments">`
- `hiddenHoles: number[]`

**Returns:** `{ success: boolean }`

**Validation:**
- 18holes: 1-18
- F9: 1-9
- B9: 10-18

```typescript
const setHidden = useMutation(api.hiddenHoles.setHiddenHoles);
await setHidden({
  tournamentId: "jh71tk14sr1twddwdkzh057md18006js",
  hiddenHoles: [5, 10, 15]
});
```

### scores.submitScore

Submit a score for a specific hole (player only).

**Args:**
- `tournamentId: Id<"tournaments">`
- `playerId: Id<"users">`
- `holeNumber: number`
- `strokes: number` (positive integer)

**Returns:** `{ success: boolean, scoreId: Id<"scores"> }`

**Validation:**
- Strokes must be a positive integer
- Prevents duplicate scores for same hole (use updateScore instead)

```typescript
const submit = useMutation(api.scores.submitScore);
await submit({
  tournamentId: "jh71tk14sr1twddwdkzh057md18006js",
  playerId: "jn78gwwhnhd6p087vq59sffav5801yt3",
  holeNumber: 1,
  strokes: 4
});
```

### scores.updateScore

Update an existing score (player can only update own scores).

**Args:**
- `scoreId: Id<"scores">`
- `newStrokes: number` (positive integer)

**Returns:** `{ success: boolean }`

**Authorization:** Player can only update their own scores.

```typescript
const update = useMutation(api.scores.updateScore);
await update({
  scoreId: "jh71tk14sr1twddwdkzh057md18006js",
  newStrokes: 5
});
```

### scores.getPlayerScores

Get all scores for a player in a tournament with enriched data.

**Args:**
- `tournamentId: Id<"tournaments">`
- `playerId: Id<"users">`

**Returns:** `EnrichedScore[]` (sorted by hole number)

**Enriched Data:**
- Par and Index for each hole
- Score classification (Birdie, Par, Bogey, etc.)
- Strokes vs Par
- Points (for Stableford/System36)
- Color coding

```typescript
const scores = useQuery(api.scores.getPlayerScores, {
  tournamentId: "jh71tk14sr1twddwdkzh057md18006js",
  playerId: "jn78gwwhnhd6p087vq59sffav5801yt3"
});
```

## Utility Mutations

### seedHolesConfig.seedHolesConfig

Seed 18 holes configuration (run once).

**Returns:** `{ success: boolean, message: string }`

```bash
npx convex run seedHolesConfig:seedHolesConfig
```

### seedUsers.seedTestUsers

Create test users for development.

**Returns:** `{ success: boolean, message: string, users: {...} }`

```bash
npx convex run seedUsers:seedTestUsers
```

### users.createTestAdmin

Create a test admin user.

**Args:**
- `email: string`
- `name: string`

```bash
npx convex run users:createTestAdmin '{"email":"admin@test.com","name":"Admin"}'
```

### users.createTestPlayer

Create a test player user.

**Args:**
- `email: string`
- `name: string`
- `handicap?: number`

```bash
npx convex run users:createTestPlayer '{"email":"player@test.com","name":"Player","handicap":12}'
```

### testBackend.testAllFunctions

Run backend test suite.

**Returns:** Test results with pass/fail status

```bash
npx convex run testBackend:testAllFunctions
```

### testScoring.testScoringSystem

Run scoring system test suite (calculations and database operations).

**Returns:** Test results with pass/fail status

```bash
npx convex run testScoring:testScoringSystem
```

### testScoringIntegration.testScoringIntegration

Run scoring integration tests (mutations, queries, and data flow).

**Returns:** Test results with pass/fail status

```bash
npx convex run testScoringIntegration:testScoringIntegration
```

## Scoring Calculations

### Score Classification

Scores are automatically classified based on strokes vs par:

| Classification | Strokes vs Par | Color |
|---------------|----------------|-------|
| Hole in One | 1 stroke (any par) | Gold |
| Albatross | -3 or better | Purple |
| Eagle | -2 | Blue |
| Birdie | -1 | Green |
| Par | 0 | Yellow |
| Bogey | +1 | Orange |
| Double Bogey | +2 | Red |
| Triple Bogey | +3 | Dark Red |
| Worse | +4 or more | Black |

### Game Mode Calculations

**Stroke Play:**
- Total = Sum of all strokes
- Winner = Lowest total

**Stableford:**
- Points per hole = 2 + (Par - Strokes), minimum 0
- Total = Sum of all points
- Winner = Highest total

**System36:**
- Birdie or better = 2 points
- Par = 2 points
- Bogey = 1 point
- Double Bogey or worse = 0 points
- Total = Sum of all points
- Winner = Highest total

## Error Handling

All mutations throw errors with descriptive messages:

```typescript
try {
  await createTournament({...});
} catch (error) {
  console.error(error.message);
  // "Unauthorized: Only admins can create tournaments"
}
```

Common errors:
- `"Unauthorized: Must be logged in"`
- `"Unauthorized: Only admins can..."`
- `"Authorization Error: You can only update your own scores"`
- `"Tournament not found"`
- `"Player not found"`
- `"Score not found"`
- `"Invalid hole number X for course type Y"`
- `"Validation Error: Strokes must be a positive integer"`
- `"Duplicate Error: Score already exists for this hole. Use updateScore to modify."`

## Type Safety

All functions are fully typed. Import types from:

```typescript
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
```

## Real-time Updates

Queries automatically re-run when data changes:

```typescript
// This updates automatically when tournaments change
const tournaments = useQuery(api.tournaments.getTournaments);
```

## Access Control

| Function | Admin | Player |
|----------|-------|--------|
| getCurrentUser | ✅ | ✅ |
| getAllPlayers | ✅ | ❌ |
| getTournaments | ✅ (all) | ✅ (registered only) |
| getTournamentDetails | ✅ (with hidden holes) | ✅ (without hidden holes) |
| createTournament | ✅ | ❌ |
| registerPlayers | ✅ | ❌ |
| setHiddenHoles | ✅ | ❌ |
| submitScore | ✅ | ✅ |
| updateScore | ✅ (own scores) | ✅ (own scores) |
| getPlayerScores | ✅ | ✅ |

## Database Schema

### users
```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  role: "admin" | "player",
  handicap?: number
}
```

### tournaments
```typescript
{
  _id: Id<"tournaments">,
  name: string,
  description: string,
  date: number,
  startHole: number,
  courseType: "18holes" | "F9" | "B9",
  gameMode: "strokePlay" | "system36" | "stableford",
  scoringDisplay: "over" | "stroke",
  hiddenHoles: number[],
  createdBy: Id<"users">,
  createdAt: number,
  status: "upcoming" | "active" | "completed"
}
```

### tournament_participants
```typescript
{
  _id: Id<"tournament_participants">,
  tournamentId: Id<"tournaments">,
  playerId: Id<"users">,
  startHole: number,
  registeredAt: number
}
```

### scores
```typescript
{
  _id: Id<"scores">,
  tournamentId: Id<"tournaments">,
  playerId: Id<"users">,
  holeNumber: number,
  strokes: number,
  submittedAt: number
}
```

### holes_config
```typescript
{
  _id: Id<"holes_config">,
  holeNumber: number,
  par: number,
  index: number,
  courseSection: "front9" | "back9"
}
```

## Indexes

Optimized queries with indexes:
- `users.by_email`
- `tournaments.by_status`
- `tournaments.by_created_by`
- `tournament_participants.by_tournament`
- `tournament_participants.by_player`
- `tournament_participants.by_tournament_and_player`
- `scores.by_tournament`
- `scores.by_player`
- `scores.by_tournament_and_player`
- `scores.by_tournament_player_hole`
- `holes_config.by_hole_number`
