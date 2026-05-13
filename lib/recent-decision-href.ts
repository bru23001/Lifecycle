import type { DashboardRecentDecision } from "@/types/dashboard.types";

export function resolveRecentDecisionHref(args:
  | { targetType: "gate_review"; projectId: string | null; gateId: string | null }
  | { targetType: "approval_detail"; approvalId: string | null }
  | { targetType: "audit_detail"; projectId: string | null; auditEventId: string | null },
): string {
  if (args.targetType === "gate_review") {
    if (args.projectId && args.gateId) {
      return `/projects/${args.projectId}/gates/${args.gateId.toLowerCase()}/review`;
    }
    return "/projects";
  }
  if (args.targetType === "approval_detail") {
    if (args.approvalId) return `/approvals/${args.approvalId}`;
    return "/approvals";
  }
  if (args.projectId && args.auditEventId) {
    return `/projects/${args.projectId}/audit/${args.auditEventId}`;
  }
  if (args.projectId) {
    return `/projects/${args.projectId}?tab=audit_trail`;
  }
  return "/projects";
}

export function decisionLabelFromStatus(status: string): DashboardRecentDecision["label"] {
  if (status === "Accepted" || status === "approved" || status === "Conditional") {
    return "Approved";
  }
  if (status === "Returned" || status === "Rejected" || status === "rejected" || status === "changes_requested") {
    return "Changes Requested";
  }
  return "Pending";
}
