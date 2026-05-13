import type {
  ProjectListItem,
  SelectedProject,
  SelectedProjectLifecyclePhase,
} from "@/types/projects.types";
import { nextOpenGateForPhase } from "@/lib/gateStatus";

function fallbackLifecyclePhases(currentPhase: number): SelectedProjectLifecyclePhase[] {
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

/** Base shape merged with Prisma row data on the projects screen. */
export function buildSelectedProjectFromListItem(project: ProjectListItem): SelectedProject {
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
      { id: "artifacts", label: "Artifacts", value: "—", note: "Select a project", tone: "blue" },
      { id: "gates", label: "Gates", value: "—", note: "—", tone: "green" },
      { id: "evidence", label: "Evidence", value: "—", note: "—", tone: "amber" },
      { id: "trace", label: "Trace Links", value: "—", note: "—", tone: "purple" },
    ],
    recentActivity: [],
    gateStatuses: [],
    blockers: [],
    snapshot: [
      { key: "Project Code", value: project.code },
      { key: "Type", value: "Platform" },
      { key: "Business Area", value: "Security" },
      { key: "Owner", value: project.owner },
      { key: "Phase", value: `Phase ${project.currentPhase} of 14` },
      {
        key: "Missing evidence",
        value: project.missingEvidenceCount > 0 ? String(project.missingEvidenceCount) : "None",
      },
    ],
    quickActions: [
      { id: "qa-profile", label: "Edit Project Profile", href: "/projects" },
      { id: "qa-lifecycle", label: "View Lifecycle Timeline", href: "/projects" },
      { id: "qa-gate", label: "Open Gate Review", href: "/projects" },
      { id: "qa-artifacts", label: "Manage Artifacts", href: "/projects" },
      { id: "qa-trace", label: "View Traceability Matrix", href: `/projects/${project.id}/traceability` },
      { id: "qa-audit", label: "View Audit Trail", href: "/projects" },
      { id: "qa-export", label: "Export Project Package", href: "/projects" },
    ],
    auditTrailEntries: [],
    nextRequiredAction: {
      description:
        "Complete required artifacts and evidence items before advancing to the next lifecycle gate review.",
      ctaLabel: "Go to Lifecycle Workspace",
      href: `/projects/${project.id}/workspace`,
    },
    gatesNavHref: `/projects/${project.id}/gates/${nextOpenGateForPhase(project.currentPhase).toLowerCase()}/review`,
  };
}
