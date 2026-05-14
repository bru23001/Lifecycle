```ini
Master, for the Dashboard, these are the interactions that should open or require new screens/routes, instead of only updating the dashboard in place.

┌──────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD — INTERACTIONS THAT REQUIRE NEW SCREENS                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. NEW PROJECT                                                                │
│                                                                              │
│ Trigger:                                                                      │
│ Click "New Project"                                                          │
│                                                                              │
│ New Screen:                                                                   │
│ New Project Screen                                                            │
│                                                                              │
│ Route:                                                                        │
│ /projects/new                                                                 │
│                                                                              │
│ Purpose:                                                                      │
│ Create a new lifecycle project using project identity, lifecycle model,       │
│ owner, status, scope, and initial phase configuration.                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. OPEN PROJECT                                                               │
│                                                                              │
│ Trigger:                                                                      │
│ Click project card or row inside Active Projects                              │
│                                                                              │
│ New Screen/modal:                                                                   │
│ Project Overview Screen                                                       │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}                                                         │
│                                                                              │
│ Purpose:                                                                      │
│ View selected project profile, lifecycle timeline, artifacts, gates,          │
│ traceability, and audit trail.                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. CONTINUE NEXT REQUIRED ACTION                                              │
│                                                                              │
│ Trigger:                                                                      │
│ Click "Continue" / "Continue Next Required Action"                           │
│                                                                              │
│ New Screen:                                                                   │
│ Context-dependent target screen                                               │
│                                                                              │
│ Possible Routes:                                                              │
│ /projects/{projectId}/workspace?phase={phaseNumber}                           │
│ /projects/{projectId}/templates/{templateId}                                  │
│ /projects/{projectId}/artifacts/{artifactId}                                  │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│ /approvals/{approvalId}                                                       │
│                                                                              │
│ Purpose:                                                                      │
│ Send the user directly to the next unfinished or blocking lifecycle task.      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. OPEN LIFECYCLE PROGRESS                                                    │
│                                                                              │
│ Trigger:                                                                      │
│ Click Lifecycle Progress card, progress bar, phase indicator, or              │
│ "View Full Timeline"                                                         │
│                                                                              │
│ New Screen:                                                                   │
│ Lifecycle Workspace or Project Lifecycle Timeline                             │
│                                                                              │
│ Primary Route:                                                                │
│ /projects/{projectId}/workspace?phase={currentPhaseNumber}                    │
│                                                                              │
│ Alternative Route:                                                            │
│ /projects/{projectId}?tab=lifecycle_timeline                                  │
│                                                                              │
│ Purpose:                                                                      │
│ Continue lifecycle execution or inspect the full project phase timeline.      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5. OPEN CURRENT PHASE                                                         │
│                                                                              │
│ Trigger:                                                                      │
│ Click current phase label, phase badge, or "Open Current Phase"               │
│                                                                              │
│ New Screen:                                                                   │
│ Lifecycle Workspace                                                           │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/workspace?phase={phaseNumber}                           │
│                                                                              │
│ Purpose:                                                                      │
│ Work on the selected lifecycle phase, templates, checklist, evidence, and     │
│ gate readiness.                                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 6. OPEN GATE STATUS SUMMARY                                                   │
│                                                                              │
│ Trigger:                                                                      │
│ Click Gate Status Summary card or a specific gate row                         │
│                                                                              │
│ New Screen:                                                                   │
│ Gate Review Screen                                                            │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│                                                                              │
│ Purpose:                                                                      │
│ Review required inputs, completion evidence, decision criteria, approvers,    │
│ decision record, and next phase unlock.                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 7. OPEN ALL GATES                                                             │
│                                                                              │
│ Trigger:                                                                      │
│ Click "View All Gates"                                                       │
│                                                                              │
│ New Screen:                                                                   │
│ Project Gates Tab                                                             │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}?tab=gates                                               │
│                                                                              │
│ Purpose:                                                                      │
│ Show all lifecycle gates for the selected project and their review status.    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 8. OPEN BLOCKER                                                               │
│                                                                              │
│ Trigger:                                                                      │
│ Click a blocker inside Blockers / Missing Evidence                            │
│                                                                              │
│ New Screen:                                                                   │
│ Context-dependent blocker target                                              │
│                                                                              │
│ Possible Routes:                                                              │
│ /projects/{projectId}/workspace?phase={phaseNumber}                           │
│ /projects/{projectId}/artifacts/{artifactId}                                  │
│ /projects/{projectId}/templates/{templateId}                                  │
│ /projects/{projectId}/evidence/{evidenceId}                                   │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│ /projects/{projectId}/traceability                                            │
│                                                                              │
│ Purpose:                                                                      │
│ Take the user directly to the object causing the blocker.                     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 9. VIEW ALL BLOCKERS / MISSING EVIDENCE                                       │
│                                                                              │
│ Trigger:                                                                      │
│ Click "View All Blockers" or "View Missing Evidence"                         │
│                                                                              │
│ New Screen:                                                                   │
│ Evidence Center or Traceability Matrix                                        │
│                                                                              │
│ Primary Route:                                                                │
│ /projects/{projectId}/evidence                                                │
│                                                                              │
│ Alternative Route:                                                            │
│ /projects/{projectId}/traceability                                            │
│                                                                              │
│ Purpose:                                                                      │
│ Inspect all missing evidence, incomplete evidence links, orphan evidence,     │
│ and traceability gaps.                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 10. OPEN RECENT DECISION       done                                               │
│                                                                              │
│ Trigger:                                                                      │
│ Click item inside Recent Decisions                                            │
│                                                                              │
│ New Screen:                                                                   │
│ Gate Review, Approval Detail, or Audit Detail                                 │
│                                                                              │
│ Possible Routes:                                                              │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│ /approvals/{approvalId}                                                       │
│ /projects/{projectId}/audit/{auditEventId}                                    │
│                                                                              │
│ Purpose:                                                                      │
│ Review the decision record, approver comments, gate state, and audit trail.   │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ 11. VIEW ALL RECENT DECISIONS                                                 │
│                                                                              │
│ Trigger:                                                                      │
│ Click "View All Decisions"                                                   │
│                                                                              │
│ New Screen:                                                                   │
│ Approval Center or Approval History Report                                    │
│                                                                              │
│ Primary Route:                                                                │
│ /approvals                                                                    │
│                                                                              │
│ Alternative Route:                                                            │
│ /projects/{projectId}/reports/approval-history                                │
│                                                                              │
│ Purpose:                                                                      │
│ Show full approval and decision history across projects or within a project.  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 12. OPEN PENDING APPROVAL                                                     │
│                                                                              │
│ Trigger:                                                                      │
│ Click pending approval metric, approval badge, or approval list item          │
│                                                                              │
│ New Screen:                                                                   │
│ Approval Detail Screen                                                        │
│                                                                              │
│ Route:                                                                        │
│ /approvals/{approvalId}                                                       │
│                                                                              │
│ Purpose:                                                                      │
│ Review an approval package, comments, history, and record a decision.         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 13. OPEN APPROVAL CENTER                                                      │
│                                                                              │
│ Trigger:                                                                      │
│ Click "View Approval Center" or pending approvals KPI                         │
│                                                                              │
│ New Screen:                                                                   │
│ Approval Center                                                               │
│                                                                              │
│ Route:                                                                        │
│ /approvals                                                                    │
│                                                                              │
│ Purpose:                                                                      │
│ Manage pending approvals, approval details, comments, decisions, and history. │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 14. OPEN ARTIFACTS                                                            │
│                                                                              │
│ Trigger:                                                                      │
│ Click artifacts metric, artifact status, or "View Artifacts"                 │
│                                                                              │
│ New Screen:                                                                   │
│ Artifact Library                                                              │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/artifacts                                               │
│                                                                              │
│ Purpose:                                                                      │
│ Browse artifacts, Markdown output, JSON evidence, versions, linked phases,    │
│ linked gates, and export packages.                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 15. OPEN SPECIFIC ARTIFACT                                                    │
│                                                                              │
│ Trigger:                                                                      │
│ Click artifact-related recent activity or blocker                             │
│                                                                              │
│ New Screen:                                                                   │
│ Artifact Detail                                                               │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/artifacts/{artifactId}                                  │
│                                                                              │
│ Purpose:                                                                      │
│ View artifact detail, Markdown, JSON evidence, version history, and exports.  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 16. OPEN TEMPLATE TASK                                                        │
│                                                                              │
│ Trigger:                                                                      │
│ Click incomplete template task or template warning                            │
│                                                                              │
│ New Screen:                                                                   │
│ Template Wizard                                                               │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/templates/{templateId}                                  │
│                                                                              │
│ Purpose:                                                                      │
│ Complete a required lifecycle template through the dynamic form wizard.       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 17. OPEN EVIDENCE CENTER                                                      │
│                                                                              │
│ Trigger:                                                                      │
│ Click evidence metric, evidence warning, missing evidence count, or           │
│ "View Evidence"                                                              │
│                                                                              │
│ New Screen:                                                                   │
│ Evidence Center                                                               │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/evidence                                                │
│                                                                              │
│ Purpose:                                                                      │
│ Manage evidence items, evidence completeness, evidence by gate/phase, and     │
│ evidence export bundles.                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 18. OPEN SPECIFIC EVIDENCE ITEM                                               │
│                                                                              │
│ Trigger:                                                                      │
│ Click evidence item from blocker, activity, or missing evidence list          │
│                                                                              │
│ New Screen:                                                                   │
│ Evidence Detail                                                               │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/evidence/{evidenceId}                                   │
│                                                                              │
│ Purpose:                                                                      │
│ Inspect selected evidence metadata, preview, links, completeness, and history.│
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 19. OPEN TRACEABILITY MATRIX                                                  │
│                                                                              │
│ Trigger:                                                                      │
│ Click traceability metric, traceability warning, coverage badge, or           │
│ "View Traceability"                                                          │
│                                                                              │
│ New Screen:                                                                   │
│ Traceability Matrix                                                           │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/traceability                                            │
│                                                                              │
│ Purpose:                                                                      │
│ Review phase-artifact, requirement-design, requirement-test, gate-evidence,   │
│ gap/orphan, and coverage data.                                                │
│                                                                              │
│ Implementation Subtasks:                                                      │
│ [ ] Define data contract for phase-artifact, req-design, req-test,            │
│     gate-evidence, gap/orphan, and coverage sources.                          │
│ [ ] Add route + page shell for /projects/{projectId}/traceability             │
│     with project context header and breadcrumbs.                              │
│ [ ] Build matrix/table view for relationship mapping with status states        │
│     (linked, missing, orphaned, partial).                                     │
│ [ ] Add gap/orphan section and coverage summary cards                          │
│     (overall + by phase/domain).                                              │
│ [ ] Wire all triggers (metric, warning, coverage badge,                       │
│     "View Traceability") to this screen.                                      │
│ [ ] Add filtering + drill-down from matrix cells to                           │
│     requirement/artifact/evidence detail screens.                             │
│ [ ] Implement loading, empty, and error states for no-data                    │
│     and retrieval-failure scenarios.                                          │
│ [ ] Add tests for mapping logic, coverage/gap calculations,                   │
│     and route-level navigation behavior.                                      │
│ [ ] Validate done criteria: all entry points open the screen,                 │
│     matrix relationships render correctly, and coverage is accurate.          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 20. OPEN REPORTS                                                              │
│                                                                              │
│ Trigger:                                                                      │
│ Click reports shortcut, export/report action, or dashboard report widget      │
│                                                                              │
│ New Screen:                                                                   │
│ Reports                                                                       │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/reports                                                 │
│                                                                              │
│ Purpose:                                                                      │
│ Generate lifecycle status, gate decision, traceability, missing evidence,     │
│ approval history, and full evidence package reports.                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 21. OPEN SPECIFIC REPORT                                                      │
│                                                                              │
│ Trigger:                                                                      │
│ Click a report card or report shortcut                                        │
│                                                                              │
│ New Screen:                                                                   │
│ Specific Report Detail                                                        │
│                                                                              │
│ Possible Routes:                                                              │
│ /projects/{projectId}/reports/lifecycle-status                                │
│ /projects/{projectId}/reports/gate-decisions                                  │
│ /projects/{projectId}/reports/traceability                                    │
│ /projects/{projectId}/reports/missing-evidence                                │
│ /projects/{projectId}/reports/approval-history                                │
│ /projects/{projectId}/reports/evidence-package                                │
│                                                                              │
│ Purpose:                                                                      │
│ View and export a detailed report.                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 22. OPEN AUDIT TRAIL                                                          │
│                                                                              │
│ Trigger:                                                                      │
│ Click audit-related recent activity, project audit count, or "View Audit"     │
│                                                                              │
│ New Screen:                                                                   │
│ Project Audit Trail                                                           │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}?tab=audit_trail                                         │
│                                                                              │
│ Purpose:                                                                      │
│ Review immutable project events, lifecycle changes, approvals, artifacts,     │
│ evidence updates, and decision records.                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 23. OPEN SETTINGS                                                             │
│                                                                              │
│ Trigger:                                                                      │
│ Click settings shortcut, lifecycle configuration warning, template registry   │
│ warning, gate rule warning, or admin configuration action                     │
│                                                                              │
│ New Screen:                                                                   │
│ Settings                                                                      │
│                                                                              │
│ Possible Routes:                                                              │
│ /settings                                                                     │
│ /settings/lifecycle                                                           │
│ /settings/templates                                                           │
│ /settings/gates                                                               │
│ /settings/roles                                                               │
│ /settings/exports                                                             │
│ /settings/storage                                                             │
│                                                                              │
│ Purpose:                                                                      │
│ Configure lifecycle, templates, gate rules, roles, exports, and storage.      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 24. OPEN NOTIFICATIONS                                                        │
│                                                                              │
│ Trigger:                                                                      │
│ Click notification bell or notification item                                  │
│                                                                              │
│ New Screen:                                                                   │
│ Notification Center or contextual target                                      │
│                                                                              │
│ Possible Routes:                                                              │
│ /notifications                                                                │
│ /approvals/{approvalId}                                                       │
│ /projects/{projectId}/workspace?phase={phaseNumber}                           │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│                                                                              │
│ Purpose:                                                                      │
│ Show all notifications or route to the notified lifecycle object.             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 25. GLOBAL SEARCH RESULT                                                      │
│                                                                              │
│ Trigger:                                                                      │
│ Select result from global search                                              │
│                                                                              │
│ New Screen:                                                                   │
│ Search target detail screen                                                   │
│                                                                              │
│ Possible Routes:                                                              │
│ /projects/{projectId}                                                         │
│ /projects/{projectId}/workspace?phase={phaseNumber}                           │
│ /projects/{projectId}/artifacts/{artifactId}                                  │
│ /projects/{projectId}/evidence/{evidenceId}                                   │
│ /projects/{projectId}/gates/{gateId}/review                                   │
│ /approvals/{approvalId}                                                       │
│ /projects/{projectId}/traceability                                            │
│ /projects/{projectId}/reports                                                 │
│                                                                              │
│ Purpose:                                                                      │
│ Navigate directly to the selected object or workflow.                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 26. EXPORT FULL PROJECT PACKAGE                                               │
│                                                                              │
│ Trigger:                                                                      │
│ Click "Export Project Package" or evidence package shortcut                  │
│                                                                              │
│ New Screen:                                                                   │
│ Full Project Evidence Package / Export Configuration                          │
│                                                                              │
│ Route:                                                                        │
│ /projects/{projectId}/reports/evidence-package/configure                      │
│                                                                              │
│ Purpose:                                                                      │
│ Configure and export full evidence package with artifacts, evidence, reports, │
│ traceability, approvals, and audit manifest.                                  │
│                                                                              │
│ Implementation Subtasks:                                                      │
│ [ ] Add route + page shell for                                                 │
│     /projects/{projectId}/reports/evidence-package/configure with project     │
│     context, breadcrumbs, and alignment to the reports hub layout.            │
│ [ ] Define data contract + server loader for package contents: artifact        │
│     inventory, evidence index, report summaries, traceability snapshot,         │
│     approvals/gate decisions, and audit manifest metadata.                    │
│ [ ] Build configure UI: section toggles (and optional filters such as phase/  │
│     gate/date) with live counts, validation when nothing is selected, and    │
│     a read-only preview of manifest sections before export.                   │
│ [ ] Implement export job: bundle assembly (ZIP or equivalent), manifest JSON, │
│     streaming/download response, and guardrails (max size, timeout, errors).  │
│ [ ] Wire triggers: dashboard “Export Project Package” and evidence-package    │
│     shortcuts navigate to configure; support query defaults where useful.     │
│ [ ] Add loading/progress, success with download affordance, empty states, and │
│     retrieval/generation error + retry paths.                                 │
│ [ ] Add tests for manifest assembly, URL wiring, and route smoke; validate    │
│     done criteria: all content types can be included and export completes.    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Dashboard interactions that do not need new screens should stay in-place: filtering dashboard widgets, sorting lists, expanding/collapsing cards, opening quick preview popovers, switching dashboard time range, dismissing tips, and refreshing metrics.
```

