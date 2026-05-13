export type ProjectStatus = "In Progress" | "Blocked" | "Pending" | "Not Started";

export type ProjectDetailTab =
  | "overview"
  | "profile"
  | "lifecycle-timeline"
  | "artifacts"
  | "gates"
  | "traceability"
  | "audit-trail";

export type ProjectListItem = {
  id: string;
  name: string;
  code: string;
  owner: string;
  currentPhase: number;
  progressPercent: number;
  status: ProjectStatus;
  updatedLabel: string;
  /** Incomplete or unlinked evidence items (for list badges and sort). */
  missingEvidenceCount: number;
};

export type SelectedProjectHeader = {
  id: string;
  name: string;
  code: string;
  owner: string;
  businessArea: string;
  currentPhase: number;
  totalPhases: number;
  status: ProjectStatus;
  updatedLabel: string;
};

export type LifecyclePhaseStatus = "completed" | "current" | "upcoming" | "blocked";

export type SelectedProjectLifecyclePhase = {
  id: string;
  label: string;
  status: LifecyclePhaseStatus;
};

export type SelectedProjectMetric = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone: "blue" | "green" | "amber" | "red" | "purple";
};

export type SelectedProjectActivity = {
  id: string;
  title: string;
  meta: string;
  timeLabel: string;
  /** Deep link when activity is tied to a gate, artifact, etc. */
  href?: string;
};

export type SelectedProjectGateStatus = {
  gateId: string;
  title: string;
  status: "Approved" | "In Review" | "Pending" | "Changes Requested";
  timeLabel: string;
};

export type SelectedProjectBlocker = {
  id: string;
  message: string;
  severity: "warning" | "error";
  target:
    | { kind: "workspace-phase"; phaseNumber: number }
    | { kind: "artifact"; artifactId: string }
    | { kind: "template"; templateId: string }
    | { kind: "evidence-overview"; phaseNumber?: number; gateId?: string }
    | { kind: "evidence"; evidenceId: string }
    | { kind: "gate-review"; gateId: string }
    | { kind: "traceability" };
  href: string;
};

export type SelectedProjectSnapshotItem = {
  key: string;
  value: string;
};

export type SelectedProjectQuickAction = {
  id: string;
  label: string;
  href: string;
};

/** Serialized audit rows for the projects screen (from `AuditEntry`). */
export type ProjectScreenAuditEntry = {
  id: string;
  createdAt: string;
  action: string;
  title: string;
  subjectKind: string;
  subjectId: string;
  detail: string;
  actorLabel: string | null;
  /** When true, row appears on the Lifecycle Timeline tab. */
  lifecycleRelevant: boolean;
  /** When set, row links to artifact detail or related workspace routes. */
  href?: string;
};

export type SelectedProject = {
  header: SelectedProjectHeader;
  lifecyclePhases: SelectedProjectLifecyclePhase[];
  metrics: SelectedProjectMetric[];
  recentActivity: SelectedProjectActivity[];
  gateStatuses: SelectedProjectGateStatus[];
  blockers: SelectedProjectBlocker[];
  snapshot: SelectedProjectSnapshotItem[];
  quickActions: SelectedProjectQuickAction[];
  /** Recent `AuditEntry` rows for this project (newest first). */
  auditTrailEntries: ProjectScreenAuditEntry[];
  nextRequiredAction: {
    description: string;
    ctaLabel: string;
    href: string;
  };
  /** Default sidebar "Gates" link for the selected project (DB-backed when decisions are loaded). */
  gatesNavHref?: string | null;
};

export type ProjectsScreenData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  projects: ProjectListItem[];
  selectedProject: SelectedProject;
};
