import type { CoverageStatus, GateTraceStatus, TraceabilityGap } from "@/types/traceability.types";

export const coverageStatusBadgeMap: Record<
  CoverageStatus | "orphaned",
  { label: string; tone: "green" | "amber" | "red" | "gray" }
> = {
  complete: { label: "Complete", tone: "green" },
  partial: { label: "Partial", tone: "amber" },
  missing: { label: "Missing", tone: "red" },
  orphaned: { label: "Orphaned", tone: "gray" },
};

export const gateTraceStatusBadgeMap: Record<
  GateTraceStatus,
  { label: string; tone: "green" | "amber" | "red" | "gray" }
> = {
  not_reached: { label: "Not Reached", tone: "gray" },
  not_submitted: { label: "Not Submitted", tone: "gray" },
  pending_decision: { label: "Pending Decision", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  changes_requested: { label: "Changes Requested", tone: "amber" },
  rejected: { label: "Rejected", tone: "red" },
};

export const impactBadgeMap: Record<
  TraceabilityGap["impact"],
  { label: string; tone: "green" | "amber" | "red" }
> = {
  low: { label: "Low", tone: "green" },
  medium: { label: "Medium", tone: "amber" },
  high: { label: "High", tone: "red" },
  critical: { label: "Critical", tone: "red" },
};
