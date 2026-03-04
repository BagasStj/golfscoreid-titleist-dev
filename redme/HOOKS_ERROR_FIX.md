# React Hooks Error Fix

## Problem
Multiple player components were experiencing the error:
```
Rendered more hooks than during the previous render.
```

This error occurred when navigating between scoring, leaderboard, and scorecard pages.

## Root Cause
The components had **conditional early returns before all hooks were called**, which violates React's Rules of Hooks. Hooks must be called in the same order on every render.

### Bad Pattern (Before):
```tsx
export default function Component() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ❌ Early return before all hooks
  if (!tournamentId || !user) {
    navigate('/player');
    return null;
  }

  // These hooks won't be called if early return happens
  const data = useQuery(api.someQuery, { ... });
  const { mutate } = useRetryMutation(api.someMutation, { ... });
  
  // ...
}
```

### Good Pattern (After):
```tsx
export default function Component() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ All hooks called first
  const data = useQuery(
    api.someQuery,
    tournamentId && user ? { ... } : 'skip'
  );
  const { mutate } = useRetryMutation(api.someMutation, { ... });

  // ✅ Navigation handled in useEffect
  useEffect(() => {
    if (!tournamentId || !user) {
      navigate('/player');
    }
  }, [tournamentId, user, navigate]);

  // ✅ Conditional render after all hooks
  if (!tournamentId || !user) {
    return null;
  }
  
  // ...
}
```

## Files Fixed

### 1. `src/components/player/ModernScoringInterface.tsx`
- Moved all hooks before conditional logic
- Added `useEffect` for navigation
- Added conditional render check after hooks
- Made queries conditional with `'skip'` parameter

### 2. `src/components/player/ScoringInterface.tsx`
- Same fixes as ModernScoringInterface
- Ensured all hooks are called in consistent order

### 3. `src/components/player/PlayerLeaderboard.tsx`
- Moved `useQuery` hooks before early return
- Added `useEffect` for navigation
- Made queries conditional with `'skip'` parameter

### 4. `src/components/player/PlayerScorecard.tsx`
- Moved `useQuery` hooks before early return
- Added `useEffect` for navigation
- Made queries conditional with `'skip'` parameter

## Key Changes

1. **All hooks are now called unconditionally** at the top of each component
2. **Navigation logic moved to `useEffect`** instead of immediate execution
3. **Queries use conditional execution** with `'skip'` when params are missing
4. **Conditional rendering happens after all hooks** are initialized

## Testing
After these fixes:
- ✅ Navigate from scoring to leaderboard - No error
- ✅ Navigate from leaderboard back to scoring - No error
- ✅ Navigate from scoring to scorecard - No error
- ✅ Navigate from scorecard back to scoring - No error
- ✅ All hooks are called in consistent order on every render

## React Rules of Hooks
This fix ensures compliance with React's Rules of Hooks:
1. ✅ Only call hooks at the top level
2. ✅ Don't call hooks inside loops, conditions, or nested functions
3. ✅ Only call hooks from React function components
4. ✅ Call hooks in the same order every time

## Date
Fixed: February 2, 2026
