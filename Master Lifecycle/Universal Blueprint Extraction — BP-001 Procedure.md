# Universal Blueprint Extraction — BP-001 Procedure

**Classification:** Keep — standalone canonical Phase 7 / Phase 8 blueprint extraction procedure. Preserves architecture mapping, domain extraction, pseudocode standards, traceability matrix, phased gates, and consistency audit steps.

| Field | Value |
| --- | --- |
| **Document ID** | BP-001-UNIVERSAL-BLUEPRINT |
| **Procedure ID** | BP-001 |
| **Version** | 2.1 |
| **Status** | Active (controlled iterative hardening) |
| **Classification** | INTERNAL |
| **Traceability** | Enabled (Source ↔ Pseudocode ↔ Implementation) |

**Canonical status:** This document is the canonical **BP-001** procedure. For projects that require source-code reader separation, sanitized handoff, or source-independent rebuild work, use the specialized **BP-001-DRCR** dirty-room / clean-room variant.

**Important:** Blueprint internal phases **1–9** in this document are **not** Master Lifecycle phase numbers. Typically:

| Blueprint phases | Master Lifecycle |
| --- | --- |
| **1–5** (design-heavy artifacts) | **Phase 7 — Architecture and Design** |
| **6–9** (pseudocode bodies, matrix, audit) | **Phase 8 — Development Preparation** |

---

## 1. Purpose

Analyze a target codebase (`{{PROJECT_ROOT}}`, `{{PROJECT_NAME}}`) and produce a **modular, traceable, team-scalable** blueprint under `docs/blueprint/` so technical and non-technical stakeholders can abstract, rebuild, migrate, or govern the system without losing source alignment.

Outputs are **Markdown** unless tooling agrees otherwise. The blueprint guides staged abstraction; it does not replace the Master Lifecycle or USSM documentation tiers.

---

## 2. Mission and audience

**Mission:** Convert an entire software project—regardless of language, architecture, or domain—into a structured blueprint: architecture map, domain map, tier strategy, pseudocode, trace matrix, glossary, and audit trail.

**Audience:** Engineers, architects, product, QA, governance, and operators assisting extraction (including AI agents under human approval gates).

**Output root:** `docs/blueprint/` (repository-relative).

### 2.1 Blueprint Model Selection

Select the blueprint model during **Phase 7 — Architecture and Design** before blueprint extraction begins:

| Model | Use when |
| --- | --- |
| **BP-001 Universal Blueprint Extraction** | The same approved team or workflow may inspect source code and produce blueprint artifacts. |
| **BP-001-DRCR Dirty/Clean Room Variant** | The project requires source-reader separation, sanitized handoff, IP protection, vendor handoff, litigation-safe analysis, or source-independent implementation design. |

Record the selected model, rationale, approver, and any room-separation constraints in the Phase 7 architecture record or blueprint kickoff notes. Phase 8 continues the selected model; do not switch models midstream without recording the change and approval.

---

## 3. Operating rules (non-negotiable)

1. Run blueprint internal phases **1–9** in order unless a formal waiver records a different path.
2. After each phase, obtain **explicit approval** before continuing (“Approve Blueprint Phase *n* to proceed?”).
3. If changes are requested, edit **blueprint documents** under `docs/blueprint/` first; do not modify application source unless separately approved.
4. **Traceability is mandatory:** pseudocode and summaries reference `SOURCE` paths and domain/module identifiers.
5. Keep numbering, headings, and filenames consistent with this procedure.
6. Unknowns: mark **`UNKNOWN: _______`** and continue with best-effort extraction.
7. Do not invent APIs or behaviors; infer only when evidence exists in source or docs.
8. Prefer clarity over silent completeness; flag gaps in review notes.

---

## 4. Output conventions (all blueprint files)

- Numbered headings and subsections.
- Bullets and fenced code blocks where helpful.
- Sections for **Assumptions**, **Unknowns**, and **Evidence** (`SOURCE` paths for major claims).

---

## 5. Artifact index

| BP phase | Primary outputs |
| --- | --- |
| **1** | `docs/blueprint/01-project-analysis-architecture.md` |
| **2** | `docs/blueprint/02-functional-domain-extraction.md` |
| **3** | `docs/blueprint/03-multi-tier-conversion-approach.md` |
| **4** | `docs/blueprint/04-pseudocode-format-guidelines.md` |
| **5** | `docs/blueprint/05-phased-implementation-plan.md` |
| **6** | `docs/blueprint/06-backend-logic-pseudo/`, `docs/blueprint/06-backend-logic-conversion-summary.md` |
| **7** | `docs/blueprint/07-frontend-logic-and-UI-flow-pseudo/`, `docs/blueprint/07-frontend-logic-and-UI-flow-pseudo-summary.md` |
| **8** | `docs/blueprint/08-traceability_matrix.md` |
| **9** | `docs/blueprint/09-01-glossary.md`, `docs/blueprint/09-02-final-review-notes.md` |

Supporting folders often include `integrations/` and `templates/` under `docs/blueprint/` as needed.

---

## 6. Blueprint Phase 1 — Project analysis and directory structure

**Goal:** Map architecture, boundaries, modules, dependencies, and architecture style.

**Output:** `docs/blueprint/01-project-analysis-architecture.md`

**Steps**

1. Audit and map codebase directory structure.
2. Mirror the existing folder architecture **conceptually** (document structure; do not duplicate proprietary source wholesale).
3. Identify modules across layers (UI, backend services, shared utilities, domain, infrastructure, integration).
4. Map internal and external dependencies and shared components.
5. Label architecture boundaries using tags or folder conventions.
6. Detect architecture style (for example monolith, modular monolith, microservices, clean architecture, hexagonal, layered).
7. Generate a high-level architecture classification map (context, container, component-level where applicable).
8. Create a component inventory list (for example C1, C2, S1, M1) for traceable modular analysis.

**Gate:** Architecture map complete and component inventory validated → **stop for approval.**

---

## 7. Blueprint Phase 2 — Functional domain extraction

**Goal:** Express features as domain-driven functional areas and bounded contexts.

**Output:** `docs/blueprint/02-functional-domain-extraction.md`

**Steps**

1. Identify core system functionalities (for example auth, user management, email, reporting).
2. Group features by domain or bounded context.
3. Trace feature entry points (UI action → service method → DB operation).
4. Validate bounded contexts; ensure each feature belongs to a clearly defined domain scope.
5. Map each feature to domain, module, and entry layer for traceability.

**Gate:** Domains confirmed and traceability links established → **stop for approval** (confirm critical domains before Phase 3).

---

## 8. Blueprint Phase 3 — Multi-tier conversion approach

**Goal:** Define a tiered strategy for abstraction and conversion, including errors, edge cases, and data contracts where relevant.

**Output:** `docs/blueprint/03-multi-tier-conversion-approach.md`

**Tiers**

1. **Tier 1 — System overview:** architecture maps, flow diagrams.
2. **Tier 2 — Domain logic:** services, controllers, models.
3. **Tier 3 — UI and workflow:** components, events, flows.
4. **Tier 4 — Infrastructure and integrations:** APIs, databases, external services, environment configuration, deployment interfaces.

**Gate:** Tier mapping consistent with Phase 1 architecture and Phase 2 domains → **stop for approval.**

---

## 9. Blueprint Phase 4 — Pseudocode format guidelines

**Goal:** Standardize pseudocode syntax, templates, and trace annotations for all downstream conversion.

**Output:** `docs/blueprint/04-pseudocode-format-guidelines.md`

### 9.1 Mandatory skeleton

```text
FUNCTION functionName(parameters)
  // Description
  IF condition THEN
    // Action
  ELSE
    // Alternative
  END IF
  RETURN value
END FUNCTION
```

### 9.2 Provide examples for

- Functions  
- Conditionals  
- Loops  
- Async flows  
- Module headers  

### 9.3 Naming conventions

Document team choices (for example camelCase, PascalCase) and UI vs service naming.

### 9.4 File templates

Include templates for:

- Backend service  
- UI component  
- Data model  

### 9.5 Traceability annotations (every pseudocode file)

- Original file path reference, for example `SOURCE: /src/services/authService.ts`
- Module and domain tags, for example `DOMAIN: Authentication`, `MODULE: C2-AuthService`

### 9.6 Error-handling notation

- TRY / CATCH blocks for recoverable errors  
- ERROR types (for example ValidationError, SystemError, IntegrationError)  
- Fallback and edge-case comments  

### 9.7 Logging and observability (optional notes)

- LOG: key state transitions and critical operations  
- TRACE: important execution paths for debugging and audits  

**Gate:** Formatting approved → **stop for approval** before backend conversion (Blueprint Phase 6).

---

## 10. Blueprint Phase 5 — Phased implementation plan

**Goal:** Break remaining extraction and rebuild work into time-boxed segments with goals, deliverables, and acceptance criteria. This document **schedules work**; it does not rename blueprint phases 6–9.

**Output:** `docs/blueprint/05-phased-implementation-plan.md`

### 10.1 Illustrative work streams (adjust per project)

| Stream | Indicative outputs | Indicative duration |
| --- | --- | --- |
| Architecture and models | Architecture views, entity relations pseudocode | 2–3 days |
| Backend services | Service pseudocode, API map | 5–7 days |
| Frontend and workflows | Component pseudocode, state flow notes | 5–7 days |
| Integration mapping | APIs, auth, third-party usage | 3–4 days |
| Review and refinement | Peer review, glossary seeds | 2–3 days |

### 10.2 Mandatory acceptance checkpoints (align to blueprint phases)

These checkpoints **cross-reference** Blueprint Phases 1–4 and the audit in Phase 9:

| Checkpoint | Criterion |
| --- | --- |
| Architecture + inventory | Blueprint Phase 1 complete |
| Domains + traces | Blueprint Phase 2 complete |
| Tier abstraction documented | Blueprint Phase 3 complete |
| Pseudocode templates validated | Blueprint Phase 4 complete |
| Consistency audit + glossary | Blueprint Phase 9 (final) |

**Gate:** Plan approved → **stop for approval** before executing Blueprint Phase 6 (backend pseudocode folders).

---

## 11. Blueprint Phase 6 — Backend logic conversion

**Goal:** Express core backend logic as pseudocode using Phase 4 templates.

**Folder:** `docs/blueprint/06-backend-logic-pseudo/`

**Steps**

1. Select service files to convert (prioritize core services).
2. Abstract logic into pseudocode using `04-pseudocode-format-guidelines.md`.
3. Include error handling, database access, and method-level documentation.
4. Link each pseudocode block to the original file path (`SOURCE`).
5. Abstract and document database models and schema interactions (entities, relations, access patterns).
6. Classify converted services as Core, Supporting, or Auxiliary by criticality.
7. Note external integrations (APIs, queues, third-party SDKs) when present.

**Outputs**

- `docs/blueprint/06-backend-logic-pseudo/<service_name>.pseudo.md` (or equivalent naming agreed in Phase 4)
- `docs/blueprint/06-backend-logic-conversion-summary.md`

**Gate:** Stop for approval before **Blueprint Phase 7** (frontend and UI flow).

---

## 12. Blueprint Phase 7 — Frontend and UI flow conversion

**Goal:** Capture UI logic and interactions as pseudocode and flows (not backend conversion).

**Folder:** `docs/blueprint/07-frontend-logic-and-UI-flow-pseudo/`

**Steps**

1. Analyze representative UI components (framework-appropriate: React, Vue, Svelte, etc.).
2. Abstract event handlers, state transitions, and component interactions.
3. Represent view flows and input logic in pseudocode.
4. Add interface notes (for example which control triggers which handler).
5. Model UI state machines where applicable (Idle, Loading, Success, Error) for key views.
6. Add interaction traceability: UI action → handler → service call → response/update.

**Outputs**

- `docs/blueprint/07-frontend-logic-and-UI-flow-pseudo/<component>.pseudo.md`
- `docs/blueprint/07-frontend-logic-and-UI-flow-pseudo-summary.md`

**Gate:** Stop for approval before **Blueprint Phase 8** (traceability matrix).

---

## 13. Blueprint Phase 8 — Traceability matrix

**Goal:** End-to-end traceability across requirements, features, modules, and pseudocode.

**Output:** `docs/blueprint/08-traceability_matrix.md`

**Matrix must include**

1. Pseudocode file ↔ Source file  
2. Feature spec ↔ Function/module  
3. Pseudocode ↔ Final implementation (when rebuilding)  
4. Requirement ↔ Feature ↔ Module ↔ Pseudocode ↔ Implementation  
5. Traceability IDs: REQ-ID, FEAT-ID, MOD-ID, PSEUDO-ID  
6. Status column: Planned, Converted, Verified, Implemented  

**Formatting:** Markdown with numbered sections, tables or lists as appropriate, usable by the whole team.

**Gate:** Stop for approval before **Blueprint Phase 9** (review and glossary).

---

## 14. Blueprint Phase 9 — Review, glossary, and consistency audit

**Goal:** Governance-grade audit and completeness check.

**Outputs**

- `docs/blueprint/09-01-glossary.md` — terms, domains, core methods  
- `docs/blueprint/09-02-final-review-notes.md` — gaps, risks, recommendations, stakeholder sign-off record  

**Steps**

1. Validate naming, syntax, and domain alignment across blueprint artifacts.
2. Build glossary of terms, domains, and core methods.
3. Suggest improvements in clarity or structure.
4. Cross-phase consistency audit:
   - Phase 1 architecture aligns with Phase 2 domains.
   - Tier mappings (Phase 3) reflected in backend and frontend pseudocode (Phases 6–7).
   - Traceability links validated against Phase 8 matrix.
5. Completeness check:
   - Required blueprint files exist under `docs/blueprint/`.
   - Missing domains, services, UI flows, or integrations flagged.
   - Inconsistencies between source structure and pseudocode flagged.

**Final deliverable:** Summary of results, gaps, and risks; extraction complete pending stakeholder acceptance or explicit iteration plan.

---

## 15. Related Master Lifecycle documents

- `13. Phase 7 — Architecture and Design.md`
- `14. Phase 8 — Development Preparation.md`
- `Dirty Room Clean Room Blueprint Design Template — BP-001-DRCR.md` — specialized dirty-room / clean-room variant when separation is required.
- `21. Decision Gates.md`
- `22. Required Documents.md`
- `24. Traceability Rules.md`
- `25. Quality and Compliance Checks.md`
- `USSM — Unified Software Standards Manual v1.0.md` (documentation tiers and traceability themes)
