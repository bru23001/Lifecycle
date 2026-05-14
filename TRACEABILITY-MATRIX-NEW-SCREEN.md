┌──────────────────────────────────────────────────────────────────────────────┐
│ TRACEABILITY MATRIX SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS / MODALS  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. PRIMARY SCREEN CONTEXT                                                     │
│                                                                              │
│ Screen: Traceability Matrix                                                   │
│ Route: /projects/[projectId]/traceability                                     │
│                                                                              │
│ Purpose:                                                                      │
│ The Traceability Matrix gives the user a project-wide view of lifecycle       │
│ coverage across phases, artifacts, requirements, designs, tests, gates,       │
│ evidence, gaps, and orphan records.                                           │
│                                                                              │
│ Any interaction that requires editing links, drilling into coverage, fixing   │
│ gaps, viewing detailed evidence, or exporting traceability data should open   │
│ a dedicated screen, modal, drawer, or report view.                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. FILTER BAR INTERACTIONS                                                    │
│                                                                              │
│ Interaction: Change Project filter                                            │
│ Result: Loads traceability matrix for another project.                        │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Change View Mode                                                 │
│ Result: Filters visible traceability categories.                              │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ View Modes:                                                                   │
│ ├── All Links                                                                 │
│ ├── Phase Links                                                               │
│ ├── Requirement Links                                                         │
│ ├── Gate Links                                                                │
│ ├── Evidence Links                                                            │
│ └── Gaps / Orphans                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Change Phase filter                                              │
│ Result: Filters traceability data by lifecycle phase.                         │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Change Status filter                                             │
│ Result: Filters links by complete, partial, missing, or orphaned state.       │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “More Filters”                                             │
│ Result: Opens advanced traceability filters.                                  │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Advanced Traceability Filters Drawer                                      │
│     ├── Object type filter                                                    │
│     │   ├── Phase                                                             │
│     │   ├── Artifact                                                          │
│     │   ├── Requirement                                                       │
│     │   ├── Design                                                            │
│     │   ├── Test                                                              │
│     │   ├── Gate                                                              │
│     │   └── Evidence                                                          │
│     │                                                                        │
│     ├── Link type filter                                                      │
│     │   ├── Phase → Artifact                                                  │
│     │   ├── Requirement → Design                                              │
│     │   ├── Requirement → Test                                                │
│     │   ├── Gate → Evidence                                                   │
│     │   ├── Artifact → Evidence                                               │
│     │   └── Gate → Decision Record                                            │
│     │                                                                        │
│     ├── Coverage state                                                        │
│     │   ├── Complete                                                          │
│     │   ├── Partial                                                           │
│     │   ├── Missing                                                           │
│     │   └── Orphaned                                                          │
│     │                                                                        │
│     ├── Impact level                                                          │
│     │   ├── Critical                                                          │
│     │   ├── High                                                              │
│     │   ├── Medium                                                            │
│     │   └── Low                                                               │
│     │                                                                        │
│     ├── Owner / assignee filter                                               │
│     ├── Last updated date range                                               │
│     ├── Gate status filter                                                    │
│     ├── Evidence status filter                                                │
│     └── Apply / Reset filters                                                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. PHASE → ARTIFACT LINKS INTERACTIONS                                        │
│                                                                              │
│ Interaction: Click “View All” on Phase → Artifact Links card                  │
│ Result: Opens full phase-artifact coverage detail view.                       │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/phase-artifacts                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Artifact Traceability Detail Screen                                 │
│     ├── Phase list                                                            │
│     ├── Required artifacts per phase                                          │
│     ├── Linked artifacts                                                      │
│     ├── Missing artifacts                                                     │
│     ├── Artifact status                                                       │
│     ├── Coverage percentage                                                   │
│     ├── Link health                                                           │
│     └── Create / repair link actions                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click phase row inside Phase → Artifact Links                    │
│ Result: Shows detailed artifact coverage for selected phase.                  │
│ Recommended UI: Drawer or new screen                                          │
│ Route Option: /projects/[projectId]/traceability/phase-artifacts/[phaseId]    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Artifact Coverage Drawer                                            │
│     ├── Phase number                                                          │
│     ├── Phase name                                                            │
│     ├── Required artifact list                                                │
│     ├── Linked artifact list                                                  │
│     ├── Missing artifact list                                                 │
│     ├── Artifact owners                                                       │
│     ├── Completion status                                                     │
│     ├── Open phase workspace action                                           │
│     └── Create missing artifact action                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked artifact inside phase coverage detail               │
│ Result: Opens selected artifact.                                              │
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
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. REQUIREMENT → DESIGN LINKS INTERACTIONS                                    │
│                                                                              │
│ Interaction: Click “View All” on Requirement → Design Links card              │
│ Result: Opens full requirement-design traceability detail view.               │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/requirements-design                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Requirement Design Traceability Detail Screen                             │
│     ├── Requirement list                                                      │
│     ├── Requirement type                                                      │
│     ├── Linked design artifacts                                               │
│     ├── Missing design links                                                  │
│     ├── Coverage percentage                                                   │
│     ├── Link rationale                                                        │
│     ├── Link owner                                                            │
│     └── Create / repair design link actions                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click requirement type row                                       │
│ Result: Shows requirements of that type and their design coverage.            │
│ Recommended UI: Drawer or new screen                                          │
│ Route Option: /projects/[projectId]/traceability/requirements-design?type=... │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Requirement Design Coverage Drawer                                        │
│     ├── Requirement type                                                      │
│     ├── Total requirements                                                    │
│     ├── Requirements with design links                                        │
│     ├── Requirements missing design links                                     │
│     ├── Linked design artifacts                                               │
│     ├── Impact summary                                                        │
│     ├── Open requirements action                                              │
│     └── Create design link action                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click individual requirement                                     │
│ Result: Opens requirement detail.                                             │
│ Recommended UI: Detail drawer or screen                                       │
│ Route Option: /projects/[projectId]/requirements/[requirementId]              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Requirement Detail Drawer / Screen                                        │
│     ├── Requirement ID                                                        │
│     ├── Requirement statement                                                 │
│     ├── Requirement type                                                      │
│     ├── Source                                                                │
│     ├── Priority                                                              │
│     ├── Acceptance criteria                                                   │
│     ├── Linked designs                                                        │
│     ├── Linked tests                                                          │
│     ├── Linked evidence                                                       │
│     └── Traceability health                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked design artifact                                     │
│ Result: Opens design artifact detail.                                         │
│ Recommended UI: Artifact detail screen or drawer                              │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Design Artifact Detail Screen / Drawer                                    │
│     ├── Design artifact metadata                                              │
│     ├── Markdown/design view                                                  │
│     ├── Linked requirements                                                   │
│     ├── Linked tests                                                          │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     └── Version history                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. REQUIREMENT → TEST LINKS INTERACTIONS                                      │
│                                                                              │
│ Interaction: Click “View All” on Requirement → Test Links card                │
│ Result: Opens full requirement-test traceability detail view.                 │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/requirements-tests                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Requirement Test Traceability Detail Screen                               │
│     ├── Requirement list                                                      │
│     ├── Requirement type                                                      │
│     ├── Linked test cases                                                     │
│     ├── Missing test links                                                    │
│     ├── Test type                                                             │
│     ├── Test status                                                           │
│     ├── Coverage percentage                                                   │
│     ├── Verification status                                                   │
│     └── Create / repair test link actions                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click requirement type row                                       │
│ Result: Shows requirements of that type and their test coverage.              │
│ Recommended UI: Drawer or new screen                                          │
│ Route Option: /projects/[projectId]/traceability/requirements-tests?type=...  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Requirement Test Coverage Drawer                                          │
│     ├── Requirement type                                                      │
│     ├── Total requirements                                                    │
│     ├── Requirements with tests                                               │
│     ├── Requirements missing tests                                            │
│     ├── Failed / unexecuted tests                                             │
│     ├── Verification impact                                                   │
│     ├── Open test coverage action                                             │
│     └── Create test link action                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click individual test link                                       │
│ Result: Opens test case or test evidence detail.                              │
│ Recommended UI: Detail drawer or screen                                       │
│ Route Option: /projects/[projectId]/tests/[testId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Test Detail Drawer / Screen                                               │
│     ├── Test ID                                                               │
│     ├── Test name                                                             │
│     ├── Test type                                                             │
│     ├── Linked requirement                                                    │
│     ├── Expected result                                                       │
│     ├── Execution status                                                      │
│     ├── Last execution                                                        │
│     ├── Test evidence                                                         │
│     └── Defects / findings                                                    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. GATE → EVIDENCE LINKS INTERACTIONS                                         │
│                                                                              │
│ Interaction: Click “View All” on Gate → Evidence Links card                   │
│ Result: Opens full gate-evidence traceability detail view.                    │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/gate-evidence                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Evidence Traceability Detail Screen                                  │
│     ├── Gate list                                                             │
│     ├── Gate status                                                           │
│     ├── Required evidence                                                     │
│     ├── Linked evidence                                                       │
│     ├── Missing evidence                                                      │
│     ├── Gate decision state                                                   │
│     ├── Evidence completeness                                                 │
│     └── Open gate review action                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click gate row                                                   │
│ Result: Shows evidence coverage for selected gate.                            │
│ Recommended UI: Drawer or new screen                                          │
│ Route Option: /projects/[projectId]/traceability/gate-evidence/[gateId]       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Evidence Coverage Drawer                                             │
│     ├── Gate code                                                             │
│     ├── Gate name                                                             │
│     ├── Gate status                                                           │
│     ├── Required evidence list                                                │
│     ├── Linked evidence list                                                  │
│     ├── Missing evidence list                                                 │
│     ├── Readiness percentage                                                  │
│     ├── Open gate review action                                               │
│     └── Add missing evidence action                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked evidence                                            │
│ Result: Opens evidence detail.                                                │
│ Recommended UI: Evidence detail screen or drawer                              │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Screen / Drawer                                           │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Linked artifact                                                       │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Completeness                                                          │
│     └── Download / export actions                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Gate Review”                                         │
│ Result: Opens gate review screen.                                             │
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
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. GAPS / ORPHANS INTERACTIONS                                                │
│                                                                              │
│ Interaction: Click “View All” on Gaps / Orphans card                          │
│ Result: Opens full gaps and orphan records screen.                            │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/gaps                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Gaps / Orphans Screen                                        │
│     ├── Requirement gaps                                                      │
│     ├── Design orphans                                                        │
│     ├── Test orphans                                                          │
│     ├── Evidence orphans                                                      │
│     ├── Broken links                                                          │
│     ├── Impact level                                                          │
│     ├── Recommended fix                                                       │
│     ├── Owner / assignee                                                      │
│     └── Remediation actions                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click gap/orphan row                                             │
│ Result: Opens gap detail and remediation actions.                             │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Gap Detail Drawer                                            │
│     ├── Gap ID                                                                │
│     ├── Gap type                                                              │
│     ├── Source object                                                         │
│     ├── Missing target object                                                 │
│     ├── Broken relationship                                                   │
│     ├── Impact level                                                          │
│     ├── Lifecycle risk                                                        │
│     ├── Recommended fix                                                       │
│     ├── Create link action                                                    │
│     ├── Mark as accepted risk                                                 │
│     └── Assign remediation owner                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Create Link” from gap drawer                              │
│ Result: Opens create trace link workflow.                                     │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Create Trace Link Modal                                                   │
│     ├── Source type                                                           │
│     ├── Source object                                                         │
│     ├── Target type                                                           │
│     ├── Target object                                                         │
│     ├── Link type                                                             │
│     ├── Link rationale                                                        │
│     ├── Confidence / verification method                                      │
│     └── Save link                                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Mark as Accepted Risk”                                    │
│ Result: Records accepted traceability risk exception.                         │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Accept Traceability Risk Modal                                            │
│     ├── Gap summary                                                           │
│     ├── Risk impact                                                           │
│     ├── Justification                                                         │
│     ├── Expiration / review date                                              │
│     ├── Approver required marker                                              │
│     └── Confirm accepted risk                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Assign Remediation Owner”                                 │
│ Result: Assigns user responsible for closing the gap.                         │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Traceability Remediation Modal                                     │
│     ├── Gap summary                                                           │
│     ├── Owner search                                                          │
│     ├── Due date                                                              │
│     ├── Priority                                                              │
│     ├── Instructions                                                          │
│     └── Assign                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. COVERAGE SUMMARY INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “View Coverage Report”                                     │
│ Result: Opens detailed traceability coverage report.                          │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/report                              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Coverage Report Screen                                       │
│     ├── Overall coverage summary                                              │
│     ├── Phase artifact coverage                                               │
│     ├── Requirement design coverage                                           │
│     ├── Requirement test coverage                                             │
│     ├── Gate evidence coverage                                                │
│     ├── Gap and orphan summary                                                │
│     ├── Critical traceability risks                                           │
│     ├── Export report actions                                                 │
│     └── Remediation recommendations                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click coverage metric card                                       │
│ Result: Opens filtered coverage detail.                                       │
│ Recommended UI: Drawer or filtered report screen                              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Coverage Metric Detail Drawer                                             │
│     ├── Metric name                                                           │
│     ├── Metric definition                                                     │
│     ├── Covered objects                                                       │
│     ├── Partially covered objects                                             │
│     ├── Missing links                                                         │
│     ├── Orphaned objects                                                      │
│     ├── Trend if available                                                    │
│     └── Open full report action                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. CREATE / EDIT TRACEABILITY LINK INTERACTIONS                               │
│                                                                              │
│ Interaction: Click “Create Trace Link”                                        │
│ Result: Creates a manual traceability relationship.                           │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Create Trace Link Modal                                                   │
│     ├── Source object type                                                    │
│     ├── Source object search                                                  │
│     ├── Target object type                                                    │
│     ├── Target object search                                                  │
│     ├── Link type                                                             │
│     │   ├── satisfies                                                         │
│     │   ├── implements                                                        │
│     │   ├── verifies                                                          │
│     │   ├── evidences                                                         │
│     │   ├── depends_on                                                        │
│     │   └── blocks                                                            │
│     │                                                                        │
│     ├── Rationale                                                             │
│     ├── Confidence level                                                      │
│     ├── Evidence reference                                                    │
│     └── Save link                                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click existing trace link                                        │
│ Result: Shows relationship detail.                                            │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Trace Link Detail Drawer                                                  │
│     ├── Link ID                                                               │
│     ├── Source object                                                         │
│     ├── Target object                                                         │
│     ├── Link type                                                             │
│     ├── Rationale                                                             │
│     ├── Created by                                                            │
│     ├── Created date                                                          │
│     ├── Last verified date                                                    │
│     ├── Confidence                                                            │
│     ├── Edit link                                                             │
│     └── Delete link                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Edit Trace Link”                                          │
│ Result: Edits an existing traceability relationship.                          │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Trace Link Modal                                                     │
│     ├── Source object                                                         │
│     ├── Target object                                                         │
│     ├── Link type                                                             │
│     ├── Rationale                                                             │
│     ├── Confidence level                                                      │
│     ├── Verification note                                                     │
│     └── Save changes                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Delete Trace Link”                                        │
│ Result: Deletes or disables a traceability link.                              │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Delete Trace Link Confirmation Modal                                      │
│     ├── Source object                                                         │
│     ├── Target object                                                         │
│     ├── Impact warning                                                        │
│     ├── Deletion reason                                                       │
│     └── Delete / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. EXPORT / REPORT INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “Export Matrix”                                            │
│ Result: Exports traceability matrix.                                          │
│ Recommended UI: Dropdown + optional modal                                     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Traceability Matrix Modal                                          │
│     ├── Export scope                                                          │
│     │   ├── Current filters                                                   │
│     │   ├── Full project matrix                                               │
│     │   ├── Gaps only                                                         │
│     │   ├── Requirement coverage only                                         │
│     │   └── Gate evidence only                                                │
│     │                                                                        │
│     ├── Format                                                                │
│     │   ├── CSV                                                               │
│     │   ├── JSON                                                              │
│     │   ├── PDF                                                               │
│     │   └── ZIP package                                                       │
│     │                                                                        │
│     ├── Include metadata                                                      │
│     ├── Include gap details                                                   │
│     ├── Include evidence links                                                │
│     ├── Include audit references                                              │
│     └── Export                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Traceability Report”                                 │
│ Result: Opens detailed report screen.                                         │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/traceability/report                              │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Report Screen                                                │
│     ├── Executive summary                                                     │
│     ├── Coverage summary                                                      │
│     ├── Phase artifact matrix                                                 │
│     ├── Requirement design matrix                                             │
│     ├── Requirement test matrix                                               │
│     ├── Gate evidence matrix                                                  │
│     ├── Gaps / orphans                                                        │
│     ├── Recommendations                                                       │
│     └── Export report                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Schedule Traceability Report”                             │
│ Result: Creates recurring report schedule.                                    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Schedule Traceability Report Modal                                        │
│     ├── Report name                                                           │
│     ├── Frequency                                                             │
│     │   ├── Daily                                                             │
│     │   ├── Weekly                                                            │
│     │   ├── Monthly                                                           │
│     │   └── Gate submission event                                             │
│     │                                                                        │
│     ├── Recipients                                                            │
│     ├── Format                                                                │
│     ├── Include gaps only option                                              │
│     ├── Include full matrix option                                            │
│     └── Save schedule                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. OBJECT DRILL-DOWN INTERACTIONS                                            │
│                                                                              │
│ Interaction: Click source or target object                                    │
│ Result: Opens corresponding object detail.                                    │
│ Recommended UI: Existing screen or drawer                                     │
│                                                                              │
│ Required Screen/Modal Options:                                                │
│                                                                              │
│ ├── Phase Detail Drawer                                                       │
│ │   ├── Phase metadata                                                        │
│ │   ├── Required artifacts                                                    │
│ │   ├── Required evidence                                                     │
│ │   └── Open workspace                                                        │
│ │                                                                            │
│ ├── Artifact Detail Screen / Drawer                                           │
│ │   ├── Artifact metadata                                                     │
│ │   ├── Markdown view                                                         │
│ │   ├── JSON evidence view                                                    │
│ │   └── Version history                                                       │
│ │                                                                            │
│ ├── Requirement Detail Drawer / Screen                                        │
│ │   ├── Requirement statement                                                 │
│ │   ├── Acceptance criteria                                                   │
│ │   ├── Linked design                                                         │
│ │   └── Linked tests                                                          │
│ │                                                                            │
│ ├── Design Detail Drawer / Screen                                             │
│ │   ├── Design artifact                                                       │
│ │   ├── Architecture section                                                  │
│ │   ├── Linked requirements                                                   │
│ │   └── Design evidence                                                       │
│ │                                                                            │
│ ├── Test Detail Drawer / Screen                                               │
│ │   ├── Test case                                                             │
│ │   ├── Execution result                                                      │
│ │   ├── Linked requirement                                                    │
│ │   └── Test evidence                                                         │
│ │                                                                            │
│ ├── Gate Review Screen                                                        │
│ │   └── /projects/[projectId]/gates/[gateId]/review                           │
│ │                                                                            │
│ └── Evidence Detail Screen / Drawer                                           │
│     ├── Evidence preview                                                      │
│     ├── Metadata                                                              │
│     ├── Linked phase/gate/artifact                                            │
│     └── Export/download                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 12. SUMMARY — REQUIRED ADDITIONAL FULL SCREENS                                │
│                                                                              │
│ Required full screens from Traceability Matrix interactions:                  │
│                                                                              │
│ ├── /projects/[projectId]/traceability/phase-artifacts                        │
│ │   └── Phase Artifact Traceability Detail Screen                             │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/phase-artifacts/[phaseId]              │
│ │   └── Phase Artifact Coverage Detail Screen                                 │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/requirements-design                    │
│ │   └── Requirement Design Traceability Detail Screen                         │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/requirements-tests                     │
│ │   └── Requirement Test Traceability Detail Screen                           │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/gate-evidence                          │
│ │   └── Gate Evidence Traceability Detail Screen                              │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/gate-evidence/[gateId]                 │
│ │   └── Gate Evidence Coverage Detail Screen                                  │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/gaps                                   │
│ │   └── Traceability Gaps / Orphans Screen                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability/report                                 │
│ │   └── Traceability Report Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/requirements/[requirementId]                        │
│ │   └── Requirement Detail Screen                                             │
│ │                                                                            │
│ ├── /projects/[projectId]/tests/[testId]                                      │
│ │   └── Test Detail Screen                                                    │
│ │                                                                            │
│ ├── /projects/[projectId]/artifacts/[artifactId]                              │
│ │   └── Artifact Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence/[evidenceId]                               │
│ │   └── Evidence Detail Screen                                                │
│ │                                                                            │
│ └── /projects/[projectId]/gates/[gateId]/review                               │
│     └── Gate Review Screen                                                    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 13. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Traceability Matrix interactions:                │
│                                                                              │
│ ├── Advanced Traceability Filters Drawer                                      │
│ ├── Phase Artifact Coverage Drawer                                            │
│ ├── Requirement Design Coverage Drawer                                        │
│ ├── Requirement Test Coverage Drawer                                          │
│ ├── Gate Evidence Coverage Drawer                                             │
│ ├── Traceability Gap Detail Drawer                                            │
│ ├── Create Trace Link Modal                                                   │
│ ├── Accept Traceability Risk Modal                                            │
│ ├── Assign Traceability Remediation Modal                                     │
│ ├── Trace Link Detail Drawer                                                  │
│ ├── Edit Trace Link Modal                                                     │
│ ├── Delete Trace Link Confirmation Modal                                      │
│ ├── Coverage Metric Detail Drawer                                             │
│ ├── Export Traceability Matrix Modal                                          │
│ ├── Schedule Traceability Report Modal                                        │
│ ├── Phase Detail Drawer                                                       │
│ ├── Requirement Detail Drawer                                                 │
│ ├── Design Detail Drawer                                                      │
│ ├── Test Detail Drawer                                                        │
│ ├── Artifact Detail Drawer                                                    │
│ └── Evidence Detail Drawer                                                    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 14. IMPLEMENTATION PRIORITY                                                   │
│                                                                              │
│ MVP Priority 1 — Required for useful traceability:                            │
│ ├── Advanced Traceability Filters Drawer                                      │
│ ├── Phase Artifact Traceability Detail Screen                                 │
│ ├── Requirement Design Traceability Detail Screen                             │
│ ├── Requirement Test Traceability Detail Screen                               │
│ ├── Gate Evidence Traceability Detail Screen                                  │
│ ├── Traceability Gap Detail Drawer                                            │
│ ├── Create Trace Link Modal                                                   │
│ └── Traceability Report Screen                                                │
│                                                                              │
│ MVP Priority 2 — Required for remediation workflows:                          │
│ ├── Trace Link Detail Drawer                                                  │
│ ├── Edit Trace Link Modal                                                     │
│ ├── Delete Trace Link Confirmation Modal                                      │
│ ├── Assign Traceability Remediation Modal                                     │
│ ├── Accept Traceability Risk Modal                                            │
│ └── Coverage Metric Detail Drawer                                             │
│                                                                              │
│ MVP Priority 3 — Useful advanced workflow screens:                            │
│ ├── Schedule Traceability Report Modal                                        │
│ ├── Requirement Detail Screen                                                 │
│ ├── Test Detail Screen                                                        │
│ ├── Design Detail Drawer                                                      │
│ └── Detailed filtered coverage screens per object type                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘