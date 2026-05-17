# SyncUp Brand Identity

> This document is the single source of truth for the SyncUp brand. All design decisions — logo usage, colors, typography, tone — are defined here.

---

## 1. Brand Foundation

### Name & Tagline

| Element | Value |
|---|---|
| Product name | **SyncUp** (one word, capital S, capital U) |
| Tagline | *Your work, in sync.* |
| Domain style | syncup (all lowercase in URLs) |

The tagline is used on landing pages, email footers, and marketing materials. It is **not** part of the logo lockup — the logo stands alone.

### Brand Personality

| Attribute | What it means in practice |
|---|---|
| **Modern** | No skeuomorphic chrome, no rounded bubbly shapes. Precise geometry. |
| **Sharp** | Confident decisions. One primary action per screen. No hedging. |
| **Focused** | Dark surface removes visual noise. The work is the UI. |
| **Premium** | Navy + amber is a classic luxury pairing. Everything feels intentional. |

### Brand Values

- **Clarity** — The UI never makes you think. The next action is always obvious.
- **Flow** — Tasks move. Columns move. The app feels kinetic, not static.
- **Craft** — Details are deliberate: shadow depth, letter-spacing, easing curves.

---

## 2. Logo

### Primary Logo (horizontal lockup)

**File:** `apps/frontend/src/assets/brand/syncup-logo.svg`
**Use on:** Dark backgrounds (#132942 and similar dark surfaces)

The logo consists of two parts:
1. **Icon mark** — three kanban column bars in amber gradient, with white task-card indicators
2. **Wordmark** — "Sync" in `#E2EAF4`, "Up" in `#F5A623` (DM Sans Bold 700)

### Icon Mark (standalone)

**File:** `apps/frontend/src/assets/brand/syncup-icon.svg`
**Use on:** App favicon, browser tab, social media profile pictures, square contexts

The three bars represent:
- Left (medium height) — To Do
- Centre (tallest) — In Progress
- Right (shorter) — Done

The amber glow filter is intentional — it gives the bars a subtle luminance that reads as premium on dark surfaces.

### Light Background Variant

**File:** `apps/frontend/src/assets/brand/syncup-logo-light.svg`
**Use on:** White or light-gray backgrounds in external contexts (portfolios, PDFs, presentations)

Wordmark changes: "Sync" → `#132942`, "Up" → `#C07A10` (amber darkened for light-bg contrast ratio).

### Logo Usage Rules

**Do:**
- Maintain clear space equal to the height of the "S" in SyncUp on all four sides
- Use the provided SVG files at any size
- Use the light variant on backgrounds lighter than `#888`

**Don't:**
- Recolour the bars (the amber gradient is fixed)
- Stretch, rotate, or skew the logo
- Place the logo on a busy photographic background without a dark scrim
- Add effects (drop shadows, outlines) — the glow is already embedded
- Change the font used in the wordmark

### Minimum Sizes

| Variant | Minimum width |
|---|---|
| Horizontal lockup | 120px |
| Icon mark only | 24px |

---

## 3. Color System

### Surface Palette

| Token | Hex | Use |
|---|---|---|
| `--surface-base` | `#132942` | Page background — the neumorphic ground plane |
| `--surface-raised` | `#162E4A` | Cards, panels, form inputs |
| `--surface-overlay` | `#1A3353` | Modals, dropdowns, tooltips |
| `--surface-border` | `#1E3A58` | Dividers, input borders |

### Neumorphic Shadow Colors

| Token | Hex | Role |
|---|---|---|
| `--shadow-light` | `#25486F` | Top-left highlight — surface bowing toward the light source |
| `--shadow-dark` | `#0A1624` | Bottom-right depth — surface receding from the light |

The shadow colors are derived from `#132942` with lightness shifted +12% (light) and −8% (dark) in HSL, saturation slightly reduced, hue locked to 212°.

### Accent Palette

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#F5A623` | Primary buttons, active states, links, focus rings |
| `--accent-hover` | `#D98A18` | Hover state of primary actions |
| `--accent-light` | `#F7BA4A` | Gradient start, icon fills, decorative elements |
| `--accent-glow` | `rgba(245,166,35,0.30)` | Amber halo on primary buttons |
| `--accent-subtle` | `rgba(245,166,35,0.10)` | Highlighted row background, selected state |

### Text Palette

| Token | Hex | Use |
|---|---|---|
| `--text-primary` | `#E2EAF4` | Headings, body copy, labels |
| `--text-secondary` | `#8BA4C4` | Metadata, captions, helper text |
| `--text-muted` | `#4D6880` | Placeholders, disabled text |
| `--text-inverse` | `#132942` | Text on amber/light backgrounds |
| `--text-accent` | `#F5A623` | Amber text links, callouts |

### Semantic Palette

| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#3ECF8E` | Completed tasks, success toasts |
| `--color-warning` | `#F5A623` | Warnings (maps to accent) |
| `--color-danger` | `#E85D6B` | Destructive actions, error states |
| `--color-info` | `#48B4E8` | Informational banners |

### Color Palette Visual Reference

```
Surface scale (dark → light):
  #0A1624  shadow-dark
  #132942  surface-base     ← ground plane
  #162E4A  surface-raised
  #1A3353  surface-overlay
  #1E3A58  surface-border
  #25486F  shadow-light

Accent scale:
  #C07A10  amber (darkened, light-bg use)
  #D98A18  accent-hover
  #F5A623  accent             ← primary
  #F7BA4A  accent-light

Text scale (dark → light):
  #4D6880  text-muted
  #8BA4C4  text-secondary
  #E2EAF4  text-primary
```

---

## 4. Typography

### Font Families

| Role | Family | Weights used |
|---|---|---|
| Display / Headlines / UI | **DM Sans** | 400, 500, 600, 700 |
| Body / Labels / Metadata | **Inter** | 400, 500, 600 |
| Code | JetBrains Mono | 400 |

Google Fonts import (already in `tokens.css`):
```
DM Sans — https://fonts.google.com/specimen/DM+Sans
Inter   — https://fonts.google.com/specimen/Inter
```

### Type Scale

| Token | rem | px | Use |
|---|---|---|---|
| `--text-xs` | 0.75 | 12 | Timestamps, micro labels |
| `--text-sm` | 0.875 | 14 | Secondary labels, captions |
| `--text-base` | 1.0 | 16 | Body copy, inputs |
| `--text-lg` | 1.125 | 18 | Card titles, nav items |
| `--text-xl` | 1.25 | 20 | Section headings |
| `--text-2xl` | 1.5 | 24 | Page sub-headings |
| `--text-3xl` | 1.875 | 30 | Page headings |
| `--text-4xl` | 2.25 | 36 | Hero headings |

### Typography Rules

- **Headlines and navigation:** DM Sans, Bold (700), tracking `−0.025em`
- **Body and labels:** Inter, Regular (400) or Medium (500)
- **Never mix DM Sans and Inter in the same sentence**
- **All-caps labels:** Inter 600, tracking `0.1em`, font-size `--text-xs` or `--text-sm`
- **Line height:** `--leading-tight` (1.25) for headings, `--leading-normal` (1.5) for body

---

## 5. Neumorphic Design System

### What is Neumorphism?

Neumorphism creates the illusion that elements are extruded from (raised) or pressed into (inset) the background. It requires:
1. A **single background color** as the ground plane (our `--surface-base: #132942`)
2. A **light shadow** at the top-left (where the light source hits)
3. A **dark shadow** at the bottom-right (the shadow cast)
4. **Generous border radius** — sharp corners break the extruded effect

### Shadow Reference

```css
/* Raised — card, button (default state) */
box-shadow: var(--neu-md);
/* = -6px -6px 12px #25486F, 6px 6px 12px #0A1624 */

/* Small raised — input field, tag */
box-shadow: var(--neu-sm);
/* = -3px -3px 6px #25486F, 3px 3px 6px #0A1624 */

/* Large raised — main panels, sidebar */
box-shadow: var(--neu-lg);
/* = -8px -8px 18px #25486F, 8px 8px 18px #0A1624 */

/* Pressed / active — clicked button, selected state */
box-shadow: var(--neu-inset);
/* = inset -4px -4px 8px #25486F, inset 4px 4px 8px #0A1624 */

/* Primary CTA — with amber glow */
box-shadow: var(--neu-accent);
/* = -4px -4px 8px #25486F, 4px 4px 8px #0A1624, 0 0 20px rgba(245,166,35,0.30) */
```

### Border Radius in Practice

| Component | Radius token |
|---|---|
| Page panels, kanban columns | `--radius-xl` (24px) |
| Cards, modals, dropdowns | `--radius-lg` (16px) |
| Buttons, inputs, tags | `--radius-md` (12px) |
| Icon buttons, small chips | `--radius-sm` (8px) |
| Pills, avatars | `--radius-full` (9999px) |

### Neumorphism Accessibility Note

Dark neumorphism relies on subtle shadow contrast. Always ensure:
- Text contrast ratio ≥ 4.5:1 against its background (`#E2EAF4` on `#132942` = 11:1 ✅)
- Amber `#F5A623` on `#132942` = 5.4:1 ✅ (meets AA)
- Interactive elements have a visible focus ring (use `outline: 2px solid var(--accent)`)
- Don't rely solely on shadow depth to indicate state — pair with color or icon change

---

## 6. Voice & Tone

### Brand Voice

| Attribute | Yes | No |
|---|---|---|
| **Confident** | "Project deleted." | "Are you sure you want to delete this project?" (let the confirm dialog do that) |
| **Direct** | "Add task" | "Click here to add a new task to this column" |
| **Human** | "Nothing here yet." | "No records found." |
| **Precise** | "3 tasks in progress" | "Some tasks are in progress" |

### UI Copy Rules

- **Buttons:** imperative verbs — "Save", "Delete", "Add column" (not "Submit" or "OK")
- **Empty states:** friendly, not technical — "No projects yet. Create one to get started."
- **Error messages:** say what went wrong + what to do — "Couldn't save. Check your connection and try again."
- **Confirmations:** "Deleted." not "The operation completed successfully."
- **Tooltips:** sentence case, no full stop

---

## 7. Asset Locations

```
apps/frontend/src/assets/brand/
├── syncup-icon.svg          ← 36×36 icon mark (favicon source, app icon)
├── syncup-logo.svg          ← 160×44 horizontal lockup (dark backgrounds)
└── syncup-logo-light.svg    ← 160×44 horizontal lockup (light backgrounds)

apps/frontend/src/styles/
└── tokens.css               ← full CSS custom property system (import in styles.css)

docs/
└── brand.md                 ← this file
```

### Implementing the Design System

To activate the token system in the Angular app, add this import at the top of `apps/frontend/src/styles.css`:

```css
@import './styles/tokens.css';
```

Then replace the existing `:root` block and component CSS with neumorphic equivalents using the tokens above. The UI redesign is a separate implementation task from this brand definition.

### Figma

To use these assets in Figma:
1. Import `syncup-icon.svg` and `syncup-logo.svg` as Figma components (File → Place Image, or drag and drop)
2. In Figma, create a color palette using the hex values from Section 3
3. Add DM Sans and Inter via Figma's font picker (both are Google Fonts)
4. Search "brand guidelines template" in Figma Community for a ready-made brand canvas structure to populate
