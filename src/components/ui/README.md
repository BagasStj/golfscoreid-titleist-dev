# UI Component Library

This directory contains the reusable UI components for the golf tournament scoring application. All components follow the design system specifications with consistent styling, accessibility features, and responsive behavior.

## Design Tokens

The design system uses Tailwind CSS with custom configuration:

### Colors
- **Primary**: Golf green palette (#16a34a and variants)
- **Secondary**: Neutral grays for text and backgrounds
- **Accent**: Gold/yellow for highlights
- **Golf-specific**: Birdie (green), Par (yellow), Bogey (orange), Double (red)

### Typography
- **Font Family**: Outfit (imported from @fontsource/outfit)
- **Font Sizes**: 12px (xs) to 36px (4xl)
- **Font Weights**: 300 (light) to 700 (bold)

### Spacing
- Based on 4px scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

### Transitions
- **Fast**: 150ms
- **Base**: 200ms
- **Slow**: 300ms

## Components

### Button
Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: Lucide icon component
- `iconPosition`: 'left' | 'right'
- `loading`: boolean
- `fullWidth`: boolean

**Example:**
```tsx
import { Button } from '@/components/ui';
import { Save } from 'lucide-react';

<Button variant="primary" size="md" icon={Save}>
  Save Changes
</Button>
```

### Card
Container component with elevation and styling variants.

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'glass'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean
- `clickable`: boolean

**Example:**
```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" padding="md" hoverable>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Input
Form input with label, icon, and validation support.

**Props:**
- `label`: string (required)
- `icon`: Lucide icon component
- `error`: string
- `helperText`: string
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel'

**Example:**
```tsx
import { Input } from '@/components/ui';
import { User } from 'lucide-react';

<Input
  label="Username"
  icon={User}
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={errors.username}
  required
/>
```

### Modal
Accessible modal dialog with backdrop and focus trap.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string (required)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `footer`: React.ReactNode

**Example:**
```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Sidebar
Desktop navigation sidebar with icons and badges.

**Props:**
- `items`: NavigationItem[] (required)
- `userRole`: 'admin' | 'player' (required)

**NavigationItem:**
- `id`: string
- `label`: string
- `path`: string
- `icon`: Lucide icon component
- `badge`: number | string (optional)
- `disabled`: boolean (optional)

**Example:**
```tsx
import { Sidebar } from '@/components/ui';
import { Home, Trophy, Users } from 'lucide-react';

const navItems = [
  { id: '1', label: 'Home', path: '/', icon: Home },
  { id: '2', label: 'Tournaments', path: '/tournaments', icon: Trophy },
  { id: '3', label: 'Players', path: '/players', icon: Users, badge: 5 },
];

<Sidebar items={navItems} userRole="admin" />
```

### MobileMenu
Mobile hamburger menu with slide-in drawer.

**Props:**
- `items`: NavigationItem[] (required)
- `userRole`: 'admin' | 'player' (required)
- `isOpen`: boolean (required)
- `onToggle`: () => void (required)

**Example:**
```tsx
import { MobileMenu } from '@/components/ui';
import { Home, Trophy } from 'lucide-react';

const [isMenuOpen, setIsMenuOpen] = useState(false);

const navItems = [
  { id: '1', label: 'Home', path: '/', icon: Home },
  { id: '2', label: 'Tournaments', path: '/tournaments', icon: Trophy },
];

<MobileMenu
  items={navItems}
  userRole="player"
  isOpen={isMenuOpen}
  onToggle={() => setIsMenuOpen(!isMenuOpen)}
/>
```

## Accessibility Features

All components include:
- Proper ARIA labels and roles
- Keyboard navigation support (Tab, Enter, Space, Escape)
- Visible focus indicators
- Screen reader support
- Minimum touch target sizes (44x44px on mobile)
- Semantic HTML structure

## Responsive Behavior

Components adapt to different screen sizes:
- **Mobile** (< 640px): Single column, stacked layouts
- **Tablet** (640px - 1024px): Adaptive layouts
- **Desktop** (≥ 1024px): Multi-column, sidebar visible

## Usage Guidelines

1. **Import components** from the index file:
   ```tsx
   import { Button, Card, Input } from '@/components/ui';
   ```

2. **Use Lucide icons** for consistency:
   ```tsx
   import { Save, Edit, Trash } from 'lucide-react';
   ```

3. **Follow accessibility best practices**:
   - Always provide labels for inputs
   - Use semantic HTML
   - Include ARIA labels for icons
   - Ensure keyboard navigation works

4. **Maintain consistent spacing** using Tailwind utilities:
   - Use `gap-2`, `gap-4`, `gap-6` for spacing
   - Use `p-4`, `p-6` for padding
   - Use `mb-4`, `mt-6` for margins

5. **Test responsive behavior** at different breakpoints:
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: ≥ 1024px
