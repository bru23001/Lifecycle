# E2E Lifecycle Test Runbook

Playwright suite proving the 14-phase workspace model and gates **G1–G10** for the dedicated project `e2e-lifecycle`.

## Prerequisites

- Node.js and `npm install` in `lifecycle-platform/`
- Chromium: `npm run test:e2e:install`
- Isolated DB (default `file:./e2e.db`) — do not point at production data

## Commands

| Command | Purpose |
|---------|---------|
| `npm run seed:e2e-lifecycle` | Reset seed data for `e2e-lifecycle` only |
| `npm run test:e2e` | Full suite (global setup + build + `next start` on port **3011**) |
| `npm run test:e2e:headed` | Debug with visible browser |
| `npm run test:e2e:ci` | CI mode (retries, traces on failure) |
| `npm run ci:e2e` | Build + CI Playwright (used by `npm run ci`) |

## Environment

| Variable | Default | Notes |
|----------|---------|-------|
| `E2E_DATABASE_URL` | `file:./e2e.db` | SQLite for E2E |
| `E2E_PORT` | `3011` | App port during tests |
| `PLAYWRIGHT_BASE_URL` | `http://127.0.0.1:3011` | Override base URL |
| `CI` | — | Enables retries and trace retention |

## Suite layout

- `e2e/smoke.spec.ts` — healthz + dashboard
- `e2e/01-gate-review-ui.spec.ts` — G1 acceptance through Gate Review UI
- `e2e/02-lifecycle-happy-path.spec.ts` — serial G1→G10 via `recordGateReviewForE2e` (phase anchors between gates)
- `e2e/03-gate-negative-matrix.spec.ts` — per-gate evidence/prerequisite guards
- `e2e/04-downstream-verification.spec.ts` — approvals, audit, reports, exports after full run

## Concurrency and reset

- **Workers:** 1 (serial) — mutating lifecycle specs share one project slug
- **Reset:** `lifecycle-test` fixture calls `seedE2eLifecycleProject({ reset: true })` per test file/describe as configured
- **Global setup:** migrate + platform seed + E2E lifecycle seed

## Failure triage

1. **Seed / gate evaluation** — run `npm run seed:e2e-lifecycle`; fix failing template payload in `e2e/support/artifact-payloads.ts`
2. **Locator drift** — prefer `data-testid="gate-decision-approve"`; update `e2e/support/gate-helpers.ts`
3. **Timeout on full journey** — run single gate via `npx playwright test -g "G3"` after seed
4. **Port in use** — set `E2E_PORT=3021`
5. **Artifacts** — `playwright-report/` and `test-results/` after CI failures

## Selector contracts

- `gate-decision-approve` — primary approve control on Gate Review
- Add new `data-testid` values when gate UI changes; avoid class-only selectors

## Release layering

- **`npm run ci`** — Vitest + migrate + seed checks + **`ci:e2e`**
- **`npm run pre-release`** — still runs `route-smoke` (broad GET coverage); Playwright is the deep behavioral gate
