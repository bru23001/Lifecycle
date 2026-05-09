import type { ApprovalDetail, ApprovalHistoryEvent, ApprovalRequiredInput, PendingApproval } from "@/types/approval-center.types";

export const approvalStatusBadgeMap: Record<
  PendingApproval["status"] | ApprovalDetail["status"] | "reviewed",
  { label: string; tone: "amber" | "blue" | "green" | "red" | "gray" }
> = {
  pending: { label: "Pending", tone: "amber" },
  in_review: { label: "In Review", tone: "blue" },
  reviewed: { label: "Reviewed", tone: "green" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  changes_requested: { label: "Changes Requested", tone: "amber" },
  overdue: { label: "Overdue", tone: "red" },
  blocked: { label: "Blocked", tone: "red" },
};

export const approvalPriorityBadgeMap: Record<
  PendingApproval["priority"],
  { label: string; tone: "green" | "amber" | "red" }
> = {
  low: { label: "Low Priority", tone: "green" },
  medium: { label: "Medium Priority", tone: "amber" },
  high: { label: "High Priority", tone: "red" },
  critical: { label: "Critical Priority", tone: "red" },
};

export const inputStatusBadgeMap: Record<
  ApprovalRequiredInput["status"],
  { label: string; tone: "green" | "amber" | "red" | "purple" }
> = {
  missing: { label: "Missing", tone: "red" },
  incomplete: { label: "Incomplete", tone: "amber" },
  complete: { label: "Complete", tone: "green" },
  needs_review: { label: "Needs Review", tone: "purple" },
};

export const historyToneMap: Record<ApprovalHistoryEvent["statusTone"], "blue" | "green" | "amber" | "red" | "gray"> = {
  blue: "blue",
  green: "green",
  amber: "amber",
  red: "red",
  gray: "gray",
};
