┌──────────────────────────────────────────────────────────────────────────────┐
│ LIFECYCLE WORKSPACE — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SCREEN CONTEXT                                                                │
│                                                                              │
│ Screen: Lifecycle Workspace                                                   │
│ Route: /projects/[projectId]/workspace                                        │
│ Grid: Three-Panel Workspace Grid                                              │
│                                                                              │
│ Main Areas:                                                                   │
│ ├── Phase Navigator                                                           │
│ ├── Current Phase Workspace                                                   │
│ ├── Required Templates                                                        │
│ ├── Completion Checklist                                                      │
│ ├── Evidence Attachments                                                      │
│ ├── Validation Warnings                                                       │
│ └── Submit for Gate Review                                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. PHASE NAVIGATOR INTERACTIONS                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click phase item                                                 │
│ Result: Loads selected phase workspace.                                       │
│ Recommended UI: Same screen state update OR route query update                │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│ Requires New Screen/Modal: No, but route state changes                        │
│                                                                              │
│ Notes:                                                                        │
│ ├── Phase Navigator remains visible                                           │
│ ├── Current Phase Workspace updates                                           │
│ ├── Required Templates update                                                 │
│ ├── Checklist updates                                                         │
│ ├── Evidence panel updates                                                    │
│ └── Gate readiness recalculates                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click locked phase                                               │
│ Result: Explains why phase is locked.                                         │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Locked Phase Explanation Modal                                            │
│     ├── Locked phase name                                                     │
│     ├── Required previous gate                                                │
│     ├── Missing decisions                                                     │
│     ├── Missing artifacts                                                     │
│     ├── Missing evidence                                                      │
│     ├── Required approvers                                                    │
│     └── Go to blocking gate / Close                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click completed phase status                                     │
│ Result: Shows phase completion details.                                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Completion Detail Drawer                                            │
│     ├── Phase summary                                                         │
│     ├── Completion date                                                       │
│     ├── Completed artifacts                                                   │
│     ├── Attached evidence                                                     │
│     ├── Gate decision                                                         │
│     ├── Approver summary                                                      │
│     ├── Audit references                                                      │
│     └── Open phase package                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Start Phase”                                              │
│ Result: Starts an unlocked but inactive phase.                                │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Start Phase Confirmation Modal                                            │
│     ├── Phase name                                                            │
│     ├── Phase objective                                                       │
│     ├── Required templates to initialize                                      │
│     ├── Required checklist items                                              │
│     ├── Evidence expectations                                                 │
│     ├── Gate dependency                                                       │
│     └── Start Phase / Cancel                                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. CURRENT PHASE WORKSPACE INTERACTIONS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Edit Phase Details”                                       │
│ Result: Allows editing phase-specific metadata.                               │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Phase Details Drawer                                                 │
│     ├── Phase owner                                                           │
│     ├── Target completion date                                                │
│     ├── Phase notes                                                           │
│     ├── Priority                                                              │
│     ├── Risk level                                                            │
│     ├── Internal status                                                       │
│     ├── Assigned contributors                                                 │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Phase Guide”                                         │
│ Result: Opens guidance for the selected lifecycle phase.                      │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Guide Drawer                                                        │
│     ├── Phase purpose                                                         │
│     ├── Entry criteria                                                        │
│     ├── Required outputs                                                      │
│     ├── Completion rules                                                      │
│     ├── Gate relationship                                                     │
│     ├── Evidence requirements                                                 │
│     ├── Common mistakes                                                       │
│     └── Related templates                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Full Phase Package”                                  │
│ Result: Opens compiled phase package.                                         │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace/phases/[phaseId]/package               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Package Screen                                                      │
│     ├── Phase overview                                                        │
│     ├── Required artifacts                                                    │
│     ├── Completed artifacts                                                   │
│     ├── Evidence package                                                      │
│     ├── Checklist status                                                      │
│     ├── Validation results                                                    │
│     ├── Gate readiness                                                        │
│     └── Export phase package                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Phase Activity”                                           │
│ Result: Shows activity log for selected phase.                                │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Activity Drawer                                                     │
│     ├── Activity timeline                                                     │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Changed object                                                        │
│     ├── Before / after values                                                 │
│     ├── Comments                                                              │
│     └── Audit reference                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. REQUIRED TEMPLATES INTERACTIONS                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click template row                                               │
│ Result: Opens template wizard for that artifact/template.                     │
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
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Create Artifact” from template                            │
│ Result: Starts new artifact from selected template.                           │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/templates/[templateId]?mode=create               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Create Artifact from Template Modal                                       │
│     ├── Template name                                                         │
│     ├── Artifact name                                                         │
│     ├── Artifact code                                                         │
│     ├── Owner                                                                 │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Initial status                                                        │
│     └── Continue to Template Wizard                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Preview Template”                                         │
│ Result: Shows the blank template structure.                                   │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Preview Drawer                                                   │
│     ├── Template metadata                                                     │
│     ├── Required sections                                                     │
│     ├── Optional sections                                                     │
│     ├── Field schema                                                          │
│     ├── Markdown output preview                                               │
│     ├── JSON evidence schema                                                  │
│     └── Use Template action                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click template validation status                                 │
│ Result: Shows template-specific validation issues.                            │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Validation Detail Drawer                                         │
│     ├── Template name                                                         │
│     ├── Completion percentage                                                 │
│     ├── Missing required sections                                             │
│     ├── Missing required fields                                               │
│     ├── Schema validation errors                                              │
│     ├── Evidence requirements                                                 │
│     └── Open Template Wizard                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Generated Artifact”                                  │
│ Result: Opens artifact detail.                                                │
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
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. COMPLETION CHECKLIST INTERACTIONS                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click checklist item                                             │
│ Result: Opens detail for checklist requirement.                               │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Checklist Item Detail Drawer                                              │
│     ├── Checklist item name                                                   │
│     ├── Requirement description                                               │
│     ├── Completion status                                                     │
│     ├── Required artifact                                                     │
│     ├── Required evidence                                                     │
│     ├── Validation rule                                                       │
│     ├── Blocking severity                                                     │
│     ├── Related template                                                      │
│     └── Resolve action                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Manually check/uncheck checklist item                            │
│ Result: Confirms manual override or manual completion.                        │
│ Recommended UI: Confirmation modal when item is governed or evidence-based    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Checklist Override Confirmation Modal                                     │
│     ├── Checklist item                                                        │
│     ├── Current validation state                                              │
│     ├── Reason for manual override                                            │
│     ├── Required comment                                                      │
│     ├── Audit warning                                                         │
│     └── Confirm Override / Cancel                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Completion Rules”                                    │
│ Result: Shows rules used to determine phase completion.                       │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Completion Rules Drawer                                                   │
│     ├── Required artifacts rule                                               │
│     ├── Required evidence rule                                                │
│     ├── Required approvals rule                                               │
│     ├── Validation rule                                                       │
│     ├── Gate submission rule                                                  │
│     ├── Manual override policy                                                │
│     └── Rule source reference                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. EVIDENCE ATTACHMENTS INTERACTIONS                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Add Evidence”                                             │
│ Result: Uploads or links evidence to phase/template/gate/artifact.            │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Evidence Modal                                                        │
│     ├── Upload file                                                           │
│     ├── Add external link                                                     │
│     ├── Evidence name                                                         │
│     ├── Evidence type                                                         │
│     ├── Classification                                                        │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Linked artifact                                                       │
│     ├── Notes                                                                 │
│     └── Save Evidence                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click evidence row                                               │
│ Result: Opens evidence detail.                                                │
│ Recommended UI: Drawer or detail screen                                       │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Drawer                                           │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Linked artifact                                                       │
│     ├── Completeness status                                                   │
│     ├── Version / checksum                                                    │
│     └── Download action                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Link Existing Evidence”                                   │
│ Result: Connects existing evidence to current phase or artifact.              │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Existing Evidence Modal                                              │
│     ├── Evidence search                                                       │
│     ├── Evidence filters                                                      │
│     ├── Evidence list                                                         │
│     ├── Selected evidence                                                     │
│     ├── Link target: phase / artifact / gate                                  │
│     ├── Link rationale                                                        │
│     └── Link Evidence                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Remove Evidence Link”                                     │
│ Result: Removes link but not evidence file.                                   │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Remove Evidence Link Confirmation Modal                                   │
│     ├── Evidence name                                                         │
│     ├── Current linked object                                                 │
│     ├── Impact warning                                                        │
│     ├── Required reason                                                       │
│     └── Remove Link / Cancel                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download Evidence”                                        │
│ Result: Downloads evidence file.                                              │
│ Recommended UI: No new screen unless download options exist                   │
│                                                                              │
│ Optional Screen/Modal:                                                        │
│ └── Evidence Download Options Modal                                           │
│     ├── Download original file                                                │
│     ├── Download metadata JSON                                                │
│     ├── Download with checksum                                                │
│     └── Download evidence package                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 6. VALIDATION WARNINGS INTERACTIONS                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click validation warning                                         │
│ Result: Opens warning detail and fix guidance.                                │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Validation Warning Detail Drawer                                          │
│     ├── Warning severity                                                      │
│     ├── Warning message                                                       │
│     ├── Affected phase                                                        │
│     ├── Affected template                                                     │
│     ├── Affected artifact                                                     │
│     ├── Affected evidence                                                     │
│     ├── Rule that failed                                                      │
│     ├── Recommended fix                                                       │
│     └── Open correction target                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View All Warnings”                                        │
│ Result: Opens full validation report for current phase.                       │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/workspace/phases/[phaseId]/validation            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Validation Report Screen                                            │
│     ├── Validation summary                                                    │
│     ├── Errors                                                                │
│     ├── Warnings                                                              │
│     ├── Informational notices                                                 │
│     ├── Affected objects                                                      │
│     ├── Blocking status                                                       │
│     ├── Recommended fixes                                                     │
│     └── Export validation report                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Run Validation”                                           │
│ Result: Revalidates phase readiness.                                          │
│ Recommended UI: Progress modal or inline loading state                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Validation Progress Modal                                                 │
│     ├── Current validation step                                               │
│     ├── Templates checked                                                     │
│     ├── Evidence checked                                                      │
│     ├── Checklist checked                                                     │
│     ├── Gate readiness checked                                                │
│     ├── Errors found                                                          │
│     └── Close / View Results                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Dismiss Warning”                                          │
│ Result: Dismisses non-blocking warning.                                       │
│ Recommended UI: Confirmation modal when dismissal is auditable                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Dismiss Warning Confirmation Modal                                        │
│     ├── Warning message                                                       │
│     ├── Dismissal reason                                                      │
│     ├── Audit notice                                                          │
│     ├── Revalidation impact                                                   │
│     └── Dismiss / Cancel                                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 7. SUBMIT FOR GATE REVIEW INTERACTIONS                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Submit for Gate Review”                                   │
│ Result: Starts gate submission workflow.                                      │
│ Recommended UI: Modal before creating final submission                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Submit Gate Review Modal                                                  │
│     ├── Gate name                                                             │
│     ├── Gate readiness score                                                  │
│     ├── Required inputs                                                       │
│     ├── Completed artifacts                                                   │
│     ├── Attached evidence                                                     │
│     ├── Remaining warnings                                                    │
│     ├── Assigned approvers                                                    │
│     ├── Due date                                                              │
│     ├── Submission comments                                                   │
│     └── Submit / Cancel                                                       │
│                                                                              │
│ After successful submission:                                                  │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│ Required Screen: Gate Review Screen                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click disabled “Submit for Gate Review”                          │
│ Result: Shows blockers preventing submission.                                 │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Submission Blockers Drawer                                           │
│     ├── Missing templates                                                     │
│     ├── Incomplete artifacts                                                  │
│     ├── Missing evidence                                                      │
│     ├── Blocking validation errors                                            │
│     ├── Missing approvers                                                     │
│     ├── Required actions                                                      │
│     └── Go to first blocker                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Assign Approvers”                                         │
│ Result: Selects reviewers for gate review.                                    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Approvers Modal                                                    │
│     ├── Required approver roles                                               │
│     ├── User search                                                           │
│     ├── Role filter                                                           │
│     ├── Selected approvers                                                    │
│     ├── Review due date                                                       │
│     ├── Notification option                                                   │
│     └── Save Assignments                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Preview Gate Package”                                     │
│ Result: Shows what will be submitted to reviewers.                            │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/gates/[gateId]/package-preview                   │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Package Preview Screen                                               │
│     ├── Gate overview                                                         │
│     ├── Phase summary                                                         │
│     ├── Required inputs                                                       │
│     ├── Artifact package                                                      │
│     ├── Evidence package                                                      │
│     ├── Validation report                                                     │
│     ├── Traceability links                                                    │
│     └── Submit for review action                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Save Draft”                                               │
│ Result: Saves current phase workspace state.                                  │
│ Recommended UI: No new screen; optional toast                                 │
│ Requires New Screen/Modal: No                                                 │
│                                                                              │
│ Optional Modal:                                                               │
│ └── Unsaved Changes Confirmation Modal                                        │
│     ├── Unsaved artifacts                                                     │
│     ├── Unsaved evidence links                                                │
│     ├── Unsaved checklist changes                                             │
│     └── Save / Discard / Cancel                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 8. WORKSPACE ACTION BAR INTERACTIONS                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Continue Next Required Action”                            │
│ Result: Routes user to the next blocking item.                                │
│ Recommended UI: New screen or current screen focus depending on target        │
│                                                                              │
│ Possible Targets:                                                             │
│ ├── Template Wizard Screen                                                    │
│ ├── Evidence Detail Drawer                                                    │
│ ├── Add Evidence Modal                                                        │
│ ├── Validation Warning Detail Drawer                                          │
│ ├── Checklist Item Detail Drawer                                              │
│ └── Submit Gate Review Modal                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Phase Package”                                     │
│ Result: Exports phase artifacts/evidence/checklist/validation package.        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Phase Package Modal                                                │
│     ├── Include artifacts                                                     │
│     ├── Include Markdown files                                                │
│     ├── Include JSON evidence                                                 │
│     ├── Include evidence files                                                │
│     ├── Include validation report                                             │
│     ├── Include checklist summary                                             │
│     ├── Include traceability links                                            │
│     ├── Format: ZIP                                                           │
│     └── Export package                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Reports”                                             │
│ Result: Opens reports scoped to current project/phase.                        │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports?phase=[phaseNumber]                      │
│                                                                              │
│ Required Screen:                                                              │
│ └── Reports Screen                                                            │
│     ├── Lifecycle Status Report                                               │
│     ├── Gate Decision Report                                                  │
│     ├── Traceability Report                                                   │
│     ├── Missing Evidence Report                                               │
│     ├── Approval History Report                                               │
│     └── Full Project Evidence Package                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 9. HEADER / BREADCRUMB / GLOBAL ACTION INTERACTIONS                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click project breadcrumb                                         │
│ Result: Returns to project overview.                                          │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]                                                  │
│                                                                              │
│ Required Screen: Project Overview Screen                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Artifact Library” shortcut                                │
│ Result: Opens artifact library scoped to project/current phase.               │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/artifacts?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen: Artifact Library Screen                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Evidence Center” shortcut                                 │
│ Result: Opens evidence center scoped to project/current phase.                │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/evidence?phase=[phaseNumber]                     │
│                                                                              │
│ Required Screen: Evidence Center Screen                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Traceability” shortcut                                    │
│ Result: Opens traceability matrix scoped to project/current phase.            │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability?phase=[phaseNumber]                 │
│                                                                              │
│ Required Screen: Traceability Matrix Screen                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click global search result                                       │
│ Result: Opens selected project/artifact/evidence/gate/template.               │
│ Recommended UI: Search overlay + route to target                              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Global Search Overlay                                                     │
│     ├── Search input                                                          │
│     ├── Result categories                                                     │
│     ├── Projects                                                              │
│     ├── Artifacts                                                             │
│     ├── Evidence                                                              │
│     ├── Gates                                                                 │
│     ├── Templates                                                             │
│     └── Keyboard navigation                                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 10. SUMMARY — REQUIRED ADDITIONAL FULL SCREENS                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Required full screens from Lifecycle Workspace interactions:                  │
│                                                                              │
│ ├── /projects/[projectId]                                                     │
│ │   └── Project Overview Screen                                               │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace?phase=[phaseNumber]                       │
│ │   └── Phase Workspace State                                                 │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace/phases/[phaseId]/package                  │
│ │   └── Phase Package Screen                                                  │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace/phases/[phaseId]/validation               │
│ │   └── Phase Validation Report Screen                                        │
│ │                                                                            │
│ ├── /projects/[projectId]/templates/[templateId]                              │
│ │   └── Template Wizard Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/artifacts                                           │
│ │   └── Artifact Library Screen                                               │
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
│ ├── /projects/[projectId]/gates/[gateId]/review                               │
│ │   └── Gate Review Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/gates/[gateId]/package-preview                      │
│ │   └── Gate Package Preview Screen                                           │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability                                        │
│ │   └── Traceability Matrix Screen                                            │
│ │                                                                            │
│ └── /projects/[projectId]/reports                                             │
│     └── Reports Screen                                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ 11. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Required modals/drawers from Lifecycle Workspace interactions:                │
│                                                                              │
│ ├── Locked Phase Explanation Modal                                            │
│ ├── Phase Completion Detail Drawer                                            │
│ ├── Start Phase Confirmation Modal                                            │
│ ├── Edit Phase Details Drawer                                                 │
│ ├── Phase Guide Drawer                                                        │
│ ├── Phase Activity Drawer                                                     │
│ ├── Create Artifact from Template Modal                                       │
│ ├── Template Preview Drawer                                                   │
│ ├── Template Validation Detail Drawer                                         │
│ ├── Artifact Detail Drawer                                                    │
│ ├── Checklist Item Detail Drawer                                              │
│ ├── Checklist Override Confirmation Modal                                     │
│ ├── Completion Rules Drawer                                                   │
│ ├── Add Evidence Modal                                                        │
│ ├── Evidence Detail Drawer                                                    │
│ ├── Link Existing Evidence Modal                                              │
│ ├── Remove Evidence Link Confirmation Modal                                   │
│ ├── Evidence Download Options Modal                                           │
│ ├── Validation Warning Detail Drawer                                          │
│ ├── Validation Progress Modal                                                 │
│ ├── Dismiss Warning Confirmation Modal                                        │
│ ├── Submit Gate Review Modal                                                  │
│ ├── Gate Submission Blockers Drawer                                           │
│ ├── Assign Approvers Modal                                                    │
│ ├── Export Phase Package Modal                                                │
│ ├── Global Search Overlay                                                     │
│ └── Unsaved Changes Confirmation Modal                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘