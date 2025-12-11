# ProList Protect Design System

## Brand Identity

ProList Protect is a secure escrow marketplace for Cameroon. The design language is **premium, trustworthy, and professional** - conveying security and reliability for financial transactions.

---

## Color Palette

### Primary Brand Colors (from Logo)
Based on the gradient logo transitioning from ocean blue to emerald green.

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | `160 84% 39%` | #10B981 | Primary actions, success states, brand accent |
| `--primary-dark` | `162 75% 32%` | #149868 | Hover states, emphasis |
| `--ocean` | `199 100% 39%` | #0087C5 | Secondary brand, info states |
| `--ocean-dark` | `202 100% 32%` | #005C9E | Ocean hover states |
| `--teal` | `174 86% 38%` | #0EB4A3 | Midpoint accent, active states |

### Gradient
```css
--gradient-brand: linear-gradient(135deg, hsl(199 100% 39%), hsl(174 86% 38%), hsl(160 84% 39%));
```

### Semantic Colors
| Token | HSL | Usage |
|-------|-----|-------|
| `--success` | `160 84% 39%` | Completed, verified, confirmed |
| `--warning` | `45 93% 47%` | Pending, attention required |
| `--destructive` | `0 84% 60%` | Errors, cancel, danger |

### Neutrals
| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `0 0% 100%` | Page background (white) |
| `--foreground` | `210 25% 20%` | Primary text |
| `--muted` | `210 15% 55%` | Secondary text, placeholders |
| `--border` | `210 20% 90%` | Card borders, dividers |
| `--card` | `0 0% 100%` | Card surfaces |

---

## Typography

### Font Stack
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | 24px | 700 (Bold) | 1.2 |
| Section Header | 18px | 600 (Semibold) | 1.3 |
| Card Title | 16px | 600 (Semibold) | 1.4 |
| Body | 14px | 400 (Regular) | 1.5 |
| Caption | 12px | 500 (Medium) | 1.4 |
| Label | 11px | 600 (Semibold) | 1 |

### Best Practices
- Use `font-semibold` for headings and interactive elements
- Use `text-muted-foreground` for secondary information
- Avoid ALL CAPS except for small labels/badges
- Use `tracking-tight` for large headings

---

## Spacing

Based on 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon margins |
| `space-2` | 8px | Small gaps |
| `space-3` | 12px | Standard component padding |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | Large gaps |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Page margins |

---

## Shadows

Premium, subtle shadows that convey depth without heaviness:

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04);
--shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 10px 20px -2px rgba(0, 135, 197, 0.08);
--shadow-glow: 0 0 20px -5px rgba(16, 185, 129, 0.25);
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 12px | Buttons, inputs |
| `rounded-xl` | 16px | Cards, modals |
| `rounded-2xl` | 20px | Hero cards, featured elements |
| `rounded-full` | 9999px | Avatars, badges, pills |

---

## Components

### Buttons

**Primary (Default)**
- Gradient background from ocean to primary
- White text
- Subtle glow shadow on hover
- 12px padding vertical, 24px horizontal

**Secondary**
- White background with border
- Primary text color
- Border color transitions on hover

**Ghost**
- Transparent background
- Muted text
- Subtle background on hover

### Cards

**Standard Card**
```css
.card {
  background: white;
  border: 1px solid hsl(210 20% 92%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-card);
}
```

**Elevated Card**
```css
.card-elevated {
  background: white;
  border: 1px solid hsl(210 20% 94%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-elevated);
}
```

### Inputs

- 48px minimum height
- 12px horizontal padding (more with icons)
- 12px border radius
- Light gray border, primary on focus
- Subtle focus ring

### Status Badges

| Variant | Background | Text |
|---------|------------|------|
| Success/Escrow | `primary/10` | `primary` |
| Warning/Pending | `warning/10` | `warning` |
| Info/Active | `ocean/10` | `ocean` |
| Error | `destructive/10` | `destructive` |

---

## Icons

Use **Lucide React** icons exclusively. No emojis in professional UI contexts.

### Size Guide
| Context | Size |
|---------|------|
| Navigation | 20px |
| Inline with text | 16px |
| Feature icons | 24px |
| Hero/Empty states | 48-64px |

### Style
- `strokeWidth={1.5}` for general use
- `strokeWidth={2}` for emphasis or active states
- Use `text-muted` for secondary icons
- Use brand colors for primary actions

---

## Layout Patterns

### Page Structure
```
┌─────────────────────────────┐
│         Top Bar             │  ← Sticky, 56px height
├─────────────────────────────┤
│                             │
│         Main Content        │  ← Scrollable, p-4
│                             │
│                             │
├─────────────────────────────┤
│        Bottom Nav           │  ← Fixed, 64px + safe area
└─────────────────────────────┘
```

### Card Grid
- Use `gap-3` (12px) for card grids
- 3-column grid for stats
- Single column for list items

---

## Animation

### Transitions
- Duration: `200ms` for micro-interactions, `300ms` for page elements
- Easing: `ease-out` for enters, `ease-in` for exits

### Common Animations
```css
.animate-fade-up {
  animation: fadeUp 0.4s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Staggered Entry
Use `style={{ animationDelay: "0.1s" }}` for sequential card reveals.

---

## Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA (4.5:1 for text)
- Focus states: visible ring on all interactive elements
- Use semantic HTML (`button`, `nav`, `main`, etc.)

---

## Do's and Don'ts

### Do ✓
- Use gradient for primary CTAs
- Maintain consistent 16px page padding
- Use subtle shadows for depth
- Keep cards white on white backgrounds
- Use Lucide icons consistently

### Don't ✗
- Use emojis in professional UI
- Mix different icon libraries
- Use harsh drop shadows
- Apply gradients to text (except hero titles)
- Use more than 2 font weights per component
