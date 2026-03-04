# Profile Pages Routing Update

## Ringkasan Perubahan

Ketiga modal di halaman profile telah diubah menjadi halaman terpisah dengan routing yang proper untuk meningkatkan navigasi dan user experience.

## Perubahan File

### 1. Modal → Page Conversion

**File yang diubah:**
- `EditProfileModal.tsx` → `EditProfilePage.tsx`
- `PlayerStatisticsModal.tsx` → `PlayerStatisticsPage.tsx`
- `TournamentHistoryModal.tsx` → `TournamentHistoryPage.tsx`

**Perubahan utama:**
- Menghapus props `isOpen`, `onClose`, dan parameter lainnya
- Menggunakan `useAuth()` untuk mendapatkan user data langsung
- Menggunakan `useNavigate()` untuk navigasi kembali ke `/player`
- Menambahkan tombol back dengan icon `ArrowLeft` di header

### 2. Routing Configuration

**File:** `src/routes/index.tsx`

**Route baru yang ditambahkan:**
```typescript
{
  path: '/player/profile/edit',
  element: <EditProfilePage />
}

{
  path: '/player/profile/statistics',
  element: <PlayerStatisticsPage />
}

{
  path: '/player/profile/history',
  element: <TournamentHistoryPage />
}
```

### 3. MyProfile Component Update

**File:** `src/components/player/mobile/MyProfile.tsx`

**Perubahan:**
- Menghapus state management untuk modal (`useState`)
- Menghapus import modal components
- Mengubah action dari `setState` menjadi `navigate()`
- Menghapus rendering modal components

**Sebelum:**
```typescript
action: () => setIsEditProfileOpen(true)
```

**Sesudah:**
```typescript
action: () => navigate('/player/profile/edit')
```

### 4. Export Updates

**File:** `src/components/player/mobile/index.ts`

**Perubahan:**
```typescript
// Sebelum
export { default as EditProfileModal } from './EditProfileModal';
export { default as TournamentHistoryModal } from './TournamentHistoryModal';
export { default as PlayerStatisticsModal } from './PlayerStatisticsModal';

// Sesudah
export { default as EditProfilePage } from './EditProfilePage';
export { default as TournamentHistoryPage } from './TournamentHistoryPage';
export { default as PlayerStatisticsPage } from './PlayerStatisticsPage';
```

## Navigasi Flow

### Edit Profile
1. User di halaman Profile (`/player?tab=profile`)
2. Klik "Edit Profile"
3. Navigate ke `/player/profile/edit`
4. Setelah save atau klik back → kembali ke `/player?tab=profile` (langsung ke tab Profile)

### Statistik
1. User di halaman Profile (`/player?tab=profile`)
2. Klik "Statistik Saya"
3. Navigate ke `/player/profile/statistics`
4. Klik back → kembali ke `/player?tab=profile` (langsung ke tab Profile)

### Riwayat Tournament
1. User di halaman Profile (`/player?tab=profile`)
2. Klik "Riwayat Tournament"
3. Navigate ke `/player/profile/history`
4. Klik back → kembali ke `/player?tab=profile` (langsung ke tab Profile)

## URL Query Parameter

MobileLayout sekarang menggunakan query parameter `?tab=` untuk mengontrol tab yang aktif:

- `/player` atau `/player?tab=tournaments` → Tab Tournament
- `/player?tab=my-tournaments` → Tab My Tournaments
- `/player?tab=news` → Tab News
- `/player?tab=profile` → Tab Profile

Ketika user kembali dari halaman profile pages, URL akan otomatis include `?tab=profile` sehingga tab Profile langsung aktif.

### Implementasi di MobileLayout

```typescript
const [searchParams, setSearchParams] = useSearchParams();
const tabParam = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(tabParam || 'tournaments');

// Update active tab when URL parameter changes
useEffect(() => {
  if (tabParam && ['tournaments', 'my-tournaments', 'news', 'profile'].includes(tabParam)) {
    setActiveTab(tabParam);
  }
}, [tabParam]);

// Update URL when tab changes
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchParams({ tab });
};
```

## Keuntungan Perubahan

1. **Better Navigation**: User dapat menggunakan browser back button
2. **URL Sharing**: Setiap halaman memiliki URL yang dapat dibagikan
3. **Cleaner Code**: Tidak perlu state management untuk modal
4. **Better UX**: Transisi halaman lebih natural dengan routing
5. **Browser History**: Navigasi tercatat di browser history
6. **Tab Persistence**: Ketika kembali dari profile pages, tab Profile tetap aktif menggunakan query parameter
7. **Deep Linking**: URL dengan query parameter memungkinkan direct access ke tab tertentu

## Testing

Untuk testing perubahan ini:

1. Login sebagai player
2. Buka halaman Profile
3. Test setiap menu:
   - Edit Profile → pastikan form muncul dan bisa save
   - Statistik Saya → pastikan data statistik tampil
   - Riwayat Tournament → pastikan list tournament tampil
4. Test tombol back di setiap halaman
5. Test browser back button

## Notes

- Semua halaman menggunakan `ProtectedRoute` untuk memastikan user sudah login
- Lazy loading diterapkan untuk optimasi performa
- Design dan styling tetap sama seperti modal sebelumnya
- Data fetching menggunakan `useAuth()` dan Convex queries
