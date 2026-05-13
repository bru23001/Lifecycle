# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] — 2026-05-12

### Added

- Structured JSON logging (`lib/server/logger.ts`, `pino`) and gate / approval audit hooks.
- HTTP `X-Request-ID` on responses and in-process Prometheus-style metrics (`middleware.ts`, `lib/server/metrics.ts`, `app/api/metrics`).
- Health endpoint `GET /api/healthz` (DB + vault directory checks).
- Backup / restore scripts (`scripts/backup.ts`, `scripts/restore.ts`) and pre-release backup step.
- Vitest suite with coverage thresholds on core domain modules (`vitest.config.ts`, `*.test.ts`).
- CI workflow at repository root (`.github/workflows/lifecycle-platform-ci.yml`) targeting `lifecycle-platform/`.
- Runbooks under `docs/runbooks/` and ADRs under `docs/adr/`.
- `Approval.status` value **`superseded`** for superseded artifact approvals (replaces incorrect `approved` overload).
- Structured **G3** waiver support via `applicabilityJson.waiverGranted` (`lib/waiver.ts`) with legacy A-3.1 text fallback.
- Template **`maturity: "scaffold"`** for late-gate scaffolds and UI badge in Template Wizard.
- `recordApprovalDecision` server action for **artifact** approvals from the Approval Center.

### Changed

- Home route `/` redirects to `/dashboard` (canonical dashboard URL).
- `check-templates` defaults to `--strict-forms-expected` in npm script (INFO instead of WARN for expected empty-default schema misses).
- Dashboard removes demo “Blocked” row injection; `createProject` sets `ownerId` to the solo user.

### Fixed

- Approval Center breadcrumbs and gate review deep links; gate reviews remain **formal** via Gate Review screen.
