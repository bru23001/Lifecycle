/**
 * Canonical `/projects/{id}/reports/...` segments (dashboard spec §21).
 */
export const REPORT_DETAIL_PATHS = {
  lifecycleStatus: "lifecycle-status",
  gateDecisions: "gate-decisions",
  traceability: "traceability",
  missingEvidence: "missing-evidence",
  approvalHistory: "approval-history",
  evidencePackage: "evidence-package",
} as const;

export function reportHubPath(projectId: string): string {
  return `/projects/${projectId}/reports`;
}

export function reportDetailPath(
  projectId: string,
  segment: keyof typeof REPORT_DETAIL_PATHS,
): string {
  return `${reportHubPath(projectId)}/${REPORT_DETAIL_PATHS[segment]}`;
}
