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

### Theme

**Warm Cream Neumorphism** — a light, soft-extruded surface (`#EFE3CA`) with deep indigo (`#170C79`) and teal (`#56B6C6` / `#8ACBD0`) accents.

### Brand Personality

| Attribute | What it means in practice |
|---|---|
| **Modern** | Soft-extruded surfaces and warm tones instead of flat, sterile UI. Tactile, not skeuomorphic. |
| **Sharp** | Confident decisions. One primary action per screen. No hedging. |
| **Focused** | A single warm ground color removes visual noise. The work is the UI. |
| **Premium** | Deep indigo + teal on a warm cream ground is a refined pairing. Everything feels intentional. |

### Brand Values

- **Clarity** — The UI never makes you think. The next action is always obvious.
- **Flow** — Tasks move. Columns move. The app feels kinetic, not static.
- **Craft** — Details are deliberate: shadow depth, letter-spacing, easing curves.

---

## 2. Logo

### Primary Logo (horizontal lockup)

**File:** `apps/frontend/src/assets/brand/syncup-logo.svg`
**Use on:** Light/cream backgrounds (`#EFE3CA` and similar light surfaces)

The logo consists of two parts:
1. **Icon mark** — three kanban column bars in a teal-to-indigo gradient, with white task-card indicators
2. **Wordmark** — "Sync" in `#170C79`, "Up" in `#56B6C6` (DM Sans Bold 700)

### Icon Mark (standalone)

**File:** `apps/frontend/src/assets/brand/syncup-icon.svg`
**Use on:** App favicon, browser tab, social media profile pictures, square contexts

The three bars represent:
- Left (medium height) — To Do
- Centre (tallest) — In Progress
- Right (shorter) — Done

Bars use a light-teal-to-teal gradient (`#8ACBD0` → `#56B6C6`), which stays visible on both the cream ground and the indigo nav bar. The glow filter is intentional — it gives the bars a subtle luminance that reads as premium.

### Dark-Surface Variant (light wordmark)

**File:** `apps/frontend/src/assets/brand/syncup-logo-light.svg`
**Use on:** Dark/indigo backgrounds (e.g. the nav bar, `#170C79`) and other dark external contexts

The "-light" in the filename refers to the **wordmark color**, not the target background: "Sync" → `#EFE3CA` (cream), "Up" → `#8ACBD0` (light teal) — light text tuned for dark surfaces.

### Logo Usage Rules

**Do:**
- Maintain clear space equal to the height of the "S" in SyncUp on all four sides
- Use the provided SVG files at any size
- Use the dark-surface variant (`syncup-logo-light.svg`) on backgrounds darker than `#888`, such as the indigo nav bar

**Don't:**
- Recolour the bars (the teal gradient is fixed)
- Stretch, rotate, or skew the logo
- Place the logo on a busy photographic background without a scrim
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
| `--surface-base` | `#EFE3CA` | Page background — the neumorphic ground plane |
| `--surface-raised` | `#F3E9D6` | Cards, panels — float above the ground |
| `--surface-overlay` | `#EAD9BE` | Modals, dropdowns — slightly recessed |
| `--surface-border` | `#D8C9AE` | Dividers, input outlines |

### Neumorphic Shadow Colors

| Token | Hex | Role |
|---|---|---|
| `--shadow-light` | `#FFFDF7` | Warm near-white — top-left highlight |
| `--shadow-dark` | `#D0C3A5` | Warm tan — bottom-right depth |

Both are warm-toned, lightness-shifted variants of the cream ground plane, chosen for a soft embossed look rather than a harsh drop shadow.

### Primary Accent — Deep Indigo

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#170C79` | Primary buttons, active states, links, focus rings, nav background |
| `--accent-hover` | `#0E0852` | Hover state of primary actions |
| `--accent-light` | `#56B6C6` | Teal gradient start — paired with `--accent` on buttons (teal → indigo) |
| `--accent-glow` | `rgba(23,12,121,0.22)` | Indigo halo on primary buttons/cards |
| `--accent-subtle` | `rgba(23,12,121,0.08)` | Highlighted row background, selected state |

### Secondary Accent — Teal

| Token | Hex | Use |
|---|---|---|
| `--accent2` | `#56B6C6` | Secondary accent, "Up" wordmark, icon fills |
| `--accent2-light` | `#8ACBD0` | Icon gradient highlight, decorative accents |
| `--accent2-subtle` | `rgba(86,182,198,0.15)` | Secondary highlighted state, info backgrounds |

### Text Palette

| Token | Hex | Use |
|---|---|---|
| `--text-primary` | `#170C79` | Headings, body copy, labels |
| `--text-secondary` | `#4A3D8A` | Metadata, captions, helper text |
| `--text-muted` | `#8178B8` | Placeholders, icons — large/non-critical text only |
| `--text-inverse` | `#FFFFFF` | Text on dark/indigo surfaces (e.g. gradient buttons) |
| `--text-accent` | `#170C79` | Indigo links |

### Semantic Palette

| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#1A6E48` | Completed tasks, success toasts |
| `--color-warning` | `#966000` | Warnings |
| `--color-danger` | `#B82030` | Destructive actions, error states |
| `--color-info` | `#2A7B8C` | Informational banners |

Each semantic color has a `-subtle` rgba variant (`--color-success-subtle`, `--color-warning-subtle`, `--color-danger-subtle`, `--color-info-subtle`) for tinted backgrounds — e.g. toast/badge fills behind the solid text color.

### Color Palette Visual Reference

```
Surface scale (dark → light):
  #D0C3A5  shadow-dark
  #D8C9AE  surface-border
  #EAD9BE  surface-overlay
  #EFE3CA  surface-base     ← ground plane
  #F3E9D6  surface-raised
  #FFFDF7  shadow-light

Accent scale:
  #0E0852  accent-hover
  #170C79  accent             ← primary (indigo)
  #56B6C6  accent2 / accent-light  ← secondary (teal)
  #8ACBD0  accent2-light

Text scale (dark → light):
  #170C79  text-primary
  #4A3D8A  text-secondary
  #8178B8  text-muted
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
| `--text-5xl` | 3.0 | 48 | Display/marketing headlines (not yet used in-app) |

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
1. A **single background color** as the ground plane (our `--surface-base: #EFE3CA`)
2. A **light shadow** at the top-left (where the light source hits)
3. A **dark shadow** at the bottom-right (the shadow cast)
4. **Generous border radius** — sharp corners break the extruded effect

### Shadow Reference

```css
/* Raised — card, button (default state) */
box-shadow: var(--neu-md);
/* = -6px -6px 12px #FFFDF7, 6px 6px 12px #D0C3A5 */

/* Small raised — input field, tag */
box-shadow: var(--neu-sm);
/* = -3px -3px 6px #FFFDF7, 3px 3px 6px #D0C3A5 */

/* Large raised — main panels, sidebar */
box-shadow: var(--neu-lg);
/* = -10px -10px 20px #FFFDF7, 10px 10px 20px #D0C3A5 */

/* Pressed / active — clicked button, selected state */
box-shadow: var(--neu-inset);
/* = inset -3px -3px 6px #FFFDF7, inset 3px 3px 6px #D0C3A5 */

/* Primary CTA — with indigo glow */
box-shadow: var(--neu-accent);
/* = -6px -6px 12px #FFFDF7, 6px 6px 12px #D0C3A5, 0 0 22px rgba(23,12,121,0.22) */
```

`--neu-flat` (`0 0 0 transparent`) is also defined — use it to flatten a raised element for disabled or pressed-flush states.

### Border Radius in Practice

| Component | Radius token |
|---|---|
| Page panels, kanban columns | `--radius-xl` (24px) |
| Cards, modals, dropdowns | `--radius-lg` (16px) |
| Buttons, inputs, tags | `--radius-md` (12px) |
| Icon buttons, small chips | `--radius-sm` (8px) |
| Pills, avatars | `--radius-full` (9999px) |

`--radius-2xl` (32px) is also defined in `tokens.css` but not yet used by any component — reserve it for larger decorative panels.

### Neumorphism Accessibility Note

Dark, low-contrast palettes aren't the only way to lose accessibility — light neumorphism relies on subtle shadow contrast too. Always ensure:
- Text contrast ratio ≥ 4.5:1 against its background (`--text-primary #170C79` on `--surface-base #EFE3CA` ≈ 11:1 ✅)
- Secondary accent teal (`--accent2 #56B6C6`) has low contrast on cream (≈1.9:1) — restrict it to large/bold display use (the "Up" wordmark at `--text-2xl`+) or decorative/gradient fills. Don't use it for body copy, links, or small interactive text (e.g. link hover states) without pairing it with a darker surface or larger weight.
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
├── syncup-logo.svg          ← 160×44 horizontal lockup (light/cream backgrounds)
└── syncup-logo-light.svg    ← 160×44 horizontal lockup, light wordmark (dark/indigo backgrounds)

apps/frontend/src/styles/
└── tokens.css               ← full CSS custom property system (imported by styles.css)

docs/
└── brand.md                 ← this file
```

### Design System Status

The token system is implemented and active: `apps/frontend/src/styles.css` opens with `@import './styles/tokens.css';`, and all component stylesheets (`nav`, `dashboard`, `kanban`, `login`, `register`) consume these tokens instead of hardcoded values.

### Figma

To use these assets in Figma:
1. Import `syncup-icon.svg` and `syncup-logo.svg` as Figma components (File → Place Image, or drag and drop)
2. In Figma, create a color palette using the hex values from Section 3
3. Add DM Sans and Inter via Figma's font picker (both are Google Fonts)
4. Search "brand guidelines template" in Figma Community for a ready-made brand canvas structure to populate
