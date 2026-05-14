/**
 * Client-side stub for packaging gate review artifacts for download.
 * Replace with API call that returns a signed URL or blob.
 */

export type ReviewPackageFormat = "zip" | "pdf" | "json";

export type ReviewPackageDownloadOptions = {
  includeRequiredInputs: boolean;
  includeCompletionEvidence: boolean;
  includeDecisionCriteria: boolean;
  includeApproverReviewStatus: boolean;
  includeAuditManifest: boolean;
  format: ReviewPackageFormat;
};

export function triggerReviewPackageDownload(
  projectId: string,
  gateId: string,
  options?: ReviewPackageDownloadOptions,
): void {
  const resolved: ReviewPackageDownloadOptions = options ?? {
    includeRequiredInputs: true,
    includeCompletionEvidence: true,
    includeDecisionCriteria: true,
    includeApproverReviewStatus: true,
    includeAuditManifest: true,
    format: "json",
  };

  const payload = JSON.stringify(
    {
      projectId,
      gateId,
      requestedFormat: resolved.format,
      options: {
        includeRequiredInputs: resolved.includeRequiredInputs,
        includeCompletionEvidence: resolved.includeCompletionEvidence,
        includeDecisionCriteria: resolved.includeDecisionCriteria,
        includeApproverReviewStatus: resolved.includeApproverReviewStatus,
        includeAuditManifest: resolved.includeAuditManifest,
      },
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gate-review-package-${projectId}-${gateId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
