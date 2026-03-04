# Profile Tab Navigation Fix

## Problem
Ketika user kembali dari halaman Edit Profile, Player Statistics, atau Tournament History, aplikasi kembali ke tab Tournament (default) bukan ke tab Profile.

## Solution
Menggunakan URL query parameter `?tab=profile` untuk mempertahankan state tab yang aktif.

## Perubahan Implementasi

### 1. MobileLayout.tsx
Menambahkan logic untuk membaca dan update query parameter:

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();
const tabParam = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(tabParam || 'tournaments');

// Sync tab dengan URL parameter
useEffect(() => {
  if (tabParam && ['tournaments', 'my-tournaments', 'news', 'profile'].includes(tabParam)) {
    setActiveTab(tabParam);
  }
}, [tabParam]);

// Update URL saat tab berubah
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchParams({ tab });
};
```

### 2. Profile Pages Navigation
Semua halaman profile sekarang navigate ke `/player?tab=profile`:

**EditProfilePage.tsx:**
- Back button: `navigate('/player?tab=profile')`
- After save: `navigate('/player?tab=profile')`

**PlayerStatisticsPage.tsx:**
- Back button: `navigate('/player?tab=profile')`

**TournamentHistoryPage.tsx:**
- Back button: `navigate('/player?tab=profile')`

## Cara Kerja

1. User membuka tab Profile → URL menjadi `/player?tab=profile`
2. User klik "Edit Profile" → Navigate ke `/player/profile/edit`
3. User klik back atau save → Navigate ke `/player?tab=profile`
4. MobileLayout membaca query parameter `tab=profile`
5. `useEffect` mendeteksi perubahan dan set `activeTab` ke 'profile'
6. Tab Profile langsung aktif

## URL Structure

```
/player                          → Tab Tournament (default)
/player?tab=tournaments          → Tab Tournament
/player?tab=my-tournaments       → Tab My Tournaments
/player?tab=news                 → Tab News
/player?tab=profile              → Tab Profile
/player/profile/edit             → Edit Profile Page
/player/profile/statistics       → Player Statistics Page
/player/profile/history          → Tournament History Page
```

## Benefits

1. **Persistent Tab State**: Tab Profile tetap aktif setelah kembali dari sub-pages
2. **Browser Back Button**: Bekerja dengan baik dengan browser navigation
3. **Deep Linking**: User bisa langsung akses tab tertentu via URL
4. **Better UX**: User tidak perlu klik tab Profile lagi setelah kembali
5. **URL Sharing**: User bisa share URL dengan tab tertentu

## Testing Checklist

- [ ] Buka `/player?tab=profile` → Tab Profile aktif
- [ ] Dari Profile, klik "Edit Profile" → Halaman edit terbuka
- [ ] Klik back dari Edit Profile → Kembali ke tab Profile (bukan Tournament)
- [ ] Dari Profile, klik "Statistik Saya" → Halaman statistik terbuka
- [ ] Klik back dari Statistik → Kembali ke tab Profile
- [ ] Dari Profile, klik "Riwayat Tournament" → Halaman history terbuka
- [ ] Klik back dari History → Kembali ke tab Profile
- [ ] Edit profile dan save → Kembali ke tab Profile
- [ ] Browser back button bekerja dengan baik
- [ ] Klik tab lain (Tournament, News) → URL berubah sesuai tab
