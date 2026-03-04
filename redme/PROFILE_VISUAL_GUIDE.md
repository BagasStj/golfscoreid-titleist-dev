# Profile Mobile - Visual Guide

## 🎨 UI Components Visual Reference

### 1. My Profile Page (Main)

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │  👤 [Avatar]                  │  │
│  │  John Doe                     │  │
│  │  john@example.com             │  │
│  │  [Pro Member]                 │  │
│  │                               │  │
│  │  🏆    ⛳    ⭐    📊         │  │
│  │   5    90    72   74.5       │  │
│  │  Tour  Holes Best  Avg       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🏅 Pencapaian Terbaru         │  │
│  │                               │  │
│  │ 🏆 Tournament Completed       │  │
│  │    Jakarta Open 2026          │  │
│  │    15 Jan                     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👤 Edit Profile            >  │  │
│  │ 📜 Riwayat Tournament      >  │  │
│  │ 📊 Statistik Saya          >  │  │
│  │ ⚙️  Pengaturan              >  │  │
│  │ ❓ Bantuan & FAQ           >  │  │
│  └───────────────────────────────┘  │
│                                     │
│  [        🚪 Logout        ]       │
│                                     │
│  Version 1.0.0                      │
└─────────────────────────────────────┘
```

### 2. Edit Profile Modal

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ Edit Profile              [X]   │ │ ← Sticky Header
│ └─────────────────────────────────┘ │
│                                     │
│  Nama Lengkap                       │
│  [John Doe                    ]     │
│                                     │
│  No. Telepon                        │
│  [08123456789                 ]     │
│                                     │
│  Jenis Kelamin                      │
│  [ Pria ]  [ Wanita ]              │
│   (red)     (gray)                  │
│                                     │
│  Handicap                           │
│  [12                          ]     │
│                                     │
│  Lokasi Kerja                       │
│  [Jakarta, Indonesia          ]     │
│                                     │
│  Ukuran Baju                        │
│  [S] [M] [L] [XL]                  │
│       (red)                         │
│                                     │
│  Ukuran Sarung Tangan               │
│  [S] [M] [L] [XL]                  │
│       (red)                         │
│                                     │
│  [   Simpan Perubahan   ]          │
│                                     │
└─────────────────────────────────────┘
```

### 3. Tournament History Modal

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ Riwayat Tournament        [X]   │ │
│ │ Total: 5 tournament             │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ● Sedang Berlangsung               │
│  ┌─────────────────────────────┐   │
│  │ Jakarta Open 2026  [Active] │   │
│  │ Senayan Golf Course         │   │
│  │ 📅 15 Jan 2026  👥 24      │   │
│  │ 18holes • strokePlay        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ● Akan Datang                      │
│  ┌─────────────────────────────┐   │
│  │ Bandung Classic [Upcoming]  │   │
│  │ Dago Golf Course            │   │
│  │ 📅 20 Feb 2026  👥 32      │   │
│  │ 18holes • system36          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ● Selesai                          │
│  ┌─────────────────────────────┐   │
│  │ Surabaya Open  [Completed]  │   │
│  │ Ciputra Golf Course         │   │
│  │ 📅 10 Jan 2026  👥 28      │   │
│  │ 18holes • strokePlay        │   │
│  │ Peringkat: #5               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 4. Player Statistics Modal

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ Statistik Saya            [X]   │ │
│ │ Performa keseluruhan            │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ 🏆       │ │ ⛳       │         │
│  │   5      │ │   90     │         │
│  │ Total    │ │ Total    │         │
│  │ Tourna.. │ │ Holes    │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ ⭐       │ │ 📊       │         │
│  │   72     │ │  74.5    │         │
│  │ Best     │ │ Avg      │         │
│  │ Score    │ │ Score    │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📈 Distribusi Score         │   │
│  │                             │   │
│  │ 🦅 Eagle          2         │   │
│  │ ████░░░░░░░░░░░░░░░░        │   │
│  │                             │   │
│  │ 🐦 Birdie        15         │   │
│  │ ████████░░░░░░░░░░░░        │   │
│  │                             │   │
│  │ ✅ Par           45         │   │
│  │ ████████████████░░░░        │   │
│  │                             │   │
│  │ ⚠️  Bogey        20         │   │
│  │ ██████████░░░░░░░░░░        │   │
│  │                             │   │
│  │ ❌ Double+        8         │   │
│  │ ████░░░░░░░░░░░░░░░░        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Metrik Performa          │   │
│  │                             │   │
│  │ Fairway Hit Rate      75%   │   │
│  │ ███████████████░░░░░        │   │
│  │                             │   │
│  │ Green in Regulation   60%   │   │
│  │ ████████████░░░░░░░░        │   │
│  │                             │   │
│  │ Par Save Rate         50%   │   │
│  │ ██████████░░░░░░░░░░        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📉 Performa Terkini         │   │
│  │                             │   │
│  │ Jakarta Open 2026           │   │
│  │ 15 Jan 2026          72 -2  │   │
│  │                      (green)│   │
│  │                             │   │
│  │ Bandung Classic              │   │
│  │ 10 Jan 2026          76 +4  │   │
│  │                      (red)  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏅 Pencapaian               │   │
│  │                             │   │
│  │ ┌──────┐ ┌──────┐          │   │
│  │ │ 🦅   │ │ 🐦   │          │   │
│  │ │Eagle │ │Birdie│          │   │
│  │ │Hunter│ │Master│          │   │
│  │ │2 Eag │ │15 Bir│          │   │
│  │ └──────┘ └──────┘          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 Color Scheme

### Background Gradients
```css
/* Main containers */
from-[#2e2e2e] via-[#171718] to-black

/* Cards */
bg-black/30

/* Headers */
from-red-600 to-red-700
```

### Status Colors
```css
/* Active */
bg-green-500/20 text-green-400 border-green-500/30

/* Upcoming */
bg-blue-500/20 text-blue-400 border-blue-500/30

/* Completed */
bg-gray-500/20 text-gray-400 border-gray-500/30
```

### Score Colors
```css
/* Eagle */
bg-yellow-500

/* Birdie */
bg-blue-500

/* Par */
bg-green-500

/* Bogey */
bg-orange-500

/* Double Bogey+ */
bg-red-500
```

### Stat Card Gradients
```css
/* Blue */
from-blue-600 to-blue-700

/* Green */
from-green-600 to-green-700

/* Yellow */
from-yellow-600 to-yellow-700

/* Purple */
from-purple-600 to-purple-700
```

## 📐 Layout Dimensions

### Modal
```css
/* Container */
max-w-2xl          /* Desktop */
max-w-md           /* Mobile (Edit Profile) */
max-h-[90vh]       /* Max height */

/* Header */
p-5                /* Padding */
sticky top-0       /* Sticky position */

/* Content */
p-5                /* Padding */
space-y-5          /* Vertical spacing */
overflow-y-auto    /* Scrollable */
max-h-[calc(90vh-100px)]
```

### Cards
```css
/* Stat Cards */
p-4                /* Padding */
rounded-xl         /* Border radius */

/* Tournament Cards */
p-4                /* Padding */
rounded-xl         /* Border radius */
border             /* Border */
border-gray-800    /* Border color */
```

### Buttons
```css
/* Primary */
py-4 px-6          /* Padding */
rounded-xl         /* Border radius */

/* Secondary */
py-3 px-4          /* Padding */
rounded-xl         /* Border radius */

/* Icon */
p-2                /* Padding */
rounded-full       /* Border radius */
```

### Grid Layouts
```css
/* Stats Grid (4 columns) */
grid grid-cols-4 gap-3

/* Stats Grid (2 columns) */
grid grid-cols-2 gap-4

/* Size Buttons (4 columns) */
grid grid-cols-4 gap-2

/* Gender Buttons (2 columns) */
grid grid-cols-2 gap-3
```

## 🔤 Typography

### Headers
```css
/* Modal Title */
text-xl font-bold text-white

/* Section Title */
text-lg font-bold text-white

/* Card Title */
text-lg font-bold text-white
```

### Body Text
```css
/* Primary */
text-base text-white

/* Secondary */
text-sm text-gray-400

/* Small */
text-xs text-gray-400
```

### Stats
```css
/* Large Number */
text-2xl font-bold text-white

/* Medium Number */
text-lg font-bold text-white

/* Label */
text-sm text-white/80
```

## 🎭 Interactive States

### Buttons
```css
/* Default */
bg-gradient-to-r from-red-600 to-red-700

/* Hover */
hover:from-red-700 hover:to-red-800

/* Active/Selected */
bg-gradient-to-r from-red-600 to-red-700

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed
```

### Cards
```css
/* Default */
border-gray-800

/* Hover */
hover:border-red-500/50

/* Active */
border-red-500
```

### Inputs
```css
/* Default */
border-gray-700

/* Focus */
focus:border-red-500

/* Error */
border-red-500
```

## 📱 Responsive Breakpoints

```css
/* Mobile First (default) */
px-4 py-4

/* Tablet (md:) */
md:px-6 md:py-6

/* Desktop (lg:) */
lg:px-8 lg:py-8

/* Grid Adjustments */
grid-cols-2        /* Mobile */
md:grid-cols-3     /* Tablet */
lg:grid-cols-4     /* Desktop */
```

## 🎬 Animations

### Loading Spinner
```css
animate-spin rounded-full h-12 w-12 border-b-2 border-red-500
```

### Pulse (Active Status)
```css
animate-pulse
```

### Transitions
```css
transition-all duration-300
```

### Progress Bars
```css
transition-all duration-500
```

## 🖼️ Icons

### Profile Icons
- 👤 User/Profile
- 📧 Email
- 📱 Phone
- 🎯 Handicap

### Tournament Icons
- 🏆 Trophy/Tournament
- 📅 Calendar/Date
- 👥 People/Participants
- 📍 Location

### Statistics Icons
- ⛳ Golf/Holes
- ⭐ Star/Best
- 📊 Chart/Average
- 🦅 Eagle
- 🐦 Birdie
- ✅ Par
- ⚠️ Bogey
- ❌ Double Bogey

### Achievement Icons
- 🏅 Medal
- 🎖️ Badge
- 🌟 Star
- 💎 Diamond

### Action Icons
- ✏️ Edit
- 📜 History
- 📈 Statistics
- ⚙️ Settings
- ❓ Help
- 🚪 Logout

## 🎨 Visual Hierarchy

### Level 1 (Most Important)
- Modal titles
- Stat numbers
- Primary buttons

### Level 2 (Important)
- Section headers
- Card titles
- Secondary buttons

### Level 3 (Supporting)
- Labels
- Descriptions
- Tertiary buttons

### Level 4 (Least Important)
- Timestamps
- Helper text
- Disabled elements

---

**Visual Guide Version**: 1.0.0
**Last Updated**: 2026-02-11
