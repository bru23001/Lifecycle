# Non-Functional Requirements (NFR-001)

**Classification:** Keep — standalone Phase 5 NFR register/template; expands **SRS** non-functional content (USSM Tier 2 / Template A-2 §3.2) into a reviewable, categorized register before baseline.

**Canonical ID:** NFR-001.

**Gate context:** Supports **G4 — Requirements Approved** as the controlled NFR source when detailed non-functional classification is needed.

Functional requirements describe **what** the system does; non-functional requirements describe **how well** it must behave and **under what conditions** it operates—security, reliability, performance, privacy, accessibility, observability, operations, and compliance.

This document is **not** a substitute for the **SRS**: NFRs authored here **must** align with stable **`SRS-NFR-…`** identifiers and roll into the baselined SRS (Template **A-2**) for Gate **G4**. Use NFR-001 when teams want a **single working catalog** by quality dimension before or alongside SRS assembly.

For lifecycle position see **`06. Lifecycle Overview.md`**; for Phase 5 gates see **`11. Phase 5 — Requirements Definition.md`**; for CRS/SRS outlines see **`28. Appendix A — Template Library.md`**.

---

## 1. Purpose

- Capture **measurable** quality attributes, constraints, and operating expectations.
- Ensure NFRs are **testable**, **prioritized**, and **traceable** to validation evidence (Phase 10) and design rationale (Phase 7).
- Align security, privacy, observability, and quality themes with **CYBERCUBE** standards where applicable (security policy, observability standard, testing standard, data classification)—cite standard IDs in the requirement text or traceability matrix where helpful.

---

## 2. Applicability

Produce or refresh during **Phase 5**, **before** Gate **G4**. Small projects may shorten sections but **must not** leave critical dimensions implicit (“secure”, “fast”) without metrics or verification hooks.

---

## 3. Owner and supporting roles

**Primary owner:** Project Owner (acceptance of the NFR set for baseline alignment).

**Supporting contributors:**

| Role | Responsibility |
| --- | --- |
| Technical lead / architect | Performance, scalability, maintainability, architecture-frozen constraints |
| Security / governance reviewer | Security, privacy, compliance, audit, data protection |
| Operations / DevOps reviewer | Deployment, monitoring, backup, recovery, support |
| QA / test reviewer | Turns NFRs into measurable acceptance / validation hooks |
| Product / UX reviewer | Usability, accessibility, responsiveness, experience |

On solo projects one person may wear several hats; each NFR should still have **priority**, **verification method**, and **evidence slot**.

---

## 4. Relationship to Phase 5 outputs

| Artifact | How NFR-001 relates |
| --- | --- |
| **SRS** (Template A-2) | NFRs here **normalize into** SRS §Non-functional requirements with **`SRS-NFR-…`** IDs |
| **CRS** (Template A-1) | Stakeholder-level quality needs inform CRS §3; engineering detail stays in SRS/NFR-001 |
| **Traceability matrix** | Each row links **SRS-NFR-…** ↔ validation (TC-, automated checks, review record) per **`24. Traceability Rules.md`** |
| **Gate G4** | Vague or unverifiable NFRs block approval—see **`11. Phase 5 — Requirements Definition.md`** §8 |

**Identifier convention:** While drafting, category prefixes such as `NFR-PERF-001` aid readability. At SRS baseline, map each item to **`SRS-NFR-XXX`** (program-standard numbering). Do not maintain two conflicting ID schemes after baseline.

---

## 5. Required sections (21)

1. Project Identification  
2. Source Documents  
3. Non-Functional Requirements Summary  
4. Performance Requirements  
5. Scalability Requirements  
6. Availability and Reliability Requirements  
7. Security Requirements  
8. Privacy and Data Protection Requirements  
9. Compliance Requirements  
10. Usability Requirements  
11. Accessibility Requirements  
12. Responsiveness and Device Support Requirements  
13. Maintainability Requirements  
14. Observability and Logging Requirements  
15. Backup and Recovery Requirements  
16. Deployment and Environment Requirements  
17. Integration and Interoperability Requirements  
18. Data Management Requirements  
19. Support and Operations Requirements  
20. NFR Traceability Matrix  
21. Approval Status  

---

## 6. Completion criteria

The Non-Functional Requirements package is **complete** when:

1. Project is identified and source inputs are listed.  
2. Summary captures the **most critical** quality expectations and failure modes.  
3. Each **applicable** category is reviewed; non-applicable categories are marked **N/A** with a one-line rationale.  
4. Each requirement has a **unique ID** (draft or `SRS-NFR-…`).  
5. Each requirement is **measurable or verifiable** (metric, threshold, or explicit review criterion).  
6. **Priority** and **validation method** are recorded per requirement or per category where uniformly applied.  
7. Security, privacy, accessibility, performance, maintainability, and operations are addressed or explicitly deferred with risk acknowledgment.  
8. **Traceability matrix** rows link IDs to validation evidence plans.  
9. **Approval status** and named reviewer/date are recorded.

The package is **not complete** if requirements are vague (“robust”, “user-friendly”), lack IDs or verification paths, or contradict the SRS without a recorded change.

---

## 7. Approval statuses

| Status | Meaning |
| --- | --- |
| Draft | NFRs still being written |
| Submitted | Submitted for review |
| Under Review | Reviewers evaluating |
| Approved | Accepted to guide architecture and testing |
| Conditionally Approved | Accepted only after listed changes |
| Revision Required | Must be revised before approval |
| Rejected | Not acceptable for baseline use |

---

## 8. Related documents

| Document | Role |
| --- | --- |
| `11. Phase 5 — Requirements Definition.md` | Phase owner; Gate G4; CRS/SRS baseline |
| `21. Decision Gates.md` | G4 — Requirements Approved evidence and outcomes |
| `28. Appendix A — Template Library.md` | Template A-2 (SRS), NFR subsection |
| `24. Traceability Rules.md` | ID conventions and matrix expectations |
| `25. Quality and Compliance Checks.md` | Phase 5 / G4 quality expectations for testable, traceable NFRs |
| `26. Change Control.md` | Managing changes to baselined NFRs after G4 |
| `08. Phase 2 — Problem Definition.md` | Operational / impact themes |
| `13. Phase 7 — Architecture and Design.md` | NFRs inform DDS/SDD and ADRs |
| `16. Phase 10 — Testing and Validation.md` | Validation of NFR targets |
| `22. Required Documents.md` | Artifact register |

---

## 9. Template — Non-Functional Requirements Document

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

List documents used to derive NFRs.

```
Source Documents:
- Idea Capture Form:
- Problem Definition Document:
- Project Selection Scorecard:
- Feasibility Assessment:
- Business Case:
- Customer Requirements Specification:
- Software Requirements Specification:
- Security / Compliance Notes:
- Architecture Notes:
- Other:
```

---

### 9.3 Non-functional requirements summary

Short summary of the **most important** quality expectations.

```
NFR Summary:
```

Questions: What qualities matter most? What would make the system unacceptable even if features work? What risks must be mitigated? What operating conditions must hold?

---

### 9.4 Performance requirements

```
Performance Requirements:
```

Examples:

- `NFR-PERF-001` / `SRS-NFR-###`: The system shall load the main dashboard in under 2 seconds under normal operating conditions.  
- `NFR-PERF-002`: API responses shall complete within 500 ms for 95% of standard requests.  
- `NFR-PERF-003`: Search results shall display within 1 second for datasets under 10,000 records.

| Field | Value |
| --- | --- |
| Requirement ID | NFR-PERF-### / SRS-NFR-### |
| Requirement statement | |
| Metric / threshold | |
| Test method | |
| Priority | |
| Status | |

---

### 9.5 Scalability requirements

```
Scalability Requirements:
```

Examples:

- `NFR-SCAL-001`: Support at least 100 concurrent active users without degradation under normal usage.  
- `NFR-SCAL-002`: Database design supports growth to 1 million records without schema redesign.  
- `NFR-SCAL-003`: Architecture allows horizontal scaling of backend services if capacity is exceeded.

---

### 9.6 Availability and reliability requirements

```
Availability / Reliability Requirements:
```

Examples:

- `NFR-REL-001`: Target 99.5% monthly availability after production release.  
- `NFR-REL-002`: User-visible behavior when a dependency fails (graceful degradation / messaging).  
- `NFR-REL-003`: No silent data loss during normal user operations.

---

### 9.7 Security requirements

```
Security Requirements:
```

Examples:

- `NFR-SEC-001`: Authentication only over encrypted HTTPS.  
- `NFR-SEC-002`: Passwords never stored in plaintext.  
- `NFR-SEC-003`: Administrative actions require role-based authorization.  
- `NFR-SEC-004`: Validate external input before processing.  
- `NFR-SEC-005`: Sensitive operations recorded in audit logs.

Common areas: authentication; authorization; input validation; sessions; encryption; secrets; audit logging; rate limiting; secure errors; dependency posture.

---

### 9.8 Privacy and data protection requirements

```
Privacy / Data Protection Requirements:
```

Examples:

- `NFR-PRI-001`: Collect only data required for stated purposes.  
- `NFR-PRI-002`: Personal data not shown to unauthorized users.  
- `NFR-PRI-003`: Sensitive fields redacted from logs and user-visible errors.  
- `NFR-PRI-004`: Retention rules documented before production release.

---

### 9.9 Compliance requirements

```
Compliance Requirements:
```

Examples:

- `NFR-COMP-001`: Meet applicable internal security and documentation standards.  
- `NFR-COMP-002`: Retain evidence needed for release approval.  
- `NFR-COMP-003`: Security-relevant actions auditable.

Areas: internal standards; contracts; accessibility regulations; privacy laws; industry rules; retention obligations.

---

### 9.10 Usability requirements

```
Usability Requirements:
```

Examples:

- `NFR-USE-001`: First-time user completes primary workflow without formal training (or training scope explicitly documented).  
- `NFR-USE-002`: Errors explain what happened and next steps.  
- `NFR-USE-003`: Destructive actions confirmed or undoable where appropriate.

---

### 9.11 Accessibility requirements

```
Accessibility Requirements:
```

Examples:

- `NFR-ACC-001`: Keyboard navigation for primary actions.  
- `NFR-ACC-002`: Visible labels and accessible error associations on forms.  
- `NFR-ACC-003`: Color not the only channel for critical information.  
- `NFR-ACC-004`: Touch targets adequate for mobile use.

---

### 9.12 Responsiveness and device support requirements

```
Responsiveness / Device Support Requirements:
```

Examples:

- `NFR-RESP-001`: Layout supports desktop, tablet, and mobile breakpoints.  
- `NFR-RESP-002`: Support latest stable Chrome, Safari, Firefox, Edge (list approved versions).  
- `NFR-RESP-003`: Critical workflows available on mobile.

---

### 9.13 Maintainability requirements

```
Maintainability Requirements:
```

Examples:

- `NFR-MAINT-001`: Codebase follows approved repository layout (Template A-13 and Phase 8 DGP-001 guidance when used).  
- `NFR-MAINT-002`: Major modules have clear boundaries and documented interfaces.  
- `NFR-MAINT-003`: Developer setup documented for future contributors.  
- `NFR-MAINT-004`: Configuration externalized from source code.

---

### 9.14 Observability and logging requirements

```
Observability / Logging Requirements:
```

Examples:

- `NFR-OBS-001`: Application errors logged with context for troubleshooting (align observability fields to program STD-OPS-003 expectations where applicable).  
- `NFR-OBS-002`: No passwords, secrets, tokens, or unnecessary PII in logs.  
- `NFR-OBS-003`: Health check endpoints for production services where applicable.  
- `NFR-OBS-004`: Critical failures produce actionable alerts or operational signals.

---

### 9.15 Backup and recovery requirements

```
Backup / Recovery Requirements:
```

Examples:

- `NFR-BACK-001`: Production backups per approved schedule.  
- `NFR-BACK-002`: Restore procedure documented before production release.  
- `NFR-BACK-003`: Critical data recoverable after accidental deletion or failure scenarios defined here.

---

### 9.16 Deployment and environment requirements

```
Deployment / Environment Requirements:
```

Examples:

- `NFR-DEP-001`: Separate development and production environments.  
- `NFR-DEP-002`: Environment-specific configuration outside source control secrets.  
- `NFR-DEP-003`: Deployment steps documented before release.  
- `NFR-DEP-004`: Rollback path documented for production releases.

---

### 9.17 Integration and interoperability requirements

```
Integration / Interoperability Requirements:
```

Examples:

- `NFR-INT-001`: External APIs define success, error, retry, and timeout behavior.  
- `NFR-INT-002`: Integration failures do not crash unrelated features.  
- `NFR-INT-003`: Exchanged payloads use documented formats and versioning.

---

### 9.18 Data management requirements

```
Data Management Requirements:
```

Examples:

- `NFR-DATA-001`: Ownership assigned per major entity or domain.  
- `NFR-DATA-002`: Required fields validated before persistence.  
- `NFR-DATA-003`: Schema migrations version-controlled.  
- `NFR-DATA-004`: Import/export formats documented.

---

### 9.19 Support and operations requirements

```
Support / Operations Requirements:
```

Examples:

- `NFR-SUP-001`: Runbooks or support notes for common incidents.  
- `NFR-SUP-002`: Known issues recorded before release.  
- `NFR-SUP-003`: Support ownership identified before production deployment.

---

### 9.20 NFR traceability matrix

| NFR ID | Category | Requirement summary | Priority | Validation method | Evidence |
| --- | --- | --- | --- | --- | --- |
| SRS-NFR-… | Performance | | | | |
| SRS-NFR-… | Security | | | | |
| SRS-NFR-… | Accessibility | | | | |
| SRS-NFR-… | Maintainability | | | | |

Extend rows for all baseline NFRs.

---

### 9.21 Approval status

```
Approval Status:
Reviewer:
Review Date:
Decision Notes:
```

See **Section 7** for status definitions.

---

## Document history

| Version | Note |
| --- | --- |
| 1.0 | NFR-001 canonical template aligned to Phase 5, USSM A-2, and traceability |
