# ADR-001 — Solo workspace identity (no interactive auth)

## Status

Accepted

## Context

The platform is used as a single-user local workspace for lifecycle documentation and gate evidence.

## Decision

Identity is the seeded `User` row (`solo@local.test`). Server actions use `requireCurrentUser()` / `getCurrentUser()` without OAuth or sessions.

## Consequences

- No per-request tenant isolation (see ADR-002 for data scope).
- Upgrading to multi-user requires an auth boundary and session model.
