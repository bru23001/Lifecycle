┌──────────────────────────────────────────────────────────────────────────────┐
│ APPROVAL CENTER SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. PENDING APPROVALS PANEL INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click pending approval item                                      │
│ Result: Loads selected approval package.                                      │
│ Recommended UI: Same screen state update OR dedicated detail route            │
│ Route: /approvals/[approvalId]                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Detail Screen / Detail State                                     │
│     ├── Approval identity                                                     │
│     ├── Project context                                                       │
│     ├── Phase / gate / artifact context                                       │
│     ├── Required inputs                                                       │
│     ├── Evidence package                                                      │
│     ├── Approver comments                                                     │
│     ├── Approval history                                                      │
│     └── Decision controls                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Search approvals                                                 │
│ Result: Filters approval list.                                                │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click approval filter button                                     │
│ Result: Opens advanced approval filters.                                      │
│ Recommended UI: Popover or drawer                                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Filters Drawer                                                   │
│     ├── Approval type                                                         │
│     ├── Approval status                                                       │
│     ├── Priority                                                              │
│     ├── Project                                                               │
│     ├── Phase                                                                 │
│     ├── Gate                                                                  │
│     ├── Submitter                                                             │
│     ├── Approver                                                              │
│     ├── Due date range                                                        │
│     ├── Overdue only                                                          │
│     ├── Blocked only                                                          │
│     └── Apply / Reset filters                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click sort control                                               │
│ Result: Opens sort menu.                                                      │
│ Recommended UI: Dropdown                                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Sort Dropdown                                                    │
│     ├── Due date                                                              │
│     ├── Priority                                                              │
│     ├── Submitted date                                                        │
│     ├── Project name                                                          │
│     ├── Approval type                                                         │
│     ├── Status                                                                │
│     └── Recently updated                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View all approvals”                                       │
│ Result: Opens full approval queue.                                            │
│ Recommended UI: New screen                                                    │
│ Route: /approvals                                                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Queue Screen                                                     │
│     ├── Full approval table                                                   │
│     ├── Filters                                                               │
│     ├── Bulk actions                                                          │
│     ├── Priority indicators                                                   │
│     ├── Due dates                                                             │
│     └── Status columns                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. APPROVAL DETAIL INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click linked project                                             │
│ Result: Opens project overview.                                               │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Project Overview Screen                                                   │
│     ├── Project profile                                                       │
│     ├── Lifecycle progress                                                    │
│     ├── Gates summary                                                         │
│     ├── Artifact summary                                                      │
│     ├── Evidence summary                                                      │
│     └── Audit trail                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked phase                                               │
│ Result: Opens phase workspace.                                                │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Lifecycle Workspace Screen                                                │
│     ├── Phase Navigator                                                       │
│     ├── Current Phase Workspace                                               │
│     ├── Required Templates                                                    │
│     ├── Completion Checklist                                                  │
│     ├── Evidence Attachments                                                  │
│     ├── Validation Warnings                                                   │
│     └── Submit for Gate Review                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked gate                                                │
│ Result: Opens gate review.                                                    │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Review Screen                                                        │
│     ├── Gate Overview                                                         │
│     ├── Required Inputs                                                       │
│     ├── Completion Evidence                                                   │
│     ├── Decision Criteria                                                     │
│     ├── Approver Review                                                       │
│     ├── Decision Record                                                       │
│     └── Next Phase Unlock                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked artifact count / artifact row                       │
│ Result: Opens artifact detail or artifact library.                            │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Detail Screen / Drawer                                           │
│     ├── Artifact metadata                                                     │
│     ├── Markdown view                                                         │
│     ├── JSON evidence view                                                    │
│     ├── Version history                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     └── Export package                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click evidence count / evidence row                              │
│ Result: Opens evidence detail.                                                │
│ Recommended UI: New screen, drawer, or preview modal                          │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Drawer                                           │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Linked artifact                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Completeness status                                                   │
│     └── Download action                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click share button                                               │
│ Result: Opens share approval package controls.                                │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Share Approval Package Modal                                              │
│     ├── Share link                                                            │
│     ├── Copy link                                                             │
│     ├── Recipient search                                                      │
│     ├── Permission level                                                      │
│     ├── Expiration                                                            │
│     ├── Include attachments toggle                                            │
│     └── Send / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click more actions menu                                          │
│ Result: Opens approval package action menu.                                   │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Actions Dropdown                                                 │
│     ├── Open gate review                                                      │
│     ├── Open project                                                          │
│     ├── Download review package                                               │
│     ├── Reassign approval                                                     │
│     ├── Add approver                                                          │
│     ├── Escalate                                                              │
│     ├── Mark blocked                                                          │
│     ├── Cancel approval request                                               │
│     └── View audit trail                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. REQUIRED INPUTS INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click required input row                                         │
│ Result: Opens linked artifact, evidence, or input detail.                     │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Artifact Detail Screen / Drawer                                           │
│ └── Evidence Detail Screen / Drawer                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View all inputs”                                          │
│ Result: Opens complete required input list for approval package.              │
│ Recommended UI: Drawer or new screen                                          │
│ Route: /approvals/[approvalId]/inputs                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Required Inputs Screen / Drawer                                  │
│     ├── Input code                                                            │
│     ├── Input name                                                            │
│     ├── Description                                                           │
│     ├── Required / optional                                                   │
│     ├── Status                                                                │
│     ├── Linked artifact                                                       │
│     ├── Linked evidence                                                       │
│     └── Missing input warnings                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click missing input warning                                      │
│ Result: Opens remediation flow.                                               │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Missing Input Remediation Drawer                                          │
│     ├── Missing input name                                                    │
│     ├── Why it is required                                                    │
│     ├── Blocking gate / approval rule                                         │
│     ├── Create artifact action                                                │
│     ├── Link existing artifact action                                         │
│     ├── Add evidence action                                                   │
│     └── Assign owner                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked artifact icon                                       │
│ Result: Opens artifact preview.                                               │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Preview Drawer                                                   │
│     ├── Artifact title                                                        │
│     ├── Artifact status                                                       │
│     ├── Markdown preview                                                      │
│     ├── JSON evidence preview                                                 │
│     ├── Version                                                               │
│     └── Open full artifact action                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked evidence icon                                       │
│ Result: Opens evidence preview.                                               │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Preview Modal / Drawer                                           │
│     ├── Evidence title                                                        │
│     ├── File preview                                                          │
│     ├── Metadata                                                              │
│     ├── Linked objects                                                        │
│     ├── Completeness status                                                   │
│     └── Download evidence                                                     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. APPROVER COMMENTS INTERACTIONS                                             │
│                                                                              │
│ Interaction: Click “Add Comment”                                              │
│ Result: Opens or focuses comment composer.                                    │
│ Recommended UI: Inline composer OR modal for long comments                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Approver Comment Modal                                                │
│     ├── Comment text                                                          │
│     ├── Visibility                                                            │
│     ├── Mention approver                                                      │
│     ├── Attach reference                                                      │
│     ├── Related input / evidence                                              │
│     └── Add comment / Cancel                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click comment                                                    │
│ Result: Opens comment thread detail.                                          │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Comment Thread Drawer                                                     │
│     ├── Original comment                                                      │
│     ├── Replies                                                               │
│     ├── Mentions                                                              │
│     ├── Related artifact / evidence                                           │
│     ├── Resolve thread action                                                 │
│     └── Reply composer                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click comment actions menu                                       │
│ Result: Opens comment actions.                                                │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Comment Actions Dropdown                                                  │
│     ├── Reply                                                                 │
│     ├── Edit                                                                  │
│     ├── Delete                                                                │
│     ├── Copy link                                                             │
│     ├── Mark resolved                                                         │
│     └── Link to evidence                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Link to evidence” from comment                            │
│ Result: Links comment to evidence item.                                       │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Comment to Evidence Modal                                            │
│     ├── Evidence search                                                       │
│     ├── Evidence list                                                         │
│     ├── Selected evidence                                                     │
│     ├── Link rationale                                                        │
│     └── Save link                                                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. APPROVAL HISTORY INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click approval history event                                     │
│ Result: Opens event detail.                                                   │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval History Event Detail Drawer                                      │
│     ├── Event type                                                            │
│     ├── Actor                                                                 │
│     ├── Actor role                                                            │
│     ├── Timestamp                                                             │
│     ├── Description                                                           │
│     ├── Related object                                                        │
│     ├── Before / after values                                                 │
│     └── Audit reference                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View full history”                                        │
│ Result: Opens full approval history timeline.                                 │
│ Recommended UI: New screen or drawer                                          │
│ Route: /approvals/[approvalId]/history                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Full Approval History Screen / Drawer                                     │
│     ├── Complete timeline                                                     │
│     ├── Event filters                                                         │
│     ├── Actor filters                                                         │
│     ├── Decision filters                                                      │
│     ├── Comments                                                              │
│     ├── Related audit records                                                 │
│     └── Export history action                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click audit reference                                            │
│ Result: Opens audit event detail.                                             │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Audit Event Detail Drawer                                                 │
│     ├── Audit event ID                                                        │
│     ├── Event type                                                            │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Object changed                                                        │
│     ├── Before / after values                                                 │
│     ├── Integrity hash                                                        │
│     └── Export audit record                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. DECISION PANEL INTERACTIONS                                                │
│                                                                              │
│ Interaction: Click “Approve”                                                  │
│ Result: Selects approval decision.                                            │
│ Recommended UI: Same panel state update                                       │
│ Required Screen/Modal: None initially                                         │
│                                                                              │
│ Optional Modal:                                                               │
│ └── Approve Confirmation Modal                                                │
│     ├── Approval summary                                                      │
│     ├── Inputs complete confirmation                                          │
│     ├── Evidence complete confirmation                                        │
│     ├── Optional comment                                                      │
│     └── Confirm approval                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Request Changes”                                          │
│ Result: Requires comments and requested changes.                              │
│ Recommended UI: Inline form OR modal                                          │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Request Changes Modal                                                     │
│     ├── Required change summary                                               │
│     ├── Change category                                                       │
│     ├── Related artifact / input / evidence                                   │
│     ├── Assigned owner                                                        │
│     ├── Due date                                                              │
│     ├── Reviewer comments                                                     │
│     └── Request changes / Cancel                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Reject”                                                   │
│ Result: Requires rejection reason.                                            │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Reject Approval Modal                                                     │
│     ├── Rejection reason                                                      │
│     ├── Impact warning                                                        │
│     ├── Resubmission allowed toggle                                           │
│     ├── Reviewer comments                                                     │
│     ├── Type approval code to confirm if destructive                          │
│     └── Reject / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click decision comments textarea expand                          │
│ Result: Opens large editor for detailed decision notes.                       │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Comment Editor Modal                                             │
│     ├── Rich / plain text decision comment                                    │
│     ├── Insert template response                                              │
│     ├── Mention user                                                          │
│     ├── Link evidence                                                         │
│     ├── Character count                                                       │
│     └── Save comment                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add required change”                                      │
│ Result: Adds structured requested change.                                     │
│ Recommended UI: Modal or inline row                                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Required Change Modal                                                 │
│     ├── Change title                                                          │
│     ├── Description                                                           │
│     ├── Related object                                                        │
│     ├── Severity                                                              │
│     ├── Assignee                                                              │
│     ├── Due date                                                              │
│     └── Add change                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Save Review”                                              │
│ Result: Saves decision draft.                                                 │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Submit Decision”                                          │
│ Result: Finalizes approval decision.                                          │
│ Recommended UI: Confirmation modal before final submit                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Submit Decision Confirmation Modal                                        │
│     ├── Selected decision                                                     │
│     ├── Decision comments                                                     │
│     ├── Required changes / conditions                                         │
│     ├── Downstream workflow effect                                            │
│     ├── Audit notice                                                          │
│     ├── Finality warning                                                      │
│     └── Submit Decision / Cancel                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Submit decision with validation errors                           │
│ Result: Shows blockers preventing decision submission.                        │
│ Recommended UI: Modal or inline alert                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Blockers Modal / Alert                                           │
│     ├── Missing decision                                                      │
│     ├── Missing comments                                                      │
│     ├── Missing required changes                                              │
│     ├── Missing evidence                                                      │
│     ├── Incomplete required inputs                                            │
│     └── Links to fix each blocker                                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. APPROVER MANAGEMENT INTERACTIONS                                           │
│                                                                              │
│ Interaction: Click approver row                                               │
│ Result: Opens approver review detail.                                         │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approver Review Detail Drawer                                             │
│     ├── Approver name                                                         │
│     ├── Role                                                                  │
│     ├── Review status                                                         │
│     ├── Review comments                                                       │
│     ├── Reviewed on                                                           │
│     ├── Assigned inputs                                                       │
│     └── Reminder / reassign actions                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add approver”                                             │
│ Result: Adds new approver to approval package.                                │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Approver Modal                                                        │
│     ├── User search                                                           │
│     ├── Role filter                                                           │
│     ├── Required approval role                                                │
│     ├── Due date                                                              │
│     ├── Notify approver toggle                                                │
│     └── Add approver                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Reassign approval”                                        │
│ Result: Reassigns approver responsibility.                                    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Reassign Approval Modal                                                   │
│     ├── Current approver                                                      │
│     ├── New approver search                                                   │
│     ├── Reason for reassignment                                               │
│     ├── Notify users toggle                                                   │
│     └── Reassign                                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Send reminder”                                            │
│ Result: Sends reminder to pending approver.                                   │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Send Reminder Modal                                                       │
│     ├── Approver                                                              │
│     ├── Reminder message                                                      │
│     ├── Due date context                                                      │
│     ├── Include approval link toggle                                          │
│     └── Send reminder                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Escalate”                                                 │
│ Result: Escalates approval to manager/admin/sponsor.                          │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Escalate Approval Modal                                                   │
│     ├── Escalation recipient                                                  │
│     ├── Reason                                                                │
│     ├── Priority                                                              │
│     ├── Message                                                               │
│     ├── Include approval package                                              │
│     └── Escalate                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. ATTACHMENTS / PACKAGE INTERACTIONS                                         │
│                                                                              │
│ Interaction: Click attachments tab                                            │
│ Result: Shows attached files.                                                 │
│ Recommended UI: Same panel tab                                                │
│ Required Screen/Modal: None initially                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click attachment row                                             │
│ Result: Opens attachment preview.                                             │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Attachment Preview Modal / Drawer                                         │
│     ├── File preview                                                          │
│     ├── File metadata                                                         │
│     ├── Linked object                                                         │
│     ├── Uploaded by                                                           │
│     ├── Uploaded on                                                           │
│     └── Download action                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download review package”                                  │
│ Result: Opens export/download options.                                        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Download Review Package Modal                                             │
│     ├── Include required inputs                                               │
│     ├── Include artifacts                                                     │
│     ├── Include evidence                                                      │
│     ├── Include comments                                                      │
│     ├── Include approval history                                              │
│     ├── Include audit manifest                                                │
│     ├── Format: ZIP / PDF packet                                              │
│     └── Download package                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Upload attachment”                                        │
│ Result: Adds file to approval package.                                        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Upload Approval Attachment Modal                                          │
│     ├── File upload                                                           │
│     ├── Attachment type                                                       │
│     ├── Description                                                           │
│     ├── Link to input / evidence / comment                                    │
│     ├── Classification                                                        │
│     └── Upload                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. BULK / QUEUE ACTION INTERACTIONS                                           │
│                                                                              │
│ Interaction: Select multiple approvals                                        │
│ Result: Shows bulk action toolbar.                                            │
│ Recommended UI: Same screen toolbar                                           │
│ Required Screen/Modal: None initially                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Bulk approve selected approvals                                  │
│ Result: Approves multiple selected approvals.                                 │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Bulk Approve Confirmation Modal                                           │
│     ├── Selected approvals count                                              │
│     ├── Approval list summary                                                 │
│     ├── Exceptions / blockers                                                 │
│     ├── Shared comment                                                        │
│     └── Confirm bulk approval                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Bulk request changes                                             │
│ Result: Requests changes for multiple approvals.                              │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Bulk Request Changes Modal                                                │
│     ├── Selected approvals count                                              │
│     ├── Shared change request                                                 │
│     ├── Apply same message to all                                             │
│     ├── Per-approval notes                                                    │
│     └── Request changes                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Bulk reassign approvals                                          │
│ Result: Reassigns selected approvals.                                         │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Bulk Reassign Approvals Modal                                             │
│     ├── Selected approvals count                                              │
│     ├── New approver                                                          │
│     ├── Reassignment reason                                                   │
│     ├── Notify users                                                          │
│     └── Reassign selected                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Bulk export approvals                                            │
│ Result: Exports selected approval packages.                                   │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Bulk Export Approvals Modal                                               │
│     ├── Selected approvals count                                              │
│     ├── Include comments                                                      │
│     ├── Include evidence                                                      │
│     ├── Include decision records                                              │
│     ├── Export format                                                         │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. SUMMARY — REQUIRED ADDITIONAL SCREENS                                     │
│                                                                              │
│ Required full screens from Approval Center interactions:                      │
│                                                                              │
│ ├── /approvals                                                                │
│ │   └── Approval Queue Screen                                                 │
│ │                                                                            │
│ ├── /approvals/[approvalId]                                                   │
│ │   └── Approval Detail Screen                                                │
│ │                                                                            │
│ ├── /approvals/[approvalId]/inputs                                            │
│ │   └── Approval Required Inputs Screen                                       │
│ │                                                                            │
│ ├── /approvals/[approvalId]/history                                           │
│ │   └── Full Approval History Screen                                          │
│ │                                                                            │
│ ├── /projects/[projectId]                                                     │
│ │   └── Project Overview Screen                                               │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace?phase=[phaseNumber]                       │
│ │   └── Lifecycle Workspace Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/gates/[gateId]/review                               │
│ │   └── Gate Review Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/artifacts/[artifactId]                              │
│ │   └── Artifact Detail Screen                                                │
│ │                                                                            │
│ └── /projects/[projectId]/evidence/[evidenceId]                               │
│     └── Evidence Detail Screen                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Approval Center interactions:                    │
│                                                                              │
│ ├── Approval Filters Drawer                                                   │
│ ├── Approval Sort Dropdown                                                    │
│ ├── Share Approval Package Modal                                              │
│ ├── Approval Actions Dropdown                                                 │
│ ├── Artifact Detail Drawer                                                    │
│ ├── Evidence Detail Drawer                                                    │
│ ├── Approval Required Inputs Drawer                                           │
│ ├── Missing Input Remediation Drawer                                          │
│ ├── Artifact Preview Drawer                                                   │
│ ├── Evidence Preview Modal / Drawer                                           │
│ ├── Add Approver Comment Modal                                                │
│ ├── Comment Thread Drawer                                                     │
│ ├── Comment Actions Dropdown                                                  │
│ ├── Link Comment to Evidence Modal                                            │
│ ├── Approval History Event Detail Drawer                                      │
│ ├── Full Approval History Drawer                                              │
│ ├── Audit Event Detail Drawer                                                 │
│ ├── Approve Confirmation Modal                                                │
│ ├── Request Changes Modal                                                     │
│ ├── Reject Approval Modal                                                     │
│ ├── Decision Comment Editor Modal                                             │
│ ├── Add Required Change Modal                                                 │
│ ├── Submit Decision Confirmation Modal                                        │
│ ├── Decision Blockers Modal / Alert                                           │
│ ├── Approver Review Detail Drawer                                             │
│ ├── Add Approver Modal                                                        │
│ ├── Reassign Approval Modal                                                   │
│ ├── Send Reminder Modal                                                       │
│ ├── Escalate Approval Modal                                                   │
│ ├── Attachment Preview Modal / Drawer                                         │
│ ├── Download Review Package Modal                                             │
│ ├── Upload Approval Attachment Modal                                          │
│ ├── Bulk Approve Confirmation Modal                                           │
│ ├── Bulk Request Changes Modal                                                │
│ ├── Bulk Reassign Approvals Modal                                             │
│ └── Bulk Export Approvals Modal                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘