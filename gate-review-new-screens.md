┌──────────────────────────────────────────────────────────────────────────────┐
│ GATE REVIEW SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. GATE HEADER INTERACTIONS                                                   │
│                                                                              │
│ Interaction: Click breadcrumb “Project”                                       │
│ Result: Opens parent project detail.                                          │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Project Detail Screen                                                     │
│     ├── Project Overview                                                      │
│     ├── Project Profile                                                       │
│     ├── Lifecycle Timeline                                                    │
│     ├── Artifacts Summary                                                     │
│     ├── Gates Summary                                                         │
│     ├── Traceability Summary                                                  │
│     └── Audit Trail Summary                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click breadcrumb “Lifecycle Workspace”                           │
│ Result: Opens project lifecycle workspace.                                    │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace                                        │
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
│ Interaction: Click breadcrumb “Phase”                                         │
│ Result: Opens workspace focused on gate source phase.                         │
│ Recommended UI: New screen with phase query                                   │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Workspace View                                                      │
│     ├── Phase header                                                          │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Phase checklist                                                       │
│     ├── Validation warnings                                                   │
│     └── Gate readiness                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download Review Package”                                  │
│ Result: Downloads or configures the gate review package.                      │
│ Recommended UI: Modal before download if options are available                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Download Review Package Modal                                             │
│     ├── Include required inputs                                                │
│     ├── Include completion evidence                                            │
│     ├── Include decision criteria                                              │
│     ├── Include approver review status                                         │
│     ├── Include audit manifest                                                 │
│     ├── Format: ZIP / PDF bundle / JSON manifest                               │
│     └── Download package                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click gate status badge                                          │
│ Result: Shows status explanation and lifecycle meaning.                       │
│ Recommended UI: Popover                                                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Status Popover                                                       │
│     ├── Current status                                                        │
│     ├── Status meaning                                                        │
│     ├── Blocking conditions                                                   │
│     ├── Next possible statuses                                                │
│     └── Related policy note                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. GATE OVERVIEW INTERACTIONS                                                 │
│                                                                              │
│ Interaction: Click “View Phase Workspace”                                     │
│ Result: Opens the phase workspace that produced the gate package.             │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Workspace View                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Gate Policy”                                         │
│ Result: Shows the policy/rule definition behind this gate.                    │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Policy Drawer                                                        │
│     ├── Gate code                                                             │
│     ├── Gate name                                                             │
│     ├── Related phase                                                         │
│     ├── Required inputs                                                       │
│     ├── Required evidence                                                     │
│     ├── Required approver roles                                               │
│     ├── Decision rule                                                         │
│     ├── Unlock rule                                                           │
│     └── Policy version                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Success Criteria”                                    │
│ Result: Shows full gate success criteria.                                     │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Success Criteria Drawer                                                   │
│     ├── Criterion list                                                        │
│     ├── Required threshold                                                    │
│     ├── Evidence expectation                                                  │
│     ├── Acceptance notes                                                      │
│     └── Related templates                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Gate Consequences”                                   │
│ Result: Shows what happens for approve, conditional approve, changes, reject. │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Consequences Modal                                                   │
│     ├── If approved                                                           │
│     ├── If conditionally approved                                             │
│     ├── If changes requested                                                  │
│     ├── If rejected                                                           │
│     ├── Next phase impact                                                     │
│     └── Audit impact                                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. REQUIRED INPUTS INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click required input row                                         │
│ Result: Opens linked artifact, template output, or input detail.              │
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
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View all inputs”                                          │
│ Result: Opens full gate input list.                                           │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/gates/[gateId]/inputs                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Required Inputs Screen / Modal                                       │
│     ├── Input list                                                            │
│     ├── Input type                                                            │
│     ├── Required/optional marker                                               │
│     ├── Linked artifact                                                       │
│     ├── Linked evidence                                                       │
│     ├── Completion status                                                     │
│     ├── Validation status                                                     │
│     └── Open input action                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click missing or incomplete input                                │
│ Result: Opens correction workflow.                                            │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Required Input Correction Drawer                                          │
│     ├── Input name                                                            │
│     ├── Missing requirement                                                   │
│     ├── Related template                                                      │
│     ├── Related artifact                                                      │
│     ├── Recommended fix                                                       │
│     ├── Open Template Wizard                                                  │
│     └── Mark reviewed                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Template”                                            │
│ Result: Opens Template Wizard for linked input.                               │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/templates/[templateId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Wizard Screen                                                    │
│     ├── Template Selection                                                    │
│     ├── Dynamic Form                                                          │
│     ├── Section-by-Section Editor                                             │
│     ├── Validation Panel                                                      │
│     ├── Markdown Preview                                                      │
│     ├── JSON Evidence Preview                                                 │
│     └── Export / Save Artifact                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. COMPLETION EVIDENCE INTERACTIONS                                           │
│                                                                              │
│ Interaction: Click evidence row                                               │
│ Result: Opens evidence detail.                                                │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Drawer                                           │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Classification                                                        │
│     ├── Linked artifact                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── History                                                               │
│     └── Download action                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click evidence preview icon                                      │
│ Result: Opens file preview without leaving Gate Review.                       │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Preview Modal                                                    │
│     ├── File preview                                                          │
│     ├── File metadata                                                         │
│     ├── Download action                                                       │
│     ├── Open detail                                                           │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click evidence download icon                                     │
│ Result: Downloads evidence.                                                   │
│ Recommended UI: No modal unless export options are needed                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Optional Evidence Download Options Modal                                  │
│     ├── Download original file                                                │
│     ├── Download with metadata manifest                                       │
│     ├── Include checksum                                                      │
│     └── Download                                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View all evidence”                                        │
│ Result: Opens Evidence Center scoped to this gate.                            │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/evidence?gate=[gateId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Center Screen                                                    │
│     ├── Evidence Items                                                        │
│     ├── Evidence Detail                                                       │
│     ├── Evidence Completeness                                                 │
│     ├── Evidence by Gate                                                      │
│     ├── Evidence by Phase                                                     │
│     └── Evidence Export Bundle                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Evidence”                                             │
│ Result: Uploads or links evidence to the gate package.                        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Evidence Modal                                                        │
│     ├── Upload file                                                           │
│     ├── Add external link                                                     │
│     ├── Evidence type                                                         │
│     ├── Classification                                                        │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Linked artifact/input                                                 │
│     └── Save evidence                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Remove from Gate Package”                                 │
│ Result: Unlinks evidence from gate package.                                   │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Remove Evidence Confirmation Modal                                        │
│     ├── Evidence name                                                         │
│     ├── Gate affected                                                         │
│     ├── Impact warning                                                        │
│     ├── Remove link only / remove evidence entirely option                    │
│     └── Confirm / Cancel                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. DECISION CRITERIA INTERACTIONS                                             │
│                                                                              │
│ Interaction: Click “View details”                                             │
│ Result: Opens full criteria model and scoring rationale.                      │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Criteria Detail Drawer                                           │
│     ├── Criterion name                                                        │
│     ├── Weight                                                                │
│     ├── Assessment                                                            │
│     ├── Required threshold                                                    │
│     ├── Evidence references                                                   │
│     ├── Reviewer notes                                                        │
│     └── Scoring rationale                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click criterion row                                              │
│ Result: Opens criterion assessment editor.                                    │
│ Recommended UI: Drawer or inline modal                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Criterion Assessment Drawer                                               │
│     ├── Criterion                                                             │
│     ├── Description                                                           │
│     ├── Weight                                                                │
│     ├── Assessment: Meets / Partially / Does Not Meet                         │
│     ├── Reviewer notes                                                        │
│     ├── Linked evidence                                                       │
│     ├── Add evidence reference                                                │
│     └── Save assessment                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked evidence reference inside criterion                 │
│ Result: Opens evidence detail/preview.                                        │
│ Recommended UI: Modal or new screen                                           │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Evidence Preview Modal                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Edit Decision Criteria”                                   │
│ Result: Edits gate criteria if user has admin permission.                     │
│ Recommended UI: New settings screen or modal                                  │
│ Route: /settings/gates                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Rules Settings Screen / Criteria Editor Modal                        │
│     ├── Gate rule                                                             │
│     ├── Criteria list                                                         │
│     ├── Weighting                                                             │
│     ├── Required evidence mapping                                             │
│     ├── Passing threshold                                                     │
│     └── Save rule                                                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. APPROVER REVIEW INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click approver row                                               │
│ Result: Shows approver review detail.                                         │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approver Review Detail Drawer                                             │
│     ├── Approver name                                                         │
│     ├── Role                                                                  │
│     ├── Review status                                                         │
│     ├── Reviewed on                                                           │
│     ├── Comments                                                              │
│     ├── Decision                                                              │
│     └── Related approval history                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click comment icon                                               │
│ Result: Opens approver comments.                                              │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approver Comments Modal                                                   │
│     ├── Comment thread                                                        │
│     ├── Author                                                                │
│     ├── Role                                                                  │
│     ├── Timestamp                                                             │
│     ├── Visibility                                                            │
│     └── Add comment field                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View approvers”                                           │
│ Result: Opens full approver assignment list.                                  │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approver Assignment Drawer                                                │
│     ├── Assigned approvers                                                    │
│     ├── Required approver roles                                               │
│     ├── Review status                                                         │
│     ├── Due dates                                                             │
│     ├── Add approver                                                          │
│     ├── Remove approver                                                       │
│     └── Save assignments                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Assign Approver”                                          │
│ Result: Adds reviewer to gate.                                                │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Approver Modal                                                     │
│     ├── User search                                                           │
│     ├── Role filter                                                           │
│     ├── Required role indicators                                              │
│     ├── Selected approvers                                                    │
│     ├── Due date                                                              │
│     └── Assign                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Send Reminder”                                            │
│ Result: Sends reminder to pending approvers.                                  │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Send Reminder Modal                                                       │
│     ├── Pending approvers                                                     │
│     ├── Reminder message                                                      │
│     ├── Include due date                                                      │
│     ├── Include review link                                                   │
│     └── Send reminder                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. DECISION RECORD INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click “Approve”                                                  │
│ Result: Selects approval decision and may require confirmation.               │
│ Recommended UI: Confirmation modal before final submit                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approve Gate Confirmation Modal                                           │
│     ├── Gate name                                                             │
│     ├── Decision: Approve                                                     │
│     ├── Inputs/evidence readiness                                             │
│     ├── Next phase to unlock                                                  │
│     ├── Optional decision comments                                            │
│     └── Confirm approval                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Conditional Approve”                                      │
│ Result: Records approval with required conditions.                            │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Conditional Approval Modal                                                │
│     ├── Gate name                                                             │
│     ├── Conditions list                                                       │
│     ├── Required follow-up actions                                            │
│     ├── Responsible owner                                                     │
│     ├── Due date                                                              │
│     ├── Decision comments                                                     │
│     └── Confirm conditional approval                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Request Changes”                                          │
│ Result: Records request for changes and blocks gate.                          │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Request Changes Modal                                                     │
│     ├── Required changes                                                      │
│     ├── Change severity                                                       │
│     ├── Related inputs                                                        │
│     ├── Related evidence                                                      │
│     ├── Return-to phase                                                       │
│     ├── Reviewer comments                                                     │
│     └── Submit request                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Reject”                                                   │
│ Result: Records rejection and blocks progression.                             │
│ Recommended UI: Destructive confirmation modal                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Reject Gate Confirmation Modal                                            │
│     ├── Gate name                                                             │
│     ├── Rejection reason                                                      │
│     ├── Impact warning                                                        │
│     ├── Stop/defer/rework option                                              │
│     ├── Required comments                                                     │
│     └── Confirm rejection                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click decision comments field expansion                          │
│ Result: Opens larger decision note editor.                                    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Comments Editor Modal                                            │
│     ├── Rich/plain text comments                                              │
│     ├── Comment visibility                                                    │
│     ├── Character count                                                       │
│     ├── Save draft                                                            │
│     └── Apply comments                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Existing Decision Record”                            │
│ Result: Shows immutable finalized decision.                                   │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Final Decision Record Drawer                                              │
│     ├── Decision outcome                                                      │
│     ├── Decided by                                                            │
│     ├── Decision timestamp                                                    │
│     ├── Comments                                                              │
│     ├── Conditions                                                            │
│     ├── Evidence snapshot                                                     │
│     ├── Input snapshot                                                        │
│     ├── Audit record ID                                                       │
│     └── Export decision record                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. NEXT PHASE UNLOCK INTERACTIONS                                             │
│                                                                              │
│ Interaction: Click “Open Next Phase”                                          │
│ Result: Opens next lifecycle phase workspace.                                 │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace?phase=[nextPhaseNumber]                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Next Phase Workspace View                                                 │
│     ├── Next phase header                                                     │
│     ├── Required templates                                                    │
│     ├── Required evidence expectations                                        │
│     ├── Initial checklist                                                     │
│     ├── Carried-forward artifacts                                             │
│     └── Gate dependency                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click locked/unlock status                                       │
│ Result: Shows unlock requirements and blockers.                               │
│ Recommended UI: Popover or drawer                                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Next Phase Unlock Requirements Drawer                                     │
│     ├── Unlock status                                                         │
│     ├── Required decision state                                               │
│     ├── Required inputs                                                       │
│     ├── Required evidence                                                     │
│     ├── Blocking validation issues                                            │
│     ├── Carried-forward artifacts                                             │
│     └── Recommended next action                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click carried-forward artifact                                   │
│ Result: Opens artifact detail.                                                │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Detail Screen / Drawer                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. ACTION BAR INTERACTIONS                                                    │
│                                                                              │
│ Interaction: Click “Save Review”                                              │
│ Result: Saves draft review state.                                             │
│ Recommended UI: Toast only unless validation warnings exist                   │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Optional Save Review Summary Toast / Modal                                │
│     ├── Saved fields                                                          │
│     ├── Unresolved warnings                                                   │
│     ├── Autosave timestamp                                                    │
│     └── Continue review                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Submit Decision”                                          │
│ Result: Finalizes gate decision.                                              │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Submit Decision Confirmation Modal                                        │
│     ├── Selected decision                                                     │
│     ├── Required inputs snapshot                                              │
│     ├── Evidence snapshot                                                     │
│     ├── Approver status snapshot                                              │
│     ├── Criteria assessment snapshot                                          │
│     ├── Next phase impact                                                     │
│     ├── Audit record warning                                                  │
│     └── Submit final decision                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Failed submit due to blockers                                    │
│ Result: Shows validation blockers preventing decision submission.             │
│ Recommended UI: Modal or validation drawer                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Submission Blockers Drawer                                       │
│     ├── Missing required inputs                                               │
│     ├── Missing evidence                                                      │
│     ├── Incomplete decision criteria                                          │
│     ├── Missing approver requirements                                         │
│     ├── Missing comments/conditions                                           │
│     ├── Recommended fixes                                                     │
│     └── Jump to issue actions                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Cancel Review”                                            │
│ Result: Exits review flow.                                                    │
│ Recommended UI: Unsaved changes confirmation modal                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unsaved Review Changes Modal                                              │
│     ├── Unsaved fields                                                        │
│     ├── Save draft                                                            │
│     ├── Discard changes                                                       │
│     └── Continue editing                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. AUDIT / HISTORY INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “View Audit Trail”                                         │
│ Result: Opens audit history scoped to this gate.                              │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/audit?gate=[gateId]                              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Audit Trail Screen / Drawer                                          │
│     ├── Submission events                                                     │
│     ├── Evidence changes                                                      │
│     ├── Criteria changes                                                      │
│     ├── Approver comments                                                     │
│     ├── Decision event                                                        │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     └── Audit hash/reference                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click audit event                                                │
│ Result: Shows event details.                                                  │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Audit Event Detail Drawer                                                 │
│     ├── Event type                                                            │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Object changed                                                        │
│     ├── Before / after values                                                 │
│     ├── Related gate                                                          │
│     ├── Related evidence/artifact                                             │
│     └── Audit reference                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. SUMMARY — REQUIRED ADDITIONAL SCREENS                                     │
│                                                                              │
│ Required full screens from Gate Review interactions:                          │
│                                                                              │
│ ├── /projects/[projectId]                                                     │
│ │   └── Project Detail Screen                                                 │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace                                           │
│ │   └── Lifecycle Workspace Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace?phase=[phaseNumber]                       │
│ │   └── Phase Workspace View                                                  │
│ │                                                                            │
│ ├── /projects/[projectId]/templates/[templateId]                              │
│ │   └── Template Wizard Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/artifacts/[artifactId]                              │
│ │   └── Artifact Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence                                            │
│ │   └── Evidence Center Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/[evidenceId]                               │
│ │   └── Evidence Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/gates/[gateId]/inputs                               │
│ │   └── Gate Required Inputs Screen                                           │
│ │                                                                            │
│ ├── /settings/gates                                                           │
│ │   └── Gate Rules Settings Screen                                            │
│ │                                                                            │
│ └── /projects/[projectId]/audit?gate=[gateId]                                 │
│     └── Gate Audit Trail Screen                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 12. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Gate Review interactions:                        │
│                                                                              │
│ ├── Download Review Package Modal                                             │
│ ├── Gate Status Popover                                                       │
│ ├── Gate Policy Drawer                                                        │
│ ├── Success Criteria Drawer                                                   │
│ ├── Gate Consequences Modal                                                   │
│ ├── Gate Required Inputs Modal                                                │
│ ├── Required Input Correction Drawer                                          │
│ ├── Evidence Preview Modal                                                    │
│ ├── Evidence Download Options Modal                                           │
│ ├── Add Evidence Modal                                                        │
│ ├── Remove Evidence Confirmation Modal                                        │
│ ├── Decision Criteria Detail Drawer                                           │
│ ├── Criterion Assessment Drawer                                               │
│ ├── Criteria Editor Modal                                                     │
│ ├── Approver Review Detail Drawer                                             │
│ ├── Approver Comments Modal                                                   │
│ ├── Approver Assignment Drawer                                                │
│ ├── Assign Approver Modal                                                     │
│ ├── Send Reminder Modal                                                       │
│ ├── Approve Gate Confirmation Modal                                           │
│ ├── Conditional Approval Modal                                                │
│ ├── Request Changes Modal                                                     │
│ ├── Reject Gate Confirmation Modal                                            │
│ ├── Decision Comments Editor Modal                                            │
│ ├── Final Decision Record Drawer                                              │
│ ├── Next Phase Unlock Requirements Drawer                                     │
│ ├── Save Review Summary Toast / Modal                                         │
│ ├── Submit Decision Confirmation Modal                                        │
│ ├── Decision Submission Blockers Drawer                                       │
│ ├── Unsaved Review Changes Modal                                              │
│ ├── Gate Audit Trail Drawer                                                   │
│ └── Audit Event Detail Drawer                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘