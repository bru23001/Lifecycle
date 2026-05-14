For the Projects screen, these are the interactions that require new screens, modals, drawers, or dedicated detail views.

┌──────────────────────────────────────────────────────────────────────────────┐
│ PROJECTS SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. PROJECT LIST INTERACTIONS                                                  │
│                                                                              │
│ Interaction: Click “New Project”                                              │
│ Result: Opens new project creation flow.                                      │
│ Recommended UI: New screen                                                    │
│ Route: /projects/new                                                          │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── New Project Screen                                                        │
│     ├── Project identity                                                      │
│     ├── Project code                                                          │
│     ├── Description                                                           │
│     ├── Owner                                                                 │
│     ├── Business area                                                         │
│     ├── Lifecycle model selection                                             │
│     ├── Initial phase                                                         │
│     └── Create Project action                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click project row/card                                           │
│ Result: Loads selected project detail.                                        │
│ Recommended UI: Same screen state update OR dedicated detail route            │
│ Route: /projects/[projectId]                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Project Overview Screen / Detail State                                    │
│     ├── Project overview                                                      │
│     ├── Project profile                                                       │
│     ├── Lifecycle progress                                                    │
│     ├── Artifacts summary                                                     │
│     ├── Gates summary                                                         │
│     ├── Traceability summary                                                  │
│     └── Audit summary                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Search projects                                                  │
│ Result: Filters project list.                                                 │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Filter projects                                                  │
│ Result: Filters project list by status, owner, lifecycle phase, gate state.   │
│ Recommended UI: Filter popover or drawer                                      │
│ Required Screen/Modal:                                                        │
│ └── Project Filters Popover / Drawer                                          │
│     ├── Status filter                                                         │
│     ├── Owner filter                                                          │
│     ├── Phase filter                                                          │
│     ├── Gate status filter                                                    │
│     ├── Missing evidence filter                                               │
│     ├── Date range filter                                                     │
│     └── Apply / Reset filters                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Sort projects                                                    │
│ Result: Changes project list order.                                           │
│ Recommended UI: Dropdown                                                      │
│ Required Screen/Modal:                                                        │
│ └── Sort Dropdown                                                             │
│     ├── Last updated                                                          │
│     ├── Created date                                                          │
│     ├── Project name                                                          │
│     ├── Lifecycle progress                                                    │
│     ├── Gate status                                                           │
│     └── Missing evidence count                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. PROJECT OVERVIEW INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “Open Workspace” / “Continue Project”                      │
│ Result: Opens lifecycle execution workspace.                                  │
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
│ Interaction: Click lifecycle phase in timeline                                │
│ Result: Opens phase-specific workspace.                                       │
│ Recommended UI: New screen with phase query param                             │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Workspace View                                                      │
│     ├── Phase header                                                          │
│     ├── Phase requirements                                                    │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Phase checklist                                                       │
│     └── Gate readiness                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View All Artifacts”                                       │
│ Result: Opens artifact library for selected project.                          │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/artifacts                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Library Screen                                                   │
│     ├── Artifact List                                                         │
│     ├── Artifact Detail                                                       │
│     ├── Version History                                                       │
│     ├── Markdown View                                                         │
│     ├── JSON Evidence View                                                    │
│     ├── Linked Phase                                                          │
│     ├── Linked Gate                                                           │
│     └── Export Package                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click artifact summary item                                      │
│ Result: Opens selected artifact detail.                                       │
│ Recommended UI: New detail route OR artifact drawer                           │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Detail Screen / Drawer                                           │
│     ├── Artifact metadata                                                     │
│     ├── Markdown preview                                                      │
│     ├── JSON evidence preview                                                 │
│     ├── Version history                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Gates” / gate summary item                           │
│ Result: Opens gates list or specific gate review.                             │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/gates                                            │
│ Route Detail: /projects/[projectId]/gates/[gateId]/review                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Gates Screen                                                              │
│ │   ├── Gate list                                                             │
│ │   ├── Gate status                                                           │
│ │   ├── Required inputs                                                       │
│ │   ├── Evidence readiness                                                    │
│ │   └── Decision state                                                        │
│ │                                                                            │
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
│ Interaction: Click “View Traceability”                                        │
│ Result: Opens traceability matrix.                                            │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability                                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Matrix Screen                                                │
│     ├── Phase → Artifact Links                                                │
│     ├── Requirement → Design Links                                            │
│     ├── Requirement → Test Links                                              │
│     ├── Gate → Evidence Links                                                 │
│     ├── Gaps / Orphans                                                        │
│     └── Coverage Summary                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Evidence” / missing evidence item                    │
│ Result: Opens evidence center or evidence detail.                             │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/evidence                                         │
│ Route Detail: /projects/[projectId]/evidence/[evidenceId]                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Evidence Center Screen                                                    │
│ │   ├── Evidence Items                                                        │
│ │   ├── Evidence Detail                                                       │
│ │   ├── Evidence Completeness                                                 │
│ │   ├── Evidence by Gate                                                      │
│ │   ├── Evidence by Phase                                                     │
│ │   └── Evidence Export Bundle                                                │
│ │                                                                            │
│ └── Evidence Detail Modal / Drawer                                            │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Linked artifact                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     └── Download action                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. PROJECT PROFILE INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click “Edit Project Profile”                                     │
│ Result: Allows editing project metadata.                                      │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Project Profile Drawer                                               │
│     ├── Project name                                                          │
│     ├── Project code                                                          │
│     ├── Description                                                           │
│     ├── Owner                                                                 │
│     ├── Sponsor                                                               │
│     ├── Business area                                                         │
│     ├── Priority                                                              │
│     ├── Status                                                                │
│     ├── Target dates                                                          │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Change Owner”                                             │
│ Result: Reassigns project owner.                                              │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Change Owner Modal                                                        │
│     ├── Current owner                                                         │
│     ├── New owner search/select                                               │
│     ├── Optional reassignment note                                            │
│     └── Confirm reassignment                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Archive Project”                                          │
│ Result: Archives selected project.                                            │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Archive Project Confirmation Modal                                        │
│     ├── Project name confirmation                                             │
│     ├── Impact warning                                                        │
│     ├── Archive reason                                                        │
│     └── Confirm / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Delete Project”                                           │
│ Result: Deletes or soft-deletes project.                                      │
│ Recommended UI: Destructive confirmation modal                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Delete Project Confirmation Modal                                         │
│     ├── Destructive warning                                                   │
│     ├── Type project code to confirm                                          │
│     ├── Delete reason                                                         │
│     └── Delete / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. LIFECYCLE TIMELINE INTERACTIONS                                            │
│                                                                              │
│ Interaction: Click phase node                                                 │
│ Result: Opens phase workspace.                                                │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/workspace?phase=[phaseNumber]                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Workspace Screen                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click phase status / details                                     │
│ Result: Shows detailed phase metadata without leaving Projects screen.        │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Detail Drawer                                                       │
│     ├── Phase number                                                          │
│     ├── Phase name                                                            │
│     ├── Status                                                                │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Completion checklist                                                  │
│     ├── Gate dependency                                                       │
│     └── Open Workspace action                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Start Phase”                                              │
│ Result: Starts next lifecycle phase.                                          │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Start Phase Confirmation Modal                                            │
│     ├── Phase being started                                                   │
│     ├── Prerequisite status                                                   │
│     ├── Required templates to initialize                                      │
│     ├── Required evidence expectations                                        │
│     └── Start Phase / Cancel                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Submit Gate” from timeline                                │
│ Result: Opens gate submission or gate review flow.                            │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Submit Gate Review Modal                                                  │
│ │   ├── Gate readiness summary                                                │
│ │   ├── Required inputs                                                       │
│ │   ├── Missing evidence                                                      │
│ │   ├── Validation warnings                                                   │
│ │   └── Submit / Cancel                                                       │
│ │                                                                            │
│ └── Gate Review Screen                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. ARTIFACTS TAB INTERACTIONS                                                 │
│                                                                              │
│ Interaction: Click “Create Artifact”                                          │
│ Result: Starts artifact creation using selected template.                     │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/templates/[templateId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Template Selection Modal                                                  │
│ │   ├── Phase filter                                                          │
│ │   ├── Template list                                                         │
│ │   ├── Required/optional marker                                              │
│ │   └── Continue                                                              │
│ │                                                                            │
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
│ Interaction: Click artifact row                                               │
│ Result: Opens artifact detail.                                                │
│ Recommended UI: Detail screen or drawer                                       │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Detail Screen / Drawer                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click artifact actions menu                                      │
│ Result: Shows artifact actions.                                               │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Actions Menu                                                     │
│     ├── Open                                                                  │
│     ├── Edit                                                                  │
│     ├── Duplicate                                                             │
│     ├── Export Markdown                                                       │
│     ├── Export JSON Evidence                                                  │
│     ├── View Version History                                                  │
│     ├── Link Evidence                                                         │
│     └── Archive                                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Version History”                                     │
│ Result: Shows artifact versions.                                              │
│ Recommended UI: Modal, drawer, or Artifact Library tab                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Version History Drawer                                                    │
│     ├── Version list                                                          │
│     ├── Author                                                                │
│     ├── Timestamp                                                             │
│     ├── Change summary                                                        │
│     ├── Compare version                                                       │
│     └── Restore version                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. GATES TAB INTERACTIONS                                                     │
│                                                                              │
│ Interaction: Click gate row                                                   │
│ Result: Opens gate review.                                                    │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Review Screen                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Submit for Gate Review”                                   │
│ Result: Submits phase/gate package.                                           │
│ Recommended UI: Modal before navigation                                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Submit Gate Review Modal                                                  │
│     ├── Gate readiness                                                        │
│     ├── Required inputs                                                       │
│     ├── Evidence checklist                                                    │
│     ├── Validation warnings                                                   │
│     ├── Assigned approvers                                                    │
│     └── Submit / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Assign Approvers”                                         │
│ Result: Assigns users/roles to gate approval.                                 │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Approvers Modal                                                    │
│     ├── Approver search                                                       │
│     ├── Role filter                                                           │
│     ├── Required approver roles                                               │
│     ├── Selected approvers                                                    │
│     ├── Due date                                                              │
│     └── Save assignments                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Decision Record”                                     │
│ Result: Shows immutable gate decision.                                        │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Record Drawer                                                    │
│     ├── Decision outcome                                                      │
│     ├── Decided by                                                            │
│     ├── Decision timestamp                                                    │
│     ├── Decision comments                                                     │
│     ├── Conditions                                                            │
│     ├── Evidence snapshot                                                     │
│     └── Audit reference                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. TRACEABILITY TAB INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click “Open Traceability Matrix”                                 │
│ Result: Opens matrix screen.                                                  │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability                                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Matrix Screen                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click traceability gap                                           │
│ Result: Shows missing/broken link detail.                                     │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Gap Detail Drawer                                            │
│     ├── Gap type                                                              │
│     ├── Source object                                                         │
│     ├── Missing target                                                        │
│     ├── Impact level                                                          │
│     ├── Recommended fix                                                       │
│     └── Create link action                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Create Trace Link”                                        │
│ Result: Creates manual traceability link.                                     │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Create Trace Link Modal                                                   │
│     ├── Source type                                                           │
│     ├── Source object                                                         │
│     ├── Target type                                                           │
│     ├── Target object                                                         │
│     ├── Link type                                                             │
│     ├── Rationale                                                             │
│     └── Save link                                                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. AUDIT TRAIL TAB INTERACTIONS                                               │
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
│     ├── Related artifact/gate/evidence                                        │
│     └── Audit hash/reference                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Audit Trail”                                       │
│ Result: Exports audit history.                                                │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Audit Trail Modal                                                  │
│     ├── Date range                                                            │
│     ├── Event type filter                                                     │
│     ├── Actor filter                                                          │
│     ├── Format: CSV / JSON / PDF                                              │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. PROJECT QUICK ACTIONS                                                      │
│                                                                              │
│ Interaction: Click “Add Evidence”                                             │
│ Result: Uploads or links evidence to project/phase/gate/artifact.            │
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
│     ├── Linked artifact                                                       │
│     └── Save evidence                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Generate Report”                                          │
│ Result: Opens reports screen or report selection modal.                       │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/reports                                          │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Reports Screen                                                            │
│ │   ├── Lifecycle Status Report                                               │
│ │   ├── Gate Decision Report                                                  │
│ │   ├── Traceability Report                                                   │
│ │   ├── Missing Evidence Report                                               │
│ │   ├── Approval History Report                                               │
│ │   └── Full Project Evidence Package                                         │
│ │                                                                            │
│ └── Report Selection Modal                                                    │
│     ├── Report type                                                           │
│     ├── Date range                                                            │
│     ├── Format                                                                │
│     └── Generate                                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Project Package”                                   │
│ Result: Exports project artifacts/evidence/reports.                           │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Project Package Modal                                              │
│     ├── Include artifacts                                                     │
│     ├── Include evidence                                                      │
│     ├── Include gate decisions                                                │
│     ├── Include approval history                                              │
│     ├── Include traceability matrix                                           │
│     ├── Include audit trail                                                   │
│     ├── Format: ZIP                                                           │
│     └── Export package                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. SUMMARY — REQUIRED ADDITIONAL SCREENS                                     │
│                                                                              │
│ Required full screens from Projects interactions:                             │
│                                                                              │
│ ├── /projects/new                                                             │
│ │   └── New Project Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]                                                     │
│ │   └── Project Detail / Overview Screen                                      │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace                                           │
│ │   └── Lifecycle Workspace Screen                                            │
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
│ ├── /projects/[projectId]/gates                                               │
│ │   └── Gates Screen                                                          │
│ │                                                                            │
│ ├── /projects/[projectId]/gates/[gateId]/review                               │
│ │   └── Gate Review Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability                                        │
│ │   └── Traceability Matrix Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence                                            │
│ │   └── Evidence Center Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/[evidenceId]                               │
│ │   └── Evidence Detail Screen                                                │
│ │                                                                            │
│ └── /projects/[projectId]/reports                                             │
│     └── Reports Screen                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Projects interactions:                           │
│                                                                              │
│ ├── Project Filters Drawer                                                    │
│ ├── Sort Dropdown                                                             │
│ ├── Edit Project Profile Drawer                                               │
│ ├── Change Owner Modal                                                        │
│ ├── Archive Project Confirmation Modal                                        │
│ ├── Delete Project Confirmation Modal                                         │
│ ├── Phase Detail Drawer                                                       │
│ ├── Start Phase Confirmation Modal                                            │
│ ├── Submit Gate Review Modal                                                  │
│ ├── Assign Approvers Modal                                                    │
│ ├── Decision Record Drawer                                                    │
│ ├── Template Selection Modal                                                  │
│ ├── Artifact Actions Menu                                                     │
│ ├── Version History Drawer                                                    │
│ ├── Evidence Detail Drawer                                                    │
│ ├── Traceability Gap Detail Drawer                                            │
│ ├── Create Trace Link Modal                                                   │
│ ├── Audit Event Detail Drawer                                                 │
│ ├── Export Audit Trail Modal                                                  │
│ ├── Add Evidence Modal                                                        │
│ ├── Report Selection Modal                                                    │
│ └── Export Project Package Modal                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

## 11.1 Scope — where section 11 applies

Section 11 is a **product-wide** checklist: each item MUST exist somewhere in the Projects domain (list shell, dedicated routes, or workspace). Items are **not** all required on the `/projects` URL alone unless the Primary screen column is “Projects list”.

**Cross-reference:** Full-screen anchors are summarized in **section 10** (`/projects/new`, `/projects/[id]`, `/projects/[id]/workspace`, etc.).

**Last reviewed:** 2026-05-13 (implementation matrix below).

---

## 11.2 Compliance matrix — modals & drawers

| # | Requirement | Canonical route / component | Surface | Primary screen | Status | Notes |
|---|----------------|-----------------------------|---------|----------------|--------|-------|
| 1 | Project Filters Drawer | `components/projects/project-list-toolbar.tsx` | Anchored panel (popover) | Projects list (`/projects`) | Done | Spec “drawer”; implemented as filter popover + Apply/Reset. |
| 2 | Sort Dropdown | `project-list-toolbar.tsx` | Popover | Projects list | Done | Six sort keys aligned with spec. |
| 3 | Edit Project Profile Drawer | `components/projects/project-profile-tab.tsx` → `ProfileEditDrawer` | Right panel overlay | Projects list → Profile tab | Done | |
| 4 | Change Owner Modal | `project-profile-tab.tsx` → `ChangeOwnerModal` | `<dialog>` | Projects list → Profile tab | Done | |
| 5 | Archive Project Confirmation Modal | `project-profile-tab.tsx` → `ArchiveModal` | `<dialog>` | Projects list → Profile tab | Done | |
| 6 | Delete Project Confirmation Modal | `project-profile-tab.tsx` → `DeleteModal` | `<dialog>` | Projects list → Profile tab | Done | |
| 7 | Phase Detail Drawer | `components/lifecycle-workspace/phase-detail-drawer.tsx` | Right drawer | Projects list (overview + timeline) + Workspace phase nav | Done | Info on each phase; overview strip now includes same actions row as timeline when `lifecycleStrip` is set. |
| 8 | Start Phase Confirmation Modal | `components/lifecycle-workspace/start-phase-confirm-modal.tsx` | `<dialog>` | Projects list (overview strip toolbar + timeline) + Workspace navigator | Done | Overview uses `showToolbar` on `ProjectLifecyclePhaseStrip`. |
| 9 | Submit Gate Review Modal | `components/lifecycle-workspace/submit-gate-review-modal.tsx` | `<dialog>` | `/projects/[id]/workspace` | Done | |
| 10 | Assign Approvers Modal | `components/gate-review/assign-approvers-modal.tsx` (if present) / gate review UI | Modal or inline | `/projects/[id]/gates/[gateId]/review` | Partial | Dedicated assign flow on gate review; list shell has no separate assign modal. |
| 11 | Decision Record Drawer | `components/gate-review/decision-record-drawer.tsx` | `<dialog>` / drawer | `/projects/[id]/gates` | Done | |
| 12 | Template Selection Modal | `components/projects/project-artifacts-tab.tsx` → `TemplateSelectionModal` | `<dialog>` | Projects list → Artifacts tab | Done | Also wizard aside: `template-selection-panel.tsx` on template route. |
| 13 | Artifact Actions Menu | Artifact library / detail components | Menu / actions | `/projects/[id]/artifacts` | Done | Not on list shell. |
| 14 | Version History Drawer | Data from `lib/server/artifact-library-screen.ts`; UI in artifact library/detail | Panel / sections | Artifacts routes | Partial | Verify dedicated “drawer” vs inline panel per UX sign-off. |
| 15 | Evidence Detail Drawer | `components/evidence-center/evidence-detail-panel.tsx` | Side panel | `/projects/[id]/evidence` | Done | Full page variant: `evidence/[evidenceId]`. |
| 16 | Traceability Gap Detail Drawer | Traceability matrix / report views | Panel / routes | `/projects/[id]/traceability/*` | Partial | Gap emphasis on report page; confirm drawer parity. |
| 17 | Create Trace Link Modal | Traceability flows | Modal or route | `/projects/[id]/traceability/*` | Partial | Confirm single canonical entry point. |
| 18 | Audit Event Detail Drawer | `project-audit-tabs.tsx` + links from `lib/server/project-audit-screen.ts` | Links → routes | Projects list → Audit tab | Partial | Deep links to artifact/evidence; no slide-over drawer on list. |
| 19 | Export Audit Trail Modal | Export via reports / quick actions | Page flow | `/projects/[id]/reports/*` | Partial | No dedicated modal on `/projects`; package/export routes. |
| 20 | Add Evidence Modal | Evidence center actions | Modal / page | `/projects/[id]/evidence` | Partial | Confirm naming vs “Add Evidence” spec label. |
| 21 | Report Selection Modal | `components/reports/reports-page.tsx` | Full page hub | `/projects/[id]/reports` | Done | Implemented as reports hub (not a tiny modal). |
| 22 | Export Project Package Modal | `/projects/[id]/reports/evidence-package/configure` | Page / wizard | Reports | Done | Aligns with “Export Project Package” in quick actions. |

### Open decisions (PM / UX)

- **Row 1:** Keep filter popover vs rebuild as slide-over drawer for literal spec match.
- **Rows 14, 16–20:** Close “Partial” rows after UX audit (drawer vs page is acceptable if documented).

---

## 11.3 Implementation changelog

| Date | Change |
|------|--------|
| 2026-05-13 | Added shared `PhaseDetailDrawer` + `StartPhaseConfirmModal`; wired workspace `PhaseNavigator` (detail + advance); projects strip refactored to shared components; added compliance matrix §11.1–11.2. |
| 2026-05-13 | Overview lifecycle strip: enable toolbar (`Start next phase`, `Submit gate review`) alongside phase map. |
