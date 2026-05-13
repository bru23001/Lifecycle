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

export type GateSubmissionState = {
  projectId: string;
  gateCode: string;
  gateName: string;
  canSubmit: boolean;
  missingRequirements: string[];
  submitHref: string;
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
