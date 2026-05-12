# Stakeholder and User Profile (SUP-001)

**Classification:** Keep — standalone Phase 5 stakeholder/user elicitation template; supports CRS **overall description** (users, context) and structured elicitation before CRS/SRS baseline.

**Canonical ID:** SUP-001.

This document identifies **people, groups, roles, organizations, and systems** affected by a software project—who is served, who decides, who uses and maintains the product, and who bears impact if the initiative fails. It is **not** a substitute for the **CRS** or **SRS**; it gathers and organizes stakeholder intelligence so Phase 5 authoring (`11. Phase 5 — Requirements Definition.md`) is grounded in real actors.

**Gate context:** Supports **G4 — Requirements Approved** by grounding CRS/SRS actors, authority, communication needs, operational roles, and user needs.

SUP-001 does **not** replace CRS, SRS, Template A-8, or UXD-001. It supplies stakeholder/user evidence for those artifacts.

For lifecycle position see **`06. Lifecycle Overview.md`**; for Tier 1–2 outputs see **`USSM — Unified Software Standards Manual v1.0.md`** §§4–5; for CRS/SRS outlines see **`28. Appendix A — Template Library.md`** (Templates A-1, A-2).

---

## 1. Purpose

- Define **who** the project serves, **who** influences or approves decisions, **who** uses and supports the system, and **who** is affected by success or failure.
- Reduce vague requirements by tying needs to **identified users**, **business stakeholders**, and **operational owners**.
- Capture **personas**, **pain points**, **authority**, **communication needs**, **accessibility**, and **support roles** in one controlled package used during elicitation and early CRS drafting.

---

## 2. Applicability

Produce or refresh this artifact **during Phase 5**, alongside interviews and workshops—**before** treating the CRS as complete. Small projects may shorten sections but should still distinguish users, decision-makers, and maintainers.

---

## 3. Owner and supporting roles

**Primary owner:** Project Owner.

**Supporting contributors:**

| Role | Responsibility |
| --- | --- |
| Product / business reviewer | Business stakeholders, customer groups, decision-makers |
| UX / UI designer | Personas, workflows, needs, frustrations, accessibility |
| Technical lead / architect | Technical stakeholders, system owners, integration and maintenance concerns |
| Security / governance reviewer | Compliance, data owners, privacy, approval paths |
| Support / operations reviewer | Administrators, support roles, maintenance owners, operational users |

On solo projects one person may wear several hats; the document should still **separate** user types, approvers, and operators.

---

## 4. Relationship to Phase 5 outputs

| Phase 5 artifact | How SUP-001 helps |
| --- | --- |
| **CRS** (Template A-1) | Informs §2 overall description—users, context, constraints expressed in stakeholder language |
| **SRS** (Template A-2) | Clarifies actor roles for interfaces, NFRs (usability, accessibility), operational assumptions |
| **Traceability seed** | Links needs to named groups and evidence (interviews, this document) |

---

## 5. Required sections (14)

1. Project Identification  
2. Source Documents  
3. Stakeholder Summary  
4. Stakeholder Inventory  
5. User Group Inventory  
6. User Personas  
7. User Needs and Pain Points  
8. User Goals and Success Outcomes  
9. Stakeholder Influence and Decision Authority  
10. Communication and Feedback Needs  
11. Accessibility, Inclusion, and Usability Considerations  
12. Support and Operational Roles  
13. Conflicts, Constraints, and Open Questions  
14. Approval Status  

---

## 6. Completion criteria

The Stakeholder and User Profile package is **complete** when:

1. Project is identified and source inputs are listed.  
2. Stakeholder groups are summarized and inventoried.  
3. User groups and **major personas** are documented.  
4. Needs, pain points, and success outcomes are stated per group where relevant.  
5. **Decision authority** and communication needs are clear.  
6. Accessibility / usability considerations and **support roles** are addressed (or explicitly marked unknown / TBD).  
7. Conflicts, constraints, and open questions are visible—not hidden.  
8. **Approval status** and reviewer are recorded.

The package is **not complete** if users are vague, approvers undefined, support ownership missing, or unresolved stakeholder conflicts are omitted.

---

## 7. Approval statuses

| Status | Meaning |
| --- | --- |
| Draft | In preparation |
| Submitted | Submitted for review |
| Under Review | Reviewers evaluating |
| Approved | Accepted for use in CRS/SRS authoring |
| Approved with Changes | Accepted after listed edits |
| Research Required | More stakeholder or user research needed |
| Rejected | Not accepted |

---

## 8. Related documents

| Document | Role |
| --- | --- |
| `11. Phase 5 — Requirements Definition.md` | Phase owner; Gate G4 |
| `12. Phase 6 — Planning and Scope Control.md` | Stakeholder authority and user groups can affect scope boundaries and prioritization |
| `21. Decision Gates.md` | G4 — Requirements Approved evidence and outcomes |
| `28. Appendix A — Template Library.md` | CRS (A-1), SRS (A-2) |
| `08. Phase 2 — Problem Definition.md` | Problem and affected-party baseline |
| `07. Phase 1 — Idea Capture.md` | Early beneficiaries / sponsor context |
| `22. Required Documents.md` | Artifact register |
| `24. Traceability Rules.md` | Linking needs to requirements IDs |
| `25. Quality and Compliance Checks.md` | Phase 5 / G4 quality expectations |
| `26. Change Control.md` | Managing stakeholder/user-impacting changes after baselines are approved |
| `UI-UX Design Document — UXD-001 Procedure.md` | UX goals, personas, journeys, and user-facing design decisions |

---

## 9. Template — Stakeholder and User Profile Document

### 9.1 Project identification

```
Project Name:
Project Owner:
Date Prepared:
Prepared By:
Reviewer(s):
Lifecycle Phase: Phase 5 — Requirements Definition
```

---

### 9.2 Source documents

List inputs used to identify stakeholders and users.

```
Source Documents:
- Idea Capture Form:
- Problem Definition Document:
- Project Selection Scorecard:
- Feasibility Assessment:
- Business Case:
- Stakeholder Interviews:
- User Research Notes:
- Existing System Review:
- Other:
```

---

### 9.3 Stakeholder summary

Short overview of main groups affected.

```
Stakeholder Summary:
```

Questions: Who requested / pays for / approves the project? Who uses, supports, maintains it? Who is harmed if it fails; who benefits if it succeeds?

---

### 9.4 Stakeholder inventory

| Stakeholder / group | Type | Interest in project | Influence | Required involvement | Notes |
| --- | --- | --- | --- | --- | --- |
| | Business / User / Technical / Operations / Compliance / Other | | High / Med / Low | Approver / Reviewer / Contributor / Informed | |

Suggested types: Business, Customer, End User, Administrator, Technical, Operations, Security, Compliance, Support, Vendor, External Partner, Regulator.

---

### 9.5 User group inventory

| User group | Description | Primary tasks | Frequency of use | Experience level | Notes |
| --- | --- | --- | --- | --- | --- |
| | | | Daily / Weekly / Monthly / Occasional | Beginner / Intermediate / Advanced | |

Questions: Who logs in, enters data, reviews, approves, receives notifications, uses reports, configures the system, supports end users?

---

### 9.6 User personas

Repeat blocks for each major user type (add copies as needed; avoid personas that do not affect requirements).

```
Persona Name:
User Group:
Role:
Experience Level:
Primary Goal:
Main Pain Point:
Common Tasks:
Devices Used:
Environment:
Accessibility Needs:
Success Definition:
```

---

### 9.7 User needs and pain points

| User group | Need | Pain point | Current workaround | Project opportunity |
| --- | --- | --- | --- | --- |
| | | | | |

---

### 9.8 User goals and success outcomes

| User group | Goal | Success outcome | How success may be measured |
| --- | --- | --- | --- |
| | | | |

Examples: faster task completion; fewer manual steps or errors; higher satisfaction; fewer tickets; better adoption; clearer reporting.

---

### 9.9 Stakeholder influence and decision authority

| Person / group | Decision area | Authority level | Approval required? | Notes |
| --- | --- | --- | --- | --- |
| | Scope / Requirements / Budget / Security / Release / Maintenance | High / Med / Low | Yes / No | |

**Authority:** High — approve, reject, or block · Medium — influence or force rework · Low — informed / consulted.

---

### 9.10 Communication and feedback needs

| Stakeholder / user group | Communication need | Frequency | Method | Owner |
| --- | --- | --- | --- | --- |
| | Status updates; requirement review; prototype feedback; etc. | Weekly / Biweekly / Monthly | Email / Meeting / Demo / Report | |

---

### 9.11 Accessibility, inclusion, and usability

```
Accessibility considerations:
Device considerations:
Language / localization:
Environment considerations:
Usability risks:
```

Consider: mobile vs desktop; low vision; keyboard-only; screen readers; limited technical experience; field use; slow connectivity; time pressure; shared devices; multilingual users.

---

### 9.12 Support and operational roles

| Role | Responsibility | Owner / group | Notes |
| --- | --- | --- | --- |
| System administrator | | | |
| Support contact | | | |
| Maintenance owner | | | |
| Data owner | | | |
| Security owner | | | |
| Business owner | | | |

---

### 9.13 Conflicts, constraints, and open questions

```
Stakeholder conflicts:
-
Constraints:
-
Open questions:
-
Required follow-up:
-
```

Examples: simplicity vs admin depth; speed vs compliance; offline need vs sync complexity; unclear maintenance owner.

---

### 9.14 Approval status

```
Approval Status:
Reviewer:
Review Date:
Decision Notes:
```

---

## Document history

| Version | Note |
| --- | --- |
| 1.0 | SUP-001 aligned to Master Lifecycle Phase 5 and USSM CRS/SRS flow |
