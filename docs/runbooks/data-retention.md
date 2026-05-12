# Runbook — Data retention (solo-local)

## Scope

SQLite database (`dev.db` per `DATABASE_URL`) and `vault/` exports (markdown, JSON evidence, backups, release snapshots).

## Retention (defaults)

| Artifact | Retention |
|----------|-----------|
| `vault/releases/*` | Keep for audit trail; prune manually if disk is tight. |
| `vault/backups/*` | Keep last N backups (e.g. 14 daily); delete older folders manually. |
| Application logs | stdout / JSON to terminal or process manager; rotate externally if needed. |

## Legal hold

Solo-local: if a hold applies, **do not** run `scripts/restore.ts` or delete backup folders until cleared.

## Related

- `docs/runbooks/release.md` — snapshots written on pre-release.
- CYBERCUBE Records Management (3.8) — apply when moving beyond solo-local.
