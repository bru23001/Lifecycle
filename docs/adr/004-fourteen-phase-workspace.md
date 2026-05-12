# ADR-004 — 14-phase workspace model

## Status

Accepted

## Context

Lifecycle workspace navigator and gate readiness must align on a single phase scale.

## Decision

`Project.currentPhase` uses **1–14** workspace milestones (`WORKSPACE_PHASES` in `lib/workspacePhases.ts`). Gate readiness and dashboard progress derive from this model and `lib/gateStatus.ts`.

## Consequences

- Any UI showing `/9` or legacy 9-phase assumptions is invalid (regression-tested via `workspacePhaseProgressPercent`).
