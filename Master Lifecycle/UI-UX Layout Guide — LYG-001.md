# UI/UX Layout Guide (LYG-001)

**Classification:** Keep — standalone UI/UX layout-pattern reference for CRM/admin-style interfaces; supports Phase 7 design, Phase 8 preparation, and Phase 9 UI implementation.

**Canonical ID:** LYG-001.

**Canonical filename:** `UI-UX Layout Guide — LYG-001.md` (slash omitted so paths stay single-file on disk).

**Product context (example):** C-Connect CRM. Treat naming and modules as illustrative; align shells and spacing tokens with your design system.

**Gate context:** Supports **G5 — Architecture Approved** when CRM/admin layout structure is in scope and supports **G6 — Development Ready** when layout conventions, component shells, and responsive rules are selected before implementation. LYG-001 is not itself required gate evidence unless selected by project scope or review authority.

LYG-001 does **not** replace UXD-001, Appendix B, ARD-001, IMG-001, accessibility review, or implementation review. It is a reusable layout-pattern reference consumed by those artifacts and phases.

---

## 1. General layout

### 1.1 Global containers

| Region | Role |
| --- | --- |
| **Header** (`<header>`) | Fixed top; logo, global nav, user menu. Height: `h-16` (64px). |
| **Sidebar** (`<aside>`) | Left-fixed navigation for modules (e.g. Dashboard, CRM, Permissions, CMS). Width: `w-64` (256px); collapsible on smaller breakpoints. |
| **Main content** (`<main>`) | Scrollable page body. Padding: `p-6` or `p-4` by breakpoint. |
| **Footer** (`<footer>`) | Optional; minimal legal/info. |

### 1.2 Grid system

- **12-column** CSS Grid with Tailwind utilities.
- Container: `grid grid-cols-12 gap-6`
- **Breakpoints** (Tailwind defaults): `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px · `2xl` 1536px

### 1.3 Responsive behavior

- Mobile-first, progressive enhancement.
- Sidebar: icon-only or drawer below `md`.
- Content stacks on small screens (`flex-col`, `grid-cols-1`).
- Use `hidden`, `block`, `md:grid`, etc. for layout switching.

---

## 2. Layout principles

### 2.1 Mobile-first

- Build smallest layouts first; enhance upward.
- Prioritize performance and readability on all viewports.

### 2.2 Visual hierarchy

- Use size (`text-xl`, `text-lg`), weight (`font-semibold`), color (`text-muted`) for scan order.
- Place critical actions in the primary column or top-left.

### 2.3 Consistency

- Design tokens for spacing, color, typography (e.g. `space-y-6`, `text-primary`, `bg-surface`).

### 2.4 Accessibility

- Interactive elements focusable; use `tabindex` / `aria-*` where appropriate.
- Contrast, keyboard navigation, semantic HTML.
- Skip links, live regions, responsive font scaling where applicable.

### 2.5 Modularity

- Compose from atomic/molecule components (e.g. `SidebarItem`, `PageShell`, `EntityCard`).

---

## 3. Layout patterns

### 3.1 Sidebar + content

- **Use for:** Admin and workspace pages.
- **Structure:** `flex h-screen w-full`; sidebar `w-64`, `bg-white`, sticky; main `flex-1`, scrollable.

```html
<div class="flex h-screen">
  <aside class="w-64 bg-white border-r">...</aside>
  <main class="flex-1 overflow-y-auto p-6">...</main>
</div>
```

### 3.2 Dashboard grid

- **Use for:** Workspace dashboard, system overview.
- **Structure:** `grid grid-cols-12 gap-6`; collapse to one column below `md`.

```html
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-4 md:col-span-6">Card</div>
  <div class="col-span-4 md:col-span-6">Card</div>
</div>
```

### 3.3 Master–detail

- **Use for:** Entity detail (e.g. Person, Company).
- **Structure:** List left, detail right; stack on small screens.

```html
<div class="grid grid-cols-12 gap-4">
  <div class="col-span-4">Entity List</div>
  <div class="col-span-8">Entity Detail</div>
</div>
```

### 3.4 Modal / drawer overlay

- **Use for:** Create/edit forms, confirmations.
- **Structure:** `fixed inset-0`, backdrop, centered panel.

```html
<div class="fixed inset-0 bg-black/30 flex items-center justify-center">
  <div class="bg-white rounded-xl p-6 w-[90%] max-w-lg">...</div>
</div>
```

---

## 4. Section layouts

### 4.1 People / companies / opportunities

- **Wireframe:** Search bar → filters → table/list.
- **Components:** `SearchInput`, `TagFilter`, `EntityTable`.
- **Layout example:**

```html
<div class="space-y-4">
  <div class="flex items-center gap-4">...</div>
  <table class="w-full">...</table>
</div>
```

- **Notes:** Stack on `<md`; pagination at bottom.

### 4.2 Dashboard

- **Wireframe:** Card grid (4–6).
- **Layout:** `grid-cols-12` with `col-span-4`, collapse to `col-span-12` on narrow screens.
- **Notes:** Hover states, real-time badges, stats.

### 4.3 Permissions / RBAC

- **Wireframe:** Role list → detail → assignment matrix.
- **Layout:** Left: roles; right: editable permission matrix.
- **Spacing:** `gap-6`, `p-4`, form controls `space-y-2`.

### 4.4 CMS / documentation

- **Wireframe:** Sidebar (docs) → editor → preview tab.
- **Layout:** Three-column grid or tabbed view on mobile.
- **Notes:** Markdown live preview; resizable textarea; `prose` classes for rendered output.

---

## 5. Best practices for layout

### 5.1 Actionable tips

- **Modular components:** Build from `PageShell`, `Card`, `GridSection`, etc.
- **Design tokens:** Centralize Tailwind extensions / theme for spacing and surfaces.
- **Avoid horizontal scroll:** `overflow-x-hidden` on root/main where appropriate.

**Performance**

- Lazy-load modals/drawers.
- Reduce deep nested flex/grid on mobile.

**Testing**

- Storybook for layout states.
- Playwright for mobile and screen-reader flows.

### 5.2 Utility snippets

**Basic responsive grid**

```html
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <Card v-for="item in data" :key="item.id" />
</div>
```

**Spacing tokens (Tailwind config example)**

```javascript
// tailwind.config.js
theme: {
  spacing: {
    'layout-gutter': '1.5rem',
    'layout-padding': '2rem',
  }
}
```

**Fixed sidebar shell**

```html
<div class="flex h-screen">
  <aside class="w-64 bg-surface border-r p-4">Sidebar</aside>
  <main class="flex-1 p-layout-padding overflow-y-auto">Content</main>
</div>
```

---

## Related documents

- `13. Phase 7 — Architecture and Design.md` — Section 12 naming; UI review gates.
- `14. Phase 8 — Development Preparation.md` — component library Section 12.
- `15. Phase 9 — Implementation.md` — applies selected layout patterns during UI construction.
- `21. Decision Gates.md` — G5/G6 evidence expectations.
- `22. Required Documents.md` — canonical procedure/reference register.
- `24. Traceability Rules.md` — links layout decisions to design artifacts, tasks, implementation, and tests.
- `25. Quality and Compliance Checks.md` — UX/accessibility quality checks.
- `UI-UX Design Document — UXD-001 Procedure.md` — controlled UX design artifact that may reference LYG-001.
- `29. Appendix B — Checklists.md` — UI/UX scoring and audit criteria.
- `Translate Component Image to Code — Template Prompt.md` — IMG-001 prompt/playbook for implementing approved visuals.

## Version history

- **1.0** — Ingested from inbox (`000.Notes.md`); normalized headings and code fences.
- **1.1** — Clarified standalone status, G5/G6 support role, non-replacement rule, and lifecycle links.
