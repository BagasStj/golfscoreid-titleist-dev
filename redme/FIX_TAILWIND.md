# 🔧 Fix Tailwind CSS Issue

## Problem
Tailwind CSS v4 tidak kompatibel dengan konfigurasi yang ada. Perlu downgrade ke v3.

## Solution

### Step 1: Stop All Processes
```bash
# Stop dev server (Ctrl+C di terminal)
# Stop convex dev (Ctrl+C di terminal convex)
```

### Step 2: Clean Install
```bash
cd golfscore-app

# Remove node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Atau di Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

### Step 3: Update package.json
Edit `package.json`, ganti dependencies Tailwind:

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
```

Hapus baris ini jika ada:
```json
"@tailwindcss/postcss": "^4.1.18",
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Verify Files

Pastikan file-file ini ada dan benar:

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grass-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
    },
  },
  plugins: [],
}
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**src/index.css** (awal file):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 6: Start Servers
```bash
# Terminal 1: Convex
npx convex dev

# Terminal 2: Vite
npm run dev
```

### Step 7: Test
Buka browser ke `http://localhost:5173` dan refresh (Ctrl+Shift+R untuk hard refresh).

## Alternative: Quick Fix

Jika masih tidak bekerja, coba:

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Atau di Windows:
Remove-Item -Recurse -Force node_modules/.vite

# Restart dev server
npm run dev
```

## Verify Tailwind is Working

Buka browser console dan ketik:
```javascript
getComputedStyle(document.body).backgroundColor
```

Jika return `rgb(255, 255, 255)` atau warna lain, Tailwind bekerja.

## Still Not Working?

Coba install manual:
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3.4.0 postcss@8.4.35 autoprefixer@10.4.17
npx tailwindcss init
```

Lalu restart dev server.
