import type { Applicability } from "@/lib/applicability";
import type { ArtifactWorkflowStatus } from "@/types/artifact-library.types";

export type ProjectStatus = "In Progress" | "Blocked" | "Pending" | "Not Started";

/** Template row inside the Projects screen “Create artifact” modal. */
export type ProjectsArtifactsTabTemplateOption = {
  templateId: string;
  title: string;
  phaseNumber: number;
  phaseName: string;
  marker: "required" | "optional" | "conditional";
};

/** One revision row for the version history drawer. */
export type ProjectsArtifactsTabVersionRow = {
  artifactRowId: string;
  version: string;
  author: string;
  timestampLabel: string;
  changeSummary: string;
  isCurrent: boolean;
  /** Truncated JSON snapshot for compare / inspect in the drawer. */
  jsonPayload: string;
};

/** Latest logical artifact row for the Projects screen Artifacts tab. */
export type ProjectsArtifactsTabRow = {
  id: string;
  artifactCode: string;
  name: string;
  templateId: string;
  localId: string;
  phaseNumber: number;
  status: ArtifactWorkflowStatus;
  version: string;
  lastUpdatedLabel: string;
  detailHref: string;
  templateWizardHref: string;
  evidenceCenterHref: string;
  exportMarkdown: string;
  exportJson: string;
  versions: ProjectsArtifactsTabVersionRow[];
};

export type ProjectsArtifactsTabData = {
  projectId: string;
  projectName: string;
  currentPhase: number;
  templatesForModal: ProjectsArtifactsTabTemplateOption[];
  artifacts: ProjectsArtifactsTabRow[];
  fullLibraryHref: string;
};

/** Server-fed context for the 14-phase strip on Overview + Lifecycle timeline tabs. */
export type ProjectsLifecycleStripModel = {
  projectId: string;
  currentPhase: number;
  applicability: Applicability;
  gateReviewHref: string;
};

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

/**
 * Discriminator for `SelectedProjectQuickAction`. Defaults to `navigate`
 * (a plain link). Modal kinds open the corresponding modal in
 * `ProjectContextPanel` without navigating away from the projects shell.
 */
export type SelectedProjectQuickActionKind =
  | "navigate"
  | "modal-add-evidence"
  | "modal-report-selection"
  | "modal-export-package";

export type SelectedProjectQuickAction = {
  id: string;
  label: string;
  href: string;
  /** Optional UX hint: when set to a modal kind, the action opens a modal instead of navigating. */
  kind?: SelectedProjectQuickActionKind;
};

/** Kinds of related entity links surfaced from an audit entry. */
export type ProjectScreenAuditRelatedKind = "artifact" | "gate" | "evidence" | "approval";

export type ProjectScreenAuditRelated = {
  kind: ProjectScreenAuditRelatedKind;
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
  /** Email of the actor (already PII-masked for display). May be null. */
  actorEmail: string | null;
  /** Sanitized `AuditEntry.metadata` snapshot (sensitive keys dropped, emails masked). */
  metadata: Record<string, unknown>;
  /** When true, row appears on the Lifecycle Timeline tab. */
  lifecycleRelevant: boolean;
  /** When set, row links to artifact detail or related workspace routes. */
  href?: string;
  /** Additional related-entity deep links surfaced in the drawer. */
  relatedHrefs: ProjectScreenAuditRelated[];
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
  /** Users that can own a project (reassignment + profile editor). */
  assignableUsers: { id: string; name: string; email: string }[];
  /** Populated when the selected row maps to a live DB project. */
  selectedProjectProfile: SelectedProjectProfile | null;
  /** Phase strip + actions; null when no DB-backed selection. */
  lifecycleStrip: ProjectsLifecycleStripModel | null;
  /** Artifacts tab (template modal, list, actions); null when no DB-backed selection. */
  artifactsTab: ProjectsArtifactsTabData | null;
};

/** Editable project profile fields for the Projects screen profile tab. */
export type SelectedProjectProfile = {
  projectId: string;
  name: string;
  slug: string;
  displayedCode: string;
  description: string;
  sponsor: string;
  ownerUserId: string | null;
  ownerName: string;
  businessArea: string;
  priority: string;
  status: ProjectStatus;
  targetStartDate: string;
  targetEndDate: string;
};
