export type GateSubmissionRequiredInput = {
  id: string;
  label: string;
  status: "missing" | "incomplete" | "complete" | "needs_review";
  href?: string;
};

export type GateSubmissionEvidenceItem = {
  id: string;
  name: string;
  href?: string;
};

export type GateSubmissionValidationWarning = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  href?: string;
};

export type GateSubmissionApprover = {
  id: string;
  name: string;
  role: string;
};

/** Mirrors `AssignableApprover` in assign-approvers-modal (kept here to avoid circular imports). */
export type GateSubmissionAssignableUser = {
  userId?: string | null;
  name: string;
  role: string;
};

export type GateSubmissionAssignApproversPayload = {
  gateId: import("@/lib/gateRules").GateId;
  gateLabel: string;
  candidates: GateSubmissionAssignableUser[];
  initialSelection: GateSubmissionAssignableUser[];
  initialDueAtIso: string | null;
};

export type GateSubmissionState = {
  projectId: string;
  gateCode: string;
  gateName: string;
  canSubmit: boolean;
  missingRequirements: string[];
  submitHref: string;
  /** 0–100 composite for the submit modal. */
  readinessPercent?: number;
  /** Target / review due label for the modal header area. */
  reviewDueDateLabel?: string;
  /** Read-only package preview before submitting. */
  packagePreviewHref?: string;
  /** Opens Assign Approvers from the workspace card. */
  assignApprovers?: GateSubmissionAssignApproversPayload;
  /**
   * Preview data surfaced inside the Submit Gate Review modal. All optional
   * for backwards compatibility; the modal renders empty-state messaging when
   * arrays are missing or empty.
   */
  requiredInputs?: GateSubmissionRequiredInput[];
  evidenceItems?: GateSubmissionEvidenceItem[];
  validationWarnings?: GateSubmissionValidationWarning[];
  assignedApprovers?: GateSubmissionApprover[];
};
