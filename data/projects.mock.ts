import type {
  ProjectDetailTab,
  ProjectListItem,
  ProjectsScreenData,
  SelectedProject,
  SelectedProjectLifecyclePhase,
} from "@/types/projects.types";

export const PROJECT_DETAIL_TABS: Array<{ id: ProjectDetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "lifecycle-timeline", label: "Lifecycle Timeline" },
  { id: "artifacts", label: "Artifacts" },
  { id: "gates", label: "Gates" },
  { id: "traceability", label: "Traceability" },
  { id: "audit-trail", label: "Audit Trail" },
];

export const PROJECTS_LIST_FALLBACK: ProjectListItem[] = [
  {
    id: "mock-sip-001",
    name: "Secure Identity Platform",
    code: "SIP-001",
    owner: "Alex Developer",
    currentPhase: 3,
    progressPercent: 65,
    status: "In Progress",
    updatedLabel: "2h ago",
  },
  {
    id: "mock-dgh-002",
    name: "Data Governance Hub",
    code: "DGH-002",
    owner: "Morgan Reviewer",
    currentPhase: 4,
    progressPercent: 40,
    status: "In Progress",
    updatedLabel: "1d ago",
  },
  {
    id: "mock-tis-003",
    name: "Threat Intelligence System",
    code: "TIS-003",
    owner: "Sam Architect",
    currentPhase: 2,
    progressPercent: 20,
    status: "Blocked",
    updatedLabel: "2d ago",
  },
];

export const PROJECTS_USER_FALLBACK: ProjectsScreenData["user"] = {
  name: "Alex Developer",
  role: "Project Owner",
  initials: "AD",
};

export function fallbackLifecyclePhases(currentPhase: number): SelectedProjectLifecyclePhase[] {
  return [
    "Idea Capture",
    "Problem Definition",
    "Evaluation & Selection",
    "Feasibility & Business Case",
    "Approval & Funding",
    "Maintenance / Review",
  ].map((label, index) => {
    const phase = index + 1;
    return {
      id: `phase-${phase}`,
      label,
      status:
        currentPhase > phase ? "completed"
        : currentPhase === phase ? "current"
        : "upcoming",
    };
  });
}

export function buildFallbackSelectedProject(project: ProjectListItem): SelectedProject {
  return {
    header: {
      id: project.id,
      name: project.name,
      code: project.code,
      owner: project.owner,
      businessArea: "Security",
      currentPhase: project.currentPhase,
      totalPhases: 14,
      status: project.status,
      updatedLabel: project.updatedLabel,
    },
    lifecyclePhases: fallbackLifecyclePhases(project.currentPhase),
    metrics: [
      { id: "artifacts", label: "Artifacts", value: "12", note: "8 complete", tone: "blue" },
      { id: "gates", label: "Gates", value: "3 / 6", note: "In flight", tone: "green" },
      { id: "evidence", label: "Evidence", value: "18", note: "12 complete", tone: "amber" },
      { id: "trace", label: "Trace Links", value: "46", note: "78% coverage", tone: "purple" },
    ],
    recentActivity: [
      {
        id: "activity-1",
        title: "Artifact A-3.1 scorecard approved",
        meta: "Morgan Reviewer · Gate Authority",
        timeLabel: "2h ago",
      },
      {
        id: "activity-2",
        title: "Evidence package updated for G2",
        meta: "Alex Developer · Project Owner",
        timeLabel: "5h ago",
      },
      {
        id: "activity-3",
        title: "Trace link added: CRS -> SRS-FR-001",
        meta: "System",
        timeLabel: "1d ago",
      },
    ],
    gateStatuses: [
      { gateId: "G1", title: "Concept Approval", status: "Approved", timeLabel: "2d ago" },
      { gateId: "G2", title: "Feasibility Approval", status: "In Review", timeLabel: "4h ago" },
      { gateId: "G3", title: "Solution Approval", status: "Pending", timeLabel: "—" },
    ],
    blockers: [
      { id: "blocker-1", message: "2 artifacts have missing required sections", severity: "warning" },
      { id: "blocker-2", message: "1 gate is awaiting required approvals", severity: "warning" },
    ],
    snapshot: [
      { key: "Project Code", value: project.code },
      { key: "Type", value: "Platform" },
      { key: "Business Area", value: "Security" },
      { key: "Owner", value: project.owner },
      { key: "Phase", value: `Phase ${project.currentPhase} of 14` },
    ],
    quickActions: [
      { id: "qa-profile", label: "Edit Project Profile", href: "/projects" },
      { id: "qa-lifecycle", label: "View Lifecycle Timeline", href: "/projects" },
      { id: "qa-gate", label: "Open Gate Review", href: "/projects" },
      { id: "qa-artifacts", label: "Manage Artifacts", href: "/projects" },
      { id: "qa-trace", label: "View Traceability Matrix", href: "/projects" },
      { id: "qa-audit", label: "View Audit Trail", href: "/projects" },
      { id: "qa-export", label: "Export Project Package", href: "/projects" },
    ],
    nextRequiredAction: {
      description:
        "Complete required artifacts and evidence items before advancing to the next lifecycle gate review.",
      ctaLabel: "Go to Lifecycle Workspace",
      href: "/projects/new",
    },
  };
}
