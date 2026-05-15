┌──────────────────────────────────────────────────────────────────────────────┐
│ EVIDENCE CENTER SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SCREEN CONTEXT                                                                │
│                                                                              │
│ Screen: Evidence Center                                                       │
│ Route: /projects/[projectId]/evidence                                         │
│ Grid Type: Split Detail Grid Wide                                             │
│                                                                              │
│ Main Areas:                                                                   │
│ ├── Evidence Items                                                            │
│ ├── Evidence Detail                                                           │
│ ├── Evidence Completeness                                                     │
│ ├── Evidence by Gate                                                          │
│ ├── Evidence by Phase                                                         │
│ └── Evidence Export Bundle                                                    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. EVIDENCE ITEMS INTERACTIONS                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Add Evidence”                                             │
│ Result: Adds a new evidence item by upload, link, generated record, or manual │
│ metadata entry.                                                               │
│ Recommended UI: Modal or full screen                                          │
│ Preferred UI: Modal for quick upload; full screen for advanced evidence setup │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Evidence Modal                                                        │
│     ├── Evidence source type                                                  │
│     │   ├── Upload file                                                       │
│     │   ├── Add external link                                                 │
│     │   ├── Create manual evidence record                                     │
│     │   └── Attach generated artifact output                                  │
│     ├── Evidence name                                                         │
│     ├── Evidence description                                                  │
│     ├── Evidence type                                                         │
│     ├── Classification                                                        │
│     ├── Retention policy                                                      │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Linked artifact                                                       │
│     ├── Tags                                                                  │
│     ├── Notes                                                                 │
│     └── Save evidence                                                         │
│                                                                              │
│ Optional Full Route:                                                          │
│ /projects/[projectId]/evidence/new                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click evidence item row/card                                     │
│ Result: Loads selected evidence detail.                                       │
│ Recommended UI: Same screen state update OR detail route                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Detail State                                     │
│     ├── Evidence identity                                                     │
│     ├── Evidence metadata                                                     │
│     ├── Evidence preview                                                      │
│     ├── Linked artifacts                                                      │
│     ├── Linked gates                                                          │
│     ├── Linked phases                                                         │
│     ├── History                                                               │
│     ├── Comments                                                              │
│     └── Download / export actions                                             │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/evidence/[evidenceId]                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Search evidence                                                  │
│ Result: Filters evidence list.                                                │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Filter evidence                                                  │
│ Result: Filters by type, phase, gate, status, classification, owner, date.    │
│ Recommended UI: Filter popover or drawer                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Filters Drawer                                                   │
│     ├── Evidence type                                                         │
│     ├── Evidence status                                                       │
│     ├── Phase                                                                 │
│     ├── Gate                                                                  │
│     ├── Artifact                                                              │
│     ├── Classification                                                        │
│     ├── Uploaded by                                                           │
│     ├── Uploaded date range                                                   │
│     ├── Completeness range                                                    │
│     ├── Linked / unlinked state                                               │
│     └── Apply / Reset filters                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Sort evidence                                                    │
│ Result: Changes evidence list order.                                          │
│ Recommended UI: Dropdown                                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Sort Dropdown                                                    │
│     ├── Last updated                                                          │
│     ├── Upload date                                                           │
│     ├── Evidence name                                                         │
│     ├── Evidence type                                                         │
│     ├── Completeness                                                          │
│     ├── Classification                                                        │
│     ├── Gate                                                                  │
│     └── Phase                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Evidence item actions menu                                       │
│ Result: Shows row-level evidence actions.                                     │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Actions Menu                                                     │
│     ├── Open                                                                  │
│     ├── Preview                                                               │
│     ├── Edit Metadata                                                         │
│     ├── Link to Artifact                                                      │
│     ├── Link to Gate                                                          │
│     ├── Link to Phase                                                         │
│     ├── Download                                                              │
│     ├── Replace File                                                          │
│     ├── View History                                                          │
│     ├── Archive                                                               │
│     └── Delete                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. EVIDENCE DETAIL INTERACTIONS                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Preview” / evidence preview area                          │
│ Result: Opens larger evidence preview.                                        │
│ Recommended UI: Modal or dedicated preview screen                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Preview Modal                                                    │
│     ├── File preview                                                          │
│     ├── Page navigation                                                       │
│     ├── Zoom controls                                                         │
│     ├── Download action                                                       │
│     ├── Open in new tab                                                       │
│     └── Close                                                                 │
│                                                                              │
│ Optional Full Route:                                                          │
│ /projects/[projectId]/evidence/[evidenceId]/preview                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Edit Metadata”                                            │
│ Result: Edits evidence metadata without replacing file.                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Evidence Metadata Drawer                                             │
│     ├── Evidence name                                                         │
│     ├── Description                                                           │
│     ├── Evidence type                                                         │
│     ├── Classification                                                        │
│     ├── Source                                                                │
│     ├── Retention policy                                                      │
│     ├── Tags                                                                  │
│     ├── Notes                                                                 │
│     ├── Confidentiality marker                                                │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Replace File”                                             │
│ Result: Replaces the evidence file while preserving evidence identity.        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Replace Evidence File Modal                                               │
│     ├── Current file summary                                                  │
│     ├── Upload replacement file                                               │
│     ├── Replacement reason                                                    │
│     ├── Version impact notice                                                 │
│     ├── Preserve existing links toggle                                        │
│     └── Replace / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download”                                                 │
│ Result: Downloads selected evidence file.                                     │
│ Recommended UI: No new screen for direct download                             │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ Optional Modal:                                                               │
│ └── Download Confirmation Modal                                               │
│     ├── File name                                                             │
│     ├── Classification warning                                                │
│     ├── Audit log notice                                                      │
│     └── Download / Cancel                                                     │
│                                                                              │
│ Use modal only for confidential or restricted evidence.                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Share”                                                    │
│ Result: Shares evidence link or controlled access.                            │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Share Evidence Modal                                                      │
│     ├── Shareable link                                                        │
│     ├── Access level                                                          │
│     ├── Allowed users / roles                                                 │
│     ├── Expiration date                                                       │
│     ├── Copy link                                                             │
│     ├── Notify users toggle                                                   │
│     └── Save sharing settings                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Archive Evidence”                                         │
│ Result: Archives evidence while preserving audit trace.                       │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Archive Evidence Confirmation Modal                                       │
│     ├── Evidence name                                                         │
│     ├── Archive impact warning                                                │
│     ├── Affected artifact links                                               │
│     ├── Affected gate links                                                   │
│     ├── Archive reason                                                        │
│     └── Archive / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Delete Evidence”                                          │
│ Result: Deletes or soft-deletes evidence item.                                │
│ Recommended UI: Destructive confirmation modal                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Delete Evidence Confirmation Modal                                        │
│     ├── Evidence name                                                         │
│     ├── Destructive warning                                                   │
│     ├── Linked artifacts impacted                                             │
│     ├── Linked gates impacted                                                 │
│     ├── Type evidence code to confirm                                         │
│     ├── Delete reason                                                         │
│     └── Delete / Cancel                                                       │
│                                                                              │
│ Preferred Behavior: soft-delete first, preserve audit log.                    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. LINKED ARTIFACTS INTERACTIONS                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Linked Artifacts” tab                                     │
│ Result: Shows linked artifacts inside detail panel.                           │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked artifact row                                        │
│ Result: Opens artifact detail.                                                │
│ Recommended UI: New screen or drawer                                          │
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
│ Route:                                                                        │
│ /projects/[projectId]/artifacts/[artifactId]                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Link Artifact”                                            │
│ Result: Links evidence to one or more artifacts.                              │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Evidence to Artifact Modal                                           │
│     ├── Evidence item summary                                                 │
│     ├── Artifact search                                                       │
│     ├── Phase filter                                                          │
│     ├── Artifact status filter                                                │
│     ├── Selected artifacts                                                    │
│     ├── Link rationale                                                        │
│     └── Save links                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Unlink Artifact”                                          │
│ Result: Removes evidence-artifact link.                                       │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unlink Artifact Confirmation Modal                                        │
│     ├── Evidence name                                                         │
│     ├── Artifact name                                                         │
│     ├── Impact warning                                                        │
│     ├── Unlink reason                                                         │
│     └── Unlink / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. LINKED GATES INTERACTIONS                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Linked Gates” tab                                         │
│ Result: Shows linked gates inside detail panel.                               │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked gate row                                            │
│ Result: Opens gate review.                                                    │
│ Recommended UI: New screen                                                    │
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
│ Route:                                                                        │
│ /projects/[projectId]/gates/[gateId]/review                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Link Gate”                                                │
│ Result: Links evidence to one or more gates.                                  │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Evidence to Gate Modal                                               │
│     ├── Evidence item summary                                                 │
│     ├── Gate search                                                           │
│     ├── Gate status filter                                                    │
│     ├── Phase filter                                                          │
│     ├── Required evidence indicator                                           │
│     ├── Selected gates                                                        │
│     ├── Link rationale                                                        │
│     └── Save links                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Unlink Gate”                                              │
│ Result: Removes evidence-gate link.                                           │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unlink Gate Confirmation Modal                                            │
│     ├── Evidence name                                                         │
│     ├── Gate name                                                             │
│     ├── Gate readiness impact                                                 │
│     ├── Unlink reason                                                         │
│     └── Unlink / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5. LINKED PHASE INTERACTIONS                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click linked phase / phase row                                   │
│ Result: Opens lifecycle workspace for that phase.                             │
│ Recommended UI: New screen                                                    │
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
│ Route:                                                                        │
│ /projects/[projectId]/workspace?phase=[phaseNumber]                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Link Phase”                                               │
│ Result: Links evidence to one or more lifecycle phases.                       │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Evidence to Phase Modal                                              │
│     ├── Evidence item summary                                                 │
│     ├── Phase selector                                                        │
│     ├── Required evidence indicator                                           │
│     ├── Selected phases                                                       │
│     ├── Link rationale                                                        │
│     └── Save links                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Unlink Phase”                                             │
│ Result: Removes evidence-phase link.                                          │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unlink Phase Confirmation Modal                                           │
│     ├── Evidence name                                                         │
│     ├── Phase name                                                            │
│     ├── Phase completeness impact                                             │
│     ├── Unlink reason                                                         │
│     └── Unlink / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 6. HISTORY AND COMMENTS INTERACTIONS                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “History” tab                                              │
│ Result: Shows evidence history in detail panel.                               │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click history event                                              │
│ Result: Shows detailed evidence history event.                                │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence History Event Drawer                                             │
│     ├── Event type                                                            │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Previous value                                                        │
│     ├── New value                                                             │
│     ├── Related object                                                        │
│     ├── Audit reference                                                       │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Comments” tab                                             │
│ Result: Shows evidence comments in detail panel.                              │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Comment”                                              │
│ Result: Adds evidence comment.                                                │
│ Recommended UI: Inline composer or modal                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Evidence Comment Modal / Inline Composer                              │
│     ├── Comment text                                                          │
│     ├── Visibility                                                            │
│     ├── Mention users                                                         │
│     ├── Attach reference                                                      │
│     └── Save comment                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click comment actions                                            │
│ Result: Edit/delete/comment resolution actions.                               │
│ Recommended UI: Dropdown + confirmation modal where needed                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Comment Actions Menu                                                      │
│ │   ├── Edit                                                                  │
│ │   ├── Resolve                                                               │
│ │   └── Delete                                                                │
│ │                                                                            │
│ └── Delete Comment Confirmation Modal                                         │
│     ├── Comment preview                                                       │
│     ├── Delete warning                                                        │
│     └── Delete / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 7. EVIDENCE COMPLETENESS INTERACTIONS                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “View Completeness Details”                                │
│ Result: Opens evidence completeness detail view.                              │
│ Recommended UI: New screen                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Completeness Details Screen                                      │
│     ├── Overall completeness                                                  │
│     ├── Complete evidence list                                                │
│     ├── Partial evidence list                                                 │
│     ├── Missing evidence list                                                 │
│     ├── Unlinked evidence list                                                │
│     ├── Completeness rules                                                    │
│     ├── Blocking gaps                                                         │
│     └── Remediation actions                                                   │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/evidence/completeness                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click completeness segment                                       │
│ Result: Shows filtered evidence list for complete/partial/missing/unlinked.   │
│ Recommended UI: New screen with query OR drawer                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Completeness Filtered View                                       │
│     ├── Segment selected                                                      │
│     ├── Evidence items                                                        │
│     ├── Blocking status                                                       │
│     ├── Required remediation                                                  │
│     └── Export filtered list                                                  │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/evidence/completeness?status=[status]                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click missing evidence item                                      │
│ Result: Starts remediation for missing required evidence.                     │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Resolve Missing Evidence Modal                                            │
│     ├── Missing evidence requirement                                          │
│     ├── Required by phase/gate/artifact                                       │
│     ├── Upload evidence                                                       │
│     ├── Link existing evidence                                                │
│     ├── Mark not applicable with justification                                │
│     └── Save resolution                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 8. EVIDENCE BY GATE INTERACTIONS                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “View Gate Evidence Matrix”                                │
│ Result: Opens gate evidence matrix.                                           │
│ Recommended UI: New screen                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Evidence Matrix Screen                                               │
│     ├── Gate list                                                             │
│     ├── Required evidence                                                     │
│     ├── Evidence linked                                                       │
│     ├── Missing evidence                                                      │
│     ├── Coverage percentage                                                   │
│     ├── Gate readiness                                                        │
│     └── Remediation actions                                                   │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/traceability/gate-evidence                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click gate row in Evidence by Gate                               │
│ Result: Opens gate review or gate evidence detail.                            │
│ Recommended UI: New screen                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Gate Review Screen                                                        │
│ │   Route: /projects/[projectId]/gates/[gateId]/review                        │
│ │                                                                            │
│ └── Gate Evidence Detail Screen                                               │
│     Route: /projects/[projectId]/traceability/gate-evidence/[gateId]          │
│                                                                              │
│ Gate Evidence Detail Screen Areas:                                            │
│ ├── Gate summary                                                              │
│ ├── Required evidence                                                         │
│ ├── Linked evidence                                                           │
│ ├── Missing evidence                                                          │
│ ├── Evidence completeness                                                     │
│ ├── Gate readiness impact                                                     │
│ └── Export gate evidence package                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click low/missing gate coverage                                  │
│ Result: Opens remediation panel for gate evidence gaps.                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Evidence Gap Drawer                                                  │
│     ├── Gate name                                                             │
│     ├── Required evidence missing                                             │
│     ├── Linked evidence available                                             │
│     ├── Gate decision impact                                                  │
│     ├── Suggested remediation                                                 │
│     └── Add / Link evidence action                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 9. EVIDENCE BY PHASE INTERACTIONS                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “View Phase Evidence Matrix”                               │
│ Result: Opens phase evidence matrix.                                          │
│ Recommended UI: New screen                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Evidence Matrix Screen                                              │
│     ├── Phase list                                                            │
│     ├── Required evidence                                                     │
│     ├── Evidence linked                                                       │
│     ├── Missing evidence                                                      │
│     ├── Coverage percentage                                                   │
│     ├── Phase completion impact                                               │
│     └── Remediation actions                                                   │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/traceability/phase-evidence                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click phase row in Evidence by Phase                             │
│ Result: Opens phase workspace or phase evidence detail.                       │
│ Recommended UI: New screen                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Lifecycle Workspace Screen                                                │
│ │   Route: /projects/[projectId]/workspace?phase=[phaseNumber]                │
│ │                                                                            │
│ └── Phase Evidence Detail Screen                                              │
│     Route: /projects/[projectId]/traceability/phase-evidence/[phaseId]        │
│                                                                              │
│ Phase Evidence Detail Screen Areas:                                           │
│ ├── Phase summary                                                             │
│ ├── Required evidence                                                         │
│ ├── Linked evidence                                                           │
│ ├── Missing evidence                                                          │
│ ├── Evidence completeness                                                     │
│ ├── Phase checklist impact                                                    │
│ └── Export phase evidence package                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click low/missing phase coverage                                 │
│ Result: Opens remediation panel for phase evidence gaps.                      │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Evidence Gap Drawer                                                 │
│     ├── Phase name                                                            │
│     ├── Required evidence missing                                             │
│     ├── Linked evidence available                                             │
│     ├── Phase completion impact                                               │
│     ├── Suggested remediation                                                 │
│     └── Add / Link evidence action                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 10. EVIDENCE EXPORT BUNDLE INTERACTIONS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Export Selected”                                          │
│ Result: Exports currently selected evidence items.                            │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Selected Evidence Modal                                            │
│     ├── Selected evidence count                                               │
│     ├── Evidence list preview                                                 │
│     ├── Include metadata manifest                                             │
│     ├── Include traceability links                                            │
│     ├── Include checksums                                                     │
│     ├── Export format: ZIP                                                    │
│     ├── Classification warning                                                │
│     └── Export / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export by Gate”                                           │
│ Result: Exports evidence bundle scoped to selected gate.                      │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Evidence by Gate Modal                                             │
│     ├── Gate selector                                                         │
│     ├── Gate evidence summary                                                 │
│     ├── Required evidence                                                     │
│     ├── Missing evidence warning                                              │
│     ├── Include gate decision record                                          │
│     ├── Include metadata manifest                                             │
│     ├── Include checksums                                                     │
│     └── Export / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export by Phase”                                          │
│ Result: Exports evidence bundle scoped to selected phase.                     │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Evidence by Phase Modal                                            │
│     ├── Phase selector                                                        │
│     ├── Phase evidence summary                                                │
│     ├── Required evidence                                                     │
│     ├── Missing evidence warning                                              │
│     ├── Include linked artifacts                                              │
│     ├── Include metadata manifest                                             │
│     ├── Include checksums                                                     │
│     └── Export / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Full Bundle”                                       │
│ Result: Exports full project evidence bundle.                                 │
│ Recommended UI: Modal or full screen for package configuration                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Full Evidence Bundle Modal                                         │
│     ├── Project evidence summary                                              │
│     ├── Include all evidence files                                            │
│     ├── Include metadata manifest                                             │
│     ├── Include phase mappings                                                │
│     ├── Include gate mappings                                                 │
│     ├── Include artifact mappings                                             │
│     ├── Include traceability references                                       │
│     ├── Include checksums                                                     │
│     ├── Include audit manifest                                                │
│     ├── Redact restricted fields toggle                                       │
│     ├── Estimated file count                                                  │
│     ├── Estimated package size                                                │
│     └── Export / Cancel                                                       │
│                                                                              │
│ Optional Full Route:                                                          │
│ /projects/[projectId]/evidence/export                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Configure Export Bundle”                                  │
│ Result: Opens detailed export bundle configuration.                           │
│ Recommended UI: Full screen                                                   │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Export Bundle Configuration Screen                               │
│     ├── Export scope                                                          │
│     ├── Included evidence                                                     │
│     ├── Excluded evidence                                                     │
│     ├── Metadata manifest options                                             │
│     ├── Traceability options                                                  │
│     ├── Redaction rules                                                       │
│     ├── Checksum rules                                                        │
│     ├── File naming rules                                                     │
│     ├── Package preview                                                       │
│     └── Generate package                                                      │
│                                                                              │
│ Route:                                                                        │
│ /projects/[projectId]/evidence/export                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 11. VALIDATION / AUDIT INTERACTIONS                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Interaction: Click “Validate Evidence”                                        │
│ Result: Runs evidence completeness and metadata validation.                   │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Validation Results Drawer                                        │
│     ├── Validation summary                                                    │
│     ├── Metadata issues                                                       │
│     ├── Link issues                                                           │
│     ├── Missing required fields                                               │
│     ├── Classification warnings                                               │
│     ├── Gate readiness impact                                                 │
│     ├── Phase completion impact                                               │
│     └── Fix issue actions                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click validation issue                                           │
│ Result: Opens issue-specific remediation.                                     │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Issue Remediation Drawer                                         │
│     ├── Issue type                                                            │
│     ├── Affected evidence                                                     │
│     ├── Required correction                                                   │
│     ├── Related phase/gate/artifact                                           │
│     ├── Recommended fix                                                       │
│     └── Apply fix / Open target                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Audit Reference”                                          │
│ Result: Opens audit event detail for selected evidence.                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Audit Detail Drawer                                              │
│     ├── Audit event ID                                                        │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Action                                                                │
│     ├── Object changed                                                        │
│     ├── Before / after values                                                 │
│     ├── Evidence checksum                                                     │
│     └── Audit hash/reference                                                  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 12. SUMMARY — REQUIRED ADDITIONAL FULL SCREENS                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Required full screens from Evidence Center interactions:                      │
│                                                                              │
│ ├── /projects/[projectId]/evidence/new                                        │
│ │   └── Add Evidence Advanced Screen                                          │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/[evidenceId]                               │
│ │   └── Evidence Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/[evidenceId]/preview                       │
│ │   └── Evidence Preview Screen                                               │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/completeness                               │
│ │   └── Evidence Completeness Details Screen                                  │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/completeness?status=[status]               │
│ │   └── Evidence Completeness Filtered View                                   │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/export                                     │
│ │   └── Evidence Export Bundle Configuration Screen                           │
│ │                                                                            │
│ ├── /projects/[projectId]/artifacts/[artifactId]                              │
│ │   └── Artifact Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/gates/[gateId]/review                               │
│ │   └── Gate Review Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace?phase=[phaseNumber]                       │
│ │   └── Lifecycle Workspace Phase View                                        │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/gate-evidence                          │
│ │   └── Gate Evidence Matrix Screen                                           │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/gate-evidence/[gateId]                 │
│ │   └── Gate Evidence Detail Screen                                           │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/phase-evidence                         │
│ │   └── Phase Evidence Matrix Screen                                          │
│ │                                                                            │
│ └── /projects/[projectId]/traceability/phase-evidence/[phaseId]               │
│     └── Phase Evidence Detail Screen                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 13. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Required modals/drawers from Evidence Center interactions:                    │
│                                                                              │
│ ├── Add Evidence Modal                                                        │
│ ├── Evidence Filters Drawer                                                   │
│ ├── Evidence Sort Dropdown                                                    │
│ ├── Evidence Actions Menu                                                     │
│ ├── Evidence Preview Modal                                                    │
│ ├── Edit Evidence Metadata Drawer                                             │
│ ├── Replace Evidence File Modal                                               │
│ ├── Download Confirmation Modal                                               │
│ ├── Share Evidence Modal                                                      │
│ ├── Archive Evidence Confirmation Modal                                       │
│ ├── Delete Evidence Confirmation Modal                                        │
│ ├── Link Evidence to Artifact Modal                                           │
│ ├── Unlink Artifact Confirmation Modal                                        │
│ ├── Link Evidence to Gate Modal                                               │
│ ├── Unlink Gate Confirmation Modal                                            │
│ ├── Link Evidence to Phase Modal                                              │
│ ├── Unlink Phase Confirmation Modal                                           │
│ ├── Evidence History Event Drawer                                             │
│ ├── Add Evidence Comment Modal / Inline Composer                              │
│ ├── Comment Actions Menu                                                      │
│ ├── Delete Comment Confirmation Modal                                         │
│ ├── Resolve Missing Evidence Modal                                            │
│ ├── Gate Evidence Gap Drawer                                                  │
│ ├── Phase Evidence Gap Drawer                                                 │
│ ├── Export Selected Evidence Modal                                            │
│ ├── Export Evidence by Gate Modal                                             │
│ ├── Export Evidence by Phase Modal                                            │
│ ├── Export Full Evidence Bundle Modal                                         │
│ ├── Evidence Validation Results Drawer                                        │
│ ├── Evidence Issue Remediation Drawer                                         │
│ └── Evidence Audit Detail Drawer                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 14. IMPLEMENTATION PRIORITY                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ MVP Required:                                                                 │
│ ├── Add Evidence Modal                                                        │
│ ├── Evidence Detail Screen / Detail State                                     │
│ ├── Edit Evidence Metadata Drawer                                             │
│ ├── Link Evidence to Artifact Modal                                           │
│ ├── Link Evidence to Gate Modal                                               │
│ ├── Link Evidence to Phase Modal                                              │
│ ├── Evidence Preview Modal                                                    │
│ ├── Evidence Completeness Details Screen                                      │
│ ├── Export Full Evidence Bundle Modal                                         │
│ └── Delete / Archive Confirmation Modals                                      │
│                                                                              │
│ Post-MVP Recommended:                                                         │
│ ├── Evidence Export Bundle Configuration Screen                               │
│ ├── Gate Evidence Matrix Screen                                               │
│ ├── Phase Evidence Matrix Screen                                              │
│ ├── Evidence Validation Results Drawer                                        │
│ ├── Evidence Issue Remediation Drawer                                         │
│ ├── Evidence Audit Detail Drawer                                              │
│ ├── Share Evidence Modal                                                      │
│ └── Advanced filtered completeness views                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘