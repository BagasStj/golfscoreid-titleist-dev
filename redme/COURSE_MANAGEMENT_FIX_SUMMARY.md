# Course Management - Schema Migration Fix

## ✅ Problem Solved

Error yang terjadi:
```
Schema validation failed.
Document with ID "..." in table "holes_config" does not match the schema: 
Object is missing the required field `courseId`.
```

## 🔧 Solusi yang Diimplementasikan

### 1. Schema Update - Backward Compatibility

**File**: `convex/schema.ts`

Membuat `courseId` dan `distances` menjadi **optional** untuk backward compatibility:

```typescript
holes_config: defineTable({
  courseId: v.optional(v.id("courses")), // Optional untuk data lama
  holeNumber: v.number(),
  par: v.number(),
  index: v.number(),
  courseSection: v.union(v.literal("front9"), v.literal("back9")),
  distances: v.optional(v.array(v.object({
    teeBoxName: v.string(),
    distance: v.number(),
  }))),
})
```

### 2. Migration Functions

**File**: `convex/migrateHolesConfig.ts` (NEW)

Dua mutation functions untuk handle migration:

#### `migrateHolesConfigToCourse`
- Migrate data lama ke course yang dipilih
- Menambahkan `courseId` dan default `distances`
- Mempertahankan data existing (par, index, section)

#### `deleteOldHolesConfig`
- Menghapus semua data lama tanpa `courseId`
- ⚠️ Permanent deletion - tidak bisa di-undo

### 3. Migration Helper UI

**File**: `src/components/admin/MigrationHelper.tsx` (NEW)

Component UI yang user-friendly untuk:
- Menampilkan warning jika ada data lama
- Dropdown untuk pilih course target
- Button untuk migrate atau delete
- Success/error messages
- Informasi dan instruksi yang jelas

### 4. Integration dengan Course Management

**File**: `src/components/admin/CourseManagement.tsx` (UPDATED)

- Menampilkan MigrationHelper di bagian atas
- Bisa di-hide jika user tidak mau lihat warning
- Seamless integration dengan existing UI

### 5. Type Safety Fix

**File**: `src/components/admin/HoleConfigurationModal.tsx` (UPDATED)

Handle optional `distances` field:
```typescript
distances: h.distances || courseWithHoles.teeBoxes.map(tb => ({
  teeBoxName: tb.name,
  distance: 0,
}))
```

## 📋 Files Changed/Created

### New Files
1. `convex/migrateHolesConfig.ts` - Migration functions
2. `src/components/admin/MigrationHelper.tsx` - Migration UI
3. `MIGRATION_GUIDE.md` - User documentation
4. `COURSE_MANAGEMENT_FIX_SUMMARY.md` - This file

### Updated Files
1. `convex/schema.ts` - Made courseId and distances optional
2. `src/components/admin/CourseManagement.tsx` - Added MigrationHelper
3. `src/components/admin/HoleConfigurationModal.tsx` - Handle optional distances
4. `src/components/admin/index.ts` - Export MigrationHelper

## 🎯 How to Use

### For Users with Old Data

1. **Login as Admin**
2. **Go to Course Management**
3. **See Migration Helper warning**
4. **Choose one option:**

   **Option A: Migrate (Recommended)**
   - Create a course first (if not exists)
   - Select the course from dropdown
   - Click "Migrate to Selected Course"
   - Verify the data

   **Option B: Delete**
   - Click "Delete Old Records"
   - Confirm deletion
   - Start fresh with new courses

### For New Users

- No action needed
- Create courses normally
- Configure holes as usual
- No migration required

## 🔒 Safety Features

1. **Admin-only Access**
   - Migration functions require admin authentication
   - Regular users cannot run migrations

2. **Validation**
   - Course existence check before migration
   - Proper error handling and messages

3. **Backward Compatibility**
   - Old data won't break the system
   - Optional fields allow gradual migration

4. **User Confirmation**
   - Delete operation requires explicit confirmation
   - Clear warnings about permanent deletion

## 📊 Migration Process Flow

```
Old Data (no courseId)
         ↓
User sees warning in Course Management
         ↓
User chooses option:
         ↓
    ┌────┴────┐
    ↓         ↓
Migrate    Delete
    ↓         ↓
Select     Confirm
Course     Delete
    ↓         ↓
Execute    Execute
Migration  Deletion
    ↓         ↓
Verify     Start
Results    Fresh
    ↓         ↓
    └────┬────┘
         ↓
   Clean Data
```

## ✅ Testing Checklist

- [x] Schema validation passes
- [x] Build succeeds without errors
- [x] Migration function works correctly
- [x] Delete function works correctly
- [x] UI displays properly
- [x] Error handling works
- [x] Admin authentication enforced
- [x] Backward compatibility maintained
- [x] Type safety preserved

## 🚀 Deployment Notes

1. **Deploy Schema Changes First**
   - Schema with optional fields
   - Allows old data to exist temporarily

2. **Deploy Migration Functions**
   - Backend functions for migration
   - Admin can run when ready

3. **Deploy UI Updates**
   - MigrationHelper component
   - User can see and act on warning

4. **User Action Required**
   - Admin must manually run migration
   - Or delete old data
   - System will work with either option

## 📝 Future Considerations

### Phase Out Optional Fields

After all users have migrated, we can:

1. **Make courseId Required Again**
   ```typescript
   courseId: v.id("courses"), // No longer optional
   ```

2. **Make distances Required**
   ```typescript
   distances: v.array(...), // No longer optional
   ```

3. **Remove Migration Code**
   - Delete `migrateHolesConfig.ts`
   - Remove MigrationHelper component
   - Clean up documentation

### Timeline Suggestion

- **Week 1-2**: Deploy with optional fields
- **Week 3-4**: Monitor user migrations
- **Week 5+**: If all migrated, make fields required
- **Week 6+**: Remove migration code

## 🐛 Known Issues

None at this time.

## 📚 Documentation

- **User Guide**: `MIGRATION_GUIDE.md`
- **Course Management**: `COURSE_MANAGEMENT_GUIDE.md`
- **Implementation**: `COURSE_MANAGEMENT_IMPLEMENTATION.md`
- **API Reference**: Inline comments in code

## 🎉 Conclusion

Schema migration issue telah berhasil diperbaiki dengan:

1. ✅ Backward compatibility maintained
2. ✅ User-friendly migration UI
3. ✅ Safe migration process
4. ✅ Clear documentation
5. ✅ Type safety preserved
6. ✅ Build succeeds
7. ✅ Ready for deployment

Users dapat memilih untuk migrate data lama atau start fresh, dan sistem akan bekerja dengan baik dalam kedua skenario.
