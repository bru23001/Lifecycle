# Runbook — Incident response (solo-local)

## Severity

Default to **SEV-4 / operational** for this deployment (single user, local disk).

## Triage checklist

1. **Stop writes** — stop `next dev` / `next start` to avoid corrupting SQLite during investigation.
2. **Logs** — capture terminal output or JSON logs from the session (`LOG_LEVEL=debug` if needed).
3. **Integrity** — from `lifecycle-platform/`: `npm run data-integrity-check` and `npm run db-phase-sanity`.
4. **Restore** — if DB or vault is corrupt, use `docs/runbooks/restore.md` with the latest `vault/backups/<ts>/`.
5. **Re-run CI** — `npm run ci` after restore.

## Security note

No interactive auth in solo mode. If the host is compromised, treat **dev.db** as containing lifecycle metadata and exports as **internal** classification.

## Escalation

If customer or regulated data appears in the DB, stop solo-local use and migrate to the team/SaaS hardening plan.
