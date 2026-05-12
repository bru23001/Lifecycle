# Runbook — Restore (solo-local)

## When to use

- Corrupt `dev.db` or missing tables after a bad migration experiment.
- Accidental deletion of `vault/` content that was captured in a backup.

## Prerequisites

- A backup folder created by `npm run pre-release` or `npx tsx scripts/backup.ts`, e.g. `vault/backups/2026-05-12T18-00-00-000Z/`.

## Steps

1. Stop the app (`next` processes).
2. From `lifecycle-platform/`:

   ```bash
   npx tsx scripts/restore.ts vault/backups/<timestamp-folder>
   ```

3. Verify:

   ```bash
   npx prisma migrate deploy
   npm run data-integrity-check
   npm run seed-smoke
   ```

4. Start the app: `npm run start` or `npm run dev`.

## Notes

- Restore **overwrites** the current `dev.db` (per `DATABASE_URL`) and merges `vault-copy` into `vault/`.
- Backups exclude `vault/backups` to avoid recursion; older backups on disk are not inside `vault-copy`.
