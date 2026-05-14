import type { ApprovalPackage, PendingApproval } from "@/types/approval-center.types";

export type BulkTargetSkip = { row: PendingApproval; reason: string };

export function classifyArtifactBulkTargets(
  rows: PendingApproval[],
  packages: Record<string, ApprovalPackage>,
): { eligible: PendingApproval[]; skipped: BulkTargetSkip[] } {
  const eligible: PendingApproval[] = [];
  const skipped: BulkTargetSkip[] = [];
  for (const row of rows) {
    const pkg = packages[row.id];
    if (!pkg) {
      skipped.push({ row, reason: "Package not loaded." });
      continue;
    }
    if (pkg.detail.approvalType === "gate_review") {
      skipped.push({ row, reason: "Use Gate Review to complete this approval." });
      continue;
    }
    if (row.status === "blocked") {
      skipped.push({ row, reason: "Approval is blocked." });
      continue;
    }
    eligible.push(row);
  }
  return { eligible, skipped };
}
