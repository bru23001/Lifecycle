/** Primary queue bucket for Approval Center tabs (UI-UX §18). */
export type ApprovalQueueTab =
  | "pending"
  | "my_reviews"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "history";

export type PendingApproval = {
  id: string;
  approvalCode: string;
  title: string;
  approvalType: "gate_review" | "artifact_review" | "phase_approval" | "exception_approval" | "funding_approval";
  projectId: string;
  projectName: string;
  submittedBy: string;
  submittedOnLabel: string;
  dueDateLabel?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_review" | "overdue" | "blocked";
  href: string;
  /** Which tab lists this record in the left queue (history tab uses timeline merge instead). */
  queueTab: Exclude<ApprovalQueueTab, "history">;
};

export type ApprovalDetail = {
  id: string;
  approvalCode: string;
  title: string;
  description: string;
  approvalType: "gate_review" | "artifact_review" | "phase_approval" | "exception_approval" | "funding_approval";
  projectId: string;
  projectName: string;
  phaseNumber?: number;
  phaseName?: string;
  gateCode?: string;
  gateName?: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "changes_requested" | "overdue" | "blocked";
  submittedBy: string;
  submittedOnLabel: string;
  dueDateLabel?: string;
  priority: "low" | "medium" | "high" | "critical";
  linkedArtifactsCount: number;
  evidenceItemsCount: number;
  approversCount: number;
  reviewType: "standard" | "expedited" | "exception";
};

export type ApprovalRequiredInput = {
  id: string;
  inputCode: string;
  name: string;
  description: string;
  status: "missing" | "incomplete" | "complete" | "needs_review";
  linkedObjectLabel?: string;
  linkedObjectHref?: string;
};

export type ApproverComment = {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  statusAtComment?: "pending" | "in_review" | "reviewed" | "approved";
  createdOnLabel: string;
  body: string;
  visibility: "internal" | "public_to_project";
};

export type ApprovalDecisionType = "approve" | "request_changes" | "reject";

export type ApprovalDecisionDraft = {
  approvalId: string;
  decision?: ApprovalDecisionType;
  comments: string;
  requiredChanges: string[];
  conditions: string[];
  canSubmit: boolean;
  blockers: string[];
};

export type ApprovalHistoryEvent = {
  id: string;
  eventType:
    | "submitted"
    | "review_started"
    | "comment_added"
    | "reviewed"
    | "approved"
    | "changes_requested"
    | "rejected"
    | "resubmitted";
  title: string;
  actorName: string;
  actorRole?: string;
  timestampLabel: string;
  description?: string;
  statusTone: "blue" | "green" | "amber" | "red" | "gray";
};

export type ApprovalActionState = {
  readinessLabel: string;
  readinessSummary: string;
  canSaveReview: boolean;
  canSubmitDecision: boolean;
  submitBlockers: string[];
};

export type ApprovalPackage = {
  detail: ApprovalDetail;
  requiredInputs: ApprovalRequiredInput[];
  comments: ApproverComment[];
  decisionDraft: ApprovalDecisionDraft;
  history: ApprovalHistoryEvent[];
  actionState: ApprovalActionState;
};

export type ApprovalCenterData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  pendingApprovals: PendingApproval[];
  selectedApproval: ApprovalPackage;
  approvalPackages: Record<string, ApprovalPackage>;
};
