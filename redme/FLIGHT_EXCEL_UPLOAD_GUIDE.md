# Flight Excel Upload Guide

## Ringkasan Fitur

Fitur upload Excel untuk Flight Management memungkinkan admin untuk:
- Upload multiple flights sekaligus dari file Excel
- Otomatis membuat atau update player data
- Assign players ke flights secara batch
- Download template Excel dengan format yang benar

## Instalasi Library

Library yang digunakan:
```bash
npm install xlsx
```

## Format Excel Template

### Kolom yang Diperlukan:

| Column Name      | Type   | Required | Description                    | Example              |
|------------------|--------|----------|--------------------------------|----------------------|
| Flight Name      | String | Yes      | Nama flight                    | Flight A             |
| Flight Number    | Number | Yes      | Nomor flight (unique)          | 1                    |
| Start Time       | String | No       | Waktu mulai (HH:MM)            | 08:00                |
| Start Hole       | Number | Yes      | Hole mulai (1-18)              | 1                    |
| Player Name      | String | Yes      | Nama lengkap player            | John Doe             |
| Player Email     | String | Yes      | Email player (unique)          | john.doe@example.com |
| Player Handicap  | Number | No       | Handicap player                | 12                   |

### Contoh Data Excel:

```
Flight Name | Flight Number | Start Time | Start Hole | Player Name    | Player Email              | Player Handicap
------------|---------------|------------|------------|----------------|---------------------------|----------------
Flight A    | 1             | 08:00      | 1          | John Doe       | john.doe@example.com      | 12
Flight A    | 1             | 08:00      | 1          | Jane Smith     | jane.smith@example.com    | 15
Flight A    | 1             | 08:00      | 1          | Bob Wilson     | bob.wilson@example.com    | 8
Flight B    | 2             | 08:10      | 1          | Charlie Davis  | charlie.davis@example.com | 10
Flight B    | 2             | 08:10      | 1          | Diana Evans    | diana.evans@example.com   | 18
Flight C    | 3             | 08:20      | 10         | Henry Anderson | henry.anderson@example.com| 16
```

## Cara Penggunaan

### 1. Download Template

1. Buka **Flight Management**
2. Pilih tournament
3. Klik tombol **"Excel Upload"**
4. Klik **"Download Template"**
5. Template Excel akan terdownload dengan format yang benar

### 2. Isi Data di Excel

1. Buka file template yang sudah didownload
2. Isi data sesuai format:
   - **Flight Name**: Nama flight (contoh: Flight A, Flight B)
   - **Flight Number**: Nomor urut flight (1, 2, 3, dst)
   - **Start Time**: Waktu mulai dalam format HH:MM (contoh: 08:00)
   - **Start Hole**: Hole mulai (1-18)
   - **Player Name**: Nama lengkap player
   - **Player Email**: Email player (harus unique)
   - **Player Handicap**: Handicap player (opsional)

3. **Tips Penting**:
   - Satu flight bisa punya multiple rows (satu row per player)
   - Flight dengan nama dan nomor yang sama akan digabung
   - Email player harus unique (tidak boleh duplikat)
   - Start Hole harus antara 1-18

### 3. Upload File Excel

1. Klik **"Select Excel File"**
2. Pilih file Excel yang sudah diisi
3. System akan otomatis validate data
4. Jika ada error, akan ditampilkan daftar error yang perlu diperbaiki
5. Jika valid, akan muncul preview data
6. Klik **"Upload Flights"** untuk proses upload

### 4. Proses Upload

System akan:
1. ✅ Create flights berdasarkan data Excel
2. ✅ Create atau update player data
3. ✅ Assign players ke flights yang sesuai
4. ✅ Set start hole untuk setiap player

## Validasi Data

### Validasi yang Dilakukan:

1. **Required Fields**:
   - Flight Name tidak boleh kosong
   - Flight Number tidak boleh kosong
   - Start Hole tidak boleh kosong
   - Player Name tidak boleh kosong
   - Player Email tidak boleh kosong

2. **Format Validation**:
   - Email harus format valid (contoh@domain.com)
   - Start Hole harus antara 1-18
   - Flight Number harus angka positif

3. **Business Logic**:
   - Flight Number tidak boleh duplikat dalam satu tournament
   - Player email tidak boleh duplikat dalam satu tournament

### Error Messages:

Jika ada error, akan ditampilkan pesan seperti:
```
Row 2: Flight Name is required
Row 5: Invalid email format
Row 8: Start Hole must be between 1 and 18
```

## Fitur Otomatis

### 1. Auto Create/Update Player

- Jika player dengan email sudah ada → Update handicap
- Jika player belum ada → Create player baru
- Player otomatis dapat login dengan email yang terdaftar

### 2. Auto Assign to Flight

- Player otomatis di-assign ke flight yang sesuai
- Start hole di-set sesuai data Excel
- Registrasi otomatis tercatat dengan timestamp

### 3. Duplicate Prevention

- System mencegah duplikasi flight number
- System mencegah player terdaftar 2x dalam satu tournament

## Files Modified/Created

### New Files:
1. ✅ `src/components/admin/FlightExcelUpload.tsx` - Component upload Excel
2. ✅ `public/templates/flight-upload-template.csv` - Template CSV
3. ✅ `FLIGHT_EXCEL_UPLOAD_GUIDE.md` - Dokumentasi ini

### Modified Files:
1. ✅ `src/components/admin/FlightManagement.tsx` - Tambah tombol Excel upload
2. ✅ `convex/flights.ts` - Tambah mutation `getOrCreatePlayer`
3. ✅ `package.json` - Tambah dependency `xlsx`

## Backend Mutations

### New Mutation: `getOrCreatePlayer`

```typescript
export const getOrCreatePlayer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    handicap: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if player exists by email
    const existingPlayer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingPlayer) {
      // Update handicap if provided
      if (args.handicap !== undefined) {
        await ctx.db.patch(existingPlayer._id, { handicap: args.handicap });
      }
      return { success: true, playerId: existingPlayer._id };
    }

    // Create new player
    const playerId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "player",
      handicap: args.handicap || 0,
    });

    return { success: true, playerId };
  },
});
```

## UI/UX Features

### 1. Download Template Button
- Icon download yang jelas
- Background biru dengan border
- Informasi tentang pentingnya download template

### 2. Upload Area
- Drag & drop style dengan border dashed
- Icon upload yang besar
- Clear instructions

### 3. Preview Section
- Menampilkan jumlah flights yang akan dibuat
- Detail setiap flight dengan player count
- List player names untuk setiap flight

### 4. Error Display
- Background merah untuk errors
- List semua validation errors
- Row number untuk mudah identifikasi

### 5. Success Message
- Background hijau dengan checkmark
- Konfirmasi upload berhasil
- Auto close setelah 2 detik

### 6. Loading State
- Spinner animation saat processing
- Disable buttons saat upload
- Clear feedback "Uploading..."

## Example Use Cases

### Use Case 1: Tournament dengan 3 Flights

**Scenario**: Tournament dengan 12 players dibagi 3 flights

**Excel Data**:
```
Flight A (4 players) - Start 08:00 - Hole 1
Flight B (4 players) - Start 08:10 - Hole 1  
Flight C (4 players) - Start 08:20 - Hole 10
```

**Result**:
- 3 flights created
- 12 players registered
- All assigned to correct flights

### Use Case 2: Shotgun Start

**Scenario**: Shotgun start dengan 6 flights dari hole berbeda

**Excel Data**:
```
Flight 1 - Hole 1  - 08:00
Flight 2 - Hole 4  - 08:00
Flight 3 - Hole 7  - 08:00
Flight 4 - Hole 10 - 08:00
Flight 5 - Hole 13 - 08:00
Flight 6 - Hole 16 - 08:00
```

**Result**:
- 6 flights created simultaneously
- Each flight starts at different hole
- All start at same time (shotgun)

### Use Case 3: Mixed Existing & New Players

**Scenario**: Upload dengan mix player lama dan baru

**Excel Data**:
```
john@example.com (existing) - Handicap updated
jane@example.com (new) - Created
bob@example.com (existing) - Handicap updated
```

**Result**:
- Existing players: Handicap updated
- New players: Created with data from Excel
- All assigned to flights correctly

## Troubleshooting

### Problem: "Invalid email format"
**Solution**: Pastikan email format benar (contoh@domain.com)

### Problem: "Flight number already exists"
**Solution**: Gunakan flight number yang berbeda atau hapus flight existing

### Problem: "Player already registered"
**Solution**: Player sudah ada di tournament, remove dari Excel atau hapus dari tournament

### Problem: "Failed to parse Excel file"
**Solution**: 
- Pastikan file format .xlsx atau .xls
- Download template baru dan copy data
- Check tidak ada merged cells

### Problem: "Start Hole must be between 1 and 18"
**Solution**: Pastikan start hole antara 1-18

## Best Practices

### 1. Preparation
- ✅ Download template terlebih dahulu
- ✅ Prepare data di spreadsheet terpisah
- ✅ Validate data sebelum copy ke template

### 2. Data Entry
- ✅ Gunakan format email yang konsisten
- ✅ Double check flight numbers (no duplicates)
- ✅ Verify start holes (1-18)
- ✅ Check player names spelling

### 3. Upload Process
- ✅ Review preview sebelum upload
- ✅ Check error messages carefully
- ✅ Upload saat koneksi internet stabil
- ✅ Verify hasil setelah upload

### 4. After Upload
- ✅ Check flight list di Flight Management
- ✅ Verify player assignments
- ✅ Test player dapat login
- ✅ Check leaderboard data

## Security & Permissions

- ✅ Only **admins** can upload Excel
- ✅ Validation di frontend dan backend
- ✅ Email uniqueness enforced
- ✅ Tournament selection required
- ✅ User authentication checked

## Performance

- ✅ Batch processing untuk multiple flights
- ✅ Efficient database queries
- ✅ Progress feedback untuk user
- ✅ Error handling untuk large files

## Future Enhancements

Possible improvements:
1. 📋 Drag & drop file upload
2. 📊 Export existing flights to Excel
3. 🔄 Update existing flights via Excel
4. 📧 Email notification setelah upload
5. 📈 Upload history/logs
6. 🎨 Custom template dengan logo
7. 🌐 Multi-language support

## Support

Jika ada masalah:
1. Check dokumentasi ini
2. Verify Excel format sesuai template
3. Check error messages
4. Contact admin support

## Status

✅ **COMPLETED** - Fitur Excel upload sudah fully functional dan siap digunakan!

---

**Last Updated**: 2024
**Version**: 1.0.0
