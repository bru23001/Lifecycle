┌──────────────────────────────────────────────────────────────────────────────┐
│ REPORTS SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. REPORT FILTER INTERACTIONS                                                 │
│                                                                              │
│ Interaction: Change Project filter                                            │
│ Result: Reloads report summaries for selected project.                       │
│ Recommended UI: No new screen                                                 │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Change Date Range filter                                         │
│ Result: Refreshes report summaries for selected period.                      │
│ Recommended UI: Date range popover                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Date Range Picker Popover                                                 │
│     ├── Presets                                                               │
│     │   ├── This Week                                                         │
│     │   ├── This Month                                                        │
│     │   ├── This Quarter                                                      │
│     │   ├── This Year                                                         │
│     │   └── Custom                                                            │
│     ├── Start date                                                            │
│     ├── End date                                                              │
│     ├── Apply                                                                 │
│     └── Reset                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “More Filters”                                             │
│ Result: Opens advanced report filters.                                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Report Filters Drawer                                                     │
│     ├── Project                                                               │
│     ├── Date range                                                            │
│     ├── Lifecycle phase                                                       │
│     ├── Gate                                                                  │
│     ├── Artifact status                                                       │
│     ├── Evidence status                                                       │
│     ├── Approval status                                                       │
│     ├── Report status                                                         │
│     ├── Include archived items                                                │
│     ├── Include draft items                                                   │
│     ├── Apply filters                                                         │
│     └── Reset filters                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. LIFECYCLE STATUS REPORT INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click “View Report” on Lifecycle Status Report                   │
│ Result: Opens detailed lifecycle status report.                              │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/lifecycle-status                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Lifecycle Status Report Screen                                            │
│     ├── Report header                                                         │
│     ├── Overall lifecycle progress                                            │
│     ├── Phase completion summary                                              │
│     ├── Current phase detail                                                  │
│     ├── Milestone status                                                      │
│     ├── Gate readiness summary                                                │
│     ├── Blockers                                                              │
│     ├── Upcoming actions                                                      │
│     ├── Generated timestamp                                                   │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export PDF” on Lifecycle Status Report                    │
│ Result: Exports report directly or opens export options.                     │
│ Recommended UI: Direct download OR export modal                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Lifecycle Status Export Modal                                             │
│     ├── Format: PDF / CSV / JSON                                              │
│     ├── Include phase details                                                 │
│     ├── Include blockers                                                      │
│     ├── Include upcoming actions                                              │
│     ├── Include charts                                                        │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click dropdown/options on Lifecycle Status Report                │
│ Result: Shows additional lifecycle report actions.                           │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Lifecycle Report Actions Menu                                             │
│     ├── View Report                                                           │
│     ├── Export PDF                                                            │
│     ├── Export CSV                                                            │
│     ├── Export JSON                                                           │
│     ├── Schedule Report                                                       │
│     ├── Refresh Report                                                        │
│     └── Copy Report Link                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. GATE DECISION REPORT INTERACTIONS                                          │
│                                                                              │
│ Interaction: Click “View Report” on Gate Decision Report                      │
│ Result: Opens detailed gate decision report.                                 │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/gate-decisions                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Decision Report Screen                                               │
│     ├── Report header                                                         │
│     ├── Gate decision summary                                                 │
│     ├── Gate list                                                             │
│     ├── Approval outcomes                                                     │
│     ├── Pending gates                                                         │
│     ├── Rejected / changed gates                                              │
│     ├── Decision cycle time                                                   │
│     ├── Approver summary                                                      │
│     ├── Decision records                                                      │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click gate row inside Gate Decision Report                       │
│ Result: Opens selected gate review or decision record.                       │
│ Recommended UI: New screen or drawer                                          │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Gate Review Screen                                                        │
│ │   ├── Gate Overview                                                         │
│ │   ├── Required Inputs                                                       │
│ │   ├── Completion Evidence                                                   │
│ │   ├── Decision Criteria                                                     │
│ │   ├── Approver Review                                                       │
│ │   ├── Decision Record                                                       │
│ │   └── Next Phase Unlock                                                     │
│ │                                                                            │
│ └── Gate Decision Record Drawer                                               │
│     ├── Decision outcome                                                      │
│     ├── Decided by                                                            │
│     ├── Decision date                                                         │
│     ├── Approval comments                                                     │
│     ├── Conditions                                                            │
│     ├── Evidence snapshot                                                     │
│     └── Audit reference                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export PDF” on Gate Decision Report                       │
│ Result: Exports gate decision report.                                        │
│ Recommended UI: Export modal                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Decision Export Modal                                                │
│     ├── Format: PDF / CSV / JSON                                              │
│     ├── Include decision records                                              │
│     ├── Include approver comments                                             │
│     ├── Include evidence links                                                │
│     ├── Include pending gates                                                 │
│     ├── Include rejected gates                                                │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. TRACEABILITY REPORT INTERACTIONS                                           │
│                                                                              │
│ Interaction: Click “View Report” on Traceability Report                       │
│ Result: Opens detailed traceability report.                                  │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/traceability                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Report Screen                                                │
│     ├── Report header                                                         │
│     ├── Overall traceability coverage                                         │
│     ├── Requirement → Design coverage                                         │
│     ├── Requirement → Test coverage                                           │
│     ├── Phase → Artifact coverage                                             │
│     ├── Gate → Evidence coverage                                              │
│     ├── Gaps / orphans summary                                                │
│     ├── Traceability risk ranking                                             │
│     ├── Remediation recommendations                                           │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Matrix” or traceability coverage area                │
│ Result: Opens Traceability Matrix screen.                                    │
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
│ Interaction: Click gap/orphan item inside report                              │
│ Result: Opens gap detail.                                                     │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Gap Detail Drawer                                            │
│     ├── Gap type                                                              │
│     ├── Source object                                                         │
│     ├── Missing target                                                        │
│     ├── Impact level                                                          │
│     ├── Affected phase/gate                                                   │
│     ├── Recommended fix                                                       │
│     └── Create trace link action                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export PDF” on Traceability Report                        │
│ Result: Exports traceability report.                                         │
│ Recommended UI: Export modal                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Traceability Report Export Modal                                          │
│     ├── Format: PDF / CSV / JSON                                              │
│     ├── Include full matrix                                                   │
│     ├── Include gaps and orphans                                               │
│     ├── Include coverage charts                                               │
│     ├── Include remediation recommendations                                   │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. MISSING EVIDENCE REPORT INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click “View Report” on Missing Evidence Report                   │
│ Result: Opens detailed missing evidence report.                              │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/missing-evidence                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Missing Evidence Report Screen                                            │
│     ├── Report header                                                         │
│     ├── Missing evidence summary                                              │
│     ├── Incomplete evidence                                                   │
│     ├── Orphaned evidence                                                     │
│     ├── Evidence blocking gates                                               │
│     ├── Evidence blocking phases                                              │
│     ├── Severity ranking                                                      │
│     ├── Owner / responsible party                                             │
│     ├── Remediation actions                                                   │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click missing evidence item                                      │
│ Result: Opens missing evidence detail or create evidence flow.               │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Missing Evidence Detail Drawer                                            │
│ │   ├── Missing evidence requirement                                          │
│ │   ├── Required by phase                                                     │
│ │   ├── Required by gate                                                      │
│ │   ├── Linked artifact                                                       │
│ │   ├── Impact level                                                          │
│ │   ├── Owner                                                                 │
│ │   ├── Due date                                                              │
│ │   └── Add Evidence action                                                   │
│ │                                                                            │
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
│ Interaction: Click “Open Evidence Center”                                     │
│ Result: Opens Evidence Center.                                                │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/evidence                                         │
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
│ Interaction: Click “Export CSV” on Missing Evidence Report                    │
│ Result: Exports missing evidence report.                                     │
│ Recommended UI: Export modal                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Missing Evidence Export Modal                                             │
│     ├── Format: CSV / PDF / JSON                                              │
│     ├── Include missing evidence                                              │
│     ├── Include incomplete evidence                                           │
│     ├── Include orphaned evidence                                             │
│     ├── Include severity and owners                                           │
│     ├── Include remediation notes                                             │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. APPROVAL HISTORY REPORT INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click “View Report” on Approval History Report                   │
│ Result: Opens detailed approval history report.                              │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/approval-history                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval History Report Screen                                            │
│     ├── Report header                                                         │
│     ├── Approval decision summary                                             │
│     ├── Approval timeline                                                     │
│     ├── Approved items                                                        │
│     ├── Rejected items                                                        │
│     ├── Changes requested                                                     │
│     ├── Pending approvals                                                     │
│     ├── Reviewer activity                                                     │
│     ├── Average review time                                                   │
│     └── Export actions                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click approval history item                                      │
│ Result: Opens approval detail.                                                │
│ Recommended UI: New screen or drawer                                          │
│ Route: /approvals/[approvalId]                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Approval Detail Screen                                                    │
│ │   ├── Approval detail                                                       │
│ │   ├── Required inputs                                                       │
│ │   ├── Approver comments                                                     │
│ │   ├── Decision record                                                       │
│ │   └── Approval history                                                      │
│ │                                                                            │
│ └── Approval Event Detail Drawer                                              │
│     ├── Event type                                                            │
│     ├── Actor                                                                 │
│     ├── Timestamp                                                             │
│     ├── Decision state                                                        │
│     ├── Comments                                                              │
│     ├── Related artifact/gate                                                 │
│     └── Audit reference                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open Approval Center”                                     │
│ Result: Opens Approval Center.                                                │
│ Recommended UI: New screen                                                    │
│ Route: /approvals                                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval Center Screen                                                    │
│     ├── Pending Approvals                                                     │
│     ├── Approval Detail                                                       │
│     ├── Approver Comments                                                     │
│     ├── Approve / Reject / Request Changes                                    │
│     └── Approval History                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export PDF” on Approval History Report                    │
│ Result: Exports approval history report.                                     │
│ Recommended UI: Export modal                                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approval History Export Modal                                             │
│     ├── Format: PDF / CSV / JSON                                              │
│     ├── Include approvals                                                     │
│     ├── Include rejections                                                    │
│     ├── Include changes requested                                             │
│     ├── Include approver comments                                             │
│     ├── Include timestamps                                                    │
│     ├── Include audit references                                              │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. FULL PROJECT EVIDENCE PACKAGE INTERACTIONS                                 │
│                                                                              │
│ Interaction: Click “Configure” on Full Project Evidence Package               │
│ Result: Opens evidence package configuration flow.                           │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/reports/evidence-package/configure               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Package Configuration Screen                                     │
│     ├── Package scope                                                         │
│     ├── Include artifacts                                                     │
│     ├── Include evidence files                                                │
│     ├── Include gate decisions                                                │
│     ├── Include approval history                                              │
│     ├── Include traceability links                                            │
│     ├── Include audit manifest                                                │
│     ├── Include checksums                                                     │
│     ├── Redaction options                                                     │
│     ├── Naming pattern                                                        │
│     └── Save configuration                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Package”                                           │
│ Result: Exports full project evidence package.                               │
│ Recommended UI: Export confirmation/progress modal                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Evidence Package Modal                                             │
│     ├── Package contents summary                                              │
│     ├── Estimated file count                                                  │
│     ├── Estimated package size                                                │
│     ├── Include checksum manifest                                             │
│     ├── Include audit manifest                                                │
│     ├── File name                                                             │
│     ├── Export progress                                                       │
│     └── Download package                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click package contents summary                                   │
│ Result: Shows included files and records before export.                      │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Package Contents Drawer                                          │
│     ├── Artifacts included                                                    │
│     ├── Evidence files included                                               │
│     ├── Gate decisions included                                               │
│     ├── Approval records included                                             │
│     ├── Traceability records included                                         │
│     ├── Audit manifest preview                                                │
│     ├── Excluded records                                                      │
│     └── Validation warnings                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. GLOBAL REPORT ACTIONS                                                      │
│                                                                              │
│ Interaction: Click “Export All Reports”                                       │
│ Result: Exports all available reports as package.                            │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export All Reports Modal                                                  │
│     ├── Selected reports                                                      │
│     ├── Lifecycle Status Report                                               │
│     ├── Gate Decision Report                                                  │
│     ├── Traceability Report                                                   │
│     ├── Missing Evidence Report                                               │
│     ├── Approval History Report                                               │
│     ├── Full Evidence Package                                                 │
│     ├── Export format                                                         │
│     ├── File name                                                             │
│     └── Export                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Schedule Reports”                                         │
│ Result: Opens scheduled report configuration.                                │
│ Recommended UI: New screen or modal                                           │
│ Route: /projects/[projectId]/reports/schedule                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Scheduled Reports Screen / Modal                                          │
│     ├── Report selection                                                      │
│     ├── Frequency                                                             │
│     │   ├── Daily                                                             │
│     │   ├── Weekly                                                            │
│     │   ├── Monthly                                                           │
│     │   └── Custom                                                            │
│     ├── Recipients                                                            │
│     ├── Export format                                                         │
│     ├── Delivery method                                                       │
│     ├── Start date                                                            │
│     ├── End date                                                              │
│     └── Save schedule                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Refresh All Reports”                                      │
│ Result: Recalculates report metrics and regenerated timestamps.              │
│ Recommended UI: Progress modal or inline progress state                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Refresh Reports Progress Modal                                            │
│     ├── Lifecycle Status refresh state                                        │
│     ├── Gate Decision refresh state                                           │
│     ├── Traceability refresh state                                            │
│     ├── Missing Evidence refresh state                                        │
│     ├── Approval History refresh state                                        │
│     ├── Evidence Package refresh state                                        │
│     ├── Success / failed count                                                │
│     └── Close / View errors                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click report card “More Options” menu                            │
│ Result: Shows report-specific actions.                                       │
│ Recommended UI: Dropdown menu                                                 │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Report Actions Dropdown                                                   │
│     ├── View Report                                                           │
│     ├── Export PDF                                                            │
│     ├── Export CSV                                                            │
│     ├── Export JSON                                                           │
│     ├── Schedule Report                                                       │
│     ├── Refresh Report                                                        │
│     ├── Copy Report Link                                                      │
│     └── View Generation History                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View Generation History”                                  │
│ Result: Shows previous generated versions of a report.                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Report Generation History Drawer                                          │
│     ├── Generated version list                                                │
│     ├── Generated by                                                          │
│     ├── Generated timestamp                                                   │
│     ├── Filters used                                                          │
│     ├── Exported formats                                                      │
│     ├── Download previous version                                             │
│     └── Regenerate from version                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. SUMMARY — REQUIRED ADDITIONAL SCREENS                                      │
│                                                                              │
│ Required full screens from Reports interactions:                              │
│                                                                              │
│ ├── /projects/[projectId]/reports/lifecycle-status                            │
│ │   └── Lifecycle Status Report Screen                                        │
│ │                                                                            │
│ ├── /projects/[projectId]/reports/gate-decisions                              │
│ │   └── Gate Decision Report Screen                                           │
│ │                                                                            │
│ ├── /projects/[projectId]/reports/traceability                                │
│ │   └── Traceability Report Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/traceability                                        │
│ │   └── Traceability Matrix Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/reports/missing-evidence                            │
│ │   └── Missing Evidence Report Screen                                        │
│ │                                                                            │
│ ├── /projects/[projectId]/evidence                                            │
│ │   └── Evidence Center Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/reports/approval-history                            │
│ │   └── Approval History Report Screen                                        │
│ │                                                                            │
│ ├── /approvals                                                                │
│ │   └── Approval Center Screen                                                │
│ │                                                                            │
│ ├── /approvals/[approvalId]                                                   │
│ │   └── Approval Detail Screen                                                │
│ │                                                                            │
│ ├── /projects/[projectId]/reports/evidence-package/configure                  │
│ │   └── Evidence Package Configuration Screen                                 │
│ │                                                                            │
│ └── /projects/[projectId]/reports/schedule                                    │
│     └── Scheduled Reports Screen                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Reports interactions:                            │
│                                                                              │
│ ├── Date Range Picker Popover                                                 │
│ ├── Report Filters Drawer                                                     │
│ ├── Lifecycle Status Export Modal                                             │
│ ├── Lifecycle Report Actions Menu                                             │
│ ├── Gate Decision Record Drawer                                               │
│ ├── Gate Decision Export Modal                                                │
│ ├── Traceability Gap Detail Drawer                                            │
│ ├── Traceability Report Export Modal                                          │
│ ├── Missing Evidence Detail Drawer                                            │
│ ├── Add Evidence Modal                                                        │
│ ├── Missing Evidence Export Modal                                             │
│ ├── Approval Event Detail Drawer                                              │
│ ├── Approval History Export Modal                                             │
│ ├── Export Evidence Package Modal                                             │
│ ├── Evidence Package Contents Drawer                                          │
│ ├── Export All Reports Modal                                                  │
│ ├── Scheduled Reports Modal                                                   │
│ ├── Refresh Reports Progress Modal                                            │
│ ├── Report Actions Dropdown                                                   │
│ └── Report Generation History Drawer                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. MINIMUM MVP SET                                                           │
│                                                                              │
│ For MVP, implement these first:                                               │
│                                                                              │
│ Full Screens:                                                                 │
│ ├── Lifecycle Status Report Screen                                            │
│ ├── Gate Decision Report Screen                                               │
│ ├── Traceability Report Screen                                                │
│ ├── Missing Evidence Report Screen                                            │
│ ├── Approval History Report Screen                                            │
│ └── Evidence Package Configuration Screen                                     │
│                                                                              │
│ Modals / Drawers:                                                             │
│ ├── Report Filters Drawer                                                     │
│ ├── Generic Report Export Modal                                               │
│ ├── Export All Reports Modal                                                  │
│ ├── Refresh Reports Progress Modal                                            │
│ └── Report Generation History Drawer                                          │
│                                                                              │
│ Reusable Modal Recommendation:                                                │
│                                                                              │
│ Instead of building separate export modals for every report, create one       │
│ reusable GenericReportExportModal that receives:                              │
│                                                                              │
│ GenericReportExportModalProps                                                │
│ ├── reportId                                                                  │
│ ├── reportType                                                                │
│ ├── availableFormats                                                          │
│ ├── defaultFormat                                                             │
│ ├── includeOptions                                                            │
│ ├── filenamePattern                                                           │
│ ├── estimatedSize                                                             │
│ ├── blockers                                                                  │
│ └── onExport                                                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘