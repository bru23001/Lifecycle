#!/usr/bin/env python3
"""Rebuild `Architecture Design Document — ARD-001.md` from the template source file.

Usage (from repo root or Documents):

  python3 "Master Lifecycle/scripts/build-architecture-design-document-ard-001.py"

Requires `sources/ARD-001-template-source.md` to contain the line `Architecture Document Template`.
Edit that source file (or edit `Architecture Design Document — ARD-001.md` directly for normative changes to §1–§10 and §11.5); re-run this script only when merging template-body updates into the published procedure.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_SOURCE = ROOT / "sources" / "ARD-001-template-source.md"
OUT = ROOT / "Architecture Design Document — ARD-001.md"


PROCEDURE = r"""# Architecture Design Document (ARD-001)

**Classification:** Phase 7 — Architecture and Design · USSM Tier 3 (DDS/SDD class) · Reference template for the **Architecture Design Document** artifact.

**Canonical ID:** ARD-001.

This artifact defines the system/software **architecture baseline** before implementation: structure, boundaries, interfaces, data, security, deployment, observability, technology choices, ADRs, and traceability to requirements. It complements **`28. Appendix A — Template Library.md`** (Template A-3 DDS/SDD), **`Module Design Methodology — MDM-001 Procedure.md`** when module-level design applies, and **`13. Phase 7 — Architecture and Design.md`** for phase activities, gates, blueprint extraction (**BP-001**), and UI architecture conventions.

---

### Maintenance and regeneration

This file is the **published** ARD-001 (§1–§10, §11 project template, completion criteria). A separate **template source** exists for an optional merge script that regenerates the §11 body from a structured draft.

| Item | Location |
| --- | --- |
| **Canonical publication** | **`Architecture Design Document — ARD-001.md`** (this file) |
| **Template source** | **`sources/ARD-001-template-source.md`** — must contain the marker line `Architecture Document Template` and `⸻` section breaks expected by the script |
| **Rebuild script** | **`scripts/build-architecture-design-document-ard-001.py`** |

After editing **only** the template source, regenerate:

`python3 "Master Lifecycle/scripts/build-architecture-design-document-ard-001.py"`

For routine wording changes to the procedure or §11, edit **this file** directly. Use **template source + script** when refreshing the full §11 form or importing a new draft of the form—the script **rewrites** the merged §11 output from source; avoid running it if you have unpersisted edits here that are not reflected in the source file.

Lifecycle context: **`13. Phase 7 — Architecture and Design.md`**. Artifact register: **`22. Required Documents.md`**.

Draft USSM manual builds may default to **`00.Notes.md`**; pass **`--input`** to **`scripts/build_ussm_from_notes.py`** when the draft lives elsewhere (**`000.Notes.md`**, **`Universal Software Project Development Procedure.md`**).

---

## 1. Purpose

Establish a controlled technical blueprint so development is not ad hoc: major parts, communication patterns, trust boundaries, data and API architecture, security and operations views, stack choices, recorded decisions, and evidence linking architecture to requirements and validation.

---

## 2. Entry criteria

- Requirements baseline (SRS / NFR) exists, or an explicit waiver for exploratory architecture (**`13. Phase 7 — Architecture and Design.md`** §**2**).
- Prior-phase inputs are available to populate **Section 11** source-document references.

---

## 3. Required inputs

- **Problem definition**, **feasibility**, and **business case** artifacts as applicable.
- **CRS / SRS / NFR**, UI/UX direction, constraints, compliance and security notes.
- Existing repositories, diagrams, or runbooks for brownfield or migration work.

---

## 4. Activities

- Draft the Architecture Design Document using **Section 11** (template).
- Produce architecture views (context, containers, components) appropriate to project scale; align with **MOD-001** for module boundaries when decomposing.
- Record **ADRs** for material choices; map quality attributes to NFRs and validation methods.
- Route security, operations, and QA reviewers per **`05. Roles and Responsibilities.md`** and program policy.

---

## 5. Required outputs

- Completed **Architecture Design Document** (this file, Section 11).
- Sufficient traceability for **Phase 8 — Development Preparation** handoff.

---

## 6. Decision gate

- **Architecture approved** before broad implementation (**`13. Phase 7`** §**7**). Evidence must satisfy **Section 9** quality checks and **Section 11.5** completion criteria.

---

## 7. Roles responsible

| Role | Responsibility |
| --- | --- |
| Architect / technical lead | Owns system structure, ADRs, and coherence |
| Project owner | Confirms fit to goals and scope |
| Backend / frontend / database reviewers | Review respective tiers |
| Security / governance | Trust boundaries, auth, privacy, compliance |
| Operations / DevOps | Hosting, deployment, observability, readiness |
| QA / test | Testability and validation hooks |

---

## 8. Quality checks

- System **context** and **boundaries** are explicit; **trust zones** identified.
- **Containers / modules** and principal **data flows** are documented.
- **Security**, **deployment**, and **observability** are addressed—not silently deferred.
- **Technology** choices justified; **ADRs** exist for consequential decisions.
- **Traceability** links architecture elements to requirements and verification evidence.

---

## 9. Exit criteria

- **Section 11.5** completion criteria satisfied and **approval status** recorded with named reviewer and date.

---

## 10. Related documents

| Document | Role |
| --- | --- |
| **`13. Phase 7 — Architecture and Design.md`** | Phase activities, gates, blueprint (**BP-001**), Section 12 UI conventions |
| **`28. Appendix A — Template Library.md`** | Template A-3 (DDS/SDD outline) |
| **`Module Design Methodology — MDM-001 Procedure.md`** | Module design package when applicable |
| **`06. Lifecycle Overview.md`** | USSM tier mapping |
| **`22. Required Documents.md`** | Artifact register |
| **`Principles of Modularization.md` (MOD-001)** | Cohesion, coupling, interfaces |
| **`05. Roles and Responsibilities.md`** | Reviewer roles |

---

## 11. Architecture Design Document — Template

### 11.1 Purpose (artifact)

"""


TAIL = """

### 11.2 Owner

| Role | Responsibility |
| --- | --- |
| Project Owner | Confirms the architecture supports project goals and scope |
| Technical Lead | Defines implementation structure and technology choices |
| Backend Developer | Reviews services, APIs, data access, and integration design |
| Frontend Developer | Reviews client architecture, UI integration, and state/data flow |
| Database Designer | Reviews schema, entities, relationships, and data lifecycle |
| Security / Governance Reviewer | Reviews trust boundaries, authentication, authorization, privacy, and compliance risks |
| Operations / DevOps Reviewer | Reviews environments, deployment model, observability, backups, and operational readiness |
| QA / Test Reviewer | Confirms the architecture can be tested and validated |

**Primary owner:** Architect or Technical Lead.

### 11.3 Required sections (21)

1. Project Identification  
2. Source Documents  
3. Architecture Summary  
4. Architecture Goals and Principles  
5. System Context  
6. Architecture Style  
7. System Boundaries and Trust Zones  
8. Major Containers / Applications  
9. Major Modules and Components  
10. Data Architecture  
11. API and Integration Architecture  
12. Security Architecture  
13. Deployment Architecture  
14. Observability and Operations Architecture  
15. Technology Stack  
16. Architecture Decisions  
17. Quality Attribute Mapping  
18. Risks, Constraints, and Trade-Offs  
19. Architecture Diagrams  
20. Architecture Traceability Matrix  
21. Approval Status  

### 11.4 Form body

"""


TAIL2 = """

### 11.5 Completion criteria for the document

The Architecture Design Document is complete when:

1. The project is clearly identified and source documents listed.  
2. Architecture summary, goals, principles, and context are documented.  
3. Architecture style is selected and justified; boundaries and trust zones defined.  
4. Major containers and modules/components are listed with responsibilities.  
5. Data, API/integration, security, deployment, and observability architectures are described.  
6. Technology stack is listed with rationale; ADRs recorded for material decisions.  
7. Quality attributes are mapped to NFRs and validation approaches.  
8. Risks, constraints, and trade-offs are documented; diagram inventory current.  
9. Traceability matrix links architecture to requirements and evidence.  
10. Approval status is assigned by authorized reviewer(s).

This mirrors **Section 8** quality checks; both must pass before architecture approval.

"""


def tab_table_to_md(block: str) -> str:
    ls = block.splitlines()
    i = 0
    out: list[str] = []
    while i < len(ls):
        line = ls[i]
        if "\t" in line and not line.strip().startswith("|"):
            rows: list[list[str]] = []
            j = i
            while j < len(ls) and "\t" in ls[j] and not ls[j].strip().startswith("|"):
                rows.append([p.strip() for p in ls[j].split("\t")])
                j += 1
            if rows:
                ncol = max(len(r) for r in rows)
                rows = [r + [""] * (ncol - len(r)) for r in rows]
                header = rows[0]
                out.append("| " + " | ".join(header[:ncol]) + " |")
                out.append("| " + " | ".join(["---"] * ncol) + " |")
                for r in rows[1:]:
                    out.append("| " + " | ".join(r[:ncol]) + " |")
                i = j
                continue
        out.append(line)
        i += 1
    return "\n".join(out)


def main() -> None:
    raw = TEMPLATE_SOURCE.read_text(encoding="utf-8")
    if "Architecture Document Template" not in raw:
        raise SystemExit(
            f"Expected marker 'Architecture Document Template' in {TEMPLATE_SOURCE}. "
            "See sources/ARD-001-template-source.md and Master Lifecycle/00.Notes.md."
        )

    lines = raw.splitlines()
    idx = next(i for i, L in enumerate(lines) if L.strip() == "Architecture Document Template")
    preamble = "\n".join(lines[:idx])
    pre_parts = re.split(r"\s*⸻\s*", preamble)
    if pre_parts and pre_parts[0].startswith("Master,"):
        pre_parts[0] = re.sub(r"^Master,[^\n]*\n\n?", "", pre_parts[0], count=1)
    purpose_body = re.sub(
        r"^Architecture Document\s*\n+\s*Purpose\s*\n+",
        "",
        pre_parts[0],
        count=1,
        flags=re.MULTILINE,
    ).strip()

    template_lines = lines[idx + 1 :]
    text = "\n".join(template_lines)
    if "Final Compact Version" in text:
        text = text.split("Final Compact Version")[0].rstrip()
    text = re.sub(r"\n⸻\n\nCompletion Criteria[\s\S]*", "", text)
    text = text.replace("⸻", "\n---\n")
    text = re.sub(
        r"Lifecycle Phase:\s*\n+\s*Lifecycle Phase:\s*\n+\s*Phase 7",
        "Lifecycle Phase: Phase 7 — Architecture and Design",
        text,
    )

    out_lines: list[str] = []
    for L in text.splitlines():
        m = re.match(r"^(\d{1,2})\.\s+(\S.*)$", L)
        if m and not L.startswith("#"):
            out_lines.append(f"#### {L}")
        else:
            out_lines.append(L)
    text = "\n".join(out_lines)
    text = tab_table_to_md(text)

    full = PROCEDURE + purpose_body + "\n\n" + TAIL + "\n" + text.strip() + "\n\n" + TAIL2
    OUT.write_text(full, encoding="utf-8")
    print(f"Wrote {OUT} ({len(full.splitlines())} lines)")


if __name__ == "__main__":
    main()
