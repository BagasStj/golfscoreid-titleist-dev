# Flight Scoring Overview - Update

## Perubahan yang Dilakukan

### 1. Informasi Lapangan Golf
- Ditambahkan card informasi lapangan di atas tabs Scorecard/Leaderboard
- Menampilkan:
  - Nama lapangan (dari database courses)
  - Jumlah holes yang dimainkan
  - Total par
- Desain modern dengan icon dan gradient

### 2. Ukuran Font Diperbesar
- Header tournament: `text-base`
- Tabs: `text-sm`
- Table scorecard: `text-xs`
- Score cells: `w-7 h-7`
- Leaderboard: semua ukuran diperbesar untuk readability

### 3. Toggle Scoring Mode
- Ditambahkan toggle "Stroke" dan "Over/Under" di atas legend
- Ukuran button compact: `px-3 py-1` dengan `text-xs`
- Mode Stroke: menampilkan jumlah pukulan (4, 5, 6, dll)
- Mode Over/Under: menampilkan selisih dari par (E, +1, -1, dll)
- Warna tetap sama untuk klasifikasi (Eagle kuning, Birdie merah, dll)

### 4. Legend Compact
- Legend diperkecil menjadi 1 baris
- Ukuran icon: `w-4 h-4`
- Font size: `text-[10px]`
- Menggunakan `flex-nowrap` dan `overflow-x-auto` untuk mobile

### 5. Course Data Integration
- Menambahkan query `getCourse` di `convex/courses.ts`
- Fetch course data berdasarkan `tournament.courseId`
- Fallback ke `tournament.location` jika course tidak ada

## File yang Dimodifikasi

1. `src/components/player/FlightScoringOverview.tsx`
   - Tambah state `scoringMode`
   - Tambah query `course`
   - Update UI dengan course info
   - Tambah toggle scoring mode
   - Update legend menjadi compact
   - Update logic display score cells

2. `convex/courses.ts`
   - Tambah query `getCourse` (alias dari `getById`)

## Cara Penggunaan

### Toggle Scoring Mode
```typescript
// User dapat switch antara 2 mode:
- Stroke: menampilkan jumlah pukulan aktual
- Over/Under: menampilkan selisih dari par
```

### Display Logic
```typescript
if (scoringMode === 'over') {
  if (diff === 0) displayValue = 'E';
  else if (diff > 0) displayValue = `+${diff}`;
  else displayValue = `${diff}`;
} else {
  displayValue = strokes.toString();
}
```

## Preview

### Course Information Card
```
┌─────────────────────────────────────┐
│ 📍  Pondok Indah Golf Course        │
│     🏌️ 18 Holes  📊 Par 72          │
└─────────────────────────────────────┘
```

### Scoring Toggle
```
Scoring: [Stroke] [Over/Under]
```

### Legend (1 baris)
```
🟡 Eagle  🔴 Birdie  🔵 Par  ⚫ Bogey  ⚫ Double+
```

## Testing

1. Buka halaman Flight Scoring Overview
2. Verifikasi nama lapangan muncul dengan benar
3. Test toggle Stroke/Over mode
4. Verifikasi legend dalam 1 baris
5. Check responsive di mobile

## Notes

- Course name diambil dari relasi `tournament.courseId -> courses.name`
- Jika courseId tidak ada, fallback ke `tournament.location`
- Toggle scoring mode hanya mempengaruhi display, tidak mengubah data
- Warna klasifikasi tetap konsisten di kedua mode
