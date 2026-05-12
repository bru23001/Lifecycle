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
