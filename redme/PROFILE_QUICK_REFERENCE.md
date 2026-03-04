# Profile Mobile - Quick Reference

## 🚀 Quick Start

```tsx
// Import
import { MyProfile } from '@/components/player/mobile';

// Use in route
<Route path="/player/mobile/profile" element={<MyProfile />} />
```

## 📦 Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `MyProfile.tsx` | Main profile page | - |
| `EditProfileModal.tsx` | Edit profile form | `isOpen`, `onClose`, `user` |
| `TournamentHistoryModal.tsx` | Tournament history list | `isOpen`, `onClose`, `userId` |
| `PlayerStatisticsModal.tsx` | Player statistics | `isOpen`, `onClose`, `userId` |

## 🔌 Convex Functions

### Queries
```typescript
// Get player tournaments
api.tournaments.getPlayerTournaments({ playerId: Id<"users"> })

// Get player statistics
api.users.getPlayerStatistics({ playerId: Id<"users"> })
```

### Mutations
```typescript
// Update profile
api.users.updateProfile({
  userId: Id<"users">,
  name?: string,
  phone?: string,
  handicap?: number,
  gender?: "male" | "female",
  workLocation?: string,
  shirtSize?: "S" | "M" | "L" | "XL",
  gloveSize?: "S" | "M" | "L" | "XL"
})
```

## 🎨 Theme Colors

```css
/* Background */
bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black

/* Primary Button */
bg-gradient-to-r from-red-600 to-red-700

/* Border */
border-gray-800

/* Text */
text-white (primary)
text-gray-400 (secondary)
```

## 📊 Statistics Data Structure

```typescript
{
  totalTournaments: number;
  totalHolesPlayed: number;
  bestScore: number;
  averageScore: number;
  scoreDistribution: {
    eagles: number;
    birdies: number;
    pars: number;
    bogeys: number;
    doubleBogeyPlus: number;
  };
  fairwayHitRate: number;
  greenInRegulation: number;
  parSaveRate: number;
  recentScores: Array<{
    tournamentName: string;
    date: number;
    totalScore: number;
    scoreVsPar: number;
  }>;
  achievements: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}
```

## 🏆 Achievements Logic

```typescript
// Eagle Hunter
if (eagles > 0) → Show achievement

// Birdie Master
if (birdies >= 10) → Show achievement

// Tournament Regular
if (totalTournaments >= 5) → Show achievement

// Sub-80 Club
if (bestScore > 0 && bestScore < 80) → Show achievement
```

## 🎯 Common Patterns

### Modal Pattern
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<button onClick={() => setIsModalOpen(true)}>Open</button>

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  {...props}
/>
```

### Data Fetching Pattern
```tsx
const data = useQuery(
  api.module.function,
  user ? { playerId: user._id } : 'skip'
);

if (!data) return <LoadingState />;
if (data.length === 0) return <EmptyState />;
```

### Update Pattern
```tsx
const updateMutation = useMutation(api.module.function);

const handleSubmit = async () => {
  try {
    await updateMutation({ ...args });
    onClose();
  } catch (error) {
    alert('Error message');
  }
};
```

## 🔍 Debugging

### Check Data
```typescript
console.log('Tournaments:', myTournaments);
console.log('Stats:', playerStats);
```

### Check User
```typescript
console.log('User:', user);
console.log('User ID:', user?._id);
```

### Check Modal State
```typescript
console.log('Edit Modal:', isEditProfileOpen);
console.log('History Modal:', isTournamentHistoryOpen);
console.log('Stats Modal:', isStatisticsOpen);
```

## ⚡ Performance Tips

1. Use `'skip'` for conditional queries
2. Memoize expensive calculations
3. Use loading states for better UX
4. Implement error boundaries
5. Optimize re-renders with React.memo

## 🐛 Common Issues

### Modal not opening
- Check state management
- Verify onClick handlers
- Check z-index conflicts

### Data not loading
- Verify user is logged in
- Check Convex function names
- Verify query arguments

### Update not working
- Check mutation arguments
- Verify user permissions
- Check error messages

## 📱 Mobile Optimization

```css
/* Full screen modal */
fixed inset-0

/* Scrollable content */
overflow-y-auto max-h-[calc(90vh-100px)]

/* Touch-friendly buttons */
py-4 px-6

/* Readable text */
text-base leading-relaxed
```

## ✅ Testing Checklist

- [ ] Profile loads correctly
- [ ] Edit modal opens/closes
- [ ] History modal shows tournaments
- [ ] Statistics modal shows data
- [ ] Update profile works
- [ ] Loading states appear
- [ ] Empty states appear
- [ ] Error handling works
- [ ] Logout works
- [ ] Mobile responsive

## 🔗 Related Files

```
src/components/player/mobile/
├── MyProfile.tsx
├── EditProfileModal.tsx
├── TournamentHistoryModal.tsx
└── PlayerStatisticsModal.tsx

convex/
├── users.ts (updateProfile, getPlayerStatistics)
└── tournaments.ts (getPlayerTournaments)

redme/
├── MOBILE_PROFILE_INTEGRATION.md (detailed docs)
└── PANDUAN_PROFILE_MOBILE.md (Indonesian guide)
```

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2026-02-11
