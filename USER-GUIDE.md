# Master Lifecycle Platform — Operator Manual

| Field | Value |
|--------|--------|
| **Product** | Master Lifecycle Platform |
| **Document type** | User / operator manual |
| **Audience** | Project owners, reviewers, approvers, administrators, auditors |

## Scope

This manual describes how to operate the Master Lifecycle Platform from project creation through gate review, evidence management, traceability, reporting, and export. It follows the CYBERCUBE Master Lifecycle process: structured phases, required templates, evidence, validation, and formal gates.

---

## Table of contents

1. [Introduction](#1-introduction)  
2. [Navigation map](#2-navigation-map)  
3. [Dashboard](#3-dashboard)  
4. [Projects](#4-projects)  
5. [Lifecycle workspace](#5-lifecycle-workspace)  
6. [Phase navigator](#6-phase-navigator)  
7. [Completing a phase](#7-completing-a-phase)  
8. [Required templates](#8-required-templates)  
9. [Artifact library](#9-artifact-library)  
10. [Evidence attachments](#10-evidence-attachments)  
11. [Completion checklist](#11-completion-checklist)  
12. [Validation warnings](#12-validation-warnings)  
13. [Gate review submission](#13-gate-review-submission)  
14. [Gates screen](#14-gates-screen)  
15. [Approval center](#15-approval-center)  
16. [Traceability](#16-traceability)  
17. [Reports](#17-reports)  
18. [Project evidence package export](#18-project-evidence-package-export)  
19. [Audit trail](#19-audit-trail)  
20. [Operational workflows](#20-operational-workflows)  
21. [Best practices](#21-best-practices)  
22. [Troubleshooting](#22-troubleshooting)  
23. [User roles](#23-user-roles)  
24. [Governance principle](#24-governance-principle)  

---

## 1. Introduction

### 1.1 Purpose of the platform

The platform supports the full project lifecycle: idea capture through post-release maintenance. It enables you to:

- Create and configure projects  
- Advance through lifecycle phases  
- Complete required templates  
- Attach and link evidence  
- Run validation and satisfy checklists  
- Submit phases for gate review  
- Record approvals and decisions  
- Maintain traceability across objects  
- Generate reports and export evidence packages  

### 1.2 Core workflow (conceptual)

The system organizes work in this order:

1. **Project** — container for identity, model, and history  
2. **Lifecycle phase** — unit of work with requirements  
3. **Required templates** — forms or documents mandated by the phase  
4. **Evidence** — proof linked to phase, artifact, gate, or requirement  
5. **Validation** — automated checks before submission  
6. **Gate review** — formal decision on phase completion  
7. **Outcome** — approval, conditional approval, changes requested, rejection, or deferral  
8. **Next phase** — unlocked after applicable gate rules are satisfied  

A phase is not complete until required templates, evidence, checklist items, and gate prerequisites defined by the platform are satisfied.

---

## 2. Navigation map

The primary navigation is the **left sidebar**. Use it to reach these areas:

| Area | Function |
|------|----------|
| **Dashboard** | Active projects, blockers, gate status, next actions |
| **Projects** | Create projects; project list, profile, timeline, artifacts, gates, traceability, audit |
| **Lifecycle Workspace** | Phase work: templates, evidence, checklist, validation, gate submission |
| **Gates** | Gate readiness, decisions, approval status |
| **Artifacts** | Generated lifecycle documents |
| **Evidence** | Supporting proof, attachments, evidence records |
| **Traceability** | Links between phases, artifacts, requirements, gates, evidence |
| **Approvals** | Pending approvals and decision history |
| **Reports** | Lifecycle, gate, traceability, evidence, and export-oriented reports |
| **Settings** | Lifecycle rules, templates, gates, roles, exports, storage |

---

## 3. Dashboard

### 3.1 Description

The Dashboard is the default operational overview. Use it at the start of each session to prioritize work.

### 3.2 Information presented

| Element | Meaning |
|---------|---------|
| **Active projects** | Count of open projects |
| **Lifecycle progress** | Progress of each project through the lifecycle |
| **Gate status summary** | Approved, pending, blocked, or awaiting review |
| **Blockers / missing evidence** | Gaps that prevent or delay progress |
| **Recent decisions** | Latest gate outcomes, approvals, or change requests |
| **Continue next required action** | Shortcut to the highest-priority task |

### 3.3 Procedure: daily Dashboard review

1. Open **Dashboard**.  
2. Review metric cards at the top.  
3. Note red or amber indicators.  
4. Open **My Next Actions** or **Continue Working** as applicable.  
5. Select the indicated action to open the correct project context.  

---

## 4. Projects

### 4.1 Description

**Projects** lists all lifecycle projects and hosts project-level detail: profile, timeline, artifacts, gates, traceability, and audit history.

### 4.2 Screen areas

| Area | Content |
|------|---------|
| **Project list** | All projects |
| **Project overview** | Status and progress for the selected project |
| **Project profile** | Name, code, type, owner, business area, description, lifecycle model |
| **Lifecycle timeline** | Phases and current position |
| **Artifacts** | Lifecycle documents for the project |
| **Gates** | Gate decisions and readiness |
| **Traceability** | Object-to-object links |
| **Audit trail** | Chronological activity log |

### 4.3 Procedure: open and inspect a project

1. Open **Projects**.  
2. Select a project in the list.  
3. Read the **Project overview**.  
4. Use tabs for **Profile**, **Timeline**, **Artifacts**, **Gates**, **Traceability**, or **Audit trail** as needed.  
5. Choose **Go to Lifecycle Workspace** to perform phase work.  

### 4.4 Procedure: create a new project

1. Open **Projects**.  
2. Select **New Project**.  
3. Enter required project fields (see §4.5).  
4. Select the **Lifecycle model** (commonly Standard 14-Phase Lifecycle).  
5. Save the project.  
6. Confirm the system opens the project overview or Phase 1 workspace.  

### 4.5 Required fields at creation

| Field | Requirement |
|-------|-------------|
| **Project name** | Clear, descriptive title |
| **Project code** | Short unique identifier (example format: SIP-001) |
| **Project type** | Category such as platform, application, service, internal tool |
| **Owner** | Accountable project owner |
| **Business area** | Owning domain (e.g. security, operations, finance, compliance) |
| **Lifecycle model** | Model governing phases and gates |
| **Description** | Brief statement of goals and scope |

---

## 5. Lifecycle workspace

### 5.1 Description

Most day-to-day work occurs in the **Lifecycle Workspace**: current phase, templates, checklist, evidence, validation, and gate submission.

### 5.2 Screen areas

| Area | Function |
|------|----------|
| **Phase navigator** | All phases and status |
| **Current phase workspace** | Objectives and instructions for the active phase |
| **Required templates** | Mandatory documents or forms |
| **Completion checklist** | Readiness for gate submission |
| **Evidence attachments** | Files or records linked to the phase |
| **Validation warnings** | Issues that must or should be resolved |
| **Submit for gate review** | Initiates gate workflow when enabled |

---

## 6. Phase navigator

### 6.1 Visual states

| State | Typical presentation |
|-------|----------------------|
| Completed | Green checkmark or equivalent |
| Current | Highlighted (e.g. blue) |
| Not started | Muted or gray |
| Blocked | Warning or red indicator |

### 6.2 Procedure: navigate phases

1. Open **Lifecycle Workspace**.  
2. Identify the **current** phase in the navigator.  
3. Select a **previous** phase to inspect completed work (read-only or per policy).  
4. Select the **current** phase to continue work.  
5. **Future** phases remain locked until prior gates and rules allow access.  

---

## 7. Completing a phase

### 7.1 End-to-end procedure

1. Open the **current** phase in the Lifecycle Workspace.  
2. Read the **phase objective** and guidance.  
3. Complete all **required templates**.  
4. **Attach** and **link** supporting evidence.  
5. Resolve all blocking **validation** items.  
6. Complete every required **checklist** item.  
7. When **Submit for gate review** is enabled, submit the phase.  

### 7.2 Preconditions before submission

Do not submit until all of the following are true:

- All required templates **exist**.  
- All required templates are **complete**.  
- Required **evidence** is attached and linked as required.  
- **Validation warnings** that block submission are cleared.  
- **Checklist** requirements for the phase are satisfied.  
- The UI shows **gate submission** as enabled.  

---

## 8. Required templates

### 8.1 Definition

**Templates** are structured forms or documents mandated by a phase. Completing them produces or updates **artifacts**.

### 8.2 Example template names (non-exhaustive)

- Idea Capture Form  
- Problem Definition Document  
- Project Selection Scorecard  
- Feasibility Assessment  
- Business Case  
- Architecture Document  
- UI/UX Design Document  
- Data Model / ERD  
- Acceptance Test Scenarios  
- Deployment Checklist  
- Post-Release Review  

### 8.3 Procedure: complete a template

1. In **Lifecycle Workspace**, open **Required Templates**.  
2. Select a template.  
3. Fill all **required** sections.  
4. **Save draft** as you work.  
5. Run **Validate** when offered.  
6. **Preview artifact** and confirm output quality.  
7. **Mark complete** when the template meets phase rules.  

### 8.4 Template status values

| Status | Meaning |
|--------|---------|
| **Not started** | Template instance exists; no substantive content |
| **In progress** | Partial completion |
| **Completed** | Required sections satisfied |
| **Changes requested** | Reviewer requires revisions |
| **Approved** | Accepted by review workflow |

---

## 9. Artifact library

### 9.1 Definition

An **artifact** is the generated output from a completed template (e.g. rendered document, structured export).

**Relationship:** Template (completed data) → generated **artifact** → optional Markdown / JSON evidence views.

### 9.2 Typical actions

- View lifecycle documents  
- Inspect artifact status  
- Open generated Markdown  
- Review JSON evidence  
- View version history  
- Link artifacts to gates  
- Export artifacts  

### 9.3 Recommended check

After marking a template complete, open the **artifact preview** and confirm formatting and content before submitting the phase for gate review.

---

## 10. Evidence attachments

### 10.1 Definition

**Evidence** is supporting material that substantiates lifecycle claims (completeness, correctness, or approval).

### 10.2 Example evidence types

- Market research  
- Cost estimates  
- Architecture diagrams  
- Requirements documents  
- Meeting notes  
- Approval correspondence  
- Test results  
- Deployment checklists  
- Risk assessments  
- Screenshots  
- Exported JSON records  

### 10.3 Procedure: add evidence

1. In **Lifecycle Workspace**, open **Evidence Attachments**.  
2. Select **Add Evidence**.  
3. Choose file or record type per policy.  
4. **Link** evidence to the correct template, phase, gate, requirement, or other object.  
5. Save.  

### 10.4 Linking rules

Evidence should be linked to the specific object it supports, for example:

- Phase  
- Artifact  
- Gate  
- Requirement  
- Approval  
- Decision  

Uploading a file without correct **links** may not satisfy checklist or validation rules.

---

## 11. Completion checklist

### 11.1 Purpose

The checklist aggregates phase readiness for gate submission.

### 11.2 Typical checklist items

- All required templates created  
- Required templates completed  
- Required evidence attached and linked  
- Validation warnings resolved (per policy)  
- Traceability links complete where required  
- Explicit readiness for gate review  

### 11.3 Procedure: work the checklist

1. Open the **Completion Checklist** (commonly right panel).  
2. Identify incomplete items.  
3. Use linked shortcuts to open the related template or evidence record.  
4. Remediate the gap.  
5. Return to the checklist and refresh or re-validate as needed.  
6. Repeat until mandatory items are complete.  

---

## 12. Validation warnings

### 12.1 Severity levels

| Level | Typical handling |
|-------|------------------|
| **Info** | Recommendation; may not block submission |
| **Warning** | Should be fixed before review |
| **Error** | Must be fixed before submission |

### 12.2 Example conditions

- Empty required template section  
- Missing scoring justification  
- Recommended evidence not attached  
- Incomplete approval data blocking gate submission  
- Missing traceability link  

### 12.3 Procedure: resolve a warning

1. Open the **Validation warnings** list.  
2. Select a warning to navigate to the related object.  
3. Correct missing or weak content.  
4. Save changes.  
5. Re-run **validation**.  
6. Confirm the warning clears or is downgraded per policy.  

---

## 13. Gate review submission

### 13.1 Definition

A **gate** is a formal decision point on phase completion and readiness to proceed.

### 13.2 Submission sequence

1. Complete phase work per §7.  
2. Complete required templates per §8.  
3. Attach and link evidence per §10.  
4. Resolve blocking validation per §12.  
5. Complete the checklist per §11.  
6. Execute **Submit for Gate Review**.  

### 13.3 Possible outcomes

| Outcome | Effect |
|---------|--------|
| **Approved** | Proceed to next phase per model |
| **Conditional approval** | Proceed with documented conditions to close |
| **Changes requested** | Revise work and resubmit |
| **Rejected** | Halt or reopen per governance |
| **Parked / deferred** | Pause pending future review |

---

## 14. Gates screen

### 14.1 Purpose

Review gate status across the portfolio or drill into a single project’s gates.

### 14.2 Typical actions

- View pending gate reviews  
- Open gate detail  
- Review required inputs  
- Inspect linked evidence  
- Record or view decisions  
- Browse gate history  
- Track approval status  

### 14.3 Gate detail content (typical)

- Gate code and name  
- Related phase  
- Required artifacts and evidence  
- Completion checklist state  
- Approver comments  
- Decision options and recorded **decision**  

---

## 15. Approval center

### 15.1 Purpose

Centralizes human decisions: what is pending, what was decided, and the audit trail of approvals.

### 15.2 Areas

| Area | Function |
|------|----------|
| **Pending approvals** | Queue of items awaiting action |
| **Approval detail** | Item, evidence, and discussion context |
| **Approver comments** | Feedback and rationale |
| **Decision actions** | Approve, reject, or request changes |
| **Approval history** | Past outcomes |

### 15.3 Procedure: process an approval

1. Open **Approvals**.  
2. Open **Pending Approvals**.  
3. Select an item.  
4. Review artifact and evidence.  
5. Enter **comments** as required by policy.  
6. Select **Approve**, **Reject**, or **Request changes**.  
7. **Submit** the approval record.  

---

## 16. Traceability

### 16.1 Purpose

**Traceability** demonstrates that decisions, artifacts, requirements, tests, gates, and evidence form a defensible chain.

### 16.2 Typical link types

- Phase → Artifact  
- Artifact → Gate  
- Requirement → Design  
- Requirement → Test  
- Gate → Evidence  
- Evidence → Approval  
- Decision → Audit record  

### 16.3 Procedure: improve traceability coverage

1. Open **Traceability**.  
2. Review overall **coverage** or health indicator.  
3. Identify missing or orphaned links.  
4. Open each gap.  
5. Create the missing **source → target** link.  
6. Re-check traceability until acceptable.  

### 16.4 Questions traceability answers

- Why was this decision made?  
- What evidence supports it?  
- Which requirement does this artifact satisfy?  
- Which test validates this requirement?  
- Which gate approved this phase?  

---

## 17. Reports

### 17.1 Available reports

| Report | Content |
|--------|---------|
| **Lifecycle status** | Overall progress |
| **Gate decision** | Outcomes, dates, approvers, notes |
| **Traceability** | Links and coverage gaps |
| **Missing evidence** | Gaps by phase or gate |
| **Approval history** | Decisions and comments |
| **Full project evidence package** | Consolidated export (see §18) |

### 17.2 Procedure: generate a report

1. Open **Reports**.  
2. Select **report type**.  
3. Select **project** and **scope**.  
4. Choose inclusions: artifacts, evidence, decisions, as offered.  
5. **Generate** the report.  
6. **Export** or save per local policy.  

---

## 18. Project evidence package export

### 18.1 When to use

Use a **full project evidence package** for audits, handovers, or archival snapshots.

### 18.2 Typical package contents

- Markdown artifacts  
- JSON evidence records  
- Gate decisions  
- Approval records  
- Traceability matrix  
- Audit trail  
- Lifecycle status report  
- Missing evidence report (if selected)  

### 18.3 Procedure: export

1. Open **Reports**.  
2. Select **Full Project Evidence Package**.  
3. Select **project** and **lifecycle scope**.  
4. Choose **included record types**.  
5. **Generate** the package.  
6. **Download** or save to approved storage.  

---

## 19. Audit trail

### 19.1 Purpose

The **audit trail** is the authoritative chronological log of significant project events.

### 19.2 Example events

- Project created or profile updated  
- Phase started  
- Template completed; artifact generated  
- Evidence attached  
- Gate submitted, approved, or changes requested  
- Trace link created  
- Report exported  

### 19.3 When to consult it

Use the audit trail to answer **what** happened, **when** it happened, and **who** performed the action, for investigations, retrospectives, or external review.

---

## 20. Operational workflows

### 20.1 Daily workflow (recommended)

1. Start at **Dashboard**.  
2. Review **My Next Actions**.  
3. Open the active **project**.  
4. Enter **Lifecycle Workspace**.  
5. Progress **required templates**.  
6. Attach and link **evidence**.  
7. Clear **validation warnings**.  
8. Confirm **completion checklist**.  
9. **Submit for gate review** when ready.  
10. Pull **reports** or **export** evidence when milestones require it.  

### 20.2 Project lifecycle workflow (recommended)

1. Create project (§4.4).  
2. Complete Phase 1; submit Gate 1 if the model requires it.  
3. Repeat for subsequent phases and gates.  
4. Maintain evidence and traceability continuously.  
5. Record approvals and decisions in workflow.  
6. Generate reports at major milestones.  
7. Export full evidence package at project completion or audit request.  

---

## 21. Best practices

- Use clear project names and **consistent** project codes.  
- Complete templates in the **intended order** for the phase.  
- Do not skip evidence; link it at the time of creation.  
- Resolve validation warnings **early**.  
- Maintain traceability **while** working, not only at gate time.  
- Re-read gate readiness before submission.  
- Use approver comments to document **rationale**.  
- Export evidence packages at **milestones**, not only at the end.  

---

## 22. Troubleshooting

### 22.1 Submit for gate review is disabled

Verify:

- Required templates are incomplete.  
- Required evidence is missing or not linked.  
- Blocking validation warnings remain.  
- Checklist is incomplete.  
- Gate is already submitted for this submission cycle.  
- Current phase is locked by policy or prior outcome.  

### 22.2 Phase is blocked

Verify:

- Prior gate is not approved.  
- A required approval is missing.  
- A critical validation **error** exists.  
- Project status is paused or rejected.  

### 22.3 Evidence uploaded but still reported missing

Verify:

- Evidence is linked to the correct **artifact** or **gate**, not only the phase.  
- Evidence record is marked **complete** if the product distinguishes draft vs. complete.  
- Evidence **type** satisfies the phase or gate requirement.  

### 22.4 Low traceability coverage

Verify:

- Artifacts are linked to **gates**.  
- Requirements link to **designs** and **tests**.  
- Evidence links to **decisions** where required.  
- **Approvals** link to gate records.  

---

## 23. User roles

| Role | Typical responsibilities |
|------|---------------------------|
| **Project owner** | Create project; complete phase work; submit gates |
| **Reviewer** | Review artifacts, evidence, gate readiness |
| **Approver** | Approve, reject, or request changes |
| **Administrator** | Configure lifecycle models, templates, gates, roles, exports |
| **Auditor / viewer** | Read-only access to history, reports, evidence, traceability |

Actual permissions depend on tenant configuration.

---

## 24. Governance principle

**Rule of thumb:** If the project cannot **prove** a claim with linked artifacts and evidence, it should not pass the gate.

The platform is intended to make lifecycle work **visible**, **structured**, **reviewable**, and **evidence-based**—not merely to track percent complete, but to support defensible decisions at each gate.

---

*End of manual.*
