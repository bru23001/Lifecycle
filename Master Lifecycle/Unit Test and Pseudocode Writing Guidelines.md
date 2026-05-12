# Unit Test and Pseudocode Writing Guidelines

**Classification:** Keep — standalone unit-test and pseudocode testing guideline aligned with the official test strategy (USSM Section 7, Phase 10).

**Procedure ID:** UTP-001.

**Applies to:** Phase 8 — Development Preparation (test placement, pseudocode-driven tests) · Phase 10 — Testing and Validation · Phase 9 when tests accompany implementation.

**Gate context:** Supports **G6 — Development Ready** when unit-test placement, initial test setup, or pseudocode-driven test planning is part of preparation. Supports **G7 — Testing Passed** when unit-test evidence contributes to validation.

UTP-001 does **not** replace Test Strategy (Template A-16), QA Results (Template A-18), Validation Sign-Off (Template A-20), USSM Section 7, or P2C-001. It supplies hands-on unit-test discipline used by those artifacts and phases.

**Companion documents**

- **`Pseudocode to Code Conversion Guidelines.md`** — authoritative pseudocode format, per-file separation, and translation to code (avoid duplicating construct catalogs here).
- **`USSM — Unified Software Standards Manual v1.0.md`** (Section 7) — normative test levels, traceability to CRS/SRS, CI gates.

---

## 1. Purpose

Unify **how** teams write unit tests and **how** pseudocode ties to those tests: same vocabulary as USSM Phase 10, with concrete practices (AAA, isolation, determinism, security-aware checks) and an explicit **write code → write tests from pseudocode → run tests** loop.

---

## 2. Unit testing principles

These practices implement USSM testing expectations at the **unit** level; formal test-case IDs and CRS linkage remain per USSM Section 7.4.

| # | Principle | Practice |
| --- | --- | --- |
| 1 | Single focus | One unit test exercises one behavior; when it fails, the cause is obvious. Use targeted debugging output only where it aids diagnosis (avoid noisy logs in CI). |
| 2 | Arrange–Act–Assert | **Arrange** preconditions and inputs · **Act** on the unit under test · **Assert** expected outcomes. |
| 3 | Independence | Tests run in any order without shared mutable state; no hidden coupling between cases. |
| 4 | Readable | Clear names for tests and variables; intent obvious without reading implementation. |
| 5 | Fast | Unit tests stay quick so developers run them often and CI stays within budgets. |
| 6 | Mock externals | Prefer mocks/fakes for databases, HTTP, filesystem, clocks, and RNG unless an integration test owns that boundary. |
| 7 | Automation | Tests run in CI on every relevant commit or PR per quality gates (USSM Section 7.5). |
| 8 | Edge cases | Empty inputs, boundaries, errors, and unlikely branches—not only happy paths. |
| 9 | Deterministic | Same inputs yield same results; control time, randomness, and concurrency; fix or quarantine flakes per team SLAs. |
| 10 | Descriptive names | Names state scenario and expectation (e.g. `rejects_negative_quantity` not `test_cart`). |
| 11 | Security-relevant checks | Where applicable, assert sanitization, rejection of injection payloads, and authz boundaries—aligned to secure coding policy. |
| 12 | Single-responsibility production code | Smaller units ease isolation; aligns with SRP in implementation. |
| 13 | Behavior over internals | Assert observable outcomes and contracts, not private layout—unless testing a deliberate invariant. |
| 14 | Test doubles | **Mocks** — verify calls · **Stubs** — canned responses · **Fakes** — working lightweight implementations. Choose per need; avoid over-mocking. |
| 15 | Repeatability | No reliance on ambient machine state; isolate or reset resources between tests. |
| 16 | Complement integration tests | Unit tests do not replace integration/system tests; use both per pyramid (USSM Section 7.3). |

---

## 3. Pseudocode alignment

Full syntax rules, constructs, per-file layout, and blueprint trace fields are defined in **`Pseudocode to Code Conversion Guidelines.md`**. Operational reminders:

- Pseudocode must describe **complete** logic so implementation is line-by-line translation where possible; gaps use `UNKNOWN: _______`.
- **One pseudocode file per source file** (primary `SOURCE`) unless architecture explicitly bundles modules.
- Agree **detail level** before bulk authoring: detailed steps versus concise readable blocks.
- Open with **what** the unit does; optionally summarize after the pseudocode block.

When extracting or reviewing pseudocode, enforce the same discipline Phase 4 uses (`docs/blueprint/04-pseudocode-format-guidelines.md`).

---

## 4. Workflow — implementation file + unit test

Use this loop whenever pseudocode precedes or accompanies code (Blueprint Phases 6–7, Phase 8 prep, Phase 9 delivery):

1. Implement (or translate pseudocode to) the production module **FileUnderTest**.
2. **Write the unit test** for that module following Sections **2** and **team conventions for file placement** (e.g. co-located `*.test.ts`, `test/` mirror, or language-standard layout—record the choice in the test strategy).
3. Use the **pseudocode for FileUnderTest** as the behavioral checklist: each meaningful branch and error path should map to at least one assertion or dedicated test.
4. **Run** the new or updated tests locally; fix failures before merge; ensure CI executes the same suite.

Steps **34–36** from the source notes consolidate into this subsection.

---

## 5. Relationship to Phase 10 (official test strategy)

| USSM / lifecycle topic | Where addressed |
| --- | --- |
| Test levels, pyramid, ISO/IEEE alignment | USSM Section 7.3; Phase 10 introduction |
| Traceability CRS/SRS ↔ tests | USSM Section 7.4; project test plan |
| CI gates, coverage policy | USSM Section 7.5; CYBERCUBE testing directives as adopted |
| **Unit-test specifics** | **This document** Sections 2 and 4 |

Phase 10 remains the gate for validation breadth; this guideline ensures unit work **does not contradict** that strategy and fills operational detail USSM leaves to project standards.

---

## 6. Quality checklist

- [ ] New production units have tests aligned to pseudocode or spec acceptance criteria.  
- [ ] AAA structure visible; tests named descriptively; no order dependence.  
- [ ] External boundaries mocked or isolated at unit level; integration scenarios scheduled per plan.  
- [ ] Security-sensitive paths have explicit assertions where in scope.  
- [ ] Tests run locally and pass CI before merge.

---

## 7. Related Documents

| Document | Role |
| --- | --- |
| `14. Phase 8 — Development Preparation.md` | Test placement, initial setup, and pseudocode-driven test planning before implementation. |
| `15. Phase 9 — Implementation.md` | Unit tests accompany implementation work. |
| `16. Phase 10 — Testing and Validation.md` | Formal validation strategy and G7 evidence. |
| `21. Decision Gates.md` | G6/G7 evidence expectations. |
| `22. Required Documents.md` | Canonical procedure register. |
| `24. Traceability Rules.md` | Requirement, design, implementation, test, and defect traceability expectations. |
| `25. Quality and Compliance Checks.md` | Testing and implementation quality checks. |
| `28. Appendix A — Template Library.md` | Templates A-16, A-18, and A-20 for formal testing evidence. |
| `Pseudocode to Code Conversion Guidelines.md` | P2C-001 pseudocode format and translation standard. |
| `Refactoring Evaluation Checklist.md` | REF-001 regression evidence for behavior-preserving refactors. |

---

## Revision

Update when USSM Section 7 changes, when team test layout conventions change, or when blueprint pseudocode rules evolve (cross-check **`Pseudocode to Code Conversion Guidelines.md`**).
