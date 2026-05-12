# Translate component image to code — template prompt

**Classification:** Keep — standalone reusable image-to-code prompt for Phase 8 conventions and Phase 9 UI implementation.
**Prompt ID:** IMG-001.
**Legacy ID:** TP-IMAGE-TO-CODE-001.
**Purpose:** Reusable frontend code-generation prompt; standardized output format; project template reuse; accessibility; CSS variables; component taxonomy.

**Gate context:** Supports **G6 — Development Ready** when image-to-code conventions, required `@` context, design tokens, and output expectations are selected during Phase 8. Supports Phase 9 implementation evidence when UI tasks are generated from screenshots or mockups.

IMG-001 does **not** replace UXD-001, ARD-001, Phase 8, Phase 9, accessibility review, or human code review. It is a reusable prompt/playbook for producing implementation candidates that must still be reviewed against approved design, accessibility, security, and project coding standards.

Use when asking an AI assistant (or a human playbook) to turn a **screenshot or mock** into implementation-ready HTML/CSS (and JS only when needed).

---

## Instructions for the AI

You are an expert front-end developer. Your task is to analyze the provided image of a UI component (or full region) for this project and generate clean, accessible, production-ready code.

### Goal

Translate the visual into:

- **HTML** — semantic, minimal, accessible.
- **CSS** — external stylesheet; **no inline styles**; modern layout (flexbox/grid as appropriate).
- **JavaScript** — only if interaction cannot be achieved with HTML/CSS alone.

### Reuse project patterns first

Before inventing new modules, **search the repository** for existing chart cards, metric cards, factories, gauges, and layout wrappers. When invoking an assistant in an IDE, attach `@` context files that match your codebase (examples — replace with real paths):

- Chart / KPI templates  
- Shared CSS (e.g. component factory, tokens)  
- Existing `MetricCard`, `GaugeChart`, `SectionContainer`, `StatusBadge`-style modules  

Document any `@` paths your team standardizes in Phase 8 prep so implementation stays consistent.

---

## Requirements

1. Match layout, spacing, typography, shadows, borders, and colors from the image as closely as practical.
2. Prefer **flexbox** or **CSS grid** for structure.
3. Prefer **CSS variables** for colors and radii when the project uses a token system (see Phase 7 — CYBERCUBE tokens / design system).
4. Keep structure readable; use brief comments for major sections.
5. Use only **approved frameworks/libraries** for this project; if the stack is unclear, say so and propose minimal vanilla HTML/CSS.
6. Apply **responsive** rules when the design implies breakpoints or mobile behavior.
7. If fonts are unclear, state a fallback (e.g. Inter, Roboto, system-ui) in assumptions.
8. **Accessibility:** semantic headings/landmarks, labels for inputs, sufficient contrast where determinable, focus-visible considerations for interactive elements.
9. If any detail is ambiguous, **state the assumption** explicitly in the summary.

---

## Output format (return in this order)

### 1. Summary of what you see

Describe layout, colors, structure, and UI elements.

### 2. HTML code block

Full structure (e.g. root `div` with a clear class name for the component).

### 3. CSS code block

Classes must match the HTML; no inline styles in the HTML.

### 4. JavaScript code block

**Only if needed** — otherwise state “Not required” and why.

### 5. Assumptions and follow-ups

List open questions, missing assets, or design tokens to confirm with the team.

---

## Component taxonomy — web (reference)

Use with Phase 8 **Section 12** (reusable component library) for naming alignment.

1. **Layout and structure** — Header/navbar, footer, sidebar, main, grid, section wrappers, containers, cards.  
2. **Navigation** — Navbars, breadcrumbs, tabs, pagination, sidebar menus, dropdowns, mobile drawers.  
3. **Content display** — Text blocks, images, media, hero, features, article/blog cards, tables.  
4. **Interactive / controls** — Buttons, forms, inputs, selects, text areas, checkboxes, radios, switches, sliders, modals, tooltips, accordions, carousels.  
5. **Data and visualization** — Charts, KPI cards, gauges, timelines, sortable/filter tables, data grids.  
6. **Functional** — Search, filters, loaders, pagination logic, uploads, auth widgets, profile menus.  
7. **Dynamic** — Chat, toasts, live updates, infinite scroll, maps, calendars.  
8. **E-commerce** — Product cards, cart, checkout, pricing, order summary, reviews.  
9. **Utility** — Icons, spacing/typography helpers, theme switcher, breadcrumb frameworks.

---

## Component taxonomy — desktop software (reference)

Use for desktop or hybrid apps; map names to your UI toolkit (Electron, WPF, Qt, etc.).

1. **Core structure** — Main window, child/dialog windows, splash, status bar, sidebar, toolbar/ribbon, menu bar, workspace.  
2. **Navigation** — Tabs, collapsible panels, tree views, breadcrumbs, drawers, split panes, wizards.  
3. **Input** — Text fields, areas, password, dropdowns, multi-select, checkboxes, radios, switches, date/time, color pickers, sliders, steppers, file pickers, shortcuts.  
4. **Output / display** — Labels, images, icons, charts, tables, Kanban, timelines, progress, logs, toasts, tooltips.  
5. **Containers / layout** — Sections, frames, panels, grids, stacks, group boxes, accordions, cards.  
6. **System integration** — File explorer, network tools, tray icons, clipboard, printer dialogs, local storage, background services.  
7. **App logic / workflow** — Event dispatch, state, scheduler, workers, undo/redo, validation, notifications, settings, updates.  
8. **Communication** — API clients, DB connectors, WebSocket, sync, error/crash reporting, authentication.  
9. **File / data** — Import/export, drag-and-drop, versioning/history, backup/restore, encryption.  
10. **Productivity / editing** — Rich text, code editor, spreadsheet, canvas, preview, layers, annotations.  
11. **DevTools-style** — Debug console, terminal, breakpoints, log inspector, component inspector, Git panel.  
12. **Quality of life** — Theme switcher, shortcut map, onboarding, hints, command palette, autosave.  
13. **Security / permissions** — RBAC visible in UI, encryption/session messaging, safe mode, audit logs.

---

## Traceability

- Prefer naming new UI pieces using Phase 7 **Section 12** (`<Domain><ComponentRole>`, PascalCase files).  
- If the component maps to a design-system token, reference the token name in CSS comments.

---

## Related Documents

| Document | Role |
| --- | --- |
| `14. Phase 8 — Development Preparation.md` | Select image-to-code conventions, component naming, default `@` context, and prompt version before implementation. |
| `15. Phase 9 — Implementation.md` | Applies IMG-001 when work is driven from screenshots, mockups, or visual component specs. |
| `UI-UX Design Document — UXD-001 Procedure.md` | Controlled UX/design artifact; IMG-001 translates approved visuals but does not replace UX design. |
| `Architecture Design Document — ARD-001.md` | Architecture baseline and UI architecture context where applicable. |
| `29. Appendix B — Checklists.md` | UI/UX and accessibility review expectations. |
| `22. Required Documents.md` | Canonical procedure/prompt register. |
| `24. Traceability Rules.md` | Links generated components to requirements, design artifacts, tasks, code, and tests. |
| `Pseudocode to Code Conversion Guidelines.md` | Complementary P2C-001 standard when logic/pseudocode drives implementation. |
| `Unit Test and Pseudocode Writing Guidelines.md` | Testing discipline for generated or translated implementation. |
| `Webpage Structure Analysis and Rebuild Guide.md` | Use when visual implementation depends on inspecting/rebuilding an existing web page. |

---

## Document control

| Field | Value |
| ----- | ----- |
| ID | IMG-001 |
| Legacy ID | TP-IMAGE-TO-CODE-001 |
| Version | 1.0 |
| Owner | Engineering / front-end lead |
| Lifecycle | Update when stack, tokens, or AI workflow changes |

