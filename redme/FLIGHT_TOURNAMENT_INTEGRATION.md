# Flight & Tournament Integration - Perbaikan

## Perubahan yang Telah Dilakukan

### 1. Tournament Creation Form
**File**: `src/components/admin/TournamentCreationForm.tsx`

**Perbaikan**:
- ✅ Menghapus duplikasi field (Location, Prize, Registration Fee, Contact Person, Max Participants)
- ✅ Menambahkan fitur upload banner/image tournament
- ✅ Preview image sebelum upload
- ✅ Validasi file (type: image, max size: 5MB)
- ✅ Integrasi dengan Convex storage untuk menyimpan banner

**Fitur Baru**:
```typescript
- Banner upload dengan drag & drop area
- Preview image real-time
- Remove banner button
- Auto upload ke Convex storage saat create tournament
```

### 2. Tournaments Module
**File**: `convex/tournaments.ts`

**Perbaikan**:
- ✅ File berhasil dibuat dengan benar (9940 bytes)
- ✅ Semua fungsi export dengan benar
- ✅ Terintegrasi dengan Convex API
- ✅ Support banner upload (bannerStorageId)

**Fungsi yang Tersedia**:
- `createTournament` - Membuat tournament baru dengan banner
- `getTournaments` - Mendapatkan list tournaments
- `getTournamentDetails` - Detail tournament dengan flights
- `updateTournament` - Update tournament info
- `deleteTournament` - Hapus tournament
- `generateUploadUrl` - Generate URL untuk upload banner
- `getTournamentBannerUrl` - Get URL banner dari storage

### 3. Flight Management
**Status**: ✅ Sudah terimplementasi

**File Terkait**:
- `convex/flights.ts` - Backend flight management
- `src/components/admin/FlightManagement.tsx` - UI untuk manage flights
- `src/components/admin/TournamentFlightManagement.tsx` - Integrasi dengan tournament
- `src/components/admin/AddPlayersToFlightModal.tsx` - Tambah players ke flight

**Cara Penggunaan**:
1. Buat tournament terlebih dahulu
2. Setelah tournament dibuat, buka Tournament Management
3. Klik tournament yang ingin diatur flightnya
4. Klik tab "Flight Management"
5. Tambah flight baru dengan:
   - Flight Name (e.g., "Flight A")
   - Flight Number (1, 2, 3, dst)
   - Start Time (optional)
   - Start Hole (1-18)
6. Setelah flight dibuat, tambahkan players ke flight tersebut

### 4. Schema Updates
**File**: `convex/schema.ts`

**Perubahan**:
- ✅ `location` field di tournaments: optional (backward compatibility)
- ✅ `flightId` di tournament_participants: optional (backward compatibility)
- ✅ `bannerUrl` & `bannerStorageId` di tournaments: optional

## Workflow Tournament dengan Flight

### Step 1: Create Tournament
```
Admin Dashboard → Tournaments → Create New Tournament
- Isi form tournament
- Upload banner (optional)
- Set course type, game mode, dll
- Submit
```

### Step 2: Create Flights
```
Tournament Management → Select Tournament → Flight Management
- Klik "Add Flight"
- Isi Flight Name, Number, Start Time, Start Hole
- Create Flight
- Ulangi untuk flight lainnya
```

### Step 3: Add Players to Flights
```
Flight Management → Select Flight → Add Players
- Pilih players yang belum terdaftar
- Set start hole untuk setiap player
- Add to Flight
```

### Step 4: Activate Tournament
```
Tournament Management → Change Status → Active
- Tournament siap dimulai
- Players bisa mulai input scores
```

## Testing

### Test Create Tournament dengan Banner
1. Login sebagai admin
2. Buka Tournament Management
3. Klik "Create New Tournament"
4. Upload banner image
5. Isi semua field required
6. Submit
7. Verifikasi tournament muncul dengan banner

### Test Flight Management
1. Buka tournament yang sudah dibuat
2. Klik "Flight Management"
3. Tambah beberapa flight
4. Tambah players ke masing-masing flight
5. Verifikasi players terdaftar di flight yang benar

## File yang Diperbaiki

1. ✅ `src/components/admin/TournamentCreationForm.tsx` - Form creation dengan banner upload
2. ✅ `convex/tournaments.ts` - Backend tournaments dengan storage support
3. ✅ `convex/schema.ts` - Schema dengan optional fields
4. ✅ `convex/flights.ts` - Flight management backend
5. ✅ `src/components/admin/FlightManagement.tsx` - Flight UI
6. ✅ `src/components/admin/AddPlayersToFlightModal.tsx` - Add players modal

## Next Steps

1. Test upload banner functionality
2. Test flight creation dan player assignment
3. Verifikasi players hanya bisa lihat scores dari flight mereka
4. Test tournament workflow end-to-end

## Notes

- Banner images disimpan di Convex storage
- Max file size: 5MB
- Supported formats: PNG, JPG, JPEG, GIF
- Flight management terintegrasi penuh dengan tournament
- Players harus di-assign ke flight sebelum bisa input scores
