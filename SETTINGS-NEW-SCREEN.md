┌──────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. SETTINGS NAVIGATION INTERACTIONS                                           │
│                                                                              │
│ Interaction: Click “Lifecycle Configuration”                                  │
│ Result: Opens lifecycle configuration workspace.                              │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/lifecycle                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Lifecycle Configuration Screen                                            │
│     ├── Lifecycle phases                                                      │
│     ├── Milestones                                                            │
│     ├── Required artifacts                                                    │
│     ├── Phase transitions                                                     │
│     ├── General lifecycle rules                                               │
│     └── Save configuration                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Template Registry”                                        │
│ Result: Opens template registry management workspace.                         │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/templates                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Registry Screen                                                  │
│     ├── Template catalog                                                      │
│     ├── Template schema metadata                                              │
│     ├── Template version                                                      │
│     ├── Output type                                                           │
│     ├── Required/optional flag                                                │
│     ├── Status                                                                │
│     └── Template actions                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Gate Rules”                                               │
│ Result: Opens gate rules management workspace.                                │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/gates                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Rules Screen                                                         │
│     ├── Gate model                                                            │
│     ├── Required inputs                                                       │
│     ├── Evidence rules                                                        │
│     ├── Decision criteria                                                     │
│     ├── Approver rules                                                        │
│     ├── Unlock rules                                                          │
│     └── Gate rule actions                                                     │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Roles / Permissions”                                      │
│ Result: Opens role and permission administration workspace.                   │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/roles                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Roles / Permissions Screen                                                │
│     ├── Role list                                                             │
│     ├── Permission matrix                                                     │
│     ├── Assigned users                                                        │
│     ├── System roles                                                          │
│     ├── Custom roles                                                          │
│     └── Role actions                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Settings”                                          │
│ Result: Opens export configuration workspace.                                 │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/exports                                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Settings Screen                                                    │
│     ├── Export formats                                                        │
│     ├── Package rules                                                         │
│     ├── Filename rules                                                        │
│     ├── Redaction rules                                                       │
│     ├── Checksum settings                                                     │
│     └── Export test action                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Local Storage Settings”                                   │
│ Result: Opens local storage configuration workspace.                          │
│ Recommended UI: Same settings shell with route-level section screen           │
│ Route: /settings/storage                                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Local Storage Settings Screen                                             │
│     ├── Project data path                                                     │
│     ├── Evidence files path                                                   │
│     ├── Export packages path                                                  │
│     ├── Cache path                                                            │
│     ├── Storage usage                                                         │
│     ├── Retention policy                                                      │
│     ├── Backup settings                                                       │
│     └── Sync behavior                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. LIFECYCLE CONFIGURATION INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click “Edit Configuration”                                       │
│ Result: Enables edit mode for lifecycle configuration.                        │
│ Recommended UI: Inline edit mode + confirmation modal if locked               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unlock Configuration Edit Modal                                           │
│     ├── Current configuration status                                          │
│     ├── Editing warning                                                       │
│     ├── Impact summary                                                        │
│     ├── Optional reason for change                                            │
│     └── Unlock / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Phase”                                                │
│ Result: Creates a new lifecycle phase.                                        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Phase Modal                                                           │
│     ├── Phase number / order                                                  │
│     ├── Phase name                                                            │
│     ├── Description                                                           │
│     ├── Key deliverables                                                      │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Entry criteria                                                        │
│     ├── Exit criteria                                                         │
│     ├── Related gate                                                          │
│     └── Add Phase / Cancel                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click phase row                                                  │
│ Result: Opens phase configuration detail.                                     │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Phase Configuration Drawer                                                │
│     ├── Phase identity                                                        │
│     ├── Phase order                                                           │
│     ├── Phase description                                                     │
│     ├── Required templates                                                    │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Entry criteria                                                        │
│     ├── Exit criteria                                                         │
│     ├── Gate dependency                                                       │
│     ├── Transition rules                                                      │
│     └── Edit / Save                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click edit phase icon                                            │
│ Result: Edits phase configuration.                                            │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Phase Modal / Drawer                                                 │
│     ├── Phase name                                                            │
│     ├── Description                                                           │
│     ├── Key deliverables                                                      │
│     ├── Required artifacts                                                    │
│     ├── Entry criteria                                                        │
│     ├── Exit criteria                                                         │
│     ├── Status                                                                │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click reorder handle                                             │
│ Result: Reorders lifecycle phases.                                            │
│ Recommended UI: Drag interaction + confirmation modal                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Confirm Phase Reorder Modal                                               │
│     ├── Previous order                                                        │
│     ├── New order                                                             │
│     ├── Affected gates                                                        │
│     ├── Affected templates                                                    │
│     ├── Affected projects                                                     │
│     └── Confirm Reorder / Cancel                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Milestones” tab                                           │
│ Result: Shows milestone configuration.                                        │
│ Recommended UI: Same screen tab                                               │
│ Required Screen/Modal: None unless adding/editing milestone                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Milestone”                                            │
│ Result: Adds lifecycle milestone.                                             │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Milestone Modal                                                       │
│     ├── Milestone name                                                        │
│     ├── Related phase                                                         │
│     ├── Description                                                           │
│     ├── Completion criteria                                                   │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     └── Add Milestone / Cancel                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Transitions” tab                                          │
│ Result: Shows phase transition rules.                                         │
│ Recommended UI: Same screen tab                                               │
│ Required Screen/Modal: None unless adding/editing transition                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Transition Rule”                                      │
│ Result: Creates transition rule between phases.                               │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Transition Rule Modal                                                 │
│     ├── From phase                                                            │
│     ├── To phase                                                              │
│     ├── Trigger condition                                                     │
│     ├── Required gate                                                         │
│     ├── Required artifacts                                                    │
│     ├── Required evidence                                                     │
│     ├── Blocking conditions                                                   │
│     └── Save Rule / Cancel                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Deactivate Phase”                                         │
│ Result: Deactivates lifecycle phase.                                          │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Deactivate Phase Confirmation Modal                                       │
│     ├── Phase affected                                                        │
│     ├── Dependent templates                                                   │
│     ├── Dependent gates                                                       │
│     ├── Active projects using this phase                                      │
│     ├── Deactivation reason                                                   │
│     └── Deactivate / Cancel                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. TEMPLATE REGISTRY INTERACTIONS                                             │
│                                                                              │
│ Interaction: Click “New Template”                                             │
│ Result: Creates a lifecycle template.                                         │
│ Recommended UI: New screen or modal                                           │
│ Route: /settings/templates/new                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── New Template Screen / Modal                                               │
│     ├── Template ID                                                           │
│     ├── Template name                                                         │
│     ├── Related phase                                                         │
│     ├── Output type                                                           │
│     ├── Required/optional flag                                                │
│     ├── Schema version                                                        │
│     ├── Section definitions                                                   │
│     ├── Field definitions                                                     │
│     ├── Markdown renderer settings                                            │
│     ├── JSON evidence settings                                                │
│     └── Create Template                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click template row                                               │
│ Result: Opens template detail.                                                │
│ Recommended UI: Drawer or detail route                                        │
│ Route: /settings/templates/[templateId]                                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Detail Screen / Drawer                                           │
│     ├── Template metadata                                                     │
│     ├── Template sections                                                     │
│     ├── Field schema                                                          │
│     ├── Validation rules                                                      │
│     ├── Markdown output preview                                               │
│     ├── JSON evidence preview                                                 │
│     ├── Version history                                                       │
│     └── Usage summary                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click edit template                                              │
│ Result: Edits template configuration.                                         │
│ Recommended UI: New screen or drawer                                          │
│ Route: /settings/templates/[templateId]/edit                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Template Screen / Drawer                                             │
│     ├── Template metadata                                                     │
│     ├── Section editor                                                        │
│     ├── Field editor                                                          │
│     ├── Validation editor                                                     │
│     ├── Markdown renderer editor                                              │
│     ├── JSON evidence mapping editor                                          │
│     ├── Preview panel                                                         │
│     └── Save Template                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click clone template                                             │
│ Result: Creates copy of existing template.                                    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Clone Template Modal                                                      │
│     ├── Source template                                                       │
│     ├── New template ID                                                       │
│     ├── New template name                                                     │
│     ├── Related phase                                                         │
│     ├── Copy sections                                                         │
│     ├── Copy validation rules                                                 │
│     └── Clone / Cancel                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click template version history                                   │
│ Result: Shows template version history.                                       │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Version History Drawer                                           │
│     ├── Version list                                                          │
│     ├── Author                                                                │
│     ├── Timestamp                                                             │
│     ├── Change summary                                                        │
│     ├── Compare versions                                                      │
│     ├── Restore version                                                       │
│     └── View schema snapshot                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click archive template                                           │
│ Result: Archives template.                                                    │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Archive Template Confirmation Modal                                       │
│     ├── Template affected                                                     │
│     ├── Active projects using template                                        │
│     ├── Artifacts generated from template                                     │
│     ├── Archive reason                                                        │
│     └── Archive / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click import template                                            │
│ Result: Imports template definition.                                          │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Import Template Modal                                                     │
│     ├── Upload template JSON                                                  │
│     ├── Schema validation result                                              │
│     ├── Conflict detection                                                    │
│     ├── Import mode: add / overwrite / version                                │
│     └── Import / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. GATE RULES INTERACTIONS                                                    │
│                                                                              │
│ 4.1 New gate rule                                                             │
│                                                                              │
│ Interaction: Click “New Gate Rule”                                            │
│ Result: Creates gate rule.                                                    │
│ Recommended UI: Modal or new screen                                           │
│ Route: /settings/gates/new                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── New Gate Rule Screen / Modal                                              │
│     ├── Gate code                                                             │
│     ├── Gate name                                                             │
│     ├── Related phase                                                         │
│     ├── Required inputs                                                       │
│     ├── Required evidence                                                     │
│     ├── Decision criteria                                                     │
│     ├── Approver roles                                                        │
│     ├── Decision rule                                                         │
│     ├── Unlock phase                                                          │
│     └── Create Gate Rule                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 4.2 Gate rule detail (row)                                                    │
│                                                                              │
│ Interaction: Click gate rule row                                              │
│ Result: Opens gate rule detail.                                               │
│ Recommended UI: Drawer or detail route                                        │
│ Route: /settings/gates/[gateRuleId]                                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Gate Rule Detail Screen / Drawer                                          │
│     ├── Gate identity                                                         │
│     ├── Related phase                                                         │
│     ├── Readiness rule                                                        │
│     ├── Required inputs                                                       │
│     ├── Evidence rules                                                        │
│     ├── Decision criteria                                                     │
│     ├── Approver rules                                                        │
│     ├── Unlock behavior                                                       │
│     └── Usage summary                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 4.3 Edit gate rule                                                            │
│                                                                              │
│ Interaction: Click edit gate rule                                             │
│ Result: Edits gate rule.                                                      │
│ Recommended UI: Drawer or screen                                              │
│ Route: /settings/gates/[gateRuleId]/edit                                      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Gate Rule Screen / Drawer                                            │
│     ├── Gate name                                                             │
│     ├── Related phase                                                         │
│     ├── Required inputs editor                                                │
│     ├── Evidence rule editor                                                  │
│     ├── Criteria editor                                                       │
│     ├── Approver rule editor                                                  │
│     ├── Unlock rule editor                                                    │
│     └── Save Gate Rule                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 4.4 Decision criteria editor                                                  │
│                                                                              │
│ Interaction: Click “Edit Decision Criteria”                                   │
│ Result: Opens criteria editor.                                                │
│ Recommended UI: Modal / drawer                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Decision Criteria Editor Drawer                                           │
│     ├── Criterion name                                                        │
│     ├── Description                                                           │
│     ├── Weight                                                                │
│     ├── Assessment options                                                    │
│     ├── Required evidence mappings                                            │
│     ├── Pass threshold                                                        │
│     └── Save Criteria                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 4.5 Approver rules editor                                                     │
│                                                                              │
│ Interaction: Click “Edit Approver Rules”                                      │
│ Result: Opens approver rules editor.                                          │
│ Recommended UI: Modal / drawer                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Approver Rules Editor Drawer                                              │
│     ├── Required roles                                                        │
│     ├── Minimum approvers                                                      │
│     ├── Decision policy: single / majority / unanimous / role-based           │
│     ├── Escalation rules                                                      │
│     ├── Due date policy                                                       │
│     └── Save Rules                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 4.6 Deactivate gate rule                                                      │
│                                                                              │
│ Interaction: Click deactivate gate rule                                       │
│ Result: Deactivates gate rule.                                                │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Deactivate Gate Rule Confirmation Modal                                   │
│     ├── Gate rule affected                                                    │
│     ├── Active projects affected                                              │
│     ├── Dependent phases                                                      │
│     ├── Deactivation reason                                                   │
│     └── Deactivate / Cancel                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. ROLES / PERMISSIONS INTERACTIONS                                           │
│                                                                              │
│ 5.1 New role                                                                  │
│                                                                              │
│ Interaction: Click “New Role”                                                 │
│ Result: Creates custom role.                                                  │
│ Recommended UI: Modal or screen                                               │
│ Route: /settings/roles/new                                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── New Role Screen / Modal                                                   │
│     ├── Role name                                                             │
│     ├── Description                                                           │
│     ├── Role type                                                             │
│     ├── Permission matrix                                                     │
│     ├── Default users                                                         │
│     └── Create Role                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.2 Role detail (row)                                                         │
│                                                                              │
│ Interaction: Click role row                                                   │
│ Result: Opens role detail.                                                    │
│ Recommended UI: Drawer or detail route                                        │
│ Route: /settings/roles/[roleId]                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Role Detail Screen / Drawer                                               │
│     ├── Role name                                                             │
│     ├── Description                                                           │
│     ├── Assigned users                                                        │
│     ├── Permission matrix                                                     │
│     ├── Related approval permissions                                          │
│     ├── Export permissions                                                    │
│     └── Audit history                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.3 Edit role                                                                 │
│                                                                              │
│ Interaction: Click edit role                                                  │
│ Result: Edits role and permission matrix.                                     │
│ Recommended UI: Drawer or screen                                              │
│ Route: /settings/roles/[roleId]/edit                                          │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Edit Role Screen / Drawer                                                 │
│     ├── Role name                                                             │
│     ├── Description                                                           │
│     ├── Permission matrix                                                     │
│     ├── Approve permissions                                                   │
│     ├── Export permissions                                                    │
│     ├── Admin permissions                                                     │
│     └── Save Role                                                             │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.4 Assign users to role                                                      │
│                                                                              │
│ Interaction: Click assign users                                               │
│ Result: Assigns users to selected role.                                       │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Users to Role Modal                                                │
│     ├── User search                                                           │
│     ├── Current assigned users                                                │
│     ├── Add users                                                             │
│     ├── Remove users                                                          │
│     ├── Assignment reason                                                     │
│     └── Save Assignments                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.5 Permission cell (high-risk confirmation)                                  │
│                                                                              │
│ Interaction: Click permission cell                                            │
│ Result: Changes permission state.                                             │
│ Recommended UI: Inline toggle + optional confirmation for high-risk perms     │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── High-Risk Permission Confirmation Modal                                   │
│     ├── Permission being changed                                              │
│     ├── Role affected                                                         │
│     ├── Risk explanation                                                      │
│     ├── Reason for change                                                     │
│     └── Confirm / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.6 Duplicate role                                                              │
│                                                                              │
│ Interaction: Click duplicate role                                             │
│ Result: Creates copy of role.                                                 │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Duplicate Role Modal                                                      │
│     ├── Source role                                                           │
│     ├── New role name                                                         │
│     ├── Copy permissions                                                      │
│     ├── Copy assigned users option                                            │
│     └── Duplicate / Cancel                                                    │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ 5.7 Delete role                                                                 │
│                                                                              │
│ Interaction: Click delete role                                                │
│ Result: Deletes or archives custom role.                                      │
│ Recommended UI: Destructive confirmation modal                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Delete Role Confirmation Modal                                            │
│     ├── Role affected                                                         │
│     ├── Assigned users count                                                  │
│     ├── Reassignment target role                                              │
│     ├── Type role name to confirm                                             │
│     └── Delete / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. EXPORT SETTINGS INTERACTIONS                                               │
│                                                                              │
│ Interaction: Click “Test Export”                                              │
│ Result: Runs test export with current settings.                               │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Test Export Modal                                                         │
│     ├── Export type                                                           │
│     ├── Sample project                                                        │
│     ├── Selected format                                                       │
│     ├── Package rules preview                                                 │
│     ├── Validation result                                                     │
│     ├── Download sample                                                       │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click configure filename pattern                                 │
│ Result: Opens filename pattern editor.                                        │
│ Recommended UI: Modal / drawer                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Filename Pattern Editor Modal                                             │
│     ├── Pattern string                                                        │
│     ├── Available tokens                                                      │
│     ├── Example output                                                        │
│     ├── Validation result                                                     │
│     └── Save Pattern                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click configure redaction rules                                  │
│ Result: Opens redaction configuration.                                        │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Redaction Rules Drawer                                                    │
│     ├── Restricted fields                                                     │
│     ├── PII fields                                                            │
│     ├── Evidence metadata fields                                              │
│     ├── Export-specific rules                                                 │
│     ├── Preview redaction                                                     │
│     └── Save Rules                                                            │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click export format toggle                                       │
│ Result: Enables/disables export format.                                       │
│ Recommended UI: Inline toggle + confirmation if disabling active format       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Disable Export Format Confirmation Modal                                  │
│     ├── Format affected                                                       │
│     ├── Reports/packages affected                                             │
│     ├── Warning                                                               │
│     └── Disable / Cancel                                                      │
│                                                                              │
│                                                                              │
│ 7. LOCAL STORAGE SETTINGS INTERACTIONS                                        │
│                                                                              │
│ Interaction: Click “Change Storage Location”                                  │
│ Result: Selects new local storage path.                                       │
│ Recommended UI: Native file/folder picker + confirmation modal                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Change Storage Location Confirmation Modal                                │
│     ├── Current path                                                          │
│     ├── New path                                                              │
│     ├── Permission validation                                                 │
│     ├── Migration option                                                      │
│     ├── Estimated data size                                                   │
│     └── Confirm / Cancel                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Clear Cache”                                              │
│ Result: Clears local cache.                                                   │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Clear Cache Confirmation Modal                                            │
│     ├── Cache size                                                            │
│     ├── Items affected                                                        │
│     ├── Warning                                                               │
│     └── Clear Cache / Cancel                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Run Cleanup”                                              │
│ Result: Cleans expired drafts/exports/snapshots according to retention rules. │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Run Storage Cleanup Modal                                                 │
│     ├── Drafts to remove                                                      │
│     ├── Exports to remove                                                     │
│     ├── Snapshots to remove                                                   │
│     ├── Space to recover                                                      │
│     ├── Retention rules applied                                               │
│     └── Run Cleanup / Cancel                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Configure Backup”                                         │
│ Result: Opens backup configuration.                                           │
│ Recommended UI: Modal / drawer                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Backup Configuration Drawer                                               │
│     ├── Auto backup enabled                                                   │
│     ├── Backup frequency                                                      │
│     ├── Backup location                                                       │
│     ├── Include evidence files                                                │
│     ├── Include audit snapshots                                               │
│     ├── Last backup                                                           │
│     └── Save Backup Settings                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Restore Backup”                                           │
│ Result: Restores data from backup.                                            │
│ Recommended UI: Destructive modal / wizard                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Restore Backup Wizard                                                     │
│     ├── Select backup file                                                    │
│     ├── Validate backup                                                       │
│     ├── Backup contents preview                                               │
│     ├── Conflict handling                                                     │
│     ├── Restore options                                                       │
│     ├── Final warning                                                         │
│     └── Restore / Cancel                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. QUICK ACTIONS INTERACTIONS                                                 │
│                                                                              │
│ Interaction: Click “Import Lifecycle Configuration”                           │
│ Result: Imports lifecycle configuration from file.                            │
│ Recommended UI: Modal / wizard                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Import Lifecycle Configuration Modal                                      │
│     ├── Upload JSON configuration                                             │
│     ├── Schema validation                                                     │
│     ├── Conflict detection                                                    │
│     ├── Import mode                                                           │
│     ├── Preview changes                                                       │
│     └── Import / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Current Configuration”                             │
│ Result: Downloads current configuration file.                                 │
│ Recommended UI: Modal optional                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Configuration Modal                                                │
│     ├── Include lifecycle phases                                              │
│     ├── Include templates                                                     │
│     ├── Include gate rules                                                    │
│     ├── Include roles and permissions                                         │
│     ├── Include export settings                                               │
│     ├── Include storage settings                                              │
│     └── Export JSON                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Reset to Default”                                         │
│ Result: Resets configuration to default baseline.                             │
│ Recommended UI: Destructive confirmation modal                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Reset to Default Confirmation Modal                                       │
│     ├── Configuration areas affected                                          │
│     ├── Active projects affected                                              │
│     ├── Backup recommendation                                                 │
│     ├── Type RESET to confirm                                                 │
│     └── Reset / Cancel                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Validate Configuration”                                   │
│ Result: Validates settings against lifecycle rules.                           │
│ Recommended UI: Modal / drawer                                                │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Configuration Validation Results Drawer                                   │
│     ├── Validation summary                                                    │
│     ├── Errors                                                                │
│     ├── Warnings                                                              │
│     ├── Informational findings                                                │
│     ├── Affected areas                                                        │
│     ├── Recommended fixes                                                     │
│     └── Export validation report                                              │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Documentation & Help”                                     │
│ Result: Opens documentation.                                                  │
│ Recommended UI: New screen or external/help drawer                            │
│ Route: /help/settings                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Settings Documentation Screen / Help Drawer                               │
│     ├── Lifecycle configuration guide                                         │
│     ├── Template registry guide                                               │
│     ├── Gate rules guide                                                      │
│     ├── Roles and permissions guide                                           │
│     ├── Export settings guide                                                 │
│     └── Local storage guide                                                   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. SAVE / RESET INTERACTIONS                                                  │
│                                                                              │
│ Interaction: Click “Save Settings”                                            │
│ Result: Persists current settings.                                            │
│ Recommended UI: Confirmation modal only when high-impact changes exist        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Save Settings Confirmation Modal                                          │
│     ├── Changed areas summary                                                 │
│     ├── Impact level                                                          │
│     ├── Affected active projects                                              │
│     ├── Audit note                                                            │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Reset Changes”                                            │
│ Result: Reverts unsaved changes.                                              │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Reset Unsaved Changes Confirmation Modal                                  │
│     ├── Unsaved changes count                                                 │
│     ├── Changed areas                                                         │
│     ├── Warning                                                               │
│     └── Reset / Cancel                                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Navigate away with unsaved changes                               │
│ Result: Prevents accidental loss of edits.                                    │
│ Recommended UI: Browser/navigation confirmation modal                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unsaved Changes Confirmation Modal                                        │
│     ├── Unsaved changes warning                                               │
│     ├── Save changes                                                          │
│     ├── Discard changes                                                       │
│     └── Stay on page                                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. SUMMARY — REQUIRED ADDITIONAL SCREENS                                     │
│                                                                              │
│ Required full screens from Settings interactions:                             │
│                                                                              │
│ ├── /settings/lifecycle                                                       │
│ │   └── Lifecycle Configuration Screen                                        │
│ │                                                                            │
│ ├── /settings/templates                                                       │
│ │   └── Template Registry Screen                                              │
│ │                                                                            │
│ ├── /settings/templates/new                                                   │
│ │   └── New Template Screen                                                   │
│ │                                                                            │
│ ├── /settings/templates/[templateId]                                          │
│ │   └── Template Detail Screen                                                │
│ │                                                                            │
│ ├── /settings/templates/[templateId]/edit                                     │
│ │   └── Edit Template Screen                                                  │
│ │                                                                            │
│ ├── /settings/gates                                                           │
│ │   └── Gate Rules Screen                                                     │
│ │                                                                            │
│ ├── /settings/gates/new                                                       │
│ │   └── New Gate Rule Screen                                                  │
│ │                                                                            │
│ ├── /settings/gates/[gateRuleId]                                              │
│ │   └── Gate Rule Detail Screen                                               │
│ │                                                                            │
│ ├── /settings/gates/[gateRuleId]/edit                                         │
│ │   └── Edit Gate Rule Screen                                                 │
│ │                                                                            │
│ ├── /settings/roles                                                           │
│ │   └── Roles / Permissions Screen                                            │
│ │                                                                            │
│ ├── /settings/roles/new                                                       │
│ │   └── New Role Screen                                                       │
│ │                                                                            │
│ ├── /settings/roles/[roleId]                                                  │
│ │   └── Role Detail Screen                                                    │
│ │                                                                            │
│ ├── /settings/roles/[roleId]/edit                                             │
│ │   └── Edit Role Screen                                                      │
│ │                                                                            │
│ ├── /settings/exports                                                         │
│ │   └── Export Settings Screen                                                │
│ │                                                                            │
│ ├── /settings/storage                                                         │
│ │   └── Local Storage Settings Screen                                         │
│ │                                                                            │
│ └── /help/settings                                                            │
│     └── Settings Documentation Screen                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. SUMMARY — REQUIRED MODALS / DRAWERS                                       │
│                                                                              │
│ Required modals/drawers from Settings interactions:                           │
│                                                                              │
│ ├── Unlock Configuration Edit Modal                                           │
│ ├── Add Phase Modal                                                           │
│ ├── Phase Configuration Drawer                                                │
│ ├── Edit Phase Modal / Drawer                                                 │
│ ├── Confirm Phase Reorder Modal                                               │
│ ├── Add Milestone Modal                                                       │
│ ├── Add Transition Rule Modal                                                 │
│ ├── Deactivate Phase Confirmation Modal                                       │
│ ├── New Template Modal                                                        │
│ ├── Template Detail Drawer                                                    │
│ ├── Edit Template Drawer                                                      │
│ ├── Clone Template Modal                                                      │
│ ├── Template Version History Drawer                                           │
│ ├── Archive Template Confirmation Modal                                       │
│ ├── Import Template Modal                                                     │
│ ├── New Gate Rule Modal                                                       │
│ ├── Gate Rule Detail Drawer                                                   │
│ ├── Edit Gate Rule Drawer                                                     │
│ ├── Decision Criteria Editor Drawer                                           │
│ ├── Approver Rules Editor Drawer                                              │
│ ├── Deactivate Gate Rule Confirmation Modal                                   │
│ ├── New Role Modal                                                            │
│ ├── Role Detail Drawer                                                        │
│ ├── Edit Role Drawer                                                          │
│ ├── Assign Users to Role Modal                                                │
│ ├── High-Risk Permission Confirmation Modal                                   │
│ ├── Duplicate Role Modal                                                      │
│ ├── Delete Role Confirmation Modal                                            │
│ ├── Test Export Modal                                                         │
│ ├── Filename Pattern Editor Modal                                             │
│ ├── Redaction Rules Drawer                                                    │
│ ├── Disable Export Format Confirmation Modal                                  │
│ ├── Change Storage Location Confirmation Modal                                │
│ ├── Clear Cache Confirmation Modal                                            │
│ ├── Run Storage Cleanup Modal                                                 │
│ ├── Backup Configuration Drawer                                               │
│ ├── Restore Backup Wizard                                                     │
│ ├── Import Lifecycle Configuration Modal                                      │
│ ├── Export Configuration Modal                                                │
│ ├── Reset to Default Confirmation Modal                                       │
│ ├── Configuration Validation Results Drawer                                   │
│ ├── Settings Documentation Help Drawer                                        │
│ ├── Save Settings Confirmation Modal                                          │
│ ├── Reset Unsaved Changes Confirmation Modal                                  │
│ └── Unsaved Changes Confirmation Modal                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘