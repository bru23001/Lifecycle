import type {
  ProjectDetailTab,
  ProjectsScreenData,
  SelectedProject,
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

/** Default shell user when the DB is unavailable; production uses `getCurrentUserDisplay()`. */
export const DEFAULT_PROJECTS_SCREEN_USER: ProjectsScreenData["user"] = {
  name: "Signed-in user",
  role: "Member",
  initials: "?",
};

/** Satisfies `ProjectsScreenData` when there are no projects; detail UI is not rendered. */
export function emptyPlaceholderSelectedProject(): SelectedProject {
  return {
    header: {
      id: "",
      name: "",
      code: "",
      owner: "",
      businessArea: "",
      currentPhase: 1,
      totalPhases: 14,
      status: "Not Started",
      updatedLabel: "",
    },
    lifecyclePhases: [],
    metrics: [],
    recentActivity: [],
    gateStatuses: [],
    blockers: [],
    snapshot: [],
    quickActions: [],
    auditTrailEntries: [],
    nextRequiredAction: {
      description: "Create a project to track lifecycle phases, gates, artifacts, and evidence in one place.",
      ctaLabel: "New project",
      href: "/projects?new=1",
    },
    gatesNavHref: null,
  };
}
