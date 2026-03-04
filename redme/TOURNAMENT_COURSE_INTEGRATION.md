# Tournament - Course Integration

## ✅ Implementasi Selesai

Tournament creation form sekarang terintegrasi dengan Course Management. Lokasi tournament otomatis diambil dari course yang dipilih.

## 🔄 Perubahan yang Dilakukan

### 1. Database Schema (`convex/schema.ts`)

Field `courseId` sudah ada di tournaments table (optional untuk backward compatibility):
```typescript
tournaments: defineTable({
  // ... fields lain
  courseId: v.optional(v.id("courses")),
  location: v.optional(v.string()),
  // ...
})
```

### 2. Backend (`convex/tournaments.ts`)

Update `createTournament` mutation untuk menerima `courseId`:
```typescript
export const createTournament = mutation({
  args: {
    // ... args lain
    courseId: v.optional(v.id("courses")),
    location: v.string(),
    // ...
  },
  handler: async (ctx, args) => {
    // ... logic
    const tournamentId = await ctx.db.insert("tournaments", {
      // ... fields lain
      courseId: args.courseId,
      location: args.location,
      // ...
    });
  }
});
```

### 3. Frontend (`src/components/admin/TournamentCreationForm.tsx`)

#### A. Import & Query Courses
```typescript
import { useQuery } from 'convex/react';
import type { Id } from '../../../convex/_generated/dataModel';

// Query active courses
const courses = useQuery(api.courses.list, { includeInactive: false });
```

#### B. Update Form State
```typescript
const [formData, setFormData] = useState({
  // ... fields lain
  courseId: '' as Id<"courses"> | '',
  location: '', // Auto-filled from course
  // ...
});
```

#### C. Update Validation
```typescript
const validateField = (name: string, value: string | number | number[]) => {
  switch (name) {
    case 'courseId':
      return !value || (typeof value === 'string' && !value.trim())
        ? 'Course selection is required'
        : '';
    // ... validations lain
  }
};
```

#### D. Course Selection Field
```tsx
<div>
  <label htmlFor="courseId">Golf Course *</label>
  <select
    id="courseId"
    value={formData.courseId}
    onChange={(e) => {
      const selectedCourse = courses?.find(c => c._id === e.target.value);
      setFormData({ 
        ...formData, 
        courseId: e.target.value as Id<"courses">,
        location: selectedCourse 
          ? `${selectedCourse.name} - ${selectedCourse.location}` 
          : '',
      });
    }}
  >
    <option value="">-- Pilih Lapangan Golf --</option>
    {courses?.map((course) => (
      <option key={course._id} value={course._id}>
        {course.name} - {course.location} ({course.totalHoles} holes)
      </option>
    ))}
  </select>
</div>
```

#### E. Location Display (Read-only)
```tsx
{formData.location && (
  <div>
    <label>Location (Auto-filled from course)</label>
    <input
      type="text"
      value={formData.location}
      readOnly
      className="bg-gray-50 text-gray-600 cursor-not-allowed"
    />
  </div>
)}
```

## 🎯 Fitur Baru

### 1. Course Selection Dropdown
- Menampilkan semua active courses
- Format: "Course Name - Location (X holes)"
- Required field dengan validation

### 2. Auto-fill Location
- Location otomatis terisi saat course dipilih
- Format: "Course Name - Location"
- Read-only field (tidak bisa diedit manual)

### 3. Warning untuk Empty Courses
- Jika belum ada course, tampilkan warning
- Arahkan user untuk membuat course terlebih dahulu

### 4. Backward Compatibility
- `courseId` optional di schema
- Tournament lama tanpa courseId tetap berfungsi
- Location tetap bisa diisi manual jika courseId tidak ada

## 📋 User Flow

### Membuat Tournament Baru

1. **Admin buka Tournament Creation Form**
2. **Isi Tournament Name**
3. **Pilih Golf Course dari dropdown**
   - Dropdown menampilkan list active courses
   - Format: "Pondok Indah Golf Course - Jakarta Selatan (18 holes)"
4. **Location otomatis terisi**
   - Tidak perlu input manual
   - Format: "Pondok Indah Golf Course - Jakarta Selatan"
5. **Isi fields lainnya** (date, time, dll)
6. **Submit form**

### Jika Belum Ada Course

1. **Admin buka Tournament Creation Form**
2. **Melihat warning**: "⚠️ Belum ada course. Silakan buat course terlebih dahulu di menu Course Management."
3. **Admin pergi ke Course Management**
4. **Buat course baru**
5. **Kembali ke Tournament Creation**
6. **Course sudah tersedia di dropdown**

## 🔗 Integration Benefits

### 1. Data Consistency
- Location selalu konsisten dengan course
- Tidak ada typo atau variasi nama
- Mudah untuk filter/group tournaments by course

### 2. Better UX
- Tidak perlu ketik location manual
- Dropdown lebih user-friendly
- Mengurangi human error

### 3. Future Enhancements Ready
- Bisa auto-load holes configuration dari course
- Bisa auto-set tee boxes berdasarkan course
- Bisa show course details (rating, slope, dll)
- Bisa filter tournaments by course

### 4. Reporting & Analytics
- Mudah untuk generate report per course
- Bisa track tournament frequency per course
- Bisa analyze course popularity

## 🎨 UI Changes

### Before
```
┌─────────────────────────────────┐
│ Location *                      │
│ ┌─────────────────────────────┐ │
│ │ [Manual text input]         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### After
```
┌─────────────────────────────────┐
│ Golf Course *                   │
│ ┌─────────────────────────────┐ │
│ │ [Dropdown select]           │ │
│ │ - Pondok Indah - Jakarta    │ │
│ │ - Senayan - Jakarta         │ │
│ │ - BSD Golf - Tangerang      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Location (Auto-filled)          │
│ ┌─────────────────────────────┐ │
│ │ Pondok Indah Golf - Jakarta │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔮 Future Enhancements

### 1. Auto-load Holes Configuration
```typescript
// Saat course dipilih, auto-load holes config
const selectedCourse = await ctx.db.get(courseId);
const holes = await ctx.db
  .query("holes_config")
  .withIndex("by_course", (q) => q.eq("courseId", courseId))
  .collect();

// Use holes config untuk tournament
```

### 2. Smart Tee Box Selection
```typescript
// Auto-suggest tee boxes berdasarkan yang tersedia di course
const availableTeeBoxes = selectedCourse.teeBoxes.map(tb => tb.name);
// Filter tee box options berdasarkan availableTeeBoxes
```

### 3. Course Details Display
```tsx
{selectedCourse && (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4>Course Details:</h4>
    <p>Total Holes: {selectedCourse.totalHoles}</p>
    <p>Available Tee Boxes: {selectedCourse.teeBoxes.map(tb => tb.name).join(', ')}</p>
  </div>
)}
```

### 4. Course Availability Check
```typescript
// Check jika course sudah digunakan di tanggal yang sama
const existingTournaments = await ctx.db
  .query("tournaments")
  .filter((q) => 
    q.and(
      q.eq(q.field("courseId"), courseId),
      q.eq(q.field("date"), selectedDate)
    )
  )
  .collect();

if (existingTournaments.length > 0) {
  // Show warning: "Course already has tournament on this date"
}
```

## ✅ Testing Checklist

- [x] Course dropdown menampilkan active courses
- [x] Location auto-fill saat course dipilih
- [x] Validation untuk course selection
- [x] Warning saat belum ada course
- [x] Tournament berhasil dibuat dengan courseId
- [x] Backward compatibility untuk tournament lama
- [x] Build berhasil tanpa error

## 📝 Notes

1. **Required Field**: Course selection adalah required field
2. **Active Only**: Hanya active courses yang ditampilkan
3. **Auto-fill**: Location otomatis terisi, tidak bisa diedit manual
4. **Validation**: Form tidak bisa submit jika course belum dipilih
5. **Warning**: Jika belum ada course, tampilkan helpful message

## 🎉 Conclusion

Tournament creation sekarang terintegrasi dengan Course Management:

1. ✅ Location otomatis dari course
2. ✅ Dropdown selection yang user-friendly
3. ✅ Data consistency terjaga
4. ✅ Ready untuk future enhancements
5. ✅ Backward compatible
6. ✅ Build berhasil

Admin sekarang bisa membuat tournament dengan lebih mudah dan konsisten!
