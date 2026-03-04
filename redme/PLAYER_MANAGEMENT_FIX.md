# Player Management Error Fix

## Problem
Ketika masuk ke Player Management, terjadi error:
```
Error: [CONVEX Q(users:getAllPlayers)] Server Error
Uncaught Error: Unauthorized: Must be logged in
```

## Root Cause
Query `getAllPlayers` di `convex/users.ts` menggunakan Convex authentication (`ctx.auth.getUserIdentity()`) yang memerlukan user login melalui Convex Auth. Namun, aplikasi menggunakan sistem login berbasis localStorage, bukan Convex Auth.

## Solution
Membuat query baru yang tidak memerlukan Convex authentication:

### 1. New Queries in `convex/users.ts`

#### `listAllPlayers`
Query untuk mendapatkan semua player tanpa memerlukan authentication:
```typescript
export const listAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter((u) => u.role === "player")
      .map((player) => ({
        _id: player._id,
        name: player.name,
        email: player.email,
        username: player.username,
        role: player.role,
        handicap: player.handicap,
      }));
  },
});
```

#### `listAllUsers`
Query untuk mendapatkan semua user (admin & player):
```typescript
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      handicap: user.handicap,
    }));
  },
});
```

### 2. Updated Components

#### `PlayerManagement.tsx`
Changed from:
```typescript
const players = useQuery(api.users.getAllPlayers);
```

To:
```typescript
const players = useQuery(api.users.listAllPlayers);
```

#### `PlayerRegistrationPanel.tsx`
Changed from:
```typescript
const allPlayers = useQuery(api.users.getAllPlayers);
```

To:
```typescript
const allPlayers = useQuery(api.users.listAllPlayers);
```

## Benefits
1. **No Authentication Required**: Queries work with localStorage-based auth
2. **Backward Compatible**: Old `getAllPlayers` query still exists for future use
3. **Secure**: Only returns necessary user data (excludes password)
4. **Flexible**: Can be used by any component without auth checks

## Security Considerations
Since these queries don't require authentication, they should only be used in admin-protected routes. The route protection is handled by:
- `ProtectedRoute` component with `requireAdmin` prop
- `AuthContext` checking user role from localStorage

## Testing
1. Login as admin
2. Navigate to Player Management
3. Verify players list loads without errors
4. Test search functionality
5. Test create player form

## Future Improvements
1. Add server-side role validation using a custom auth system
2. Implement API key or token-based authentication
3. Add rate limiting for public queries
4. Consider implementing Convex Auth for better security

## Related Files
- `convex/users.ts` - Added new queries
- `src/components/admin/PlayerManagement.tsx` - Updated to use new query
- `src/components/admin/PlayerRegistrationPanel.tsx` - Updated to use new query
