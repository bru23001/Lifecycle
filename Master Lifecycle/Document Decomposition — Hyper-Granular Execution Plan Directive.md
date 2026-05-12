# Document Decomposition — Hyper-Granular Execution Plan Directive

**Classification:** Keep — standard atomic task-breakdown procedure using benchmark-scoped numbering, dependency flags, and priorities.

**Procedure ID:** HG-001

**Lifecycle placement**

| Phase | Role |
| --- | --- |
| **Phase 6 — Planning and Scope Control** | Decompose approved documents into a benchmark-aligned execution plan with explicit blockers and priorities. |
| **Phase 8 — Development Preparation** | Finalize or refine the hyper-granular plan against architecture and implementation constraints before execution. |

**Gate context:** HG-001 can support **G6 — Development Ready** when selected as the detailed execution model and linked from the Development Plan (Template A-15).

**Relationship to TD-001:** **`Agnostic Execution Decomposition — Create Tasks List Procedure.md` (TD-001)** uses **five iterations** (capability tiers) and its own numbering rules. **HG-001** uses **seven delivery phases (PH1–PH7)** and **benchmark**-centric IDs. Use **one** primary decomposition model per program unless you maintain an explicit mapping table between TD-001 iterations and HG-001 phases.

HG-001 does not replace the Development Plan unless the project explicitly records that HG-001 is serving that role. Normally, Template A-15 summarizes delivery approach, owners, dependencies, quality expectations, and approval, while HG-001 provides the detailed benchmark-level execution breakdown.

---

## Master Lifecycle Alignment

HG-001 is the alternate detailed task-decomposition model used when a program needs benchmark-scoped planning, explicit blocker metadata, and PH1–PH7 delivery buckets. In the Master Lifecycle:

- Phase 6 selects or proposes the execution decomposition model; when HG-001 is selected, it may start from approved scope, requirements, feature inventory, risk constraints, and delivery assumptions.
- Phase 8 finalizes HG-001 against architecture, module/file planning, environment strategy, and implementation readiness.
- The finalized hyper-granular plan can support **G6 — Development Ready** when HG-001 is selected as the execution model.
- HG-001 may be referenced by **Template A-15 — Development Plan** as the detailed execution model; it does not replace the Development Plan unless that substitution is explicitly recorded and approved.
- Use either TD-001 or HG-001 as the primary decomposition model unless a written mapping exists.

The internal HG-001 term **Phase** means PH1–PH7 execution-planning bucket only. It is not the same as Master Lifecycle Phases 1–14.

---

## 1. Purpose

Convert an approved document (spec, plan, proposal) into an **ultra-detailed** execution roadmap of **atomic** actions using a fixed hierarchy and strict granularity rules. The output must be measurable, traceable, and safe to hand to implementers without clarification meetings for each line.

---

## 2. Hierarchy (mandatory)

```text
Phase (PH1–PH7 delivery bucket)
  └── Benchmark (cross-phase measurable checkpoint; globally ordered)
        └── Milestone (verifiable outcome within phase)
              └── PowerTask (single logical scope of work)
                    └── Task (≤ ~1 hour, single purpose, verb-first)
```

**Granularity**

| Level | Definition |
| --- | --- |
| **Milestone** | Smallest **measurable** deliverable (for example “Publish Hero section JSON schema”). |
| **PowerTask** | One **logical** step in service of the milestone (for example “Author Tailwind markup for hero title block”). |
| **Task** | **Atomic:** about one hour or less; **verb-first**; no ambiguity; if it spans a full morning, split further. |

**Rules**

- Do not merge unrelated concerns in one PowerTask (for example UI + API + test in one step).
- No placeholder verbs without a concrete artifact (“research,” “finalize,” “handle”) unless the deliverable is explicitly named (for example “Document comparison of three queue vendors with selection criteria”).
- No umbrella milestones (“Build contact form”) — replace with inspectable outcomes (“Produce contact form HTML markup with labels and `name` attributes”).

---

## 3. Seven Delivery Buckets (Template)

Assign each milestone to the PH bucket that best matches its primary risk or domain. PH1–PH7 are **organizing buckets**, not calendar weeks and not Master Lifecycle phases. Adapt names if the product does not use every stream.

| ID | Phase theme | Typical emphasis (examples) |
| --- | --- | --- |
| **PH1** | Foundation | Deployment pipeline, security baseline, Redis/cache, CI/CD, automated testing, observability |
| **PH2** | Core platform | APIs, database tuning, frontend shell, payments, billing, WebSockets |
| **PH3** | User experience | Onboarding, email, notifications, support tooling, admin, legal/compliance surfaces |
| **PH4** | Analytics | Product analytics, developer/API documentation |
| **PH5** | Performance and resilience | Performance optimization, data migration, disaster recovery |
| **PH6** | UX enhancement | Accessibility, mobile polish, internationalization |
| **PH7** | Growth | SEO, content management |

Items marked as critical in source notes (for example payments, security) should receive explicit **P0/P1** priority and dependency flags.

---

## 4. Numbering and identifiers

Use **integers only** (no decimal pseudo-versions for IDs).

| Entity | Reset rule | Example |
| --- | --- | --- |
| **Phase** | Fixed enum PH1–PH7 | `PH2` |
| **Benchmark** | **Never resets** — global consecutive index per program increment | Benchmark **3** under phase 2 shown as context **2.3** (phase 2, third benchmark in sequence) |
| **Milestone** | Restarts at **1** whenever **phase** changes; consecutive within that phase | `2.3.1` = phase 2, benchmark 3, milestone **1** |
| **PowerTask** | Restarts at **1** whenever **benchmark** changes; consecutive within benchmark | `2.3.1.4` = fourth PowerTask under that milestone |
| **Task** | Restarts at **1** whenever **PowerTask** changes; consecutive within PowerTask | Task **8** = eighth atomic task |

**Canonical task ID (five segments)**

```text
<phase#>.<benchmark#>.<milestone#>.<powertask#>.<task#>
```

Example: `2.3.1.4.8` — Phase **2**, Benchmark **3**, Milestone **1**, PowerTask **4**, Task **8**.

Shorter four-segment forms are **ambiguous** when multiple PowerTasks exist under one milestone; avoid unless the team documents a single-PowerTask convention.

---

## 5. Procedure

1. **Analyze** the source document: deliverables, constraints, integrations, and implicit work.
2. **Define milestones** with a title and **one-line** measurable goal each.
3. **Assign** each milestone to **PH1–PH7** using the template in Section 3.
4. **Order benchmarks** globally: each benchmark marks a reviewable slice of value (release candidate, compliance checkpoint, etc.).
5. **Decompose** each milestone into **PowerTasks** (one logical scope each).
6. **Decompose** each PowerTask into **Tasks** (≤ ~1 hour, executable, single purpose).
7. **Annotate** **isBlocker**, **blockedBy**, and **priority (P0–P3)** at milestone, benchmark, or PowerTask level where relevant.
8. **Verify** after completing each delivery phase: compare PowerTasks back to the source document; produce a short alignment summary and list augmentations or gaps.

---

## 6. Output format (Markdown)

Use consistent headings and one blank line between blocks:

```text
Phase PH<n>, Benchmark <b>
Priority: P0 | P1 | P2 | P3   (when used)
BlockedBy: <task IDs or external refs>   (when used)
IsBlocker: yes | no   (when used)

Milestone <m>: <Title>
  Goal: <one line>

PowerTask <pt>: <Title>
  Task <p.b.m.pt.t>: <Verb-first action>
  Task <p.b.m.pt.t>: <Verb-first action>
```

Optional columns in tables or YAML front matter may mirror **blockedBy** / **isBlocker** for tooling.

**Priorities (typical meanings)**

| Priority | Intent |
| --- | --- |
| **P0** | Release or compliance blocker |
| **P1** | Critical path for agreed date |
| **P2** | Important, scheduled |
| **P3** | Nice-to-have or deferrable |

---

## 7. Verification (mandatory)

After each **phase bucket** (PH*n*) is drafted:

- Cross-check **PowerTasks** against the source document for coverage of deliverables, constraints, and integrations.
- Produce a short **alignment summary**: satisfied sections, gaps, proposed additions.
- Update priorities and blockers when new dependencies appear.

---

## 8. Prohibited patterns

- Vague verbs without an observable artifact.
- Multi-domain PowerTasks (for example UI + persistence + QA in one).
- “Research” or “spike” **without** a named deliverable (notes, decision record, prototype branch).
- Umbrella phrasing (“implement module,” “finalize setup”) without scoped milestones.

**Contrast examples**

| Weak | Strong |
| --- | --- |
| Milestone: Build contact form | Milestone: Ship contact form HTML with server endpoint contract |
| PowerTask: Implement form | PowerTask: Add serverless handler for POST validation |
| Task: Handle errors | Task: Return 422 JSON body for invalid email shape |

---

## 9. Completion criteria

The directive is satisfied when:

- Every source requirement, deliverable, constraint, integration, and material assumption maps to at least one milestone or explicit “out of scope” note.
- Tasks are atomic, verb-first, and estimable at roughly one hour or less.
- IDs follow Section 4; blockers and priorities are recorded where material.
- Phase verification summaries exist for each PH bucket used.
- HG-001 is linked from the Development Plan (Template A-15) or the project records why HG-001 is serving as the detailed planning artifact.
- Trace links to requirements, features, designs, tests, risks, and source artifacts are recorded where stable IDs exist.

---

## 10. Related documents

- `Agnostic Execution Decomposition — Create Tasks List Procedure.md` (TD-001)
- `12. Phase 6 — Planning and Scope Control.md`
- `14. Phase 8 — Development Preparation.md`
- `21. Decision Gates.md`
- `22. Required Documents.md`
- `24. Traceability Rules.md`
- `25. Quality and Compliance Checks.md`
- `28. Appendix A — Template Library.md` — Template A-15 Development Plan.

---

## Revision history

| Version | Notes |
| --- | --- |
| 1.0 | Canonical merge from working notes; aligned five-segment task IDs with hierarchy |
