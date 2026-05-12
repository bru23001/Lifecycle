import type { ApprovalQueueTab, PendingApproval } from "@/types/approval-center.types";

export type QueueFilters = {
  search: string;
  type: "all" | PendingApproval["approvalType"];
  status: "all" | PendingApproval["status"];
  priority: "all" | PendingApproval["priority"];
  sort: "due" | "priority" | "submitted" | "project";
};

export const DEFAULT_QUEUE_FILTERS: QueueFilters = {
  search: "",
  type: "all",
  status: "all",
  priority: "all",
  sort: "due",
};

export const QUEUE_TABS: { id: ApprovalQueueTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "my_reviews", label: "My reviews" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "history", label: "History" },
];
