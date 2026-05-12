# ADR-002 — SQLite for solo-local persistence

## Status

Accepted

## Context

Local-first delivery with minimal ops overhead.

## Decision

Use Prisma + SQLite (`DATABASE_URL=file:./dev.db`) for the solo tier.

## Consequences

- Simple backup/restore via file copy (`scripts/backup.ts` / `scripts/restore.ts`).
- Concurrent multi-writer scaling is out of scope; Postgres migration is a future tier.
