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
  progressPercent: number;
};

export type DashboardGateStatus = {
  gateId: string;
  title: string;
  label: "Approved" | "Changes Requested" | "Pending";
  count: number;
  widthPercent: number;
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
  label: string;
  projectName: string;
};

export type DashboardProjectSnapshot = {
  projectId: string | null;
  name: string;
  phase: number;
  gate: string;
  status: DashboardStatus;
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
};

export type DashboardTip = {
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
  nextActions: DashboardNextAction[];
  recentDecisions: DashboardRecentDecision[];
  projectSnapshots: DashboardProjectSnapshot[];
  continueWorking: DashboardContinueWorking;
  tip: DashboardTip;
};
