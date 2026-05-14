import type {
  ApprovalActionState,
  ApprovalDecisionDraft,
  ApprovalDecisionType,
  ApprovalPackage,
  ApproverComment,
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

/** Keeps `detail.approversCount` aligned with `approvers.length` after client-side roster edits. */
export function withApproverCountSynced(pkg: ApprovalPackage): ApprovalPackage {
  return {
    ...pkg,
    detail: { ...pkg.detail, approversCount: pkg.approvers.length },
  };
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

  if (draft.decision === "approve" && approval.detail.evidenceItemsCount === 0) {
    blockers.push("Attach at least one evidence item before approval.");
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

/** Prepends a comment and records a matching history row (for new top-level comments). */
export function prependApproverComment(
  pkg: ApprovalPackage,
  comment: ApproverComment,
  actorName: string,
  actorRole?: string,
): ApprovalPackage {
  return {
    ...pkg,
    comments: [comment, ...pkg.comments],
    history: [
      createCommentHistoryEvent(actorName, { approvalId: pkg.detail.id, authorRole: actorRole }),
      ...pkg.history,
    ],
  };
}

/** Replaces the full comment tree (replies, edits, links) without adding history. */
export function replaceApproverComments(pkg: ApprovalPackage, comments: ApproverComment[]): ApprovalPackage {
  return { ...pkg, comments };
}

export function createCommentHistoryEvent(authorName: string, opts?: { approvalId?: string; authorRole?: string }) {
  const ts = Date.now();
  const approvalId = opts?.approvalId;
  return {
    id: `hist-comment-${ts}`,
    approvalId,
    eventType: "comment_added" as const,
    title: "Comment Added",
    actorName: authorName,
    actorRole: opts?.authorRole ?? "Reviewer",
    timestampLabel: formatNowLabel(),
    description: "Reviewer comment added.",
    statusTone: "blue" as const,
    auditRecordId: approvalId ? `${approvalId}-aud-comment-${ts}` : `aud-comment-${ts}`,
  };
}

export function createDecisionHistoryEvent(
  decision: ApprovalDecisionType,
  authorName: string,
  opts?: { approvalId?: string; authorRole?: string },
) {
  const ts = Date.now();
  const approvalId = opts?.approvalId;
  const actorRole = opts?.authorRole ?? "Approver";
  switch (decision) {
    case "approve":
      return {
        id: `hist-decision-${ts}`,
        approvalId,
        eventType: "approved" as const,
        title: "Approved",
        actorName: authorName,
        actorRole,
        timestampLabel: formatNowLabel(),
        description: "Approval finalized and progression unlocked.",
        statusTone: "green" as const,
        beforeValue: "Pending decision",
        afterValue: "Approved",
        auditRecordId: approvalId ? `${approvalId}-aud-decision-${ts}` : `aud-decision-${ts}`,
      };
    case "request_changes":
      return {
        id: `hist-decision-${ts}`,
        approvalId,
        eventType: "changes_requested" as const,
        title: "Changes Requested",
        actorName: authorName,
        actorRole,
        timestampLabel: formatNowLabel(),
        description: "Returned to submitter for revision.",
        statusTone: "amber" as const,
        beforeValue: "Pending decision",
        afterValue: "Changes requested",
        auditRecordId: approvalId ? `${approvalId}-aud-decision-${ts}` : `aud-decision-${ts}`,
      };
    case "reject":
      return {
        id: `hist-decision-${ts}`,
        approvalId,
        eventType: "rejected" as const,
        title: "Rejected",
        actorName: authorName,
        actorRole,
        timestampLabel: formatNowLabel(),
        description: "Approval package rejected.",
        statusTone: "red" as const,
        beforeValue: "Pending decision",
        afterValue: "Rejected",
        auditRecordId: approvalId ? `${approvalId}-aud-decision-${ts}` : `aud-decision-${ts}`,
      };
    default: {
      const neverDecision: never = decision;
      throw new Error(`Unsupported decision type: ${String(neverDecision)}`);
    }
  }
}

export type DecisionBlockerItem = {
  id: string;
  message: string;
  fixHref?: string;
  fixLabel?: string;
};

/** Structured blockers for the decision blockers modal (links + copy). */
export function buildDecisionBlockerItems(draft: ApprovalDecisionDraft, approval: ApprovalPackage): DecisionBlockerItem[] {
  const items: DecisionBlockerItem[] = [];

  if (approval.detail.approvalType === "gate_review") {
    items.push({
      id: "gate_review",
      message: "Record the formal decision in Gate Review (evidence checks and phase advance).",
      fixHref: approval.detail.gateReviewHref,
      fixLabel: "Open gate review",
    });
  }

  const incompleteInputs = approval.requiredInputs.filter(
    (row) => row.status === "missing" || row.status === "incomplete",
  );

  if (!draft.decision) {
    items.push({ id: "no_decision", message: "Select a decision before submitting." });
  }

  if (draft.decision === "approve" && incompleteInputs.length > 0) {
    const first = incompleteInputs[0];
    items.push({
      id: "incomplete_inputs",
      message: "All critical required inputs must be complete before approval.",
      fixHref: first?.linkedObjectHref ?? approval.detail.workspaceHref,
      fixLabel: "Open required inputs",
    });
  }

  if (draft.decision === "approve" && approval.detail.evidenceItemsCount === 0) {
    items.push({
      id: "missing_evidence",
      message: "Attach at least one evidence item before approval.",
      fixHref: approval.detail.evidenceListHref,
      fixLabel: "Open evidence",
    });
  }

  if (draft.decision === "request_changes") {
    if (draft.comments.trim().length === 0) {
      items.push({ id: "missing_comments", message: "Request Changes requires reviewer comments." });
    }
    const changesCount = draft.requiredChanges.filter((item) => item.trim().length > 0).length;
    if (changesCount < 1) {
      items.push({ id: "missing_required_changes", message: "Request Changes requires at least one required change." });
    }
  }

  if (draft.decision === "reject") {
    if (draft.comments.trim().length === 0) {
      items.push({ id: "missing_comments_reject", message: "Reject requires reviewer comments." });
    }
    const reasonsCount = draft.requiredChanges.filter((item) => item.trim().length > 0).length;
    if (reasonsCount < 1) {
      items.push({ id: "missing_reject_reasons", message: "Reject requires at least one rejection reason." });
    }
  }

  return items;
}
