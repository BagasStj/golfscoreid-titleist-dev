# GolfScore ID Tournament App

Aplikasi web responsive untuk mencatat scoring golf tournament dengan fitur real-time scoring, dual ranking system, dan hidden holes selection.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex.dev (Real-time Database)
- **Styling**: Tailwind CSS v4 (white base with grass green accents)
- **State Management**: Convex React (built-in real-time subscriptions)

## Features

- ✅ Tournament Management (Create, Configure, View)
- ✅ Player Registration with Start Hole Assignment
- ✅ Hidden Holes Selection (Admin Only)
- ✅ Real-time Score Submission
- ✅ Dual Ranking System (All Holes + Hidden Holes)
- ✅ Live Monitoring Dashboard
- ✅ Multiple Game Modes (Stroke Play, Stableford, System36)
- ✅ Responsive Design (Mobile, Tablet, Desktop)

## Project Structure

```
golfscore-app/
├── convex/                    # Convex backend
│   ├── schema.ts             # Database schema
│   ├── tournaments.ts        # Tournament queries & mutations
│   ├── players.ts            # Player registration
│   ├── hiddenHoles.ts        # Hidden holes management
│   ├── users.ts              # User management
│   ├── seedHolesConfig.ts    # Seed holes data
│   ├── seedUsers.ts          # Seed test users
│   └── testBackend.ts        # Backend tests
├── src/
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main app component
│   └── main.tsx              # App entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd golfscore-app
npm install
```

3. Setup Convex:
```bash
npx convex dev
```

This will:
- Create a Convex project
- Generate `.env.local` with deployment URL
- Push schema and functions to Convex

4. Seed initial data:
```bash
# Seed holes configuration (18 holes with Par and Index)
npx convex run seedHolesConfig:seedHolesConfig

# Seed test users (1 admin + 3 players)
npx convex run seedUsers:seedTestUsers
```

5. Start development server:
```bash
npm run dev
```

6. Open browser at `http://localhost:5173`

### Test Users

After seeding, you can use these test accounts:

**Admin:**
- Email: admin@golfscore.id
- Name: Admin User

**Players:**
- Email: player1@golfscore.id (Handicap: 12)
- Email: player2@golfscore.id (Handicap: 18)
- Email: player3@golfscore.id (Handicap: 8)

## Development

### Running Convex Dev

Keep Convex dev running in a separate terminal:
```bash
npx convex dev
```

This watches for changes and hot-reloads functions.

### Testing Backend Functions

Run the backend test suite:
```bash
npx convex run testBackend:testAllFunctions
```

This tests:
- Holes configuration
- User management
- Tournament creation
- Player registration
- Score submission

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### Tables

- **users** - Players and admins
- **tournaments** - Tournament configurations
- **tournament_participants** - Player registrations
- **scores** - Score submissions
- **holes_config** - Golf course hole configurations

### Key Features

- Real-time subscriptions via Convex
- Automatic index management
- Type-safe queries and mutations
- Built-in authentication support

## Task 1 Completion Status

✅ **Completed:**
- React project initialized with TypeScript
- Convex.dev installed and configured
- Tailwind CSS setup with custom green theme
- Database schema defined (all 5 tables)
- TypeScript type definitions created
- Tournament management implemented (create, get, details)
- Player registration with bulk support and duplicate prevention
- Hidden holes management with validation and access control
- User management (create, query, test users)
- Holes configuration seeded (18 holes)
- Backend tested and validated

## Next Steps

Task 2: Scoring System dan Game Mode Calculations
- Implement score submission and updates
- Create score classification logic
- Implement Stableford, System36, and Stroke Play calculations

## License

Private project for GolfScore ID
