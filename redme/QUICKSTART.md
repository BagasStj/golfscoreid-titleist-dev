# Quick Start Guide - GolfScore ID

## Setup (First Time Only)

1. **Install dependencies:**
```bash
cd golfscore-app
npm install
```

2. **Initialize Convex:**
```bash
npx convex dev
```
- Follow prompts to create project
- This generates `.env.local` automatically

3. **Seed data:**
```bash
# Seed 18 holes configuration
npx convex run seedHolesConfig:seedHolesConfig

# Seed test users (1 admin + 3 players)
npx convex run seedUsers:seedTestUsers
```

4. **Verify backend:**
```bash
npx convex run testBackend:testAllFunctions
```
Should show all tests passing ✅

## Daily Development

### Start Both Servers

**Terminal 1 - Convex Backend:**
```bash
cd golfscore-app
npx convex dev
```
Keep this running. It watches for backend changes.

**Terminal 2 - Frontend:**
```bash
cd golfscore-app
npm run dev
```
Open http://localhost:5173

### Making Changes

**Backend (Convex):**
- Edit files in `convex/`
- Convex auto-deploys on save
- Check terminal for errors

**Frontend (React):**
- Edit files in `src/`
- Vite hot-reloads automatically
- Check browser console for errors

## Test Users

Use these for testing:

**Admin:**
- admin@golfscore.id

**Players:**
- player1@golfscore.id (Handicap: 12)
- player2@golfscore.id (Handicap: 18)
- player3@golfscore.id (Handicap: 8)

## Common Commands

```bash
# Run backend tests
npx convex run testBackend:testAllFunctions

# Create new admin
npx convex run users:createTestAdmin '{"email":"new@admin.com","name":"New Admin"}'

# Create new player
npx convex run users:createTestPlayer '{"email":"new@player.com","name":"New Player","handicap":15}'

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

**"Cannot find module convex/_generated"**
- Run `npx convex dev` first
- Wait for "Convex functions ready!"

**Tailwind styles not working**
- Check `postcss.config.js` uses `@tailwindcss/postcss`
- Restart dev server

**Database empty**
- Run seed commands again
- Check Convex dashboard

## Project Structure

```
convex/          → Backend (queries, mutations, schema)
src/             → Frontend (React components)
  types/         → TypeScript definitions
  App.tsx        → Main app
  main.tsx       → Entry point
```

## Next Steps

After Task 1 completion:
- Task 2: Scoring system
- Task 3: Ranking & leaderboard
- Task 4: Admin dashboard UI
- Task 5: Player mobile UI
- Task 6: Polish & testing

## Resources

- Convex Docs: https://docs.convex.dev
- Convex Dashboard: https://dashboard.convex.dev
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com
