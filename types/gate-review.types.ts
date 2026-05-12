export type GateReviewHeaderData = {
  projectId: string;
  projectName: string;
  /** Project code shown next to the name, e.g. SIP-001 */
  projectCode?: string;
  gateId: string;
  gateCode: string;
  gateNumber: number;
  totalGates: number;
  gateName: string;
  status:
    | "draft"
    | "submitted"
    | "pending_decision"
    | "approved"
    | "conditional"
    | "changes_requested"
    | "rejected";
  purpose: string;
  phaseNumber: number;
  phaseName: string;
  gateOwnerName: string;
  submittedOnLabel: string;
  submittedByName: string;
  reviewType: "standard" | "expedited" | "exception";
  dueDateLabel: string;
  /** Optional relative hint next to the due date, e.g. "(7 days left)" */
  dueRelativeLabel?: string;
  approversAssigned: number;
  readinessPercent: number;
};

export type GateOverviewData = {
  purpose: string;
  successCriteria: string[];
  approvalConsequence: string;
  rejectionConsequence: string;
  currentPhaseLabel: string;
  phaseProgressPercent: number;
  phaseWorkspaceHref: string;
};

export type RequiredGateInput = {
  id: string;
  inputCode: string;
  name: string;
  description: string;
  provided: boolean;
  status: "missing" | "incomplete" | "complete" | "needs_review";
  linkedArtifactId?: string;
  href?: string;
};

export type GateEvidenceItem = {
  id: string;
  name: string;
  type: "pdf" | "spreadsheet" | "document" | "image" | "link" | "json";
  linkedTo: string[];
  addedBy: string;
  addedOnLabel: string;
  href: string;
  downloadHref?: string;
};

export type DecisionCriterion = {
  id: string;
  name: string;
  description?: string;
  weightPercent: number;
  assessment: "meets" | "partially_meets" | "does_not_meet" | "not_reviewed";
  reviewerNotes?: string;
  evidenceRefs: string[];
};

export type DecisionCriteriaSummary = {
  criteria: DecisionCriterion[];
  overallAssessment:
    | "meets_requirements"
    | "partially_meets_requirements"
    | "does_not_meet_requirements"
    | "not_reviewed";
};

export type GateApprover = {
  id: string;
  name: string;
  role: string;
  status: "pending" | "in_review" | "reviewed" | "approved" | "rejected";
  reviewedOnLabel?: string;
  comments?: string;
};

export type GateDecisionType =
  | "approve"
  | "conditional_approve"
  | "request_changes"
  | "reject";

export type GateDecisionRecord = {
  id?: string;
  gateId: string;
  projectId: string;
  decision?: GateDecisionType;
  decisionLabel?: string;
  comments: string;
  conditions: string[];
  decidedBy?: string;
  decidedOn?: string;
  status: "not_recorded" | "draft" | "submitted" | "finalized";
};

export type NextPhaseUnlockState = {
  canUnlock: boolean;
  unlockStatus: "locked" | "ready" | "unlocked" | "blocked";
  currentPhaseNumber: number;
  nextPhaseNumber: number;
  nextPhaseName: string;
  requirements: {
    id: string;
    label: string;
    status: "complete" | "incomplete" | "blocked";
  }[];
  carriedForwardArtifacts: string[];
  nextPhaseHref: string;
};

export type GateReviewActionState = {
  readinessLabel: string;
  readinessDescription: string;
  canSaveReview: boolean;
  canSubmitDecision: boolean;
  submitBlockers: string[];
};

export type GateReviewData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
  };
  gateReviewHeader: GateReviewHeaderData;
  gateOverview: GateOverviewData;
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  decisionCriteria: DecisionCriteriaSummary;
  approvers: GateApprover[];
  decisionRecord: GateDecisionRecord;
  nextPhaseUnlock: NextPhaseUnlockState;
  actionState: GateReviewActionState;
};
