# Agnostic Execution Decomposition — Create Tasks List Procedure

**Classification:** Keep — standard task-decomposition protocol for converting approved documents into five-iteration execution roadmaps, atomic tasks, and optional machine-readable task board JSON.

**Procedure ID:** TD-001

**Lifecycle placement**

| Phase | Role |
| --- | --- |
| **Phase 6 — Planning and Scope Control** | Baseline approved scope and planning artifacts; initiate or refresh the execution roadmap so scope and task granularity stay aligned. |
| **Phase 8 — Development Preparation** | Apply TD-001 to approved specs/plans/blueprints so implementation starts from an atomic, traceable backlog (`tasks_list.md`, optional `tasks_board.json`). |

**Normative references:** Master Lifecycle Phase 6 and Phase 8; USSM Tier 4 (development and test artifacts).

---

## Master Lifecycle Alignment

TD-001 is the detailed task-decomposition model used when a project needs a granular execution roadmap. In the Master Lifecycle:

- Phase 6 selects or proposes the execution decomposition model; when TD-001 is selected, it may start from approved scope, requirements, and feature inventory.
- Phase 8 finalizes TD-001 against architecture, module/file planning, environment strategy, and development readiness.
- The finalized `tasks_list.md` / `tasks_board.json` can support **G6 — Development Ready** when TD-001 is selected as the execution model.
- TD-001 may be referenced by **Template A-15 — Development Plan** as the detailed execution model; it does not replace the Development Plan unless the project explicitly records that TD-001 is serving that role.
- Use either TD-001 or HG-001 as the primary decomposition model unless a written mapping exists.

The internal TD-001 words **Iteration** and **Phase** are execution-planning terms only. They are not the same as Master Lifecycle Phases 1–14.

---

## Goal

Transform structured source documents (plans, specs, blueprints, governance docs, or any formal system documentation) into a **five-iteration**, **ultra-granular** execution roadmap using a consistent, **methodology-agnostic** hierarchy.

This procedure is not tied to SDLC, Agile, Waterfall, or any lifecycle model. It is a universal decomposition protocol for complex systems.

---

## 1. Inputs and outputs

### 1.1 Source

Any structured documentation set, including but not limited to:

- Specifications
- Blueprints
- Governance plans
- Architecture documents
- Roadmaps
- Requirement repositories
- SDLC documents (optional, not required)

### 1.2 Destination

**Primary output**

- `tasks_list.md`

**Optional** (if scale requires segmentation)

- `tasks_list_iter1.md` … `tasks_list_iter5.md`

**Optional** (automation, boards, governance consoles)

- `tasks_board.json` (or per-iteration variants), aligned field-for-field with the Markdown list.

**Traceability expectation**

- When requirements, features, designs, tests, or implementation records have stable IDs, task outputs should link to those IDs per **`24. Traceability Rules.md`**.
- At minimum, trace links should be preserved in `tasks_board.json` when machine-readable planning is used.

---

## 2. Core structural hierarchy (mandatory)

Use a strict, invariant decomposition hierarchy:

```text
Iteration (Strategic Scope Boundary)
  └── Phase (Logical Execution Segment)
        └── Milestone (Verifiable Outcome)
              └── PowerTask (Atomic Deliverable Unit)
                    └── Task (Single Executable Action)
```

This hierarchy is:

- Methodology-agnostic
- Domain-agnostic
- Lifecycle-independent
- Compatible with governance, engineering, research, or operational systems

---

## 3. File and structure rules

### 3.1 Naming rules

- Default: `tasks_list.md`
- Large scope: split per iteration (`tasks_list_iter1.md` … `tasks_list_iter5.md`)

### 3.2 Numbering logic

- **Phases:** Reset at the start of each iteration.
- **Milestones:** Continuous global numbering across all iterations.
- **PowerTasks:** Reset at the start of each iteration.
- **Tasks:** Reset at the start of each milestone.

### 3.3 Formatting integrity

- Maintain strict indentation hierarchy.
- Do not skip levels.
- Do not merge levels (for example, PowerTask ≠ Milestone).

---

## 4. Scope and granularity rules

### 4.1 Milestones

**Definition:** The smallest verifiable and auditable outcome that produces a concrete system advancement.

**Examples**

- Define governance contract schema
- Implement evidence redaction pipeline
- Establish domain boundary enforcement tests

**Not allowed**

- Vague milestones
- Non-verifiable objectives

### 4.2 PowerTasks

**Definition:** Mid-sized, single-aspect execution units (typically about two to eight hours of focused work).

**Constraints**

- One concern only
- One subsystem or artifact per PowerTask
- No multi-domain mixing
- No umbrella scope

**Example**

- Implement scorecard aggregation engine  
- **Not:** Build scoring system

### 4.3 Tasks

**Definition:** The smallest atomic, immediately executable action.

**Mandatory characteristics**

- Single-responsibility
- Verb-first
- Implementation-ready
- Less than about one hour of work
- No ambiguity or placeholders

**Examples**

- Define JSON schema validation rules
- Implement deterministic hashing function
- Add CI test for domain boundary violation

If a task takes more than a morning, decompose it further.

---

## 5. Logical workflow sequence (agnostic)

### 5.1 Analyze source documentation

- Extract domains, components, artifacts, constraints, and execution logic.
- Identify dependencies and authority boundaries.
- Detect implicit deliverables and hidden work units.

This analysis is independent of any lifecycle model.

### 5.2 Establish strategic iteration segmentation

Divide the roadmap into five progressive **capability layers** (not SDLC phases):

| Iteration | Capability layer |
| --- | --- |
| **1** | Core functional baseline (minimal viable execution) |
| **2** | Foundational expansion (stability and core features) |
| **3** | Control and governance extensions (identity, roles, constraints, and similar, if applicable) |
| **4** | Full system completion (remaining capabilities and integrations) |
| **5** | Validation, optimization, and operational hardening |

### 5.3 Define phases (logical segments)

Phases must represent **logical execution segments**, not lifecycle labels.

**Valid phase types (examples)**

- Foundations  
- Core Processing  
- Decision Logic  
- Persistence and Evidence  
- Consumption / Interfaces  
- Enforcement and Validation  
- Optimization and Hardening  

**Forbidden:** Forcing Design / Development / Testing / Deployment when not contextually valid.

### 5.4 Define and number milestones

For each phase:

- Assign a scoped title.
- Provide a one-sentence objective.
- Ensure the milestone produces a measurable outcome.
- Increment milestone numbering globally across all iterations.

### 5.5 Decompose milestones into PowerTasks

**Rules**

- Each PowerTask = one execution aspect only.
- Do not mix UI + logic + testing in one PowerTask.
- Each PowerTask must map to a tangible artifact, subsystem, or enforcement mechanism.

**Example decomposition dimensions**

- Structure  
- Logic  
- Validation  
- Enforcement  
- Integration  

### 5.6 Break PowerTasks into atomic tasks

**Task requirements**

- Fully specified  
- No implied work  
- No placeholders  
- No vague verbs (for example, “handle,” “manage,” “improve”)  
- Clear and actionable without additional clarification  

**Task ID format**

```text
<iteration>.<phase>.<milestone>.<taskNumber>
```

**Example**

```text
Task 2.3.7.1: Implement schema validation for Issues contract
```

Leave one blank line before each new block in the output file.

---

## 6. Output format (strict)

Use this plain-text structure:

```text
Iteration <iterationNumber>, Phase <phaseNumber>
Milestone <milestoneNumber>: <Milestone Title>
PowerTask <powerTaskNumber>: <PowerTask Title>
Task <taskID>: <Verb-first actionable description>
Task <taskID>: <Verb-first actionable description>
```

Where:

- `<iterationNumber>` = 1 to 5  
- `<phaseNumber>` = Sequential logical phase index (not lifecycle-bound)  
- `<milestoneNumber>` = Global incremental numbering  
- `<powerTaskNumber>` = Reset per iteration  
- `<taskID>` = `Iteration.Phase.Milestone.TaskNumber`  

---

## 6.1 Machine-readable output (JSON task board format)

**When to use:** Mandatory when automation, governance consoles, Kanban integration, or AI orchestration consumes the backlog; optional for manual planning only.

### 6.1.1 JSON file requirement

When the procedure runs in automation-enabled environments, generate a `.json` file alongside the Markdown task list.

**Recommended filename:** `tasks_board.json` (or iteration-specific variants if the Markdown is split).

### 6.1.2 Canonical schema (conceptual)

Each **list** represents a board column (for example, To Do, In Progress). Each **card** represents one task (or a minimal card with only `name` when unstructured).

```json
{
  "lists": [
    {
      "name": "To Do",
      "cards": [
        {
          "iteration": 1,
          "phase": 2,
          "milestone": {
            "number": 1,
            "title": "Foundation"
          },
          "powerTask": {
            "number": 3,
            "title": "Database Setup"
          },
          "task": {
            "id": "T-001",
            "description": "Create schema",
            "linked_requirement_ids": ["SRS-FR-001"],
            "linked_feature_ids": ["FEAT-001"],
            "linked_design_ids": ["DATA-001"],
            "linked_test_ids": ["TC-001"],
            "source_artifacts": [
              "28. Appendix A — Template Library.md#Template-A-15"
            ]
          },
          "dueDate": "2026-03-15T00:00:00Z"
        },
        {
          "name": "Simple card title"
        }
      ]
    }
  ]
}
```

### 6.1.3 Card identity rules

Each card **must** contain at least one identity source:

**Option A — Direct card title**

```json
{ "name": "Simple card title" }
```

**Option B — Task object (recommended for structured systems)**

```json
{
  "task": {
    "id": "T-001",
    "description": "Create schema"
  }
}
```

If both are present: `task.description` is the primary card title; `name` is override or fallback.

### 6.1.4 Hierarchy mapping (procedure to JSON)

| Procedure level | JSON field |
| --- | --- |
| Iteration | `iteration` |
| Phase | `phase` |
| Milestone | `milestone.number`, `milestone.title` |
| PowerTask | `powerTask.number`, `powerTask.title` |
| Task | `task.id`, `task.description` |

These fields are optional but strongly recommended for traceability.

### 6.1.5 Traceability fields

When structured traceability is enabled, include these fields on the task object:

| Field | Type | Purpose |
| --- | --- | --- |
| `linked_requirement_ids` | string array | Requirements covered by the task. |
| `linked_feature_ids` | string array | Features or scope items covered by the task. |
| `linked_design_ids` | string array | Design, ADR, API, data, UI, or module artifacts affected by the task. |
| `linked_test_ids` | string array | Test cases, acceptance scenarios, or validation evidence expected for the task. |
| `source_artifacts` | string array | Source documents/templates used to derive the task. |
| `requirements_not_applicable` | boolean | Marks technical chores that do not directly map to requirements. |
| `requirements_not_applicable_reason` | string | Required when `requirements_not_applicable` is true. |

These fields align TD-001 with **`24. Traceability Rules.md`** and support coverage checks in Phase 6, Phase 8, Phase 9, and Phase 10.

### 6.1.6 Description enrichment

When hierarchy fields are present, append them to the card description body where your tool supports rich descriptions, for example:

```text
[I1-P2-M1-PT3] Create schema
Milestone: Foundation
PowerTask: Database Setup
```

### 6.1.7 List and column resolution (board-agnostic)

- Lists match existing columns by name (case-insensitive).
- If no matching column exists, create one.
- Compatible with Kanban, governance dashboards, orchestration, and custom consoles.

**Example list names:** To Do, In Progress, Blocked, Review, Completed.

### 6.1.8 Optional fields

| Field | Type | Purpose |
| --- | --- | --- |
| `description` | string | Extended task context |
| `dueDate` | ISO 8601 UTC string | Scheduling and prioritization |
| `name` | string | Direct card title (fallback) |

**Date format:** `YYYY-MM-DDTHH:MM:SSZ` (ISO 8601 UTC), for example `2026-03-15T00:00:00Z`.

### 6.1.9 Consistency with Markdown (mandatory)

If both artifacts exist:

- `tasks_list.md` = human-readable execution plan  
- `tasks_board.json` = machine-readable structure  

They **must** stay synchronized: same iteration numbers, same milestone numbering, same task descriptions, no orphan JSON cards.

### 6.1.10 JSON requirement summary

| Scenario | JSON |
| --- | --- |
| Manual planning only | Optional |
| Automation pipelines | Mandatory |
| Governance consoles | Mandatory |
| Kanban / task board integration | Mandatory |
| AI orchestration systems | Mandatory |

---

## 7. Verification and alignment step (mandatory)

After completing each iteration:

- Compare all PowerTasks against the full source document set.
- Validate coverage of all domains, deliverables, constraints, and integrations.
- Identify missing components, hidden dependencies, or under-specified work.
- Propose precise augmentations where gaps exist.

This ensures traceability and completeness independent of any SDLC framework.

---

## 8. Forbidden practices

| Anti-pattern | Instead |
| --- | --- |
| Vague deliverables (“Build system module”) | “Define system module interface contract” |
| Multi-concern PowerTasks (UI + logic + test) | Separate PowerTasks per concern |
| Placeholder tasks (“Implement feature X”) | Specific actionable units (for example, “Implement input validation middleware for API gateway”) |
| Implied or hidden work | Explicit decomposition for every action |
| Research-only tasks without deliverables | “Document comparison of three candidate libraries with integration notes” |

---

## 9. Completion criteria

The procedure is correctly executed when:

- All source documentation is fully decomposed.
- No milestone is vague or non-verifiable.
- All PowerTasks are single-aspect and concrete.
- All tasks are atomic and executable.
- Iterations form a progressive capability ladder.
- The roadmap is methodology-agnostic and reusable across domains.
- When JSON is in scope, Markdown and JSON remain aligned.
- When traceability is in scope, task records include requirement/feature/design/test/source links or documented not-applicable rationale.
- If TD-001 supports G6, the finalized roadmap is linked from the Development Plan (Template A-15) or explicitly identified as the execution model.

---

## Related Master Lifecycle documents

- `12. Phase 6 — Planning and Scope Control.md`
- `14. Phase 8 — Development Preparation.md`
- `15. Phase 9 — Implementation.md`
- `21. Decision Gates.md` — G6 Development Ready evidence.
- `22. Required Documents.md` — TD-001 and task-board artifact registration.
- `24. Traceability Rules.md` — task traceability and stable ID rules.
- `28. Appendix A — Template Library.md` — Template A-15 Development Plan.
- `Document Decomposition — Hyper-Granular Execution Plan Directive.md` (HG-001) — alternate decomposition model using PH1–PH7 delivery phases and benchmark-centric IDs; use one primary model per program unless mapped.
