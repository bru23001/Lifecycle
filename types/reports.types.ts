export type ReportsFilters = {
  projectId: string;
  dateRange: "this_week" | "this_month" | "this_quarter" | "this_year" | "custom";
  startDate?: string;
  endDate?: string;
  phaseNumber?: number | "all";
  gateCode?: string | "all";
  reportStatus?: "all" | "ready" | "stale" | "missing";
  lastUpdatedLabel: string;
};

export type ReportCardBase = {
  id: string;
  title: string;
  description: string;
  icon: string;
  reportType:
    | "lifecycle_status"
    | "gate_decision"
    | "artifact_completion"
    | "evidence_completeness"
    | "traceability"
    | "approval_history"
    | "evidence_package";
  status: "ready" | "stale" | "generating" | "missing" | "error";
  lastGeneratedLabel?: string;
  primaryMetricLabel?: string;
  primaryMetricValue?: string | number;
  viewHref: string;
  exportHref?: string;
};

export type LifecycleStatusSummary = {
  reportId: string;
  overallProgressPercent: number;
  phasesCompleted: number;
  phasesInProgress: number;
  phasesNotStarted: number;
  totalPhases: number;
  currentPhaseNumber?: number;
  currentPhaseName?: string;
  upcomingGateCode?: string;
  blockersCount: number;
  lastGeneratedLabel: string;
  viewHref: string;
  exportPdfHref: string;
};

export type GateDecisionSummary = {
  reportId: string;
  totalGates: number;
  approved: number;
  pending: number;
  rejected: number;
  notReached: number;
  approvalRatePercent: number;
  averageDecisionDays?: number;
  lastDecisionLabel?: string;
  lastGeneratedLabel: string;
  viewHref: string;
  exportPdfHref: string;
};

export type TraceabilityReportSummary = {
  reportId: string;
  coveragePercent: number;
  completeLinks: number;
  partialLinks: number;
  missingLinks: number;
  orphanedItems: number;
  criticalGaps: number;
  lastGeneratedLabel: string;
  viewHref: string;
  exportPdfHref: string;
};

/** Artifact completion across required templates / phases (UI-UX Reports dashboard). */
export type ArtifactCompletionSummary = {
  reportId: string;
  totalRequired: number;
  completed: number;
  inReview: number;
  draft: number;
  blocked: number;
  completionPercent: number;
  lastGeneratedLabel: string;
  viewHref: string;
  exportPdfHref: string;
};

/** Evidence completeness rollup (includes gaps severity per UI-UX). */
export type EvidenceCompletenessSummary = {
  reportId: string;
  overallPercent: number;
  completeItems: number;
  partialItems: number;
  missingItems: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  blockingGates: number;
  lastGeneratedLabel: string;
  viewHref: string;
  exportCsvHref: string;
};

export type ApprovalHistorySummary = {
  reportId: string;
  totalDecisions: number;
  approved: number;
  changesRequested: number;
  rejected: number;
  pending: number;
  averageReviewTimeHours?: number;
  lastApprovalLabel?: string;
  lastGeneratedLabel: string;
  viewHref: string;
  exportPdfHref: string;
};

export type FullProjectEvidencePackageSummary = {
  reportId: string;
  includesArtifacts: boolean;
  includesEvidenceFiles: boolean;
  includesGateDecisions: boolean;
  includesTraceabilityLinks: boolean;
  includesApprovalRecords: boolean;
  includesAuditManifest: boolean;
  estimatedSizeLabel: string;
  estimatedFileCount: number;
  lastGeneratedLabel?: string;
  configureHref: string;
  exportPackageHref: string;
};

export type ReportsActionState = {
  title: string;
  description: string;
  canScheduleReports: boolean;
  canRefreshReports: boolean;
  scheduleHref: string;
  refreshActionId: string;
};

export type ReportsPageData = {
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
  filters: ReportsFilters;
  reports: {
    lifecycleStatus: LifecycleStatusSummary;
    gateDecision: GateDecisionSummary;
    artifactCompletion: ArtifactCompletionSummary;
    evidenceCompleteness: EvidenceCompletenessSummary;
    traceability: TraceabilityReportSummary;
    approvalHistory: ApprovalHistorySummary;
    fullProjectEvidencePackage: FullProjectEvidencePackageSummary;
  };
  actionState: ReportsActionState;
};
