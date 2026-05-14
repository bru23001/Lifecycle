┌──────────────────────────────────────────────────────────────────────────────┐
│ TEMPLATE WIZARD SCREEN — INTERACTIONS THAT REQUIRE NEW SCREENS OR MODALS     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. TEMPLATE SELECTION INTERACTIONS                                            │
│                                                                              │
│ Interaction: Click “Switch Template”                                          │
│ Result: Allows user to choose another template for the current phase.         │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Switch Template Modal                                                     │
│     ├── Current template                                                      │
│     ├── Available templates                                                   │
│     ├── Phase filter                                                          │
│     ├── Required / optional indicator                                         │
│     ├── Template version                                                      │
│     ├── Unsaved changes warning                                               │
│     └── Switch / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click template item in left panel                                │
│ Result: Opens selected template in wizard.                                    │
│ Recommended UI: Same screen state update OR route change                      │
│ Route: /projects/[projectId]/templates/[templateId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Wizard Screen State / Route                                      │
│     ├── Selected template header                                              │
│     ├── Section navigator                                                     │
│     ├── Dynamic form                                                          │
│     ├── Validation panel                                                      │
│     ├── Markdown preview                                                      │
│     └── JSON evidence preview                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Template Guide” / “View Template Guide”                   │
│ Result: Shows instructions for completing the selected template.              │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Guide Drawer                                                     │
│     ├── Template purpose                                                      │
│     ├── Owner / responsible role                                              │
│     ├── Required sections                                                     │
│     ├── Completion criteria                                                   │
│     ├── Evidence expectations                                                 │
│     ├── Validation rules                                                      │
│     ├── Example completed output                                              │
│     └── Related lifecycle phase / gate                                        │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click template version badge                                     │
│ Result: Shows template version details and schema changes.                    │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Template Version Detail Drawer                                            │
│     ├── Template version                                                      │
│     ├── Schema version                                                        │
│     ├── Release date                                                          │
│     ├── Change summary                                                        │
│     ├── Added fields                                                          │
│     ├── Removed / deprecated fields                                           │
│     ├── Compatibility notes                                                   │
│     └── Migration impact                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 2. SECTION NAVIGATOR INTERACTIONS                                             │
│                                                                              │
│ Interaction: Click section in section navigator                               │
│ Result: Navigates to selected form section.                                   │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click incomplete / warning / error indicator on section          │
│ Result: Shows section validation detail.                                      │
│ Recommended UI: Drawer or popover                                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Section Validation Detail Drawer                                          │
│     ├── Section name                                                          │
│     ├── Completion percentage                                                 │
│     ├── Required missing fields                                               │
│     ├── Warning fields                                                        │
│     ├── Error fields                                                          │
│     ├── Evidence gaps                                                         │
│     ├── Recommended fixes                                                     │
│     └── Jump to field action                                                  │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Section” if optional sections are supported           │
│ Result: Adds an optional section to the artifact.                             │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Optional Section Modal                                                │
│     ├── Available optional sections                                           │
│     ├── Section description                                                   │
│     ├── Required by phase/gate indicator                                      │
│     ├── Preview fields                                                        │
│     └── Add / Cancel                                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click remove optional section                                    │
│ Result: Removes optional section from artifact draft.                         │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Remove Section Confirmation Modal                                         │
│     ├── Section name                                                          │
│     ├── Removal impact                                                        │
│     ├── Data loss warning                                                     │
│     ├── Type section name to confirm if destructive                           │
│     └── Remove / Cancel                                                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 3. DYNAMIC FORM / FIELD INTERACTIONS                                          │
│                                                                              │
│ Interaction: Edit standard field                                              │
│ Result: Updates form value and validation state.                              │
│ Recommended UI: Same screen state update                                      │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click field help / info icon                                     │
│ Result: Shows field-level guidance.                                           │
│ Recommended UI: Popover                                                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Field Help Popover                                                        │
│     ├── Field name                                                            │
│     ├── Field purpose                                                         │
│     ├── Expected input                                                        │
│     ├── Example value                                                         │
│     ├── Validation rule                                                       │
│     └── Related evidence expectation                                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Expand Field” / long text editor                          │
│ Result: Opens large writing workspace for long-form fields.                   │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Expanded Field Editor Modal                                               │
│     ├── Field title                                                           │
│     ├── Full-screen textarea / rich text editor                               │
│     ├── Formatting help                                                       │
│     ├── Character / word count                                                │
│     ├── Validation status                                                     │
│     ├── Save field                                                            │
│     └── Cancel                                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Add Row” in table/matrix field                            │
│ Result: Adds a row to dynamic table.                                          │
│ Recommended UI: Inline action OR modal for complex rows                       │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Add Table Row Modal                                                       │
│     ├── Row fields                                                            │
│     ├── Required values                                                       │
│     ├── Validation preview                                                    │
│     ├── Add row                                                               │
│     └── Cancel                                                                │
│                                                                              │
│ Note: Simple rows can be added inline without modal.                          │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click table/matrix row                                           │
│ Result: Opens detailed row editor.                                            │
│ Recommended UI: Drawer or modal                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Matrix Row Detail Drawer                                                  │
│     ├── Row identity                                                          │
│     ├── Criteria / option values                                              │
│     ├── Weight / score fields                                                 │
│     ├── Comments                                                              │
│     ├── Evidence links                                                        │
│     ├── Validation status                                                     │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click delete row                                                 │
│ Result: Deletes table/matrix row.                                             │
│ Recommended UI: Confirmation modal for destructive deletion                   │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Delete Row Confirmation Modal                                             │
│     ├── Row name / identifier                                                 │
│     ├── Deletion warning                                                      │
│     ├── Affected calculations                                                 │
│     └── Delete / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Import Rows”                                              │
│ Result: Imports table/matrix rows from CSV/JSON.                              │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Import Rows Modal                                                         │
│     ├── Upload CSV / JSON                                                     │
│     ├── Field mapping                                                         │
│     ├── Validation preview                                                    │
│     ├── Import summary                                                        │
│     ├── Import                                                                │
│     └── Cancel                                                                │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 4. EVIDENCE LINKING INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “Link Evidence” from field or section                      │
│ Result: Links existing evidence or uploads new evidence.                      │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Link Evidence Modal                                                       │
│     ├── Existing evidence search                                              │
│     ├── Evidence type filter                                                  │
│     ├── Phase / gate filter                                                   │
│     ├── Selected evidence                                                     │
│     ├── Upload new evidence option                                            │
│     ├── Link target: field / section / artifact                               │
│     └── Link Evidence / Cancel                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Upload Evidence”                                          │
│ Result: Uploads a file and links it to current artifact/section/field.        │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Upload Evidence Modal                                                     │
│     ├── File picker                                                           │
│     ├── Evidence name                                                         │
│     ├── Evidence type                                                         │
│     ├── Classification                                                        │
│     ├── Source                                                                │
│     ├── Retention policy                                                      │
│     ├── Tags                                                                  │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Linked artifact section                                               │
│     └── Upload / Cancel                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click linked evidence item                                       │
│ Result: Opens evidence detail.                                                │
│ Recommended UI: Drawer or new screen                                          │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Evidence Detail Drawer / Screen                                           │
│     ├── Evidence preview                                                      │
│     ├── Evidence metadata                                                     │
│     ├── Linked artifact                                                       │
│     ├── Linked field / section                                                │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Download                                                              │
│     └── Remove link                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Remove Evidence Link”                                     │
│ Result: Unlinks evidence from field/section/artifact.                         │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Remove Evidence Link Confirmation Modal                                   │
│     ├── Evidence name                                                         │
│     ├── Current link target                                                   │
│     ├── Impact warning                                                        │
│     ├── Unlink only / Delete evidence option                                  │
│     └── Confirm / Cancel                                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 5. VALIDATION PANEL INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click validation issue                                           │
│ Result: Jumps to field or opens validation detail.                            │
│ Recommended UI: Same screen jump OR drawer                                    │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Validation Issue Detail Drawer                                            │
│     ├── Issue severity                                                        │
│     ├── Related section                                                       │
│     ├── Related field                                                         │
│     ├── Validation message                                                    │
│     ├── Rule ID                                                               │
│     ├── Required fix                                                          │
│     ├── Suggested value / example                                             │
│     └── Jump to field                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “View All Issues”                                          │
│ Result: Shows complete validation issue list.                                 │
│ Recommended UI: Modal or drawer                                               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Validation Issues Drawer                                                  │
│     ├── Summary counts                                                        │
│     ├── Error list                                                            │
│     ├── Warning list                                                          │
│     ├── Info list                                                             │
│     ├── Filter by section                                                     │
│     ├── Filter by severity                                                    │
│     └── Jump to issue                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Run Validation”                                           │
│ Result: Runs validation across artifact.                                      │
│ Recommended UI: No new screen; optional progress modal for long validation   │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Validation Progress Modal                                                 │
│     ├── Validation steps                                                      │
│     ├── Current step                                                          │
│     ├── Rules checked                                                         │
│     ├── Issues found                                                          │
│     └── Cancel if supported                                                   │
│                                                                              │
│ Note: Use only when validation takes noticeable time.                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 6. MARKDOWN PREVIEW INTERACTIONS                                              │
│                                                                              │
│ Interaction: Click “Open Markdown Preview” / expand preview                   │
│ Result: Shows full artifact Markdown preview.                                 │
│ Recommended UI: Modal or new screen                                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Full Markdown Preview Modal                                               │
│     ├── Artifact title                                                        │
│     ├── Rendered Markdown                                                     │
│     ├── Section outline                                                       │
│     ├── Download .md                                                          │
│     ├── Copy Markdown                                                         │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Copy Markdown”                                            │
│ Result: Copies Markdown to clipboard.                                         │
│ Recommended UI: Toast only                                                    │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download Markdown”                                        │
│ Result: Downloads .md artifact file.                                          │
│ Recommended UI: Export confirmation modal optional                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Markdown Confirmation Modal                                        │
│     ├── Artifact name                                                         │
│     ├── File name                                                             │
│     ├── Include metadata header toggle                                        │
│     ├── Include validation summary toggle                                     │
│     ├── Export                                                                │
│     └── Cancel                                                                │
│                                                                              │
│ Note: Can be skipped if export is immediate and simple.                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Open in Artifact Viewer”                                  │
│ Result: Opens generated artifact detail in Artifact Library.                  │
│ Recommended UI: New screen                                                    │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Detail Screen                                                    │
│     ├── Artifact metadata                                                     │
│     ├── Markdown view                                                         │
│     ├── JSON evidence view                                                    │
│     ├── Version history                                                       │
│     └── Export package                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 7. JSON EVIDENCE PREVIEW INTERACTIONS                                         │
│                                                                              │
│ Interaction: Click “Open JSON Preview” / expand JSON                          │
│ Result: Shows full JSON evidence preview.                                     │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Full JSON Evidence Preview Modal                                          │
│     ├── Pretty-printed JSON                                                   │
│     ├── Schema version                                                        │
│     ├── Validation status                                                     │
│     ├── Copy JSON                                                             │
│     ├── Download .json                                                        │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Validate JSON Schema”                                     │
│ Result: Runs schema validation.                                               │
│ Recommended UI: Modal or inline result panel                                  │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── JSON Schema Validation Result Modal                                       │
│     ├── Schema name                                                           │
│     ├── Schema version                                                        │
│     ├── Pass / fail status                                                    │
│     ├── Error list                                                            │
│     ├── Warning list                                                          │
│     ├── JSON path references                                                  │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Copy JSON”                                                │
│ Result: Copies JSON to clipboard.                                             │
│ Recommended UI: Toast only                                                    │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Download JSON Evidence”                                   │
│ Result: Downloads JSON evidence file.                                         │
│ Recommended UI: Export confirmation modal optional                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export JSON Evidence Confirmation Modal                                   │
│     ├── Artifact name                                                         │
│     ├── File name                                                             │
│     ├── Include validation summary toggle                                     │
│     ├── Include evidence links toggle                                         │
│     ├── Export                                                                │
│     └── Cancel                                                                │
│                                                                              │
│ Note: Can be skipped if export is immediate and simple.                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 8. SAVE / EXPORT / COMPLETE INTERACTIONS                                      │
│                                                                              │
│ Interaction: Click “Save Draft”                                               │
│ Result: Saves current artifact draft.                                         │
│ Recommended UI: No new screen; toast confirmation                             │
│ Required Screen/Modal: None                                                   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Autosave failure                                                 │
│ Result: User must resolve save problem.                                       │
│ Recommended UI: Modal or alert banner                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Autosave Failure Modal / Banner                                           │
│     ├── Error message                                                         │
│     ├── Last successful save timestamp                                        │
│     ├── Retry save                                                            │
│     ├── Download local draft                                                  │
│     └── Continue editing                                                      │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Export Artifact Package”                                  │
│ Result: Exports artifact package with Markdown, JSON, metadata, evidence.    │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Export Artifact Package Modal                                             │
│     ├── Artifact name                                                         │
│     ├── Package filename                                                      │
│     ├── Include Markdown                                                      │
│     ├── Include JSON evidence                                                 │
│     ├── Include evidence manifest                                             │
│     ├── Include linked evidence files                                         │
│     ├── Include validation report                                             │
│     ├── Include version metadata                                              │
│     └── Export Package / Cancel                                               │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Save Artifact”                                            │
│ Result: Saves artifact as managed lifecycle artifact.                         │
│ Recommended UI: Confirmation modal if first save or major version change      │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Save Artifact Confirmation Modal                                          │
│     ├── Artifact name                                                         │
│     ├── Artifact code                                                         │
│     ├── Version                                                               │
│     ├── Status after save                                                     │
│     ├── Linked phase                                                          │
│     ├── Linked gate                                                           │
│     ├── Validation summary                                                    │
│     └── Save / Cancel                                                         │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Mark Complete”                                            │
│ Result: Attempts to mark template/artifact complete.                          │
│ Recommended UI: Confirmation modal or blocking validation modal               │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Mark Complete Confirmation Modal                                          │
│ │   ├── Completion percentage                                                 │
│ │   ├── Required sections complete                                            │
│ │   ├── Evidence linked                                                       │
│ │   ├── Validation warnings                                                   │
│ │   ├── Mark Complete / Cancel                                                │
│ │                                                                            │
│ └── Cannot Mark Complete Modal                                                │
│     ├── Blocking errors                                                       │
│     ├── Missing required fields                                               │
│     ├── Missing evidence                                                      │
│     ├── Jump to issue                                                         │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Submit for Gate Review” from completed artifact           │
│ Result: Starts gate submission flow.                                          │
│ Recommended UI: Modal or Gate Review screen                                   │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ ├── Submit Gate Review Modal                                                  │
│ │   ├── Artifact readiness                                                    │
│ │   ├── Required gate inputs                                                  │
│ │   ├── Evidence summary                                                      │
│ │   ├── Validation summary                                                    │
│ │   ├── Assigned approvers                                                    │
│ │   └── Submit / Cancel                                                       │
│ │                                                                            │
│ └── Gate Review Screen                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 9. VERSIONING INTERACTIONS                                                    │
│                                                                              │
│ Interaction: Click “Version History”                                          │
│ Result: Shows artifact/template draft versions.                               │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Version History Drawer                                                    │
│     ├── Version list                                                          │
│     ├── Status                                                                │
│     ├── Author                                                                │
│     ├── Timestamp                                                             │
│     ├── Change summary                                                        │
│     ├── View version                                                          │
│     ├── Compare version                                                       │
│     └── Restore version                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Compare Version”                                          │
│ Result: Compares selected version to current draft.                           │
│ Recommended UI: Modal or full screen                                          │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Version Compare Modal / Screen                                            │
│     ├── Current version                                                       │
│     ├── Selected version                                                      │
│     ├── Field-level diff                                                      │
│     ├── Markdown diff                                                         │
│     ├── JSON evidence diff                                                    │
│     ├── Restore selected fields                                               │
│     └── Close                                                                 │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Restore Version”                                          │
│ Result: Restores a previous version into current draft.                       │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Restore Version Confirmation Modal                                        │
│     ├── Version being restored                                                │
│     ├── Current version impact                                                │
│     ├── Creates new version note                                              │
│     ├── Restore / Cancel                                                      │
│     └── Optional change reason                                                │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Unsaved changes while navigating away                            │
│ Result: Warns user before leaving.                                            │
│ Recommended UI: Confirmation modal                                            │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Unsaved Changes Confirmation Modal                                        │
│     ├── Unsaved changes warning                                               │
│     ├── Save and continue                                                     │
│     ├── Discard changes                                                       │
│     └── Stay on page                                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 10. COLLABORATION / REVIEW INTERACTIONS                                       │
│                                                                              │
│ Interaction: Click “Comments”                                                 │
│ Result: Opens comments thread for artifact/template.                          │
│ Recommended UI: Drawer                                                        │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Artifact Comments Drawer                                                  │
│     ├── Comment thread                                                        │
│     ├── Comment composer                                                      │
│     ├── Mentions                                                              │
│     ├── Resolve comment                                                       │
│     ├── Linked field / section                                                │
│     └── Comment history                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Add comment on field/section                                     │
│ Result: Adds contextual comment.                                              │
│ Recommended UI: Popover or drawer                                             │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Field Comment Popover                                                     │
│     ├── Field / section context                                               │
│     ├── Comment text                                                          │
│     ├── Mention user                                                          │
│     ├── Visibility                                                            │
│     └── Add comment                                                           │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Assign Reviewer”                                          │
│ Result: Assigns reviewer to artifact/template.                                │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Assign Reviewer Modal                                                     │
│     ├── Reviewer search                                                       │
│     ├── Role filter                                                           │
│     ├── Due date                                                              │
│     ├── Review scope                                                          │
│     ├── Review instructions                                                   │
│     └── Assign reviewer                                                       │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ Interaction: Click “Share”                                                    │
│ Result: Shares artifact/template draft link.                                  │
│ Recommended UI: Modal                                                         │
│                                                                              │
│ Required Screen/Modal:                                                        │
│ └── Share Artifact Modal                                                      │
│     ├── Share link                                                            │
│     ├── Copy link                                                             │
│     ├── Invite user                                                           │
│     ├── Permission level                                                       │
│     ├── Expiration                                                            │
│     └── Share / Cancel                                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 11. NAVIGATION INTERACTIONS REQUIRING NEW SCREENS                             │
│                                                                              │
│ Interaction: Click project breadcrumb                                         │
│ Result: Opens project overview.                                               │
│ Route: /projects/[projectId]                                                  │
│ Required Screen: Project Overview Screen                                      │
│                                                                              │
│ Interaction: Click lifecycle workspace breadcrumb                             │
│ Result: Opens phase workspace.                                                │
│ Route: /projects/[projectId]/workspace                                        │
│ Required Screen: Lifecycle Workspace Screen                                   │
│                                                                              │
│ Interaction: Click artifact link                                              │
│ Result: Opens artifact detail.                                                │
│ Route: /projects/[projectId]/artifacts/[artifactId]                           │
│ Required Screen: Artifact Detail Screen                                       │
│                                                                              │
│ Interaction: Click evidence link                                              │
│ Result: Opens evidence detail.                                                │
│ Route: /projects/[projectId]/evidence/[evidenceId]                            │
│ Required Screen: Evidence Detail Screen                                       │
│                                                                              │
│ Interaction: Click gate link                                                  │
│ Result: Opens gate review.                                                    │
│ Route: /projects/[projectId]/gates/[gateId]/review                            │
│ Required Screen: Gate Review Screen                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 12. SUMMARY — REQUIRED ADDITIONAL SCREENS                                     │
│                                                                              │
│ Required full screens from Template Wizard interactions:                      │
│                                                                              │
│ ├── /projects/[projectId]                                                     │
│ │   └── Project Overview Screen                                               │
│ │                                                                            │
│ ├── /projects/[projectId]/workspace                                           │
│ │   └── Lifecycle Workspace Screen                                            │
│ │                                                                            │
│ ├── /projects/[projectId]/templates/[templateId]                              │
│ │   └── Template Wizard Screen / Template Route State                         │
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
│ 13. SUMMARY — REQUIRED MODALS / DRAWERS / POPOVERS                            │
│                                                                              │
│ Required overlays from Template Wizard interactions:                          │
│                                                                              │
│ ├── Switch Template Modal                                                     │
│ ├── Template Guide Drawer                                                     │
│ ├── Template Version Detail Drawer                                            │
│ ├── Section Validation Detail Drawer                                          │
│ ├── Add Optional Section Modal                                                │
│ ├── Remove Section Confirmation Modal                                         │
│ ├── Field Help Popover                                                        │
│ ├── Expanded Field Editor Modal                                               │
│ ├── Add Table Row Modal                                                       │
│ ├── Matrix Row Detail Drawer                                                  │
│ ├── Delete Row Confirmation Modal                                             │
│ ├── Import Rows Modal                                                         │
│ ├── Link Evidence Modal                                                       │
│ ├── Upload Evidence Modal                                                     │
│ ├── Evidence Detail Drawer                                                    │
│ ├── Remove Evidence Link Confirmation Modal                                   │
│ ├── Validation Issue Detail Drawer                                            │
│ ├── Validation Issues Drawer                                                  │
│ ├── Validation Progress Modal                                                 │
│ ├── Full Markdown Preview Modal                                               │
│ ├── Export Markdown Confirmation Modal                                        │
│ ├── Full JSON Evidence Preview Modal                                          │
│ ├── JSON Schema Validation Result Modal                                       │
│ ├── Export JSON Evidence Confirmation Modal                                   │
│ ├── Autosave Failure Modal / Banner                                           │
│ ├── Export Artifact Package Modal                                             │
│ ├── Save Artifact Confirmation Modal                                          │
│ ├── Mark Complete Confirmation Modal                                          │
│ ├── Cannot Mark Complete Modal                                                │
│ ├── Submit Gate Review Modal                                                  │
│ ├── Version History Drawer                                                    │
│ ├── Version Compare Modal / Screen                                            │
│ ├── Restore Version Confirmation Modal                                        │
│ ├── Unsaved Changes Confirmation Modal                                        │
│ ├── Artifact Comments Drawer                                                  │
│ ├── Field Comment Popover                                                     │
│ ├── Assign Reviewer Modal                                                     │
│ └── Share Artifact Modal                                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘