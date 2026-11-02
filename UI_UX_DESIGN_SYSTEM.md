# UI/UX DESIGN SYSTEM & INTERFACE STANDARDS
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Visual Foundation & Philosophy

Our user interfaces must be intentional, clean, highly functional, and designed specifically for the target business domain. We reject superficial aesthetic gimmicks in favor of clarity, usability, and speed.

### Default Theme Standards:
- **Default Theme:** Neutral Light Theme (white, light slate, cool grays, neutral borders).
- **Backgrounds:** Clean crisp whites (`#FFFFFF`), light canvas (`#F8FAFC` / `#F9FAFB`), subtle card surfaces.
- **Text & Contrast:** High contrast text hierarchy (primary text: `#0F172A` / `#111827`, secondary: `#475569`, muted: `#64748B`). Meets or exceeds WCAG 2.1 AA standards (minimum 4.5:1 for normal text).
- **Dark Mode Policy:** Dark mode is NEVER the default. Dark mode is implemented only when explicitly requested by the user or when strictly demanded by the domain context (e.g., media editing suites, terminal consoles).

---

## 2. Banned Design Tropes (Anti-AI Aesthetics)

The following clichés of AI-generated web design are strictly forbidden:
- ❌ **NO Excessive Gradients:** Avoid neon, violet-to-cyan, or multi-stop gradients across headers, cards, or hero text.
- ❌ **NO Superficial Glassmorphism:** Avoid fuzzy frosted-glass cards with blur filters (`backdrop-blur-md`) layered over patterned backgrounds.
- ❌ **NO Repetitive Floating Card Grids:** Do not format every piece of information as a floating, boxed card with huge rounded borders.
- ❌ **NO Emoji as UI Icons:** Emoji are forbidden as navigation or action icons. Use established SVG icon sets (e.g., **Lucide**, **Heroicons**, **Feather**).
- ❌ **NO Meaningless Animations:** Avoid floating shapes, pulsing background orbs, and distracting page entrance delays.
- ❌ **NO Generic Multi-Industry Templates:** An e-commerce store, a hospital record system, a banking dashboard, and a card game require distinct interaction models. Never copy-paste the same template across domains.

---

## 3. Spacing & Typography Scale

### Spacing Grid (8-Point Base System):
Use an orderly spacing system:
- `4px` (`0.25rem`): Micro gaps, icon-to-label spacing, tight badges.
- `8px` (`0.5rem`): Compact padding, form field internals, button padding (small).
- `12px` (`0.75rem`): Standard button vertical padding, list item gaps.
- `16px` (`1rem`): Standard layout padding, card interior padding.
- `24px` (`1.5rem`): Component separation, section headers.
- `32px` (`2rem`): Grid gaps, section vertical margins.
- `48px` / `64px`: Page-level major section dividers.

### Typography Hierarchy:
- **Font Stack:** Clean, modern, highly legible sans-serif typefaces: `Inter`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif`.
- **Scale:**
  - Page Title (H1): 28px – 32px, bold (`font-bold` / `weight: 700`), line height 1.25.
  - Section Header (H2): 20px – 24px, semibold (`font-semibold` / `weight: 600`).
  - Subsection Header (H3): 16px – 18px, semibold (`weight: 600`).
  - Body Text: 14px – 16px, regular (`weight: 400`), line height 1.5.
  - Subtitle / Meta / Caption: 12px – 13px, regular or medium (`weight: 400` / `500`), muted color.

---

## 4. Comprehensive Component States

Every interactive component (buttons, forms, cards, tables) must support all operational states:

1. **Default State:** Clean, readable, with clear visual affordance.
2. **Hover State:** Subtle color shift (e.g., darkening or lightening by 5-10%), cursor pointer.
3. **Active / Pressed State:** Subtle scale or shadow depression indicating tactile feedback.
4. **Focus-Visible State:** Distinct focus ring (`2px ring-offset-2 ring-primary`) for keyboard navigation.
5. **Disabled State:** Reduced opacity (40-50%), `cursor: not-allowed`, no hover effects, non-interactive.
6. **Loading State:** Inline skeleton loaders, subtle spinner on buttons with disabled click events; maintain layout dimensions to prevent layout shifts (CLS).
7. **Error State:** Red accent borders (`#EF4444` / `#DC2626`), contextual error message directly beneath the input.
8. **Empty State:** Thoughtfully designed empty states with a helpful illustration or icon, explanatory copy, and an actionable primary button.

---

## 5. UI Copywriting Standards

- **Clarity & Conciseness:** Write direct, plain, and professional copy.
- **Eliminate Redundant Parentheses:**
  - ❌ Incorrect: `Contact Us (Get in Touch)`
  - ✅ Correct: `Contact Us`
  - ❌ Incorrect: `Submit Form (Send Details)`
  - ✅ Correct: `Submit` or `Send Message`
- **Action-Oriented Buttons:** Use imperative verbs (`Save Changes`, `Create Project`, `Download Report`, `Invite Member`) instead of vague terms like `Okay` or `Click Here`.
