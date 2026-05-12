No questions, Master. I can proceed with the current assumptions:

- Platform implements **Master-Lifecycle_Process.txt**
- Primary user flow: **create project → complete lifecycle phases → pass gates → generate artifacts/evidence → maintain traceability**
- UI should support **solo/local MVP first**, but remain expandable to full CYBERCUBE lifecycle governance
- Screens should use **pane-specific projections**, not raw database tables, matching the Prisma-style architecture principle.

  

# **UI/UX Flow of Screens — Master Lifecycle Platform**

```text
MASTER LIFECYCLE PLATFORM
│
├── 01. Dashboard
│   ├── Active Projects
│   ├── Lifecycle Progress
│   ├── Gate Status Summary
│   ├── Blockers / Missing Evidence
│   ├── Recent Decisions
│   └── Continue Next Required Action
│
├── 02. Projects
│   ├── Project List
│   ├── New Project
│   ├── Project Overview
│   ├── Project Profile
│   ├── Lifecycle Timeline
│   ├── Artifacts
│   ├── Gates
│   ├── Traceability
│   └── Audit Trail
│
├── 03. Lifecycle Workspace
│   ├── Phase Navigator
│   ├── Current Phase Workspace
│   ├── Required Templates
│   ├── Completion Checklist
│   ├── Evidence Attachments
│   ├── Validation Warnings
│   └── Submit for Gate Review
│
├── 04. Template Wizard
│   ├── Template Selection
│   ├── Dynamic Form
│   ├── Section-by-Section Editor
│   ├── Validation Panel
│   ├── Markdown Preview
│   ├── JSON Evidence Preview
│   └── Export / Save Artifact
│
├── 05. Gate Review
│   ├── Gate Overview
│   ├── Required Inputs
│   ├── Completion Evidence
│   ├── Decision Criteria
│   ├── Approver Review
│   ├── Decision Record
│   └── Next Phase Unlock
│
├── 06. Artifact Library
│   ├── Artifact List
│   ├── Artifact Detail
│   ├── Version History
│   ├── Markdown View
│   ├── JSON Evidence View
│   ├── Linked Phase
│   ├── Linked Gate
│   └── Export Package
│
├── 07. Traceability Matrix
│   ├── Phase → Artifact Links
│   ├── Requirement → Design Links
│   ├── Requirement → Test Links
│   ├── Gate → Evidence Links
│   ├── Gaps / Orphans
│   └── Coverage Summary
│
├── 08. Approval Center
│   ├── Pending Approvals
│   ├── Approval Detail
│   ├── Approver Comments
│   ├── Approve / Reject / Request Changes
│   └── Approval History
│
├── 09. Evidence Center
│   ├── Evidence Items
│   ├── Evidence Detail
│   ├── Evidence Completeness
│   ├── Evidence by Gate
│   ├── Evidence by Phase
│   └── Evidence Export Bundle
│
├── 10. Reports
│   ├── Lifecycle Status Report
│   ├── Gate Decision Report
│   ├── Traceability Report
│   ├── Missing Evidence Report
│   ├── Approval History Report
│   └── Full Project Evidence Package
│
└── 11. Settings
    ├── Lifecycle Configuration
    ├── Template Registry
    ├── Gate Rules
    ├── Roles / Permissions
    ├── Export Settings
    └── Local Storage Settings
```

---

# **Primary User Flow**

```text
Start
  ↓
Dashboard
  ↓
Create New Project
  ↓
Project Overview
  ↓
Lifecycle Workspace
  ↓
Complete Current Phase Template
  ↓
Validate Required Sections
  ↓
Generate Artifact
  ↓
Attach / Register Evidence
  ↓
Submit Gate Review
  ↓
Gate Decision
  ├── Approved → Unlock Next Phase
  ├── Changes Required → Return to Phase Workspace
  └── Rejected / Parked → Record Decision + Stop or Revise
  ↓
Repeat Until Lifecycle Completion
  ↓
Generate Final Evidence Package
```

---

# **Screen Flow by Lifecycle Area**

## **01. Dashboard**

**Purpose:** Show the user what needs attention first.

```text
Dashboard
├── Active Project Cards
├── Lifecycle Progress Bar
├── Current Gate Status
├── Missing Required Artifacts
├── Pending Approvals
├── Recent Evidence Generated
└── "Continue Project" CTA
```

**Best UI pattern:**

```text
Hero Summary
  → Active Project
  → Current Phase
  → Current Gate
  → Next Required Action

Below:
  → Blockers
  → Pending Approvals
  → Recent Artifacts
```

---

## **02. Project List**

**Purpose:** Let the user create, resume, filter, and inspect lifecycle projects.

```text
Projects
├── Search / Filter
├── Project Cards or Table
├── Status: Draft / Active / Blocked / Approved / Archived
├── Current Phase
├── Current Gate
├── Last Updated
└── New Project Button
```

---

## **03. New Project**

**Purpose:** Create the lifecycle container.

```text
New Project
├── Project Name
├── Project Code / Slug
├── Project Type
├── Owner
├── Business Area
├── Lifecycle Model
├── Storage Location
├── Initial Description
└── Create Project
```

**Result:** Creates the project shell and opens Phase 1.

The broader Prisma project model already treats the project registry as the canonical project identity consumed by downstream modules.  

---

## **04. Project Overview**

**Purpose:** Central command page for one project.

```text
Project Overview
├── Project Header
│   ├── Name
│   ├── Status
│   ├── Owner
│   └── Current Phase
│
├── Lifecycle Progress
│   ├── Completed Phases
│   ├── Active Phase
│   └── Locked Future Phases
│
├── Gate Summary
│   ├── G1 Status
│   ├── G2 Status
│   ├── G3 Status
│   └── Later Gates
│
├── Required Next Action
│
├── Artifact Summary
│
├── Evidence Summary
│
└── Traceability Health
```

---

# **Lifecycle Workspace Flow**

## **05. Lifecycle Workspace**

**Purpose:** The main working screen where the user completes the current phase.

```text
Lifecycle Workspace
├── Left Sidebar: Phase Navigator
│   ├── Phase 1 — Idea Capture
│   ├── Phase 2 — Problem Definition
│   ├── Phase 3 — Evaluation and Selection
│   ├── Phase 4 — Feasibility and Business Case
│   ├── ...
│   └── Phase 14 — Maintenance / Review
│
├── Center Panel: Current Phase
│   ├── Phase Purpose
│   ├── Required Outputs
│   ├── Required Templates
│   ├── Completion Criteria
│   └── Current Status
│
└── Right Panel: Validation / Evidence
    ├── Missing Sections
    ├── Missing Evidence
    ├── Gate Readiness
    └── Submit for Review
```

---

## **06. Phase Detail Screen**

```text
Phase Detail
├── Phase Identity
│   ├── Phase Number
│   ├── Phase Name
│   ├── Purpose
│   └── Owner
│
├── Required Artifacts
│   ├── Template A-0
│   ├── Template A-0.1
│   └── Other Required Outputs
│
├── Work Items
│   ├── Draft
│   ├── In Review
│   ├── Approved
│   └── Blocked
│
├── Completion Criteria
│
├── Evidence Requirements
│
└── Gate Dependency
```

---

# **Template Wizard Flow**

## **07. Template Registry**

**Purpose:** Store and select lifecycle templates.

```text
Template Registry
├── Template ID
├── Template Name
├── Lifecycle Phase
├── Required / Optional
├── Output Type
│   ├── Markdown
│   ├── JSON
│   └── Both
├── Schema Version
└── Status
```

---

## **08. Template Wizard**

**Purpose:** Turn lifecycle templates into guided forms.

```text
Template Wizard
├── Template Header
│   ├── Template ID
│   ├── Template Name
│   ├── Phase
│   └── Required Status
│
├── Section Navigator
│   ├── Section 1
│   ├── Section 2
│   ├── Section 3
│   └── ...
│
├── Dynamic Form Area
│   ├── Text Inputs
│   ├── Textareas
│   ├── Selects
│   ├── Checklists
│   ├── Evidence Upload / Link
│   └── Notes
│
├── Validation Panel
│   ├── Required Missing
│   ├── Weak Answers
│   ├── Inconsistent Fields
│   └── Gate Blockers
│
└── Actions
    ├── Save Draft
    ├── Preview Artifact
    ├── Generate Markdown
    ├── Generate JSON
    └── Mark Complete
```

---

## **09. Artifact Preview**

```text
Artifact Preview
├── Markdown Preview
├── JSON Evidence Preview
├── Metadata
│   ├── Project ID
│   ├── Phase ID
│   ├── Template ID
│   ├── Version
│   └── Created Date
│
├── Validation Results
└── Save Artifact
```

---

# **Gate Review Flow**

## **10. Gate Overview**

**Purpose:** Make lifecycle gate decisions visible, auditable, and controlled.

```text
Gate Overview
├── Gate ID
├── Gate Name
├── Related Phase(s)
├── Required Artifacts
├── Required Evidence
├── Completion Status
├── Decision Criteria
├── Decision History
└── Start Review
```

Gate decisions should be stored as durable decision records with contributing artifacts and reasoning; this matches the existing governance feature model for policies, evaluations, and gate decisions.  

---

## **11. Gate Review Detail**

```text
Gate Review Detail
├── Gate Header
│   ├── Gate Name
│   ├── Status
│   ├── Project
│   └── Reviewer
│
├── Required Inputs Checklist
│   ├── Artifact Complete?
│   ├── Evidence Attached?
│   ├── Trace Links Complete?
│   ├── Approval Record Ready?
│   └── No Blocking Validation Errors?
│
├── Evidence Panel
│   ├── Linked Artifacts
│   ├── Linked JSON Evidence
│   └── Missing Evidence
│
├── Decision Criteria
│   ├── Pass
│   ├── Conditional Pass
│   ├── Request Changes
│   └── Reject / Park
│
├── Reviewer Notes
└── Submit Decision
```

---

## **12. Gate Decision Result**

```text
Gate Decision Result
├── Decision Status
│   ├── Approved
│   ├── Conditional
│   ├── Changes Required
│   ├── Rejected
│   └── Parked
│
├── Decision Reason
├── Conditions
├── Required Follow-Up
├── Approver
├── Timestamp
├── Evidence Snapshot
└── Unlock Next Phase
```

---

# **Artifact and Evidence Flow**

## **13. Artifact Library**

```text
Artifact Library
├── Filters
│   ├── Project
│   ├── Phase
│   ├── Template
│   ├── Status
│   └── Version
│
├── Artifact Table
│   ├── Artifact Name
│   ├── Phase
│   ├── Template
│   ├── Status
│   ├── Version
│   ├── Last Updated
│   └── Linked Gate
│
└── Open Artifact
```

---

## **14. Artifact Detail**

```text
Artifact Detail
├── Artifact Header
├── Markdown Content
├── JSON Metadata
├── Version History
├── Linked Evidence
├── Linked Gate Decisions
├── Linked Traceability Records
└── Export Options
```

---

## **15. Evidence Center**

```text
Evidence Center
├── Evidence Completeness Score
├── Evidence by Phase
├── Evidence by Gate
├── Evidence by Artifact
├── Evidence Gaps
├── Evidence Detail
└── Export Evidence Bundle
```

Evidence is a first-class governance object in the Prisma-style model, including evidence items, artifact references, links to requirements and controls, immutable snapshots, completeness checks, and audit events.  

---

# **Traceability Flow**

## **16. Traceability Matrix**

**Purpose:** Show whether lifecycle outputs are connected.

```text
Traceability Matrix
├── Phase → Artifact
├── Artifact → Gate
├── Requirement → Design
├── Requirement → Test
├── Gate → Evidence
├── Evidence → Approval
└── Gaps
```

---

## **17. Traceability Detail**

```text
Traceability Detail
├── Source Object
├── Target Object
├── Link Type
├── Link Strength
├── Created By
├── Created Date
├── Evidence Reference
└── Validation Status
```

---

# **Approval Flow**

## **18. Approval Center**

```text
Approval Center
├── Pending Approvals
├── My Reviews
├── Approved Records
├── Rejected Records
├── Changes Requested
└── Approval History
```

---

## **19. Approval Detail**

```text
Approval Detail
├── Approval Request
├── Related Artifact
├── Related Gate
├── Evidence Snapshot
├── Reviewer Checklist
├── Comments
└── Decision Actions
    ├── Approve
    ├── Reject
    └── Request Changes
```

---

# **Reports Flow**

## **20. Reports Dashboard**

```text
Reports
├── Lifecycle Status Report
├── Gate Decision Report
├── Artifact Completion Report
├── Evidence Completeness Report
├── Traceability Coverage Report
├── Approval History Report
└── Full Project Lifecycle Package
```

---

## **21. Export Package Flow**

```text
Export Package
├── Select Project
├── Select Scope
│   ├── Current Phase
│   ├── Gate Package
│   ├── Full Lifecycle
│   └── Audit Package
│
├── Include
│   ├── Markdown Artifacts
│   ├── JSON Evidence
│   ├── Gate Decisions
│   ├── Approval Records
│   ├── Traceability Matrix
│   └── Reports
│
└── Generate Export
```

---

# **Recommended MVP Screen Set**

For the first build, Master, I would not build all screens at once. I would start with this smaller flow:

```text
MVP SCREEN SET
│
├── 01. Dashboard
├── 02. Projects
├── 03. New Project
├── 04. Project Overview
├── 05. Lifecycle Workspace
├── 06. Template Wizard
├── 07. Artifact Preview
├── 08. Gate Review
├── 09. Artifact Library
├── 10. Traceability Matrix
└── 11. Settings / Template Registry
```

This supports the core loop:

```text
Project → Phase → Template → Artifact → Gate → Evidence → Next Phase
```

That is the correct first UI/UX slice for implementing the Master Lifecycle process without overbuilding.



Master, use this as the **technical implementation brief** for an agent to replicate the Dashboard screen in code.




Master, use this as the technical implementation brief for an agent to replicate the Projects screen in code.

PROJECTS SCREEN — TECHNICAL IMPLEMENTATION SPECIFICATION

⸻

1. Screen Identity

screen: "Projects"
route: "/projects"
layoutType: "authenticated-app-shell"
primaryPurpose: "Project registry and lifecycle project command view"

The Projects screen lets the user browse all lifecycle projects, create a new project, inspect a selected project, and access project-specific lifecycle areas such as profile, timeline, artifacts, gates, traceability, and audit trail.

⸻

2. High-Level Layout Structure

ProjectsPage
│
├── AppShell
│   ├── Sidebar
│   └── MainArea
│       ├── TopHeader
│       └── ProjectsContent
│           ├── ProjectListPanel
│           └── ProjectDetailPanel
│               ├── ProjectDetailHeader
│               ├── ProjectTabs
│               └── ActiveTabContent

The Projects screen uses a split-view layout:

Left Panel  → Project List
Right Panel → Selected Project Workspace

⸻

3. Page Layout Grid

.projects-page {
  display: grid;
  grid-template-columns: 380px 1fr;
  min-height: calc(100vh - 76px);
  background: #f8fafc;
}
.project-list-panel {
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  min-width: 0;
  overflow-y: auto;
}
.project-detail-panel {
  min-width: 0;
  overflow-y: auto;
  padding: 32px;
}

Responsive behavior:

@media (max-width: 1180px) {
  .projects-page {
    grid-template-columns: 320px 1fr;
  }
}
@media (max-width: 900px) {
  .projects-page {
    grid-template-columns: 1fr;
  }
  .project-list-panel {
    display: none;
  }
  .project-detail-panel {
    padding: 20px;
  }
}

⸻

4. Required Screen Areas

Projects Screen
│
├── Project List
├── New Project
├── Project Overview
├── Project Profile
├── Lifecycle Timeline
├── Artifacts
├── Gates
├── Traceability
└── Audit Trail

These areas should be represented as:

Project List              → Left project selection panel
New Project               → Primary CTA button
Project Overview          → Default selected project tab
Project Profile           → Project tab
Lifecycle Timeline        → Project tab
Artifacts                 → Project tab
Gates                     → Project tab
Traceability              → Project tab
Audit Trail               → Project tab

⸻

5. Top Header Component

Component Name

<TopHeader />

Purpose

Global application header for navigation context, search, notifications, and user account controls.

Structure

TopHeader
├── SidebarToggle
├── PageTitle: "Projects"
├── GlobalSearch
├── ThemeToggle
├── Notifications
├── UserAvatar
├── UserName
├── UserRole
└── UserDropdown

Props

type TopHeaderProps = {
  title: string;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  notificationCount: number;
};

⸻

6. Project List Panel

Component Name

<ProjectListPanel />

Purpose

Displays all lifecycle projects and allows the user to select one.

Structure

ProjectListPanel
├── PanelHeader
│   ├── Title: "Project List"
│   ├── Count Badge
│   └── Sort Control
│
├── ProjectSearchAndFilter
│   ├── Search Input
│   └── Filter Button
│
├── ProjectCards
│   ├── ProjectListCard
│   ├── ProjectListCard
│   └── ...
│
└── PaginationControls

Data Model

type ProjectListItem = {
  id: string;
  code: string;
  name: string;
  currentPhaseNumber: number;
  totalPhases: number;
  status: "in_progress" | "blocked" | "pending" | "not_started" | "completed" | "archived";
  progressPercent: number;
  lastUpdatedLabel: string;
  isStarred?: boolean;
};

Example Data

const projectListItems: ProjectListItem[] = [
  {
    id: "sip-001",
    code: "SIP-001",
    name: "Secure Identity Platform",
    currentPhaseNumber: 3,
    totalPhases: 14,
    status: "in_progress",
    progressPercent: 65,
    lastUpdatedLabel: "Updated 2h ago",
    isStarred: true,
  },
  {
    id: "dgh-002",
    code: "DGH-002",
    name: "Data Governance Hub",
    currentPhaseNumber: 2,
    totalPhases: 14,
    status: "in_progress",
    progressPercent: 40,
    lastUpdatedLabel: "Updated 1d ago",
  },
  {
    id: "tis-003",
    code: "TIS-003",
    name: "Threat Intelligence System",
    currentPhaseNumber: 1,
    totalPhases: 14,
    status: "blocked",
    progressPercent: 20,
    lastUpdatedLabel: "Updated 2d ago",
  },
];

⸻

7. Project List Card

Component Name

<ProjectListCard />

Purpose

Compact project selector card used inside the left panel.

Structure

ProjectListCard
├── ProjectName
├── OptionalStar
├── StatusBadge
├── ProjectCode
├── PhaseLabel
├── LastUpdated
├── ProgressBar
└── ProgressPercent

Props

type ProjectListCardProps = {
  project: ProjectListItem;
  selected: boolean;
  onSelect: (projectId: string) => void;
};

Visual Rules

Selected card:
├── Blue border
├── Light blue background tint
└── Stronger shadow
Normal card:
├── White background
├── Light border
└── Subtle hover state
Blocked card:
├── Red status badge
└── Optional red alert icon

⸻

8. Project Detail Header

Component Name

<ProjectDetailHeader />

Purpose

Shows the currently selected project identity and key metadata.

Structure

ProjectDetailHeader
├── ProjectIcon
├── ProjectTitleBlock
│   ├── ProjectName
│   ├── StatusBadge
│   ├── StarButton
│   ├── MetadataLine
│   │   ├── ProjectCode
│   │   ├── CurrentPhase
│   │   ├── Owner
│   │   └── BusinessArea
│   └── LastUpdated
│
└── PrimaryAction
    └── New Project Button

Data Model

type ProjectDetailHeaderData = {
  id: string;
  code: string;
  name: string;
  status: "in_progress" | "blocked" | "pending" | "not_started" | "completed" | "archived";
  currentPhaseNumber: number;
  totalPhases: number;
  ownerName: string;
  businessArea: string;
  lastUpdatedLabel: string;
  isStarred?: boolean;
};

⸻

9. New Project Action

Component Name

<NewProjectButton />

Purpose

Primary CTA for creating a new lifecycle project.

Behavior

Click "+ New Project"
→ Navigate to /projects/new

Button Requirements

Label: "+ New Project"
Variant: Primary
Placement: Top right of Project Detail Header
Keyboard focusable: Yes
Aria label: "Create new project"

⸻

10. Project Tabs

Component Name

<ProjectTabs />

Purpose

Provides project-specific section navigation.

Required Tabs

Overview
Profile
Lifecycle Timeline
Artifacts
Gates
Traceability
Audit Trail

Data Model

type ProjectTabKey =
  | "overview"
  | "profile"
  | "lifecycle_timeline"
  | "artifacts"
  | "gates"
  | "traceability"
  | "audit_trail";
type ProjectTab = {
  key: ProjectTabKey;
  label: string;
  href: string;
};

Example Tabs

const projectTabs: ProjectTab[] = [
  { key: "overview", label: "Overview", href: "#overview" },
  { key: "profile", label: "Profile", href: "#profile" },
  { key: "lifecycle_timeline", label: "Lifecycle Timeline", href: "#timeline" },
  { key: "artifacts", label: "Artifacts", href: "#artifacts" },
  { key: "gates", label: "Gates", href: "#gates" },
  { key: "traceability", label: "Traceability", href: "#traceability" },
  { key: "audit_trail", label: "Audit Trail", href: "#audit-trail" },
];

Visual Rules

Active tab:
├── Blue text
├── Blue underline
└── Font weight 600
Inactive tab:
├── Muted text
├── Hover blue text
└── No background fill

⸻

11. Project Overview Tab

Component Name

<ProjectOverviewTab />

Purpose

Default tab showing project progress, key lifecycle metrics, gate status, blockers, and next action.

Structure

ProjectOverviewTab
├── LifecycleProgressCard
├── ProjectMetricCards
├── ActivityAndGateGrid
│   ├── RecentActivity
│   ├── GateStatusSummary
│   └── BlockersMissingEvidence
├── ProjectSnapshotPanel
├── QuickActionsPanel
└── NextRequiredActionBar

⸻

12. Lifecycle Progress Card

Component Name

<LifecycleProgressCard />

Purpose

Shows where the selected project is in the 14-phase lifecycle.

Structure

LifecycleProgressCard
├── CardHeader
│   ├── Title: "Lifecycle Progress"
│   └── View Full Timeline Button
│
└── HorizontalPhaseStepper
    ├── Phase 1 — Idea Capture
    ├── Phase 2 — Problem Definition
    ├── Phase 3 — Evaluation & Selection
    ├── Phase 4 — Feasibility & Business Case
    ├── Phase 5 — Approval & Funding
    ├── Ellipsis
    └── Phase 14 — Maintenance / Review

Data Model

type LifecyclePhaseStatus =
  | "completed"
  | "current"
  | "not_started"
  | "blocked"
  | "skipped";
type LifecyclePhase = {
  phaseNumber: number;
  name: string;
  status: LifecyclePhaseStatus;
  gateCode?: string;
};

Example Data

const lifecyclePhases: LifecyclePhase[] = [
  { phaseNumber: 1, name: "Idea Capture", status: "completed", gateCode: "G1" },
  { phaseNumber: 2, name: "Problem Definition", status: "completed", gateCode: "G2" },
  { phaseNumber: 3, name: "Evaluation & Selection", status: "current" },
  { phaseNumber: 4, name: "Feasibility & Business Case", status: "not_started", gateCode: "G3" },
  { phaseNumber: 5, name: "Approval & Funding", status: "not_started" },
  { phaseNumber: 14, name: "Maintenance / Review", status: "not_started" },
];

⸻

13. Project Metric Cards

Component Name

<ProjectMetricCards />

Purpose

Shows project-level artifact, gate, evidence, and traceability counts.

Required Metrics

Artifacts
Gates
Evidence Items
Trace Links

Data Model

type ProjectMetric = {
  id: string;
  label: string;
  value: number | string;
  helperText: string;
  tone: "blue" | "green" | "amber" | "red" | "purple" | "gray";
  icon: React.ComponentType;
};

Example Data

const projectMetrics: ProjectMetric[] = [
  {
    id: "artifacts",
    label: "Artifacts",
    value: 12,
    helperText: "8 complete",
    tone: "blue",
    icon: FileTextIcon,
  },
  {
    id: "gates",
    label: "Gates",
    value: "2 of 13",
    helperText: "Passed",
    tone: "green",
    icon: ShieldCheckIcon,
  },
  {
    id: "evidence",
    label: "Evidence Items",
    value: 18,
    helperText: "12 complete",
    tone: "blue",
    icon: ClipboardIcon,
  },
  {
    id: "trace-links",
    label: "Trace Links",
    value: 46,
    helperText: "85% coverage",
    tone: "purple",
    icon: NetworkIcon,
  },
];

⸻

14. Recent Activity Component

Component Name

<RecentActivity />

Purpose

Shows recent project events and lifecycle updates.

Structure

RecentActivity
├── CardHeader
│   ├── Title: "Recent Activity"
│   └── View all activity link
│
└── ActivityList
    ├── ActivityItem
    ├── ActivityItem
    └── ...

Data Model

type ProjectActivity = {
  id: string;
  title: string;
  description?: string;
  actorName: string;
  timestampLabel: string;
  type: "artifact" | "gate" | "evidence" | "traceability" | "phase" | "approval";
  href?: string;
};

Example Data

const recentActivity: ProjectActivity[] = [
  {
    id: "act-001",
    title: "Artifact A-3.1 Solution Options Analysis approved",
    actorName: "Alex Developer",
    timestampLabel: "2h ago",
    type: "artifact",
  },
  {
    id: "act-002",
    title: "Gate G2: Feasibility Approval submitted for review",
    actorName: "Alex Developer",
    timestampLabel: "5h ago",
    type: "gate",
  },
  {
    id: "act-003",
    title: "Evidence item EV-18 attached to A-2.1 Requirements Definition",
    actorName: "Alex Developer",
    timestampLabel: "1d ago",
    type: "evidence",
  },
];

⸻

15. Gate Status Summary Component

Component Name

<ProjectGateStatusSummary />

Purpose

Shows the selected project’s gate progression and current gate state.

Structure

ProjectGateStatusSummary
├── CardHeader
│   ├── Title: "Gate Status Summary"
│   └── View all gates link
│
└── GateList
    ├── GateStatusRow
    ├── GateStatusRow
    └── ...

Data Model

type ProjectGateStatus = {
  gateCode: string;
  name: string;
  status: "approved" | "in_review" | "pending" | "blocked" | "not_started";
  lastUpdatedLabel?: string;
};

Example Data

const projectGateStatuses: ProjectGateStatus[] = [
  {
    gateCode: "G1",
    name: "Concept Approval",
    status: "approved",
    lastUpdatedLabel: "2d ago",
  },
  {
    gateCode: "G2",
    name: "Feasibility Approval",
    status: "in_review",
    lastUpdatedLabel: "5h ago",
  },
  {
    gateCode: "G3",
    name: "Solution Approval",
    status: "pending",
  },
];

⸻

16. Blockers / Missing Evidence Component

Component Name

<ProjectBlockers />

Purpose

Shows project blockers, missing required sections, incomplete evidence, and pending approvals.

Structure

ProjectBlockers
├── CardHeader
│   ├── Title: "Blockers / Missing Evidence"
│   └── View all link
│
└── BlockerList
    ├── BlockerItem
    ├── BlockerItem
    └── ...

Data Model

type ProjectBlocker = {
  id: string;
  message: string;
  severity: "warning" | "error" | "critical";
  relatedObjectType: "artifact" | "gate" | "evidence" | "approval" | "traceability";
  relatedObjectId?: string;
  href?: string;
};

Example Data

const projectBlockers: ProjectBlocker[] = [
  {
    id: "blocker-001",
    message: "2 artifacts have missing required sections",
    severity: "error",
    relatedObjectType: "artifact",
    href: "/projects/sip-001/artifacts?status=incomplete",
  },
  {
    id: "blocker-002",
    message: "3 evidence items are incomplete",
    severity: "error",
    relatedObjectType: "evidence",
    href: "/projects/sip-001/evidence?status=incomplete",
  },
  {
    id: "blocker-003",
    message: "1 gate is awaiting required approvals",
    severity: "warning",
    relatedObjectType: "approval",
    href: "/projects/sip-001/gates/g2",
  },
];

⸻

17. Project Snapshot Panel

Component Name

<ProjectSnapshotPanel />

Purpose

Shows metadata for the selected project.

Structure

ProjectSnapshotPanel
├── Title: "Project Snapshot"
├── Project Code
├── Project Type
├── Business Area
├── Owner
├── Lifecycle Model
├── Created Date
├── Last Updated
└── Status

Data Model

type ProjectSnapshot = {
  code: string;
  projectType: string;
  businessArea: string;
  ownerName: string;
  lifecycleModel: string;
  createdDateLabel: string;
  lastUpdatedLabel: string;
  status: string;
};

Example Data

const projectSnapshot: ProjectSnapshot = {
  code: "SIP-001",
  projectType: "Platform",
  businessArea: "Security",
  ownerName: "Alex Developer",
  lifecycleModel: "Standard 14-Phase",
  createdDateLabel: "May 10, 2024",
  lastUpdatedLabel: "2 hours ago",
  status: "In Progress",
};

⸻

18. Quick Actions Panel

Component Name

<ProjectQuickActions />

Purpose

Provides shortcuts into project-level work areas.

Required Actions

Edit Project Profile
View Lifecycle Timeline
Manage Artifacts
View Gates
View Traceability Matrix
View Audit Trail
Export Project Package

Data Model

type ProjectQuickAction = {
  id: string;
  label: string;
  icon: React.ComponentType;
  href: string;
};

Example Data

const projectQuickActions: ProjectQuickAction[] = [
  {
    id: "edit-profile",
    label: "Edit Project Profile",
    icon: PencilIcon,
    href: "/projects/sip-001/profile",
  },
  {
    id: "view-timeline",
    label: "View Lifecycle Timeline",
    icon: CalendarIcon,
    href: "/projects/sip-001/timeline",
  },
  {
    id: "manage-artifacts",
    label: "Manage Artifacts",
    icon: FileTextIcon,
    href: "/projects/sip-001/artifacts",
  },
  {
    id: "view-gates",
    label: "View Gates",
    icon: ShieldIcon,
    href: "/projects/sip-001/gates",
  },
  {
    id: "view-traceability",
    label: "View Traceability Matrix",
    icon: NetworkIcon,
    href: "/projects/sip-001/traceability",
  },
  {
    id: "view-audit-trail",
    label: "View Audit Trail",
    icon: HistoryIcon,
    href: "/projects/sip-001/audit",
  },
  {
    id: "export-package",
    label: "Export Project Package",
    icon: DownloadIcon,
    href: "/projects/sip-001/export",
  },
];

⸻

19. Next Required Action Bar

Component Name

<NextRequiredActionBar />

Purpose

Persistent bottom callout that tells the user what to do next.

Structure

NextRequiredActionBar
├── Label: "Next Required Action"
├── Description
└── Primary CTA

Data Model

type NextRequiredAction = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

Example Data

const nextRequiredAction: NextRequiredAction = {
  title: "Next Required Action",
  description:
    "Complete the required artifacts for Phase 3 and submit Gate G2: Feasibility Approval for review.",
  ctaLabel: "Go to Lifecycle Workspace",
  href: "/projects/sip-001/workspace",
};

⸻

20. Project Profile Tab

Component Name

<ProjectProfileTab />

Purpose

Displays and edits core project metadata.

Structure

ProjectProfileTab
├── Project Identity
│   ├── Project Name
│   ├── Project Code
│   ├── Project Type
│   └── Lifecycle Model
│
├── Ownership
│   ├── Owner
│   ├── Sponsor
│   ├── Department
│   └── Business Area
│
├── Description
│   ├── Project Summary
│   ├── Problem Statement
│   └── Expected Benefit
│
├── Governance
│   ├── Current Status
│   ├── Risk Level
│   ├── Priority
│   └── Approval Mode
│
└── Save Changes

⸻

21. Lifecycle Timeline Tab

Component Name

<LifecycleTimelineTab />

Purpose

Displays full 14-phase lifecycle progression.

Structure

LifecycleTimelineTab
├── TimelineHeader
│   ├── Lifecycle Model
│   ├── Current Phase
│   └── Completion Percent
│
├── VerticalPhaseTimeline
│   ├── PhaseTimelineItem
│   ├── PhaseTimelineItem
│   └── ...
│
└── GateMarkers

Phase Timeline Item

PhaseTimelineItem
├── Phase Number
├── Phase Name
├── Status
├── Required Artifacts Count
├── Completed Artifacts Count
├── Gate Dependency
├── Start Date
├── Completion Date
└── Open Phase Button

⸻

22. Artifacts Tab

Component Name

<ProjectArtifactsTab />

Purpose

Lists all artifacts for the selected project.

Structure

ProjectArtifactsTab
├── ArtifactFilters
│   ├── Phase
│   ├── Status
│   ├── Template
│   └── Search
│
├── ArtifactTable
│   ├── Artifact ID
│   ├── Name
│   ├── Phase
│   ├── Template
│   ├── Status
│   ├── Version
│   ├── Last Updated
│   └── Actions
│
└── Create Artifact / Open Template

Data Model

type ProjectArtifact = {
  id: string;
  artifactCode: string;
  name: string;
  phaseNumber: number;
  templateId: string;
  status: "draft" | "in_review" | "approved" | "changes_requested" | "incomplete";
  version: string;
  lastUpdatedLabel: string;
  href: string;
};

⸻

23. Gates Tab

Component Name

<ProjectGatesTab />

Purpose

Displays gate decisions and gate readiness for the selected project.

Structure

ProjectGatesTab
├── GateFilters
│   ├── Status
│   ├── Gate Code
│   └── Readiness
│
├── GateCards
│   ├── GateCard
│   ├── GateCard
│   └── ...
│
└── GateDecisionHistory

Gate Card

GateCard
├── Gate Code
├── Gate Name
├── Status
├── Required Artifacts
├── Evidence Completeness
├── Approver
├── Decision Date
└── Open Gate Review

⸻

24. Traceability Tab

Component Name

<ProjectTraceabilityTab />

Purpose

Shows project traceability health and link coverage.

Structure

ProjectTraceabilityTab
├── TraceabilitySummary
│   ├── Coverage Percent
│   ├── Missing Links
│   ├── Orphan Artifacts
│   └── Broken Links
│
├── TraceabilityMatrix
│   ├── Source Object
│   ├── Link Type
│   ├── Target Object
│   ├── Status
│   └── Evidence
│
└── GapList

Data Model

type TraceLink = {
  id: string;
  sourceType: "phase" | "artifact" | "requirement" | "gate" | "evidence";
  sourceLabel: string;
  linkType: "satisfies" | "depends_on" | "verifies" | "supports" | "approves";
  targetType: "phase" | "artifact" | "requirement" | "gate" | "evidence" | "approval";
  targetLabel: string;
  status: "valid" | "missing" | "broken" | "needs_review";
};

⸻

25. Audit Trail Tab

Component Name

<ProjectAuditTrailTab />

Purpose

Displays immutable project history.

Structure

ProjectAuditTrailTab
├── AuditFilters
│   ├── Actor
│   ├── Event Type
│   ├── Date Range
│   └── Object Type
│
├── AuditEventList
│   ├── AuditEvent
│   ├── AuditEvent
│   └── ...
│
└── Export Audit Log

Data Model

type ProjectAuditEvent = {
  id: string;
  timestampLabel: string;
  actorName: string;
  eventType:
    | "project_created"
    | "project_updated"
    | "phase_started"
    | "phase_completed"
    | "artifact_created"
    | "artifact_updated"
    | "gate_submitted"
    | "gate_decided"
    | "evidence_attached"
    | "trace_link_created"
    | "approval_recorded";
  objectLabel: string;
  summary: string;
};

⸻

26. Recommended Component Tree

<ProjectsPage>
  <AppShell>
    <Sidebar />
    <MainArea>
      <TopHeader title="Projects" />
      <ProjectsContent>
        <ProjectListPanel>
          <ProjectSearchAndFilter />
          <ProjectListCard />
          <ProjectListCard />
          <ProjectListCard />
        </ProjectListPanel>
        <ProjectDetailPanel>
          <ProjectDetailHeader />
          <ProjectTabs />
          <ProjectOverviewTab>
            <LifecycleProgressCard />
            <ProjectMetricCards />
            <RecentActivity />
            <ProjectGateStatusSummary />
            <ProjectBlockers />
            <ProjectSnapshotPanel />
            <ProjectQuickActions />
            <NextRequiredActionBar />
          </ProjectOverviewTab>
        </ProjectDetailPanel>
      </ProjectsContent>
    </MainArea>
  </AppShell>
</ProjectsPage>

⸻

27. Recommended File Structure

src/
├── app/
│   └── projects/
│       ├── page.tsx
│       └── new/
│           └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopHeader.tsx
│   │   └── MainArea.tsx
│   │
│   ├── projects/
│   │   ├── ProjectsContent.tsx
│   │   ├── ProjectListPanel.tsx
│   │   ├── ProjectSearchAndFilter.tsx
│   │   ├── ProjectListCard.tsx
│   │   ├── ProjectDetailPanel.tsx
│   │   ├── ProjectDetailHeader.tsx
│   │   ├── ProjectTabs.tsx
│   │   ├── ProjectOverviewTab.tsx
│   │   ├── LifecycleProgressCard.tsx
│   │   ├── ProjectMetricCards.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── ProjectGateStatusSummary.tsx
│   │   ├── ProjectBlockers.tsx
│   │   ├── ProjectSnapshotPanel.tsx
│   │   ├── ProjectQuickActions.tsx
│   │   ├── NextRequiredActionBar.tsx
│   │   ├── ProjectProfileTab.tsx
│   │   ├── LifecycleTimelineTab.tsx
│   │   ├── ProjectArtifactsTab.tsx
│   │   ├── ProjectGatesTab.tsx
│   │   ├── ProjectTraceabilityTab.tsx
│   │   └── ProjectAuditTrailTab.tsx
│   │
│   └── ui/
│       ├── card.tsx
│       ├── button.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── tabs.tsx
│       ├── table.tsx
│       └── input.tsx
│
├── data/
│   └── projects.mock.ts
│
├── types/
│   └── projects.types.ts
│
└── lib/
    ├── status-colors.ts
    ├── lifecycle-utils.ts
    └── formatters.ts

⸻

28. Projects Data Contract

export type ProjectsScreenData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  projects: ProjectListItem[];
  selectedProject: {
    header: ProjectDetailHeaderData;
    lifecyclePhases: LifecyclePhase[];
    metrics: ProjectMetric[];
    recentActivity: ProjectActivity[];
    gateStatuses: ProjectGateStatus[];
    blockers: ProjectBlocker[];
    snapshot: ProjectSnapshot;
    quickActions: ProjectQuickAction[];
    nextRequiredAction: NextRequiredAction;
  };
};

⸻

29. Status Badge Rules

const projectStatusBadgeMap = {
  in_progress: {
    label: "In Progress",
    tone: "blue",
  },
  blocked: {
    label: "Blocked",
    tone: "red",
  },
  pending: {
    label: "Pending",
    tone: "amber",
  },
  not_started: {
    label: "Not Started",
    tone: "gray",
  },
  completed: {
    label: "Completed",
    tone: "green",
  },
  archived: {
    label: "Archived",
    tone: "gray",
  },
};

⸻

30. Phase Status Rules

const lifecyclePhaseToneMap = {
  completed: "green",
  current: "blue",
  not_started: "gray",
  blocked: "red",
  skipped: "gray",
};

Visual behavior:

Completed phase:
├── Green circle
├── Check icon
└── Completed connector line
Current phase:
├── Blue circle
├── Phase number
└── Blue label
Not started phase:
├── Gray circle
├── Phase number
└── Muted label
Blocked phase:
├── Red circle
├── Alert icon
└── Red label

⸻

31. Interaction Requirements

Projects screen interactions:
1. Click "+ New Project"
   → Navigate to /projects/new
2. Click a ProjectListCard
   → Set selectedProject
   → Update detail panel without leaving /projects
   → Optionally update query param: /projects?selected=sip-001
3. Click "Overview" tab
   → Show ProjectOverviewTab
4. Click "Profile" tab
   → Show ProjectProfileTab
5. Click "Lifecycle Timeline" tab
   → Show LifecycleTimelineTab
6. Click "Artifacts" tab
   → Show ProjectArtifactsTab
7. Click "Gates" tab
   → Show ProjectGatesTab
8. Click "Traceability" tab
   → Show ProjectTraceabilityTab
9. Click "Audit Trail" tab
   → Show ProjectAuditTrailTab
10. Click "Go to Lifecycle Workspace"
    → Navigate to /projects/{projectId}/workspace
11. Click "View Full Timeline"
    → Switch active tab to Lifecycle Timeline
12. Click "Manage Artifacts"
    → Switch active tab to Artifacts
13. Click "View Gates"
    → Switch active tab to Gates
14. Click "View Traceability Matrix"
    → Switch active tab to Traceability
15. Click "View Audit Trail"
    → Switch active tab to Audit Trail
16. Click "Export Project Package"
    → Navigate to /projects/{projectId}/export

⸻

32. Visual Design Tokens

const projectsTokens = {
  layout: {
    sidebarWidth: "280px",
    headerHeight: "76px",
    projectListWidth: "380px",
    pagePadding: "32px",
    cardRadius: "16px",
    cardGap: "20px",
  },
  colors: {
    appBackground: "#f8fafc",
    surface: "#ffffff",
    sidebar: "#07111f",
    sidebarMuted: "#0f1b2d",
    border: "#e5e7eb",
    selectedBorder: "#2563eb",
    selectedBackground: "#eff6ff",
    textPrimary: "#111827",
    textSecondary: "#475569",
    textMuted: "#64748b",
    blue: "#2563eb",
    green: "#16a34a",
    amber: "#f59e0b",
    red: "#dc2626",
    purple: "#7c3aed",
    gray: "#94a3b8",
  },
  typography: {
    pageTitle: "24px / 32px, font-weight 700",
    projectTitle: "24px / 32px, font-weight 700",
    cardTitle: "16px / 24px, font-weight 600",
    metricValue: "24px / 32px, font-weight 700",
    body: "14px / 22px, font-weight 400",
    caption: "12px / 18px, font-weight 400",
  },
};

⸻

33. Accessibility Requirements

Accessibility requirements:
1. Project list must be keyboard navigable.
2. Selected project card must expose aria-selected="true".
3. Tabs must use semantic tab roles:
   ├── role="tablist"
   ├── role="tab"
   └── role="tabpanel"
4. Active tab must expose aria-selected="true".
5. Icon-only buttons must have aria-label.
6. Progress bars must expose aria-valuenow, aria-valuemin, and aria-valuemax.
7. Status must include text labels, not color only.
8. Tables must use semantic table markup.
9. Quick action rows must be reachable by keyboard.
10. Focus states must be visible.

⸻

34. Empty States

Empty state behavior:
No projects:
├── Show empty ProjectListPanel
├── Message: "No lifecycle projects yet"
├── CTA: "Create your first project"
└── Hide ProjectDetailPanel or show onboarding panel
No selected project:
├── Show project selection placeholder
├── Message: "Select a project to view lifecycle details"
No artifacts:
├── Artifacts tab shows empty state
├── CTA: "Create first artifact"
No gates:
├── Gates tab shows lifecycle model not configured warning
No trace links:
├── Traceability tab shows 0% coverage
├── CTA: "Create first trace link"
No audit events:
├── Audit Trail tab shows "No audit events recorded yet"

⸻

35. Loading and Error States

Loading:
├── App shell loads immediately
├── Project list shows card skeletons
├── Project detail shows header skeleton
├── Metrics show skeleton cards
├── Tables show row skeletons
Error:
├── Show inline error banner above ProjectsContent
├── Keep sidebar and header usable
├── Provide retry button
├── Preserve last selected project if possible

⸻

36. Agent Build Instruction

Build the Projects screen as a responsive authenticated SaaS split-view page.
Use:
├── Fixed dark sidebar
├── White top header
├── Left project list panel
├── Right selected project detail panel
├── Project detail header
├── Project tabs
├── Lifecycle progress stepper
├── Project metric cards
├── Recent activity card
├── Gate status summary card
├── Blockers / Missing Evidence card
├── Project snapshot sidebar panel
├── Quick actions panel
└── Bottom next required action bar
The screen must include:
├── Project List
├── New Project
├── Project Overview
├── Project Profile
├── Lifecycle Timeline
├── Artifacts
├── Gates
├── Traceability
└── Audit Trail

Final visual hierarchy:

1. Navigation shell
2. Project list / selection
3. Selected project identity
4. Project tabs
5. Lifecycle progress
6. Project metrics
7. Activity, gates, and blockers
8. Snapshot and quick actions
9. Next required action





Master, here is the repeated Lifecycle Workspace screen + Technical Implementation Specification.

LIFECYCLE WORKSPACE SCREEN — TECHNICAL IMPLEMENTATION SPECIFICATION

1. Screen Identity

screen: "Lifecycle Workspace"
route: "/projects/[projectId]/workspace"
layoutType: "authenticated-app-shell"
primaryPurpose: "Phase execution workspace for completing templates, evidence, validation, and gate submission"

The Lifecycle Workspace is the main execution screen for one project phase. It allows the user to:

├── Navigate lifecycle phases
├── Work on the current phase
├── Complete required templates
├── Attach evidence
├── Review completion checklist
├── Resolve validation warnings
└── Submit the phase for gate review

⸻

2. High-Level Layout Structure

LifecycleWorkspacePage
│
├── AppShell
│   ├── Sidebar
│   └── MainArea
│       ├── TopHeader
│       └── WorkspaceContent
│           ├── Breadcrumbs
│           ├── PhaseHeader
│           ├── WorkspaceGrid
│           │   ├── PhaseNavigatorPanel
│           │   ├── CurrentPhaseMainPanel
│           │   └── ReviewStatusPanel
│           └── NextRequiredActionBar

The screen uses a three-column layout:

Left Column   → Phase Navigator
Center Column → Current Phase Workspace, Required Templates, Evidence Attachments
Right Column  → Completion Checklist, Validation Warnings, Submit for Gate Review

⸻

3. Required Screen Areas

Lifecycle Workspace
│
├── Phase Navigator
├── Current Phase Workspace
├── Required Templates
├── Completion Checklist
├── Evidence Attachments
├── Validation Warnings
└── Submit for Gate Review

Implementation mapping:

Phase Navigator             → Left vertical lifecycle phase list
Current Phase Workspace     → Center phase summary and instructions
Required Templates          → Center template table
Evidence Attachments        → Center evidence table
Completion Checklist        → Right readiness checklist
Validation Warnings         → Right warning/error card
Submit for Gate Review      → Right submission action card

⸻

4. Page Layout Grid

.lifecycle-workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 360px;
  gap: 20px;
  padding: 24px 32px 32px;
  background: #f8fafc;
  min-height: calc(100vh - 76px);
}
.phase-navigator-panel,
.current-phase-panel,
.review-status-panel {
  min-width: 0;
}
.current-phase-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.review-status-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

Responsive behavior:

@media (max-width: 1280px) {
  .lifecycle-workspace {
    grid-template-columns: 260px minmax(0, 1fr);
  }
  .review-status-panel {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .lifecycle-workspace {
    grid-template-columns: 1fr;
    padding: 20px;
  }
  .phase-navigator-panel,
  .review-status-panel {
    display: block;
  }
}

⸻

5. Top Header

<TopHeader title="Lifecycle Workspace" />

Structure:

TopHeader
├── SidebarToggle
├── PageTitle: "Lifecycle Workspace"
├── ThemeToggle
├── Notifications
├── Help
└── UserMenu

Breadcrumbs:

<Breadcrumbs
  items={[
    { label: "Projects", href: "/projects" },
    { label: "Secure Identity Platform", href: "/projects/sip-001" },
    { label: "Lifecycle Workspace" },
  ]}
/>

⸻

6. Phase Header

Component

<PhaseHeader />

Purpose

Shows the active phase identity, status, metadata, gate dependency, and progress.

Structure

PhaseHeader
├── PhaseIcon
├── PhaseTitleBlock
│   ├── Phase Label: "Phase 3 of 14"
│   ├── Phase Name: "Evaluation & Selection"
│   ├── Status Badge: "In Progress"
│   └── Phase Purpose Text
│
├── PhaseMetadataRow
│   ├── Phase Owner
│   ├── Started On
│   ├── Target Completion
│   └── Gate: G2 Feasibility Approval
│
└── CompletionRing
    ├── Percent: 65%
    └── Label: Complete

Data Model

type PhaseHeaderData = {
  projectId: string;
  projectName: string;
  phaseNumber: number;
  totalPhases: number;
  phaseName: string;
  status:
    | "not_started"
    | "in_progress"
    | "blocked"
    | "ready_for_review"
    | "approved";
  purpose: string;
  ownerName: string;
  startedOnLabel: string;
  targetCompletionLabel: string;
  gateCode: string;
  gateName: string;
  completionPercent: number;
};

Example Data

const phaseHeader: PhaseHeaderData = {
  projectId: "sip-001",
  projectName: "Secure Identity Platform",
  phaseNumber: 3,
  totalPhases: 14,
  phaseName: "Evaluation & Selection",
  status: "in_progress",
  purpose:
    "Evaluate alternative solutions and select the best option that meets requirements, delivers value, and aligns with strategic objectives.",
  ownerName: "Alex Developer",
  startedOnLabel: "May 10, 2024",
  targetCompletionLabel: "May 24, 2024",
  gateCode: "G2",
  gateName: "Feasibility Approval",
  completionPercent: 65,
};

⸻

7. Phase Navigator

Component

<PhaseNavigator />

Purpose

Allows the user to move between lifecycle phases and see each phase status.

Structure

PhaseNavigator
├── PanelHeader
│   ├── Title: "Phase Navigator"
│   └── Count: "14 Phases"
│
├── PhaseList
│   ├── PhaseNavItem
│   ├── PhaseNavItem
│   └── ...
│
└── ViewFullTimelineButton

Data Model

type PhaseNavItem = {
  phaseNumber: number;
  name: string;
  status:
    | "completed"
    | "current"
    | "not_started"
    | "blocked"
    | "ready_for_review";
  href: string;
  gateCode?: string;
};

Example Data

const phaseNavigatorItems: PhaseNavItem[] = [
  {
    phaseNumber: 1,
    name: "Idea Capture",
    status: "completed",
    href: "/projects/sip-001/workspace?phase=1",
    gateCode: "G1",
  },
  {
    phaseNumber: 2,
    name: "Problem Definition",
    status: "completed",
    href: "/projects/sip-001/workspace?phase=2",
    gateCode: "G2",
  },
  {
    phaseNumber: 3,
    name: "Evaluation & Selection",
    status: "current",
    href: "/projects/sip-001/workspace?phase=3",
  },
  {
    phaseNumber: 4,
    name: "Feasibility & Business Case",
    status: "not_started",
    href: "/projects/sip-001/workspace?phase=4",
    gateCode: "G3",
  },
];

Visual Rules

Completed phase:
├── Green circle
├── Check icon
└── Green connector line
Current phase:
├── Blue circle
├── Blue left border
├── Light blue background
└── Status text: "In Progress"
Not started phase:
├── Gray circle
├── Muted text
└── Status text: "Not Started"
Blocked phase:
├── Red circle
├── Alert icon
└── Status text: "Blocked"

⸻

8. Current Phase Workspace

Component

<CurrentPhaseWorkspace />

Purpose

Explains what must be completed in the active phase.

Structure

CurrentPhaseWorkspace
├── CardTitle: "Current Phase Workspace"
├── InstructionText
├── InfoCallout
└── PhaseObjectiveBlock

Data Model

type CurrentPhaseWorkspaceData = {
  title: string;
  instructions: string;
  infoMessage: string;
  objectives: string[];
};

Example Data

const currentPhaseWorkspace: CurrentPhaseWorkspaceData = {
  title: "Current Phase Workspace",
  instructions:
    "Complete all required templates and checklist items, attach supporting evidence, and resolve validation warnings before submitting for Gate review.",
  infoMessage: "All items in this phase must be completed to submit to Gate G2.",
  objectives: [
    "Compare viable solution alternatives.",
    "Score options using defined evaluation criteria.",
    "Select and justify the recommended solution.",
    "Prepare evidence for feasibility approval.",
  ],
};

⸻

9. Required Templates

Component

<RequiredTemplates />

Purpose

Displays all templates required for the active phase and their completion status.

Structure

RequiredTemplates
├── CardHeader
│   ├── Title: "Required Templates"
│   ├── CountBadge: "3"
│   └── Create From Template Button
│
└── TemplateTable
    ├── Template
    ├── Description
    ├── Status
    ├── Progress
    ├── Last Updated
    └── Actions

Data Model

type RequiredTemplate = {
  id: string;
  templateCode: string;
  name: string;
  description: string;
  status:
    | "not_started"
    | "in_progress"
    | "completed"
    | "changes_requested";
  progressPercent: number;
  lastUpdatedLabel?: string;
  href: string;
};

Example Data

const requiredTemplates: RequiredTemplate[] = [
  {
    id: "a-3-1",
    templateCode: "A-3.1",
    name: "Solution Options Analysis",
    description:
      "Identify and analyze potential solution options against key criteria.",
    status: "completed",
    progressPercent: 100,
    lastUpdatedLabel: "May 12, 2024 · 2h ago",
    href: "/projects/sip-001/artifacts/a-3-1",
  },
  {
    id: "a-3-2",
    templateCode: "A-3.2",
    name: "Evaluation & Scoring Matrix",
    description:
      "Score and compare options using weighted evaluation criteria.",
    status: "in_progress",
    progressPercent: 60,
    lastUpdatedLabel: "May 12, 2024 · 1h ago",
    href: "/projects/sip-001/artifacts/a-3-2",
  },
  {
    id: "a-3-3",
    templateCode: "A-3.3",
    name: "Recommended Solution",
    description:
      "Document the recommended solution and justification.",
    status: "not_started",
    progressPercent: 0,
    href: "/projects/sip-001/artifacts/a-3-3",
  },
];

Row Actions

Required template row actions:
├── Open / View
├── Edit
├── Preview Markdown
├── View JSON Evidence
└── More Options

⸻

10. Evidence Attachments

Component

<EvidenceAttachments />

Purpose

Shows evidence attached to the active phase and required templates.

Structure

EvidenceAttachments
├── CardHeader
│   ├── Title: "Evidence Attachments"
│   ├── CountBadge
│   └── Add Evidence Button
│
└── EvidenceTable
    ├── Evidence Name
    ├── Type
    ├── Linked To
    ├── Added By
    ├── Added On
    └── Actions

Data Model

type EvidenceAttachment = {
  id: string;
  name: string;
  type:
    | "pdf"
    | "spreadsheet"
    | "document"
    | "image"
    | "link"
    | "json"
    | "markdown";
  linkedTo: string[];
  addedBy: string;
  addedOnLabel: string;
  href: string;
};

Example Data

const evidenceAttachments: EvidenceAttachment[] = [
  {
    id: "ev-001",
    name: "Market Research Report",
    type: "pdf",
    linkedTo: ["A-3.1"],
    addedBy: "Alex Developer",
    addedOnLabel: "May 12, 2024 · 2h ago",
    href: "/projects/sip-001/evidence/ev-001",
  },
  {
    id: "ev-002",
    name: "Vendor Comparison Spreadsheet",
    type: "spreadsheet",
    linkedTo: ["A-3.1", "A-3.2"],
    addedBy: "Alex Developer",
    addedOnLabel: "May 12, 2024 · 2h ago",
    href: "/projects/sip-001/evidence/ev-002",
  },
  {
    id: "ev-003",
    name: "Cost Estimation Summary",
    type: "document",
    linkedTo: ["A-3.2"],
    addedBy: "Alex Developer",
    addedOnLabel: "May 11, 2024 · 1d ago",
    href: "/projects/sip-001/evidence/ev-003",
  },
];

Row Actions

Evidence row actions:
├── Open
├── Download
├── Relink
├── Replace
└── Remove

⸻

11. Completion Checklist

Component

<CompletionChecklist />

Purpose

Shows whether the phase is ready for gate submission.

Structure

CompletionChecklist
├── CardHeader
│   ├── Title: "Completion Checklist"
│   └── Progress Label: "5 of 7 completed"
│
├── ProgressBar
└── ChecklistItems
    ├── ChecklistItem
    ├── ChecklistItem
    └── ...

Data Model

type ChecklistItem = {
  id: string;
  label: string;
  status: "complete" | "incomplete" | "blocked";
  required: boolean;
  href?: string;
};

Example Data

const checklistItems: ChecklistItem[] = [
  {
    id: "all-templates-created",
    label: "All required templates created",
    status: "complete",
    required: true,
  },
  {
    id: "a31-complete",
    label: "A-3.1 Solution Options Analysis completed",
    status: "complete",
    required: true,
    href: "/projects/sip-001/artifacts/a-3-1",
  },
  {
    id: "a32-complete",
    label: "A-3.2 Evaluation & Scoring Matrix completed",
    status: "incomplete",
    required: true,
    href: "/projects/sip-001/artifacts/a-3-2",
  },
  {
    id: "a33-complete",
    label: "A-3.3 Recommended Solution completed",
    status: "incomplete",
    required: true,
    href: "/projects/sip-001/artifacts/a-3-3",
  },
  {
    id: "evidence-attached",
    label: "All required evidence attached",
    status: "complete",
    required: true,
  },
  {
    id: "warnings-resolved",
    label: "Validation warnings resolved",
    status: "incomplete",
    required: true,
  },
  {
    id: "ready-for-gate",
    label: "Ready for Gate G2: Feasibility Approval",
    status: "incomplete",
    required: true,
  },
];

Computed Values

const completedCount = checklistItems.filter(
  (item) => item.status === "complete"
).length;
const totalCount = checklistItems.length;
const completionPercent = Math.round((completedCount / totalCount) * 100);
const canSubmitForGateReview =
  checklistItems.every((item) => item.status === "complete") &&
  validationWarnings.every((warning) => warning.severity !== "error");

⸻

12. Validation Warnings

Component

<ValidationWarnings />

Purpose

Shows warnings and blockers that prevent gate submission.

Structure

ValidationWarnings
├── CardHeader
│   ├── Title: "Validation Warnings"
│   ├── CountBadge
│   └── CollapseToggle
│
└── WarningList
    ├── WarningItem
    ├── WarningItem
    └── ...

Data Model

type ValidationWarning = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  relatedObjectType:
    | "template"
    | "artifact"
    | "evidence"
    | "gate"
    | "traceability";
  relatedObjectId?: string;
  href?: string;
};

Example Data

const validationWarnings: ValidationWarning[] = [
  {
    id: "warn-001",
    message: "A-3.2 is missing at least one scoring justification.",
    severity: "warning",
    relatedObjectType: "template",
    relatedObjectId: "a-3-2",
    href: "/projects/sip-001/artifacts/a-3-2",
  },
  {
    id: "warn-002",
    message: "A-3.3 recommended solution template has not been started.",
    severity: "warning",
    relatedObjectType: "template",
    relatedObjectId: "a-3-3",
    href: "/projects/sip-001/artifacts/a-3-3",
  },
  {
    id: "warn-003",
    message: "Cost estimation evidence is recommended.",
    severity: "info",
    relatedObjectType: "evidence",
    href: "/projects/sip-001/evidence",
  },
];

Severity Rules

const validationSeverityMap = {
  info: {
    tone: "blue",
    icon: InfoIcon,
  },
  warning: {
    tone: "amber",
    icon: AlertTriangleIcon,
  },
  error: {
    tone: "red",
    icon: AlertCircleIcon,
  },
};

⸻

13. Submit for Gate Review

Component

<SubmitGateReviewCard />

Purpose

Controls submission of the completed phase into the gate decision workflow.

Structure

SubmitGateReviewCard
├── Title: "Submit for Gate Review"
├── Description
├── PrimaryButton: "Submit for Gate Review"
├── SecondaryButton: "Save as Draft"
└── HelperText

Data Model

type GateSubmissionState = {
  gateCode: string;
  gateName: string;
  canSubmit: boolean;
  missingRequirements: string[];
  submitHref: string;
};

Example Data

const gateSubmissionState: GateSubmissionState = {
  gateCode: "G2",
  gateName: "Feasibility Approval",
  canSubmit: false,
  missingRequirements: [
    "A-3.2 Evaluation & Scoring Matrix is incomplete",
    "A-3.3 Recommended Solution has not been started",
    "Validation warnings remain unresolved",
  ],
  submitHref: "/projects/sip-001/gates/g2/submit",
};

Button Logic

const submitButtonDisabled = !gateSubmissionState.canSubmit;
const submitButtonLabel = gateSubmissionState.canSubmit
  ? "Submit for Gate Review"
  : "Resolve Required Items First";

Interaction Behavior

Click Submit for Gate Review:
├── If canSubmit = true
│   ├── Create GateSubmission record
│   ├── Snapshot current artifacts
│   ├── Snapshot evidence links
│   ├── Snapshot checklist state
│   └── Navigate to /projects/{projectId}/gates/{gateCode}/review
│
└── If canSubmit = false
    ├── Keep user on current screen
    ├── Highlight incomplete checklist items
    ├── Highlight validation warnings
    └── Show inline blocker message

⸻

14. Next Required Action Bar

Component

<NextRequiredActionBar />

Purpose

Persistent bottom action bar that tells the user what to do next.

Structure

NextRequiredActionBar
├── Icon
├── Label: "Next Required Action"
├── Description
└── CTA Button

Data Model

type NextRequiredAction = {
  label: string;
  description: string;
  ctaLabel: string;
  href: string;
};

Example Data

const nextRequiredAction: NextRequiredAction = {
  label: "Next Required Action",
  description:
    "Complete the pending template items in this phase and submit Gate G2 review.",
  ctaLabel: "Go to Next Incomplete Item",
  href: "/projects/sip-001/artifacts/a-3-2",
};

⸻

15. Recommended Component Tree

<LifecycleWorkspacePage>
  <AppShell>
    <Sidebar />
    <MainArea>
      <TopHeader title="Lifecycle Workspace" />
      <WorkspaceContent>
        <Breadcrumbs />
        <PhaseHeader />
        <WorkspaceGrid>
          <PhaseNavigatorPanel>
            <PhaseNavigator />
          </PhaseNavigatorPanel>
          <CurrentPhaseMainPanel>
            <CurrentPhaseWorkspace />
            <RequiredTemplates />
            <EvidenceAttachments />
          </CurrentPhaseMainPanel>
          <ReviewStatusPanel>
            <CompletionChecklist />
            <ValidationWarnings />
            <SubmitGateReviewCard />
          </ReviewStatusPanel>
        </WorkspaceGrid>
        <NextRequiredActionBar />
      </WorkspaceContent>
    </MainArea>
  </AppShell>
</LifecycleWorkspacePage>

⸻

16. Recommended File Structure

src/
├── app/
│   └── projects/
│       └── [projectId]/
│           └── workspace/
│               └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopHeader.tsx
│   │   └── MainArea.tsx
│   │
│   ├── lifecycle-workspace/
│   │   ├── WorkspaceContent.tsx
│   │   ├── PhaseHeader.tsx
│   │   ├── WorkspaceGrid.tsx
│   │   ├── PhaseNavigator.tsx
│   │   ├── PhaseNavigatorPanel.tsx
│   │   ├── CurrentPhaseWorkspace.tsx
│   │   ├── RequiredTemplates.tsx
│   │   ├── EvidenceAttachments.tsx
│   │   ├── CompletionChecklist.tsx
│   │   ├── ValidationWarnings.tsx
│   │   ├── SubmitGateReviewCard.tsx
│   │   └── NextRequiredActionBar.tsx
│   │
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       ├── table.tsx
│       ├── tooltip.tsx
│       └── alert.tsx
│
├── data/
│   └── lifecycle-workspace.mock.ts
│
├── types/
│   └── lifecycle-workspace.types.ts
│
└── lib/
    ├── lifecycle-status.ts
    ├── gate-readiness.ts
    └── formatters.ts

⸻

17. Workspace Data Contract

export type LifecycleWorkspaceData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  phaseHeader: PhaseHeaderData;
  phaseNavigatorItems: PhaseNavItem[];
  currentPhaseWorkspace: CurrentPhaseWorkspaceData;
  requiredTemplates: RequiredTemplate[];
  evidenceAttachments: EvidenceAttachment[];
  checklistItems: ChecklistItem[];
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
  nextRequiredAction: NextRequiredAction;
};

⸻

18. Status Badge Rules

const workspaceStatusBadgeMap = {
  not_started: {
    label: "Not Started",
    tone: "gray",
  },
  in_progress: {
    label: "In Progress",
    tone: "blue",
  },
  completed: {
    label: "Completed",
    tone: "green",
  },
  ready_for_review: {
    label: "Ready for Review",
    tone: "purple",
  },
  approved: {
    label: "Approved",
    tone: "green",
  },
  blocked: {
    label: "Blocked",
    tone: "red",
  },
  changes_requested: {
    label: "Changes Requested",
    tone: "red",
  },
};

⸻

19. Interaction Requirements

Lifecycle Workspace interactions:
1. Click phase in Phase Navigator
   → Navigate to /projects/{projectId}/workspace?phase={phaseNumber}
2. Click "View Full Timeline"
   → Navigate to /projects/{projectId}?tab=lifecycle_timeline
3. Click "Create from Template"
   → Navigate to /projects/{projectId}/templates/new?phase={phaseNumber}
4. Click template row
   → Navigate to /projects/{projectId}/artifacts/{artifactId}
5. Click template row edit action
   → Navigate to /projects/{projectId}/artifacts/{artifactId}/edit
6. Click "Add Evidence"
   → Open evidence attachment modal
   OR navigate to /projects/{projectId}/evidence/new
7. Click evidence row
   → Navigate to /projects/{projectId}/evidence/{evidenceId}
8. Click checklist item
   → Navigate to related artifact, evidence, or gate when href exists
9. Click validation warning
   → Navigate to related object requiring correction
10. Click "Save as Draft"
    → Save current phase state without gate submission
11. Click "Submit for Gate Review"
    → If ready, create gate submission and navigate to gate review
    → If not ready, show blockers and keep user on workspace
12. Click "Go to Next Incomplete Item"
    → Navigate to highest-priority incomplete template/checklist item

⸻

20. Visual Design Tokens

const lifecycleWorkspaceTokens = {
  layout: {
    sidebarWidth: "280px",
    headerHeight: "76px",
    phaseNavigatorWidth: "300px",
    rightPanelWidth: "360px",
    pagePadding: "32px",
    cardRadius: "16px",
    cardGap: "20px",
  },
  colors: {
    appBackground: "#f8fafc",
    surface: "#ffffff",
    sidebar: "#07111f",
    sidebarMuted: "#0f1b2d",
    border: "#e5e7eb",
    selectedBorder: "#2563eb",
    selectedBackground: "#eff6ff",
    textPrimary: "#111827",
    textSecondary: "#475569",
    textMuted: "#64748b",
    blue: "#2563eb",
    green: "#16a34a",
    amber: "#f59e0b",
    red: "#dc2626",
    purple: "#7c3aed",
    gray: "#94a3b8",
  },
  typography: {
    pageTitle: "24px / 32px, font-weight 700",
    phaseTitle: "24px / 32px, font-weight 700",
    cardTitle: "16px / 24px, font-weight 600",
    sectionTitle: "14px / 22px, font-weight 600",
    body: "14px / 22px, font-weight 400",
    caption: "12px / 18px, font-weight 400",
  },
};

⸻

21. Accessibility Requirements

Accessibility requirements:
1. Phase Navigator must be keyboard navigable.
2. Current phase item must expose aria-current="step".
3. Checklist items must include visible text status, not color only.
4. Progress bars must expose aria-valuenow, aria-valuemin, and aria-valuemax.
5. Icon-only action buttons must include aria-label.
6. Tables must use semantic table markup.
7. Validation warnings must use alert semantics when blocking.
8. Disabled submit button must expose the reason through helper text.
9. Focus must move to validation summary after failed submission attempt.
10. All interactive rows must have visible hover and focus states.

⸻

22. Empty States

Empty state behavior:
No phase selected:
├── Redirect to current active phase
└── If no active phase exists, open Phase 1
No required templates:
├── Show message: "No templates are required for this phase"
└── Hide template table actions unless optional templates are allowed
No evidence attachments:
├── Show message: "No evidence attached yet"
└── CTA: "Add Evidence"
No validation warnings:
├── Show success message: "No validation warnings"
└── Use green success tone
No checklist items:
├── Show configuration warning
└── Message: "This phase has no completion checklist configured"
Gate already submitted:
├── Replace submit card with gate review status
└── CTA: "Open Gate Review"

⸻

23. Loading and Error States

Loading:
├── App shell loads immediately
├── Phase header shows skeleton
├── Phase navigator shows skeleton phase rows
├── Template and evidence tables show row skeletons
└── Right panel cards show compact skeleton blocks
Error:
├── Show inline error banner above WorkspaceGrid
├── Keep sidebar and header usable
├── Provide retry action
└── Preserve project context if available

⸻

24. Agent Build Instruction

Build the Lifecycle Workspace screen as a responsive authenticated SaaS execution page.
Use:
├── Fixed dark sidebar
├── White top header
├── Breadcrumbs
├── Large phase header
├── Three-column workspace grid
├── Left Phase Navigator
├── Center Current Phase Workspace
├── Center Required Templates table
├── Center Evidence Attachments table
├── Right Completion Checklist
├── Right Validation Warnings
├── Right Submit for Gate Review card
└── Bottom Next Required Action bar
The screen must communicate:
├── Which lifecycle phase is active
├── Which phase tasks are complete
├── Which templates are required
├── Which evidence is attached
├── Which checklist items remain
├── Which validation warnings block submission
└── Whether the phase can be submitted for gate review

Final visual hierarchy:

1. Navigation shell
2. Project and phase context
3. Phase navigator
4. Current phase objective
5. Required templates
6. Evidence attachments
7. Completion checklist
8. Validation warnings
9. Submit for gate review
10. Next required action




┌──────────────────────────────────────────────────────────────────────────────┐
│ TEMPLATE WIZARD SCREEN — TECHNICAL IMPLEMENTATION SPECIFICATION             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. SCREEN IDENTITY                                                            │
│                                                                              │
│ screen: "Template Wizard"                                                     │
│ route: "/projects/[projectId]/templates/[templateId]"                         │
│ layoutType: "authenticated-app-shell"                                         │
│ primaryPurpose: "Guided template completion, validation, preview, evidence,   │
│ and artifact export workflow."                                                │
│                                                                              │
│ The Template Wizard is the controlled form-building and artifact-generation   │
│ screen. It allows the user to select a lifecycle template, complete it one    │
│ section at a time, validate required fields, preview generated Markdown,      │
│ preview JSON evidence, and save/export the finished artifact.                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. REQUIRED SCREEN AREAS                                                      │
│                                                                              │
│ Template Wizard                                                               │
│ │                                                                            │
│ ├── Template Selection                                                        │
│ ├── Dynamic Form                                                              │
│ ├── Section-by-Section Editor                                                 │
│ ├── Validation Panel                                                          │
│ ├── Markdown Preview                                                          │
│ ├── JSON Evidence Preview                                                     │
│ └── Export / Save Artifact                                                    │
│                                                                              │
│ Implementation Mapping:                                                       │
│                                                                              │
│ Template Selection         → Header/sidebar template selector                 │
│ Dynamic Form               → Form generated from template schema              │
│ Section-by-Section Editor  → Left/center section navigator + active editor    │
│ Validation Panel           → Right-side validation status and errors          │
│ Markdown Preview           → Preview tab/panel showing rendered artifact      │
│ JSON Evidence Preview      → Preview tab/panel showing structured evidence    │
│ Export / Save Artifact     → Footer or right action panel                     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. HIGH-LEVEL LAYOUT STRUCTURE                                                │
│                                                                              │
│ TemplateWizardPage                                                            │
│ │                                                                            │
│ ├── AppShell                                                                  │
│ │   ├── Sidebar                                                               │
│ │   └── MainArea                                                              │
│ │       ├── TopHeader                                                         │
│ │       └── TemplateWizardContent                                             │
│ │           ├── Breadcrumbs                                                   │
│ │           ├── WizardHeader                                                  │
│ │           ├── WizardGrid                                                    │
│ │           │   ├── TemplateSelectionPanel                                    │
│ │           │   ├── SectionEditorPanel                                        │
│ │           │   └── ValidationPreviewPanel                                    │
│ │           └── WizardActionBar                                               │
│                                                                              │
│ Three-column working model:                                                   │
│                                                                              │
│ Left Column   → Template Selection + Section Navigator                        │
│ Center Column → Dynamic Form + Section-by-Section Editor                      │
│ Right Column  → Validation Panel + Markdown Preview + JSON Evidence Preview   │
│ Bottom Bar    → Save Draft / Export Markdown / Export JSON / Save Artifact    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. PAGE LAYOUT GRID                                                           │
│                                                                              │
│ .template-wizard {                                                            │
│   display: grid;                                                              │
│   grid-template-columns: 300px minmax(0, 1fr) 420px;                          │
│   gap: 20px;                                                                  │
│   padding: 24px 32px 96px;                                                    │
│   background: #f8fafc;                                                        │
│   min-height: calc(100vh - 76px);                                             │
│ }                                                                            │
│                                                                              │
│ .template-selection-panel,                                                    │
│ .section-editor-panel,                                                        │
│ .validation-preview-panel {                                                   │
│   min-width: 0;                                                               │
│ }                                                                            │
│                                                                              │
│ .section-editor-panel {                                                       │
│   display: flex;                                                              │
│   flex-direction: column;                                                     │
│   gap: 20px;                                                                  │
│ }                                                                            │
│                                                                              │
│ .validation-preview-panel {                                                   │
│   display: flex;                                                              │
│   flex-direction: column;                                                     │
│   gap: 20px;                                                                  │
│ }                                                                            │
│                                                                              │
│ .wizard-action-bar {                                                          │
│   position: sticky;                                                           │
│   bottom: 0;                                                                  │
│   display: flex;                                                              │
│   justify-content: space-between;                                             │
│   align-items: center;                                                        │
│   padding: 16px 32px;                                                         │
│   background: #ffffff;                                                        │
│   border-top: 1px solid #e5e7eb;                                              │
│   box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06);                             │
│ }                                                                            │
│                                                                              │
│ Responsive Behavior:                                                          │
│                                                                              │
│ @media (max-width: 1280px) {                                                  │
│   .template-wizard {                                                          │
│     grid-template-columns: 280px minmax(0, 1fr);                              │
│   }                                                                          │
│                                                                              │
│   .validation-preview-panel {                                                 │
│     grid-column: 1 / -1;                                                      │
│     display: grid;                                                           │
│     grid-template-columns: repeat(3, minmax(0, 1fr));                         │
│   }                                                                          │
│ }                                                                            │
│                                                                              │
│ @media (max-width: 900px) {                                                   │
│   .template-wizard {                                                          │
│     grid-template-columns: 1fr;                                               │
│     padding: 20px 20px 112px;                                                 │
│   }                                                                          │
│                                                                              │
│   .validation-preview-panel {                                                 │
│     display: flex;                                                           │
│     flex-direction: column;                                                   │
│   }                                                                          │
│                                                                              │
│   .wizard-action-bar {                                                        │
│     flex-direction: column;                                                   │
│     align-items: stretch;                                                     │
│     gap: 12px;                                                               │
│   }                                                                          │
│ }                                                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5. TOP HEADER                                                                 │
│                                                                              │
│ Component: <TopHeader title="Template Wizard" />                              │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ TopHeader                                                                     │
│ ├── SidebarToggle                                                             │
│ ├── PageTitle: "Template Wizard"                                              │
│ ├── AutosaveStatus                                                            │
│ ├── ThemeToggle                                                               │
│ ├── Notifications                                                             │
│ ├── Help                                                                      │
│ └── UserMenu                                                                  │
│                                                                              │
│ Breadcrumbs:                                                                  │
│                                                                              │
│ <Breadcrumbs                                                                  │
│   items={[                                                                    │
│     { label: "Projects", href: "/projects" },                                │
│     { label: "Secure Identity Platform", href: "/projects/sip-001" },        │
│     { label: "Lifecycle Workspace", href: "/projects/sip-001/workspace" },   │
│     { label: "Template Wizard" }                                              │
│   ]}                                                                          │
│ />                                                                            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 6. WIZARD HEADER                                                              │
│                                                                              │
│ Component: <WizardHeader />                                                   │
│                                                                              │
│ Purpose:                                                                      │
│ Shows selected template identity, lifecycle phase, artifact status, version,  │
│ completion percentage, and output readiness.                                  │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ WizardHeader                                                                  │
│ ├── TemplateIcon                                                              │
│ ├── TemplateTitleBlock                                                        │
│ │   ├── Template Code: "A-3.2"                                                │
│ │   ├── Template Name: "Evaluation & Scoring Matrix"                         │
│ │   ├── Status Badge: "In Progress"                                          │
│ │   └── Template Purpose Text                                                 │
│ │                                                                            │
│ ├── TemplateMetadataRow                                                       │
│ │   ├── Project                                                               │
│ │   ├── Phase                                                                 │
│ │   ├── Owner                                                                 │
│ │   ├── Version                                                               │
│ │   └── Last Saved                                                            │
│ │                                                                            │
│ └── CompletionRing                                                            │
│     ├── Percent: 60%                                                          │
│     └── Label: Complete                                                       │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type WizardHeaderData = {                                                     │
│   projectId: string;                                                          │
│   projectName: string;                                                        │
│   templateId: string;                                                         │
│   templateCode: string;                                                       │
│   templateName: string;                                                       │
│   phaseNumber: number;                                                        │
│   phaseName: string;                                                          │
│   status:                                                                     │
│     | "not_started"                                                          │
│     | "in_progress"                                                          │
│     | "complete"                                                             │
│     | "in_review"                                                            │
│     | "approved"                                                             │
│     | "changes_requested";                                                   │
│   purpose: string;                                                            │
│   ownerName: string;                                                          │
│   version: string;                                                            │
│   lastSavedLabel?: string;                                                    │
│   completionPercent: number;                                                  │
│ };                                                                           │
│                                                                              │
│ Example Data:                                                                 │
│                                                                              │
│ const wizardHeader: WizardHeaderData = {                                      │
│   projectId: "sip-001",                                                       │
│   projectName: "Secure Identity Platform",                                   │
│   templateId: "a-3-2",                                                        │
│   templateCode: "A-3.2",                                                      │
│   templateName: "Evaluation & Scoring Matrix",                               │
│   phaseNumber: 3,                                                             │
│   phaseName: "Evaluation & Selection",                                       │
│   status: "in_progress",                                                     │
│   purpose: "Score and compare solution options using weighted criteria,       │
│   evidence, assumptions, and decision rationale.",                            │
│   ownerName: "Alex Developer",                                               │
│   version: "v0.3",                                                           │
│   lastSavedLabel: "Saved 2 minutes ago",                                      │
│   completionPercent: 60,                                                      │
│ };                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 7. TEMPLATE SELECTION                                                         │
│                                                                              │
│ Component: <TemplateSelectionPanel />                                         │
│                                                                              │
│ Purpose:                                                                      │
│ Lets the user select or switch between available templates for the active     │
│ lifecycle phase.                                                              │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ TemplateSelectionPanel                                                        │
│ ├── PanelHeader                                                               │
│ │   ├── Title: "Template Selection"                                          │
│ │   └── Phase Badge: "Phase 3"                                               │
│ │                                                                            │
│ ├── TemplateSearch                                                            │
│ ├── TemplateList                                                              │
│ │   ├── TemplateSelectionItem                                                 │
│ │   ├── TemplateSelectionItem                                                 │
│ │   └── ...                                                                   │
│ │                                                                            │
│ └── SectionNavigator                                                          │
│     ├── SectionNavItem                                                        │
│     ├── SectionNavItem                                                        │
│     └── ...                                                                   │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type TemplateSelectionItem = {                                                │
│   id: string;                                                                 │
│   templateCode: string;                                                       │
│   name: string;                                                               │
│   required: boolean;                                                          │
│   status: "not_started" | "in_progress" | "complete" | "approved";          │
│   completionPercent: number;                                                  │
│   href: string;                                                               │
│ };                                                                           │
│                                                                              │
│ Example Data:                                                                 │
│                                                                              │
│ const templateSelections: TemplateSelectionItem[] = [                         │
│   {                                                                           │
│     id: "a-3-1",                                                              │
│     templateCode: "A-3.1",                                                    │
│     name: "Solution Options Analysis",                                       │
│     required: true,                                                           │
│     status: "complete",                                                      │
│     completionPercent: 100,                                                   │
│     href: "/projects/sip-001/templates/a-3-1",                               │
│   },                                                                          │
│   {                                                                           │
│     id: "a-3-2",                                                              │
│     templateCode: "A-3.2",                                                    │
│     name: "Evaluation & Scoring Matrix",                                     │
│     required: true,                                                           │
│     status: "in_progress",                                                   │
│     completionPercent: 60,                                                    │
│     href: "/projects/sip-001/templates/a-3-2",                               │
│   },                                                                          │
│   {                                                                           │
│     id: "a-3-3",                                                              │
│     templateCode: "A-3.3",                                                    │
│     name: "Recommended Solution",                                            │
│     required: true,                                                           │
│     status: "not_started",                                                   │
│     completionPercent: 0,                                                     │
│     href: "/projects/sip-001/templates/a-3-3",                               │
│   },                                                                          │
│ ];                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 8. SECTION-BY-SECTION EDITOR                                                  │
│                                                                              │
│ Component: <SectionNavigator />                                               │
│ Component: <SectionEditorPanel />                                             │
│                                                                              │
│ Purpose:                                                                      │
│ Breaks the template into manageable sections and allows the user to complete  │
│ one section at a time.                                                        │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ SectionEditorPanel                                                            │
│ ├── ActiveSectionHeader                                                       │
│ │   ├── Section Number                                                        │
│ │   ├── Section Title                                                         │
│ │   ├── Required Badge                                                        │
│ │   └── Section Status                                                        │
│ │                                                                            │
│ ├── DynamicForm                                                               │
│ │   ├── Generated Input Fields                                                │
│ │   ├── Generated Textareas                                                   │
│ │   ├── Generated Select Controls                                             │
│ │   ├── Generated Checklist Fields                                            │
│ │   ├── Generated Evidence Link Controls                                      │
│ │   └── Generated Notes Fields                                                │
│ │                                                                            │
│ └── SectionNavigationControls                                                 │
│     ├── Previous Section                                                      │
│     ├── Save Section                                                          │
│     └── Next Section                                                          │
│                                                                              │
│ Section Data Model:                                                           │
│                                                                              │
│ type TemplateSection = {                                                      │
│   id: string;                                                                 │
│   order: number;                                                              │
│   title: string;                                                              │
│   description?: string;                                                       │
│   required: boolean;                                                          │
│   status: "not_started" | "in_progress" | "complete" | "invalid";           │
│   fields: DynamicField[];                                                     │
│ };                                                                           │
│                                                                              │
│ type DynamicField = {                                                         │
│   id: string;                                                                 │
│   name: string;                                                               │
│   label: string;                                                              │
│   type:                                                                       │
│     | "text"                                                                 │
│     | "textarea"                                                             │
│     | "number"                                                               │
│     | "select"                                                               │
│     | "multiselect"                                                          │
│     | "checkbox"                                                             │
│     | "date"                                                                 │
│     | "evidence_link"                                                        │
│     | "table"                                                                │
│     | "score_matrix";                                                        │
│   required: boolean;                                                          │
│   placeholder?: string;                                                       │
│   helpText?: string;                                                          │
│   options?: { label: string; value: string }[];                               │
│   validation?: {                                                              │
│     minLength?: number;                                                       │
│     maxLength?: number;                                                       │
│     min?: number;                                                             │
│     max?: number;                                                             │
│     pattern?: string;                                                         │
│   };                                                                          │
│ };                                                                           │
│                                                                              │
│ Example Sections:                                                             │
│                                                                              │
│ const templateSections: TemplateSection[] = [                                 │
│   {                                                                           │
│     id: "section-1",                                                          │
│     order: 1,                                                                 │
│     title: "Evaluation Criteria",                                             │
│     description: "Define the criteria used to compare solution options.",     │
│     required: true,                                                           │
│     status: "complete",                                                      │
│     fields: [                                                                 │
│       {                                                                       │
│         id: "criteria-summary",                                               │
│         name: "criteriaSummary",                                              │
│         label: "Criteria Summary",                                            │
│         type: "textarea",                                                     │
│         required: true,                                                       │
│         placeholder: "Describe the evaluation criteria...",                   │
│       },                                                                      │
│     ],                                                                         │
│   },                                                                          │
│   {                                                                           │
│     id: "section-2",                                                          │
│     order: 2,                                                                 │
│     title: "Scoring Matrix",                                                  │
│     description: "Score each option against the weighted criteria.",          │
│     required: true,                                                           │
│     status: "in_progress",                                                   │
│     fields: [                                                                 │
│       {                                                                       │
│         id: "score-matrix",                                                   │
│         name: "scoreMatrix",                                                  │
│         label: "Weighted Scoring Matrix",                                     │
│         type: "score_matrix",                                                 │
│         required: true,                                                       │
│       },                                                                      │
│     ],                                                                         │
│   },                                                                          │
│ ];                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 9. DYNAMIC FORM                                                               │
│                                                                              │
│ Component: <DynamicForm />                                                    │
│                                                                              │
│ Purpose:                                                                      │
│ Renders form controls from the selected template schema.                      │
│                                                                              │
│ Props:                                                                        │
│                                                                              │
│ type DynamicFormProps = {                                                     │
│   section: TemplateSection;                                                   │
│   values: Record<string, unknown>;                                            │
│   errors: Record<string, string>;                                             │
│   onChange: (fieldName: string, value: unknown) => void;                      │
│   onBlur?: (fieldName: string) => void;                                       │
│ };                                                                           │
│                                                                              │
│ Form Behavior:                                                                │
│                                                                              │
│ ├── Render fields in schema order                                             │
│ ├── Mark required fields visually                                             │
│ ├── Validate on blur                                                          │
│ ├── Validate current section before moving next                               │
│ ├── Autosave draft after debounce                                             │
│ ├── Preserve partial answers                                                  │
│ ├── Support evidence links inside fields                                      │
│ └── Update Markdown/JSON previews after form changes                          │
│                                                                              │
│ Required Field Rendering Rules:                                               │
│                                                                              │
│ Text field       → Input                                                      │
│ Textarea         → Large textarea with character guidance                     │
│ Number           → Numeric input                                              │
│ Select           → Single select dropdown                                     │
│ Multiselect      → Multi-option selector                                      │
│ Checkbox         → Checkbox with label                                        │
│ Date             → Date picker                                                │
│ Evidence Link    → Evidence selector modal/button                            │
│ Table            → Editable table                                             │
│ Score Matrix     → Criteria/options scoring grid                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 10. VALIDATION PANEL                                                          │
│                                                                              │
│ Component: <ValidationPanel />                                                │
│                                                                              │
│ Purpose:                                                                      │
│ Shows completion status, missing required fields, warnings, errors, and       │
│ readiness to save/export artifact.                                            │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ ValidationPanel                                                               │
│ ├── CardHeader                                                                │
│ │   ├── Title: "Validation Panel"                                            │
│ │   ├── Status Badge                                                          │
│ │   └── Completion Percent                                                    │
│ │                                                                            │
│ ├── ValidationSummary                                                         │
│ │   ├── Required Fields Complete                                              │
│ │   ├── Sections Complete                                                     │
│ │   ├── Evidence Links Complete                                               │
│ │   └── Export Ready                                                          │
│ │                                                                            │
│ └── ValidationIssueList                                                       │
│     ├── ValidationIssue                                                       │
│     ├── ValidationIssue                                                       │
│     └── ...                                                                   │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type ValidationIssue = {                                                      │
│   id: string;                                                                 │
│   severity: "info" | "warning" | "error";                                  │
│   sectionId?: string;                                                         │
│   fieldName?: string;                                                         │
│   message: string;                                                            │
│   href?: string;                                                              │
│ };                                                                           │
│                                                                              │
│ type ValidationSummary = {                                                    │
│   completionPercent: number;                                                  │
│   requiredFieldsTotal: number;                                                │
│   requiredFieldsComplete: number;                                             │
│   sectionsTotal: number;                                                      │
│   sectionsComplete: number;                                                   │
│   evidenceLinksRequired: number;                                              │
│   evidenceLinksComplete: number;                                              │
│   exportReady: boolean;                                                       │
│   issues: ValidationIssue[];                                                  │
│ };                                                                           │
│                                                                              │
│ Example Data:                                                                 │
│                                                                              │
│ const validationSummary: ValidationSummary = {                                │
│   completionPercent: 60,                                                      │
│   requiredFieldsTotal: 18,                                                    │
│   requiredFieldsComplete: 11,                                                 │
│   sectionsTotal: 6,                                                           │
│   sectionsComplete: 3,                                                        │
│   evidenceLinksRequired: 2,                                                   │
│   evidenceLinksComplete: 1,                                                   │
│   exportReady: false,                                                         │
│   issues: [                                                                   │
│     {                                                                         │
│       id: "issue-001",                                                        │
│       severity: "warning",                                                   │
│       sectionId: "section-2",                                                 │
│       fieldName: "scoreMatrix",                                               │
│       message: "At least one score justification is missing.",                │
│     },                                                                        │
│     {                                                                         │
│       id: "issue-002",                                                        │
│       severity: "error",                                                     │
│       sectionId: "section-4",                                                 │
│       fieldName: "recommendedOption",                                         │
│       message: "Recommended option is required before export.",               │
│     },                                                                        │
│   ],                                                                          │
│ };                                                                           │
│                                                                              │
│ Validation Rules:                                                             │
│                                                                              │
│ ├── Required fields must be completed                                         │
│ ├── Required sections must be complete                                        │
│ ├── Required evidence must be linked                                          │
│ ├── Score matrices must include rationale                                     │
│ ├── Markdown output must be generated without missing placeholders            │
│ ├── JSON evidence must include project, phase, template, and artifact IDs     │
│ └── Export is blocked when any severity="error" issue exists                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 11. MARKDOWN PREVIEW                                                          │
│                                                                              │
│ Component: <MarkdownPreview />                                                │
│                                                                              │
│ Purpose:                                                                      │
│ Shows the generated Markdown artifact based on current form values.           │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ MarkdownPreview                                                               │
│ ├── CardHeader                                                                │
│ │   ├── Title: "Markdown Preview"                                            │
│ │   ├── Regenerate Button                                                     │
│ │   └── Copy Markdown Button                                                  │
│ │                                                                            │
│ └── MarkdownRenderArea                                                        │
│     ├── Artifact Title                                                        │
│     ├── Metadata Block                                                        │
│     ├── Generated Sections                                                    │
│     └── Validation Footer                                                     │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type MarkdownPreviewData = {                                                  │
│   artifactTitle: string;                                                      │
│   markdown: string;                                                           │
│   generatedAtLabel: string;                                                   │
│   hasMissingPlaceholders: boolean;                                            │
│ };                                                                           │
│                                                                              │
│ Markdown Rendering Rules:                                                     │
│                                                                              │
│ ├── Preserve template section order                                           │
│ ├── Include artifact metadata header                                          │
│ ├── Include project ID, phase ID, template ID, version, and status            │
│ ├── Render empty required fields as validation markers, not silent blanks     │
│ ├── Do not export final artifact while required markers remain                │
│ └── Support copy-to-clipboard                                                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 12. JSON EVIDENCE PREVIEW                                                     │
│                                                                              │
│ Component: <JsonEvidencePreview />                                            │
│                                                                              │
│ Purpose:                                                                      │
│ Shows the structured JSON evidence generated from the template form.          │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ JsonEvidencePreview                                                           │
│ ├── CardHeader                                                                │
│ │   ├── Title: "JSON Evidence Preview"                                       │
│ │   ├── Validate JSON Button                                                  │
│ │   └── Copy JSON Button                                                      │
│ │                                                                            │
│ └── CodePreviewArea                                                           │
│     └── PrettyPrintedJSON                                                     │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type JsonEvidence = {                                                         │
│   artifactId: string;                                                         │
│   projectId: string;                                                          │
│   phaseId: string;                                                            │
│   phaseNumber: number;                                                        │
│   templateId: string;                                                         │
│   templateCode: string;                                                       │
│   templateVersion: string;                                                    │
│   artifactVersion: string;                                                    │
│   status: string;                                                             │
│   generatedAt: string;                                                        │
│   generatedBy: string;                                                        │
│   sections: {                                                                 │
│     sectionId: string;                                                        │
│     title: string;                                                            │
│     status: string;                                                           │
│     values: Record<string, unknown>;                                          │
│   }[];                                                                        │
│   validation: {                                                               │
│     completionPercent: number;                                                │
│     exportReady: boolean;                                                     │
│     issues: ValidationIssue[];                                                │
│   };                                                                          │
│   evidenceLinks: {                                                            │
│     evidenceId: string;                                                       │
│     linkedToSectionId?: string;                                               │
│     linkedToFieldName?: string;                                               │
│   }[];                                                                        │
│ };                                                                           │
│                                                                              │
│ JSON Evidence Rules:                                                          │
│                                                                              │
│ ├── Must include stable artifact identity                                     │
│ ├── Must include project, phase, and template references                      │
│ ├── Must include schema/template version                                      │
│ ├── Must include validation results                                           │
│ ├── Must include evidence links                                               │
│ ├── Must be deterministic for the same form state                             │
│ └── Must be exportable as .json                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 13. EXPORT / SAVE ARTIFACT                                                    │
│                                                                              │
│ Component: <WizardActionBar />                                                │
│ Component: <ExportSaveArtifactPanel />                                        │
│                                                                              │
│ Purpose:                                                                      │
│ Controls draft save, final save, Markdown export, JSON evidence export, and   │
│ artifact registration.                                                        │
│                                                                              │
│ Structure:                                                                    │
│                                                                              │
│ WizardActionBar                                                               │
│ ├── AutosaveStatus                                                            │
│ ├── SecondaryActions                                                          │
│ │   ├── Save Draft                                                            │
│ │   ├── Export Markdown                                                       │
│ │   └── Export JSON Evidence                                                  │
│ │                                                                            │
│ └── PrimaryActions                                                            │
│     ├── Save Artifact                                                         │
│     └── Mark Complete                                                         │
│                                                                              │
│ Data Model:                                                                   │
│                                                                              │
│ type ArtifactSaveState = {                                                    │
│   artifactId?: string;                                                        │
│   templateId: string;                                                         │
│   projectId: string;                                                          │
│   phaseId: string;                                                            │
│   status: "draft" | "in_progress" | "complete" | "exported";               │
│   canSave: boolean;                                                           │
│   canExportMarkdown: boolean;                                                 │
│   canExportJson: boolean;                                                     │
│   canMarkComplete: boolean;                                                   │
│   blockers: string[];                                                         │
│ };                                                                           │
│                                                                              │
│ Example Data:                                                                 │
│                                                                              │
│ const artifactSaveState: ArtifactSaveState = {                                │
│   artifactId: "artifact-a-3-2",                                               │
│   templateId: "a-3-2",                                                        │
│   projectId: "sip-001",                                                       │
│   phaseId: "phase-3",                                                         │
│   status: "in_progress",                                                     │
│   canSave: true,                                                              │
│   canExportMarkdown: true,                                                    │
│   canExportJson: true,                                                        │
│   canMarkComplete: false,                                                     │
│   blockers: [                                                                 │
│     "Recommended option is required.",                                       │
│     "One scoring justification is missing."                                  │
│   ],                                                                          │
│ };                                                                           │
│                                                                              │
│ Button Logic:                                                                 │
│                                                                              │
│ Save Draft:                                                                   │
│ ├── Always enabled after form has changes                                     │
│ ├── Saves partial values                                                      │
│ └── Does not require validation success                                       │
│                                                                              │
│ Export Markdown:                                                              │
│ ├── Enabled when Markdown can be generated                                    │
│ ├── Warns if incomplete                                                       │
│ └── Downloads .md file                                                        │
│                                                                              │
│ Export JSON Evidence:                                                         │
│ ├── Enabled when JSON evidence object is valid                                │
│ ├── Downloads .json file                                                      │
│ └── Includes validation state                                                 │
│                                                                              │
│ Save Artifact:                                                                │
│ ├── Persists artifact record                                                  │
│ ├── Persists Markdown content                                                 │
│ ├── Persists JSON evidence                                                    │
│ └── Updates artifact version                                                  │
│                                                                              │
│ Mark Complete:                                                                │
│ ├── Disabled if validation errors exist                                       │
│ ├── Requires required fields completed                                        │
│ ├── Requires required evidence links                                          │
│ └── Sets artifact status to "complete"                                        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 14. RECOMMENDED COMPONENT TREE                                                │
│                                                                              │
│ <TemplateWizardPage>                                                          │
│   <AppShell>                                                                  │
│     <Sidebar />                                                               │
│     <MainArea>                                                                │
│       <TopHeader title="Template Wizard" />                                   │
│                                                                              │
│       <TemplateWizardContent>                                                 │
│         <Breadcrumbs />                                                       │
│         <WizardHeader />                                                      │
│                                                                              │
│         <WizardGrid>                                                          │
│           <TemplateSelectionPanel>                                            │
│             <TemplateSearch />                                                │
│             <TemplateSelectionList />                                         │
│             <SectionNavigator />                                              │
│           </TemplateSelectionPanel>                                           │
│                                                                              │
│           <SectionEditorPanel>                                                │
│             <ActiveSectionHeader />                                           │
│             <DynamicForm />                                                   │
│             <SectionNavigationControls />                                     │
│           </SectionEditorPanel>                                               │
│                                                                              │
│           <ValidationPreviewPanel>                                            │
│             <ValidationPanel />                                               │
│             <MarkdownPreview />                                               │
│             <JsonEvidencePreview />                                           │
│           </ValidationPreviewPanel>                                           │
│         </WizardGrid>                                                         │
│                                                                              │
│         <WizardActionBar />                                                   │
│       </TemplateWizardContent>                                                │
│     </MainArea>                                                               │
│   </AppShell>                                                                 │
│ </TemplateWizardPage>                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 15. RECOMMENDED FILE STRUCTURE                                                │
│                                                                              │
│ src/                                                                          │
│ ├── app/                                                                      │
│ │   └── projects/                                                             │
│ │       └── [projectId]/                                                      │
│ │           └── templates/                                                    │
│ │               └── [templateId]/                                             │
│ │                   └── page.tsx                                              │
│ │                                                                            │
│ ├── components/                                                               │
│ │   ├── layout/                                                               │
│ │   │   ├── AppShell.tsx                                                      │
│ │   │   ├── Sidebar.tsx                                                       │
│ │   │   ├── TopHeader.tsx                                                     │
│ │   │   └── MainArea.tsx                                                      │
│ │   │                                                                        │
│ │   ├── template-wizard/                                                      │
│ │   │   ├── TemplateWizardContent.tsx                                         │
│ │   │   ├── WizardHeader.tsx                                                  │
│ │   │   ├── WizardGrid.tsx                                                    │
│ │   │   ├── TemplateSelectionPanel.tsx                                        │
│ │   │   ├── TemplateSearch.tsx                                                │
│ │   │   ├── TemplateSelectionList.tsx                                         │
│ │   │   ├── SectionNavigator.tsx                                              │
│ │   │   ├── SectionEditorPanel.tsx                                            │
│ │   │   ├── ActiveSectionHeader.tsx                                           │
│ │   │   ├── DynamicForm.tsx                                                   │
│ │   │   ├── FieldRenderer.tsx                                                 │
│ │   │   ├── ScoreMatrixField.tsx                                              │
│ │   │   ├── EvidenceLinkField.tsx                                             │
│ │   │   ├── SectionNavigationControls.tsx                                     │
│ │   │   ├── ValidationPanel.tsx                                               │
│ │   │   ├── MarkdownPreview.tsx                                               │
│ │   │   ├── JsonEvidencePreview.tsx                                           │
│ │   │   └── WizardActionBar.tsx                                               │
│ │   │                                                                        │
│ │   └── ui/                                                                   │
│ │       ├── badge.tsx                                                         │
│ │       ├── button.tsx                                                        │
│ │       ├── card.tsx                                                          │
│ │       ├── input.tsx                                                         │
│ │       ├── textarea.tsx                                                      │
│ │       ├── select.tsx                                                        │
│ │       ├── checkbox.tsx                                                      │
│ │       ├── progress.tsx                                                      │
│ │       ├── tabs.tsx                                                          │
│ │       ├── table.tsx                                                         │
│ │       ├── alert.tsx                                                         │
│ │       └── code-preview.tsx                                                  │
│ │                                                                            │
│ ├── templates/                                                                │
│ │   ├── registry.ts                                                           │
│ │   ├── types.ts                                                              │
│ │   ├── renderMarkdown.ts                                                     │
│ │   ├── renderJsonEvidence.ts                                                 │
│ │   └── schemas/                                                              │
│ │       ├── a-3-1.solution-options.ts                                         │
│ │       ├── a-3-2.evaluation-scoring.ts                                       │
│ │       └── a-3-3.recommended-solution.ts                                     │
│ │                                                                            │
│ ├── types/                                                                    │
│ │   └── template-wizard.types.ts                                              │
│ │                                                                            │
│ └── lib/                                                                      │
│     ├── server/                                                               │
│     │   ├── artifact-library.ts                                               │
│     │   └── template-wizard.ts                                                │
│     ├── template-wizard-computed.ts                                           │
│     ├── artifact-versioning.ts                                                │
│     ├── markdown-export.ts                                                    │
│     ├── json-export.ts                                                        │
│     └── formatters.ts                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 16. TEMPLATE WIZARD DATA CONTRACT                                             │
│                                                                              │
│ export type TemplateWizardData = {                                            │
│   user: {                                                                     │
│     name: string;                                                             │
│     role: string;                                                             │
│     initials: string;                                                         │
│   };                                                                          │
│                                                                              │
│   project: {                                                                  │
│     id: string;                                                               │
│     code: string;                                                             │
│     name: string;                                                             │
│   };                                                                          │
│                                                                              │
│   wizardHeader: WizardHeaderData;                                             │
│                                                                              │
│   templateSelections: TemplateSelectionItem[];                                │
│                                                                              │
│   selectedTemplate: {                                                         │
│     id: string;                                                               │
│     code: string;                                                             │
│     name: string;                                                             │
│     version: string;                                                          │
│     sections: TemplateSection[];                                              │
│   };                                                                          │
│                                                                              │
│   activeSectionId: string;                                                    │
│                                                                              │
│   formValues: Record<string, unknown>;                                        │
│                                                                              │
│   validationSummary: ValidationSummary;                                       │
│                                                                              │
│   markdownPreview: MarkdownPreviewData;                                       │
│                                                                              │
│   jsonEvidence: JsonEvidence;                                                 │
│                                                                              │
│   artifactSaveState: ArtifactSaveState;                                       │
│ };                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 17. STATUS BADGE RULES                                                        │
│                                                                              │
│ const templateWizardStatusBadgeMap = {                                        │
│   not_started: {                                                              │
│     label: "Not Started",                                                     │
│     tone: "gray",                                                            │
│   },                                                                          │
│   in_progress: {                                                              │
│     label: "In Progress",                                                     │
│     tone: "blue",                                                            │
│   },                                                                          │
│   complete: {                                                                 │
│     label: "Complete",                                                        │
│     tone: "green",                                                           │
│   },                                                                          │
│   in_review: {                                                                │
│     label: "In Review",                                                       │
│     tone: "purple",                                                          │
│   },                                                                          │
│   approved: {                                                                 │
│     label: "Approved",                                                        │
│     tone: "green",                                                           │
│   },                                                                          │
│   changes_requested: {                                                        │
│     label: "Changes Requested",                                               │
│     tone: "red",                                                             │
│   },                                                                          │
│   invalid: {                                                                  │
│     label: "Invalid",                                                         │
│     tone: "red",                                                             │
│   },                                                                          │
│ };                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 18. INTERACTION REQUIREMENTS                                                  │
│                                                                              │
│ Template Wizard interactions:                                                 │
│                                                                              │
│ 1. Click template in Template Selection                                       │
│    → Navigate to /projects/{projectId}/templates/{templateId}                 │
│                                                                              │
│ 2. Search templates                                                           │
│    → Filter template list by code, name, phase, or status                     │
│                                                                              │
│ 3. Click section in Section Navigator                                         │
│    → Set activeSectionId                                                      │
│    → Scroll/focus center editor                                               │
│                                                                              │
│ 4. Edit form field                                                            │
│    → Update formValues                                                        │
│    → Mark section dirty                                                       │
│    → Recompute validation                                                     │
│    → Regenerate preview state                                                 │
│    → Trigger debounced autosave                                               │
│                                                                              │
│ 5. Click Previous Section                                                     │
│    → Validate current section softly                                          │
│    → Navigate to previous section                                             │
│                                                                              │
│ 6. Click Next Section                                                         │
│    → Validate current section                                                 │
│    → If no blocking errors, navigate to next section                          │
│    → If blocking errors, keep user on section and show validation summary     │
│                                                                              │
│ 7. Click Save Section                                                         │
│    → Persist current section values                                           │
│                                                                              │
│ 8. Click validation issue                                                     │
│    → Navigate to related section and focus related field                      │
│                                                                              │
│ 9. Click Markdown Preview Regenerate                                          │
│    → Run toMarkdown(formValues, templateSchema)                               │
│                                                                              │
│ 10. Click Copy Markdown                                                       │
│     → Copy generated Markdown to clipboard                                    │
│                                                                              │
│ 11. Click Validate JSON                                                       │
│     → Validate generated JSON evidence against evidence schema                │
│                                                                              │
│ 12. Click Copy JSON                                                           │
│     → Copy pretty-printed JSON to clipboard                                   │
│                                                                              │
│ 13. Click Save Draft                                                          │
│     → Persist partial artifact state                                          │
│                                                                              │
│ 14. Click Export Markdown                                                     │
│     → Download generated .md file                                             │
│                                                                              │
│ 15. Click Export JSON Evidence                                                │
│     → Download generated .json file                                           │
│                                                                              │
│ 16. Click Save Artifact                                                       │
│     → Persist artifact record, Markdown output, JSON evidence, and metadata   │
│                                                                              │
│ 17. Click Mark Complete                                                       │
│     → If validation passes, set artifact status to complete                   │
│     → If validation fails, focus Validation Panel                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 19. VISUAL DESIGN TOKENS                                                      │
│                                                                              │
│ const templateWizardTokens = {                                                │
│   layout: {                                                                   │
│     sidebarWidth: "280px",                                                    │
│     headerHeight: "76px",                                                     │
│     templateSelectionWidth: "300px",                                          │
│     previewPanelWidth: "420px",                                               │
│     pagePadding: "32px",                                                      │
│     cardRadius: "16px",                                                       │
│     cardGap: "20px",                                                          │
│     actionBarHeight: "80px",                                                  │
│   },                                                                          │
│                                                                              │
│   colors: {                                                                   │
│     appBackground: "#f8fafc",                                                 │
│     surface: "#ffffff",                                                       │
│     sidebar: "#07111f",                                                       │
│     sidebarMuted: "#0f1b2d",                                                  │
│     border: "#e5e7eb",                                                        │
│     selectedBorder: "#2563eb",                                                │
│     selectedBackground: "#eff6ff",                                            │
│     textPrimary: "#111827",                                                   │
│     textSecondary: "#475569",                                                 │
│     textMuted: "#64748b",                                                     │
│     blue: "#2563eb",                                                          │
│     green: "#16a34a",                                                         │
│     amber: "#f59e0b",                                                         │
│     red: "#dc2626",                                                           │
│     purple: "#7c3aed",                                                        │
│     gray: "#94a3b8",                                                          │
│   },                                                                          │
│                                                                              │
│   typography: {                                                               │
│     pageTitle: "24px / 32px, font-weight 700",                                │
│     templateTitle: "24px / 32px, font-weight 700",                            │
│     cardTitle: "16px / 24px, font-weight 600",                                │
│     sectionTitle: "18px / 28px, font-weight 600",                             │
│     fieldLabel: "14px / 22px, font-weight 600",                               │
│     body: "14px / 22px, font-weight 400",                                     │
│     caption: "12px / 18px, font-weight 400",                                  │
│     code: "13px / 20px, font-family monospace",                               │
│   },                                                                          │
│ };                                                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 20. ACCESSIBILITY REQUIREMENTS                                                │
│                                                                              │
│ 1. Template list must be keyboard navigable.                                  │
│ 2. Selected template must expose aria-selected="true".                        │
│ 3. Section navigator must expose aria-current="step" for the active section.  │
│ 4. Required fields must use aria-required="true".                             │
│ 5. Invalid fields must use aria-invalid="true".                               │
│ 6. Field errors must be associated with fields using aria-describedby.         │
│ 7. Validation Panel must be reachable by keyboard.                            │
│ 8. Blocking validation errors must use alert semantics.                       │
│ 9. Markdown Preview and JSON Evidence Preview must have accessible labels.    │
│ 10. Icon-only buttons must include aria-label.                                │
│ 11. Disabled buttons must expose helper text explaining why disabled.         │
│ 12. Focus must move to the first invalid field after failed validation.        │
│ 13. Autosave status must be readable by screen readers.                       │
│ 14. All interactive rows must have visible hover and focus states.            │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 21. EMPTY STATES                                                              │
│                                                                              │
│ No templates available:                                                       │
│ ├── Show message: "No templates are configured for this phase."               │
│ └── CTA: "Open Template Registry"                                             │
│                                                                              │
│ No template selected:                                                         │
│ ├── Show template selection placeholder                                       │
│ └── Message: "Select a template to begin."                                   │
│                                                                              │
│ No sections configured:                                                       │
│ ├── Show configuration warning                                                │
│ └── Message: "This template has no sections configured."                     │
│                                                                              │
│ No validation issues:                                                         │
│ ├── Show success message: "No validation issues."                            │
│ └── Use green success tone                                                    │
│                                                                              │
│ No Markdown generated:                                                        │
│ ├── Show message: "Complete at least one section to preview Markdown."        │
│ └── Disable copy/export Markdown button                                       │
│                                                                              │
│ No JSON evidence generated:                                                   │
│ ├── Show message: "JSON evidence will appear after the form is saved."        │
│ └── Disable copy/export JSON button                                           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 22. LOADING AND ERROR STATES                                                  │
│                                                                              │
│ Loading:                                                                      │
│ ├── App shell loads immediately                                               │
│ ├── Wizard header shows skeleton                                              │
│ ├── Template list shows skeleton rows                                         │
│ ├── Section editor shows form skeleton                                        │
│ ├── Validation panel shows compact skeleton                                   │
│ ├── Markdown preview shows skeleton content block                             │
│ └── JSON preview shows skeleton code block                                    │
│                                                                              │
│ Error:                                                                        │
│ ├── Show inline error banner above WizardGrid                                 │
│ ├── Keep sidebar and header usable                                            │
│ ├── Provide retry action                                                      │
│ ├── Preserve unsaved local form state when possible                           │
│ └── Prevent export while source schema or validation state is unavailable     │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 23. AGENT BUILD INSTRUCTION                                                   │
│                                                                              │
│ Build the Template Wizard screen as a responsive authenticated SaaS editor    │
│ for lifecycle artifact generation.                                            │
│                                                                              │
│ Use:                                                                          │
│ ├── Fixed dark sidebar                                                        │
│ ├── White top header                                                          │
│ ├── Breadcrumbs                                                               │
│ ├── Large wizard header                                                       │
│ ├── Three-column wizard grid                                                  │
│ ├── Left Template Selection panel                                             │
│ ├── Left Section Navigator                                                    │
│ ├── Center Section-by-Section Editor                                          │
│ ├── Center Dynamic Form                                                       │
│ ├── Right Validation Panel                                                    │
│ ├── Right Markdown Preview                                                    │
│ ├── Right JSON Evidence Preview                                               │
│ └── Sticky bottom Export / Save Artifact action bar                           │
│                                                                              │
│ The screen must communicate:                                                  │
│ ├── Which template is selected                                                │
│ ├── Which lifecycle phase the template belongs to                             │
│ ├── Which section the user is editing                                         │
│ ├── Which fields are required                                                 │
│ ├── Which sections are complete                                               │
│ ├── Which validation issues remain                                            │
│ ├── What Markdown artifact will be generated                                  │
│ ├── What JSON evidence will be generated                                      │
│ └── Whether the artifact can be saved, exported, or marked complete           │
│                                                                              │
│ Final Visual Hierarchy:                                                       │
│                                                                              │
│ 1. Navigation shell                                                           │
│ 2. Project/template context                                                   │
│ 3. Template selection                                                         │
│ 4. Section navigation                                                         │
│ 5. Dynamic section editor                                                     │
│ 6. Validation panel                                                           │
│ 7. Markdown preview                                                           │
│ 8. JSON evidence preview                                                      │
│ 9. Export / save artifact actions                                             │
└──────────────────────────────────────────────────────────────────────────────┘