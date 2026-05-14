import type { ApprovalQueueTab, PendingApproval } from "@/types/approval-center.types";

export type QueueFilters = {
  search: string;
  type: "all" | PendingApproval["approvalType"];
  status: "all" | PendingApproval["status"];
  priority: "all" | PendingApproval["priority"];
  sort: "due" | "priority" | "submitted" | "project" | "type" | "status" | "updated";
  projectId: "all" | string;
  /** Workspace phase 1–14, or "all". */
  phase: "all" | string;
  gate: "all" | string;
  submitterContains: string;
  /** Reserved for future approver assignments; UI present, no server field yet. */
  approverContains: string;
  dueFrom: string;
  dueTo: string;
  overdueOnly: boolean;
  blockedOnly: boolean;
};

export const DEFAULT_QUEUE_FILTERS: QueueFilters = {
  search: "",
  type: "all",
  status: "all",
  priority: "all",
  sort: "due",
  projectId: "all",
  phase: "all",
  gate: "all",
  submitterContains: "",
  approverContains: "",
  dueFrom: "",
  dueTo: "",
  overdueOnly: false,
  blockedOnly: false,
};

/** Sort menu labels aligned with APPROVAL-CENTER spec (pending queue panel). */
export const APPROVAL_SORT_OPTIONS: { value: QueueFilters["sort"]; label: string }[] = [
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "submitted", label: "Submitted date" },
  { value: "project", label: "Project name" },
  { value: "type", label: "Approval type" },
  { value: "status", label: "Status" },
  { value: "updated", label: "Recently updated" },
];

export const QUEUE_TABS: { id: ApprovalQueueTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "my_reviews", label: "My reviews" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "history", label: "History" },
];
