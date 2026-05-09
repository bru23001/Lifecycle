/**
 * Client-side stub for packaging gate review artifacts for download.
 * Replace with API call that returns a signed URL or blob.
 */
export function triggerReviewPackageDownload(projectId: string, gateId: string): void {
  const payload = JSON.stringify(
    { projectId, gateId, generatedAt: new Date().toISOString() },
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
