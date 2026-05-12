# Webpage Structure Analysis and Rebuild Guide

**Classification:** Keep — frontend reverse-engineering and rebuild procedure.

**Procedure ID:** WEB-001

**Lifecycle placement**

| Phase | Role |
| --- | --- |
| **Phase 7 — Architecture and Design** | Inform extraction of structure, styling patterns, behavior, and dependencies from an existing site or bundle when evolving or migrating UI. |
| **Phase 8 — Development Preparation** | Supports hands-on prep: dependency inventory, load order, accessibility gaps, and rebuild or modernization notes before implementation. |

**Scope:** Client-side analysis of HTML, CSS, JavaScript, external resources, and dependency order. Server-side source may not be available; infer backend presence from artifacts and network behavior.

---

## 1. Purpose

Understand how a deployed or cloned webpage is built (structure, presentation, behavior, and external dependencies) so you can edit, redesign, rebuild, or upgrade it safely. This guide is methodology-agnostic: it applies to static HTML, bundled assets, and framework-driven sites where output can be inspected in the browser.

---

## 2. Analyze HTML structure

### 2.1 Open and explore the DOM

- Open developer tools (browser Inspect / F12).
- Locate `<html>`, then `<head>` (metadata, links, scripts) and `<body>` (visible content).
- Map the top-level regions: header, main, footer, and major sections.

### 2.2 Identify semantic elements

Prefer recognizing HTML5 landmarks:

| Element | Typical role |
| --- | --- |
| `<header>` | Branding, utility nav |
| `<nav>` | Primary or secondary navigation |
| `<main>` | Primary page content |
| `<section>` | Thematic grouping |
| `<article>` | Self-contained content |
| `<aside>` | Supplementary content |
| `<footer>` | Legal, links, meta |

Use editor folding or tree view to see nesting depth and sibling structure.

### 2.3 Layout and repetition

- Locate hero, feature grids, cards, lists, carousels.
- Note repeating DOM patterns (cards, list items) for component extraction later.
- In `<head>` and before `</body>`, list `<link rel="stylesheet">` and `<script src>`; note framework bundles vs custom paths.

### 2.4 Classes, IDs, and attributes

- `class` and `id` drive styling and scripting; export a concise inventory for large refactors.
- `data-*` attributes often flag JS hooks or analytics.

### 2.5 Responsive behavior

- Confirm `<meta name="viewport" ...>` exists for mobile layouts.
- Resize the viewport or use device emulation; observe layout breakpoints.

### 2.6 Accessibility (initial pass)

- Images: meaningful `alt` (or empty `alt` when decorative).
- Heading order: one logical `<h1>` per view where possible; nested `<h2>`–`<h6>`.
- Interactive controls: native elements or ARIA where custom widgets exist.

### 2.7 Dynamic and interactive regions

- Toggle UI state (menus, tabs) and watch DOM/class changes.
- Observe network panel when content appears without full navigation (client rendering, XHR/fetch).

### 2.8 Framework and template signals

| Signal | Possible stack |
| --- | --- |
| `data-reactroot`, React DevTools | React |
| `ng-app`, `ng-*` | Angular |
| `v-if`, Vue DevTools | Vue |
| Hydration markers, island architecture | Meta-frameworks (Next, Nuxt, etc.) |

Distinguish server-rendered HTML from purely client-mounted apps.

### 2.9 Forms

- Locate `<form>`, inputs, validation attributes, and submit paths.
- Note client-side validation scripts vs server round-trips.

### 2.10 Performance clues in markup

- `loading="lazy"` on images; `async` / `defer` on scripts.
- Preconnect/preload hints in `<head>`.

### 2.11 Document structure for rebuild planning

- Produce a short outline or sketch: header blocks, main sections, footer.
- Optional: capture a simplified wireframe for handoff to design or TD-001 task breakdown.

**HTML checklist (quick)**

| Action | Outcome |
| --- | --- |
| Map semantic regions | Clear section ownership |
| Trace CSS/JS links | Know asset entry points |
| Note repetition | Candidate components |
| Viewport and breakpoints | Responsive expectations |
| a11y spot check | Early barrier list |

---

## 3. Study CSS

### 3.1 Locate stylesheets

- Follow `<link rel="stylesheet">` in order; note `@import` chains.
- Common layout: `/css/`, `/styles/`, or hashed bundle names from build tools.

### 3.2 What to extract from rules

| Theme | Inspect for |
| --- | --- |
| Tokens / theme | `:root` variables (e.g. `--primary-color`), brand colors |
| Typography | `font-family`, scale, weights |
| Layout | Flex, grid, positioning |
| Spacing | `margin`, `padding`, gaps |
| Effects | Shadows, radius, `transition`, `@keyframes` |
| States | `:hover`, `:focus`, `:focus-visible`, `:active` |
| Responsive | `@media` breakpoints |

Use editor search across CSS for tokens such as `color`, `font`, `flex`, `grid`, `media`.

### 3.3 Frameworks and utilities

| Clues | Likely system |
| --- | --- |
| `container`, `row`, `col-*` | Bootstrap-like |
| Utility-heavy class strings (`text-center`, `p-4`, `md:flex`) | Tailwind-like |
| BEM-style names | Custom convention |

### 3.4 DevTools Styles and Computed

- Inspect an element: active rules, overridden strikethroughs, source file and line when available.
- Computed tab: resolved values (colors, font-size) after cascade.

### 3.5 Inline and embedded CSS

- `style=""` attributes and `<style>` blocks override linked sheets; flag them for consolidation when refactoring.

### 3.6 Performance notes

- Minified `.min.css`, critical CSS patterns, unused CSS risk from large frameworks.

**CSS checklist (quick)**

| Step | Why |
| --- | --- |
| Open primary stylesheet(s) | Single source of truth for branding |
| Map variables and breakpoints | Easier token migration |
| Detect framework | Scope customization vs overrides |
| DevTools live edits | Validate hypotheses before repo edits |

---

## 4. Understand JavaScript behavior

### 4.1 Locate scripts

- `/js/` or bundled assets; distinguish vendor (`*.min.js`) from application code.
- Prefer reading small custom files before large libraries.

### 4.2 Behavior categories

| Pattern | Look for |
| --- | --- |
| Sliders / carousels | Library init (`Swiper`, `Slick`), timers |
| Modals | Display toggles, focus traps |
| Forms | Validation, `preventDefault`, fetch |
| Dynamic DOM | `createElement`, `innerHTML`, templates |
| Data | `fetch`, `axios`, XHR |
| Navigation | Class toggles on menu open/close |

Search for `addEventListener`, `$()`, `useEffect`-style hooks (if source maps exist).

### 4.3 Paradigm detection

| Clues | Paradigm |
| --- | --- |
| `document.querySelector`, no framework imports | Vanilla |
| `$`, `jQuery` | jQuery |
| `import`, JSX/TSX, components | Framework SPA |

### 4.4 DevTools debugging

- Sources: breakpoints; Console: errors during interaction.
- Network: XHR/fetch when interacting.

### 4.5 Async behavior

- Promises, `async`/`await`, lazy chunks, websockets for live data.

### 4.6 Loading strategy

- `async` / `defer` on scripts; order relative to DOM readiness.

**JavaScript checklist (quick)**

| Step | Why |
| --- | --- |
| Read smallest custom file first | Fast mental model |
| Map events to handlers | UX fidelity when rebuilding |
| List third-party libs | License and weight implications |

---

## 5. External resources (CDNs and APIs)

### 5.1 CDN-hosted assets

In HTML, absolute `https://` links to CSS/JS/fonts/icons indicate CDN usage (e.g. jsDelivr, unpkg, Google Fonts, Font Awesome). Record each URL and purpose.

### 5.2 APIs

In JS, search for `fetch(`, `axios`, `XMLHttpRequest`, or vendor SDKs. Note:

- Base URLs and endpoints
- Whether keys appear in client code (risk: rotation, proxy via backend)
- Failure modes if third-party is unavailable

### 5.3 Dependency summary

Maintain a short table: CDN library, API provider, required vs optional, owner for keys and SLAs.

---

## 6. Map dependencies

### 6.1 Library inventory

Aggregate libraries from HTML script/link tags and import graphs.

### 6.2 Load order

- Dependencies first (e.g. jQuery before plugins; bundle before app script).
- Document order errors that would cause runtime failures.

### 6.3 Static vs dynamic site

| Clues | Inference |
| --- | --- |
| Only `.html`, `.css`, `.js` in artifact tree | Static or client-only build output |
| `.php`, server routes, `api/` folder | Server-rendered or API backend |
| `fetch('http://localhost:…')` or env-specific API hosts | Client talks to known backend |
| Network tab: JSON APIs | Data-driven UI |

---

## 7. Rebuild and improve

### 7.1 Recreate structure deliberately

- Start from a minimal valid HTML shell; add regions matching the analyzed outline.
- Prefer semantic names over opaque class-only blobs when you control naming.

### 7.2 Implement CSS and JS incrementally

- Match behavior against the original; reduce duplication as you extract components.

### 7.3 Improve intentionally

- Fix responsiveness, contrast, heading order, and keyboard access where the source was weak.
- Record deltas in project notes (layout decisions, library swaps).

### 7.4 Document findings

Capture: page map, key selectors, event behaviors, external deps, and known gaps. Align filenames with Phase 8 blueprint or internal wiki if used.

### 7.5 Optional modernization path

After parity with the reference behavior, consider migrating to team standards (e.g. design tokens, Tailwind, component framework, Vite/Next) per architecture review. Treat as a separate increment with its own risk and test plan.

---

## 8. Related Master Lifecycle documents

- `13. Phase 7 — Architecture and Design.md`
- `14. Phase 8 — Development Preparation.md`
- `Universal Blueprint Extraction — BP-001 Procedure.md` — deeper codebase-to-blueprint extraction when full repo access exists.
- `Translate Component Image to Code — Template Prompt.md` — when rebuilding from visuals.

---

## Revision history (procedure)

| Version | Notes |
| --- | --- |
| 1.0 | Initial canonical merge from working notes; removed informal tone and decorative markers |
