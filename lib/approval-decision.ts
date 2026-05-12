import type {
  ApprovalActionState,
  ApprovalDecisionDraft,
  ApprovalDecisionType,
  ApprovalPackage,
} from "@/types/approval-center.types";

function formatNowLabel() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function evaluateDecisionState(
  draft: ApprovalDecisionDraft,
  approval: ApprovalPackage,
): ApprovalActionState {
  const blockers: string[] = [];

  if (approval.detail.approvalType === "gate_review") {
    blockers.push("Record the formal decision in Gate Review (evidence checks and phase advance).");
  }

  const incompleteInputs = approval.requiredInputs.filter(
    (row) => row.status === "missing" || row.status === "incomplete",
  );

  if (!draft.decision) {
    blockers.push("Select a decision before submitting.");
  }

  if (draft.decision === "approve" && incompleteInputs.length > 0) {
    blockers.push("All critical required inputs must be complete before approval.");
  }

  if (draft.decision === "request_changes") {
    if (draft.comments.trim().length === 0) {
      blockers.push("Request Changes requires reviewer comments.");
    }
    const changesCount = draft.requiredChanges.filter((item) => item.trim().length > 0).length;
    if (changesCount < 1) {
      blockers.push("Request Changes requires at least one required change.");
    }
  }

  if (draft.decision === "reject") {
    if (draft.comments.trim().length === 0) {
      blockers.push("Reject requires reviewer comments.");
    }
    const reasonsCount = draft.requiredChanges.filter((item) => item.trim().length > 0).length;
    if (reasonsCount < 1) {
      blockers.push("Reject requires at least one rejection reason.");
    }
  }

  const completedInputs = approval.requiredInputs.filter((row) => row.status === "complete").length;
  const summary = `${completedInputs} of ${approval.requiredInputs.length} required inputs complete · Evidence attached · ${approval.detail.approversCount} reviewers assigned`;

  return {
    readinessLabel: "Review Readiness",
    readinessSummary: summary,
    canSaveReview: true,
    canSubmitDecision: blockers.length === 0,
    submitBlockers: blockers,
  };
}

export function createCommentHistoryEvent(authorName: string) {
  return {
    id: `hist-comment-${Date.now()}`,
    eventType: "comment_added" as const,
    title: "Comment Added",
    actorName: authorName,
    timestampLabel: formatNowLabel(),
    description: "Reviewer comment added.",
    statusTone: "blue" as const,
  };
}

export function createDecisionHistoryEvent(decision: ApprovalDecisionType, authorName: string) {
  switch (decision) {
    case "approve":
      return {
        id: `hist-decision-${Date.now()}`,
        eventType: "approved" as const,
        title: "Approved",
        actorName: authorName,
        timestampLabel: formatNowLabel(),
        description: "Approval finalized and progression unlocked.",
        statusTone: "green" as const,
      };
    case "request_changes":
      return {
        id: `hist-decision-${Date.now()}`,
        eventType: "changes_requested" as const,
        title: "Changes Requested",
        actorName: authorName,
        timestampLabel: formatNowLabel(),
        description: "Returned to submitter for revision.",
        statusTone: "amber" as const,
      };
    case "reject":
      return {
        id: `hist-decision-${Date.now()}`,
        eventType: "rejected" as const,
        title: "Rejected",
        actorName: authorName,
        timestampLabel: formatNowLabel(),
        description: "Approval package rejected.",
        statusTone: "red" as const,
      };
    default: {
      const neverDecision: never = decision;
      throw new Error(`Unsupported decision type: ${String(neverDecision)}`);
    }
  }
}
