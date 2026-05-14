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
  /** `createdAt` for stable sort / filters (ms). */
  submittedAtMs: number;
  /** `updatedAt` for “recently updated” sort (ms). */
  updatedAtMs: number;
  /** When set, used for due-date sort and range / overdue filters. */
  dueAtMs: number | null;
  /** Workspace phase anchor for gate reviews (1–14); absent for non–gate rows. */
  phaseNumber?: number;
  /** Gate id for gate reviews (e.g. G3); absent for artifact rows. */
  gateCode?: string;
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
  /** Deep link to the canonical gate review route (when `approvalType` is `gate_review`). */
  gateReviewHref?: string;
  /** Workspace deep link for the anchored phase (`?phase=`). */
  workspaceHref?: string;
  /** Artifact library (list) for the project. */
  artifactsLibraryHref?: string;
  /** Evidence hub (list) for the project. */
  evidenceListHref?: string;
  /** First artifact detail when multiple exist (gate packages). */
  primaryArtifactDetailHref?: string;
  /** First evidence detail when any exist. */
  primaryEvidenceDetailHref?: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "changes_requested" | "superseded" | "overdue" | "blocked";
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
  /** Defaults to required when omitted (server / UI). */
  requiredLevel?: "required" | "optional";
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
  /** Nested replies until a threaded API exists. */
  replies?: ApproverComment[];
  linkedEvidenceHref?: string;
  linkedEvidenceLabel?: string;
  resolved?: boolean;
  relatedInputCode?: string;
  /** Free-text mention line captured in the add-comment modal. */
  mentionPreview?: string;
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
  /** Reject flow: whether submitter may resubmit after rejection (UI + audit line). */
  resubmissionAllowed?: boolean;
};

export type ApprovalHistoryEvent = {
  id: string;
  /** Owning approval package (set on merge for consolidated timeline). */
  approvalId?: string;
  eventType:
    | "submitted"
    | "review_started"
    | "comment_added"
    | "reviewed"
    | "approved"
    | "changes_requested"
    | "rejected"
    | "resubmitted"
    | "approver_added"
    | "approver_reassigned"
    | "approver_reminder_sent"
    | "approval_escalated"
    | "attachment_uploaded"
    | "queue_bulk_action";
  title: string;
  actorName: string;
  actorRole?: string;
  timestampLabel: string;
  description?: string;
  statusTone: "blue" | "green" | "amber" | "red" | "gray";
  relatedObjectLabel?: string;
  relatedObjectHref?: string;
  beforeValue?: string;
  afterValue?: string;
  /** Stable id for linked audit drawer / exports. */
  auditRecordId?: string;
};

/** Immutable audit trail row (UI); may be synthesized from history until audit API exists. */
export type ApprovalAuditRecord = {
  id: string;
  eventType: string;
  actorName: string;
  actorRole?: string;
  timestampLabel: string;
  objectChangedLabel: string;
  objectChangedHref?: string;
  beforeValue?: string;
  afterValue?: string;
  integrityHash: string;
};

export type ApprovalAttachmentClassification = "public" | "internal" | "confidential";

export type ApprovalAttachmentLink =
  | { kind: "none" }
  | { kind: "required_input"; inputId: string; inputName: string; href?: string }
  | { kind: "evidence"; label: string; href?: string }
  | { kind: "comment"; commentId: string; preview: string };

export type ApprovalAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeLabel: string;
  attachmentType: string;
  description?: string;
  uploadedBy: string;
  uploadedOnLabel: string;
  classification: ApprovalAttachmentClassification;
  link: ApprovalAttachmentLink;
  /** Shown when inline preview is unavailable (no blob URL). */
  previewHint?: string;
};

export type ApprovalApproverReviewStatus = "pending" | "in_review" | "completed" | "declined";

export type ApprovalApprover = {
  id: string;
  name: string;
  role: string;
  initials: string;
  reviewStatus: ApprovalApproverReviewStatus;
  reviewComments?: string;
  reviewedOnLabel?: string;
  assignedInputLabels?: string[];
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
  /** Assigned reviewers (client-side workflow until API exists). */
  approvers: ApprovalApprover[];
  /** Package attachments (seeded server-side; uploads are client-side until API exists). */
  attachments: ApprovalAttachment[];
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
