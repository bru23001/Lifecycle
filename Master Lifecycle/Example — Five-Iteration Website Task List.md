# Example — Five-Iteration Website Task List

**Classification:** Non-normative example — illustrative execution-roadmap pattern for a marketing-style static-to-CMS website.

This document is an example, not a required lifecycle artifact, not a complete TD-001 output, and not a substitute for project-specific scope, architecture, security review, traceability, or approval evidence. Real projects must adapt it through the Development Plan (Template A-15), TD-001 or HG-001 when selected, `24. Traceability Rules.md`, and approved AuthN/AuthZ/session/security patterns.

**Lifecycle placement**

| Phase | Role |
| --- | --- |
| **Phase 6 — Planning and Scope Control** | Scope iterations, milestones, and acceptance criteria; align with **TD-001** (`Agnostic Execution Decomposition — Create Tasks List Procedure.md`) if you formalize `tasks_list.md`. |
| **Phase 8 — Development Preparation** | Refine this example into the selected execution model, link it from the Development Plan (Template A-15), add traceability fields, and confirm environment/security/testing readiness before Phase 9. |
| **Phase 9 — Implementation** | Carry out the sequenced work; treat each iteration’s deliverables as implementation acceptance checkpoints. |

This document preserves **iteration structure**, **milestone breakdown**, **task sequencing**, **deliverables**, and **acceptance-oriented outputs**. Tutorial step-by-step prose, conversational phrasing, duplicate sections, and decorative markers from the source draft are removed.

**Placeholders:** Replace `[Brand]`, `[Domain]`, API keys, and IDs with project-specific values.

**Security:** Examples that show JWT in `localStorage`, hardcoded credentials, or public CMS tokens in front-end code are **illustrative only**. They are not production-ready auth architecture. Production systems MUST follow approved AuthN/AuthZ/session/security standards (server-side validation, least privilege, secrets server-side or managed, HttpOnly cookies where applicable, secure token lifecycle, rate limiting, auditability). Replace demo patterns before G8/G9 release/deployment approval.

---

## Document conventions

- **Iteration:** Capability band (maps to TD-001 “iteration” conceptually, not necessarily five TD-001 files).
- **Milestone:** Verifiable outcome for that iteration.
- **Work packages:** Lettered groups (A, B, …) — decompose further into atomic tasks during sprint planning.
- **TD-001 note:** This example does not use the strict TD-001 hierarchy (`Iteration -> Phase -> Milestone -> PowerTask -> Task`). If used as a formal `tasks_list.md`, convert lettered work packages into TD-001 phases, PowerTasks, and atomic tasks.
- **Traceability note:** Add stable requirement, feature, design, test, and source-artifact links in the Development Plan or `tasks_board.json` per `24. Traceability Rules.md`.

---

## Summary

| Iteration | Milestone theme | Outcome |
| --- | --- | --- |
| **1** | Static site foundation | Deployed static site: pages, navigation, responsive layout, placeholder content |
| **2** | Interactive and SEO basics | Working contact pipeline, validation, analytics hooks, SEO metadata, sitemap |
| **3** | Authentication and admin foundation | Login, admin role, protected admin surface, basic hardening |
| **4** | Dynamic content / CMS | CMS-backed services and about (or equivalent headless content) |
| **5** | Platform expansion | Blog, search, CRM handoff, structured data, privacy/cookie compliance |

---

## Iteration 1 — Static site foundation

**Milestone 1 — Static site foundation**

### A. Repository and pages

- Create project folder; initialize Git; add `.gitignore` (e.g. `node_modules/`, OS junk); initial commit.
- Add HTML pages: `index.html`, `about.html`, `services.html`, `contact.html`, `privacy-policy.html`.
- Each file: HTML5 skeleton, `lang`, charset, viewport meta, page-specific `<title>` (pattern: `Page — [Brand]`).
- Optional: link `styles.css` in `<head>` for later.

**Acceptance:** Repository exists; all listed files present with valid minimal document structure.

### B. Site-wide navigation

- Header `<nav>`: links to Home, About, Services, Contact (relative URLs; consistent casing).
- Footer: Privacy Policy link, copyright line (year `[YYYY]`, brand name).
- Same header/footer pattern on every page; manual click-through confirms internal links.

**Acceptance:** Navigation and footer consistent; no broken internal links on static preview.

### C. Responsive layout

- Add Tailwind via CDN in `<head>` for early iterations (or team-approved CSS approach):

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet">
```

- Wrap main content in a constrained container (e.g. `max-w-7xl mx-auto px-4`).
- Header: flex layout; optional `hidden md:flex` for horizontal nav on larger breakpoints.
- Content sections: responsive grid/flex (e.g. single column mobile, two columns `md+`).
- Verify layouts at representative widths (desktop, tablet, mobile) via devtools device mode.

**Acceptance:** Layout usable at mobile and desktop breakpoints; no horizontal overflow on sample pages.

### D. Placeholder content

- Services: “Coming Soon” (or equivalent) message in main content area.
- About, Contact intro, Privacy: placeholder copy (lorem or draft legal placeholder until legal review).
- Home: hero headline, short subcopy, primary CTA linking to `about.html` or `contact.html`.
- Styled CTA buttons (primary/secondary as needed); links may be internal.

**Acceptance:** Every route shows intentional placeholder or draft content; CTAs visible and linked.

### Iteration 1 deliverable

A **deployable static site** (local or hosted): full page set, working navigation, responsive shell, placeholder copy. Optional: connect hosting (Netlify, Vercel, static bucket) in the same iteration or start of Iteration 2.

---

## Iteration 2 — Interactive and SEO basics

**Milestone 2 — Interactive and SEO basics**

### A. Functional contact form

- Fields: Name (required), Email (required), Subject (optional), Message (required); labels associated with inputs (`for` / `id`).
- HTML5 validation: `required`, `type="email"` on email.
- Serverless-friendly POST: e.g. Netlify Forms (`name`, `method="POST"`, `data-netlify="true"`, hidden `form-name`) **or** POST to an approved API/Lambda endpoint; do not commit secrets to the repo.
- Deploy to staging; submit test message; confirm receipt (Netlify UI, email, or backend logs).
- Optional: thank-you page or success message pattern.

**Acceptance:** Valid submissions succeed on staging; invalid submissions blocked at browser; handling path verified.

### B. Client-side validation enhancement

- Optional JS layer: on submit, validate non-empty text, email `validity.valid`, show inline error nodes (e.g. under fields), `preventDefault` when invalid.
- Clear errors on resubmit.

**Acceptance:** Invalid submits do not POST; errors are visible and readable.

### C. Analytics (example: GA4)

- Create GA4 property; obtain Measurement ID `G-XXXX`.
- Add gtag snippet to all pages’ `<head>` (load script async, `gtag('config', 'G-XXXX')`).
- Fire custom events for primary CTAs (`gtag('event', 'cta_click', { … })`) and after successful validation path for contact (`form_submit` or equivalent), without breaking Netlify/default POST behavior (order: validate → event → native submit, per integration constraints).

**Acceptance:** DebugView or real-time shows page views and test events on staging.

### D. Performance and images

- Add `loading="lazy"` to non-critical images; optimize hero assets (dimensions, compression, WebP where appropriate).
- Target reasonable byte budgets for hero vs icons (set per project).

**Acceptance:** Lazy loading present; large images replaced or compressed per budget.

### E. SEO metadata and sitemap

- Unique `<title>` and `<meta name="description">` per page; sensible length limits (titles roughly under ~60 chars, descriptions ~150–160 chars — adjust per SEO practice).
- `sitemap.xml` listing canonical URLs for all public routes.
- Submit sitemap in Google Search Console (property verified).

**Acceptance:** Rich snippets basics satisfied at draft level; sitemap submitted without errors.

### Iteration 2 deliverable

**Interactive public site** with working contact path, SEO basics, analytics events, and performance hygiene on staging/production URL.

---

## Iteration 3 — Authentication and admin foundation

**Milestone 3 — Authentication setup**

**Warning:** Do not ship hardcoded production passwords or long-lived tokens in front-end code. Prefer server-issued **HttpOnly** session cookies, short-lived tokens, and secrets in environment/KMS per organizational standards. The checklist below keeps the **sequence** from the example; replace naive patterns before production.

### A. Authentication surface

- Add `login.html` with email + password fields (labels, `required`, appropriate `type`).
- Backend or serverless **login** endpoint: validate credentials server-side; issue session or token using approved mechanism; never embed real passwords in source.
- Front-end: submit to API; on success, follow approved session pattern (avoid `localStorage` for bearer tokens in production unless explicitly accepted risk).

**Acceptance:** Login succeeds for test account in controlled environment; failures do not leak whether email exists (generic error message).

### B. Admin role

- Represent role in token/session claims server-side (`admin` or RBAC equivalent).
- Avoid trusting client-only role flags for authorization.

**Acceptance:** Server validates role for admin actions.

### C. Protected admin pages

- `admin-dashboard.html` (or app route): server-side or edge check **or** temporary client gate only for prototyping — production must enforce on server.
- Logout clears session per design (cookie cleared or token invalidated server-side).

**Acceptance:** Unauthenticated users cannot perform admin actions on production architecture.

### D. Security hygiene

- Client trim/sanitize display-risk inputs where applicable; **always** revalidate on server.
- Contact form: optional honeypot field (hidden); reject if filled.
- Rate limiting and CAPTCHA: plan per abuse risk (later iteration if not now).

**Acceptance:** Documented threat assumptions; server validates all writes.

### Iteration 3 deliverable

**Authenticated admin path** with protected admin entry and logout, aligned to your AuthN policy for anything beyond a disposable prototype.

---

## Iteration 4 — Dynamic content (CMS)

**Milestone 4 — Dynamic content enablement**

### A. CMS setup (example: Contentful or Strapi)

- Define content models: Home hero (title, subtitle, image), About (title, bio, mission, highlights), Service (name, description, media).
- Create API credentials; **never expose management tokens** in client bundles — use public Delivery API keys only for read-only public content, or proxy via backend if keys must stay secret.

**Acceptance:** Published entries exist for smoke testing.

### B. Services page — dynamic

- Container DOM node for injected cards.
- Fetch services from CMS; render cards; empty state: “Coming Soon” message.
- Handle API errors gracefully (user-visible fallback, log details server-side only).

**Acceptance:** Published services appear; empty CMS shows fallback; errors do not crash page.

### C. About page — dynamic

- Map CMS fields into heading, bio, mission, highlights (rich text rendering per CMS SDK or sanitized HTML policy).

**Acceptance:** Editing published About entry updates site after refresh/deploy cycle per architecture.

### D. Admin workflow

- Dashboard link to CMS admin UI (correct space/environment URL).
- Short internal doc for editors: edit About, add Services, publish.

**Acceptance:** Non-developer can update copy via CMS following the doc.

### Iteration 4 deliverable

**CMS-driven** core marketing pages with documented editorial workflow.

---

## Iteration 5 — Full platform expansion

**Milestone 5 — Full platform expansion**

### A. Blog

- CMS model: Blog Post (title, slug, excerpt, body, featured image, publish date).
- `blog.html`: list posts sorted by date; `blog-post.html` resolves post by slug query param or path strategy your stack supports.
- 404 or friendly empty state for unknown slug.

**Acceptance:** Create/publish post in CMS; appears in list and detail view.

### B. Search

- Search input on blog (and services if required).
- Client-side filter over fetched list **or** server/search API if dataset grows.

**Acceptance:** Typing filters visible posts without full reload (for client-side approach).

### C. CRM integration (example: HubSpot)

- Replace or augment contact form with vendor embed **or** server-side sync to CRM; align with data processing agreements.
- Workflow: thank-you email / automation per CRM capabilities.

**Acceptance:** Test lead appears in CRM with correct fields.

### D. Structured data (JSON-LD)

- `Organization` (and related types) on home; `Service` on services; `BlogPosting` on posts — match visible content; validate.

**Acceptance:** Rich Results Test passes for sampled URLs (fix errors).

### E. GDPR-oriented consent (example pattern)

- Cookie consent banner; link to `cookie-policy.html`.
- Load non-essential analytics/marketing scripts **after** consent per legal guidance (configure vendor SDK accordingly).
- Privacy/cookie copy reviewed by responsible party (legal/privacy).

**Acceptance:** Banner works; policy pages linked; tracking gated as designed.

### Iteration 5 deliverable

**Marketing-ready platform**: blog, search, lead routing, structured SEO data, and consent/privacy artifacts subject to legal review.

---

## Cross-iteration acceptance (quick checklist)

| Iteration | Sign-off when |
| --- | --- |
| 1 | Static deploy; nav; responsive smoke test; placeholders |
| 2 | Contact pipeline verified; GA events smoke-tested; sitemap in GSC |
| 3 | Auth and admin protection match agreed threat model (not only demo hacks) |
| 4 | CMS publish cycle verified end-to-end |
| 5 | Blog + CRM + JSON-LD + consent reviewed for launch |

---

## Related documents

- `Agnostic Execution Decomposition — Create Tasks List Procedure.md` (TD-001) — formal hierarchy for machine- or human-ready task boards.
- `12. Phase 6 — Planning and Scope Control.md`
- `14. Phase 8 — Development Preparation.md`
- `15. Phase 9 — Implementation.md`
- `22. Required Documents.md`
- `24. Traceability Rules.md`
- `28. Appendix A — Template Library.md` — Template A-15 Development Plan.

---

## Revision history (procedure)

| Version | Notes |
| --- | --- |
| 1.0 | Merged from working notes; deduplicated Iteration 5; removed conversational filler; examples dated for 2026 context where relevant |
