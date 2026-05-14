import { createDecisionHistoryEvent, evaluateDecisionState, withApproverCountSynced } from "@/lib/approval-decision";
import type {
  ApprovalDecisionDraft,
  ApprovalDecisionType,
  ApprovalPackage,
  ApprovalQueueTab,
  PendingApproval,
} from "@/types/approval-center.types";

/** Updates local package state after `recordApprovalDecision` succeeds (artifact workflow). */
export function patchPackageAfterRecordedDecision(
  pkg: ApprovalPackage,
  decision: ApprovalDecisionType,
  userName: string,
  userRole: string,
  draftPatch: Partial<ApprovalDecisionDraft>,
): ApprovalPackage {
  const nextStatus =
    decision === "approve" ? "approved" : decision === "request_changes" ? "changes_requested" : "rejected";
  const nextDraft: ApprovalDecisionDraft = {
    ...pkg.decisionDraft,
    ...draftPatch,
    decision,
    canSubmit: true,
    blockers: [],
  };
  const merged: ApprovalPackage = {
    ...pkg,
    detail: { ...pkg.detail, status: nextStatus },
    decisionDraft: nextDraft,
  };
  const state = evaluateDecisionState(nextDraft, merged);
  return withApproverCountSynced({
    ...merged,
    history: [
      createDecisionHistoryEvent(decision, userName, {
        approvalId: pkg.detail.id,
        authorRole: userRole,
      }),
      ...pkg.history,
    ],
    actionState: {
      ...state,
      canSubmitDecision: false,
      submitBlockers: ["Decision recorded."],
    },
  });
}

export function patchPendingRowAfterRecordedDecision(
  row: PendingApproval,
  decision: ApprovalDecisionType,
): PendingApproval {
  const nextQueueTab: Exclude<ApprovalQueueTab, "history"> =
    decision === "approve" ? "approved" : decision === "request_changes" ? "changes_requested" : "rejected";
  return {
    ...row,
    status: decision === "approve" ? "pending" : "in_review",
    queueTab: nextQueueTab,
  };
}

export function initialsFromDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
