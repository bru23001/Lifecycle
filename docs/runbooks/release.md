# Runbook — Release (solo-local)

## Preconditions

- `DATABASE_URL` set (see `.env.example`).
- `npm install` completed.

## Command

```bash
cd lifecycle-platform
npm run pre-release
```

## What runs

1. `validate` — lint, typecheck, production build.
2. `check-templates` — registry structural validation (strict-default warnings are INFO via `--strict-forms-expected`).
3. `backup` — `vault/backups/<timestamp>/` with `dev.db`, `vault-copy/`, `manifest.json`, checksum (skipped if `SKIP_BACKUP=1` or `PRE_RELEASE_FAST=1`).
4. `migrate-deploy` — Prisma migrations (skipped if `PRE_RELEASE_FAST=1`).
5. `seed` / `seed-smoke` / `data-integrity-check`.
6. `route-smoke` — HTTP checks against ephemeral `next start` (skipped if `SKIP_ROUTE_SMOKE=1` or `PRE_RELEASE_FAST=1`).
7. `release-snapshot` — writes `vault/releases/<timestamp>/` summary (skipped if `SKIP_RELEASE_SNAPSHOT=1` or `PRE_RELEASE_FAST=1`).

## Fast mode

```bash
PRE_RELEASE_FAST=1 npm run pre-release
```

## Environment flags

| Variable | Effect |
|----------|--------|
| `PRE_RELEASE_FAST=1` | Skips migrate, route smoke, release snapshot, backup. |
| `SKIP_ROUTE_SMOKE=1` | Skips HTTP smoke. |
| `SKIP_BACKUP=1` | Skips backup step. |
| `SMOKE_PORT` | Port for `next start` during smoke (default `3010`). |

## Tagging

After a green `npm run pre-release`, tag the repo (e.g. `git tag v1.0.0`) from the git root that contains `lifecycle-platform/`.
