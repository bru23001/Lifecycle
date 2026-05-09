import type { ReportsFilters, ReportsPageData } from "@/types/reports.types";

/** Report card health and visibility helpers for the reports hub (server data is pre-scoped). */

export function getReportCardHealth(
  r: ReportsPageData["reports"],
  key: keyof ReportsPageData["reports"],
): "ready" | "stale" | "generating" | "missing" | "error" {
  switch (key) {
    case "lifecycleStatus":
      return r.lifecycleStatus.blockersCount > 0 ? "stale" : "ready";
    case "gateDecision":
      return r.gateDecision.pending > 2 ? "stale" : "ready";
    case "artifactCompletion":
      return r.artifactCompletion.completionPercent >= 80 ? "ready" : "stale";
    case "evidenceCompleteness":
      return r.evidenceCompleteness.overallPercent >= 88 && r.evidenceCompleteness.missingItems < 8
        ? "ready"
        : "stale";
    case "traceability":
      return r.traceability.coveragePercent >= 75 && r.traceability.criticalGaps < 5 ? "ready" : "stale";
    case "approvalHistory":
      return r.approvalHistory.pending > 3 ? "stale" : "ready";
    case "fullProjectEvidencePackage":
      return "ready";
    default:
      return "ready";
  }
}

export function shouldShowReportCard(
  data: ReportsPageData,
  key: keyof ReportsPageData["reports"],
  reportStatus: ReportsFilters["reportStatus"],
): boolean {
  if (reportStatus === "all" || !reportStatus) return true;
  const status = getReportCardHealth(data.reports, key);
  if (reportStatus === "ready") return status === "ready";
  if (reportStatus === "stale") return status === "stale";
  if (reportStatus === "missing") {
    if (key === "lifecycleStatus") return data.reports.lifecycleStatus.blockersCount > 0;
    if (key === "evidenceCompleteness") return data.reports.evidenceCompleteness.missingItems > 0;
    if (key === "traceability")
      return data.reports.traceability.missingLinks > 0 || data.reports.traceability.criticalGaps > 0;
    if (key === "artifactCompletion")
      return data.reports.artifactCompletion.draft + data.reports.artifactCompletion.blocked > 5;
    return status === "stale";
  }
  return true;
}
