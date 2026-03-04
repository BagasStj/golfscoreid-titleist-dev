# Tournament Schedule & Tee Box Update

## Ringkasan Perubahan

Menambahkan field baru pada tournament untuk informasi yang lebih lengkap:
1. **Susunan Acara (Schedule)** - Jadwal acara tournament
2. **Tee Box Selection** - Pilihan tee box untuk gender laki-laki dan perempuan

## Perubahan Database Schema

### File: `convex/schema.ts`

Menambahkan field baru pada table `tournaments`:

```typescript
// Schedule/Agenda
schedule: v.optional(v.string()), // Susunan acara tournament

// Tee Box Selection
maleTeeBox: v.optional(v.union(
  v.literal("Blue"),
  v.literal("White"),
  v.literal("Gold"),
  v.literal("Black")
)),
femaleTeeBox: v.optional(v.union(
  v.literal("Red"),
  v.literal("White"),
  v.literal("Gold")
)),
```

## Perubahan Backend

### File: `convex/tournaments.ts`

#### 1. Mutation `createTournament`
Menambahkan parameter baru:
- `schedule: v.optional(v.string())`
- `maleTeeBox: v.optional(v.union(...))`
- `femaleTeeBox: v.optional(v.union(...))`

#### 2. Mutation `updateTournament`
Menambahkan parameter baru yang sama untuk update tournament

## Perubahan Frontend

### 1. File: `src/components/admin/TournamentCreationForm.tsx`

#### Field Baru di Form:
- **Susunan Acara**: Textarea untuk input jadwal acara
- **Tee Box Laki-laki**: Dropdown dengan pilihan Blue, White, Gold, Black
- **Tee Box Perempuan**: Dropdown dengan pilihan Red, White, Gold

#### Default Values:
- `schedule: ''` (kosong/optional)
- `maleTeeBox: 'Blue'` (default)
- `femaleTeeBox: 'Red'` (default)

### 2. File: `src/components/admin/EditTournamentModal.tsx`

Menambahkan field yang sama untuk edit tournament:
- Schedule textarea
- Male tee box dropdown
- Female tee box dropdown

### 3. File: `src/components/admin/TournamentDetailsModal.tsx`

Menampilkan informasi baru:
- **Tee Box Laki-laki**: Card dengan icon dan label
- **Tee Box Perempuan**: Card dengan icon dan label
- **Susunan Acara**: Section khusus dengan styling yang menarik

## Cara Penggunaan

### Membuat Tournament Baru

1. Buka form "Create New Tournament"
2. Isi informasi dasar (nama, deskripsi, lokasi, dll)
3. **Isi Susunan Acara** (optional):
   ```
   07:00 - Registration
   08:00 - Opening Ceremony
   08:30 - Shotgun Start
   14:00 - Lunch
   16:00 - Prize Giving
   ```
4. **Pilih Tee Box**:
   - Laki-laki: Blue/White/Gold/Black
   - Perempuan: Red/White/Gold
5. Submit form

### Edit Tournament

1. Klik "Edit" pada tournament
2. Update field schedule dan tee box sesuai kebutuhan
3. Save changes

### Melihat Detail Tournament

1. Klik "View Details" pada tournament
2. Informasi tee box akan ditampilkan di grid info
3. Schedule akan ditampilkan di section khusus dengan styling biru

## Tee Box Options

### Laki-laki (Male):
- **Blue Tee** - Standard untuk pemain laki-laki
- **White Tee** - Lebih pendek dari Blue
- **Gold Tee** - Senior/lebih pendek
- **Black Tee** - Championship/paling panjang

### Perempuan (Female):
- **Red Tee** - Standard untuk pemain perempuan
- **White Tee** - Lebih panjang dari Red
- **Gold Tee** - Senior/lebih pendek

## Validasi

- Schedule: Optional (tidak wajib diisi)
- Male Tee Box: Default "Blue" jika tidak dipilih
- Female Tee Box: Default "Red" jika tidak dipilih

## Backward Compatibility

Semua field baru adalah **optional**, sehingga:
- Tournament lama tetap berfungsi normal
- Tidak perlu migrasi data
- Field akan kosong/default untuk tournament lama

## Testing

Untuk test fitur baru:

1. **Create Tournament**:
   - Buat tournament baru dengan schedule dan tee box
   - Verify data tersimpan dengan benar

2. **Edit Tournament**:
   - Edit tournament existing
   - Update schedule dan tee box
   - Verify perubahan tersimpan

3. **View Details**:
   - Buka detail tournament
   - Verify schedule dan tee box ditampilkan dengan benar

## UI/UX Improvements

### Schedule Display:
- Background gradient biru-indigo
- Border biru
- Icon calendar
- Pre-formatted text untuk menjaga format

### Tee Box Display:
- Male: Icon biru dengan background biru muda
- Female: Icon pink dengan background pink muda
- Clear labeling dalam Bahasa Indonesia

## Files Modified

1. ✅ `convex/schema.ts` - Schema update
2. ✅ `convex/tournaments.ts` - Backend mutations
3. ✅ `src/components/admin/TournamentCreationForm.tsx` - Create form
4. ✅ `src/components/admin/EditTournamentModal.tsx` - Edit modal
5. ✅ `src/components/admin/TournamentDetailsModal.tsx` - Details display

## Status

✅ **COMPLETED** - Semua perubahan telah diimplementasikan dan siap digunakan!
