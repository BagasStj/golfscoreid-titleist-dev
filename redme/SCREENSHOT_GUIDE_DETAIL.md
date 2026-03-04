# Screenshot Guide - Detail Pages

## 📸 Visual Walkthrough

Panduan visual untuk halaman detail tournament dan news di mobile interface.

## 🏆 Tournament Detail Page

### 1. Header & Banner
```
┌─────────────────────────────────────┐
│  ← Back    Detail Tournament        │ ← Fixed Header (Dark)
├─────────────────────────────────────┤
│                                     │
│     [Tournament Banner Image]       │ ← Full-width Banner
│                                     │   (256px height)
│         [Status Badge]              │   Status di kanan atas
│                                     │
│     Tournament Name Here            │ ← Title overlay
└─────────────────────────────────────┘
```

**Elemen**:
- Back button (kiri atas)
- Title "Detail Tournament" (tengah)
- Banner image full-width
- Status badge (Upcoming/Active/Completed)
- Tournament name di bawah banner

### 2. Tab Navigation
```
┌─────────────────────────────────────┐
│  Informasi | Jadwal | Peserta (12) │ ← Sticky Tabs
└─────────────────────────────────────┘
```

**Elemen**:
- 3 tabs: Informasi, Jadwal, Peserta
- Tab aktif: text merah + border bawah merah
- Tab inactive: text abu-abu
- Jumlah peserta di tab Peserta

### 3. Tab Informasi - Deskripsi
```
┌─────────────────────────────────────┐
│  Tentang Tournament                 │ ← Section Title
│  ─────────────────────────────────  │
│  Tournament description text here   │ ← Description
│  with full details about the event  │   (Gray text)
│  and all important information.     │
└─────────────────────────────────────┘
```

### 4. Tab Informasi - Info Cards
```
┌──────────────┬──────────────────────┐
│  📅 Tanggal  │  📍 Lokasi           │ ← 2x2 Grid
│  15 Feb 2026 │  Pondok Indah Golf   │
├──────────────┼──────────────────────┤
│  👥 Peserta  │  🏆 Hadiah           │
│  45/100      │  Rp 50.000.000       │
└──────────────┴──────────────────────┘
```

**Elemen**:
- Grid 2 kolom
- Icon + label (merah)
- Value (putih, bold)
- Background: dark gradient
- Border: gray-800

### 5. Tab Informasi - Additional Info
```
┌─────────────────────────────────────┐
│  Biaya Registrasi                   │ ← Label (gray)
│  Rp 500.000                         │ ← Value (white, bold)
│  ─────────────────────────────────  │ ← Divider
│  Contact Person                     │
│  John Doe - 0812-3456-7890         │
└─────────────────────────────────────┘
```

### 6. Tab Informasi - Course Info
```
┌─────────────────────────────────────┐
│  🏌️ Informasi Lapangan              │ ← Section Title
│  ─────────────────────────────────  │
│  Tipe Lapangan      18 Holes        │ ← Key-Value Pairs
│  Mode Permainan     Stroke Play     │   (Spaced evenly)
│  Start Hole         Hole 1          │
│  Male Tee Box       Blue            │
│  Female Tee Box     Red             │
└─────────────────────────────────────┘
```

### 7. Tab Jadwal - Timeline
```
┌─────────────────────────────────────┐
│  ① 06:00 - 07:00                    │ ← Number Badge
│  │  Registrasi Peserta              │   (Red circle)
│  │  Check-in dan verifikasi peserta │
│  │                                  │ ← Connecting Line
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

**Elemen**:
- Numbered badges (1, 2, 3, 4)
- Connecting vertical line
- Time (red, bold)
- Activity (white, bold)
- Description (gray)

### 8. Tab Peserta - List
```
┌─────────────────────────────────────┐
│  ① John Doe                         │ ← Number Badge
│     Flight A                  Hole 1│   Name + Flight
├─────────────────────────────────────┤
│  ② Jane Smith                       │
│     Flight A                  Hole 1│
├─────────────────────────────────────┤
│  ③ Bob Wilson                       │
│     Flight B                 Hole 10│
└─────────────────────────────────────┘
```

**Elemen**:
- Numbered badge (red circle)
- Player name (white, bold)
- Flight name (gray, small)
- Start hole (right aligned)

### 9. Action Buttons

**Upcoming (Not Registered)**:
```
┌─────────────────────────────────────┐
│  [  Daftar Tournament  ]            │ ← Red Gradient
└─────────────────────────────────────┘
```

**Active (Registered)**:
```
┌─────────────────────────────────────┐
│  [ ▶ Mulai Bermain ]                │ ← Green Gradient
└─────────────────────────────────────┘
```

**Already Registered Badge**:
```
┌─────────────────────────────────────┐
│  ✓ Terdaftar                        │ ← Green Badge
└─────────────────────────────────────┘
```

## 📰 News Detail Page

### 1. Header & Image
```
┌─────────────────────────────────────┐
│  ← Back    Detail Berita            │ ← Fixed Header
├─────────────────────────────────────┤
│                                     │
│     [News Banner Image]             │ ← Full-width Image
│                                     │   (256px height)
│  [🏆 Tournament]                    │ ← Category Badge
│                                     │   (Top-left)
└─────────────────────────────────────┘
```

**Elemen**:
- Back button (kiri atas)
- Title "Detail Berita" (tengah)
- Banner image full-width
- Category badge dengan icon

### 2. Title & Meta
```
┌─────────────────────────────────────┐
│  Championship Golf Tournament 2026  │ ← Title (Large, Bold)
│                                     │
│  📅 15 Februari 2026                │ ← Date
│  👤 Admin Name                      │ ← Author
└─────────────────────────────────────┘
```

**Elemen**:
- Title (text-2xl, bold, white)
- Date dengan icon (gray)
- Author dengan icon (gray)
- Spacing yang baik

### 3. Excerpt Box
```
┌─────────────────────────────────────┐
│  "Brief summary of the news article │ ← Highlighted Box
│   that highlights the main points   │   (Italic, Gray-300)
│   and attracts reader attention"    │   (Background: dark)
└─────────────────────────────────────┘
```

**Elemen**:
- Background: dark gradient
- Border: gray-800
- Text: italic, gray-300
- Padding: generous

### 4. Full Content
```
┌─────────────────────────────────────┐
│  Full article content here with     │ ← Main Content
│  proper formatting, line breaks,    │   (White text)
│  and whitespace preservation.       │   (Base size)
│                                     │
│  Multiple paragraphs are supported  │
│  with proper spacing between them.  │
│                                     │
│  The content maintains its original │
│  structure and formatting.          │
└─────────────────────────────────────┘
```

**Elemen**:
- Background: dark gradient
- Border: gray-800
- Text: white, base size
- Line height: relaxed
- Whitespace: preserved

### 5. Share Section
```
┌─────────────────────────────────────┐
│  🔗 Bagikan Berita                  │ ← Section Title
│  ─────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐        │
│  │ Facebook │  │ WhatsApp │        │ ← Share Buttons
│  │    f     │  │    W     │        │   (Blue & Green)
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

**Elemen**:
- Section title dengan icon
- 2 buttons side-by-side
- Facebook: blue background
- WhatsApp: green background
- Icons: brand icons

### 6. Back Button
```
┌─────────────────────────────────────┐
│  [ Kembali ke Daftar Berita ]       │ ← Gray Button
└─────────────────────────────────────┘
```

**Elemen**:
- Full width
- Dark background
- Border: gray-800
- Text: white

## 🎨 Color Reference

### Status Colors
```
┌──────────┬──────────┬──────────┐
│ Upcoming │  Active  │Completed │
│  #3B82F6 │ #10B981  │ #6B7280  │
│   Blue   │  Green   │   Gray   │
└──────────┴──────────┴──────────┘
```

### Category Colors
```
┌──────────┬──────────┬──────────┬──────────┐
│Tournament│   Tips   │  Berita  │Announce  │
│ #3B82F6  │ #10B981  │ #8B5CF6  │ #F59E0B  │
│   Blue   │  Green   │  Purple  │  Orange  │
└──────────┴──────────┴──────────┴──────────┘
```

### Background Gradients
```
Card Background:
  ┌─────────────────┐
  │   #2e2e2e       │ ← Top
  │   #161616       │ ← Middle
  │   #1d1d1d       │ ← Bottom
  └─────────────────┘

Page Background:
  ┌─────────────────┐
  │   #1a1a1a       │ ← Top
  │   #0f0f0f       │ ← Middle
  │   #000000       │ ← Bottom
  └─────────────────┘
```

## 📐 Spacing Guide

### Component Spacing
```
┌─────────────────────────────────────┐
│  ↕ 16px (py-4)                      │ ← Padding Top/Bottom
│  ↔ 16px (px-4)                      │ ← Padding Left/Right
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Component Content          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ↕ 20px (space-y-5)                 │ ← Gap between items
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Next Component             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Card Spacing
```
┌─────────────────────────────────────┐
│  ↕ 20px (p-5)                       │
│  ↔ 20px                             │
│                                     │
│  Title                              │
│  ↕ 12px (mb-3)                      │
│  Content                            │
│                                     │
└─────────────────────────────────────┘
```

## 🎯 Interactive States

### Button States
```
Normal:
┌─────────────────┐
│  Button Text    │ ← from-red-600 to-red-700
└─────────────────┘

Hover:
┌─────────────────┐
│  Button Text    │ ← from-red-700 to-red-800
└─────────────────┘

Active (Pressed):
┌───────────────┐
│  Button Text  │   ← scale-[0.98]
└───────────────┘
```

### Tab States
```
Active Tab:
┌─────────────────┐
│  Tab Label      │ ← text-red-500
└─────────────────┘
      ═══           ← border-b-2 border-red-500

Inactive Tab:
┌─────────────────┐
│  Tab Label      │ ← text-gray-400
└─────────────────┘
```

### Card States
```
Normal:
┌─────────────────┐
│  Card Content   │ ← border-gray-800
└─────────────────┘

Hover:
┌─────────────────┐
│  Card Content   │ ← border-gray-700
└─────────────────┘   shadow-2xl
```

## 📱 Responsive Behavior

### Mobile (Default)
```
┌─────────────────┐
│   Full Width    │ ← 100% width
│   Single Column │   px-4 padding
│   Stack Layout  │   space-y-5
└─────────────────┘
```

### Tablet (768px+)
```
┌─────────────────────────┐
│   Centered Content      │ ← max-w-2xl
│   Larger Padding        │   px-6
│   Bigger Text           │   text-lg
└─────────────────────────┘
```

## 🔍 Loading States

### Tournament Detail Loading
```
┌─────────────────────────────────────┐
│                                     │
│              ⟳                      │ ← Spinning Icon
│                                     │   (Red border)
│      Loading tournament...          │ ← Gray text
│                                     │
└─────────────────────────────────────┘
```

### News Detail Loading
```
┌─────────────────────────────────────┐
│                                     │
│              ⟳                      │ ← Spinning Icon
│                                     │   (Red border)
│      Loading news...                │ ← Gray text
│                                     │
└─────────────────────────────────────┘
```

## 🚫 Empty States

### No Participants
```
┌─────────────────────────────────────┐
│                                     │
│         👥                          │ ← Large Icon
│                                     │   (Gray)
│    Belum Ada Peserta                │ ← Title (White)
│    Jadilah yang pertama mendaftar!  │ ← Subtitle (Gray)
│                                     │
└─────────────────────────────────────┘
```

### No Schedule
```
┌─────────────────────────────────────┐
│                                     │
│         📅                          │ ← Large Icon
│                                     │   (Gray)
│    Jadwal Belum Tersedia            │ ← Title (White)
│    Jadwal akan diumumkan segera     │ ← Subtitle (Gray)
│                                     │
└─────────────────────────────────────┘
```

## ✨ Animation Examples

### Fade In
```
Opacity: 0 → 1
Duration: 300ms
Easing: ease-in-out
```

### Slide Up
```
Transform: translateY(20px) → translateY(0)
Duration: 300ms
Easing: ease-out
```

### Scale Press
```
Transform: scale(1) → scale(0.98) → scale(1)
Duration: 150ms
Easing: ease-in-out
```

## 📝 Typography Examples

### Title Hierarchy
```
Page Title:     text-2xl font-bold (24px)
Section Title:  text-xl font-bold (20px)
Card Title:     text-lg font-bold (18px)
Body Text:      text-base (16px)
Caption:        text-sm (14px)
Tiny:           text-xs (12px)
```

### Text Colors
```
Primary:    text-white (#FFFFFF)
Secondary:  text-gray-400 (#9CA3AF)
Tertiary:   text-gray-500 (#6B7280)
Accent:     text-red-500 (#EF4444)
```

## 🎉 Summary

Panduan visual ini menunjukkan:

1. ✅ **Layout Structure** - Struktur halaman lengkap
2. ✅ **Component Design** - Desain setiap komponen
3. ✅ **Color Scheme** - Skema warna yang digunakan
4. ✅ **Spacing Guide** - Panduan jarak dan padding
5. ✅ **Interactive States** - State interaktif
6. ✅ **Responsive Behavior** - Perilaku responsif
7. ✅ **Loading & Empty States** - State loading dan kosong
8. ✅ **Animation Examples** - Contoh animasi

Gunakan panduan ini sebagai referensi untuk memahami tampilan dan behavior dari halaman detail tournament dan news!
