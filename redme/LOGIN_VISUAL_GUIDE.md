# 🎨 Login Page - Visual Guide

## 📱 Desktop View

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                    🌿 Gradient Background 🌿                      ║
║                   (Emerald → Green → Teal)                        ║
║                                                                   ║
║         ┌─────────────────────────────────────────┐              ║
║         │  ╔═══════════════════════════════════╗  │              ║
║         │  ║                                   ║  │              ║
║         │  ║     ┌─────────────────────┐      ║  │              ║
║         │  ║     │                     │      ║  │              ║
║         │  ║     │   🏌️ [LOGO 64x64]   │      ║  │              ║
║         │  ║     │                     │      ║  │              ║
║         │  ║     └─────────────────────┘      ║  │              ║
║         │  ║                                   ║  │              ║
║         │  ║       GolfScore ID                ║  │              ║
║         │  ║   Tournament Scoring System       ║  │              ║
║         │  ║                                   ║  │              ║
║         │  ╚═══════════════════════════════════╝  │              ║
║         │                                         │              ║
║         │  Username atau Email                    │              ║
║         │  ┌───────────────────────────────────┐  │              ║
║         │  │ 👤  Masukkan username atau email │  │              ║
║         │  └───────────────────────────────────┘  │              ║
║         │                                         │              ║
║         │  Password                               │              ║
║         │  ┌───────────────────────────────────┐  │              ║
║         │  │ 🔒  Masukkan password         👁️  │  │              ║
║         │  └───────────────────────────────────┘  │              ║
║         │                                         │              ║
║         │  ┌───────────────────────────────────┐  │              ║
║         │  │                                   │  │              ║
║         │  │          🚀 Login                 │  │              ║
║         │  │                                   │  │              ║
║         │  └───────────────────────────────────┘  │              ║
║         │                                         │              ║
║         │  Belum punya akun? Hubungi Admin       │              ║
║         │                                         │              ║
║         └─────────────────────────────────────────┘              ║
║                                                                   ║
║              © 2024 GolfScore ID. All rights reserved.           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## 📱 Mobile View

```
┌─────────────────────────┐
│   🌿 Gradient BG 🌿     │
│                         │
│  ┌───────────────────┐  │
│  │  ╔═════════════╗  │  │
│  │  ║             ║  │  │
│  │  ║  ┌───────┐  ║  │  │
│  │  ║  │ 🏌️    │  ║  │  │
│  │  ║  │ LOGO  │  ║  │  │
│  │  ║  └───────┘  ║  │  │
│  │  ║             ║  │  │
│  │  ║ GolfScore   ║  │  │
│  │  ║    ID       ║  │  │
│  │  ║ Tournament  ║  │  │
│  │  ║   Scoring   ║  │  │
│  │  ╚═════════════╝  │  │
│  │                   │  │
│  │ Username/Email    │  │
│  │ ┌───────────────┐ │  │
│  │ │ 👤 [input]    │ │  │
│  │ └───────────────┘ │  │
│  │                   │  │
│  │ Password          │  │
│  │ ┌───────────────┐ │  │
│  │ │ 🔒 [input] 👁️ │ │  │
│  │ └───────────────┘ │  │
│  │                   │  │
│  │ ┌───────────────┐ │  │
│  │ │   🚀 Login    │ │  │
│  │ └───────────────┘ │  │
│  │                   │  │
│  │ Belum punya akun? │  │
│  │  Hubungi Admin    │  │
│  └───────────────────┘  │
│                         │
│  © 2024 GolfScore ID    │
└─────────────────────────┘
```

## 🎨 Color Palette

```
┌─────────────────────────────────────────────────────┐
│ Primary Colors                                      │
├─────────────────────────────────────────────────────┤
│ Emerald 600  ■ #059669  (Main gradient start)      │
│ Green 600    ■ #16a34a  (Main gradient end)        │
│ Teal 50      ■ #f0fdfa  (Background light)         │
├─────────────────────────────────────────────────────┤
│ Neutral Colors                                      │
├─────────────────────────────────────────────────────┤
│ White        ■ #ffffff  (Card background)          │
│ Gray 50      ■ #f9fafb  (Input background)         │
│ Gray 300     ■ #d1d5db  (Border)                   │
│ Gray 700     ■ #374151  (Text)                     │
├─────────────────────────────────────────────────────┤
│ Accent Colors                                       │
├─────────────────────────────────────────────────────┤
│ Red 50       ■ #fef2f2  (Error background)         │
│ Red 500      ■ #ef4444  (Error border)             │
│ Red 700      ■ #b91c1c  (Error text)               │
└─────────────────────────────────────────────────────┘
```

## 🎭 States & Interactions

### 1. Default State
```
┌─────────────────────────────┐
│ 👤  Masukkan username       │  ← Gray border
└─────────────────────────────┘
```

### 2. Focus State
```
┌─────────────────────────────┐
│ 👤  admin█                  │  ← Emerald ring glow
└─────────────────────────────┘
```

### 3. Filled State
```
┌─────────────────────────────┐
│ 👤  admin                   │  ← White background
└─────────────────────────────┘
```

### 4. Error State
```
┌─────────────────────────────────────────┐
│ ⚠️  Invalid credentials                 │
│    Username atau password salah         │
└─────────────────────────────────────────┘
```

### 5. Loading State
```
┌─────────────────────────────┐
│   ⏳ Logging in...          │  ← Spinner animation
└─────────────────────────────┘
```

## 🔄 Animation Flow

```
Page Load
    ↓
┌─────────────────┐
│ Fade In (0.3s)  │
│ Scale In (0.2s) │
└─────────────────┘
    ↓
User Input
    ↓
┌─────────────────┐
│ Focus Ring      │
│ Smooth (0.2s)   │
└─────────────────┘
    ↓
Submit
    ↓
┌─────────────────┐
│ Button Scale    │
│ Active (0.1s)   │
└─────────────────┘
    ↓
Loading
    ↓
┌─────────────────┐
│ Spinner Rotate  │
│ Infinite        │
└─────────────────┘
    ↓
Success
    ↓
┌─────────────────┐
│ Page Transition │
│ Slide (0.3s)    │
└─────────────────┘
```

## 🎯 Interactive Elements

### Password Toggle
```
Hidden:  🔒  ••••••••  👁️
         ↓ (click eye)
Visible: 🔒  admin123  👁️‍🗨️
```

### Button Hover Effect
```
Normal:  ┌─────────────┐
         │    Login    │  ← Emerald 600
         └─────────────┘

Hover:   ┌─────────────┐
         │  → Login ←  │  ← Emerald 700 + Scale 1.02
         └─────────────┘

Active:  ┌─────────────┐
         │    Login    │  ← Scale 0.98
         └─────────────┘
```

## 📐 Spacing & Layout

```
Card Padding:
┌─────────────────────────────────┐
│ ↕ 40px                          │
│ ↔ 32px  [Content Area]  ↔ 32px │
│ ↕ 32px                          │
└─────────────────────────────────┘

Input Spacing:
Label
↕ 8px
Input Field (48px height)
↕ 20px
Next Label
```

## 🎪 Responsive Breakpoints

```
Mobile (< 640px)
├─ Card width: 100% - 32px padding
├─ Logo size: 48x48px
└─ Font size: 14px

Tablet (640px - 1024px)
├─ Card width: 100% - 64px padding
├─ Logo size: 56x56px
└─ Font size: 15px

Desktop (> 1024px)
├─ Card width: 448px (max-w-md)
├─ Logo size: 64x64px
└─ Font size: 16px
```

## 🌟 Special Effects

### Glassmorphism Card
```
┌─────────────────────────────────┐
│ Background: white/80            │
│ Backdrop Blur: lg               │
│ Border: white/20                │
│ Shadow: 2xl                     │
│ Border Radius: 24px             │
└─────────────────────────────────┘
```

### Gradient Header
```
╔═══════════════════════════════╗
║ Linear Gradient:              ║
║ from-emerald-600              ║
║   ↓                           ║
║ to-green-600                  ║
║                               ║
║ Padding: 40px 32px            ║
║ Text: white                   ║
╚═══════════════════════════════╝
```

### Background Pattern
```
Grid Pattern:
┼───┼───┼───┼───┼
│   │   │   │   │
┼───┼───┼───┼───┼
│   │   │   │   │
┼───┼───┼───┼───┼

Size: 20x20px
Opacity: 5%
Color: Black
```

## 🎬 User Journey

```
1. User arrives
   └─> Sees beautiful gradient background
       └─> Logo catches attention
           └─> Clear call-to-action

2. User enters credentials
   └─> Smooth focus animations
       └─> Clear visual feedback
           └─> Password toggle available

3. User submits
   └─> Button scales on click
       └─> Loading spinner appears
           └─> Clear loading state

4. Success
   └─> Smooth page transition
       └─> Redirects to dashboard
           └─> Session saved

5. Error
   └─> Clear error message
       └─> Styled alert box
           └─> User can retry
```

## 💎 Design Principles

```
✓ Clarity      - Clear labels and instructions
✓ Consistency  - Uniform spacing and colors
✓ Feedback     - Visual response to all actions
✓ Simplicity   - Minimal, focused interface
✓ Accessibility - High contrast, large tap targets
✓ Performance  - Smooth animations, fast load
```

---

**Design System:** Tailwind CSS v4
**Icons:** Heroicons (SVG)
**Animations:** CSS Transitions + Keyframes
**Typography:** System Font Stack
