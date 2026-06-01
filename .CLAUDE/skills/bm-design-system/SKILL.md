---
name: bm-design-system
description: Enforces Yvy Capital's custom design system tokens, typography scales, visual identity, and component patterns.
---

# Yvy Capital Design System Guidelines

This skill defines the visual identity, design tokens, and UI patterns for **Yvy Capital** and instructs AI agents on how to construct and modify interfaces within this repository. 

AI agents MUST read and follow these rules at all times to prevent "AI aesthetic" drifts and preserve brand uniformity.

---

## 1. Core Brand Primitives & Tokens

All styling MUST use Tailwind v4 theme variables. DO NOT invent arbitrary hex codes or styling scales.

### 1a. Color Palette
*   **Primary Brand Navy (`yvy-navy`):** `#122C4F` (CSS variable: `--color-yvy-navy`). This is the default background for headers, footers, main hero banners, and primary filled buttons.
*   **Accent Royal Blue (`yvy-royal`):** `#3E5FAA` (CSS variable: `--color-yvy-royal`). Used for active states, link hover states, and interactive button transitions.
*   **Neutrals:**
    *   **White:** `#FFFFFF` (Primary page background and primary banner text)
    *   **Black:** `#000000` (Secondary background for headers/footers)
*   **Delicate Dividers (`yvy-border`):** Black with 20% opacity (`rgba(0,0,0,0.2)` or Tailwind Class: `border-black/20`).

### 1b. Typography Scales
Yvy Capital uses two Google Fonts families:
*   **`font-barlowcn` (Barlow Condensed):** Enforced for all display titles, subheadings, navigation links, and primary button labels. Usually styled as `uppercase font-light` or `font-semibold` to match the minimalist brand layout.
*   **`font-barlow` (Barlow):** Used for all descriptive body paragraphs, form labels, and general reading text.

---

## 2. Brand Visual Aesthetics & UI Patterns

Avoid generic shadow-heavy layouts, rounded corners (`rounded-2xl`), and multiple colorful gradients. The visual signature of Yvy Capital is:
1.  **Flat and Precise:** No heavy box-shadows. Use thin borders (`border-b border-black/20`) as structural dividers.
2.  **Spacious Grid Layouts:** Utilize generous padding (`py-10 lg:py-20`) and clear spacing columns (`grid-cols-6 lg:grid-cols-12 gap-x-6`).
3.  **High Contrast:** Bright elements stand out on deep solid `#122C4F` backgrounds.
4.  **Elegant Micro-animations:** Smooth ease-in-out transitions on hovers and accordion height expansions (`transition-all ease-in-out duration-300`).

---

## 3. UI Component Implementations

### 3a. Accordions (Corporate Policies Motif)
The Accordion is a central brand motif used for compliance and policy centers:
*   **Active Title Text:** Shifts from standard text to Yvy Royal Blue (`#3E5FAA`).
*   **Interactive Chevron:** A right-aligned SVG chevron that rotates 180 degrees when active.
*   **Border Divider:** Every accordion resides inside a `border-b border-black/20` list item.

### 3b. Reusable Buttons
*   **Solid Variant:** Uppercase `font-barlowcn font-medium tracking-wide` text, background color is `bg-yvy-navy`, transitioning to `bg-yvy-royal` on hover.
*   **Outline Variant:** Thin `border border-yvy-navy`, text changes high contrast on hover.

### 3c. Card Structure
*   Use flat, thin borders (`border border-black/20` or `border-b border-black/20`) rather than standard shadow-heavy boxes.
*   Header elements should use uppercase `font-barlowcn font-semibold`.

---

## 5. Component Library & Conventions

The component index is at `frontend/src/components/ui/COMPONENTS.md`. Read it before building any page — it lists every available component with props, usage examples, and upcoming components.

### Naming & export conventions
- One file per component, named in PascalCase: `Badge.tsx`, `StatCard.tsx`
- Compound components export multiple named exports from the same file: `Table.tsx` → `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`
- `forwardRef` components always set `.displayName`
- All components use `cn()` from `../../lib/utils`

### Token additions (beyond base palette)
- Badge semantic colors use Tailwind built-in palettes (emerald/amber/rose) — these are NOT custom tokens
- Skeleton shimmer: `.skeleton-shimmer` class defined in `index.css` using `@keyframes shimmer`
- Checkbox styling: `.yvy-checkbox` class defined in `index.css` (replaces `appearance-none` approach)
- Striped tables: `.yvy-table-striped` class defined in `index.css`

### DesignSystem page
Every new component must be showcased in `frontend/src/pages/DesignSystem.tsx` with all variants.  
Route: `/design-system`. Verify with `npm run build` and `npm run dev` from `frontend/`.

---

## 4. Verification Checklists for AI Agents

Before submitting any code changes, verify:
- [ ] Brand colors match `--color-yvy-navy` (`#122C4F`) and `--color-yvy-royal` (`#3E5FAA`) exactly.
- [ ] Fonts are correctly classified as `font-barlowcn` for headings/buttons and `font-barlow` for paragraphs.
- [ ] Components are completely accessible via keyboards (focusable, tab-active, clear focus outlines).
- [ ] All elements load cleanly without console warning logs.
- [ ] Flat aesthetic is maintained—no arbitrary rounded corners (`rounded-2xl`) or floating shadows.
