# Styling Guide — Fine Desktop

This document explains how colors, spacing, typography, and RTL are structured in this app. Read this before adding new styles so things stay consistent instead of every component inventing its own values.

---

## 1. The core idea

We never hardcode raw Tailwind colors (`text-zinc-400`, `bg-red-500`, etc.) or arbitrary pixel values (`text-[15px]`) in components. Everything traces back to **one source of truth**: CSS variables defined in `src/index.css`.

```
src/index.css          ← CSS variables (the actual color/values live here)
        ↓
tailwind.config.js      ← maps CSS variables to Tailwind classes (bg-app-*, rounded-app-*)
        ↓
src/lib/tokens.ts       ← same values, but as JS strings (for non-className use cases)
        ↓
components/*.tsx        ← consume via className="bg-app-accent" or tokens.color.accent.primary
```

Change a color once in `index.css` → it updates everywhere: Tailwind classes, JS token references, and raw CSS all stay in sync automatically.

---

## 2. Colors

### 2.1 Where they're defined — `src/index.css`

```css
:root {
  --app-bg-primary: #ffffff;
  --app-bg-secondary: #f5f5f7;
  --app-bg-tertiary: #eeeeee;

  --app-accent-primary: #3f8d7f;   /* brand teal — buttons, links, active states */
  --app-accent-hover: #357667;
  --app-accent-subtle: #dcece7;    /* light mint — section backgrounds */
  --app-accent-tint: #eef6f4;      /* lightest mint — subtle card backgrounds */

  --app-label-primary: #1a1a1a;    /* main text */
  --app-label-secondary: #6b7280;  /* secondary text */
  --app-label-tertiary: #9ca3af;   /* placeholders, icons, muted text */
  --app-label-quaternary: #d1d5db; /* disabled/very muted */

  --app-status-danger: #dc2626;
  --app-status-positive: #16a34a;
  --app-status-info: #2563eb;
  --app-status-orange: #ea580c;
  --app-status-yellow: #ca8a04;

  --app-fill-f1: #f3f4f6;          /* hover backgrounds */
  --app-fill-f2: #e5e7eb;
  --app-fill-f3: #d1d5db;

  --app-separator: #e5e7eb;        /* borders, dividers */
}
```

**To change the app's theme (e.g. switch the accent from teal to blue), edit only this file.**

### 2.2 How to name a new color

Pick the group it belongs to before inventing a new one:

| Group | Use for |
|---|---|
| `bg` | Page/panel backgrounds |
| `accent` | Brand color — buttons, active links, focus rings |
| `label` | Text, in order of visual weight (primary → quaternary) |
| `status` | Success/error/info/warning states |
| `fill` | Hover/pressed backgrounds on interactive elements |
| `separator` | Borders and dividers |

Don't add a color outside these groups without a reason — it usually means an existing one already fits.

### 2.3 Using colors in components

```tsx
// ✅ Do this
<div className="bg-app-bg-secondary text-app-label-primary border-app-separator">

// ❌ Not this
<div className="bg-zinc-900 text-zinc-100 border-zinc-800">
```

Available classes (auto-generated from `tailwind.config.js`):
`bg-app-bg-primary`, `bg-app-bg-secondary`, `bg-app-bg-tertiary`, `bg-app-accent`, `bg-app-accent-hover`, `bg-app-accent-subtle`, `bg-app-accent-tint`, `text-app-label-primary/secondary/tertiary/quaternary`, `text-app-status-danger/positive/info/orange/yellow`, `bg-app-fill-f1/f2/f3`, `border-app-separator`.

Opacity modifiers still work: `bg-app-status-danger/10`, `border-app-status-danger/30`.

### 2.4 Using colors outside `className` — `tokens.ts`

Some libraries (charts, canvas) don't accept Tailwind classes — they need a raw color string/prop. That's what `src/lib/tokens.ts` is for:

```tsx
import { tokens } from "@/lib/tokens";

<Line stroke={tokens.color.accent.primary} />
<Bar fill={tokens.color.status.positive} />
ctx.fillStyle = tokens.color.status.danger;
```

Same underlying CSS variable, different consumption method. If a component takes a `className`, use Tailwind. If it takes a `color`/`fill`/`stroke` prop, use `tokens`.

---

## 3. Border radius

Defined in `tailwind.config.js`:

```js
borderRadius: {
  "app-sm": "8px",
  "app-md": "10px",
  "app-lg": "12px",
  "app-xl": "16px",
},
```

Use `rounded-app-sm/md/lg/xl` instead of Tailwind's default `rounded-sm/md/lg/xl` (which are different pixel values and not part of this system). Pick based on element size — small elements (badges, inputs) → `app-sm`/`app-md`; cards/modals → `app-lg`/`app-xl`.

---

## 4. Typography

Defined in `src/lib/tokens.ts` under `typography.webUI`, as bundled className strings (size + weight + line-height together):

```ts
typography: {
  webUI: {
    largeTitleEmphasized: "text-[20px] font-semibold leading-[30px]",
    t1Regular:            "text-[18px] font-normal leading-[26px]",
    t1Emphasized:         "text-[18px] font-medium leading-[26px]",
    t2Regular:            "text-[16px] font-normal leading-[24px]",
    t2Emphasized:         "text-[16px] font-medium leading-[24px]",
    b1Regular:            "text-[15px] font-normal leading-[22px]",
    b1Emphasized:         "text-[15px] font-medium leading-[22px]",
    b2Regular:            "text-[14px] font-normal leading-[20px]",
    b2Emphasized:         "text-[14px] font-medium leading-[20px]",
    c1Regular:            "text-[12px] font-normal leading-[18px]",
    c1Emphasized:         "text-[12px] font-medium leading-[18px]",
  },
},
```

**Naming convention:** `t` = title, `b` = body, `c` = caption. Number = size step within that category. `Regular`/`Emphasized` = weight variant. Higher category + lower number = bigger/bolder.

### Usage — always via `cn()`, never as a plain string

```tsx
import { cn } from "@/lib/utils/utils";
import { tokens } from "@/lib/tokens";

<h1 className={cn(tokens.typography.webUI.largeTitleEmphasized, "text-app-label-primary")}>
  Title
</h1>
```

`cn()` (clsx + tailwind-merge) is required here, not optional — if you ever need to override part of a preset (e.g. bump the color or add `tracking-tight`), plain string concatenation can leave conflicting Tailwind classes both applied. `cn()` dedupes them correctly.

**Adding a new size:** add it to `tokens.ts` under `typography.webUI`, following the existing naming pattern. Don't write one-off `text-[17px]` values in components.

---

## 5. Spacing

Also in `tokens.ts`, for the same reason as colors — most spacing should just be normal Tailwind classes (`p-4`, `gap-2`), but `tokens.spacing` exists for cases needing a raw pixel value (canvas layouts, inline styles, chart margins):

```ts
spacing: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "20px", "2xl": "24px", "3xl": "32px" },
```

---

## 6. RTL (Arabic) layout

The app is RTL-first. `dir="rtl" lang="ar"` is set on `<html>` in `index.html` — that's what flips native browser behavior (text alignment, scrollbar side, form control order) before React even mounts.

`tailwindcss-logical` (already installed as a plugin) gives **direction-aware** utilities. These are the ones to use everywhere by default:

| Instead of | Use | Why |
|---|---|---|
| `pl-3` / `pr-3` | `ps-3` / `pe-3` | padding-**s**tart / -**e**nd, flips automatically with `dir` |
| `ml-2` / `mr-2` | `ms-2` / `me-2` | same idea for margin |
| `left-0` / `right-0` | `start-0` / `end-0` | for absolute positioning |
| `text-left` / `text-right` | `text-start` / `text-end` | text alignment |
| `border-l` / `border-r` | `border-s` / `border-e` | borders |

Plain `flex`, `gap-*`, `justify-between` etc. need **no change** — the browser already reverses flex child order under `dir="rtl"` automatically.

### The exception: fields that are always English

Email, password, phone number, URL fields — content the user types is always Latin script regardless of app language. For these specific inputs, don't use logical properties; pin them to LTR explicitly and use the **physical** classes instead:

```tsx
<input dir="ltr" className="pl-9 pr-3 text-left ..." />
```

Why: if you used `ps-9`/`text-start` here, the icon and text would flip to the right under the page's RTL context, which looks wrong for a field whose content is always left-to-right (e.g. `operator@company.com`).

**Rule of thumb:**
- Labels, buttons, nav, page layout, cards → logical properties (`ps-*`, `start-*`, `text-start`)
- Email/password/URL/phone inputs → physical properties (`pl-*`, `left-*`, `text-left`) + `dir="ltr"` on the `<input>`

### Icons that imply direction

Native RTL flips text and layout, but **not** SVG icon shapes. A "back" chevron pointing left still points left under `dir="rtl"`, which is now visually wrong (it should point right, toward where "back" is). Fix manually:

```css
[dir="rtl"] .icon-chevron-forward {
  transform: scaleX(-1);
}
```

Only applies to directional icons (arrows, chevrons for next/back). Icons like a mail envelope, user avatar, trash can, etc. don't need this.

---

## 7. Quick checklist when building a new component

1. Backgrounds/text/borders → `bg-app-*`, `text-app-*`, `border-app-separator` — never raw Tailwind colors.
2. Radius → `rounded-app-sm/md/lg/xl` — never `rounded-lg`/`rounded-[Npx]`.
3. Text styling → `tokens.typography.webUI.*` via `cn()` — never inline `text-[Npx]`.
4. Spacing/positioning → logical (`ps-*`, `start-*`) by default.
5. Is this field always-English content (email/password/url)? → use physical (`pl-*`, `left-*`) + `dir="ltr"` instead.
6. Directional icon (arrow/chevron)? → add the `[dir="rtl"]` flip rule.
7. Need a raw value for a non-className context (chart, canvas)? → pull it from `tokens.ts`, not from `index.css` directly.
