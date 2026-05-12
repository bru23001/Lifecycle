# Dirty Room / Clean Room Blueprint Design Template — BP-001-DRCR Variant

**Classification:** Keep — specialized dirty room / clean room blueprint variant for Phase 7 (Architecture and Design) and Phase 8 (Development Preparation). Preserves architecture mapping, domain extraction, pseudocode standards, traceability matrix, phased gates, consistency audit steps, and separation between source analysis and clean-room design.

| Field | Value |
| --- | --- |
| **Document ID** | BP-001-DRCR-BLUEPRINT |
| **Variant ID** | BP-001-DRCR |
| **Base Procedure** | BP-001 — `Universal Blueprint Extraction — BP-001 Procedure.md` |
| **Version** | 3.0 |
| **Status** | Active template |
| **Classification** | INTERNAL |
| **Traceability** | Enabled (Source Evidence -> Sanitized Spec -> Clean Design -> Implementation) |
| **Separation Model** | Dirty Room extraction + Clean Room design |

**Canonical relationship:** This document is a specialized variant of canonical **BP-001**, not a replacement and not a second canonical BP-001 procedure. Use it only when the project selects the dirty-room / clean-room model during Phase 7.

**Important:** Blueprint internal phases **1-10** in this document are **not** Master Lifecycle phase numbers. Typically:

| Blueprint phases | Master Lifecycle |
| --- | --- |
| **1-5** (dirty-room evidence and sanitized specification) | **Phase 7 — Architecture and Design** |
| **6-10** (clean-room design, pseudocode, matrix, audit) | **Phase 8 — Development Preparation** |

---

## 1. Purpose

Use this template to analyze a target codebase (`{{PROJECT_ROOT}}`, `{{PROJECT_NAME}}`) and produce a **modular, traceable, team-scalable blueprint** under `docs/blueprint/` while preserving a clean separation between:

1. **Dirty Room work:** source-facing discovery, evidence capture, behavior extraction, dependency mapping, and risk notes.
2. **Clean Room work:** source-independent design, pseudocode, implementation strategy, interface contracts, and rebuild-ready architecture.

Outputs are **Markdown** unless tooling agrees otherwise. The blueprint guides staged abstraction; it does not replace the Master Lifecycle or USSM documentation tiers.

---

## 2. Mission and Audience

**Mission:** Convert an entire software project, regardless of language, architecture, or domain, into a two-lane blueprint: a dirty-room evidence record and a clean-room design package that can support rebuild, migration, modernization, audit, or governance without exposing implementation code to the clean-room team.

**Audience:** Engineers, architects, product, QA, governance, operators, and AI-assisted contributors working under human approval gates.

**Output root:** `docs/blueprint/` (repository-relative).

---

## 3. Room Model

### 3.1 Dirty Room

The Dirty Room may inspect source code, existing documentation, runtime behavior, configuration, schemas, tests, and operational artifacts. Its job is to extract **facts, behavior, constraints, and risks** without copying proprietary implementation expression into clean-room artifacts.

Dirty Room outputs must be evidence-backed and must mark unknowns explicitly.

### 3.2 Clean Room

The Clean Room must not inspect original source code unless a formal waiver is approved. It consumes only sanitized specifications, behavior summaries, contracts, domain maps, and trace identifiers produced by the Dirty Room.

Clean Room outputs must be implementation-ready but source-independent.

### 3.3 Human Approval

Each phase requires explicit approval before the next phase begins:

```text
Approve Blueprint Phase {{n}} to proceed?
Approved by: {{APPROVER_NAME}}
Date: {{YYYY-MM-DD}}
Notes: {{NOTES_OR_NONE}}
```

---

## 4. Operating Rules (Non-Negotiable)

1. Run blueprint internal phases **1-10** in order unless a formal waiver records a different path.
2. Keep Dirty Room and Clean Room artifacts in separate folders.
3. Dirty Room contributors may access source; Clean Room contributors may access only sanitized artifacts.
4. Do not paste source code into clean-room artifacts.
5. Traceability is mandatory: every material clean-room requirement traces back to a Dirty Room evidence identifier.
6. If changes are requested, edit blueprint documents under `docs/blueprint/` first; do not modify application source unless separately approved.
7. Unknowns must be marked as **`UNKNOWN: _______`** and resolved or carried into the final review notes.
8. Do not invent APIs, behaviors, or business rules; infer only when evidence exists in source, docs, tests, runtime output, or stakeholder confirmation.
9. Prefer clarity over silent completeness; flag gaps, conflicts, and unverifiable behavior in review notes.
10. Any clean-room boundary breach must be recorded in the separation log and reviewed before continuing.

---

## 5. Output Conventions

All blueprint files must use:

- Numbered headings and subsections.
- Bullets and fenced code blocks where helpful.
- Sections for **Assumptions**, **Unknowns**, **Evidence**, and **Approval Notes**.
- Stable identifiers for evidence, requirements, features, modules, pseudocode, contracts, and decisions.

### 5.1 Identifier Conventions

| ID type | Format | Example |
| --- | --- | --- |
| Evidence | `EVID-###` | `EVID-042` |
| Requirement | `REQ-###` | `REQ-017` |
| Feature | `FEAT-###` | `FEAT-009` |
| Domain | `DOM-###` | `DOM-003` |
| Module | `MOD-###` | `MOD-011` |
| Interface contract | `CONTRACT-###` | `CONTRACT-004` |
| Pseudocode | `PSEUDO-###` | `PSEUDO-026` |
| Decision | `DEC-###` | `DEC-006` |
| Room separation issue | `SEP-###` | `SEP-002` |

### 5.2 Evidence Rules

Dirty Room artifacts may cite source paths, runtime commands, tests, configuration files, schemas, and screenshots. Clean Room artifacts must cite only sanitized evidence IDs and sanitized artifact paths.

Examples:

```text
Dirty Room evidence:
EVID-014
SOURCE: /src/services/authService.ts
CLAIM: User login validates credentials before issuing a session.
CONFIDENCE: High

Clean Room reference:
Derived from: EVID-014, REQ-003, CONTRACT-002
Source code not consulted by Clean Room.
```

---

## 6. Artifact Index

| BP phase | Room | Primary outputs |
| --- | --- | --- |
| **1** | Dirty | `docs/blueprint/dirty-room/01-source-inventory-and-boundaries.md` |
| **2** | Dirty | `docs/blueprint/dirty-room/02-behavior-and-domain-extraction.md` |
| **3** | Dirty | `docs/blueprint/dirty-room/03-evidence-register-and-risk-notes.md` |
| **4** | Dirty -> Clean handoff | `docs/blueprint/handoff/04-sanitized-functional-spec.md`, `docs/blueprint/handoff/04-clean-room-briefing.md` |
| **5** | Clean | `docs/blueprint/clean-room/05-clean-architecture-and-domain-model.md` |
| **6** | Clean | `docs/blueprint/clean-room/06-interface-contracts-and-data-models.md` |
| **7** | Clean | `docs/blueprint/clean-room/07-pseudocode-format-guidelines.md` |
| **8** | Clean | `docs/blueprint/clean-room/08-backend-and-frontend-pseudocode/`, `docs/blueprint/clean-room/08-pseudocode-summary.md` |
| **9** | Clean + Governance | `docs/blueprint/09-traceability-matrix.md` |
| **10** | Governance | `docs/blueprint/10-01-glossary.md`, `docs/blueprint/10-02-final-review-notes.md`, `docs/blueprint/10-03-room-separation-log.md` |

Supporting folders may include `docs/blueprint/templates/`, `docs/blueprint/diagrams/`, and `docs/blueprint/integrations/` as needed.

---

## 7. Blueprint Phase 1 — Dirty Room Source Inventory and Boundaries

**Room:** Dirty Room

**Goal:** Map source access scope, architecture boundaries, modules, dependencies, and ownership zones.

**Output:** `docs/blueprint/dirty-room/01-source-inventory-and-boundaries.md`

**Steps**

1. Record target project metadata: `{{PROJECT_NAME}}`, `{{PROJECT_ROOT}}`, repository state, language stack, framework stack, and runtime assumptions.
2. Audit and map codebase directory structure.
3. Identify source files, documentation files, configuration, schemas, tests, generated files, assets, deployment files, and integration points.
4. Label boundaries across UI, backend services, shared utilities, domain, infrastructure, data, integrations, jobs, and operational tooling.
5. Detect architecture style, such as monolith, modular monolith, microservices, layered, hexagonal, clean architecture, event-driven, serverless, or hybrid.
6. Create a component inventory list using stable IDs, such as `MOD-001`, `MOD-002`, and `CONTRACT-001`.
7. Record dependency graph at package, module, service, and external-integration levels where applicable.
8. Identify source areas that are excluded, generated, unavailable, or out of scope.

**Template sections**

```text
# 01 Source Inventory and Boundaries

## 1. Project Metadata
## 2. Source Scope
## 3. Directory and Module Inventory
## 4. Architecture Style
## 5. Dependency Map
## 6. Boundary Map
## 7. Exclusions and Unknowns
## 8. Evidence
## 9. Approval Notes
```

**Gate:** Architecture boundary map and source inventory validated -> **stop for approval.**

---

## 8. Blueprint Phase 2 — Dirty Room Behavior and Domain Extraction

**Room:** Dirty Room

**Goal:** Extract observable behavior, domain concepts, bounded contexts, feature flows, and source-backed business rules.

**Output:** `docs/blueprint/dirty-room/02-behavior-and-domain-extraction.md`

**Steps**

1. Identify core system functionalities, such as auth, user management, billing, reporting, messaging, imports, exports, notifications, or administration.
2. Group features by domain or bounded context.
3. Trace feature entry points, such as UI action -> route/controller -> service -> data operation -> response.
4. Extract business rules, validations, error cases, state transitions, permission checks, data lifecycles, and integration behavior.
5. Record user-facing workflows and system-facing workflows separately.
6. Mark behavior confidence as High, Medium, or Low based on evidence quality.
7. Avoid implementation expression; describe behavior and intent rather than copying code structure.

**Template sections**

```text
# 02 Behavior and Domain Extraction

## 1. Domain Map
## 2. Feature Inventory
## 3. Workflow Summaries
## 4. Business Rules
## 5. Validation and Error Cases
## 6. State Transitions
## 7. Permissions and Security Notes
## 8. Integration Behavior
## 9. Evidence
## 10. Unknowns
## 11. Approval Notes
```

**Gate:** Domains, workflows, and behavior summaries confirmed -> **stop for approval.**

---

## 9. Blueprint Phase 3 — Dirty Room Evidence Register and Risk Notes

**Room:** Dirty Room

**Goal:** Create a governed evidence register and flag extraction risks before clean-room handoff.

**Output:** `docs/blueprint/dirty-room/03-evidence-register-and-risk-notes.md`

**Steps**

1. Assign an `EVID-###` identifier to each material source-backed claim.
2. Link evidence to features, domains, modules, contracts, business rules, and unknowns.
3. Capture source paths, test names, configuration files, runtime observations, database schemas, or documentation references.
4. Classify evidence confidence as High, Medium, or Low.
5. Identify areas where behavior is ambiguous, undocumented, inconsistent, or risky.
6. Identify security, privacy, data isolation, operational, and compliance-sensitive behavior for clean-room attention.
7. Prepare evidence that can be safely referenced without exposing source code.

**Evidence entry template**

```text
## EVID-###

Type: Source | Test | Runtime | Documentation | Schema | Config | Stakeholder
Source reference: {{SOURCE_PATH_OR_REFERENCE}}
Related IDs: {{REQ_ID}}, {{FEAT_ID}}, {{DOM_ID}}, {{MOD_ID}}
Claim: {{BEHAVIOR_OR_CONSTRAINT}}
Confidence: High | Medium | Low
Notes: {{NOTES}}
Clean-room safe summary: {{SANITIZED_SUMMARY}}
```

**Gate:** Evidence register complete enough for sanitized handoff -> **stop for approval.**

---

## 10. Blueprint Phase 4 — Dirty-to-Clean Handoff Package

**Room:** Dirty Room produces; Clean Room receives after approval.

**Goal:** Convert source-facing evidence into a clean-room-safe functional specification and briefing package.

**Outputs**

- `docs/blueprint/handoff/04-sanitized-functional-spec.md`
- `docs/blueprint/handoff/04-clean-room-briefing.md`

**Steps**

1. Convert behavior summaries into requirements, feature descriptions, domain definitions, and interface expectations.
2. Remove source code, source-specific algorithms, private implementation details, proprietary naming that is not externally visible, and file-path references not needed by the Clean Room.
3. Preserve traceability by referencing `EVID-###` identifiers.
4. Include explicit non-goals, unknowns, assumptions, constraints, and acceptance criteria.
5. Identify allowed references for the Clean Room.
6. Record any unresolved ambiguity and assign an owner for clarification.
7. Obtain approval that the handoff is source-independent enough for clean-room design.

**Sanitized spec template**

```text
# 04 Sanitized Functional Spec

## 1. Scope
## 2. Domains and Features
## 3. Functional Requirements
## 4. Non-Functional Requirements
## 5. Interface Expectations
## 6. Data Concepts
## 7. Workflow Summaries
## 8. Error and Recovery Behavior
## 9. Security, Privacy, and Compliance Constraints
## 10. Assumptions
## 11. Unknowns
## 12. Evidence Trace
## 13. Approval Notes
```

**Clean-room briefing template**

```text
# 04 Clean Room Briefing

## 1. Allowed Inputs
## 2. Prohibited Inputs
## 3. Design Goals
## 4. Architectural Constraints
## 5. Required Deliverables
## 6. Review Gates
## 7. Escalation Path for Unknowns
```

**Gate:** Handoff package approved and Clean Room access boundaries confirmed -> **stop for approval.**

---

## 11. Blueprint Phase 5 — Clean Room Architecture and Domain Model

**Room:** Clean Room

**Goal:** Produce a source-independent architecture and domain design based only on the approved handoff package.

**Output:** `docs/blueprint/clean-room/05-clean-architecture-and-domain-model.md`

**Steps**

1. Review only allowed clean-room inputs.
2. Define architecture style and rationale.
3. Define domains, bounded contexts, module boundaries, and responsibilities.
4. Create context, container, component, and sequence views where useful.
5. Define data ownership and lifecycle at the conceptual level.
6. Capture major design decisions as `DEC-###`.
7. Map each design element to `REQ-###`, `FEAT-###`, `DOM-###`, and sanitized `EVID-###` references.
8. Mark any design assumption that needs Dirty Room clarification.

**Template sections**

```text
# 05 Clean Architecture and Domain Model

## 1. Clean-Room Inputs Reviewed
## 2. Architecture Overview
## 3. Domain Model
## 4. Module Boundaries
## 5. Component Responsibilities
## 6. Data Ownership and Lifecycle
## 7. Architecture Decisions
## 8. Requirement Trace
## 9. Assumptions and Unknowns
## 10. Approval Notes
```

**Gate:** Clean architecture and domain model approved -> **stop for approval.**

---

## 12. Blueprint Phase 6 — Clean Room Interface Contracts and Data Models

**Room:** Clean Room

**Goal:** Define rebuild-ready contracts, schemas, events, commands, queries, and data models without source implementation details.

**Output:** `docs/blueprint/clean-room/06-interface-contracts-and-data-models.md`

**Steps**

1. Define public or internal API contracts from sanitized requirements.
2. Define request, response, event, command, query, and error shapes.
3. Define entity and value-object models at the conceptual or logical level.
4. Document validation rules and state transitions.
5. Identify integration contracts and dependency expectations.
6. Define security, authorization, tenancy, privacy, observability, and operational constraints.
7. Map each contract to requirements and evidence IDs.

**Contract template**

```text
## CONTRACT-###

Name: {{CONTRACT_NAME}}
Type: API | Event | Command | Query | UI Interaction | Data Model | Integration
Purpose: {{PURPOSE}}
Inputs: {{INPUTS}}
Outputs: {{OUTPUTS}}
Validation: {{VALIDATION_RULES}}
Errors: {{ERRORS}}
Security constraints: {{SECURITY_CONSTRAINTS}}
Related IDs: {{REQ_IDS}}, {{FEAT_IDS}}, {{DOM_IDS}}, {{EVID_IDS}}
Acceptance criteria: {{ACCEPTANCE_CRITERIA}}
```

**Gate:** Contracts and data models approved -> **stop for approval.**

---

## 13. Blueprint Phase 7 — Clean Room Pseudocode Format Guidelines

**Room:** Clean Room

**Goal:** Standardize pseudocode syntax, templates, and trace annotations for all downstream clean-room conversion.

**Output:** `docs/blueprint/clean-room/07-pseudocode-format-guidelines.md`

### 13.1 Mandatory Skeleton

```text
PSEUDO-ID: PSEUDO-###
DERIVED FROM: REQ-###, FEAT-###, CONTRACT-###, EVID-###
DOMAIN: {{DOMAIN_NAME}}
MODULE: {{MODULE_ID_AND_NAME}}

FUNCTION functionName(parameters)
  // Describe intent, not copied implementation.
  IF condition THEN
    // Action
  ELSE
    // Alternative
  END IF
  RETURN value
END FUNCTION
```

### 13.2 Provide Examples For

- Functions
- Conditionals
- Loops
- Async flows
- State machines
- Module headers
- Error handling
- Integration boundaries

### 13.3 Naming Conventions

Document team choices, such as camelCase, PascalCase, route naming, domain naming, UI naming, service naming, model naming, and test naming.

### 13.4 File Templates

Include templates for:

- Backend service
- UI component
- Data model
- API contract
- Event handler
- Integration adapter

### 13.5 Traceability Annotations

Every pseudocode file must include:

- `PSEUDO-ID`
- `DERIVED FROM`
- `DOMAIN`
- `MODULE`
- `CONTRACT`
- `ASSUMPTIONS`
- `UNKNOWNs`

Clean-room pseudocode must not include source paths or copied source expressions.

### 13.6 Error-Handling Notation

- TRY / CATCH blocks for recoverable errors.
- ERROR types, such as ValidationError, AuthError, PermissionError, ConflictError, SystemError, and IntegrationError.
- Fallback and edge-case comments.
- Explicit fail-secure behavior for sensitive operations.

### 13.7 Logging and Observability Notes

- LOG: key state transitions and critical operations.
- TRACE: important execution paths for debugging and audits.
- METRIC: observable counters, durations, or gauges.
- AUDIT: security-sensitive or compliance-sensitive decisions.

**Gate:** Pseudocode format approved -> **stop for approval** before Phase 8.

---

## 14. Blueprint Phase 8 — Clean Room Backend, Frontend, and Workflow Pseudocode

**Room:** Clean Room

**Goal:** Express implementation-ready backend logic, frontend behavior, UI workflows, integrations, and state transitions as source-independent pseudocode.

**Folder:** `docs/blueprint/clean-room/08-backend-and-frontend-pseudocode/`

**Summary output:** `docs/blueprint/clean-room/08-pseudocode-summary.md`

**Steps**

1. Select modules, contracts, workflows, and data models to convert.
2. Write pseudocode using `07-pseudocode-format-guidelines.md`.
3. Include error handling, authorization behavior, data access intent, integrations, and method-level documentation.
4. Model UI flows, event handlers, state transitions, and input logic where applicable.
5. Model service flows, domain operations, persistence interactions, and asynchronous workflows where applicable.
6. Link each pseudocode block to sanitized requirements, contracts, domains, modules, and evidence IDs.
7. Classify converted modules as Core, Supporting, or Auxiliary by criticality.
8. Record unresolved questions in the summary.

**Pseudocode file naming**

```text
docs/blueprint/clean-room/08-backend-and-frontend-pseudocode/<domain>/<module_or_flow>.pseudo.md
```

**Gate:** Clean-room pseudocode package approved -> **stop for approval.**

---

## 15. Blueprint Phase 9 — Traceability Matrix

**Room:** Clean Room + Governance

**Goal:** Maintain end-to-end traceability from dirty-room evidence through sanitized requirements, clean-room design, pseudocode, and final implementation.

**Output:** `docs/blueprint/09-traceability-matrix.md`

**Matrix must include**

1. Evidence -> Requirement
2. Requirement -> Feature
3. Feature -> Domain
4. Domain -> Module
5. Module -> Contract
6. Contract -> Pseudocode
7. Pseudocode -> Final implementation when rebuilding
8. Decision -> Requirement or risk
9. Status column: Proposed, Approved, Designed, Converted, Verified, Implemented
10. Room column: Dirty, Handoff, Clean, Governance

**Recommended columns**

```text
Trace ID | Room | Evidence ID | Requirement ID | Feature ID | Domain ID | Module ID | Contract ID | Pseudocode ID | Implementation Reference | Status | Notes
```

**Gate:** Traceability matrix approved -> **stop for approval.**

---

## 16. Blueprint Phase 10 — Review, Glossary, Separation Log, and Consistency Audit

**Room:** Governance

**Goal:** Complete governance-grade audit, validate room separation, and identify readiness gaps.

**Outputs**

- `docs/blueprint/10-01-glossary.md` — terms, domains, modules, contracts, core methods.
- `docs/blueprint/10-02-final-review-notes.md` — gaps, risks, recommendations, stakeholder sign-off record.
- `docs/blueprint/10-03-room-separation-log.md` — room membership, allowed inputs, boundary issues, waivers, approvals.

**Steps**

1. Validate naming, syntax, and domain alignment across blueprint artifacts.
2. Build glossary of terms, domains, modules, contracts, and core methods.
3. Validate Dirty Room evidence supports the sanitized handoff.
4. Validate Clean Room design references only approved handoff artifacts and evidence IDs.
5. Validate no source paths, copied source code, or proprietary implementation expressions appear in clean-room artifacts.
6. Cross-phase consistency audit:
   - Phase 1 source inventory aligns with Phase 2 behavior extraction.
   - Phase 3 evidence register supports Phase 4 sanitized handoff.
   - Phase 5 clean architecture aligns with Phase 6 contracts.
   - Phase 7 pseudocode guidelines are followed in Phase 8 pseudocode.
   - Phase 9 traceability links validate all material artifacts.
7. Completeness check:
   - Required blueprint files exist under `docs/blueprint/`.
   - Missing domains, services, UI flows, integrations, or contracts are flagged.
   - Inconsistencies between evidence, sanitized spec, and clean-room design are flagged.
8. Record final risks, recommendations, and stakeholder sign-off.

**Room separation log template**

```text
# 10-03 Room Separation Log

## 1. Room Membership
## 2. Allowed Inputs
## 3. Prohibited Inputs
## 4. Boundary Reviews
## 5. Separation Issues
## 6. Waivers
## 7. Final Attestation
```

**Final deliverable:** Summary of results, gaps, risks, and separation status; blueprint complete pending stakeholder acceptance or explicit iteration plan.

---

## 17. Quality Gates

| Gate | Required approval |
| --- | --- |
| Phase 1 | Source inventory and boundaries are complete enough for extraction. |
| Phase 2 | Behavior and domain extraction are confirmed. |
| Phase 3 | Evidence register is complete enough for handoff. |
| Phase 4 | Sanitized handoff is clean-room safe. |
| Phase 5 | Clean architecture is approved. |
| Phase 6 | Contracts and data models are approved. |
| Phase 7 | Pseudocode standards are approved. |
| Phase 8 | Pseudocode package is approved. |
| Phase 9 | Traceability matrix is approved. |
| Phase 10 | Final audit, glossary, and separation log are approved. |

---

## 18. Template Variables

Use these variables when instantiating the template:

```text
{{PROJECT_NAME}}
{{PROJECT_ROOT}}
{{REPOSITORY_URL_OR_REFERENCE}}
{{BLUEPRINT_OWNER}}
{{DIRTY_ROOM_LEAD}}
{{CLEAN_ROOM_LEAD}}
{{GOVERNANCE_APPROVER}}
{{START_DATE}}
{{TARGET_COMPLETION_DATE}}
{{SCOPE_STATEMENT}}
{{OUT_OF_SCOPE_STATEMENT}}
{{KNOWN_CONSTRAINTS}}
{{APPROVAL_NOTES}}
```

---

## 19. Related Master Lifecycle Documents

- `Universal Blueprint Extraction — BP-001 Procedure.md` — canonical BP-001 base procedure and model selection guidance.
- `13. Phase 7 — Architecture and Design.md`
- `14. Phase 8 — Development Preparation.md`
- `21. Decision Gates.md`
- `22. Required Documents.md`
- `24. Traceability Rules.md`
- `25. Quality and Compliance Checks.md`
- `USSM — Unified Software Standards Manual v1.0.md` (documentation tiers and traceability themes)
