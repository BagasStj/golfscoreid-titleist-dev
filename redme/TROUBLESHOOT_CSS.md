# 🔍 Troubleshoot CSS Not Loading

## Quick Fixes (Try in Order)

### 1. Hard Refresh Browser
```
Chrome/Edge: Ctrl + Shift + R
Firefox: Ctrl + F5
Safari: Cmd + Option + R
```

### 2. Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Check if Tailwind is Loaded
Open browser console (F12) and run:
```javascript
// Check if Tailwind classes exist
document.querySelector('html').classList.add('test-class');
console.log(getComputedStyle(document.body).margin);
```

### 4. Verify Files

**Check src/index.css starts with:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Check tailwind.config.js exists:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

**Check postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 5. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite

# Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.vite

# Start again
npm run dev
```

### 6. Check Console for Errors
Open browser DevTools (F12) → Console tab
Look for errors like:
- "Failed to load CSS"
- "Module not found"
- PostCSS errors

### 7. Verify Import in main.tsx
Check `src/main.tsx` has:
```typescript
import './index.css'
```

### 8. Nuclear Option - Clean Reinstall
```bash
# Stop all servers
# Delete node_modules
rm -rf node_modules package-lock.json

# Windows:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install

# Start servers
npx convex dev  # Terminal 1
npm run dev     # Terminal 2
```

## Debugging Steps

### Check if CSS File is Loaded
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `index.css` or `style.css`
5. Click on it to see content
6. Should see Tailwind classes

### Check Computed Styles
1. Open DevTools (F12)
2. Select an element (like the login button)
3. Check "Computed" tab
4. Should see Tailwind classes applied

### Verify Tailwind is Processing
Run in terminal:
```bash
npx tailwindcss -i ./src/index.css -o ./test-output.css
```

Check `test-output.css` - should have lots of Tailwind classes.

## Common Issues

### Issue: White page, no styles
**Solution:** Check browser console for import errors

### Issue: Some classes work, others don't
**Solution:** Check `tailwind.config.js` content paths

### Issue: Styles flash then disappear
**Solution:** Check for CSS conflicts or duplicate imports

### Issue: Dev server shows no errors but styles missing
**Solution:** Hard refresh browser (Ctrl+Shift+R)

## Still Not Working?

### Manual CSS Check
Create `src/test.css`:
```css
body {
  background: red !important;
}
```

Import in `main.tsx`:
```typescript
import './test.css'
```

If background turns red → CSS loading works, Tailwind config issue
If background stays white → CSS not loading at all

### Check Vite Config
Verify `vite.config.ts` doesn't have CSS-related issues:
```typescript
export default defineConfig({
  plugins: [react()],
  // No css: { ... } that might interfere
})
```

## Get Help

If nothing works, provide:
1. Screenshot of browser console (F12)
2. Screenshot of Network tab showing CSS files
3. Output of: `npm list tailwindcss postcss autoprefixer`
4. Content of `src/index.css` (first 10 lines)

## Expected Result

When working correctly, you should see:
- ✅ Gradient background (emerald to green)
- ✅ White card with rounded corners
- ✅ Logo in white container
- ✅ Styled input fields with icons
- ✅ Green gradient button
- ✅ Proper spacing and typography

## Quick Test

Add this to LoginPage.tsx temporarily:
```tsx
<div className="bg-red-500 text-white p-4">
  If you see red background, Tailwind works!
</div>
```

If you see red box → Tailwind works, check specific classes
If no red box → Tailwind not loading, follow steps above
