# Refactoring Evaluation Checklist

**Classification:** Keep — refactoring **decision** checklist (factors: complexity, coupling, readability, maintainability, testing, standards, release readiness, recurring defects).

**Procedure ID:** REF-001

**Lifecycle placement**

| Phase | Role |
| --- | --- |
| **Phase 9 — Implementation** | Gate refactors and incremental cleanups during feature work; align complexity and style with standards before merge. |
| **Phase 13 — Maintenance and Improvement** | Structure perfective maintenance (readability, performance, debt reduction) and preventive changes with consistent criteria. |

**Gate context:** REF-001 does not own a standalone Master Lifecycle gate. It supports **G7 — Testing Passed** by keeping implementation refactors behavior-preserving and testable, and supports **G10 — Maintenance Review Completed** when refactoring is part of maintenance, technical debt reduction, or preventive improvement.

REF-001 does **not** replace change control. If behavior changes, baselined requirements/designs are affected, or release risk changes materially, route the work through `26. Change Control.md` as a functional or maintenance change.

---

## 1. Purpose

Provide a repeatable lens for deciding **when** and **how** to refactor: reduce risk before change, improve observable quality attributes, and document rationale when behavior-preserving edits are large.

Refactoring here means **behavior-preserving** structural improvement unless a change request explicitly alters functionality.

Refactoring is **ongoing**: revisit decisions as the codebase, team, and risk profile change—not only at milestones.

---

## 2. Dimensions to evaluate

### 2.1 Complexity

| Signal | Direction |
| --- | --- |
| High cyclomatic complexity (deep nesting, many branches) | Split logic; extract functions; prefer guard clauses over nested `if`. |
| Tight coupling between modules | Introduce interfaces or events; move shared types to neutral layers; see **MOD-001** (`Principles of Modularization.md`). |
| Oversized functions or classes | Decompose by responsibility; align with single-purpose units testable in isolation. |

### 2.2 Readability

| Signal | Direction |
| --- | --- |
| Unclear identifiers | Rename for intent (`calculateInvoiceTotal` vs `calc`). |
| Missing context where non-obvious | Prefer clear structure first; add concise comments only for invariant, domain, or safety rationale (avoid comment-free opaque logic). |
| Inconsistent formatting or conventions | Enforce formatter and linter (team ESLint/Prettier or equivalent); align with secure coding policy. |

### 2.3 Maintainability

| Signal | Direction |
| --- | --- |
| Repeated defects in one area | Refactor after root-cause analysis; add regression tests first when feasible. |
| Hard to extend without touching many files | Revisit boundaries (MOD-001); reduce fan-out; clarify extension points. |
| Accumulated technical debt | Schedule debt items; tie to risk (security, reliability, velocity). |

### 2.4 Performance

- Refactoring may **combine** with perf work when profiling shows hot paths; otherwise keep behavior-stable edits separate from algorithm changes when practical.
- Prefer measured optimization (profiles, benchmarks) over speculative micro-tuning.

### 2.5 Team context

- **Larger teams:** Stronger emphasis on naming consistency, patterns, and review checklists to limit integration friction.
- **Less experienced teams:** Smaller, reviewed steps; pair or mentor on boundary design; refactor early when complexity blocks testing.

---

## 3. Guiding questions (quick pass)

Answer yes/no or short note:

1. Is the code easy to understand without tribal knowledge?
2. Can it be changed with low risk of regressions (tests, types, narrow surface)?
3. Is duplicated logic identifiable and eligible for consolidation (**DRY**—without forcing premature abstraction)?
4. Are automated tests sufficient for the refactor scope (existing + new cases)?
5. Does the change respect project coding standards and security rules (secrets, injection, authz)?

Mirror checks from stakeholder perspective:

- Is the code **easy to understand**?
- Is the code **easy to change** safely?
- Is the code **well-tested** for the behaviors being touched?

---

## 4. When to prioritize refactoring

Strong triggers—schedule or expedite refactor **before** large dependent changes when:

- **Significant new features** are planned that would extend brittle or tightly coupled areas.
- **Release or deployment** preparation requires stabilizing critical paths, reducing complexity, or clearing known debt in touched modules.
- **Recurring bugs** or elusive defects point to structural confusion, duplication, or unclear boundaries (fix root cause via structure when appropriate).

Smaller cleanups can remain incremental; use Section 5 for batch size and risk control.

---

## 5. Scope control

- Prefer **small, reviewable** PRs for refactors touching critical paths.
- When behavior must change, label it as **functional change**, not refactor-only, and include requirements/trace links.
- Record notable refactor rationale in PR description or change log for maintenance traceability.

---

## 6. Completion Criteria

REF-001 is satisfied for a non-trivial refactor when:

- Refactor rationale and scope are recorded.
- Behavior-preservation evidence is identified, such as existing tests, new regression tests, snapshots, golden outputs, or review notes.
- Changed modules, dependencies, and coupling risks are named.
- Any functional change or baseline impact is routed through change control.
- Traceability, implementation records, or maintenance backlog notes are updated where the lifecycle requires them.

---

## 7. Related documents

- `15. Phase 9 — Implementation.md`
- `16. Phase 10 — Testing and Validation.md`
- `19. Phase 13 — Maintenance and Improvement.md`
- `Principles of Modularization.md` (MOD-001)
- `Pseudocode to Code Conversion Guidelines.md` — when aligning implementation back to documented intent.
- `Unit Test and Pseudocode Writing Guidelines.md` — unit/regression tests for behavior preservation.
- `24. Traceability Rules.md` — implementation, defect, design, and test traceability.
- `25. Quality and Compliance Checks.md` — quality expectations for implementation and maintenance.
- `26. Change Control.md` — route behavior-changing or baseline-impacting work.
- Organizational secure coding and testing standards (for example CYBERCUBE STD-SEC-002 / 5.5 testing directives where adopted).

---

## Revision history

| Version | Notes |
| --- | --- |
| 1.1 | Merged “factors refactoring decisions” triggers and guiding questions |
| 1.0 | Canonical merge from working notes |
