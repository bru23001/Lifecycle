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

/** Readiness checklist shown on the gate review header (popover + ring). */
export type GateReviewHeaderChecklist = {
  allRequiredInputsProvided: boolean;
  evidenceAttached: boolean;
  decisionCriteriaMet: boolean;
  awaitingReviewerDecision: boolean;
};

/** Policy / rule definition for the Gate Policy drawer (spec §2). */
export type GatePolicyOverview = {
  gateCode: string;
  gateName: string;
  relatedPhaseLabel: string;
  requiredInputs: { inputCode: string; name: string; description: string }[];
  requiredEvidence: string[];
  requiredApproverRoles: string[];
  decisionRule: string;
  unlockRule: string;
  policyVersion: string;
};

/** One row for the Success Criteria drawer (spec §2). */
export type GateSuccessCriterionDetail = {
  id: string;
  label: string;
  requiredThreshold: string;
  evidenceExpectation: string;
  acceptanceNotes: string;
  relatedTemplates: string[];
};

/** Approve / conditional / changes / reject outcomes (spec §2). */
export type GateConsequencesOverview = {
  ifApproved: string;
  ifConditional: string;
  ifChangesRequested: string;
  ifRejected: string;
  nextPhaseImpact: string;
  auditImpact: string;
};

export type GateOverviewData = {
  purpose: string;
  successCriteria: string[];
  successCriteriaDetails: GateSuccessCriterionDetail[];
  approvalConsequence: string;
  rejectionConsequence: string;
  currentPhaseLabel: string;
  phaseProgressPercent: number;
  phaseWorkspaceHref: string;
  policy: GatePolicyOverview;
  consequences: GateConsequencesOverview;
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
  /** Template wizard for this registry template id. */
  wizardHref?: string;
  /** Evidence items associated with this input (names). */
  linkedEvidenceLabels?: string[];
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
  evidenceCode?: string;
  classification?: string;
  gateCode?: string;
  phaseNumber?: number;
  /** Short label when linked to an artifact */
  linkedArtifactSummary?: string;
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

/** One row in an approver comment thread (modal §6). */
export type GateApproverComment = {
  id: string;
  author: string;
  role: string;
  timestampLabel: string;
  visibility: "reviewers" | "internal" | "project_team";
  body: string;
};

/** Timeline row for approver review detail / assignment context. */
export type GateApproverHistoryEntry = {
  id: string;
  label: string;
  detail: string;
  atLabel: string;
};

export type GateApprover = {
  id: string;
  /** Present when assignment is directory-backed (round-trip for assign modal). */
  userId?: string | null;
  name: string;
  role: string;
  status: "pending" | "in_review" | "reviewed" | "approved" | "rejected";
  reviewedOnLabel?: string;
  comments?: string;
  /** When the approver was assigned to this gate (assignment row). */
  assignedOnLabel?: string;
  /** Effective due date label for this approver (shared gate due date when set). */
  dueDateLabel?: string;
  /** Human-readable outcome when review is complete. */
  decisionLabel?: string;
  /** Structured thread; when absent, `comments` is shown as a single note. */
  commentThread?: GateApproverComment[];
  /** Related approval / assignment events for the detail drawer. */
  approvalHistory?: GateApproverHistoryEntry[];
};

export type GateDecisionType =
  | "approve"
  | "conditional_approve"
  | "request_changes"
  | "reject";

export type GateDecisionRecord = {
  /** Prisma `GateDecision.id` when a decision row exists. */
  id?: string;
  gateId: string;
  projectId: string;
  decision?: GateDecisionType;
  decisionLabel?: string;
  comments: string;
  conditions: string[];
  decidedBy?: string;
  decidedOn?: string;
  /** ISO timestamp for `<time datetime>` / exports. */
  decidedOnIso?: string;
  status: "not_recorded" | "draft" | "submitted" | "finalized";
  /** Evidence checks snapshot at decision time, when known. */
  evidencePassSnapshot?: boolean;
};

/** Linked artifact row for “carried forward” (preferred over plain string ids). */
export type CarriedForwardArtifactLink = {
  id: string;
  label: string;
  href: string;
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
  /** Template ids / labels carried from the gate package (fallback list). */
  carriedForwardArtifacts: string[];
  nextPhaseHref: string;
  /** Resolvable artifact links for carried-forward items (spec §8). */
  carriedForwardArtifactLinks?: CarriedForwardArtifactLink[];
  /** Human-readable gate / decision dependency for the drawer. */
  gateDependencyLabel?: string;
  /** Automated or policy blockers (e.g. failing evidence checks). */
  blockingIssues?: string[];
  /** Single-line guidance for reviewers. */
  recommendedNextAction?: string;
  /** Templates to complete in the next phase (ids or short labels). */
  requiredTemplatesForNextPhase?: string[];
  /** Evidence expectations for the next milestone. */
  evidenceExpectationsForNextPhase?: string[];
  /** Initial checklist rows (usually phase objectives). */
  initialChecklistItems?: { id: string; label: string }[];
};

/** Structured blocker for §9 “Decision submission blockers” drawer (jump links + fixes). */
export type GateReviewSubmitBlocker = {
  id: string;
  category:
    | "server"
    | "required_inputs"
    | "evidence"
    | "criteria"
    | "approvers"
    | "decision"
    | "comments_conditions";
  message: string;
  jumpTarget?: "inputs" | "evidence" | "criteria" | "approvers" | "decision";
  recommendedFix?: string;
};

export type GateReviewActionState = {
  readinessLabel: string;
  readinessDescription: string;
  canSaveReview: boolean;
  canSubmitDecision: boolean;
  submitBlockers: string[];
  /** Populated when submission is blocked (client + merged server messages). */
  structuredSubmitBlockers: GateReviewSubmitBlocker[];
};

export type AssignableApproverEntry = {
  userId: string | null;
  name: string;
  role: string;
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
  /** True when `approvers` rows come from `GateApproverAssignment` (not demo fallbacks). */
  approversPersisted: boolean;
  /** Directory of users available to assign as approvers (Assign Approvers modal). */
  assignableApprovers: AssignableApproverEntry[];
  /** Current saved selection (mirrors `approvers` when persisted via `GateApproverAssignment`). */
  assignedApprovers: AssignableApproverEntry[];
  /** ISO due-date for the current assignment, when set. */
  assignedDueAtIso: string | null;
  /** Artifacts available to link when adding gate evidence. */
  artifactPickerOptions: { id: string; label: string }[];
};
