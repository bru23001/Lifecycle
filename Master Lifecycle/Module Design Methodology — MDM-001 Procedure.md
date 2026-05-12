# Module Design Methodology (MDM-001)

**Classification:** Keep — standalone Phase 7 module-design subprocedure for module/component design packages; interface-first rule, V-model gates, trust boundaries, requirements, ADRs, detailed design, FMEA, data objects, flow maps, verification, validation, and release controls.

**Canonical procedure ID:** MDM-001.

**Canonical document:** **`Module Design Methodology — MDM-001 Procedure.md`** is the single normative MDM-001 source—the overview, §1–§18 section catalog, appendices A–D, and Phase 7 alignment. Working drafts or verbose ASCII blocks may live in `000.Notes.md` at operator discretion; they do not supersede this procedure.

**Related:** **MOD-001** (`Principles of Modularization.md`) · Master Lifecycle **Phase 7 — Architecture and Design** · USSM design tiers · CYBERCUBE standards cross-referenced inside each § below.

**Gate context:** MDM-001 module/component design packages support **G5 — Architecture Approved** when module-level design is required.

---

## 1. Purpose

Design modules for **durability**, **correctness**, **controlled integration**, and **graceful behavior** under stress, variance, and abnormal input—documented so security, privacy, tenancy, observability, and testability are **proven in design**, not retrofitted.

---

## 2. Design philosophy

- Enforce **modular** design; maximize **cohesion**, minimize **coupling**.
- **Standardize interfaces before implementation** — interface contracts are the primary design control.
- Components are **replaceable**, **testable**, **isolatable**.

### Golden rule

**DEFINE INTERFACES FIRST.**  
Interface contract precedes component construction. Standard before implementation.

---

## 3. Required benefits

- Parallel component development; isolated unit/component testing.
- Part replacement without total redesign; precise fault localization.

---

## 4. Internal V-model (MDM phases and gates)

MDM uses a **six-phase V-model** with **mandatory exit gates** (no skipping, no bypass—missing gate = architecture governance finding).

The internal MDM phases below are module-design workflow stages only. They are not the same as Master Lifecycle Phases 1–14.

| MDM phase | Focus | Exit gate (summary) |
| --- | --- | --- |
| **1** — Requirements & constraints | Functional, environmental, interface constraints | Signed requirements baseline |
| **2** — Conceptual design & feasibility | Trade studies, **ADRs**, risk | Approved ADR set (Architecture Governance 1.4) |
| **3** — Detailed design & modeling | Layers, components, models, DFX | Design review passed + **skeleton** committed |
| **4** — Robustness analysis | **FMEA**, worst-case, de-rating | FMEA complete; **no unmitigated critical risk (Severity ≥ 8)**; mitigate **RPN ≥ 100** |
| **5** — Prototyping & verification | Prototype, unit tests, **Steel Thread** | Tests pass; Steel Thread succeeds |
| **6** — Validation & release | Stakeholder validation, docs, module registration | Stakeholder approval + module registration |

---

## 5. Practical workflow (compressed)

1. **Block diagram** — components; power/data/force or logical flow → component map.
2. **ICD** — mechanical/electrical/**software** interface contracts → interface specification.
3. **Master skeleton** — lock critical dimensions, protocols, references → base architecture.
4. **PoC / long-pole prototype** — highest-risk item first → risk reduction evidence.
5. **Steel Thread** — minimal end-to-end path early → interoperability proof.

### Mandatory design intent

Design for pressure, lifespan, abnormal input, replaceability, verification, controlled integration.

---

## 6. Module Design Document — section catalog (§1–§18 + appendices)

Each § below lists required focus areas. Completeness rules, CYBERCUBE standard citations, and exit criteria are elaborated in this procedure.

| § | Title | Role |
| --- | --- | --- |
| **§1** | Scope & trust boundaries | Module identity, PRCS, TB map, components, external deps, **tenant isolation checklist** (3.4) |
| **§2** | Requirements & constraints | FR/NFR, privacy NFRs, **access matrix**, validation, availability/DR, environment, **gap analysis** (ERM) |
| **§3** | Conceptual design & feasibility | **ADRs**, feasibility ratings, **risk assessment** (vs §5 FMEA), architecture diagram, **AI ethics** (7.2), stack compliance |
| **§4** | Detailed design & modeling | Layers, structure, endpoints, services, UI architecture, **middleware order**, **auth chain**, DFX, **master skeleton** |
| **§5** | Robustness & stress | **FMEA**, prior-art cross-ref, **transactions**, **error architecture**, correlation IDs (4.5) |
| **§6** | Core data objects | Entity registry, schema, **tenant_id + RLS**, soft-delete (3.5), **audit taxonomy** |
| **§7** | Procedure & data flow maps | Primary, auth, async, token lifecycle flows (behaviors) |
| **§8** | Data protection & crypto | Crypto inventory (2.5), secrets, **classification matrix**, tokens (2.3), privacy/DSAR (3.1–3.2) |
| **§9** | Observability & audit hooks | Logging pipeline (JSON), tracing (OTel/W3C), health, **PII redaction**, alerts, metrics (4.5) |
| **§10** | Downstream consumers | Consumer registry, **versioning / deprecation** (5.2) |
| **§11** | Summary control intent | Control objectives matrix, **compliance posture** mapping |
| **§12** | Architecture diagrams | C4 L1/L2, dev & prod topology (stack alignment), HA/backup |
| **§13** | Architecture integrity check | Pre-build consistency checklist across §§ |
| **§14** | Renderable flow diagrams | Mermaid/PlantUML sequences + ER diagram vs §6–§7 |
| **§15** | Responsibility matrix | Capability × subsystem (R/C/S) |
| **§16** | Component-level diagram | C4 Level 3 for hardest subsystem |
| **§17** | Verification & validation plan | Pyramid, coverage, perf tier, flaky policy, **security scanning CI** (5.5), **§2 traceability** |
| **§18** | Manufacturing & maintenance (DFX) | Artifacts, **release pipeline** (5.6), **change classes** (5.7), runbooks ↔ §9 alerts |

| Appendix | Title | Role |
| --- | --- | --- |
| **A** | Document cross-reference index | Completeness ledger §1–§18 |
| **B** | Gap registry | Single closure ledger (**GAP-XX**) |
| **C** | Technology stack compliance | Stack + library + pin verification |
| **D** | Approval & sign-off | Roles, **retention** (3.8), release checklist, module catalog |

---

## 7. Phase mapping (Master Lifecycle)

- **Phase 7 — Architecture and Design** owns MDM-001 execution for module-scale design packages, reviews, and gates—alongside DDS/SDD and optional **BP-001** blueprint extraction.
- MDM-001 outputs are supporting evidence for **G5 — Architecture Approved** when module/component design is required by complexity, criticality, architecture risk, or review authority.
- **§17** aligns with **Phase 10 — Testing and Validation**; **§18** with **Phase 11–12** release/deploy; operational content crosses **USSM** deployment/maintenance sections.

---

## 8. Quality and governance highlights

- **Trust boundaries** and **tenant isolation** are control-plane prerequisites (**§1**, **§6**).
- **No invented requirements**—matrix capabilities trace to §2/§4/§7/§10 (**§15**).
- **Technology Radar / stack**: deviations require **ADR** approval (**§3**, Appendix **C**).
- **FMEA** project risks (**§3**) vs failure modes (**§5**) stay separated.

---

## 9. Related documents

- `13. Phase 7 — Architecture and Design.md` — MDM-001 subprocedure entry point.
- `Architecture Design Document — ARD-001.md` — primary architecture baseline; MDM-001 complements it for module/component-level design packages.
- `21. Decision Gates.md` — G5 — Architecture Approved evidence and outcomes.
- `22. Required Documents.md` — artifact register for architecture/design evidence.
- `24. Traceability Rules.md` — requirement, design, API/data, implementation, and test traceability expectations.
- `25. Quality and Compliance Checks.md` — Phase 7/G5 quality and compliance checks.
- `Principles of Modularization.md` (MOD-001).
- `28. Appendix A — Template Library.md` — classic CRS/SRS/DDS outlines where programs use them beside MDM.
- `Universal Blueprint Extraction — BP-001 Procedure.md` — alternative/extraction path for legacy code documentation.

---

## Document history (procedure shell)

| Version | Note |
| --- | --- |
| 1.0 | MDM-001 summary merged into Master Lifecycle; cross-links Phase 7. |
| 1.1 | Retired separate verbatim directive-blocks file; **`Module Design Methodology — MDM-001 Procedure.md`** is the sole canonical MDM-001 artifact. |
| 1.2 | Clarified standalone status, G5 evidence role, internal MDM phase terminology, and related lifecycle links. |
