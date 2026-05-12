# Universal Software Project Development Procedure

**Classification:** Merge — lifecycle backbone aligned with the Master Lifecycle 14-phase procedure set; preserves governing principles, phase gates, artifact lists, five-iteration model, agnostic task decomposition protocol, templates, execution order, and the **Process Building a Project** operational walkthrough (Section 11).

**Document type:** Reusable process template  

**Purpose:** Standardized method for selecting, documenting, designing, planning, building, testing, deploying, and maintaining software projects.

**Intended use:** Any new software product, internal system, SaaS platform, business application, mobile app, web app, backend service, or modular software initiative.

---

## Alignment with the Master Lifecycle (14 phases)

This document uses **internal thematic blocks** (for example “Phase 7 — Agnostic Execution Decomposition”) that differ from **numbered lifecycle files** (`07. Phase 1 — Idea Capture.md`, …). Use the mapping below when crossing between this backbone and the Master Lifecycle documents.

| Thematic block in this document | Primary Master Lifecycle documents |
| --- | --- |
| Problem definition, research, selection | `08. Phase 2 — Problem Definition.md`, `09. Phase 3 — Project Evaluation and Selection.md`, `10. Phase 4 — Feasibility and Business Case.md` |
| Charter and scope | `12. Phase 6 — Planning and Scope Control.md` (with charter inputs) |
| Requirements and risk | `11. Phase 5 — Requirements Definition.md` |
| SDLC master and five macro-stages | Program SDLC master; `06. Lifecycle Overview.md` |
| Architecture, ADRs, domain/UI | `13. Phase 7 — Architecture and Design.md` |
| Feature inventory and five iterations | `12. Phase 6`; iteration intent aligns with Phase 8 prep and **`Example — Five-Iteration Website Task List.md`** (non-normative example) |
| Agnostic execution decomposition | **`Agnostic Execution Decomposition — Create Tasks List Procedure.md` (TD-001)** — prefer `tasks_list.md` and optional `tasks_board.json` over legacy `tasks_list_iterN.json` unless tooling requires split JSON |
| Module and file planning **(draft “Phase 8”)** | **`14. Phase 8 — Development Preparation.md`** |
| Engineering standards and environment **(draft “Phase 9”)** | Phase 8 prep; **`15. Phase 9 — Implementation.md`** prerequisites |
| Coding procedure **(draft “Phase 10”)** | **`15. Phase 9 — Implementation.md`**; **`Pseudocode to Code Conversion Guidelines.md`**; **`Unit Test and Pseudocode Writing Guidelines.md`** |
| Testing **(draft “Phase 11”)** | **`16. Phase 10 — Testing and Validation.md`** |
| Deployment **(draft “Phase 12”)** | **`17. Phase 11 — Release Preparation.md`**, **`18. Phase 12 — Deployment.md`** |
| Maintenance and retrospectives **(draft “Phase 13”)** | **`19. Phase 13 — Maintenance and Improvement.md`**, **`20. Phase 14 — Post-Release Review.md`** |

**Naming collision:** This draft’s **“Phase 8 — Module and File Planning”** corresponds to **Development Preparation** in the Master Lifecycle (`14. Phase 8 — …`), not “Phase 8” as in `07. Phase 1`. Rely on titles and this table, not phase numbers alone.

**Gates:** Cross-check **`21. Decision Gates.md`** and each phase’s exit criteria against Section 7 below.

**Disk sync:** If you maintain a longer draft in `000.Notes.md`, **save the file to disk** so shell tools and CI see the same content as the editor buffer.

---

## 1. Purpose

This procedure defines the standard process for transforming an idea into working software through a structured sequence of selection, validation, documentation, architecture, planning, implementation, testing, deployment, and maintenance activities.

This procedure is intended to:

- improve project clarity  
- reduce rework  
- control scope  
- enforce documentation discipline  
- support modular design  
- ensure each iteration produces working software  
- provide a repeatable framework for future projects  

---

## 2. Scope

This procedure applies to:

- new software projects  
- product redesigns  
- major feature expansions  
- internal tools  
- client systems  
- prototypes intended to become production systems  

This procedure does not prescribe a specific lifecycle model such as Agile, Waterfall, Spiral, or V-Model. It can be used with any of them.

---

## 3. Governing principles

All projects using this procedure shall follow these principles:

1. **Problem before solution** — A project must solve a defined problem.  
2. **Requirements before coding** — No implementation begins until requirements, scope, and major structure are clear.  
3. **Architecture before scale** — Core design decisions must be made before expanding features.  
4. **Iteration with working software** — Every iteration must end with usable, testable, working software.  
5. **Scope control** — Only the features planned for the current iteration may be implemented.  
6. **Documentation–code alignment** — Documentation, architecture, and code must remain consistent.  
7. **Modularity and maintainability** — The system must be broken into manageable modules with clear responsibilities.  
8. **Verification at every stage** — Outputs from every phase must be reviewed before moving forward.  

---

## 4. Standard process overview

Every project shall follow this sequence:

1. Problem Definition  
2. Opportunity Research and Project Selection  
3. Project Charter and Scope Definition  
4. Requirements Definition  
5. SDLC Master Document  
6. Architecture and Design  
7. Feature Inventory and Iteration Planning  
8. Milestone and Task Decomposition  
9. Module and File Planning  
10. Coding and Refactoring  
11. Testing and Validation  
12. Deployment and Release  
13. Maintenance and Continuous Improvement  

Map items 1–14 above to the Master Lifecycle phase documents using Section “Alignment” and `06. Lifecycle Overview.md`.

---

## 5. Procedure (detailed outline)

The following mirrors the **full draft** structure (problem → selection → charter → requirements → SDLC segments → architecture → features & five iterations → **agnostic decomposition** → module/file planning → standards/environment → coding → testing → deployment → maintenance). **Verbatim sub-steps, template prompts, and JSON examples** appear in your saved master draft; numeration below follows the backbone draft (some subsection numbers repeat across thematic blocks—use titles, not numbers alone).

### 5.1–5.3 Phase 1 — Problem definition and project selection

- **5.1** Define the problem (questions, output: Problem Definition with minimum contents).  
- **5.2** Business Field Report (sources, market overview, segments, competitors, trends, risks).  
- **5.3** Evaluate and select project (criteria, RICE/MoSCoW/etc., output: Project Selection Scorecard).  

### 5.4–5.5 Phase 2 — Charter and scope

- **5.4** Project Charter (vision, mission, goals, stakeholders, risks).  
- **5.5** Scope Definition (in/out scope, boundaries, rule: no feature without scope review).  

### 5.6–5.8 Phase 3 — Requirements

- **5.6** Functional Requirements Specification.  
- **5.7** Non-Functional Requirements Specification.  
- **5.8** Risk Register.  

### 5.9–5.10 Phase 4 — SDLC master document

- **5.9** SDLC Master Document (overview, lifecycle, deliverables, roles, quality, checkpoints).  
- **5.10** Segment into five major stages: Design, Development, Testing, Deployment, Maintenance (each with mandatory topics); output: **SDLC Master Document Segmented Plan**.  

### 5.11–5.14 Phase 5 — Architecture and design

- **5.11** System Architecture Document (+ recommended diagrams).  
- **5.12** Architectural Decision Records.  
- **5.13** Core Domain Model and Data Contract Specification.  
- **5.14** UI/UX Design Document.  

### 5.15–5.16 Phase 6 — Feature and iteration planning

- **5.15** Feature inventory (“Project’s Features”).  
- **5.16** Five iterations (Functional Core → Expansion → Identity/Roles → Advanced → Hardening); output: **Iterations 1–5 Plan**.  

### 5.17–5.30 Phase 7 — Agnostic execution decomposition

Authoritative Master Lifecycle procedure: **TD-001** (`Agnostic Execution Decomposition — Create Tasks List Procedure.md`). This backbone adds:

- **Hierarchy (mandatory):** Iteration → Phase → Milestone → PowerTask → Task (no skipping or merging levels).  
- **Iteration semantics:** Five capability tiers (not lifecycle phase labels); strategic segmentation Section 5.20.  
- **Milestones:** Global continuous numbering across iterations.  
- **PowerTasks / Tasks:** Single-concern; verb-first atomic tasks; forbidden vague verbs; task ID format `<iteration>.<phase>.<milestone>.<task>`.  
- **JSON:** When automation requires machine-readable output, use hierarchy fields (`iteration`, `phase`, `milestone`, `powerTask`, `task`); ISO 8601 dates; **correct JSON** (example fixed: use `"description": "..."` as property name, not a stray quote). Split filenames `tasks_list_iter1.json` … **or** TD-001’s `tasks_list.md` / `tasks_board.json` per program policy.  
- **Verification** after each iteration; **forbidden practices** (vague deliverables, multi-concern PowerTasks, placeholders).  
- **Completion criteria** when decomposition is complete.  

Internal references like “§5.20” in the long draft mean **Section 5.20** of that draft.

### Module and file planning (draft “Phase 8”)

- Modules Refactored; Directory Structure.txt; File Specification Catalog (incl. pseudocode and iteration alignment).  

### Engineering standards and environment (draft “Phase 9”)

- Engineering Standards; Environment and Delivery Strategy; Definition of Done.  

### Coding procedure (draft “Phase 10”)

- File-by-file sequence (read spec → pseudocode if needed → code → lint → tests → verify iteration scope).  
- Pseudocode when complexity warrants it; continuous refactor; iteration compliance.  

### Testing, deployment, maintenance (draft Phases 11–13)

- Multi-level testing; Acceptance Test Scenarios; requirement traceability.  
- Deployment checklist; pilot; production release criteria.  
- Post-release review; maintenance types; iteration retrospectives.  

---

## 6. Standard required artifact list

Combine project needs with **`22. Required Documents.md`**. Typical artifacts:

**Core definition and selection:** Problem Definition; Business Field Report; Project Selection Scorecard; Project Charter; Scope Definition.  

**Requirements and control:** Functional Requirements Specification; Non-Functional Requirements Specification; Risk Register.  

**Lifecycle and design:** SDLC Master Document; SDLC Segmented Plan; System Architecture Document; ADRs; Core Domain Model / Data Contracts; UI/UX Design Document.  

**Planning:** Project’s Features; Iterations 1–5 Plan; comprehensive tasks output (Markdown and/or JSON per TD-001).  

**Structure and engineering:** Modules Refactored; Directory Structure.txt; File Specification Catalog; Engineering Standards; Environment and Delivery Strategy; Definition of Done.  

**Validation and release:** Acceptance Test Scenarios; Deployment Checklist; Post-Release Review; iteration retrospectives (per iteration as needed).  

---

## 7. Phase gates

A project should not advance unless the prior gate is passed.

**Gate 1 — Selection:** problem defined; field report complete or waived; scoring complete; project approved.  

**Gate 2 — Scope and requirements:** charter; scope; functional and non-functional requirements approved; risk register created.  

**Gate 3 — Design:** architecture; domain/data design; UI/UX; major decisions documented.  

**Gate 4 — Planning:** features listed; iterations defined; milestones and task decomposition; modules and directory planned.  

**Gate 5 — Implementation readiness:** coding standards; environments; file specifications; Definition of Done approved.  

**Gate 6 — Release:** implementation complete for target; tests passed; security/quality checks; deployment checklist approved.  

**Gate 7 — Maintenance:** release reviewed; support plan; backlog updated; retrospective completed.  

---

## 8. Reusable templates (index)

Full field-by-field templates **8.1–8.26** live in your extended draft (Problem Definition through Iteration Retrospective), including **8.11** JSON structure for agnostic task boards. Prefer copying from the saved long-form draft into controlled doc templates or **USSM Annex F** (`USSM — Unified Software Standards Manual v1.0.md`) where aligned.

| ID | Template |
| --- | --- |
| 8.1–8.8 | Problem Definition through Risk Register |
| 8.9–8.10 | Feature; Iterations 1–5 Plan |
| 8.11 | Agnostic tasks JSON (lists/cards/hierarchy) |
| 8.12–8.16 | Phase, Milestone, PowerTask, Atomic Task, Verification |
| 8.17–8.22 | Module, File Specification, ADR, Engineering Standards, Environment, Definition of Done |
| 8.23–8.26 | Acceptance scenario, Deployment checklist, Post-release review, Iteration retrospective |

---

## 9. Execution order summary

1. Define problem  
2. Research opportunity  
3. Select project  
4. Write charter  
5. Define scope  
6. Write requirements  
7. Define non-functional requirements  
8. Create risk register  
9. Write SDLC Master Document  
10. Design architecture  
11. Define data models and contracts  
12. Design UI/UX  
13. List features  
14. Define iterations  
15. Execute agnostic decomposition into tasks  
16. Verify decomposition coverage after each iteration  
17. Refactor into modules  
18. Create directory structure  
19. Create file specifications  
20. Define standards and environments  
21. Code file by file  
22. Test and validate  
23. Deploy  
24. Review and maintain  

---

## 10. Final rule

No project should move from idea to coding without passing through documented problem definition, scope control, requirements definition, architecture design, and iteration planning.

This procedure exists to ensure that software is built intentionally, modularly, and in a way that can be delivered, tested, maintained, and improved over time.

---

## 11. Process Building a Project (operational walkthrough)

**Classification:** Merge — early master process draft; preserves project selection criteria, SDLC segmentation, five-iteration planning, milestone and task decomposition, module refactoring, directory structure, file specification catalog, pseudocode-to-code workflow, unit testing, and refactoring checks.

Use this section as a **linear checklist** alongside Sections 4–9 and TD-001. Artifact names below align with **`22. Required Documents.md`** where applicable.

### Step 1 — Select a new project

When the initiative is not yet chosen, build decision quality with market and internal evidence. A **business field report** (or equivalent) should cover trends, competitors, customers, financial signals, and opportunities.

**Common research report types** (pick what fits budget and depth): topline overview; full market report; product-detail report; syndicated research; primary research; secondary research; competitive analysis; consumer research; quantitative vs qualitative emphasis.

**Evaluation criteria** (score or prioritize explicitly):

1. Strategic alignment with mission and objectives  
2. Financial impact — cost–benefit, NPV, payback, ROI  
3. Feasibility — technical complexity, resources, readiness, risks  
4. Customer and stakeholder value  
5. Resource requirements (time, budget, people, infrastructure)  
6. Risk assessment and mitigation  
7. Timing and market conditions  
8. Balance of innovation vs achievable delivery  

Use scoring models or frameworks (for example RICE, MoSCoW) for objective comparison.

**Lifecycle mapping:** Phases 2–4 (`08`, `09`, `10`) and charter/scope within **`12. Phase 6 — Planning and Scope Control.md`**.

### Step 2 — Develop the SDLC document for the project

Produce the **SDLC Master Document** for this program (informally “SDLC1” if versioning helps). Include lifecycle model, deliverables, roles, quality practices, checkpoints, release and maintenance concepts (see Section 5 outline and **`06. Lifecycle Overview.md`**).

### Step 3 — Divide the SDLC into five segments

Segment the master SDLC into five macro-stages and document expectations for each:

| Segment | Typical contents |
| --- | --- |
| **3.1 Design** | Architecture layers/patterns; design principles (for example SOLID, DRY); strengths/weaknesses review; core business processes; DFD; ERD; UI wireframes/prototypes |
| **3.2 Development** | Frontend; backend/APIs; database; core functionality |
| **3.3 Testing** | Unit; integration; system; usability; regression (extend per USSM / test strategy) |
| **3.4 Deployment** | Build/package; deploy to target environments; pilot or limited release |
| **3.5 Maintenance** | Post-release review; fixes and updates; ongoing support |

These segments describe **lifecycle concerns**, not the five **implementation iterations** (capability tiers) in Step 4.

### Step 4 — Project structure (planning artifacts)

Execute in order; each item produces a controlled artifact where noted:

1. **Project’s Features** — Comprehensive feature list derived from requirements and the SDLC document.  
2. **Five iterations** — Progressive releases (example intent): **Iteration 1** minimal functional core, single-user, no auth; **Iteration 2** expand features, still incomplete; **Iteration 3** add authentication and roles; **Iterations 4–5** remaining scope toward completion and hardening. Adjust labels to match product reality; use **`Example — Five-Iteration Website Task List.md`** only as a non-normative example and convert it through Template A-15 plus TD-001/HG-001 when formalizing project work.  
3. **General Milestones — Iteration N** — For each iteration: milestone name; goal; short breakdown; deliverable at iteration end (working software, even if incomplete).  
4. **Comprehensive Tasks List — Iteration (1…5)** — Detailed tasks per milestone bullet; step-by-step implementation path (**TD-001** hierarchy when using Master Lifecycle tooling).  
5. **Modules Refactored** — From requirements-by-module (or equivalent): modular boundaries, root paths, responsibilities, methods/services (**`Principles of Modularization.md`**).  
6. **Directory Structure.txt** — Full tree of folders/files with one-line purpose each.  
7. **Master sequential task list** — Single ordered backlog covering at minimum: development environment setup; core interfaces and data models; UI layer (for example renderer); core application services; local/network data sync if applicable; integration layer; security, error handling, monitoring; testing and optimization; deployment and packaging; documentation and final setup.  
8. **File Specification Catalog** — For each file in the directory structure: path; definition; requirements trace; features/components and architecture role; logic flow; security; UI/UX integration; **core pseudocode** for non-trivial logic and alignment check with requirements (**`Pseudocode to Code Conversion Guidelines.md`**).

### Step 5 — Coding (file-by-file discipline)

For each implementation unit:

1. Translate pseudocode to code per **`Pseudocode to Code Conversion Guidelines.md`**.  
2. Verify conformance to module, file, and project specifications.  
3. Review against refactoring guidance (**`Refactoring Evaluation Checklist.md`** and team standards).  
4. Refactor toward modular, maintainable structure without changing approved behavior.  
5. Resolve errors (build, lint, runtime).  
6. Confirm scope matches the **current iteration** only (unless structural scaffolding is pre-approved).  
7. **File by file:** add or update **unit tests**, run them, fix failures (**`Unit Test and Pseudocode Writing Guidelines.md`**).  
8. Re-verify satisfaction of file-level requirements.  
9. Apply **formatting and lint** rules recorded in Engineering Standards (if your program uses IDs such as “F1”, define them there—do not assume a global definition in this pack).

---

## Related Master Lifecycle documents

- `0. Plan to Build the Complete Software Project Procedure.md`  
- `06. Lifecycle Overview.md`  
- **`22. Required Documents.md`**  
- **TD-001:** `Agnostic Execution Decomposition — Create Tasks List Procedure.md`  
- **HG-001:** `Document Decomposition — Hyper-Granular Execution Plan Directive.md` (when used)  
- **MDM-001:** `Module Design Methodology — MDM-001 Procedure.md` (Phase 7 module design package — §1–§18 + appendices)  
- **LYG-001:** `UI-UX Layout Guide — LYG-001.md` (Phase 7 / Phase 8 — CRM/admin layout shells and patterns)  
