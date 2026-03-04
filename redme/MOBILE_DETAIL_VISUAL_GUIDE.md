# Mobile Detail Pages - Visual Guide

## 🎨 Tournament Detail Page

### Layout Structure

```
┌─────────────────────────────────────┐
│  ← Back    Detail Tournament        │ ← Fixed Header
├─────────────────────────────────────┤
│                                     │
│        [Tournament Banner]          │ ← Full-width Image
│         Status Badge                │   with Gradient Overlay
│                                     │
├─────────────────────────────────────┤
│  Informasi | Jadwal | Peserta (12) │ ← Sticky Tabs
├─────────────────────────────────────┤
│                                     │
│  [Tab Content Area]                 │
│                                     │
│  • Info Cards                       │
│  • Course Details                   │
│  • Schedule Timeline                │
│  • Participant List                 │
│                                     │
│                                     │
└─────────────────────────────────────┘
│  [Action Button]                    │ ← Fixed Bottom
└─────────────────────────────────────┘
```

### Tab 1: Informasi

```
┌─────────────────────────────────────┐
│  Tentang Tournament                 │
│  ─────────────────────────────────  │
│  Tournament description text here   │
│  with full details about the event  │
└─────────────────────────────────────┘

┌──────────────┬──────────────────────┐
│  📅 Tanggal  │  📍 Lokasi           │
│  15 Feb 2026 │  Pondok Indah Golf   │
├──────────────┼──────────────────────┤
│  👥 Peserta  │  🏆 Hadiah           │
│  45/100      │  Rp 50.000.000       │
└──────────────┴──────────────────────┘

┌─────────────────────────────────────┐
│  Biaya Registrasi                   │
│  Rp 500.000                         │
│  ─────────────────────────────────  │
│  Contact Person                     │
│  John Doe - 0812-3456-7890         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🏌️ Informasi Lapangan              │
│  ─────────────────────────────────  │
│  Tipe Lapangan      18 Holes        │
│  Mode Permainan     Stroke Play     │
│  Start Hole         Hole 1          │
│  Male Tee Box       Blue            │
│  Female Tee Box     Red             │
└─────────────────────────────────────┘
```

### Tab 2: Jadwal

```
┌─────────────────────────────────────┐
│  ① 06:00 - 07:00                    │
│  │  Registrasi Peserta              │
│  │  Check-in dan verifikasi peserta │
│  │                                  │
│  ② 07:00 - 07:30                    │
│  │  Briefing & Pembukaan            │
│  │  Penjelasan aturan tournament    │
│  │                                  │
│  ③ 07:30 - 08:00                    │
│  │  Warming Up                      │
│  │  Pemanasan di driving range      │
│  │                                  │
│  ④ 08:00 - 13:00                    │
│     Babak Pertama                   │
│     Permainan 18 holes pertama      │
└─────────────────────────────────────┘
```

### Tab 3: Peserta

```
┌─────────────────────────────────────┐
│  ① John Doe                         │
│     Flight A                  Hole 1│
├─────────────────────────────────────┤
│  ② Jane Smith                       │
│     Flight A                  Hole 1│
├─────────────────────────────────────┤
│  ③ Bob Wilson                       │
│     Flight B                 Hole 10│
├─────────────────────────────────────┤
│  ④ Alice Brown                      │
│     Flight B                 Hole 10│
└─────────────────────────────────────┘
```

### Action Buttons (Status-based)

**Upcoming Tournament**:
```
┌─────────────────────────────────────┐
│  [  Daftar Tournament  ]            │ ← Red Gradient
└─────────────────────────────────────┘
```

**Active Tournament (Registered)**:
```
┌─────────────────────────────────────┐
│  [ ▶ Mulai Bermain ]                │ ← Green Gradient
└─────────────────────────────────────┘
```

**Already Registered**:
```
┌─────────────────────────────────────┐
│  Status: ✓ Terdaftar                │ ← Green Badge
└─────────────────────────────────────┘
```

## 📰 News Detail Page

### Layout Structure

```
┌─────────────────────────────────────┐
│  ← Back    Detail Berita            │ ← Fixed Header
├─────────────────────────────────────┤
│                                     │
│        [News Image]                 │ ← Full-width Image
│     [Category Badge]                │   with Category Icon
│                                     │
├─────────────────────────────────────┤
│                                     │
│  News Title Here                    │ ← Large Bold Title
│  📅 15 Feb 2026  👤 Admin Name      │ ← Meta Info
│                                     │
├─────────────────────────────────────┤
│  Excerpt/Summary                    │ ← Highlighted Box
│  Brief description of the news      │
│  article content here               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Full Content                       │ ← Main Content
│                                     │
│  Lorem ipsum dolor sit amet...      │
│  Full article text with proper      │
│  formatting and line breaks         │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🔗 Bagikan Berita                  │
│  ─────────────────────────────────  │
│  [ Facebook ]  [ WhatsApp ]         │ ← Share Buttons
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [ Kembali ke Daftar Berita ]       │ ← Back Button
└─────────────────────────────────────┘
```

### Category Badges

```
Tournament:  [🏆 Tournament]  ← Blue
Tips:        [💡 Tips]        ← Green
Berita:      [📰 Berita]      ← Purple
Announcement:[📢 Announcement]← Orange
```

### Content Sections

**Header Section**:
```
┌─────────────────────────────────────┐
│  [Full-width Image with Overlay]    │
│                                     │
│  [🏆 Tournament]  ← Category Badge  │
└─────────────────────────────────────┘
```

**Title & Meta**:
```
┌─────────────────────────────────────┐
│  Championship Golf Tournament 2026  │ ← Bold Title
│                                     │
│  📅 15 Februari 2026                │ ← Date
│  👤 Admin Name                      │ ← Author
└─────────────────────────────────────┘
```

**Excerpt Box**:
```
┌─────────────────────────────────────┐
│  "Brief summary of the news article │
│   that highlights the main points   │
│   and attracts reader attention"    │ ← Italic, Highlighted
└─────────────────────────────────────┘
```

**Full Content**:
```
┌─────────────────────────────────────┐
│  Full article content here with     │
│  proper formatting, line breaks,    │
│  and whitespace preservation.       │
│                                     │
│  Multiple paragraphs are supported  │
│  with proper spacing between them.  │
│                                     │
│  The content maintains its original │
│  structure and formatting.          │
└─────────────────────────────────────┘
```

**Share Section**:
```
┌─────────────────────────────────────┐
│  🔗 Bagikan Berita                  │
│  ─────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐        │
│  │ Facebook │  │ WhatsApp │        │
│  │    f     │  │    W     │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors

```
Upcoming:   #3B82F6 (Blue)
Active:     #10B981 (Green)
Completed:  #6B7280 (Gray)
```

### Category Colors

```
Tournament:    #3B82F6 (Blue)
Tips:          #10B981 (Green)
Berita:        #8B5CF6 (Purple)
Announcement:  #F59E0B (Orange)
```

### Background Gradients

```
Card Background:
  from-[#2e2e2e] via-[#171718] to-black

Page Background:
  from-[#1a1a1a] via-[#0f0f0f] to-black

Button Gradient:
  from-red-600 to-red-700
```

## 📱 Responsive Behavior

### Mobile (Default)

```
┌─────────────────┐
│   Full Width    │
│   Single Column │
│   Stack Layout  │
└─────────────────┘
```

### Tablet (768px+)

```
┌─────────────────────────┐
│   Centered Content      │
│   Max Width Container   │
│   Larger Text           │
└─────────────────────────┘
```

## 🎯 Interactive Elements

### Hover States

**Cards**:
```
Normal:  border-gray-800
Hover:   border-gray-700 + shadow-2xl
```

**Buttons**:
```
Normal:  from-red-600 to-red-700
Hover:   from-red-700 to-red-800
```

### Active States

**Tabs**:
```
Active:   text-red-500 + border-b-2 border-red-500
Inactive: text-gray-400
```

**Touch**:
```
Active:   scale-[0.98]
Normal:   scale-100
```

## 🔄 Loading States

### Tournament Detail

```
┌─────────────────────────────────────┐
│                                     │
│         ⟳ Loading...                │ ← Spinner
│     Loading tournament...           │
│                                     │
└─────────────────────────────────────┘
```

### News Detail

```
┌─────────────────────────────────────┐
│                                     │
│         ⟳ Loading...                │ ← Spinner
│     Loading news...                 │
│                                     │
└─────────────────────────────────────┘
```

## 🚫 Empty States

### No Participants

```
┌─────────────────────────────────────┐
│                                     │
│         👥                          │ ← Icon
│                                     │
│    Belum Ada Peserta                │
│    Jadilah yang pertama mendaftar!  │
│                                     │
└─────────────────────────────────────┘
```

### No Schedule

```
┌─────────────────────────────────────┐
│                                     │
│         📅                          │ ← Icon
│                                     │
│    Jadwal Belum Tersedia            │
│    Jadwal akan diumumkan segera     │
│                                     │
└─────────────────────────────────────┘
```

## 📐 Spacing & Typography

### Spacing Scale

```
xs:  0.5rem (8px)
sm:  0.75rem (12px)
md:  1rem (16px)
lg:  1.5rem (24px)
xl:  2rem (32px)
2xl: 2.5rem (40px)
```

### Typography Scale

```
Title:    text-2xl (24px) font-bold
Heading:  text-xl (20px) font-bold
Subhead:  text-lg (18px) font-semibold
Body:     text-base (16px) font-normal
Caption:  text-sm (14px) font-normal
Tiny:     text-xs (12px) font-normal
```

### Line Heights

```
Tight:   leading-tight (1.25)
Normal:  leading-normal (1.5)
Relaxed: leading-relaxed (1.625)
```

## 🎭 Animation & Transitions

### Transitions

```
Default:  transition-all duration-200
Smooth:   transition-all duration-300
Slow:     transition-all duration-500
```

### Animations

```
Spin:     animate-spin
Pulse:    animate-pulse
Bounce:   animate-bounce
```

### Transform

```
Scale Up:   hover:scale-[1.02]
Scale Down: active:scale-[0.98]
```

## 📊 Data Display Patterns

### Info Cards (2-column grid)

```
┌──────────────┬──────────────┐
│  Icon Label  │  Icon Label  │
│  Value       │  Value       │
└──────────────┴──────────────┘
```

### List Items

```
┌─────────────────────────────┐
│  ① Name                     │
│     Subtitle          Value │
└─────────────────────────────┘
```

### Timeline Items

```
┌─────────────────────────────┐
│  ① Time                     │
│  │  Activity               │
│  │  Description            │
│  │                         │
│  ② Time                     │
│     Activity               │
│     Description            │
└─────────────────────────────┘
```

## 🎨 Visual Hierarchy

### Priority Levels

**Level 1 (Highest)**:
- Page title
- Action buttons
- Status badges

**Level 2**:
- Section headings
- Tab labels
- Card titles

**Level 3**:
- Body text
- Meta information
- Descriptions

**Level 4 (Lowest)**:
- Captions
- Helper text
- Timestamps

## 🔍 Accessibility Features

### Focus States

```
focus:outline-none
focus:ring-2
focus:ring-red-500/50
focus:border-red-500/50
```

### Touch Targets

```
Minimum: 44x44px
Buttons: py-3 px-4 (48px height)
Icons:   w-6 h-6 (24px)
```

### Color Contrast

```
Text on Dark:  White (#FFFFFF)
Secondary:     Gray-400 (#9CA3AF)
Disabled:      Gray-600 (#4B5563)
```

## 📱 Mobile-First Approach

### Design Principles

1. **Touch-Friendly**: Large tap targets (min 44px)
2. **Readable**: Appropriate font sizes (min 14px)
3. **Scannable**: Clear hierarchy and spacing
4. **Fast**: Optimized images and lazy loading
5. **Responsive**: Adapts to screen sizes

### Performance Optimizations

1. **Image Loading**: Lazy load with fallbacks
2. **Code Splitting**: Route-based lazy loading
3. **Data Fetching**: Real-time with caching
4. **Animations**: GPU-accelerated transforms

## ✨ Summary

Halaman detail tournament dan news dirancang dengan:

1. ✅ **Visual Hierarchy** yang jelas
2. ✅ **Mobile-First Design** yang optimal
3. ✅ **Interactive Elements** yang responsif
4. ✅ **Loading & Empty States** yang informatif
5. ✅ **Consistent Styling** di seluruh aplikasi
6. ✅ **Accessibility** yang baik
7. ✅ **Performance** yang optimal

Semua elemen dirancang untuk memberikan pengalaman pengguna yang terbaik di perangkat mobile!
