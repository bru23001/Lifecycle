# ADR-003 — Server Actions for mutations

## Status

Accepted

## Context

Next.js App Router with co-located server logic.

## Decision

Gate decisions, artifact saves, approvals, and settings mutations are implemented as **server actions** under `app/actions/` with Prisma and audit logging.

## Consequences

- Clear server boundary; fewer REST routes to secure.
- Client components call actions directly; testing focuses on action + domain modules.
