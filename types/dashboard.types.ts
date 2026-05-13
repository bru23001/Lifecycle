export type DashboardStatus = "In Progress" | "Blocked" | "Pending";

export type DashboardMetricTone = "blue" | "green" | "amber" | "red" | "purple";

export type DashboardMetric = {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: DashboardMetricTone;
  targetHref: string;
};

export type DashboardLifecycleProgressItem = {
  projectId: string | null;
  projectName: string;
  /** Workspace phase 1–14 for deep-linking from dashboard progress rows. */
  currentPhase: number | null;
  progressPercent: number;
};

export type DashboardGateStatus = {
  gateId: string;
  title: string;
  label: "Approved" | "Changes Requested" | "Pending";
  count: number;
  widthPercent: number;
  /** Project id for gate review links; from latest decision for this gate when found, else lead project. */
  reviewProjectId: string | null;
};

export type DashboardNextAction = {
  id: string;
  title: string;
  projectName: string;
  dueLabel: string;
  dueTone: string;
  targetHref: string;
};

export type DashboardRecentDecision = {
  id: string;
  gate: string;
  label: "Approved" | "Changes Requested" | "Pending";
  projectName: string;
  targetType: "gate_review" | "approval_detail" | "audit_detail";
  targetHref: string;
};

export type DashboardProjectSnapshot = {
  projectId: string | null;
  name: string;
  phase: number;
  gate: string;
  status: DashboardStatus;
  /** Count of persisted audit rows for deep-linking to the project audit trail. */
  auditEventCount: number;
};

export type DashboardContinueWorking = {
  projectId: string | null;
  projectName: string;
  phaseSummary: string;
  progressPercent: number;
  /** Workspace phase 1–14 for shell nav (e.g. default Gates link). */
  currentPhase: number | null;
  /** Server-resolved default Gates review URL (uses gate decisions when loaded). */
  gatesHref: string | null;
  /**
   * Primary CTA for the sidebar card: next blocking lifecycle step (approvals,
   * template form, workspace anchors, or gate review). Null when no lead project.
   */
  continueNextHref: string | null;
};

export type DashboardTip = {
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Dashboard banners that deep-link into Settings (lifecycle / templates / gates). */
export type DashboardSettingsAlert = {
  id: "lifecycle-configuration" | "template-registry" | "gate-rules";
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

export type DashboardData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  metrics: DashboardMetric[];
  lifecycleProgress: DashboardLifecycleProgressItem[];
  gateStatuses: DashboardGateStatus[];
  /** Lead project for dashboard gate summary deep-links (first of up to four shown). */
  gateSummaryProjectId: string | null;
  /** Next open gate review for the lead project (card + metric tile). */
  gateSummaryDefaultReviewHref: string | null;
  /** Projects screen “Gates” tab for the lead project (header “View all gates”). */
  gateSummaryAllGatesHref: string | null;
  /** Alternative to `/approvals`: lead project's approval history report (spec §11). */
  recentDecisionsProjectApprovalHistoryHref: string | null;
  /** Lead project audit trail on the projects shell (see `projectAuditTrailListHref`). */
  leadProjectAuditTrailHref: string | null;
  /** Oldest open approval (FIFO) for `/approvals/{approvalId}` from metric, bell, sidebar (spec §12). */
  firstPendingApprovalId: string | null;
  /** Count of approvals in open workflow statuses (badge + KPI alignment). */
  openApprovalsCount: number;
  nextActions: DashboardNextAction[];
  recentDecisions: DashboardRecentDecision[];
  projectSnapshots: DashboardProjectSnapshot[];
  continueWorking: DashboardContinueWorking;
  tip: DashboardTip;
  /** Configuration warnings from platform tables; each CTA opens the matching Settings section. */
  settingsAlerts: DashboardSettingsAlert[];
};
