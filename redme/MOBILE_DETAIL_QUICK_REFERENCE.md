# Mobile Detail Pages - Quick Reference

## 🚀 Quick Start

### Import Components

```typescript
// Tournament Detail
import TournamentDetail from '@/components/player/mobile/TournamentDetail';

// News Detail
import NewsDetail from '@/components/player/mobile/NewsDetail';
```

### Navigation

```typescript
// Navigate to Tournament Detail
navigate(`/player/tournament/${tournamentId}`);

// Navigate to News Detail
navigate(`/player/mobile/news/${newsId}`);

// Navigate to Scoring (from tournament detail)
navigate(`/player/scoring/${tournamentId}`);
```

## 📊 Data Queries

### Tournament Detail

```typescript
// Get tournament details
const tournament = useQuery(
  api.tournaments.getTournamentDetails,
  { tournamentId: id as Id<"tournaments"> }
);

// Get participants
const participants = useQuery(
  api.tournaments.getTournamentParticipants,
  { tournamentId: id as Id<"tournaments"> }
);
```

### News Detail

```typescript
// Get news by ID
const news = useQuery(
  api.news.getNewsById,
  { newsId: id as Id<"news"> }
);
```

## 🎨 Styling Patterns

### Gradient Backgrounds

```typescript
// Card background
className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black"

// Page background
className="bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black"

// Button gradient
className="bg-gradient-to-r from-red-600 to-red-700"
```

### Status Colors

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-blue-500';
    case 'active': return 'bg-green-500';
    case 'completed': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};
```

### Category Colors

```typescript
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Tournament': return 'bg-blue-500';
    case 'Tips': return 'bg-green-500';
    case 'Berita': return 'bg-purple-500';
    case 'Announcement': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};
```

## 🔧 Common Patterns

### Loading State

```typescript
if (!data) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}
```

### Empty State

```typescript
{items.length === 0 && (
  <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-xl p-8 text-center border border-gray-800">
    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
      </svg>
    </div>
    <h3 className="text-white font-semibold mb-2">No Items</h3>
    <p className="text-gray-400 text-sm">Description here</p>
  </div>
)}
```

### Fixed Header

```typescript
<div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black shadow-2xl border-b border-gray-800">
  <div className="flex items-center px-4 py-4">
    <button onClick={() => navigate(-1)} className="text-white hover:bg-gray-800 rounded-xl p-2 transition-all">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 className="text-white font-bold text-xl ml-3">Title</h1>
  </div>
</div>
```

### Sticky Tabs

```typescript
<div className="sticky top-16 z-40 bg-[#1a1a1a] border-b border-gray-800 px-4">
  <div className="flex space-x-1">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex-1 py-3 text-sm font-semibold transition-all ${
          activeTab === tab.key
            ? 'text-red-500 border-b-2 border-red-500'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

### Fixed Bottom Button

```typescript
<div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform active:scale-[0.98]">
    Action Text
  </button>
</div>
```

## 📱 Component Props

### TournamentDetail

```typescript
// No props needed - uses URL params
const { id } = useParams();
```

### NewsDetail

```typescript
// No props needed - uses URL params
const { id } = useParams();
```

## 🎯 Key Features

### Tournament Detail

```typescript
// Tab state
const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'participants'>('info');

// Check registration
const isRegistered = participants?.some(p => p._id === user?._id);

// Participant count
const participantCount = participants?.length || 0;

// Parse schedule
const scheduleItems = tournament.schedule?.split('\n').filter(line => line.trim());
```

### News Detail

```typescript
// Format date
new Date(news.publishedAt).toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

// Category icon
const getCategoryIcon = (category: string) => {
  // Returns SVG icon based on category
};
```

## 🔄 State Management

### Tab Navigation

```typescript
const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'participants'>('info');

// Render based on active tab
{activeTab === 'info' && <InfoContent />}
{activeTab === 'schedule' && <ScheduleContent />}
{activeTab === 'participants' && <ParticipantsContent />}
```

### Data Loading

```typescript
// Convex queries are reactive
const data = useQuery(api.module.function, args);

// Automatically updates when data changes
// No need for manual refetch
```

## 🎨 Icon Library

### Common Icons

```typescript
// Calendar
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>

// Location
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
</svg>

// Users
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>

// Back Arrow
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
</svg>

// Play
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>

// Check
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>
```

## 📝 Date Formatting

### Indonesian Format

```typescript
// Short format
new Date(timestamp).toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
// Output: 15 Feb 2026

// Long format
new Date(timestamp).toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
// Output: 15 Februari 2026

// With weekday
new Date(timestamp).toLocaleDateString('id-ID', { 
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
// Output: Sen, 15 Feb 2026
```

## 🔍 Conditional Rendering

### Status-based Actions

```typescript
{tournament.status === 'upcoming' && !isRegistered && (
  <button>Daftar Tournament</button>
)}

{tournament.status === 'active' && isRegistered && (
  <button onClick={() => navigate(`/player/scoring/${tournament._id}`)}>
    Mulai Bermain
  </button>
)}

{tournament.status === 'completed' && (
  <div>Tournament Selesai</div>
)}
```

### Optional Data

```typescript
{tournament.prize && (
  <div>
    <span>Hadiah:</span>
    <span>{tournament.prize}</span>
  </div>
)}

{tournament.registrationFee && (
  <div>
    <span>Biaya:</span>
    <span>{tournament.registrationFee}</span>
  </div>
)}
```

## 🎯 Best Practices

### 1. Always Handle Loading States

```typescript
if (!data) return <LoadingSpinner />;
```

### 2. Provide Fallback Images

```typescript
<img
  src={imageUrl || '/default-image.png'}
  onError={(e) => {
    e.currentTarget.src = '/fallback-image.png';
  }}
/>
```

### 3. Use Semantic HTML

```typescript
<button> for actions
<nav> for navigation
<article> for content
<section> for sections
```

### 4. Optimize Images

```typescript
// Use appropriate sizes
className="h-64 w-full object-cover"

// Lazy load
loading="lazy"
```

### 5. Handle Empty States

```typescript
{items.length === 0 && <EmptyState />}
```

## 🚨 Common Issues & Solutions

### Issue: Image Not Loading

```typescript
// Solution: Add fallback
<img
  src={imageUrl || '/default.png'}
  onError={(e) => e.currentTarget.src = '/fallback.png'}
/>
```

### Issue: Data Not Updating

```typescript
// Solution: Check query args
const data = useQuery(
  api.module.function,
  id ? { id } : 'skip' // Skip if no ID
);
```

### Issue: Navigation Not Working

```typescript
// Solution: Use correct path
navigate(`/player/tournament/${id}`); // Correct
navigate(`/tournament/${id}`); // Wrong
```

### Issue: Tabs Not Switching

```typescript
// Solution: Check state update
const [activeTab, setActiveTab] = useState('info');
onClick={() => setActiveTab('schedule')} // Correct
onClick={() => activeTab = 'schedule'} // Wrong
```

## 📚 Related Files

```
Components:
- src/components/player/mobile/TournamentDetail.tsx
- src/components/player/mobile/NewsDetail.tsx
- src/components/player/mobile/NewsFeed.tsx
- src/components/player/mobile/TournamentList.tsx
- src/components/player/mobile/MyTournaments.tsx

Routes:
- src/routes/index.tsx

API:
- convex/tournaments.ts
- convex/news.ts

Documentation:
- redme/MOBILE_DETAIL_INTEGRATION.md
- redme/MOBILE_DETAIL_VISUAL_GUIDE.md
```

## 🎓 Learning Resources

### Convex Queries

```typescript
// Basic query
const data = useQuery(api.module.function, args);

// Conditional query
const data = useQuery(
  api.module.function,
  condition ? args : 'skip'
);

// Multiple queries
const data1 = useQuery(api.module.function1, args1);
const data2 = useQuery(api.module.function2, args2);
```

### React Router

```typescript
// Get params
const { id } = useParams();

// Navigate
const navigate = useNavigate();
navigate('/path');
navigate(-1); // Go back

// Link
<Link to="/path">Text</Link>
```

### Tailwind CSS

```typescript
// Responsive
className="text-sm md:text-base lg:text-lg"

// Hover
className="hover:bg-gray-800"

// Active
className="active:scale-95"

// Focus
className="focus:ring-2 focus:ring-red-500"
```

## ✅ Checklist

### Before Deployment

- [ ] Test all navigation paths
- [ ] Verify data loading
- [ ] Check loading states
- [ ] Test empty states
- [ ] Verify image fallbacks
- [ ] Test on mobile devices
- [ ] Check responsive design
- [ ] Verify accessibility
- [ ] Test error handling
- [ ] Check performance

### Code Quality

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Fallback images set
- [ ] Proper navigation
- [ ] Clean code structure

## 🎉 Quick Tips

1. **Use Convex queries** - They're reactive and cached
2. **Handle loading states** - Always show feedback
3. **Provide fallbacks** - Images, data, everything
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Test thoroughly** - Check all states and paths
6. **Keep it simple** - Don't over-engineer
7. **Follow patterns** - Use established patterns
8. **Document changes** - Help future developers

---

**Need Help?** Check the full documentation in:
- `MOBILE_DETAIL_INTEGRATION.md` - Complete integration guide
- `MOBILE_DETAIL_VISUAL_GUIDE.md` - Visual design guide
